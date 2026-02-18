# ROOT•BYTE Project Configuration
*Claude Code reads this file automatically on every session*

## Project Overview
ROOT•BYTE is a tech content website focused on the ROOT/FOUNDATION of technology concepts. We create educational content about fundamental tech concepts with modern AI assistance.

### Core Mission
- Explain the ROOT/FOUNDATION of how technology works
- Create engaging, educational content for tech enthusiasts
- Maintain clean, professional presentation
- Monetize through ethical advertising and sponsorships

## Project Structure
```
rootbyte/
├── CLAUDE.md          ← This file - Claude Code configuration
├── package.json       ← Node.js dependencies and scripts
├── .env.example       ← Template for environment variables
├── .env               ← Your API keys (never commit this)
├── .gitignore         ← Git exclusion rules
├── src/
│   ├── index.html     ← Main website file
│   ├── about.html     ← About page
│   ├── privacy.html   ← Privacy policy
│   ├── contact.html   ← Contact form
│   ├── advertise.html ← Sponsor information
│   ├── css/
│   │   └── style.css  ← Main stylesheet
│   ├── js/
│   │   └── main.js    ← Interactive features
│   └── content/
│       ├── articles/  ← Markdown articles
│       └── trending.json ← Live trending data
├── scripts/
│   ├── new-article.js    ← Article creation automation
│   └── fetch-trending.js ← News API integration
└── public/
    └── images/        ← Optimized images
```

## Content Guidelines

### Article Format
Every article must follow this structure:

**Filename:** `YYYY-MM-DD-slug.md`

**Frontmatter:**
```yaml
---
title: "Article Title Here"
slug: "url-friendly-slug"
date: "2026-02-18"
author: "ROOT•BYTE Team"
category: "Foundations" | "History" | "Explained" | "Deep Dive"
tags: ["tag1", "tag2", "tag3"]
description: "Brief description for SEO meta"
featured_image: "/images/article-slug-hero.webp"
reading_time: "5 min read"
root_connection: "How this connects to foundational tech concepts"
---
```

**Content Structure:**
1. **Hook** - Engaging opening paragraph
2. **ROOT Connection** - How this topic connects to fundamental concepts
3. **Main Content** - 800-1,200 words, well-structured with H2/H3 headings
4. **Key Takeaways** - Bullet points summarizing learning points
5. **What's Next** - Teaser for related content

### Writing Voice & Tone
- **Educational but accessible** - Explain complex concepts simply
- **Enthusiastic about tech** - Show genuine excitement
- **Professional** - Maintain credibility and authority
- **Filipino-friendly** - Consider local context and examples
- **ROOT-focused** - Always connect back to foundational concepts

### Content Categories
1. **Foundations** - Core concepts (TCP/IP, Operating Systems, etc.)
2. **History** - How tech evolved (First computer, Internet origins, etc.)
3. **Explained** - Modern tech demystified (AI, Blockchain, etc.)
4. **Deep Dive** - Technical deep-dives for advanced readers

## Website Features

### Homepage Layout
- **Masthead** - ROOT•BYTE branding and navigation
- **Featured Article** - Hero section with latest content
- **Article Grid** - 3-column responsive layout
- **Trending Ticker** - Live tech news feed
- **Sidebar** - Newsletter signup, On This Day, DYK cards
- **Tomorrow Teaser** - Preview of next article
- **Footer** - Links, social, sponsors

### Interactive Elements
- **Newsletter Signup** - Brevo integration
- **Trending News** - NewsAPI integration, auto-refresh
- **On This Day** - Tech history for current date
- **DYK Cards** - "Did You Know" rotating tech facts
- **Tomorrow Teaser** - Builds anticipation for next article

## Technical Requirements

### Performance Standards
- **Page Load** - Under 2 seconds on 3G
- **Lighthouse Score** - 90+ Performance, 100 Accessibility
- **Images** - WebP format, optimized for multiple screen sizes
- **CSS/JS** - Minified for production
- **Mobile-First** - Responsive design for all devices

### SEO Requirements
- **Meta Tags** - Proper title, description, OG tags for all pages
- **Structured Data** - Article schema markup
- **Sitemap** - Auto-generated XML sitemap
- **Canonical URLs** - Proper canonical tags
- **Internal Linking** - Related articles and category pages

### Security & Privacy
- **HTTPS** - SSL certificate required
- **Privacy Policy** - Compliant with GDPR/CCPA
- **Clean Code** - No tracking beyond Google Analytics/AdSense
- **API Keys** - Stored in .env, never in code

