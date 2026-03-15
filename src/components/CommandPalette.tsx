import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, Moon, Sun, Download, Archive, LayoutDashboard, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useNotes } from '../context/NotesContext';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onCreateNote: () => void;
  onToggleTheme: () => void;
  isDark: boolean;
}

export const CommandPalette = ({ isOpen, onClose, onCreateNote, onToggleTheme, isDark }: Props) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { exportNotes } = useNotes();

  useEffect(() => {
    if (isOpen) { setTimeout(() => inputRef.current?.focus(), 100); setQuery(''); }
  }, [isOpen]);

  const commands = [
    { id: 'new', title: 'Create New Note', icon: <Plus className="w-4 h-4" />, action: onCreateNote, category: 'Actions' },
    { id: 'search', title: 'Search Notes', icon: <Search className="w-4 h-4" />, action: () => { navigate('/notes'); setTimeout(()=>document.getElementById('search-input')?.focus(), 100); }, category: 'Actions' },
    { id: 'theme', title: `Toggle ${isDark ? 'Light' : 'Dark'} Mode`, icon: isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />, action: onToggleTheme, category: 'Preferences' },
    { id: 'dash', title: 'Go to Dashboard', icon: <LayoutDashboard className="w-4 h-4" />, action: () => navigate('/'), category: 'Navigation' },
    { id: 'notes', title: 'Go to All Notes', icon: <FileText className="w-4 h-4" />, action: () => navigate('/notes'), category: 'Navigation' },
    { id: 'archived', title: 'Go to Archived', icon: <Archive className="w-4 h-4" />, action: () => navigate('/archived'), category: 'Navigation' },
    { id: 'export-json', title: 'Export Notes (JSON)', icon: <Download className="w-4 h-4" />, action: () => exportNotes('json'), category: 'Data' },
    { id: 'export-txt', title: 'Export Notes (TXT)', icon: <Download className="w-4 h-4" />, action: () => exportNotes('txt'), category: 'Data' },
  ];

  const filteredCommands = commands.filter(c => c.title.toLowerCase().includes(query.toLowerCase()));

  const groupedCommands = filteredCommands.reduce((acc, cmd) => {
    if (!acc[cmd.category]) acc[cmd.category] = [];
    acc[cmd.category].push(cmd);
    return acc;
  }, {} as Record<string, typeof commands>);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[20vh] px-4 bg-slate-900/40 backdrop-blur-sm" onClick={onClose}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: -20 }} transition={{ duration: 0.15, ease: 'easeOut' }}
          onClick={e => e.stopPropagation()}
          className="w-full max-w-xl bg-white dark:bg-slate-800 rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-700 flex flex-col max-h-[60vh]"
        >
          <div className="flex items-center px-4 py-3 border-b border-slate-100 dark:border-slate-700/50 shrink-0">
            <Search className="w-5 h-5 text-slate-400 mr-3" />
            <input ref={inputRef} type="text" placeholder="Type a command or search..." value={query} onChange={(e) => setQuery(e.target.value)} className="flex-1 bg-transparent border-none outline-none text-slate-900 dark:text-white placeholder:text-slate-400" />
            <span className="text-xs text-slate-400 font-medium px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded">ESC</span>
          </div>
          
          <div className="flex-1 overflow-y-auto p-2">
            {filteredCommands.length === 0 ? (
              <div className="px-4 py-8 text-center text-slate-500 text-sm">No commands found.</div>
            ) : (
              Object.entries(groupedCommands).map(([category, cmds]) => (
                <div key={category} className="mb-2">
                  <div className="px-3 py-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">{category}</div>
                  {cmds.map((cmd) => (
                    <button key={cmd.id} onClick={() => { cmd.action(); onClose(); }} className="w-full flex items-center px-3 py-2.5 text-sm text-left text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50 rounded-xl transition-colors group">
                      <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center mr-3 group-hover:bg-white dark:group-hover:bg-slate-600 transition-colors text-slate-500 dark:text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-violet-400">
                        {cmd.icon}
                      </div>
                      {cmd.title}
                    </button>
                  ))}
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
