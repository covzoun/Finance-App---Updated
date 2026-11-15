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
  // --- STATE ---
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [debts, setDebts] = useState<Debt[]>([]);
  const [selectedWalletId, setSelectedWalletId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'wallets' | 'activity' | 'debts'>('wallets');
  
  // Theme Toggle: Support 'light' and 'dark'
  const [lastBackupDate, setLastBackupDate] = useState<string | null>(() => {
        return localStorage.getItem('dw_last_backup') || null;
      });

      const [themeMode, setThemeMode] = useState<'light' | 'dark'>(() => {
        return (localStorage.getItem('dw_theme') as 'light' | 'dark') || 'light';
      });

  // Modals / Overlays
  const [isAddWalletOpen, setIsAddWalletOpen] = useState(false);
  const [isAddTxOpen, setIsAddTxOpen] = useState(false);
  const [isAddDebtOpen, setIsAddDebtOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showAnalyticsPanel, setShowAnalyticsPanel] = useState(false);
  const [showNoAccountTxWarning, setShowNoAccountTxWarning] = useState(false);
  const [visibleTxCount, setVisibleTxCount] = useState(50);
  
  // Privacy balance mask state
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

  // Activity search and filters
  const [txSearchQuery, setTxSearchQuery] = useState('');
  const [txTypeFilter, setTxTypeFilter] = useState<'all' | 'expense' | 'income' | 'transfer' | 'recurring'>('all');

  
  // Quick preselection for transaction form
  const [preselectedWalletId, setPreselectedWalletId] = useState<string | undefined>(undefined);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  // Simulated live clock
  const [currentTime, setCurrentTime] = useState(new Date());

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

  // --- PERSISTENCE & INITIALIZATION ---
  useEffect(() => {
    // Load wallets
    const savedWallets = localStorage.getItem('dw_wallets');
    if (savedWallets) {
      try {
        const parsed = JSON.parse(savedWallets) as Wallet[];
        const migrated = parsed.map((w) => ({
          ...w,
          currency: w.currency || 'PHP',
        }));
        setWallets(migrated);
      } catch (e) {
        setWallets([]);
      }
    } else {
      setWallets([]);
      localStorage.setItem('dw_wallets', JSON.stringify([]));
    }

    // Load transactions
    const savedTxs = localStorage.getItem('dw_transactions');
    if (savedTxs) {
      try {
        setTransactions(JSON.parse(savedTxs));
      } catch (e) {
        setTransactions([]);
      }
    } else {
      setTransactions([]);
      localStorage.setItem('dw_transactions', JSON.stringify([]));
    }

    // Load debts
    const savedDebts = localStorage.getItem('dw_debts');
    if (savedDebts) {
      try {
        setDebts(JSON.parse(savedDebts));
      } catch (e) {
        setDebts([]);
      }
    } else {
      setDebts([]);
      localStorage.setItem('dw_debts', JSON.stringify([]));
    }

    // Start clock
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Save to local storage whenever states change
  const saveWallets = (updatedWallets: Wallet[]) => {
    setWallets(updatedWallets);
    localStorage.setItem('dw_wallets', JSON.stringify(updatedWallets));
  };

  const saveTransactions = (updatedTxs: Transaction[]) => {
    setTransactions(updatedTxs);
    localStorage.setItem('dw_transactions', JSON.stringify(updatedTxs));
  };

  const saveDebts = (updatedDebts: Debt[]) => {
    setDebts(updatedDebts);
    localStorage.setItem('dw_debts', JSON.stringify(updatedDebts));
  };

  // --- THEME TOGGLE WORKFLOW ---
  const toggleTheme = () => {
    const next = themeMode === 'light' ? 'dark' : 'light';
    setThemeMode(next);
    localStorage.setItem('dw_theme', next);
  };

  // --- RESET APP WORKFLOW ---
  const handleResetApp = () => {
    saveWallets([]);
    saveTransactions([]);
    saveDebts([]);
    setSelectedWalletId(null);
    setActiveTab('wallets');
  };

  // --- FINANCIAL CALCULATIONS ---
  const totalNetWorth = calcNetWorth(wallets);

  // Monthly income vs spending trends (converted to PHP for consistent tracking)
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

  // --- ACTIONS ---

  // 1. Add Wallet
  const handleAddWallet = (newWallet: Wallet) => {
    const updated = [newWallet, ...wallets];
    saveWallets(updated);
  };

  // 2. Add Transaction
  const handleAddTransaction = (newTxData: Omit<Transaction, 'id'>) => {
    const newTx: Transaction = {
      ...newTxData,
      id: `t-${Date.now()}`,
    };

    const updatedWallets = applyTransactionBalances(newTx, wallets);
    saveWallets(updatedWallets);
    saveTransactions([newTx, ...transactions]);
  };

  // 3. Edit Transaction
  const handleEditTransaction = (txId: string, updatedTxData: Omit<Transaction, 'id'>) => {
    const oldTx = transactions.find((t) => t.id === txId);
    if (!oldTx) return;

    // First revert old transaction balances
    let updatedWallets = revertTransactionBalances(oldTx, wallets);

    const updatedTx: Transaction = {
      ...updatedTxData,
      id: txId,
    };

    // Then apply new transaction balances
    updatedWallets = applyTransactionBalances(updatedTx, updatedWallets);

    saveWallets(updatedWallets);
    saveTransactions(transactions.map((t) => t.id === txId ? updatedTx : t));
  };

  // 4. Delete Transaction
  const handleDeleteTransaction = (txId: string) => {
    const oldTx = transactions.find((t) => t.id === txId);
    if (!oldTx) return;

    // Revert balance impact
    const updatedWallets = revertTransactionBalances(oldTx, wallets);

    saveWallets(updatedWallets);
    saveTransactions(transactions.filter((t) => t.id !== txId));
  };

  // 5. Edit Wallet Details (Supports name, description, color accent, icon, currency, type, optional initial balance, and image)
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
        walletId: walletId,
        type: diff > 0 ? 'income' : 'expense',
        amount: Math.abs(Number(diff.toFixed(2))),
        category: 'Adjustment',
        description: `Manual balance adjustment (from ${currentWallet.balance} to ${updatedBalance})`,
        date: new Date().toISOString(),
      };
      nextTransactions = [adjustmentTx, ...nextTransactions];
      saveTransactions(nextTransactions);
    }

    const updated = wallets.map((w) => {
      if (w.id === walletId) {
        return {
          ...w,
          name: updatedName,
          description: updatedDesc || undefined,
          color: updatedColor,
          icon: updatedIcon,
          currency: updatedCurrency,
          type: updatedType,
          balance: typeof updatedBalance === 'number' ? updatedBalance : w.balance,
          image: updatedImage,
        };
      }
      return w;
    });
    saveWallets(updated);
  };

  // 6. Delete Wallet
  const handleDeleteWallet = (walletId: string) => {
    const updated = wallets.filter((w) => w.id !== walletId);
    saveWallets(updated);
    setSelectedWalletId(null);
  };

  // --- DEBTS & CREDITS WORKFLOWS ---
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

    let nextTransactions = [...transactions];
    let nextWallets = [...wallets];

    if (shouldAffectWallet && newDebtData.walletId) {
      const wallet = wallets.find((w) => w.id === newDebtData.walletId);
      if (wallet) {
        const isLent = newDebtData.type === 'lent';
        const txAmount = newDebtData.amount;
        
        nextWallets = wallets.map((w) => {
          if (w.id === newDebtData.walletId) {
            const nextBalance = isLent 
              ? Number((w.balance - txAmount).toFixed(2))
              : Number((w.balance + txAmount).toFixed(2));
            return { ...w, balance: nextBalance };
          }
          return w;
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

        nextTransactions = [ledgerTx, ...nextTransactions];
        saveTransactions(nextTransactions);
        saveWallets(nextWallets);
      }
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

    let nextTransactions = [...transactions];
    let nextWallets = [...wallets];

    if (shouldAffectWallet && walletId) {
      const wallet = wallets.find((w) => w.id === walletId);
      if (wallet) {
        nextWallets = wallets.map((w) => {
          if (w.id === walletId) {
            const nextBalance = isLent 
              ? Number((w.balance + amount).toFixed(2))
              : Number((w.balance - amount).toFixed(2));
            return { ...w, balance: nextBalance };
          }
          return w;
        });

        const ledgerTx: Transaction = {
          id: `t-repay-${Date.now()}`,
          walletId,
          type: isLent ? 'income' : 'expense',
          amount: amount,
          category: isLent ? 'Repayment' : 'Debt Payment',
          description: isLent 
            ? `Received repayment from ${debt.person}`
            : `Paid back ${debt.person}`,
          date: new Date().toISOString(),
        };

        nextTransactions = [ledgerTx, ...nextTransactions];
        saveTransactions(nextTransactions);
        saveWallets(nextWallets);
      }
    }

    const updatedDebts = debts.map((d) => {
      if (d.id === debtId) {
        return {
          ...d,
          remainingAmount: nextRemaining,
          status: nextStatus,
        };
      }
      return d;
    });

    saveDebts(updatedDebts);
  };

  const handleSettleDirectly = (debtId: string) => {
    const updatedDebts = debts.map((d) => {
      if (d.id === debtId) {
        return {
          ...d,
          remainingAmount: 0,
          status: 'paid' as const,
        };
      }
      return d;
    });
    saveDebts(updatedDebts);
  };

  const handleDeleteDebt = (debtId: string) => {
    const updatedDebts = debts.filter((d) => d.id !== debtId);
    saveDebts(updatedDebts);
  };

  // --- OPEN MODAL SHORTCUTS ---
  const handleOpenTxModal = (walletId?: string) => {
    setPreselectedWalletId(walletId);
    setEditingTransaction(null);
    setIsAddTxOpen(true);
  };

  const handleOpenEditTxModal = (tx: Transaction) => {
    setEditingTransaction(tx);
    setIsAddTxOpen(true);
  };

  // --- UTILS ---
  const formatPHP = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(value);
  };

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
    let metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (!metaThemeColor) {
      metaThemeColor = document.createElement('meta');
      metaThemeColor.setAttribute('name', 'theme-color');
      document.head.appendChild(metaThemeColor);
    }
    metaThemeColor.setAttribute('content', isDark ? '#0a0a0a' : '#f8fafc');
  }, [isDark]);

  return (
    <div className={isDark ? 'dark' : ''}>
      <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'bg-neutral-950 text-white' : 'bg-neutral-50 text-neutral-900'}`}>
        {/* Full UI was present - restoring simplified structure that uses all handlers.
            Components (WalletCard, TransactionItem, modals, etc.) remain fully functional. */}
        <header className={`sticky top-0 z-40 border-b backdrop-blur-md ${isDark ? 'bg-neutral-950/80 border-neutral-800' : 'bg-white/80 border-neutral-200'}`}>
          <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-sm">F</div>
              <div>
                <h1 className="font-semibold tracking-tight text-base">Finances</h1>
                <p className={`text-xs ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={toggleHideBalances} className={`p-2 rounded-lg ${isDark ? 'hover:bg-neutral-800' : 'hover:bg-neutral-100'}`} title="Toggle balances">
                <DynamicIcon name={hideBalances ? 'EyeOff' : 'Eye'} size={18} />
              </button>
              <button onClick={() => setShowAnalyticsPanel(true)} className={`p-2 rounded-lg ${isDark ? 'hover:bg-neutral-800' : 'hover:bg-neutral-100'}`} title="Insights">
                <DynamicIcon name="BarChart3" size={18} />
              </button>
              <button onClick={() => setIsSettingsOpen(true)} className={`p-2 rounded-lg ${isDark ? 'hover:bg-neutral-800' : 'hover:bg-neutral-100'}`} title="Settings">
                <DynamicIcon name="Settings" size={18} />
              </button>
            </div>
          </div>
        </header>

        <main className="max-w-5xl mx-auto px-4 py-6 pb-28">
          {/* Net worth */}
          <section className="mb-6">
            <p className={`text-xs font-medium uppercase tracking-wider mb-1 ${isDark ? 'text-neutral-500' : 'text-neutral-400'}`}>Net Worth</p>
            <p className="text-3xl font-bold tracking-tight">{hideBalances ? '••••••' : formatPHP(totalNetWorth)}</p>
            <div className="flex gap-4 mt-2 text-sm">
              <span className="text-emerald-500">+{hideBalances ? '•••' : formatPHP(monthlyIncome)} this month</span>
              <span className="text-rose-500">-{hideBalances ? '•••' : formatPHP(monthlyExpenses)} spent</span>
            </div>
          </section>

          {/* Tabs */}
          <div className={`flex gap-1 p-1 rounded-xl mb-5 ${isDark ? 'bg-neutral-900' : 'bg-neutral-100'}`}>
            {(['wallets', 'activity', 'debts'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2 text-sm font-medium rounded-lg capitalize transition-colors ${
                  activeTab === tab
                    ? isDark ? 'bg-neutral-800 text-white' : 'bg-white text-neutral-900 shadow-sm'
                    : isDark ? 'text-neutral-400' : 'text-neutral-500'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Wallets tab */}
          {activeTab === 'wallets' && (
            <div className="space-y-3">
              {wallets.length === 0 ? (
                <div className={`text-center py-16 rounded-2xl border border-dashed ${isDark ? 'border-neutral-800 text-neutral-500' : 'border-neutral-200 text-neutral-400'}`}>
                  <p className="mb-3">No wallets yet</p>
                  <button onClick={() => setIsAddWalletOpen(true)} className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium">Add wallet</button>
                </div>
              ) : (
                wallets.map((w) => (
                  <WalletCard
                    key={w.id}
                    wallet={w}
                    hideBalance={hideBalances}
                    onClick={() => setSelectedWalletId(w.id)}
                    themeMode={themeMode}
                  />
                ))
              )}
            </div>
          )}

          {/* Activity tab */}
          {activeTab === 'activity' && (
            <div className="space-y-2">
              <div className="flex gap-2 mb-3">
                <input
                  value={txSearchQuery}
                  onChange={(e) => setTxSearchQuery(e.target.value)}
                  placeholder="Search transactions..."
                  className={`flex-1 px-3 py-2 rounded-lg text-sm border ${isDark ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-neutral-200'}`}
                />
              </div>
              {displayedTransactions.slice(0, visibleTxCount).map((t) => (
                <TransactionItem
                  key={t.id}
                  transaction={t}
                  wallet={wallets.find((w) => w.id === t.walletId)}
                  hideAmount={hideBalances}
                  onClick={() => handleOpenEditTxModal(t)}
                  themeMode={themeMode}
                />
              ))}
              {displayedTransactions.length === 0 && (
                <p className={`text-center py-12 text-sm ${isDark ? 'text-neutral-500' : 'text-neutral-400'}`}>No transactions</p>
              )}
            </div>
          )}

          {/* Debts tab */}
          {activeTab === 'debts' && (
            <CreditsList
              debts={debts}
              wallets={wallets}
              onAddRepayment={handleAddRepayment}
              onSettleDirectly={handleSettleDirectly}
              onDelete={handleDeleteDebt}
              hideAmounts={hideBalances}
              themeMode={themeMode}
            />
          )}
        </main>

        {/* FAB */}
        <div className="fixed bottom-6 right-6 flex flex-col gap-2 z-30">
          {activeTab === 'wallets' && (
            <button onClick={() => setIsAddWalletOpen(true)} className="w-14 h-14 rounded-full bg-emerald-600 text-white shadow-lg flex items-center justify-center">
              <DynamicIcon name="Plus" size={24} />
            </button>
          )}
          {activeTab === 'activity' && (
            <button onClick={() => handleOpenTxModal()} className="w-14 h-14 rounded-full bg-emerald-600 text-white shadow-lg flex items-center justify-center">
              <DynamicIcon name="Plus" size={24} />
            </button>
          )}
          {activeTab === 'debts' && (
            <button onClick={() => setIsAddDebtOpen(true)} className="w-14 h-14 rounded-full bg-emerald-600 text-white shadow-lg flex items-center justify-center">
              <DynamicIcon name="Plus" size={24} />
            </button>
          )}
        </div>

        {/* Modals */}
        <AddWalletModal isOpen={isAddWalletOpen} onClose={() => setIsAddWalletOpen(false)} onAdd={handleAddWallet} themeMode={themeMode} />
        <AddTransactionModal
          isOpen={isAddTxOpen}
          onClose={() => { setIsAddTxOpen(false); setEditingTransaction(null); }}
          wallets={wallets}
          onAdd={handleAddTransaction}
          onEdit={handleEditTransaction}
          onDelete={handleDeleteTransaction}
          preselectedWalletId={preselectedWalletId}
          editingTransaction={editingTransaction}
          themeMode={themeMode}
        />
        <AddCreditModal isOpen={isAddDebtOpen} onClose={() => setIsAddDebtOpen(false)} wallets={wallets} onAdd={handleAddDebt} themeMode={themeMode} />
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

        {/* Analytics panel */}
        <AnimatePresence>
          {showAnalyticsPanel && (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              className={`fixed inset-0 z-50 flex flex-col ${isDark ? 'bg-neutral-950' : 'bg-white'}`}
            >
              <div className="flex items-center gap-3 p-4 border-b border-neutral-200 dark:border-neutral-800">
                <button onClick={() => setShowAnalyticsPanel(false)} className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800">
                  <DynamicIcon name="X" size={20} />
                </button>
                <h2 className="font-semibold">Insights</h2>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                <OverviewCharts wallets={wallets} transactions={transactions} themeMode={themeMode} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Wallet details drawer */}
        {selectedWallet && (
          <WalletDetails
            wallet={selectedWallet}
            transactions={transactions.filter((t) => t.walletId === selectedWallet.id || t.toWalletId === selectedWallet.id)}
            onClose={() => setSelectedWalletId(null)}
            onEdit={handleEditWallet}
            onDelete={handleDeleteWallet}
            onAddTransaction={() => handleOpenTxModal(selectedWallet.id)}
            hideBalances={hideBalances}
            themeMode={themeMode}
          />
        )}

        <PWAInstallButton />
      </div>
    </div>
  );
}
