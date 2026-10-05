import React, { useState } from 'react';
import { Wallet, Debt } from '../types';
import DynamicIcon from './DynamicIcon';
import { motion, AnimatePresence } from 'motion/react';

interface CreditsListProps {
  debts: Debt[];
  wallets: Wallet[];
  onAddRepayment: (
    debtId: string, 
    amount: number, 
    walletId: string | undefined, 
    shouldAffectWallet: boolean
  ) => void;
  onSettleDirectly: (debtId: string) => void;
  onDeleteDebt: (debtId: string) => void;
  onOpenAddDebt: () => void;
  themeMode?: 'light' | 'dark';
}

export default function CreditsList({
  debts,
  wallets,
  onAddRepayment,
  onSettleDirectly,
  onDeleteDebt,
  onOpenAddDebt,
  themeMode = 'light'
}: CreditsListProps) {
  const isDark = themeMode === 'dark';
  const USD_RATE = 58.5;

  const [activeTab, setActiveTab] = useState<'active' | 'settled'>('active');
  const [expandedDebtId, setExpandedDebtId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Repayment form states for active debt
  const [repayAmount, setRepayAmount] = useState('');
  const [repayWalletId, setRepayWalletId] = useState('');
  const [repayAffectsWallet, setRepayAffectsWallet] = useState(true);

  // Convert amounts to PHP for stats
  const getPHPValue = (amount: number, currency: 'PHP' | 'USD') => {
    return currency === 'USD' ? amount * USD_RATE : amount;
  };

  const formatCurrency = (amount: number, currency: 'PHP' | 'USD') => {
    return new Intl.NumberFormat(currency === 'USD' ? 'en-US' : 'en-PH', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatPHP = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  // Stats calculations (active debts only)
  const activeDebts = debts.filter((d) => d.status !== 'paid');
  const settledDebts = debts.filter((d) => d.status === 'paid');

  const totalOwedToMePHP = activeDebts
    .filter((d) => d.type === 'lent')
    .reduce((sum, d) => sum + getPHPValue(d.remainingAmount, d.currency), 0);

  const totalIOwePHP = activeDebts
    .filter((d) => d.type === 'borrowed')
    .reduce((sum, d) => sum + getPHPValue(d.remainingAmount, d.currency), 0);

  const netDebtPHP = totalOwedToMePHP - totalIOwePHP;

  const handleCardClick = (debt: Debt) => {
    if (expandedDebtId === debt.id) {
      setExpandedDebtId(null);
    } else {
      setExpandedDebtId(debt.id);
      setRepayAmount(debt.remainingAmount.toString());
      // Default to first wallet of matching currency if available
      const matchWallet = wallets.find((w) => w.currency === debt.currency);
      setRepayWalletId(matchWallet?.id || wallets[0]?.id || '');
      setRepayAffectsWallet(true);
    }
  };

  const handleRepaySubmit = (e: React.FormEvent, debt: Debt) => {
    e.preventDefault();
    const parsedAmount = parseFloat(repayAmount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) return;

    onAddRepayment(
      debt.id,
      parsedAmount,
      repayWalletId || undefined,
      repayAffectsWallet && !!repayWalletId
    );

    setExpandedDebtId(null);
    setRepayAmount('');
    setRepayWalletId('');
  };

  const getDaysDiff = (dateStr: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(dateStr);
    target.setHours(0, 0, 0, 0);
    const diffTime = target.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getDueDateLabel = (dueDateStr: string) => {
    const diff = getDaysDiff(dueDateStr);
    if (diff === 0) return { label: 'Due Today', style: 'text-amber-500 font-bold' };
    if (diff < 0) return { label: `Overdue by ${Math.abs(diff)}d`, style: 'text-rose-500 font-bold' };
    return { label: `Due in ${diff}d`, style: 'text-neutral-400 font-medium' };
  };

  const rawList = activeTab === 'active' ? activeDebts : settledDebts;
  const listToRender = rawList.filter((d) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      d.person.toLowerCase().includes(q) ||
      (d.description || '').toLowerCase().includes(q) ||
      d.amount.toString().includes(q)
    );
  });

  // Generate initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .slice(0, 2)
      .map((n) => n[0])
      .join('')
      .toUpperCase() || '?';
  };

  // Color generator for avatar based on name
  const getAvatarBg = (name: string) => {
    const code = name.charCodeAt(0) % 5;
    const colors = [
      'bg-blue-500/10 text-blue-500',
      'bg-emerald-500/10 text-emerald-500',
      'bg-purple-500/10 text-purple-500',
      'bg-amber-500/10 text-amber-500',
      'bg-pink-500/10 text-pink-500',
    ];
    return colors[code];
  };

  return (
    <div className="space-y-6" id="credits-dashboard-view">
      
      {/* 1. Bento Overview Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className={`p-4 rounded-3xl border shadow-xs ${
          isDark ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-neutral-100'
        }`}>
          <div className="flex items-center gap-1.5 mb-3 text-neutral-500">
            <DynamicIcon name="ArrowUpRight" className="text-blue-500 shrink-0" size={14} />
            <span className="text-[10px] font-extrabold uppercase tracking-widest leading-none text-neutral-500">Owed To Me</span>
          </div>
          <p className={`font-mono text-sm font-black ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
            {formatPHP(totalOwedToMePHP)}
          </p>
          <span className="text-[9px] text-neutral-500/60 font-semibold uppercase tracking-widest block mt-1.5">Owed by others</span>
        </div>

        <div className={`p-4 rounded-3xl border shadow-xs ${
          isDark ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-neutral-100'
        }`}>
          <div className="flex items-center gap-1.5 mb-3 text-neutral-500">
            <DynamicIcon name="ArrowDownLeft" className="text-neutral-400 shrink-0" size={14} />
            <span className="text-[10px] font-extrabold uppercase tracking-widest leading-none">I Owe Others</span>
          </div>
          <p className={`font-mono text-sm font-black ${isDark ? 'text-neutral-300' : 'text-neutral-700'}`}>
            {formatPHP(totalIOwePHP)}
          </p>
          <span className="text-[9px] text-neutral-500/60 font-semibold uppercase tracking-widest block mt-1.5">Owed to others</span>
        </div>

        <div className={`col-span-2 p-4 rounded-3xl border shadow-xs flex items-center justify-between ${
          isDark ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-neutral-100'
        }`}>
          <div>
            <div className="flex items-center gap-1.5 mb-0.5 text-neutral-400">
              <DynamicIcon name="Activity" className="text-blue-500 shrink-0" size={14} />
              <span className="text-[10px] font-extrabold uppercase tracking-widest leading-none">
                {netDebtPHP >= 0 ? 'Net Receivable' : 'Net Payable'}
              </span>
            </div>
            <p className={`font-mono text-sm font-black mt-2 ${isDark ? "text-white" : "text-neutral-900"}`}>
              {formatPHP(Math.abs(netDebtPHP))}
            </p>
          </div>
          <button
            onClick={onOpenAddDebt}
            className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer active:scale-97 flex items-center gap-1"
          >
            <DynamicIcon name="Plus" size={12} /> Log Record
          </button>
        </div>
      </div>

      {/* 2. List Tab Switches */}
      <div className={`flex p-1 rounded-2xl border transition-colors ${
        isDark ? 'bg-neutral-900/50 border-neutral-800' : 'bg-neutral-100 border-neutral-200/40'
      }`}>
        <button
          onClick={() => {
            setActiveTab('active');
            setExpandedDebtId(null);
          }}
          className={`flex-1 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
            activeTab === 'active'
              ? 'bg-blue-600 text-white shadow-xs font-black'
              : isDark
              ? 'text-neutral-500 hover:text-neutral-350'
              : 'text-neutral-400 hover:text-neutral-750'
          }`}
        >
          Active ({activeDebts.length})
        </button>
        <button
          onClick={() => {
            setActiveTab('settled');
            setExpandedDebtId(null);
          }}
          className={`flex-1 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
            activeTab === 'settled'
              ? 'bg-blue-600 text-white shadow-xs font-black'
              : isDark
              ? 'text-neutral-500 hover:text-neutral-350'
              : 'text-neutral-400 hover:text-neutral-750'
          }`}
        >
          Settled ({settledDebts.length})
        </button>
      </div>
      
      {/* Search Bar for Debts / Credits */}
      {(activeDebts.length > 0 || settledDebts.length > 0) && (
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
            <DynamicIcon name="Search" size={13} />
          </div>
          <input
            type="text"
            placeholder="Search by person name or note..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full rounded-xl pl-9 pr-8 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 border ${
              isDark ? 'bg-neutral-900 border-neutral-800 text-white placeholder-neutral-500' : 'bg-white border-neutral-200 text-neutral-800 placeholder-neutral-400'
            }`}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 cursor-pointer"
            >
              <DynamicIcon name="X" size={12} />
            </button>
          )}
        </div>
      )}

      {/* 3. Debts Flow List */}
      <div className="space-y-3">
        {listToRender.length === 0 ? (
          <div className={`text-center py-12 px-6 rounded-3xl border border-dashed flex flex-col items-center justify-center ${
            isDark 
              ? 'border-neutral-800 bg-neutral-900/40 text-neutral-400' 
              : 'border-neutral-200 bg-white text-neutral-500'
          }`}>
            <div className={`h-12 w-12 rounded-2xl flex items-center justify-center mb-3.5 ${
              isDark ? 'bg-neutral-900 text-neutral-500' : 'bg-neutral-50 text-neutral-400'
            }`}>
              <DynamicIcon name="ShieldAlert" size={20} />
            </div>
            <h4 className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-neutral-300' : 'text-neutral-800'}`}>
              No {activeTab} Records
            </h4>
            <p className="text-xs text-neutral-400 mt-1 max-w-[220px] leading-relaxed mx-auto">
              {activeTab === 'active' 
                ? 'Great! You do not have any active loans, credits, or unsettled debt items.'
                : 'Your fully-settled credits and debt history will show up here.'
              }
            </p>
            {activeTab === 'active' && (
              <button
                onClick={onOpenAddDebt}
                className="mt-4 px-3.5 py-1.5 rounded-xl border border-blue-500/30 hover:border-blue-500 text-blue-500 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
              >
                Log Your First Debt Record
              </button>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {listToRender.map((debt) => {
              const isExpanded = expandedDebtId === debt.id;
              const isLent = debt.type === 'lent';
              const paidAmount = debt.amount - debt.remainingAmount;
              const paidPercentage = debt.amount > 0 ? (paidAmount / debt.amount) * 100 : 0;

              return (
                <div
                  key={debt.id}
                  className={`border rounded-2xl overflow-hidden shadow-xs transition-all ${
                    isExpanded 
                      ? isDark ? 'bg-neutral-900/80 border-blue-500/40' : 'bg-white border-blue-500/40 ring-1 ring-blue-500/10'
                      : isDark ? 'bg-neutral-900 border-neutral-800 hover:border-neutral-700' : 'bg-white border-neutral-100 hover:border-neutral-200/80'
                  }`}
                >
                  {/* Primary Card View Header Clickable */}
                  <div 
                    onClick={() => handleCardClick(debt)}
                    className="p-4 flex items-center justify-between cursor-pointer select-none"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Avatar initials with beautiful bg */}
                      <div className={`h-10 w-10 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${getAvatarBg(debt.person)}`}>
                        {getInitials(debt.person)}
                      </div>

                      <div className="min-w-0 text-left">
                        <h4 className={`text-sm font-black truncate leading-tight ${isDark ? 'text-white' : 'text-neutral-800'}`}>
                          {debt.person}
                        </h4>
                        
                        {/* Custom subtext showing progress of repayment */}
                        <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                          <span className={`text-xs font-bold uppercase px-1 rounded-sm ${
                            isLent 
                              ? isDark ? 'bg-emerald-950/40 text-emerald-400' : 'bg-emerald-50 text-emerald-600'
                              : isDark ? 'bg-rose-950/40 text-rose-400' : 'bg-rose-50 text-rose-600'
                          }`}>
                            {isLent ? 'Lent' : 'Borrowed'}
                          </span>

                          <span className={`text-xs font-medium ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
                            • {new Date(debt.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>

                          {debt.dueDate && debt.status !== 'paid' && (
                            <span className={`text-xs ${getDueDateLabel(debt.dueDate).style}`}>
                              • {getDueDateLabel(debt.dueDate).label}
                            </span>
                          )}

                          {debt.description && (
                            <span className="text-xs text-neutral-400 truncate max-w-[120px]">
                              • {debt.description}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className={`font-mono text-xs font-extrabold block ${
                        isLent ? 'text-emerald-500' : 'text-rose-500'
                      }`}>
                        {isLent ? '+' : '-'}{formatCurrency(debt.remainingAmount, debt.currency)}
                      </span>
                      {debt.status === 'partially_paid' && (
                        <span className="text-[8px] text-neutral-400 font-semibold">
                          {formatCurrency(paidAmount, debt.currency)} paid of {formatCurrency(debt.amount, debt.currency)}
                        </span>
                      )}
                      {debt.status === 'paid' && (
                        <span className="text-[8px] text-neutral-400 font-extrabold uppercase tracking-widest bg-emerald-500/10 text-emerald-500 px-1 rounded-sm">
                          Settled
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Micro Repay Progress Bar (Only render if active and partially repaid) */}
                  {debt.status === 'partially_paid' && !isExpanded && (
                    <div className="h-1 w-full bg-neutral-100 dark:bg-neutral-900">
                      <div 
                        className={`h-full ${isLent ? 'bg-emerald-500' : 'bg-rose-500'}`}
                        style={{ width: `${paidPercentage}%` }}
                      />
                    </div>
                  )}

                  {/* Expandable Repayment Controls Form & Detailed Actions */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className={`border-t transition-colors ${
                          isDark ? 'border-neutral-800/60 bg-neutral-900/40' : 'border-neutral-100 bg-neutral-50/30'
                        }`}
                      >
                        <div className="px-6 py-5 space-y-5">
                          
                          {/* Details Metadata Grid */}
                          <div className="grid grid-cols-2 gap-4 text-xs border-b pb-4 dark:border-neutral-800/50 border-neutral-100">
                            <div>
                              <span className="text-[8px] uppercase tracking-wider text-neutral-400 block mb-1 font-bold">Total Principal</span>
                              <span className={`font-mono font-black text-xs ${isDark ? 'text-neutral-200' : 'text-neutral-800'}`}>
                                {formatCurrency(debt.amount, debt.currency)}
                              </span>
                            </div>
                            <div>
                              <span className="text-[8px] uppercase tracking-wider text-neutral-400 block mb-1 font-bold">
                                {isLent ? 'Date Lent' : 'Date Borrowed'}
                              </span>
                              <span className={`font-bold ${isDark ? 'text-neutral-300' : 'text-neutral-700'}`}>
                                {new Date(debt.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                              </span>
                            </div>
                            {debt.description && (
                              <div className="col-span-2 pt-1">
                                <span className="text-[8px] uppercase tracking-wider text-neutral-400 block mb-1 font-bold">Reason / Notes</span>
                                <span className={`italic text-xs leading-relaxed ${isDark ? 'text-neutral-300' : 'text-neutral-600'}`}>"{debt.description}"</span>
                              </div>
                            )}
                          </div>

                          {/* Render Payment form if the debt is still active */}
                          {debt.status !== 'paid' ? (
                            <form onSubmit={(e) => handleRepaySubmit(e, debt)} className="space-y-4">
                              <h5 className={`text-sm font-black uppercase tracking-widest ${
                                isLent ? 'text-emerald-500' : 'text-rose-500'
                              }`}>
                                {isLent ? 'Log Repayment Received' : 'Log Payment Made'}
                              </h5>

                              {/* Amount input */}
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-[8px] font-black text-neutral-400 uppercase tracking-widest mb-1.5">
                                    Amount to Pay ({debt.currency})
                                  </label>
                                  <div className="relative">
                                    <span className="absolute left-3 top-2 text-xs text-neutral-400 font-bold">
                                      {debt.currency === 'USD' ? '$' : '₱'}
                                    </span>
                                    <input
                                      type="number"
                                      required
                                      step="any"
                                      min="0.01"
                                      max={debt.remainingAmount}
                                      value={repayAmount}
                                      onChange={(e) => setRepayAmount(e.target.value)}
                                      className={`w-full rounded-xl border pl-6 pr-3 py-1.5 text-xs font-mono font-bold focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                                        isDark ? 'bg-neutral-900 border-neutral-800 text-white' : 'bg-neutral-50 border-neutral-200 text-neutral-800'
                                      }`}
                                    />
                                  </div>
                                </div>

                                <div>
                                  <label className="block text-[8px] font-black text-neutral-400 uppercase tracking-widest mb-1.5">
                                    Account Pocket
                                  </label>
                                  <div className="relative">
                                    <select
                                      value={repayWalletId}
                                      onChange={(e) => setRepayWalletId(e.target.value)}
                                      className={`w-full appearance-none rounded-xl border pl-3 pr-10 py-1.5 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer ${
                                        isDark ? 'bg-neutral-900 border-neutral-800 text-white' : 'bg-neutral-50 border-neutral-200 text-neutral-850'
                                      }`}
                                    >
                                      <option value="">Don't affect accounts</option>
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
                              </div>

                              {repayWalletId && (
                                <label className="flex items-center gap-2 cursor-pointer select-none py-1">
                                  <input
                                    type="checkbox"
                                    checked={repayAffectsWallet}
                                    onChange={(e) => setRepayAffectsWallet(e.target.checked)}
                                    className="rounded border-neutral-300 text-blue-600 focus:ring-blue-500 h-3 w-3"
                                  />
                                  <span className="text-xs text-neutral-400 font-semibold leading-tight">
                                    {isLent 
                                      ? 'Deposit directly to pocket & log as standard Income transaction.'
                                      : 'Withdraw directly from pocket & log as standard Expense transaction.'
                                    }
                                  </span>
                                </label>
                              )}

                              {/* Form submit and direct toggle actions */}
                              <div className="flex items-center gap-3 pt-3 border-t border-dashed dark:border-neutral-800/50 border-neutral-100 justify-between">
                                <div className="flex items-center gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => onSettleDirectly(debt.id)}
                                    className={`px-3 py-1.5 rounded-xl text-[10px] font-extrabold uppercase tracking-wider border transition-colors cursor-pointer ${
                                      isDark 
                                        ? 'border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10' 
                                        : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50/50'
                                    }`}
                                    title="Mark paid without recording a cash transaction"
                                  >
                                    Settle Directly
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => onDeleteDebt(debt.id)}
                                    className={`px-2.5 py-1.5 rounded-xl text-neutral-400 hover:text-rose-500 hover:bg-rose-500/5 transition-colors cursor-pointer`}
                                    title="Delete record"
                                  >
                                    <DynamicIcon name="Trash2" size={13} />
                                  </button>
                                </div>

                                <button
                                  type="submit"
                                  className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
                                >
                                  Apply Payment
                                </button>
                              </div>
                            </form>
                          ) : (
                            /* Already settled - just delete option */
                            <div className="flex items-center justify-between pt-1">
                              <span className="text-xs text-neutral-400 font-medium">Record fully settled.</span>
                              <button
                                type="button"
                                onClick={() => onDeleteDebt(debt.id)}
                                className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1"
                              >
                                <DynamicIcon name="Trash2" size={11} /> Delete Record
                              </button>
                            </div>
                          )}

                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
