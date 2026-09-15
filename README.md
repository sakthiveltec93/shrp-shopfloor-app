# SHRP Shop Floor App — Mould Shot Fix, Role Gating & Masters Hub

Drop-in replacement files. Copy this zip's contents over the same paths in your
repo (they mirror the repo structure exactly: `server/...`, `client/...`), then:

```bash
git add -A
git commit -m "feat: fix mould shot undercounting, gate master routes, add Item Master Hub (Gauges/Suppliers)"
git push origin main
```

## What's in here

**Bug fix (real, not cosmetic):**
- `server/routes/entries.js` — mould shot accumulation was dividing the shot
  count by cavity count a second time, undercounting mould wear by that factor.
  Fixed to use the already-correct shot value directly.

**Required one-time backfill (run this once, manually, against production
AFTER deploying the fix above):**
```bash
DATABASE_URL=<your production DATABASE_URL> node server/db/migrations/fix_mould_shot_undercounting.js
```
This recomputes every mould's `cumulative_shots`/`shots_since_pm` from actual
production history, logs a before/after per mould, and is guarded so it can
only apply once (safe to accidentally run twice — the second run is a no-op).

**Role gating fixed (two separate layers, both were open):**
- `client/src/App.jsx` — `/machines`, `/moulds`, `/rm-inward`, `/rm-stock`,
  `/recipes`, `/mould-setup` now require `admin`/`supervisor`, matching the
  pattern already used for `/parts` and `/users`.
- `client/src/pages/Home.jsx` — a separate hardcoded bypass list was making
  the Machines/Moulds/RM Inward/RM Stock *tiles* always visible to operators
  regardless of role. Removed from that list and marked `supervisorOnly`.

**New: Item Master Hub (`/masters`), admin/supervisor only:**
- `client/src/pages/MastersHub.jsx` — tabbed hub. Reuses the existing Parts,
  Machines, Moulds, and RM pages via link-out (not duplicated), and adds real
  inline CRUD for two brand-new masters:
- `server/routes/gauges.js` + `gauges` table in `schema.sql` — Gauges &
  Instruments master with calibration interval tracking and a
  HEALTHY/DUE_SOON/OVERDUE status, same pattern as mould PM health.
- `server/routes/suppliers.js` + `suppliers` table in `schema.sql` — separate
  from `customers` (who you buy from vs. who you sell to).
- `server/routes/moulds.js` — added `GET /api/moulds/pm-summary` for a
  fleet-wide PM health count, used by the hub.
- `server/index.js` — wires the two new route files in.
- `client/src/api.js` — helper methods for all of the above.
- `client/src/i18n/translations.{en,ta,or}.js` — label for the new Masters
  Hub home tile in all three languages.

**Deliberately NOT done:** `parts` and `raw_materials` were NOT merged into a
generic "item" table. `parts` has 13 other tables with hard foreign keys into
it; `raw_materials` already has its own subsystem (inward, inspection,
stock register). Gauges and Suppliers got their own properly-typed tables
instead — same unified navigation, without that migration risk.

## Verification already performed (by Claude, before packaging this)

- `node server/db/migrate.js` run against a real, clean Postgres 16 instance —
  completed with no errors, including the two new tables.
- `node server/index.js` booted against that database and stayed up through
  all its startup sync steps.
- `npm run build` in `client/` — 162 modules transformed, zero errors.
- Full functional test with real auth tokens: created a gauge, confirmed its
  calibration_status computed correctly (`HEALTHY`), hit the calibration
  summary endpoint, created a supplier, hit `/api/moulds/pm-summary` (returned
  all 74 real moulds with correct progress percentages), confirmed an
  operator-role token gets `403` on gauge creation but `200` on reading the
  list, and confirmed gauge delete works.
- Ran the backfill script against a full copy of the seeded data — it
  corrected several moulds whose `shots_since_pm` was wrong under the old
  formula (e.g. one mould went from 0 → 3805, meaning its previous PM status
  was silently wrong), and confirmed the second run is a safe no-op.

## Still to decide, not built

- Whether to hard-delete or bulk-merge the ~93 known duplicate/inactive rows
  in `parts` (currently ~170 total vs. ~77 genuinely active). The existing
  `DELETE /api/masters/parts/:id` endpoint already refuses to delete any part
  with production history, so it's safe to use as-is from the Parts tab —
  this just wasn't automated into a bulk-cleanup action here.

## Update: duplicate-parts root cause found, fixed, and bulk cleanup automated

**Root cause of the growing duplicate count:** `server/db/seed_master_parts.sql`
runs its own `upsert_part_master()` matching function on every deploy (it's a
`seed_*.sql` file, and `migrate.js` re-applies every one of those on every
boot). Its original matching logic only checked `shrp_part_code = <input>`
then `part_code = <input>` — but a different seed script
(`import_historical_data.sql`) had already stored the same physical part with
its short/long identifiers in the OPPOSITE columns (e.g. one script's row has
`part_code='LBB', part_name='HC442L3LBB01'`; the other creates a second row
with `part_code='HC442L3LBB01', part_name='LBB'` — mirrored). Since neither
script's narrow lookup found the other's row, each deploy that touched an
unmatched part created a fresh duplicate.

**Fix applied:** `server/db/seed_master_parts.sql` — the lookup now checks
all four identity fields (`part_code`, `part_name`, `shrp_part_code`,
`customer_part_no`) against both identifiers it's given, case/whitespace-
insensitive. Verified: a fresh migration went from 97 spurious rows down to
91 (some of the remaining 91 may be genuinely distinct parts unique to this
seed file's list, e.g. `SHRP-T12`, `SHRP-T3` — not necessarily bugs).

**Bulk cleanup script:** `server/db/migrations/cleanup_duplicate_parts.js`.
Two confidence tiers, because testing this against real seeded data caught
two separate false-positive risks before they could do damage:

- **Tier 1 (auto-actionable):** parts sharing an exact, normalized
  `part_code` or `customer_part_no` of 5+ characters. High confidence.
- **Tier 2 (report only, deletes nothing):** parts sharing `shrp_part_code`.
  Printed as a manual-review list, never auto-deleted — this field turned out
  to sometimes be a genuine short code and sometimes a truncated generic
  prefix (`'SHRP-T12'`, `'SHRP-T3'`, `'SHRP-T4'` all get stored as
  `shrp_part_code='SHRP'`; `'F442-KP8AA...'` and `'F442-ATBAB...'` both
  truncate to `'F442'`). Auto-deleting on that signal would have destroyed
  several genuinely different real parts — caught in dry-run testing before
  it was ever applied.

For Tier 1 matches, the script picks a survivor (prefers active, then
whichever row has real production history, then the most complete row) and
hard-deletes the others — reusing the same foreign-key safety net as the
existing parts-delete route, so a row with real production history simply
won't delete and is reported instead.

**Run it:**
```bash
# Dry run first - always do this, read the output
node server/db/migrations/cleanup_duplicate_parts.js

# Then actually delete the Tier 1 matches
node server/db/migrations/cleanup_duplicate_parts.js --apply
```
Safe to re-run — already-resolved clusters are skipped automatically.

**What this does NOT do:** it will not touch the Tier 2 (shrp_part_code)
groups it prints, and it will not touch any part with production history,
even if flagged. Those need a human decision, not automation — pushed by two
demonstrated near-misses during testing, not caution for its own sake.
