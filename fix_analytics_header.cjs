const fs = require('fs');
let app = fs.readFileSync('src/App.tsx', 'utf8');

const oldHeader = `                {/* Panel Header */}
                <div className={\`flex items-center justify-between border-b px-8 py-5 shrink-0 transition-colors \${
                  isDark ? 'bg-neutral-800 border-neutral-700' : 'bg-white border-neutral-200'
                }\`}>
                  <div className="flex items-center gap-3">
                    <DynamicIcon name="PieChart" className="text-blue-500" size={24} />
                    <h2 className={\`font-sans font-bold text-sm uppercase tracking-wider \${isDark ? 'text-white' : 'text-neutral-800'}\`}>Financial Insights</h2>
                  </div>
                  <button
                    onClick={() => setShowAnalyticsPanel(false)}
                    className={\`rounded-full p-2 transition-colors cursor-pointer \${
                      isDark ? 'text-neutral-400 hover:bg-neutral-700 hover:text-white' : 'text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900'
                    }\`}
                  >
                    <DynamicIcon name="X" size={24} />
                  </button>
                </div>`;

const newHeader = `                {/* Panel Header */}
                <div className={\`flex items-center justify-between px-6 pt-8 pb-4 shrink-0 transition-colors \${
                  isDark ? 'bg-neutral-950' : 'bg-white'
                }\`}>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setShowAnalyticsPanel(false)}
                      className={\`rounded-full p-2 -ml-2 transition-colors cursor-pointer \${
                        isDark ? 'text-neutral-400 hover:bg-neutral-800 hover:text-white' : 'text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900'
                      }\`}
                    >
                      <DynamicIcon name="X" size={24} />
                    </button>
                    <h2 className={\`font-sans font-black text-xl tracking-tight \${isDark ? 'text-white' : 'text-neutral-900'}\`}>Insights</h2>
                  </div>
                </div>`;

app = app.replace(oldHeader, newHeader);

// Also need to remove the bg-neutral-800 from the panel itself if there is one. 
// "className="absolute inset-0 z-50 flex flex-col bg-white dark:bg-black"" 
// I replaced bg-black with bg-neutral-950 earlier, so it's bg-neutral-950.

fs.writeFileSync('src/App.tsx', app);
