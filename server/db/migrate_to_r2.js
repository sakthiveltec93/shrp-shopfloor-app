require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const pool = require('./pool');
const { optimizeImage } = require('../lib/imageProcessor');
const { uploadFile, isR2Configured } = require('../lib/r2');

async function migrate() {
  console.log('--- Starting Cloudflare R2 / Image Compression Migration ---');
  console.log('R2 Configured:', isR2Configured());

  try {
    const { rows: files } = await pool.query(`
      SELECT id, part_id, filename, mime_type, data, storage_key
      FROM part_files
      WHERE data IS NOT NULL
      ORDER BY id ASC
    `);

    console.log(`Found ${files.length} files with binary data in part_files.`);

    let totalOriginalBytes = 0;
    let totalNewBytes = 0;
    let r2UploadedCount = 0;
    let processedCount = 0;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const origSize = file.data ? file.data.length : 0;
      totalOriginalBytes += origSize;

      try {
        // Optimize image if it's an image
        let finalBuffer = file.data;
        let finalMime = file.mime_type;

        if (file.mime_type && file.mime_type.startsWith('image/')) {
          const optimized = await optimizeImage(file.data, file.mime_type);
          finalBuffer = optimized.buffer;
          finalMime = optimized.mime_type;
        }

        totalNewBytes += finalBuffer.length;

        // Upload to R2 if configured and not already stored
        let storageKey = file.storage_key;
        if (isR2Configured() && !storageKey) {
          const sanitizedFilename = (file.filename || 'file').replace(/[^a-zA-Z0-9._-]/g, '_');
          storageKey = `part-files/${file.part_id}/${file.id}_${sanitizedFilename}`;
          await uploadFile(storageKey, finalBuffer, finalMime);
          r2UploadedCount++;
        }

        // Update database row
        await pool.query(
          `UPDATE part_files
           SET data = $1, mime_type = $2, storage_key = $3
           WHERE id = $4`,
          [finalBuffer, finalMime, storageKey, file.id]
        );

        processedCount++;
        const savingsPercent = origSize > 0 ? (((origSize - finalBuffer.length) / origSize) * 100).toFixed(1) : 0;
        console.log(
          `[${i + 1}/${files.length}] File #${file.id} (${file.filename}): ${origSize}B -> ${finalBuffer.length}B (${savingsPercent}% saved). R2 key: ${storageKey || 'none'}`
        );
      } catch (err) {
        console.error(`[ERROR] Failed to migrate file #${file.id}:`, err.message);
      }
    }

    console.log('\n--- Migration Complete ---');
    console.log(`Successfully processed: ${processedCount}/${files.length} files`);
    console.log(`Uploaded to R2: ${r2UploadedCount} files`);
    console.log(`Original total size: ${(totalOriginalBytes / (1024 * 1024)).toFixed(2)} MB`);
    console.log(`Optimized total size: ${(totalNewBytes / (1024 * 1024)).toFixed(2)} MB`);
    if (totalOriginalBytes > 0) {
      const overallSavings = (((totalOriginalBytes - totalNewBytes) / totalOriginalBytes) * 100).toFixed(1);
      console.log(`Total database size reduction: ${overallSavings}%`);
    }
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    await pool.end();
  }
}

if (require.main === module) {
  migrate();
}

module.exports = { migrate };
