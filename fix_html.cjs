const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

html = html.replace(
  '<meta name="theme-color" content="#ffffff" />',
  '<meta name="theme-color" content="#0a0a0a" />'
);

fs.writeFileSync('index.html', html);
