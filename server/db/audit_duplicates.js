const pool = require('./pool');

async function auditDuplicates() {
  try {
    // 1. parts duplicates by part_code (case-insensitive & trimmed)
    const { rows: partCodeDups } = await pool.query(`
      SELECT UPPER(TRIM(part_code)) AS normalized_part_code,
             COUNT(*) AS count,
             array_agg(id ORDER BY id) AS ids,
             array_agg(part_code ORDER BY id) AS raw_part_codes,
             array_agg(part_name ORDER BY id) AS part_names,
             array_agg(active ORDER BY id) AS active_states
      FROM parts
      WHERE part_code IS NOT NULL AND TRIM(part_code) != ''
      GROUP BY UPPER(TRIM(part_code))
      HAVING COUNT(*) > 1
    `);

    // 2. parts duplicates by shrp_part_code (excluding placeholders like NA, N/A, NONE, -)
    const { rows: shrpCodeDups } = await pool.query(`
      SELECT UPPER(TRIM(shrp_part_code)) AS normalized_shrp_code,
             COUNT(*) AS count,
             array_agg(id ORDER BY id) AS ids,
             array_agg(part_code ORDER BY id) AS part_codes,
             array_agg(shrp_part_code ORDER BY id) AS raw_shrp_codes,
             array_agg(part_name ORDER BY id) AS part_names,
             array_agg(active ORDER BY id) AS active_states
      FROM parts
      WHERE shrp_part_code IS NOT NULL
        AND TRIM(shrp_part_code) != ''
        AND UPPER(TRIM(shrp_part_code)) NOT IN ('NA', 'N/A', 'NONE', '-', '--', 'N.A.', 'N.A', 'NULL', 'N A')
      GROUP BY UPPER(TRIM(shrp_part_code))
      HAVING COUNT(*) > 1
    `);

    // 3. parts duplicates by customer_part_no (excluding placeholders)
    const { rows: customerPartNoDups } = await pool.query(`
      SELECT UPPER(TRIM(customer_part_no)) AS normalized_customer_part_no,
             COUNT(*) AS count,
             array_agg(id ORDER BY id) AS ids,
             array_agg(part_code ORDER BY id) AS part_codes,
             array_agg(customer_part_no ORDER BY id) AS raw_customer_part_nos,
             array_agg(part_name ORDER BY id) AS part_names,
             array_agg(active ORDER BY id) AS active_states
      FROM parts
      WHERE customer_part_no IS NOT NULL
        AND TRIM(customer_part_no) != ''
        AND UPPER(TRIM(customer_part_no)) NOT IN ('NA', 'N/A', 'NONE', '-', '--', 'N.A.', 'N.A', 'NULL', 'N A')
      GROUP BY UPPER(TRIM(customer_part_no))
      HAVING COUNT(*) > 1
    `);

    // 4. users duplicates by username (case-insensitive)
    const { rows: usernameDups } = await pool.query(`
      SELECT LOWER(TRIM(username)) AS normalized_username,
             COUNT(*) AS count,
             array_agg(id ORDER BY id) AS ids,
             array_agg(username ORDER BY id) AS raw_usernames,
             array_agg(role ORDER BY id) AS roles,
             array_agg(active ORDER BY id) AS active_states,
             array_agg(deleted_at IS NOT NULL ORDER BY id) AS is_deleted
      FROM users
      GROUP BY LOWER(TRIM(username))
      HAVING COUNT(*) > 1
    `);

    // 5. users duplicates by UPPER(TRIM(full_name)) where deleted_at IS NULL
    const { rows: nameDups } = await pool.query(`
      SELECT UPPER(TRIM(full_name)) AS normalized_name,
             COUNT(*) AS count,
             array_agg(id ORDER BY id) AS ids,
             array_agg(username ORDER BY id) AS usernames,
             array_agg(role ORDER BY id) AS roles,
             array_agg(active ORDER BY id) AS active_states
      FROM users
      WHERE deleted_at IS NULL
      GROUP BY UPPER(TRIM(full_name))
      HAVING COUNT(*) > 1
    `);

    // 6. Inactive parts FK reference check (for historical traceability)
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

    const unreferencedInactive = inactivePartsWithFk.filter((p) =>
      Number(p.production_entries_count) === 0 &&
      Number(p.bags_count) === 0 &&
      Number(p.trim_entries_count) === 0 &&
      Number(p.inspection_entries_count) === 0 &&
      Number(p.packing_entries_count) === 0 &&
      Number(p.machine_assignments_count) === 0
    );

    return {
      timestamp: new Date().toISOString(),
      partCodeDuplicates: partCodeDups,
      shrpCodeDuplicates: shrpCodeDups,
      customerPartNoDuplicates: customerPartNoDups,
      usernameDuplicates: usernameDups,
      activeUserNameDuplicates: nameDups,
      inactiveParts: {
        total: inactivePartsWithFk.length,
        withHistoricalReferencesCount: referencedInactive.length,
        withoutHistoricalReferencesCount: unreferencedInactive.length,
        withHistoricalReferences: referencedInactive,
        withoutHistoricalReferences: unreferencedInactive,
      },
    };
  } catch (err) {
    console.error('[AUDIT] Failed to execute duplicate audit:', err.message);
    return { error: err.message };
  }
}

module.exports = { auditDuplicates };
