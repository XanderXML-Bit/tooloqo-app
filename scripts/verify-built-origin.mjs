import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { JSDOM } from 'jsdom';

const origin = process.argv[2] || 'https://tooloqo.zendren.net';
const output = path.resolve(process.argv[3] || 'dist');
const html = readFileSync(path.join(output, 'index.html'), 'utf8');
const document = new JSDOM(html).window.document;
const expectations = [
  ['link[rel="canonical"]', 'href', `${origin}/`],
  ['meta[property="og:url"]', 'content', `${origin}/`],
  ['meta[property="og:image"]', 'content', `${origin}/og-image.png`],
  ['meta[name="twitter:image"]', 'content', `${origin}/og-image.png`],
];
for (const [selector, attribute, expected] of expectations) {
  const nodes = document.head.querySelectorAll(selector);
  assert.equal(nodes.length, 1, selector);
  assert.equal(nodes[0].getAttribute(attribute), expected, selector);
}
for (const node of document.head.querySelectorAll('meta[content], link[rel="canonical"]')) {
  const value = node.getAttribute('content') || node.getAttribute('href');
  if (!value?.startsWith('https://')) continue;
  const url = new URL(value);
  assert.equal(url.origin, origin, `Unexpected metadata host: ${value}`);
  if (node.matches('meta[property="og:image"], meta[name="twitter:image"]')) {
    const image = readFileSync(path.join(output, url.pathname));
    assert.equal(image.subarray(0, 8).toString('hex'), '89504e470d0a1a0a', value);
  }
}
for (const file of ['sitemap.xml', 'robots.txt']) {
  const filename = path.join(output, file);
  assert.ok(existsSync(filename), `Missing ${file}`);
  const text = readFileSync(filename, 'utf8');
  for (const value of text.match(/https?:\/\/[^\s<"']+/g) || []) {
    // XML namespace declarations identify schemas, not app routes.
    if (value.startsWith('http://www.sitemaps.org/')) continue;
    assert.equal(new URL(value).origin, origin, `${file}: ${value}`);
  }
}
const robotsLines = readFileSync(path.join(output, 'robots.txt'), 'utf8').split('\n');
for (const line of ['User-agent: *', 'Allow: /', `Sitemap: ${origin}/sitemap.xml`]) {
  assert.ok(robotsLines.includes(line), `robots.txt is missing "${line}"`);
}
const locs = [...readFileSync(path.join(output, 'sitemap.xml'), 'utf8').matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
assert.equal(locs.length, 23, 'sitemap.xml URL count');
assert.equal(new Set(locs).size, locs.length, 'sitemap.xml has duplicate URLs');
assert.ok(!html.includes('__SITE_ORIGIN__'), 'Unresolved origin token');
console.log(`Built metadata and image files pass: ${origin}`);
