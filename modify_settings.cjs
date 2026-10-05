const fs = require('fs');
let content = fs.readFileSync('src/components/SettingsModal.tsx', 'utf8');

// Add new props to interface
content = content.replace(
  "  onResetApp: () => void;\n}",
  "  onResetApp: () => void;\n  lastBackupDate: string | null;\n  onBackupComplete: () => void;\n}"
);

// Add to component props
content = content.replace(
  "  onResetApp,\n}: SettingsModalProps) {",
  "  onResetApp,\n  lastBackupDate,\n  onBackupComplete,\n}: SettingsModalProps) {"
);

// Add the Backup & Restore section
const backupSection = `
          <hr className={isDark ? 'border-slate-900' : 'border-slate-100'} />
          
          {/* Backup & Restore Section */}
          <div className="space-y-3">
            <h3 className="text-xs font-black uppercase tracking-widest flex items-center gap-1.5 text-blue-500">
              <DynamicIcon name="Save" size={12} />
              Data Backup & Restore
            </h3>
            <div className={\`p-4 rounded-2xl border space-y-3 transition-all \${
              isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-50 border-slate-200'
            }\`}>
              <p className={\`text-xs leading-relaxed \${isDark ? 'text-slate-400' : 'text-slate-500'}\`}>
                This app runs entirely offline. To prevent data loss, manually export your data. You can restore it later if you switch devices.
              </p>
              
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const data = {
                      wallets: JSON.parse(localStorage.getItem('dw_wallets') || '[]'),
                      transactions: JSON.parse(localStorage.getItem('dw_transactions') || '[]'),
                      debts: JSON.parse(localStorage.getItem('dw_debts') || '[]')
                    };
                    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = \`finances_backup_\${new Date().toISOString().split('T')[0]}.json\`;
                    a.click();
                    URL.revokeObjectURL(url);
                    
                    const now = new Date().toISOString();
                    localStorage.setItem('dw_last_backup', now);
                    onBackupComplete();
                  }}
                  className={\`flex-1 py-2.5 px-3 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm \${
                    isDark 
                      ? 'bg-blue-600 hover:bg-blue-700 text-white border border-blue-500' 
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }\`}
                >
                  <DynamicIcon name="Download" size={14} />
                  Export Data
                </button>
                
                <label
                  className={\`flex-1 py-2.5 px-3 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer border \${
                    isDark 
                      ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700' 
                      : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                  }\`}
                >
                  <DynamicIcon name="Upload" size={14} />
                  Import
                  <input 
                    type="file" 
                    accept=".json" 
                    className="hidden" 
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        try {
                          const parsed = JSON.parse(event.target?.result as string);
                          if (parsed.wallets && parsed.transactions) {
                            localStorage.setItem('dw_wallets', JSON.stringify(parsed.wallets));
                            localStorage.setItem('dw_transactions', JSON.stringify(parsed.transactions));
                            if (parsed.debts) localStorage.setItem('dw_debts', JSON.stringify(parsed.debts));
                            window.location.reload();
                          } else {
                            alert('Invalid backup file');
                          }
                        } catch (err) {
                          alert('Failed to parse backup file');
                        }
                      };
                      reader.readAsText(file);
                    }} 
                  />
                </label>
              </div>
              {lastBackupDate && (
                <p className={\`text-[10px] text-center font-bold uppercase tracking-widest \${isDark ? 'text-slate-500' : 'text-slate-400'}\`}>
                  Last Backup: {new Date(lastBackupDate).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
`;

content = content.replace("          <hr className={isDark ? 'border-slate-900' : 'border-slate-100'} />", backupSection);

fs.writeFileSync('src/components/SettingsModal.tsx', content);
console.log("SettingsModal modified");
