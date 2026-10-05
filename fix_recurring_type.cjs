const fs = require('fs');

// 1. Update types.ts
let types = fs.readFileSync('src/types.ts', 'utf8');
types = types.replace('isRecurring?: boolean;', "isRecurring?: boolean | 'daily' | 'weekly' | 'monthly' | 'custom';");
fs.writeFileSync('src/types.ts', types);

// 2. Update AddTransactionModal.tsx
let modal = fs.readFileSync('src/components/AddTransactionModal.tsx', 'utf8');

modal = modal.replace(
  'const [isRecurring, setIsRecurring] = useState(false);',
  'const [isRecurring, setIsRecurring] = useState<false | \'daily\' | \'weekly\' | \'monthly\' | \'custom\'>(false);'
);

modal = modal.replace(
  'setIsRecurring(!!editingTransaction.isRecurring);',
  'setIsRecurring(editingTransaction.isRecurring || false);'
);

// We need to replace the toggle button with a select dropdown
const recurringUI = `
            {/* Custom Dropdown */}
            <select
              value={isRecurring === false ? 'none' : isRecurring === true ? 'monthly' : isRecurring}
              onChange={(e) => setIsRecurring(e.target.value === 'none' ? false : e.target.value as any)}
              className={\`text-xs font-bold rounded-xl px-3 py-2 border focus:outline-none focus:ring-1 focus:ring-blue-500 \${
                isDark ? 'bg-neutral-800 border-neutral-700 text-white' : 'bg-white border-neutral-200 text-neutral-900'
              }\`}
            >
              <option value="none">None</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="custom">Custom</option>
            </select>
          </div>
`;

modal = modal.replace(
  /<button[\s\S]*?role="switch"[\s\S]*?<\/button>\n\s*<\/div>/,
  recurringUI
);

// We also need to change the toggle text from "Recurring Monthly" to just "Recurring"
modal = modal.replace(
  /Recurring Monthly<\/p>/,
  'Recurring</p>'
);

fs.writeFileSync('src/components/AddTransactionModal.tsx', modal);
