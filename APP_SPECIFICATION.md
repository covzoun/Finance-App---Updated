# Finances / Remix Digital Wallet — Complete System Specification & Implementation Blueprint

> **Notice to AI Implementer**: This document is a complete, self-contained architectural blueprint for reconstructing the **Finances (Remix Digital Wallet)** web/PWA application from scratch. Every data structure, financial algorithm, UI flow, state management pattern, and edge case is specified below.

---

## 1. Executive Summary & Vision

### 1.1 Product Definition
**Finances** is a privacy-first, offline-first personal finance management application and Progressive Web App (PWA). It empowers users to manage multi-currency accounts (wallets, high-yield savings, investments, and physical cash), track daily expenses and incomes, execute internal transfers between accounts with automatic currency conversion, manage peer-to-peer debts/credits (money lent and borrowed), and analyze cash flow trends via visual charts.

### 1.2 Core Pillars
1. **100% Offline-First & Private**: No cloud database or authentication required. All data resides in browser `localStorage`. No tracking, no telemetry, no account creation barriers.
2. **Double-Entry Ledger Integrity**: Every transaction automatically modifies account balances. Editing or deleting a transaction cleanly reverts and recalculates balance impacts across all affected wallets.
3. **Data Portability**: Full JSON backup and restore capabilities, plus one-click CSV export formatted for Google Sheets and Microsoft Excel.
4. **Desktop & Mobile PWA**: Responsive layout optimized for mobile thumbs with an installable WebAPK/PWA configuration, custom icons, and offline caching.

---

## 2. Technical Stack & Dependencies

```json
{
  "framework": "React 19.x",
  "language": "TypeScript 5.8+",
  "bundler": "Vite 6.x",
  "styling": "Tailwind CSS v4 (@tailwindcss/vite)",
  "icons": "lucide-react (dynamically resolved)",
  "animations": "motion (formerly framer-motion v12+)",
  "charts": "recharts 3.x",
  "pwa": "vite-plugin-pwa (with Workbox precaching)"
}
```

### Key Library Versions:
- `@tailwindcss/vite`: Tailwind v4 engine using `@import "tailwindcss";` in global CSS.
- `lucide-react`: Dynamic icon rendering via a robust fallback component.
- `motion/react`: Smooth presence animations (`AnimatePresence`, `motion.div`) for modal overlays and expandable cards.
- `recharts`: Responsive SVG donut/pie charts for spending breakdowns.
- `vite-plugin-pwa`: Service worker generation with auto-update and Web App Manifest injection.

---

## 3. Data Models & TypeScript Interfaces

Place these in `src/types.ts`:

```typescript
// Wallet & Account Classification
export type WalletType = 'wallet' | 'savings' | 'investment' | 'others';

export interface Wallet {
  id: string;               // e.g. "w-cash", "w-1718000000"
  name: string;             // e.g. "Maya Savings", "Physical Cash"
  description?: string;     // e.g. "6% p.a. digital bank"
  type: WalletType;
  balance: number;          // Current balance in wallet's currency
  currency: 'PHP' | 'USD';
  icon: string;             // Lucide icon name (e.g. "Wallet", "Smartphone")
  color: string;            // Tailwind gradient classes (e.g. "from-blue-500 to-indigo-600")
  image?: string;           // Optional custom avatar or banner image URL
  createdAt: string;        // ISO 8601 string
}

// Transactions & Transfers
export type TransactionType = 'expense' | 'income' | 'transfer';

export type RecurringFrequency = 
  | 'daily' 
  | 'weekly' 
  | 'biweekly'      // Every 14 days
  | 'semimonthly'   // Twice monthly (15th & 30th)
  | 'monthly' 
  | 'yearly' 
  | 'custom';

export interface SplitPayoutConfig {
  enabled: boolean;
  firstAmount: number;   // Cutoff 1 amount
  secondAmount: number;  // Cutoff 2 amount
  firstLabel?: string;   // e.g. "1st Cutoff (15th)"
  secondLabel?: string;  // e.g. "2nd Cutoff (30th)"
  cutoffSchedule?: '15_30' | '1_15' | '10_25' | 'custom_days';
  currentCutoff?: 1 | 2;
}

export interface Transaction {
  id: string;                    // e.g. "t-1718000000"
  walletId: string;              // Source wallet
  type: TransactionType;
  amount: number;                // In the source wallet's currency
  category: string;              // e.g. "Food & Dining", "Salary", "Transfer"
  date: string;                  // ISO 8601 string
  description: string;
  isRecurring?: boolean | RecurringFrequency;
  customRecurringDays?: number;
  splitPayout?: SplitPayoutConfig;
  toWalletId?: string;           // Destination wallet (only when type === 'transfer')
}

// Categories
export interface SpendingCategory {
  name: string;
  icon: string;
  color: string;
}

// Debts & Credits (Money Lent or Borrowed)
export type DebtType = 'lent' | 'borrowed';

export interface Debt {
  id: string;                    // e.g. "d-1718000000"
  person: string;                // Name of the debtor / creditor
  type: DebtType;                // 'lent' (receivable) or 'borrowed' (payable)
  amount: number;                // Initial loan amount
  remainingAmount: number;       // Unsettled balance
  currency: 'PHP' | 'USD';
  description?: string;
  date: string;                  // ISO 8601 string
  dueDate?: string;              // ISO 8601 string (optional)
  status: 'unpaid' | 'partially_paid' | 'paid';
  walletId?: string;             // Linked account for ledger tracking
}
```

