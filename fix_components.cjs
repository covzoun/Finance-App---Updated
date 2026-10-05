const fs = require('fs');

// --- AddCreditModal.tsx ---
let credit = fs.readFileSync('src/components/AddCreditModal.tsx', 'utf8');

// Fix lent color to blue
credit = credit.replace(/border-emerald-500\/50 bg-emerald-500\/10 text-emerald-400/g, 'border-blue-500/50 bg-blue-500/10 text-blue-400');
credit = credit.replace(/border-emerald-500 bg-emerald-50 text-emerald-700/g, 'border-blue-500 bg-blue-50 text-blue-700');

// Fix cropping and max-h
credit = credit.replace(
  'max-h-[92vh]',
  'h-[90vh] sm:h-[650px]'
);

// Fix datetime icon overlap
credit = credit.replace(
  'className="w-full bg-transparent outline-none text-right font-medium px-4 text-sm"',
  'className="w-full bg-transparent outline-none text-right font-medium px-4 pr-10 text-sm"'
);

fs.writeFileSync('src/components/AddCreditModal.tsx', credit);

// --- CreditsList.tsx ---
let list = fs.readFileSync('src/components/CreditsList.tsx', 'utf8');

// Fix gap and text subtlety
list = list.replace(/mb-1 text-neutral-400/g, 'mb-3 text-neutral-500');
list = list.replace(/text-\[8px\] text-neutral-400 font-semibold uppercase tracking-wider block mt-0.5/g, 'text-[9px] text-neutral-500/60 font-semibold uppercase tracking-widest block mt-1.5');
list = list.replace(/text-xs font-black/g, 'text-sm font-black');

fs.writeFileSync('src/components/CreditsList.tsx', list);

// --- BankLogo.tsx ---
let bank = fs.readFileSync('src/components/BankLogo.tsx', 'utf8');

bank = bank.replace(
  "{ id: 'maya', name: 'Maya', color: '#000000' }",
  "{ id: 'maya', name: 'Maya', color: '#00B14F' }"
);
fs.writeFileSync('src/components/BankLogo.tsx', bank);

