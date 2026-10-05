const fs = require('fs');

function replaceAll(file) {
  let content = fs.readFileSync(file, 'utf8');
  
  // Make main background black instead of 950
  if (file === 'src/App.tsx') {
    content = content.replace("isDark ? 'bg-neutral-950 text-neutral-50' : 'bg-neutral-50 text-neutral-900'", "isDark ? 'bg-black text-neutral-50' : 'bg-neutral-50 text-neutral-900'");
    content = content.replace("isDark ? '#020617' : '#f8fafc'", "isDark ? '#000000' : '#f8fafc'");
  }

  // Update component backgrounds from 900 to 950, and 950 to 900 if they need to be slightly elevated. 
  // Wait, if bg is black, then cards should be neutral-950 (or neutral-900).
  // Currently cards are `bg-neutral-900 border-neutral-800/80`
  // Let's change them to `bg-neutral-950 border-neutral-900`
  
  content = content.replace(/bg-neutral-900/g, 'bg-neutral-950');
  content = content.replace(/border-neutral-800/g, 'border-neutral-900');
  
  // But some things might be bg-neutral-950 and we want to leave them or make them black?
  // Let's just do a targeted replacement for cards if we can.
  // The simplest is to replace bg-neutral-900 with bg-neutral-950 and border-800 with border-900 globally, 
  // and the main bg will be black.
  
  fs.writeFileSync(file, content);
  console.log(`Updated dark mode in ${file}`);
}

const glob = require('fs').readdirSync('src/components');
glob.forEach(file => {
  if (file.endsWith('.tsx')) {
    replaceAll(`src/components/${file}`);
  }
});
replaceAll('src/App.tsx');

