import { Wallet, Transaction } from './types';

export const INITIAL_WALLETS: Wallet[] = [
  {
    id: 'w-cash',
    name: 'Cash on Hand',
    description: 'Physical cash in my wallet and drawer',
    type: 'wallet',
    balance: 2450,
    currency: 'PHP',
    icon: 'Coins',
    color: 'from-emerald-500 to-teal-600',
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'w-usd-cash',
    name: 'USD Emergency Fund',
    description: 'Cash kept in dollars for emergencies',
    type: 'savings',
    balance: 500,
    currency: 'USD',
    icon: 'Shield',
    color: 'from-amber-400 to-orange-500',
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'w-maya',
    name: 'Maya High-Yield Savings',
    description: 'Digital bank savings account',
    type: 'savings',
    balance: 45000,
    currency: 'PHP',
    icon: 'PiggyBank',
    color: 'from-indigo-600 via-purple-600 to-pink-500',
    createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'w-gcash',
    name: 'Mobile Wallet (GCash)',
    description: 'Everyday digital mobile wallet',
    type: 'wallet',
    balance: 7850,
    currency: 'PHP',
    icon: 'Smartphone',
    color: 'from-blue-500 via-blue-600 to-indigo-700',
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'w-custom-bpi',
    name: 'Mutual Fund Investment',
    description: 'Long-term equity fund',
    type: 'investment',
    balance: 124500,
    currency: 'PHP',
    icon: 'Activity',
    color: 'from-red-600 to-neutral-800',
    createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
  }
];

export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 't-1',
    walletId: 'w-gcash',
    type: 'expense',
    amount: 1250,
    category: 'Shopping',
    date: new Date(Date.now() - 2 * 3600 * 1000).toISOString(), // 2 hours ago
    description: 'Weekly grocery shopping at SM Supermarket',
  },
  {
    id: 't-2',
    walletId: 'w-maya',
    type: 'income',
    amount: 25000,
    category: 'Salary',
    date: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(), // 1 day ago
    description: 'Freelance web development payout',
  },
  {
    id: 't-3',
    walletId: 'w-cash',
    type: 'expense',
    amount: 190,
    category: 'Food & Dining',
    date: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(), // 2 days ago
    description: 'Iced Caramel Macchiato at Starbucks',
  },
  {
    id: 't-4',
    walletId: 'w-usd-cash',
    type: 'income',
    amount: 100,
    category: 'Other',
    date: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(), // 3 days ago
    description: 'Online USD gig bonus',
  },
  {
    id: 't-5',
    walletId: 'w-custom-bpi',
    type: 'expense',
    amount: 3450,
    category: 'Utilities',
    date: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(), // 5 days ago
    description: 'Meralco Electric Bill payment',
  },
  {
    id: 't-6',
    walletId: 'w-gcash',
    type: 'expense',
    amount: 499,
    category: 'Entertainment',
    date: new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString(), // 7 days ago
    description: 'Netflix Premium Monthly Subscription',
  }
];

export const CATEGORIES = [
  { name: 'Food & Dining', icon: 'Utensils', color: 'bg-orange-500/20 text-orange-400' },
  { name: 'Utilities', icon: 'Zap', color: 'bg-yellow-500/20 text-yellow-400' },
  { name: 'Entertainment', icon: 'Film', color: 'bg-pink-500/20 text-pink-400' },
  { name: 'Transport', icon: 'Car', color: 'bg-blue-500/20 text-blue-400' },
  { name: 'Shopping', icon: 'ShoppingBag', color: 'bg-purple-500/20 text-purple-400' },
  { name: 'Salary', icon: 'Briefcase', color: 'bg-emerald-500/20 text-emerald-400' },
  { name: 'Transfer', icon: 'RefreshCw', color: 'bg-indigo-500/20 text-indigo-400' },
  { name: 'Other', icon: 'HelpCircle', color: 'bg-neutral-500/20 text-neutral-400' },
];
