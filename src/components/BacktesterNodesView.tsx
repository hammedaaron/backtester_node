import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  BookOpen,
  X,
  Maximize2,
  CheckCircle2,
  Award,
  Layers,
  Sparkles,
  User,
  Info,
} from 'lucide-react';
import { BacktesterState, UserAccount, JournalNote } from '../types';
import {
  loadBacktesterState,
  saveBacktesterState,
  clearBacktesterProgress,
  DEFAULT_ACCOUNTS,
  getActiveUserId,
  setActiveUserId,
} from '../utils/storage';
import { soundManager, triggerHaptic } from '../utils/audio';
import { NodeGrid } from './NodeGrid';
import { ProgressHeader } from './ProgressHeader';
import { ResetConfirmModal } from './ResetConfirmModal';
import { GoalSettingsModal } from './GoalSettingsModal';
import { AccountManagerModal } from './AccountManagerModal';
import { SessionJournalModal } from './SessionJournalModal';

interface BacktesterNodesViewProps {
  onClose?: () => void;
  isStandalonePane?: boolean;
}

export const BacktesterNodesView: React.FC<BacktesterNodesViewProps> = ({
  onClose,
  isStandalonePane = true,
}) => {
  // Active User Account
  const [currentUser, setCurrentUser] = useState<UserAccount>(() => {
    const activeId = getActiveUserId();
    return DEFAULT_ACCOUNTS.find((a) => a.id === activeId) || DEFAULT_ACCOUNTS[0];
  });

  // State loaded from permanent storage
  const [state, setState] = useState<BacktesterState>(() => {
    const activeId = getActiveUserId();
    return loadBacktesterState(activeId);
  });

  // Modals state
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [isJournalModalOpen, setIsJournalModalOpen] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'info' | 'warn' | 'success' } | null>(null);
  const [showGoalCelebration, setShowGoalCelebration] = useState(false);

  // Sync sound manager with mute state
  useEffect(() => {
    soundManager.setMuted(!state.soundEnabled);
  }, [state.soundEnabled]);

  // Total pages based on current goal
  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(state.goal / 100));
  }, [state.goal]);

  // Which page contains the next active node
  const activeNodePage = useMemo(() => {
    const nextNodeIndex = state.completedCount + 1;
    if (nextNodeIndex > state.goal) {
      return totalPages;
    }
    return Math.max(1, Math.ceil(nextNodeIndex / 100));
  }, [state.completedCount, state.goal, totalPages]);

  // Keep current page in valid bounds if goal changes
  useEffect(() => {
    if (state.currentPage > totalPages) {
      setState((prev) => {
        const next = { ...prev, currentPage: totalPages };
        saveBacktesterState(currentUser.id, next);
        return next;
      });
    }
  }, [totalPages, state.currentPage, currentUser.id]);

  // Show auto-dismiss notifications
  const showFeedback = useCallback((message: string, type: 'info' | 'warn' | 'success' = 'info') => {
    setNotification({ message, type });
    const timer = setTimeout(() => {
      setNotification(null);
    }, 2400);
    return () => clearTimeout(timer);
  }, []);

  // Update session title & automatically create/ensure journal space
  const handleUpdateSessionTitle = useCallback(
    (newTitle: string) => {
      const trimmed = newTitle.trim() || 'Primary Session';
      let currentNotes = state.notes || [];

      // Check if a note already exists for this session
      const noteExists = currentNotes.some(
        (n) => n.sessionTitle.trim().toLowerCase() === trimmed.toLowerCase()
      );

      if (!noteExists) {
        // Automatically create a journal space for this session title
        const autoNote: JournalNote = {
          id: `note_session_${Date.now()}`,
          title: trimmed,
          sessionTitle: trimmed,
          linkedNodeIndex: state.completedCount,
          content: `# ${trimmed}\n\n## Session Strategy & Notes\n- Completed Nodes: ${state.completedCount} / ${state.goal}\n\n### Strategy Rules & Execution\n1. Setup Criteria:\n2. Key Levels:\n3. Risk/Reward Ratio: 1:2\n\n### Trade Log\nWrite observations for this session's nodes here...`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        currentNotes = [autoNote, ...currentNotes];
      }

      const newState: BacktesterState = {
        ...state,
        sessionTitle: trimmed,
        notes: currentNotes,
      };
      saveBacktesterState(currentUser.id, newState);
      setState(newState);
      showFeedback(`Session updated to "${trimmed}". Journal space ready!`, 'success');
    },
    [state, currentUser.id, showFeedback]
  );

  // Save notes from journal
  const handleSaveNotes = useCallback(
    (updatedNotes: JournalNote[]) => {
      const newState: BacktesterState = {
        ...state,
        notes: updatedNotes,
      };
      saveBacktesterState(currentUser.id, newState);
      setState(newState);
    },
    [state, currentUser.id]
  );

  // Sequential Node Completion Handler
  const handleNodeClick = useCallback(
    (pageIndex: number, globalIndex: number) => {
      if (state.completedCount >= state.goal) {
        showFeedback(`Target goal of ${state.goal.toLocaleString()} nodes already reached!`, 'success');
        return;
      }

      // STRICT SEQUENTIAL VERIFICATION: Next node MUST be completedCount + 1
      if (globalIndex !== state.completedCount + 1) {
        return;
      }

      const nextCompletedCount = state.completedCount + 1;
      let nextCurrentPage = state.currentPage;

      // Haptic and sound
      if (state.vibrateEnabled) triggerHaptic(18);
      soundManager.playNodeComplete();

      // Check Automatic Page Progression:
      // If completing node 100 on the current page, and more nodes remain before goal
      const isHundredthNodeOnPage = pageIndex === 100;
      if (isHundredthNodeOnPage && nextCompletedCount < state.goal) {
        nextCurrentPage = state.currentPage + 1;
        soundManager.playPageComplete();
        showFeedback(`Page ${state.currentPage} complete! Advancing to Page ${nextCurrentPage}`, 'success');
      }

      // Check if Total Goal is reached (NO glowing, NO falling confetti per user request)
      const isGoalReached = nextCompletedCount >= state.goal;
      if (isGoalReached) {
        soundManager.playGoalComplete();
        setShowGoalCelebration(true);
        showFeedback(`Backtesting Goal of ${state.goal.toLocaleString()} Achieved!`, 'success');
      }

      const updatedHistory = [
        ...(state.history || []),
        { nodeGlobalIndex: globalIndex, completedAt: new Date().toISOString() },
      ];

      const newState: BacktesterState = {
        ...state,
        completedCount: nextCompletedCount,
        currentPage: nextCurrentPage,
        history: updatedHistory.slice(-500), // Keep recent history clean
      };

      // Permanent immediate save
      saveBacktesterState(currentUser.id, newState);
      setState(newState);
    },
    [state, currentUser.id, showFeedback]
  );

  // Attempted invalid click feedback
  const handleAttemptInvalidClick = useCallback(
    (_pageIndex: number, globalIndex: number, reason: 'locked' | 'beyond-goal' | 'already-done') => {
      if (state.vibrateEnabled) triggerHaptic(30);

      if (reason === 'locked') {
        const nextRequired = state.completedCount + 1;
        showFeedback(
          `Sequential order: Complete Node #${nextRequired} first (cannot skip ahead).`,
          'warn'
        );
      } else if (reason === 'beyond-goal') {
        showFeedback(`Node #${globalIndex} is beyond configured goal of ${state.goal.toLocaleString()}.`, 'info');
      } else if (reason === 'already-done') {
        showFeedback(`Node #${globalIndex} is already completed.`, 'info');
      }
    },
    [state.completedCount, state.goal, state.vibrateEnabled, showFeedback]
  );

  // Undo Last Node
  const handleUndoLast = useCallback(() => {
    if (state.completedCount <= 0) return;

    const newCompletedCount = state.completedCount - 1;
    soundManager.playUndo();
    if (state.vibrateEnabled) triggerHaptic(20);

    // If user undid node that crossed page boundary
    const expectedPage = Math.max(1, Math.ceil((newCompletedCount + 1) / 100));

    const newState: BacktesterState = {
      ...state,
      completedCount: newCompletedCount,
      currentPage: state.currentPage > expectedPage ? expectedPage : state.currentPage,
      history: state.history?.slice(0, -1) || [],
    };

    saveBacktesterState(currentUser.id, newState);
    setState(newState);
    showFeedback(`Undid Node #${state.completedCount}. Progress: ${newCompletedCount} / ${state.goal}`, 'info');
  }, [state, currentUser.id, showFeedback]);

  // Goal Change (Preserves existing progress as strictly required)
  const handleGoalChange = useCallback(
    (newGoal: number) => {
      const sanitizedGoal = Math.max(1, Math.floor(newGoal));
      const newState: BacktesterState = {
        ...state,
        goal: sanitizedGoal,
      };
      saveBacktesterState(currentUser.id, newState);
      setState(newState);
      showFeedback(`Target goal updated to ${sanitizedGoal.toLocaleString()} nodes. Progress preserved!`, 'success');
    },
    [state, currentUser.id, showFeedback]
  );

  // Manual Reset Confirmation Handler (Preserves goal & journal notes)
  const handleConfirmReset = useCallback(() => {
    const resetState = clearBacktesterProgress(
      currentUser.id,
      state.goal,
      state.sessionTitle,
      state.notes
    );
    setState(resetState);
    setIsResetModalOpen(false);
    setShowGoalCelebration(false);
    if (state.vibrateEnabled) triggerHaptic(40);
    showFeedback('Progress reset to zero. Goal & notes preserved.', 'info');
  }, [currentUser.id, state.goal, state.sessionTitle, state.notes, state.vibrateEnabled, showFeedback]);

  // User Switch
  const handleSwitchUser = useCallback((newUser: UserAccount) => {
    setActiveUserId(newUser.id);
    setCurrentUser(newUser);
    const loadedState = loadBacktesterState(newUser.id);
    setState(loadedState);
    setIsAccountModalOpen(false);
  }, []);

  // Import State
  const handleImportState = useCallback(
    (imported: BacktesterState) => {
      setState(imported);
      showFeedback('Backup data imported successfully!', 'success');
    },
    [showFeedback]
  );

  // Page switcher
  const handlePageChange = useCallback(
    (newPage: number) => {
      const clamped = Math.max(1, Math.min(totalPages, newPage));
      const newState = { ...state, currentPage: clamped };
      saveBacktesterState(currentUser.id, newState);
      setState(newState);
    },
    [totalPages, state, currentUser.id]
  );

  // Sound toggle
  const handleToggleSound = useCallback(() => {
    const nextVal = !state.soundEnabled;
    const newState = { ...state, soundEnabled: nextVal };
    saveBacktesterState(currentUser.id, newState);
    setState(newState);
  }, [state, currentUser.id]);

  return (
    <div className="h-[100dvh] max-h-[100dvh] w-full flex flex-col bg-[#0a0d14] text-slate-100 select-none overflow-hidden relative font-sans">
      {/* 1. Main Pane Header (Apple macOS style title bar) */}
      <header className="h-12 w-full px-3 sm:px-5 flex items-center justify-between border-b border-white/5 bg-[#121620] shrink-0 z-20">
        {/* Left: Branding & Feature Identity with Apple squircle badge */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
            <Layers className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex items-baseline gap-2">
            <h1 className="text-sm font-bold text-white tracking-tight truncate">
              Backtester Nodes
            </h1>
            <span className="hidden md:inline text-[11px] text-slate-400">
              macOS Edition
            </span>
          </div>
        </div>

        {/* Right: User Profile, Session Journal Button next to Close button */}
        <div className="flex items-center gap-2">
          {/* User profile trigger */}
          <button
            type="button"
            onClick={() => setIsAccountModalOpen(true)}
            title={`Account: ${currentUser.name} (${currentUser.email})`}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-slate-200 transition-all cursor-pointer"
          >
            <div
              className="w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold text-slate-900 shrink-0"
              style={{ backgroundColor: currentUser.avatarColor }}
            >
              {currentUser.name[0]}
            </div>
            <span className="hidden sm:inline text-[11px] font-medium max-w-[100px] truncate">
              {currentUser.name}
            </span>
          </button>

          {/* SESSION JOURNAL BUTTON (Right next to Close button) */}
          <div className="flex items-center pl-1.5 border-l border-white/10 gap-1.5">
            <button
              type="button"
              onClick={() => setIsJournalModalOpen(true)}
              title={`Open Session Journal (${state.notes?.length || 0} notes)`}
              aria-label="Open Session Journal"
              className="px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 active:bg-white/15 border border-white/10 text-slate-200 hover:text-white transition-all cursor-pointer flex items-center gap-1.5 relative group"
            >
              <BookOpen className="w-4 h-4 text-emerald-400" />
              <span className="hidden sm:inline text-xs font-medium">Journal</span>
              {state.notes && state.notes.length > 0 && (
                <span className="text-[10px] font-mono font-semibold px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300">
                  {state.notes.length}
                </span>
              )}
            </button>

            {/* Close / Minimize Pane Button */}
            {onClose ? (
              <button
                type="button"
                onClick={onClose}
                aria-label="Close pane"
                title="Close Backtester Nodes"
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  showFeedback('Backtester Nodes active in standalone full view', 'info');
                }}
                aria-label="Maximize pane"
                title="Standalone Active"
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* 2. Goal and Progress Counter Section */}
      <ProgressHeader
        completedCount={state.completedCount}
        goal={state.goal}
        currentPage={state.currentPage}
        totalPages={totalPages}
        activeNodePage={activeNodePage}
        soundEnabled={state.soundEnabled}
        sessionTitle={state.sessionTitle}
        notesCount={state.notes?.length || 0}
        onGoalChange={handleGoalChange}
        onPageChange={handlePageChange}
        onOpenResetModal={() => setIsResetModalOpen(true)}
        onOpenGoalModal={() => setIsGoalModalOpen(true)}
        onUndoLast={handleUndoLast}
        onToggleSound={handleToggleSound}
        onUpdateSessionTitle={handleUpdateSessionTitle}
        onOpenJournal={() => setIsJournalModalOpen(true)}
      />

      {/* Notification Toast (Apple macOS subtle banner, NO glow) */}
      {notification && (
        <div className="absolute top-24 left-1/2 -translate-x-1/2 z-40 max-w-[92vw] px-4 py-2 rounded-2xl bg-[#181d2a]/95 border border-white/10 shadow-2xl backdrop-blur-md flex items-center gap-2.5 text-xs animate-in fade-in slide-in-from-top-2 duration-150">
          {notification.type === 'warn' && <Info className="w-4 h-4 text-amber-400 shrink-0" />}
          {notification.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
          {notification.type === 'info' && <Info className="w-4 h-4 text-blue-400 shrink-0" />}
          <span className="text-slate-200 font-medium">{notification.message}</span>
        </div>
      )}

      {/* Goal Completion Banner (Matte Apple style, NO glow, NO falling confetti) */}
      {showGoalCelebration && state.completedCount >= state.goal && (
        <div className="w-full bg-[#18231c] border-b border-emerald-500/30 px-4 py-2 flex items-center justify-between text-xs text-emerald-300 shrink-0 z-10 animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-semibold">
              Goal of {state.goal.toLocaleString()} Completed! Sequence backtesting verified.
            </span>
          </div>
          <button
            type="button"
            onClick={() => setShowGoalCelebration(false)}
            className="text-emerald-400/80 hover:text-white text-xs px-2 py-0.5 rounded-lg cursor-pointer hover:bg-white/5 transition-colors"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* 3. The 100-Node Grid Container (FITS 100% WITHOUT SCROLLING, Apple rounded squircle nodes) */}
      <main className="flex-1 min-h-0 w-full flex items-center justify-center p-1 sm:p-2.5 overflow-hidden relative">
        <NodeGrid
          currentPage={state.currentPage}
          completedCount={state.completedCount}
          goal={state.goal}
          onNodeClick={handleNodeClick}
          onAttemptInvalidClick={handleAttemptInvalidClick}
        />
      </main>

      {/* 4. Compact Footer / Status Legend (Apple style) */}
      <footer className="h-8 w-full border-t border-white/5 bg-[#0f131c] px-3 sm:px-5 flex items-center justify-between text-[11px] text-slate-400 shrink-0 select-none">
        <div className="flex items-center gap-3 sm:gap-5 overflow-hidden">
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="w-2.5 h-2.5 rounded-md bg-emerald-500 inline-block" />
            <span>Completed</span>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="w-2.5 h-2.5 rounded-md bg-rose-500 inline-block ring-1 ring-white/40" />
            <span className="font-medium text-slate-200">Next Actionable</span>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="w-2.5 h-2.5 rounded-md bg-[#19151e] border border-rose-950/40 inline-block" />
            <span className="text-slate-400">Locked Red</span>
          </div>
        </div>

        <div className="font-mono text-[11px] text-slate-400 shrink-0 flex items-center gap-2">
          <span>Active:</span>
          <span className="font-bold text-white bg-white/5 px-2 py-0.5 rounded-lg">
            {state.completedCount < state.goal ? `#${state.completedCount + 1}` : 'Finished'}
          </span>
        </div>
      </footer>

      {/* Modals */}
      <SessionJournalModal
        isOpen={isJournalModalOpen}
        notes={state.notes || []}
        currentSessionTitle={state.sessionTitle}
        currentCompletedCount={state.completedCount}
        onClose={() => setIsJournalModalOpen(false)}
        onSaveNotes={handleSaveNotes}
        onUpdateSessionTitle={handleUpdateSessionTitle}
      />

      <ResetConfirmModal
        isOpen={isResetModalOpen}
        completedCount={state.completedCount}
        goal={state.goal}
        onCancel={() => setIsResetModalOpen(false)}
        onConfirmReset={handleConfirmReset}
      />

      <GoalSettingsModal
        isOpen={isGoalModalOpen}
        currentGoal={state.goal}
        currentProgress={state.completedCount}
        onClose={() => setIsGoalModalOpen(false)}
        onSaveGoal={handleGoalChange}
      />

      <AccountManagerModal
        isOpen={isAccountModalOpen}
        currentUser={currentUser}
        onSwitchUser={handleSwitchUser}
        onClose={() => setIsAccountModalOpen(false)}
        onImportState={handleImportState}
      />
    </div>
  );
};

