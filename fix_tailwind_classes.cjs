const fs = require('fs');

const files = [
  'src/App.tsx',
  'src/components/AddCreditModal.tsx',
  'src/components/AddTransactionModal.tsx',
  'src/components/CreditsList.tsx',
  'src/components/WalletDetails.tsx',
  'src/components/TransactionItem.tsx',
];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/bg-neutral-950/g, 'bg-neutral-900');
  content = content.replace(/border-neutral-900/g, 'border-neutral-800');
  fs.writeFileSync(file, content);
}
