const sharp = require('sharp');

/**
 * Optimizes an image buffer if the MIME type is an image.
 * Resizes max dimension to 1600px (inside fit, without enlargement),
 * auto-rotates by EXIF, and re-encodes as JPEG with 75% quality.
 *
 * @param {Buffer} inputBuffer - The original raw byte buffer
 * @param {string} mimeType - e.g. 'image/png', 'image/jpeg', 'image/webp'
 * @returns {Promise<{ buffer: Buffer, mime_type: string, compressed: boolean, originalSize: number, newSize: number }>}
 */
async function optimizeImage(inputBuffer, mimeType) {
  const originalSize = inputBuffer ? inputBuffer.length : 0;
  if (!inputBuffer || !mimeType || !mimeType.startsWith('image/')) {
    return { buffer: inputBuffer, mime_type: mimeType, compressed: false, originalSize, newSize: originalSize };
  }

  // SVGs are vector XML and do not need JPEG rasterization
  if (mimeType === 'image/svg+xml') {
    return { buffer: inputBuffer, mime_type: mimeType, compressed: false, originalSize, newSize: originalSize };
  }

  try {
    const compressedBuffer = await sharp(inputBuffer)
      .rotate() // auto-orient from EXIF orientation
      .resize({
        width: 1600,
        height: 1600,
        fit: 'inside',
        withoutEnlargement: true,
      })
      .jpeg({
        quality: 75,
        mozjpeg: true,
      })
      .toBuffer();

    return {
      buffer: compressedBuffer,
      mime_type: 'image/jpeg',
      compressed: true,
      originalSize,
      newSize: compressedBuffer.length,
    };
  } catch (err) {
    console.warn('[IMAGE-OPTIMIZE] Could not compress image, keeping original:', err.message);
    return { buffer: inputBuffer, mime_type: mimeType, compressed: false, originalSize, newSize: originalSize };
  }
}

module.exports = { optimizeImage };
