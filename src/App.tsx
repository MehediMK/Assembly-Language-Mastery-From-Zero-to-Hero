import React, { useState, useEffect } from 'react';
import { ALL_CHAPTERS, BOOK_METADATA } from './data/allChapters';
import { TableOfContents } from './components/TableOfContents';
import { ChapterView } from './components/ChapterView';
import { PrintBookView } from './components/PrintBookView';
import { InteractiveLab } from './components/InteractiveLab';
import { FontMode } from './types';
import { 
  BookOpen, Printer, Terminal, Moon, Sun, Type, 
  Menu, X, Bookmark, CheckCircle, ChevronDown, Sparkles
} from 'lucide-react';

export function App() {
  const [currentChapterId, setCurrentChapterId] = useState<number>(1);
  const [viewMode, setViewMode] = useState<'reader' | 'print_book' | 'interactive_lab'>('reader');
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const [fontMode, setFontMode] = useState<FontMode>('sans');
  const [fontSize, setFontSize] = useState<number>(15);
  const [darkMode, setDarkMode] = useState<boolean>(false);
  
  // Local storage persistence for bookmarks & progress
  const [bookmarks, setBookmarks] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem('asm_bookmarks');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [completedChapters, setCompletedChapters] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem('asm_completed');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('asm_bookmarks', JSON.stringify(bookmarks));
  }, [bookmarks]);

  useEffect(() => {
    localStorage.setItem('asm_completed', JSON.stringify(completedChapters));
  }, [completedChapters]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const toggleBookmark = (id: number) => {
    setBookmarks(prev => 
      prev.includes(id) ? prev.filter(b => b !== id) : [...prev, id]
    );
  };

  const toggleCompleted = (id: number) => {
    setCompletedChapters(prev => 
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const currentChapter = ALL_CHAPTERS.find(c => c.id === currentChapterId) || ALL_CHAPTERS[0];

  // If in Print Book View, render dedicated full printable page view
  if (viewMode === 'print_book') {
    return (
      <PrintBookView 
        chapters={ALL_CHAPTERS} 
        onExitPrintView={() => setViewMode('reader')} 
      />
    );
  }

  return (
    <div className="flex h-screen flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 font-sans antialiased overflow-hidden">
      {/* Top Application Bar */}
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 dark:border-slate-800 dark:bg-slate-900 z-30 shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(prev => !prev)}
            className="rounded-lg p-1.5 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            title="Toggle Table of Contents"
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setViewMode('reader')}>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-600 font-mono text-sm font-black text-white shadow-sm">
              asm
            </span>
            <div className="hidden sm:block">
              <h1 className="text-sm font-bold leading-none text-slate-900 dark:text-white">
                Assembly Language Mastery
              </h1>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                From Zero to Hero • 49 Chapters
              </p>
            </div>
          </div>
        </div>

        {/* Center View Switcher */}
        <div className="flex items-center rounded-lg border border-slate-200 bg-slate-100 p-0.5 dark:border-slate-800 dark:bg-slate-950 text-xs font-semibold">
          <button
            onClick={() => setViewMode('reader')}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1 transition ${
              viewMode === 'reader'
                ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-800 dark:text-white'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <BookOpen className="h-3.5 w-3.5 text-teal-600" />
            <span className="hidden md:inline">Interactive</span> eBook
          </button>

          <button
            onClick={() => setViewMode('interactive_lab')}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1 transition ${
              viewMode === 'interactive_lab'
                ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-800 dark:text-white'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <Terminal className="h-3.5 w-3.5 text-indigo-600" />
            <span>Silicon Lab</span>
          </button>

          <button
            onClick={() => setViewMode('print_book')}
            className="flex items-center gap-1.5 rounded-md px-3 py-1 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition"
          >
            <Printer className="h-3.5 w-3.5 text-emerald-600" />
            <span>PDF Book</span>
          </button>
        </div>

        {/* Right Toolbar: Font & Theme Controls */}
        <div className="flex items-center gap-2">
          {/* Typography Mode */}
          {viewMode === 'reader' && (
            <div className="hidden lg:flex items-center gap-1 border-r border-slate-200 pr-2 dark:border-slate-800">
              <button
                onClick={() => setFontMode(fontMode === 'sans' ? 'serif' : fontMode === 'serif' ? 'mono' : 'sans')}
                className="rounded-lg p-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                title={`Current Font: ${fontMode}. Click to switch.`}
              >
                <Type className="h-4 w-4" />
              </button>

              <div className="flex items-center text-xs font-mono text-slate-500">
                <button
                  onClick={() => setFontSize(prev => Math.max(13, prev - 1))}
                  className="px-1 hover:text-slate-800 dark:hover:text-slate-200"
                >
                  A-
                </button>
                <span className="px-1 text-[11px]">{fontSize}</span>
                <button
                  onClick={() => setFontSize(prev => Math.min(22, prev + 1))}
                  className="px-1 hover:text-slate-800 dark:hover:text-slate-200"
                >
                  A+
                </button>
              </div>
            </div>
          )}

          {/* Dark / Light Toggle */}
          <button
            onClick={() => setDarkMode(prev => !prev)}
            className="rounded-lg p-1.5 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {darkMode ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4" />}
          </button>

          {/* Direct Print to PDF Button */}
          <button
            onClick={() => setViewMode('print_book')}
            className="inline-flex items-center gap-1.5 rounded-lg bg-teal-600 px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-teal-700 transition"
          >
            <Printer className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Export PDF</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar (Interactive Table of Contents) */}
        {sidebarOpen && (
          <aside className="w-80 shrink-0 h-full border-r border-slate-200 dark:border-slate-800 z-20">
            <TableOfContents
              chapters={ALL_CHAPTERS}
              currentChapterId={currentChapterId}
              onSelectChapter={(id) => {
                setCurrentChapterId(id);
                if (window.innerWidth < 768) {
                  setSidebarOpen(false);
                }
              }}
              bookmarks={bookmarks}
              onToggleBookmark={toggleBookmark}
              completedChapters={completedChapters}
            />
          </aside>
        )}

        {/* Center Main Scrollable Area */}
        <main className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950">
          {viewMode === 'reader' && (
            <ChapterView
              chapter={currentChapter}
              totalChapters={ALL_CHAPTERS.length}
              onNavigateChapter={(id) => setCurrentChapterId(id)}
              isBookmarked={bookmarks.includes(currentChapter.id)}
              onToggleBookmark={() => toggleBookmark(currentChapter.id)}
              isCompleted={completedChapters.includes(currentChapter.id)}
              onToggleCompleted={() => toggleCompleted(currentChapter.id)}
              fontMode={fontMode}
              fontSize={fontSize}
            />
          )}

          {viewMode === 'interactive_lab' && (
            <InteractiveLab />
          )}
        </main>
      </div>
    </div>
  );
}
export default App;
