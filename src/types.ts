export type WalletType = 'wallet' | 'savings' | 'investment' | 'others';

export interface Wallet {
  id: string;
  name: string;
  description?: string;
  type: WalletType;
  balance: number; // The current balance of this account
  currency: 'PHP' | 'USD';
  icon: string; // Lucide icon name
  color: string; // Tailwind gradient / color identifier (e.g., 'from-teal-500 to-emerald-600')
  image?: string; // Optional URL for custom wallet background or avatar
  createdAt: string;
}

export type TransactionType = 'expense' | 'income' | 'transfer';

export type RecurringFrequency = 
  | 'daily' 
  | 'weekly' 
  | 'biweekly'      // Every 2 weeks (e.g. 14 days)
  | 'semimonthly'   // Twice a month (e.g. 15th & 30th)
  | 'monthly' 
  | 'yearly' 
  | 'custom';

export interface SplitPayoutConfig {
  enabled: boolean;
  firstAmount: number;   // e.g., 25000 (Cutoff 1)
  secondAmount: number;  // e.g., 21500 (Cutoff 2)
  firstLabel?: string;   // e.g. "1st Cutoff (15th)"
  secondLabel?: string;  // e.g. "2nd Cutoff (30th)"
  cutoffSchedule?: '15_30' | '1_15' | '10_25' | 'custom_days';
  currentCutoff?: 1 | 2;
}

export interface Transaction {
  id: string;
  walletId: string;
  type: TransactionType;
  amount: number; // In the wallet's currency
  category: string;
  date: string; // ISO string
  description: string;
  isRecurring?: boolean | RecurringFrequency;
  customRecurringDays?: number;
  splitPayout?: SplitPayoutConfig;
  // For transfer transactions
  toWalletId?: string;
}

export interface SpendingCategory {
  name: string;
  icon: string;
  color: string;
}

export type DebtType = 'lent' | 'borrowed';

export interface Debt {
  id: string;
  person: string;
  type: DebtType;
  amount: number;
  remainingAmount: number;
  currency: 'PHP' | 'USD';
  description?: string;
  date: string; // ISO String
  dueDate?: string; // ISO String
  status: 'unpaid' | 'partially_paid' | 'paid';
  walletId?: string; // Optional linked wallet
}

