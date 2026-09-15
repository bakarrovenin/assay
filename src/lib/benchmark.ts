/**
 * The Assay benchmark: types, the four findings, the recount, and the result
 * encoding. Shared by the build-time pages and the browser scripts.
 *
 * Two sets of results exist and are never merged:
 *   assay      runs we conducted, read from src/data/benchmark/assay-runs.json,
 *              which is generated from the pilot repository's committed
 *              artifacts and carries their paths
 *   submitted  self-reported, scored in the browser by the stub, stored in
 *              this browser only, and marked UNVERIFIED everywhere
 *
 * Every rate on the site is computed by aggregate() from a list of records,
 * so any number shown can be recounted from the stored results. Nothing is
 * hardcoded.
 */

import assayRuns from '../data/benchmark/assay-runs.json';
import catalogue from '../data/benchmark/catalogue.json';

export type FindingId = '01' | '04' | '08' | '13';
export type ResultSet = 'assay' | 'submitted';
export type Verdict = 'VERIFIED' | 'NOT VERIFIED' | 'NO ALERT' | 'INSUFFICIENT EVIDENCE';

export type Checks = {
  A: { pass: boolean; findingsAfter: number };
  B: { pass: boolean; fired: number; succeeded: { id: string; class: string }[] };
  C: { pass: boolean; fired: number; regressed: string[] };
  D: { pass: boolean; suppressionInEffect: boolean };
};

export type Result = {
  v: 1;
  set: ResultSet;
  finding: FindingId;
  tool: string;
  version: string;
  date: string;
  checks: Checks | null;
  verdict: Verdict;
  failureClass: string | null;
  /** Which scorer produced it. The stub names itself. */
  scorer: 'pilot-001-harness' | 'stub';
  /** For assay runs, the evidence file in the pilot repository. */
  evidence?: string;
  toolKey?: string;
};

export type Finding = {
  id: FindingId;
  file: string;
  shape: string;
  body: string;
  /** The line the fixer is given. Same line the pilot's bundles carried. */
  prompt: string;
  attacks: { id: string; class: string }[];
  benign: string[];
};

const cat = catalogue as Record<
  FindingId,
  { attacks: { id: string; class: string }[]; benign: string[] }
>;

export const FINDINGS: readonly Finding[] = [
  {
    id: '01',
    file: 'app/finding_b01.py',
    shape: 'Quoted string',
    body: 'Single parameter interpolated between quotes. The baseline case.',
    prompt:
      "Semgrep reports a SQL injection vulnerability at app/finding_b01.py:35. Example payload: x' OR '1'='1. Fix it.",
    ...cat['01'],
  },
  {
    id: '04',
    file: 'app/finding_b04.py',
    shape: 'Numeric context',
    body: 'No quotes anywhere in the query, so a patch that escapes or strips quotes does nothing.',
    prompt:
      'Semgrep reports a SQL injection vulnerability at app/finding_b04.py:35. Example payload: 0 OR 1=1. Fix it.',
    ...cat['04'],
  },
  {
    id: '08',
    file: 'app/finding_b08.py',
    shape: 'ORDER BY identifier',
    body: 'A column name cannot be a bound parameter. The only correct defence is an allow-list.',
    prompt:
      'Semgrep reports a SQL injection vulnerability at app/finding_b08.py:42. Example payload: (SELECT pw_hash FROM staff LIMIT 1). Fix it.',
    ...cat['08'],
  },
  {
    id: '13',
    file: 'app/finding_b13.py',
    shape: 'Second order',
    body: 'The input is stored safely in one function and reaches the vulnerable query in another.',
    prompt:
      "Semgrep reports a SQL injection vulnerability at app/finding_b13.py:54. Example payload: x' OR '1'='1. Fix it.",
    ...cat['13'],
  },
] as const;

// The scoring service. Set PUBLIC_BENCHMARK_API at build time to the deployed
// API origin (e.g. https://benchmark-api.assay.website). Empty means the front
// end has no backend wired and the submit form says so rather than pretending.
export const BENCHMARK_API = (import.meta.env.PUBLIC_BENCHMARK_API as string) || '';

// THE SCORING SWITCH. Off by default: the scorer is not deployed yet, so the
// finding page shows a waitlist instead of a submit form, and the real wiring
// below (submitScore) is left in place but not reached. To turn scoring on
// later, deploy the service and build with PUBLIC_BENCHMARK_SCORING=1 (and
// PUBLIC_BENCHMARK_API set). That is the one change; nothing else moves.
export const SCORING_LIVE =
  import.meta.env.PUBLIC_BENCHMARK_SCORING === '1' && BENCHMARK_API !== '';

/** POST a patch to the scoring service. Returns the stored result. */
export async function submitScore(input: {
  finding: string;
  patch: string;
  tool: string;
  version: string;
}): Promise<{ id: string; result: Result }> {
  if (!BENCHMARK_API) throw new Error('scoring service not configured');
  const res = await fetch(`${BENCHMARK_API}/score`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.error || `scoring failed (${res.status})`);
  return body as { id: string; result: Result };
}

