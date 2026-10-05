const fs = require('fs');

const formatHelper = `
  const handleAmountChange = (e, setter) => {
    let val = e.target.value.replace(/[^0-9.]/g, '');
    if (val.split('.').length > 2) {
      val = val.replace(/\\.+$/, '');
    }
    const parts = val.split('.');
    parts[0] = parts[0].replace(/\\B(?=(\\d{3})+(?!\\d))/g, ',');
    setter(parts.join('.'));
  };
`;

function fixInput(file) {
  if (!fs.existsSync(file)) return;
  let content = fs.readFileSync(file, 'utf8');

  // Inject handleAmountChange right before useEffects
  if (!content.includes('handleAmountChange')) {
    content = content.replace(
      /  const \[date, setDate\] = useState/,
      formatHelper + '\n  const [date, setDate] = useState'
    );
  }

  // Replace input type="number" with type="text"
  content = content.replace(
    /type="number"\n\s*required\n\s*placeholder="0\.00"\n\s*min="0\.01"\n\s*step="any"\n\s*value=\{amount\}/,
    'type="text"\n                inputMode="decimal"\n                required\n                placeholder="0.00"\n                value={amount}'
  );
  content = content.replace(
    /onChange=\{\(e\) => setAmount\(e\.target\.value\)\}/,
    'onChange={(e) => handleAmountChange(e, setAmount)}'
  );
  
  // Also fix handleSubmit logic to strip commas before parsing
  content = content.replace(
    /const parsedAmount = parseFloat\(amount\);/,
    'const parsedAmount = parseFloat(amount.replace(/,/g, \'\'));'
  );
  content = content.replace(
    /parseFloat\(amount\)/g,
    'parseFloat(amount.replace(/,/g, \'\'))'
  );

  fs.writeFileSync(file, content);
}

fixInput('src/components/AddTransactionModal.tsx');
fixInput('src/components/AddDebtModal.tsx');
