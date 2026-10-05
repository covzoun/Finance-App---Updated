const fs = require('fs');
let modal = fs.readFileSync('src/components/AddCreditModal.tsx', 'utf8');

modal = modal.replace(
  /\{w\.name\} \(\{w\.currency\} \{w\.balance\.toFixed\(2\)\}\)/g,
  '{w.name} ({formatCurrency(w.balance, w.currency)})'
);

fs.writeFileSync('src/components/AddCreditModal.tsx', modal);
