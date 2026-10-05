const fs = require('fs');

let content = fs.readFileSync('src/components/AddWalletModal.tsx', 'utf8');

// 1. Add BankLogo import
content = content.replace(
  "import DynamicIcon from './DynamicIcon';",
  "import DynamicIcon from './DynamicIcon';\nimport BankLogo, { BANK_PRESETS } from './BankLogo';"
);

// 2. Add 'bank' to avatarMode state if it exists, wait...
content = content.replace(
  "const [avatarMode, setAvatarMode] = useState<'icon' | 'image'>('icon');",
  "const [avatarMode, setAvatarMode] = useState<'icon' | 'image' | 'bank'>('bank');"
);

// 3. Update the avatarMode toggle UI
const avatarModeHtml = `
            <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-2">
              Account Visual Style
            </label>
            <div className={\`p-1 rounded-xl flex border transition-all \${
              isDark ? 'bg-neutral-900 border-neutral-800' : 'bg-neutral-100 border-neutral-200'
            }\`}>
              <button
                type="button"
                onClick={() => setAvatarMode('bank')}
                className={\`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer \${
                  avatarMode === 'bank'
                    ? isDark ? 'bg-neutral-950 text-blue-400 font-extrabold border border-neutral-800' : 'bg-white text-blue-600 shadow-xs font-extrabold border border-neutral-200'
                    : isDark ? 'text-neutral-400 hover:text-neutral-200' : 'text-neutral-500 hover:text-neutral-700'
                }\`}
              >
                <DynamicIcon name="Landmark" size={13} />
                PH Banks
              </button>
              <button
                type="button"
                onClick={() => setAvatarMode('icon')}
                className={\`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer \${
                  avatarMode === 'icon'
                    ? isDark ? 'bg-neutral-950 text-blue-400 font-extrabold border border-neutral-800' : 'bg-white text-blue-600 shadow-xs font-extrabold border border-neutral-200'
                    : isDark ? 'text-neutral-400 hover:text-neutral-200' : 'text-neutral-500 hover:text-neutral-700'
                }\`}
              >
                <DynamicIcon name="Sparkles" size={13} />
                Icon
              </button>
              <button
                type="button"
                onClick={() => setAvatarMode('image')}
                className={\`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer \${
                  avatarMode === 'image'
                    ? isDark ? 'bg-neutral-950 text-blue-400 font-extrabold border border-neutral-800' : 'bg-white text-blue-600 shadow-xs font-extrabold border border-neutral-200'
                    : isDark ? 'text-neutral-400 hover:text-neutral-200' : 'text-neutral-500 hover:text-neutral-700'
                }\`}
              >
                <DynamicIcon name="Image" size={13} />
                Image
              </button>
            </div>
          </div>
          {avatarMode === 'bank' ? (
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-2">
                  Select Bank / E-Wallet
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {BANK_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => {
                        setSelectedIcon('bank:' + preset.id);
                        setName(preset.name);
                      }}
                      className={\`h-10 rounded-xl flex items-center justify-center border transition-all cursor-pointer \${
                        selectedIcon === 'bank:' + preset.id
                          ? 'border-blue-600 shadow-sm'
                          : isDark
                          ? 'bg-neutral-900 border-neutral-800 hover:bg-neutral-800'
                          : 'bg-neutral-50 border-neutral-200/50 hover:bg-neutral-100/50'
                      }\`}
                      style={{ backgroundColor: selectedIcon === 'bank:' + preset.id ? preset.color : undefined }}
                      title={preset.name}
                    >
                      <div className={selectedIcon === 'bank:' + preset.id ? 'opacity-100' : isDark ? 'opacity-50' : 'opacity-40 brightness-0 invert-0'}>
                         {/* We render it slightly faded if not selected, but wait, BankLogo returns white SVGs.
                             In light mode, unselected white SVG on white bg is invisible. Let's wrap it in a colored container. */}
                        <div className="w-6 h-6 rounded-full overflow-hidden flex items-center justify-center" style={{ backgroundColor: preset.color }}>
                          <BankLogo bank={preset.id} size={16} />
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : avatarMode === 'icon' ? (`

// We need to replace the old block with this new block.
content = content.replace(
  /<label className="block text-\[10px\] font-bold text-neutral-400 uppercase tracking-widest mb-2">\s*Account Visual Style\s*<\/label>[\s\S]*?\{avatarMode === 'icon' \? \(/,
  avatarModeHtml
);

fs.writeFileSync('src/components/AddWalletModal.tsx', content);
console.log("AddWalletModal updated for PH Banks");
