const fs = require('fs');
let content = fs.readFileSync('src/components/WalletDetails.tsx', 'utf8');

if (!content.includes('BankLogo')) {
  content = content.replace(
    "import DynamicIcon from './DynamicIcon';",
    "import DynamicIcon from './DynamicIcon';\nimport BankLogo, { BANK_PRESETS } from './BankLogo';"
  );

  const iconRenderOld = `{wallet.image ? (
                <img
                  src={wallet.image}
                  alt={wallet.name}
                  className="h-full w-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className={\`flex h-full w-full items-center justify-center \${detailsTheme.bg}\`}>
                  <DynamicIcon name={wallet.icon} className={detailsTheme.text} size={24} />
                </div>
              )}`;

  const iconRenderNew = `{wallet.image ? (
                <img
                  src={wallet.image}
                  alt={wallet.name}
                  className="h-full w-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : wallet.icon?.startsWith('bank:') ? (
                <div 
                  className="flex h-full w-full items-center justify-center" 
                  style={{ backgroundColor: BANK_PRESETS.find(p => p.id === wallet.icon.replace('bank:', ''))?.color || '#000' }}
                >
                  <BankLogo bank={wallet.icon.replace('bank:', '')} size={32} />
                </div>
              ) : (
                <div className={\`flex h-full w-full items-center justify-center \${detailsTheme.bg}\`}>
                  <DynamicIcon name={wallet.icon} className={detailsTheme.text} size={24} />
                </div>
              )}`;

  content = content.replace(iconRenderOld, iconRenderNew);
  fs.writeFileSync('src/components/WalletDetails.tsx', content);
  console.log("WalletDetails updated");
}
