const fs = require('fs');

let modal = fs.readFileSync('src/components/AddCreditModal.tsx', 'utf8');

modal = modal.replace(
  /setAmount\(editingDebt\.amount\.toString\(\)\);/g,
  "setAmount(editingDebt.amount.toString().replace(/\\B(?=(\\d{3})+(?!\\d))/g, ','));"
);

fs.writeFileSync('src/components/AddCreditModal.tsx', modal);
