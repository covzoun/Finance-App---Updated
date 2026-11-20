import { Transaction, Wallet } from '../types';
import DynamicIcon from './DynamicIcon';

interface TransactionItemProps {
  key?: string;
  transaction: Transaction;
  wallets: Wallet[];
  onClick?: () => void;
  themeMode?: 'light' | 'dark';
}

function categoryIcon(categoryName: string): string {
  const name = (categoryName || '').toLowerCase();
  if (name.includes('food')) return 'Utensils';
  if (name.includes('util')) return 'Zap';
  if (name.includes('enter')) return 'Film';
  if (name.includes('transp')) return 'Car';
  if (name.includes('shop')) return 'ShoppingBag';
  if (name.includes('sal')) return 'Briefcase';
  if (name.includes('transf')) return 'ArrowLeftRight';
  if (name.includes('rent') || name.includes('home')) return 'Home';
  if (name.includes('health')) return 'Heart';
  return 'CircleDot';
}

export default function TransactionItem({
  transaction,
  wallets,
  onClick,
  themeMode = 'light',
}: TransactionItemProps) {
  const isDark = themeMode === 'dark';
  const wallet = wallets.find((w) => w.id === transaction.walletId);
  const toWallet = transaction.toWalletId
    ? wallets.find((w) => w.id === transaction.toWalletId)
    : null;

  const formatCurrency = (value: number, currencyCode?: 'PHP' | 'USD') => {
    const safeCurrency = currencyCode || 'PHP';
    return new Intl.NumberFormat(safeCurrency === 'USD' ? 'en-US' : 'en-PH', {
      style: 'currency',
      currency: safeCurrency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatDate = (isoString: string) => {
    const d = new Date(isoString);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const amountColor =
    transaction.type === 'income'
      ? 'text-emerald-600'
      : transaction.type === 'expense'
        ? 'text-red-600'
        : isDark
          ? 'text-white'
          : 'text-black';

  const prefix =
    transaction.type === 'income' ? '+' : transaction.type === 'expense' ? '−' : '';

  const subtitle =
    transaction.type === 'transfer'
      ? `${wallet?.name || '—'} → ${toWallet?.name || '—'}`
      : [wallet?.name, transaction.category].filter(Boolean).join(' · ');

  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3.5 text-left min-h-[56px] ${
        isDark ? 'active:bg-white/[0.05]' : 'active:bg-black/[0.03]'
      }`}
    >
      <div
        className={`h-10 w-10 shrink-0 rounded-xl flex items-center justify-center ${
          isDark ? 'bg-white/10 text-white/50' : 'bg-black/[0.04] text-black/40'
        }`}
      >
        <DynamicIcon name={categoryIcon(transaction.category)} size={16} />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <p className={`text-[15px] font-medium tracking-[-0.01em] truncate ${isDark ? 'text-white' : 'text-black'}`}>
            {transaction.description || transaction.category || 'Transaction'}
          </p>
          {transaction.isRecurring && (
            <DynamicIcon
              name="RefreshCw"
              size={11}
              className={isDark ? 'text-white/30' : 'text-black/30'}
            />
          )}
        </div>
        <p className={`text-[12px] mt-0.5 truncate ${isDark ? 'muted-dark' : 'muted'}`}>
          {formatDate(transaction.date)}
          {subtitle ? ` · ${subtitle}` : ''}
        </p>
      </div>

      <p className={`tabular text-[15px] font-semibold shrink-0 ${amountColor}`}>
        {prefix}
        {formatCurrency(transaction.amount, wallet?.currency || 'PHP')}
      </p>
    </button>
  );
}
