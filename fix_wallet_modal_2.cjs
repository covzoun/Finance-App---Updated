const fs = require('fs');
let code = fs.readFileSync('src/components/AddWalletModal.tsx', 'utf8');

code = code.replace(
  "'opacity-60 scale-90 grayscale hover:grayscale-0 hover:opacity-100 transition-all'",
  "'opacity-50 scale-90 hover:scale-100 hover:opacity-100 transition-all'"
);

fs.writeFileSync('src/components/AddWalletModal.tsx', code);
console.log('Fixed AddWalletModal grayscale');
