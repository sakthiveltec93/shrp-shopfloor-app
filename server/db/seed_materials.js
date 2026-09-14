const pool = require('./pool');

const INITIAL_MATERIALS = [
  {
    material_code: 'RM-LDPE-16MA400',
    material_name: 'LDPE 16MA400 (Injection Grade)',
    category: 'VIRGIN_POLYMER',
    supplier_name: 'Reliance Industries / IOCL',
    grade_code: '16MA400',
    color: 'Natural / White',
    density_g_cm3: 0.918,
    mfi_g_10min: 30.0,
    standard_bag_wt_kg: 25.0,
    min_stock_kg: 500.0,
    default_parameters: JSON.stringify(['Lot No Match with Bag & TC', 'Color', 'Appearance', 'Bag Weight (25Kg)', 'MFI (190°C/2.16kg)', 'Density (@23°C)', 'Tensile Strength', 'Elongation @ Break']),
  },
  {
    material_code: 'RM-LLDPE-M26500',
    material_name: 'LLDPE M26500 (Tear Strength Modifier)',
    category: 'VIRGIN_POLYMER',
    supplier_name: 'Reliance Industries',
    grade_code: 'M26500',
    color: 'Natural',
    density_g_cm3: 0.926,
    mfi_g_10min: 50.0,
    standard_bag_wt_kg: 25.0,
    min_stock_kg: 300.0,
    default_parameters: JSON.stringify(['Lot No Match with Bag & TC', 'Color', 'Appearance', 'Bag Weight (25Kg)', 'MFI (190°C/2.16kg)', 'Density (@23°C)']),
  },
  {
    material_code: 'RM-PPCP-HI',
    material_name: 'PPCP High Impact Copolymer',
    category: 'VIRGIN_POLYMER',
    supplier_name: 'IOCL / Reliance',
    grade_code: 'MI3530',
    color: 'Natural / Black',
    density_g_cm3: 0.905,
    mfi_g_10min: 12.0,
    standard_bag_wt_kg: 25.0,
    min_stock_kg: 500.0,
    default_parameters: JSON.stringify(['Lot No Match with Bag & TC', 'Color', 'Appearance', 'Bag Weight (25Kg)', 'MFI (230°C/2.16kg)', 'Density (@23°C)', 'Izod Impact Strength', 'Flexural Modulus']),
  },
  {
    material_code: 'RM-NYLON66-GF30',
    material_name: 'Nylon 66 (Polyamide 66) 30% Glass Filled',
    category: 'VIRGIN_POLYMER',
    supplier_name: 'DuPont / BASF',
    grade_code: 'PA66-GF30',
    color: 'Black',
    density_g_cm3: 1.35,
    mfi_g_10min: 0,
    standard_bag_wt_kg: 25.0,
    min_stock_kg: 200.0,
    default_parameters: JSON.stringify(['Lot No Match with Bag & TC', 'Color', 'Appearance', 'Bag Weight (25Kg)', 'Moisture Content (PPM)', 'Tensile Strength']),
  },
  {
    material_code: 'RM-POM-DELRIN',
    material_name: 'POM Polyacetal (Delrin / Celcon)',
    category: 'VIRGIN_POLYMER',
    supplier_name: 'DuPont / Polyplastics',
    grade_code: 'M90 / POM-C',
    color: 'White / Natural',
    density_g_cm3: 1.41,
    mfi_g_10min: 9.0,
    standard_bag_wt_kg: 25.0,
    min_stock_kg: 200.0,
    default_parameters: JSON.stringify(['Lot No Match with Bag & TC', 'Color', 'Appearance', 'Bag Weight (25Kg)', 'MFI (190°C/2.16kg)', 'Density (@23°C)']),
  },
  {
    material_code: 'RM-PVC-FLEX',
    material_name: 'PVC Flexible Compound 65-80 Shore A',
    category: 'VIRGIN_POLYMER',
    supplier_name: 'DCW / Kalpena',
    grade_code: 'PVC-F70',
    color: 'Black',
    density_g_cm3: 1.28,
    mfi_g_10min: 0,
    standard_bag_wt_kg: 25.0,
    min_stock_kg: 500.0,
    default_parameters: JSON.stringify(['Lot No Match with Bag & TC', 'Color', 'Appearance', 'Bag Weight (25Kg)', 'Shore A Hardness', 'Specific Gravity']),
  },
  {
    material_code: 'RM-MB-BLACK-2PCT',
    material_name: 'Black Masterbatch (2% Dosage)',
    category: 'MASTERBATCH',
    supplier_name: 'Clariant / Poddar',
    grade_code: 'MB-BLK-01',
    color: 'Jet Black',
    density_g_cm3: 1.15,
    mfi_g_10min: 20.0,
    standard_bag_wt_kg: 25.0,
    min_stock_kg: 100.0,
    default_parameters: JSON.stringify(['Lot No Match with Bag & TC', 'Color Dispersion', 'Carbon Black Content (%)', 'MFI']),
  },
  {
    material_code: 'RM-EPDM-RUBBER',
    material_name: 'EPDM Rubber Compound 70 Shore A',
    category: 'RUBBER_COMPOUND',
    supplier_name: 'SHRP Internal / Compounder',
    grade_code: 'EPDM-70A',
    color: 'Black',
    density_g_cm3: 1.18,
    mfi_g_10min: 0,
    standard_bag_wt_kg: 25.0,
    min_stock_kg: 300.0,
    default_parameters: JSON.stringify(['Batch No Match', 'Color', 'Shore A Hardness (68-72)', 'Tensile Strength (Min 10 MPa)', 'Elongation @ Break (Min 250%)', 'Rheometer Cure Time']),
  },
];

