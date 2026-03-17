import React, { useState } from 'react';
import { Note } from '../types';
import { format } from 'date-fns';
import { Pin, Trash2, Edit3, Maximize2, MoreVertical, Copy, Archive, ArchiveRestore, Hash, GripVertical } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  note: Note;
  onEdit: (note: Note) => void;
  onDelete: (id: string) => void;
  onTogglePin: (id: string, isPinned: boolean) => void;
  onExpand: (note: Note) => void;
  onDuplicate: (note: Note) => void;
  onToggleArchive: (id: string, isArchived: boolean) => void;
  onDragStart?: (e: React.DragEvent<HTMLDivElement>, id: string) => void;
  onDragOver?: (e: React.DragEvent<HTMLDivElement>, id: string) => void;
  onDrop?: (e: React.DragEvent<HTMLDivElement>, id: string) => void;
}

const colorMap: Record<string, string> = {
  default: 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700',
  red: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800/50',
  blue: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800/50',
  green: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800/50',
  yellow: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800/50',
};

export const NoteCard = ({ note, onEdit, onDelete, onTogglePin, onExpand, onDuplicate, onToggleArchive, onDragStart, onDragOver, onDrop }: Props) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => { setIsHovered(false); setShowMenu(false); }}
      draggable={!!onDragStart}
      onDragStart={(e: React.DragEvent<HTMLDivElement>) => onDragStart && onDragStart(e, note.id)}
      onDragOver={(e: React.DragEvent<HTMLDivElement>) => onDragOver && onDragOver(e, note.id)}
      onDrop={(e: React.DragEvent<HTMLDivElement>) => onDrop && onDrop(e, note.id)}
      className={`group relative p-5 rounded-2xl border shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-72 ${colorMap[note.color] || colorMap.default} ${onDragStart ? 'cursor-grab active:cursor-grabbing' : ''}`}
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2 pr-8">
          {onDragStart && <GripVertical className="w-4 h-4 text-slate-300 dark:text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab" />}
          <h3 className="font-semibold text-lg line-clamp-1 text-slate-900 dark:text-white">{note.title || 'Untitled Note'}</h3>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onTogglePin(note.id, !note.isPinned); }}
          className={`absolute top-4 right-4 p-1.5 rounded-full transition-all duration-200 ${note.isPinned ? 'text-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 dark:text-indigo-400' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 opacity-0 group-hover:opacity-100'}`}
        >
          <Pin className="w-4 h-4" fill={note.isPinned ? "currentColor" : "none"} />
        </button>
      </div>
      
      <p className="text-slate-600 dark:text-slate-300 text-sm flex-1 whitespace-pre-wrap line-clamp-6 leading-relaxed font-sans">
        {note.content}
      </p>

      {note.tags && note.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-3 mb-1">
          {note.tags.slice(0, 3).map(tag => (
            <span key={tag} className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
              <Hash className="w-2.5 h-2.5" /> {tag}
            </span>
          ))}
          {note.tags.length > 3 && <span className="text-[10px] text-slate-400">+{note.tags.length - 3}</span>}
        </div>
      )}

      <div className="mt-auto pt-4 border-t border-slate-200/50 dark:border-slate-700/50 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 relative">
        <span className="font-medium">{format(note.updatedAt, 'MMM d, yyyy')}</span>
        
        <div className={`flex items-center gap-1 transition-all duration-200 ${isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2'}`}>
          <button onClick={() => onExpand(note)} className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white rounded-md transition-colors" title="Focus Mode">
            <Maximize2 className="w-4 h-4" />
          </button>
          <button onClick={() => onEdit(note)} className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-indigo-600 dark:hover:text-violet-400 rounded-md transition-colors" title="Edit">
            <Edit3 className="w-4 h-4" />
          </button>
          
          <div className="relative">
            <button onClick={() => setShowMenu(!showMenu)} className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white rounded-md transition-colors">
              <MoreVertical className="w-4 h-4" />
            </button>
            
            <AnimatePresence>
              {showMenu && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 10 }}
                  className="absolute right-0 bottom-full mb-2 w-40 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-1 z-10 overflow-hidden"
                >
                  <button onClick={() => { onDuplicate(note); setShowMenu(false); }} className="w-full text-left px-4 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-700/50 flex items-center gap-2 text-slate-700 dark:text-slate-300">
                    <Copy className="w-4 h-4" /> Duplicate
                  </button>
                  <button onClick={() => { onToggleArchive(note.id, !note.isArchived); setShowMenu(false); }} className="w-full text-left px-4 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-700/50 flex items-center gap-2 text-slate-700 dark:text-slate-300">
                    {note.isArchived ? <><ArchiveRestore className="w-4 h-4" /> Unarchive</> : <><Archive className="w-4 h-4" /> Archive</>}
                  </button>
                  <div className="h-px bg-slate-100 dark:bg-slate-700 my-1"></div>
                  <button onClick={() => { onDelete(note.id); setShowMenu(false); }} className="w-full text-left px-4 py-2 text-sm hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2 text-red-600 dark:text-red-400">
                    <Trash2 className="w-4 h-4" /> Delete
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
