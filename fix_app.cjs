const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const targetToReplace = `    useEffect(() => {
    if (isAddWalletOpen || isAddTxOpen || isAddDebtOpen || isSettingsOpen || selectedWallet) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isAddWalletOpen, isAddTxOpen, isAddDebtOpen, isSettingsOpen, selectedWallet]);

  return (localStorage.getItem('dw_theme') as 'light' | 'dark') || 'light';
  });`;

const replacement = `    return (localStorage.getItem('dw_theme') as 'light' | 'dark') || 'light';
  });`;

code = code.replace(targetToReplace, replacement);

const insertTarget = `  const [currentTime, setCurrentTime] = useState(new Date());`;
const insertReplacement = `  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    if (isAddWalletOpen || isAddTxOpen || isAddDebtOpen || isSettingsOpen || selectedWallet) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isAddWalletOpen, isAddTxOpen, isAddDebtOpen, isSettingsOpen, selectedWallet]);`;

code = code.replace(insertTarget, insertReplacement);

fs.writeFileSync('src/App.tsx', code);
console.log('Fixed App.tsx order');
