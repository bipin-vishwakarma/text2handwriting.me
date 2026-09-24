import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

// Run after npm run build. No external services, credentials or paid APIs.
const dist = new URL('../dist/', import.meta.url);
const sitemap = await readFile(new URL('sitemap.xml', dist), 'utf8');
const content = JSON.parse(await readFile(new URL('../src/data/seo-content.json', import.meta.url), 'utf8'));
const routes = await readFile(new URL('../src/App.tsx', import.meta.url), 'utf8');
const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => new URL(match[1]));
assert.ok(urls.length > 0, 'Sitemap must have URLs');
assert.equal(new Set(urls.map(url => url.href)).size, urls.length, 'Duplicate sitemap URL');
for (const url of urls) {
  assert.equal(url.origin, 'https://text2handwriting.me');
  assert.ok(url.pathname.endsWith('/'), `Noncanonical sitemap URL: ${url}`);
  const route = url.pathname.replace(/^\/+|\/+$/g, '');
  if (route) assert.ok(routes.includes(`path="${route}"`), `Missing React route: ${route}`);
  const html = await readFile(new URL(`${route ? `${route}/` : ''}index.html`, dist), 'utf8');
  assert.ok(html.includes(`<link rel="canonical" href="${url.href}"`), `Canonical mismatch: ${route}`);
  assert.ok(!html.includes('noindex'), `Indexable page blocked: ${route}`);
  assert.equal([...html.matchAll(/<h1\b/g)].length, 1, `Expected one static H1: ${route}`);
  for (const match of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) JSON.parse(match[1]);
  for (const section of content[`/${route}`]?.sections ?? []) {
    assert.ok(html.includes(section.title), `Missing static guide section: ${section.title}`);
  }
}
for (const route of ['auth', 'account', 'editor', 'onboarding']) {
  const html = await readFile(new URL(`${route}/index.html`, dist), 'utf8');
  assert.ok(html.includes('noindex'), `App route must be noindex: ${route}`);
  assert.ok(!urls.some(url => url.pathname === `/${route}/`), `App route in sitemap: ${route}`);
}
console.log(`SEO checks passed for ${urls.length} sitemap URLs and four noindex app routes.`);
