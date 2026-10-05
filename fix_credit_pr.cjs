const fs = require('fs');
let modal = fs.readFileSync('src/components/AddCreditModal.tsx', 'utf8');

modal = modal.replace(/pl-3 pr-14 py-2\.5/g, 'pl-3 pr-9 py-2.5');

fs.writeFileSync('src/components/AddCreditModal.tsx', modal);
