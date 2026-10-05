const fs = require('fs');

// --- App.tsx ---
let app = fs.readFileSync('src/App.tsx', 'utf8');

// Dark Mode color tweaks
app = app.replace(/bg-black/g, 'bg-neutral-950');
app = app.replace(/'#000000'/g, "'#0a0a0a'");
app = app.replace(/bg-neutral-950/g, 'bg-neutral-950'); // leave it as neutral-950 for now

// Settings button tweak
app = app.replace(
  "className={`p-2 rounded-xl transition-all border cursor-pointer ${",
  "className={`p-2 rounded-full transition-all cursor-pointer ${"
);
app = app.replace(
  "isDark \n                          ? 'bg-neutral-800 border-neutral-700 text-neutral-300 hover:bg-neutral-700 hover:text-white'\n                          : 'bg-neutral-50 border-neutral-200 text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'",
  "isDark ? 'text-neutral-400 hover:text-white hover:bg-neutral-800' : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-200'"
);

// Improve logo
app = app.replace(
  '<h1 className="text-xl font-bold tracking-tight">Finances</h1>',
  '<div className="flex items-center gap-2"><div className={`w-7 h-7 rounded-lg flex items-center justify-center ${isDark ? "bg-neutral-800 text-white" : "bg-neutral-200 text-neutral-900"}`}><DynamicIcon name="Wallet" size={14} /></div><h1 className="text-xl font-black tracking-tight">Finances</h1></div>'
);

// Hide FAB when analytics is open
// Find the FAB
app = app.replace(
  '{/* Floating Add FAB */}',
  '{/* Floating Add FAB */}\n                {!showAnalyticsPanel && ('
);
app = app.replace(
  '                  </motion.button>\n                )}',
  '                  </motion.button>\n                )}\n                )}'
);

fs.writeFileSync('src/App.tsx', app);


// --- AddTransactionModal.tsx ---
let txModal = fs.readFileSync('src/components/AddTransactionModal.tsx', 'utf8');
txModal = txModal.replace(
  'const [description, setDescription] = useState(\'\');',
  'const [description, setDescription] = useState(\'\');\n  const [isRecurring, setIsRecurring] = useState(false);'
);

txModal = txModal.replace(
  'className="w-full bg-transparent outline-none text-right font-medium px-4 text-sm"',
  'className="w-full bg-transparent outline-none text-right font-medium px-4 pr-10 text-sm"'
);
txModal = txModal.replace(
  '<input\n                  type="datetime-local"',
  '<input\n                  type="datetime-local"\n                  className="w-full bg-transparent outline-none text-right font-medium px-4 pr-10 text-sm"'
); // wait I'll use regex for datetime-local

fs.writeFileSync('src/components/AddTransactionModal.tsx', txModal);
