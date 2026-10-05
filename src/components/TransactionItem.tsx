import { Transaction, Wallet } from '../types';
import DynamicIcon from './DynamicIcon';

interface TransactionItemProps {
  key?: string;
  transaction: Transaction;
  wallets: Wallet[];
  onClick?: () => void;
  themeMode?: 'light' | 'dark';
}

export default function TransactionItem({ transaction, wallets, onClick, themeMode = 'light' }: TransactionItemProps) {
  const isDark = themeMode === 'dark';

  // Find associated wallet
  const wallet = wallets.find((w) => w.id === transaction.walletId);
  const toWallet = transaction.toWalletId ? wallets.find((w) => w.id === transaction.toWalletId) : null;

  // Dynamic Editorial color mapping helper supporting dark theme
  const getCategoryStyle = (categoryName: string, dark: boolean) => {
    const name = categoryName.toLowerCase();
    if (name.includes('food')) {
      return { 
        icon: 'Utensils', 
        color: dark ? 'bg-orange-950/40 text-orange-400 border border-orange-900/30' : 'bg-orange-50 text-orange-600' 
      };
    }
    if (name.includes('util')) {
      return { 
        icon: 'Zap', 
        color: dark ? 'bg-amber-950/40 text-amber-400 border border-amber-900/30' : 'bg-amber-50 text-amber-600' 
      };
    }
    if (name.includes('enter')) {
      return { 
        icon: 'Film', 
        color: dark ? 'bg-pink-950/40 text-pink-400 border border-pink-900/30' : 'bg-pink-50 text-pink-600' 
      };
    }
    if (name.includes('transp')) {
      return { 
        icon: 'Car', 
        color: dark ? 'bg-blue-950/40 text-blue-400 border border-blue-900/30' : 'bg-blue-50 text-blue-600' 
      };
    }
    if (name.includes('shop')) {
      return { 
        icon: 'ShoppingBag', 
        color: dark ? 'bg-purple-950/40 text-purple-400 border border-purple-900/30' : 'bg-purple-50 text-purple-600' 
      };
    }
    if (name.includes('sal')) {
      return { 
        icon: 'Briefcase', 
        color: dark ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-900/30' : 'bg-emerald-50 text-emerald-600' 
      };
    }
    if (name.includes('transf')) {
      return { 
        icon: 'RefreshCw', 
        color: dark ? 'bg-indigo-950/40 text-indigo-400 border border-indigo-900/30' : 'bg-indigo-50 text-indigo-600' 
      };
    }
    return { 
      icon: 'HelpCircle', 
      color: dark ? 'bg-neutral-800 text-neutral-300 border border-neutral-700/50' : 'bg-neutral-100 text-neutral-600' 
    };
  };

  const categoryInfo = getCategoryStyle(transaction.category, isDark);

  // Dynamic currency formatter based on the wallet's currency
  const formatCurrency = (value: number, currencyCode?: 'PHP' | 'USD') => {
    const safeCurrency = currencyCode || 'PHP';
    return new Intl.NumberFormat(safeCurrency === 'USD' ? 'en-US' : 'en-PH', {
      style: 'currency',
      currency: safeCurrency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const getRecurringLabel = (t: Transaction) => {
    if (!t.isRecurring) return null;
    if (t.isRecurring === 'biweekly') {
      if (t.splitPayout?.enabled) {
        return `Bi-weekly • Payout ${t.splitPayout.currentCutoff || 1}`;
      }
      return 'Bi-weekly';
    }
    if (t.isRecurring === 'semimonthly') {
      if (t.splitPayout?.enabled) {
        return `Semi-monthly • Cutoff ${t.splitPayout.currentCutoff || 1}`;
      }
      return 'Semi-monthly';
    }
    if (t.isRecurring === 'daily') return 'Daily';
    if (t.isRecurring === 'weekly') return 'Weekly';
    if (t.isRecurring === 'monthly' || t.isRecurring === true) return 'Monthly';
    if (t.isRecurring === 'yearly') return 'Yearly';
    if (t.isRecurring === 'custom') return `Every ${t.customRecurringDays || 14}d`;
    return 'Recurring';
  };

  const formatDate = (isoString: string) => {
    const d = new Date(isoString);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const txCurrency = wallet?.currency || 'PHP';

  return (
    <div
      onClick={onClick}
      className={`flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer shadow-xs ${
        isDark 
          ? 'bg-neutral-900 border-neutral-800/80 hover:bg-neutral-850 text-white' 
          : 'bg-white border-neutral-100/90 hover:bg-neutral-50 text-neutral-800'
      } ${onClick ? 'active:scale-98' : ''}`}
      id={`transaction-item-${transaction.id}`}
    >
      <div className="flex items-center gap-4 min-w-0">
        {/* Category Icon */}
        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${categoryInfo.color}`}>
          <DynamicIcon name={categoryInfo.icon} size={20} />
        </div>
        
        {/* Text Details */}
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <p className={`font-sans text-sm font-bold truncate ${isDark ? 'text-neutral-100' : 'text-neutral-800'}`}>
              {transaction.description}
            </p>
            {transaction.isRecurring && (
              <div className="bg-blue-500/10 text-blue-500 p-0.5 rounded-md flex-shrink-0" title="Recurring">
                <DynamicIcon name="RefreshCw" size={10} />
              </div>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2 text-[10px] mt-1 font-medium">
            <span className={isDark ? 'text-neutral-500' : 'text-neutral-500'}>{formatDate(transaction.date)}</span>
            <span className={`h-1 w-1 rounded-full ${isDark ? 'text-neutral-700 bg-neutral-700' : 'text-neutral-300 bg-neutral-300'}`} />
            
            {/* Wallet Tag */}
            {transaction.type === 'transfer' ? (
              <span className="flex items-center gap-1 text-blue-500 font-bold">
                {wallet?.name} 
                <DynamicIcon name="ArrowRight" size={12} className="mx-1" />
                {toWallet?.name}
              </span>
            ) : (
              <span className={`font-bold ${isDark ? 'text-neutral-400' : 'text-neutral-600'}`}>
                {wallet?.name}
              </span>
            )}
            {transaction.isRecurring && (
              <>
                <span className={`h-1 w-1 rounded-full ${isDark ? 'text-neutral-700 bg-neutral-700' : 'text-neutral-300 bg-neutral-300'}`} />
                <span className="flex items-center gap-1 text-blue-500 font-bold bg-blue-500/10 px-1.5 py-0.5 rounded">
                  <DynamicIcon name="RefreshCw" size={10} />
                  {getRecurringLabel(transaction)}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Amount Display */}
      <div className="text-right shrink-0 ml-4 font-sans">
        <p
          className={`font-extrabold text-sm ${
            transaction.type === 'income'
              ? 'text-emerald-500'
              : transaction.type === 'expense'
              ? 'text-rose-500'
              : 'text-blue-500'
          }`}
        >
          {transaction.type === 'income' ? '+' : transaction.type === 'expense' ? '-' : ''}
          {formatCurrency(transaction.amount, txCurrency)}
        </p>
        <p className={`text-[10px] font-bold tracking-wider mt-1 uppercase ${isDark ? 'text-neutral-500' : 'text-neutral-400'}`}>
          {transaction.category}
        </p>
      </div>
    </div>
  );
}
