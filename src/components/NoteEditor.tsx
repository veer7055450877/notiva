import React, { useState, useEffect, useRef } from 'react';
import { Note } from '../types';
import { X, Check, Loader2, Bold, Italic, Heading1, List, Quote, Hash, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (note: Partial<Note>) => Promise<void>;
  initialData?: Note | null;
}

const colors = ['default', 'red', 'blue', 'green', 'yellow'];
const colorMap: Record<string, string> = {
  default: 'bg-slate-100 dark:bg-slate-700',
  red: 'bg-red-400',
  blue: 'bg-blue-400',
  green: 'bg-green-400',
  yellow: 'bg-yellow-400',
};

export const NoteEditor = ({ isOpen, onClose, onSave, initialData }: Props) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [color, setColor] = useState('default');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const titleRef = useRef<HTMLInputElement>(null);
  const contentRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTitle(initialData?.title || '');
      setContent(initialData?.content || '');
      setColor(initialData?.color || 'default');
      setTags(initialData?.tags || []);
      setTagInput('');
      setTimeout(() => titleRef.current?.focus(), 150);
    }
  }, [isOpen, initialData]);

  const handleSave = async () => {
    if (!title.trim() && !content.trim()) {
      onClose();
      return;
    }
    setIsSaving(true);
    await onSave({ title, content, color, tags });
    setIsSaving(false);
    onClose();
  };

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim().toLowerCase()]);
      }
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const insertFormatting = (prefix: string, suffix: string = '') => {
    const textarea = contentRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    const newText = content.substring(0, start) + prefix + selectedText + suffix + content.substring(end);
    setContent(newText);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, end + prefix.length);
    }, 0);
  };

  const handleSummarize = async () => {
    if (!content.trim()) return;
    setIsSummarizing(true);
    // Mock AI delay
    await new Promise(r => setTimeout(r, 1500));
    const summary = `\n\n> **AI Summary**: This note discusses ${title || 'various topics'} focusing on key points mentioned above.`;
    setContent(prev => prev + summary);
    setIsSummarizing(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ x: '100%', boxShadow: '-20px 0 25px -5px rgba(0, 0, 0, 0)' }}
            animate={{ x: 0, boxShadow: '-20px 0 25px -5px rgba(0, 0, 0, 0.2)' }}
            exit={{ x: '100%', boxShadow: '-20px 0 25px -5px rgba(0, 0, 0, 0)' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 bottom-0 w-full max-w-2xl bg-white dark:bg-slate-900 z-50 flex flex-col border-l border-slate-200 dark:border-slate-800"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800/50">
              <div className="flex gap-2">
                {colors.map(c => (
                  <button
                    key={c} onClick={() => setColor(c)}
                    className={`w-5 h-5 rounded-full transition-all duration-200 ${color === c ? 'ring-2 ring-offset-2 ring-indigo-500 dark:ring-offset-slate-900 scale-110' : 'hover:scale-110'} ${colorMap[c]}`}
                    title={`Color: ${c}`}
                  />
                ))}
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={handleSummarize} disabled={isSummarizing || !content.trim()}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-violet-600 bg-violet-50 dark:text-violet-400 dark:bg-violet-900/30 rounded-lg hover:bg-violet-100 dark:hover:bg-violet-900/50 transition-colors disabled:opacity-50"
                >
                  {isSummarizing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                  Summarize
                </button>
                <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Toolbar */}
            <div className="flex items-center gap-1 px-6 py-2 border-b border-slate-100 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-800/20">
              <button onClick={() => insertFormatting('**', '**')} className="p-1.5 text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors" title="Bold"><Bold className="w-4 h-4" /></button>
              <button onClick={() => insertFormatting('*', '*')} className="p-1.5 text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors" title="Italic"><Italic className="w-4 h-4" /></button>
              <div className="w-px h-4 bg-slate-300 dark:bg-slate-600 mx-1"></div>
              <button onClick={() => insertFormatting('# ')} className="p-1.5 text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors" title="Heading 1"><Heading1 className="w-4 h-4" /></button>
              <button onClick={() => insertFormatting('- ')} className="p-1.5 text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors" title="Bullet List"><List className="w-4 h-4" /></button>
              <button onClick={() => insertFormatting('> ')} className="p-1.5 text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors" title="Quote"><Quote className="w-4 h-4" /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
              <input
                ref={titleRef} type="text" placeholder="Note Title" value={title} onChange={(e) => setTitle(e.target.value)}
                className="text-4xl font-bold bg-transparent border-none outline-none text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-600"
              />
              
              {/* Tags Input */}
              <div className="flex flex-wrap items-center gap-2 mb-2">
                {tags.map(tag => (
                  <span key={tag} className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-xs font-medium">
                    <Hash className="w-3 h-3" /> {tag}
                    <button onClick={() => removeTag(tag)} className="hover:text-indigo-800 dark:hover:text-indigo-200 ml-1"><X className="w-3 h-3" /></button>
                  </span>
                ))}
                <input
                  type="text" placeholder="Add tag..." value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)} onKeyDown={handleAddTag}
                  className="text-sm bg-transparent border-none outline-none text-slate-600 dark:text-slate-400 placeholder:text-slate-400 w-24"
                />
              </div>

              <textarea
                ref={contentRef} placeholder="Start typing your note... (Markdown supported)" value={content} onChange={(e) => setContent(e.target.value)}
                className="flex-1 w-full resize-none bg-transparent border-none outline-none text-slate-700 dark:text-slate-300 placeholder:text-slate-400 dark:placeholder:text-slate-600 leading-relaxed text-lg font-sans"
              />
            </div>

            <div className="p-4 border-t border-slate-100 dark:border-slate-800/50 bg-slate-50 dark:bg-slate-900/50 flex justify-end gap-3">
              <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition-colors">
                Cancel
              </button>
              <button 
                onClick={handleSave} disabled={isSaving}
                className="px-6 py-2 text-sm font-medium bg-indigo-600 hover:bg-indigo-700 dark:bg-violet-600 dark:hover:bg-violet-700 text-white rounded-xl transition-colors flex items-center gap-2 disabled:opacity-70 shadow-sm"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                {isSaving ? 'Saving...' : 'Save Note'}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
