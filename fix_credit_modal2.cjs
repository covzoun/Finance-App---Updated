const fs = require('fs');
let modal = fs.readFileSync('src/components/AddCreditModal.tsx', 'utf8');

// Due date padding
modal = modal.replace(
  /className=\{\`w-full rounded-xl border px-4 pr-14 py-2\.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 \$\{/g,
  'className={`w-full rounded-xl border pl-3 pr-8 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 ${'
);

// Currency dropdown padding
modal = modal.replace(
  /className=\{\`rounded-xl border px-3 py-2\.5 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-blue-500 \$\{/g,
  'className={`rounded-xl border pl-3 pr-8 py-2.5 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-blue-500 ${'
);

// We need formatCurrency helper
const formatHelper = `
  const formatCurrency = (value: number, currencyCode?: 'PHP' | 'USD') => {
    return new Intl.NumberFormat(currencyCode === 'USD' ? 'en-US' : 'en-US', {
      style: 'currency',
      currency: currencyCode || 'PHP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(value);
  };
`;

if (!modal.includes('formatCurrency(')) {
  modal = modal.replace(
    '  const handleSubmit = ',
    formatHelper + '\n  const handleSubmit = '
  );
}

// Update the wallet options mapping
// Currently: <option key={w.id} value={w.id}>{w.name} ({w.currency} {w.balance})</option>
modal = modal.replace(
  /\{w\.name\} \(\{w\.currency\} \{w\.balance\}\)/g,
  '{w.name} ({formatCurrency(w.balance, w.currency)})'
);

// Let's also check if it uses `{w.name} ({w.currency})` in case I'm wrong
modal = modal.replace(
  /\{w\.name\} \(\{w\.currency\}\)/g,
  '{w.name} ({formatCurrency(w.balance, w.currency)})'
);

// Make sure Wallet icon mapping padding is fine
fs.writeFileSync('src/components/AddCreditModal.tsx', modal);
