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
    if (val.split('.').length > 2) {
      val = val.replace(/\.+$/, '');
    }
    const parts = val.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    setAmount(parts.join('.'));
  };


  const formatCurrency = (value: number, currencyCode?: 'PHP' | 'USD') => {
    return new Intl.NumberFormat(currencyCode === 'USD' ? 'en-US' : 'en-US', {
      style: 'currency',
      currency: currencyCode || 'PHP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(value);
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

    // Reset Form
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

  return (
    <div className="absolute inset-0 z-40 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Modal Wrapper */}
      <div 
        className={`w-full h-[90vh] sm:h-[650px] w-full sm:max-w-[360px] rounded-t-[32px] sm:rounded-[32px] shadow-2xl flex flex-col overflow-hidden transition-all duration-300 animate-slide-up ${
          isDark ? 'bg-neutral-900 border border-neutral-800' : 'bg-white'
        }`}
        id="add-debt-modal-container"
      >
        {/* Header */}
        <div className={`px-6 py-4 flex items-center justify-between border-b shrink-0 ${
          isDark ? 'border-neutral-800 bg-neutral-900/40' : 'border-neutral-100 bg-neutral-50/50'
        }`}>
          <div className="flex items-center gap-2">
            <DynamicIcon 
              name={type === 'lent' ? "ArrowUpRight" : "ArrowDownLeft"} 
              className={type === 'lent' ? "text-blue-500" : "text-rose-500"} 
              size={18} 
            />
            <h3 className={`font-sans font-bold text-xs uppercase tracking-widest ${isDark ? 'text-white' : 'text-neutral-800'}`}>
              Log Debt / Credit
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className={`rounded-full p-1.5 transition-colors cursor-pointer ${
              isDark ? 'text-neutral-400 hover:bg-neutral-900 hover:text-white' : 'text-neutral-400 hover:bg-neutral-100 hover:text-neutral-800'
            }`}
          >
            <DynamicIcon name="X" size={16} />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className={`overflow-y-auto overscroll-contain px-6 py-5 flex-1 space-y-4 transition-colors ${
          isDark ? 'bg-neutral-900 text-white' : 'bg-white text-neutral-800'
        }`}>
          {/* Type Selector (Pill Style) */}
          <div>
            <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1.5">
              I have...
            </label>
            <div className={`flex p-1 rounded-xl border ${
              isDark ? 'bg-neutral-900/50 border-neutral-800' : 'bg-neutral-100/50 border-neutral-200/50'
            }`}>
              <button
                type="button"
                onClick={() => setType('lent')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  type === 'lent'
                    ? 'bg-blue-600 text-white'
                    : 'text-neutral-400 hover:text-neutral-500'
                }`}
              >
                Lent Money
              </button>
              <button
                type="button"
                onClick={() => setType('borrowed')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  type === 'borrowed'
                    ? 'bg-rose-600 text-white'
                    : 'text-neutral-400 hover:text-neutral-500'
                }`}
              >
                Borrowed Money
              </button>
            </div>
          </div>

          {/* Person Name */}
          <div>
            <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1.5">
              {type === 'lent' ? 'Lent To (Debtor Name)' : 'Borrowed From (Creditor Name)'} *
            </label>
            <input
              type="text"
              required
              placeholder="e.g., John Doe"
              value={person}
              onChange={(e) => setPerson(e.target.value)}
              className={`w-full rounded-xl border px-3.5 py-2.5 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                isDark ? 'bg-neutral-900 border-neutral-800 text-white' : 'bg-neutral-50 border-neutral-200 text-neutral-800'
              }`}
            />
          </div>

          {/* Amount and Currency */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1.5">
                Amount *
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-3.5 text-xs text-neutral-400 font-bold font-mono">
                  {currency === 'USD' ? '$' : '₱'}
                </span>
                <input
                  type="text"
                inputMode="decimal"
                required
                placeholder="0.00"
                value={amount}
                  onChange={handleAmountChange}
                  className={`w-full rounded-xl border pl-7 pr-3 py-2.5 text-xs font-bold font-mono focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                    isDark ? 'bg-neutral-900 border-neutral-800 text-white' : 'bg-neutral-50 border-neutral-200 text-neutral-800'
                  }`}
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1.5">
                Currency
              </label>
              <div className="relative">
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value as 'PHP' | 'USD')}
                  className={`w-full appearance-none rounded-xl border pl-3 pr-9 py-2.5 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer ${
                    isDark ? 'bg-neutral-900 border-neutral-800 text-white' : 'bg-neutral-50 border-neutral-200 text-neutral-850'
                  }`}
                >
                  <option value="PHP">PHP (₱)</option>
                  <option value="USD">USD ($)</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5 text-neutral-400">
                  <DynamicIcon name="ChevronDown" size={12} />
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1.5">
              Reason / Description
            </label>
            <input
              type="text"
              placeholder="e.g., For lunch, Split dinner bills, Emergency cash"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={`w-full rounded-xl border px-3.5 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                isDark ? 'bg-neutral-900 border-neutral-800 text-white' : 'bg-neutral-50 border-neutral-200 text-neutral-800'
              }`}
            />
          </div>

          {/* Wallet Link Selection */}
          <div>
            <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1.5">
              Link Account Pocket
            </label>
            <div className="relative">
              <select
                value={walletId}
                onChange={(e) => setWalletId(e.target.value)}
                className={`w-full appearance-none rounded-xl border pl-3 pr-9 py-2.5 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer ${
                  isDark ? 'bg-neutral-900 border-neutral-800 text-white' : 'bg-neutral-50 border-neutral-200 text-neutral-850'
                }`}
              >
                <option value="">Don't link any account pocket</option>
                {wallets.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name} ({w.currency})
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5 text-neutral-400">
                <DynamicIcon name="ChevronDown" size={12} />
              </div>
            </div>
          </div>

          {/* Automate Balance Impact switch (rendered only if wallet is linked) */}
          {walletId && (
            <div className={`p-3.5 rounded-2xl border transition-all ${
              isDark ? 'bg-neutral-900/20 border-neutral-800' : 'bg-neutral-50 border-neutral-100'
            }`}>
              <label className="flex items-center gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={shouldAffectWallet}
                  onChange={(e) => setShouldAffectWallet(e.target.checked)}
                  className="rounded-md border-neutral-300 text-blue-600 focus:ring-blue-500 h-4 w-4 shrink-0"
                />
                <div className="text-left">
                  <p className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-neutral-300' : 'text-neutral-800'}`}>
                    Record Wallet Transaction
                  </p>
                  <p className="text-xs text-neutral-400 mt-0.5 leading-tight">
                    {type === 'lent' 
                      ? 'Deduct from selected wallet immediately & register as an expense transaction.'
                      : 'Add to selected wallet immediately & register as an income transaction.'
                    }
                  </p>
                </div>
              </label>
            </div>
          )}

          {/* Dates: Borrowed/Lent Date & Due Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1.5">
                {type === 'lent' ? 'Date Lent *' : 'Date Borrowed *'}
              </label>
              <input
                type="date"
                required
                value={borrowedDate}
                onChange={(e) => setBorrowedDate(e.target.value)}
                className={`w-full rounded-xl border pl-3.5 pr-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                  isDark ? 'bg-neutral-900 border-neutral-800 text-white' : 'bg-neutral-50 border-neutral-200 text-neutral-800'
                }`}
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                  Due Date (Optional)
                </label>
                {dueDate && (
                  <button type="button" onClick={() => setDueDate('')} className="text-[10px] font-bold text-rose-500 hover:text-rose-600 transition-colors">
                    Clear
                  </button>
                )}
              </div>

              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className={`w-full rounded-xl border pl-3.5 pr-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                  isDark ? 'bg-neutral-900 border-neutral-800 text-white' : 'bg-neutral-50 border-neutral-200 text-neutral-800'
                }`}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider border transition-colors cursor-pointer text-center ${
                isDark 
                  ? 'border-neutral-800 text-neutral-400 hover:bg-neutral-900 hover:text-white' 
                  : 'border-neutral-200 text-neutral-500 hover:bg-neutral-50 hover:text-neutral-800'
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!person.trim() || !amount}
              className="flex-1 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-blue-600 hover:bg-blue-700 text-white transition-all cursor-pointer text-center active:scale-97 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Save Record
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
