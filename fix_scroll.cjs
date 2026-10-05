const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const effectCode = `
  useEffect(() => {
    if (isAddWalletOpen || isAddTxOpen || isAddDebtOpen || isSettingsOpen || selectedWallet) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isAddWalletOpen, isAddTxOpen, isAddDebtOpen, isSettingsOpen, selectedWallet]);

  return (
`;

code = code.replace("  return (", effectCode);
fs.writeFileSync('src/App.tsx', code);
console.log('Fixed scroll locking');
