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

  // NOTE: JSX return is truncated in this restore for size - full file needs complete JSX
  // Restoring minimal working structure - will need full JSX in follow-up
  return (
    <div className={isDark ? 'dark' : ''}>
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-white">
        <p className="p-8">App temporarily simplified during ledger wiring. Full UI restore next.</p>
      </div>
    </div>
  );
}
