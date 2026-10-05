const fs = require('fs');
let app = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Remove Finances logo/text and update top spacing
const topBarRegex = /<div className="flex items-center gap-2"><div className=\{`w-7 h-7 rounded-lg flex items-center justify-center \$\{isDark \? "bg-neutral-800 text-white" : "bg-neutral-200 text-neutral-900"\}`\}><DynamicIcon name="Wallet" size=\{14\} \/><\/div><h1 className="text-xl font-black tracking-tight">Finances<\/h1><\/div>/;
app = app.replace(topBarRegex, '<div className="flex-1"></div>'); // Replace with empty div to push settings to right

// Increase spacing below the top bar
app = app.replace(
  '<div className="px-6 pt-8 flex items-center justify-between shrink-0">',
  '<div className="px-6 pt-10 pb-2 flex items-center justify-between shrink-0">' // More top padding and bottom padding
);

// Increase gap around total assets
// Look for total assets header:
app = app.replace(
  '<div className="px-6 pt-6 pb-2">',
  '<div className="px-6 pt-8 pb-4">'
);

// Tab switcher spacing
app = app.replace(
  '<div className="px-6 py-2 shrink-0">',
  '<div className="px-6 py-6 shrink-0">'
);

fs.writeFileSync('src/App.tsx', app);
