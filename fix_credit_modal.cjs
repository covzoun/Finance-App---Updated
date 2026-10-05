const fs = require('fs');

let modal = fs.readFileSync('src/components/AddCreditModal.tsx', 'utf8');

const resetLogic = `
  React.useEffect(() => {
    if (!isOpen) {
      setPerson('');
      setType('lent');
      setAmount('');
      setCurrency('PHP');
      setDescription('');
      setWalletId('');
      setDueDate('');
      setShouldAffectWallet(true);
    }
  }, [isOpen]);
`;

// Inject reset logic
if (!modal.includes('setPerson(\'\')')) {
  modal = modal.replace(
    '  if (!isOpen) return null;',
    resetLogic + '\n  if (!isOpen) return null;'
  );
}

// Ensure the form body is scrollable
// The structure is probably:
// <div fixed inset-0 z-50 ...>
//   <div absolute inset-y-0 right-0 ...> (sidebar modal)
//     <div p-6 border-b shrink-0> header </div>
//     <div p-6 space-y-5> content </div> (this needs overflow-y-auto flex-1)
//     <div p-6 border-t shrink-0> footer </div>
//   </div>
// </div>

modal = modal.replace(
  /<div className=\{\`p-6 space-y-5 \$\{/g,
  '<div className={`flex-1 overflow-y-auto overscroll-contain p-6 space-y-5 ${'
);

// Add Clear Date button next to Due Date Label
modal = modal.replace(
  /<label className="block text-\[10px\] font-black uppercase tracking-widest text-neutral-500 mb-1\.5">\s*Optional Due Date\s*<\/label>/,
  `<div className="flex items-center justify-between mb-1.5">
              <label className="block text-[10px] font-black uppercase tracking-widest text-neutral-500">
                Optional Due Date
              </label>
              {dueDate && (
                <button type="button" onClick={() => setDueDate('')} className="text-[10px] font-bold text-rose-500 hover:text-rose-600 transition-colors">
                  Clear
                </button>
              )}
            </div>`
);

// Apply input formatting
const formatHelper = `
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/[^0-9.]/g, '');
    if (val.split('.').length > 2) {
      val = val.replace(/\\.+$/, '');
    }
    const parts = val.split('.');
    parts[0] = parts[0].replace(/\\B(?=(\\d{3})+(?!\\d))/g, ',');
    setAmount(parts.join('.'));
  };
`;

if (!modal.includes('handleAmountChange')) {
  modal = modal.replace(
    '  const handleSubmit = ',
    formatHelper + '\n  const handleSubmit = '
  );
}

modal = modal.replace(
  /type="number"\n\s*required\n\s*placeholder="0\.00"\n\s*min="0\.01"\n\s*step="any"\n\s*value=\{amount\}/,
  'type="text"\n                inputMode="decimal"\n                required\n                placeholder="0.00"\n                value={amount}'
);

modal = modal.replace(
  /onChange=\{\(e\) => setAmount\(e\.target\.value\)\}/,
  'onChange={handleAmountChange}'
);

modal = modal.replace(
  /parseFloat\(amount\)/g,
  'parseFloat(amount.replace(/,/g, \'\'))'
);

modal = modal.replace(/pr-10 py-2\.5/g, 'pr-14 py-2.5');
modal = modal.replace(/pr-12 py-2\.5/g, 'pr-14 py-2.5'); // just in case

fs.writeFileSync('src/components/AddCreditModal.tsx', modal);
