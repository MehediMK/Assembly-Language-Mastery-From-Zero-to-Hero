import React from 'react';
import { Chapter } from '../types';
import { BOOK_METADATA } from '../data/allChapters';
import { BOOK_LEVELS } from '../data/bookLevels';
import { DiagramRenderer } from './diagrams/DiagramRenderer';
import { Printer, ArrowLeft } from 'lucide-react';

interface PrintBookViewProps {
  chapters: Chapter[];
  onExitPrintView: () => void;
}

export const PrintBookView: React.FC<PrintBookViewProps> = ({ chapters, onExitPrintView }) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 print:bg-white print:text-black">
      {/* Sticky Screen-only Print Bar */}
      <header className="sticky top-0 z-50 flex items-center justify-between border-b border-slate-300 bg-white/95 px-6 py-3 shadow-md backdrop-blur dark:bg-slate-900 dark:border-slate-800 print:hidden">
        <div className="flex items-center gap-3">
          <button
            onClick={onExitPrintView}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            <ArrowLeft className="h-4 w-4" /> Exit Print Mode
          </button>
          <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
            Print-Ready Publication View ({chapters.length} Chapters • ~{BOOK_METADATA.totalPagesEstimate} Pages)
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:block text-xs text-slate-500">
            Tip: Select <strong>"Save as PDF"</strong> in your browser dialog.
          </div>
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-5 py-2 text-xs font-bold text-white shadow-md hover:bg-teal-700 transition"
          >
            <Printer className="h-4 w-4" /> Print / Export to PDF
          </button>
        </div>
      </header>

      {/* Main Printable Document Container */}
      <main className="max-w-[850px] mx-auto bg-white my-8 p-12 sm:p-16 shadow-2xl print:m-0 print:p-0 print:shadow-none print:max-w-none">
        
        {/* ================= COVER PAGE ================= */}
        <section className="min-h-[1000px] flex flex-col justify-between py-16 border-b-2 border-slate-900 print:min-h-screen print:border-none print:page-break-after-always">
          <div>
            <div className="text-xs font-mono font-bold uppercase tracking-widest text-teal-700">
              The Definitive Low-Level Systems Guide
            </div>
            <h1 className="mt-8 text-4xl sm:text-5xl font-black tracking-tight text-slate-950 leading-tight">
              Assembly Language Mastery
            </h1>
            <p className="mt-4 text-2xl font-serif text-teal-800 italic">
              From Zero to Hero
            </p>
            <p className="mt-6 text-sm text-slate-600 max-w-lg leading-relaxed">
              Complete architectural walkthrough of x86-64, ARM64 (AArch64), RISC-V, and MIPS32.
              Covering foundations, data representations, stacks, calling conventions, SIMD vectorization,
              Linux kernel syscalls, OS kernel bootloaders, embedded systems, and binary exploitation.
            </p>
          </div>

          <div className="space-y-6 pt-12 border-t border-slate-200">
            <div className="grid grid-cols-2 gap-4 text-xs font-mono">
              <div>
                <span className="text-slate-400 block">AUTHOR</span>
                <span className="font-bold text-slate-800">{BOOK_METADATA.author}</span>
              </div>
              <div>
                <span className="text-slate-400 block">EDITION</span>
                <span className="font-bold text-slate-800">{BOOK_METADATA.edition}</span>
              </div>
              <div>
                <span className="text-slate-400 block">ISBN</span>
                <span className="font-bold text-slate-800">{BOOK_METADATA.isbn}</span>
              </div>
              <div>
                <span className="text-slate-400 block">CURRICULUM DEPTH</span>
                <span className="font-bold text-slate-800">49 Chapters • 9 Comprehensive Levels</span>
              </div>
            </div>
          </div>
        </section>

        {/* ================= COPYRIGHT PAGE ================= */}
        <section className="py-16 text-xs text-slate-600 leading-relaxed border-b border-slate-200 print:page-break-after-always print:min-h-screen print:flex print:flex-col print:justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 mb-4">{BOOK_METADATA.title}</h2>
            <p className="mb-2">Copyright © 2026 {BOOK_METADATA.author}. All rights reserved.</p>
            <p className="mb-4">
              Published by Systems Engineering Press. No part of this publication may be reproduced,
              distributed, or transmitted in any form or by any means without the prior written permission
              of the publisher, except in the case of brief quotations embodied in critical reviews.
            </p>
            <p className="font-mono text-[11px] mb-2">ISBN-13: {BOOK_METADATA.isbn}</p>
            <p className="font-mono text-[11px]">Printed for High-Resolution Distribution and Digital Archival.</p>
          </div>

          <div className="text-[10px] text-slate-400 pt-12">
            First Global Distribution: 2026. Certified Print-Ready Universal PDF Specification.
          </div>
        </section>

        {/* ================= PREFACE & PHILOSOPHY ================= */}
        <section className="py-16 border-b border-slate-200 print:page-break-after-always">
          <h2 className="text-2xl font-black text-slate-950 uppercase tracking-tight">Preface & Course Philosophy</h2>
          <div className="mt-6 space-y-4 text-sm text-slate-700 leading-relaxed font-serif">
            <p>
              Assembly language is the ultimate interface between human thought and physical silicon.
              Every high-level programming language—from C and Rust to Python and JavaScript—eventually
              reduces to opcodes decoded by the CPU’s control unit.
            </p>
            <p>
              This comprehensive volume was engineered to eliminate gaps in systems understanding.
              Whether you are optimizing critical SIMD loops, reverse-engineering malware, writing
              bare-metal firmware for microcontrollers, or developing operating system kernels,
              this curriculum provides practical, runnable assembly code with every fundamental concept.
            </p>
            <div className="my-6 rounded-lg border border-teal-200 bg-teal-50/50 p-4 font-sans text-xs">
              <span className="font-bold text-teal-900 uppercase tracking-wider block mb-1">Pedagogical Framework:</span>
              <span>1. Theory & Silicon Reality &rarr; 2. Complete Runnable Assembly Listings &rarr; 3. Hand-Crafted Architectural Diagrams &rarr; 4. Step-by-Step Problem Solutions &rarr; 5. Systems Interview Questions.</span>
            </div>
          </div>
        </section>

        {/* ================= COMPREHENSIVE TABLE OF CONTENTS ================= */}
        <section className="py-16 border-b border-slate-200 print:page-break-after-always">
          <h2 className="text-2xl font-black text-slate-950 uppercase tracking-tight mb-8">Table of Contents</h2>
          
          <div className="space-y-8">
            {BOOK_LEVELS.map((level) => {
              const levelChapters = chapters.filter(c => c.level === level.level);

              return (
                <div key={level.level} className="space-y-2">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-1 text-xs font-bold uppercase tracking-wider text-teal-800">
                    <span>Level {level.level}: {level.title}</span>
                    <span className="font-mono">{level.chapterRange}</span>
                  </div>

                  <div className="space-y-1.5 pt-2">
                    {levelChapters.map((ch) => (
                      <div key={ch.id} className="flex items-baseline justify-between text-xs hover:text-teal-700">
                        <span className="font-medium text-slate-800">
                          <span className="font-mono font-bold mr-2 text-slate-500">Ch. {ch.id}</span>
                          {ch.title.replace(/^Chapter \d+:\s*/, '')}
                        </span>
                        <div className="flex-1 mx-3 border-b border-dotted border-slate-300 h-2" />
                        <span className="font-mono text-slate-400 text-[11px] shrink-0">
                          Sec {ch.sections.length} • Ex {ch.exercises.length}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ================= ALL CHAPTERS (PRINTABLE SEQUENCE) ================= */}
        <div className="space-y-16">
          {chapters.map((chapter) => (
            <article 
              key={chapter.id} 
              id={`print-chapter-${chapter.id}`}
              className="py-12 border-b border-slate-200 print:border-none print:page-break-before-always"
            >
              {/* Chapter Header */}
              <div className="mb-6">
                <div className="text-[11px] font-mono font-bold uppercase tracking-widest text-teal-700 mb-1">
                  Level {chapter.level} • {chapter.levelTitle}
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
                  {chapter.title}
                </h2>
                {chapter.subtitle && (
                  <p className="mt-1 text-sm font-medium text-slate-600 italic">
                    {chapter.subtitle}
                  </p>
                )}
              </div>

              {/* Learning Objectives Box */}
              <div className="my-6 rounded-lg border border-slate-200 bg-slate-50 p-4 text-xs">
                <span className="font-bold text-slate-800 uppercase tracking-wider block mb-2">
                  Learning Objectives:
                </span>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-slate-700">
                  {chapter.learningObjectives.map((obj, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-teal-600 font-bold">•</span>
                      <span>{obj}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Graphic / Architectural Diagram */}
              {chapter.diagramType && (
                <div className="my-6">
                  <DiagramRenderer type={chapter.diagramType} chapterTitle={chapter.title} />
                </div>
              )}

              {/* Sections & Code Listings */}
              <div className="space-y-8 mt-6">
                {chapter.sections.map((section) => (
                  <section key={section.id} className="space-y-3">
                    <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-1">
                      {section.title}
                    </h3>
                    <div className="text-xs text-slate-700 leading-relaxed font-serif whitespace-pre-line">
                      {section.content}
                    </div>

                    {/* Tables if present */}
                    {section.tableData && (
                      <div className="my-3 overflow-x-auto rounded border border-slate-200">
                        <table className="w-full text-left text-[11px]">
                          <thead className="bg-slate-100 text-slate-700 font-bold uppercase">
                            <tr>
                              {section.tableData.headers.map((h, idx) => (
                                <th key={idx} className="p-2">{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200 font-mono">
                            {section.tableData.rows.map((row, rIdx) => (
                              <tr key={rIdx}>
                                {row.map((cell, cIdx) => (
                                  <td key={cIdx} className="p-2 text-slate-800">{cell}</td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {/* Code Snippets */}
                    {section.codeSnippets && (
                      <div className="space-y-3 mt-3">
                        {section.codeSnippets.map((snippet, sIdx) => (
                          <div key={sIdx} className="rounded border border-slate-300 bg-slate-950 p-3 text-slate-100 print:bg-slate-950">
                            <div className="font-mono text-[10px] text-teal-400 font-bold mb-1 border-b border-slate-800 pb-1">
                              Listing: {snippet.title || snippet.language}
                            </div>
                            <pre className="font-mono text-[11px] leading-snug overflow-x-auto">
                              <code>{snippet.code}</code>
                            </pre>
                            {snippet.explanation && (
                              <div className="mt-2 text-[10px] text-slate-400 font-sans border-t border-slate-800 pt-1">
                                {snippet.explanation}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </section>
                ))}
              </div>

              {/* Exercises & Solutions */}
              {chapter.exercises.length > 0 && (
                <div className="mt-8 pt-4 border-t border-slate-200">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-900 mb-3">
                    Hands-On Exercises:
                  </h4>
                  <div className="space-y-3">
                    {chapter.exercises.map((ex) => (
                      <div key={ex.id} className="rounded border border-slate-200 p-3 text-xs bg-slate-50/50">
                        <div className="font-bold text-slate-900">{ex.title}</div>
                        <p className="mt-1 text-slate-600">{ex.description}</p>
                        <div className="mt-2 rounded bg-slate-900 p-2 font-mono text-[10px] text-emerald-300 overflow-x-auto">
                          <pre>{ex.solution}</pre>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Practice Questions */}
              {chapter.practiceQuestions.length > 0 && (
                <div className="mt-6 pt-4 border-t border-slate-200">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-2">
                    Review Questions & Answers:
                  </h4>
                  <div className="space-y-2 text-xs">
                    {chapter.practiceQuestions.map((pq, pqIdx) => (
                      <div key={pqIdx} className="bg-slate-50 p-2.5 rounded border border-slate-200">
                        <span className="font-bold text-slate-900">Q: {pq.question}</span>
                        <p className="mt-1 text-slate-700 italic">A: {pq.answer}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Chapter Summary */}
              <div className="mt-6 p-3 rounded border border-teal-200 bg-teal-50/30 text-xs text-slate-700">
                <span className="font-bold text-teal-900 block mb-1">Chapter {chapter.id} Key Takeaways:</span>
                <ul className="list-disc list-inside space-y-0.5">
                  {chapter.summary.map((sum, sumIdx) => (
                    <li key={sumIdx}>{sum}</li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>

      </main>
    </div>
  );
};
