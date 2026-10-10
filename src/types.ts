export interface UserAccount {
  id: string;
  name: string;
  email: string;
  avatarColor: string;
}

export interface NodeCompletionRecord {
  nodeGlobalIndex: number;
  completedAt: string;
}

export interface JournalNote {
  id: string;
  title: string;
  content: string;
  sessionTitle: string;
  linkedNodeIndex?: number;
  createdAt: string;
  updatedAt: string;
}

export interface BacktesterState {
  goal: number;
  completedCount: number;
  currentPage: number;
  soundEnabled: boolean;
  vibrateEnabled: boolean;
  sessionTitle: string;
  notes: JournalNote[];
  lastUpdated: string;
  history?: NodeCompletionRecord[];
}

export type NodeStatus = 'completed' | 'current' | 'locked' | 'beyond-goal';

export interface GridNodeInfo {
  pageIndex: number; // 1 to 100
  globalIndex: number; // 1 to goal/page*100
  status: NodeStatus;
  isCompleted: boolean;
  isNext: boolean;
  isLocked: boolean;
  isBeyondGoal: boolean;
}
