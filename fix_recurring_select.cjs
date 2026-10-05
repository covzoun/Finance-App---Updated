const fs = require('fs');

let modal = fs.readFileSync('src/components/AddTransactionModal.tsx', 'utf8');

modal = modal.replace(
  /<div className="relative"><select value=\{isRecurring === false \? 'none' : isRecurring === true \? 'monthly' : isRecurring\}\s+onChange=\{\(e\) => setIsRecurring\(e\.target\.value === 'none' \? false : e\.target\.value as any\)\}\s+className=\{\`text-xs font-bold appearance-none rounded-xl px-3 py-2 border focus:outline-none focus:ring-1 focus:ring-blue-500 \$\{\s+isDark \? 'bg-neutral-800 border-neutral-700 text-white' : 'bg-white border-neutral-200 text-neutral-900'\s+\}\`\}\s+>\s+<option value="none">None<\/option>\s+<option value="daily">Daily<\/option>\s+<option value="weekly">Weekly<\/option>\s+<option value="monthly">Monthly<\/option>\s+<option value="custom">Custom<\/option>\s+<\/select>/g,
  `<div className="relative">
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
              </div>`
);

fs.writeFileSync('src/components/AddTransactionModal.tsx', modal);
