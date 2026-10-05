const fs = require('fs');

function transformSelects(filePath) {
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');

  // Let's manually replace the 3 selects in AddTransactionModal and the ones in AddCreditModal.
  // Actually regex might be tricky if they differ. I'll just use precise string replacement.

  // AddTransactionModal - Wallet Select
  content = content.replace(
    /<select\s+value=\{walletId\}\s+onChange=\{\(e\) => handleWalletChange/g,
    '<div className="relative"><select value={walletId} onChange={(e) => handleWalletChange'
  );
  content = content.replace(
    /                  <\/option>\n                \)\)\}\n              <\/select>\n            <\/div>/g,
    '                  </option>\n                ))}\n              </select>\n              <div className="absolute right-3 top-3.5 pointer-events-none text-neutral-400"><DynamicIcon name="ChevronDown" size={16} /></div>\n            </div>\n            </div>'
  );

  // AddTransactionModal - To Wallet Select
  content = content.replace(
    /<select\s+value=\{toWalletId\}\s+onChange=\{\(e\) => handleToWalletChange/g,
    '<div className="relative"><select value={toWalletId} onChange={(e) => handleToWalletChange'
  );
  content = content.replace(
    /                  <\/option>\n                \)\)\}\n              <\/select>\n            <\/div>\n            \)\}/g,
    '                  </option>\n                ))}\n              </select>\n              <div className="absolute right-3 top-3.5 pointer-events-none text-neutral-400"><DynamicIcon name="ChevronDown" size={16} /></div>\n            </div>\n            </div>\n            )}'
  );

  // Recurring Select
  content = content.replace(
    /<select\s+value=\{isRecurring/g,
    '<div className="relative"><select value={isRecurring}'
  );
  content = content.replace(
    /className=\{\`text-xs font-bold rounded-xl px-3 py-2 border/g,
    'className={`text-xs font-bold appearance-none rounded-xl pl-3 pr-8 py-2 border'
  );
  content = content.replace(
    /<option value="custom">Custom<\/option>\n              <\/select>/g,
    '<option value="custom">Custom</option>\n              </select>\n              <div className="absolute right-2.5 top-2.5 pointer-events-none text-neutral-400"><DynamicIcon name="ChevronDown" size={14} /></div>\n              </div>'
  );

  fs.writeFileSync(filePath, content);
}

transformSelects('src/components/AddTransactionModal.tsx');
