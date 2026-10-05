import React, { useState, useEffect } from 'react';
import { Wallet, Transaction, WalletType } from '../types';
import DynamicIcon from './DynamicIcon';
import BankLogo, { BANK_PRESETS } from './BankLogo';
import TransactionItem from './TransactionItem';

interface WalletDetailsProps {
  wallet: Wallet;
  transactions: Transaction[];
  wallets: Wallet[];
  onBack: () => void;
  onAddTransactionClick: (walletId: string) => void;
  onDeleteWallet: (walletId: string) => void;
  onEditWallet: (
    walletId: string,
    updatedName: string,
    updatedDesc: string,
    updatedColor: string,
    updatedIcon: string,
    updatedCurrency: 'PHP' | 'USD',
    updatedType: WalletType,
    updatedBalance?: number,
    updatedImage?: string
  ) => void;
  themeMode?: 'light' | 'dark';
}

const COLOR_PRESETS = [
  { name: 'Teal Forest', value: 'teal', hex: '#14b8a6' },
  { name: 'Maya Purple', value: 'purple', hex: '#a855f7' },
  { name: 'GCash Blue', value: 'blue', hex: '#2563eb' },
  { name: 'Crimson Slate', value: 'red', hex: '#e11d48' },
  { name: 'Sunset Bronze', value: 'amber', hex: '#f59e0b' },
  { name: 'Rose Petal', value: 'pink', hex: '#ec4899' },
  { name: 'Obsidian Black', value: 'slate', hex: '#475569' },
];

const ICON_PRESETS = [
  'Wallet', 'Coins', 'Smartphone', 'Landmark', 'CreditCard', 'PiggyBank', 'Briefcase', 'Shield', 'Activity', 'Sparkles'
];

const getColorTheme = (colorClass: string, isDark: boolean) => {
  const c = colorClass.toLowerCase();
  if (c.includes('blue')) {
    return {
      bg: isDark ? 'bg-blue-950/40 border border-blue-900/30' : 'bg-blue-500/10',
      text: isDark ? 'text-blue-400 font-bold' : 'text-blue-600',
    };
  }
  if (c.includes('indigo') || c.includes('purple')) {
    return {
      bg: isDark ? 'bg-indigo-950/40 border border-indigo-900/30' : 'bg-indigo-500/10',
      text: isDark ? 'text-indigo-400' : 'text-indigo-600',
    };
  }
  if (c.includes('emerald') || c.includes('teal')) {
    return {
      bg: isDark ? 'bg-emerald-950/40 border border-emerald-900/30' : 'bg-emerald-500/10',
      text: isDark ? 'text-emerald-400 font-bold' : 'text-emerald-600',
    };
  }
  if (c.includes('orange') || c.includes('amber')) {
    return {
      bg: isDark ? 'bg-amber-950/40 border border-amber-900/30' : 'bg-orange-500/10',
      text: isDark ? 'text-amber-400' : 'text-orange-600',
    };
  }
  if (c.includes('rose') || c.includes('pink') || c.includes('red')) {
    return {
      bg: isDark ? 'bg-rose-950/40 border border-rose-900/30' : 'bg-rose-500/10',
      text: isDark ? 'text-rose-400' : 'text-rose-600',
    };
  }
  return {
    bg: isDark ? 'bg-neutral-800' : 'bg-neutral-500/10',
    text: isDark ? 'text-neutral-300' : 'text-neutral-600',
  };
};

