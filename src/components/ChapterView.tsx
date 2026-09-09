import React, { useState } from 'react';
import { Chapter, FontMode } from '../types';
import { DiagramRenderer } from './diagrams/DiagramRenderer';
import { 
  CheckCircle, ChevronLeft, ChevronRight, Bookmark, 
  Copy, Check, HelpCircle, Eye, EyeOff, BookOpen, Lightbulb
} from 'lucide-react';

interface ChapterViewProps {
  chapter: Chapter;
  totalChapters: number;
  onNavigateChapter: (id: number) => void;
  isBookmarked: boolean;
  onToggleBookmark: () => void;
  isCompleted: boolean;
  onToggleCompleted: () => void;
  fontMode: FontMode;
  fontSize: number;
}

export const ChapterView: React.FC<ChapterViewProps> = ({
  chapter,
  totalChapters,
  onNavigateChapter,
  isBookmarked,
  onToggleBookmark,
  isCompleted,
  onToggleCompleted,
  fontMode,
  fontSize
}) => {
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);
  const [revealedSolutions, setRevealedSolutions] = useState<Record<string, boolean>>({});
  const [revealedAnswers, setRevealedAnswers] = useState<Record<number, boolean>>({});

  const handleCopyCode = (id: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeId(id);
    setTimeout(() => setCopiedCodeId(null), 2000);
  };

  const toggleSolution = (id: string) => {
    setRevealedSolutions(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleAnswer = (idx: number) => {
    setRevealedAnswers(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const fontClass = fontMode === 'serif' 
    ? 'font-serif' 
    : fontMode === 'mono' 
    ? 'font-mono' 
    : 'font-sans';

  return (
    <article className={`max-w-4xl mx-auto px-4 sm:px-8 py-8 ${fontClass}`} style={{ fontSize: `${fontSize}px` }}>
      {/* Chapter Top Badge & Navigation breadcrumb */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <span className="rounded bg-teal-100 px-2 py-0.5 text-xs font-bold text-teal-800 dark:bg-teal-950 dark:text-teal-300">
            Level {chapter.level} • {chapter.levelTitle}
          </span>
          <span className="text-xs text-slate-400">Chapter {chapter.id} of {totalChapters}</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onToggleBookmark}
            className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1 text-xs font-medium transition ${
              isBookmarked
                ? 'border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300'
                : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300'
            }`}
          >
            <Bookmark className={`h-3.5 w-3.5 ${isBookmarked ? 'fill-amber-500 text-amber-500' : ''}`} />
            {isBookmarked ? 'Bookmarked' : 'Bookmark'}
          </button>

          <button
            onClick={onToggleCompleted}
            className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1 text-xs font-medium transition ${
              isCompleted
                ? 'border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300'
                : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300'
            }`}
          >
            <CheckCircle className={`h-3.5 w-3.5 ${isCompleted ? 'fill-emerald-500 text-white' : ''}`} />
            {isCompleted ? 'Completed' : 'Mark as Read'}
          </button>
        </div>
      </div>

      {/* Chapter Title & Header */}
      <header className="mt-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
          {chapter.title}
        </h1>
        {chapter.subtitle && (
          <p className="mt-2 text-base text-slate-600 dark:text-slate-400 font-medium">
            {chapter.subtitle}
          </p>
        )}
      </header>

      {/* Overview Metadata Cards (Learning Objectives & Prerequisites) */}
      <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2">
        {/* Learning Objectives */}
        <div className="rounded-xl border border-teal-200 bg-teal-50/40 p-5 dark:border-teal-900/40 dark:bg-teal-950/20">
          <h2 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-teal-900 dark:text-teal-300">
            <BookOpen className="h-4 w-4 text-teal-600" /> Learning Objectives
          </h2>
          <ul className="mt-3 space-y-2 text-xs text-slate-700 dark:text-slate-300">
            {chapter.learningObjectives.map((obj, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-teal-600 shrink-0" />
                <span>{obj}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Prerequisites & Key Concepts */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900/60">
          <h2 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
            <Lightbulb className="h-4 w-4 text-amber-500" /> Prerequisites & Core Concepts
          </h2>
          <div className="mt-3 space-y-3 text-xs">
            {chapter.prerequisites.length > 0 && (
              <div>
                <span className="font-semibold text-slate-900 dark:text-slate-100">Prerequisites:</span>
                <p className="mt-1 text-slate-600 dark:text-slate-400">{chapter.prerequisites.join(' • ')}</p>
              </div>
            )}
            <div>
              <span className="font-semibold text-slate-900 dark:text-slate-100">Key Takeaways:</span>
              <ul className="mt-1 space-y-1.5 text-slate-600 dark:text-slate-400">
                {chapter.keyConcepts.map((concept, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="mt-1 text-slate-400">•</span>
                    <span>{concept}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Embedded Architectural Diagram for this chapter */}
      {chapter.diagramType && (
        <DiagramRenderer type={chapter.diagramType} chapterTitle={chapter.title} />
      )}

      {/* Chapter Sections */}
      <div className="mt-8 space-y-10">
        {chapter.sections.map((section) => (
          <section key={section.id} id={section.id} className="scroll-mt-20">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800/80 pb-2">
              {section.title}
            </h3>

            <div className="mt-4 whitespace-pre-line text-slate-700 dark:text-slate-300 leading-relaxed text-sm">
              {section.content}
            </div>

            {/* Structured Data Tables */}
            {section.tableData && (
              <div className="mt-5 overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-700 dark:bg-slate-800/80 dark:text-slate-300 font-bold uppercase tracking-wider">
                    <tr>
                      {section.tableData.headers.map((h, i) => (
                        <th key={i} className="px-3.5 py-2.5">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-mono">
                    {section.tableData.rows.map((row, rIdx) => (
                      <tr key={rIdx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        {row.map((cell, cIdx) => (
                          <td key={cIdx} className="px-3.5 py-2 text-slate-800 dark:text-slate-200">
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Code Snippets */}
            {section.codeSnippets && (
              <div className="mt-5 space-y-4">
                {section.codeSnippets.map((snippet, sIdx) => {
                  const snippetId = `${section.id}-${sIdx}`;
                  const isCopied = copiedCodeId === snippetId;

                  return (
                    <div key={sIdx} className="rounded-xl border border-slate-200 bg-slate-950 text-slate-100 overflow-hidden shadow-sm dark:border-slate-800">
                      <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900/90 px-4 py-2 text-xs">
                        <span className="font-mono font-medium text-teal-400">
                          {snippet.title || `${snippet.language.toUpperCase()} Listing`}
                        </span>
                        <button
                          onClick={() => handleCopyCode(snippetId, snippet.code)}
                          className="flex items-center gap-1 rounded bg-slate-800 px-2 py-1 text-[11px] font-medium text-slate-300 hover:bg-slate-700 transition"
                        >
                          {isCopied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                          {isCopied ? 'Copied' : 'Copy'}
                        </button>
                      </div>
                      <div className="p-4 overflow-x-auto">
                        <pre className="font-mono text-xs leading-relaxed text-slate-200">
                          <code>{snippet.code}</code>
                        </pre>
                      </div>
                      {snippet.explanation && (
                        <div className="border-t border-slate-800 bg-slate-900/60 p-3 text-xs text-slate-300 leading-relaxed whitespace-pre-line">
                          {snippet.explanation}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        ))}
      </div>

      {/* Exercises Section */}
      {chapter.exercises.length > 0 && (
        <section className="mt-14 pt-8 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold dark:bg-indigo-950 dark:text-indigo-300">
                ✍
              </span>
              Hands-On Exercises ({chapter.exercises.length})
            </h2>
          </div>

          <div className="mt-6 space-y-4">
            {chapter.exercises.map((ex) => {
              const isRevealed = !!revealedSolutions[ex.id];

              return (
                <div key={ex.id} className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900/80 shadow-sm">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">{ex.title}</h4>
                      <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{ex.description}</p>
                      {ex.hints && (
                        <div className="mt-2 text-[11px] text-amber-700 bg-amber-50 dark:bg-amber-950/30 dark:text-amber-300 p-2 rounded">
                          <strong>Hint:</strong> {ex.hints}
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => toggleSolution(ex.id)}
                      className="shrink-0 inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 transition"
                    >
                      {isRevealed ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                      {isRevealed ? 'Hide Solution' : 'View Solution'}
                    </button>
                  </div>

                  {isRevealed && (
                    <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 animate-in fade-in duration-200">
                      <div className="rounded-lg bg-slate-950 p-3.5 overflow-x-auto text-xs font-mono text-emerald-400">
                        <pre>{ex.solution}</pre>
                      </div>
                      {ex.solutionExplanation && (
                        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                          {ex.solutionExplanation}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Practice Interview Questions */}
      {chapter.practiceQuestions.length > 0 && (
        <section className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-800">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-teal-600 dark:text-teal-400" />
            Interview & Systems Engineering Questions ({chapter.practiceQuestions.length})
          </h2>

          <div className="mt-6 space-y-3">
            {chapter.practiceQuestions.map((pq, idx) => {
              const isAnswerOpen = !!revealedAnswers[idx];

              return (
                <div key={idx} className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-900/50">
                  <div 
                    className="flex items-start justify-between gap-3 cursor-pointer"
                    onClick={() => toggleAnswer(idx)}
                  >
                    <span className="font-semibold text-xs text-slate-900 dark:text-slate-100">
                      {idx + 1}. {pq.question}
                    </span>
                    <span className="shrink-0 text-xs font-medium text-teal-600 dark:text-teal-400">
                      {isAnswerOpen ? 'Hide' : 'Answer'}
                    </span>
                  </div>

                  {isAnswerOpen && (
                    <div className="mt-3 pt-3 border-t border-slate-200/60 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 leading-relaxed animate-in fade-in duration-200">
                      {pq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Chapter Summary */}
      <section className="mt-12 rounded-xl border border-indigo-200 bg-gradient-to-br from-indigo-50/50 to-teal-50/30 p-6 dark:border-indigo-900/50 dark:from-indigo-950/20 dark:to-teal-950/10">
        <h2 className="text-sm font-bold uppercase tracking-wider text-indigo-900 dark:text-indigo-300">
          Chapter Summary & Key Takeaways
        </h2>
        <ul className="mt-4 space-y-2 text-xs text-slate-700 dark:text-slate-300">
          {chapter.summary.map((item, idx) => (
            <li key={idx} className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 rounded-full bg-indigo-600 shrink-0" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Prev / Next Chapter Navigation */}
      <div className="mt-12 flex items-center justify-between border-t border-slate-200 pt-6 dark:border-slate-800 print:hidden">
        {chapter.id > 1 ? (
          <button
            onClick={() => onNavigateChapter(chapter.id - 1)}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 transition"
          >
            <ChevronLeft className="h-4 w-4" /> Previous Chapter
          </button>
        ) : <div />}

        {chapter.id < totalChapters ? (
          <button
            onClick={() => onNavigateChapter(chapter.id + 1)}
            className="flex items-center gap-2 rounded-xl bg-teal-600 px-5 py-2.5 text-xs font-semibold text-white shadow hover:bg-teal-700 transition"
          >
            Next Chapter <ChevronRight className="h-4 w-4" />
          </button>
        ) : (
          <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
            🎉 You have reached the end of the course!
          </div>
        )}
      </div>
    </article>
  );
};
