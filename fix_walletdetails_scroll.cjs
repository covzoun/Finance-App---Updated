const fs = require('fs');
let content = fs.readFileSync('src/components/WalletDetails.tsx', 'utf8');

// Find the scrollable div
content = content.replace(
  '<div className="flex-1 overflow-y-auto overscroll-contain p-6 space-y-6">',
  '<div className="flex-1 overflow-y-auto overscroll-contain p-6 space-y-6" style={{ overflow: showAddTxModal || showAddCreditModal ? "hidden" : "auto" }}>'
);

fs.writeFileSync('src/components/WalletDetails.tsx', content);
console.log('Fixed WalletDetails scroll lock');