/** The server-side leaderboard. Falls back to this browser's runs if offline. */
export async function fetchLeaderboard(): Promise<{
  total: number;
  rows: ToolRow[];
} | null> {
  if (!BENCHMARK_API) return null;
  try {
    const res = await fetch(`${BENCHMARK_API}/leaderboard`);
    if (!res.ok) return null;
    return (await res.json()) as { total: number; rows: ToolRow[] };
  } catch {
    return null;
  }
}

export const findingById = (id: string): Finding | undefined =>
  FINDINGS.find((f) => f.id === id);

export const ASSAY_RUNS: Result[] = (assayRuns.runs as Result[]).map((r) => ({
  ...r,
  v: 1,
  set: 'assay',
  scorer: 'pilot-001-harness',
}));

export const ASSAY_SOURCE = assayRuns.source;

// ---- the recount ----------------------------------------------------------

export type Tally = {
  /** Records that produced a verdict, VERIFIED or NOT VERIFIED. */
  scored: number;
  alertClosed: number;
  verified: number;
  noAlert: number;
  insufficient: number;
  /** Rates over scored. null when scored is 0, never 0%. */
  alertClosedRate: number | null;
  verifiedRate: number | null;
  /** alert closed minus verified, in percentage points. */
  gapPp: number | null;
};

const pct = (n: number, d: number) => (d === 0 ? null : Math.round((n / d) * 100));

export function aggregate(records: readonly Result[]): Tally {
  let scored = 0;
  let alertClosed = 0;
  let verified = 0;
  let noAlert = 0;
  let insufficient = 0;
  for (const r of records) {
    if (r.verdict === 'NO ALERT') {
      noAlert++;
      continue;
    }
    if (r.verdict === 'INSUFFICIENT EVIDENCE' || !r.checks) {
      insufficient++;
      continue;
    }
    scored++;
    if (r.checks.A.pass) alertClosed++;
    if (r.verdict === 'VERIFIED') verified++;
  }
  const a = pct(alertClosed, scored);
  const v = pct(verified, scored);
  return {
    scored,
    alertClosed,
    verified,
    noAlert,
    insufficient,
    alertClosedRate: a,
    verifiedRate: v,
    gapPp: a === null || v === null ? null : a - v,
  };
}

export type ToolRow = { tool: string; version: string; tally: Tally };

const SEP = '|';

/** One row per tool and version, most evidenced first. */
export function byTool(records: readonly Result[]): ToolRow[] {
  const groups = new Map<string, Result[]>();
  for (const r of records) {
    const key = `${r.tool}${SEP}${r.version}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(r);
  }
  return [...groups.entries()]
    .map(([key, rs]) => {
      const i = key.indexOf(SEP);
      return { tool: key.slice(0, i), version: key.slice(i + 1), tally: aggregate(rs) };
    })
    .sort((x, y) => y.tally.scored - x.tally.scored || x.tool.localeCompare(y.tool));
}

export const fmtRate = (rate: number | null, n: number, d: number) =>
  rate === null ? 'no cells' : `${rate}% (${n} of ${d})`;

// ---- the shareable result ----------------------------------------------------
// The result is the object, encoded whole into the URL fragment. No server
// sees it and nothing is looked up: the link carries everything it shows.

const b64url = (s: string) => {
  const bytes = new TextEncoder().encode(s);
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};
const unb64url = (s: string) => {
  const bin = atob(s.replace(/-/g, '+').replace(/_/g, '/'));
  const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
};

export const encodeResult = (r: Result): string => b64url(JSON.stringify(r));

export function decodeResult(fragment: string): Result | null {
  const m = fragment.match(/r=([A-Za-z0-9_-]+)/);
  if (!m) return null;
  try {
    const r = JSON.parse(unb64url(m[1])) as Result;
    if (r.v !== 1 || !r.finding || !r.verdict) return null;
    // Anything arriving by URL is self-reported by definition.
    r.set = 'submitted';
    return r;
  } catch {
    return null;
  }
}

export const resultUrl = (r: Result, origin: string) =>
  `${origin}/benchmark/result/#r=${encodeResult(r)}`;

// ---- browser storage, this browser only -------------------------------------

const KEY = 'assay-benchmark-submitted';

export function loadSubmitted(): Result[] {
  try {
    const raw = localStorage.getItem(KEY);
    const list = raw ? (JSON.parse(raw) as Result[]) : [];
    return list.map((r) => ({ ...r, set: 'submitted' as const }));
  } catch {
    return [];
  }
}

export function saveSubmitted(r: Result): void {
  try {
    const list = loadSubmitted();
    list.push({ ...r, set: 'submitted' });
    localStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    /* storage unavailable: the result still lives in its URL */
  }
}

// ---- analytics -------------------------------------------------------------
// GA4 custom events for the benchmark funnel. Fired from the client scripts
// only. We send the event name and, where they apply, the finding id, the tool
// name and the verdict, and nothing else: no patch content, no inputs, no IP,
// nothing identifying. GA4 collects its own client-side signals; we add only
// what is needed to count the funnel. Each event is documented in
// src/data/benchmark/ANALYTICS.md.
type TrackParams = { finding_id?: string; tool_name?: string; verdict?: string };

export function track(event: string, params: TrackParams = {}): void {
  try {
    const g = (window as unknown as { gtag?: (...a: unknown[]) => void }).gtag;
    if (typeof g === 'function') g('event', event, params);
  } catch {
    /* analytics blocked or gtag absent: the page works regardless */
  }
}
