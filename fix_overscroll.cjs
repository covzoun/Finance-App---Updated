const fs = require('fs');

function fixFile(file) {
  let content = fs.readFileSync(file, 'utf8');
  if (content.includes('overflow-y-auto')) {
    content = content.replace(/overflow-y-auto/g, 'overflow-y-auto overscroll-contain');
    fs.writeFileSync(file, content);
    console.log(`Added overscroll-contain to ${file}`);
  }
}

const glob = require('fs').readdirSync('src/components');
glob.forEach(file => {
  if (file.endsWith('.tsx')) {
    fixFile(`src/components/${file}`);
  }
});
fixFile('src/App.tsx');
