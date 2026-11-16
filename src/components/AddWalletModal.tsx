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
  { name: 'Teal', value: 'teal', hex: '#14b8a6' },
  { name: 'Purple', value: 'purple', hex: '#a855f7' },
  { name: 'Blue', value: 'blue', hex: '#2563eb' },
  { name: 'Red', value: 'red', hex: '#e11d48' },
  { name: 'Amber', value: 'amber', hex: '#f59e0b' },
  { name: 'Pink', value: 'pink', hex: '#ec4899' },
  { name: 'Slate', value: 'slate', hex: '#475569' },
];

const ICON_PRESETS = [
  'Wallet', 'Coins', 'Smartphone', 'Landmark', 'CreditCard',
  'PiggyBank', 'Briefcase', 'Shield', 'Activity', 'Sparkles',
];

type TemplateType = 'cash' | 'bank' | 'custom';

export default function AddWalletModal({
  isOpen,
  onClose,
  onAdd,
  themeMode = 'light',
}: AddWalletModalProps) {
  const isDark = themeMode === 'dark';

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [template, setTemplate] = useState<TemplateType>('custom');
  const [type, setType] = useState<WalletType>('wallet');
  const [currency, setCurrency] = useState<'PHP' | 'USD'>('PHP');
  const [initialBalance, setInitialBalance] = useState('');
  const [selectedColor, setSelectedColor] = useState(COLOR_PRESETS[0].value);
  const [selectedIcon, setSelectedIcon] = useState(ICON_PRESETS[0]);
  const [avatarMode, setAvatarMode] = useState<'icon' | 'image' | 'bank'>('bank');
  const [selectedImage, setSelectedImage] = useState('');
  const [customImageUrl, setCustomImageUrl] = useState('');

  if (!isOpen) return null;

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

    const finalImage =
      avatarMode === 'image'
        ? customImageUrl.trim() || selectedImage || undefined
        : undefined;

    onAdd({
      id: `w-${Date.now()}`,
      name: name.trim(),
      description: description.trim() || undefined,
      type,
      currency,
      balance: parseFloat(initialBalance) || 0,
      icon: selectedIcon,
      color: selectedColor,
      image: finalImage,
      createdAt: new Date().toISOString(),
    });

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

  const field = `w-full rounded-xl border px-3.5 py-2.5 text-[13px] focus:outline-none focus:ring-1 focus:ring-zinc-400 ${
    isDark ? 'bg-zinc-950 border-zinc-800 text-white' : 'bg-zinc-50 border-zinc-200 text-zinc-900'
  }`;

  const chip = (active: boolean) =>
    `py-2 px-2 rounded-xl text-[12px] font-medium border transition-all capitalize ${
      active
        ? isDark
          ? 'bg-zinc-100 text-zinc-900 border-zinc-100'
          : 'bg-zinc-900 text-white border-zinc-900'
        : isDark
          ? 'bg-zinc-950 text-zinc-400 border-zinc-800'
          : 'bg-zinc-50 text-zinc-500 border-zinc-200'
    }`;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4 backdrop-blur-xs">
      <div className="absolute inset-0" onClick={onClose} />

      <div
        className={`relative w-full sm:max-w-md border-t sm:border rounded-t-[28px] sm:rounded-[28px] shadow-2xl overflow-hidden max-h-[92vh] flex flex-col ${
          isDark ? 'bg-zinc-950 border-zinc-800 text-zinc-50' : 'bg-white border-zinc-200 text-zinc-900'
        }`}
      >
        <div className={`flex items-center justify-between border-b px-5 py-4 shrink-0 ${
          isDark ? 'border-zinc-800' : 'border-zinc-100'
        }`}>
          <h2 className="text-[14px] font-semibold tracking-tight">New wallet</h2>
          <button
            type="button"
            onClick={onClose}
            className={`rounded-full p-1.5 ${
              isDark ? 'text-zinc-400 hover:bg-zinc-900' : 'text-zinc-400 hover:bg-zinc-100'
            }`}
          >
            <DynamicIcon name="X" size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto overscroll-contain px-5 py-5 flex-1 space-y-4">
          <div>
            <label className="block text-[11px] font-medium text-zinc-400 uppercase tracking-[0.1em] mb-1.5">
              Opening balance
            </label>
            <input
              type="number"
              placeholder="0"
              step="any"
              value={initialBalance}
              onChange={(e) => setInitialBalance(e.target.value)}
              className={field}
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-zinc-400 uppercase tracking-[0.1em] mb-1.5">
              Template
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['cash', 'bank', 'custom'] as TemplateType[]).map((t) => (
                <button key={t} type="button" onClick={() => handleTemplateChange(t)} className={chip(template === t)}>
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-zinc-400 uppercase tracking-[0.1em] mb-1.5">
              Type
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {(['wallet', 'savings', 'investment', 'others'] as WalletType[]).map((t) => (
                <button key={t} type="button" onClick={() => setType(t)} className={chip(type === t)}>
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-zinc-400 uppercase tracking-[0.1em] mb-1.5">
              Currency
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(['PHP', 'USD'] as const).map((c) => (
                <button key={c} type="button" onClick={() => setCurrency(c)} className={chip(currency === c)}>
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-zinc-400 uppercase tracking-[0.1em] mb-1.5">
              Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Cash, BPI, GCash"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={field}
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-zinc-400 uppercase tracking-[0.1em] mb-1.5">
              Note
            </label>
            <input
              type="text"
              placeholder="Optional"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={field}
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-zinc-400 uppercase tracking-[0.1em] mb-1.5">
              Color
            </label>
            <div className="flex flex-wrap gap-2">
              {COLOR_PRESETS.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => setSelectedColor(color.value)}
                  className={`h-7 w-7 rounded-full ${selectedColor === color.value ? 'ring-2 ring-offset-2 ring-zinc-400' : ''}`}
                  style={{ backgroundColor: color.hex }}
                  title={color.name}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-zinc-400 uppercase tracking-[0.1em] mb-1.5">
              Visual
            </label>
            <div className={`flex p-0.5 rounded-xl mb-3 ${isDark ? 'bg-zinc-900' : 'bg-zinc-100'}`}>
              {(['bank', 'icon', 'image'] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setAvatarMode(mode)}
                  className={`flex-1 py-1.5 rounded-[10px] text-[12px] font-medium capitalize ${
                    avatarMode === mode
                      ? isDark
                        ? 'bg-zinc-800 text-zinc-50'
                        : 'bg-white text-zinc-900 shadow-sm'
                      : 'text-zinc-500'
                  }`}
                >
                  {mode === 'bank' ? 'PH banks' : mode}
                </button>
              ))}
            </div>

            {avatarMode === 'bank' && (
              <div className="grid grid-cols-5 gap-2">
                {BANK_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => {
                      setSelectedIcon('bank:' + preset.id);
                      setName(preset.name);
                    }}
                    className={`h-10 rounded-xl flex items-center justify-center border ${
                      selectedIcon === 'bank:' + preset.id
                        ? 'border-zinc-400'
                        : isDark
                          ? 'border-zinc-800'
                          : 'border-zinc-200'
                    }`}
                    style={{
                      backgroundColor:
                        selectedIcon === 'bank:' + preset.id ? preset.color : undefined,
                    }}
                    title={preset.name}
                  >
                    <div
                      className="w-6 h-6 rounded-full overflow-hidden flex items-center justify-center"
                      style={{ backgroundColor: preset.color }}
                    >
                      <BankLogo bank={preset.id} size={16} />
                    </div>
                  </button>
                ))}
              </div>
            )}

            {avatarMode === 'icon' && (
              <div className="grid grid-cols-5 gap-2">
                {ICON_PRESETS.map((iconName) => (
                  <button
                    key={iconName}
                    type="button"
                    onClick={() => setSelectedIcon(iconName)}
                    className={chip(selectedIcon === iconName) + ' h-10 flex items-center justify-center'}
                  >
                    <DynamicIcon name={iconName} size={18} />
                  </button>
                ))}
              </div>
            )}

            {avatarMode === 'image' && (
              <input
                type="url"
                placeholder="Image URL"
                value={customImageUrl}
                onChange={(e) => setCustomImageUrl(e.target.value)}
                className={field}
              />
            )}
          </div>

          <div className="pt-2 flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className={`flex-1 py-2.5 rounded-xl text-[13px] font-medium border ${
                isDark ? 'border-zinc-700 text-zinc-300' : 'border-zinc-200 text-zinc-600'
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`flex-1 py-2.5 rounded-xl text-[13px] font-medium ${
                isDark ? 'bg-zinc-100 text-zinc-900' : 'bg-zinc-900 text-white'
              }`}
            >
              Add wallet
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
