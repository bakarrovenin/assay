# Pilot 001, second edition: what a blind run found

**Draft for review. Not for publication until every figure marked CONFIRM has
been checked against the committed artifacts, and until the vendors named have
been contacted and given right of reply.**

---

**assay**

Pilot 001 · Method v1.0 · Blind run · Filed 2026.09

---

## Summary

We gave three AI tools the same four SQL injection flaws and asked each to fix
them. Then we attacked the patched code with payloads the tools had never seen,
and compared ordinary behaviour against a known correct reference.

Every tool shut the hole. Not one held-out attack succeeded against any patch.

What failed was the measurement. A patch broke the application while the scanner
reported success. A scanner alert closed because a line had been reformatted
rather than fixed. And on one flaw the scanner raised no alert at all, so nothing
was reported and nothing was repaired.

A closed alert is a fact about the diff. It is not a fact about the hole.

## What we tested

A small Flask application with a SQLite database, carrying four deliberately
written SQL injection flaws. We wrote the flaws, so the correct fix for each is
known.

The four shapes, chosen because a patch that works on one often fails on another:

- **Quoted string, single parameter.** The baseline case.
- **Numeric context.** No quotes anywhere in the query, so any patch that escapes
  or strips quotes does nothing.
- **ORDER BY identifier.** A column name cannot be a bound parameter. The only
  correct defence is an allow-list.
- **Second order.** The input is stored safely in one function and reaches the
  vulnerable query in another.

For each flaw we wrote a held-out attack set and a set of ordinary inputs that
must keep working. The fixer was given the file, the scanner finding, and exactly
one reported payload. Nothing else. The remaining attacks and the benign set were
never in its working directory.

After the patch is applied, four checks run inside a container with no network
egress, destroyed between patches:

**A, alert closed.** Does the scanner still report the finding.
**B, hole shut.** Does any held-out attack still succeed. One success is a failure.
**C, behaviour preserved.** Does every ordinary input still match a baseline
captured from a known correct reference.
**D, provenance clean.** Suppression markers, new findings, or an alert closed
while attacks still succeed.

VERIFIED requires all four. NO ALERT and INSUFFICIENT EVIDENCE are reported
outcomes, not silent failures.

## The tools

[CONFIRM exact version strings and dates from batch.json and TOOLS.md]

- ChatGPT Think, 2026-09-14
- Claude Code 2.1.270, Opus 5, 2026-09-14
- GitHub Copilot Autofix on CodeQL 2.27.0, default suite, threat model remote,
  2026-09-14

A fourth tool, Cursor, was attempted. Its blind batch could not be completed
within this edition's window. Its earlier results appear below, marked
provisional, and are not counted in any figure.

## Results

[CONFIRM this table against results/RESULTS.md]

|            | ChatGPT | Claude Code | Copilot Autofix |
|---|---|---|---|
| Quoted string | VERIFIED | VERIFIED | not supplied |
| Numeric | VERIFIED | NOT VERIFIED | VERIFIED |
| ORDER BY identifier | NOT VERIFIED | VERIFIED | NOT VERIFIED |
| Second order | VERIFIED | VERIFIED | no alert raised |

Across the standing cells: alert closed [CONFIRM]%, verified [CONFIRM]%.

**No held-out attack succeeded against any patch produced by a tool.**
[CONFIRM the exact count of attacks fired across standing cells.] Every
NOT VERIFIED verdict was earned on behaviour or on the scanner, never on the
hole.

## Finding one: the fix is secure and the application is broken

The ORDER BY flaw can only be fixed with an allow-list, because a column name
cannot be bound as a parameter. The table has five sortable columns.

Copilot Autofix and ChatGPT each wrote an allow-list containing three of them.
Both omitted the same two. Both had the full column list in view, in the seed
file they were given. Claude Code wrote all five.

The consequence is not a security hole. It is that sorting by either omitted
column now fails. Autofix returns a different sort than the one requested, with
no error. ChatGPT returns a rejection.

Check C caught both, on exactly the four ordinary inputs that exercise the
omitted columns and on nothing else. The scanner, in both cases, reported the
patch as clean.

This reproduced three times across two vendors, on both the contaminated and the
blind corpus. It did not occur with the third tool, so it is a real and avoidable
failure rather than an inevitable one.

## Finding two: the alert closed because the line was reformatted

Two tools closed the scanner alert on the ORDER BY flaw by splitting one
formatted string into two adjacent ones. The interpolation was unchanged. The
rule matches a single formatted string reaching the database call, and implicit
concatenation is a different construct, so the finding disappeared.

