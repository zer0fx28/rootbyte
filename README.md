# ROOT•BYTE

> **Tech Has Roots. Know Them.**

An ad-revenue tech history website that connects every modern technology breakthrough to its forgotten historical origins. Built as a lightning-fast static site optimized for mobile consumption and ad revenue.

## 🚀 Quick Start

```bash
# Clone and setup
git clone https://github.com/yourusername/rootbyte.git
cd rootbyte
npm install

# Start development server
npm run dev     # http://localhost:3000

# Create your first article
npm run new-article

# Fetch trending tech news
npm run fetch-trending

# Deploy to Vercel
npm run deploy
```

## 📱 Dual Reading Modes

**Standard Mode:** Full articles, sidebar, timelines, deep dives
**Quick Feed Mode:** TikTok-style swipe-up cards, perfect for mobile

The site automatically detects mobile users and offers both modes. Desktop users get Standard mode by default.

## 📝 Content Structure

### Article Format
Every article follows this exact structure:
- **The Modern Story** — Today's news hook
- **ROOT: Going Back to [Year]** — The historical connection
- **Did You Know** — Shareable standalone fact
- **Why It Matters Today** — Connect past to present

### Required Frontmatter
```yaml
---
title: "The First Touchscreen Wasn't Apple — It Was Made in 1965"
date: 2026-02-18
category: devices
tags: [touchscreen, apple, history]
root_year: 1965
root_who: "E.A. Johnson"
root_where: "Royal Radar Establishment, UK"
root_connection: "42 years before the iPhone used the exact same technology"
dyk_fact: "Johnson published his capacitive touch paper in 1965 with zero patent protection"
hero_image: /images/articles/touchscreen-1965.webp
reading_time: 6
---
```

## 🛠️ Commands

```bash
npm run dev              # Start dev server (port 3000)
npm run new-article      # Create new article from template
npm run fetch-trending   # Update trending tech news
npm run optimize-images  # Convert images to WebP, resize
npm run validate        # Check all content for errors
npm run build           # Generate feeds and validate
npm run sitemap         # Generate XML sitemap
npm run backup          # Backup all content
npm run deploy          # Full deployment (trending + commit + push)
```

## 📁 Project Structure

```
src/
  index.html              ← Main site (dual-mode interface)
  about.html              ← About page
  contact.html            ← Contact page
  privacy.html            ← Privacy policy
  advertise.html          ← Advertiser information
  content/
    articles/             ← Markdown articles
    did-you-know/         ← DYK facts as JSON
    root-snippets/        ← Historical connections as JSON
    trending.json         ← Latest tech news feed
public/
  images/                 ← Optimized WebP images
  fonts/                  ← Custom fonts
scripts/                  ← Build and utility scripts
```

## 🎯 Monetization Strategy

1. **AdSense** → **Ezoic** → **Mediavine** (upgrade as traffic grows)
2. **Direct sponsors** for ROOT segment: "ROOT brought to you by [sponsor]"
3. **Affiliate links:** Amazon Associates (tech books/gadgets only)
4. **Newsletter ads** via Brevo at 5K+ subscribers

### Clean Ad Policy
Automatically blocks: gambling, adult content, health scams, predatory loans, crypto scams, political propaganda, malware/clickbait.

## 📊 Performance Targets

- **Lighthouse Score:** 90+ on mobile
- **Image Size:** Max 200KB per image, WebP format
- **Load Time:** Sub-3 second on 3G
- **Bundle Size:** Minimal JS, inlined CSS

## 🔧 Setup Environment

1. **Copy environment template:**
   ```bash
   cp .env.example .env
   ```

2. **Get NewsAPI key:** https://newsapi.org/register
3. **Get Brevo API key:** https://app.brevo.com (for newsletter)
4. **Configure Vercel:** Link your repository for auto-deployment

## 📈 SEO & Discovery

- **Daily content** drives return visits
- **"On This Day"** creates evergreen search value
- **ROOT connections** target long-tail historical searches
- **Did You Know** optimized for social sharing
- **Mobile-first** indexing ready

## 🌐 Deployment

The site deploys automatically to Vercel on push to main branch. Manual deploy:

```bash
npm run deploy
```

This will:
1. Fetch latest trending news
2. Run content validation
3. Generate sitemap
4. Commit changes
5. Push to repository (triggers Vercel build)

---

**Built in the Philippines 🇵🇭 with Claude Code**