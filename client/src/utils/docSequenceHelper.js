/**
 * Helper for generating sensible default formatting suggestions
 * and formatted document numbers for SHRP document types.
 */

export function getSuggestedDocFormat(rawName) {
  if (!rawName || !rawName.trim()) {
    return {
      prefix: 'SHRP-',
      padding_digits: 4,
      include_year: true,
      preview: `SHRP-${new Date().getFullYear()}-0001`,
    };
  }

  const clean = rawName.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');

  let shortCode = '';
  if (clean.length <= 3) {
    shortCode = clean;
  } else if (clean.length === 4) {
    shortCode = clean;
  } else {
    const customCodes = {
      INVOICE: 'INV',
      CUSTOMER: 'CUST',
      SUPPLIER: 'SUP',
      MACHINE: 'MCH',
      MOULD: 'MLD',
      MOLD: 'MLD',
      BATCH: 'BAT',
      QUOTATION: 'RFQ',
      PURCHASEORDER: 'PO',
      DELIVERYCHALLAN: 'DC',
      RMINWARD: 'RMI',
      DISPATCH: 'DISP',
      INSPECTION: 'INSP',
      REJECTION: 'REJ',
      GAUGE: 'GAU',
    };
    shortCode = customCodes[clean] || clean.slice(0, Math.min(clean.length, 4));
  }

  const prefix = `SHRP-${shortCode}-`;

  // Determine low-volume persistent master vs high-volume transactional
  const masterKeywords = ['CUSTOMER', 'CUST', 'SUPPLIER', 'SUPP', 'SUP', 'MOULD', 'MOLD', 'MACHINE', 'MACH', 'GAUGE', 'TOOL', 'USER', 'OPERATOR', 'EMPLOYEE', 'ASSET'];
  const isMaster = masterKeywords.some((kw) => clean.includes(kw));

  const padding_digits = isMaster ? 3 : 4;
  const include_year = !isMaster;

  const currentYear = new Date().getFullYear();
  const sampleNum = 1;
  const paddedNum = String(sampleNum).padStart(padding_digits, '0');
  const preview = include_year
    ? `${prefix}${currentYear}-${paddedNum}`
    : `${prefix}${paddedNum}`;

  return {
    prefix,
    padding_digits,
    include_year,
    preview,
  };
}

export function formatDocumentNumber({ prefix = 'SHRP-', padding_digits = 4, include_year = false, suffix = '', number = 1, year = new Date().getFullYear() }) {
  const padded = String(Math.max(1, Number(number) || 1)).padStart(Math.max(1, Number(padding_digits) || 4), '0');
  const cleanPrefix = prefix || '';
  const cleanSuffix = suffix || '';
  if (include_year) {
    return `${cleanPrefix}${year}-${padded}${cleanSuffix}`;
  }
  return `${cleanPrefix}${padded}${cleanSuffix}`;
}
