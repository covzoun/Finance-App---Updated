const fs = require('fs');

const fileContent = `import React, { useState, useEffect } from 'react';
import { Wallet, Transaction, TransactionType } from '../types';
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
  
  // For Transfer transactions
  const [toWalletId, setToWalletId] = useState('');

  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0].name);
  const [description, setDescription] = useState('');
  const [isRecurring, setIsRecurring] = useState<false | 'daily' | 'weekly' | 'monthly' | 'custom'>(false);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/[^0-9.]/g, '');
    if (val.split('.').length > 2) {
      val = val.replace(/\\.+$/, '');
    }
    const parts = val.split('.');
    parts[0] = parts[0].replace(/\\B(?=(\\d{3})+(?!\\d))/g, ',');
    setAmount(parts.join('.'));
  };

  const [date, setDate] = useState(new Date().toISOString().substring(0, 16)); // YYYY-MM-DDTHH:MM

  // Sync state when open or editingTransaction changes
  useEffect(() => {
    if (isOpen) {
      if (editingTransaction) {
        // Mode: Edit Transaction
        setType(editingTransaction.type);
        setWalletId(editingTransaction.walletId);
        setToWalletId(editingTransaction.toWalletId || '');
        setAmount(editingTransaction.amount.toString().replace(/\\B(?=(\\d{3})+(?!\\d))/g, ','));
        setCategory(editingTransaction.category);
        setDescription(editingTransaction.description);
        setDate(editingTransaction.date.substring(0, 16));
        setIsRecurring(editingTransaction.isRecurring as any || false);
      } else {
        // Mode: Create Transaction
        const defaultWallet = preselectedWalletId || (wallets.length > 0 ? wallets[0].id : '');
        setWalletId(defaultWallet);
        
        const otherWallet = wallets.find((w) => w.id !== defaultWallet);
        setToWalletId(otherWallet ? otherWallet.id : '');

        setType('expense');
        setAmount('');
        setCategory(CATEGORIES[0].name);
        setDescription('');
        setDate(new Date().toISOString().substring(0, 16));
        setIsRecurring(false);
      }
    }
  }, [isOpen, editingTransaction, preselectedWalletId, wallets]);

  // Handle wallet selection change
  const handleWalletChange = (id: string) => {
    setWalletId(id);
  };

  // Handle destination wallet change
  const handleToWalletChange = (id: string) => {
    setToWalletId(id);
  };

  // Auto set category when type changes
  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    if (newType === 'income') {
      setCategory('Salary');
    } else if (newType === 'transfer') {
      setCategory('Transfer');
    } else {
      setCategory(CATEGORIES[0].name);
    }
  };

  if (!isOpen) return null;

  const currentWallet = wallets.find((w) => w.id === walletId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount.replace(/,/g, ''));
    if (isNaN(parsedAmount) || parsedAmount <= 0 || !walletId) return;

    // Build transaction payload
    const txData: Omit<Transaction, 'id'> = {
      walletId,
      type,
      amount: parsedAmount,
      category,
      description: description.trim() || \`\${type.charAt(0).toUpperCase() + type.slice(1)} transaction\`,
      date: new Date(date).toISOString(),
      ...(type === 'transfer' ? { toWalletId } : {}),
      isRecurring,
    };

    if (editingTransaction && onEdit) {
      onEdit(editingTransaction.id, txData);
    } else {
      onAdd(txData);
    }
    onClose();
  };

  const getCatColor = (catName: string, dark: boolean) => {
    const name = catName.toLowerCase();
    if (name.includes('food')) return dark ? 'bg-orange-950/40 text-orange-400' : 'bg-orange-50 text-orange-600';
    if (name.includes('util')) return dark ? 'bg-amber-950/40 text-amber-400' : 'bg-amber-50 text-amber-600';
    if (name.includes('enter')) return dark ? 'bg-pink-950/40 text-pink-400' : 'bg-pink-50 text-pink-600';
    if (name.includes('transp')) return dark ? 'bg-blue-950/40 text-blue-400' : 'bg-blue-50 text-blue-600';
    if (name.includes('shop')) return dark ? 'bg-purple-950/40 text-purple-400' : 'bg-purple-50 text-purple-600';
    if (name.includes('sal')) return dark ? 'bg-emerald-950/40 text-emerald-400' : 'bg-emerald-50 text-emerald-600';
    if (name.includes('transf')) return dark ? 'bg-indigo-950/40 text-indigo-400' : 'bg-indigo-50 text-indigo-600';
    return dark ? 'bg-neutral-800 text-neutral-300' : 'bg-neutral-100 text-neutral-500';
  };

  // Detect active currency symbol
  const currencySymbol = currentWallet?.currency === 'USD' ? '$' : '₱';
  const currencyCode = currentWallet?.currency || 'PHP';

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-0 sm:p-4 backdrop-blur-xs">
      {/* Click outside to close */}
      <div className="absolute inset-0" onClick={onClose} />
      
      {/* Modal Content */}
      <div className={\`relative w-full sm:max-w-md border-t sm:border rounded-t-[32px] sm:rounded-[32px] shadow-2xl overflow-hidden h-[90vh] sm:h-[650px] flex flex-col transition-all \${
        isDark ? 'bg-neutral-900 border-neutral-800 text-white' : 'bg-white border-neutral-100 text-neutral-800'
      }\`}>
        
        {/* Header */}
        <div className={\`flex items-center justify-between border-b px-6 py-4 shrink-0 \${
          isDark ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-neutral-100'
        }\`}>
          <div className="flex items-center gap-2">
            <DynamicIcon name="Receipt" className="text-blue-500" size={18} />
            <h2 className={\`font-sans font-bold text-xs uppercase tracking-wider \${isDark ? 'text-neutral-100' : 'text-neutral-850'}\`}>
              {editingTransaction ? 'Edit Transaction' : 'Record Transaction'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className={\`p-2 -mr-2 rounded-full transition-colors cursor-pointer \${
              isDark ? 'text-neutral-400 hover:bg-neutral-800 hover:text-white' : 'text-neutral-400 hover:bg-neutral-100 hover:text-neutral-800'
            }\`}
          >
            <DynamicIcon name="X" size={20} />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto overscroll-contain p-6 space-y-6">
          
          {/* Type Toggle */}
          <div className={\`flex p-1 rounded-xl border \${isDark ? 'bg-neutral-900/50 border-neutral-800' : 'bg-neutral-50/50 border-neutral-200'}\`}>
            {(['expense', 'income', 'transfer'] as TransactionType[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => handleTypeChange(t)}
                className={\`flex-1 py-2 text-[11px] font-bold uppercase tracking-widest rounded-lg transition-all cursor-pointer \${
                  type === t
                    ? isDark ? 'bg-neutral-800 text-white shadow-sm' : 'bg-white text-neutral-900 shadow-sm border border-neutral-200/50'
                    : isDark ? 'text-neutral-500 hover:text-neutral-300' : 'text-neutral-500 hover:text-neutral-700'
                }\`}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            {/* Wallet Selection */}
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-neutral-500 mb-1.5">
                {type === 'transfer' ? 'From Wallet' : 'Wallet'}
              </label>
              <select
                value={walletId}
                onChange={(e) => handleWalletChange(e.target.value)}
                className={\`w-full rounded-xl border px-4 py-3 text-xs font-bold appearance-none focus:outline-none focus:ring-1 focus:ring-blue-500 \${
                  isDark ? 'bg-neutral-900 border-neutral-800 text-white' : 'bg-neutral-50 border-neutral-200 text-neutral-800'
                }\`}
              >
                {wallets.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name} ({w.currency})
                  </option>
                ))}
              </select>
            </div>

            {/* Destination Wallet (Transfer Only) */}
            {type === 'transfer' && (
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-neutral-500 mb-1.5">
                  To Wallet
                </label>
                <select
                  value={toWalletId}
                  onChange={(e) => handleToWalletChange(e.target.value)}
                  className={\`w-full rounded-xl border px-4 py-3 text-xs font-bold appearance-none focus:outline-none focus:ring-1 focus:ring-blue-500 \${
                    isDark ? 'bg-neutral-900 border-neutral-800 text-white' : 'bg-neutral-50 border-neutral-200 text-neutral-800'
                  }\`}
                >
                  <option value="" disabled>Select destination</option>
                  {wallets.filter(w => w.id !== walletId).map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name} ({w.currency})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Amount */}
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-neutral-500 mb-1.5">
                Amount ({currencyCode})
              </label>
              <div className="relative">
                <span className="absolute left-4 top-3.5 text-xs font-bold text-neutral-400">{currencySymbol}</span>
                <input
                  type="text"
                  inputMode="decimal"
                  required
                  placeholder="0.00"
                  value={amount}
                  onChange={handleAmountChange}
                  className={\`w-full rounded-xl border pl-8 pr-4 py-3 text-sm font-mono font-bold focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors \${
                    isDark ? 'bg-neutral-900 border-neutral-800 text-white placeholder-neutral-700' : 'bg-white border-neutral-200 text-neutral-900 placeholder-neutral-300'
                  }\`}
                />
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-neutral-500 mb-1.5">
                Category
              </label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.name}
                    type="button"
                    onClick={() => setCategory(cat.name)}
                    className={\`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer \${
                      category === cat.name
                        ? getCatColor(cat.name, isDark)
                        : isDark
                          ? 'bg-neutral-900 border border-neutral-800 text-neutral-400 hover:bg-neutral-800'
                          : 'bg-white border border-neutral-200 text-neutral-500 hover:bg-neutral-50'
                    }\`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-neutral-500 mb-1.5">
                  Description / Notes
                </label>
                <input
                  type="text"
                  placeholder={type === 'expense' ? 'e.g. Lunch with friends' : type === 'income' ? 'e.g. Salary' : 'e.g. Account Sweep'}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className={\`w-full rounded-xl border px-4 py-2.5 text-xs placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-blue-500 \${
                    isDark ? 'bg-neutral-900 border-neutral-800 text-white' : 'bg-neutral-50 border-neutral-200 text-neutral-800'
                  }\`}
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-neutral-500 mb-1.5">
                  Date & Time
                </label>
                <input
                  type="datetime-local"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className={\`w-full rounded-xl border px-4 pr-14 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 \${
                    isDark ? 'bg-neutral-900 border-neutral-800 text-white' : 'bg-neutral-50 border-neutral-200 text-neutral-800'
                  }\`}
                />
              </div>
            </div>

            {/* Recurring Section */}
            <div className={\`flex items-center justify-between p-4 rounded-2xl border \${
              isDark ? 'bg-neutral-900/50 border-neutral-800' : 'bg-neutral-50 border-neutral-200/50'
            }\`}>
              <div className="flex items-center gap-2.5">
                <div className={\`p-1.5 rounded-lg \${isDark ? 'bg-blue-900/40 text-blue-400' : 'bg-blue-100 text-blue-600'}\`}>
                  <DynamicIcon name="RefreshCw" size={14} />
                </div>
                <div>
                  <p className={\`text-xs font-bold \${isDark ? 'text-white' : 'text-neutral-900'}\`}>Recurring</p>
                  <p className="text-[10px] text-neutral-500 font-medium">Auto-log this transaction</p>
                </div>
              </div>
              
              <select
                value={isRecurring === false ? 'none' : isRecurring === true ? 'monthly' : isRecurring}
                onChange={(e) => setIsRecurring(e.target.value === 'none' ? false : e.target.value as any)}
                className={\`text-xs font-bold rounded-xl px-3 py-2 border focus:outline-none focus:ring-1 focus:ring-blue-500 \${
                  isDark ? 'bg-neutral-800 border-neutral-700 text-white' : 'bg-white border-neutral-200 text-neutral-900'
                }\`}
              >
                <option value="none">None</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="custom">Custom</option>
              </select>
            </div>
          </div>
        </form>

        {/* Footer Actions */}
        <div className={\`p-6 border-t shrink-0 flex items-center justify-between gap-3 \${
          isDark ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-neutral-100'
        }\`}>
          {editingTransaction && onDelete && (
            <button
              type="button"
              onClick={() => {
                if (confirm('Are you sure you want to delete this transaction?')) {
                  onDelete(editingTransaction.id);
                  onClose();
                }
              }}
              className={\`py-3 px-4 rounded-xl font-bold uppercase text-xs tracking-widest transition-colors border cursor-pointer text-center flex items-center gap-1.5 \${
                isDark
                  ? 'bg-rose-950/40 border-rose-900/40 text-rose-400 hover:bg-rose-900/60'
                  : 'bg-rose-50 border-rose-200 text-rose-600 hover:bg-rose-100'
              }\`}
            >
              <DynamicIcon name="Trash2" size={12} />
              Delete
            </button>
          )}
          
          <div className="flex-1 flex gap-3 justify-end">
            <button
              type="button"
              onClick={onClose}
              className={\`py-3 px-4 rounded-xl font-bold uppercase text-xs tracking-widest transition-colors border cursor-pointer text-center flex-1 \${
                isDark
                  ? 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:bg-neutral-800'
                  : 'bg-white text-neutral-500 border-neutral-200 hover:bg-neutral-50'
              }\`}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!amount || parseFloat(amount.replace(/,/g, '')) <= 0}
              className="py-3 px-4 rounded-xl bg-blue-600 text-white font-bold uppercase text-xs tracking-widest hover:bg-blue-700 active:scale-98 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 cursor-pointer flex-1"
            >
              {editingTransaction ? 'Save' : 'Record'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
`;
fs.writeFileSync('src/components/AddTransactionModal.tsx', fileContent);