---

## 4. Initial Seed Data & Categories

Place these in `src/mockData.ts`:

### Standard Categories:
```typescript
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
```

### Initial Wallets (Seed):
- **Cash on Hand**: ₱2,450 (Type: `wallet`, Color: `from-emerald-500 to-teal-600`, Icon: `Coins`)
- **USD Emergency Fund**: $500 (Type: `savings`, Color: `from-amber-400 to-orange-500`, Icon: `Shield`)
- **Maya High-Yield Savings**: ₱45,000 (Type: `savings`, Color: `from-indigo-600 via-purple-600 to-pink-500`, Icon: `PiggyBank`)
- **GCash Mobile Wallet**: ₱7,850 (Type: `wallet`, Color: `from-blue-500 via-blue-600 to-indigo-700`, Icon: `Smartphone`)
- **Mutual Fund Investment**: ₱124,500 (Type: `investment`, Color: `from-red-600 to-neutral-800`, Icon: `Activity`)

---

## 5. Storage Keys & State Persistence

The application maintains persistence in `localStorage`:
- `dw_wallets`: JSON array of `Wallet[]`.
- `dw_transactions`: JSON array of `Transaction[]`.
- `dw_debts`: JSON array of `Debt[]`.
- `dw_theme`: `'light'` | `'dark'` (defaults to `'light'`).
- `dw_hide_balances`: `'true'` | `'false'` (masks values with `••••••`).
- `dw_last_backup`: ISO date string of the last downloaded backup.

### Defensive Storage Loading:
When loading from `localStorage`, always wrap in `try/catch`. If an item does not exist or JSON parsing fails, fall back to empty arrays `[]` (or initial mock seeds on first launch) without crashing the application.

---

## 6. Financial Algorithms & Business Logic

### 6.1 Exchange Rate & Multi-Currency Normalization
- Fixed baseline conversion rate: `1 USD = 58.5 PHP` (`const USD_RATE = 58.5`).
- Total Net Worth is always computed in PHP:
  $$\text{Net Worth (PHP)} = \sum_{w \in \text{Wallets}} (\text{w.currency} == \text{'USD'} ? w.balance \times 58.5 : w.balance)$$

### 6.2 Double-Entry Ledger Engine

#### Applying a Transaction (`applyTransactionBalances`):
1. **Expense**:
   - `wallet.balance = wallet.balance - tx.amount`
2. **Income**:
   - `wallet.balance = wallet.balance + tx.amount`
3. **Transfer** (Between `walletId` and `toWalletId`):
   - Deduct from source: `sourceWallet.balance = sourceWallet.balance - tx.amount`
   - Convert if currencies differ:
     - If Source = `USD` and Target = `PHP`: `creditAmount = tx.amount * 58.5`
     - If Source = `PHP` and Target = `USD`: `creditAmount = tx.amount / 58.5`
     - Same currency: `creditAmount = tx.amount`
   - Credit destination: `targetWallet.balance = targetWallet.balance + creditAmount`

