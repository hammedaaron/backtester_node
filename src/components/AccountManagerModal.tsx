import React, { useState } from 'react';
import { User, ShieldCheck, Download, Upload, CheckCircle2, X } from 'lucide-react';
import { UserAccount, BacktesterState } from '../types';
import { DEFAULT_ACCOUNTS, exportBackupData, importBackupData } from '../utils/storage';

interface AccountManagerModalProps {
  isOpen: boolean;
  currentUser: UserAccount;
  onSwitchUser: (newUser: UserAccount) => void;
  onClose: () => void;
  onImportState: (state: BacktesterState) => void;
}

export const AccountManagerModal: React.FC<AccountManagerModalProps> = ({
  isOpen,
  currentUser,
  onSwitchUser,
  onClose,
  onImportState,
}) => {
  const [importNotice, setImportNotice] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleExport = () => {
    const dataStr = exportBackupData(currentUser.id);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backtester-nodes-${currentUser.name.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const imported = importBackupData(currentUser.id, content);
      if (imported) {
        onImportState(imported);
        setImportNotice('Data restored successfully!');
        setTimeout(() => setImportNotice(null), 3000);
      } else {
        setImportNotice('Failed to import: invalid file format.');
        setTimeout(() => setImportNotice(null), 3000);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-150"
    >
      <div
        className="w-full max-w-md bg-[#121620] border border-white/10 rounded-3xl shadow-2xl p-6 text-slate-100 flex flex-col gap-4 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Close dialog"
          className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-start gap-3">
          <div className="p-3 rounded-2xl bg-blue-950/60 border border-blue-800/40 text-blue-400 shrink-0 mt-0.5">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-white tracking-tight">
              User Account & Data Persistence
            </h2>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Each user profile maintains its own goal, completed nodes, and session journal independently. Switch profiles or reload without losing progress.
            </p>
          </div>
        </div>

        {/* Profiles list */}
        <div className="space-y-1.5">
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
            Active Accounts
          </span>
          <div className="space-y-2">
            {DEFAULT_ACCOUNTS.map((acc) => {
              const isActive = acc.id === currentUser.id;
              return (
                <button
                  key={acc.id}
                  onClick={() => {
                    onSwitchUser(acc);
                  }}
                  className={`w-full flex items-center justify-between p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                    isActive
                      ? 'bg-blue-950/40 border-blue-500/50 text-white'
                      : 'bg-white/5 border-white/5 text-slate-300 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs text-slate-900 shrink-0"
                      style={{ backgroundColor: acc.avatarColor }}
                    >
                      {acc.name[0]}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-white truncate">{acc.name}</p>
                      <p className="text-[11px] text-slate-400 truncate">{acc.email}</p>
                    </div>
                  </div>
                  {isActive && (
                    <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-medium shrink-0">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Active
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Data Persistence Tools */}
        <div className="bg-[#181d2a] border border-white/5 rounded-2xl p-3.5 text-xs space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-medium">Auto-Save State:</span>
            <span className="text-emerald-400 flex items-center gap-1 font-mono text-[11px]">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Synced & Permanent
            </span>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={handleExport}
              className="flex-1 px-3 py-2 bg-white/5 hover:bg-white/10 text-slate-200 rounded-xl border border-white/5 flex items-center justify-center gap-1.5 text-xs font-medium transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-blue-400" />
              Export Backup
            </button>
            <label className="flex-1 px-3 py-2 bg-white/5 hover:bg-white/10 text-slate-200 rounded-xl border border-white/5 flex items-center justify-center gap-1.5 text-xs font-medium transition-all cursor-pointer">
              <Upload className="w-3.5 h-3.5 text-emerald-400" />
              Import Backup
              <input
                type="file"
                accept=".json"
                onChange={handleFileImport}
                className="hidden"
              />
            </label>
          </div>

          {importNotice && (
            <p className="text-center text-xs text-emerald-300 font-medium">
              {importNotice}
            </p>
          )}
        </div>

        <div className="pt-1">
          <button
            type="button"
            onClick={onClose}
            className="w-full px-4 py-2.5 text-xs font-medium text-slate-300 bg-white/5 hover:bg-white/10 hover:text-white rounded-xl border border-white/5 transition-all cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
