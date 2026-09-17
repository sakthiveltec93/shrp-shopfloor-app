const pool = require('./pool');

async function auditDuplicates() {
  try {
    console.log('\n=================== DUPLICATE & FK AUDIT REPORT ===================');

    // 1. parts duplicates by part_code
    const { rows: partCodeDups } = await pool.query(`
      SELECT part_code, COUNT(*), array_agg(id) as ids, array_agg(active) as active_states
      FROM parts
      GROUP BY part_code
      HAVING COUNT(*) > 1
    `);
    console.log(`[AUDIT] 1. Duplicate part_code count: ${partCodeDups.length}`);
    if (partCodeDups.length > 0) {
      console.log(JSON.stringify(partCodeDups, null, 2));
    }

    // 2. parts duplicates by shrp_part_code
    const { rows: shrpCodeDups } = await pool.query(`
      SELECT shrp_part_code, COUNT(*), array_agg(id) as ids, array_agg(part_code) as part_codes, array_agg(active) as active_states
      FROM parts
      WHERE shrp_part_code IS NOT NULL
      GROUP BY shrp_part_code
      HAVING COUNT(*) > 1
    `);
    console.log(`[AUDIT] 2. Duplicate shrp_part_code count: ${shrpCodeDups.length}`);
    if (shrpCodeDups.length > 0) {
      console.log(JSON.stringify(shrpCodeDups, null, 2));
    }

    // 3. users duplicates by username
    const { rows: usernameDups } = await pool.query(`
      SELECT username, COUNT(*), array_agg(id) as ids
      FROM users
      GROUP BY username
      HAVING COUNT(*) > 1
    `);
    console.log(`[AUDIT] 3. Duplicate username count: ${usernameDups.length}`);
    if (usernameDups.length > 0) {
      console.log(JSON.stringify(usernameDups, null, 2));
    }

    // 4. users duplicates by UPPER(TRIM(full_name)) where deleted_at IS NULL
    const { rows: nameDups } = await pool.query(`
      SELECT UPPER(TRIM(full_name)) as full_name, COUNT(*), array_agg(id) as ids, array_agg(username) as usernames, array_agg(role) as roles, array_agg(active) as active_states
      FROM users
      WHERE deleted_at IS NULL
      GROUP BY UPPER(TRIM(full_name))
      HAVING COUNT(*) > 1
    `);
    console.log(`[AUDIT] 4. Duplicate user full_names (deleted_at IS NULL): ${nameDups.length}`);
    if (nameDups.length > 0) {
      console.log(JSON.stringify(nameDups, null, 2));
    }

    // 5. Inactive parts FK reference check
    const { rows: inactivePartsWithFk } = await pool.query(`
      SELECT
        p.id,
        p.part_code,
        p.part_name,
        p.shrp_part_code,
        p.customer_part_no,
        p.active,
        (SELECT COUNT(*) FROM production_entries pe WHERE pe.part_id = p.id) as production_entries_count,
        (SELECT COUNT(*) FROM bags b WHERE b.part_id = p.id) as bags_count,
        (SELECT COUNT(*) FROM trim_entries te WHERE te.part_id = p.id) as trim_entries_count,
        (SELECT COUNT(*) FROM inspection_entries ie WHERE ie.part_id = p.id) as inspection_entries_count,
        (SELECT COUNT(*) FROM packing_entries pe WHERE pe.part_id = p.id) as packing_entries_count,
        (SELECT COUNT(*) FROM machine_assignments ma WHERE ma.part_id = p.id) as machine_assignments_count
      FROM parts p
      WHERE p.active = FALSE
      ORDER BY p.id
    `);

    const referencedInactive = inactivePartsWithFk.filter((p) =>
      Number(p.production_entries_count) > 0 ||
      Number(p.bags_count) > 0 ||
      Number(p.trim_entries_count) > 0 ||
      Number(p.inspection_entries_count) > 0 ||
      Number(p.packing_entries_count) > 0 ||
      Number(p.machine_assignments_count) > 0
    );

    console.log(`[AUDIT] 5. Total inactive parts: ${inactivePartsWithFk.length}`);
    console.log(`[AUDIT] 5a. Inactive parts WITH historical references (MUST KEEP for FK integrity): ${referencedInactive.length}`);
    if (referencedInactive.length > 0) {
      console.log(JSON.stringify(referencedInactive, null, 2));
    }
    console.log('====================================================================\n');

    return {
      partCodeDuplicates: partCodeDups,
      shrpCodeDuplicates: shrpCodeDups,
      usernameDuplicates: usernameDups,
      nameDuplicates: nameDups,
      totalInactiveParts: inactivePartsWithFk.length,
      inactivePartsWithHistory: referencedInactive,
      allInactiveParts: inactivePartsWithFk,
    };
  } catch (err) {
    console.error('[AUDIT] Failed to audit duplicates:', err.message);
    return null;
  }
}

module.exports = { auditDuplicates };