async function syncMaterials() {
  try {
    for (const m of INITIAL_MATERIALS) {
      await pool.query(
        `INSERT INTO raw_materials (
           material_code, material_name, category, supplier_name, grade_code,
           color, density_g_cm3, mfi_g_10min, standard_bag_wt_kg, min_stock_kg, default_parameters, active
         ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,TRUE)
         ON CONFLICT (material_code) DO UPDATE SET
           material_name = EXCLUDED.material_name,
           supplier_name = EXCLUDED.supplier_name,
           grade_code = EXCLUDED.grade_code,
           density_g_cm3 = EXCLUDED.density_g_cm3,
           mfi_g_10min = EXCLUDED.mfi_g_10min,
           min_stock_kg = EXCLUDED.min_stock_kg,
           default_parameters = EXCLUDED.default_parameters`,
        [
          m.material_code, m.material_name, m.category, m.supplier_name, m.grade_code,
          m.color, m.density_g_cm3, m.mfi_g_10min, m.standard_bag_wt_kg, m.min_stock_kg, m.default_parameters,
        ]
      );
    }

    // Auto-link LDPE parts to LDPE primary material
    const ldpeMatRes = await pool.query("SELECT id FROM raw_materials WHERE material_code = 'RM-LDPE-16MA400' LIMIT 1");
    const lldpeMatRes = await pool.query("SELECT id FROM raw_materials WHERE material_code = 'RM-LLDPE-M26500' LIMIT 1");
    const mbMatRes = await pool.query("SELECT id FROM raw_materials WHERE material_code = 'RM-MB-BLACK-2PCT' LIMIT 1");

    if (ldpeMatRes.rows[0]) {
      const primaryId = ldpeMatRes.rows[0].id;
      const secondaryId = lldpeMatRes.rows[0]?.id || null;
      const mbId = mbMatRes.rows[0]?.id || null;

      const partsRes = await pool.query("SELECT id, part_code FROM parts WHERE active = TRUE");
      for (const p of partsRes.rows) {
        await pool.query(
          `INSERT INTO part_recipes (
             part_id, primary_material_id, primary_ratio_pct,
             secondary_material_id, secondary_ratio_pct,
             regrind_ratio_pct, masterbatch_material_id, masterbatch_ratio_pct,
             max_allowed_regrind_pct, mixing_instructions
           ) VALUES ($1, $2, 60.0, $3, 30.0, 10.0, $4, 2.0, 15.0, 'Standard Shopfloor Blend: LDPE 16MA400 (60%) + LLDPE M26500 (30%) + Regrind (10%) + 2% Black MB')
           ON CONFLICT (part_id) DO NOTHING`,
          [p.id, primaryId, secondaryId, mbId]
        );
      }
    }
    console.log('[MATERIALS-SYNC] Standard raw materials and default recipes synced.');
  } catch (err) {
    console.error('[MATERIALS-SYNC] Error:', err.message || err);
  }
}

module.exports = { syncMaterials };
