const fs = require('fs');

const tsconfig = JSON.parse(fs.readFileSync('tsconfig.json', 'utf8'));
if (!tsconfig.compilerOptions.types) {
  tsconfig.compilerOptions.types = ["vite/client", "vite-plugin-pwa/client"];
  fs.writeFileSync('tsconfig.json', JSON.stringify(tsconfig, null, 2));
  console.log("tsconfig updated");
}
