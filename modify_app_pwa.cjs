const fs = require('fs');

let app = fs.readFileSync('src/App.tsx', 'utf8');

if (!app.includes('PWAInstallButton')) {
  app = app.replace("import SettingsModal from './components/SettingsModal';", "import SettingsModal from './components/SettingsModal';\nimport { PWAInstallButton } from './components/PWAInstallButton';");

  app = app.replace(
    '<h1 className="text-xl font-bold tracking-tight">Finances</h1>',
    `<h1 className="text-xl font-bold tracking-tight">Finances</h1>\n              <div className="ml-auto">\n                <PWAInstallButton themeMode={themeMode} />\n              </div>`
  );

  fs.writeFileSync('src/App.tsx', app);
  console.log("App.tsx modified for PWAInstallButton");
}
