const { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');

const accountId = process.env.R2_ACCOUNT_ID;
const accessKeyId = process.env.R2_ACCESS_KEY_ID;
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
const bucketName = process.env.R2_BUCKET_NAME;

let s3Client = null;

function isR2Configured() {
  return Boolean(accountId && accessKeyId && secretAccessKey && bucketName);
}

function getS3Client() {
  if (s3Client) return s3Client;
  if (!isR2Configured()) {
    return null;
  }
  s3Client = new S3Client({
    region: 'auto',
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });
  return s3Client;
}

/**
 * Upload a binary buffer to Cloudflare R2
 * @param {string} key - Object key path (e.g. part-files/12/photo.jpg)
 * @param {Buffer} buffer - Binary data buffer
 * @param {string} mimeType - Content type header
 * @returns {Promise<{ key: string, bucket: string }>}
 */
async function uploadFile(key, buffer, mimeType = 'application/octet-stream') {
  const client = getS3Client();
  if (!client || !bucketName) {
    throw new Error('Cloudflare R2 is not configured on this environment.');
  }

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    Body: buffer,
    ContentType: mimeType,
  });

  await client.send(command);
  return { key, bucket: bucketName };
}

/**
 * Retrieve a file from Cloudflare R2 as a Buffer
 * @param {string} key - Object key path
 * @returns {Promise<{ buffer: Buffer, contentType: string, contentLength: number }>}
 */
async function getFile(key) {
  const client = getS3Client();
  if (!client || !bucketName) {
    throw new Error('Cloudflare R2 is not configured on this environment.');
  }

  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: key,
  });

  const response = await client.send(command);
  const chunks = [];
  for await (const chunk of response.Body) {
    chunks.push(chunk);
  }

  return {
    buffer: Buffer.concat(chunks),
    contentType: response.ContentType,
    contentLength: response.ContentLength,
  };
}

/**
 * Delete an object from Cloudflare R2
 * @param {string} key - Object key path
 */
async function deleteFile(key) {
  const client = getS3Client();
  if (!client || !bucketName || !key) return;

  const command = new DeleteObjectCommand({
    Bucket: bucketName,
    Key: key,
  });

  await client.send(command);
}

module.exports = {
  isR2Configured,
  getS3Client,
  uploadFile,
  getFile,
  deleteFile,
  bucketName,
};
