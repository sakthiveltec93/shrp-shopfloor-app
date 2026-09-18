const path = require('path');
const XLSX = require('xlsx');

const formFile = path.join(__dirname, '../../FORM ENTRY 26-271.xlsm');
const wb = XLSX.readFile(formFile);
const sheet = wb.Sheets['PRODUCTION_LOG'];
const raw = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });

console.log('Total rows in PRODUCTION_LOG:', raw.length);
console.log('Headers:', raw[0]);

let validTimeCount = 0;
let emptyTimeCount = 0;
let invalidTimeCount = 0;

for (let i = 1; i < raw.length; i++) {
  const r = raw[i];
  const dateVal = r[1];
  const shiftVal = r[2];
  const startVal = r[7];
  const endVal = r[8];

  if (!dateVal) continue;

  const startNum = parseFloat(startVal);
  const endNum = parseFloat(endVal);

  if (!isNaN(startNum) && !isNaN(endNum)) {
    validTimeCount++;
    if (i <= 15 || i >= raw.length - 5) {
      const convertToTimeStr = (num) => {
        const totalMinutes = Math.round(num * 24 * 60);
        const hours = Math.floor(totalMinutes / 60) % 24;
        const mins = totalMinutes % 60;
        const pad = (n) => String(n).padStart(2, '0');
        const h12 = hours % 12 === 0 ? 12 : hours % 12;
        const period = hours >= 12 ? 'PM' : 'AM';
        return `${pad(h12)}:${pad(mins)} ${period} (${pad(hours)}:${pad(mins)})`;
      };
      console.log(`Row ${i} | Date: ${dateVal} | Shift: ${shiftVal} | Start: ${startVal} -> ${convertToTimeStr(startNum)} | End: ${endVal} -> ${convertToTimeStr(endNum)}`);
    }
  } else if (startVal === '' && endVal === '') {
    emptyTimeCount++;
  } else {
    invalidTimeCount++;
    console.log(`Row ${i} has unexpected time format:`, { startVal, endVal });
  }
}

console.log(`\nSummary: Valid times: ${validTimeCount}, Empty: ${emptyTimeCount}, Invalid: ${invalidTimeCount}`);
