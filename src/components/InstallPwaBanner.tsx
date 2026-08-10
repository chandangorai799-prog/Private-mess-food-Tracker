import React, { useState, useEffect } from 'react';
import { Download, Smartphone, X, Check, Share } from 'lucide-react';
import { MessTrackerLogo } from './MessTrackerLogo';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const InstallPwaBanner: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);
  const [dismissed, setDismissed] = useState<boolean>(false);
  const [showGuide, setShowGuide] = useState<boolean>(false);

  useEffect(() => {
    // Check if already running in standalone display mode
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;

    if (isStandalone) {
      setIsInstalled(true);
      return;
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  if (isInstalled || dismissed) {
    return null;
  }

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    } else {
      // Show Android/iOS manual installation guide modal
      setShowGuide(true);
    }
  };

  return (
    <>
      <div className="bg-gradient-to-r from-emerald-50/90 via-white to-emerald-50/90 border border-emerald-200/80 rounded-2xl p-3.5 shadow-2xs flex items-center justify-between gap-3 text-slate-800 my-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl overflow-hidden shadow-xs flex items-center justify-center shrink-0 border border-emerald-100">
            <MessTrackerLogo className="w-10 h-10" />
          </div>
          <div>
            <h4 className="text-xs font-black text-slate-900 flex items-center gap-1.5">
              Install "My Mess Tracker" App
              <span className="text-[10px] font-black px-1.5 py-0.2 rounded-full bg-emerald-600 text-white uppercase tracking-wider">
                PWA
              </span>
            </h4>
            <p className="text-[11px] text-slate-600 font-semibold leading-snug">
              Install on your phone home screen for quick offline access and fullscreen experience.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleInstallClick}
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-600/20 active:scale-95 transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            Install App
          </button>
          <button
            onClick={() => setDismissed(true)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Dismiss banner"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Manual Installation Guide Modal */}
      {showGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200/80 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl text-slate-800 p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-emerald-600" />
                <h3 className="font-black text-base text-slate-900">How to Install on Mobile</h3>
              </div>
              <button
                onClick={() => setShowGuide(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600 font-semibold">
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                <p className="font-black text-emerald-700 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-[11px] font-black">1</span>
                  Android (Chrome):
                </p>
                <ol className="list-decimal list-inside space-y-1 text-slate-700 pl-1 font-medium">
                  <li>Tap the <strong>3 dots menu (⋮)</strong> at top right of Chrome.</li>
                  <li>Select <strong>"Install App"</strong> or <strong>"Add to Home Screen"</strong>.</li>
                  <li>Confirm installation. The app icon will appear on your home screen!</li>
                </ol>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                <p className="font-black text-sky-700 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-sky-100 text-sky-800 flex items-center justify-center text-[11px] font-black">2</span>
                  iOS (Safari):
                </p>
                <p className="text-slate-700 pl-1 font-medium">
                  Tap the <strong>Share button (<Share className="w-3.5 h-3.5 inline text-sky-600" />)</strong>, then choose <strong>"Add to Home Screen"</strong>.
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowGuide(false)}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs cursor-pointer shadow-md shadow-emerald-600/20 active:scale-95 transition-all"
            >
              Got It
            </button>
          </div>
        </div>
      )}
    </>
  );
};
