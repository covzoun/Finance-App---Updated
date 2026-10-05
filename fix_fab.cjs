const fs = require('fs');
let app = fs.readFileSync('src/App.tsx', 'utf8');

app = app.replace(
  '                {/* Primary Blue Floating Action Button (FAB) */}\n                {!(',
  '                {/* Primary Blue Floating Action Button (FAB) */}\n                {!showAnalyticsPanel && !('
);

fs.writeFileSync('src/App.tsx', app);
