const fs = require('fs');
const path = require('path');
const pool = require('./pool');
const { optimizeImage } = require('../lib/imageProcessor');

// Explicit overrides / aliases for filenames that don't match exactly by simple normalization
const EXPLICIT_MAPPINGS = {
  'DH7AA.jpg': 'HR230DH7AA01',
  'A710 ORANGE.jpg': 'FC1F2CEEAA02',
  'A710BBWBA 01.jpg': 'A710-BBWBA-01',
  'F364CB5AA01 .jpg': 'F364-CB5AA-01',
  'F364CB5AA01 GS.jpg': 'F364-CB5AA-01-GS',
  'F442-KAAAA-01.jpg': 'F442-KQAAA-01',
  'WONJIN F442KQ.jpg': 'F442-KQ',
  'wb.jpg 1.png': 'F442-WBAAA-01',
  'F442-WBAAA-01.jpg': 'F442-WBAAA-01',
  'F442-QQ7AA-01.jpg': 'F442-QQ7AA-01',
  'F710AKYAA01.jpg': 'F710-AKYAA-01',
  'F885-BB1AA-01.jpg': 'F885-BB1AA-01',
  'FC1D4K5MAA.jpg': 'PL FC1E4K5MAA - 00',
  'FC1D4K5MBA.jpg': 'PL FC1E4K5MBA - 00',
  'FC1E1BAE1A01.jpg': 'FC1E1BAE1D01', // Pune B
  'FC1F2AN6BA01.jpg': 'FC1F2AN6BA01',
  'FC1F2SPHAA02.jpg': 'FC1F2SPHAA02',
  'FC1F2SULLA01.jpg': 'FC1F2SULLA01',
  'FC1F2UGKCA01.jpg': 'FC1F2UGKCA01',
  'FC1F2UMEAB01.jpg': 'FC1F2UMEAB01',
  'FC1P4L1E1A01.jpg': 'FC1P4L1E1A01',
  'HA715L5G1A01.jpg': 'HA715L5G1A01',
  'HC442CXGAA01-NO.jpg': 'HC442CXGAA01',
  'HC442G6C1A01.jpg': 'PLHC442G6C1A', // INLET
  'HC442G6C1B01.jpg': 'PLHC442G6C1B', // OUTLET
  'HC442L3LBB01.jpg': 'HC442L3LBB01',
  'HC442L3LBC01.jpg': 'HC442L3LBC02',
  'LBC.jpg': 'HC442L3LBC02',
  'LAC_001.jpg': 'HC442L3LAC01',
  'HC442SPHAA03-N0.jpg': 'HC442SPHAA03',
  'HC442SULAC01 NO.jpg': 'HC442SULAC01',
  'HC443QQVBA02.jpg': 'HC443QQVBA02',
  'QQVBAYELLOW_001.jpg': 'HC443QQVBA02-Y',
  'HL180F4W1A01.jpg': 'HL180F4W1A01',
  'HR230PDPKA02.jpg': 'HR230PDPKA02',
  'HR241BAE1B01.jpg': 'HR241BAE1B01', // Pune S
  'HR241G6C1 A01.jpg': 'HR241G6C1A01',
  'HW773G9E1A01.jpg': 'HW773G9E1A01',
  'HW773G9E1B01.jpg': 'HW773G9E1B01',
  'QVEAC (2).jpg': 'HC442QVEAC01',
  'QVEAC.jpg': 'HC442QVEAC01',
  'QVEBC (2).jpg': 'HC442QVEBC01',
  'QVEBC.jpg': 'HC442QVEBC01',
  'R101WC9AA01 NO.jpg': 'R101WC9AA01',
  'R230NC5BA01.jpg': 'R230-NC5BA-01',
  'R230NC5BB01.jpg': 'R230-NC5BB-01',
  'SHRP-T7.jpg': 'SHRP-T7',
  'SHRP-T8.jpg': 'SHRP-T8',
  '2100 NEW.jpg': 'V0LC-01C021-00',
  '2100.jpg': 'V0LC-01C021-00',
  'V0LC-01C019-01.jpg': 'V0LC-01C019-01',
  'V0LC-01C021-00.jpg': 'V0LC-01C021-00',
  'V0LC-01C022-00.jpg': 'V0LC-01C022-00',
  'V0LC-01C028-00.jpg': 'V0LC-01C028-00',
  'VP5N1H-407721-AA.jpg': 'VP5N1H-407721-AA',
  'VP5N1H-407721-FA.jpg': 'VP5N1H-407721-FA',
  'VPR230-WC9AA-01.jpg': 'VPR230WC9AA01',
  'VPR230-WC9AB-01-NO.jpg': 'VPR230-WC9AB-01',
  'WC-SCP-ECC21-DA01.jpg': 'WC-SCP-ECC21-DA01',
  'WC-SCP-ECC21-LMF.jpg': 'WC-SCP-ECC21-LMF01',
  'WC-SCP-ECC21-LMM.jpg': 'WC-SCP-eCC21-Lmm01',
  'WC-SCP-ECC21-SMF.jpg': 'WC-SCP-ECC21-SMF01',
  'WC-SCP-ECC21-SMM.jpg': 'WC-SCP-eCC21-Smm01',
  'WC-SCP-SC21NA-DB-01.jpg': 'WC-SCP-SC21NA-DB-01',
  'WC-SCP-SC21NA-LC-01.jpg': 'WC-SCP-SC21NA-LC-01',
  'WC-SCP-SC21NA-TB-T01.jpg': 'WC-SCP-SC21NA-TB-T01',
  'F390-QQDC-A02.jpg': 'F390-QQDC-A02',
  'DM1C4UBH1B01.jpg': 'DM1C4UBH1B01',
};

