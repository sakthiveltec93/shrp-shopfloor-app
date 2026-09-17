/**
 * Indian GSTIN format and standard Modulo 36 checksum validator for client-side.
 */

const GSTIN_CHAR_MAP = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const GSTIN_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

export function calculateGSTINChecksum(prefix14) {
  if (!prefix14 || prefix14.length < 14) return null;
  const chars = prefix14.slice(0, 14).toUpperCase();

  let sum = 0;
  for (let i = 0; i < 14; i++) {
    const char = chars[i];
    const charVal = GSTIN_CHAR_MAP.indexOf(char);
    if (charVal === -1) return null;

    const factor = (i % 2 === 0) ? 1 : 2;
    const prod = charVal * factor;
    const quotient = Math.floor(prod / 36);
    const remainder = prod % 36;
    sum += quotient + remainder;
  }

  const checkCode = (36 - (sum % 36)) % 36;
  return GSTIN_CHAR_MAP[checkCode];
}

export function isValidGSTIN(rawGstin) {
  if (!rawGstin || typeof rawGstin !== 'string') return false;
  const gstin = rawGstin.trim().toUpperCase();

  if (gstin.length !== 15) return false;
  if (!GSTIN_REGEX.test(gstin)) return false;

  const expectedCheckChar = calculateGSTINChecksum(gstin.slice(0, 14));
  return gstin[14] === expectedCheckChar;
}

export function extractPanFromGSTIN(gstin) {
  if (!gstin || gstin.length < 12) return '';
  return gstin.trim().slice(2, 12).toUpperCase();
}
