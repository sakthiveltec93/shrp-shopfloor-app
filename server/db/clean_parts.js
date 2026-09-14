const pool = require('./pool');

// Clean mapping of all 77 active parts from FORM ENTRY 26-271.xlsm PART_MASTER:
// [SHRP Short Code, Customer Drawing No / Part Name, Part Wt (g), TrimReq, InspReq, PackReq, DispReq, TolerancePct, StdPackQty, Cavity, ShotWt, BatchPrefix]
const EXCEL_PARTS = [
  ['LBB', 'HC442L3LBB01', 6.07, false, true, true, true, 2, 250, 4, 31, '33'],
  ['LBC', 'HC442L3LBC02', 7.15, false, true, true, true, 2, 150, 4, 36, '34'],
  ['LAC Blue', 'HC442L3LAC01', 8.25, false, true, true, true, 2, 400, 4, 39, '35'],
  ['AFM BIG', 'CA581CAWXX01', 10.35, true, true, true, true, 2, 250, 2, 27, '36'],
  ['AFM SMALL', 'CA582DDRXX01', 5.65, true, true, true, true, 2, 500, 2, 17.5, '37'],
  ['OERAA', 'HC442OERAA01', 4.4, false, true, true, true, 2, 1000, 4, 25, '38'],
  ['QVEAC', 'HC442QVEAC01', 3.75, false, true, true, true, 2, 1000, 4, 22, '39'],
  ['QVEBC', 'HC442QVEBC01', 3.75, false, true, true, true, 2, 1000, 4, 22, '40'],
  ['T40', 'RM-19D935-BA', 2.3, false, true, true, true, 2, 750, 4, 15, '41'],
  ['UMNAA', 'HC442UMNAA02', 4.7, false, true, true, true, 2, 250, 4, 25.5, '45'],
  ['UMEAA', 'FC1F2UMEAA01', 6.85, false, true, true, true, 2, 300, 4, 34, '46'],
  ['NDGAA', 'FC1F2NDGAA02', 2.65, false, true, true, true, 2, 650, 4, 17, '47'],
  ['A710', 'A710-BBWBA-01', 4.25, false, true, true, true, 2, 250, 4, 23.5, '1'],
  ['CEEAA-ORANGE', 'FC1F2CEEAA02', 6.85, false, true, true, true, 2, 250, 4, 34, '1A'],
  ['F364 16C', 'F364-CB5AA-01', 2.96, true, true, true, true, 2, 400, 4, 18, '2'],
  ['F364 GS', 'F364-CB5AA-01-GS', 2.96, true, true, true, true, 2, 400, 4, 18, '2A'],
  ['F442 QQ', 'F442-QQ7AA-01', 5.15, false, true, true, true, 2, 300, 4, 27.5, '3'],
  ['F442 KQ', 'F442-KQAAA-01', 6.65, false, true, true, true, 2, 200, 4, 33.5, '4'],
  ['F442 WB', 'F442-WBAAA-01', 5.2, false, true, true, true, 2, 300, 4, 27.5, '5'],
  ['F710', 'F710-AKYAA-01', 3.8, false, true, true, true, 2, 400, 4, 21.5, '7'],
  ['F885 Y', 'F885-BB1AA-01', 3.35, false, true, true, true, 2, 500, 4, 19.5, '8'],
  ['AN6B', 'FC1F2AN6BA01', 3.25, false, true, true, true, 2, 500, 4, 19, '9'],
  ['AA02 Y', 'FC1F2SPHAA02', 2.45, false, true, true, true, 2, 750, 4, 15.5, '10'],
  ['SULLA', 'FC1F2SULLA01', 4.35, false, true, true, true, 2, 300, 4, 24, '11'],
  ['UGKCA', 'FC1F2UGKCA01', 1.45, false, true, true, true, 2, 1500, 4, 11.5, '12'],
  ['UMEAB', 'FC1F2UMEAB01', 2.3, false, true, true, true, 2, 750, 4, 15.5, '13'],
  ['HA715 - W501', 'HA715L5G1A01', 7.45, false, true, true, true, 2, 200, 4, 36.5, '14'],
  ['CXGAA', 'HC442CXGAA01', 5.65, false, true, true, true, 2, 250, 4, 29.5, '15'],
  ['AA03', 'HC442SPHAA03', 6.05, false, true, true, true, 2, 250, 4, 31, '16'],
  ['SULAC', 'HC442SULAC01', 4.85, false, true, true, true, 2, 300, 4, 26, '17'],
  ['QQVBA W', 'HC443QQVBA02', 2.2, false, true, true, true, 2, 750, 4, 15, '18'],
  ['QQVBA Y', 'HC443QQVBA02-Y', 2.2, false, true, true, true, 2, 750, 4, 15, '18Y'],
  ['HL180', 'HL180F4W1A01', 1.85, false, true, true, true, 2, 1000, 4, 13.5, '19'],
  ['PDPKA', 'HR230PDPKA02', 12.35, false, true, true, true, 2, 100, 2, 31.5, '20'],
  ['DH7AA', 'HR230DH7AA01', 13.45, false, true, true, true, 2, 100, 2, 33.5, '21'],
  ['VW DIA 16 - HW773A', 'HW773G9E1A01', 1.6, false, true, true, true, 2, 1000, 4, 12.5, '22'],
  ['VW DIA 8 - HW773B', 'HW773G9E1B01', 0.65, false, true, true, true, 2, 3000, 4, 8.5, '23'],
  ['NCBA', 'R230-NC5BA-01', 8.9, false, true, true, true, 2, 200, 2, 24, '24'],
  ['NCBB', 'R230-NC5BB-01', 13.5, false, true, true, true, 2, 105, 2, 33.5, '25'],
  ['1901', 'V0LC-01C019-01', 2.55, false, true, true, true, 2, 600, 4, 16.5, '26'],
  ['2100', 'V0LC-01C021-00', 2.2, false, true, true, true, 2, 750, 4, 15, '27'],
  ['2200', 'V0LC-01C022-00', 2.2, false, true, true, true, 2, 750, 4, 15, '28'],
  ['2800', 'V0LC-01C028-00', 3.35, false, true, true, true, 2, 500, 4, 19.5, '29'],
  ['VPAA', 'VP5N1H-407721-AA', 2.8, false, true, true, true, 2, 650, 4, 17.5, '30'],
  ['VPFA', 'VP5N1H-407721-FA', 3.4, false, true, true, true, 2, 500, 4, 20, '31'],
  ['DM1C', 'DM1C4UBH1B01', 2.45, false, true, true, true, 2, 750, 4, 16, '32'],
  ['DM1C1QRJAA01', 'DM1C1QRJAA01', 2.96, true, true, true, true, 2, 400, 4, 18, 'DM1C1Q'],
  ['BH-DIA 16 - MAA', 'PL FC1E4K5MAA - 00', 6.85, false, true, true, true, 2, 300, 4, 34, 'B1'],
  ['BH-DIA 12 -MBA', 'PL FC1E4K5MBA - 00', 5.65, false, true, true, true, 2, 250, 4, 29.5, 'B2'],
  ['BH-DIA 8', 'FC1P4L1E1A01', 3.75, false, true, true, true, 2, 1000, 4, 22, 'B3'],
  ['HR241', 'HR241G6C1A01', 1.85, false, true, true, true, 2, 1000, 4, 13.5, 'B4'],
  ['OUTLET', 'PLHC442G6C1B', 2.45, false, true, true, true, 2, 750, 4, 16, 'B5'],
  ['INLET', 'PLHC442G6C1A', 2.8, false, true, true, true, 2, 650, 4, 17.5, 'B6'],
  ['R101', 'R101WC9AA01', 3.4, false, true, true, true, 2, 500, 4, 20, 'B7'],
  ['9AA', 'VPR230WC9AA01', 3.35, false, true, true, true, 2, 500, 4, 19.5, 'B8'],
  ['9AB', 'VPR230-WC9AB-01', 3.35, false, true, true, true, 2, 500, 4, 19.5, 'B9'],
  ['VP6T', 'VP6TLU-11N087-AA', 2.96, true, true, true, true, 2, 400, 4, 18, 'C1'],
  ['SYRINGE CAP', 'SYRINGE CAP', 2.45, false, true, true, true, 2, 750, 4, 16, 'O1'],
  ['PUNE B', 'FC1E1BAE1D01', 2.96, true, true, true, true, 2, 400, 4, 18, 'P1'],
  ['PUNE S', 'HR241BAE1B01', 2.96, true, true, true, true, 2, 400, 4, 18, 'P2'],
  ['F390', 'F390-QQDC-A02', 3.35, false, true, true, true, 2, 500, 4, 19.5, 'W1'],
  ['KQ NEW', 'F442-KQ', 6.65, false, true, true, true, 2, 200, 4, 33.5, 'W3'],
  ['SHRP-T10', 'SHRP-T10', 2.96, true, true, true, true, 2, 400, 4, 18, 'W4'],
  ['SHRP-T7', 'SHRP-T7', 2.96, true, true, true, true, 2, 400, 4, 18, 'W7'],
  ['SHRP-T8', 'SHRP-T8', 2.96, true, true, true, true, 2, 400, 4, 18, 'W8'],
  ['DA', 'WC-SCP-ECC21-DA01', 2.96, true, true, true, true, 2, 400, 4, 18, 'W9'],
  ['LMF', 'WC-SCP-ECC21-LMF01', 2.96, true, true, true, true, 2, 400, 4, 18, 'W10'],
  ['LMM', 'WC-SCP-eCC21-Lmm01', 2.96, true, true, true, true, 2, 400, 4, 18, 'W11'],
  ['SMF', 'WC-SCP-ECC21-SMF01', 2.96, true, true, true, true, 2, 400, 4, 18, 'W12'],
  ['SMM', 'WC-SCP-eCC21-Smm01', 2.96, true, true, true, true, 2, 400, 4, 18, 'W13'],
  ['NA-DB', 'WC-SCP-SC21NA-DB-01', 2.96, true, true, true, true, 2, 400, 4, 18, 'W14'],
  ['NA-LC', 'WC-SCP-SC21NA-LC-01', 2.96, true, true, true, true, 2, 400, 4, 18, 'W15'],
  ['NA-TB', 'WC-SCP-SC21NA-TB-T01', 2.96, true, true, true, true, 2, 400, 4, 18, 'W16'],
  ['LAC Green', 'HC442L3LAC01-GRN', 8.25, false, true, true, true, 2, 400, 4, 39, 'W17'],
  ['ATBAB', 'F442-ATBAB02', 2.96, true, true, true, true, 2, 400, 4, 18, 'W18'],
  ['HandlePlastic', 'HandlePlastic', 5.0, false, true, true, true, 2, 500, 1, 5, 'Handle'],
  ['VK GR -6', 'VK GR -6', 3.0, false, true, true, true, 2, 500, 1, 3, 'VK GR'],
];

