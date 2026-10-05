const fs = require('fs');

let modal = fs.readFileSync('src/components/AddTransactionModal.tsx', 'utf8');

// 1. Fix datetime-local padding (cropping and icon issue)
modal = modal.replace(
  /className=\{\`w-full rounded-xl border px-4 pr-14 py-2\.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 \$\{/g,
  'className={`w-full rounded-xl border pl-3 pr-8 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 ${'
);

// 2. Fix Recurring select padding
modal = modal.replace(
  /className=\{\`text-xs font-bold rounded-xl px-3 py-2 border focus:outline-none focus:ring-1 focus:ring-blue-500 \$\{/g,
  'className={`text-xs font-bold rounded-xl pl-3 pr-8 py-2 border focus:outline-none focus:ring-1 focus:ring-blue-500 ${'
);

// Add state for custom recurring days
if (!modal.includes('customRecurringDays')) {
  modal = modal.replace(
    /const \[isRecurring, setIsRecurring\] = useState.*?;/,
    `const [isRecurring, setIsRecurring] = useState<false | 'daily' | 'weekly' | 'monthly' | 'custom'>(false);
  const [customRecurringDays, setCustomRecurringDays] = useState('14');`
  );
}

// In handleSubmit, if custom, save the days somehow. Wait, Transaction type doesn't have customDays.
// Let's modify types.ts too.
let types = fs.readFileSync('src/types.ts', 'utf8');
if (!types.includes('customRecurringDays?: number;')) {
  types = types.replace(
    /isRecurring\?: boolean \| 'daily' \| 'weekly' \| 'monthly' \| 'custom';/,
    "isRecurring?: boolean | 'daily' | 'weekly' | 'monthly' | 'custom';\n  customRecurringDays?: number;"
  );
  fs.writeFileSync('src/types.ts', types);
}

modal = modal.replace(
  /isRecurring,/g,
  'isRecurring,\n      ...(isRecurring === \'custom\' ? { customRecurringDays: parseInt(customRecurringDays, 10) || 1 } : {}),'
);

// For editing, set customRecurringDays if present
modal = modal.replace(
  /setIsRecurring\(editingTransaction\.isRecurring as any \|\| false\);/g,
  "setIsRecurring(editingTransaction.isRecurring as any || false);\n        setCustomRecurringDays(editingTransaction.customRecurringDays?.toString() || '14');"
);

// Render the custom recurring days input
const customDaysUI = `
            </div>
            
            {/* Custom Recurring Days Input */}
            {isRecurring === 'custom' && (
              <div className="flex items-center justify-between pl-12 pr-4 pb-4">
                <span className={\`text-[10px] font-bold uppercase tracking-widest \${isDark ? 'text-neutral-400' : 'text-neutral-500'}\`}>Repeat every</span>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    value={customRecurringDays}
                    onChange={(e) => setCustomRecurringDays(e.target.value)}
                    className={\`w-16 text-center rounded-lg border px-2 py-1.5 text-xs font-bold focus:outline-none \${
                      isDark ? 'bg-neutral-900 border-neutral-700 text-white' : 'bg-white border-neutral-200 text-neutral-900'
                    }\`}
                  />
                  <span className={\`text-[10px] font-bold uppercase tracking-widest \${isDark ? 'text-neutral-400' : 'text-neutral-500'}\`}>Days</span>
                </div>
              </div>
            )}
`;

modal = modal.replace(
  /              <\/select>\n            <\/div>\n          <\/div>\n        <\/form>/,
  `              </select>
            ${customDaysUI}
          </div>
        </form>`
);

fs.writeFileSync('src/components/AddTransactionModal.tsx', modal);
