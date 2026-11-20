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
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`w-full text-left rounded-[20px] px-4 py-4 flex items-center gap-3.5 transition-colors ${
        isDark ? 'card-dark' : 'card'
      }`}
    >
      <div
        className={`h-12 w-12 shrink-0 rounded-2xl overflow-hidden flex items-center justify-center ${
          isDark ? 'bg-white/[0.08]' : 'bg-zinc-100'
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
          <BankLogo bank={bankId} size={24} />
        ) : (
          <DynamicIcon
            name={wallet.icon || 'Wallet'}
            size={20}
            className={isDark ? 'text-white/50' : 'text-zinc-500'}
          />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p
          className={`text-[15px] font-semibold tracking-[-0.02em] truncate ${
            isDark ? 'text-white' : 'text-zinc-950'
          }`}
        >
          {wallet.name}
        </p>
        <p className={`text-[12px] mt-0.5 capitalize tracking-[-0.01em] ${isDark ? 'muted-dark' : 'muted'}`}>
          {wallet.type}
          {wallet.currency ? ` · ${wallet.currency}` : ''}
        </p>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        <p
          className={`tabular text-[15px] font-semibold tracking-[-0.02em] ${
            isDark ? 'text-white' : 'text-zinc-950'
          }`}
        >
          {formatCurrency(wallet.balance, wallet.currency || 'PHP')}
        </p>
        <DynamicIcon
          name="ChevronRight"
          size={16}
          className={isDark ? 'text-white/25' : 'text-zinc-300'}
        />
      </div>
    </motion.button>
  );
}
