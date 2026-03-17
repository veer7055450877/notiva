import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const DeleteModal = ({ isOpen, onClose, onConfirm }: Props) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white dark:bg-slate-800 w-full max-w-md rounded-2xl shadow-2xl p-6"
        >
          <div className="flex items-center gap-4 text-red-600 mb-4">
            <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Delete Note?</h2>
          </div>
          <p className="text-slate-600 dark:text-slate-300 mb-6">
            Are you sure you want to delete this note? You can undo this action for a short time after deletion.
          </p>
          <div className="flex justify-end gap-3">
            <button onClick={onClose} className="px-4 py-2 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
              Cancel
            </button>
            <button onClick={() => { onConfirm(); onClose(); }} className="px-4 py-2 text-sm font-medium bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors">
              Delete
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
