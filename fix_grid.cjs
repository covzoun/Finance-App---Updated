const fs = require('fs');

let modal = fs.readFileSync('src/components/AddTransactionModal.tsx', 'utf8');
modal = modal.replace(
  /<div className="grid grid-cols-2 gap-3">\s*<div>\s*<label className="block text-\[10px\] font-black uppercase tracking-widest text-neutral-500 mb-1\.5">\s*Description \/ Notes/g,
  `<div className="space-y-4">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-neutral-500 mb-1.5">
                  Description / Notes`
);
fs.writeFileSync('src/components/AddTransactionModal.tsx', modal);
