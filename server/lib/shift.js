// SHRP shift timings: Shift A 09:30-21:30, Shift B 21:30-09:30
function currentShift(now = new Date()) {
  const minutes = now.getHours() * 60 + now.getMinutes();
  const start = 9 * 60 + 30; // 09:30
  const end = 21 * 60 + 30; // 21:30
  return minutes >= start && minutes < end ? 'A' : 'B';
}

// Which shift-relative hour slot (1-12) a given time falls into
function hourSlot(now = new Date()) {
  const minutes = now.getHours() * 60 + now.getMinutes();
  const shift = currentShift(now);
  const shiftStart = shift === 'A' ? 9 * 60 + 30 : 21 * 60 + 30;
  let diff = minutes - shiftStart;
  if (diff < 0) diff += 24 * 60;
  return Math.min(12, Math.floor(diff / 60) + 1);
}

module.exports = { currentShift, hourSlot };
