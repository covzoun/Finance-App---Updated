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
  const [isRecurring, setIsRecurring] = useState<false | RecurringFrequency>(false);
  const [customRecurringDays, setCustomRecurringDays] = useState('14');

  // Unequal split salary / payout states
  const [isSplitEnabled, setIsSplitEnabled] = useState(false);
  const [firstAmount, setFirstAmount] = useState('');
  const [secondAmount, setSecondAmount] = useState('');
  const [activeCutoff, setActiveCutoff] = useState<1 | 2>(1);
  const [recordBothCutoffs, setRecordBothCutoffs] = useState(false);
  const [cutoffSchedule, setCutoffSchedule] = useState<'15_30' | '1_15' | '10_25'>('15_30');

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/[^0-9.]/g, '');
    if (val.split('.').length > 2) {
      val = val.replace(/\.+$/, '');
    }
    const parts = val.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    setAmount(parts.join('.'));

    // If split is enabled, update corresponding cutoff
    if (isSplitEnabled) {
      if (activeCutoff === 1) {
        setFirstAmount(parts.join('.'));
      } else {
        setSecondAmount(parts.join('.'));
      }
    }
  };

  const handleCutoffAmountChange = (cutoff: 1 | 2, valStr: string) => {
    let val = valStr.replace(/[^0-9.]/g, '');
    if (val.split('.').length > 2) {
      val = val.replace(/\.+$/, '');
    }
    const parts = val.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    const formatted = parts.join('.');

    if (cutoff === 1) {
      setFirstAmount(formatted);
      if (activeCutoff === 1) setAmount(formatted);
    } else {
      setSecondAmount(formatted);
      if (activeCutoff === 2) setAmount(formatted);
    }
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
        setAmount(editingTransaction.amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ','));
        setCategory(editingTransaction.category);
        setDescription(editingTransaction.description);
        setDate(editingTransaction.date.substring(0, 16));
        setIsRecurring(editingTransaction.isRecurring as any || false);
        setCustomRecurringDays(editingTransaction.customRecurringDays?.toString() || '14');

        if (editingTransaction.splitPayout?.enabled) {
          setIsSplitEnabled(true);
          setFirstAmount(editingTransaction.splitPayout.firstAmount?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') || '');
          setSecondAmount(editingTransaction.splitPayout.secondAmount?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') || '');
          setActiveCutoff(editingTransaction.splitPayout.currentCutoff || 1);
          setCutoffSchedule(editingTransaction.splitPayout.cutoffSchedule as any || '15_30');
          setRecordBothCutoffs(false);
        } else {
          setIsSplitEnabled(false);
          setFirstAmount('');
          setSecondAmount('');
          setActiveCutoff(1);
          setRecordBothCutoffs(false);
        }
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
        setCustomRecurringDays('14');
        setIsSplitEnabled(false);
        setFirstAmount('');
        setSecondAmount('');
        setActiveCutoff(1);
        setRecordBothCutoffs(false);
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
  const currencySymbol = currentWallet?.currency === 'USD' ? '$' : '₱';
  const currencyCode = currentWallet?.currency || 'PHP';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount.replace(/,/g, ''));
    if (isNaN(parsedAmount) || parsedAmount <= 0 || !walletId) return;

    const parsedFirst = parseFloat(firstAmount.replace(/,/g, '')) || parsedAmount;
    const parsedSecond = parseFloat(secondAmount.replace(/,/g, '')) || parsedAmount;

    const splitConfig = isSplitEnabled && (isRecurring === 'biweekly' || isRecurring === 'semimonthly') ? {
      enabled: true,
      firstAmount: parsedFirst,
      secondAmount: parsedSecond,
      firstLabel: isRecurring === 'semimonthly' ? '1st Cutoff' : '1st Payout',
      secondLabel: isRecurring === 'semimonthly' ? '2nd Cutoff' : '2nd Payout',
      cutoffSchedule,
      currentCutoff: activeCutoff,
    } : undefined;

    // Build base transaction payload
    const txData: Omit<Transaction, 'id'> = {
      walletId,
      type,
      amount: parsedAmount,
      category,
      description: description.trim() || `${type.charAt(0).toUpperCase() + type.slice(1)} transaction`,
      date: new Date(date).toISOString(),
      ...(type === 'transfer' ? { toWalletId } : {}),
      isRecurring,
      ...(isRecurring === 'custom' ? { customRecurringDays: parseInt(customRecurringDays, 10) || 1 } : {}),
      ...(splitConfig ? { splitPayout: splitConfig } : {}),
    };

    if (editingTransaction && onEdit) {
      onEdit(editingTransaction.id, txData);
    } else {
      onAdd(txData);

      // If user enabled split payouts AND checked "Also record paired cutoff" on new transaction
      if (isSplitEnabled && recordBothCutoffs && (isRecurring === 'biweekly' || isRecurring === 'semimonthly')) {
        const otherCutoff = activeCutoff === 1 ? 2 : 1;
        const otherAmount = activeCutoff === 1 ? parsedSecond : parsedFirst;
        
        const primaryDate = new Date(date);
        const secondDate = new Date(primaryDate);
        if (isRecurring === 'biweekly') {
          secondDate.setDate(secondDate.getDate() + 14);
        } else {
          secondDate.setDate(secondDate.getDate() + 15);
        }

        const secondTxData: Omit<Transaction, 'id'> = {
          walletId,
          type,
          amount: otherAmount,
          category,
          description: description.trim() 
            ? `${description.trim()} (${otherCutoff === 2 ? 'Cutoff 2' : 'Cutoff 1'})`
            : `${type.charAt(0).toUpperCase() + type.slice(1)} (${otherCutoff === 2 ? 'Cutoff 2' : 'Cutoff 1'})`,
          date: secondDate.toISOString(),
          ...(type === 'transfer' ? { toWalletId } : {}),
          isRecurring,
          splitPayout: {
            ...splitConfig!,
            currentCutoff: otherCutoff,
          },
        };

        onAdd(secondTxData);
      }
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

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-0 sm:p-4 backdrop-blur-xs">
      {/* Click outside to close */}
      <div className="absolute inset-0" onClick={onClose} />
      
      {/* Modal Content */}
      <div className={`relative w-full sm:max-w-md border-t sm:border rounded-t-[32px] sm:rounded-[32px] shadow-2xl overflow-hidden h-[90vh] sm:h-[650px] flex flex-col transition-all ${
        isDark ? 'bg-neutral-900 border-neutral-800 text-white' : 'bg-white border-neutral-100 text-neutral-800'
      }`}>
        
        {/* Header */}
        <div className={`flex items-center justify-between border-b px-6 py-4 shrink-0 ${
          isDark ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-neutral-100'
        }`}>
          <div className="flex items-center gap-2">
            <DynamicIcon name="Receipt" className="text-blue-500" size={18} />
            <h2 className={`font-sans font-bold text-xs uppercase tracking-wider ${isDark ? 'text-neutral-100' : 'text-neutral-850'}`}>
              {editingTransaction ? 'Edit Transaction' : 'Record Transaction'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className={`p-2 -mr-2 rounded-full transition-colors cursor-pointer ${
              isDark ? 'text-neutral-400 hover:bg-neutral-800 hover:text-white' : 'text-neutral-400 hover:bg-neutral-100 hover:text-neutral-800'
            }`}
          >
            <DynamicIcon name="X" size={20} />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto overscroll-contain p-6 space-y-6">
          
          {/* Type Toggle */}
          <div className={`flex p-1 rounded-xl border ${isDark ? 'bg-neutral-900/50 border-neutral-800' : 'bg-neutral-50/50 border-neutral-200'}`}>
            {(['expense', 'income', 'transfer'] as TransactionType[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => handleTypeChange(t)}
                className={`flex-1 py-2 text-[11px] font-bold uppercase tracking-widest rounded-lg transition-all cursor-pointer ${
                  type === t
                    ? isDark ? 'bg-neutral-800 text-white shadow-sm' : 'bg-white text-neutral-900 shadow-sm border border-neutral-200/50'
                    : isDark ? 'text-neutral-500 hover:text-neutral-300' : 'text-neutral-500 hover:text-neutral-700'
                }`}
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
              <div className="relative">
                <select
                  value={walletId}
                  onChange={(e) => handleWalletChange(e.target.value)}
                  className={`w-full rounded-xl border pl-4 pr-10 py-3 text-xs font-bold appearance-none focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                    isDark ? 'bg-neutral-900 border-neutral-800 text-white' : 'bg-neutral-50 border-neutral-200 text-neutral-800'
                  }`}
                >
                  {wallets.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name} ({w.currency})
                    </option>
                  ))}
                </select>
                <div className="absolute right-3 top-3.5 pointer-events-none text-neutral-400">
                  <DynamicIcon name="ChevronDown" size={16} />
                </div>
              </div>
              <div className="absolute right-3 top-3.5 pointer-events-none text-neutral-400"><DynamicIcon name="ChevronDown" size={16} /></div>
            </div>
            </div>

            {/* Destination Wallet (Transfer Only) */}
            {type === 'transfer' && (
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-neutral-500 mb-1.5">
                  To Wallet
                </label>
                <div className="relative">
                  <select
                    value={toWalletId}
                    onChange={(e) => handleToWalletChange(e.target.value)}
                    className={`w-full rounded-xl border pl-4 pr-10 py-3 text-xs font-bold appearance-none focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                      isDark ? 'bg-neutral-900 border-neutral-800 text-white' : 'bg-neutral-50 border-neutral-200 text-neutral-800'
                    }`}
                  >
                    <option value="" disabled>Select destination</option>
                    {wallets.filter(w => w.id !== walletId).map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.name} ({w.currency})
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-3.5 pointer-events-none text-neutral-400">
                    <DynamicIcon name="ChevronDown" size={16} />
                  </div>
                </div>
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
                  className={`w-full rounded-xl border pl-8 pr-4 py-3 text-sm font-mono font-bold focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors ${
                    isDark ? 'bg-neutral-900 border-neutral-800 text-white placeholder-neutral-700' : 'bg-white border-neutral-200 text-neutral-900 placeholder-neutral-300'
                  }`}
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
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      category === cat.name
                        ? getCatColor(cat.name, isDark)
                        : isDark
                          ? 'bg-neutral-900 border border-neutral-800 text-neutral-400 hover:bg-neutral-800'
                          : 'bg-white border border-neutral-200 text-neutral-500 hover:bg-neutral-50'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-neutral-500 mb-1.5">
                  Description / Notes
                </label>
                <input
                  type="text"
                  placeholder={type === 'expense' ? 'e.g. Lunch with friends' : type === 'income' ? 'e.g. Salary' : 'e.g. Account Sweep'}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className={`w-full rounded-xl border px-4 py-2.5 text-xs placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                    isDark ? 'bg-neutral-900 border-neutral-800 text-white' : 'bg-neutral-50 border-neutral-200 text-neutral-800'
                  }`}
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
                  className={`w-full rounded-xl border pl-3 pr-10 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                    isDark ? 'bg-neutral-900 border-neutral-800 text-white' : 'bg-neutral-50 border-neutral-200 text-neutral-800'
                  }`}
                />
              </div>
            </div>

            
            {/* Recurring Section */}
            <div className={`flex items-center justify-between p-4 rounded-2xl border ${
              isDark ? 'bg-neutral-900/50 border-neutral-800' : 'bg-neutral-50 border-neutral-200/50'
            }`}>
              <div className="flex items-center gap-2.5">
                <div className={`p-1.5 rounded-lg ${isDark ? 'bg-blue-900/40 text-blue-400' : 'bg-blue-100 text-blue-600'}`}>
                  <DynamicIcon name="RefreshCw" size={14} />
                </div>
                <div>
                  <p className={`text-xs font-bold ${isDark ? 'text-white' : 'text-neutral-900'}`}>Recurring</p>
                  <p className="text-[10px] text-neutral-500 font-medium">Auto-log this transaction</p>
                </div>
              </div>
              
              <div className="relative">
                <select
                  value={isRecurring === false ? 'none' : isRecurring === true ? 'monthly' : isRecurring}
                  onChange={(e) => {
                    const val = e.target.value === 'none' ? false : e.target.value as any;
                    setIsRecurring(val);
                    if (val === 'biweekly' || val === 'semimonthly') {
                      setIsSplitEnabled(true);
                      if (!firstAmount && amount) setFirstAmount(amount);
                    } else {
                      setIsSplitEnabled(false);
                    }
                  }}
                  className={`text-xs font-bold appearance-none rounded-xl pl-3 pr-8 py-2 border focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                    isDark ? 'bg-neutral-800 border-neutral-700 text-white' : 'bg-white border-neutral-200 text-neutral-900'
                  }`}
                >
                  <option value="none">None (One-time)</option>
                  <option value="biweekly">Bi-weekly (Every 2 weeks)</option>
                  <option value="semimonthly">Semi-monthly (Twice a month, e.g. 15th & 30th)</option>
                  <option value="monthly">Monthly</option>
                  <option value="weekly">Weekly</option>
                  <option value="daily">Daily</option>
                  <option value="yearly">Yearly</option>
                  <option value="custom">Custom interval</option>
                </select>
                <div className="absolute right-2.5 top-2.5 pointer-events-none text-neutral-400">
                  <DynamicIcon name="ChevronDown" size={14} />
                </div>
              </div>
            </div>

            {/* Custom Recurring Days Input */}
            {isRecurring === 'custom' && (
              <div className="flex items-center justify-between pl-12 pr-4 pb-2">
                <span className={`text-[10px] font-bold uppercase tracking-widest ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>Repeat every</span>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    value={customRecurringDays}
                    onChange={(e) => setCustomRecurringDays(e.target.value)}
                    className={`w-16 text-center rounded-lg border px-2 py-1.5 text-xs font-bold focus:outline-none ${
                      isDark ? 'bg-neutral-900 border-neutral-700 text-white' : 'bg-white border-neutral-200 text-neutral-900'
                    }`}
                  />
                  <span className={`text-[10px] font-bold uppercase tracking-widest ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>Days</span>
                </div>
              </div>
            )}

            {/* Unequal Salary Split / Payout Section (For Bi-weekly or Semi-monthly) */}
            {(isRecurring === 'biweekly' || isRecurring === 'semimonthly') && (
              <div className={`p-4 rounded-2xl border space-y-3 transition-all ${
                isDark ? 'bg-neutral-900/60 border-neutral-800' : 'bg-neutral-50 border-neutral-200/70'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <DynamicIcon name="Split" size={14} className="text-blue-500 shrink-0" />
                    <div>
                      <span className={`text-xs font-bold block ${isDark ? 'text-white' : 'text-neutral-900'}`}>
                        Unequal Payouts (Salary Split)
                      </span>
                      <span className="text-[10px] text-neutral-400 block leading-tight">
                        Support 2 paychecks per month with different amounts
                      </span>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      checked={isSplitEnabled}
                      onChange={(e) => {
                        const next = e.target.checked;
                        setIsSplitEnabled(next);
                        if (next && !firstAmount && amount) {
                          setFirstAmount(amount);
                        }
                      }}
                      className="sr-only peer"
                    />
                    <div className="w-8 h-4 bg-neutral-300 dark:bg-neutral-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                {isSplitEnabled && (
                  <div className="space-y-3 pt-2 border-t dark:border-neutral-800 border-neutral-200">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1">
                          {isRecurring === 'semimonthly' ? '1st Cutoff (e.g. 15th)' : '1st Payout'}
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-2.5 text-xs font-bold text-neutral-400">{currencySymbol}</span>
                          <input
                            type="text"
                            inputMode="decimal"
                            placeholder="0.00"
                            value={firstAmount}
                            onChange={(e) => handleCutoffAmountChange(1, e.target.value)}
                            className={`w-full rounded-xl border pl-7 pr-3 py-2 text-xs font-mono font-bold focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                              isDark ? 'bg-neutral-900 border-neutral-700 text-white' : 'bg-white border-neutral-200 text-neutral-900'
                            }`}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1">
                          {isRecurring === 'semimonthly' ? '2nd Cutoff (e.g. 30th)' : '2nd Payout'}
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-2.5 text-xs font-bold text-neutral-400">{currencySymbol}</span>
                          <input
                            type="text"
                            inputMode="decimal"
                            placeholder="0.00"
                            value={secondAmount}
                            onChange={(e) => handleCutoffAmountChange(2, e.target.value)}
                            className={`w-full rounded-xl border pl-7 pr-3 py-2 text-xs font-mono font-bold focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                              isDark ? 'bg-neutral-900 border-neutral-700 text-white' : 'bg-white border-neutral-200 text-neutral-900'
                            }`}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Active Cutoff Pill Selector */}
                    <div>
                      <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1.5">
                        This Transaction Records:
                      </label>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setActiveCutoff(1);
                            if (firstAmount) setAmount(firstAmount);
                          }}
                          className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            activeCutoff === 1
                              ? 'bg-blue-600 text-white shadow-xs'
                              : isDark ? 'bg-neutral-800 text-neutral-400 hover:text-white' : 'bg-neutral-200/70 text-neutral-600 hover:text-neutral-900'
                          }`}
                        >
                          1st Payout {firstAmount ? `(${currencySymbol}${firstAmount})` : ''}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setActiveCutoff(2);
                            if (secondAmount) setAmount(secondAmount);
                          }}
                          className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            activeCutoff === 2
                              ? 'bg-blue-600 text-white shadow-xs'
                              : isDark ? 'bg-neutral-800 text-neutral-400 hover:text-white' : 'bg-neutral-200/70 text-neutral-600 hover:text-neutral-900'
                          }`}
                        >
                          2nd Payout {secondAmount ? `(${currencySymbol}${secondAmount})` : ''}
                        </button>
                      </div>
                    </div>

                    {/* Total Monthly Sum */}
                    {(parseFloat(firstAmount.replace(/,/g, '')) > 0 || parseFloat(secondAmount.replace(/,/g, '')) > 0) && (
                      <div className={`p-2 rounded-xl flex items-center justify-between text-xs font-bold ${
                        isDark ? 'bg-neutral-950 text-neutral-300' : 'bg-white text-neutral-700 border border-neutral-200/60'
                      }`}>
                        <span className="text-[10px] uppercase tracking-wider text-neutral-400">Combined Monthly Payout:</span>
                        <span className="font-mono text-emerald-500 font-extrabold">
                          {currencySymbol}{((parseFloat(firstAmount.replace(/,/g, '')) || 0) + (parseFloat(secondAmount.replace(/,/g, '')) || 0)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>
                    )}

                    {/* Checkbox to log both on creation */}
                    {!editingTransaction && (
                      <label className="flex items-center gap-2 cursor-pointer pt-0.5">
                        <input
                          type="checkbox"
                          checked={recordBothCutoffs}
                          onChange={(e) => setRecordBothCutoffs(e.target.checked)}
                          className="rounded border-neutral-300 text-blue-600 focus:ring-blue-500 h-3.5 w-3.5"
                        />
                        <span className={`text-[10px] font-medium leading-tight ${isDark ? 'text-neutral-300' : 'text-neutral-700'}`}>
                          Also auto-record paired {activeCutoff === 1 ? '2nd' : '1st'} payout (+{isRecurring === 'biweekly' ? '14 days' : '15 days'})
                        </span>
                      </label>
                    )}
                  </div>
                )}
              </div>
            )}
          
        </form>


        {/* Footer Actions */}
        <div className={`p-6 border-t shrink-0 flex items-center justify-between gap-3 ${
          isDark ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-neutral-100'
        }`}>
          {editingTransaction && onDelete && (
            <button
              type="button"
              onClick={() => {
                if (confirm('Are you sure you want to delete this transaction?')) {
                  onDelete(editingTransaction.id);
                  onClose();
                }
              }}
              className={`py-3 px-4 rounded-xl font-bold uppercase text-xs tracking-widest transition-colors border cursor-pointer text-center flex items-center gap-1.5 ${
                isDark
                  ? 'bg-rose-950/40 border-rose-900/40 text-rose-400 hover:bg-rose-900/60'
                  : 'bg-rose-50 border-rose-200 text-rose-600 hover:bg-rose-100'
              }`}
            >
              <DynamicIcon name="Trash2" size={12} />
              Delete
            </button>
          )}
          
          <div className="flex-1 flex gap-3 justify-end">
            <button
              type="button"
              onClick={onClose}
              className={`py-3 px-4 rounded-xl font-bold uppercase text-xs tracking-widest transition-colors border cursor-pointer text-center flex-1 ${
                isDark
                  ? 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:bg-neutral-800'
                  : 'bg-white text-neutral-500 border-neutral-200 hover:bg-neutral-50'
              }`}
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
