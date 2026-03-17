import React, { useState, useEffect } from 'react';
import { api } from '../api/api';
import { Loader2, Check, X, Link as LinkIcon, FileText, Sparkles } from 'lucide-react';

export const PopupApp = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [pageUrl, setPageUrl] = useState('');

  useEffect(() => {
    // Check if running as a Chrome extension
    if (typeof chrome !== 'undefined' && chrome.tabs) {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const tab = tabs[0];
        if (tab && tab.id) {
          setPageUrl(tab.url || '');
          setTitle(tab.title || 'Quick Note');
          
          // Request selected text from content script
          chrome.tabs.sendMessage(tab.id, { action: 'GET_SELECTION' }, (response) => {
            if (chrome.runtime.lastError) {
              console.log('Content script not injected or page cannot be accessed.');
              return;
            }
            if (response && response.text) {
              setContent(`> ${response.text}\n\nSource: ${tab.url}`);
            } else {
              setContent(`Source: ${tab.url}`);
            }
          });
        }
      });
    } else {
      // Fallback for local web preview
      setContent('Running in web preview mode. Extension APIs are mocked.');
    }
  }, []);

  const handleSave = async () => {
    if (!title.trim() && !content.trim()) return;
    
    setIsSaving(true);
    try {
      await api.createNote({
        title,
        content,
        color: 'default',
        tags: ['extension-capture'],
        isPinned: false,
      });
      setSuccess(true);
      setTimeout(() => {
        if (typeof window !== 'undefined' && window.close) {
          window.close();
        }
      }, 1500);
    } catch (error) {
      console.error('Failed to save note:', error);
    } finally {
      setIsSaving(false);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-slate-900 text-white p-6 text-center animate-fade-in">
        <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mb-4">
          <Check className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold mb-2">Note Captured!</h2>
        <p className="text-slate-400 text-sm">Your note has been synced to Notiva.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-800/20">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-gradient-to-tr from-indigo-600 to-violet-500 rounded-md flex items-center justify-center shadow-sm">
            <Sparkles className="w-3 h-3 text-white" />
          </div>
          <span className="font-bold text-sm text-slate-900 dark:text-white tracking-tight">Notiva Capture</span>
        </div>
        <button onClick={() => window.close()} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Editor */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
        <input
          type="text"
          placeholder="Note Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="text-lg font-bold bg-transparent border-none outline-none text-slate-900 dark:text-white placeholder:text-slate-400"
        />
        
        {pageUrl && (
          <div className="flex items-center gap-1.5 text-xs text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 px-2 py-1 rounded-md w-fit max-w-full overflow-hidden">
            <LinkIcon className="w-3 h-3 shrink-0" />
            <span className="truncate">{pageUrl}</span>
          </div>
        )}

        <textarea
          placeholder="Write your note here..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="flex-1 w-full resize-none bg-transparent border-none outline-none text-slate-700 dark:text-slate-300 placeholder:text-slate-400 text-sm leading-relaxed"
        />
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-slate-100 dark:border-slate-800/50 bg-slate-50 dark:bg-slate-900/50 flex justify-between items-center">
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <FileText className="w-3.5 h-3.5" />
          <span>Saves to Inbox</span>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving || (!title.trim() && !content.trim())}
          className="px-4 py-2 text-sm font-medium bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
        >
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
          {isSaving ? 'Saving...' : 'Save Note'}
        </button>
      </div>
    </div>
  );
};
