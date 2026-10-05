const fs = require('fs');

function fixPadding(file) {
  if (!fs.existsSync(file)) return;
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/pr-12 py-2\.5/g, 'pr-14 py-2.5');
  fs.writeFileSync(file, content);
}

fixPadding('src/components/AddTransactionModal.tsx');
fixPadding('src/components/AddDebtModal.tsx');
