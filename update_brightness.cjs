const fs = require('fs');

// App.tsx
let app = fs.readFileSync('src/App.tsx', 'utf8');
app = app.replace(/document\.body\.style\.backgroundColor = isDark \? '#000000' : '#f8fafc';/, "document.body.style.backgroundColor = isDark ? '#121212' : '#f8fafc';");
app = app.replace(/document\.documentElement\.style\.backgroundColor = isDark \? '#000000' : '#f8fafc';/, "document.documentElement.style.backgroundColor = isDark ? '#121212' : '#f8fafc';");
app = app.replace(/metaThemeColor\.setAttribute\('content', isDark \? '#000000' : '#f8fafc'\);/, "metaThemeColor.setAttribute('content', isDark ? '#121212' : '#f8fafc');");
app = app.replace(/bg-neutral-950/g, 'bg-neutral-900'); // Actually, let's leave tailwind classes as 950, just tweak the absolute base. Wait, Tailwind's neutral-950 is #0a0a0a. Let's change `bg-neutral-950` to `bg-neutral-900` (which is #171717) globally in App.tsx and components.

fs.writeFileSync('src/App.tsx', app);

// index.css
let css = fs.readFileSync('src/index.css', 'utf8');
css = css.replace(/#0a0a0a/g, '#121212');
fs.writeFileSync('src/index.css', css);

// index.html
let html = fs.readFileSync('index.html', 'utf8');
html = html.replace(/#0a0a0a/g, '#121212');
fs.writeFileSync('index.html', html);

// vite.config.ts
let viteConfig = fs.readFileSync('vite.config.ts', 'utf8');
viteConfig = viteConfig.replace(/#0a0a0a/g, '#121212');
fs.writeFileSync('vite.config.ts', viteConfig);
