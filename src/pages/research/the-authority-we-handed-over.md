---
layout: ../../layouts/PostLayout.astro
title: The authority we handed over
description: >-
  We gave software agents the right to change production code, and we never built
  the thing that checks what they did with it. That missing thing needs a name.
date: 2026-08-12
author: Founder, Assay
readingTime: 9 min read
---

Somewhere in the last two years, without a meeting about it, we handed a machine the
right to change code that runs in production.

Not to suggest a change. Not to open a draft for a human to consider. To write a patch,
attach it to a pull request, mark its own work as passing, and stand back while
automation merged it. The permission was never granted in one decision. It arrived in
increments, each of which looked reasonable at the time.

First the agent could read the codebase. Then it could propose a diff. Then the diff came
with a test run attached, and the test run was green, so a reviewer waved it through.
Then the volume grew past the point where anybody could read every diff, and the green
tick became the review. That is where most engineering organisations are now.

## The permission nobody remembers granting

There is a specific thing that happened here, and it is worth naming precisely, because
the fuzzy version of it produces fuzzy responses.

An agent that fixes security bugs holds an unusual kind of authority. It is allowed to
touch the parts of the system that exist to stop people getting in. It is trusted
specifically because the change it is making is a safety change. And the evidence that it
did the job correctly is produced by the same process that did the job.

Every other domain where we grant that combination of powers has an independent check
sitting beside it. Financial statements are prepared by the company and audited by
somebody else. Drug trials are run by the sponsor and reviewed by a regulator. Structural
engineering is signed off by an engineer who does not work for the builder. The pattern is
old and it is not decorative: it exists because the party doing the work has an interest
in the work appearing correct, and that interest is not malicious, it is structural.

We skipped that step. Not out of carelessness, but because the tools arrived faster than
the vocabulary did.

## What the research already knew

The uncomfortable part is that this failure mode was documented before the current
generation of tools existed.

Automated program repair has been a research field since the late 2000s. Its central
embarrassment, discovered early and re-confirmed repeatedly, is that a patch which makes
the tests pass is very often not a patch that fixes the bug. The field named this
overfitting, borrowing the term from machine learning, where it means the same thing: a
solution tuned to the examples it was measured on, which fails on everything else.

The numbers from that literature are not close calls. One canonical evaluation found that
the overwhelming majority of test-passing patches from a classic repair tool did not fix
the underlying defect. Stronger methods using frontier models moved the number a great
deal, and landed somewhere near a coin flip.

Read that again in the context of a security patch. If a fix agent closes a hundred
findings and half the patches are overfitted, you have not reduced your exposure by a
hundred. You have reduced it by fifty and moved the other fifty out of your issue tracker,
where you could see them, and into your codebase, where you cannot.

The scanner going quiet is the single worst signal you could use to check this, because
quieting the scanner is the objective the agent was optimising against. It is not a
verification step. It is a restatement of what the agent was told to do.

## Nobody is cheating

It would be easier to write about this if somebody were behaving badly. Nobody is.

OpenAI's Aardvark writes a patch with Codex and then scans that patch. Google's CodeMender
runs an internal validation framework, and Google is careful enough to put a human
researcher on every patch before it ships, which is more discipline than most. The
commercial remediation vendors all validate their own output, and they all describe how
they do it. None of this is hidden and none of it is dishonest.

It is just structurally incomplete. An author cannot be their own auditor. Not because
authors lie, but because the same assumptions that produced the work also produce the
check on the work. If the agent misunderstood the vulnerability class, its validation
inherits the misunderstanding. If the fingerprint it used to identify the finding was
positional, its confirmation that the finding is gone is positional too. The blind spot is
shared, which is exactly what an independent check exists to break.

This is the one product feature a vendor genuinely cannot sell you. Independence is not a
capability you can add to a roadmap. It is a property of who is doing the looking.

## The human backstop is gone

The obvious objection is that we already have an independent check, and it is called code
review.

We did. The arithmetic stopped working. Teams using coding agents ship several times more
code than they did two years ago, and the number of engineer hours available to read that
code did not move at all. Something had to absorb the difference, and what absorbed it was
the depth of review. A meaningful share of developers now merge agent-authored changes
without reading them, and describe doing so without embarrassment, because the alternative
is to become the bottleneck for a team that has already restructured itself around the
throughput.

You cannot fix that with an appeal to discipline. The volume is real and it is not going
back down. The check has to be something that runs at the speed the code is being
produced.

## Autonomous remediation governance

The gap needs a name, because unnamed gaps do not get budgets, owners, or standards.

**Autonomous remediation governance** is the practice of independently establishing what
an autonomous agent actually did to a codebase, separately from what the agent reports it
did. It has four parts, and none of them are exotic.

Establish that the reported weakness is genuinely gone, using an identity for the finding
that survives the code being reformatted, and looking at whether the dangerous construct
itself still stands rather than only whether the alert went quiet.

Establish that the patch generalises, by testing it against cases written before the agent
was invoked and kept out of every context the agent could read. This is the part that
requires somebody other than the author, because the moment the author holds the test set,
it is not held out any more.

Establish that nothing was broken or newly introduced, attributing findings to the change
itself rather than to the repository's existing backlog.

Establish that the agent wrote what it meant to write, by looking at what authority it
held, whether the change reaches outside the files a legitimate fix would need, and
whether anything in the diff or in the files the agent read carries the shape of an
injected instruction. This last one has stopped being hypothetical: there are published
cases of agents steered by text planted in configuration files, and of a code security
workflow that handed an attacker write access to every repository running it.

Four checks. None individually novel. What is novel is insisting that somebody who did not
write the patch is the one running them.

## The regulation is already drafted

There is a deadline attached to this, and it is closer than the industry is behaving as
though it is.

From December 2027 the EU AI Act requires logged, documented human oversight of high-risk
AI systems. Singapore's IMDA framework already asks for an audit trail of which agent
acted under whose authority. Neither of those is satisfied by a vendor's assurance that
its own tool validated its own output. They require a record: which agent made this
change, what permissions it held while doing it, what independently established that the
change was sound, and which human accepted it.

That record either gets produced as a by-product of a verification step that actually
happens, or it gets manufactured afterwards to satisfy an auditor, which is a different
and much worse thing.

## What we are building

Assay does the four checks and nothing else. We do not write fixes, and we do not intend
to, because the moment we do we forfeit the only thing that makes our answer worth
anything.

We publish the method in full, including the cases where it returns *insufficient
evidence* rather than a verdict, which happens more often than we would like on
authorization logic and on code we cannot build. A verifier that always has an answer is a
verifier that is guessing some of the time, and we would rather say we do not know.

And we are running the same harness against every commercial fix agent, quarterly, with
the free DARPA systems as a baseline, and publishing what comes out. Not because we expect
the tools to look bad. Some of them are genuinely good. But because right now every number
in this category is published by the party that produced the result, and that is not a
state of affairs anybody should be comfortable with, including us.

> Nullius in verba. The Royal Society picked that motto in 1660, and it has aged
> unreasonably well. Take nobody's word for it. Including ours: the harness is open, the
> corpus is published by identifier, and every verdict we issue can be re-run by the
> person receiving it.

The agents are not going away, and they should not. They are genuinely good at this, and
the alternative to autonomous remediation is a backlog nobody was ever going to clear by
hand. But we gave them an authority we have not yet built the instruments to observe. That
is the work.
