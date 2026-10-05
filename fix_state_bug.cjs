const fs = require('fs');

let modal = fs.readFileSync('src/components/AddTransactionModal.tsx', 'utf8');

// Fix the useState destructuring error
modal = modal.replace(
  /const \[isRecurring,\n\s+\.\.\.\(isRecurring === 'custom' \? \{ customRecurringDays: parseInt\(customRecurringDays, 10\) \|\| 1 \} : \{\}\), setIsRecurring\] = useState.*?;/g,
  `const [isRecurring, setIsRecurring] = useState<false | 'daily' | 'weekly' | 'monthly' | 'custom'>(false);`
);

// We need to inject the customRecurringDays into the payload of handleSave in AddTransactionModal
// The previous script might have accidentally injected it into the useState destructuring.
modal = modal.replace(
  /isRecurring\s*,\s*\.\.\.\(isRecurring === 'custom'/g,
  'isRecurring,\n      ...(isRecurring === \'custom\''
);

fs.writeFileSync('src/components/AddTransactionModal.tsx', modal);