async function main() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // First: Deactivate ALL parts
    await client.query('UPDATE parts SET active = FALSE');

    // Second: Upsert exact clean parts
    for (const p of EXCEL_PARTS) {
      const [shrpCode, custPartNo, pWt, trimReq, inspReq, packReq, dispReq, tol, stdPack, cavity, shotWt, batchCode] = p;

      // Check if a part already exists with either part_code = shrpCode or part_code = custPartNo
      const existing = await client.query(
        'SELECT id, part_code FROM parts WHERE part_code = $1 OR shrp_part_code = $1 OR part_code = $2 LIMIT 1',
        [shrpCode, custPartNo]
      );

      if (existing.rows.length > 0) {
        // Update existing row
        await client.query(
          `UPDATE parts SET
            shrp_part_code = $1,
            customer_part_no = $2,
            part_name = $2,
            part_weight_g = $3,
            trim_required = $4,
            inspection_required = $5,
            packing_required = $6,
            dispatch_required = $7,
            tolerance_pct = $8,
            standard_pack_qty = $9,
            cavity_count = $10,
            unit_weight_g = $11,
            batch_part_code = $12,
            active = TRUE
          WHERE id = $13`,
          [shrpCode, custPartNo, pWt, trimReq, inspReq, packReq, dispReq, tol, stdPack, cavity, shotWt, batchCode, existing.rows[0].id]
        );
      } else {
        // Insert new row
        await client.query(
          `INSERT INTO parts (
            part_code, shrp_part_code, customer_part_no, part_name,
            part_weight_g, trim_required, inspection_required, packing_required, dispatch_required,
            tolerance_pct, standard_pack_qty, cavity_count, unit_weight_g, batch_part_code, active,
            standard_cycle_time_sec
          ) VALUES ($1, $1, $2, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, TRUE, 30)`,
          [shrpCode, custPartNo, pWt, trimReq, inspReq, packReq, dispReq, tol, stdPack, cavity, shotWt, batchCode]
        );
      }
    }

    await client.query('COMMIT');

    const countRes = await client.query('SELECT count(*) FILTER (WHERE active) as active, count(*) as total FROM parts');
    console.log(`Clean sync complete! Active parts: ${countRes.rows[0].active} (Total: ${countRes.rows[0].total})`);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error syncing parts:', err);
  } finally {
    client.release();
    pool.end();
  }
}

main();
