import React, { useState, useEffect } from 'react';
import { Wallet, Transaction, TransactionType, RecurringFrequency } from '../types';
import { CATEGORIES } from '../mockData';
import DynamicIcon from './DynamicIcon';

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  wallets: Wallet[];
  onAdd: (transaction: Omit<Transaction, 'id'>) => void;
  onEdit?: (id: string, transaction: Omit<Transaction, 'id'>) => void;
  onDelete?: (id: string) => void;
  preselectedWalletId?: string;
  editingTransaction?: Transaction | null;
  themeMode?: 'light' | 'dark';
}

const RECURRING_OPTIONS: { value: false | RecurringFrequency; label: string }[] = [
  { value: false, label: 'One-time' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'biweekly', label: 'Biweekly' },
  { value: 'semimonthly', label: 'Semi-monthly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
  { value: 'custom', label: 'Custom' },
];

export default function AddTransactionModal({
  isOpen,
  onClose,
  wallets,
  onAdd,
  onEdit,
  onDelete,
  preselectedWalletId,
  editingTransaction,
  themeMode = 'light',
}: AddTransactionModalProps) {
  const isDark = themeMode === 'dark';
  const [type, setType] = useState<TransactionType>('expense');
  const [walletId, setWalletId] = useState('');
  const [toWalletId, setToWalletId] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0].name);
  const [description, setDescription] = useState('');
  const [isRecurring, setIsRecurring] = useState<false | RecurringFrequency>(false);
  const [customRecurringDays, setCustomRecurringDays] = useState('14');
  const [date, setDate] = useState(new Date().toISOString().substring(0, 16));

  useEffect(() => {
    if (!isOpen) return;

    if (editingTransaction) {
      setType(editingTransaction.type);
      setWalletId(editingTransaction.walletId);
      setToWalletId(editingTransaction.toWalletId || '');
      setAmount(
        editingTransaction.amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
      );
      setCategory(editingTransaction.category);
      setDescription(editingTransaction.description);
      setDate(editingTransaction.date.substring(0, 16));
      setIsRecurring((editingTransaction.isRecurring as any) || false);
      setCustomRecurringDays(
        editingTransaction.customRecurringDays?.toString() || '14'
      );
    } else {
      const defaultWallet =
        preselectedWalletId || (wallets.length > 0 ? wallets[0].id : '');
      setWalletId(defaultWallet);
      const otherWallet = wallets.find((w) => w.id !== defaultWallet);
      setToWalletId(otherWallet ? otherWallet.id : '');
      setType('expense');
      setAmount('');
      setCategory(CATEGORIES[0].name);
      setDescription('');
      setDate(new Date().toISOString().substring(0, 16));
      setIsRecurring(false);
      setCustomRecurringDays('14');
    }
  }, [isOpen, editingTransaction, preselectedWalletId, wallets]);

  if (!isOpen) return null;

  const currentWallet = wallets.find((w) => w.id === walletId);
  const currencySymbol = currentWallet?.currency === 'USD' ? '$' : '₱';
  const currencyCode = currentWallet?.currency || 'PHP';

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/[^0-9.]/g, '');
    if (val.split('.').length > 2) val = val.replace(/\.+$/, '');
    const parts = val.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    setAmount(parts.join('.'));
  };

  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    if (newType === 'income') setCategory('Salary');
    else if (newType === 'transfer') setCategory('Transfer');
    else setCategory(CATEGORIES[0].name);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount.replace(/,/g, ''));
    if (isNaN(parsedAmount) || parsedAmount <= 0 || !walletId) return;

    const txData: Omit<Transaction, 'id'> = {
      walletId,
      type,
      amount: parsedAmount,
      category,
      description:
        description.trim() ||
        `${type.charAt(0).toUpperCase() + type.slice(1)} transaction`,
      date: new Date(date).toISOString(),
      ...(type === 'transfer' ? { toWalletId } : {}),
      isRecurring,
      ...(isRecurring === 'custom'
        ? { customRecurringDays: parseInt(customRecurringDays, 10) || 1 }
        : {}),
    };

    if (editingTransaction && onEdit) {
      onEdit(editingTransaction.id, txData);
    } else {
      onAdd(txData);
    }
    onClose();
  };

  const field = `w-full rounded-xl border px-3.5 py-2.5 text-[13px] focus:outline-none focus:ring-1 focus:ring-black/20 ${
    isDark
      ? 'bg-white/8 border-white/10 text-white'
      : 'bg-black/[0.03] border-black/8 text-[#1c1c1e]'
  }`;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/30 p-0 sm:p-4 backdrop-blur-md">
      <div className="absolute inset-0" onClick={onClose} />

      <div
        className={`relative w-full sm:max-w-md border-t sm:border rounded-t-[28px] sm:rounded-[28px] shadow-2xl overflow-hidden max-h-[92vh] flex flex-col ${
          isDark
            ? 'glass-sheet-dark text-white'
            : 'glass-sheet text-[#1c1c1e]'
        }`}
      >
        <div
          className={`flex items-center justify-between border-b px-5 py-4 shrink-0 ${
            isDark ? 'border-white/10' : 'border-black/6'
          }`}
        >
          <h2 className="text-[15px] font-semibold tracking-tight">
            {editingTransaction ? 'Edit transaction' : 'New transaction'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className={`rounded-full p-1.5 ${
              isDark ? 'text-white/45 hover:bg-white/10' : 'text-black/35 hover:bg-black/5'
            }`}
          >
            <DynamicIcon name="X" size={16} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto overscroll-contain px-5 py-5 space-y-4"
        >
          <div className={`flex p-0.5 rounded-xl ${isDark ? 'bg-white/8' : 'bg-black/[0.04]'}`}>
            {(['expense', 'income', 'transfer'] as TransactionType[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => handleTypeChange(t)}
                className={`flex-1 py-2 text-[12px] font-medium rounded-[10px] capitalize transition-all ${
                  type === t
                    ? isDark
                      ? 'bg-white/15 text-white shadow-sm'
                      : 'bg-white text-[#1c1c1e] shadow-sm'
                    : isDark
                      ? 'text-white/40'
                      : 'text-black/40'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <div>
            <label className={`block text-[11px] font-medium uppercase tracking-[0.1em] mb-1.5 ${isDark ? 'text-white/40' : 'text-black/35'}`}>
              {type === 'transfer' ? 'From' : 'Wallet'}
            </label>
            <select value={walletId} onChange={(e) => setWalletId(e.target.value)} className={field}>
              {wallets.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name} ({w.currency})
                </option>
              ))}
            </select>
          </div>

          {type === 'transfer' && (
            <div>
              <label className={`block text-[11px] font-medium uppercase tracking-[0.1em] mb-1.5 ${isDark ? 'text-white/40' : 'text-black/35'}`}>
                To
              </label>
              <select value={toWalletId} onChange={(e) => setToWalletId(e.target.value)} className={field}>
                <option value="" disabled>
                  Select destination
                </option>
                {wallets
                  .filter((w) => w.id !== walletId)
                  .map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name} ({w.currency})
                    </option>
                  ))}
              </select>
            </div>
          )}

          <div>
            <label className={`block text-[11px] font-medium uppercase tracking-[0.1em] mb-1.5 ${isDark ? 'text-white/40' : 'text-black/35'}`}>
              Amount ({currencyCode})
            </label>
            <div className="relative">
              <span className={`absolute left-3.5 top-2.5 text-[13px] ${isDark ? 'text-white/40' : 'text-black/35'}`}>
                {currencySymbol}
              </span>
              <input
                type="text"
                inputMode="decimal"
                required
                placeholder="0"
                value={amount}
                onChange={handleAmountChange}
                className={`${field} pl-8 tabular`}
              />
            </div>
          </div>

          <div>
            <label className={`block text-[11px] font-medium uppercase tracking-[0.1em] mb-1.5 ${isDark ? 'text-white/40' : 'text-black/35'}`}>
              Category
            </label>
            <div className="flex flex-wrap gap-1.5">
              {CATEGORIES.map((cat) => {
                const active = category === cat.name;
                return (
                  <button
                    key={cat.name}
                    type="button"
                    onClick={() => setCategory(cat.name)}
                    className={`px-3 py-1.5 rounded-full text-[12px] font-medium transition-all ${
                      active
                        ? isDark
                          ? 'bg-white text-black'
                          : 'bg-[#1c1c1e] text-white'
                        : isDark
                          ? 'bg-white/8 text-white/40'
                          : 'bg-black/[0.04] text-black/40'
                    }`}
                  >
                    {cat.name}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className={`block text-[11px] font-medium uppercase tracking-[0.1em] mb-1.5 ${isDark ? 'text-white/40' : 'text-black/35'}`}>
              Note
            </label>
            <input
              type="text"
              placeholder="Optional"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={field}
            />
          </div>

          <div>
            <label className={`block text-[11px] font-medium uppercase tracking-[0.1em] mb-1.5 ${isDark ? 'text-white/40' : 'text-black/35'}`}>
              Date
            </label>
            <input type="datetime-local" value={date} onChange={(e) => setDate(e.target.value)} className={field} />
          </div>

          <div>
            <label className={`block text-[11px] font-medium uppercase tracking-[0.1em] mb-1.5 ${isDark ? 'text-white/40' : 'text-black/35'}`}>
              Repeat
            </label>
            <select
              value={isRecurring === false ? 'false' : String(isRecurring)}
              onChange={(e) => {
                const v = e.target.value;
                setIsRecurring(v === 'false' ? false : (v as RecurringFrequency));
              }}
              className={field}
            >
              {RECURRING_OPTIONS.map((opt) => (
                <option
                  key={String(opt.value)}
                  value={opt.value === false ? 'false' : String(opt.value)}
                >
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {isRecurring === 'custom' && (
            <div>
              <label className={`block text-[11px] font-medium uppercase tracking-[0.1em] mb-1.5 ${isDark ? 'text-white/40' : 'text-black/35'}`}>
                Every N days
              </label>
              <input
                type="number"
                min={1}
                value={customRecurringDays}
                onChange={(e) => setCustomRecurringDays(e.target.value)}
                className={field}
              />
            </div>
          )}

          <div className="pt-2 flex gap-2">
            {editingTransaction && onDelete && (
              <button
                type="button"
                onClick={() => {
                  onDelete(editingTransaction.id);
                  onClose();
                }}
                className={`px-3 py-2.5 rounded-xl text-[13px] font-medium ${
                  isDark ? 'text-rose-400' : 'text-rose-500'
                }`}
              >
                Delete
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className={`flex-1 py-2.5 rounded-xl text-[13px] font-medium border ${
                isDark ? 'border-white/15 text-white/80' : 'border-black/10 text-black/60'
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`flex-1 py-2.5 rounded-xl text-[13px] font-semibold ${
                isDark ? 'bg-white text-black' : 'bg-[#1c1c1e] text-white'
              }`}
            >
              {editingTransaction ? 'Save' : 'Add'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
