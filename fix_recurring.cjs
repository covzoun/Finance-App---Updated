const fs = require('fs');
let modal = fs.readFileSync('src/components/AddTransactionModal.tsx', 'utf8');

const recurringUI = `
          {/* Recurring Toggle */}
          <div className={\`flex items-center justify-between p-4 rounded-2xl border \${
            isDark ? 'bg-neutral-900/50 border-neutral-800' : 'bg-neutral-50 border-neutral-200/50'
          }\`}>
            <div className="flex items-center gap-2.5">
              <div className={\`p-1.5 rounded-lg \${isDark ? 'bg-blue-900/40 text-blue-400' : 'bg-blue-100 text-blue-600'}\`}>
                <DynamicIcon name="RefreshCw" size={14} />
              </div>
              <div>
                <p className={\`text-xs font-bold \${isDark ? 'text-white' : 'text-neutral-900'}\`}>Recurring Monthly</p>
                <p className="text-[10px] text-neutral-500 font-medium">Auto-log this transaction</p>
              </div>
            </div>
            
            {/* Custom Toggle */}
            <button
              type="button"
              onClick={() => setIsRecurring(!isRecurring)}
              className={\`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none \${
                isRecurring ? 'bg-blue-600' : isDark ? 'bg-neutral-700' : 'bg-neutral-300'
              }\`}
              role="switch"
              aria-checked={isRecurring}
            >
              <span
                aria-hidden="true"
                className={\`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out \${
                  isRecurring ? 'translate-x-4' : 'translate-x-0'
                }\`}
              />
            </button>
          </div>
        </div>
        {/* Footer */}`;

modal = modal.replace(
  '              }`}            />          </div>        </div>        <div className={`p-6 border-t shrink-0 flex items-center justify-between gap-3 ${',
  '              }`}            />          </div>\n' + recurringUI + '\n        <div className={`p-6 border-t shrink-0 flex items-center justify-between gap-3 ${'
);
fs.writeFileSync('src/components/AddTransactionModal.tsx', modal);
