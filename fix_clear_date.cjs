const fs = require('fs');

let modal = fs.readFileSync('src/components/AddCreditModal.tsx', 'utf8');

const newLabel = `
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                Due Date (Optional)
              </label>
              {dueDate && (
                <button type="button" onClick={() => setDueDate('')} className="text-[10px] font-bold text-rose-500 hover:text-rose-600 transition-colors">
                  Clear
                </button>
              )}
            </div>
`;

modal = modal.replace(
  /<label className="block text-\[10px\] font-bold text-neutral-400 uppercase tracking-widest mb-1\.5">\s*Due Date \(Optional\)\s*<\/label>/,
  newLabel
);

fs.writeFileSync('src/components/AddCreditModal.tsx', modal);
