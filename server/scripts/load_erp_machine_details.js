const path = require('path');
const XLSX = require('xlsx');
const pool = require('../db/pool');

const erpFile = path.join(__dirname, '../../Erp Master Requirements.xlsx');

async function loadERPMachineDetails() {
  try {
    console.log('Reading ERP Master Requirements...');
    const wb = XLSX.readFile(erpFile);

    const ws = wb.Sheets['Machine Details'];
    if (!ws) {
      console.error('Machine Details sheet not found');
      process.exit(1);
    }

    const machineData = XLSX.utils.sheet_to_json(ws, { defval: '' });
    console.log(`Total rows: ${machineData.length}`);

    // Filter valid rows (those with Machine No.)
    const validRows = machineData.filter(row => row['Machine No.'] && String(row['Machine No.']).trim());
    console.log(`Valid machine rows: ${validRows.length}\n`);

    if (validRows.length === 0) {
      console.log('No machine data found');
      process.exit(0);
    }

    console.log('Sample data:', validRows[0]);
    console.log('\n=== LOADING DATA ===\n');

    let updateCount = 0;
    let skipCount = 0;

    for (const row of validRows) {
      const machineCode = String(row['Machine No.']).trim().toUpperCase();

      if (!machineCode) {
        skipCount++;
        continue;
      }

      const updateData = {};

      // Map ERP columns to database fields
      if (row['Capacity']) {
        const tonnage = parseInt(row['Capacity']);
        if (!isNaN(tonnage)) updateData.tonnage = tonnage;
      }

      if (row['Screw Dia']) {
        const dia = parseFloat(row['Screw Dia']);
        if (!isNaN(dia)) updateData.screw_diameter_mm = dia;
      }

      if (row['Machine Rate/Hr']) {
        const rate = parseFloat(row['Machine Rate/Hr']);
        if (!isNaN(rate)) updateData.hourly_rate_inr = rate;
      }

      if (row['Make']) {
        updateData.make = row['Make'].toString();
      }

      if (row['Type']) {
        updateData.machine_type = row['Type'].toString();
      }

      if (row['Dimension']) {
        updateData.dimension = row['Dimension'].toString();
      }

      if (row['HP']) {
        const hp = parseFloat(row['HP']);
        if (!isNaN(hp)) updateData.hp = hp;
      }

      if (row['Max Shot Weight']) {
        const weight = parseFloat(row['Max Shot Weight']);
        if (!isNaN(weight)) updateData.max_shot_weight_g = weight;
      }

      if (row['M/c Installationc OR Purchase on']) {
        const yearStr = String(row['M/c Installationc OR Purchase on']).trim();
        if (yearStr) {
          const year = parseInt(yearStr);
          if (!isNaN(year) && year > 1900 && year < 2100) {
            updateData.year_of_commission = year;
          }
        }
      }

      if (row['Key Machine']) {
        updateData.is_key_machine = row['Key Machine'] === 'Yes' || row['Key Machine'] === 'YES';
      }

      if (row['Counter Available']) {
        updateData.has_counter = row['Counter Available'] === 'Yes' || row['Counter Available'] === 'YES';
      }

      if (Object.keys(updateData).length === 0) {
        console.log(`- ${machineCode}: No data to update`);
        skipCount++;
        continue;
      }

      // Build SQL
      const setClauses = Object.keys(updateData)
        .map((k, i) => `${k} = $${i + 1}`)
        .join(', ');
      const values = Object.values(updateData);
      values.push(machineCode);

      try {
        const result = await pool.query(
          `UPDATE machines SET ${setClauses}
           WHERE UPPER(machine_code) = $${values.length}
           RETURNING machine_code, tonnage, screw_diameter_mm, hourly_rate_inr`,
          values
        );

        if (result.rows.length > 0) {
          console.log(`✓ ${machineCode}: tonnage=${result.rows[0].tonnage}, screw=${result.rows[0].screw_diameter_mm}mm, rate=${result.rows[0].hourly_rate_inr}/hr`);
          updateCount++;
        } else {
          console.log(`✗ ${machineCode}: Not found in database`);
          skipCount++;
        }
      } catch (err) {
        console.error(`✗ ${machineCode}: ${err.message}`);
        skipCount++;
      }
    }

    console.log(`\n=== SUMMARY ===`);
    console.log(`Updated: ${updateCount}`);
    console.log(`Skipped: ${skipCount}`);

  } catch (err) {
    console.error('Fatal error:', err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

loadERPMachineDetails();
