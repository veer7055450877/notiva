import { v4 as uuidv4 } from 'uuid';
import { Note, NoteHistory } from '../types';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const getStorageNotes = (): Note[] => {
  const notes = localStorage.getItem('notiva_notes');
  return notes ? JSON.parse(notes) : [];
};

const saveStorageNotes = (notes: Note[]) => {
  localStorage.setItem('notiva_notes', JSON.stringify(notes));
};

export const api = {
  async getNotes(): Promise<Note[]> {
    await delay(600);
    return getStorageNotes().filter(n => !n.isDeleted);
  },

  async createNote(data: Partial<Note>): Promise<Note> {
    await delay(300);
    const now = Date.now();
    const newNote: Note = {
      id: uuidv4(),
      title: data.title || '',
      content: data.content || '',
      createdAt: now,
      updatedAt: now,
      isPinned: data.isPinned || false,
      color: data.color || 'default',
      isDeleted: false,
      isArchived: false,
      history: [{ timestamp: now, action: 'created' }]
    };
    const notes = getStorageNotes();
    saveStorageNotes([newNote, ...notes]);
    return newNote;
  },

  async updateNote(id: string, data: Partial<Note>): Promise<Note> {
    await delay(300);
    const notes = getStorageNotes();
    const index = notes.findIndex(n => n.id === id);
    if (index === -1) throw new Error('Note not found');

    const now = Date.now();
    const action = data.isArchived !== undefined && data.isArchived !== notes[index].isArchived
      ? (data.isArchived ? 'archived' : 'restored')
      : 'edited';

    const updatedHistory: NoteHistory[] = [
      ...(notes[index].history || [{ timestamp: notes[index].createdAt, action: 'created' }]),
      { timestamp: now, action }
    ];

    notes[index] = {
      ...notes[index],
      ...data,
      updatedAt: now,
      history: updatedHistory
    };
    saveStorageNotes(notes);
    return notes[index];
  },

  async deleteNote(id: string): Promise<void> {
    await delay(300);
    const notes = getStorageNotes();
    const index = notes.findIndex(n => n.id === id);
    if (index !== -1) {
      notes[index].isDeleted = true;
      saveStorageNotes(notes);
    }
  },

  async restoreNote(id: string): Promise<void> {
    const notes = getStorageNotes();
    const index = notes.findIndex(n => n.id === id);
    if (index !== -1) {
      notes[index].isDeleted = false;
      saveStorageNotes(notes);
    }
  },

  async importNotes(importedNotes: Note[]): Promise<void> {
    await delay(500);
    const currentNotes = getStorageNotes();
    // Merge, avoiding duplicates by ID
    const existingIds = new Set(currentNotes.map(n => n.id));
    const newNotes = importedNotes.filter(n => !existingIds.has(n.id));
    saveStorageNotes([...newNotes, ...currentNotes]);
  }
};
