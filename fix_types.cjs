const fs = require('fs');
let types = fs.readFileSync('src/types.ts', 'utf8');
types = types.replace(
  '  description: string;',
  '  description: string;\n  isRecurring?: boolean;'
);
fs.writeFileSync('src/types.ts', types);