#### Reverting a Transaction (`revertTransactionBalances`):
Used before editing or deleting an existing transaction to undo its impact:
- Revert Expense: `wallet.balance + tx.amount`
- Revert Income: `wallet.balance - tx.amount`
- Revert Transfer:
  - Source: `sourceWallet.balance + tx.amount`
  - Target: `targetWallet.balance - convertedAmount`

#### Direct Balance Adjustment:
When a user manually modifies an account balance in the Wallet Details view:
1. Calculate difference: $\Delta = \text{newBalance} - \text{oldBalance}$.
2. Auto-generate an audit ledger transaction:
   - Type: $\Delta > 0$ ? `'income'` : `'expense'`
   - Category: `'Adjustment'`
   - Description: `"Manual balance adjustment (from X to Y)"`
   - Amount: $|\Delta|$

### 6.3 Debts & Credits Workflow
1. **Adding a Debt (`handleAddDebt`)**:
   - `remainingAmount = amount`
   - `status = 'unpaid'`
   - If `shouldAffectWallet === true` and `walletId` is selected:
     - **Lent**: Deducts from wallet as an Expense (`Category: 'Lent'`).
     - **Borrowed**: Adds to wallet as Income (`Category: 'Borrowed'`).
2. **Adding a Repayment (`handleAddRepayment`)**:
   - `remainingAmount = debt.remainingAmount - paymentAmount`
   - Status updates: `remainingAmount <= 0 ? 'paid' : 'partially_paid'`.
   - If `shouldAffectWallet === true`:
     - **Lent Repayment**: Received money $\rightarrow$ Credits wallet as Income (`Category: 'Repayment'`).
     - **Borrowed Repayment**: Paid money back $\rightarrow$ Debits wallet as Expense (`Category: 'Debt Payment'`).
3. **Direct Settlement (`handleSettleDirectly`)**:
   - Immediately sets `remainingAmount = 0` and `status = 'paid'` without altering wallet balances.

---

## 7. Component Architecture & UI Hierarchy

```
App
├── Header / Top Bar
│   ├── App Title & Status ("Finances Offline")
│   ├── Real-time Clock (HH:MM:SS AM/PM)
│   ├── Privacy Mask Toggle (Eye / EyeOff)
│   ├── Theme Toggle (Sun / Moon)
│   └── Settings Gear Icon (Opens SettingsModal)
├── Net Worth Hero Card
│   ├── Total Combined Net Worth (Formatted in ₱ or ••••••)
│   ├── Quick Cash Flow Stats (Monthly Income vs Monthly Spending)
│   ├── Fast Action Buttons (+ Transaction, + Account, Analytics)
├── Tab Navigation Bar
│   ├── Tab 1: Wallets (Accounts Overview)
│   ├── Tab 2: Activity (Transaction History)
│   └── Tab 3: Credits & Debts (Money Lent & Borrowed)
├── Tab Views
│   ├── View A: Wallets Tab
│   │   ├── Horizontal Carousel / Responsive Grid of WalletCard
│   │   └── Selected WalletDetails (Full drawer/view with filters, edit modal, delete)
│   ├── View B: Activity Tab
│   │   ├── Search Input & Type Filter Chips (All, Expense, Income, Transfer, Recurring)
│   │   ├── Grouped or Paginated TransactionItem list
│   │   └── Edit / Delete Transaction Triggers
│   └── View C: Credits & Debts Tab (CreditsList)
│       ├── Summary Cards (Total Lent, Total Borrowed, Net Position)
│       ├── Sub-tabs: Active vs Settled
│       └── Expandable Debt Cards with Inline Repayment Form
├── Modals & Drawers
│   ├── AddWalletModal (Create new account with color/icon/bank picker)
│   ├── AddTransactionModal (Add/Edit Expense, Income, or Transfer with Split Cutoff support)
│   ├── AddCreditModal (Create Lent or Borrowed entry)
│   ├── OverviewCharts (Drawer/Modal with Net Worth distribution & Recharts spending donut)
│   └── SettingsModal (PWA Install, Appearance, Backup JSON, Export CSV, Wipe Data)
```

---

## 8. Screen & Modal Detailed Specifications

