const fs = require('fs');
let app = fs.readFileSync('src/App.tsx', 'utf8');

app = app.replace(
  'isDark \n                           ? \'bg-neutral-800 border-neutral-700 text-neutral-300 hover:bg-neutral-700 hover:text-white\' \n                           : \'bg-neutral-50 border-neutral-200 text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900\'',
  'isDark \n                           ? \'text-neutral-400 hover:bg-neutral-800 hover:text-white\' \n                           : \'text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900\''
);

// wait the exact string might be different, let's use regex
app = app.replace(
  /isDark\s*\?\s*'bg-neutral-800 border-neutral-700 text-neutral-300 hover:bg-neutral-700 hover:text-white'\s*:\s*'bg-neutral-50 border-neutral-200 text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'/g,
  'isDark ? \'text-neutral-400 hover:bg-neutral-800 hover:text-white\' : \'text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900\''
);

fs.writeFileSync('src/App.tsx', app);
