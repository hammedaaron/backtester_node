import React, { useState } from 'react';
import { TrendingUp, BarChart3, Calculator, ShieldCheck } from 'lucide-react';
import { loadBacktesterState, getActiveUserId } from '../utils/storage';

interface StrategyLabViewProps {
  onOpenNodes: () => void;
}

export const StrategyLabView: React.FC<StrategyLabViewProps> = ({ onOpenNodes }) => {
  const userId = getActiveUserId();
  const state = loadBacktesterState(userId);

  const [winRate, setWinRate] = useState<number>(55);
  const [riskReward, setRiskReward] = useState<number>(2.0);
  const [riskPerTrade, setRiskPerTrade] = useState<number>(1.0);

  // Expectancy = (Win% * Reward) - (Loss% * Risk)
  const lossRate = 100 - winRate;
  const expectancy = ((winRate / 100) * riskReward - (lossRate / 100) * 1.0).toFixed(2);
  const projectedReturn = (state.completedCount * parseFloat(expectancy) * (riskPerTrade / 100) * 100).toFixed(1);

  return (
    <div className="h-full w-full overflow-y-auto p-4 sm:p-6 bg-[#0a0d14] text-slate-100 flex flex-col items-center">
      <div className="w-full max-w-2xl space-y-6">
        <div className="flex items-center justify-between border-b border-white/5 pb-4">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Calculator className="w-5 h-5 text-emerald-400" />
              Backtester Strategy Lab
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Statistical modeling synced with your {state.completedCount.toLocaleString()} completed nodes.
            </p>
          </div>
          <button
            type="button"
            onClick={onOpenNodes}
            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
          >
            Open Nodes Grid
          </button>
        </div>

        {/* Sync Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 bg-[#121620] border border-white/10 rounded-2xl">
            <span className="text-[11px] text-slate-400 block">Logged Nodes</span>
            <span className="text-lg font-mono font-bold text-white">
              {state.completedCount.toLocaleString()}
            </span>
          </div>
          <div className="p-3.5 bg-[#121620] border border-white/10 rounded-2xl">
            <span className="text-[11px] text-slate-400 block">Sequence Goal</span>
            <span className="text-lg font-mono font-bold text-emerald-400">
              {state.goal.toLocaleString()}
            </span>
          </div>
          <div className="p-3.5 bg-[#121620] border border-white/10 rounded-2xl">
            <span className="text-[11px] text-slate-400 block">Expected R</span>
            <span className="text-lg font-mono font-bold text-blue-400">+{expectancy}R</span>
          </div>
          <div className="p-3.5 bg-[#121620] border border-white/10 rounded-2xl">
            <span className="text-[11px] text-slate-400 block">Est. Return</span>
            <span className="text-lg font-mono font-bold text-amber-400">+{projectedReturn}%</span>
          </div>
        </div>

        {/* Parameters input */}
        <div className="p-5 bg-[#121620] border border-white/10 rounded-3xl space-y-4">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-emerald-400" />
            Model Assumptions
          </h3>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs text-slate-300 mb-1.5">
                <span>Observed Win Rate</span>
                <span className="font-mono font-bold text-emerald-400">{winRate}%</span>
              </div>
              <input
                type="range"
                min="20"
                max="85"
                value={winRate}
                onChange={(e) => setWinRate(Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs text-slate-300 mb-1.5">
                <span>Average Risk-to-Reward Ratio</span>
                <span className="font-mono font-bold text-blue-400">1 : {riskReward.toFixed(1)}</span>
              </div>
              <input
                type="range"
                min="1.0"
                max="4.0"
                step="0.1"
                value={riskReward}
                onChange={(e) => setRiskReward(Number(e.target.value))}
                className="w-full accent-blue-500 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs text-slate-300 mb-1.5">
                <span>Risk Per Trade (%)</span>
                <span className="font-mono font-bold text-amber-400">{riskPerTrade}%</span>
              </div>
              <input
                type="range"
                min="0.25"
                max="3.0"
                step="0.25"
                value={riskPerTrade}
                onChange={(e) => setRiskPerTrade(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Statistical Rigor note */}
        <div className="p-4 bg-emerald-950/20 border border-emerald-900/40 rounded-2xl flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div className="text-xs text-slate-300 space-y-1">
            <p className="font-semibold text-emerald-300">Statistical Significance</p>
            <p className="text-slate-400 leading-relaxed">
              Backtesting requires consecutive non-cherrypicked trades. Completing 100+ nodes validates edge stability across changing volatility regimes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
