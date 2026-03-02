---
title: "The First Ransomware Was Mailed on a Floppy Disk. In 1989. To AIDS Researchers."
date: 2026-03-02
category: cybersecurity
tags: [cybersecurity, ransomware, history, aids-trojan, joseph-popp, malware, floppy-disk]
root_year: 1989
root_who: "Joseph L. Popp"
root_where: "Cleveland, Ohio / Worldwide"
root_connection: "The AIDS Trojan of 1989 invented the ransomware business model — 35 years before it became a $1 trillion crime industry"
dyk_fact: "The ransom demand in 1989 was $189 — payable to a P.O. Box in Panama. Modern ransomware gangs demand millions via Monero cryptocurrency. The business model hasn't changed."
hero_image: /images/heroes/hero-aids-trojan-1989.svg
reading_time: 6
status: published
---

## The Modern Story

In 2023, ransomware attacks cost the global economy over $1.1 trillion. Hospitals were shut down. Schools couldn't operate. A ransomware attack on Colonial Pipeline in 2021 caused gas shortages across the US East Coast. MGM Resorts lost $100 million in one attack in 2023. The average ransom demand in 2024 was $2.73 million.

Ransomware has become one of the most profitable criminal enterprises in human history. Criminal gangs operate like software companies — with customer support, negotiation teams, and affiliate programs. Some gangs offer "ransomware-as-a-service" to other criminals who want to launch attacks but lack the technical skills.

All of it traces to a Harvard-educated biologist who mailed 20,000 floppy disks in 1989.

## ROOT: Going Back to 1989

Joseph Popp held a PhD in anthropology from Harvard, had done field work in Africa, and applied (unsuccessfully) for a position at the World Health Organization's AIDS research program. In December 1989, he mailed 20,000 floppy disks from London to WHO conference attendees, AIDS researchers, and subscribers to a PC Business World mailing list across 90 countries.

The disk was labeled "AIDS Information — Introductory Diskette Version 2.0" from a company called "PC Cyborg Corporation."

When inserted and run, the diskette installed a program that counted how many times the computer booted. After the 90th boot, it triggered. The program hid all directories on the hard drive and encrypted the filenames (not the files themselves — the underlying data was untouched, though the user couldn't access it). A message appeared:

> *"If you use RENEW, a lease for the use of certain program mechanisms will be payable to PC Cyborg Corporation... otherwise you will owe PC Cyborg Corporation the cost of a perpetual lease. To use the RENEW program, contact PC Cyborg Corporation."*

The ransom: **$189 USD**, payable to P.O. Box 7, Panama.

The technical weakness: the decryption key was stored in the program itself. Within days, security researchers had reverse-engineered the disk and published free decryption tools. Popp's ransomware was defeated — but his concept was not.

**The chain:**
- **1989** — AIDS Trojan. File-name encryption, physical delivery, ransom demand.
- **1996** — Adam Young and Moti Yung publish "Cryptovirology" — describing how public-key cryptography could make ransomware uncrackable. Nobody listens.
- **2005** — GPCoder and Archiveus appear — first RSA-encrypted ransomware. Awkward, but uncrackable.
- **2013** — CryptoLocker. Bitcoin payments. $27 million collected before it was taken down.
- **2017** — WannaCry. NSA exploit (EternalBlue) weaponized. 200,000 computers in 150 countries. NHS hospitals shut down in UK.
- **2021** — Colonial Pipeline. $4.4M paid. Gas shortages. Biden declares emergency.
- **2024** — $1.1 trillion total ransomware economic impact.

## Did You Know

Popp was arrested in 1990 at an airport in Amsterdam, identified by his distinctive hat and behavior (he had labeled baggage with warnings about AIDS). He was extradited to the UK, charged under the Criminal Damage Act. But before trial, a British judge ruled him unfit to stand trial due to erratic behavior — he had been appearing in court wearing hair curlers and putting condom wrappers on his beard.

He was returned to the US, never prosecuted, and died in 2007. He left his estate to fund a butterfly conservatory in his name in upstate New York.

The man who invented the ransomware business model — now a $1 trillion annual criminal industry — was never convicted of a crime. He was ruled insane.

## Why It Matters Today

The fundamental ransomware model hasn't evolved in 35 years:
1. Gain access to a target's system
2. Make their data inaccessible
3. Demand payment for the decryption key
4. Make the payment mechanism anonymous and hard to trace

Everything that's changed is execution: delivery has moved from floppy disks to phishing emails to zero-day exploits; payment has moved from Panama P.O. boxes to Bitcoin to Monero; targets have scaled from individuals to hospitals, governments, and critical infrastructure.

Popp's $189 demand and 2024's $2.73M average demand are separated by a factor of 14,000. The business model is the same. The concept — extort access to your own data — was fully formed in 1989, on a floppy disk delivered by international post.

---

## FUTURE: Ransomware Goes Physical

> ⚠️ Speculative — based on security research and documented proof-of-concept attacks.

As critical infrastructure becomes increasingly connected — power grids, water treatment plants, hospital systems, industrial controllers — ransomware's targets are shifting from "data you can't access" to "physical systems you can't operate."

In 2021, a hacker accessed a Florida water treatment plant's control system and attempted to raise sodium hydroxide (lye) levels to dangerous concentrations. No ransomware was deployed, but the access vector was identical. Security researchers call this threat "OT ransomware" — attacks on Operational Technology that control physical systems.

**Prediction:** Before 2028, a major ransomware attack will target physical infrastructure (a power grid, water system, or hospital life-support system) and hold the physical systems — not the data — hostage. The ransom won't be for decryption keys. It will be for restoring physical control.

Popp's 1989 concept will have gone from floppy disks to control systems for nuclear plants. The $189 ransom will have become the shutdown of a city's power grid.
