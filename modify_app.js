const fs = require('fs');

let app = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Add state for lastBackupDate
app = app.replace(
  "const [themeMode, setThemeMode] = useState<'light' | 'dark'>(() => {",
  `const [lastBackupDate, setLastBackupDate] = useState<string | null>(() => {
    return localStorage.getItem('dw_last_backup') || null;
  });

  const [themeMode, setThemeMode] = useState<'light' | 'dark'>(() => {`
);

// 2. Add Backup banner below header
const bannerUI = `
          {/* Backup Reminder Banner */}
          {wallets.length > 0 && (!lastBackupDate || (Date.now() - new Date(lastBackupDate).getTime() > 30 * 24 * 60 * 60 * 1000)) && (
            <div className={\`mx-6 mt-6 px-4 py-3 rounded-2xl flex items-center justify-between shadow-sm border \${
              isDark ? 'bg-amber-950/20 border-amber-900/40 text-amber-500' : 'bg-amber-50 border-amber-200 text-amber-700'
            }\`}>
              <div className="flex items-center gap-3">
                <DynamicIcon name="Save" size={18} />
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider">Backup Recommended</p>
                  <p className="text-[10px] mt-0.5 opacity-80">You haven't backed up your data recently.</p>
                </div>
              </div>
              <button 
                onClick={() => setIsSettingsOpen(true)}
                className={\`px-3 py-1.5 rounded-xl text-[10px] font-extrabold uppercase tracking-widest cursor-pointer transition-all \${
                  isDark ? 'bg-amber-900/50 hover:bg-amber-800 text-amber-200' : 'bg-amber-200 hover:bg-amber-300 text-amber-900'
                }\`}
              >
                Go to Backup
              </button>
            </div>
          )}
          
          {/*`;

app = app.replace("{/*", bannerUI);

// Fix the replace so it specifically targets the first `{/*` after header...
// Actually let's use a regex to inject it right after `</header>`.
app = app.replace("</header>", "</header>\n" + bannerUI);

// Wait, the previous replace `{/*` might have messed up something. Let's revert and do it right.
