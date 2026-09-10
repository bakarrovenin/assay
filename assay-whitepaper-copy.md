# Assay whitepaper, draft copy

For /whitepaper. One page. Narrow column, prose, bold headings, no artifacts.
Header block sets it as a document of record.

---

**assay**

Independent verification for AI authored code
Method v1.0 · Filed 2026.09

---

**Summary**

AI now writes security patches, and the patch is validated by the tool that
wrote it. The only signal anyone measures is whether the scanner alert closed.
We tested whether that signal means anything. On a controlled corpus, a patch
closed the alert, passed a suppression audit, and left every attack we had held
back still working.

**The gap**

A scanner flags a vulnerability. An agent writes a fix. The scanner runs again,
the warning disappears, and the change merges. Nothing in that loop establishes
that the vulnerability closed. It establishes that the scanner stopped
reporting it, which is a different fact.

Automated program repair has known this for over a decade and named it:
overfitting, a patch that satisfies the test without correcting the fault. The
literature was explicit that human validation of every candidate patch was
mandatory. Agents did not solve overfitting. They industrialised it and removed
the validation step.

**Why the checker cannot be the author**

Aardvark writes the patch with Codex, then scans its own patch. CodeMender runs
its own validation. Snyk, Pixee, Mobb and ZeroPath all certify their own output.
Google still puts a human researcher on every CodeMender patch before it ships,
which is the tell: the best resourced team in the field does not trust its own
fixer.

A test is a sample, not a specification. If you let a student write their own
exam, they will pass it. You test them on questions they have not seen.

**Method**

Assay evaluates a patch against inputs the fixer never had access to.

For each finding we hold back an attack set and a set of ordinary inputs that
must keep working. The fixer receives the flagged file and exactly one reported
payload. Nothing else. After the patch is applied we run four checks inside an
isolated container with no network egress.

01 Alert closed. The scanner no longer reports the finding.
02 Hole shut. No held out attack succeeds. One success is a failure.
03 Behaviour preserved. Every ordinary input matches a baseline captured from a
known correct reference.
04 Provenance clean. No suppression, no new finding, and no alert closed while
held out attacks still succeed.

A patch is VERIFIED only if all four hold. INSUFFICIENT EVIDENCE is a first
class verdict and is reported rather than dropped.

**Pilot 001**

One seeded SQL injection, quoted string context, the easiest shape. Three
patches.

The first bound the value as a parameter rather than assembling it into the
query. Alert closed, zero of twelve held out attacks succeeded, no regression.
VERIFIED.

The second escaped the quote it had been shown and left the query untouched.
Four of twelve attacks still returned the users table. It also rejected a
legitimate product name containing an apostrophe. NOT VERIFIED.

The third changed nothing about the vulnerability. It moved the query into a
helper and reassembled the string in a form the scanner's rule does not match.
The alert closed. The suppression audit found no marker. Twelve of twelve
attacks still returned the users table including password hashes.

Two of the four signals a competent team relies on, the scanner and the
suppression audit, both reported clean on a fully exploitable patch. Only the
held out attack set separated it from the correct fix.

**Limitations**

The flaw was seeded by us. One weakness class, one language, one application,
one finding, the easiest shape. The three patches exercise the method rather
than being commercial vendor output, and the third was constructed
deliberately. This is a demonstration that the method discriminates, not a rate
that generalises to any tool.

The harness, corpus, scorer, results and full methodology notes are public. The
held out attack sets are withheld, because publishing them permits a patch to
be tuned against them.

**What the method caught in itself**

Three of our own checks passed for reasons unrelated to the thing being true. A
patch that failed to start scored as a patch that shut the hole, because every
attack failed to connect and every failure was recorded as an attack that did
not succeed. A pre publication guard reported no leak, correctly, about the
working tree, while the answer key remained in an earlier commit.

Each failed in the flattering direction. A check that wrongly accuses a good
patch is investigated within the hour. A check that wrongly clears a bad one is
the answer nobody interrogates. All are documented in full.

**What follows**

Pilot 001 establishes the method. The Index applies it: an independent,
published measure of verified fix rate against closed alert rate for each
commercial fixer, quarterly, with the open DARPA systems as a baseline row and
every vendor given right of reply, published unedited.

If the first Index returns verified fix rates above eighty five percent, the
gap is smaller than we believe and we will publish that.

We have no customers yet. These are the terms we intend to hold to.

**Nullius in verba.**

---

Evidence repository · Full methodology · Pilot 001 in detail
