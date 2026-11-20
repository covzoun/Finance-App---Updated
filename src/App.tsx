import { useState, useEffect } from 'react';
import { Wallet, Transaction, Debt } from './types';
import WalletCard from './components/WalletCard';
import TransactionItem from './components/TransactionItem';
import WalletDetails from './components/WalletDetails';
import AddWalletModal from './components/AddWalletModal';
import AddTransactionModal from './components/AddTransactionModal';
import SettingsModal from './components/SettingsModal';
import OverviewCharts from './components/OverviewCharts';
import AddCreditModal from './components/AddCreditModal';
import CreditsList from './components/CreditsList';
import DynamicIcon from './components/DynamicIcon';
import { motion, AnimatePresence } from 'motion/react';
import {
  toPHP,
  applyTransactionBalances,
  revertTransactionBalances,
  calcNetWorth,
} from './lib/ledger';

export default function App() {
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [debts, setDebts] = useState<Debt[]>([]);
  const [selectedWalletId, setSelectedWalletId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'wallets' | 'activity' | 'debts'>('wallets');

  const [lastBackupDate, setLastBackupDate] = useState<string | null>(
    () => localStorage.getItem('dw_last_backup') || null
  );
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>(
    () => (localStorage.getItem('dw_theme') as 'light' | 'dark') || 'light'
  );

  const [isAddWalletOpen, setIsAddWalletOpen] = useState(false);
  const [isAddTxOpen, setIsAddTxOpen] = useState(false);
  const [isAddDebtOpen, setIsAddDebtOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showAnalyticsPanel, setShowAnalyticsPanel] = useState(false);
  const [visibleTxCount] = useState(50);

  const [hideBalances, setHideBalances] = useState(
    () => localStorage.getItem('dw_hide_balances') === 'true'
  );

  const toggleHideBalances = () => {
    setHideBalances((prev) => {
      const next = !prev;
      localStorage.setItem('dw_hide_balances', String(next));
      return next;
    });
  };

  const [txSearchQuery, setTxSearchQuery] = useState('');
  const [preselectedWalletId, setPreselectedWalletId] = useState<string | undefined>();
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  useEffect(() => {
    const locked =
      isAddWalletOpen ||
      isAddTxOpen ||
      isAddDebtOpen ||
      isSettingsOpen ||
      !!selectedWalletId ||
      showAnalyticsPanel;
    document.body.style.overflow = locked ? 'hidden' : 'unset';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [
    isAddWalletOpen,
    isAddTxOpen,
    isAddDebtOpen,
    isSettingsOpen,
    selectedWalletId,
    showAnalyticsPanel,
  ]);

  useEffect(() => {
    try {
      const w = localStorage.getItem('dw_wallets');
      setWallets(
        w
          ? (JSON.parse(w) as Wallet[]).map((x) => ({
              ...x,
              currency: x.currency || 'PHP',
            }))
          : []
      );
    } catch {
      setWallets([]);
    }
    try {
      const t = localStorage.getItem('dw_transactions');
      setTransactions(t ? JSON.parse(t) : []);
    } catch {
      setTransactions([]);
    }
    try {
      const d = localStorage.getItem('dw_debts');
      setDebts(d ? JSON.parse(d) : []);
    } catch {
      setDebts([]);
    }
  }, []);

  const saveWallets = (u: Wallet[]) => {
    setWallets(u);
    localStorage.setItem('dw_wallets', JSON.stringify(u));
  };
  const saveTransactions = (u: Transaction[]) => {
    setTransactions(u);
    localStorage.setItem('dw_transactions', JSON.stringify(u));
  };
  const saveDebts = (u: Debt[]) => {
    setDebts(u);
    localStorage.setItem('dw_debts', JSON.stringify(u));
  };

  const toggleTheme = () => {
    const next = themeMode === 'light' ? 'dark' : 'light';
    setThemeMode(next);
    localStorage.setItem('dw_theme', next);
  };

  const handleResetApp = () => {
    saveWallets([]);
    saveTransactions([]);
    saveDebts([]);
    setSelectedWalletId(null);
    setActiveTab('wallets');
  };

  const totalNetWorth = calcNetWorth(wallets);
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const getTxPHPValue = (t: Transaction) => {
    const w = wallets.find((wal) => wal.id === t.walletId);
    return toPHP(t.amount, w?.currency || 'PHP');
  };

  const monthlyExpenses = transactions
    .filter((t) => {
      const d = new Date(t.date);
      return (
        t.type === 'expense' &&
        d.getMonth() === currentMonth &&
        d.getFullYear() === currentYear
      );
    })
    .reduce((sum, t) => sum + getTxPHPValue(t), 0);

  const monthlyIncome = transactions
    .filter((t) => {
      const d = new Date(t.date);
      return (
        t.type === 'income' &&
        d.getMonth() === currentMonth &&
        d.getFullYear() === currentYear
      );
    })
    .reduce((sum, t) => sum + getTxPHPValue(t), 0);

  const handleAddWallet = (newWallet: Wallet) => {
    saveWallets([newWallet, ...wallets]);
  };

  const handleAddTransaction = (newTxData: Omit<Transaction, 'id'>) => {
    const newTx: Transaction = { ...newTxData, id: `t-${Date.now()}` };
    saveWallets(applyTransactionBalances(newTx, wallets));
    saveTransactions([newTx, ...transactions]);
  };

  const handleEditTransaction = (
    txId: string,
    updatedTxData: Omit<Transaction, 'id'>
  ) => {
    const oldTx = transactions.find((t) => t.id === txId);
    if (!oldTx) return;
    let next = revertTransactionBalances(oldTx, wallets);
    const updatedTx: Transaction = { ...updatedTxData, id: txId };
    next = applyTransactionBalances(updatedTx, next);
    saveWallets(next);
    saveTransactions(transactions.map((t) => (t.id === txId ? updatedTx : t)));
  };

  const handleDeleteTransaction = (txId: string) => {
    const oldTx = transactions.find((t) => t.id === txId);
    if (!oldTx) return;
    saveWallets(revertTransactionBalances(oldTx, wallets));
    saveTransactions(transactions.filter((t) => t.id !== txId));
  };

  const handleEditWallet = (
    walletId: string,
    updatedName: string,
    updatedDesc: string,
    updatedColor: string,
    updatedIcon: string,
    updatedCurrency: 'PHP' | 'USD',
    updatedType: import('./types').WalletType,
    updatedBalance?: number,
    updatedImage?: string
  ) => {
    const currentWallet = wallets.find((w) => w.id === walletId);
    if (
      currentWallet &&
      typeof updatedBalance === 'number' &&
      updatedBalance !== currentWallet.balance
    ) {
      const diff = updatedBalance - currentWallet.balance;
      const adjustmentTx: Transaction = {
        id: `t-adj-${Date.now()}`,
        walletId,
        type: diff > 0 ? 'income' : 'expense',
        amount: Math.abs(Number(diff.toFixed(2))),
        category: 'Adjustment',
        description: `Manual balance adjustment (from ${currentWallet.balance} to ${updatedBalance})`,
        date: new Date().toISOString(),
      };
      saveTransactions([adjustmentTx, ...transactions]);
    }
    saveWallets(
      wallets.map((w) =>
        w.id === walletId
          ? {
              ...w,
              name: updatedName,
              description: updatedDesc || undefined,
              color: updatedColor,
              icon: updatedIcon,
              currency: updatedCurrency,
              type: updatedType,
              balance:
                typeof updatedBalance === 'number' ? updatedBalance : w.balance,
              image: updatedImage,
            }
          : w
      )
    );
  };

  const handleDeleteWallet = (walletId: string) => {
    saveWallets(wallets.filter((w) => w.id !== walletId));
    setSelectedWalletId(null);
  };

  const handleAddDebt = (
    newDebtData: Omit<Debt, 'id' | 'status' | 'remainingAmount'> & {
      date?: string;
    },
    shouldAffectWallet: boolean
  ) => {
    const debtId = `d-${Date.now()}`;
    const debtDate = newDebtData.date || new Date().toISOString();
    const newDebt: Debt = {
      ...newDebtData,
      id: debtId,
      remainingAmount: newDebtData.amount,
      status: 'unpaid',
      date: debtDate,
    };

    if (shouldAffectWallet && newDebtData.walletId) {
      const isLent = newDebtData.type === 'lent';
      const txAmount = newDebtData.amount;
      const nextWallets = wallets.map((w) => {
        if (w.id !== newDebtData.walletId) return w;
        const nextBalance = isLent
          ? Number((w.balance - txAmount).toFixed(2))
          : Number((w.balance + txAmount).toFixed(2));
        return { ...w, balance: nextBalance };
      });
      const ledgerTx: Transaction = {
        id: `t-debt-${Date.now()}`,
        walletId: newDebtData.walletId,
        type: isLent ? 'expense' : 'income',
        amount: txAmount,
        category: isLent ? 'Lent' : 'Borrowed',
        description: isLent
          ? `Lent money to ${newDebtData.person}${
              newDebtData.description ? ` (${newDebtData.description})` : ''
            }`
          : `Borrowed money from ${newDebtData.person}${
              newDebtData.description ? ` (${newDebtData.description})` : ''
            }`,
        date: debtDate,
      };
      saveTransactions([ledgerTx, ...transactions]);
      saveWallets(nextWallets);
    }
    saveDebts([newDebt, ...debts]);
  };

  const handleAddRepayment = (
    debtId: string,
    amount: number,
    walletId: string | undefined,
    shouldAffectWallet: boolean
  ) => {
    const debt = debts.find((d) => d.id === debtId);
    if (!debt) return;
    const isLent = debt.type === 'lent';
    const nextRemaining = Number((debt.remainingAmount - amount).toFixed(2));
    const nextStatus = nextRemaining <= 0 ? 'paid' : 'partially_paid';

    if (shouldAffectWallet && walletId) {
      const nextWallets = wallets.map((w) => {
        if (w.id !== walletId) return w;
        const nextBalance = isLent
          ? Number((w.balance + amount).toFixed(2))
          : Number((w.balance - amount).toFixed(2));
        return { ...w, balance: nextBalance };
      });
      const ledgerTx: Transaction = {
        id: `t-repay-${Date.now()}`,
        walletId,
        type: isLent ? 'income' : 'expense',
        amount,
        category: isLent ? 'Repayment' : 'Debt Payment',
        description: isLent
          ? `Received repayment from ${debt.person}`
          : `Paid back ${debt.person}`,
        date: new Date().toISOString(),
      };
      saveTransactions([ledgerTx, ...transactions]);
      saveWallets(nextWallets);
    }

    saveDebts(
      debts.map((d) =>
        d.id === debtId
          ? { ...d, remainingAmount: nextRemaining, status: nextStatus }
          : d
      )
    );
  };

  const handleSettleDirectly = (debtId: string) => {
    saveDebts(
      debts.map((d) =>
        d.id === debtId
          ? { ...d, remainingAmount: 0, status: 'paid' as const }
          : d
      )
    );
  };

  const handleDeleteDebt = (debtId: string) => {
    saveDebts(debts.filter((d) => d.id !== debtId));
  };

  const handleOpenTxModal = (walletId?: string) => {
    setPreselectedWalletId(walletId);
    setEditingTransaction(null);
    setIsAddTxOpen(true);
  };

  const handleOpenEditTxModal = (tx: Transaction) => {
    setEditingTransaction(tx);
    setIsAddTxOpen(true);
  };

  const formatPHP = (value: number) =>
    new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);

  const displayedTransactions = transactions.filter((t) => {
    if (!txSearchQuery.trim()) return true;
    const q = txSearchQuery.toLowerCase();
    const w = wallets.find((wal) => wal.id === t.walletId);
    return (
      (t.description || '').toLowerCase().includes(q) ||
      (t.category || '').toLowerCase().includes(q) ||
      (w?.name || '').toLowerCase().includes(q) ||
      t.amount.toString().includes(q)
    );
  });

  const selectedWallet = wallets.find((w) => w.id === selectedWalletId);
  const isDark = themeMode === 'dark';

  useEffect(() => {
    let meta = document.querySelector('meta[name="theme-color"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'theme-color');
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', isDark ? '#0a0a0a' : '#f5f5f7');
  }, [isDark]);

  const muted = isDark ? 'muted-dark' : 'muted';
  const hairline = isDark ? 'line-dark' : 'line';

  return (
    <div className={isDark ? 'dark' : ''}>
      <div className={`min-h-screen ${isDark ? 'page-dark text-white' : 'page text-black'}`}>
        <section className="max-w-md mx-auto px-6 pt-14 pb-8 relative">
          <button
            type="button"
            onClick={() => setShowAnalyticsPanel(true)}
            className={`absolute top-12 right-4 p-2.5 rounded-full transition-colors z-10 min-w-[44px] min-h-[44px] flex items-center justify-center ${
              isDark ? 'text-white/50 hover:bg-white/10' : 'text-black/40 hover:bg-black/5'
            }`}
            aria-label="Insights"
          >
            <DynamicIcon name="BarChart3" size={18} />
          </button>

          <div className="text-center">
            <p className={`text-[11px] font-medium tracking-[0.14em] uppercase ${muted}`}>
              Net worth
            </p>
            <h1 className="tabular mt-3 text-[2.75rem] sm:text-[3.25rem] font-semibold tracking-[-0.04em] leading-[1.05]">
              {hideBalances ? '••••••' : formatPHP(totalNetWorth)}
            </h1>
            <div className={`mt-4 flex items-center justify-center gap-5 text-[13px] ${muted}`}>
              <span className="flex items-center gap-1.5">
                <span className={`inline-block h-1.5 w-1.5 rounded-full ${isDark ? 'bg-emerald-400' : 'bg-emerald-500'}`} />
                <span className={isDark ? 'text-emerald-400' : 'text-emerald-600'}>
                  {hideBalances ? '•••' : formatPHP(monthlyIncome)}
                </span>
                <span>in</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className={`inline-block h-1.5 w-1.5 rounded-full ${isDark ? 'bg-rose-400' : 'bg-rose-500'}`} />
                <span className={isDark ? 'text-rose-400' : 'text-rose-500'}>
                  {hideBalances ? '•••' : formatPHP(monthlyExpenses)}
                </span>
                <span>out</span>
              </span>
            </div>
          </div>
        </section>

        <main className="max-w-md mx-auto px-5 pb-36">
          {activeTab === 'wallets' && (
            <div className="space-y-2">
              {wallets.length === 0 ? (
                <div className={`text-center py-16 rounded-2xl ${isDark ? 'card-dark' : 'card'} ${muted}`}>
                  <p className="text-[15px] mb-5">Nothing here yet</p>
                  <button
                    type="button"
                    onClick={() => setIsAddWalletOpen(true)}
                    className={`px-5 py-2.5 rounded-full text-[14px] font-semibold ${
                      isDark ? 'bg-white text-black' : 'bg-black text-white'
                    }`}
                  >
                    Add wallet
                  </button>
                </div>
              ) : (
                wallets.map((w) => (
                  <WalletCard
                    key={w.id}
                    wallet={w}
                    hideBalances={hideBalances}
                    onClick={() => setSelectedWalletId(w.id)}
                    themeMode={themeMode}
                  />
                ))
              )}
            </div>
          )}

          {activeTab === 'activity' && (
            <div className="space-y-3">
              <input
                value={txSearchQuery}
                onChange={(e) => setTxSearchQuery(e.target.value)}
                placeholder="Search"
                className={`w-full px-4 py-3.5 rounded-xl text-[15px] outline-none ${
                  isDark
                    ? 'field-dark placeholder:text-white/30'
                    : 'field placeholder:text-black/30'
                }`}
              />
              <div
                className={`rounded-2xl overflow-hidden divide-y ${
                  isDark
                    ? 'card-dark divide-white/[0.06]'
                    : 'card divide-black/[0.05]'
                }`}
              >
                {displayedTransactions.slice(0, visibleTxCount).map((t) => (
                  <TransactionItem
                    key={t.id}
                    transaction={t}
                    wallets={wallets}
                    onClick={() => handleOpenEditTxModal(t)}
                    themeMode={themeMode}
                  />
                ))}
                {displayedTransactions.length === 0 && (
                  <p className={`text-center py-16 text-[14px] ${muted}`}>No transactions</p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'debts' && (
            <CreditsList
              debts={debts}
              wallets={wallets}
              onAddRepayment={handleAddRepayment}
              onSettleDirectly={handleSettleDirectly}
              onDeleteDebt={handleDeleteDebt}
              onOpenAddDebt={() => setIsAddDebtOpen(true)}
              themeMode={themeMode}
            />
          )}
        </main>

        <div className="fixed bottom-0 inset-x-0 z-30">
          <div className="max-w-md mx-auto px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
            <div
              className={`flex items-center rounded-full px-2 py-1.5 ${
                isDark ? 'dock-dark' : 'dock'
              }`}
            >
              {(
                [
                  { id: 'wallets' as const, label: 'Wallets', icon: 'Wallet' },
                  { id: 'activity' as const, label: 'Activity', icon: 'List' },
                ] as const
              ).map((tab) => {
                const active = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 flex flex-col items-center gap-0.5 py-1.5 rounded-full text-[10px] font-semibold transition-colors ${
                      active
                        ? isDark
                          ? 'text-white'
                          : 'text-black'
                        : muted
                    }`}
                  >
                    <DynamicIcon name={tab.icon} size={20} />
                    {tab.label}
                  </button>
                );
              })}

              <button
                type="button"
                onClick={() => {
                  if (activeTab === 'wallets') setIsAddWalletOpen(true);
                  else if (activeTab === 'activity') handleOpenTxModal();
                  else setIsAddDebtOpen(true);
                }}
                className={`mx-1 h-11 w-11 shrink-0 rounded-full flex items-center justify-center active:scale-95 transition-transform shadow-sm ${
                  isDark ? 'bg-white text-black' : 'bg-black text-white'
                }`}
                aria-label="Add"
              >
                <DynamicIcon name="Plus" size={22} />
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('debts')}
                className={`flex-1 flex flex-col items-center gap-0.5 py-1.5 rounded-full text-[10px] font-semibold transition-colors ${
                  activeTab === 'debts'
                    ? isDark
                      ? 'text-white'
                      : 'text-black'
                    : muted
                }`}
              >
                <DynamicIcon name="Users" size={20} />
                Debts
              </button>

              <button
                type="button"
                onClick={() => setIsSettingsOpen(true)}
                className={`flex-1 flex flex-col items-center gap-0.5 py-1.5 rounded-full text-[10px] font-semibold transition-colors ${muted}`}
              >
                <DynamicIcon name="Settings" size={20} />
                Settings
              </button>
            </div>
          </div>
        </div>

        <AddWalletModal
          isOpen={isAddWalletOpen}
          onClose={() => setIsAddWalletOpen(false)}
          onAdd={handleAddWallet}
          themeMode={themeMode}
        />
        <AddTransactionModal
          isOpen={isAddTxOpen}
          onClose={() => {
            setIsAddTxOpen(false);
            setEditingTransaction(null);
          }}
          wallets={wallets}
          onAdd={handleAddTransaction}
          onEdit={handleEditTransaction}
          onDelete={handleDeleteTransaction}
          preselectedWalletId={preselectedWalletId}
          editingTransaction={editingTransaction}
          themeMode={themeMode}
        />
        <AddCreditModal
          isOpen={isAddDebtOpen}
          onClose={() => setIsAddDebtOpen(false)}
          wallets={wallets}
          onAdd={handleAddDebt}
          themeMode={themeMode}
        />
        <SettingsModal
          lastBackupDate={lastBackupDate}
          onBackupComplete={() => setLastBackupDate(new Date().toISOString())}
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          themeMode={themeMode}
          onToggleTheme={toggleTheme}
          onResetApp={handleResetApp}
          hideBalances={hideBalances}
          onToggleHideBalances={toggleHideBalances}
        />

        <AnimatePresence>
          {showAnalyticsPanel && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.2 }}
              className={`fixed inset-0 z-50 flex flex-col ${isDark ? 'page-dark' : 'page'}`}
            >
              <div className={`flex items-center gap-2 px-4 h-14 border-b ${hairline}`}>
                <button
                  type="button"
                  onClick={() => setShowAnalyticsPanel(false)}
                  className={`p-2 rounded-full ${isDark ? 'hover:bg-white/10' : 'hover:bg-black/5'}`}
                >
                  <DynamicIcon name="X" size={18} />
                </button>
                <h2 className="text-[15px] font-semibold tracking-tight">Insights</h2>
              </div>
              <div className="flex-1 overflow-y-auto p-5">
                <OverviewCharts wallets={wallets} transactions={transactions} themeMode={themeMode} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {selectedWallet && (
          <WalletDetails
            wallet={selectedWallet}
            transactions={transactions.filter(
              (t) => t.walletId === selectedWallet.id || t.toWalletId === selectedWallet.id
            )}
            wallets={wallets}
            onBack={() => setSelectedWalletId(null)}
            onEditWallet={handleEditWallet}
            onDeleteWallet={handleDeleteWallet}
            onAddTransactionClick={(id) => handleOpenTxModal(id)}
            themeMode={themeMode}
          />
        )}
      </div>
    </div>
  );
}
