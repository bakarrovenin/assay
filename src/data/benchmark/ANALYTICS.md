# Benchmark analytics events

GA4 custom events for the benchmark funnel, fired from the benchmark client
scripts through the shared `track()` helper in `src/lib/benchmark.ts`. They load
on the same GA4 property as the rest of the site (`G-BDC37TQ4BY`, configured in
`BaseLayout.astro`).

## What we send, and what we do not

Each event carries at most: the event name, the `finding_id`, the `tool_name`,
and the `verdict`. Nothing else. We never send patch content, the tool version
string, the submitter's inputs, an email, or an IP. GA4 collects its own
client-side signals; we add only the four fields needed to read the funnel. If
analytics is blocked or `gtag` is absent, `track()` is a no-op and every page
still works.

## The funnel

| Event | Fires when | Parameters |
|---|---|---|
| `benchmark_view` | the benchmark entry page loads | none |
| `benchmark_finding_open` | a finding page loads | `finding_id` |
| `benchmark_copy_module` | the "Copy module" button is clicked | `finding_id` |
| `benchmark_copy_prompt` | the "Copy prompt" button is clicked | `finding_id` |
| `benchmark_submit` | the scoring step is reached: a patch is submitted (scoring live) or the "Notify me when scoring opens" button is clicked (waitlist) | `finding_id`, and `tool_name` when scoring is live |
| `benchmark_verdict` | a result page renders a verdict | `finding_id`, `tool_name`, `verdict` |
| `benchmark_share_copy` | the "Copy link" button on a result is clicked | `finding_id`, `tool_name` |

## Parameters

- `finding_id` — the short id shown in the URL: `01`, `04`, `08`, `13`. Present
  on every event except `benchmark_view`.
- `tool_name` — the tool name the submitter typed (e.g. "Claude Code"). Present
  on `benchmark_submit`, `benchmark_verdict`, `benchmark_share_copy`. It is the
  self-reported tool label, not an identity. The version string is deliberately
  not sent.
- `verdict` — `VERIFIED`, `NOT VERIFIED`, `NO ALERT` or `INSUFFICIENT EVIDENCE`.
  Present on `benchmark_verdict` only.

## Reading the funnel

The drop-off to watch: `benchmark_view` to `benchmark_finding_open` to
`benchmark_submit` to `benchmark_verdict`. `benchmark_copy_module` and
`benchmark_copy_prompt` show whether people take the module to a fixer at all.
`benchmark_share_copy` against `benchmark_verdict` shows how often a result is
worth sharing. `verdict` split on `benchmark_verdict` shows the mix of outcomes
people actually get, which is the headline the benchmark exists to surface.

## Registering them in GA4

Custom event names appear in GA4 automatically once they arrive, but the
parameters (`finding_id`, `tool_name`, `verdict`) must be registered as custom
dimensions under Admin, Custom definitions before they can be used in reports.
Do that once after launch.
