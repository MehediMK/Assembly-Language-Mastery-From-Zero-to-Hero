import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { CHAPTERS_LEVEL_1 } from '../src/data/chaptersLevel1.ts';

const manuscript = readFileSync(new URL('../Assembly_Language_Mastery_From_Zero_to_Hero.md', import.meta.url), 'utf8');
const source = manuscript.slice(manuscript.indexOf('## Chapter 1:'), manuscript.indexOf('## Chapter 2:'));
const chapter = CHAPTERS_LEVEL_1[0];
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
  if (line.startsWith('```')) { code = !code; continue; }
  if (!line.trim() || (!code && /^(#{1,3} |---\s*$|\|[\s:|\-]+\|$)/.test(line))) continue;
  const cells = !code && line.startsWith('|') ? line.split('|').slice(1, -1) : [line];
  for (let text of cells) {
    if (!code) text = text.replace(/^([-*]|\d+\.) /, '');
    const expected = normalize(text);
    assert(fields.some(value => value.includes(expected)), `Missing source content: ${text}`);
    checked++;
  }
}
assert.equal(chapter.sections.length, 23);
assert.equal(chapter.exercises.length, 4);
assert.equal(chapter.practiceQuestions.length, 10);
assert.equal(chapter.diagramType, 'cpu_architecture');
for (const ex of chapter.exercises) assert(ex.solution.length > 0);
for (const question of chapter.practiceQuestions) assert(question.answer.length > 0);
console.log(`Chapter 1 coverage passed: ${checked} source lines/table cells; 23 native sections, 4 interactive exercises, 10 answered questions.`);
