const fs = require('fs');
let app = fs.readFileSync('src/App.tsx', 'utf8');

const themeEffect = `  const isDark = themeMode === 'dark';

  useEffect(() => {
    let metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', isDark ? '#020617' : '#f8fafc');
    }
  }, [isDark]);
`;

app = app.replace("  const isDark = themeMode === 'dark';", themeEffect);

fs.writeFileSync('src/App.tsx', app);
console.log("App.tsx fixed");
