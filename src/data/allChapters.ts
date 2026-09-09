import { Chapter } from '../types';
import { CHAPTERS_LEVEL_1 } from './chaptersLevel1';
import { CHAPTERS_LEVEL_2 } from './chaptersLevel2';
import { CHAPTERS_LEVEL_3 } from './chaptersLevel3';
import { CHAPTERS_LEVEL_4 } from './chaptersLevel4';
import { CHAPTERS_LEVEL_5 } from './chaptersLevel5';
import { CHAPTERS_LEVEL_6 } from './chaptersLevel6';
import { CHAPTERS_LEVEL_7 } from './chaptersLevel7';
import { CHAPTERS_LEVEL_8 } from './chaptersLevel8';
import { CHAPTERS_LEVEL_9 } from './chaptersLevel9';

export const ALL_CHAPTERS: Chapter[] = [
  ...CHAPTERS_LEVEL_1,
  ...CHAPTERS_LEVEL_2,
  ...CHAPTERS_LEVEL_3,
  ...CHAPTERS_LEVEL_4,
  ...CHAPTERS_LEVEL_5,
  ...CHAPTERS_LEVEL_6,
  ...CHAPTERS_LEVEL_7,
  ...CHAPTERS_LEVEL_8,
  ...CHAPTERS_LEVEL_9
];

export const TOTAL_CHAPTER_COUNT = ALL_CHAPTERS.length;

export const BOOK_METADATA = {
  title: 'Assembly Language Mastery: From Zero to Hero',
  subtitle: 'The Definitive Guide to x86-64, ARM64, RISC-V, and MIPS Low-Level Engineering',
  author: 'Systems Engineering Academy',
  edition: 'First Global Edition (2026)',
  format: 'Universal Standard Publication / Production-Grade PDF & eBook',
  isbn: '978-0-987654-32-1',
  totalPagesEstimate: 714,
  totalChapters: 49,
  totalLevels: 9,
  readingTimeHours: 48
};
