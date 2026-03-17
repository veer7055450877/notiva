import { AnimatePresence, motion } from 'framer-motion';
import { Activity, Archive, Clock, FileText, Hash, LayoutGrid, Pin, Plus, Search, SlidersHorizontal } from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';
import { CustomSelect } from '../components/CustomSelect';
import { DeleteModal } from '../components/DeleteModal';
import { FocusMode } from '../components/FocusMode';
import { NoteCard } from '../components/NoteCard';
import { NoteEditor } from '../components/NoteEditor';
import { useNotes } from '../context/NotesContext';
import { useDebounce } from '../hooks/useDebounce';
import { Note } from '../types';

const ITEMS_PER_PAGE = 20;

interface Props {
  view: 'dashboard' | 'all' | 'archived';
}

export const Home = ({ view }: Props) => {
  const { notes, loading, searchQuery, setSearchQuery, sortOption, setSortOption, addNote, editNote, removeNote, duplicateNote, reorderNotes } = useNotes();

  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState<string | null>(null);
  const [focusNote, setFocusNote] = useState<Note | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeFilter, setActiveFilter] = useState<string>('all'); // 'all', 'pinned', tag name
  const [draggedNoteId, setDraggedNoteId] = useState<string | null>(null);

  const debouncedSearch = useDebounce(searchQuery, 400);

  // Extract unique tags for filter
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    notes.forEach(n => n.tags?.forEach(t => tags.add(t)));
    return Array.from(tags);
  }, [notes]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'n') { e.preventDefault(); handleCreateNew(); }
      if (e.ctrlKey && e.key === 'f') { e.preventDefault(); document.getElementById('search-input')?.focus(); }
    };
    window.addEventListener('keydown', handleKeyDown);
    const handleOpenEditor = () => handleCreateNew();
    window.addEventListener('open-editor', handleOpenEditor);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('open-editor', handleOpenEditor);
    };
  }, []);

  const filteredAndSortedNotes = useMemo(() => {
    let result = notes.filter(n => view === 'archived' ? n.isArchived : !n.isArchived);

    if (activeFilter === 'pinned') result = result.filter(n => n.isPinned);
    else if (activeFilter !== 'all') result = result.filter(n => n.tags?.includes(activeFilter));

    if (debouncedSearch) {
      const lowerQuery = debouncedSearch.toLowerCase();
      result = result.filter(n => n.title.toLowerCase().includes(lowerQuery) || n.content.toLowerCase().includes(lowerQuery) || n.tags?.some(t => t.toLowerCase().includes(lowerQuery)));
    }

    result.sort((a, b) => {
      switch (sortOption) {
        case 'newest': return b.createdAt - a.createdAt;
        case 'oldest': return a.createdAt - b.createdAt;
        case 'title': return a.title.localeCompare(b.title);
        case 'custom': return (a.order || 0) - (b.order || 0);
        default: return 0;
      }
    });

    return result;
  }, [notes, debouncedSearch, sortOption, view, activeFilter]);

  const pinnedNotes = filteredAndSortedNotes.filter(n => n.isPinned);
  const unpinnedNotes = filteredAndSortedNotes.filter(n => !n.isPinned);
  const paginatedUnpinnedNotes = unpinnedNotes.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const handleCreateNew = () => { setEditingNote(null); setIsEditorOpen(true); };
  const handleSaveNote = async (noteData: Partial<Note>) => {
    if (editingNote) await editNote(editingNote.id, noteData);
    else await addNote(noteData);
  };

  // Drag and Drop Handlers
  const handleDragStart = (e: React.DragEvent, id: string) => { setDraggedNoteId(id); e.dataTransfer.effectAllowed = 'move'; };
  const handleDragOver = (e: React.DragEvent, id: string) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; };
  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedNoteId || draggedNoteId === targetId || sortOption !== 'custom') return;

    const draggedIndex = notes.findIndex(n => n.id === draggedNoteId);
    const targetIndex = notes.findIndex(n => n.id === targetId);

    const newNotes = [...notes];
    const [draggedItem] = newNotes.splice(draggedIndex, 1);
    newNotes.splice(targetIndex, 0, draggedItem);

    reorderNotes(newNotes);
    setDraggedNoteId(null);
  };

  if (view === 'dashboard') {
    const recentNotes = [...notes].filter(n => !n.isArchived).sort((a, b) => b.updatedAt - a.updatedAt).slice(0, 4);
    const dashPinned = notes.filter(n => n.isPinned && !n.isArchived);

    return (
      <div className="space-y-8 animate-fade-in pb-24">
        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col gap-2">
            <div className="text-slate-500 dark:text-slate-400 text-sm font-medium flex items-center gap-2">
              <LayoutGrid className="w-4 h-4" /> Total Notes
            </div>
            <div className="text-3xl font-bold text-slate-900 dark:text-white">
              {notes.length}
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col gap-2">
            <div className="text-slate-500 dark:text-slate-400 text-sm font-medium flex items-center gap-2">
              <Pin className="w-4 h-4 text-indigo-500" /> Pinned
            </div>
            <div className="text-3xl font-bold text-slate-900 dark:text-white">
              {dashPinned.length}
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col gap-2">
            <div className="text-slate-500 dark:text-slate-400 text-sm font-medium flex items-center gap-2">
              <Archive className="w-4 h-4 text-slate-500" /> Archived
            </div>
            <div className="text-3xl font-bold text-slate-900 dark:text-white">
              {notes.filter((n) => n.isArchived).length}
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col gap-2">
            <div className="text-slate-500 dark:text-slate-400 text-sm font-medium flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-500" /> Tags
            </div>
            <div className="text-3xl font-bold text-slate-900 dark:text-white">
              {allTags.length}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-indigo-500" /> Recently Edited
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {recentNotes.map((note) => (
                <NoteCard
                  key={note.id}
                  note={note}
                  onEdit={(n) => {
                    setEditingNote(n);
                    setIsEditorOpen(true);
                  }}
                  onDelete={(id) => {
                    setNoteToDelete(id);
                    setIsDeleteModalOpen(true);
                  }}
                  onTogglePin={(id, isPinned) => editNote(id, { isPinned })}
                  onExpand={setFocusNote}
                  onDuplicate={duplicateNote}
                  onToggleArchive={(id, isArchived) =>
                    editNote(id, { isArchived })
                  }
                />
              ))}
            </div>
          </div>
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Pin className="w-5 h-5 text-indigo-500" /> Pinned Notes
            </h2>
            <div className="flex flex-col gap-4">
              {dashPinned.length === 0 ? (
                <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 border-dashed text-center text-slate-500 text-sm">
                  No pinned notes yet.
                </div>
              ) : (
                dashPinned.slice(0, 3).map((note) => (
                  <div
                    key={note.id}
                    onClick={() => setFocusNote(note)}
                    className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md cursor-pointer transition-all"
                  >
                    <h4 className="font-semibold text-slate-900 dark:text-white line-clamp-1 mb-1">
                      {note.title || "Untitled"}
                    </h4>
                    <p className="text-xs text-slate-500 line-clamp-2">
                      {note.content}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <button
          onClick={handleCreateNew}
          className="fixed bottom-8 right-8 w-14 h-14 bg-indigo-600 hover:bg-indigo-700 dark:bg-violet-600 dark:hover:bg-violet-700 text-white rounded-full shadow-xl hover:shadow-2xl flex items-center justify-center transition-all hover:-translate-y-1 z-30 group"
          title="New Note (Ctrl+N)"
        >
          <Plus className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" />
        </button>

        <NoteEditor
          isOpen={isEditorOpen}
          onClose={() => setIsEditorOpen(false)}
          onSave={handleSaveNote}
          initialData={editingNote}
        />
        <DeleteModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={() => noteToDelete && removeNote(noteToDelete)}
        />
        <FocusMode note={focusNote} onClose={() => setFocusNote(null)} />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in pb-24">
      {/* Search & Filter Bar */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col gap-4">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
          <div className="relative flex-1 w-full max-w-xl group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
            <input
              id="search-input" type="text" placeholder="Search notes, tags, or content... (Ctrl+F)"
              value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm font-medium"
            />
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <CustomSelect
              icon={<SlidersHorizontal className="w-4 h-4" />}
              value={sortOption}
              onChange={(val) => setSortOption(val as any)}
              options={[
                { value: 'custom', label: 'Custom Order' },
                { value: 'newest', label: 'Newest First' },
                { value: 'oldest', label: 'Oldest First' },
                { value: 'title', label: 'Title A-Z' }
              ]}
            />
          </div>
        </div>

        {/* Smart Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
          <button onClick={() => setActiveFilter('all')} className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${activeFilter === 'all' ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'}`}>All Notes</button>
          <button onClick={() => setActiveFilter('pinned')} className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ${activeFilter === 'pinned' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'}`}><Pin className="w-3.5 h-3.5"/> Pinned</button>
          <div className="w-px h-5 bg-slate-200 dark:bg-slate-700 mx-1"></div>
          {allTags.map(tag => (
            <button key={tag} onClick={() => setActiveFilter(tag)} className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-1 ${activeFilter === tag ? 'bg-violet-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'}`}><Hash className="w-3.5 h-3.5"/> {tag}</button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-72 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-5 flex flex-col gap-4">
              <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded-md w-3/4 animate-pulse"></div>
              <div className="space-y-2 flex-1">
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full animate-pulse"></div>
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-5/6 animate-pulse"></div>
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-4/6 animate-pulse"></div>
              </div>
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/3 animate-pulse mt-auto"></div>
            </div>
          ))}
        </div>
      ) : filteredAndSortedNotes.length === 0 ? (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center py-24 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 border-dashed">
          <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl flex items-center justify-center mx-auto mb-6 rotate-3">
            {searchQuery ? <Search className="w-10 h-10 text-indigo-500 -rotate-3" /> : <FileText className="w-10 h-10 text-indigo-500 -rotate-3" />}
          </div>
          <h3 className="text-2xl font-bold mb-2 text-slate-900 dark:text-white">{searchQuery ? 'No results found' : 'No notes yet'}</h3>
          <p className="text-slate-500 mb-8 max-w-sm mx-auto">{searchQuery ? 'Try adjusting your search keywords or filters.' : 'Start capturing your ideas by creating your first note.'}</p>
          {!searchQuery && (
            <button onClick={handleCreateNew} className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-all shadow-sm hover:shadow-md flex items-center gap-2 mx-auto">
              <Plus className="w-5 h-5" /> Create Note
            </button>
          )}
        </motion.div>
      ) : (
        <div className="space-y-10">
          {pinnedNotes.length > 0 && activeFilter === 'all' && !searchQuery && (
            <section>
              <h2 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">Pinned</h2>
              <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                <AnimatePresence>
                  {pinnedNotes.map(note => (
                    <NoteCard key={note.id} note={note} onEdit={(n) => { setEditingNote(n); setIsEditorOpen(true); }} onDelete={(id) => { setNoteToDelete(id); setIsDeleteModalOpen(true); }} onTogglePin={(id, isPinned) => editNote(id, { isPinned })} onExpand={setFocusNote} onDuplicate={duplicateNote} onToggleArchive={(id, isArchived) => editNote(id, { isArchived })} />
                  ))}
                </AnimatePresence>
              </motion.div>
            </section>
          )}

          {paginatedUnpinnedNotes.length > 0 && (
            <section>
              {pinnedNotes.length > 0 && activeFilter === 'all' && !searchQuery && <h2 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">Recent</h2>}
              <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                <AnimatePresence>
                  {paginatedUnpinnedNotes.map(note => (
                    <NoteCard
                      key={note.id} note={note}
                      onEdit={(n) => { setEditingNote(n); setIsEditorOpen(true); }}
                      onDelete={(id) => { setNoteToDelete(id); setIsDeleteModalOpen(true); }}
                      onTogglePin={(id, isPinned) => editNote(id, { isPinned })}
                      onExpand={setFocusNote} onDuplicate={duplicateNote}
                      onToggleArchive={(id, isArchived) => editNote(id, { isArchived })}
                      onDragStart={sortOption === 'custom' ? handleDragStart : undefined}
                      onDragOver={sortOption === 'custom' ? handleDragOver : undefined}
                      onDrop={sortOption === 'custom' ? handleDrop : undefined}
                    />
                  ))}
                </AnimatePresence>
              </motion.div>
            </section>
          )}
        </div>
      )}

      {view !== 'archived' && (
        <button onClick={handleCreateNew} className="fixed bottom-8 right-8 w-14 h-14 bg-indigo-600 hover:bg-indigo-700 dark:bg-violet-600 dark:hover:bg-violet-700 text-white rounded-full shadow-xl hover:shadow-2xl flex items-center justify-center transition-all hover:-translate-y-1 z-30 group" title="New Note (Ctrl+N)">
          <Plus className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" />
        </button>
      )}

      <NoteEditor isOpen={isEditorOpen} onClose={() => setIsEditorOpen(false)} onSave={handleSaveNote} initialData={editingNote} />
      <DeleteModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} onConfirm={() => noteToDelete && removeNote(noteToDelete)} />
      <FocusMode note={focusNote} onClose={() => setFocusNote(null)} />
    </div>
  );
};
