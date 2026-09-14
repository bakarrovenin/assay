/**
 * Benchmark recount guard.
 *
 * The benchmark's rates are computed at build time and in the browser by
 * aggregate() in src/lib/benchmark.ts. This recounts the stored assay runs
 * with plain counting, independent of that code, and compares against what
 * the built /benchmark and /benchmark/leaderboard pages actually say. Same
 * discipline as verify_report_math.py in the pilot: a number nobody can
 * check by eye is the next place a false pass would hide.
 *
 * A negative control runs first: a corrupted copy of the records must be
 * caught, or a clean pass means nothing.
 *
 * Usage: node scripts/verify-benchmark-math.mjs   (after astro build)
 * Exit 0 match, 1 mismatch, 2 the control did not fire, 3 nothing to check.
 */
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;
const data = JSON.parse(readFileSync(join(ROOT, 'src/data/benchmark/assay-runs.json'), 'utf8'));

function recount(runs) {
  let scored = 0, alert = 0, verified = 0, noAlert = 0;
  for (const r of runs) {
    if (r.verdict === 'NO ALERT') { noAlert++; continue; }
    if (!r.checks) continue;
    scored++;
    if (r.checks.A.pass) alert++;
    if (r.verdict === 'VERIFIED') verified++;
  }
  const pct = (n) => (scored ? Math.round((n / scored) * 100) : null);
  return { scored, alert, verified, noAlert, alertRate: pct(alert), verifiedRate: pct(verified) };
}

const t = recount(data.runs);
console.log(`stored assay runs: ${data.runs.length}`);
console.log(`  scored ${t.scored}  alert closed ${t.alert} (${t.alertRate}%)  verified ${t.verified} (${t.verifiedRate}%)  no alert ${t.noAlert}`);

// Negative control: flip one verified cell and require a different count.
const corrupted = JSON.parse(JSON.stringify(data.runs));
const v = corrupted.find((r) => r.verdict === 'VERIFIED');
v.verdict = 'NOT VERIFIED';
if (recount(corrupted).verified === t.verified) {
  console.log('RESULT: THE CONTROL DID NOT FIRE');
  process.exit(2);
}

const pages = ['dist/benchmark/index.html', 'dist/benchmark/leaderboard/index.html'];
if (!pages.every((p) => existsSync(join(ROOT, p)))) {
  console.log('RESULT: NOTHING TO CHECK, build first');
  process.exit(3);
}
const text = (p) => readFileSync(join(ROOT, p), 'utf8').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');

const expect = [
  ['dist/benchmark/index.html', `${t.scored} patches scored.`],
  ['dist/benchmark/index.html', `${t.alertRate}%`],
  ['dist/benchmark/index.html', `closed the alert. ${t.alert} of ${t.scored}.`],
  ['dist/benchmark/index.html', `actually verified. ${t.verified} of ${t.scored}.`],
  ['dist/benchmark/index.html', `${t.alertRate - t.verifiedRate} pp`],
  ['dist/benchmark/leaderboard/index.html', `${t.scored} scored cells`],
  ['dist/benchmark/leaderboard/index.html', `alert closed ${t.alert} of ${t.scored}`],
  ['dist/benchmark/leaderboard/index.html', `verified ${t.verified} of ${t.scored}`],
  ['dist/benchmark/leaderboard/index.html', `${t.noAlert} no alert`],
];
let bad = 0;
for (const [p, s] of expect) {
  const ok = text(p).includes(s);
  console.log(`  ${ok ? 'present' : 'MISSING'}  ${p.replace('dist/', '/').replace('/index.html', '')}  "${s}"`);
  if (!ok) bad++;
}
if (bad) { console.log('RESULT: A PUBLISHED BENCHMARK FIGURE DOES NOT MATCH THE RECOUNT'); process.exit(1); }
console.log('RESULT: EVERY PUBLISHED BENCHMARK FIGURE MATCHES AN INDEPENDENT RECOUNT');
console.log('  and the control reported a corrupted record.');