We tested this directly. With the allow-list removed and the formatting left
alone, the scanner still reports nothing. With the allow-list kept and the
formatting restored to one string, the scanner reports the finding again.

On those patches the alert was responding to the line wrapping, not to the
security of the code.

Neither tool was evading anything. Both were tidying a long line while fixing the
flaw properly. The hole was genuinely shut in both cases, by the allow-list. But
the same mechanism would produce an identical green alert on a patch that fixed
nothing, and we had previously only demonstrated it with a patch we constructed
for the purpose.

A correct fix and an evasion can look identical to the scanner.

## Finding three: no alert at all

On the second-order flaw, where the input is stored by one function and used by
another, CodeQL raised no alert. [CONFIRM: 43 rules, 0 results.] The scan
completed normally.

We repeated this on the corpus after removing every comment that described the
flaw. The result was identical. The silence is a property of the analysis, not of
anything in the file.

Two of the three tools fixed this flaw correctly when they were told about it.
The third was never told.

## A tension worth stating

On the numeric flaw, one tool bound the parameter and nothing else. Two others
bound the parameter and also validated the input as an integer.

The minimal fix passed. The stricter fixes failed check C, because converting the
value changes the type echoed back in the response, and the check compares
responses exactly.

The check is correct: the response contract changed. A reader may still feel the
stricter fix was the better engineering. Both things are true, and we would
rather publish the tension than quietly resolve it.

## What this does not show

One weakness class. One language. One small application. Four flaws. Three tools.
Thirteen cells.

This is a signal, not a rate. No ranking should be read from it. The strongest
result here, the narrow allow-list, reproduced across two vendors and is still a
single flaw shape.

It does not show that these tools leave vulnerabilities open. On this corpus they
did not, once.

It does not generalise to a real codebase. A sixty line file with the flaw on
screen is the easiest possible case, and a fixer that succeeds here may not
succeed where the sink is a thousand lines from the input.

The reported payload is a real advantage. Every tool was told where to look.

Results assume each tool worked from the material it was given and did not search
for this corpus, which is public. We cannot observe a hosted tool's browsing.

## Why every earlier result was discarded

An earlier run of the same experiment produced similar numbers. We discarded it.

The vulnerable files carried comments explaining the flaw and, in one case,
naming the correct fix. Every tool had been handed the answer. We found this
while preparing a second run, stripped the corpus, rebuilt the handoff material,
and ran everything again.

The earlier results are published, marked provisional, with the reason. They are
a valid test of the harness and an invalid measurement of the tools.

For one tool the blind result was identical to the contaminated one, check for
check. That is a useful data point and not a general one.

## What our own method got wrong

Six times during this pilot, a check of ours passed for a reason unrelated to the
thing it was meant to establish.

A patch that failed to start scored as a patch that shut the hole, because every
attack failed to connect and every failure was recorded as an attack that did not
succeed.

A guard reported no leak before publication, correctly, about the working tree,
while the answer key sat in an earlier commit that would have been public
permanently.

A published note claimed a verification that did not exist in code.

A correct fix was failed by our own check A, because an allow-list cannot remove
the pattern the rule matches.

The corpus handed the fixer the answer in prose.

And a guard searched for payloads, oracles and fix code, and was correct by its
own definition, while explanatory prose walked past it.

Each failed in the flattering direction. A check that wrongly accuses a good
patch is investigated within the hour. A check that wrongly clears a bad one is
the answer nobody interrogates.

All six are documented in full in the methodology notes, including how each was
found and closed. A check that has only ever passed has not been tested.

## What would change our mind

If a broader corpus shows tools leaving holes open at any material rate, the
original framing was right and we will say so.

If the behavioural failures do not reproduce on other flaw classes, the
over-broad result is a curiosity about one shape rather than a finding.

If a scanner tracks second-order flow reliably, that gap closes.

None of that would change the central claim, which does not depend on how well
the tools perform. A closed alert would still be a fact about the diff.

## What is published

The harness, the corpus, the scorer, every patch diff, the per-check evidence,
the pinned versions, and the methodology notes, at
github.com/bakarrovenin/assay-pilot-001-evidence.

The held-out attack sets are withheld, because publishing them allows a patch to
be tuned against them. That is the only thing we hold back, and this is the
reason.

## Right of reply

Every tool named here was contacted with its results before publication and given
[CONFIRM window] to respond. Responses appear below, unedited.

[Responses, or: no response received by the closing date.]

---

**Nullius in verba.**
