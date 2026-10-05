import React, { useState } from 'react';
import { Wallet, WalletType } from '../types';
import DynamicIcon from './DynamicIcon';
import BankLogo, { BANK_PRESETS } from './BankLogo';

interface AddWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (wallet: Wallet) => void;
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

type TemplateType = 'cash' | 'bank' | 'custom';

export default function AddWalletModal({ isOpen, onClose, onAdd, themeMode = 'light' }: AddWalletModalProps) {
  const isDark = themeMode === 'dark';
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [template, setTemplate] = useState<TemplateType>('custom');
  const [type, setType] = useState<WalletType>('wallet');
  const [currency, setCurrency] = useState<'PHP' | 'USD'>('PHP');
  const [initialBalance, setInitialBalance] = useState('');
  
  // Customization
  const [selectedColor, setSelectedColor] = useState(COLOR_PRESETS[0].value);
  const [selectedIcon, setSelectedIcon] = useState(ICON_PRESETS[0]);

  // Image Feature states
  const [avatarMode, setAvatarMode] = useState<'icon' | 'image' | 'bank'>('bank');
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [customImageUrl, setCustomImageUrl] = useState<string>('');

  if (!isOpen) return null;

  // Sync details based on templates selected: Cash, Bank, or Custom
  const handleTemplateChange = (temp: TemplateType) => {
    setTemplate(temp);
    if (temp === 'cash') {
      setName('Cash on Hand');
      setType('wallet');
      setSelectedColor('teal');
      setSelectedIcon('Coins');
    } else if (temp === 'bank') {
      setName('Bank Account');
      setType('savings');
      setSelectedColor('blue');
      setSelectedIcon('Landmark');
    } else {
      setName('');
      setType('wallet');
      setSelectedColor(COLOR_PRESETS[0].value);
      setSelectedIcon(ICON_PRESETS[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const finalBalance = parseFloat(initialBalance) || 0;
    const finalImage = avatarMode === 'image' 
      ? (customImageUrl.trim() || selectedImage || undefined)
      : undefined;

    const newWallet: Wallet = {
      id: `w-${Date.now()}`,
      name: name.trim(),
      description: description.trim() ? description.trim() : undefined,
      type,
      currency,
      balance: finalBalance,
      icon: selectedIcon,
      color: selectedColor,
      image: finalImage,
      createdAt: new Date().toISOString(),
    };

    onAdd(newWallet);
    
    // Reset form
    setName('');
    setDescription('');
    setTemplate('custom');
    setType('wallet');
    setCurrency('PHP');
    setInitialBalance('');
    setSelectedColor(COLOR_PRESETS[0].value);
    setSelectedIcon(ICON_PRESETS[0]);
    setAvatarMode('icon');
    setSelectedImage('');
    setCustomImageUrl('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4 backdrop-blur-xs">
      {/* Background click close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal Card */}
      <div className={`relative w-full sm:max-w-md border-t sm:border rounded-t-[32px] sm:rounded-[32px] shadow-2xl overflow-hidden max-h-[92vh] flex flex-col transition-all transform duration-300 ${
        isDark ? 'bg-neutral-950 border-neutral-900 text-white' : 'bg-white border-neutral-100 text-neutral-850'
      }`}>
        
        {/* Header */}
        <div className={`flex items-center justify-between border-b px-6 py-4 shrink-0 transition-colors ${
          isDark ? 'border-neutral-900 bg-neutral-950 text-white' : 'border-neutral-100 bg-white text-neutral-800'
        }`}>
          <div className="flex items-center gap-2">
            <DynamicIcon name="PlusCircle" className="text-blue-500" size={18} />
            <h2 className="font-sans font-black text-xs uppercase tracking-wider">Add New Account</h2>
          </div>
          <button
            onClick={onClose}
            className={`rounded-full p-1.5 transition-colors cursor-pointer ${
              isDark ? 'text-neutral-400 hover:bg-neutral-800 hover:text-white' : 'text-neutral-400 hover:bg-neutral-50 hover:text-neutral-800'
            }`}
          >
            <DynamicIcon name="X" size={16} />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className={`overflow-y-auto overscroll-contain px-6 py-5 flex-1 space-y-5 transition-colors ${
          isDark ? 'bg-neutral-950 text-white' : 'bg-white text-neutral-800'
        }`}>
          {/* Balance Input (At the very top!) */}
          <div>
            <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1.5">
              Initial Balance ({currency})
            </label>
            <div className="relative">
              <span className="absolute left-4 top-3 text-xs text-neutral-400 font-bold">
                {currency === 'USD' ? '$' : '₱'}
              </span>
              <input
                type="number"
                placeholder="0.00"
                step="any"
                value={initialBalance}
                onChange={(e) => setInitialBalance(e.target.value)}
                className={`w-full rounded-xl border pl-8 pr-4 py-2.5 text-xs font-bold focus:outline-none ${
                  isDark ? 'bg-neutral-950 border-neutral-900 text-white focus:ring-blue-500' : 'bg-neutral-50 border-neutral-200 text-neutral-800 focus:ring-neutral-450'
                }`}
              />
            </div>
          </div>

          {/* Templates */}
          <div>
            <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-2">
              Template
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['cash', 'bank', 'custom'] as TemplateType[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => handleTemplateChange(t)}
                  className={`py-2 px-1 rounded-xl text-xs font-bold border transition-all text-center capitalize cursor-pointer ${
                    template === t
                      ? 'bg-blue-600 text-white border-blue-600 font-extrabold shadow-sm'
                      : isDark
                      ? 'bg-neutral-950 text-neutral-400 border-neutral-900 hover:bg-neutral-800'
                      : 'bg-neutral-50 text-neutral-500 border-neutral-200/50 hover:bg-neutral-100/50'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Account Types */}
          <div>
            <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-2">
              Account Type
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {(['wallet', 'savings', 'investment', 'others'] as WalletType[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className={`py-2 px-1 rounded-xl text-xs font-bold border transition-all text-center capitalize cursor-pointer ${
                    type === t
                      ? 'bg-blue-600 text-white border-blue-600 font-extrabold shadow-sm'
                      : isDark
                      ? 'bg-neutral-950 text-neutral-400 border-neutral-900 hover:bg-neutral-800'
                      : 'bg-neutral-50 text-neutral-500 border-neutral-200/50 hover:bg-neutral-100/50'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Account Currency */}
          <div>
            <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-2">
              Currency
            </label>
            <div className="grid grid-cols-2 gap-3">
              {(['PHP', 'USD'] as const).map((curr) => (
                <button
                  key={curr}
                  type="button"
                  onClick={() => setCurrency(curr)}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all text-center cursor-pointer ${
                    currency === curr
                      ? 'bg-blue-600 text-white border-blue-600'
                      : isDark
                      ? 'bg-neutral-950 text-neutral-400 border-neutral-900 hover:bg-neutral-800'
                      : 'bg-neutral-50 text-neutral-500 border-neutral-200/50 hover:bg-neutral-100/50'
                  }`}
                >
                  {curr === 'PHP' ? 'PHP (₱)' : 'USD ($)'}
                </button>
              ))}
            </div>
          </div>

          {/* Wallet Name */}
          <div>
            <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1.5">
              Account Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Cash Pocket, Bank Savings, Brokerage"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`w-full rounded-xl border px-4 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                isDark
                  ? 'bg-neutral-950 border-neutral-900 text-white placeholder-neutral-500'
                  : 'bg-neutral-50 border-neutral-200 text-neutral-850 placeholder-neutral-400'
              }`}
            />
          </div>

          {/* Wallet Description */}
          <div>
            <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1.5">
              Description (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. For emergency funds or stocks"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={`w-full rounded-xl border px-4 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                isDark
                  ? 'bg-neutral-950 border-neutral-900 text-white placeholder-neutral-500'
                  : 'bg-neutral-50 border-neutral-200 text-neutral-850 placeholder-neutral-400'
              }`}
            />
          </div>

          {/* Color Preset Selector */}
          <div>
            <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-2">
              Background Color Accent
            </label>
            <div className="flex flex-wrap gap-2.5">
              {COLOR_PRESETS.map((color) => (
                <button
                  key={color.name}
                  type="button"
                  onClick={() => setSelectedColor(color.value)}
                  className={`h-7 w-7 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                    selectedColor === color.value 
                      ? isDark ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-neutral-950 scale-110' : 'ring-2 ring-neutral-800 scale-110' 
                      : 'hover:scale-105'
                  }`}
                  style={{
                    backgroundColor: color.hex
                  }}
                  title={color.name}
                >
                  {selectedColor === color.value && (
                    <DynamicIcon name="Check" className="text-white drop-shadow-sm" size={14} />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Avatar Visual Type Selection (Icon vs Image) */}
          <div>
            
            <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-2">
              Account Visual Style
            </label>
            <div className={`p-1 rounded-xl flex border transition-all ${
              isDark ? 'bg-neutral-950 border-neutral-900' : 'bg-neutral-100 border-neutral-200'
            }`}>
              <button
                type="button"
                onClick={() => setAvatarMode('bank')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  avatarMode === 'bank'
                    ? isDark ? 'bg-neutral-950 text-blue-400 font-extrabold border border-neutral-900' : 'bg-white text-blue-600 shadow-xs font-extrabold border border-neutral-200'
                    : isDark ? 'text-neutral-400 hover:text-neutral-200' : 'text-neutral-500 hover:text-neutral-700'
                }`}
              >
                <DynamicIcon name="Landmark" size={13} />
                PH Banks
              </button>
              <button
                type="button"
                onClick={() => setAvatarMode('icon')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  avatarMode === 'icon'
                    ? isDark ? 'bg-neutral-950 text-blue-400 font-extrabold border border-neutral-900' : 'bg-white text-blue-600 shadow-xs font-extrabold border border-neutral-200'
                    : isDark ? 'text-neutral-400 hover:text-neutral-200' : 'text-neutral-500 hover:text-neutral-700'
                }`}
              >
                <DynamicIcon name="Sparkles" size={13} />
                Icon
              </button>
              <button
                type="button"
                onClick={() => setAvatarMode('image')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  avatarMode === 'image'
                    ? isDark ? 'bg-neutral-950 text-blue-400 font-extrabold border border-neutral-900' : 'bg-white text-blue-600 shadow-xs font-extrabold border border-neutral-200'
                    : isDark ? 'text-neutral-400 hover:text-neutral-200' : 'text-neutral-500 hover:text-neutral-700'
                }`}
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
                      className={`h-10 rounded-xl flex items-center justify-center border transition-all cursor-pointer ${
                        selectedIcon === 'bank:' + preset.id
                          ? 'border-blue-600 shadow-sm'
                          : isDark
                          ? 'bg-neutral-950 border-neutral-900 hover:bg-neutral-800'
                          : 'bg-neutral-50 border-neutral-200/50 hover:bg-neutral-100/50'
                      }`}
                      style={{ backgroundColor: selectedIcon === 'bank:' + preset.id ? preset.color : undefined }}
                      title={preset.name}
                    >
                      <div className={selectedIcon === 'bank:' + preset.id ? 'opacity-100 scale-110 shadow-md ring-2 ring-blue-500 rounded-full transition-all' : 'opacity-50 scale-90 hover:scale-100 hover:opacity-100 transition-all'}>
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
          ) : avatarMode === 'icon' ? (
            /* Icon Preset Selector */
            <div>
              <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-2">
                Account Icon
              </label>
              <div className="grid grid-cols-5 gap-2">
                {ICON_PRESETS.map((iconName) => (
                  <button
                    key={iconName}
                    type="button"
                    onClick={() => setSelectedIcon(iconName)}
                    className={`h-10 rounded-xl flex items-center justify-center border transition-all cursor-pointer ${
                      selectedIcon === iconName
                        ? 'bg-blue-600 text-white border-blue-600 font-extrabold shadow-sm'
                        : isDark
                        ? 'bg-neutral-950 text-neutral-400 border-neutral-900 hover:bg-neutral-800'
                        : 'bg-neutral-50 text-neutral-400 border-neutral-200/50 hover:bg-neutral-100/50'
                    }`}
                  >
                    <DynamicIcon name={iconName} size={18} />
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* Image Options */
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-2">
                  Select Local Image
                </label>
                <div className={`border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-all ${
                  selectedImage 
                    ? 'border-blue-500 bg-blue-500/5' 
                    : isDark ? 'border-neutral-900 hover:border-neutral-700 bg-neutral-950/50' : 'border-neutral-200 hover:border-neutral-300 bg-neutral-50'
                }`}>
                  <input
                    type="file"
                    accept="image/*"
                    id="local-image-upload"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setSelectedImage(reader.result as string);
                          setCustomImageUrl('');
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                  <label htmlFor="local-image-upload" className="cursor-pointer flex flex-col items-center justify-center gap-2">
                    {selectedImage ? (
                      <div className="relative group">
                        <img
                          src={selectedImage}
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
                <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1.5">
                  Or Paste Custom Image URL
                </label>
                <input
                  type="url"
                  placeholder="https://example.com/your-image.png"
                  value={customImageUrl}
                  onChange={(e) => setCustomImageUrl(e.target.value)}
                  className={`w-full rounded-xl border px-4 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                    isDark
                      ? 'bg-neutral-950 border-neutral-900 text-white placeholder-neutral-600'
                      : 'bg-neutral-50 border-neutral-200 text-neutral-850 placeholder-neutral-400'
                  }`}
                />
                {customImageUrl.trim() && (
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-xs text-neutral-400">Preview:</span>
                    <div className="h-8 w-8 rounded-lg overflow-hidden border border-neutral-200 dark:border-neutral-900">
                      <img
                        src={customImageUrl}
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
        </form>

        {/* Footer Actions */}
        <div className={`p-6 border-t shrink-0 flex gap-3 ${
          isDark ? 'border-neutral-900 bg-neutral-950/40' : 'border-neutral-100 bg-white'
        }`}>
          <button
            type="button"
            onClick={onClose}
            className={`flex-1 py-3 px-4 rounded-xl font-bold uppercase text-xs tracking-widest transition-colors border cursor-pointer text-center ${
              isDark 
                ? 'text-neutral-400 hover:bg-neutral-800 border-neutral-900' 
                : 'text-neutral-500 hover:bg-neutral-50 border-neutral-200'
            }`}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!name.trim()}
            className="flex-1 py-3 px-4 rounded-xl bg-blue-600 text-white font-bold uppercase text-xs tracking-widest hover:bg-blue-700 active:scale-98 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 cursor-pointer"
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
}
