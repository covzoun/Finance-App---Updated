import type { Wallet, Transaction } from '../types';

/** Fixed conversion rate used throughout the app */
export const USD_RATE = 58.5;

export function toPHP(amount: number, currency: 'PHP' | 'USD' = 'PHP'): number {
  return currency === 'USD' ? amount * USD_RATE : amount;
}

export function convertAmount(
  amount: number,
  from: 'PHP' | 'USD',
  to: 'PHP' | 'USD'
): number {
  if (from === to) return amount;
  if (from === 'USD' && to === 'PHP') return amount * USD_RATE;
  return amount / USD_RATE; // PHP -> USD
}

/** Reverse the balance impact of a transaction */
export function revertTransactionBalances(
  tx: Transaction,
  wallets: Wallet[]
): Wallet[] {
  return wallets.map((w) => {
    if (w.id === tx.walletId) {
      if (tx.type === 'expense') {
        return { ...w, balance: Number((w.balance + tx.amount).toFixed(2)) };
      }
      if (tx.type === 'income') {
        return { ...w, balance: Number((w.balance - tx.amount).toFixed(2)) };
      }
      if (tx.type === 'transfer') {
        return { ...w, balance: Number((w.balance + tx.amount).toFixed(2)) };
      }
    }

    if (tx.type === 'transfer' && w.id === tx.toWalletId) {
      const source = wallets.find((s) => s.id === tx.walletId);
      let credit = tx.amount;
      if (source && source.currency !== w.currency) {
        credit = convertAmount(tx.amount, source.currency, w.currency);
      }
      return { ...w, balance: Number((w.balance - credit).toFixed(2)) };
    }

    return w;
  });
}

/** Apply the balance impact of a transaction */
export function applyTransactionBalances(
  tx: Transaction,
  wallets: Wallet[]
): Wallet[] {
  return wallets.map((w) => {
    if (w.id === tx.walletId) {
      if (tx.type === 'expense') {
        return { ...w, balance: Number((w.balance - tx.amount).toFixed(2)) };
      }
      if (tx.type === 'income') {
        return { ...w, balance: Number((w.balance + tx.amount).toFixed(2)) };
      }
      if (tx.type === 'transfer') {
        return { ...w, balance: Number((w.balance - tx.amount).toFixed(2)) };
      }
    }

    if (tx.type === 'transfer' && w.id === tx.toWalletId) {
      const source = wallets.find((s) => s.id === tx.walletId);
      let credit = tx.amount;
      if (source && source.currency !== w.currency) {
        credit = convertAmount(tx.amount, source.currency, w.currency);
      }
      return { ...w, balance: Number((w.balance + credit).toFixed(2)) };
    }

    return w;
  });
}

export function calcNetWorth(wallets: Wallet[]): number {
  return wallets.reduce(
    (sum, w) => sum + toPHP(w.balance, w.currency || 'PHP'),
    0
  );
}
