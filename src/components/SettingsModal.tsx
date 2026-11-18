import React, { useState } from 'react';
import DynamicIcon from './DynamicIcon';

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
  const [statusMessage, setStatusMessage] = useState<{
    text: string;
    type: 'success' | 'error';
  } | null>(null);

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

      const headers = [
        'Date',
        'Type',
        'Amount',
        'Currency',
        'Category',
        'Account',
        'Description',
        'Recurring',
      ];
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
          `"${t.isRecurring ? String(t.isRecurring) : 'No'}"`,
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
      setStatusMessage({ text: 'Transactions CSV exported.', type: 'success' });
    } catch {
      setStatusMessage({ text: 'Failed to generate CSV export.', type: 'error' });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/30 p-0 sm:p-4 backdrop-blur-md">
      <div className="absolute inset-0" onClick={onClose} />

      <div
        className={`relative w-full sm:max-w-md border-t sm:border rounded-t-[28px] sm:rounded-[28px] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col ${
          isDark
            ? 'glass-sheet-dark text-white'
            : 'glass-sheet text-[#1c1c1e]'
        }`}
      >
        <div
          className={`flex items-center justify-between border-b px-5 py-4 shrink-0 ${
            isDark ? 'border-white/10' : 'border-black/6'
          }`}
        >
          <h2 className="text-[15px] font-semibold tracking-tight">Settings</h2>
          <button
            onClick={onClose}
            className={`rounded-full p-1.5 ${
              isDark ? 'hover:bg-white/10 text-white/50' : 'hover:bg-black/5 text-black/40'
            }`}
          >
            <DynamicIcon name="X" size={16} />
          </button>
        </div>

        <div className="overflow-y-auto overscroll-contain px-5 py-5 space-y-6">
          {statusMessage && (
            <div
              className={`p-3 rounded-2xl text-[12px] font-medium flex items-center justify-between border ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                  : 'bg-rose-500/10 text-rose-500 border-rose-500/20'
              }`}
            >
              <span>{statusMessage.text}</span>
              <button type="button" onClick={() => setStatusMessage(null)}>
                <DynamicIcon name="X" size={12} />
              </button>
            </div>
          )}

          <div className="space-y-3">
            <h3 className={`text-[11px] font-semibold uppercase tracking-[0.12em] ${isDark ? 'text-white/40' : 'text-black/35'}`}>
              Appearance
            </h3>
            <div
              className={`p-1 rounded-2xl border flex ${
                isDark ? 'bg-white/8 border-white/10' : 'bg-black/[0.04] border-black/6'
              }`}
            >
              <button
                type="button"
                onClick={() => themeMode === 'dark' && onToggleTheme()}
                className={`flex-1 py-2.5 rounded-xl text-[13px] font-medium flex items-center justify-center gap-1.5 ${
                  themeMode === 'light'
                    ? isDark
                      ? 'bg-white/15 text-white'
                      : 'bg-white text-[#1c1c1e] shadow-sm'
                    : isDark
                      ? 'text-white/40'
                      : 'text-black/40'
                }`}
              >
                <DynamicIcon name="Sun" size={14} />
                Light
              </button>
              <button
                type="button"
                onClick={() => themeMode === 'light' && onToggleTheme()}
                className={`flex-1 py-2.5 rounded-xl text-[13px] font-medium flex items-center justify-center gap-1.5 ${
                  themeMode === 'dark' ? 'bg-white/15 text-white' : 'text-black/40'
                }`}
              >
                <DynamicIcon name="Moon" size={14} />
                Dark
              </button>
            </div>

            {onToggleHideBalances && (
              <div
                className={`p-3.5 rounded-2xl border flex items-center justify-between ${
                  isDark ? 'bg-white/[0.05] border-white/10' : 'bg-black/[0.03] border-black/6'
                }`}
              >
                <div>
                  <p className="text-[14px] font-medium">Hide balances</p>
                  <p className={`text-[12px] ${isDark ? 'text-white/40' : 'text-black/35'}`}>
                    Mask amounts with ••••••
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!hideBalances}
                    onChange={onToggleHideBalances}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-black/15 dark:bg-white/20 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#1c1c1e] dark:peer-checked:bg-white" />
                </label>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <h3 className={`text-[11px] font-semibold uppercase tracking-[0.12em] ${isDark ? 'text-white/40' : 'text-black/35'}`}>
              Data
            </h3>
            <div
              className={`p-4 rounded-2xl border space-y-3 ${
                isDark ? 'border-white/10' : 'border-black/8'
              }`}
            >
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const data = {
                      wallets: JSON.parse(localStorage.getItem('dw_wallets') || '[]'),
                      transactions: JSON.parse(localStorage.getItem('dw_transactions') || '[]'),
                      debts: JSON.parse(localStorage.getItem('dw_debts') || '[]'),
                    };
                    const blob = new Blob([JSON.stringify(data, null, 2)], {
                      type: 'application/json',
                    });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `finances_backup_${new Date().toISOString().split('T')[0]}.json`;
                    a.click();
                    URL.revokeObjectURL(url);
                    const now = new Date().toISOString();
                    localStorage.setItem('dw_last_backup', now);
                    onBackupComplete();
                    setStatusMessage({ text: 'Backup downloaded.', type: 'success' });
                  }}
                  className={`py-2.5 px-3 rounded-xl text-[13px] font-semibold flex items-center justify-center gap-1.5 ${
                    isDark ? 'bg-white text-black' : 'bg-[#1c1c1e] text-white'
                  }`}
                >
                  <DynamicIcon name="Download" size={14} />
                  Backup
                </button>

                <label
                  className={`py-2.5 px-3 rounded-xl text-[13px] font-medium flex items-center justify-center gap-1.5 cursor-pointer border ${
                    isDark
                      ? 'border-white/15 text-white/80'
                      : 'border-black/10 text-black/70'
                  }`}
                >
                  <DynamicIcon name="Upload" size={14} />
                  Restore
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
                            localStorage.setItem(
                              'dw_transactions',
                              JSON.stringify(parsed.transactions)
                            );
                            if (parsed.debts)
                              localStorage.setItem('dw_debts', JSON.stringify(parsed.debts));
                            setStatusMessage({
                              text: 'Restored. Reloading…',
                              type: 'success',
                            });
                            setTimeout(() => window.location.reload(), 500);
                          } else {
                            setStatusMessage({
                              text: 'Invalid backup file.',
                              type: 'error',
                            });
                          }
                        } catch {
                          setStatusMessage({ text: 'Failed to parse backup.', type: 'error' });
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
                className={`w-full py-2.5 rounded-xl text-[13px] font-medium flex items-center justify-center gap-1.5 border ${
                  isDark
                    ? 'border-white/15 text-white/80'
                    : 'border-black/10 text-black/70'
                }`}
              >
                <DynamicIcon name="FileSpreadsheet" size={14} />
                Export CSV
              </button>

              {lastBackupDate && (
                <p className={`text-[11px] text-center ${isDark ? 'text-white/30' : 'text-black/30'}`}>
                  Last backup {new Date(lastBackupDate).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-rose-500">
              Danger zone
            </h3>
            {!showConfirmReset ? (
              <button
                type="button"
                onClick={() => setShowConfirmReset(true)}
                className={`w-full py-3 rounded-2xl text-[13px] font-medium border ${
                  isDark
                    ? 'border-rose-500/30 text-rose-400'
                    : 'border-rose-200 text-rose-600'
                }`}
              >
                Reset app & erase data
              </button>
            ) : (
              <div
                className={`p-4 rounded-2xl border space-y-3 ${
                  isDark ? 'border-rose-500/30 bg-rose-500/10' : 'border-rose-200 bg-rose-50'
                }`}
              >
                <p className={`text-[13px] ${isDark ? 'text-rose-200' : 'text-rose-800'}`}>
                  This cannot be undone. All wallets, transactions, and debts will be deleted.
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowConfirmReset(false)}
                    className={`flex-1 py-2.5 rounded-xl text-[13px] font-medium border ${
                      isDark ? 'border-white/15' : 'border-black/10'
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleResetConfirm}
                    className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold bg-rose-600 text-white"
                  >
                    Wipe everything
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
