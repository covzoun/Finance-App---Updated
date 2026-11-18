import React, { useState, useEffect } from 'react';
import { Wallet, Transaction, WalletType } from '../types';
import DynamicIcon from './DynamicIcon';
import BankLogo, { BANK_PRESETS } from './BankLogo';
import TransactionItem from './TransactionItem';

interface WalletDetailsProps {
  wallet: Wallet;
  transactions: Transaction[];
  wallets: Wallet[];
  onBack: () => void;
  onAddTransactionClick: (walletId: string) => void;
  onDeleteWallet: (walletId: string) => void;
  onEditWallet: (
    walletId: string,
    updatedName: string,
    updatedDesc: string,
    updatedColor: string,
    updatedIcon: string,
    updatedCurrency: 'PHP' | 'USD',
    updatedType: WalletType,
    updatedBalance?: number,
    updatedImage?: string
  ) => void;
  themeMode?: 'light' | 'dark';
}

const COLOR_PRESETS = [
  { name: 'Teal', value: 'teal', hex: '#14b8a6' },
  { name: 'Purple', value: 'purple', hex: '#a855f7' },
  { name: 'Blue', value: 'blue', hex: '#2563eb' },
  { name: 'Red', value: 'red', hex: '#e11d48' },
  { name: 'Amber', value: 'amber', hex: '#f59e0b' },
  { name: 'Pink', value: 'pink', hex: '#ec4899' },
  { name: 'Slate', value: 'slate', hex: '#475569' },
];

const ICON_PRESETS = [
  'Wallet', 'Coins', 'Smartphone', 'Landmark', 'CreditCard',
  'PiggyBank', 'Briefcase', 'Shield', 'Activity', 'Sparkles',
];

