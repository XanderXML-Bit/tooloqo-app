import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';
import { chromium } from 'playwright';

// Checks the 2026-11 audit fixes in a real browser. Run it against a production build served by
// `npm run preview`, or set QA_BASE_URL to check the live site. Fixtures are generated here, so no
// user file is needed.
const base = process.env.QA_BASE_URL || 'http://127.0.0.1:4178';
const output = process.env.QA_OUTPUT || 'test-results/defects';
const require = createRequire(import.meta.url);
const { PDFDocument, StandardFonts } = require('pdf-lib');
await fs.mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true, executablePath: process.env.CHROME_BIN || undefined });
const siteHost = new URL(base).host;
// Every host the app may contact. The privacy page names each one.
const ALLOWED_HOSTS = new Set([siteHost, 'cdn.jsdelivr.net']);
const record = { base, hosts: {}, jsdelivr: [], checks: {} };

async function threePagePdf() {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  for (let i = 1; i <= 3; i++) doc.addPage([612, 792]).drawText(`Page ${i} of 3`, { x: 72, y: 700, size: 48, font });
  return Buffer.from(await doc.save());
}

// A 1600 x 1000 PNG drawn in the page, so the fixture needs no encoder.
async function widePng(page) {
  const b64 = await page.evaluate(() => {
    const c = document.createElement('canvas');
    c.width = 1600; c.height = 1000;
    const x = c.getContext('2d');
    x.fillStyle = '#336'; x.fillRect(0, 0, 1600, 1000);
    x.fillStyle = '#fc6'; x.fillRect(100, 100, 600, 400);
    return c.toDataURL('image/png').split(',')[1];
  });
  return Buffer.from(b64, 'base64');
}

function pngSize(buf) {
  assert.equal(buf.subarray(1, 4).toString(), 'PNG');
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
}

async function open(width, route, opts = {}) {
  const context = await browser.newContext({ viewport: { width, height: width < 500 ? 844 : 900 }, acceptDownloads: true, ...opts });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('request', (r) => {
    const u = new URL(r.url());
    if (u.protocol.startsWith('http')) (record.hosts[u.host] ||= new Set()).add(route);
    if (u.host === 'cdn.jsdelivr.net') record.jsdelivr.push([u, route]);
  });
  await page.goto(base + route, { waitUntil: 'networkidle' });
  return { context, page, errors };
}

async function saveDownloads(page, prefix) {
  // Per-file buttons only. "Download All" would fetch the same files again.
  const buttons = page.getByRole('button', { name: /^download(?! all)/i });
  const files = [];
  for (let i = 0; i < await buttons.count(); i++) {
    const [download] = await Promise.all([page.waitForEvent('download'), buttons.nth(i).click()]);
    const file = path.join(output, `${prefix}-${download.suggestedFilename()}`);
    await download.saveAs(file);
    files.push({ name: download.suggestedFilename(), file });
  }
  return files;
}

