import { BacktesterState, UserAccount } from '../types';

export const DEFAULT_ACCOUNTS: UserAccount[] = [
  {
    id: 'user_hammed_default',
    name: 'Hammed O.',
    email: 'hammedobrien@gmail.com',
    avatarColor: '#10b981',
  },
  {
    id: 'user_prop_trader',
    name: 'Funded Challenge 2026',
    email: 'funded-trader@algo.pro',
    avatarColor: '#3b82f6',
  },
  {
    id: 'user_scalping_lab',
    name: 'Scalping Lab',
    email: 'scalp-strategy@testing.net',
    avatarColor: '#8b5cf6',
  },
];

const ACTIVE_USER_KEY = 'backtester_active_user_id';
const STORAGE_PREFIX = 'backtester_nodes_state_v2_';

export function getActiveUserId(): string {
  if (typeof window === 'undefined') return DEFAULT_ACCOUNTS[0].id;
  try {
    const saved = localStorage.getItem(ACTIVE_USER_KEY);
    if (saved) return saved;
  } catch (e) {
    console.warn('Storage read error:', e);
  }
  return DEFAULT_ACCOUNTS[0].id;
}

export function setActiveUserId(userId: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(ACTIVE_USER_KEY, userId);
  } catch (e) {
    console.warn('Storage write error:', e);
  }
}

export const INITIAL_STATE: BacktesterState = {
  goal: 1000,
  completedCount: 0,
  currentPage: 1,
  soundEnabled: true,
  vibrateEnabled: true,
  sessionTitle: 'NQ London Breakout 2026',
  notes: [
    {
      id: 'note_init_1',
      title: 'NQ London Breakout 2026',
      sessionTitle: 'NQ London Breakout 2026',
      content: '## Session Overview\n- Strategy: London Breakout 15M\n- Focus: Sweep of Asian range high/low followed by MSS\n\n### Observations & Execution Rules\n1. Wait for 08:00 UTC liquidity grab\n2. Require FVG displacement before entry\n3. Strict 1:2 Risk/Reward target on all nodes',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
  lastUpdated: new Date().toISOString(),
  history: [],
};

export function loadBacktesterState(userId: string): BacktesterState {
  if (typeof window === 'undefined') return INITIAL_STATE;

  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${userId}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Sanitize and validate
      const goal = typeof parsed.goal === 'number' && parsed.goal > 0 ? Math.floor(parsed.goal) : 1000;
      const completedCount = typeof parsed.completedCount === 'number' && parsed.completedCount >= 0
        ? Math.floor(parsed.completedCount)
        : 0;
      
      const totalPages = Math.max(1, Math.ceil(goal / 100));
      let currentPage = typeof parsed.currentPage === 'number' && parsed.currentPage >= 1
        ? Math.floor(parsed.currentPage)
        : 1;
      
      if (currentPage > totalPages) {
        currentPage = totalPages;
      }

      const sessionTitle = typeof parsed.sessionTitle === 'string' && parsed.sessionTitle.trim()
        ? parsed.sessionTitle.trim()
        : 'Session 1: Primary Backtest';

      const notes = Array.isArray(parsed.notes) && parsed.notes.length > 0
        ? parsed.notes
        : [
            {
              id: 'note_default_1',
              title: sessionTitle,
              sessionTitle: sessionTitle,
              content: '## Session Notes\nDocument your trade rationale, setups, and psychology per node sequence here.',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          ];

      return {
        goal,
        completedCount,
        currentPage,
        soundEnabled: parsed.soundEnabled ?? true,
        vibrateEnabled: parsed.vibrateEnabled ?? true,
        sessionTitle,
        notes,
        lastUpdated: parsed.lastUpdated || new Date().toISOString(),
        history: Array.isArray(parsed.history) ? parsed.history : [],
      };
    }
  } catch (err) {
    console.warn('Failed to parse saved backtester state:', err);
  }

  return INITIAL_STATE;
}

export function saveBacktesterState(userId: string, state: BacktesterState): void {
  if (typeof window === 'undefined') return;
  try {
    const sanitized: BacktesterState = {
      ...state,
      goal: Math.max(1, Math.floor(state.goal)),
      completedCount: Math.max(0, Math.floor(state.completedCount)),
      currentPage: Math.max(1, Math.floor(state.currentPage)),
      sessionTitle: state.sessionTitle || 'Primary Session',
      notes: Array.isArray(state.notes) ? state.notes : [],
      lastUpdated: new Date().toISOString(),
    };
    localStorage.setItem(`${STORAGE_PREFIX}${userId}`, JSON.stringify(sanitized));
  } catch (err) {
    console.error('Failed to save backtester state to localStorage:', err);
  }
}

export function clearBacktesterProgress(
  userId: string,
  existingGoal: number,
  existingSessionTitle?: string,
  existingNotes?: BacktesterState['notes']
): BacktesterState {
  const resetState: BacktesterState = {
    goal: existingGoal, // Preserves configured goal
    completedCount: 0,
    currentPage: 1,
    soundEnabled: true,
    vibrateEnabled: true,
    sessionTitle: existingSessionTitle || 'Primary Session',
    notes: existingNotes || [],
    lastUpdated: new Date().toISOString(),
    history: [],
  };
  saveBacktesterState(userId, resetState);
  return resetState;
}

export function exportBackupData(userId: string): string {
  const state = loadBacktesterState(userId);
  return JSON.stringify(
    {
      app: 'Backtester Nodes',
      version: '2.0',
      userId,
      timestamp: new Date().toISOString(),
      data: state,
    },
    null,
    2
  );
}

export function importBackupData(userId: string, jsonString: string): BacktesterState | null {
  try {
    const parsed = JSON.parse(jsonString);
    const data = parsed.data || parsed;
    if (typeof data.goal === 'number' && typeof data.completedCount === 'number') {
      const state: BacktesterState = {
        goal: Math.max(1, Math.floor(data.goal)),
        completedCount: Math.max(0, Math.floor(data.completedCount)),
        currentPage: Math.max(1, Math.floor(data.currentPage || 1)),
        soundEnabled: data.soundEnabled ?? true,
        vibrateEnabled: data.vibrateEnabled ?? true,
        sessionTitle: data.sessionTitle || 'Restored Session',
        notes: Array.isArray(data.notes) ? data.notes : [],
        lastUpdated: new Date().toISOString(),
        history: Array.isArray(data.history) ? data.history : [],
      };
      saveBacktesterState(userId, state);
      return state;
    }
  } catch (err) {
    console.error('Failed to import backup:', err);
  }
  return null;
}
