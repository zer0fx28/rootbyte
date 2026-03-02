---
title: "Git Was Built in 10 Days. Linus Torvalds Was Furious When He Started."
date: 2026-03-02
category: software
tags: [git, version-control, linux, linus-torvalds, open-source, software, github]
root_year: 1972
root_who: "Douglas McIlroy"
root_where: "Bell Labs, Murray Hill, New Jersey"
root_connection: "The diff algorithm — the foundation of all version control — was invented by Douglas McIlroy in 1972, 33 years before Git"
dyk_fact: "Linus Torvalds wrote Git in 10 days — April 3 to 7, 2005. He called the project 'the stupid content tracker' in his commit message. It now hosts 420 million repositories."
hero_image: /images/heroes/hero-git-10days.svg
reading_time: 6
status: published
---

## The Modern Story

Git is the invisible plumbing of the entire software industry.

- GitHub hosts 420+ million repositories
- 100 million developers use Git daily
- Every major software company — Google, Meta, Microsoft, Apple — runs on Git
- The Linux kernel itself (3 billion lines of code) is managed in Git
- GitHub was acquired by Microsoft for $7.5 billion in 2018

Git was written in 10 days by one person, as an act of pure spite.

## ROOT: Going Back to 1972

To understand why Git works the way it does, you need to understand what came before — and what the core problem actually is.

The fundamental operation in all version control is **diff**: comparing two files and understanding exactly what changed between them. Without an efficient diff algorithm, you can't track changes, merge code, or resolve conflicts.

In 1972, Douglas McIlroy at Bell Labs invented the `diff` algorithm while building Unix utilities. McIlroy's insight was elegant: reduce the problem of "what changed between two texts" to finding the **longest common subsequence** of lines — the biggest block of lines that appears in both files in the same order. Everything not in the LCS is either added or deleted.

This algorithm, with refinements, still powers Git today. Every `git diff`, every pull request comparison, every merge conflict you've ever seen — it's Douglas McIlroy's 1972 idea running underneath.

**The chain:**
- **1972** — McIlroy's diff algorithm, Bell Labs
- **1982** — RCS (Revision Control System) — first file-level version control
- **1986** — CVS (Concurrent Versions System) — adds multi-file, multi-developer support
- **2000** — Subversion (SVN) — centralized, improves on CVS
- **2002** — BitKeeper — proprietary distributed VCS, used for Linux kernel development
- **2005** — BitKeeper revokes free access to Linux developers. Torvalds builds Git in 10 days.

## Did You Know

The reason Torvalds chose a **distributed** model for Git (every developer has the full history) wasn't philosophical — it was practical. The Linux kernel had thousands of contributors sending patches. A centralized server would have been a bottleneck and a single point of failure. Distributed version control meant every developer could work offline, and the merging happened at integration time.

This "distributed" architecture — which felt radical in 2005 — is now so standard that centralized VCS systems are the legacy choice.

## Why It Matters Today

Git's 10-day origin story is often told as a tale of genius. It's actually a story about **anger, constraints, and the right prior art**.

Torvalds was furious. BitKeeper had revoked the license that let Linux developers use it for free after one developer reverse-engineered the protocol. Torvalds needed a replacement — fast — or Linux kernel development would stop.

He had constraints: it had to be faster than Subversion, it had to be distributed, it had to handle merging branches well, and it had to work for a project with thousands of contributors.

He had prior art: McIlroy's diff, decades of version control history to study, and an understanding of what every previous VCS had gotten wrong.

Ten days later, he committed the first version of Git and called it in the first commit message: *"git: the stupid content tracker."*

The tools you use daily were often built in crisis, by people who were annoyed. The quality came from the 33 years of accumulated knowledge those people were angry enough to put to work.

---

## FUTURE: Version Control for AI

> ⚠️ Speculative — based on emerging research and tooling.

Git was built for text. Code is text. AI models are not text — they're billions of floating-point numbers in parameter files.

The AI industry's current approach to "versioning" models is embarrassingly primitive: save a checkpoint, upload to Hugging Face, name it `v2`. There's no diff, no merge, no branch strategy for model weights.

Several research teams and startups are working on **model version control** — tools that let you meaningfully track changes in AI model weights the way Git tracks changes in code. The key challenge: unlike text, two model versions might produce similar outputs via completely different internal mechanisms. Diffing weights doesn't tell you anything meaningful about behavioral change.

**Prediction:** By 2027, the AI equivalent of Git will exist — built not as an afterthought but as a first-class infrastructure layer. And like Git, it will probably be built by someone who was furious that the current tools weren't good enough.
