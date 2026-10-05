const fs = require('fs');
let file = fs.readFileSync('src/components/WalletDetails.tsx', 'utf8');

const regex = /(\{isEditing \? \([\s\S]*?\} \)\s*\}\s*)({\/\* Record transaction button \*\/})/m;
file = file.replace(
  regex,
  '$1\n        {!isEditing && (\n          <>\n          $2'
);

const endRegex = /(<\/div>\n      <\/div>\n    <\/div>\n  \);\n\})/m;
file = file.replace(
  endRegex,
  '          </>\n        )}\n$1'
);

// fix bright icon container (bg-blue-50 vs text-white).
file = file.replace(/bg-blue-50/g, 'bg-blue-500/10');
file = file.replace(/bg-indigo-50/g, 'bg-indigo-500/10');
file = file.replace(/bg-emerald-50/g, 'bg-emerald-500/10');
file = file.replace(/bg-orange-50/g, 'bg-orange-500/10');
file = file.replace(/bg-rose-50/g, 'bg-rose-500/10');
file = file.replace(/bg-neutral-100/g, 'bg-neutral-500/10');
// The ones in getCatColor
fs.writeFileSync('src/components/WalletDetails.tsx', file);
