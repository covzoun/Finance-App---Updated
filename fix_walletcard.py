import re

with open('src/components/WalletCard.tsx', 'r') as f:
    content = f.read()

# Name
content = content.replace('text-[11px] truncate', 'text-sm truncate')
# Balance
content = content.replace('text-[11px] font-extrabold', 'text-base font-extrabold')
# Type and Desc are fine at 11px, or change to 10px
content = content.replace('text-[11px] font-bold uppercase', 'text-[10px] font-bold uppercase')

with open('src/components/WalletCard.tsx', 'w') as f:
    f.write(content)
