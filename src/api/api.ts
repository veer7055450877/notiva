import { Note, SyncQueueItem } from '../types';
import { v4 as uuidv4 } from 'uuid';

// Using a public MockAPI endpoint for demonstration.
// In production, replace with your actual backend URL.
const API_URL = "https://69b6f01bffbcd02860943a7e.mockapi.io/api/v1/notes";

const getQueue = (): SyncQueueItem[] => JSON.parse(localStorage.getItem('notiva_sync_queue') || '[]');
const saveQueue = (queue: SyncQueueItem[]) => localStorage.setItem('notiva_sync_queue', JSON.stringify(queue));

const getLocalCache = (): Note[] => JSON.parse(localStorage.getItem('notiva_cache') || '[]');
const saveLocalCache = (notes: Note[]) => localStorage.setItem('notiva_cache', JSON.stringify(notes));

export const api = {
  async getNotes(): Promise<Note[]> {
    if (!navigator.onLine) return getLocalCache().filter(n => !n.isDeleted);
    try {
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error('Network response was not ok');
      const data = await res.json();
      saveLocalCache(data);
      return data.filter((n: Note) => !n.isDeleted);
    } catch (error) {
      console.warn('API fetch failed, falling back to cache', error);
      return getLocalCache().filter(n => !n.isDeleted);
    }
  },

  async createNote(data: Partial<Note>): Promise<Note> {
    const newNote = { ...data, id: uuidv4(), createdAt: Date.now(), updatedAt: Date.now() } as Note;

    if (!navigator.onLine) {
      this.queueAction('POST', newNote.id, newNote);
      saveLocalCache([newNote, ...getLocalCache()]);
      return newNote;
    }

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newNote),
      });
      if (!res.ok) throw new Error('Failed to create');
      const created = await res.json();
      saveLocalCache([created, ...getLocalCache()]);
      return created;
    } catch (error) {
      this.queueAction('POST', newNote.id, newNote);
      saveLocalCache([newNote, ...getLocalCache()]);
      return newNote;
    }
  },

  async updateNote(id: string, data: Partial<Note>): Promise<Note> {
    const cache = getLocalCache();
    const index = cache.findIndex(n => n.id === id);
    const updatedNote = index > -1 ? { ...cache[index], ...data, updatedAt: Date.now() } : { id, ...data } as Note;

    if (index > -1) {
      cache[index] = updatedNote;
      saveLocalCache(cache);
    }

    if (!navigator.onLine) {
      this.queueAction('PUT', id, data);
      return updatedNote;
    }

    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedNote),
      });
      if (!res.ok) throw new Error('Failed to update');
      return await res.json();
    } catch (error) {
      this.queueAction('PUT', id, data);
      return updatedNote;
    }
  },

  async deleteNote(id: string): Promise<void> {
    const cache = getLocalCache();
    saveLocalCache(cache.filter(n => n.id !== id));

    if (!navigator.onLine) {
      this.queueAction('DELETE', id);
      return;
    }

    try {
      await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
    } catch (error) {
      this.queueAction('DELETE', id);
    }
  },

  queueAction(action: 'POST' | 'PUT' | 'DELETE', id: string, payload?: Partial<Note>) {
    const queue = getQueue();
    // Prevent duplicate DELETE actions for the same ID
    if (action === 'DELETE' && queue.some(q => q.id === id && q.action === 'DELETE')) return;

    queue.push({ id, action, payload, timestamp: Date.now() });
    saveQueue(queue);
  },

  async syncQueue(): Promise<void> {
    if (!navigator.onLine) return;
    const queue = getQueue();
    if (queue.length === 0) return;

    console.log('Syncing offline queue...', queue.length, 'items');
    for (const item of queue) {
      try {
        if (item.action === 'POST') {
          await fetch(API_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(item.payload) });
        } else if (item.action === 'PUT') {
          await fetch(`${API_URL}/${item.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(item.payload) });
        } else if (item.action === 'DELETE') {
          await fetch(`${API_URL}/${item.id}`, { method: 'DELETE' });
        }
      } catch (e) {
        console.error('Sync failed for item', item, e);
      }
    }
    // Clear queue after a sync attempt
    saveQueue([]);
  }
};
