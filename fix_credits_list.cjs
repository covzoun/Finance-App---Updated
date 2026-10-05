const fs = require('fs');
let list = fs.readFileSync('src/components/CreditsList.tsx', 'utf8');

// Fix net debt section spacing and text sizes
list = list.replace(
  '<span className="text-[10px] font-extrabold uppercase tracking-widest leading-none">',
  '<span className="text-[10px] font-extrabold uppercase tracking-widest leading-none text-neutral-500">'
);
list = list.replace(
  /<p className=\{\`font-mono text-xs font-extrabold \$\{isDark \? 'text-white' : 'text-neutral-800'\}\`\}>\n\s*\{formatPHP\(Math\.abs\(netDebtPHP\)\)\}\n\s*<\/p>/g,
  '<p className={`font-mono text-sm font-black mt-2 ${isDark ? "text-white" : "text-neutral-900"}`}>\n              {formatPHP(Math.abs(netDebtPHP))}\n            </p>'
);

fs.writeFileSync('src/components/CreditsList.tsx', list);
