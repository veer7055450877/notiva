import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Chrome, Zap, Link as LinkIcon, FileText } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const ExtensionModal = ({ isOpen, onClose }: Props) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800"
        >
          <div className="relative h-40 bg-gradient-to-br from-indigo-500 to-violet-600 p-6 flex items-end">
            <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full transition-colors">
              <X className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-3 text-white">
              <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl">
                <Chrome className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Notiva Extension</h2>
                <p className="text-indigo-100 text-sm">Capture ideas without leaving your tab.</p>
              </div>
            </div>
          </div>
          
          <div className="p-6 space-y-6">
            <div className="grid gap-4">
              <div className="flex gap-4">
                <div className="mt-1 p-2 bg-amber-50 dark:bg-amber-900/20 text-amber-500 rounded-xl h-fit"><Zap className="w-5 h-5" /></div>
                <div>
                  <h4 className="font-semibold text-slate-900 dark:text-white">Quick Capture</h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Highlight text on any website, right click, and save it directly to Notiva instantly.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="mt-1 p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-500 rounded-xl h-fit"><LinkIcon className="w-5 h-5" /></div>
                <div>
                  <h4 className="font-semibold text-slate-900 dark:text-white">Save Context</h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Automatically attaches the current webpage URL to your notes for easy reference later.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="mt-1 p-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500 rounded-xl h-fit"><FileText className="w-5 h-5" /></div>
                <div>
                  <h4 className="font-semibold text-slate-900 dark:text-white">Popup Editor</h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Access a mini version of Notiva from your browser toolbar anytime.</p>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row gap-3">
              <button onClick={onClose} className="flex-1 px-4 py-3 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
                Maybe Later
              </button>
              <a 
                href="#" target="_blank" rel="noreferrer"
                className="flex-1 px-4 py-3 text-sm font-medium bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2"
              >
                <Chrome className="w-4 h-4" /> Install for Chrome
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
