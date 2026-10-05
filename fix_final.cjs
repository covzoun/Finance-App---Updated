const fs = require('fs');
let file = fs.readFileSync('src/components/WalletDetails.tsx', 'utf8');

const correctEnd = `
        {!isEditing && (
          <>
            <div className="shrink-0">
              <button
                onClick={() => onAddTransactionClick(wallet.id)}
                className="w-full py-3.5 px-4 rounded-xl bg-blue-600 text-white font-bold uppercase text-sm tracking-widest hover:bg-blue-700 active:scale-98 transition-all shadow-md shadow-blue-500/10 flex items-center justify-center gap-2 cursor-pointer"
              >
                <DynamicIcon name="PlusCircle" size={13} />
                Record Transaction
              </button>
            </div>
            {/* Wallet specific Transactions */}
            <div className="space-y-4">
              <h4 className={\`font-sans font-bold text-xs uppercase tracking-widest flex items-center gap-2 \${
                isDark ? 'text-neutral-400' : 'text-neutral-400'
              }\`}>
                <DynamicIcon name="History" size={14} />
                Account Activity
              </h4>
              {walletTransactions.length === 0 ? (
                <div className={\`text-center py-10 rounded-2xl border border-dashed text-xs font-medium \${
                  isDark ? 'bg-neutral-900 border-neutral-800 text-neutral-500' : 'bg-white border-neutral-200 text-neutral-400'
                }\`}>
                  No transactions registered for this wallet.
                </div>
              ) : (
                <div className="flex flex-col gap-2.5">
                  {walletTransactions
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .map((tx) => (
                      <TransactionItem key={tx.id} transaction={tx} wallets={wallets} themeMode={themeMode} />
                    ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}`;

file = file.replace(/\{\!isEditing && \([\s\S]*/, correctEnd);

fs.writeFileSync('src/components/WalletDetails.tsx', file);