export default function WalletDetails({
  wallet,
  transactions,
  wallets,
  onBack,
  onAddTransactionClick,
  onDeleteWallet,
  onEditWallet,
  themeMode = 'light',
}: WalletDetailsProps) {
  const isDark = themeMode === 'dark';
  const [isEditing, setIsEditing] = useState(false);

  const [editName, setEditName] = useState(wallet.name);
  const [editDesc, setEditDesc] = useState(wallet.description || '');
  const [editColor, setEditColor] = useState(wallet.color || 'slate');
  const [editIcon, setEditIcon] = useState(wallet.icon || 'Wallet');
  const [editCurrency, setEditCurrency] = useState<'PHP' | 'USD'>(wallet.currency || 'PHP');
  const [editType, setEditType] = useState<WalletType>(wallet.type);
  const [editBalance, setEditBalance] = useState(wallet.balance);

  useEffect(() => {
    setEditName(wallet.name);
    setEditDesc(wallet.description || '');
    setEditColor(wallet.color || 'slate');
    setEditIcon(wallet.icon || 'Wallet');
    setEditCurrency(wallet.currency || 'PHP');
    setEditType(wallet.type);
    setEditBalance(wallet.balance);
  }, [wallet]);

  const formatCurrency = (value: number, currency?: 'PHP' | 'USD') => {
    const safeCurrency = currency || 'PHP';
    return new Intl.NumberFormat(safeCurrency === 'USD' ? 'en-US' : 'en-PH', {
      style: 'currency',
      currency: safeCurrency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const handleSaveEdit = () => {
    if (!editName.trim()) return;
    const balanceHasChanged = editBalance !== wallet.balance;
    onEditWallet(
      wallet.id,
      editName.trim(),
      editDesc.trim(),
      editColor,
      editIcon,
      editCurrency,
      editType,
      balanceHasChanged ? editBalance : undefined,
      wallet.image
    );
    setIsEditing(false);
  };

  const bankId = wallet.icon?.startsWith('bank:')
    ? wallet.icon.replace('bank:', '')
    : null;
  const bankColor = bankId
    ? BANK_PRESETS.find((p) => p.id === bankId)?.color
    : undefined;

  const muted = isDark ? 'text-white/40' : 'text-black/35';
  const field =
    'w-full rounded-xl border px-3.5 py-2.5 text-[13px] focus:outline-none focus:ring-1 focus:ring-black/20 ' +
    (isDark
      ? 'bg-white/8 border-white/10 text-white'
      : 'bg-black/[0.03] border-black/8 text-[#1c1c1e]');

  return (
    <div
      className={
        'fixed inset-0 z-40 flex flex-col ' +
        (isDark ? 'app-bg-dark text-white' : 'app-bg text-[#1c1c1e]')
      }
    >
      <div
        className={
          'flex items-center justify-between px-4 h-14 border-b shrink-0 ' +
          (isDark ? 'border-white/10' : 'border-black/8')
        }
      >
        <button
          type="button"
          onClick={onBack}
          className={
            'flex items-center gap-1 text-[13px] font-medium ' +
            (isDark ? 'text-white/45' : 'text-black/40')
          }
        >
          <DynamicIcon name="ChevronLeft" size={18} />
          Back
        </button>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setIsEditing((v) => !v)}
            className={
              'p-2 rounded-full ' +
              (isDark ? 'hover:bg-white/10 text-white/45' : 'hover:bg-black/5 text-black/40')
            }
          >
            <DynamicIcon name={isEditing ? 'X' : 'Edit3'} size={16} />
          </button>
          <button
            type="button"
            onClick={() => {
              if (confirm('Delete ' + wallet.name + '?')) onDeleteWallet(wallet.id);
            }}
            className={'p-2 rounded-full ' + (isDark ? 'text-rose-400' : 'text-rose-500')}
          >
            <DynamicIcon name="Trash2" size={16} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {isEditing ? (
          <div className="max-w-md mx-auto px-5 py-6 space-y-4">
            <div>
              <label className={'block text-[11px] font-medium uppercase tracking-[0.1em] mb-1.5 ' + muted}>
                Balance
              </label>
              <input
                type="number"
                step="any"
                value={editBalance}
                onChange={(e) => setEditBalance(parseFloat(e.target.value) || 0)}
                className={field}
              />
            </div>

            <div>
              <label className={'block text-[11px] font-medium uppercase tracking-[0.1em] mb-1.5 ' + muted}>
                Name
              </label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className={field}
              />
            </div>

            <div>
              <label className={'block text-[11px] font-medium uppercase tracking-[0.1em] mb-1.5 ' + muted}>
                Note
              </label>
              <input
                type="text"
                value={editDesc}
                onChange={(e) => setEditDesc(e.target.value)}
                className={field}
              />
            </div>

            <div>
              <label className={'block text-[11px] font-medium uppercase tracking-[0.1em] mb-1.5 ' + muted}>
                Type
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {(['wallet', 'savings', 'investment', 'others'] as WalletType[]).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setEditType(t)}
                    className={
                      'py-2 rounded-xl text-[11px] font-medium capitalize border ' +
                      (editType === t
                        ? isDark
                          ? 'bg-white text-black border-white'
                          : 'bg-[#1c1c1e] text-white border-[#1c1c1e]'
                        : isDark
                          ? 'border-white/10 text-white/40'
                          : 'border-black/8 text-black/40')
                    }
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className={'block text-[11px] font-medium uppercase tracking-[0.1em] mb-1.5 ' + muted}>
                Currency
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(['PHP', 'USD'] as const).map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setEditCurrency(c)}
                    className={
                      'py-2 rounded-xl text-[12px] font-medium border ' +
                      (editCurrency === c
                        ? isDark
                          ? 'bg-white text-black border-white'
                          : 'bg-[#1c1c1e] text-white border-[#1c1c1e]'
                        : isDark
                          ? 'border-white/10 text-white/40'
                          : 'border-black/8 text-black/40')
                    }
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className={'block text-[11px] font-medium uppercase tracking-[0.1em] mb-1.5 ' + muted}>
                Color
              </label>
              <div className="flex flex-wrap gap-2">
                {COLOR_PRESETS.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => setEditColor(color.value)}
                    className={
                      'h-7 w-7 rounded-full ' +
                      (editColor === color.value ? 'ring-2 ring-offset-2 ring-black/20' : '')
                    }
                    style={{ backgroundColor: color.hex }}
                  />
                ))}
              </div>
            </div>

            <div>
              <label className={'block text-[11px] font-medium uppercase tracking-[0.1em] mb-1.5 ' + muted}>
                Icon
              </label>
              <div className="grid grid-cols-5 gap-2">
                {ICON_PRESETS.map((iconName) => (
                  <button
                    key={iconName}
                    type="button"
                    onClick={() => setEditIcon(iconName)}
                    className={
                      'h-10 rounded-xl flex items-center justify-center border ' +
                      (editIcon === iconName
                        ? isDark
                          ? 'bg-white text-black border-white'
                          : 'bg-[#1c1c1e] text-white border-[#1c1c1e]'
                        : isDark
                          ? 'border-white/10 text-white/40'
                          : 'border-black/8 text-black/40')
                    }
                  >
                    <DynamicIcon name={iconName} size={16} />
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={handleSaveEdit}
              className={
                'w-full py-2.5 rounded-xl text-[13px] font-semibold ' +
                (isDark ? 'bg-white text-black' : 'bg-[#1c1c1e] text-white')
              }
            >
              Save changes
            </button>
          </div>
        ) : (
          <div className="max-w-md mx-auto px-5 py-8">
            <div className="text-center mb-8">
              <div
                className={
                  'mx-auto h-14 w-14 rounded-2xl overflow-hidden flex items-center justify-center mb-4 ' +
                  (isDark ? 'bg-white/8' : 'bg-black/[0.04]')
                }
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
                  <BankLogo bank={bankId} size={28} />
                ) : (
                  <DynamicIcon
                    name={wallet.icon || 'Wallet'}
                    size={22}
                    className={muted}
                  />
                )}
              </div>
              <p className={'text-[12px] font-medium uppercase tracking-[0.12em] ' + muted}>
                {wallet.type}
              </p>
              <h1 className="mt-1 text-[1.35rem] font-semibold tracking-tight">
                {wallet.name}
              </h1>
              <p className="tabular mt-3 text-[2rem] font-semibold tracking-[-0.03em]">
                {formatCurrency(wallet.balance, wallet.currency || 'PHP')}
              </p>
              {wallet.description && (
                <p className={'mt-2 text-[13px] ' + muted}>{wallet.description}</p>
              )}

              <button
                type="button"
                onClick={() => onAddTransactionClick(wallet.id)}
                className={
                  'mt-6 px-5 py-2.5 rounded-full text-[14px] font-semibold ' +
                  (isDark ? 'bg-white text-black' : 'bg-[#1c1c1e] text-white')
                }
              >
                Add transaction
              </button>
            </div>

            <p className={'text-[11px] font-medium uppercase tracking-[0.1em] mb-2 ' + muted}>
              Activity
            </p>
            <div
              className={
                'rounded-[22px] overflow-hidden divide-y ' +
                (isDark
                  ? 'glass-dark divide-white/[0.06]'
                  : 'glass divide-black/[0.05]')
              }
            >
              {transactions.length === 0 ? (
                <p className={'text-center py-12 text-[13px] ' + muted}>No transactions</p>
              ) : (
                transactions.slice(0, 40).map((t) => (
                  <TransactionItem
                    key={t.id}
                    transaction={t}
                    wallets={wallets}
                    themeMode={themeMode}
                  />
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
