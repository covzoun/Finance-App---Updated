import React, { useState } from 'react';
import { usePWAInstall } from './usePWAInstall';
import DynamicIcon from './DynamicIcon';

export const PWAInstallButton: React.FC<{ themeMode: 'light' | 'dark' }> = ({ themeMode }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const isDark = themeMode === 'dark';

  if (isInstalled) {
    return null;
  }

  if (isInstallable) {
    return (
      <button
        onClick={install}
        className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest shadow-sm transition cursor-pointer active:scale-95 ${
          isDark 
            ? 'bg-blue-600 hover:bg-blue-700 text-white'
            : 'bg-blue-600 hover:bg-blue-700 text-white'
        }`}
      >
        <DynamicIcon name="Download" size={12} />
        Install App
      </button>
    );
  }

  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest transition cursor-pointer active:scale-95 ${
            isDark 
              ? 'border-neutral-700 text-neutral-300 hover:bg-neutral-800'
              : 'border-neutral-300 text-neutral-700 hover:bg-neutral-100'
          }`}
        >
          <DynamicIcon name="Download" size={12} />
          Install on iOS
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className={`w-full max-w-sm rounded-2xl p-6 shadow-xl ${isDark ? 'bg-neutral-950 border border-neutral-900 text-white' : 'bg-white text-neutral-900'}`}>
              <h3 className="text-sm font-bold uppercase tracking-wider">Install on iPhone / iPad</h3>
              <p className={`mt-3 text-xs leading-relaxed ${isDark ? 'text-neutral-400' : 'text-neutral-600'}`}>
                1. Tap the <strong>Share</strong> button in Safari's toolbar.<br /><br />
                2. Scroll down and tap <strong>Add to Home Screen</strong>.
              </p>
              <button
                onClick={() => setShowIOSGuide(false)}
                className={`mt-6 w-full rounded-xl py-2.5 text-[11px] font-bold uppercase tracking-wider cursor-pointer ${
                  isDark ? 'bg-neutral-800 hover:bg-neutral-700 text-neutral-200' : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-800'
                }`}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
