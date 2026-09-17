/**
 * One-time image compression & cleanup script for part_files and mould_files.
 *
 * Compresses existing stored images (JPEG/PNG/WEBP) to max 1600px width/height
 * and 75% quality JPEG, shrinking database volume footprint from ~134MB down to <10MB.
 *
 * Run: node server/db/compress_part_files.js
 */
require('dotenv').config();
const pool = require('./pool');
const { optimizeImage } = require('../lib/imageProcessor');

async function compressTableFiles(client, tableName, idCol = 'id') {
  console.log(`\n==================================================`);
  console.log(`Analyzing & compressing ${tableName}...`);
  console.log(`==================================================`);

  // Query size before
  const sizeBeforeRes = await client.query(`
    SELECT 
      pg_size_pretty(pg_total_relation_size('${tableName}')) AS relation_size,
      pg_size_pretty(COALESCE(SUM(octet_length(data)), 0)) AS data_size,
      COUNT(*) AS total_rows,
      COUNT(*) FILTER (WHERE mime_type LIKE 'image/%') AS image_rows
    FROM ${tableName}
  `);
  const beforeStats = sizeBeforeRes.rows[0];
  console.log(`[BEFORE] Total Relation Size : ${beforeStats.relation_size}`);
  console.log(`[BEFORE] Raw Data Size       : ${beforeStats.data_size}`);
  console.log(`[BEFORE] Total Files         : ${beforeStats.total_rows} (${beforeStats.image_rows} images)`);

  const imageFilesRes = await client.query(`
    SELECT ${idCol} AS id, filename, mime_type, data
    FROM ${tableName}
    WHERE mime_type LIKE 'image/%' AND data IS NOT NULL
    ORDER BY ${idCol} ASC
  `);

  let totalOriginalBytes = 0;
  let totalCompressedBytes = 0;
  let compressedCount = 0;
  let skippedCount = 0;

  for (const row of imageFilesRes.rows) {
    const origLen = row.data ? row.data.length : 0;
    totalOriginalBytes += origLen;

    try {
      const { buffer, mime_type: newMime, compressed } = await optimizeImage(row.data, row.mime_type);
      const newLen = buffer ? buffer.length : origLen;

      if (compressed && newLen < origLen) {
        await client.query(
          `UPDATE ${tableName} SET data = $1, mime_type = $2 WHERE ${idCol} = $3`,
          [buffer, newMime, row.id]
        );
        totalCompressedBytes += newLen;
        compressedCount++;
        const savingsPct = (((origLen - newLen) / origLen) * 100).toFixed(1);
        console.log(
          `  ✓ [${tableName}] ID ${row.id} (${row.filename}): ${(origLen / 1024).toFixed(0)}KB -> ${(newLen / 1024).toFixed(0)}KB (-${savingsPct}%)`
        );
      } else {
        totalCompressedBytes += origLen;
        skippedCount++;
        console.log(`  - [${tableName}] ID ${row.id} (${row.filename}): Already optimal / ${(origLen / 1024).toFixed(0)}KB`);
      }
    } catch (err) {
      totalCompressedBytes += origLen;
      skippedCount++;
      console.error(`  ✗ [${tableName}] ID ${row.id} (${row.filename}) Error:`, err.message);
    }
  }

  // Query size after
  const sizeAfterRes = await client.query(`
    SELECT 
      pg_size_pretty(pg_total_relation_size('${tableName}')) AS relation_size,
      pg_size_pretty(COALESCE(SUM(octet_length(data)), 0)) AS data_size
    FROM ${tableName}
  `);
  const afterStats = sizeAfterRes.rows[0];

  const savedBytes = totalOriginalBytes - totalCompressedBytes;
  const overallSavingsPct = totalOriginalBytes > 0 ? ((savedBytes / totalOriginalBytes) * 100).toFixed(1) : 0;

  console.log(`\n--------------------------------------------------`);
  console.log(`Summary for ${tableName}:`);
  console.log(`  Processed Images   : ${compressedCount} compressed, ${skippedCount} unchanged`);
  console.log(`  Original Data Size : ${(totalOriginalBytes / (1024 * 1024)).toFixed(2)} MB`);
  console.log(`  New Data Size      : ${(totalCompressedBytes / (1024 * 1024)).toFixed(2)} MB`);
  console.log(`  Space Saved        : ${(savedBytes / (1024 * 1024)).toFixed(2)} MB (-${overallSavingsPct}%)`);
  console.log(`  Current Data Size  : ${afterStats.data_size}`);
  console.log(`--------------------------------------------------\n`);

  return {
    tableName,
    beforeStats,
    afterStats,
    totalOriginalMB: (totalOriginalBytes / (1024 * 1024)).toFixed(2),
    totalCompressedMB: (totalCompressedBytes / (1024 * 1024)).toFixed(2),
    savedMB: (savedBytes / (1024 * 1024)).toFixed(2),
    savingsPct: overallSavingsPct,
  };
}

async function run() {
  const client = await pool.connect();
  try {
    console.log('Starting part_files and mould_files image compression migration...');

    // 1. Compress part_files
    await compressTableFiles(client, 'part_files', 'id');

    // 2. Compress mould_files if exists
    const mouldFilesCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'mould_files'
      )
    `);
    if (mouldFilesCheck.rows[0]?.exists) {
      await compressTableFiles(client, 'mould_files', 'id');
    }

    console.log(`\n==================================================`);
    console.log(`✨ All image compression complete!`);
    console.log(`Note: In PostgreSQL, to immediately reclaim dead tuple disk`);
    console.log(`pages on disk volume, run in psql:`);
    console.log(`  VACUUM FULL part_files;`);
    console.log(`==================================================\n`);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

if (require.main === module) {
  run();
}

module.exports = { run, compressTableFiles };
