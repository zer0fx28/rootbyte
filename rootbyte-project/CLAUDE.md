# RootByte — Claude Code Instructions

## Project Overview
RootByte is an ad-revenue tech history website. Every article connects modern technology news
to its forgotten historical roots. Built as a static site for maximum speed and ad revenue.

## Stack
- Pure HTML/CSS/JS (no framework needed — static = fast = better RPM)
- Markdown for content articles
- Vercel for hosting (free tier handles millions of requests)
- NewsAPI for trending fetch
- Brevo for newsletter

## Folder Structure
```
src/
  index.html          ← main site (standard + tiktok mode)
  styles/             ← CSS files (main.css, tiktok.css, themes.css)
  components/         ← reusable HTML snippets (header, footer, cards)
  content/
    articles/         ← .md files, one per article
    did-you-know/     ← DYK card data as JSON
    root-snippets/    ← ROOT historical connections as JSON
  scripts/            ← JS files
public/
  images/
  fonts/
scripts/              ← Node.js build/utility scripts
  new-article.js      ← scaffold a new article file
  fetch-trending.js   ← fetch latest tech news from NewsAPI
  build.js            ← static site builder
  deploy.js           ← Vercel deploy helper
```

## Article Format (Markdown)
Every article MUST follow this structure exactly:

```markdown
---
title: "The First Touchscreen Wasn't Apple — It Was Made in 1965"
date: 2026-02-18
category: devices
tags: [touchscreen, apple, history, hardware]
root_year: 1965
root_who: "E.A. Johnson"
root_where: "Royal Radar Establishment, UK"
root_connection: "42 years before the iPhone used the exact same technology"
dyk_fact: "Johnson published his capacitive touch paper in 1965 with zero patent protection"
tomorrow_teaser: false
hero_image: /images/articles/touchscreen-1965.jpg
reading_time: 6
---

## The Modern Story
[Lead with today's news hook]

## ROOT: Going Back to 1965
[The historical connection — this is the brand signature]

## Did You Know
[Shareable standalone fact]

## Why It Matters Today
[Connect past to present]
```

## Claude Code Workflow (Daily Content)
When I say "new article about [topic]", do this:
1. Research the modern story AND find the historical root
2. Create the .md file in src/content/articles/ using the format above
3. Update src/content/did-you-know/ with the DYK fact as a JSON entry
4. Update the tomorrow_teaser in index.html if it's a strong story
5. Run the build script

## Ad Placement Rules (NEVER change these)
- Leaderboard (728×90): above the fold, after masthead
- In-feed (300×250): between articles 2 and 3 in the grid
- Sidebar #1 (300×250): top of sidebar, below newsletter
- Sidebar #2 (300×250): below "On This Day"
- All ad slots must keep the "Advertisement · Vetted & Clean" label

## Clean Ad Policy (enforce always)
These categories are BLOCKED from ever appearing:
- Gambling / betting / casino
- Adult content / dating
- Fake health products / miracle cures
- Predatory loans / payday lending
- Crypto scam / pump-and-dump promotions  
- Political propaganda / electoral ads
- Malware / fake virus alerts / clickbait
When adding new ad network code, always verify category blocking is configured.

## Performance Rules
- Images must be WebP format, max 200KB
- No external JS libraries unless absolutely necessary
- CSS and JS must be inlined or loaded with defer
- Target: Lighthouse score 90+ on mobile

## Monetization Priority
1. AdSense → Ezoic → Mediavine (upgrade as traffic grows)
2. Direct sponsors for ROOT segment: "ROOT brought to you by [sponsor]"
3. Affiliate links: Lazada, Amazon Associates (gadgets/books only)
4. Newsletter ads via Brevo at 5K+ subscribers

## Payment Setup (for reference)
- AdSense pays via wire transfer to BPI/BDO/UnionBank (USD → PHP)
- Wire → GCash via UnionBank Instapay
- Payoneer works as a USD bridge account for all ad networks
- Direct sponsors: invoice via GCash / Wise / bank transfer

## DO NOT
- Do not add any analytics other than Vercel Analytics (privacy-first)
- Do not add cookie consent popups (keep it clean)
- Do not change the mode chooser logic (Standard vs TikTok)
- Do not remove the "On This Day" or "Tomorrow Teaser" sections — these drive daily visits
- Do not use npm packages in the frontend (keep it vanilla JS)
