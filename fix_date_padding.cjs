const fs = require('fs');

function fixPadding(file) {
  if (!fs.existsSync(file)) return;
  let content = fs.readFileSync(file, 'utf8');
  // Usually it says pr-10, change it to pr-12 or pr-14 or remove it and add a wrapper?
  // Native calendar icon is placed on the far right. pr-14 is safer.
  content = content.replace(/pr-10 py-2\.5 text-xs focus:outline-none/g, 'pr-12 py-2.5 text-xs focus:outline-none');
  fs.writeFileSync(file, content);
}

fixPadding('src/components/AddTransactionModal.tsx');
fixPadding('src/components/AddDebtModal.tsx');
