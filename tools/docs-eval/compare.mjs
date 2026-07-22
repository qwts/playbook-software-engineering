#!/usr/bin/env node

// The held-out validation gate — the piece of SkillOpt that issue #2 adopts
// as non-negotiable: a doc edit is ACCEPTED only if the validation-split
// score does not regress and something actually improved. Train-split gains
// alone prove nothing (the edit may simply overfit the benchmark — the tasks
// that informed it).
//
// Usage: node tools/docs-eval/compare.mjs <baseline.json> <candidate.json>
// Exit 0 = accept the candidate revision, 1 = reject.

import { readFileSync } from 'node:fs';
import process from 'node:process';

const [baselinePath, candidatePath] = process.argv.slice(2);
if (!baselinePath || !candidatePath) {
  console.error('usage: compare.mjs <baseline.json> <candidate.json>');
  process.exit(2);
}

const baseline = JSON.parse(readFileSync(baselinePath, 'utf8'));
const candidate = JSON.parse(readFileSync(candidatePath, 'utf8'));

const pct = (x) => `${(x * 100).toFixed(0)}%`;
console.log(`baseline  (${baseline.ref}): train ${pct(baseline.scores.train)}, validation ${pct(baseline.scores.validation)}`);
console.log(`candidate (${candidate.ref}): train ${pct(candidate.scores.train)}, validation ${pct(candidate.scores.validation)}`);

const flipped = candidate.perTask
  .filter((t) => {
    const before = baseline.perTask.find((b) => b.id === t.id);
    return before && before.pass !== t.pass;
  })
  .map((t) => `  ${t.pass ? '✔ fixed' : '✘ broke'} [${t.split}] ${t.id}`);
if (flipped.length > 0) console.log(flipped.join('\n'));

if (candidate.scores.validation < baseline.scores.validation) {
  console.log('REJECT: held-out validation regressed — the edit helps the tasks it saw and hurts the ones it did not.');
  process.exit(1);
}
if (candidate.scores.validation === baseline.scores.validation && candidate.scores.train <= baseline.scores.train) {
  console.log('REJECT: no measured improvement on either split — the edit is not defended by evidence.');
  process.exit(1);
}
console.log('ACCEPT: improvement holds on the held-out split.');
