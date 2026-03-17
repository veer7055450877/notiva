import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Note, SortOption } from '../types';
import { api } from '../api/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { useAuth } from './AuthContext';

interface NotesContextType {
  notes: Note[];
  loading: boolean;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  sortOption: SortOption;
  setSortOption: (s: SortOption) => void;
  fetchNotes: () => Promise<void>;
  addNote: (note: Partial<Note>) => Promise<void>;
  editNote: (id: string, note: Partial<Note>) => Promise<void>;
  removeNote: (id: string) => Promise<void>;
  reorderNotes: (reorderedNotes: Note[]) => Promise<void>;
  duplicateNote: (note: Note) => Promise<void>;
  exportNotes: (format: 'json' | 'txt') => void;
  isOffline: boolean;
  isSyncing: boolean;
}

const NotesContext = createContext<NotesContextType | undefined>(undefined);

export const NotesProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState<SortOption>('newest');
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);

  const fetchNotes = useCallback(async () => {
    if (!user) {
      setNotes([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await api.getNotes(user.id);
      setNotes(data.sort((a, b) => (a.order || 0) - (b.order || 0)));
    } catch (error) {
      toast.error('Failed to load notes');
    } finally {
      setLoading(false);
    }
  }, [user]);

  const syncData = useCallback(async () => {
    if (navigator.onLine && user) {
      setIsSyncing(true);
      await api.syncQueue();
      await fetchNotes();
      setIsSyncing(false);
    }
  }, [user, fetchNotes]);

  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      toast.success('Back online! Syncing changes...');
      syncData();
    };
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    fetchNotes();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [syncData, fetchNotes]);

  const addNote = async (noteData: Partial<Note>) => {
    if (!user) return;
    try {
      const newNote = await api.createNote({
        ...noteData,
        tags: noteData.tags || [],
        order: notes.length,
        history: [{ timestamp: Date.now(), action: 'created' }]
      }, user.id);
      setNotes(prev => [newNote, ...prev]);
      toast.success('Note created');
    } catch (error) {
      toast.error('Failed to create note');
    }
  };

  const editNote = async (id: string, noteData: Partial<Note>) => {
    try {
      const existing = notes.find(n => n.id === id);
      const action = noteData.isArchived !== undefined ? (noteData.isArchived ? 'archived' : 'restored') : 'edited';
      const history = [...(existing?.history || []), { timestamp: Date.now(), action }];
      
      const updatedNote = await api.updateNote(id, { ...noteData, history });
      setNotes(prev => prev.map(n => n.id === id ? { ...n, ...updatedNote } : n));
    } catch (error) {
      toast.error('Failed to update note');
    }
  };

  const removeNote = async (id: string) => {
    const noteToDelete = notes.find(n => n.id === id);
    if (!noteToDelete) return;

    setNotes(prev => prev.filter(n => n.id !== id));
    
    try {
      await api.deleteNote(id);
      toast((t) => (
        <div className="flex items-center gap-4">
          <span>Note deleted</span>
          <button
            onClick={async () => {
              toast.dismiss(t.id);
              await addNote(noteToDelete);
              toast.success('Note restored');
            }}
            className="text-sm font-medium text-blue-500 hover:text-blue-600"
          >
            Undo
          </button>
        </div>
      ), { duration: 8000 });
    } catch (error) {
      setNotes(prev => [noteToDelete, ...prev]);
      toast.error('Failed to delete note');
    }
  };

  const reorderNotes = async (reorderedNotes: Note[]) => {
    setNotes(reorderedNotes);
    reorderedNotes.forEach((note, index) => {
      if (note.order !== index) {
        api.updateNote(note.id, { order: index });
      }
    });
  };

  const duplicateNote = async (note: Note) => {
    const { id, ...rest } = note;
    await addNote({ ...rest, title: `${note.title} (Copy)` });
  };

  const exportNotes = (formatType: 'json' | 'txt') => {
    let dataStr = '';
    let mimeType = '';
    let ext = '';

    if (formatType === 'json') {
      dataStr = JSON.stringify(notes, null, 2);
      mimeType = 'application/json';
      ext = 'json';
    } else {
      dataStr = notes.map(n => `Title: ${n.title}\nDate: ${format(n.createdAt, 'PPpp')}\nTags: ${n.tags?.join(', ')}\n\n${n.content}\n\n-----------------------------------------\n`).join('\n');
      mimeType = 'text/plain';
      ext = 'txt';
    }

    const blob = new Blob([dataStr], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `notiva-export-${format(new Date(), 'yyyy-MM-dd')}.${ext}`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported as ${ext.toUpperCase()}`);
  };

  return (
    <NotesContext.Provider value={{
      notes, loading, searchQuery, setSearchQuery, sortOption, setSortOption,
      fetchNotes, addNote, editNote, removeNote, reorderNotes, duplicateNote, exportNotes, isOffline, isSyncing
    }}>
      {children}
    </NotesContext.Provider>
  );
};

export const useNotes = () => {
  const context = useContext(NotesContext);
  if (!context) throw new Error('useNotes must be used within NotesProvider');
  return context;
};
