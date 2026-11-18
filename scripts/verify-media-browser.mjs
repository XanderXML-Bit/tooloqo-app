import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';
import { chromium } from 'playwright';

// Run against a production build served by `npm run preview`.
const base = process.env.QA_BASE_URL || 'http://127.0.0.1:4178';
const output = process.env.QA_OUTPUT || 'test-results/media';
const require = createRequire(import.meta.url);
await fs.mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true });
const records = [];
const routes = ['video-compress', 'video-to-gif', 'extract-audio', 'audio-convert'];

// A real one-second PCM WAV fixture needs no external encoder or uploaded user data.
function sampleWav() {
  const rate = 8000;
  const bytes = Buffer.alloc(44 + rate * 2);
  bytes.write('RIFF'); bytes.writeUInt32LE(bytes.length - 8, 4);
  bytes.write('WAVEfmt ', 8); bytes.writeUInt32LE(16, 16);
  bytes.writeUInt16LE(1, 20); bytes.writeUInt16LE(1, 22);
  bytes.writeUInt32LE(rate, 24); bytes.writeUInt32LE(rate * 2, 28);
  bytes.writeUInt16LE(2, 32); bytes.writeUInt16LE(16, 34);
  bytes.write('data', 36); bytes.writeUInt32LE(rate * 2, 40);
  for (let i = 0; i < rate; i++) bytes.writeInt16LE(Math.round(8000 * Math.sin(2 * Math.PI * 440 * i / rate)), 44 + i * 2);
  return bytes;
}

async function scan(page) {
  await page.addScriptTag({ path: require.resolve('axe-core/axe.min.js') });
  return page.evaluate(async () => {
    const result = await window.axe.run();
    return result.violations.filter((v) => ['serious', 'critical'].includes(v.impact));
  });
}

try {
  for (const width of [320, 768, 1280]) {
    for (const tool of [...routes, 'settings']) {
      const context = await browser.newContext({ viewport: { width, height: 900 } });
      const page = await context.newPage();
      const errors = [], engineRequests = [];
      page.on('pageerror', (error) => errors.push(error.message));
      page.on('request', (request) => { if (request.url().includes('/@ffmpeg/core@')) engineRequests.push(request.url()); });
      await page.goto(`${base}/${tool === 'settings' ? tool : `media/${tool}`}`);
      await page.waitForTimeout(10000);
      const text = await page.locator('body').innerText();
      assert(!text.includes('Failed to load'), `${tool}: initial load error`);
      assert.equal(engineRequests.length, 0, `${tool}: engine loaded without a file`);
      assert.equal(errors.length, 0, `${tool}: page errors`);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
      const violations = await scan(page);
      assert.equal(violations.length, 0, `${tool}: ${JSON.stringify(violations)}`);
      const record = { width, tool, errors, engineRequests, violations };
      if (tool === 'settings') {
        // Auto-cleanup was removed: it was stored and never read. Settings must not offer it.
        assert.equal(await page.getByRole('switch', { name: 'Auto-cleanup' }).count(), 0, 'Auto-cleanup switch is back');
        assert.equal(await page.getByText(/files cached/i).count(), 0, 'Recent-files row is back');
      } else {
        await page.getByLabel('Choose files to upload').waitFor({ state: 'attached' });
      }
      await page.screenshot({ path: path.join(output, `${tool}-${width}.png`), fullPage: true });
      records.push(record);
      await fs.writeFile(path.join(output, 'matrix.json'), JSON.stringify(records, null, 2));
      await context.close();
    }
  }

  // Fail the first CDN request. Retry must load the actual engine and process the same file.
  const context = await browser.newContext({ viewport: { width: 320, height: 900 } });
  const page = await context.newPage();
  let attempts = 0;
  await page.route('**/@ffmpeg/core@*/dist/esm/ffmpeg-core.js', async (route) => {
    attempts++;
    if (attempts === 1) await route.abort('failed');
    else await route.continue();
  });
  await page.goto(`${base}/media/audio-convert`);
  await page.getByLabel('Choose files to upload').setInputFiles({ name: 'tone.wav', mimeType: 'audio/wav', buffer: sampleWav() });
  await page.getByText(/Failed to load FFmpeg:/).waitFor();
  await page.screenshot({ path: path.join(output, 'retry-error.png'), fullPage: true });
  await page.getByRole('button', { name: /Try again/i }).click();
  await page.getByRole('status').filter({ hasText: 'Loading media engine...' }).waitFor();
  await page.screenshot({ path: path.join(output, 'retry-loading.png'), fullPage: true });
  await page.getByRole('button', { name: 'Convert to MP3' }).click({ timeout: 90000 });
  const downloadButton = page.getByRole('button', { name: 'Download MP3' });
  await downloadButton.waitFor({ timeout: 60000 });
  const [download] = await Promise.all([page.waitForEvent('download'), downloadButton.click()]);
  const destination = path.join(output, 'tone.mp3');
  await download.saveAs(destination);
  const bytes = await fs.readFile(destination);
  assert(bytes.length > 1000, 'MP3 output is empty');
  assert(bytes.subarray(0, 3).toString() === 'ID3' || bytes[0] === 0xff, 'Output lacks an MP3 header');
  assert.equal(attempts, 2, 'Retry did not refetch the engine');
  assert.equal((await scan(page)).length, 0);
  await page.screenshot({ path: path.join(output, 'processing-success.png'), fullPage: true });
  await fs.writeFile(path.join(output, 'processing.json'), JSON.stringify({ attempts, bytes: bytes.length, filename: download.suggestedFilename(), text: await page.locator('body').innerText() }, null, 2));
  await context.close();
  console.log(`PASS: ${records.length} fresh route/viewport checks, no auto-cleanup switch, retry, and real WAV-to-MP3 conversion.`);
} finally {
  await browser.close();
}
