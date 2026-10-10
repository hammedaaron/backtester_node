import React from 'react';
import { Lock } from 'lucide-react';
import { GridNodeInfo } from '../types';

interface NodeGridProps {
  currentPage: number;
  completedCount: number;
  goal: number;
  onNodeClick: (nodeNum: number, globalIndex: number) => void;
  onAttemptInvalidClick?: (nodeNum: number, globalIndex: number, reason: 'locked' | 'beyond-goal' | 'already-done') => void;
}

export const NodeGrid: React.FC<NodeGridProps> = ({
  currentPage,
  completedCount,
  goal,
  onNodeClick,
  onAttemptInvalidClick,
}) => {
  // Generate 100 nodes for the current page
  const nodes: GridNodeInfo[] = Array.from({ length: 100 }, (_, i) => {
    const pageIndex = i + 1; // 1 to 100
    const globalIndex = (currentPage - 1) * 100 + pageIndex;
    const isBeyondGoal = globalIndex > goal;
    const isCompleted = globalIndex <= completedCount;
    const isNext = globalIndex === completedCount + 1 && !isBeyondGoal;
    const isLocked = globalIndex > completedCount + 1 && !isBeyondGoal;

    let status: GridNodeInfo['status'] = 'locked';
    if (isBeyondGoal) status = 'beyond-goal';
    else if (isCompleted) status = 'completed';
    else if (isNext) status = 'current';

    return {
      pageIndex,
      globalIndex,
      status,
      isCompleted,
      isNext,
      isLocked,
      isBeyondGoal,
    };
  });

  const handleClick = (node: GridNodeInfo) => {
    if (node.isNext) {
      onNodeClick(node.pageIndex, node.globalIndex);
    } else if (node.isCompleted) {
      onAttemptInvalidClick?.(node.pageIndex, node.globalIndex, 'already-done');
    } else if (node.isBeyondGoal) {
      onAttemptInvalidClick?.(node.pageIndex, node.globalIndex, 'beyond-goal');
    } else {
      onAttemptInvalidClick?.(node.pageIndex, node.globalIndex, 'locked');
    }
  };

  return (
    <div className="w-full h-full flex items-center justify-center p-1 sm:p-2 select-none overflow-hidden">
      {/* Aspect-ratio constrained 10x10 grid */}
      <div
        className="grid grid-cols-10 grid-rows-10 gap-1 sm:gap-1.5 w-full h-full max-w-full max-h-full"
        style={{
          aspectRatio: '1 / 1',
          maxHeight: '100%',
          maxWidth: '100%',
        }}
      >
        {nodes.map((node) => {
          if (node.isCompleted) {
            // GREEN: Completed - Apple Mac rounded shape, clean matte finish (no glow)
            return (
              <button
                key={node.pageIndex}
                type="button"
                onClick={() => handleClick(node)}
                title={`Node ${node.pageIndex} (Global #${node.globalIndex}): Completed`}
                className="w-full h-full min-w-0 min-h-0 rounded-lg sm:rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-mono font-semibold text-[10px] sm:text-xs flex items-center justify-center border border-emerald-400/40 transition-colors duration-100 cursor-pointer"
              >
                <span className="truncate">{node.pageIndex}</span>
              </button>
            );
          }

          if (node.isNext) {
            // RED: Active Next Node - Apple Mac crisp contrast, clean white border ring (NO glow, NO pulse)
            return (
              <button
                key={node.pageIndex}
                type="button"
                onClick={() => handleClick(node)}
                title={`Node ${node.pageIndex} (Global #${node.globalIndex}): Tap to complete!`}
                className="w-full h-full min-w-0 min-h-0 rounded-lg sm:rounded-xl bg-rose-500 hover:bg-rose-400 active:scale-95 text-white font-mono font-bold text-[10px] sm:text-xs flex items-center justify-center border-2 border-white ring-2 ring-white/20 transition-transform duration-75 cursor-pointer z-10"
              >
                <span className="truncate">{node.pageIndex}</span>
              </button>
            );
          }

          if (node.isBeyondGoal) {
            // Beyond configured goal: Disabled / locked
            return (
              <div
                key={node.pageIndex}
                onClick={() => handleClick(node)}
                title={`Node ${node.pageIndex} (Global #${node.globalIndex}): Beyond goal target (${goal})`}
                className="w-full h-full min-w-0 min-h-0 rounded-lg sm:rounded-xl bg-[#0f131a] border border-white/5 text-slate-700 font-mono text-[9px] sm:text-[11px] flex items-center justify-center cursor-not-allowed opacity-30"
              >
                <span className="truncate">{node.pageIndex}</span>
              </div>
            );
          }

          // RED & DISABLED: Not yet available because an earlier node must be completed first
          return (
            <button
              key={node.pageIndex}
              type="button"
              onClick={() => handleClick(node)}
              title={`Node ${node.pageIndex} (Global #${node.globalIndex}): Locked. Complete node ${completedCount + 1} first.`}
              className="w-full h-full min-w-0 min-h-0 rounded-lg sm:rounded-xl bg-[#19151e] hover:bg-[#201a27] text-rose-300/40 border border-rose-950/30 font-mono text-[10px] sm:text-xs flex items-center justify-center transition-colors cursor-not-allowed"
            >
              <span className="truncate">{node.pageIndex}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
