// SHRP shift timings: Shift A 09:30-21:30 IST, Shift B 21:30-09:30 IST.
// The server runs in UTC (Railway's default container timezone), so every
// calculation here explicitly converts to IST (UTC+5:30) rather than
// trusting the server's local clock - using now.getHours() directly was
// the bug that showed the wrong shift/hour to operators.

const IST_OFFSET_MINUTES = 5 * 60 + 30;

function istMinutesOfDay(now = new Date()) {
  const utcMinutes = now.getUTCHours() * 60 + now.getUTCMinutes();
  return (utcMinutes + IST_OFFSET_MINUTES) % (24 * 60);
}

function currentShift(now = new Date()) {
  const minutes = istMinutesOfDay(now);
  const start = 9 * 60 + 30; // 09:30 IST
  const end = 21 * 60 + 30; // 21:30 IST
  return minutes >= start && minutes < end ? 'A' : 'B';
}

// Which shift-relative hour slot (1-12) a given time falls into
function hourSlot(now = new Date()) {
  const minutes = istMinutesOfDay(now);
  const shift = currentShift(now);
  const shiftStart = shift === 'A' ? 9 * 60 + 30 : 21 * 60 + 30;
  let diff = minutes - shiftStart;
  if (diff < 0) diff += 24 * 60;
  return Math.min(12, Math.floor(diff / 60) + 1);
}

// Today's calendar date in IST as YYYY-MM-DD - used instead of the
// server's own UTC date so entries near midnight IST land on the
// correct day (IST midnight is 18:30 UTC the previous day).
function istDateString(now = new Date()) {
  const istMillis = now.getTime() + IST_OFFSET_MINUTES * 60 * 1000;
  const ist = new Date(istMillis);
  const yyyy = ist.getUTCFullYear();
  const mm = String(ist.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(ist.getUTCDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

module.exports = { currentShift, hourSlot, istDateString };
