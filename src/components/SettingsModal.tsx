import React, { useState } from 'react';
import DynamicIcon from './DynamicIcon';
import { PWAInstallButton } from './PWAInstallButton';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  themeMode: 'light' | 'dark';
  onToggleTheme: () => void;
  onResetApp: () => void;
  lastBackupDate: string | null;
  onBackupComplete: () => void;
  hideBalances?: boolean;
  onToggleHideBalances?: () => void;
}

export default function SettingsModal({
  isOpen,
  onClose,
  themeMode,
  onToggleTheme,
  onResetApp,
  lastBackupDate,
  onBackupComplete,
  hideBalances,
  onToggleHideBalances,
}: SettingsModalProps) {
  const isDark = themeMode === 'dark';
  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  if (!isOpen) return null;

  const handleResetConfirm = () => {
    onResetApp();
    setShowConfirmReset(false);
    onClose();
  };

  const handleExportCSV = () => {
    try {
      const txs = JSON.parse(localStorage.getItem('dw_transactions') || '[]');
      const walletsList = JSON.parse(localStorage.getItem('dw_wallets') || '[]');
      
      if (!txs.length) {
        setStatusMessage({ text: 'No transactions to export yet.', type: 'error' });
        return;
      }

      const headers = ['Date', 'Type', 'Amount', 'Currency', 'Category', 'Account', 'Description', 'Recurring'];
      const rows = txs.map((t: any) => {
        const w = walletsList.find((wal: any) => wal.id === t.walletId);
        return [
          `"${new Date(t.date).toLocaleString()}"`,
          `"${t.type}"`,
          t.amount,
          `"${w?.currency || 'PHP'}"`,
          `"${(t.category || '').replace(/"/g, '""')}"`,
          `"${(w?.name || '').replace(/"/g, '""')}"`,
          `"${(t.description || '').replace(/"/g, '""')}"`,
          `"${t.isRecurring ? String(t.isRecurring) : 'No'}"`
        ].join(',');
      });

      const csvContent = [headers.join(','), ...rows].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `finances_transactions_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      setStatusMessage({ text: 'Transactions CSV exported successfully!', type: 'success' });
    } catch (e) {
      setStatusMessage({ text: 'Failed to generate CSV export.', type: 'error' });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4 backdrop-blur-xs">
      {/* Backdrop overlay */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal Card container */}
      <div className={`relative w-full sm:max-w-md border-t sm:border rounded-t-[32px] sm:rounded-[32px] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col transition-all transform duration-300 ${
        isDark ? 'bg-neutral-950 border-neutral-900 text-white' : 'bg-white border-neutral-100 text-neutral-850'
      }`}>
        {/* Header */}
        <div className={`flex items-center justify-between border-b px-6 py-4 shrink-0 transition-colors ${
          isDark ? 'border-neutral-900 bg-neutral-950' : 'border-neutral-100 bg-white'
        }`}>
          <div className="flex items-center gap-2">
            <DynamicIcon name="Settings" className="text-blue-500 animate-spin-slow" size={18} />
            <h2 className="font-sans font-black text-xs uppercase tracking-wider">Application Settings</h2>
          </div>
          <button
            onClick={onClose}
            className={`rounded-full p-1.5 transition-colors cursor-pointer ${
              isDark ? 'text-neutral-400 hover:bg-neutral-800 hover:text-white' : 'text-neutral-400 hover:bg-neutral-50 hover:text-neutral-800'
            }`}
          >
            <DynamicIcon name="X" size={16} />
          </button>
        </div>

        {/* Content Area */}
        <div className="overflow-y-auto overscroll-contain px-6 py-6 space-y-6">
          {/* Status feedback banner */}
          {statusMessage && (
            <div className={`p-3 rounded-xl text-xs font-bold flex items-center justify-between border ${
              statusMessage.type === 'success'
                ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                : 'bg-rose-500/10 text-rose-500 border-rose-500/20'
            }`}>
              <div className="flex items-center gap-2">
                <DynamicIcon name={statusMessage.type === 'success' ? 'Check' : 'AlertCircle'} size={14} />
                <span>{statusMessage.text}</span>
              </div>
              <button
                type="button"
                onClick={() => setStatusMessage(null)}
                className="text-neutral-400 hover:text-white cursor-pointer ml-2"
              >
                <DynamicIcon name="X" size={12} />
              </button>
            </div>
          )}

          {/* Appearance Section */}
          <div className="space-y-3">
            <h3 className="text-xs font-black uppercase tracking-widest text-neutral-400 flex items-center gap-1.5">
              <DynamicIcon name="Eye" size={12} />
              Appearance & Theme
            </h3>
            
            <div className={`p-1.5 rounded-2xl border flex transition-all ${
              isDark ? 'bg-neutral-950 border-neutral-900' : 'bg-neutral-100 border-neutral-200'
            }`}>
              <button
                type="button"
                onClick={() => themeMode === 'dark' && onToggleTheme()}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  themeMode === 'light'
                    ? 'bg-white text-blue-600 shadow-xs font-extrabold border border-neutral-200'
                    : isDark
                    ? 'text-neutral-400 hover:text-neutral-200'
                    : 'text-neutral-500 hover:text-neutral-700'
                }`}
              >
                <DynamicIcon name="Sun" size={14} />
                Light Mode
              </button>
              <button
                type="button"
                onClick={() => themeMode === 'light' && onToggleTheme()}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  themeMode === 'dark'
                    ? 'bg-neutral-950 text-yellow-400 shadow-xs font-extrabold border border-neutral-900'
                    : isDark
                    ? 'text-neutral-400 hover:text-neutral-200'
                    : 'text-neutral-500 hover:text-neutral-700'
                }`}
              >
                <DynamicIcon name="Moon" size={14} />
                Dark Mode
              </button>
            </div>

            {/* Offline App Installation */}
            <div className={`p-3.5 rounded-2xl border flex items-center justify-between transition-all ${
              isDark ? 'bg-neutral-900/50 border-neutral-800' : 'bg-neutral-50 border-neutral-200'
            }`}>
              <div className="flex items-center gap-2.5">
                <DynamicIcon name="Smartphone" size={16} className="text-blue-500 shrink-0" />
                <div>
                  <p className={`text-xs font-bold ${isDark ? 'text-white' : 'text-neutral-900'}`}>Install Web App</p>
                  <p className="text-[10px] text-neutral-400">Launch from your home screen</p>
                </div>
              </div>
              <PWAInstallButton themeMode={themeMode} />
            </div>

            {/* Privacy Mode Toggle */}
            {onToggleHideBalances && (
              <div className={`p-3.5 rounded-2xl border flex items-center justify-between transition-all ${
                isDark ? 'bg-neutral-900/50 border-neutral-800' : 'bg-neutral-50 border-neutral-200'
              }`}>
                <div className="flex items-center gap-2.5">
                  <DynamicIcon name={hideBalances ? "EyeOff" : "Eye"} size={16} className="text-blue-500 shrink-0" />
                  <div>
                    <p className={`text-xs font-bold ${isDark ? 'text-white' : 'text-neutral-900'}`}>Hide Sensitive Balances</p>
                    <p className="text-[10px] text-neutral-400">Mask balances with ••••••</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!hideBalances}
                    onChange={onToggleHideBalances}
                    className="sr-only peer"
                  />
                  <div className="w-8 h-4 bg-neutral-300 dark:bg-neutral-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            )}
          </div>


          <hr className={isDark ? 'border-neutral-900' : 'border-neutral-100'} />
          
          {/* Backup & Restore Section */}
          <div className="space-y-3">
            <h3 className="text-xs font-black uppercase tracking-widest flex items-center gap-1.5 text-blue-500">
              <DynamicIcon name="Save" size={12} />
              Data Backup & Restore
            </h3>
            <div className={`p-4 rounded-2xl border space-y-3 transition-all ${
              isDark ? 'bg-neutral-950/50 border-neutral-900' : 'bg-neutral-50 border-neutral-200'
            }`}>
              <p className={`text-xs leading-relaxed line-clamp-2 ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
                Save an offline backup of your data or restore files if switching devices.
              </p>
              
              <div className="flex flex-col gap-2">
                <div className="grid grid-cols-2 gap-2">
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
                      a.download = `finances_backup_${new Date().toISOString().split('T')[0]}.json`;
                      a.click();
                      URL.revokeObjectURL(url);
                      
                      const now = new Date().toISOString();
                      localStorage.setItem('dw_last_backup', now);
                      onBackupComplete();
                      setStatusMessage({ text: 'Full JSON backup downloaded successfully.', type: 'success' });
                    }}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs ${
                      isDark 
                        ? 'bg-blue-600 hover:bg-blue-700 text-white border border-blue-500' 
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                  >
                    <DynamicIcon name="Download" size={14} />
                    Backup JSON
                  </button>
                  
                  <label
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer border ${
                      isDark 
                        ? 'bg-neutral-850 hover:bg-neutral-800 text-neutral-300 border-neutral-750' 
                        : 'bg-white hover:bg-neutral-50 text-neutral-700 border-neutral-200 shadow-2xs'
                    }`}
                  >
                    <DynamicIcon name="Upload" size={14} />
                    Restore Data
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
                              setStatusMessage({ text: 'Backup restored successfully! Reloading...', type: 'success' });
                              setTimeout(() => {
                                window.location.reload();
                              }, 600);
                            } else {
                              setStatusMessage({ text: 'Invalid backup file structure.', type: 'error' });
                            }
                          } catch (err) {
                            setStatusMessage({ text: 'Failed to parse JSON backup file.', type: 'error' });
                          }
                        };
                        reader.readAsText(file);
                      }} 
                    />
                  </label>
                </div>

                <button
                  type="button"
                  onClick={handleExportCSV}
                  className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer border ${
                    isDark 
                      ? 'bg-emerald-950/25 hover:bg-emerald-950/45 text-emerald-400 border-emerald-900/50' 
                      : 'bg-emerald-50/70 hover:bg-emerald-100/70 text-emerald-700 border-emerald-200'
                  }`}
                  title="Export all transactions to Excel or Google Sheets"
                >
                  <DynamicIcon name="FileSpreadsheet" size={14} />
                  Export Transactions to CSV
                </button>
              </div>
              {lastBackupDate && (
                <p className={`text-[10px] text-center font-bold uppercase tracking-widest ${isDark ? 'text-neutral-500' : 'text-neutral-400'}`}>
                  Last Backup: {new Date(lastBackupDate).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>


          {/* Reset App Section */}
          <div className="space-y-3">
            <h3 className="text-xs font-black uppercase tracking-widest text-rose-500 flex items-center gap-1.5">
              <DynamicIcon name="AlertTriangle" size={12} />
              Danger Zone
            </h3>

            {!showConfirmReset ? (
              <div className={`p-4 rounded-2xl border transition-all ${
                isDark ? 'bg-rose-950/10 border-rose-950/30' : 'bg-rose-50/30 border-rose-100'
              }`}>
                <p className={`text-xs leading-relaxed line-clamp-2 mb-3 ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
                  Permanently clear out all accounts, transaction logs, and custom configuration.
                </p>
                <button
                  type="button"
                  onClick={() => setShowConfirmReset(true)}
                  className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    isDark
                      ? 'bg-rose-950/20 hover:bg-rose-950/35 text-rose-400 border border-rose-900/40'
                      : 'bg-rose-50 hover:bg-rose-100/60 text-rose-600 border border-rose-200'
                  }`}
                >
                  <DynamicIcon name="Trash2" size={13} />
                  Reset App & Erase Data
                </button>
              </div>
            ) : (
              <div className={`p-5 rounded-2xl border space-y-4 animate-pulse-subtle border-rose-500 ${
                isDark ? 'bg-rose-950/35' : 'bg-rose-50/85'
              }`}>
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-rose-500 text-white shrink-0 mt-0.5">
                    <DynamicIcon name="AlertTriangle" size={16} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider">Are you absolutely sure?</h4>
                    <p className={`text-xs leading-relaxed line-clamp-2 mt-1 ${isDark ? 'text-rose-200/70' : 'text-rose-750'}`}>
                      This action is irreversible. All custom accounts, activity logs, and debts will be permanently wiped.
                    </p>
                  </div>
                </div>

                <div className="flex gap-2.5">
                  <button
                    type="button"
                    onClick={() => setShowConfirmReset(false)}
                    className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold border transition-all text-center cursor-pointer ${
                      isDark 
                        ? 'bg-neutral-950 border-neutral-900 hover:bg-neutral-800 text-neutral-300' 
                        : 'bg-white border-neutral-200 hover:bg-neutral-50 text-neutral-500'
                    }`}
                  >
                    No, Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleResetConfirm}
                    className="flex-1 py-2.5 px-3 rounded-xl text-xs font-extrabold text-white bg-rose-600 hover:bg-rose-700 hover:scale-[1.01] transition-all text-center cursor-pointer shadow-md shadow-rose-500/10"
                  >
                    Yes, Wipe Everything
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