### 8.1 Header & Net Worth Hero Card
- **Clock**: Updates every 1,000ms.
- **Privacy Mode (`hideBalances`)**: When active, replaces all numbers with `••••••`.
- **Monthly Income & Expense Calculation**: Filters transactions where `type === 'expense' | 'income'`, month === current month, and year === current year, converting USD to PHP for unified presentation.

### 8.2 WalletCard Component (`src/components/WalletCard.tsx`)
- Displays wallet name, type tag (`Savings`, `Wallet`, `Investment`), balance, currency, icon, and dynamic gradient background.
- Shows mini progress bar or trend indicator.
- Clicking the card opens `WalletDetails`.

### 8.3 WalletDetails Component (`src/components/WalletDetails.tsx`)
- Displays wallet title, type badge, balance, and quick action buttons:
  - **Add Transaction** (preselected to this wallet).
  - **Edit Account** (inline or modal form to edit Name, Description, Color, Icon, Currency, Type, and Balance).
  - **Delete Account** (with confirmation check).
- Filterable list of all transactions belonging strictly to this wallet.

### 8.4 Bank Logo System (`src/components/BankLogo.tsx`)
Provides geometric, high-contrast SVG vector logos for major banking/fintech institutions:
- **GCash** (`#005CEE`), **Maya** (`#00B14F`), **BPI** (`#B11116`), **BDO** (`#002A86`), **UnionBank** (`#EE6F24`), **SeaBank** (`#FF7000`), **GoTyme** (`#00A3A0`), **AUB** (`#E11D48`), **RCBC** (`#0054A6`), **Metrobank** (`#0033A0`).

### 8.5 Add/Edit Transaction Modal (`src/components/AddTransactionModal.tsx`)
1. **Type Selector**: Tabs for **Expense**, **Income**, and **Transfer**.
2. **Transfer Mode**: Reveals source `walletId` and destination `toWalletId` selectors (prevents transferring to the same account).
3. **Formatted Number Input**: Automatically inserts commas as user types (e.g. `25,000.50`).
4. **Unequal Split Payouts (Cutoff Salary Management)**:
   - Toggle to enable split payouts.
   - Presets for payroll schedules: `15th & 30th`, `1st & 15th`, `10th & 25th`.
   - Independent amounts for 1st cutoff and 2nd cutoff.
5. **Recurring Frequency Selector**: Daily, Weekly, Biweekly (14 days), Semimonthly (twice a month), Monthly, Yearly, Custom Days.
6. **Date Picker**: `datetime-local` input pre-filled with current timestamp.

### 8.6 Analytics & Reports (`src/components/OverviewCharts.tsx`)
- **Timeframe Selector**: Day, Week, Month, Year.
- **Account Distribution**: Bar / progress view displaying what percentage of total net worth is held in each account.
- **Category Donut Chart (`Recharts`)**:
  - Center label with total spent.
  - Custom color mapping per category.
  - Hover tooltip with formatted currency and percentage of total expenses.
- **Expenditure Breakdown List**: Displays category icon, name, total spent, transaction count, and relative bar indicator.

### 8.7 Settings & Data Portability Modal (`src/components/SettingsModal.tsx`)
1. **Appearance**: Light Mode vs Dark Mode button toggle.
2. **Offline App Installation (`PWAInstallButton`)**: Triggers native browser install prompt or shows iOS Safari instructions.
3. **Hide Balances Toggle**: Masks sensitive numbers with `••••••`.
4. **Data Backup & Restore**:
   - **Backup JSON**: Downloads `finances_backup_YYYY-MM-DD.json` containing `{ wallets, transactions, debts }`. Updates `dw_last_backup`.
   - **Restore Data**: File input accepting `.json`. Validates schema structure (`wallets && transactions`), overwrites `localStorage`, and triggers a smooth reload.
   - **Export Transactions to CSV**: Generates an RFC 4180-compliant `.csv` file with columns: `Date, Type, Category, Amount, Currency, Wallet, Description, To Wallet`.
5. **Danger Zone**:
   - Red reset card. Clicking requires a second confirmation step before wiping `dw_wallets`, `dw_transactions`, and `dw_debts`.

---

## 9. PWA Configuration & Offline Setup

