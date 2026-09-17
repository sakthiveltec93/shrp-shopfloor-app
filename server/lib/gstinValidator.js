/**
 * Indian GSTIN format and standard Modulo 36 checksum validator.
 *
 * Structure (15 characters):
 * - 2 digits: State code (01 - 38, 97, 99, etc.)
 * - 10 chars: PAN of the entity (5 uppercase letters, 4 digits, 1 uppercase letter)
 * - 1 char: Entity code (1-9 or A-Z)
 * - 1 char: Fixed 'Z'
 * - 1 char: Checksum character (0-9, A-Z) computed using standard Mod 36 algorithm.
 */

const GSTIN_CHAR_MAP = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const GSTIN_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

/**
 * Calculates the expected 15th checksum character for a given 14-character GSTIN prefix.
 * @param {string} prefix14 - First 14 characters of the GSTIN
 * @returns {string|null} Checksum character or null if invalid prefix
 */
function calculateGSTINChecksum(prefix14) {
  if (!prefix14 || prefix14.length < 14) return null;
  const chars = prefix14.slice(0, 14).toUpperCase();

  let sum = 0;
  for (let i = 0; i < 14; i++) {
    const char = chars[i];
    const charVal = GSTIN_CHAR_MAP.indexOf(char);
    if (charVal === -1) return null;

    // Weight factor: 1 for odd positions (0-indexed even), 2 for even positions (0-indexed odd)
    const factor = (i % 2 === 0) ? 1 : 2;
    const prod = charVal * factor;
    const quotient = Math.floor(prod / 36);
    const remainder = prod % 36;
    sum += quotient + remainder;
  }

  const checkCode = (36 - (sum % 36)) % 36;
  return GSTIN_CHAR_MAP[checkCode];
}

/**
 * Validates whether a GSTIN has exact 15 characters, matches regex structure,
 * and passes the mathematical checksum verification.
 * @param {string} rawGstin - Input GSTIN string
 * @returns {boolean} True if valid
 */
function isValidGSTIN(rawGstin) {
  if (!rawGstin || typeof rawGstin !== 'string') return false;
  const gstin = rawGstin.trim().toUpperCase();

  if (gstin.length !== 15) return false;
  if (!GSTIN_REGEX.test(gstin)) return false;

  const expectedCheckChar = calculateGSTINChecksum(gstin.slice(0, 14));
  return gstin[14] === expectedCheckChar;
}

module.exports = {
  isValidGSTIN,
  calculateGSTINChecksum,
  GSTIN_REGEX,
  GSTIN_CHAR_MAP,
};