try {
  const pdf = await threePagePdf();

  // Item 1: PDF to Image converts all three pages, at phone and desktop width.
  for (const width of [390, 1440]) {
    const { context, page, errors } = await open(width, '/pdf/pdf-to-image');
    await page.locator('input[type=file]').setInputFiles({ name: 'three.pdf', mimeType: 'application/pdf', buffer: pdf });
    const convert = page.getByRole('button', { name: 'Convert 3 Pages to Images' });
    await convert.click();
    await page.getByRole('button', { name: /^download/i }).first().waitFor({ timeout: 30000 });
    const files = await saveDownloads(page, `pdf-to-image-${width}`);
    assert.equal(files.length, 3, `${width}: expected three page images`);
    for (const f of files) {
      const size = pngSize(await fs.readFile(f.file));
      assert(size.width > 0 && size.height > size.width, `${width}: ${f.name} is not a portrait page`);
    }
    const workerRequests = [...Object.keys(record.hosts)].filter((h) => h === 'cdnjs.cloudflare.com');
    assert.equal(workerRequests.length, 0, 'pdf.js worker still loads from cdnjs');
    assert.deepEqual(errors, [], `${width}: page errors`);
    await page.screenshot({ path: path.join(output, `pdf-to-image-${width}.png`) });
    record.checks[`pdfToImage${width}`] = files.map((f) => f.name);
    await context.close();
  }

  // Item 5: a 1600 x 1000 image starts at 1080 x 675, and the output and its name agree.
  {
    const { context, page } = await open(1440, '/image/resize');
    await page.locator('input[type=file]').setInputFiles({ name: 'wide.png', mimeType: 'image/png', buffer: await widePng(page) });
    await page.getByLabel('Height (px)').waitFor();
    await page.waitForFunction(() => document.querySelector('#resize-height')?.value === '675');
    assert.equal(await page.getByLabel('Width (px)').inputValue(), '1080');
    await page.getByRole('button', { name: 'Resize Image' }).click();
    await page.getByText('Resized to 1080 × 675').waitFor();
    const [file] = await saveDownloads(page, 'resize');
    assert.equal(file.name, 'wide_1080x675.png');
    assert.deepEqual(pngSize(await fs.readFile(file.file)), { width: 1080, height: 675 });
    record.checks.resize = file.name;
    await context.close();
  }

  // Item 6: on a phone the scroll area ends at the tab bar, and a case pick shows its result.
  {
    const { context, page } = await open(390, '/image/resize');
    await page.locator('input[type=file]').setInputFiles({ name: 'wide.png', mimeType: 'image/png', buffer: await widePng(page) });
    const button = page.getByRole('button', { name: 'Resize Image' });
    await button.waitFor();
    const nav = await page.getByRole('navigation', { name: 'Main navigation' }).boundingBox();
    const main = await page.locator('main').boundingBox();
    assert(Math.abs(main.y + main.height - nav.y) <= 1, `main ends at ${main.y + main.height}, bar starts at ${nav.y}`);
    await button.scrollIntoViewIfNeeded();
    const box = await button.boundingBox();
    assert(box.y + box.height <= nav.y, 'Resize Image button is under the tab bar');
    record.checks.phoneResize = { navTop: nav.y, buttonBottom: box.y + box.height };
    await context.close();
  }
  {
    const { context, page } = await open(390, '/text/case-convert');
    await page.locator('textarea').fill('Tooloqo checks the result position on a phone.\n'.repeat(4));
    await page.getByRole('button', { name: /^lowercase/ }).click();
    const result = page.getByText('Result', { exact: true });
    await page.waitForTimeout(800);
    const nav = await page.getByRole('navigation', { name: 'Main navigation' }).boundingBox();
    const box = await result.boundingBox();
    assert(box.y >= 0 && box.y + box.height <= nav.y, `Result heading at ${box.y} is not visible above ${nav.y}`);
    record.checks.phoneCaseResult = box.y;
    await context.close();
  }

  // Item 7: each route has its own title and description.
  {
    const routes = ['/', '/image', '/image/resize', '/pdf/merge', '/pdf/pdf-to-image', '/media/video-to-gif', '/text/word-count', '/privacy', '/settings'];
    const { context, page } = await open(1440, '/');
    const seen = [];
    for (const r of routes) {
      await page.goto(base + r, { waitUntil: 'networkidle' });
      await page.waitForFunction((p) => document.title && location.pathname === p, r);
      seen.push(await page.evaluate(() => [document.title, document.querySelector('meta[name=description]').content]));
    }
    assert.equal(new Set(seen.map((s) => s[0])).size, routes.length, 'duplicate titles');
    assert.equal(new Set(seen.map((s) => s[1])).size, routes.length, 'duplicate descriptions');
    record.checks.titles = seen;
    await context.close();
  }

  // Item 8: the active tab label meets 4.5:1 in both themes.
  record.checks.contrast = [];
  for (const theme of ['light', 'dark']) {
    for (const r of ['/', '/image', '/pdf', '/media', '/text']) {
      const { context, page } = await open(390, r, { colorScheme: theme });
      await page.evaluate((t) => localStorage.setItem('tooloqo-settings', JSON.stringify({ state: { theme: t }, version: 0 })), theme);
      await page.reload({ waitUntil: 'networkidle' });
      await page.evaluate(() => Promise.allSettled(document.getAnimations().map((a) => a.finished)));
      // Measure against the painted pixels (page, nav glass gradient, pill and glow), not computed
      // background colours: the nav paints with background-image, so its backgroundColor is transparent.
      const label = page.locator('nav[aria-label="Main navigation"] a[aria-current="page"] span');
      const fg = await label.evaluate((el) => getComputedStyle(el).color);
      const name = await label.textContent();
      const clip = await label.boundingBox();
      // The label has a colour transition, so switch it off before hiding the glyphs.
      await label.evaluate((el) => { el.style.transition = 'none'; el.style.color = 'transparent'; });
      await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
      const shot = (await page.screenshot({ clip })).toString('base64');
      const m = await page.evaluate(async ({ shot, fg, name }) => {
        const img = new Image();
        img.src = 'data:image/png;base64,' + shot;
        await img.decode();
        const c = document.createElement('canvas');
        c.width = img.width; c.height = img.height;
        const x = c.getContext('2d');
        x.drawImage(img, 0, 0);
        const px = x.getImageData(0, 0, c.width, c.height).data;
        x.fillStyle = fg; x.fillRect(0, 0, 1, 1);
        const f = x.getImageData(0, 0, 1, 1).data;
        const lum = (r, g, b) => [r, g, b].map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; })
          .reduce((s, v, i) => s + v * [0.2126, 0.7152, 0.0722][i], 0);
        const lf = lum(f[0], f[1], f[2]);
        // The worst pixel behind the label decides, so a bright glow or gradient stop cannot hide.
        let ratio = Infinity;
        for (let i = 0; i < px.length; i += 4) {
          const [a, b] = [lf, lum(px[i], px[i + 1], px[i + 2])].sort((p, q) => q - p);
          ratio = Math.min(ratio, (a + 0.05) / (b + 0.05));
        }
        return { label: name, ratio };
      }, { shot, fg, name });
      assert(m.ratio >= 4.5, `${theme} ${m.label}: ${m.ratio.toFixed(2)}:1`);
      record.checks.contrast.push({ theme, ...m, ratio: +m.ratio.toFixed(2) });
      await context.close();
    }
  }

  // Items 2 and 3: a browser upgraded from an older build loses the old file list and old settings.
  {
    const { context, page } = await open(1440, '/privacy');
    await page.evaluate(() => {
      localStorage.setItem('tooloqo-files', JSON.stringify({ state: { recentFiles: [{ name: 'old.pdf', thumbnail: 'data:,' }] }, version: 0 }));
      localStorage.setItem('tooloqo-settings', JSON.stringify({ state: { theme: 'dark', autoCleanup: true, cleanupAfterDays: 7, maxRecentFiles: 20, showThumbnails: true, analyticsEnabled: false }, version: 0 }));
    });
    await page.reload({ waitUntil: 'networkidle' });
    const stored = await page.evaluate(() => ({ files: localStorage.getItem('tooloqo-files'), settings: JSON.parse(localStorage.getItem('tooloqo-settings')) }));
    assert.equal(stored.files, null, 'old recent-files list survived a page load');
    assert.deepEqual(stored.settings.state, { theme: 'dark' }, 'old settings fields survived a page load');
    record.checks.legacyUpgrade = stored;
    await context.close();
  }

  // Item 4: Image Compress runs its worker without loading code from a CDN.
  {
    const { context, page, errors } = await open(1440, '/image/compress');
    const thirdParty = [];
    const workerScript = [];
    // Every page loads the Geist font; anything else from another host would be the compression script.
    page.on('request', (r) => {
      const u = new URL(r.url());
      if (u.protocol.startsWith('http') && u.host !== siteHost && !u.pathname.startsWith('/npm/geist@')) thirdParty.push(r.url());
      if (u.host === siteHost && /\/assets\/browser-image-compression-[^/]+\.js$/.test(u.pathname)) workerScript.push(u.pathname);
    });
    await page.locator('input[type=file]').setInputFiles({ name: 'wide.png', mimeType: 'image/png', buffer: await widePng(page) });
    await page.getByRole('button', { name: 'Compress Image' }).click();
    await page.getByRole('button', { name: /^download/i }).first().waitFor({ timeout: 30000 });
    assert.deepEqual(thirdParty, [], `Image Compress contacted another host: ${thirdParty.join(', ')}`);
    assert.deepEqual(errors, [], 'Image Compress page errors');
    assert(workerScript.length > 0, 'the compression worker did not load the bundled script');
    record.checks.imageCompress = { thirdParty, workerScript };
    await context.close();
  }

  // Item 4: what each tool group fetches from jsDelivr matches the privacy page: the Geist font on
  // every page, and the FFmpeg engine on media tools only.
  for (const [url, route] of record.jsdelivr) {
    const font = url.pathname.startsWith('/npm/geist@');
    const ffmpeg = url.pathname.startsWith('/npm/@ffmpeg/') && route.startsWith('/media');
    assert(font || ffmpeg, `privacy page does not describe ${url.href} on ${route}`);
  }

  // Item 4: no host outside the privacy page's list was contacted.
  for (const host of Object.keys(record.hosts)) assert(ALLOWED_HOSTS.has(host), `unlisted host ${host}`);
} finally {
  for (const h of Object.keys(record.hosts)) record.hosts[h] = [...record.hosts[h]];
  record.jsdelivr = record.jsdelivr.map(([u, r]) => [u.href, r]);
  await fs.writeFile(path.join(output, 'defects.json'), JSON.stringify(record, null, 2));
  await browser.close();
}
console.log(JSON.stringify(record, null, 2));
