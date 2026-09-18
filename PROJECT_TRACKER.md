# 🏭 SHRP MES & IATF-16949 ERP — Master Project Tracker & Daily Standup

> **Strategic Goal**: **Zero-Audit Preparation** for IATF 16949 certification + Complete Tier-2 Automotive Operations ERP.  
> **Last Updated**: 18-Sep-2026  
> **Production Branch**: `main` (Live on Railway)  
> **Latest Deployment**: FPA two-tier gates, live shot counters, PM alerts, gauge calibration vault active

---

## 📊 High-Level Implementation Dashboard

| Pillar | Focus Area | Completion | Target Clauses | Status |
|---|---|:---:|---|:---:|
| **Pillar 1** | **IATF Shopfloor Quality & MES** | **85%** | Clauses 7.1.5, 7.2, 8.5.1, 8.5.2 | 🟡 Active Sprint |
| **Pillar 2** | **Supply Chain, Inward Stores & Logistics** | **45%** | Clause 8.4.2 (Supplier Quality) | 🟡 In Progress |
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
- [x] **First-Off Sign-Off Form** (FpaModal component with 4-section workflow):
  - [x] **Section A**: Raw Material & Lot Verification (resin grade, lot traceability, regrind %).
  - [x] **Section B**: Visual Inspection (7-point defect checklist with Pass/Fail checkboxes).
  - [x] **Section C**: Process Parameters with Min/Max Ranges:
    - [x] Barrel Zone Temps (Z1-Z4): 180-240°C to 190-250°C
    - [x] Nozzle Temp: 210-270°C
    - [x] Injection Pressure: 500-1200 bar (with holding pressure 300-800 bar)
    - [x] Cooling Time: 5-30 seconds
    - [x] Multi-stage injection support (all parameters tracked in JSONB).
  - [x] **Section D**: Multi-Cavity Dimensional Inspection:
    - [x] Critical dimension specs from Part Master (Nominal, LSL, USL per dimension).
    - [x] Cavity-wise readings with auto PASS/FAIL detection based on tolerance.
    - [x] Gauge code assignment per dimension for traceability.
  - [x] Stored in fpa_submissions JSONB fields: process_parameters, visual_checks, dimension_readings.
  - [x] PDF report auto-generates all sections (Section A-F) for audit trail & digital filing.

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

### 2.2 Customer PO, Invoicing & Logistics
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

### 🟢 Current Sprint: Quality & Maintenance Automation — 80% Complete
- [x] **Task 1**: Build **Live Mould Shot Counter & PM Alerts** ✅ (cumulative_shots & shots_since_pm tracked, PM overdue flag in FPA workflow).
- [x] **Task 2**: Build **First-Piece Approval Two-Tier System** ✅ (Visual + Full approval gates, moved from machine start to production entry).
- [x] **Task 3**: Build **Gauge & Instrument Calibration Vault** ✅ (25 gauges tracked, calibration_status API active).
- [x] **Task 4**: Add **First-Off Sign-Off Form** ✅ (4-section FpaModal: material, visual, process params, dimensional checks).
- [ ] **Task 5**: Upgrade **Dispatch Screen** to 3-Subtabs (`Ready to Ship`, `Dispatched History`).

---

*This document is version-controlled and updated continuously after every feature implementation and deployment.*
