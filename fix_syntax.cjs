const fs = require('fs');

let modal = fs.readFileSync('src/components/AddTransactionModal.tsx', 'utf8');

modal = modal.replace(
  /<div className="relative"><select value=\{isRecurring\} === false \? 'none' : isRecurring === true \? 'monthly' : isRecurring\}/g,
  '<div className="relative"><select value={isRecurring === false ? \'none\' : isRecurring === true ? \'monthly\' : isRecurring}'
);

fs.writeFileSync('src/components/AddTransactionModal.tsx', modal);
