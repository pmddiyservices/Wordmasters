#!/usr/bin/env node

/**
 * Roget's Thesaurus Path Explorer
 * A Node.js server (no dependencies) that serves the frontend
 * and proxies thesaurus lookups via the Datamuse API (free, no key needed)
 */

const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = 3000;

const choices = new Set();

// ── Datamuse API proxy ────────────────────────────────────────────────────────
function fetchThesaurus(word) {
  return new Promise((resolve, reject) => {
    // ml = "means like" (synonyms), rel_syn = related synonyms
    const endpoints = [
      `https://api.datamuse.com/words?rel_syn=${encodeURIComponent(word)}&md=pd&max=1000`
    ];

    choices.add(word);

    let results = [];
    let pending = endpoints.length;

    endpoints.forEach(endpoint => {
      https.get(endpoint, res => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            const parsed = JSON.parse(data);
            results = results.concat(parsed);
          } catch (e) {}
          pending--;
          if (pending === 0) resolve(dedupeAndEnrich(results, word));
        });
      }).on('error', err => {
        pending--;
        if (pending === 0) resolve(dedupeAndEnrich(results, word));
      });
    });
  });
}

function dedupeAndEnrich(words, originalWord) {
  const wordsUpdated = words
    .filter(w => {
      if (!w.word || choices.has(w.word.toLowerCase()) || w.word.includes(" ")) return false;
      return true;
    })
    .sort((a, b) => (b.score || 0) - (a.score || 0))
    .slice(0, 24)
    .map(w => ({
      word: w.word,
      score: w.score || 0,
      tags: w.tags || [],
      defs: w.defs || []
    }));

    console.log(wordsUpdated);
    
    return wordsUpdated;
}

// ── Static file server ────────────────────────────────────────────────────────
const MIME = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.ico': 'image/x-icon'
};

const server = http.createServer(async (req, res) => {
  const parsed = url.parse(req.url, true);
  const pathname = parsed.pathname;

  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    return res.end();
  }

  // API route
  if (pathname === '/api/thesaurus') {
    const word = parsed.query.word || '';
    if (!word.trim()) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: 'No word provided' }));
    }

    try {
      const results = await fetchThesaurus(word.trim());
//      console.log(results);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ word: word.trim(), synonyms: results }));
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    }
    return;
  }

  // Serve index.html for root
  let filePath = pathname === '/' ? '/index.html' : pathname;
  filePath = path.join(__dirname, 'public', filePath);

  const ext = path.extname(filePath);
  const contentType = MIME[ext] || 'text/plain';

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      return res.end('404 Not Found');
    }
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log(`\n✦ Word Masters`);
  console.log(`  → http://localhost:${PORT}\n`);
});
