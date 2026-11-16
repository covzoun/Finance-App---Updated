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

const USD_RATE = 58.5;

export default function CreditsList({
  debts,
  wallets,
  onAddRepayment,
  onSettleDirectly,
  onDeleteDebt,
  onOpenAddDebt,
  themeMode = 'light',
}: CreditsListProps) {
  const isDark = themeMode === 'dark';

  const [activeTab, setActiveTab] = useState<'active' | 'settled'>('active');
  const [expandedDebtId, setExpandedDebtId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [repayAmount, setRepayAmount] = useState('');
  const [repayWalletId, setRepayWalletId] = useState('');
  const [repayAffectsWallet, setRepayAffectsWallet] = useState(true);

  const getPHPValue = (amount: number, currency: 'PHP' | 'USD') =>
    currency === 'USD' ? amount * USD_RATE : amount;

  const formatCurrency = (amount: number, currency: 'PHP' | 'USD') =>
    new Intl.NumberFormat(currency === 'USD' ? 'en-US' : 'en-PH', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);

  const formatPHP = (amount: number) =>
    new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);

  const activeDebts = debts.filter((d) => d.status !== 'paid');
  const settledDebts = debts.filter((d) => d.status === 'paid');

  const totalOwedToMePHP = activeDebts
    .filter((d) => d.type === 'lent')
    .reduce((sum, d) => sum + getPHPValue(d.remainingAmount, d.currency), 0);

  const totalIOwePHP = activeDebts
    .filter((d) => d.type === 'borrowed')
    .reduce((sum, d) => sum + getPHPValue(d.remainingAmount, d.currency), 0);

  const handleCardClick = (debt: Debt) => {
    if (expandedDebtId === debt.id) {
      setExpandedDebtId(null);
      return;
    }
    setExpandedDebtId(debt.id);
    setRepayAmount(debt.remainingAmount.toString());
    const matchWallet = wallets.find((w) => w.currency === debt.currency);
    setRepayWalletId(matchWallet?.id || wallets[0]?.id || '');
    setRepayAffectsWallet(true);
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

  const getDueDateLabel = (dueDateStr: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(dueDateStr);
    target.setHours(0, 0, 0, 0);
    const diff = Math.ceil((target.getTime() - today.getTime()) / 86400000);
    if (diff === 0) return { label: 'Due today', className: isDark ? 'text-amber-400' : 'text-amber-600' };
    if (diff < 0)
      return {
        label: `${Math.abs(diff)}d overdue`,
        className: isDark ? 'text-rose-400' : 'text-rose-500',
      };
    return { label: `Due in ${diff}d`, className: isDark ? 'text-zinc-500' : 'text-zinc-400' };
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

  const getInitials = (name: string) =>
    name
      .split(' ')
      .slice(0, 2)
      .map((n) => n[0])
      .join('')
      .toUpperCase() || '?';

  const muted = isDark ? 'text-zinc-500' : 'text-zinc-400';
  const card = isDark
    ? 'bg-zinc-950 border-zinc-800/80'
    : 'bg-white border-zinc-200/80';

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-2 gap-2">
        <div className={`p-3.5 rounded-2xl border ${card}`}>
          <p className={`text-[10px] font-medium uppercase tracking-[0.1em] ${muted}`}>Owed to me</p>
          <p className={`tabular mt-1.5 text-[15px] font-semibold ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
            {formatPHP(totalOwedToMePHP)}
          </p>
        </div>
        <div className={`p-3.5 rounded-2xl border ${card}`}>
          <p className={`text-[10px] font-medium uppercase tracking-[0.1em] ${muted}`}>I owe</p>
          <p className={`tabular mt-1.5 text-[15px] font-semibold ${isDark ? 'text-rose-400' : 'text-rose-500'}`}>
            {formatPHP(totalIOwePHP)}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className={`flex p-0.5 rounded-xl ${isDark ? 'bg-zinc-900' : 'bg-zinc-200/70'}`}>
        {(['active', 'settled'] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => {
              setActiveTab(tab);
              setExpandedDebtId(null);
            }}
            className={`flex-1 py-1.5 text-[12px] font-medium rounded-[10px] capitalize transition-all ${
              activeTab === tab
                ? isDark
                  ? 'bg-zinc-800 text-zinc-50 shadow-sm'
                  : 'bg-white text-zinc-900 shadow-sm'
                : muted
            }`}
          >
            {tab} ({tab === 'active' ? activeDebts.length : settledDebts.length})
          </button>
        ))}
      </div>

      {/* Search */}
      {(activeDebts.length > 0 || settledDebts.length > 0) && (
        <input
          type="text"
          placeholder="Search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={`w-full px-4 py-2.5 rounded-2xl text-[13px] border outline-none ${
            isDark
              ? 'bg-zinc-900 border-zinc-800 placeholder:text-zinc-600 focus:border-zinc-600'
              : 'bg-white border-zinc-200 placeholder:text-zinc-400 focus:border-zinc-300'
          }`}
        />
      )}

      {/* List */}
      {listToRender.length === 0 ? (
        <div className={`text-center py-16 rounded-2xl border border-dashed ${isDark ? 'border-zinc-800' : 'border-zinc-200'} ${muted}`}>
          <p className="text-[14px] mb-4">
            {activeTab === 'active' ? 'No active debts' : 'No settled records'}
          </p>
          {activeTab === 'active' && (
            <button
              type="button"
              onClick={onOpenAddDebt}
              className={`px-4 py-2 rounded-full text-[12px] font-medium ${
                isDark ? 'bg-zinc-100 text-zinc-900' : 'bg-zinc-900 text-white'
              }`}
            >
              Add record
            </button>
          )}
        </div>
      ) : (
        <div className={`rounded-2xl border overflow-hidden divide-y ${
          isDark ? 'border-zinc-800/80 divide-zinc-800/80' : 'border-zinc-200/80 divide-zinc-100'
        }`}
        >
          {listToRender.map((debt) => {
            const isExpanded = expandedDebtId === debt.id;
            const isLent = debt.type === 'lent';
            const paidAmount = debt.amount - debt.remainingAmount;
            const paidPercentage = debt.amount > 0 ? (paidAmount / debt.amount) * 100 : 0;
            const due = debt.dueDate && debt.status !== 'paid' ? getDueDateLabel(debt.dueDate) : null;

            return (
              <div key={debt.id} className={isDark ? 'bg-zinc-950' : 'bg-white'}>
                <button
                  type="button"
                  onClick={() => handleCardClick(debt)}
                  className={`w-full flex items-center gap-3 px-3.5 py-3.5 text-left transition-colors ${
                    isDark ? 'hover:bg-zinc-900/80' : 'hover:bg-zinc-50'
                  }`}
                >
                  <div
                    className={`h-10 w-10 rounded-xl flex items-center justify-center text-[11px] font-semibold shrink-0 ${
                      isDark ? 'bg-zinc-900 text-zinc-400' : 'bg-zinc-100 text-zinc-500'
                    }`}
                  >
                    {getInitials(debt.person)}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className={`text-[13px] font-medium tracking-tight truncate ${isDark ? 'text-zinc-100' : 'text-zinc-900'}`}>
                      {debt.person}
                    </p>
                    <p className={`text-[11px] mt-0.5 truncate ${muted}`}>
                      {isLent ? 'Lent' : 'Borrowed'}
                      {due ? ` · ${due.label}` : ''}
                      {debt.description ? ` · ${debt.description}` : ''}
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <p
                      className={`tabular text-[13px] font-semibold ${
                        isLent
                          ? isDark
                            ? 'text-emerald-400'
                            : 'text-emerald-600'
                          : isDark
                            ? 'text-rose-400'
                            : 'text-rose-500'
                      }`}
                    >
                      {isLent ? '+' : '−'}
                      {formatCurrency(debt.remainingAmount, debt.currency)}
                    </p>
                    {debt.status === 'partially_paid' && (
                      <p className={`text-[10px] mt-0.5 ${muted}`}>
                        {Math.round(paidPercentage)}% paid
                      </p>
                    )}
                    {debt.status === 'paid' && (
                      <p className={`text-[10px] mt-0.5 ${muted}`}>Settled</p>
                    )}
                  </div>
                </button>

                {debt.status === 'partially_paid' && !isExpanded && (
                  <div className={`h-0.5 ${isDark ? 'bg-zinc-900' : 'bg-zinc-100'}`}>
                    <div
                      className={`h-full ${isLent ? 'bg-emerald-500/70' : 'bg-rose-500/70'}`}
                      style={{ width: `${paidPercentage}%` }}
                    />
                  </div>
                )}

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className={`overflow-hidden border-t ${
                        isDark ? 'border-zinc-800 bg-zinc-900/40' : 'border-zinc-100 bg-zinc-50/50'
                      }`}
                    >
                      <div className="px-3.5 py-4 space-y-4">
                        <div className="grid grid-cols-2 gap-3 text-[12px]">
                          <div>
                            <p className={muted}>Principal</p>
                            <p className="tabular font-medium mt-0.5">
                              {formatCurrency(debt.amount, debt.currency)}
                            </p>
                          </div>
                          <div>
                            <p className={muted}>Date</p>
                            <p className="font-medium mt-0.5">
                              {new Date(debt.date).toLocaleDateString(undefined, {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })}
                            </p>
                          </div>
                        </div>

                        {debt.status !== 'paid' && (
                          <form
                            onSubmit={(e) => handleRepaySubmit(e, debt)}
                            className="space-y-3"
                          >
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className={`text-[11px] ${muted}`}>Amount</label>
                                <input
                                  type="number"
                                  step="0.01"
                                  value={repayAmount}
                                  onChange={(e) => setRepayAmount(e.target.value)}
                                  className={`mt-1 w-full px-3 py-2 rounded-xl text-[13px] border outline-none ${
                                    isDark
                                      ? 'bg-zinc-950 border-zinc-700'
                                      : 'bg-white border-zinc-200'
                                  }`}
                                />
                              </div>
                              <div>
                                <label className={`text-[11px] ${muted}`}>Wallet</label>
                                <select
                                  value={repayWalletId}
                                  onChange={(e) => setRepayWalletId(e.target.value)}
                                  className={`mt-1 w-full px-3 py-2 rounded-xl text-[13px] border outline-none ${
                                    isDark
                                      ? 'bg-zinc-950 border-zinc-700'
                                      : 'bg-white border-zinc-200'
                                  }`}
                                >
                                  {wallets.map((w) => (
                                    <option key={w.id} value={w.id}>
                                      {w.name}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </div>

                            <label className="flex items-center gap-2 text-[12px]">
                              <input
                                type="checkbox"
                                checked={repayAffectsWallet}
                                onChange={(e) => setRepayAffectsWallet(e.target.checked)}
                                className="rounded"
                              />
                              <span className={muted}>Update wallet balance</span>
                            </label>

                            <div className="flex gap-2">
                              <button
                                type="submit"
                                className={`flex-1 py-2.5 rounded-xl text-[12px] font-medium ${
                                  isDark
                                    ? 'bg-zinc-100 text-zinc-900'
                                    : 'bg-zinc-900 text-white'
                                }`}
                              >
                                Record payment
                              </button>
                              <button
                                type="button"
                                onClick={() => onSettleDirectly(debt.id)}
                                className={`px-3 py-2.5 rounded-xl text-[12px] font-medium border ${
                                  isDark ? 'border-zinc-700' : 'border-zinc-200'
                                }`}
                              >
                                Settle
                              </button>
                            </div>
                          </form>
                        )}

                        <button
                          type="button"
                          onClick={() => onDeleteDebt(debt.id)}
                          className={`text-[12px] ${isDark ? 'text-rose-400' : 'text-rose-500'}`}
                        >
                          Delete record
                        </button>
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
  );
}
