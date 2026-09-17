const pool = require('./pool');

const DEFAULT_DOCUMENT_SEQUENCES = [
  { document_type: 'INVOICE', type_label: 'Tax Invoice', prefix: 'SHRP-INV-', padding_digits: 4, include_year: true, suffix: '' },
  { document_type: 'DC', type_label: 'Delivery Challan', prefix: 'SHRP-DC-', padding_digits: 4, include_year: true, suffix: '' },
  { document_type: 'RFQ', type_label: 'Request For Quotation', prefix: 'SHRP-RFQ-', padding_digits: 4, include_year: true, suffix: '' },
  { document_type: 'BATCH', type_label: 'Production Batch', prefix: 'SHRP-BAT-', padding_digits: 4, include_year: true, suffix: '' },
  { document_type: 'RM_INWARD', type_label: 'Raw Material Inward (GRN)', prefix: 'SHRP-RMI-', padding_digits: 4, include_year: true, suffix: '' },
  { document_type: 'CUSTOMER', type_label: 'Customer Code', prefix: 'SHRP-CUST-', padding_digits: 3, include_year: false, suffix: '' },
  { document_type: 'SUPPLIER', type_label: 'Supplier Code', prefix: 'SHRP-SUP-', padding_digits: 3, include_year: false, suffix: '' },
  { document_type: 'MOULD', type_label: 'Mould Code', prefix: 'SHRP-MLD-', padding_digits: 3, include_year: false, suffix: '' },
  { document_type: 'MACHINE', type_label: 'Machine Code', prefix: 'SHRP-MCH-', padding_digits: 3, include_year: false, suffix: '' },
  { document_type: 'FPA', type_label: 'First Piece Approval (FPA)', prefix: 'SHRP-FPA-', padding_digits: 4, include_year: true, suffix: '' },
];

async function syncDocSequences() {
  try {
    for (const seq of DEFAULT_DOCUMENT_SEQUENCES) {
      await pool.query(
        `INSERT INTO document_sequences (
           document_type, type_label, prefix, suffix, padding_digits, include_year, current_number, active
         ) VALUES ($1, $2, $3, $4, $5, $6, 0, TRUE)
         ON CONFLICT (document_type) DO UPDATE SET
           type_label = COALESCE(document_sequences.type_label, EXCLUDED.type_label),
           prefix = COALESCE(document_sequences.prefix, EXCLUDED.prefix),
           suffix = COALESCE(document_sequences.suffix, EXCLUDED.suffix),
           padding_digits = COALESCE(document_sequences.padding_digits, EXCLUDED.padding_digits),
           include_year = COALESCE(document_sequences.include_year, EXCLUDED.include_year)`,
        [seq.document_type, seq.type_label, seq.prefix, seq.suffix, seq.padding_digits, seq.include_year]
      );
    }
    console.log('[DOC-SEQUENCES] Default document sequences verified and synced.');
  } catch (err) {
    console.error('[DOC-SEQUENCES] Error syncing document sequences:', err.message || err);
  }
}

module.exports = { syncDocSequences, DEFAULT_DOCUMENT_SEQUENCES };
