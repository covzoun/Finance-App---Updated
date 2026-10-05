const fs = require('fs');
let bank = fs.readFileSync('src/components/BankLogo.tsx', 'utf8');

bank = bank.replace(
  "{ id: 'aub', name: 'AUB', color: '#00478F' }",
  "{ id: 'aub', name: 'AUB', color: '#E11D48' }"
);

fs.writeFileSync('src/components/BankLogo.tsx', bank);
