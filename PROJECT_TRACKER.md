# 🏭 SHRP MES & IATF-16949 ERP — Master Project Tracker & Daily Standup

> **Strategic Goal**: **Zero-Audit Preparation** for IATF 16949 certification + Complete Tier-2 Automotive Operations ERP.  
> **Last Updated**: 18-Sep-2026  
> **Production Branch**: `main` (Live on Railway)  
> **Latest Deployment**: Dispatch 3-Subtabs (Ready | Completed | Gate Pass), Pillar 1 @ 100%, Customer consolidation, FPA two-tier gates active

---

## 📊 High-Level Implementation Dashboard

| Pillar | Focus Area | Completion | Target Clauses | Status |
|---|---|:---:|---|:---:|
| **Pillar 1** | **IATF Shopfloor Quality & MES** | **100%** | Clauses 7.1.5, 7.2, 8.5.1, 8.5.2 | ✅ Complete |
| **Pillar 2** | **Supply Chain, Inward Stores & Logistics** | **50%** | Clause 8.4.2 (Supplier Quality) | 🟡 In Progress |
| **Pillar 3** | **HR, Attendance & Operator Performance** | **60%** | Clause 7.2 (Competence & Training) | 🟡 In Progress |
| **Pillar 4** | **Accounts, Finance & "Zero-Audit" Dossier** | **15%** | Statutory, GSTR-1, Financials | 🔴 Upcoming |

---

## 🏛️ Pillar 1: IATF Core Shopfloor Quality & MES

### 1.1 Traceability & Stage Gating (Clause 8.5.2 / 8.5.2.1)
- [x] **Strict Sequential Stage Gating**: Moulding $\to$ Trim $\to$ Inspect $\to$ Pack $\to$ Dispatch.
- [x] **Part Master Trim Routing**: 37 Parts strictly require Trimming before Inspection/Packing.
- [x] **Dynamic Runner Detection**: `weighed_with_runner = TRUE` dynamically enforces trimming.
- [x] **3-Subtab Stage Interface**: `🟢 Ready Bags` (FIFO), `✅ Completed Bags` (History), `🛑 Quarantined / HOLD`.
- [x] **Supervisor Quarantine & Release**: Secure 4-digit supervisor PIN release with audit remarks.
- [x] **Universal Bag Status Logging**: Full audit trail of status transitions.

### 1.2 Total Productive Maintenance (TPM) & Shot Life (Clause 8.5.1.5)
- [x] **Machine & Mould Master Register**: Linkages of 77 parts to 73 mould tools and 10 injection moulding machines.
- [x] **Breakdown Logging API**: Machine breakdown capture with downtime minutes and reasons.
- [x] **Live Mould Shot Accumulator**: Automatically sum shot counts from approved production entries (cumulative_shots, shots_since_pm tracked per mould).
- [x] **Automated PM Shot-Life Alerts**:
  - [x] Configurable PM interval (default 20,000 shots, customizable per mould).
  - [x] mould_pm_overdue flag in FPA workflow warns when shots_since_pm >= pm_interval_shots.
  - [x] Migration script auto-accumulates historical shots and recomputes PM status.
- [ ] **MTBF & MTTR Charts**: Automated calculation of Mean Time Between Failures and Mean Time To Repair.

### 1.3 First-Piece Approval (FPA) & First-Off Sign-Off Form (Clause 8.5.1.1)
- [x] **Mould Setup & Approval Workflow**: Request mould change $\to$ Supervisor approval.
- [x] **Two-Tier FPA System** (fpa_submissions table):
  - [x] Tier 1: Visual Approval by supervisor (visual_approved_at, instant access to first 2 entries).
  - [x] Tier 2: Full FPA Approval (escalation after 2 entries or deadline expiry).
  - [x] Hard gate on production entry logging (blocks entry until FPA approved).
  - [x] Gate moved from machine start to first production entry (allows machine setup without FPA).
  - [x] Mould PM overdue warning integrated into FPA approval checks.
