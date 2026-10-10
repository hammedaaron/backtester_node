import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Undo2,
  Target,
  Sparkles,
  Volume2,
  VolumeX,
  Compass,
  Edit2,
  BookOpen,
} from 'lucide-react';
import { getProgressHexColor } from '../utils/colors';

interface ProgressHeaderProps {
  completedCount: number;
  goal: number;
  currentPage: number;
  totalPages: number;
  activeNodePage: number;
  soundEnabled: boolean;
  sessionTitle: string;
  notesCount: number;
  onGoalChange: (newGoal: number) => void;
  onPageChange: (newPage: number) => void;
  onOpenResetModal: () => void;
  onOpenGoalModal: () => void;
  onUndoLast: () => void;
  onToggleSound: () => void;
  onUpdateSessionTitle: (title: string) => void;
  onOpenJournal: () => void;
}

export const ProgressHeader: React.FC<ProgressHeaderProps> = ({
  completedCount,
  goal,
  currentPage,
  totalPages,
  activeNodePage,
  soundEnabled,
  sessionTitle,
  notesCount,
  onGoalChange,
  onPageChange,
  onOpenResetModal,
  onOpenGoalModal,
  onUndoLast,
  onToggleSound,
  onUpdateSessionTitle,
  onOpenJournal,
}) => {
  const [isEditingGoalInline, setIsEditingGoalInline] = useState(false);
  const [tempGoalInput, setTempGoalInput] = useState(goal.toString());
  const [isEditingSessionTitle, setIsEditingSessionTitle] = useState(false);
  const [tempSessionTitle, setTempSessionTitle] = useState(sessionTitle);

  const progressRatio = goal > 0 ? Math.min(1, completedCount / goal) : 0;
  const progressPercent = Math.min(100, Math.round(progressRatio * 100));
  const counterColor = getProgressHexColor(completedCount, goal);

  const handleInlineGoalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseInt(tempGoalInput.replace(/,/g, ''), 10);
    if (!isNaN(parsed) && parsed >= 1) {
      onGoalChange(parsed);
    } else {
      setTempGoalInput(goal.toString());
    }
    setIsEditingGoalInline(false);
  };

  const handleSessionTitleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (tempSessionTitle.trim()) {
      onUpdateSessionTitle(tempSessionTitle.trim());
    } else {
      setTempSessionTitle(sessionTitle);
    }
    setIsEditingSessionTitle(false);
  };

  return (
    <div className="w-full flex flex-col shrink-0 bg-[#0f131c] border-b border-white/5 px-3 sm:px-5 py-2 select-none gap-2">
      {/* Top row: Session Title, Goal Input, and Progress Counter */}
      <div className="flex items-center justify-between gap-2 flex-wrap sm:flex-nowrap">
        {/* Left: Session Title Pill & Quick Goal */}
        <div className="flex items-center gap-2 min-w-0">
          {/* Apple-style Session Title field that auto-creates/links journal space */}
          {isEditingSessionTitle ? (
            <form onSubmit={handleSessionTitleSubmit} className="flex items-center">
              <input
                type="text"
                value={tempSessionTitle}
                onChange={(e) => setTempSessionTitle(e.target.value)}
                onBlur={handleSessionTitleSubmit}
                placeholder="Enter session title..."
                autoFocus
                className="bg-[#181d2a] border border-emerald-500 rounded-xl px-2.5 py-0.5 text-xs font-medium text-white focus:outline-none max-w-[200px]"
              />
            </form>
          ) : (
            <button
              type="button"
              onClick={() => {
                setTempSessionTitle(sessionTitle);
                setIsEditingSessionTitle(true);
              }}
              title="Click to rename session (auto-creates journal space)"
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-slate-200 transition-all cursor-pointer group"
            >
              <span className="text-slate-400 text-[11px]">Session:</span>
              <span className="font-semibold text-white max-w-[120px] sm:max-w-[160px] truncate">
                {sessionTitle}
              </span>
              <Edit2 className="w-2.5 h-2.5 text-slate-400 group-hover:text-emerald-400 transition-colors" />
            </button>
          )}

          {/* Quick Journal Button linked to this session */}
          <button
            type="button"
            onClick={onOpenJournal}
            title="Open Journal for this session"
            className="hidden xs:flex items-center gap-1 px-2 py-1 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/80 border border-emerald-500/30 text-emerald-300 text-xs font-medium transition-all cursor-pointer"
          >
            <BookOpen className="w-3 h-3 text-emerald-400" />
            <span>Journal</span>
            {notesCount > 0 && (
              <span className="text-[10px] px-1 rounded-full bg-emerald-500/20 text-emerald-300 font-mono">
                {notesCount}
              </span>
            )}
          </button>
        </div>

        {/* Right: Goal & Global Progress Counter (No glow) */}
        <div className="flex items-center gap-3 shrink-0 ml-auto">
          {/* Goal Input Section */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-slate-400 font-medium">Goal:</span>
            {isEditingGoalInline ? (
              <form onSubmit={handleInlineGoalSubmit} className="flex items-center">
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={tempGoalInput}
                  onChange={(e) => setTempGoalInput(e.target.value)}
                  onBlur={handleInlineGoalSubmit}
                  autoFocus
                  className="w-16 bg-[#181d2a] border border-emerald-500 rounded-xl px-2 py-0.5 text-xs font-mono font-bold text-white focus:outline-none"
                />
              </form>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setTempGoalInput(goal.toString());
                  setIsEditingGoalInline(true);
                }}
                title="Click to change goal"
                className="flex items-center gap-1 px-2 py-1 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono font-semibold text-slate-200 transition-all cursor-pointer group"
              >
                <span>{goal.toLocaleString()}</span>
                <Target className="w-3 h-3 text-slate-400 group-hover:text-emerald-400 transition-colors" />
              </button>
            )}

            <button
              type="button"
              onClick={onOpenGoalModal}
              title="Configure Goal Presets"
              className="p-1 rounded-xl hover:bg-white/10 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400/80" />
            </button>
          </div>

          {/* Global Progress Counter (clean Apple typography, NO glow) */}
          <div className="flex items-baseline gap-1.5">
            <div
              className="font-mono text-base sm:text-xl font-bold tracking-tight transition-colors duration-200"
              style={{ color: counterColor }}
              title={`Completed: ${completedCount.toLocaleString()} of ${goal.toLocaleString()} (${progressPercent}%)`}
            >
              {completedCount.toLocaleString()}{' '}
              <span className="text-slate-500 font-normal text-xs sm:text-sm">/</span>{' '}
              <span className="text-slate-300 font-bold">{goal.toLocaleString()}</span>
            </div>
            <span
              className="text-[10px] sm:text-xs font-mono font-medium px-1.5 py-0.5 rounded-full bg-white/5 transition-colors"
              style={{ color: counterColor }}
            >
              {progressPercent}%
            </span>
          </div>
        </div>
      </div>

      {/* Progress Bar (Apple Mac smooth rounded-full track, NO glow) */}
      <div className="w-full h-1.5 bg-[#181d2a] rounded-full overflow-hidden">
        <div
          className="h-full transition-all duration-200 ease-out rounded-full"
          style={{
            width: `${progressPercent}%`,
            backgroundColor: counterColor,
          }}
        />
      </div>

      {/* Bottom row: Page Navigation & Action Buttons (Apple rounded-xl buttons) */}
      <div className="flex items-center justify-between gap-1 text-xs pt-0.5">
        {/* Page Switcher */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            title="Previous Page"
            className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed text-slate-300 transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>

          <span className="font-mono text-[11px] sm:text-xs font-medium text-slate-300 px-2 whitespace-nowrap">
            Page <span className="font-bold text-white">{currentPage}</span> of{' '}
            <span className="text-slate-400">{totalPages}</span>
          </span>

          <button
            type="button"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            title="Next Page"
            className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed text-slate-300 transition-colors cursor-pointer"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>

          {/* Jump to active node page if currently viewing a different page */}
          {currentPage !== activeNodePage && (
            <button
              type="button"
              onClick={() => onPageChange(activeNodePage)}
              title={`Jump to Active Node (Page ${activeNodePage})`}
              className="ml-1 px-2 py-1 rounded-xl bg-emerald-950/70 hover:bg-emerald-900 border border-emerald-500/30 text-emerald-300 text-[10px] sm:text-[11px] font-medium flex items-center gap-1 transition-all cursor-pointer"
            >
              <Compass className="w-3 h-3 text-emerald-400" />
              <span className="hidden xs:inline">Jump to</span> P{activeNodePage}
            </button>
          )}
        </div>

        {/* Action Controls: Undo, Sound, Reset */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Sound toggle */}
          <button
            type="button"
            onClick={onToggleSound}
            title={soundEnabled ? 'Mute audio' : 'Enable audio feedback'}
            className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            {soundEnabled ? (
              <Volume2 className="w-3.5 h-3.5 text-slate-300" />
            ) : (
              <VolumeX className="w-3.5 h-3.5 text-slate-500" />
            )}
          </button>

          {/* Undo Last Completed Node */}
          <button
            type="button"
            onClick={onUndoLast}
            disabled={completedCount === 0}
            title="Undo last completed node"
            className="px-2 py-1 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed border border-white/5 flex items-center gap-1 text-[11px] font-medium transition-all cursor-pointer"
          >
            <Undo2 className="w-3 h-3" />
            <span className="hidden xs:inline">Undo</span>
          </button>

          {/* Manual Reset Button */}
          <button
            type="button"
            onClick={onOpenResetModal}
            title="Reset progress to zero"
            className="px-2.5 py-1 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 active:bg-rose-900 text-rose-300 border border-rose-800/40 flex items-center gap-1 text-[11px] font-medium transition-all cursor-pointer"
          >
            <RotateCcw className="w-3 h-3 text-rose-400" />
            <span>Reset</span>
          </button>
        </div>
      </div>
    </div>
  );
};

