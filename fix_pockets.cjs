const fs = require('fs');

let modal = fs.readFileSync('src/components/AddCreditModal.tsx', 'utf8');
modal = modal.replace(
  /\{w\.name\} \(\{formatCurrency\(w\.balance, w\.currency\)\}\)/g,
  '{w.name} ({w.currency})'
);

// Also date picker padding inside AddTransactionModal and AddCreditModal
let addTx = fs.readFileSync('src/components/AddTransactionModal.tsx', 'utf8');
addTx = addTx.replace(
  /type="datetime-local"\s+value=\{date\}\s+onChange=\{\(e\) => setDate\(e\.target\.value\)\}\s+className=\{\`w-full rounded-xl border px-3 py-2\.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500/g,
  `type="datetime-local"\n                  value={date}\n                  onChange={(e) => setDate(e.target.value)}\n                  className={\`w-full rounded-xl border pl-3 pr-10 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500`
);
fs.writeFileSync('src/components/AddTransactionModal.tsx', addTx);

// AddCreditModal date picker
modal = modal.replace(
  /type="date"\s+value=\{dueDate\}\s+onChange=\{\(e\) => setDueDate\(e\.target\.value\)\}\s+className=\{\`w-full rounded-xl border px-3\.5 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500/g,
  `type="date"\n              value={dueDate}\n              onChange={(e) => setDueDate(e.target.value)}\n              className={\`w-full rounded-xl border pl-3.5 pr-10 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500`
);
fs.writeFileSync('src/components/AddCreditModal.tsx', modal);
