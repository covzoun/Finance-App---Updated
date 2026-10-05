const fs = require('fs');
let viteConfig = fs.readFileSync('vite.config.ts', 'utf8');

viteConfig = viteConfig.replace(
  "theme_color: '#ffffff'",
  "theme_color: '#0a0a0a'"
);
viteConfig = viteConfig.replace(
  "background_color: '#ffffff'",
  "background_color: '#0a0a0a'"
);

fs.writeFileSync('vite.config.ts', viteConfig);
