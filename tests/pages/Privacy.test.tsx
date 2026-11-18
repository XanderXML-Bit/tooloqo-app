import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import fs from 'node:fs';
import path from 'node:path';
import { Privacy } from '@/pages/Privacy';

const root = path.resolve(__dirname, '../..');

// Hosts that appear only as links the user follows, or in comments. The page never requests them.
const LINK_ONLY_HOSTS = new Set([
  'tooloqo.zendren.net',
  'zendren.net',
  'xandermlopez.com',
  'admob.google.com',
  'www.w3.org',
  'www.sitemaps.org',
  'tooloqo.vercel.app',
]);

function sourceFiles(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) return sourceFiles(p);
    return /\.(ts|tsx|css|html)$/.test(e.name) ? [p] : [];
  });
}

/** Every host named by an absolute or protocol-relative URL in the shipped source. */
function hostsInSource(): Set<string> {
  const hosts = new Set<string>();
  for (const file of [path.join(root, 'index.html'), ...sourceFiles(path.join(root, 'src'))]) {
    const text = fs.readFileSync(file, 'utf8');
    for (const m of text.matchAll(/(?:https?:)?\/\/([a-z0-9-]+(?:\.[a-z0-9-]+)+)/gi)) {
      hosts.add(m[1].toLowerCase());
    }
  }
  return hosts;
}

function renderPage() {
  render(
    <MemoryRouter>
      <Privacy />
    </MemoryRouter>
  );
  return screen.getByRole('article').textContent ?? '';
}

describe('Privacy', () => {
  it('states that files are processed on the device and nothing is collected', () => {
    renderPage();
    expect(screen.getByRole('heading', { name: 'How Tooloqo handles your files' })).toBeInTheDocument();
    expect(screen.getByText(/never uploaded to a server/)).toBeInTheDocument();
  });

  it('names every third-party host the source can contact', () => {
    const text = renderPage();
    const contacted = [...hostsInSource()].filter((h) => !LINK_ONLY_HOSTS.has(h));
    expect(contacted).toContain('cdn.jsdelivr.net');
    for (const host of contacted) expect(text).toContain(host);
  });

  it('describes no feature the web app lacks', () => {
    const text = renderPage().toLowerCase();
    expect(text).not.toMatch(/sound|haptic|recent/);
    expect(text).not.toContain('cdnjs');
  });
});
