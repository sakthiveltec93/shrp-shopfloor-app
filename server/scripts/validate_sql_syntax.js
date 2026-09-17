const fs = require('fs');
const path = require('path');

const sqlPath = path.join(__dirname, '..', 'db', 'migrations', '002_reconcile_erp_masters.sql');
const content = fs.readFileSync(sqlPath, 'utf8');

console.log('Validating SQL migration file...');
console.log('File size:', (content.length / 1024).toFixed(1), 'KB');
console.log('Line count:', content.split('\n').length);

// Check if DO $$ blocks are balanced
const doBlocks = (content.match(/DO \$\$/g) || []).length;
const endBlocks = (content.match(/END \$\$;/g) || []).length;
console.log(`DO $$ blocks: ${doBlocks} | END $$; blocks: ${endBlocks}`);

if (doBlocks !== endBlocks) {
  console.error('ERROR: Unbalanced DO $$ blocks!');
  process.exit(1);
}

console.log('SQL Migration File syntax structure is valid!');
