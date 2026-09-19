-- Migration 007: Customer Purchase Order Management + Automotive GST Invoice System
-- Implements Pillar 2.3: PO tracking, invoice generation with GST calculations

BEGIN;

-- ============================================================
-- PURCHASE ORDER TABLES (Customer PO Management)
-- ============================================================

CREATE TABLE IF NOT EXISTS customer_purchase_orders (
  id SERIAL PRIMARY KEY,
  po_number TEXT UNIQUE NOT NULL,
  customer_id INTEGER NOT NULL REFERENCES customers(id),
  po_date DATE NOT NULL,
  delivery_date DATE NOT NULL,
  order_status TEXT NOT NULL DEFAULT 'OPEN' CHECK (order_status IN ('DRAFT', 'OPEN', 'PARTIAL', 'COMPLETED', 'CANCELLED')),
  total_amount NUMERIC(12,2),
  currency TEXT DEFAULT 'INR',
  payment_terms TEXT DEFAULT '30 Days',
  notes TEXT,
  created_by INTEGER NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS po_line_items (
  id SERIAL PRIMARY KEY,
  po_id INTEGER NOT NULL REFERENCES customer_purchase_orders(id) ON DELETE CASCADE,
  part_id INTEGER NOT NULL REFERENCES parts(id),
  qty_ordered INTEGER NOT NULL,
  qty_delivered INTEGER NOT NULL DEFAULT 0,
  unit_price NUMERIC(10,2),
  line_total NUMERIC(12,2),
  delivery_schedule JSONB, -- Array of {date, qty} for staggered deliveries
  remarks TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_po_customer ON customer_purchase_orders(customer_id, order_status);
CREATE INDEX IF NOT EXISTS idx_po_date ON customer_purchase_orders(po_date DESC);
CREATE INDEX IF NOT EXISTS idx_po_line_po ON po_line_items(po_id);

-- ============================================================
-- INVOICING TABLES (Automotive GST Tax Invoices)
-- ============================================================

CREATE TABLE IF NOT EXISTS invoices (
  id SERIAL PRIMARY KEY,
  invoice_number TEXT UNIQUE NOT NULL,
  customer_id INTEGER NOT NULL REFERENCES customers(id),
  po_id INTEGER REFERENCES customer_purchase_orders(id),
  invoice_date DATE NOT NULL,
  due_date DATE,

  -- Amount Breakdown
  sub_total NUMERIC(12,2) NOT NULL, -- Before tax
  sgst_amount NUMERIC(12,2) DEFAULT 0, -- State GST (9%)
  cgst_amount NUMERIC(12,2) DEFAULT 0, -- Central GST (9%)
  igst_amount NUMERIC(12,2) DEFAULT 0, -- Integrated GST (18% if export/inter-state)
  gst_rate NUMERIC(4,2) DEFAULT 18.00, -- GST rate applied

  -- Additional Charges
  freight_charges NUMERIC(10,2) DEFAULT 0,
  packing_charges NUMERIC(10,2) DEFAULT 0,

  -- Totals
  total_amount NUMERIC(12,2) NOT NULL, -- Final amount including tax

  -- Invoice Details
  invoice_status TEXT NOT NULL DEFAULT 'DRAFT' CHECK (invoice_status IN ('DRAFT', 'ISSUED', 'PARTIALLY_PAID', 'PAID', 'CANCELLED')),
  payment_method TEXT, -- NEFT, CHEQUE, CASH, UPI
  payment_reference TEXT,
  payment_date TIMESTAMPTZ,

  -- E-Way Bill (if applicable)
  eway_bill_no TEXT,
  eway_bill_generated_at TIMESTAMPTZ,

  -- Metadata
  notes TEXT,
  created_by INTEGER NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS invoice_line_items (
  id SERIAL PRIMARY KEY,
  invoice_id INTEGER NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  part_id INTEGER NOT NULL REFERENCES parts(id),
  hsn_code TEXT DEFAULT '39269099', -- Plastic articles HSN (as per Automotive)
  qty INTEGER NOT NULL,
  unit_price NUMERIC(10,2) NOT NULL,
  line_amount NUMERIC(12,2) NOT NULL, -- qty * unit_price (before GST)
  remarks TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- INVOICE PAYMENT TRACKING
-- ============================================================

CREATE TABLE IF NOT EXISTS invoice_payments (
  id SERIAL PRIMARY KEY,
  invoice_id INTEGER NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  payment_date DATE NOT NULL,
  amount_paid NUMERIC(12,2) NOT NULL,
  payment_method TEXT,
  reference_number TEXT, -- Cheque/UTR/Ref ID
  remarks TEXT,
  recorded_by INTEGER NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- E-WAY BILL MASTER (for E-Way Bill JSON generation)
-- ============================================================

CREATE TABLE IF NOT EXISTS eway_bill_logs (
  id SERIAL PRIMARY KEY,
  invoice_id INTEGER NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  eway_bill_number TEXT UNIQUE,
  gstin_from TEXT, -- SHRP's GSTIN
  gstin_to TEXT, -- Customer's GSTIN
  vehicle_no TEXT,
  vehicle_type TEXT, -- VEHICLE, SHIP, AIRCRAFT, etc.
  transporter_id TEXT,
  transport_document_no TEXT,
  transport_document_date DATE,

  -- JSON Payload for Government Portal
  eway_json_payload JSONB,

  -- Status
  status TEXT DEFAULT 'GENERATED' CHECK (status IN ('GENERATED', 'SUBMITTED', 'CANCELLED')),
  generated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  submitted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_invoice_customer ON invoices(customer_id, invoice_date DESC);
CREATE INDEX IF NOT EXISTS idx_invoice_po ON invoices(po_id);
CREATE INDEX IF NOT EXISTS idx_invoice_status ON invoices(invoice_status);
CREATE INDEX IF NOT EXISTS idx_invoice_payment ON invoice_payments(invoice_id);
CREATE INDEX IF NOT EXISTS idx_eway_invoice ON eway_bill_logs(invoice_id);

-- ============================================================
-- COMPANY GST & TAX CONFIGURATION
-- ============================================================

ALTER TABLE customers ADD COLUMN IF NOT EXISTS customer_name TEXT;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS customer_code TEXT;

-- Store company's own GST details for invoice generation
CREATE TABLE IF NOT EXISTS company_gst_config (
  id SERIAL PRIMARY KEY,
  company_name TEXT NOT NULL DEFAULT 'SHRP Industries',
  gstin TEXT UNIQUE NOT NULL,
  pan_no TEXT,
  address TEXT,
  city TEXT DEFAULT 'Chennai',
  state TEXT DEFAULT 'Tamil Nadu',
  pincode TEXT,
  phone TEXT,
  email TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

COMMIT;
