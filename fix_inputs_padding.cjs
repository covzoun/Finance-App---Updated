const fs = require('fs');
const files = ['src/components/AddTransactionModal.tsx', 'src/components/AddCreditModal.tsx'];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  // Revert datetime-local and select paddings to standard px-3
  content = content.replace(/pl-3 pr-8 py-2\.5/g, 'px-3 py-2.5');
  content = content.replace(/pl-3 pr-8 py-2/g, 'px-3 py-2');
  content = content.replace(/px-4 pr-14 py-2\.5/g, 'px-3 py-2.5');
  content = content.replace(/px-4 pr-12 py-2\.5/g, 'px-3 py-2.5');
  content = content.replace(/px-4 pr-10 py-2\.5/g, 'px-3 py-2.5');
  
  // Actually, some users might still complain if the native browser arrow is at the very edge.
  // Tailwind select default styling might look better if we just ensure we have standard styling.
  fs.writeFileSync(file, content);
}
