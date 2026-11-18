import React, { useState } from 'react';
import { Wallet, Debt, DebtType } from '../types';
import DynamicIcon from './DynamicIcon';

interface AddCreditModalProps {
  isOpen: boolean;
  onClose: () => void;
  wallets: Wallet[];
  onAdd: (newDebt: Omit<Debt, 'id' | 'status' | 'remainingAmount'>, shouldAffectWallet: boolean) => void;
  themeMode?: 'light' | 'dark';
}

export default function AddCreditModal({ isOpen, onClose, wallets, onAdd, themeMode = 'light' }: AddCreditModalProps) {
  const isDark = themeMode === 'dark';
  const [person, setPerson] = useState('');
  const [type, setType] = useState<DebtType>('lent');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState<'PHP' | 'USD'>('PHP');
  const [description, setDescription] = useState('');
  const [walletId, setWalletId] = useState('');
  const [borrowedDate, setBorrowedDate] = useState(() => new Date().toISOString().substring(0, 10));
  const [dueDate, setDueDate] = useState('');
  const [shouldAffectWallet, setShouldAffectWallet] = useState(true);

  if (!isOpen) return null;

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/[^0-9.]/g, '');
    if (val.split('.').length > 2) val = val.replace(/\.+$/, '');
    const parts = val.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    setAmount(parts.join('.'));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!person.trim() || !amount) return;

    onAdd(
      {
        person: person.trim(),
        type,
        amount: parseFloat(amount.replace(/,/g, '')),
        currency,
        description: description.trim() || undefined,
        walletId: walletId || undefined,
        date: borrowedDate ? new Date(borrowedDate).toISOString() : new Date().toISOString(),
        dueDate: dueDate || undefined,
      },
      shouldAffectWallet && !!walletId
    );

    setPerson('');
    setType('lent');
    setAmount('');
    setCurrency('PHP');
    setDescription('');
    setWalletId('');
    setBorrowedDate(new Date().toISOString().substring(0, 10));
    setDueDate('');
    setShouldAffectWallet(true);
    onClose();
  };

  const field = `w-full rounded-xl border px-3.5 py-2.5 text-[13px] focus:outline-none focus:ring-1 focus:ring-black/20 ${
    isDark ? 'bg-white/8 border-white/10 text-white' : 'bg-black/[0.03] border-black/8 text-[#1c1c1e]'
  }`;

  return (
    <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0" onClick={onClose} />
      <div
        className={`relative w-full sm:max-w-md max-h-[90vh] rounded-t-[28px] sm:rounded-[28px] shadow-2xl flex flex-col overflow-hidden border ${
          isDark ? 'glass-sheet-dark text-white' : 'glass-sheet text-[#1c1c1e]'
        }`}
      >
        <div className={`px-5 py-4 flex items-center justify-between border-b shrink-0 ${
          isDark ? 'border-white/10' : 'border-black/6'
        }`}>
          <h3 className="text-[15px] font-semibold tracking-tight">New debt</h3>
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

        <form onSubmit={handleSubmit} className="overflow-y-auto overscroll-contain px-5 py-5 flex-1 space-y-4">
          <div className={`flex p-0.5 rounded-xl ${isDark ? 'bg-white/8' : 'bg-black/[0.04]'}`}>
            <button
              type="button"
              onClick={() => setType('lent')}
              className={`flex-1 py-2 rounded-[10px] text-[13px] font-medium transition-all ${
                type === 'lent'
                  ? isDark
                    ? 'bg-white/15 text-white'
                    : 'bg-white text-[#1c1c1e] shadow-sm'
                  : isDark
                    ? 'text-white/40'
                    : 'text-black/40'
              }`}
            >
              Lent
            </button>
            <button
              type="button"
              onClick={() => setType('borrowed')}
              className={`flex-1 py-2 rounded-[10px] text-[13px] font-medium transition-all ${
                type === 'borrowed'
                  ? isDark
                    ? 'bg-white/15 text-white'
                    : 'bg-white text-[#1c1c1e] shadow-sm'
                  : isDark
                    ? 'text-white/40'
                    : 'text-black/40'
              }`}
            >
              Borrowed
            </button>
          </div>

          <div>
            <label className={`block text-[11px] font-medium uppercase tracking-[0.1em] mb-1.5 ${isDark ? 'text-white/40' : 'text-black/35'}`}>
              {type === 'lent' ? 'Lent to' : 'Borrowed from'}
            </label>
            <input
              type="text"
              required
              placeholder="Name"
              value={person}
              onChange={(e) => setPerson(e.target.value)}
              className={field}
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-2">
              <label className={`block text-[11px] font-medium uppercase tracking-[0.1em] mb-1.5 ${isDark ? 'text-white/40' : 'text-black/35'}`}>
                Amount
              </label>
              <input
                type="text"
                inputMode="decimal"
                required
                placeholder="0"
                value={amount}
                onChange={handleAmountChange}
                className={field}
              />
            </div>
            <div>
              <label className={`block text-[11px] font-medium uppercase tracking-[0.1em] mb-1.5 ${isDark ? 'text-white/40' : 'text-black/35'}`}>
                Currency
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as 'PHP' | 'USD')}
                className={field}
              >
                <option value="PHP">PHP</option>
                <option value="USD">USD</option>
              </select>
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
              Wallet
            </label>
            <select
              value={walletId}
              onChange={(e) => setWalletId(e.target.value)}
              className={field}
            >
              <option value="">Don't link</option>
              {wallets.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name} ({w.currency})
                </option>
              ))}
            </select>
          </div>

          {walletId && (
            <label className={`flex items-center gap-2 text-[12px] ${isDark ? 'text-white/40' : 'text-black/40'}`}>
              <input
                type="checkbox"
                checked={shouldAffectWallet}
                onChange={(e) => setShouldAffectWallet(e.target.checked)}
                className="rounded"
              />
              Update wallet balance
            </label>
          )}

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className={`block text-[11px] font-medium uppercase tracking-[0.1em] mb-1.5 ${isDark ? 'text-white/40' : 'text-black/35'}`}>
                Date
              </label>
              <input
                type="date"
                required
                value={borrowedDate}
                onChange={(e) => setBorrowedDate(e.target.value)}
                className={field}
              />
            </div>
            <div>
              <label className={`block text-[11px] font-medium uppercase tracking-[0.1em] mb-1.5 ${isDark ? 'text-white/40' : 'text-black/35'}`}>
                Due
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className={field}
              />
            </div>
          </div>

          <div className="pt-2 flex gap-2">
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
              disabled={!person.trim() || !amount}
              className={`flex-1 py-2.5 rounded-xl text-[13px] font-semibold disabled:opacity-50 ${
                isDark ? 'bg-white text-black' : 'bg-[#1c1c1e] text-white'
              }`}
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
