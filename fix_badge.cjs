const fs = require('fs');
let item = fs.readFileSync('src/components/TransactionItem.tsx', 'utf8');

const descriptionBlock = `          <p className={\`font-sans text-sm font-bold truncate pr-2 \${isDark ? 'text-neutral-100' : 'text-neutral-800'}\`}>
            {transaction.description}
          </p>`;
          
const descriptionWithBadge = `          <div className="flex items-center gap-1.5">
            <p className={\`font-sans text-sm font-bold truncate \${isDark ? 'text-neutral-100' : 'text-neutral-800'}\`}>
              {transaction.description}
            </p>
            {transaction.isRecurring && (
              <div className="bg-blue-500/10 text-blue-500 p-0.5 rounded-md flex-shrink-0" title="Recurring">
                <DynamicIcon name="RefreshCw" size={10} />
              </div>
            )}
          </div>`;

item = item.replace(descriptionBlock, descriptionWithBadge);
fs.writeFileSync('src/components/TransactionItem.tsx', item);