export default function WalletDetails({
  wallet,
  transactions,
  wallets,
  onBack,
  onAddTransactionClick,
  onDeleteWallet,
  onEditWallet,
  themeMode = 'light',
}: WalletDetailsProps) {
  const isDark = themeMode === 'dark';
  const [isEditing, setIsEditing] = useState(false);

  // Form Fields
  const [editName, setEditName] = useState(wallet.name);
  const [editDesc, setEditDesc] = useState(wallet.description || '');
  const [editColor, setEditColor] = useState(wallet.color);
  const [editIcon, setEditIcon] = useState(wallet.icon);
  const [editCurrency, setEditCurrency] = useState<'PHP' | 'USD'>(wallet.currency || 'PHP');
  const [editType, setEditType] = useState<WalletType>(wallet.type || 'wallet');
  const [editBalance, setEditBalance] = useState<number>(wallet.balance);

  // Custom Image support in editing
  const [editAvatarMode, setEditAvatarMode] = useState<'icon' | 'image'>(wallet.image ? 'image' : 'icon');
  const [editSelectedImage, setEditSelectedImage] = useState<string>(wallet.image || '');
  const [editCustomImageUrl, setEditCustomImageUrl] = useState<string>('');

  // Keep fields synchronized if wallet changes
  useEffect(() => {
    setEditName(wallet.name);
    setEditDesc(wallet.description || '');
    setEditColor(wallet.color);
    setEditIcon(wallet.icon);
    setEditCurrency(wallet.currency || 'PHP');
    setEditType(wallet.type || 'wallet');
    setEditBalance(wallet.balance);
    setEditAvatarMode(wallet.image ? 'image' : 'icon');
    setEditSelectedImage(wallet.image || '');
    setEditCustomImageUrl('');
  }, [wallet]);

  const detailsTheme = getColorTheme(wallet.color, isDark);

  // Filter transactions for this wallet
  const walletTransactions = transactions.filter(
    (t) => t.walletId === wallet.id || t.toWalletId === wallet.id
  );

  const formatCurrency = (value: number, currency?: 'PHP' | 'USD') => {
    const safeCurrency = currency || 'PHP';
    return new Intl.NumberFormat(safeCurrency === 'USD' ? 'en-US' : 'en-PH', {
      style: 'currency',
      currency: safeCurrency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const handleSaveEdit = () => {
    if (!editName.trim()) return;

    const finalImage = editAvatarMode === 'image'
      ? (editCustomImageUrl.trim() || editSelectedImage || undefined)
      : undefined;

    const balanceHasChanged = editBalance !== wallet.balance;

    onEditWallet(
      wallet.id,
      editName.trim(),
      editDesc.trim(),
      editColor,
      editIcon,
      editCurrency,
      editType,
      balanceHasChanged ? editBalance : undefined,
      finalImage
    );
    setIsEditing(false);
  };

  return (
    <div className={`flex flex-col h-full ${isDark ? 'bg-neutral-900 text-white' : 'bg-neutral-50/50 text-neutral-800'}`} id={`wallet-details-${wallet.id}`}>
      {/* Detail Header / Action bar */}
      <div className={`flex items-center justify-between border-b px-5 py-4 shrink-0 ${
        isDark ? 'bg-neutral-900 border-neutral-800/80' : 'bg-white border-neutral-100'
      }`}>
        <button
          onClick={onBack}
          className={`flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest transition-colors cursor-pointer ${
            isDark ? 'text-neutral-400 hover:text-white' : 'text-neutral-400 hover:text-neutral-800'
          }`}
        >
          <DynamicIcon name="ChevronLeft" size={14} />
          Back
        </button>

        <div className="flex gap-1.5">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`rounded-xl p-2 transition-all cursor-pointer ${
              isDark ? 'text-neutral-400 hover:bg-neutral-800 hover:text-white' : 'text-neutral-400 hover:bg-neutral-500/10 hover:text-neutral-800'
            }`}
            title="Edit Wallet Info"
          >
            <DynamicIcon name={isEditing ? 'X' : 'Edit3'} size={15} />
          </button>
          
          <button
            onClick={() => {
              if (confirm(`Are you sure you want to delete ${wallet.name}? All history will remain on dashboard.`)) {
                onDeleteWallet(wallet.id);
              }
            }}
            className={`rounded-xl p-2 transition-all cursor-pointer ${
              isDark ? 'text-rose-400 hover:bg-rose-950/40 hover:text-rose-300' : 'text-neutral-400 hover:bg-rose-500/10 hover:text-rose-600'
            }`}
            title="Delete Wallet"
          >
            <DynamicIcon name="Trash2" size={15} />
          </button>
        </div>
      </div>

      {/* Detail Body */}
      <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-6 pb-32 space-y-6">
        {/* Editing state or Main Card display */}
        {isEditing ? (
          <div className={`border rounded-2xl p-5 space-y-4 shadow-sm ${
            isDark ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-neutral-100'
          }`}>
            <h3 className={`text-xs font-bold uppercase tracking-widest ${isDark ? 'text-neutral-300' : 'text-neutral-400'}`}>Edit Wallet Details</h3>
            
            {/* Account Balance Editor (Always editable, at the very top!) */}
            <div>
              <label className="block text-xs font-bold text-neutral-400 mb-1 uppercase tracking-wider">Account Balance ({editCurrency})</label>
              <input
                type="number"
                step="any"
                value={editBalance}
                onChange={(e) => setEditBalance(Number(e.target.value) || 0)}
                className={`w-full text-xs rounded-xl border px-3.5 py-2.5 focus:outline-none focus:ring-1 focus:ring-blue-500 font-bold font-mono ${
                  isDark ? 'bg-neutral-900 border-neutral-800 text-white' : 'bg-neutral-50 border-neutral-200/60 text-neutral-800'
                }`}
              />
              <p className="text-xs text-neutral-400 mt-1">Editing the balance will automatically log a balance adjustment transaction in your history.</p>
            </div>

            {/* Currency Choice */}
            <div>
              <label className="block text-xs font-bold text-neutral-400 mb-1 uppercase tracking-wider">Currency</label>
              <div className="grid grid-cols-2 gap-2">
                {(['PHP', 'USD'] as const).map((curr) => (
                  <button
                    key={curr}
                    type="button"
                    onClick={() => setEditCurrency(curr)}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all text-center cursor-pointer ${
                      editCurrency === curr
                        ? 'bg-blue-600 text-white border-blue-600'
                        : isDark
                        ? 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:bg-neutral-800'
                        : 'bg-neutral-50 text-neutral-500 border-neutral-200 hover:bg-neutral-500/10'
                    }`}
                  >
                    {curr === 'PHP' ? 'PHP (₱)' : 'USD ($)'}
                  </button>
                ))}
              </div>
            </div>

            {/* Account Type Option */}
            <div>
              <label className="block text-xs font-bold text-neutral-400 mb-1 uppercase tracking-wider">Account Type</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                {(['wallet', 'savings', 'investment', 'others'] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setEditType(t)}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all text-center capitalize cursor-pointer ${
                      editType === t
                        ? 'bg-blue-600 text-white border-blue-600'
                        : isDark
                        ? 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:bg-neutral-800'
                        : 'bg-neutral-50 text-neutral-500 border-neutral-200 hover:bg-neutral-500/10'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-400 mb-1 uppercase tracking-wider">Account Name</label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className={`w-full text-xs rounded-xl border px-3.5 py-2.5 focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                  isDark ? 'bg-neutral-900 border-neutral-800 text-white' : 'bg-neutral-50 border-neutral-200/60 text-neutral-800'
                }`}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-400 mb-1 uppercase tracking-wider">Description (Optional)</label>
              <input
                type="text"
                value={editDesc}
                onChange={(e) => setEditDesc(e.target.value)}
                className={`w-full text-xs rounded-xl border px-3.5 py-2.5 focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                  isDark ? 'bg-neutral-900 border-neutral-800 text-white' : 'bg-neutral-50 border-neutral-200/60 text-neutral-800'
                }`}
                placeholder="Leave blank for none"
              />
            </div>

            {/* Color Accent Selector */}
            <div>
              <label className="block text-xs font-bold text-neutral-400 mb-1.5 uppercase tracking-wider">Accent Color</label>
              <div className="flex flex-wrap gap-2">
                {COLOR_PRESETS.map((color) => (
                  <button
                    key={color.name}
                    type="button"
                    onClick={() => setEditColor(color.value)}
                    className={`h-7 w-7 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                      editColor === color.value ? 'ring-2 ring-blue-500 scale-110' : 'hover:scale-105'
                    }`}
                    style={{
                      backgroundColor: color.hex
                    }}
                    title={color.name}
                  >
                    {editColor === color.value && (
                      <DynamicIcon name="Check" className="text-white drop-shadow-xs" size={14} />
                    )}
                  </button>
                ))}
              </div>
            </div>            {/* Avatar Visual Type Selection (Icon vs Image) */}
            <div>
              <label className="block text-xs font-bold text-neutral-400 mb-1.5 uppercase tracking-wider">
                Account Visual Style
              </label>
              <div className={`p-1 rounded-xl flex border transition-all ${
                isDark ? 'bg-neutral-900 border-neutral-800' : 'bg-neutral-500/10 border-neutral-200'
              }`}>
                <button
                  type="button"
                  onClick={() => setEditAvatarMode('icon')}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    editAvatarMode === 'icon'
                      ? isDark ? 'bg-neutral-900 text-blue-400 font-extrabold border border-neutral-800' : 'bg-white text-blue-600 shadow-xs font-extrabold border border-neutral-200'
                      : isDark ? 'text-neutral-400 hover:text-neutral-200' : 'text-neutral-500 hover:text-neutral-700'
                  }`}
                >
                  <DynamicIcon name="Sparkles" size={13} />
                  Lucide Icon
                </button>
                <button
                  type="button"
                  onClick={() => setEditAvatarMode('image')}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    editAvatarMode === 'image'
                      ? isDark ? 'bg-neutral-900 text-blue-400 font-extrabold border border-neutral-800' : 'bg-white text-blue-600 shadow-xs font-extrabold border border-neutral-200'
                      : isDark ? 'text-neutral-400 hover:text-neutral-200' : 'text-neutral-500 hover:text-neutral-700'
                  }`}
                >
                  <DynamicIcon name="Image" size={13} />
                  Custom Image
                </button>
              </div>
            </div>

            {editAvatarMode === 'icon' ? (
              /* Icon Selector */
              <div>
                <label className="block text-xs font-bold text-neutral-400 mb-1.5 uppercase tracking-wider">Account Icon</label>
                <div className="grid grid-cols-5 gap-1.5">
                  {ICON_PRESETS.map((iconName) => (
                    <button
                      key={iconName}
                      type="button"
                      onClick={() => setEditIcon(iconName)}
                      className={`h-9 rounded-xl flex items-center justify-center border transition-all cursor-pointer ${
                        editIcon === iconName
                          ? 'bg-blue-600 text-white border-blue-600'
                          : isDark
                          ? 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:bg-neutral-800'
                          : 'bg-neutral-50 text-neutral-400 border-neutral-200/50 hover:bg-neutral-500/10/50'
                      }`}
                    >
                      <DynamicIcon name={iconName} size={15} />
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              /* Image Options */
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-400 mb-1.5 uppercase tracking-wider">
                    Select Local Image
                  </label>
                  <div className={`border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-all ${
                    editSelectedImage 
                      ? 'border-blue-500 bg-blue-500/100/5' 
                      : isDark ? 'border-neutral-800 hover:border-neutral-700 bg-neutral-900/50' : 'border-neutral-200 hover:border-neutral-300 bg-neutral-50'
                  }`}>
                    <input
                      type="file"
                      accept="image/*"
                      id="edit-local-image-upload"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setEditSelectedImage(reader.result as string);
                            setEditCustomImageUrl('');
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                    <label htmlFor="edit-local-image-upload" className="cursor-pointer flex flex-col items-center justify-center gap-2">
                      {editSelectedImage ? (
                        <div className="relative group">
                          <img
                            src={editSelectedImage}
                            alt="Uploaded"
                            className="h-16 w-16 rounded-xl object-cover border border-neutral-300 dark:border-neutral-850"
                          />
                          <div className="absolute inset-0 bg-black/40 rounded-xl opacity-0 group-hover:opacity-100 flex items-center justify-center text-xs text-white font-bold transition-opacity">
                            Change
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center gap-1 text-neutral-400">
                          <DynamicIcon name="Upload" size={20} className="text-blue-500" />
                          <span className="text-xs font-bold">Upload local image</span>
                          <span className="text-xs text-neutral-500">Supports PNG, JPG, GIF</span>
                        </div>
                      )}
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-400 mb-1.5 uppercase tracking-wider">
                    Or Paste Custom Image URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://example.com/your-image.png"
                    value={editCustomImageUrl}
                    onChange={(e) => setEditCustomImageUrl(e.target.value)}
                    className={`w-full rounded-xl border px-3.5 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                      isDark
                        ? 'bg-neutral-900 border-neutral-800 text-white placeholder-neutral-650'
                        : 'bg-neutral-50 border-neutral-200 text-neutral-800 placeholder-neutral-400'
                    }`}
                  />
                  {editCustomImageUrl.trim() && (
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-xs text-neutral-400">Preview:</span>
                      <div className="h-8 w-8 rounded-lg overflow-hidden border border-neutral-200 dark:border-neutral-800">
                        <img
                          src={editCustomImageUrl}
                          alt="Preview"
                          className="h-full w-full object-cover"
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://picsum.photos/seed/fallback/150/150';
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className={`flex-1 py-2.5 px-3 text-xs font-semibold rounded-xl border cursor-pointer transition-colors ${
                  isDark ? 'bg-neutral-900 border-neutral-800 hover:bg-neutral-800 text-neutral-400' : 'bg-white border-neutral-200 hover:bg-neutral-500/10 text-neutral-500'
                }`}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveEdit}
                className="flex-1 py-2.5 px-3 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors cursor-pointer"
              >
                Save
              </button>
            </div>
          </div>
        ) : (
          /* Sleek borderless centered header and details visualization */
          <div className={`text-center py-8 shrink-0 border rounded-2xl p-6 shadow-xs ${
            isDark ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-neutral-100'
          }`}>
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl overflow-hidden mb-3 bg-neutral-500/10 dark:bg-neutral-850 border border-neutral-200/40 dark:border-neutral-800/40">
              {wallet.image ? (
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
                <div className={`flex h-full w-full items-center justify-center ${detailsTheme.bg}`}>
                  <DynamicIcon name={wallet.icon} className={detailsTheme.text} size={24} />
                </div>
              )}
            </div>
            <h2 className={`font-sans font-black tracking-tight text-xs ${isDark ? 'text-neutral-100' : 'text-neutral-800'}`}>{wallet.name}</h2>
            {wallet.description && (
              <p className={`text-xs mt-1 ${isDark ? 'text-neutral-400' : 'text-neutral-400'}`}>{wallet.description}</p>
            )}
            <p className={`font-sans text-3xl font-black tracking-tight mt-4 ${isDark ? 'text-neutral-50' : 'text-neutral-950'}`}>
              {formatCurrency(wallet.balance, wallet.currency || 'PHP')}
            </p>
            <div className={`inline-flex mt-3 rounded-full px-3 py-1 text-xs font-extrabold uppercase tracking-widest ${
              isDark ? 'bg-neutral-900 text-neutral-400 border border-neutral-800' : 'bg-neutral-500/10 text-neutral-500'
            }`}>
              {wallet.type.replace('_', ' ')} • {wallet.currency || 'PHP'}
            </div>

            {/* Fixed Rate Conversion Text strictly ONLY inside USD wallets */}
            {wallet.currency === 'USD' && (
              <p className={`text-xs mt-3 font-mono uppercase tracking-wider font-bold ${
                isDark ? 'text-blue-400/80' : 'text-blue-600/80'
              }`}>
                * Conversion rate: $1 USD = ₱58.5 PHP
              </p>
            )}
          </div>
        )}

        
        {!isEditing && (
          <>
            <div className="shrink-0">
              <button
                onClick={() => onAddTransactionClick(wallet.id)}
                className="w-full py-3.5 px-4 rounded-xl bg-blue-600 text-white font-bold uppercase text-sm tracking-widest hover:bg-blue-700 active:scale-98 transition-all shadow-md shadow-blue-500/10 flex items-center justify-center gap-2 cursor-pointer"
              >
                <DynamicIcon name="PlusCircle" size={13} />
                Record Transaction
              </button>
            </div>
            {/* Wallet specific Transactions */}
            <div className="space-y-4">
              <h4 className={`font-sans font-bold text-xs uppercase tracking-widest flex items-center gap-2 ${
                isDark ? 'text-neutral-400' : 'text-neutral-400'
              }`}>
                <DynamicIcon name="History" size={14} />
                Account Activity
              </h4>
              {walletTransactions.length === 0 ? (
                <div className={`text-center py-10 rounded-2xl border border-dashed text-xs font-medium ${
                  isDark ? 'bg-neutral-900 border-neutral-800 text-neutral-500' : 'bg-white border-neutral-200 text-neutral-400'
                }`}>
                  No transactions registered for this wallet.
                </div>
              ) : (
                <div className="flex flex-col gap-2.5">
                  {walletTransactions
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .map((tx) => (
                      <TransactionItem key={tx.id} transaction={tx} wallets={wallets} themeMode={themeMode} />
                    ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}