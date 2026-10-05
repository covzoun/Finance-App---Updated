const fs = require('fs');

let txItem = fs.readFileSync('src/components/TransactionItem.tsx', 'utf8');

const txTag = `            {/* Wallet Tag */}
            {transaction.type === 'transfer' ? (
              <span className="flex items-center gap-1 text-blue-500 font-bold">
                {wallet?.name} 
                <DynamicIcon name="ArrowRight" size={12} className="mx-1" />
                {toWallet?.name}
              </span>
            ) : (
              <span className={\`font-bold \${isDark ? 'text-neutral-400' : 'text-neutral-600'}\`}>
                {wallet?.name}
              </span>
            )}
            {transaction.isRecurring && (
              <>
                <span className={\`h-1 w-1 rounded-full \${isDark ? 'text-neutral-700 bg-neutral-700' : 'text-neutral-300 bg-neutral-300'}\`} />
                <span className="flex items-center gap-1 text-blue-500 font-bold bg-blue-500/10 px-1.5 py-0.5 rounded">
                  <DynamicIcon name="RefreshCw" size={10} />
                  Monthly
                </span>
              </>
            )}`;

txItem = txItem.replace(
  `            {/* Wallet Tag */}
            {transaction.type === 'transfer' ? (
              <span className="flex items-center gap-1 text-blue-500 font-bold">
                {wallet?.name} 
                <DynamicIcon name="ArrowRight" size={12} className="mx-1" />
                {toWallet?.name}
              </span>
            ) : (
              <span className={\`font-bold \${isDark ? 'text-neutral-400' : 'text-neutral-600'}\`}>
                {wallet?.name}
              </span>
            )}`,
  txTag
);

fs.writeFileSync('src/components/TransactionItem.tsx', txItem);
