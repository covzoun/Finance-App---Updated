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

const getColorTheme = (colorClass: string, isDark: boolean) => {
  const c = colorClass.toLowerCase();
  if (c.includes('blue')) {
    return {
      bg: isDark ? 'bg-blue-950/40 border border-blue-900/30' : 'bg-blue-50',
      text: isDark ? 'text-blue-400 font-bold' : 'text-blue-600',
    };
  }
  if (c.includes('indigo') || c.includes('purple')) {
    return {
      bg: isDark ? 'bg-indigo-950/40 border border-indigo-900/30' : 'bg-indigo-50',
      text: isDark ? 'text-indigo-400 font-bold' : 'text-indigo-600',
    };
  }
  if (c.includes('emerald') || c.includes('teal')) {
    return {
      bg: isDark ? 'bg-emerald-950/40 border border-emerald-900/30' : 'bg-emerald-50',
      text: isDark ? 'text-emerald-400 font-bold' : 'text-emerald-600',
    };
  }
  if (c.includes('orange') || c.includes('amber')) {
    return {
      bg: isDark ? 'bg-amber-950/40 border border-amber-900/30' : 'bg-orange-50',
      text: isDark ? 'text-amber-400 font-bold' : 'text-orange-600',
    };
  }
  if (c.includes('rose') || c.includes('pink') || c.includes('red')) {
    return {
      bg: isDark ? 'bg-rose-950/40 border border-rose-900/30' : 'bg-rose-50',
      text: isDark ? 'text-rose-400 font-bold' : 'text-rose-600',
    };
  }
  return {
    bg: isDark ? 'bg-neutral-800' : 'bg-neutral-100',
    text: isDark ? 'text-neutral-300' : 'text-neutral-600',
  };
};

export default function WalletCard({ wallet, onClick, themeMode = 'light', hideBalances = false }: WalletCardProps) {
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

  const themeColors = getColorTheme(wallet.color, isDark);

  return (
    <motion.div
      whileHover={{ y: -1, scale: 1.005 }}
      whileTap={{ scale: 0.995 }}
      onClick={onClick}
      className={`relative w-full overflow-hidden rounded-2xl p-4 flex items-center justify-between transition-all cursor-pointer border shadow-xs ${
        isDark 
          ? 'bg-neutral-950 border-neutral-900/80 text-white hover:bg-neutral-850' 
          : 'bg-white border-neutral-100 text-neutral-800 hover:bg-neutral-50/40'
      }`}
      id={`wallet-card-${wallet.id}`}
    >
      {/* Left items: Icon or Image, name and type */}
      <div className="flex items-center gap-4 min-w-0">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl overflow-hidden bg-neutral-100 dark:bg-neutral-800">
          {wallet.image ? (
            <img
              src={wallet.image}
              alt={wallet.name}
              className="h-full w-full object-cover"
              referrerPolicy="no-referrer"
            />
          ) : wallet.icon?.startsWith('bank:') ? (
            <div 
              className="flex h-full w-full items-center justify-center" 
              style={{ backgroundColor: BANK_PRESETS.find(p => p.id === wallet.icon.replace('bank:', ''))?.color || '#000' }}
            >
              <BankLogo bank={wallet.icon.replace('bank:', '')} size={24} />
            </div>
          ) : (
            <div className={`flex h-full w-full items-center justify-center ${themeColors.bg}`}>
              <DynamicIcon name={wallet.icon} className={themeColors.text} size={20} />
            </div>
          )}
        </div>
        <div className="min-w-0">
          <h3 className={`font-sans font-bold tracking-tight text-sm truncate ${isDark ? 'text-neutral-100' : 'text-neutral-800'}`}>
            {wallet.name}
          </h3>
          <p className={`font-sans text-[10px] font-bold uppercase tracking-widest mt-1 ${isDark ? 'text-neutral-500' : 'text-neutral-400'}`}>
            {wallet.type.replace('_', ' ')}
          </p>
        </div>
      </div>

      {/* Right items: formatted balance and optional description */}
      <div className="text-right shrink-0">
        <p className={`font-sans text-base font-extrabold tracking-tight ${isDark ? 'text-neutral-50' : 'text-neutral-900'}`}>
          {formatCurrency(wallet.balance, wallet.currency || 'PHP')}
        </p>
        {wallet.description && (
          <p className={`font-sans text-[11px] mt-1 line-clamp-1 max-w-[120px] ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
            {wallet.description}
          </p>
        )}
      </div>
    </motion.div>
  );
}
