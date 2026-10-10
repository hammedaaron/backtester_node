/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Layers,
  Calculator,
  Activity,
  Maximize2,
  CheckCircle2,
  Target,
  Sparkles,
} from 'lucide-react';
import { BacktesterNodesView } from './components/BacktesterNodesView';
import { StrategyLabView } from './components/StrategyLabView';
import { AnalyticsView } from './components/AnalyticsView';
import { loadBacktesterState, getActiveUserId } from './utils/storage';
import { getProgressHexColor } from './utils/colors';

type ActiveTab = 'nodes' | 'strategy' | 'analytics';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('nodes');
  const [isNodesPaneOpen, setIsNodesPaneOpen] = useState(true);

  // Sync state for navigation badges
  const activeUserId = getActiveUserId();
  const state = loadBacktesterState(activeUserId);
  const counterColor = getProgressHexColor(state.completedCount, state.goal);

  return (
    <div className="h-[100dvh] max-h-[100dvh] w-full flex flex-col bg-[#07090e] text-slate-100 overflow-hidden font-sans">
      {/* If nodes pane is open in standalone view (default), display it full screen */}
      {isNodesPaneOpen && activeTab === 'nodes' ? (
        <BacktesterNodesView
          onClose={() => setIsNodesPaneOpen(false)}
          isStandalonePane={true}
        />
      ) : (
        /* App Shell Navigation & Overview */
        <div className="h-full w-full flex flex-col overflow-hidden">
          {/* Main App Navigation Bar */}
          <header className="h-12 w-full px-3 sm:px-6 bg-[#121620] border-b border-white/5 flex items-center justify-between shrink-0 z-30 select-none">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                  <Layers className="w-4 h-4" />
                </div>
                <span className="font-bold text-sm text-white tracking-tight">
                  QuantLab
                </span>
              </div>

              {/* Navigation Items with Apple rounded-xl pills */}
              <nav className="flex items-center gap-1.5 ml-2 sm:ml-4">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('nodes');
                    setIsNodesPaneOpen(true);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                    activeTab === 'nodes'
                      ? 'bg-emerald-950/70 border border-emerald-500/40 text-emerald-300'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Backtester Nodes</span>
                  <span
                    className="ml-1 text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-full bg-black/40"
                    style={{ color: counterColor }}
                  >
                    {state.completedCount}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('strategy')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                    activeTab === 'strategy'
                      ? 'bg-white/10 text-white border border-white/10'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                  }`}
                >
                  <Calculator className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Strategy Lab</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('analytics')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                    activeTab === 'analytics'
                      ? 'bg-white/10 text-white border border-white/10'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                  }`}
                >
                  <Activity className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Audit Log</span>
                </button>
              </nav>
            </div>

            {/* Re-open feature shortcut */}
            <button
              type="button"
              onClick={() => {
                setActiveTab('nodes');
                setIsNodesPaneOpen(true);
              }}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>Launch Nodes Grid</span>
            </button>
          </header>

          {/* Active Tab Content */}
          <main className="flex-1 min-h-0 w-full overflow-hidden">
            {activeTab === 'nodes' && !isNodesPaneOpen && (
              <div className="h-full w-full overflow-y-auto p-4 sm:p-8 flex flex-col items-center justify-center">
                <div className="w-full max-w-lg bg-[#121620] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-emerald-950/70 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                        <Layers className="w-5 h-5" />
                      </div>
                      <div>
                        <h2 className="text-base font-bold text-white">Backtester Nodes</h2>
                        <p className="text-xs text-slate-400">
                          100-Node sequential backtesting sequence tracker
                        </p>
                      </div>
                    </div>
                    <span
                      className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-white/5 border border-white/10"
                      style={{ color: counterColor }}
                    >
                      {state.completedCount} / {state.goal}
                    </span>
                  </div>

                  <div className="bg-[#181d2a] border border-white/5 rounded-2xl p-4 space-y-3">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Session Title:</span>
                      <span className="font-medium text-white">
                        {state.sessionTitle}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Total Goal Target:</span>
                      <span className="font-mono font-semibold text-white">
                        {state.goal.toLocaleString()} nodes
                      </span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Completed Nodes:</span>
                      <span className="font-mono font-bold" style={{ color: counterColor }}>
                        {state.completedCount.toLocaleString()} nodes
                      </span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Active Page:</span>
                      <span className="font-mono text-slate-300">
                        Page {state.currentPage} of {Math.max(1, Math.ceil(state.goal / 100))}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Sequential Rule:</span>
                      <span className="text-emerald-400 font-medium">Strict Enforced</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setIsNodesPaneOpen(true)}
                      className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-2xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
                    >
                      <Layers className="w-4 h-4" />
                      Open Backtester Nodes Pane
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'strategy' && (
              <StrategyLabView
                onOpenNodes={() => {
                  setActiveTab('nodes');
                  setIsNodesPaneOpen(true);
                }}
              />
            )}

            {activeTab === 'analytics' && (
              <AnalyticsView
                onOpenNodes={() => {
                  setActiveTab('nodes');
                  setIsNodesPaneOpen(true);
                }}
              />
            )}
          </main>
        </div>
      )}
    </div>
  );
}
