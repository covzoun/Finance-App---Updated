# Finances

Privacy-first, offline-first personal finance PWA.

Multi-currency wallets • transactions • transfers • debts/credits • charts • backup/restore.

No account. No cloud. Data lives in your browser (`localStorage`).

## Stack

- React 19 + TypeScript
- Vite 6 + Tailwind CSS v4
- motion (animations)
- Recharts
- vite-plugin-pwa (installable + offline)

## Quick start

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Build

```bash
npm run build
npm run preview
```

## Android APK (no Android Studio required)

GitHub Actions builds a debug APK automatically.

1. Go to **Actions** → **Build Android APK**
2. Click **Run workflow**
3. Download the artifact `Finance-App-debug-apk`

Or push to `main` — it builds on every push.

Uses Capacitor under the hood.

## Features

- Wallets / savings / investments (PHP + USD)
- Expense / Income / Transfer with automatic balance updates
- Recurring + split-payout support
- Debts & credits (lent / borrowed) with repayments
- Net worth + monthly cashflow
- Category spending charts
- Privacy balance mask
- Light / dark theme
- Full JSON backup + CSV export
- Installable PWA

## Data

All data stays on device:

- `dw_wallets`
- `dw_transactions`
- `dw_debts`
- `dw_theme`
- `dw_hide_balances`

## License

Private / personal use.
