// Ported from modBagStatus.bas (SHRP Daily_Hourly_production_Sheet_2026.xlsm).
// Same tolerance rules, same status-gate logic. The VBA version pops a
// MsgBox to ask the operator to confirm a near-complete bag; here that
// becomes a `needsConfirmation` flag the API returns, and the client
// re-submits with `confirm: true` once the operator agrees.

const BAG_TOLERANCE_PCT = 0.01;

// Bag completion: 1% of base weight, or 0.3kg floor, whichever is larger.
function isWithinTolerance(remainingWt, baseWt, tolerancePct = BAG_TOLERANCE_PCT) {
  if (baseWt <= 0) return remainingWt <= 0.001;
  const effective = Math.max(baseWt * tolerancePct, 0.3);
  return remainingWt <= effective;
}

// Trimming completion tolerance: 2% or 0.2kg floor, whichever is larger.
function isWithinTrimTolerance(remainingWt, baseWt) {
  if (baseWt <= 0) return remainingWt <= 0.001;
  return remainingWt <= Math.max(baseWt * 0.02, 0.2);
}

// Inspection completion tolerance: 1% or 0.1kg floor, whichever is larger.
function isWithinInspectionTolerance(remainingWt, baseWt) {
  if (baseWt <= 0) return remainingWt <= 0.001;
  return remainingWt <= Math.max(baseWt * 0.01, 0.1);
}

// Is moving from currentStatus to toStatus a legitimate pipeline step,
// given this part's trim/inspection routing requirements?
function isLegitimateStatusAdvance(currentStatus, toStatus, trimReq, inspReq) {
  const cs = (currentStatus || '').toUpperCase().trim();
  switch (toStatus) {
    case 'TRIMMED':
      return cs === 'OPEN' || cs === 'TRIMMED';
    case 'INSPECTED':
      return trimReq ? cs === 'TRIMMED' : (cs === 'OPEN' || cs === 'TRIMMED');
    case 'PACKED':
      if (inspReq) return cs === 'INSPECTED';
      if (trimReq) return cs === 'TRIMMED';
      return cs === 'OPEN';
    default:
      return true;
  }
}

module.exports = {
  BAG_TOLERANCE_PCT,
  isWithinTolerance,
  isWithinTrimTolerance,
  isWithinInspectionTolerance,
  isLegitimateStatusAdvance,
};
