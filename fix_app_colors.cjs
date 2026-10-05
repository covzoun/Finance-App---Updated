const fs = require('fs');
let app = fs.readFileSync('src/App.tsx', 'utf8');

app = app.replace(/#0a0a0a/g, '#121212');

fs.writeFileSync('src/App.tsx', app);
