import React from 'react';
import { History, CheckCircle2, Clock, Calendar, Activity } from 'lucide-react';
import { loadBacktesterState, getActiveUserId } from '../utils/storage';

interface AnalyticsViewProps {
  onOpenNodes: () => void;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ onOpenNodes }) => {
  const userId = getActiveUserId();
  const state = loadBacktesterState(userId);

  const history = state.history || [];
  const percent = Math.min(100, Math.round((state.completedCount / state.goal) * 100));

  return (
    <div className="h-full w-full overflow-y-auto p-4 sm:p-6 bg-[#0a0d14] text-slate-100 flex flex-col items-center">
      <div className="w-full max-w-2xl space-y-6">
        <div className="flex items-center justify-between border-b border-white/5 pb-4">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-400" />
              Completion Audit & History
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Verifiable sequence progress permanently stored for this profile.
            </p>
          </div>
          <button
            type="button"
            onClick={onOpenNodes}
            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
          >
            Back to Grid
          </button>
        </div>

        {/* Big metrics cards */}
        <div className="grid grid-cols-3 gap-3">
          <div className="p-4 bg-[#121620] border border-white/10 rounded-2xl">
            <span className="text-[11px] text-slate-400 block font-medium">Completed Nodes</span>
            <span className="text-xl font-mono font-bold text-white mt-1 block">
              {state.completedCount.toLocaleString()}
            </span>
            <span className="text-[10px] text-emerald-400 mt-0.5 block">{percent}% of goal</span>
          </div>
          <div className="p-4 bg-[#121620] border border-white/10 rounded-2xl">
            <span className="text-[11px] text-slate-400 block font-medium">Target Goal</span>
            <span className="text-xl font-mono font-bold text-emerald-400 mt-1 block">
              {state.goal.toLocaleString()}
            </span>
            <span className="text-[10px] text-slate-400 mt-0.5 block">Configured</span>
          </div>
          <div className="p-4 bg-[#121620] border border-white/10 rounded-2xl">
            <span className="text-[11px] text-slate-400 block font-medium">Remaining</span>
            <span className="text-xl font-mono font-bold text-amber-400 mt-1 block">
              {Math.max(0, state.goal - state.completedCount).toLocaleString()}
            </span>
            <span className="text-[10px] text-slate-400 mt-0.5 block">To achieve 100%</span>
          </div>
        </div>

        {/* Recent Completion Log */}
        <div className="bg-[#121620] border border-white/10 rounded-3xl p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <History className="w-3.5 h-3.5 text-blue-400" />
              Recent Node Completions
            </h3>
            <span className="text-[11px] text-slate-400 font-mono">
              Last {Math.min(history.length, 20)} records
            </span>
          </div>

          {history.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-xs">
              No completions logged yet. Tap active red nodes on the grid to begin!
            </div>
          ) : (
            <div className="divide-y divide-white/5 max-h-64 overflow-y-auto pr-1">
              {history.slice(-20).reverse().map((rec, idx) => (
                <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span className="font-mono font-bold text-white">
                      Node #{rec.nodeGlobalIndex}
                    </span>
                    <span className="text-slate-500 text-[10px]">
                      (Page {Math.ceil(rec.nodeGlobalIndex / 100)})
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-mono">
                    <Clock className="w-3 h-3 text-slate-500" />
                    <span>{new Date(rec.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Persistence Audit Info */}
        <div className="p-4 bg-[#121620] border border-white/10 rounded-2xl text-xs text-slate-400 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-500" />
            <span>Last state sync:</span>
          </div>
          <span className="font-mono text-slate-300">
            {new Date(state.lastUpdated).toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
};
