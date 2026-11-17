import React, { useState } from 'react';
import { Wallet, Transaction } from '../types';
import { CATEGORIES } from '../mockData';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface OverviewChartsProps {
  wallets: Wallet[];
  transactions: Transaction[];
  themeMode?: 'light' | 'dark';
}

type TimeframeType = 'day' | 'week' | 'month' | 'year';

const USD_RATE = 58.5;

export default function OverviewCharts({
  wallets,
  transactions,
  themeMode = 'light',
}: OverviewChartsProps) {
  const isDark = themeMode === 'dark';
  const [timeframe, setTimeframe] = useState<TimeframeType>('month');

  const muted = isDark ? 'text-zinc-500' : 'text-zinc-400';
  const card = isDark
    ? 'bg-zinc-950 border-zinc-800/80'
    : 'bg-white border-zinc-200/80';

  const getPHPValue = (amount: number, currency?: 'PHP' | 'USD') =>
    (currency || 'PHP') === 'USD' ? amount * USD_RATE : amount;

  const getTxPHPValue = (t: Transaction) => {
    const w = wallets.find((wal) => wal.id === t.walletId);
    return getPHPValue(t.amount, w?.currency || 'PHP');
  };

  const formatPHP = (value: number) =>
    new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);

  const totalNetWorthPHP = wallets.reduce(
    (acc, wallet) => acc + getPHPValue(wallet.balance, wallet.currency || 'PHP'),
    0
  );

  const walletDistribution = wallets
    .map((w) => {
      const phpVal = getPHPValue(w.balance, w.currency);
      const percentage = totalNetWorthPHP > 0 ? (phpVal / totalNetWorthPHP) * 100 : 0;
      return { ...w, percentage, phpVal };
    })
    .sort((a, b) => b.phpVal - a.phpVal);

  const filteredTransactions = transactions.filter((t) => {
    const tDate = new Date(t.date);
    if (isNaN(tDate.getTime())) return true;
    const now = new Date();
    const diffDays = (now.getTime() - tDate.getTime()) / 86400000;
    if (timeframe === 'day') return tDate.toDateString() === now.toDateString();
    if (timeframe === 'week') return diffDays <= 7;
    if (timeframe === 'month') return diffDays <= 30;
    if (timeframe === 'year') return diffDays <= 365;
    return true;
  });

  const incomeTxs = filteredTransactions.filter((t) => t.type === 'income');
  const expenseTxs = filteredTransactions.filter((t) => t.type === 'expense');
  const totalIncomePHP = incomeTxs.reduce((sum, t) => sum + getTxPHPValue(t), 0);
  const totalExpensePHP = expenseTxs.reduce((sum, t) => sum + getTxPHPValue(t), 0);
  const netSavingsPHP = totalIncomePHP - totalExpensePHP;

  const categorySpending = CATEGORIES.filter(
    (c) => c.name !== 'Salary' && c.name !== 'Transfer'
  )
    .map((c) => {
      const amountPHP = expenseTxs
        .filter((t) => t.category === c.name)
        .reduce((sum, t) => sum + getTxPHPValue(t), 0);
      const percentage =
        totalExpensePHP > 0 ? (amountPHP / totalExpensePHP) * 100 : 0;
      return { name: c.name, amountPHP, percentage };
    })
    .filter((c) => c.amountPHP > 0)
    .sort((a, b) => b.amountPHP - a.amountPHP);

  const pieData = categorySpending.map((c) => ({
    name: c.name,
    value: c.amountPHP,
  }));

  const zincPalette = isDark
    ? ['#a1a1aa', '#71717a', '#52525b', '#3f3f46', '#d4d4d8', '#e4e4e7']
    : ['#3f3f46', '#52525b', '#71717a', '#a1a1aa', '#27272a', '#18181b'];

  const timeframeLabels: Record<TimeframeType, string> = {
    day: 'Today',
    week: 'This week',
    month: 'This month',
    year: 'This year',
  };

  return (
    <div className="space-y-5 max-w-md mx-auto">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-[15px] font-semibold tracking-tight">Insights</h2>
          <p className={'text-[12px] mt-0.5 ' + muted}>{timeframeLabels[timeframe]}</p>
        </div>
        <select
          value={timeframe}
          onChange={(e) => setTimeframe(e.target.value as TimeframeType)}
          className={
            'appearance-none px-3 py-2 rounded-full text-[12px] font-medium border outline-none ' +
            (isDark
              ? 'bg-zinc-900 border-zinc-800 text-zinc-100'
              : 'bg-white border-zinc-200 text-zinc-800')
          }
        >
          <option value="day">Day</option>
          <option value="week">Week</option>
          <option value="month">Month</option>
          <option value="year">Year</option>
        </select>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {[
          {
            label: 'In',
            value: totalIncomePHP,
            tone: isDark ? 'text-emerald-400' : 'text-emerald-600',
          },
          {
            label: 'Out',
            value: totalExpensePHP,
            tone: isDark ? 'text-rose-400' : 'text-rose-500',
          },
          {
            label: 'Net',
            value: netSavingsPHP,
            tone: isDark ? 'text-zinc-50' : 'text-zinc-900',
          },
        ].map((item) => (
          <div key={item.label} className={'rounded-2xl border p-3 ' + card}>
            <p className={'text-[10px] font-medium uppercase tracking-[0.1em] ' + muted}>
              {item.label}
            </p>
            <p className={'tabular mt-1.5 text-[13px] font-semibold ' + item.tone}>
              {formatPHP(item.value)}
            </p>
          </div>
        ))}
      </div>

      <div className={'rounded-2xl border p-4 ' + card}>
        <p className={'text-[11px] font-medium uppercase tracking-[0.1em] mb-3 ' + muted}>
          Spending
        </p>
        {pieData.length === 0 ? (
          <p className={'text-center py-10 text-[13px] ' + muted}>
            No expenses in this period
          </p>
        ) : (
          <>
            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={48}
                    outerRadius={72}
                    paddingAngle={2}
                    stroke="none"
                  >
                    {pieData.map((_, i) => (
                      <Cell key={i} fill={zincPalette[i % zincPalette.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => formatPHP(value)}
                    contentStyle={{
                      background: isDark ? '#18181b' : '#fff',
                      border: '1px solid ' + (isDark ? '#27272a' : '#e4e4e7'),
                      borderRadius: 12,
                      fontSize: 12,
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-3 space-y-2">
              {categorySpending.map((cat, i) => (
                <div key={cat.name} className="flex items-center gap-3">
                  <span
                    className="h-2 w-2 rounded-full shrink-0"
                    style={{ backgroundColor: zincPalette[i % zincPalette.length] }}
                  />
                  <span className="flex-1 text-[13px] truncate">{cat.name}</span>
                  <span className={'tabular text-[12px] font-medium ' + muted}>
                    {Math.round(cat.percentage)}%
                  </span>
                  <span className="tabular text-[13px] font-semibold w-20 text-right">
                    {formatPHP(cat.amountPHP)}
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <div className={'rounded-2xl border p-4 ' + card}>
        <p className={'text-[11px] font-medium uppercase tracking-[0.1em] mb-3 ' + muted}>
          Wallets
        </p>
        {walletDistribution.length === 0 ? (
          <p className={'text-center py-8 text-[13px] ' + muted}>No wallets yet</p>
        ) : (
          <div className="space-y-3">
            {walletDistribution.map((w) => (
              <div key={w.id}>
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-[13px] font-medium truncate">{w.name}</span>
                  <span className="tabular text-[13px] font-semibold shrink-0">
                    {formatPHP(w.phpVal)}
                  </span>
                </div>
                <div
                  className={
                    'h-1.5 rounded-full overflow-hidden ' +
                    (isDark ? 'bg-zinc-900' : 'bg-zinc-100')
                  }
                >
                  <div
                    className={
                      'h-full rounded-full ' + (isDark ? 'bg-zinc-400' : 'bg-zinc-800')
                    }
                    style={{ width: Math.max(2, Math.min(100, w.percentage)) + '%' }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
