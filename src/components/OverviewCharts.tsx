import React, { useState } from 'react';
import { Wallet, Transaction } from '../types';
import { CATEGORIES } from '../mockData';
import DynamicIcon from './DynamicIcon';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface OverviewChartsProps {
  wallets: Wallet[];
  transactions: Transaction[];
  themeMode?: 'light' | 'dark';
}

type TimeframeType = 'day' | 'week' | 'month' | 'year';

export default function OverviewCharts({ wallets, transactions, themeMode = 'light' }: OverviewChartsProps) {
  const USD_RATE = 58.5;
  const isDark = themeMode === 'dark';
  const [timeframe, setTimeframe] = useState<TimeframeType>('month');

  const getPHPValue = (amount: number, currency?: 'PHP' | 'USD') => {
    return (currency || 'PHP') === 'USD' ? amount * USD_RATE : amount;
  };

  const getTxPHPValue = (t: Transaction) => {
    const w = wallets.find((wal) => wal.id === t.walletId);
    return getPHPValue(t.amount, w?.currency || 'PHP');
  };

  const totalNetWorthPHP = wallets.reduce(
    (acc, wallet) => acc + getPHPValue(wallet.balance, wallet.currency || 'PHP'),
    0
  );

  const formatCurrency = (value: number, currency?: 'PHP' | 'USD') => {
    const safeCurrency = currency || 'PHP';
    return new Intl.NumberFormat(safeCurrency === 'USD' ? 'en-US' : 'en-PH', {
      style: 'currency',
      currency: safeCurrency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(value);
  };

  // 1. Calculate Wallet distribution in PHP
  const walletDistribution = wallets
    .map((w) => {
      const phpVal = getPHPValue(w.balance, w.currency);
      const percentage = totalNetWorthPHP > 0 ? (phpVal / totalNetWorthPHP) * 100 : 0;
      return {
        ...w,
        percentage,
      };
    })
    .sort((a, b) => getPHPValue(b.balance, b.currency) - getPHPValue(a.balance, a.currency));

  // 2. Filter transactions based on selected timeframe
  const filteredTransactions = transactions.filter((t) => {
    const tDate = new Date(t.date);
    if (isNaN(tDate.getTime())) return true;
    
    const now = new Date();
    const diffTime = now.getTime() - tDate.getTime();
    const diffDays = diffTime / (1000 * 60 * 60 * 24);

    if (timeframe === 'day') {
      return tDate.toDateString() === now.toDateString();
    }
    if (timeframe === 'week') {
      return diffDays <= 7;
    }
    if (timeframe === 'month') {
      return diffDays <= 30;
    }
    if (timeframe === 'year') {
      return diffDays <= 365;
    }
    return true;
  });

  // Calculate Income vs Expense for this timeframe
  const incomeTxs = filteredTransactions.filter((t) => t.type === 'income');
  const expenseTxs = filteredTransactions.filter((t) => t.type === 'expense');

  const totalIncomePHP = incomeTxs.reduce((sum, t) => sum + getTxPHPValue(t), 0);
  const totalExpensePHP = expenseTxs.reduce((sum, t) => sum + getTxPHPValue(t), 0);
  const netSavingsPHP = totalIncomePHP - totalExpensePHP;

  // Category distribution for expenses in this timeframe
  const totalSpendingPHP = totalExpensePHP;
  const categorySpending = CATEGORIES.filter((c) => c.name !== 'Salary' && c.name !== 'Transfer')
    .map((cat) => {
      const amountPHP = expenseTxs
        .filter((t) => t.category === cat.name)
        .reduce((sum, t) => sum + getTxPHPValue(t), 0);
      const percentage = totalSpendingPHP > 0 ? (amountPHP / totalSpendingPHP) * 100 : 0;
      return {
        ...cat,
        amountPHP,
        percentage,
      };
    })
    .filter((cat) => cat.amountPHP > 0)
    .sort((a, b) => b.amountPHP - a.amountPHP);


  const getCatColorHex = (catName: string, dark: boolean) => {
    const name = catName.toLowerCase();
    if (name.includes('food')) return dark ? '#fb923c' : '#ea580c';
    if (name.includes('util')) return dark ? '#fbbf24' : '#d97706';
    if (name.includes('enter')) return dark ? '#f472b6' : '#db2777';
    if (name.includes('transp')) return dark ? '#60a5fa' : '#2563eb';
    if (name.includes('shop')) return dark ? '#c084fc' : '#9333ea';
    if (name.includes('sal')) return dark ? '#34d399' : '#059669';
    if (name.includes('transf')) return dark ? '#818cf8' : '#4f46e5';
    return dark ? '#a3a3a3' : '#525252';
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

  const timeframeLabels = {
    day: 'Today',
    week: 'This Week',
    month: 'This Month',
    year: 'This Year',
  };

  return (
    <div className="flex flex-col gap-6 pb-20 sm:pb-24" id="overview-charts-container">
      
      {/* 1. Sleek Sub-Header with Dropdown Selector and Label */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-1">
        <div>
          <h2 className={`text-[11px] font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-neutral-900'}`}>
            Financial Insights
          </h2>
          <p className="text-[11px] text-neutral-400">
            Performance analytics for <span className="font-semibold text-blue-500">{timeframeLabels[timeframe].toLowerCase()}</span>
          </p>
        </div>

        {/* Multi-mode Switcher: Dropdown (Mobile-friendly) or Beautiful Tabs */}
        <div className="flex items-center gap-2">
          {/* Dropdown Selector (as requested!) */}
          <div className="relative">
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value as TimeframeType)}
              className={`appearance-none pl-3 pr-8 py-1.5 rounded-xl text-[11px] font-bold border focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer ${
                isDark 
                  ? 'bg-neutral-950 border-neutral-900 text-white' 
                  : 'bg-white border-neutral-200 text-neutral-800'
              }`}
            >
              <option value="day">Daily</option>
              <option value="week">Weekly</option>
              <option value="month">Monthly</option>
              <option value="year">Yearly</option>
            </select>
            <div className="absolute right-2.5 top-2.5 pointer-events-none text-neutral-400">
              <DynamicIcon name="ChevronDown" size={12} />
            </div>
          </div>

          {/* Inline Tab pill switcher (Deskop/Larger screens) */}
          <div className={`hidden md:flex p-1 rounded-xl border ${
            isDark ? 'bg-neutral-950 border-neutral-900' : 'bg-neutral-100/70 border-neutral-200/50'
          }`}>
            {(['day', 'week', 'month', 'year'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTimeframe(t)}
                className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all capitalize cursor-pointer ${
                  timeframe === t
                    ? isDark ? 'bg-neutral-950 text-blue-400 font-extrabold' : 'bg-white text-blue-600 shadow-xs font-extrabold'
                    : isDark ? 'text-neutral-400 hover:text-neutral-200' : 'text-neutral-500 hover:text-neutral-700'
                }`}
              >
                {t === 'day' ? 'daily' : t + 'ly'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Interactive Cash Flow Overview Card */}
      <div className={`border rounded-3xl p-6 shadow-xs relative overflow-hidden transition-colors ${
        isDark ? 'bg-neutral-950 border-neutral-900 text-white' : 'bg-white border-neutral-100 text-neutral-850'
      }`}>
        <h3 className={`font-sans font-bold text-[11px] uppercase tracking-widest mb-4 flex items-center gap-2 ${
          isDark ? 'text-neutral-300' : 'text-neutral-500'
        }`}>
          <DynamicIcon name="Activity" className="text-blue-500" size={16} />
          Cash Flow summary ({timeframeLabels[timeframe]})
        </h3>

        {/* Value metrics bento-grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className={`p-4 rounded-2xl flex flex-col justify-between ${
            isDark ? 'bg-neutral-950/40' : 'bg-neutral-50/60'
          }`}>
            <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-1">Total Cash In</span>
            <span className="font-mono text-[11px] font-extrabold text-emerald-500">
              +{formatCurrency(totalIncomePHP, 'PHP')}
            </span>
          </div>

          <div className={`p-4 rounded-2xl flex flex-col justify-between ${
            isDark ? 'bg-neutral-950/40' : 'bg-neutral-50/60'
          }`}>
            <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-1">Total Cash Out</span>
            <span className="font-mono text-[11px] font-extrabold text-rose-500">
              -{formatCurrency(totalExpensePHP, 'PHP')}
            </span>
          </div>

          <div className={`p-4 rounded-2xl flex flex-col justify-between ${
            isDark ? 'bg-neutral-950/40' : 'bg-neutral-50/60'
          }`}>
            <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-1">Net Flow</span>
            <span className={`font-mono text-[11px] font-extrabold ${netSavingsPHP >= 0 ? 'text-blue-500' : 'text-rose-500'}`}>
              {netSavingsPHP >= 0 ? '+' : ''}{formatCurrency(netSavingsPHP, 'PHP')}
            </span>
          </div>
        </div>

        {/* Elegant custom proportion chart */}
        {(totalIncomePHP > 0 || totalExpensePHP > 0) ? (
          <div>
            <div className="flex justify-between text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-2">
              <span>Proportion Tracker</span>
              <span>
                {totalIncomePHP > 0 
                  ? `${((totalIncomePHP / (totalIncomePHP + totalExpensePHP)) * 100).toFixed(0)}% Income` 
                  : '0% Income'}
              </span>
            </div>
            
            <div className={`h-2.5 w-full rounded-full flex overflow-hidden ${
              isDark ? 'bg-neutral-950' : 'bg-neutral-100'
            }`}>
              {totalIncomePHP > 0 && (
                <div 
                  className="h-full bg-emerald-500" 
                  style={{ width: `${(totalIncomePHP / (totalIncomePHP + totalExpensePHP)) * 100}%` }}
                  title="Income portion"
                />
              )}
              {totalExpensePHP > 0 && (
                <div 
                  className="h-full bg-rose-500" 
                  style={{ width: `${(totalExpensePHP / (totalIncomePHP + totalExpensePHP)) * 100}%` }}
                  title="Expense portion"
                />
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-4 text-[11px] text-neutral-400 font-medium">
            No income or expense entries logged for this period.
          </div>
        )}
      </div>

      {/* 3. Category Spending with Plenty of Whitespace */}
      <div className={`border rounded-3xl p-6 shadow-xs transition-colors ${
        isDark ? 'bg-neutral-950 border-neutral-900 text-white' : 'bg-white border-neutral-100 text-neutral-850'
      }`} id="category-spending-card">
        <h3 className={`font-sans font-bold text-[11px] uppercase tracking-widest mb-5 flex items-center gap-2 ${
          isDark ? 'text-neutral-300' : 'text-neutral-500'
        }`}>
          <DynamicIcon name="TrendingDown" className="text-rose-500" size={16} />
          Spending Breakdown ({timeframeLabels[timeframe]})
        </h3>

        {categorySpending.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className={`h-12 w-12 flex items-center justify-center rounded-full mb-3 ${
              isDark ? 'bg-neutral-950 text-neutral-500' : 'bg-neutral-50 text-neutral-400'
            }`}>
              <DynamicIcon name="Receipt" size={20} />
            </div>
            <p className={`text-[11px] font-bold ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>No activity logged</p>
            <p className="text-[11px] text-neutral-400 mt-1 max-w-xs">There are no expense transactions logged for {timeframeLabels[timeframe].toLowerCase()}</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex justify-between items-baseline pb-2 border-b border-neutral-100 dark:border-neutral-850">
              <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Total Expenses This Period</span>
              <span className="font-sans font-extrabold text-2xl text-rose-500">{formatCurrency(totalSpendingPHP, 'PHP')}</span>
            </div>


            {/* Pie Chart Visuals */}
            <div className="h-64 w-full mt-4 mb-2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categorySpending}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="amountPHP"
                    stroke="none"
                    cornerRadius={8}
                  >
                    {categorySpending.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={getCatColorHex(entry.name, isDark)} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => formatCurrency(value, 'PHP')}
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)', background: isDark ? '#171717' : '#ffffff', color: isDark ? '#f5f5f5' : '#171717' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            {/* Premium Category rows with spacious negative space */}
            <div className="grid grid-cols-1 gap-5">

              {categorySpending.map((cat) => {
                const iconBg = getCatColor(cat.name, isDark);
                return (
                  <div key={cat.name} className="flex flex-col gap-2 group">
                    <div className="flex items-center justify-between text-[11px] font-bold font-sans">
                      <div className="flex items-center gap-2.5">
                        <div className={`h-8 w-8 rounded-xl flex items-center justify-center ${iconBg} transition-transform group-hover:scale-105`}>
                          <DynamicIcon name={cat.icon} size={14} />
                        </div>
                        <span className={`text-[11px] font-bold ${isDark ? 'text-neutral-200' : 'text-neutral-800'}`}>{cat.name}</span>
                      </div>
                      <div className="text-right">
                        <span className={`font-mono font-bold ${isDark ? 'text-neutral-100' : 'text-neutral-900'}`}>{formatCurrency(cat.amountPHP, 'PHP')}</span>
                        <span className="text-neutral-400 text-[11px] font-medium ml-2 bg-neutral-100 dark:bg-neutral-950 px-1.5 py-0.5 rounded">
                          {cat.percentage.toFixed(0)}%
                        </span>
                      </div>
                    </div>
                    
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 4. Net Worth Asset Distribution Bento */}
      <div className={`border rounded-3xl p-6 shadow-xs transition-colors ${
        isDark ? 'bg-neutral-950 border-neutral-900 text-white' : 'bg-white border-neutral-100 text-neutral-850'
      }`} id="net-worth-distribution-card">
        <h3 className={`font-sans font-bold text-[11px] uppercase tracking-widest mb-5 flex items-center gap-2 ${
          isDark ? 'text-neutral-300' : 'text-neutral-500'
        }`}>
          <DynamicIcon name="PieChart" className="text-emerald-500" size={16} />
          Total Asset Allocation
        </h3>
        
        {walletDistribution.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className={`h-10 w-10 flex items-center justify-center rounded-full mb-2 ${
              isDark ? 'bg-neutral-950 text-neutral-500' : 'bg-neutral-50 text-neutral-400'
            }`}>
              <DynamicIcon name="Coins" size={18} />
            </div>
            <p className={`text-[11px] font-bold ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>No accounts registered yet</p>
            <p className="text-[11px] text-neutral-400 mt-0.5">Add an account to view distribution charts</p>
          </div>
        ) : (
          <>
            {/* Pristine multi-colored allocation progress ribbon */}
            <div className={`h-2 w-full rounded-full flex overflow-hidden mb-6 ${
              isDark ? 'bg-neutral-950' : 'bg-neutral-100'
            }`}>
              {walletDistribution.map((w) => {
                if (w.percentage <= 0) return null;
                let bgClass = 'bg-neutral-400';
                if (w.color === 'teal' || w.color.includes('emerald') || w.color.includes('teal')) bgClass = 'bg-teal-500';
                else if (w.color === 'purple' || w.color.includes('indigo') || w.color.includes('purple')) bgClass = 'bg-purple-500';
                else if (w.color === 'blue' || w.color.includes('blue')) bgClass = 'bg-blue-500';
                else if (w.color === 'red' || w.color.includes('red')) bgClass = 'bg-red-500';
                else if (w.color === 'amber' || w.color.includes('amber') || w.color.includes('orange')) bgClass = 'bg-amber-500';
                else if (w.color === 'pink' || w.color.includes('pink')) bgClass = 'bg-pink-500';
                else bgClass = 'bg-neutral-500';

                return (
                  <div
                    key={w.id}
                    className={`h-full ${bgClass} transition-all`}
                    style={{ width: `${w.percentage}%` }}
                    title={`${w.name}: ${w.percentage.toFixed(1)}%`}
                  />
                );
              })}
            </div>

            {/* Spacious Legend list with formatted indicators */}
            <div className="flex flex-col gap-4">
              {walletDistribution.map((w) => {
                let dotColor = 'bg-neutral-400';
                if (w.color === 'teal' || w.color.includes('emerald') || w.color.includes('teal')) dotColor = 'bg-teal-500';
                else if (w.color === 'purple' || w.color.includes('indigo') || w.color.includes('purple')) dotColor = 'bg-purple-500';
                else if (w.color === 'blue' || w.color.includes('blue')) dotColor = 'bg-blue-500';
                else if (w.color === 'red' || w.color.includes('red')) dotColor = 'bg-red-500';
                else if (w.color === 'amber' || w.color.includes('amber') || w.color.includes('orange')) dotColor = 'bg-amber-500';
                else if (w.color === 'pink' || w.color.includes('pink')) dotColor = 'bg-pink-500';

                return (
                  <div key={w.id} className="flex items-center justify-between text-[11px] group py-0.5">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className={`h-2.5 w-2.5 rounded-full ${dotColor} shrink-0 transition-transform group-hover:scale-115`} />
                      <span className={`font-bold truncate ${isDark ? 'text-neutral-300' : 'text-neutral-750'}`}>{w.name}</span>
                      <span className="text-neutral-400 text-[11px] font-semibold">({w.percentage.toFixed(0)}%)</span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0 font-mono font-extrabold">
                      <span className={isDark ? 'text-neutral-200' : 'text-neutral-800'}>{formatCurrency(w.balance, w.currency)}</span>
                      {w.currency === 'USD' && (
                        <span className={isDark ? 'text-[11px] text-neutral-500 font-normal' : 'text-[11px] text-neutral-400 font-normal'}>
                          (~{formatCurrency(getPHPValue(w.balance, 'USD'), 'PHP')})
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

    </div>
  );
}
