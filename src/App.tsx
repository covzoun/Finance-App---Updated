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

  // Conversion rate configuration
  const USD_RATE = 58.5;

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
  // Convert any USD balance to PHP for the overall Net Worth calculation
  const getPHPValue = (amount: number, currency?: 'PHP' | 'USD') => {
    return (currency || 'PHP') === 'USD' ? amount * USD_RATE : amount;
  };

  const totalNetWorth = wallets.reduce((sum, wallet) => {
    return sum + getPHPValue(wallet.balance, wallet.currency || 'PHP');
  }, 0);

  // Monthly income vs spending trends (converted to PHP for consistent tracking)
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  const getTxPHPValue = (t: Transaction) => {
    const w = wallets.find((wal) => wal.id === t.walletId);
    return getPHPValue(t.amount, w?.currency || 'PHP');
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

  // --- DOUBLE ENTRY LEDGER REVERT / APPLY WORKFLOWS ---
  const revertTransactionBalances = (t: Transaction, currentWallets: Wallet[]) => {
    return currentWallets.map((w) => {
      if (w.id === t.walletId) {
        if (t.type === 'expense') {
          return { ...w, balance: Number((w.balance + t.amount).toFixed(2)) };
        }
        if (t.type === 'income') {
          return { ...w, balance: Number((w.balance - t.amount).toFixed(2)) };
        }
        if (t.type === 'transfer') {
          return { ...w, balance: Number((w.balance + t.amount).toFixed(2)) };
        }
      }
      if (t.type === 'transfer' && w.id === t.toWalletId) {
        const sourceWallet = currentWallets.find((sw) => sw.id === t.walletId);
        let finalTransferAmount = t.amount;
        if (sourceWallet && sourceWallet.currency !== w.currency) {
          if (sourceWallet.currency === 'USD' && w.currency === 'PHP') {
            finalTransferAmount = t.amount * USD_RATE;
          } else if (sourceWallet.currency === 'PHP' && w.currency === 'USD') {
            finalTransferAmount = t.amount / USD_RATE;
          }
        }
        return { ...w, balance: Number((w.balance - finalTransferAmount).toFixed(2)) };
      }
      return w;
    });
  };

  const applyTransactionBalances = (t: Transaction, currentWallets: Wallet[]) => {
    return currentWallets.map((w) => {
      if (w.id === t.walletId) {
        if (t.type === 'expense') {
          return { ...w, balance: Number((w.balance - t.amount).toFixed(2)) };
        }
        if (t.type === 'income') {
          return { ...w, balance: Number((w.balance + t.amount).toFixed(2)) };
        }
        if (t.type === 'transfer') {
          return { ...w, balance: Number((w.balance - t.amount).toFixed(2)) };
        }
      }
      if (t.type === 'transfer' && w.id === t.toWalletId) {
        const sourceWallet = currentWallets.find((sw) => sw.id === t.walletId);
        let finalTransferAmount = t.amount;
        if (sourceWallet && sourceWallet.currency !== w.currency) {
          if (sourceWallet.currency === 'USD' && w.currency === 'PHP') {
            finalTransferAmount = t.amount * USD_RATE;
          } else if (sourceWallet.currency === 'PHP' && w.currency === 'USD') {
            finalTransferAmount = t.amount / USD_RATE;
          }
        }
        return { ...w, balance: Number((w.balance + finalTransferAmount).toFixed(2)) };
      }
      return w;
    });
  };

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
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', isDark ? '#121212' : '#f8fafc');
    }
    document.body.style.backgroundColor = isDark ? '#121212' : '#f8fafc';
    document.documentElement.style.backgroundColor = isDark ? '#121212' : '#f8fafc';
  }, [isDark]);


  return (
    <div className={`h-full h-dvh max-h-dvh w-full flex justify-center font-sans antialiased selection:bg-blue-500/30 selection:text-neutral-900 transition-colors duration-200 overflow-hidden ${
      isDark ? 'bg-neutral-900 text-neutral-50' : 'bg-neutral-50 text-neutral-900'
    }`} id="main-root">
      
      {/* 
        ===========================================
        INTERNAL APPLICATION CONTENT VIEWPORT 
        ===========================================
      */}
      <div className={`w-full max-w-3xl h-full flex flex-col min-h-0 relative transition-colors shadow-xl sm:border-x overflow-hidden ${
        isDark ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-neutral-200'
      }`} id="app-viewport">
        
        <AnimatePresence mode="wait">
            {selectedWallet ? (
              /* 
                1. ACCOUNT DETAIL VIEW PANEL (Slide in overlay)
              */
              <motion.div
                key="details"
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 24, stiffness: 220 }}
                className="absolute inset-0 z-20 flex flex-col h-full overflow-hidden"
              >
                <WalletDetails
                  wallet={selectedWallet}
                  transactions={transactions}
                  wallets={wallets}
                  onBack={() => setSelectedWalletId(null)}
                  onAddTransactionClick={handleOpenTxModal}
                  onDeleteWallet={handleDeleteWallet}
                  onEditWallet={handleEditWallet}
                  themeMode={themeMode}
                />
              </motion.div>
            ) : (
              /* 
                2. PRIMARY DASHBOARD SCREEN
              */
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex-1 flex flex-col min-h-0 h-full overflow-hidden relative"
              >
                <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain pb-36 flex flex-col">
                  {/* Subtle Low-Opacity Top-Right Settings Button */}
                  <div className="px-6 pt-6 flex items-center justify-end shrink-0">
                    <button
                      onClick={() => setIsSettingsOpen(true)}
                      className={`p-2 rounded-full opacity-35 hover:opacity-90 active:opacity-100 transition-all cursor-pointer ${
                        isDark 
                          ? 'text-neutral-400 hover:bg-neutral-800 hover:text-white' 
                          : 'text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900'
                      }`}
                      title="Settings"
                    >
                      <DynamicIcon name="Settings" size={17} />
                    </button>
                  </div>

                  {/* Sleek Integrated Net Worth Display */}
                  <section className="pt-8 pb-12 flex flex-col items-center justify-center shrink-0">
                    <span className={`text-[10px] font-bold uppercase tracking-[0.2em] mb-3 ${
                      isDark ? 'text-neutral-400' : 'text-neutral-500'
                    }`}>Total Assets</span>
                    <div className="flex items-baseline gap-2">
                      <span className={`text-3xl font-light ${isDark ? 'text-neutral-500' : 'text-neutral-400'}`}>₱</span>
                      <span className={`text-5xl font-black tracking-tight ${
                        isDark ? 'text-neutral-50' : 'text-neutral-900'
                      }`}>
                        {hideBalances ? '••••••' : new Intl.NumberFormat('en-US', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        }).format(totalNetWorth)}
                      </span>
                    </div>
                  </section>

                  {/* Minimal Tab Switcher (Accounts vs History vs Utang) */}
                  <div className="px-6 mt-2 mb-8 shrink-0">
                    <div className={`flex p-1.5 rounded-2xl border transition-colors ${
                      isDark ? 'bg-neutral-800 border-neutral-700' : 'bg-neutral-100 border-neutral-200'
                    }`}>
                      <button
                        onClick={() => setActiveTab('wallets')}
                        className={`flex-1 py-3 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                          activeTab === 'wallets'
                            ? 'bg-blue-600 text-white shadow-md'
                            : isDark
                            ? 'text-neutral-400 hover:text-neutral-200'
                            : 'text-neutral-500 hover:text-neutral-800'
                        }`}
                      >
                        Accounts
                      </button>
                      <button
                        onClick={() => setActiveTab('activity')}
                        className={`flex-1 py-3 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                          activeTab === 'activity'
                            ? 'bg-blue-600 text-white shadow-md'
                            : isDark
                            ? 'text-neutral-400 hover:text-neutral-200'
                            : 'text-neutral-500 hover:text-neutral-800'
                        }`}
                      >
                        History
                      </button>
                      <button
                        onClick={() => setActiveTab('debts')}
                        className={`flex-1 py-3 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                          activeTab === 'debts'
                            ? 'bg-blue-600 text-white shadow-md'
                            : isDark
                            ? 'text-neutral-400 hover:text-neutral-200'
                            : 'text-neutral-500 hover:text-neutral-800'
                        }`}
                      >
                        Credits
                      </button>
                    </div>
                  </div>

                <AnimatePresence mode="wait">
                  {activeTab === 'wallets' && (
                    /* 
                      TAB A: WALLET LIST
                    */
                    <motion.div
                      key="wallets-tab"
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 8 }}
                      transition={{ duration: 0.15 }}
                      className="px-6 pb-6 space-y-4"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-sans font-bold text-[10px] uppercase tracking-widest text-neutral-500">My Wallets</h3>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setIsAddWalletOpen(true)}
                            className={`text-[11px] font-bold uppercase tracking-widest px-4 py-2 rounded-full transition-all cursor-pointer flex items-center gap-1.5 border ${
                              isDark 
                                ? 'bg-neutral-800 border-neutral-700 text-neutral-200 hover:bg-neutral-700 hover:text-white' 
                                : 'bg-neutral-100 border-neutral-200 text-neutral-700 hover:bg-neutral-200 hover:text-neutral-900'
                            }`}
                          >
                            <DynamicIcon name="Plus" size={14} /> New
                          </button>
                          <button
                            onClick={() => setShowAnalyticsPanel(true)}
                            className={`text-[11px] font-bold uppercase tracking-widest px-4 py-2 rounded-full transition-all cursor-pointer flex items-center gap-1.5 border ${
                              isDark 
                                ? 'bg-neutral-800 border-neutral-700 text-neutral-200 hover:bg-neutral-700 hover:text-white' 
                                : 'bg-neutral-100 border-neutral-200 text-neutral-700 hover:bg-neutral-200 hover:text-neutral-900'
                            }`}
                          >
                            <DynamicIcon name="BarChart2" size={14} /> Insights
                          </button>
                        </div>
                      </div>

                      {wallets.length === 0 ? (
                        <div className={`text-center py-16 px-8 rounded-3xl border border-dashed flex flex-col items-center justify-center ${
                          isDark 
                            ? 'border-neutral-700 bg-neutral-800/40 text-neutral-400' 
                            : 'border-neutral-300 bg-neutral-50 text-neutral-500'
                        }`}>
                          <div className={`h-16 w-16 rounded-2xl flex items-center justify-center mb-4 ${
                            isDark ? 'bg-neutral-800 text-neutral-400' : 'bg-white shadow-sm text-neutral-400'
                          }`}>
                            <DynamicIcon name="Coins" size={28} />
                          </div>
                          <h4 className={`text-sm font-bold uppercase tracking-wider ${isDark ? 'text-neutral-200' : 'text-neutral-700'}`}>No Accounts Registered</h4>
                          <p className="text-[11px] text-neutral-500 mt-2 max-w-sm leading-relaxed mx-auto">
                            To start tracking your net worth and asset flow, add your first cash pocket or savings account.
                          </p>
                          <button
                            onClick={() => setIsAddWalletOpen(true)}
                            className="mt-6 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] uppercase tracking-widest transition-all cursor-pointer active:scale-95"
                          >
                            Add Your First Account
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-3">
                          {wallets.map((wallet) => (
                            <WalletCard
                              key={wallet.id}
                              wallet={wallet}
                              onClick={() => setSelectedWalletId(wallet.id)}
                              themeMode={themeMode}
                              hideBalances={hideBalances}
                            />
                          ))}
                        </div>
                      )}
                    </motion.div>
                  )}

                  {activeTab === 'activity' && (
                    /* 
                      TAB B: GENERAL ACTIVITY STREAM
                    */
                    <motion.div
                      key="activity-tab"
                      initial={{ opacity: 0, x: 8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -8 }}
                      transition={{ duration: 0.15 }}
                      className="px-6 pb-6 space-y-4"
                    >
                      {/* Integrated Earn / Spend summary inside Recent Activity block */}
                      <div className={`border rounded-2xl p-6 flex justify-between items-center shadow-sm ${
                        isDark ? 'bg-neutral-800 border-neutral-700' : 'bg-neutral-50 border-neutral-200'
                      }`}>
                        <div className="text-left">
                          <p className={`text-[11px] font-bold uppercase tracking-wider mb-1 ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>This Month Earned</p>
                          <p className="text-base font-black text-emerald-500">{formatPHP(monthlyIncome)}</p>
                        </div>
                        <div className={`h-10 w-px ${isDark ? 'bg-neutral-700' : 'bg-neutral-200'}`} />
                        <div className="text-right">
                          <p className={`text-[11px] font-bold uppercase tracking-wider mb-1 ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>This Month Spent</p>
                          <p className="text-base font-black text-rose-500">{formatPHP(monthlyExpenses)}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between py-1">
                        <h3 className="font-sans font-bold text-[10px] uppercase tracking-widest text-neutral-500">Activity Ledger</h3>
                        {transactions.length > 0 && (
                          <span className="text-[10px] font-bold text-neutral-400">
                            {displayedTransactions.length} of {transactions.length}
                          </span>
                        )}
                      </div>

                      {/* Search Bar & Type Filter Chips */}
                      {transactions.length > 0 && (
                        <div className="space-y-2.5 pb-1">
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                              <DynamicIcon name="Search" size={13} />
                            </div>
                            <input
                              type="text"
                              placeholder="Search by note, category, or account..."
                              value={txSearchQuery}
                              onChange={(e) => setTxSearchQuery(e.target.value)}
                              className={`w-full rounded-xl pl-9 pr-8 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 border ${
                                isDark ? 'bg-neutral-800/80 border-neutral-700 text-white placeholder-neutral-500' : 'bg-neutral-50 border-neutral-200 text-neutral-800 placeholder-neutral-400'
                              }`}
                            />
                            {txSearchQuery && (
                              <button
                                type="button"
                                onClick={() => setTxSearchQuery('')}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 cursor-pointer"
                              >
                                <DynamicIcon name="X" size={12} />
                              </button>
                            )}
                          </div>

                          <div className="flex gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                            {[
                              { id: 'all', label: 'All' },
                              { id: 'expense', label: 'Expenses' },
                              { id: 'income', label: 'Income' },
                              { id: 'transfer', label: 'Transfers' },
                              { id: 'recurring', label: 'Recurring' },
                            ].map((pill) => (
                              <button
                                key={pill.id}
                                type="button"
                                onClick={() => setTxTypeFilter(pill.id as any)}
                                className={`px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
                                  txTypeFilter === pill.id
                                    ? 'bg-blue-600 text-white shadow-xs font-black'
                                    : isDark
                                    ? 'bg-neutral-800 border border-neutral-700 text-neutral-400 hover:text-white'
                                    : 'bg-neutral-100 border border-neutral-200 text-neutral-600 hover:bg-neutral-200'
                                }`}
                              >
                                {pill.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {transactions.length === 0 ? (
                        <div className={`text-center py-16 px-8 rounded-3xl border border-dashed flex flex-col items-center justify-center ${
                          isDark 
                            ? 'border-neutral-700 bg-neutral-800/40 text-neutral-400' 
                            : 'border-neutral-300 bg-neutral-50 text-neutral-500'
                        }`}>
                          <div className={`h-16 w-16 rounded-2xl flex items-center justify-center mb-4 ${
                            isDark ? 'bg-neutral-800 text-neutral-400' : 'bg-white shadow-sm text-neutral-400'
                          }`}>
                            <DynamicIcon name="Receipt" size={28} />
                          </div>
                          <h4 className={`text-sm font-bold uppercase tracking-wider ${isDark ? 'text-neutral-200' : 'text-neutral-700'}`}>No Transactions Found</h4>
                          <p className="text-[11px] text-neutral-500 mt-2 max-w-sm leading-relaxed mx-auto">
                            Your general expense log, earnings, and transfers will appear here once you record some transactions.
                          </p>
                          <button
                            onClick={() => {
                              if (wallets.length === 0) {
                                setShowNoAccountTxWarning(true);
                              } else {
                                handleOpenTxModal();
                              }
                            }}
                            className="mt-6 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] uppercase tracking-widest transition-all cursor-pointer active:scale-95"
                            title={wallets.length === 0 ? "Add an account first" : "Record first transaction"}
                          >
                            Record First Transaction
                          </button>
                          {showNoAccountTxWarning && wallets.length === 0 && (
                            <p className={`text-[11px] font-bold uppercase tracking-wider mt-4 flex items-center gap-2 justify-center ${
                              isDark ? 'text-amber-500' : 'text-amber-600'
                            }`}>
                              <DynamicIcon name="AlertTriangle" size={16} /> Add an account first to log activity
                            </p>
                          )}
                        </div>
                      ) : displayedTransactions.length === 0 ? (
                        <div className={`text-center py-12 px-6 rounded-3xl border border-dashed flex flex-col items-center justify-center ${
                          isDark ? 'border-neutral-800 bg-neutral-900/40 text-neutral-400' : 'border-neutral-200 bg-neutral-50/50 text-neutral-500'
                        }`}>
                          <p className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-neutral-300' : 'text-neutral-700'}`}>No matching transactions found</p>
                          <p className="text-[11px] text-neutral-400 mt-1 max-w-xs">Try adjusting your search terms or filter selection.</p>
                          <button
                            type="button"
                            onClick={() => {
                              setTxSearchQuery('');
                              setTxTypeFilter('all');
                            }}
                            className="mt-3 px-3.5 py-1.5 rounded-xl border text-blue-500 border-blue-500/30 hover:border-blue-500 text-xs font-bold uppercase tracking-wider cursor-pointer transition-all"
                          >
                            Clear Filters
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-2.5">
                          {displayedTransactions
                            .slice(0, visibleTxCount)
                            .map((tx) => (
                              <TransactionItem
                                key={tx.id}
                                transaction={tx}
                                wallets={wallets}
                                onClick={() => handleOpenEditTxModal(tx)}
                                themeMode={themeMode}
                              />
                            ))}
                          {displayedTransactions.length > visibleTxCount && (
                            <button
                              onClick={() => setVisibleTxCount((prev) => prev + 50)}
                              className={`w-full py-3 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all cursor-pointer ${
                                isDark
                                  ? 'bg-neutral-800 border-neutral-700 text-neutral-300 hover:bg-neutral-700'
                                  : 'bg-neutral-100 border-neutral-200 text-neutral-600 hover:bg-neutral-200'
                              }`}
                            >
                              Load More ({displayedTransactions.length - visibleTxCount} remaining)
                            </button>
                          )}
                        </div>
                      )}
                    </motion.div>
                  )}

                  {activeTab === 'debts' && (
                    /*
                      TAB C: CREDIT & DEBTS TRACKER (UTANG)
                    */
                    <motion.div
                      key="debts-tab"
                      initial={{ opacity: 0, x: 8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -8 }}
                      transition={{ duration: 0.15 }}
                      className="px-6 pb-6"
                    >
                      <CreditsList
                        debts={debts}
                        wallets={wallets}
                        onAddRepayment={handleAddRepayment}
                        onSettleDirectly={handleSettleDirectly}
                        onDeleteDebt={handleDeleteDebt}
                        onOpenAddDebt={() => setIsAddDebtOpen(true)}
                        themeMode={themeMode}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
                </div>

                {/* Primary Blue Floating Action Button (FAB) */}
                {!showAnalyticsPanel && !(
                  (activeTab === 'wallets' && wallets.length === 0) ||
                  (activeTab === 'activity' && transactions.length === 0)
                ) && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => activeTab === 'debts' ? setIsAddDebtOpen(true) : handleOpenTxModal()}
                    className="fixed bottom-8 right-8 h-14 w-14 rounded-full bg-blue-600 text-white shadow-xl hover:bg-blue-700 flex items-center justify-center z-40 cursor-pointer active:scale-95 transition-all"
                    id="global-add-tx-fab"
                    title={activeTab === 'debts' ? "Log Debt / Credit" : "Record Transaction"}
                  >
                    <DynamicIcon name="Plus" size={28} />
                  </motion.button>
                )}

              </motion.div>
            )}
          </AnimatePresence>

          {/* 
            ===========================================
            SLIDE-UP ANALYTICS PANEL (Full screen drawer)
            ===========================================
          */}
          <AnimatePresence>
            {showAnalyticsPanel && (
              <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className={`absolute inset-0 z-35 flex flex-col h-full overflow-hidden ${isDark ? 'bg-neutral-900' : 'bg-neutral-50'}`}
              >
                {/* Panel Header */}
                <div className={`flex items-center justify-between px-6 pt-8 pb-4 shrink-0 transition-colors border-b ${
                  isDark ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-neutral-200'
                }`}>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setShowAnalyticsPanel(false)}
                      className={`rounded-full p-2 -ml-2 transition-colors cursor-pointer ${
                        isDark ? 'text-neutral-400 hover:bg-neutral-800 hover:text-white' : 'text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900'
                      }`}
                    >
                      <DynamicIcon name="X" size={24} />
                    </button>
                    <h2 className={`font-sans font-black text-xl tracking-tight ${isDark ? 'text-white' : 'text-neutral-900'}`}>Insights</h2>
                  </div>
                </div>

                {/* Scrollable Charts Body */}
                <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-6 sm:p-8 pb-32 sm:pb-36">
                  <OverviewCharts wallets={wallets} transactions={transactions} themeMode={themeMode} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* 
            ===========================================
            MODAL OVERLAYS (Add Wallet & Add Transaction)
            ===========================================
          */}
          <AddWalletModal
            isOpen={isAddWalletOpen}
            onClose={() => setIsAddWalletOpen(false)}
            onAdd={handleAddWallet}
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

        </div>
    </div>
  );
}
