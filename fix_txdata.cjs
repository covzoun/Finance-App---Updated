const fs = require('fs');

let txModal = fs.readFileSync('src/components/AddTransactionModal.tsx', 'utf8');

txModal = txModal.replace(
  '      ...(type === \'transfer\' ? { toWalletId } : {}),\n    };',
  '      ...(type === \'transfer\' ? { toWalletId } : {}),\n      isRecurring,\n    };'
);

// We should also set isRecurring initially if editingTransaction
txModal = txModal.replace(
  '  const [description, setDescription] = useState(\'\');\n  const [isRecurring, setIsRecurring] = useState(false);',
  '  const [description, setDescription] = useState(\'\');\n  const [isRecurring, setIsRecurring] = useState(false);\n\n  useEffect(() => {\n    if (editingTransaction) {\n      setIsRecurring(!!editingTransaction.isRecurring);\n    }\n  }, [editingTransaction]);'
);

fs.writeFileSync('src/components/AddTransactionModal.tsx', txModal);
