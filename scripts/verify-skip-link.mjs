import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';
import { chromium } from 'playwright';

// Run against a production build served by `npm run preview`.
const base = process.env.QA_BASE_URL || 'http://127.0.0.1:4178';
const output = process.env.QA_OUTPUT || 'test-results/skip-link';
const require = createRequire(import.meta.url);
await fs.mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true });
const records = [];
const routes = ['/', '/image', '/text/word-count', '/privacy', '/this-does-not-exist'];

// Wait for every finite animation to finish before scanning. All four Home category cards fade
// in (animate-card-reveal) with staggered delays, and axe measures colour through an element's
// current opacity. A scan taken mid-reveal therefore reports a color-contrast failure on whichever
// "N tools" badge is still half-faded, and which one fails depends on timing. At rest, every badge
// is #475569 on #f1f5f9 (light, 6.9:1) or #94a3b8 on #242936 (dark, 5.7:1).
// Infinite animations (icon float, shimmer) never finish and do not change text colour.
async function settle(page) {
  await page.evaluate(() =>
    Promise.allSettled(
      document.getAnimations()
        .filter((a) => a.effect?.getComputedTiming().iterations !== Infinity)
        .map((a) => a.finished),
    ));
}

async function scan(page) {
  await settle(page);
  await page.addScriptTag({ path: require.resolve('axe-core/axe.min.js') });
  return page.evaluate(async () => {
    const result = await window.axe.run();
    return result.violations
      .filter((v) => ['serious', 'critical'].includes(v.impact))
      .map((v) => ({ id: v.id, nodes: v.nodes.map((n) => n.html) }));
  });
}

try {
  for (const width of [320, 1280]) {
    for (const route of routes) {
      const context = await browser.newContext({ viewport: { width, height: 900 } });
      const page = await context.newPage();
      const errors = [];
      page.on('pageerror', (error) => errors.push(error.message));
      page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
      await page.goto(`${base}${route}`);
      await page.locator('footer').waitFor();
      const label = `${route} @ ${width}px`;

      const skip = page.getByRole('link', { name: 'Skip to content' });
      const hiddenBox = await skip.boundingBox();
      assert(hiddenBox && hiddenBox.y + hiddenBox.height <= 0, `${label}: skip link is visible before focus`);
      await page.keyboard.press('Tab');
      assert(await skip.evaluate((el) => el === document.activeElement), `${label}: first Tab missed the skip link`);
      await page.waitForTimeout(200);
      const box = await skip.boundingBox();
      assert(box && box.y >= 0 && box.x >= 0 && box.x + box.width <= width, `${label}: focused skip link is off screen`);
      assert(box.height >= 44, `${label}: skip link is ${box.height}px tall`);
      await page.screenshot({ path: path.join(output, `${route === '/' ? 'home' : route.slice(1).replace(/\W+/g, '-')}-${width}-focused.png`) });
      await page.keyboard.press('Enter');
      const focused = await page.evaluate(() => ({ tag: document.activeElement?.tagName, id: document.activeElement?.id, hash: location.hash }));
      assert.deepEqual(focused, { tag: 'MAIN', id: 'main', hash: '' }, `${label}: Enter did not focus <main id="main">`);

      const footerLinks = await page.locator('footer a').evaluateAll((links) =>
        links.map((link) => {
          const { top, width, height } = link.getBoundingClientRect();
          return { text: link.textContent, top: Math.round(top), width, height };
        }));
      assert.equal(footerLinks.length, 2, `${label}: footer link count`);
      for (const link of footerLinks) {
        assert(
          link.width >= 44 && link.height >= 44,
          `${label}: footer link ${link.text} is ${link.width} × ${link.height}px`,
        );
      }
      const footerRows = new Set(footerLinks.map((l) => l.top)).size;
      assert.equal(footerRows, 1, `${label}: footer link rows`);

      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, `${label}: horizontal overflow`);
      const violations = await scan(page);
      assert.equal(violations.length, 0, `${label}: ${JSON.stringify(violations)}`);
      assert.deepEqual(errors, [], `${label}: console errors`);
      records.push({ width, route, skipBox: box, focused, footerLinks, footerRows, violations: violations.length, errors });
      await context.close();
    }
  }
} finally {
  await fs.writeFile(path.join(output, 'results.json'), JSON.stringify(records, null, 2));
  await browser.close();
}
console.log(`Skip link and footer targets verified on ${records.length} route and width pairs.`);
