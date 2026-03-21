#!/usr/bin/env node
/**
 * Fetches your Goodreads "read" shelf and writes data/books.json
 * Run: node scripts/fetch-books.js
 * Requires Node.js 18+ (uses built-in fetch)
 */

const https  = require('https');
const fs     = require('fs');
const path   = require('path');

const RSS_URL   = 'https://www.goodreads.com/review/list_rss/131682472?shelf=read';
const JSON_FILE = path.join(__dirname, '..', 'data', 'books.json');
const JS_FILE   = path.join(__dirname, '..', 'js', 'bookshelf.js');

function decodeEntities(str) {
  return str
    .replace(/&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(parseInt(n, 10)))
    .replace(/\s+/g, ' ')
    .trim();
}

function getText(xml, tag) {
  const m = xml.match(new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]></${tag}>|<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, 'i'));
  return m ? decodeEntities(m[1] || m[2] || '') : '';
}

function largeCover(url) {
  return url.replace(/\._[A-Za-z]{2}\d+_(?=\.jpg)/i, '');
}

function fetchURL(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, res => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return resolve(fetchURL(res.headers.location));
      }
      if (res.statusCode !== 200) return reject(new Error(`HTTP ${res.statusCode}`));
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

async function main() {
  console.log('Fetching Goodreads RSS…');
  const xml = await fetchURL(RSS_URL);

  // Split into <item> blocks
  const itemBlocks = xml.match(/<item>([\s\S]*?)<\/item>/gi) || [];
  if (!itemBlocks.length) throw new Error('No <item> elements found in feed');

  const books = itemBlocks.map(block => {
    const ratingStr = getText(block, 'user_rating');
    const rating    = parseInt(ratingStr, 10) || 0;
    const bookId    = getText(block, 'book_id');
    const coverRaw  = getText(block, 'book_image_url') || getText(block, 'book_medium_image_url');

    return {
      title:  getText(block, 'title'),
      author: getText(block, 'author_name'),
      rating,
      cover:  largeCover(coverRaw),
      link:   bookId
        ? `https://www.goodreads.com/book/show/${bookId}`
        : 'https://www.goodreads.com/user/show/131682472-jacob-morley',
    };
  });

  // Write data/books.json
  fs.mkdirSync(path.dirname(JSON_FILE), { recursive: true });
  fs.writeFileSync(JSON_FILE, JSON.stringify(books, null, 2));
  console.log(`✓ Wrote ${books.length} books to ${JSON_FILE}`);

  // Patch the BOOKS array inline in bookshelf.js so it works without a server
  let js = fs.readFileSync(JS_FILE, 'utf8');
  const booksLiteral = books.map(b =>
    `    { title: ${JSON.stringify(b.title)}, author: ${JSON.stringify(b.author)}, rating: ${b.rating}, cover: "${b.cover}", link: "${b.link}" }`
  ).join(',\n');
  js = js.replace(
    /const BOOKS = \[[\s\S]*?\];/,
    `const BOOKS = [\n${booksLiteral}\n  ];`
  );
  fs.writeFileSync(JS_FILE, js);
  console.log(`✓ Updated BOOKS array in ${JS_FILE}`);
}

main().catch(err => { console.error('Error:', err.message); process.exit(1); });
