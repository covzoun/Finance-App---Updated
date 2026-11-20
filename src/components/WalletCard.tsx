import { Wallet } from '../types';
import DynamicIcon from './DynamicIcon';
import BankLogo, { BANK_PRESETS } from './BankLogo';
import { motion } from 'motion/react';

interface WalletCardProps {
  key?: string;
  wallet: Wallet;
  onClick: () => void;
  themeMode?: 'light' | 'dark';
  hideBalances?: boolean;
}

export default function WalletCard({
  wallet,
  onClick,
  themeMode = 'light',
  hideBalances = false,
}: WalletCardProps) {
  const isDark = themeMode === 'dark';

  const formatCurrency = (value: number, currency?: 'PHP' | 'USD') => {
    if (hideBalances) return '••••••';
    const safeCurrency = currency || 'PHP';
    return new Intl.NumberFormat(safeCurrency === 'USD' ? 'en-US' : 'en-PH', {
      style: 'currency',
      currency: safeCurrency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const bankId = wallet.icon?.startsWith('bank:')
    ? wallet.icon.replace('bank:', '')
    : null;
  const bankColor = bankId
    ? BANK_PRESETS.find((p) => p.id === bankId)?.color
    : undefined;

  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.985 }}
      onClick={onClick}
      className={`w-full text-left rounded-2xl px-4 py-3.5 flex items-center gap-3.5 ${
        isDark ? 'card-dark' : 'card'
      }`}
    >
      <div
        className={`h-11 w-11 shrink-0 rounded-xl overflow-hidden flex items-center justify-center ${
          isDark ? 'bg-white/10' : 'bg-black/[0.04]'
        }`}
        style={bankColor ? { backgroundColor: bankColor } : undefined}
      >
        {wallet.image ? (
          <img
            src={wallet.image}
            alt=""
            className="h-full w-full object-cover"
            referrerPolicy="no-referrer"
          />
        ) : bankId ? (
          <BankLogo bank={bankId} size={22} />
        ) : (
          <DynamicIcon
            name={wallet.icon || 'Wallet'}
            size={18}
            className={isDark ? 'text-white/55' : 'text-black/40'}
          />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className={`text-[15px] font-semibold tracking-[-0.01em] truncate ${isDark ? 'text-white' : 'text-black'}`}>
          {wallet.name}
        </p>
        <p className={`text-[12px] mt-0.5 capitalize ${isDark ? 'muted-dark' : 'muted'}`}>
          {wallet.type}
          {wallet.currency ? ` · ${wallet.currency}` : ''}
        </p>
      </div>

      <p className={`tabular text-[15px] font-semibold tracking-tight shrink-0 ${isDark ? 'text-white' : 'text-black'}`}>
        {formatCurrency(wallet.balance, wallet.currency || 'PHP')}
      </p>
    </motion.button>
  );
}
