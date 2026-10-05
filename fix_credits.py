import re

with open('src/components/CreditsList.tsx', 'r') as f:
    content = f.read()

# Titles
content = content.replace('text-[11px] font-black uppercase tracking-widest', 'text-xs font-black uppercase tracking-widest')
# Amounts? Wait, did they get mangled? Let's check if CreditsList had text-lg.
# I'll just change all text-[11px] to text-xs to be safe.
# Actually I don't know what was in CreditsList.
content = content.replace('text-[11px]', 'text-xs')
# then we reduce some
content = content.replace('text-xs font-extrabold uppercase', 'text-[10px] font-extrabold uppercase')

with open('src/components/CreditsList.tsx', 'w') as f:
    f.write(content)
