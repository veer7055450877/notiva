import React, { useEffect } from 'react';
import { Note } from '../types';
import { X, Clock, Edit2, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';

interface Props {
  note: Note | null;
  onClose: () => void;
}

export const FocusMode = ({ note, onClose }: Props) => {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  if (!note) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-[60] bg-white dark:bg-[#0f172a] overflow-y-auto"
      >
        <div className="max-w-4xl mx-auto px-6 py-12 relative min-h-screen flex flex-col md:flex-row gap-12">
          
          {/* Main Content */}
          <div className="flex-1 mt-12">
            <button 
              onClick={onClose}
              className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              <X className="w-4 h-4" /> Close Focus Mode
            </button>
            <h1 className="text-4xl md:text-5xl font-bold mb-8 text-slate-900 dark:text-white leading-tight tracking-tight">
              {note.title || 'Untitled Note'}
            </h1>
            <div className="prose prose-lg dark:prose-invert max-w-none">
              <p className="whitespace-pre-wrap text-slate-700 dark:text-slate-300 leading-relaxed text-lg">
                {note.content}
              </p>
            </div>
          </div>

          {/* Sidebar: Timeline History */}
          <div className="w-full md:w-64 mt-12 md:mt-32 shrink-0">
            <div className="sticky top-12">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-6 flex items-center gap-2">
                <Clock className="w-4 h-4" /> Edit History
              </h3>
              <div className="space-y-6 relative before:absolute before:inset-0 before:ml-2 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 dark:before:via-slate-700 before:to-transparent">
                {(note.history || []).map((entry, idx) => (
                  <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                    <div className="flex items-center justify-center w-5 h-5 rounded-full border-2 border-white dark:border-slate-900 bg-indigo-500 dark:bg-violet-500 text-slate-50 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                      {entry.action === 'created' ? <Plus className="w-3 h-3" /> : <Edit2 className="w-3 h-3" />}
                    </div>
                    <div className="w-[calc(100%-2.5rem)] md:w-[calc(50%-1.5rem)] p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 shadow-sm">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-sm text-slate-900 dark:text-white capitalize">{entry.action}</span>
                      </div>
                      <div className="text-xs text-slate-500">{format(entry.timestamp, 'MMM d, yyyy • h:mm a')}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </motion.div>
    </AnimatePresence>
  );
};
