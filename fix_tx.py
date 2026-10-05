import re

with open('src/components/TransactionItem.tsx', 'r') as f:
    content = f.read()

# Description
content = content.replace('text-[11px] font-bold truncate', 'text-sm font-bold truncate')
# Amount
content = content.replace('text-[11px] ${', 'text-sm ${')
# Date, category are ok at 11px or 10px
content = content.replace('text-[11px] mt-1 font-medium', 'text-[10px] mt-1 font-medium')
content = content.replace('text-[11px] font-bold tracking-wider mt-1 uppercase', 'text-[10px] font-bold tracking-wider mt-1 uppercase')

with open('src/components/TransactionItem.tsx', 'w') as f:
    f.write(content)
