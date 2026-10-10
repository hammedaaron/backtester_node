import React, { useState } from 'react';
import { Download, Share, PlusSquare, X, CheckCircle2 } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  variant?: 'compact' | 'full';
  className?: string;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  variant = 'compact',
  className = '',
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already running in standalone PWA mode, suppress the button
  if (isInstalled) {
    return null;
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <button
        type="button"
        onClick={install}
        title="Install Backtester Nodes as Native App"
        className={`flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-medium text-xs shadow-sm transition-all cursor-pointer ${
          variant === 'compact' ? 'px-2.5 py-1' : 'px-3.5 py-2'
        } ${className}`}
      >
        <Download className="w-3.5 h-3.5" />
        <span>Install App</span>
      </button>
    );
  }

  // iOS Safari flow or generic fallback
  return (
    <>
      <button
        type="button"
        onClick={() => setShowIOSGuide(true)}
        title="Install to Home Screen"
        className={`flex items-center gap-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white font-medium text-xs transition-all cursor-pointer ${
          variant === 'compact' ? 'px-2.5 py-1' : 'px-3.5 py-2'
        } ${className}`}
      >
        <Download className="w-3.5 h-3.5 text-emerald-400" />
        <span>Install</span>
      </button>

      {/* iOS / General Installation Guide Modal */}
      {showIOSGuide && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150"
          onClick={() => setShowIOSGuide(false)}
        >
          <div
            className="w-full max-w-sm bg-[#121620] border border-white/10 rounded-3xl p-6 shadow-2xl text-slate-100 flex flex-col gap-4 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowIOSGuide(false)}
              aria-label="Close"
              className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* App Icon & Branding */}
            <div className="flex items-center gap-3">
              <img
                src="/apple-touch-icon.png"
                alt="Backtester Nodes"
                className="w-12 h-12 rounded-2xl border border-white/10 shadow-md shrink-0"
              />
              <div>
                <h3 className="text-base font-bold text-white tracking-tight">
                  Install Backtester
                </h3>
                <p className="text-xs text-slate-400">
                  Full-screen native app on your device
                </p>
              </div>
            </div>

            {/* Step by step guide */}
            <div className="space-y-3 bg-[#181d2a] border border-white/5 rounded-2xl p-4 text-xs text-slate-300">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-lg bg-white/10 flex items-center justify-center text-emerald-400 font-bold shrink-0">
                  1
                </div>
                <div className="flex-1 leading-relaxed">
                  Tap the <strong className="text-white">Share</strong> icon in your browser toolbar (
                  <Share className="w-3.5 h-3.5 inline mx-0.5 text-blue-400" />
                  ).
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-lg bg-white/10 flex items-center justify-center text-emerald-400 font-bold shrink-0">
                  2
                </div>
                <div className="flex-1 leading-relaxed">
                  Scroll down and tap <strong className="text-white">Add to Home Screen</strong> (
                  <PlusSquare className="w-3.5 h-3.5 inline mx-0.5 text-emerald-400" />
                  ).
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-lg bg-white/10 flex items-center justify-center text-emerald-400 font-bold shrink-0">
                  3
                </div>
                <div className="flex-1 leading-relaxed">
                  Tap <strong className="text-white">Add</strong> in the top right. Backtester Nodes will now launch full-screen!
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
              <span className="flex items-center gap-1 text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Offline Ready & Persistent
              </span>
              <button
                type="button"
                onClick={() => setShowIOSGuide(false)}
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-medium text-xs transition-colors cursor-pointer"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
