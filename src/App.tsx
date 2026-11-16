import { useState, useEffect } from 'react';
import { Wallet, Transaction, Debt } from './types';
import WalletCard from './components/WalletCard';
import TransactionItem from './components/TransactionItem';
import WalletDetails from './components/WalletDetails';
import AddWalletModal from './components/AddWalletModal';
import AddTransactionModal from './components/AddTransactionModal';
import SettingsModal from './components/SettingsModal';
import { PWAInstallButton } from './components/PWAInstallButton';
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

  const [lastBackupDate, setLastBackupDate] = useState<string | null>(() => {
    return localStorage.getItem('dw_last_backup') || null;
  });

  const [themeMode, setThemeMode] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('dw_theme') as 'light' | 'dark') || 'light';
  });

  const [isAddWalletOpen, setIsAddWalletOpen] = useState(false);
  const [isAddTxOpen, setIsAddTxOpen] = useState(false);
  const [isAddDebtOpen, setIsAddDebtOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showAnalyticsPanel, setShowAnalyticsPanel] = useState(false);
  const [visibleTxCount] = useState(50);

  const [hideBalances, setHideBalances] = useState<boolean>(() => {
    return localStorage.getItem('dw_hide_balances') === 'true';
  });

  const toggleHideBalances = () => {
    setHideBalances((prev) => {
      const next = !prev;
      localStorage.setItem('dw_hide_balances', String(next));
      return next;
    });
  };

  const [txSearchQuery, setTxSearchQuery] = useState('');
  const [txTypeFilter] = useState<'all' | 'expense' | 'income' | 'transfer' | 'recurring'>('all');

  const [preselectedWalletId, setPreselectedWalletId] = useState<string | undefined>(undefined);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  useEffect(() => {
    if (isAddWalletOpen || isAddTxOpen || isAddDebtOpen || isSettingsOpen || selectedWalletId) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isAddWalletOpen, isAddTxOpen, isAddDebtOpen, isSettingsOpen, selectedWalletId]);

  useEffect(() => {
    const savedWallets = localStorage.getItem('dw_wallets');
    if (savedWallets) {
      try {
        const parsed = JSON.parse(savedWallets) as Wallet[];
        setWallets(parsed.map((w) => ({ ...w, currency: w.currency || 'PHP' })));
      } catch {
        setWallets([]);
      }
    } else {
      setWallets([]);
      localStorage.setItem('dw_wallets', JSON.stringify([]));
    }

    const savedTxs = localStorage.getItem('dw_transactions');
    if (savedTxs) {
      try {
        setTransactions(JSON.parse(savedTxs));
      } catch {
        setTransactions([]);
      }
    } else {
      setTransactions([]);
      localStorage.setItem('dw_transactions', JSON.stringify([]));
    }

    const savedDebts = localStorage.getItem('dw_debts');
    if (savedDebts) {
      try {
        setDebts(JSON.parse(savedDebts));
      } catch {
        setDebts([]);
      }
    } else {
      setDebts([]);
      localStorage.setItem('dw_debts', JSON.stringify([]));
    }
  }, []);

  const saveWallets = (updated: Wallet[]) => {
    setWallets(updated);
    localStorage.setItem('dw_wallets', JSON.stringify(updated));
  };

  const saveTransactions = (updated: Transaction[]) => {
    setTransactions(updated);
    localStorage.setItem('dw_transactions', JSON.stringify(updated));
  };

  const saveDebts = (updated: Debt[]) => {
    setDebts(updated);
    localStorage.setItem('dw_debts', JSON.stringify(updated));
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
      return t.type === 'expense' && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    })
    .reduce((sum, t) => sum + getTxPHPValue(t), 0);

  const monthlyIncome = transactions
    .filter((t) => {
      const d = new Date(t.date);
      return t.type === 'income' && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
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

  const handleEditTransaction = (txId: string, updatedTxData: Omit<Transaction, 'id'>) => {
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
    let nextTransactions = [...transactions];

    if (currentWallet && typeof updatedBalance === 'number' && updatedBalance !== currentWallet.balance) {
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
      nextTransactions = [adjustmentTx, ...nextTransactions];
      saveTransactions(nextTransactions);
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
              balance: typeof updatedBalance === 'number' ? updatedBalance : w.balance,
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
    newDebtData: Omit<Debt, 'id' | 'status' | 'remainingAmount'> & { date?: string },
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
          ? `Lent money to ${newDebtData.person}${newDebtData.description ? ` (${newDebtData.description})` : ''}`
          : `Borrowed money from ${newDebtData.person}${newDebtData.description ? ` (${newDebtData.description})` : ''}`,
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
        d.id === debtId ? { ...d, remainingAmount: nextRemaining, status: nextStatus } : d
      )
    );
  };

  const handleSettleDirectly = (debtId: string) => {
    saveDebts(
      debts.map((d) =>
        d.id === debtId ? { ...d, remainingAmount: 0, status: 'paid' as const } : d
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
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(value);

  const displayedTransactions = transactions.filter((t) => {
    if (txTypeFilter === 'expense' && t.type !== 'expense') return false;
    if (txTypeFilter === 'income' && t.type !== 'income') return false;
    if (txTypeFilter === 'transfer' && t.type !== 'transfer') return false;
    if (txTypeFilter === 'recurring' && !t.isRecurring) return false;
    if (txSearchQuery.trim()) {
      const q = txSearchQuery.toLowerCase();
      const matchDesc = (t.description || '').toLowerCase().includes(q);
      const matchCat = (t.category || '').toLowerCase().includes(q);
      const w = wallets.find((wal) => wal.id === t.walletId);
      const matchWallet = (w?.name || '').toLowerCase().includes(q);
      const matchAmount = t.amount.toString().includes(q);
      if (!matchDesc && !matchCat && !matchWallet && !matchAmount) return false;
    }
    return true;
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
    meta.setAttribute('content', isDark ? '#09090b' : '#fafafa');
  }, [isDark]);

  return (
    <div className={isDark ? 'dark' : ''}>
      <div
        className={`min-h-screen transition-colors duration-200 ${
          isDark ? 'bg-zinc-950 text-zinc-50' : 'bg-zinc-50 text-zinc-900'
        }`}
      >
        <header
          className={`sticky top-0 z-40 border-b backdrop-blur-xl ${
            isDark
              ? 'bg-zinc-950/80 border-zinc-800/80'
              : 'bg-zinc-50/80 border-zinc-200/80'
          }`}
        >
          <div className="max-w-lg mx-auto px-5 h-14 flex items-center justify-between">
            <h1 className="text-[15px] font-semibold tracking-tight">Finances</h1>
            <div className="flex items-center gap-0.5">
              <button
                onClick={toggleHideBalances}
                className={`p-2 rounded-lg transition-colors ${
                  isDark ? 'hover:bg-zinc-800 text-zinc-400' : 'hover:bg-zinc-200/60 text-zinc-500'
                }`}
                title="Hide balances"
              >
                <DynamicIcon name={hideBalances ? 'EyeOff' : 'Eye'} size={18} />
              </button>
              <button
                onClick={() => setShowAnalyticsPanel(true)}
                className={`p-2 rounded-lg transition-colors ${
                  isDark ? 'hover:bg-zinc-800 text-zinc-400' : 'hover:bg-zinc-200/60 text-zinc-500'
                }`}
                title="Insights"
              >
                <DynamicIcon name="BarChart3" size={18} />
              </button>
              <button
                onClick={() => setIsSettingsOpen(true)}
                className={`p-2 rounded-lg transition-colors ${
                  isDark ? 'hover:bg-zinc-800 text-zinc-400' : 'hover:bg-zinc-200/60 text-zinc-500'
                }`}
                title="Settings"
              >
                <DynamicIcon name="Settings" size={18} />
              </button>
            </div>
          </div>
        </header>

        <main className="max-w-lg mx-auto px-5 pt-8 pb-28">
          <section className="mb-8">
            <p
              className={`text-[11px] font-medium uppercase tracking-[0.08em] mb-1.5 ${
                isDark ? 'text-zinc-500' : 'text-zinc-400'
              }`}
            >
              Net worth
            </p>
            <p className="tabular text-[2rem] font-semibold tracking-tight leading-none">
              {hideBalances ? '••••••' : formatPHP(totalNetWorth)}
            </p>
            <div
              className={`flex gap-4 mt-3 text-[12px] ${
                isDark ? 'text-zinc-500' : 'text-zinc-400'
              }`}
            >
              <span>
                <span className={isDark ? 'text-emerald-400' : 'text-emerald-600'}>
                  {hideBalances ? '•••' : `+${formatPHP(monthlyIncome)}`}
                </span>{' '}
                in
              </span>
              <span>
                <span className={isDark ? 'text-rose-400' : 'text-rose-500'}>
                  {hideBalances ? '•••' : `−${formatPHP(monthlyExpenses)}`}
                </span>{' '}
                out
              </span>
            </div>
          </section>

          <div
            className={`flex p-0.5 rounded-xl mb-5 ${
              isDark ? 'bg-zinc-900' : 'bg-zinc-200/70'
            }`}
          >
            {(['wallets', 'activity', 'debts'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-1.5 text-[12px] font-medium rounded-[10px] capitalize transition-all ${
                  activeTab === tab
                    ? isDark
                      ? 'bg-zinc-800 text-zinc-50 shadow-sm'
                      : 'bg-white text-zinc-900 shadow-sm'
                    : isDark
                      ? 'text-zinc-500'
                      : 'text-zinc-500'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {activeTab === 'wallets' && (
            <div className="space-y-2">
              {wallets.length === 0 ? (
                <div
                  className={`text-center py-20 rounded-2xl border border-dashed ${
                    isDark ? 'border-zinc-800 text-zinc-500' : 'border-zinc-200 text-zinc-400'
                  }`}
                >
                  <p className="text-[13px] mb-4">No wallets yet</p>
                  <button
                    onClick={() => setIsAddWalletOpen(true)}
                    className={`px-4 py-2 rounded-full text-[12px] font-medium ${
                      isDark ? 'bg-zinc-100 text-zinc-900' : 'bg-zinc-900 text-white'
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
            <div className="space-y-1">
              <input
                value={txSearchQuery}
                onChange={(e) => setTxSearchQuery(e.target.value)}
                placeholder="Search"
                className={`w-full mb-3 px-3.5 py-2.5 rounded-xl text-[13px] border outline-none transition-colors ${
                  isDark
                    ? 'bg-zinc-900 border-zinc-800 placeholder:text-zinc-600 focus:border-zinc-600'
                    : 'bg-white border-zinc-200 placeholder:text-zinc-400 focus:border-zinc-300'
                }`}
              />
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
                <p
                  className={`text-center py-16 text-[13px] ${
                    isDark ? 'text-zinc-600' : 'text-zinc-400'
                  }`}
                >
                  No transactions
                </p>
              )}
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

        <div className="fixed bottom-6 inset-x-0 z-30 pointer-events-none">
          <div className="max-w-lg mx-auto px-5 flex justify-end pointer-events-auto">
            <button
              onClick={() => {
                if (activeTab === 'wallets') setIsAddWalletOpen(true);
                else if (activeTab === 'activity') handleOpenTxModal();
                else setIsAddDebtOpen(true);
              }}
              className={`h-12 w-12 rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-95 ${
                isDark ? 'bg-zinc-100 text-zinc-900' : 'bg-zinc-900 text-white'
              }`}
            >
              <DynamicIcon name="Plus" size={22} />
            </button>
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
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 24 }}
              transition={{ duration: 0.2 }}
              className={`fixed inset-0 z-50 flex flex-col ${
                isDark ? 'bg-zinc-950' : 'bg-white'
              }`}
            >
              <div
                className={`flex items-center gap-2 px-4 h-14 border-b ${
                  isDark ? 'border-zinc-800' : 'border-zinc-200'
                }`}
              >
                <button
                  onClick={() => setShowAnalyticsPanel(false)}
                  className={`p-2 rounded-lg ${
                    isDark ? 'hover:bg-zinc-800' : 'hover:bg-zinc-100'
                  }`}
                >
                  <DynamicIcon name="X" size={18} />
                </button>
                <h2 className="text-[14px] font-semibold">Insights</h2>
              </div>
              <div className="flex-1 overflow-y-auto p-5">
                <OverviewCharts
                  wallets={wallets}
                  transactions={transactions}
                  themeMode={themeMode}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {selectedWallet && (
          <WalletDetails
            wallet={selectedWallet}
            transactions={transactions.filter(
              (t) =>
                t.walletId === selectedWallet.id ||
                t.toWalletId === selectedWallet.id
            )}
            wallets={wallets}
            onBack={() => setSelectedWalletId(null)}
            onEditWallet={handleEditWallet}
            onDeleteWallet={handleDeleteWallet}
            onAddTransactionClick={(id) => handleOpenTxModal(id)}
            themeMode={themeMode}
          />
        )}

        <PWAInstallButton />
      </div>
    </div>
  );
}
