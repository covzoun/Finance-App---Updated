const fs = require('fs');
const files = [
  'src/App.tsx',
  'src/components/TransactionItem.tsx',
  'src/components/WalletDetails.tsx',
  'src/components/OverviewCharts.tsx',
  'src/components/CreditsList.tsx',
  'src/components/WalletCard.tsx',
];

for (const file of files) {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(/Intl\.NumberFormat\('en-PH'/g, 'Intl.NumberFormat(\'en-US\'');
    fs.writeFileSync(file, content);
  }
}
