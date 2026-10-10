import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Search,
  Bold,
  Italic,
  List,
  ListOrdered,
  Quote,
  Code,
  Eye,
  Edit3,
  LayoutGrid,
  LayoutList,
  ArrowLeft,
  Plus,
  Trash2,
  ChevronRight,
  FileText,
} from 'lucide-react';
import { JournalNote } from '../types';

interface SessionJournalModalProps {
  isOpen: boolean;
  notes: JournalNote[];
  currentSessionTitle: string;
  currentCompletedCount: number;
  onClose: () => void;
  onSaveNotes: (notes: JournalNote[]) => void;
  onUpdateSessionTitle: (title: string) => void;
}

export const SessionJournalModal: React.FC<SessionJournalModalProps> = ({
  isOpen,
  notes,
  currentSessionTitle,
  currentCompletedCount,
  onClose,
  onSaveNotes,
  onUpdateSessionTitle,
}) => {
  const [currentScreen, setCurrentScreen] = useState<'editor' | 'overview'>('editor');
  const [overviewLayout, setOverviewLayout] = useState<'grid' | 'list'>('grid');
  const [activeNoteId, setActiveNoteId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'edit' | 'preview'>('edit');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const matchedNote = notes.find(
      (n) => n.sessionTitle.trim().toLowerCase() === currentSessionTitle.trim().toLowerCase()
    );

    if (matchedNote) {
      setActiveNoteId(matchedNote.id);
    } else if (notes.length > 0) {
      setActiveNoteId(notes[0].id);
    } else {
      const newNote: JournalNote = {
        id: `note_${Date.now()}`,
        title: currentSessionTitle || 'Session Journal',
        sessionTitle: currentSessionTitle || 'Session',
        linkedNodeIndex: currentCompletedCount,
        content: `# ${currentSessionTitle || 'Session Journal'}\n\nDocument trade setups, executions, and notes here.\n\n## Rules\n- Risk/Reward: 1:2\n- Completed Nodes: ${currentCompletedCount}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      onSaveNotes([newNote]);
      setActiveNoteId(newNote.id);
    }

    setCurrentScreen('editor');
  }, [isOpen, currentSessionTitle]);

  if (!isOpen) return null;

  const activeNote = notes.find((n) => n.id === activeNoteId) || notes[0];

  const filteredNotes = notes.filter(
    (n) =>
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenNote = (noteId: string) => {
    setActiveNoteId(noteId);
    setCurrentScreen('editor');
  };

  const handleCreateNewNote = () => {
    const newNote: JournalNote = {
      id: `note_${Date.now()}`,
      title: `${currentSessionTitle || 'Session'} ${notes.length + 1}`,
      sessionTitle: currentSessionTitle,
      linkedNodeIndex: currentCompletedCount,
      content: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const updated = [newNote, ...notes];
    onSaveNotes(updated);
    setActiveNoteId(newNote.id);
    setCurrentScreen('editor');
  };

  const handleDeleteNote = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (notes.length <= 1) return;
    const updated = notes.filter((n) => n.id !== id);
    onSaveNotes(updated);
    if (activeNoteId === id) {
      setActiveNoteId(updated[0].id);
    }
  };

  const handleUpdateActiveNote = (updates: Partial<JournalNote>) => {
    if (!activeNote) return;
    const now = new Date().toISOString();
    const updatedNotes = notes.map((n) => {
      if (n.id === activeNote.id) {
        return { ...n, ...updates, updatedAt: now };
      }
      return n;
    });
    onSaveNotes(updatedNotes);
  };

  const applyFormatting = (prefix: string, suffix: string = '', isLineStart: boolean = false) => {
    const textarea = textareaRef.current;
    if (!textarea || !activeNote) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentText = activeNote.content;
    const selectedText = currentText.substring(start, end);

    let replacement = '';
    let newCursorPos = start;

    if (isLineStart) {
      const lineStart = currentText.lastIndexOf('\n', start - 1) + 1;
      const lineEnd = currentText.indexOf('\n', end);
      const effectiveLineEnd = lineEnd === -1 ? currentText.length : lineEnd;
      const fullLine = currentText.substring(lineStart, effectiveLineEnd);

      const cleanLine = fullLine.replace(/^#{1,6}\s*/, '');
      const newLine = `${prefix}${cleanLine}`;

      const before = currentText.substring(0, lineStart);
      const after = currentText.substring(effectiveLineEnd);
      replacement = before + newLine + after;
      newCursorPos = lineStart + newLine.length;

      handleUpdateActiveNote({ content: replacement });
    } else {
      const wrapText = selectedText || 'text';
      const before = currentText.substring(0, start);
      const after = currentText.substring(end);
      replacement = before + prefix + wrapText + suffix + after;
      newCursorPos = start + prefix.length + wrapText.length + suffix.length;

      handleUpdateActiveNote({ content: replacement });
    }

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 10);
  };

  const renderFormattedPreview = (markdown: string) => {
    const lines = markdown.split('\n');
    return (
      <div className="space-y-3 font-sans text-slate-200 leading-relaxed text-sm">
        {lines.map((line, idx) => {
          if (line.startsWith('# ')) {
            return (
              <h1 key={idx} className="text-xl font-bold text-white border-b border-white/5 pb-2 mt-2">
                {line.replace('# ', '')}
              </h1>
            );
          }
          if (line.startsWith('## ')) {
            return (
              <h2 key={idx} className="text-base font-semibold text-emerald-400 mt-2">
                {line.replace('## ', '')}
              </h2>
            );
          }
          if (line.startsWith('> ')) {
            return (
              <blockquote key={idx} className="border-l-2 border-emerald-500 pl-3 italic text-slate-400 my-2">
                {line.replace('> ', '')}
              </blockquote>
            );
          }
          if (line.startsWith('- ') || line.startsWith('* ')) {
            return (
              <li key={idx} className="ml-4 list-disc text-slate-300">
                {line.replace(/^[-*]\s*/, '')}
              </li>
            );
          }
          if (/^\d+\.\s/.test(line)) {
            return (
              <li key={idx} className="ml-4 list-decimal text-slate-300">
                {line.replace(/^\d+\.\s*/, '')}
              </li>
            );
          }
          if (line.trim() === '') {
            return <div key={idx} className="h-2" />;
          }
          return (
            <p key={idx} className="text-slate-300">
              {line}
            </p>
          );
        })}
      </div>
    );
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150"
    >
      {/* Apple macOS style window container with clean squircle rounded-3xl corners */}
      <div
        className="w-full max-w-4xl h-[92vh] max-h-[850px] bg-[#0e1118] border border-white/10 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Minimal macOS Title Bar */}
        <header className="h-11 px-4 bg-[#141822] border-b border-white/5 flex items-center justify-between shrink-0 select-none">
          {/* Traffic light window controls + Clean Back Navigation */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                title="Close"
                className="w-3 h-3 rounded-full bg-[#ff5f56] hover:brightness-110 active:brightness-90 transition-all flex items-center justify-center group cursor-pointer"
              >
                <X className="w-2 h-2 text-black/60 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
              <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
              <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
            </div>

            {currentScreen === 'editor' ? (
              <button
                type="button"
                onClick={() => setCurrentScreen('overview')}
                title="View All Notes"
                className="flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-colors cursor-pointer ml-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Notes</span>
              </button>
            ) : (
              <span className="text-xs font-semibold text-slate-300 ml-1">
                Notes
              </span>
            )}
          </div>

          {/* Minimal Controls */}
          <div className="flex items-center gap-2">
            {currentScreen === 'overview' ? (
              <div className="flex items-center gap-1.5">
                {/* Clean View Toggle */}
                <div className="flex items-center p-0.5 bg-black/30 rounded-lg border border-white/5">
                  <button
                    type="button"
                    onClick={() => setOverviewLayout('grid')}
                    title="Grid"
                    className={`p-1 rounded-md transition-colors cursor-pointer ${
                      overviewLayout === 'grid'
                        ? 'bg-white/10 text-white'
                        : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    <LayoutGrid className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setOverviewLayout('list')}
                    title="List"
                    className={`p-1 rounded-md transition-colors cursor-pointer ${
                      overviewLayout === 'list'
                        ? 'bg-white/10 text-white'
                        : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    <LayoutList className="w-3.5 h-3.5" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleCreateNewNote}
                  title="New Note"
                  className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>New</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                {/* Icon-only Edit / Preview Toggle */}
                <div className="flex items-center p-0.5 bg-black/30 rounded-lg border border-white/5">
                  <button
                    type="button"
                    onClick={() => setViewMode('edit')}
                    title="Edit"
                    className={`p-1 rounded-md transition-colors cursor-pointer ${
                      viewMode === 'edit'
                        ? 'bg-white/10 text-white'
                        : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('preview')}
                    title="Preview"
                    className={`p-1 rounded-md transition-colors cursor-pointer ${
                      viewMode === 'preview'
                        ? 'bg-white/10 text-white'
                        : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            <button
              onClick={onClose}
              title="Close"
              className="p-1 rounded-lg text-slate-500 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* SCREEN 1: OVERVIEW (MINIMAL LIST OR GRID) */}
        {currentScreen === 'overview' ? (
          <div className="flex-1 min-h-0 flex flex-col p-4 sm:p-6 overflow-hidden bg-[#0c0f16]">
            {/* Minimal Search Bar */}
            <div className="relative mb-4 shrink-0 max-w-sm">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#141822] border border-white/5 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-white/20"
              />
            </div>

            {/* List or Grid */}
            <div className="flex-1 min-h-0 overflow-y-auto pr-1">
              {filteredNotes.length === 0 ? (
                <div className="h-full flex items-center justify-center text-slate-600 text-xs">
                  No notes found.
                </div>
              ) : overviewLayout === 'grid' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {filteredNotes.map((note) => (
                    <div
                      key={note.id}
                      onClick={() => handleOpenNote(note.id)}
                      className="group p-4 rounded-2xl border border-white/5 bg-[#121620] hover:bg-[#161b27] hover:border-white/15 transition-all cursor-pointer flex flex-col justify-between h-36 relative"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <h3 className="text-xs font-semibold text-white group-hover:text-emerald-400 transition-colors truncate">
                            {note.title || 'Untitled'}
                          </h3>
                          {notes.length > 1 && (
                            <button
                              type="button"
                              onClick={(e) => handleDeleteNote(note.id, e)}
                              title="Delete"
                              className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-rose-400 transition-opacity"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>

                        <p className="text-[11px] text-slate-400 line-clamp-3 leading-relaxed">
                          {note.content.replace(/[#*`>-]/g, '').trim() || 'Empty...'}
                        </p>
                      </div>

                      <div className="text-[10px] text-slate-600 font-mono flex items-center justify-between pt-1 border-t border-white/5">
                        <span>{note.sessionTitle}</span>
                        <span>{new Date(note.updatedAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-1.5">
                  {filteredNotes.map((note) => (
                    <div
                      key={note.id}
                      onClick={() => handleOpenNote(note.id)}
                      className="group px-3.5 py-2.5 rounded-xl border border-white/5 bg-[#121620] hover:bg-[#161b27] hover:border-white/15 transition-all cursor-pointer flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <FileText className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <h4 className="text-xs font-medium text-white group-hover:text-emerald-400 transition-colors truncate max-w-xs">
                          {note.title || 'Untitled'}
                        </h4>
                        <span className="text-[11px] text-slate-500 truncate hidden sm:inline max-w-md">
                          {note.content.replace(/[#*`>-]/g, '').trim() || 'Empty...'}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 shrink-0 text-[10px] font-mono text-slate-500">
                        <span>{new Date(note.updatedAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                        {notes.length > 1 && (
                          <button
                            type="button"
                            onClick={(e) => handleDeleteNote(note.id, e)}
                            title="Delete"
                            className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-rose-400 transition-opacity"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                        <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-300 transition-colors" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          /* SCREEN 2: CLEAN MINIMALIST WRITING CANVAS */
          <main className="flex-1 min-h-0 flex flex-col bg-[#0e1118]">
            {/* Pure, Simple Title Input (Zero clutter, zero noise) */}
            <div className="px-6 pt-4 pb-2 bg-transparent flex items-center justify-between border-b border-white/5">
              <input
                type="text"
                value={activeNote?.title || ''}
                onChange={(e) => handleUpdateActiveNote({ title: e.target.value })}
                placeholder="Title"
                className="w-full bg-transparent font-semibold text-lg text-white border-none focus:outline-none placeholder-slate-600 truncate"
              />
            </div>

            {/* Minimalist Icon-Only Toolbar */}
            <div className="px-6 py-1.5 bg-[#121620] border-b border-white/5 flex items-center gap-2 select-none shrink-0">
              {/* Heading Tools */}
              <div className="flex items-center gap-0.5 pr-2 border-r border-white/5">
                <button
                  type="button"
                  onClick={() => applyFormatting('# ', '', true)}
                  title="Heading 1"
                  className="px-1.5 py-0.5 rounded text-[11px] font-bold text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                >
                  H1
                </button>
                <button
                  type="button"
                  onClick={() => applyFormatting('## ', '', true)}
                  title="Heading 2"
                  className="px-1.5 py-0.5 rounded text-[11px] font-semibold text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                >
                  H2
                </button>
              </div>

              {/* Bold & Italic */}
              <div className="flex items-center gap-0.5 pr-2 border-r border-white/5">
                <button
                  type="button"
                  onClick={() => applyFormatting('**', '**')}
                  title="Bold"
                  className="p-1 rounded text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                >
                  <Bold className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => applyFormatting('*', '*')}
                  title="Italic"
                  className="p-1 rounded text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                >
                  <Italic className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Lists */}
              <div className="flex items-center gap-0.5 pr-2 border-r border-white/5">
                <button
                  type="button"
                  onClick={() => applyFormatting('- ', '', true)}
                  title="Bullet list"
                  className="p-1 rounded text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                >
                  <List className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => applyFormatting('1. ', '', true)}
                  title="Numbered list"
                  className="p-1 rounded text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                >
                  <ListOrdered className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Quote & Code */}
              <div className="flex items-center gap-0.5">
                <button
                  type="button"
                  onClick={() => applyFormatting('> ', '', true)}
                  title="Quote"
                  className="p-1 rounded text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                >
                  <Quote className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => applyFormatting('`', '`')}
                  title="Code"
                  className="p-1 rounded text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                >
                  <Code className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Clean Writing Canvas */}
            <div className="flex-1 min-h-0 px-6 py-5 overflow-y-auto">
              {viewMode === 'edit' ? (
                <textarea
                  ref={textareaRef}
                  value={activeNote?.content || ''}
                  onChange={(e) => handleUpdateActiveNote({ content: e.target.value })}
                  placeholder="Start writing..."
                  className="w-full h-full bg-transparent text-slate-200 placeholder-slate-700 resize-none focus:outline-none font-mono text-sm leading-relaxed border-none"
                  autoFocus
                />
              ) : (
                <div className="max-w-2xl">
                  {renderFormattedPreview(activeNote?.content || '')}
                </div>
              )}
            </div>
          </main>
        )}
      </div>
    </div>
  );
};