- [x] **First-Off Sign-Off Form & FPA Two-Tier Gate System**:
  - [x] **Unified Gate Logic** (reuses fpa_submissions table with submission_type field):
    - [x] `submission_type = 'FPA'` → Full First-Piece Approval workflow (all cavities)
    - [x] `submission_type = 'FIRST_OFF_SIGNOFF'` → First-Off Sign-Off workflow (5 samples)
    - [x] **Entry 1 Gate**: Requires `approval_status = 'VISUAL_APPROVED'` (either type)
    - [x] **Entry 2+ Gate**: Requires `approval_status = 'APPROVED'` (full approval)
    - [x] Same tier-2 logic: if visual only after 2nd entry or deadline expires → block with "Full approval required"
  - [x] **4-Section FpaModal Workflow**:
    - [x] **Section A**: Raw Material & Lot Verification (resin grade, lot traceability, regrind %).
    - [x] **Section B**: Visual Inspection (7-point defect checklist: flash, sink marks, short shot, flow lines, burn marks, color, finish).
    - [x] **Section C**: Process Parameters with Min/Max Ranges (barrel Z1-Z4, nozzle, pressures, cooling time).
    - [x] **Section D**: Multi-Cavity Dimensional Inspection (cavity-wise readings, auto PASS/FAIL, gauge assignment).
    - [x] Dual-mode: "First-Off (5 samples)" vs "Full FPA (all cavities)"
    - [x] Cavity sampling guide: "Measure cavities 1, 7, 13, 19, and last cavity" for first-off
  - [x] **Data Storage** (fpa_submissions table):
    - [x] JSONB fields: process_parameters, visual_checks, dimension_readings (shared structure)
    - [x] submission_type column for compliance tracking
    - [x] PDF report auto-generates all sections (A-F) for audit trail & digital filing

### 1.4 Gauge & Instrument Calibration Vault (Clause 7.1.5.1.1)
- [x] **Master Gauge Register**: 25 verified ERP gauges (Vernier calipers, micrometers, height gauges, weighing scales, pyrometers, thermometers, etc.).
- [x] **Calibration Tracking**: last_calibrated_at, calibration_interval_days, calibration_cert_no per gauge.
- [x] **Calibration Status API**: `/gauges/calibration-summary` endpoint with live overdue detection.
- [ ] **Calibration Calendar & 15-Day Alert**: Banner notification for gauges nearing calibration expiry.
- [ ] **Certificate PDF Vault**: Upload & view calibration certificates for audit inspection.

### 1.5 Operator Skill Matrix (Clause 7.2)
- [ ] **Competency Level Matrix (L1–L4)**:
  - L1: Trainee (Supervision required)
  - L2: Standard Operator
  - L3: Independent / Troubleshooter
  - L4: Setup Approver / Trainer
- [ ] **Machine/Part Qualification Matrix**: Restrict or validate operator assignment based on certified skill levels.

---

## 🚚 Pillar 2: Supply Chain, Stores & Logistics

### 2.1 Raw Material Store & Inward GRN (Clause 8.4.2.1)
- [x] **Raw Material Inward Register**: `/rm-inward` capturing supplier, grade, bag quantity, and weight.
- [x] **Stock & WIP Registers**: `/rm-stock` showing live polymer raw material inventory.
- [x] **Part BOM / Resin Recipes**: `/recipes` defining polymer grade, masterbatch %, and regrind ratio.
- [ ] **Mandatory CoA Quality Gate**: Attach manufacturer Certificate of Analysis & record MFI/Moisture before GRN release.
- [ ] **Resin Lot-to-Bag Linkage**: Issue specific raw material lots to machines so every finished bag has raw material batch traceability.

### 2.2 Customer Master & Data Quality
- [x] **Customer Duplicate Consolidation**: Eliminated 5 duplicate customer entries (CUST-002, CUST-001, CUST-005, CUST-010, SHRP/CUS-002).
- [x] **Sequential Customer Code Renumbering**: Standardized to `SHRP/C-01` through `SHRP/C-08` format (clean, sequential).
- [x] **Data Migration**: Migrated all parts & dispatch references from deleted duplicates to master records.
- [x] **Audit Trail**: Logged all deletions with consolidation reasons in deletion_audit_log.