function normalizeStr(str) {
  if (!str) return '';
  return str.toString()
    .toUpperCase()
    .replace(/\.[A-Z0-9]+$/i, '') // remove extension
    .replace(/[^A-Z0-9]/g, '');   // remove punctuation, spaces, dashes
}

function getPhotoDirectory() {
  const candidates = [
    path.join(__dirname, '..', '..', 'PART PHOTO'),
    path.join(__dirname, '..', 'PART PHOTO'),
    path.join(process.cwd(), 'PART PHOTO'),
    path.resolve('PART PHOTO'),
  ];
  for (const dir of candidates) {
    if (fs.existsSync(dir)) {
      return dir;
    }
  }
  return null;
}

async function syncPartPhotos(closePool = false) {
  const client = await pool.connect();
  try {
    const photoDir = getPhotoDirectory();
    if (!photoDir) {
      console.log('[PHOTO-SYNC] PART PHOTO directory not found. Skipping photo sync.');
      return;
    }

    // Get an admin or system user for uploaded_by_user_id
    const userRes = await client.query(`
      SELECT id FROM users 
      WHERE role = 'admin' 
      ORDER BY id ASC 
      LIMIT 1
    `);
    const adminUserId = userRes.rows[0]?.id || 1;

    // Fetch all active parts from database
    const partsRes = await client.query(`
      SELECT id, part_code, shrp_part_code, customer_part_no, part_name, batch_part_code
      FROM parts
      WHERE active = TRUE
    `);
    const parts = partsRes.rows;

    // Build lookup maps for parts
    const partsById = new Map();
    const partsByNormKey = new Map();
    const partsByExactCode = new Map();

    for (const p of parts) {
      partsById.set(p.id, p);
      const keys = [
        p.customer_part_no,
        p.shrp_part_code,
        p.part_code,
        p.part_name,
      ].filter(Boolean);

      for (const k of keys) {
        partsByExactCode.set(k.toUpperCase().trim(), p);
        const norm = normalizeStr(k);
        if (norm) {
          partsByNormKey.set(norm, p);
        }
      }
    }

    const files = fs.readdirSync(photoDir);
    const validExtensions = ['.jpg', '.jpeg', '.png', '.webp'];

    let matchedCount = 0;
    let updatedCount = 0;

    await client.query('BEGIN');

    for (const filename of files) {
      const ext = path.extname(filename).toLowerCase();
      if (!validExtensions.includes(ext)) {
        continue;
      }

      const filePath = path.join(photoDir, filename);
      const stat = fs.statSync(filePath);
      if (!stat.isFile() || stat.size === 0) continue;

      let targetPart = null;

      // 1. Check explicit override
      if (EXPLICIT_MAPPINGS[filename]) {
        const targetCode = EXPLICIT_MAPPINGS[filename].toUpperCase().trim();
        targetPart = partsByExactCode.get(targetCode) || partsByNormKey.get(normalizeStr(targetCode));
      }

      // 2. Exact code match without extension
      if (!targetPart) {
        const baseName = path.basename(filename, ext).trim();
        targetPart = partsByExactCode.get(baseName.toUpperCase()) || partsByNormKey.get(normalizeStr(baseName));
      }

      // 3. Normalized fuzzy check
      if (!targetPart) {
        const normFile = normalizeStr(filename);
        for (const [normKey, part] of partsByNormKey.entries()) {
          if (normFile.includes(normKey) || normKey.includes(normFile)) {
            targetPart = part;
            break;
          }
        }
      }

      if (!targetPart) {
        console.log(`[PHOTO-SYNC] Unmatched photo: ${filename}`);
        continue;
      }

      matchedCount++;
      const rawMimeType = ext === '.png' ? 'image/png' : (ext === '.webp' ? 'image/webp' : 'image/jpeg');
      const rawFileBuffer = fs.readFileSync(filePath);
      const { buffer: fileBuffer, mime_type: mimeType } = await optimizeImage(rawFileBuffer, rawMimeType);

      // Check if photo already exists for this part in part_files
      const existingRes = await client.query(`
        SELECT id, filename FROM part_files
        WHERE part_id = $1 AND file_type = 'photo'
        LIMIT 1
      `, [targetPart.id]);

      if (existingRes.rows.length > 0) {
        // Update existing photo
        await client.query(`
          UPDATE part_files
          SET filename = $1, mime_type = $2, data = $3, uploaded_at = now()
          WHERE id = $4
        `, [filename, mimeType, fileBuffer, existingRes.rows[0].id]);
        updatedCount++;
      } else {
        // Insert new photo
        await client.query(`
          INSERT INTO part_files (part_id, file_type, filename, mime_type, data, uploaded_by_user_id)
          VALUES ($1, 'photo', $2, $3, $4, $5)
        `, [targetPart.id, filename, mimeType, fileBuffer, adminUserId]);
        updatedCount++;
      }
    }

    await client.query('COMMIT');
    console.log(`[PHOTO-SYNC] Photo sync completed! Matched: ${matchedCount} photos across ${parts.length} parts (Saved/Updated: ${updatedCount}).`);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('[PHOTO-SYNC] Error during photo sync:', err.message || err);
    throw err;
  } finally {
    client.release();
    if (closePool) {
      await pool.end();
    }
  }
}

if (require.main === module) {
  syncPartPhotos(true).catch(() => process.exit(1));
}

module.exports = { syncPartPhotos };