## Monetization Strategy

### AdSense Integration
**Ad Slots:**
1. **Leaderboard (728×90)** - Above fold, after masthead
2. **In-feed (300×250)** - Between articles in grid
3. **Sidebar #1 (300×250)** - Top of sidebar
4. **Sidebar #2 (300×250)** - Below On This Day widget

**CLEAN ADS POLICY:**
Block these ad categories:
- Dangerous products and services
- Get rich quick schemes
- Gambling and betting
- Adult content
- Weight loss programs
- Dating and personals

### Direct Sponsorships
- **ROOT Segment Sponsors** - ₱5K-₱20K/month
- **Newsletter Sponsors** - Featured in email campaigns
- **Article Sponsors** - Branded content opportunities
- **Custom Integration** - Tailored sponsor integrations

## Development Workflow

### Daily Content Creation
1. **Research** - Use NewsAPI for trending topics
2. **Write** - Create markdown file with proper frontmatter
3. **Images** - Add hero image and supporting visuals
4. **Review** - Check ROOT connection and educational value
5. **Publish** - Commit to Git, auto-deploy via Vercel
6. **Promote** - Update social media and newsletter

### Automation Scripts
- **`npm run new-article`** - Creates scaffolded article file
- **`npm run fetch-trending`** - Updates trending.json from NewsAPI
- **`npm run optimize-images`** - Converts images to WebP
- **`npm run deploy`** - Git commit, push, and Vercel deploy

### Quality Checks
- **Spell Check** - Use WebStorm built-in spell checker
- **Link Validation** - Ensure all internal/external links work
- **Mobile Testing** - Test on actual mobile devices
- **Performance** - Regular Lighthouse audits
- **Content Review** - Ensure ROOT connection is clear

## API Integrations

### NewsAPI.org
- **Purpose** - Trending tech news for ticker
- **Limit** - 100 requests/day on free tier
- **Filter** - Technology category only
- **Update** - Every 4 hours automatically

### Brevo.com (Email)
- **Purpose** - Newsletter subscriptions and campaigns
- **Limit** - 300 emails/day on free tier
- **Lists** - Segment subscribers by interests
- **Automation** - Welcome series for new subscribers

## Deployment

### Vercel Configuration
- **Framework** - Static Site (Other)
- **Root Directory** - `src`
- **Build Command** - None (pure HTML/CSS/JS)
- **Deploy** - Automatic on Git push to main branch
- **Domain** - Custom domain in Vercel dashboard

### Environment Variables
Set these in Vercel dashboard:
- `NEWS_API_KEY` - Your NewsAPI key
- `BREVO_API_KEY` - Your Brevo API key

## Commands for Claude Code

### Content Commands
- `"new article about [topic]"` - Creates scaffolded article
- `"fetch trending tech news"` - Updates trending ticker
- `"write a DYK card about [fact]"` - Adds Did You Know content
- `"update tomorrow's teaser to [story]"` - Updates preview section
- `"add On This Day entry for [date] - [event]"` - Historical content

### Technical Commands
- `"add AdSense code: ca-pub-XXXXXX"` - Implements ad slots
- `"optimize images to WebP"` - Converts and optimizes images
- `"check Lighthouse score"` - Performance audit
- `"fix mobile menu on [screen size]"` - Responsive fixes
- `"update meta tags for [page]"` - SEO optimization

### Deploy Commands
- `"commit with message: [description]"` - Git commit
- `"deploy to Vercel"` - Full deployment workflow
- `"create branch: feature/[name]"` - New feature branch

## Success Metrics

### Traffic Goals
- **Month 1** - 1K pageviews
- **Month 3** - 10K pageviews
- **Month 6** - 50K pageviews
- **Month 12** - 100K pageviews

### Revenue Goals
- **AdSense Approval** - Within 3 months
- **First ₱1K Month** - Month 4
- **₱10K Monthly** - Month 8
- **Direct Sponsors** - Month 6

### Content Goals
- **15-20 Articles** - Before AdSense application
- **Daily Publishing** - After month 2
- **Email List** - 1,000 subscribers by month 6

---

**Remember:** This is the ROOT•BYTE project. Every decision should connect back to explaining the fundamental, foundational concepts that make technology work. We're not just another tech blog - we're THE destination for understanding the ROOT of how things work.

Built in the Philippines 🇵🇭 with Claude Code integration.