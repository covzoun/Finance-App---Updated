const fs = require('fs');

let modal = fs.readFileSync('src/components/AddTransactionModal.tsx', 'utf8');

// Wallet Select
modal = modal.replace(
  /<div className="relative"><select value=\{walletId\} onChange=\{\(e\) => handleWalletChange\(e\.target\.value\)\}\s+className=\{\`w-full rounded-xl border px-4 py-3 text-xs font-bold appearance-none focus:outline-none focus:ring-1 focus:ring-blue-500 \$\{\s+isDark \? 'bg-neutral-900 border-neutral-800 text-white' : 'bg-neutral-50 border-neutral-200 text-neutral-800'\s+\}\`\}\s+>\s+\{wallets\.map\(\(w\) => \(\s+<option key=\{w\.id\} value=\{w\.id\}>\s+\{w\.name\} \(\{w\.currency\}\)\s+<\/option>\s+\)\)\}\s+<\/select>/g,
  `<div className="relative">
                <select
                  value={walletId}
                  onChange={(e) => handleWalletChange(e.target.value)}
                  className={\`w-full rounded-xl border pl-4 pr-10 py-3 text-xs font-bold appearance-none focus:outline-none focus:ring-1 focus:ring-blue-500 \${
                    isDark ? 'bg-neutral-900 border-neutral-800 text-white' : 'bg-neutral-50 border-neutral-200 text-neutral-800'
                  }\`}
                >
                  {wallets.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name} ({w.currency})
                    </option>
                  ))}
                </select>
                <div className="absolute right-3 top-3.5 pointer-events-none text-neutral-400">
                  <DynamicIcon name="ChevronDown" size={16} />
                </div>
              </div>`
);

// To Wallet Select
modal = modal.replace(
  /<div className="relative"><select value=\{toWalletId\} onChange=\{\(e\) => handleToWalletChange\(e\.target\.value\)\}\s+className=\{\`w-full rounded-xl border px-4 py-3 text-xs font-bold appearance-none focus:outline-none focus:ring-1 focus:ring-blue-500 \$\{\s+isDark \? 'bg-neutral-900 border-neutral-800 text-white' : 'bg-neutral-50 border-neutral-200 text-neutral-800'\s+\}\`\}\s+>\s+<option value="" disabled>Select destination<\/option>\s+\{wallets\.filter\(w => w\.id !== walletId\)\.map\(\(w\) => \(\s+<option key=\{w\.id\} value=\{w\.id\}>\s+\{w\.name\} \(\{w\.currency\}\)\s+<\/option>\s+\)\)\}\s+<\/select>\s+<\/div>\s+\)\}/g,
  `<div className="relative">
                  <select
                    value={toWalletId}
                    onChange={(e) => handleToWalletChange(e.target.value)}
                    className={\`w-full rounded-xl border pl-4 pr-10 py-3 text-xs font-bold appearance-none focus:outline-none focus:ring-1 focus:ring-blue-500 \${
                      isDark ? 'bg-neutral-900 border-neutral-800 text-white' : 'bg-neutral-50 border-neutral-200 text-neutral-800'
                    }\`}
                  >
                    <option value="" disabled>Select destination</option>
                    {wallets.filter(w => w.id !== walletId).map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.name} ({w.currency})
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-3.5 pointer-events-none text-neutral-400">
                    <DynamicIcon name="ChevronDown" size={16} />
                  </div>
                </div>
              </div>
            )}`
);

fs.writeFileSync('src/components/AddTransactionModal.tsx', modal);
