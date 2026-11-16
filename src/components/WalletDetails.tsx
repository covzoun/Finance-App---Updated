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

  const muted = isDark ? 'text-zinc-500' : 'text-zinc-400';
  const field = `w-full rounded-xl border px-3.5 py-2.5 text-[13px] focus:outline-none focus:ring-1 focus:ring-zinc-400 ${\n    isDark ? 'bg-zinc-950 border-zinc-800 text-white' : 'bg-zinc-50 border-zinc-200 text-zinc-900'
  }`;

  return (
    <div
      className={`fixed inset-0 z-40 flex flex-col ${\n        isDark ? 'bg-zinc-950 text-zinc-50' : 'bg-zinc-50 text-zinc-900'
      }`}
    >
      <div
        className={`flex items-center justify-between px-4 h-14 border-b shrink-0 ${\n          isDark ? 'border-zinc-800' : 'border-zinc-200'
        }`}
      >
        <button
          type="button"
          onClick={onBack}
          className={`flex items-center gap-1 text-[13px] font-medium ${\n            isDark ? 'text-zinc-400' : 'text-zinc-500'
          }`}
        >
          <DynamicIcon name="ChevronLeft" size={18} />
          Back
        </button>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setIsEditing((v) => !v)}
            className={`p-2 rounded-lg ${\n              isDark ? 'hover:bg-zinc-900 text-zinc-400' : 'hover:bg-zinc-200 text-zinc-500'
            }`}
          >
            <DynamicIcon name={isEditing ? 'X' : 'Edit3'} size={16} />
          </button>
          <button
            type="button"
            onClick={() => {
              if (confirm(`Delete ${wallet.name}?`)) onDeleteWallet(wallet.id);
            }}
            className={`p-2 rounded-lg ${isDark ? 'text-rose-400' : 'text-rose-500'}`}
          >
            <DynamicIcon name="Trash2" size={16} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {isEditing ? (
          <div className="max-w-md mx-auto px-5 py-6 space-y-4">
            <div>
              <label className={`block text-[11px] font-medium uppercase tracking-[0.1em] mb-1.5 ${muted}`}>
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
              <label className={`block text-[11px] font-medium uppercase tracking-[0.1em] mb-1.5 ${muted}`}>
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
              <label className={`block text-[11px] font-medium uppercase tracking-[0.1em] mb-1.5 ${muted}`}>
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
              <label className={`block text-[11px] font-medium uppercase tracking-[0.1em] mb-1.5 ${muted}`}>
                Type
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {(['wallet', 'savings', 'investment', 'others'] as WalletType[]).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setEditType(t)}
                    className={`py-2 rounded-xl text-[11px] font-medium capitalize border ${\n                      editType === t
                        ? isDark
                          ? 'bg-zinc-100 text-zinc-900 border-zinc-100'
                          : 'bg-zinc-900 text-white border-zinc-900'
                        : isDark
                          ? 'border-zinc-800 text-zinc-400'
                          : 'border-zinc-200 text-zinc-500'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className={`block text-[11px] font-medium uppercase tracking-[0.1em] mb-1.5 ${muted}`}>
                Currency
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(['PHP', 'USD'] as const).map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setEditCurrency(c)}
                    className={`py-2 rounded-xl text-[12px] font-medium border ${\n                      editCurrency === c
                        ? isDark
                          ? 'bg-zinc-100 text-zinc-900 border-zinc-100'
                          : 'bg-zinc-900 text-white border-zinc-900'
                        : isDark
                          ? 'border-zinc-800 text-zinc-400'
                          : 'border-zinc-200 text-zinc-500'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className={`block text-[11px] font-medium uppercase tracking-[0.1em] mb-1.5 ${muted}`}>
                Color
              </label>
              <div className="flex flex-wrap gap-2">
                {COLOR_PRESETS.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => setEditColor(color.value)}
                    className={`h-7 w-7 rounded-full ${\n                      editColor === color.value ? 'ring-2 ring-offset-2 ring-zinc-400' : ''
                    }`}
                    style={{ backgroundColor: color.hex }}
                  />
                ))}
              </div>
            </div>

            <div>
              <label className={`block text-[11px] font-medium uppercase tracking-[0.1em] mb-1.5 ${muted}`}>
                Icon
              </label>
              <div className="grid grid-cols-5 gap-2">
                {ICON_PRESETS.map((iconName) => (
                  <button
                    key={iconName}
                    type="button"
                    onClick={() => setEditIcon(iconName)}
                    className={`h-10 rounded-xl flex items-center justify-center border ${\n                      editIcon === iconName
                        ? isDark
                          ? 'bg-zinc-100 text-zinc-900 border-zinc-100'
                          : 'bg-zinc-900 text-white border-zinc-900'
                        : isDark
                          ? 'border-zinc-800 text-zinc-400'
                          : 'border-zinc-200 text-zinc-500'
                    }`}
                  >
                    <DynamicIcon name={iconName} size={16} />
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={handleSaveEdit}
              className={`w-full py-2.5 rounded-xl text-[13px] font-medium ${\n                isDark ? 'bg-zinc-100 text-zinc-900' : 'bg-zinc-900 text-white'
              }`}
            >
              Save changes
            </button>
          </div>
        ) : (
          <div className="max-w-md mx-auto px-5 py-8">
            <div className="text-center mb-8">
              <div
                className={`mx-auto h-14 w-14 rounded-2xl overflow-hidden flex items-center justify-center mb-4 ${\n                  isDark ? 'bg-zinc-900' : 'bg-zinc-100'
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
                  <BankLogo bank={bankId} size={28} />
                ) : (
                  <DynamicIcon
                    name={wallet.icon || 'Wallet'}
                    size={22}
                    className={muted}
                  />
                )}
              </div>
              <p className={`text-[12px] font-medium uppercase tracking-[0.12em] ${muted}`}>
                {wallet.type}
              </p>
              <h1 className="mt-1 text-[1.35rem] font-semibold tracking-tight">
                {wallet.name}
              </h1>
              <p className="tabular mt-3 text-[2rem] font-semibold tracking-[-0.03em]">
                {formatCurrency(wallet.balance, wallet.currency || 'PHP')}
              </p>
              {wallet.description && (
                <p className={`mt-2 text-[13px] ${muted}`}>{wallet.description}</p>
              )}

              <button
                type="button"
                onClick={() => onAddTransactionClick(wallet.id)}
                className={`mt-6 px-5 py-2.5 rounded-full text-[13px] font-medium ${\n                  isDark ? 'bg-zinc-100 text-zinc-900' : 'bg-zinc-900 text-white'
                }`}
              >
                Add transaction
              </button>
            </div>

            <p className={`text-[11px] font-medium uppercase tracking-[0.1em] mb-2 ${muted}`}>
              Activity
            </p>
            <div
              className={`rounded-2xl border overflow-hidden divide-y ${\n                isDark
                  ? 'bg-zinc-950 border-zinc-800/80 divide-zinc-800/80'
                  : 'bg-white border-zinc-200/80 divide-zinc-100'
              }`}
            >
              {transactions.length === 0 ? (
                <p className={`text-center py-12 text-[13px] ${muted}`}>No transactions</p>
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
