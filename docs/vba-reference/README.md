# VBA Reference — Daily_Hourly_production_Sheet_2026.xlsm

Full source of all 46 non-empty VBA modules/forms from the original workbook,
extracted with `oletools.olevba` on 2026-09-09. Kept here as the source of
truth for porting the remaining functionality into the PWA.

The 45 empty per-sheet code-behind modules (`Sheet1.cls` ... `Sheet45.cls`,
`ThisWorkbook.cls`) are not included — all real logic lives in the standalone
modules/forms below.

## Ported into the PWA already

Logic in these was read and reimplemented (not copy-pasted — VBA doesn't
translate directly) in `server/lib/bagStatus.js` and `server/routes/bags.js`:

- `Moddeclaration.bas` — sheet/column mapping reference
- `modBagStatus.bas` — tolerance math + status-advance gating (ported faithfully, including the exact 1%/0.3kg, 2%/0.2kg, 1%/0.1kg tolerance floors)
- `modFIFOBagPicker.bas` — FIFO bag selection per stage
- `modistrimrequired.bas`, `modRouting.bas` — part routing flags (now `parts.trim_required` etc.)
- `Modbagentry.bas` — bag code numbering scheme (`GetNextBagNo`) — the rest of this module (production-weight reconciliation, batch total tracking) is NOT ported yet
- `frmbagentry.frm`, `frmTrimming.frm`, `frmInspection.frm`, `Frmpacking.frm` — field layout referenced when building the React forms, not the VBA event code itself

## NOT yet ported — still just reference source here

- `modRework.bas` — rework creation/tracking, outstanding rework by bag
- `modpacking.bas` — packing balance pool, extra-cover detection, std pack qty variance logging (the PWA's Packing page does plain packed-qty/weight only, no pooling)
- `modQualityGates.bas`, `frmSetupApproval.frm`, `modSetupApprovalPDF.bas` — setup approval consumption gate, last-shot-inspection gate, process parameters, dimension standards, PDF generation (the PWA's Mould Setup/Approvals covers the *assignment* approval workflow only, not these quality gates)
- `modLabelPrint.bas`, `modWIPLabel.bas`, `modLabel12Up.bas`, `Modlabelprint1.bas`, `Modqrcode.bas`, `Modbuildqrdata.bas` — label printing and QR code generation
- `modDB.bas` — connection layer to a separate `SHRP_Production.accdb` Access database over a network share (`\\Shrp-pc\shrp daily update\`) — the PWA uses its own Postgres database instead; if there's data in that Access DB you need pulled in, it needs a one-off import script
- `modMachineMasterStats.bas`, `modOperatorRate.bas`, `modProductionSummarySheet.bas` — machine/operator statistics and summary sheet generation
- `modMigrateMasterData.bas` — one-off migration tooling from the old sheet layout
- `modTransactionEngine.bas`, `modBatchValidation.bas` — transaction/batch validation helpers
- `modInspectionRejects.bas`, `modRejects.bas` — reject listbox/disposition helpers (the PWA's Inspection page has a simpler single reject-weight + reason field instead)
- `modTrimRunner.bas` — runner-bag-specific weight calculations
- `modSheetNavigation.bas`, `modFormHelpers.bas`, `modClearFilterHelper.bas`, `modAddMachineStatus.bas` — Excel UI plumbing, not applicable to a web app
- `frmProduction.frm`, `frmDashboard.frm` — VBA form layouts for production entry / dashboard (the PWA's own Production Entry and Home pages were built independently, not from these)
- `modnextpacketno.bas`, `Modgetinspector.bas`, `modramaininginspectionweight.bas`, `Module2.bas`, `Module3.bas`, `Module4.bas`, `Module8.bas` — smaller helpers, not yet reviewed in detail
