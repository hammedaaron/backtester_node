import React, { useState, useEffect } from 'react';
import { Target, X, Check } from 'lucide-react';

interface GoalSettingsModalProps {
  isOpen: boolean;
  currentGoal: number;
  currentProgress: number;
  onClose: () => void;
  onSaveGoal: (newGoal: number) => void;
}

export const GoalSettingsModal: React.FC<GoalSettingsModalProps> = ({
  isOpen,
  currentGoal,
  currentProgress,
  onClose,
  onSaveGoal,
}) => {
  const [goalInput, setGoalInput] = useState<string>(currentGoal.toString());
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setGoalInput(currentGoal.toString());
      setError(null);
    }
  }, [isOpen, currentGoal]);

  if (!isOpen) return null;

  const presets = [100, 250, 500, 1000, 2000, 5000];

  const handleApply = (val: number) => {
    if (isNaN(val) || val < 1) {
      setError('Please enter a positive whole number (min 1).');
      return;
    }
    const cleanVal = Math.floor(val);
    onSaveGoal(cleanVal);
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseInt(goalInput.replace(/,/g, ''), 10);
    handleApply(parsed);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-150"
    >
      <div
        className="w-full max-w-sm bg-[#121620] border border-white/10 rounded-3xl shadow-2xl p-6 text-slate-100 flex flex-col gap-4 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Close dialog"
          className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-start gap-3">
          <div className="p-3 rounded-2xl bg-emerald-950/70 border border-emerald-800/40 text-emerald-400 shrink-0 mt-0.5">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-white tracking-tight">
              Configure Target Goal
            </h2>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Set total backtesting node sequence target. Your current progress of{' '}
              <strong className="text-white font-medium">{currentProgress.toLocaleString()}</strong> nodes will be safely kept.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Total Goal Nodes
            </label>
            <div className="relative">
              <input
                type="number"
                min="1"
                step="1"
                value={goalInput}
                onChange={(e) => {
                  setGoalInput(e.target.value);
                  setError(null);
                }}
                className="w-full bg-[#181d2a] border border-white/10 rounded-xl px-3.5 py-2 text-sm font-mono text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                placeholder="e.g. 500"
                autoFocus
              />
            </div>
            {error && <p className="text-xs text-rose-400 mt-1">{error}</p>}
          </div>

          <div>
            <span className="block text-[11px] font-medium text-slate-400 mb-1.5">
              Quick Presets
            </span>
            <div className="grid grid-cols-3 gap-1.5">
              {presets.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setGoalInput(preset.toString())}
                  className={`px-2 py-1.5 text-xs font-mono font-medium rounded-xl border transition-all cursor-pointer ${
                    parseInt(goalInput, 10) === preset
                      ? 'bg-emerald-950/80 border-emerald-500/80 text-emerald-300'
                      : 'bg-white/5 border-white/5 text-slate-400 hover:text-slate-200 hover:bg-white/10'
                  }`}
                >
                  {preset.toLocaleString()}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 text-xs font-medium text-slate-300 bg-white/5 hover:bg-white/10 hover:text-white rounded-xl border border-white/5 transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 rounded-xl border border-emerald-500/80 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              Save Goal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
