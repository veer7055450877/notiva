export interface NoteHistory {
  timestamp: number;
  action: 'created' | 'edited' | 'archived' | 'restored' | 'summarized';
}

export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: number;
  updatedAt: number;
  isPinned: boolean;
  color: string;
  tags: string[];
  order: number;
  isDeleted?: boolean;
  isArchived?: boolean;
  history: NoteHistory[];
}

export type SortOption = 'newest' | 'oldest' | 'title' | 'custom';

export interface SyncQueueItem {
  id: string;
  action: 'POST' | 'PUT' | 'DELETE';
  payload?: Partial<Note>;
  timestamp: number;
}
