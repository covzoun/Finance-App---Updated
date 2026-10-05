const fs = require('fs');

let modal = fs.readFileSync('src/components/AddTransactionModal.tsx', 'utf8');

const replacement = `
            {/* Recurring Section */}
            <div className={\`flex items-center justify-between p-4 rounded-2xl border \${
              isDark ? 'bg-neutral-900/50 border-neutral-800' : 'bg-neutral-50 border-neutral-200/50'
            }\`}>
              <div className="flex items-center gap-2.5">
                <div className={\`p-1.5 rounded-lg \${isDark ? 'bg-blue-900/40 text-blue-400' : 'bg-blue-100 text-blue-600'}\`}>
                  <DynamicIcon name="RefreshCw" size={14} />
                </div>
                <div>
                  <p className={\`text-xs font-bold \${isDark ? 'text-white' : 'text-neutral-900'}\`}>Recurring</p>
                  <p className="text-[10px] text-neutral-500 font-medium">Auto-log this transaction</p>
                </div>
              </div>
              
              <div className="relative">
                <select
                  value={isRecurring === false ? 'none' : isRecurring === true ? 'monthly' : isRecurring}
                  onChange={(e) => setIsRecurring(e.target.value === 'none' ? false : e.target.value as any)}
                  className={\`text-xs font-bold appearance-none rounded-xl pl-3 pr-8 py-2 border focus:outline-none focus:ring-1 focus:ring-blue-500 \${
                    isDark ? 'bg-neutral-800 border-neutral-700 text-white' : 'bg-white border-neutral-200 text-neutral-900'
                  }\`}
                >
                  <option value="none">None</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="custom">Custom</option>
                </select>
                <div className="absolute right-2.5 top-2.5 pointer-events-none text-neutral-400">
                  <DynamicIcon name="ChevronDown" size={14} />
                </div>
              </div>
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
          
        </form>
`;

modal = modal.replace(/\{\/\* Recurring Section \*\/\}[\s\S]*?<\/form>/, replacement);

fs.writeFileSync('src/components/AddTransactionModal.tsx', modal);
