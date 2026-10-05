import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# Fix amounts
content = content.replace('className="text-[11px] font-black text-emerald-500"', 'className="text-base font-black text-emerald-500"')
content = content.replace('className="text-[11px] font-black text-rose-500"', 'className="text-base font-black text-rose-500"')

# Fix titles
content = content.replace('className={`text-[11px] font-bold uppercase tracking-wider ${isDark ? \'text-slate-200\' : \'text-slate-700\'}`}>No Accounts Registered', 'className={`text-sm font-bold uppercase tracking-wider ${isDark ? \'text-slate-200\' : \'text-slate-700\'}`}>No Accounts Registered')
content = content.replace('className={`text-[11px] font-bold uppercase tracking-wider ${isDark ? \'text-slate-200\' : \'text-slate-700\'}`}>No Transactions Found', 'className={`text-sm font-bold uppercase tracking-wider ${isDark ? \'text-slate-200\' : \'text-slate-700\'}`}>No Transactions Found')
content = content.replace('className={`font-sans font-bold text-[11px] uppercase tracking-wider ${isDark ? \'text-white\' : \'text-slate-800\'}`}>Financial Insights', 'className={`font-sans font-bold text-sm uppercase tracking-wider ${isDark ? \'text-white\' : \'text-slate-800\'}`}>Financial Insights')

# Fix small labels
content = content.replace('text-[11px] font-bold uppercase tracking-[0.2em]', 'text-[10px] font-bold uppercase tracking-[0.2em]')
content = content.replace('text-[11px] uppercase tracking-widest text-slate-500', 'text-[10px] uppercase tracking-widest text-slate-500')

with open('src/App.tsx', 'w') as f:
    f.write(content)
