import React, { useState } from 'react';
import { Chapter } from '../types';
import { BOOK_LEVELS } from '../data/bookLevels';
import { 
  BookOpen, Search, CheckCircle, Bookmark, 
  ChevronRight, Sparkles, Filter, Layers
} from 'lucide-react';

interface TableOfContentsProps {
  chapters: Chapter[];
  currentChapterId: number;
  onSelectChapter: (id: number) => void;
  bookmarks: number[];
  onToggleBookmark: (id: number) => void;
  completedChapters: number[];
}

export const TableOfContents: React.FC<TableOfContentsProps> = ({
  chapters,
  currentChapterId,
  onSelectChapter,
  bookmarks,
  onToggleBookmark,
  completedChapters
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);

  const filteredChapters = chapters.filter((ch) => {
    const matchesSearch = 
      ch.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ch.subtitle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ch.keyConcepts.some(k => k.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesLevel = selectedLevel === null || ch.level === selectedLevel;
    return matchesSearch && matchesLevel;
  });

  return (
    <div className="flex h-full flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800">
      {/* Header & Stats */}
      <div className="border-b border-slate-200 p-4 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-teal-600 dark:text-teal-400" />
            <h2 className="text-sm font-bold tracking-tight text-slate-900 dark:text-white uppercase">Table of Contents</h2>
          </div>
          <span className="rounded-full bg-teal-50 px-2 py-0.5 text-xs font-semibold text-teal-700 dark:bg-teal-950/60 dark:text-teal-300">
            {completedChapters.length}/{chapters.length} Read
          </span>
        </div>

        {/* Search input */}
        <div className="mt-3 relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search chapters, concepts, opcodes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:border-teal-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
          />
        </div>

        {/* Level Filters Pills */}
        <div className="mt-2.5 flex items-center gap-1 overflow-x-auto pb-1 text-[11px] scrollbar-none">
          <button
            onClick={() => setSelectedLevel(null)}
            className={`whitespace-nowrap rounded-md px-2 py-1 font-medium transition ${
              selectedLevel === null
                ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
            }`}
          >
            All Levels
          </button>
          {BOOK_LEVELS.map((lvl) => (
            <button
              key={lvl.level}
              onClick={() => setSelectedLevel(lvl.level === selectedLevel ? null : lvl.level)}
              className={`whitespace-nowrap rounded-md px-2 py-1 font-medium transition ${
                selectedLevel === lvl.level
                  ? 'bg-teal-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
              }`}
            >
              L{lvl.level}: {lvl.title.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Chapter List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {filteredChapters.map((ch) => {
          const isCurrent = ch.id === currentChapterId;
          const isBookmarked = bookmarks.includes(ch.id);
          const isCompleted = completedChapters.includes(ch.id);

          return (
            <div
              key={ch.id}
              className={`group flex items-start justify-between rounded-lg p-2.5 transition cursor-pointer ${
                isCurrent
                  ? 'bg-teal-50/80 text-teal-950 dark:bg-teal-950/40 dark:text-teal-100 border border-teal-200 dark:border-teal-800/60'
                  : 'hover:bg-slate-100 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300'
              }`}
              onClick={() => onSelectChapter(ch.id)}
            >
              <div className="flex items-start gap-2.5 flex-1 pr-2">
                <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded text-[11px] font-mono font-bold ${
                  isCurrent 
                    ? 'bg-teal-600 text-white' 
                    : isCompleted
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'
                    : 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                }`}>
                  {ch.id}
                </span>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold leading-snug line-clamp-1">
                      {ch.title.replace(/^Chapter \d+:\s*/, '')}
                    </span>
                  </div>
                  {ch.subtitle && (
                    <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                      {ch.subtitle}
                    </p>
                  )}
                  <div className="mt-1 flex items-center gap-2 text-[10px] text-slate-400">
                    <span>Level {ch.level}</span>
                    <span>•</span>
                    <span>{ch.sections.length} Sections</span>
                    {ch.exercises.length > 0 && (
                      <>
                        <span>•</span>
                        <span>{ch.exercises.length} Exercises</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Bookmark & status buttons */}
              <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => onToggleBookmark(ch.id)}
                  className={`p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 transition ${
                    isBookmarked ? 'text-amber-500' : 'text-slate-300 hover:text-slate-500'
                  }`}
                  title={isBookmarked ? 'Remove Bookmark' : 'Bookmark Chapter'}
                >
                  <Bookmark className={`h-3.5 w-3.5 ${isBookmarked ? 'fill-amber-500' : ''}`} />
                </button>
              </div>
            </div>
          );
        })}

        {filteredChapters.length === 0 && (
          <div className="p-8 text-center text-xs text-slate-500">
            No chapters match your search query.
          </div>
        )}
      </div>

      {/* Progress Footer */}
      <div className="border-t border-slate-200 p-3 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
        <div className="flex justify-between items-center mb-1 text-[11px]">
          <span>Course Completion</span>
          <span className="font-mono font-bold text-slate-700 dark:text-slate-200">
            {Math.round((completedChapters.length / chapters.length) * 100)}%
          </span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
          <div 
            className="h-full bg-teal-600 transition-all duration-300"
            style={{ width: `${(completedChapters.length / chapters.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
};
