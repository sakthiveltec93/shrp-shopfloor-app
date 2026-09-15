// One-time, re-runnable bulk cleanup for duplicate `parts` rows.
//
// Background: multiple independent seed scripts (import_historical_data.sql,
// clean_parts.js, seed_master_parts.sql) have each made their own assumption
// about which column holds a part's short SHRP code vs. its long technical/
// customer part number, so the same physical part sometimes ended up as two
// separate rows.
//
// This script uses TWO confidence tiers, because testing it against real
// seeded data surfaced a real risk: naive matching produced false positives.
// Several genuinely DIFFERENT parts share the same generic part_name (e.g.
// many distinct parts are all named "CAP (A) JOINT FLANGE"), and several
// genuinely different parts share a truncated, generic shrp_part_code prefix
// (e.g. 'SHRP-T12', 'SHRP-T3' and 'SHRP-T4' all get stored with
// shrp_part_code='SHRP'; 'F442-KP8AA...' and 'F442-ATBAB...' both truncate to
// 'F442'). Auto-deleting on either signal would destroy real, distinct parts.
//
//   Tier 1 (auto-actionable): rows sharing an exact, normalized part_code or
//   customer_part_no of at least 5 characters. High confidence - these are
//   the fields meant to hold a specific, unique identifier.
//
//   Tier 2 (report only, never deletes anything): rows sharing an
//   shrp_part_code. Printed as a "review manually" list so a human can judge
//   each case - this field is sometimes a genuine short code and sometimes a
//   truncated generic prefix, and this script cannot reliably tell which.
//
// For each Tier 1 cluster with more than one row:
//   1. Pick a survivor: prefer active=TRUE, then prefer whichever row has
//      production history (referenced by production_entries/bags - the one
//      actually in use on the shop floor), then prefer the most complete row
//      (fewest NULLs), then the lowest id as a final tiebreak.
//   2. Try to hard-delete every other row in the cluster, using the same
//      FK-violation safety net as the existing DELETE /api/masters/parts/:id
//      route - a row with real production history simply won't delete, and
//      is reported instead of touched.
//
// Safe to re-run: rows that no longer form a cluster (already cleaned up, or
// were never duplicates) are skipped automatically.
//
// Usage:
//   node server/db/migrations/cleanup_duplicate_parts.js            # dry run (default)
//   node server/db/migrations/cleanup_duplicate_parts.js --apply    # actually delete Tier 1 matches

require('dotenv').config();
const pool = require('../pool');

const APPLY = process.argv.includes('--apply');

function normalize(v) {
  if (v === null || v === undefined) return null;
  const t = String(v).trim().toUpperCase();
  return t === '' ? null : t;
}

const MIN_TOKEN_LENGTH = 5; // reject short tokens - too likely to be a generic prefix/collision, not a real identifier

function tokensFor(part) {
  // High-confidence identity tokens only. part_name is excluded (many genuinely
  // different parts share the same generic descriptive part_name in this
  // dataset, e.g. several distinct parts all named "CAP (A) JOINT FLANGE").
  // shrp_part_code is ALSO excluded from this high-confidence tier: it turns
  // out to be a lossily-truncated prefix for some rows (e.g. 'SHRP-T12',
  // 'SHRP-T3' and 'SHRP-T4' all get stored as shrp_part_code='SHRP') - treating
  // it as a reliable identity signal here falsely clustered genuinely distinct
  // parts together. It's still used below in the low-confidence review tier.
  return [part.part_code, part.customer_part_no]
    .map(normalize)
    .filter((t) => t && t.length >= MIN_TOKEN_LENGTH);
}

// Low-confidence signal: shared shrp_part_code, no length filter. Used ONLY to
// print a "review manually" list - never drives an automatic delete, because
// this field is sometimes a genuine short code and sometimes a truncated
// generic prefix shared by unrelated parts, and this script cannot tell which.
function reviewTokenFor(part) {
  return normalize(part.shrp_part_code);
}

// Simple union-find
class UnionFind {
  constructor(ids) {
    this.parent = new Map(ids.map((id) => [id, id]));
  }
  find(x) {
    while (this.parent.get(x) !== x) {
      x = this.parent.get(x);
    }
    return x;
  }
  union(a, b) {
    const ra = this.find(a);
    const rb = this.find(b);
    if (ra !== rb) this.parent.set(ra, rb);
  }
}