### 9.1 `vite.config.ts` Configuration:
```typescript
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'pwa-192x192.png', 'pwa-512x512.png'],
      manifest: {
        id: '/',
        name: 'Finances',
        short_name: 'Finances',
        description: 'A modern installable web application for personal finances.',
        theme_color: '#121212',
        background_color: '#121212',
        display: 'standalone',
        start_url: '/',
        scope: '/',
        icons: [
          {
            src: '/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/pwa-maskable-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
      },
      devOptions: {
        enabled: true,
        type: 'module',
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
});
```

### 9.2 Service Worker Activation (`src/main.tsx`):
```typescript
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { registerSW } from 'virtual:pwa-register';

if ('serviceWorker' in navigator) {
  registerSW({ immediate: true });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
```

### 9.3 `index.html` Head Tags:
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<meta name="theme-color" content="#121212" />
<meta name="mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="default" />
<meta name="apple-mobile-web-app-title" content="Finances" />
<link rel="apple-touch-icon" href="/apple-touch-icon.png" />
<link rel="icon" type="image/svg+xml" href="/icon.svg" />
```

---

## 10. Design & Styling System (Tailwind CSS v4)

- **Dark Mode Color Palette**:
  - Backgrounds: `bg-neutral-950`, `bg-neutral-900`, `bg-neutral-900/60`
  - Borders: `border-neutral-800`, `border-neutral-900`
  - Text: `text-white`, `text-neutral-400`, `text-neutral-500`
- **Light Mode Color Palette**:
  - Backgrounds: `bg-neutral-50`, `bg-white`, `bg-neutral-100`
  - Borders: `border-neutral-200`, `border-neutral-300`
  - Text: `text-neutral-900`, `text-neutral-600`, `text-neutral-400`
- **Primary Brand Accents**:
  - Positive / Income: `text-emerald-500`, `bg-emerald-500/20`
  - Negative / Expense: `text-rose-500`, `bg-rose-500/20`
  - Action / Buttons: `bg-blue-600 hover:bg-blue-700 text-white`
  - Transfers / Informational: `text-indigo-500`, `bg-indigo-500/20`
- **Typography & Touch Targets**:
  - Mobile-first minimum button height: `44px` (`py-2.5` to `py-3`).
  - Font tracking: `uppercase tracking-widest text-[10px]` or `text-xs font-bold` for section headers and badges.
  - Border radius: `rounded-2xl` on cards and modals, `rounded-xl` on interactive buttons.

---

## 11. Step-by-Step Reconstruction Guide for an AI Agent

1. **Scaffold Project**: Initialize Vite + React 19 + TypeScript + Tailwind CSS v4.
2. **Install Packages**: `lucide-react`, `motion`, `recharts`, `vite-plugin-pwa`.
3. **Setup Data Types**: Copy `src/types.ts` verbatim from Section 3.
4. **Setup Seed & Helper Data**: Create `src/mockData.ts` with categories and sample wallets.
5. **Build Low-Level Utilities**:
   - `DynamicIcon`: Safely resolves Lucide icons with fallback to `HelpCircle`.
   - `BankLogo`: Renders bank SVG badges.
   - `usePWAInstall`: Custom hook handling `beforeinstallprompt`.
6. **Implement Double-Entry State in `App.tsx`**:
   - Manage `wallets`, `transactions`, `debts`, `themeMode`, `hideBalances`.
   - Connect ledger balance adjustment functions (`applyTransactionBalances`, `revertTransactionBalances`).
7. **Construct Primary Views**:
   - `WalletCard` & `WalletDetails` for account inspection.
   - `TransactionItem` with category icon, relative timestamp, and currency badge.
   - `CreditsList` for managing money lent vs borrowed with inline repayment.
8. **Build Modals & Forms**:
   - `AddTransactionModal` supporting Income, Expense, Transfer, Split Cutoff, and Recurring options.
   - `AddWalletModal` and `AddCreditModal`.
   - `OverviewCharts` with Recharts donut visualization.
   - `SettingsModal` supporting JSON Export/Import, CSV Export, and App Reset.
9. **Enable PWA Caching**: Register service worker in `main.tsx` and configure `vite.config.ts`.
10. **Verify & Test**: Validate build with `tsc --noEmit` and `vite build`.
