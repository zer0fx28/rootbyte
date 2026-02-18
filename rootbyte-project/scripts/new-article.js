#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const today = new Date();
const dateStr = today.toISOString().split('T')[0];
const args = process.argv.slice(2);
const slug = args[0] || 'new-article-' + Date.now();
const title = args[1] || 'Article Title Here';
const category = args[2] || 'ai';

const template = `---
title: "${title}"
date: ${dateStr}
category: ${category}
tags: []
root_year: 1900
root_who: ""
root_where: ""
root_connection: ""
dyk_fact: ""
tomorrow_teaser: false
hero_image: /images/articles/${slug}.webp
reading_time: 6
status: draft
---

## The Modern Story

## ROOT: Going Back to [YEAR]

## Did You Know

## Why It Matters Today
`;

const outPath = path.join(__dirname, '../src/content/articles', slug + '.md');
fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, template);
console.log('Article scaffolded: ' + outPath);