async function main() {
  const { rows: parts } = await pool.query(`
    SELECT p.id, p.part_code, p.part_name, p.shrp_part_code, p.customer_part_no, p.active,
           EXISTS(SELECT 1 FROM production_entries WHERE part_id = p.id) AS has_production,
           EXISTS(SELECT 1 FROM bags WHERE part_id = p.id) AS has_bags
    FROM parts p
  `);

  const uf = new UnionFind(parts.map((p) => p.id));
  const tokenToFirstId = new Map();

  for (const part of parts) {
    for (const tok of tokensFor(part)) {
      if (tokenToFirstId.has(tok)) {
        uf.union(part.id, tokenToFirstId.get(tok));
      } else {
        tokenToFirstId.set(tok, part.id);
      }
    }
  }

  const clusters = new Map();
  for (const part of parts) {
    const root = uf.find(part.id);
    if (!clusters.has(root)) clusters.set(root, []);
    clusters.get(root).push(part);
  }

  const duplicateClusters = [...clusters.values()].filter((c) => c.length > 1);

  console.log(`Found ${duplicateClusters.length} duplicate cluster(s) across ${parts.length} total parts.`);
  console.log(APPLY ? 'Mode: APPLY (will hard-delete losers)' : 'Mode: DRY RUN (pass --apply to actually delete)');
  console.log('');

  let deleted = 0;
  let blocked = 0;
  let skippedNoHistory = 0;

  for (const cluster of duplicateClusters) {
    // Pick survivor: active first, then has production history, then most
    // complete row (fewest nulls across the four identity fields), then
    // lowest id.
    const scored = cluster.map((p) => ({
      part: p,
      score: [
        p.active ? 1 : 0,
        p.has_production || p.has_bags ? 1 : 0,
        [p.part_code, p.part_name, p.shrp_part_code, p.customer_part_no].filter((v) => v != null && v !== '').length,
        -p.id, // lower id wins ties (negated so higher score = lower id)
      ],
    }));
    scored.sort((a, b) => {
      for (let i = 0; i < a.score.length; i++) {
        if (a.score[i] !== b.score[i]) return b.score[i] - a.score[i];
      }
      return 0;
    });
    const survivor = scored[0].part;
    const losers = scored.slice(1).map((s) => s.part);

    console.log(`Cluster (survivor id=${survivor.id}, part_code="${survivor.part_code}", active=${survivor.active}):`);
    for (const loser of losers) {
      const label = `  id=${loser.id} part_code="${loser.part_code}" part_name="${loser.part_name}" active=${loser.active}`;
      if (loser.has_production || loser.has_bags) {
        console.log(`${label} -> KEPT (has production history, cannot be safely deleted)`);
        blocked++;
        continue;
      }
      if (!APPLY) {
        console.log(`${label} -> would delete (dry run)`);
        skippedNoHistory++;
        continue;
      }
      try {
        await pool.query('DELETE FROM parts WHERE id = $1', [loser.id]);
        console.log(`${label} -> DELETED`);
        deleted++;
      } catch (err) {
        if (err.code === '23503') {
          console.log(`${label} -> KEPT (foreign key reference found, cannot be safely deleted)`);
          blocked++;
        } else {
          console.log(`${label} -> ERROR: ${err.message}`);
        }
      }
    }
    console.log('');
  }

  // Low-confidence review tier: parts sharing shrp_part_code that were NOT
  // already resolved by the high-confidence clustering above. Report only -
  // a human should look at these and decide, since shrp_part_code is
  // sometimes a genuine unique code and sometimes a truncated generic prefix.
  const alreadyHandledIds = new Set(duplicateClusters.flat().map((p) => p.id));
  const reviewGroups = new Map();
  for (const part of parts) {
    if (alreadyHandledIds.has(part.id)) continue;
    const tok = reviewTokenFor(part);
    if (!tok) continue;
    if (!reviewGroups.has(tok)) reviewGroups.set(tok, []);
    reviewGroups.get(tok).push(part);
  }
  const reviewOnly = [...reviewGroups.values()].filter((g) => g.length > 1);
  if (reviewOnly.length > 0) {
    console.log(`--- ${reviewOnly.length} group(s) share an shrp_part_code but were NOT auto-processed (review manually - this field is sometimes a truncated generic prefix, e.g. multiple parts sharing 'SHRP' or 'F442') ---`);
    for (const group of reviewOnly) {
      console.log(`  shrp_part_code="${group[0].shrp_part_code}": ` + group.map((p) => `id=${p.id} (${p.part_code})`).join(', '));
    }
    console.log('');
  }

  console.log('--- Summary ---');
  if (APPLY) {
    console.log(`Deleted: ${deleted}`);
  } else {
    console.log(`Would delete: ${skippedNoHistory} (re-run with --apply to actually delete)`);
  }
  console.log(`Kept (has production history - deactivate manually if truly retired): ${blocked}`);

  await pool.end();
}

main().catch((err) => {
  console.error('Cleanup script failed:', err);
  process.exitCode = 1;
});
