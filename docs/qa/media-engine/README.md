# Repair media engine initialization

TQ-01 and TQ-02 affect the four media tools and the Auto-cleanup switch.

## Identify the cause

`@ffmpeg/ffmpeg` 0.12.15 creates a module worker in the Vite production build. The service supplies `@ffmpeg/core` 0.12.10's UMD build.

The worker cannot use `importScripts` in module mode. It falls back to dynamic import, which requires the core's default export.

The UMD core has no default export. The worker rejects with the string `Error: failed to import ffmpeg-core.js`.

The service replaces non-Error rejections with `Unknown error`. Each tool eagerly initializes the engine, exposing that failure before file selection.

Baseline instrumentation confirms both CDN downloads return HTTP 200. It also captures the worker's exact rejection. Missing cross-origin isolation is not the cause.

## Describe the repair

- Use the pinned core's ES module build, which supplies the worker's required default export.
- Load the engine after file selection through `useMediaEngine`.
- Show a loading status and the approximate 32 MB first-use download size.
- Preserve string rejections and offer an actual initialization retry for the selected file.
- Terminate failed workers and revoke temporary asset URLs after initialization.
- Ignore stale hook completions after file changes or unmounting.
- Increase the switch button to 48×44 px while retaining its 48×28 px visible track.

No CSP, COOP, COEP, DNS, production deployment, analytics, or runtime dependency changes occur.

The browser interface remains TypeScript because React and the existing browser integration require it. No native component is introduced.

## Run the checks

1. Run `npm ci`.
2. Run `npm run lint`.
3. Run `npx vitest run`.
4. Run `npm run build`.
5. Run `npx playwright install chromium`.
6. Start `npm run preview -- --host 127.0.0.1 --port 4178`.
7. Run `node scripts/verify-media-browser.mjs` from another terminal.

Set `QA_BASE_URL` to test another authorized local or preview origin. Set `QA_OUTPUT` to choose the evidence directory.

The browser regression uses fresh anonymous contexts. It waits ten seconds on each media route at 320, 768, and 1280 px.

It also verifies switch geometry, expanded-edge hits, keyboard operation, focus visibility, overflow, and serious or critical axe findings.

A final context blocks the first core request. Selecting `Try again` refetches the engine and converts a generated one-second WAV to MP3.

The script downloads the result and checks its size and MP3 header. It never uploads the sample to a server.

GitHub Actions runs the browser regression on Node 22. Ubuntu 24.04 matches Playwright's supported Linux dependencies.

## Inspect the captures

"Before" captures show the earlier build. "After" captures show the build with these repairs.
Both sets were recaptured with Zendren attribution.

The following links contain all four routes at all three requested widths. WebP copies use quality 90.

| Route | Width | Before | After |
|---|---:|---|---|
| Video Compress | 320 | [Initial error](before/video-compress-320.webp) | [Ready for selection](after/video-compress-320.webp) |
| Video Compress | 768 | [Initial error](before/video-compress-768.webp) | [Ready for selection](after/video-compress-768.webp) |
| Video Compress | 1280 | [Initial error](before/video-compress-1280.webp) | [Ready for selection](after/video-compress-1280.webp) |
| Video to GIF | 320 | [Initial error](before/video-to-gif-320.webp) | [Ready for selection](after/video-to-gif-320.webp) |
| Video to GIF | 768 | [Initial error](before/video-to-gif-768.webp) | [Ready for selection](after/video-to-gif-768.webp) |
| Video to GIF | 1280 | [Initial error](before/video-to-gif-1280.webp) | [Ready for selection](after/video-to-gif-1280.webp) |
| Extract Audio | 320 | [Initial error](before/extract-audio-320.webp) | [Ready for selection](after/extract-audio-320.webp) |
| Extract Audio | 768 | [Initial error](before/extract-audio-768.webp) | [Ready for selection](after/extract-audio-768.webp) |
| Extract Audio | 1280 | [Initial error](before/extract-audio-1280.webp) | [Ready for selection](after/extract-audio-1280.webp) |
| Audio Convert | 320 | [Initial error](before/audio-convert-320.webp) | [Ready for selection](after/audio-convert-320.webp) |
| Audio Convert | 768 | [Initial error](before/audio-convert-768.webp) | [Ready for selection](after/audio-convert-768.webp) |
| Audio Convert | 1280 | [Initial error](before/audio-convert-1280.webp) | [Ready for selection](after/audio-convert-1280.webp) |
| Settings | 320 | [28 px target](before/settings-320.webp) | [44 px target](after/settings-320.webp) |
| Settings | 768 | [28 px target](before/settings-768.webp) | [44 px target](after/settings-768.webp) |
| Settings | 1280 | [28 px target](before/settings-1280.webp) | [44 px target](after/settings-1280.webp) |

## Record validation limits

The author verifies one complete audio conversion, including forced initialization failure and retry. Other media formats and video processing remain outside this functional check.

The core still requires a first-use CDN download. This change does not promise offline initialization or compatibility with every browser and codec.

The repository's inherited dependency audit findings remain unchanged.
