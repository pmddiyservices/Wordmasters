# Roget's Path — Thesaurus Explorer

A beautiful, interactive thesaurus explorer built with **pure Node.js** (zero npm dependencies).

## Features

- 🔍 Look up synonyms for any word using the free [Datamuse API](https://www.datamuse.com/api/)
- 🎨 **Colour-coded nodes** by word type:
  - 🔵 **Blue** — Nouns
  - 🟢 **Green** — Verbs
  - 🟠 **Coral** — Adjectives
  - 🟣 **Violet** — Adverbs
  - 🟡 **Amber** — Words starting with a vowel (overrides noun colour)
  - ⚫ **Grey** — Other / unknown
- 🕸️ **Graphical path layout** — synonyms radiate outward from the root word with animated Bézier connections
- 🖱️ **Click any synonym** to re-run the search with that word
- 🗂️ **Breadcrumb trail** — navigate back to any previous word in your exploration path
- 📊 Score bar on each node indicates relative similarity strength

## Requirements

- Node.js v14 or higher (no npm packages needed!)
- Internet connection (fetches from Datamuse API & Google Fonts)

## Setup

```bash
node server.js
```

Then open your browser to: **http://localhost:3000**

## How it works

- `server.js` — A lightweight HTTP server using only Node.js built-ins (`http`, `https`, `fs`, `url`, `path`)
- `public/index.html` — Single-file frontend with all CSS and JS inline
- Synonym data comes from two [Datamuse](https://www.datamuse.com/api/) endpoints:
  - `rel_syn` — direct synonyms
  - `ml` — "means like" (semantic similarity)

## Customisation

You can tweak the following CSS variables in `index.html` to change colours:

```css
--col-noun:    #7b9cff;
--col-verb:    #72d9a0;
--col-adj:     #f4845f;
--col-adv:     #c97df7;
--col-vowel:   #f7c948;
--col-unknown: #8a8a9a;
```
