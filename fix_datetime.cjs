const fs = require('fs');

function fixDatetime(file) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(
    /className=\{\`w-full rounded-xl border px-4 /g,
    'className={`w-full rounded-xl border px-4 pr-10 '
  );
  // Also check AddCreditModal
  content = content.replace(
    /className="w-full bg-transparent outline-none text-right font-medium px-4 text-sm"/g,
    'className="w-full bg-transparent outline-none text-right font-medium px-4 pr-10 text-sm"'
  );
  fs.writeFileSync(file, content);
}

fixDatetime('src/components/AddTransactionModal.tsx');
fixDatetime('src/components/AddCreditModal.tsx');
