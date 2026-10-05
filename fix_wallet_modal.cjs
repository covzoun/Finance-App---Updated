const fs = require('fs');
let code = fs.readFileSync('src/components/AddWalletModal.tsx', 'utf8');

const oldStr = "className={selectedIcon === 'bank:' + preset.id ? 'opacity-100' : isDark ? 'opacity-50' : 'opacity-40 brightness-0 invert-0'}";
const newStr = "className={selectedIcon === 'bank:' + preset.id ? 'opacity-100 scale-110 shadow-md ring-2 ring-blue-500 rounded-full transition-all' : 'opacity-60 scale-90 grayscale hover:grayscale-0 hover:opacity-100 transition-all'}";

if (code.includes(oldStr)) {
  code = code.replace(oldStr, newStr);
  fs.writeFileSync('src/components/AddWalletModal.tsx', code);
  console.log('Fixed AddWalletModal');
} else {
  console.log('Could not find string in AddWalletModal');
}
