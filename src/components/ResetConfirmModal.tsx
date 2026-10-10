import React from 'react';
import { AlertTriangle, X, RotateCcw } from 'lucide-react';

interface ResetConfirmModalProps {
  isOpen: boolean;
  completedCount: number;
  goal: number;
  onCancel: () => void;
  onConfirmReset: () => void;
}

export const ResetConfirmModal: React.FC<ResetConfirmModalProps> = ({
  isOpen,
  completedCount,
  goal,
  onCancel,
  onConfirmReset,
}) => {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="reset-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-150"
    >
      <div
        className="w-full max-w-sm bg-[#121620] border border-white/10 rounded-3xl shadow-2xl p-6 text-slate-100 flex flex-col gap-4 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onCancel}
          aria-label="Close dialog"
          className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-start gap-3">
          <div className="p-3 rounded-2xl bg-rose-950/60 border border-rose-800/40 text-rose-400 shrink-0 mt-0.5">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h2 id="reset-modal-title" className="text-base font-semibold text-white tracking-tight">
              Reset Backtester Progress?
            </h2>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              All <strong className="text-rose-400 font-semibold">{completedCount.toLocaleString()}</strong> completed nodes will be cleared. Configured goal and session journal notes will be preserved.
            </p>
          </div>
        </div>

        <div className="bg-[#181d2a] border border-white/5 rounded-2xl p-3.5 text-xs space-y-2 text-slate-300">
          <div className="flex justify-between">
            <span className="text-slate-400">Current Progress:</span>
            <span className="font-mono font-medium text-white">
              {completedCount.toLocaleString()} / {goal.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Target Goal:</span>
            <span className="font-mono text-emerald-400 font-medium">
              {goal.toLocaleString()} (preserved)
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Page after reset:</span>
            <span className="font-mono text-slate-300">Page 1</span>
          </div>
        </div>

        <div className="flex items-center gap-2.5 pt-1">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 text-xs font-medium text-slate-300 bg-white/5 hover:bg-white/10 hover:text-white rounded-xl border border-white/5 transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirmReset}
            className="flex-1 px-4 py-2.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 active:bg-rose-700 rounded-xl border border-rose-500/80 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Progress
          </button>
        </div>
      </div>
    </div>
  );
};
