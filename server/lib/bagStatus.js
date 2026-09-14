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
  if (cs === 'HOLD' || cs === 'SCRAPPED') return false; // Must be released from hold first

  switch (toStatus) {
    case 'PARTIAL_TRIM':
    case 'TRIMMED':
      return cs === 'OPEN' || cs === 'PARTIAL_TRIM' || cs === 'TRIMMED';
    case 'PARTIAL_INSPECT':
    case 'INSPECTED':
      return trimReq
        ? (cs === 'TRIMMED' || cs === 'PARTIAL_INSPECT' || cs === 'INSPECTED')
        : (cs === 'OPEN' || cs === 'PARTIAL_INSPECT' || cs === 'INSPECTED');
    case 'PACKED':
      if (inspReq) return cs === 'INSPECTED' || cs === 'PACKED';
      if (trimReq) return cs === 'TRIMMED' || cs === 'PACKED';
      return cs === 'OPEN' || cs === 'PACKED';
    case 'DISPATCHED':
      return cs === 'PACKED';
    case 'HOLD':
      return true;
    default:
      return true;
  }
}

// 3-Tier Inspection Tolerance Rule per SHRP specification:
// Tier 1: <= 1% difference -> Direct Auto-convert
// Tier 2: > 1% and <= 2% (or <= 200g) -> Requires Yes/No Confirmation
// Tier 3: > 2% or > 200g -> Requires Mandatory Remarks
function getInspectionToleranceTier(inspectedWt, expectedWt) {
  if (!expectedWt || expectedWt <= 0) return { tier: 'AUTO', diffKg: 0, diffPct: 0 };
  const diffKg = Number((inspectedWt - expectedWt).toFixed(3));
  const absDiffKg = Math.abs(diffKg);
  const diffPct = Number(((absDiffKg / expectedWt) * 100).toFixed(2));

  if (diffPct <= 1.0) {
    return { tier: 'AUTO', diffKg, diffPct };
  } else if (diffPct <= 2.0 || absDiffKg <= 0.200) {
    return { tier: 'CONFIRM', diffKg, diffPct, message: `Weight variance is ${absDiffKg.toFixed(3)} kg (${diffPct}%). Do you want to confirm?` };
  } else {
    return { tier: 'REMARKS_REQUIRED', diffKg, diffPct, message: `Excess weight variance of ${absDiffKg.toFixed(3)} kg (${diffPct}%). Mandatory remarks required.` };
  }
}

module.exports = {
  BAG_TOLERANCE_PCT,
  isWithinTolerance,
  isWithinTrimTolerance,
  isWithinInspectionTolerance,
  isLegitimateStatusAdvance,
  getInspectionToleranceTier,
};
