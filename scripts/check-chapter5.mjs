import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { CHAPTERS_LEVEL_1 } from '../src/data/chaptersLevel1.ts';

const manuscript = readFileSync(new URL('../Assembly_Language_Mastery_From_Zero_to_Hero.md', import.meta.url), 'utf8');
const source = manuscript.slice(manuscript.indexOf('# Chapter 5:'), manuscript.indexOf('# Chapter 6:'));
const chapter = CHAPTERS_LEVEL_1[4];
function strings(value) {
  if (typeof value === 'string') return [value];
  if (Array.isArray(value)) return value.flatMap(strings);
  if (value && typeof value === 'object') return Object.values(value).flatMap(strings);
  return [];
}
const normalize = text => text.replace(/\*\*|`/g, '').replace(/[’‘]/g, "'").replace(/[“”]/g, '"').replace(/\s+/g, ' ').trim();
const fields = strings(chapter).map(normalize);
let code = false;
let checked = 0;
for (const line of source.split('\n')) {
  if (line.trimStart().startsWith('```')) { code = !code; continue; }
  if (!line.trim() || (!code && /^(#{1,3} |---\s*$|\|[\s:|\-]+\|$)/.test(line))) continue;
  const cells = !code && line.startsWith('|') ? line.split('|').slice(1, -1) : [line];
  for (let text of cells) {
    if (!code) text = text.replace(/^([-*]|\d+\.) /, '');
    const expected = normalize(text);
    assert(fields.some(value => value.includes(expected)), `Missing source content: ${text}`);
    checked++;
  }
}
assert.equal(chapter.sections.length, 24);
assert.equal(chapter.exercises.length, 5);
assert.equal(chapter.practiceQuestions.length, 10);
assert.equal(chapter.diagramType, 'basic_instructions_flags');
for (const ex of chapter.exercises) assert(ex.solution.length > 0);
for (const question of chapter.practiceQuestions) assert(question.answer.length > 0);
console.log(`Chapter 5 coverage passed: ${checked} source lines/table cells; 24 native sections, 5 interactive exercises, 10 answered questions.`);

const body = source.slice(source.indexOf('## 5.1 '), source.indexOf('## 5.8 '));
const headings = [...body.matchAll(/^#{2,3} (.+)$/gm)].map(match => match[1].replace(/`/g, ''));
assert.deepEqual(chapter.sections.map(section => section.title), headings, 'Keep all source section headings in order');