### 2.3 Customer PO, Invoicing & Logistics
- [ ] **Customer Purchase Order Management**: Track open PO quantities & delivery schedules (Hanon, Avadh, Wonjin, etc.).
- [ ] **Automotive GST Tax Invoice Generation**: HSN 39269099, CGST/SGST/IGST, P&F charges, and PDF invoice printing.
- [ ] **E-Way Bill Integration**: Generate standardized JSON for government E-Way bill portal.
- [x] **Dispatch Screen**: Basic dispatch entry with vehicle and invoice recording.
- [ ] **Dispatch 3-Subtab View & Gate Pass**: Upgrade `/dispatch` with `Ready for Dispatch` and `Completed Dispatches` tabs + gate pass slips.

---

## 👥 Pillar 3: HR, Attendance & Operator Performance

### 3.1 Attendance & Geofencing
- [x] **GPS Geofenced Check-In / Check-Out**: Enforce physical presence within factory radius.
- [x] **Live Header Attendance Indicator**: Shows check-in time and geofence verification in navigation bar.
- [x] **Daily Attendance Roster**: Supervisor view of on-duty workforce per shift.

### 3.2 Operator Productivity & Performance
- [x] **Live Hourly Efficiency & Target Calculations**: Dynamic cycle-time based output calculation on Production Entry.
- [x] **Shift Log & Operator 360**: Full view of output, rejects, and downtime per operator.
- [ ] **Monthly Operator Leaderboard**: Gamified rankings based on productivity %, low scrap rate %, and punctuality.

### 3.3 Payroll Engine
- [ ] **Automated Wage Calculation**: Computed from GPS-verified shift hours.
- [ ] **Overtime (OT) & Shift Allowance Calculator**.
- [ ] **Printable Monthly Payslips (PDF)**.

---

## 💰 Pillar 4: Accounts, Finance & Audit "Zero Prep"

### 4.1 Daily Expenses & Petty Cash
- [ ] **Mobile Expense Claim**: Photo upload of maintenance receipts, fuel, consumable bills from phone camera.
- [ ] **Multi-Level Approval**: Staff submits $\to$ Supervisor/Admin approves $\to$ Accounts settles.

### 4.2 Bank Reconciliation & Commercial Receivables
- [ ] **Customer Remittance Advice Matching**: Link incoming payments to open invoices.
- [ ] **Accounts Receivable (AR) Aging**: 0–30, 31–60, 60+ days overdue analysis.

### 4.3 "Auditor Mode" — 1-Click Zero-Prep Dossier
- [ ] **1-Click IATF Audit Export**: Single button to generate a complete digital audit binder containing:
  - Calibration records for gauges used in the period.
  - Mould preventive maintenance logs & shot history.
  - First-piece inspection sign-offs.
  - Forward & backward lot traceability reports for any audited bag.
  - Training & skill matrix records.

---

## 📅 Daily Action Checklist & Next Sprints

### ✅ Pillar 1 Complete: IATF Shopfloor Quality & MES — 100% Complete
- [x] **Task 1**: Build **Live Mould Shot Counter & PM Alerts** ✅ (cumulative_shots & shots_since_pm tracked, PM overdue flag).
- [x] **Task 2**: Build **First-Piece Approval Two-Tier System** ✅ (Visual + Full approval gates on entries).
- [x] **Task 3**: Build **Gauge & Instrument Calibration Vault** ✅ (25 gauges with calibration tracking).
- [x] **Task 4**: Add **First-Off Sign-Off Form** ✅ (4-section form: material, visual, process params, 5-sample dimensions).
- [x] **Task 5**: Implement **Unified Two-Tier Gate** ✅ (FPA + First-Off both use same entry gates: VISUAL for #1, APPROVED for #2+).
- [x] **Task 6**: Upgrade **Dispatch Screen** to 3-Subtabs ✅ (Ready for Dispatch | Completed Dispatches | Gate Pass Slips).

---

*This document is version-controlled and updated continuously after every feature implementation and deployment.*
