<div align="center">

<img src="public/brand/wordmark.svg" alt="Tooloqo" width="220">

**Free image, PDF, media and text tools that run in your browser. Files never leave your device.**

[Tooloqo](https://tooloqo.zendren.net) is a Zendren app.

<img src="docs/screenshots/home.webp" alt="Tooloqo home screen on a phone, with Image, PDF, Text and Media tool categories" width="300"> <img src="docs/screenshots/home-desktop.webp" alt="Tooloqo home screen on a desktop browser" width="520">

</div>

---

## Stack

React 19, TypeScript 5.9 and Vite 7, with Tailwind CSS 3.4 (build-time, PostCSS), Zustand, React Router 7, pdf-lib and pdf.js, ffmpeg.wasm, vite-plugin-pwa and Capacitor 8 for the native shells. Tests use Vitest and Testing Library. Hosted on Vercel.

## Setup and run

Requires Node.js 22 (pinned in `.nvmrc` and `package.json` `engines`) and npm.

```bash
npm ci            # install from the lockfile
npm run lint      # ESLint
npx vitest run    # unit and component tests, single run
npm run build     # type-check and production build into dist/
npm run preview   # serve dist/ locally
npm run dev       # dev server on port 3000
```

---

## 📱 What is Tooloqo?

Tooloqo is a **unified utility toolkit** designed to replace the need for multiple single-purpose apps. Instead of downloading separate apps for image resizing, PDF merging, and text comparison, Tooloqo consolidates these essential tools into one privacy-focused application.

### Why Tooloqo?

- **Privacy First** - All processing happens on your device. No files are uploaded to external servers.
- **Offline Ready** - Core features work without an internet connection.
- **One App** - Image, PDF, media and text tools in one place.
- **Native Feel** - Built for mobile with proper touch interactions and haptic feedback.

---

## ✨ Core Features

### 🖼️ Image Tools (Free)

| Tool | Description |
|------|-------------|
| **Resize** | Change dimensions with social media presets (Instagram, Facebook, Twitter, LinkedIn, YouTube) |
| **Compress** | Reduce file size with quality slider and live size comparison |
| **Crop** | Freeform and preset aspect ratios (1:1, 4:3, 16:9, 3:2, 9:16) |
| **Convert** | Convert between PNG, JPEG, and WebP formats |
| **Rotate & Flip** | Quick 90° rotation and horizontal/vertical flip |

### 📄 PDF Tools (Free)

| Tool | Description |
|------|-------------|
| **Merge** | Combine multiple PDFs with drag-and-drop reordering |
| **Split** | Extract specific pages or split all pages |
| **Compress** | Optimize PDF size with metadata removal |
| **Image to PDF** | Convert images to PDF documents |
| **PDF to Image** | Extract pages as PNG images |

### ✏️ Text Tools (Free)

| Tool | Description |
|------|-------------|
| **Word Counter** | Real-time character, word, sentence, paragraph counts with reading/speaking time |
| **Case Converter** | UPPERCASE, lowercase, Title Case, Sentence case, tOGGLE cASE |
| **Text Compare** | Line-by-line diff comparison using LCS algorithm |

### 🎬 Media Tools

Media tools run on ffmpeg.wasm, which the browser downloads the first time you open one.

| Tool | Description |
|------|-------------|
| **Video Compress** | Reduce video file size with Web, Mobile and Archive presets |
| **Video to GIF** | Make a GIF from a time range, with frame-rate and width controls |
| **Extract Audio** | Save the audio track of a video as MP3, WAV or AAC |
| **Audio Convert** | Convert between MP3, WAV, AAC, FLAC, OGG and M4A |

---

## 💰 Cost

Every tool is free on the web, with no ads, accounts or purchases. The code contains an optional ad banner and a one-time ad-free in-app purchase for the native iOS and Android builds. Both are hidden on the web, and the native apps are not published yet.

---

## 🏗️ Architecture Overview

```
tooloqo/
├── index.html              # Entry point, CSS variables
├── src/
│   ├── App.tsx             # Main router with React Router v7
│   ├── main.tsx            # React DOM entry
│   ├── index.css           # Global styles
│   ├── components/
│   │   ├── ui/             # Base UI components (Button, Card, Input, etc.)
│   │   ├── layout/         # Header, BottomNav, Layout wrapper
│   │   ├── common/         # FileDropzone, ProcessingIndicator, ErrorBoundary, Toast
│   │   └── tools/          # Tool-specific components
│   │       ├── image/      # ImageResize, ImageCompress, ImageCrop, etc.
│   │       ├── pdf/        # PdfMerge, PdfSplit, PdfCompress, etc.
│   │       ├── text/       # WordCount, CaseConvert, TextCompare
│   │       └── media/      # AudioConvert, VideoCompress
│   ├── hooks/              # Custom React hooks
│   ├── services/           # Business logic (imageService, pdfService, etc.)
│   ├── stores/             # Zustand state management
│   ├── utils/              # Validation, helpers, formatters
│   ├── config/             # App constants and configuration
│   ├── pages/              # Route components
│   └── types/              # TypeScript definitions
├── public/
│   └── sw.js               # Service worker for offline support
├── tests/                  # Vitest test files
└── capacitor.config.ts     # Capacitor native wrapper config
```

### Tech Stack

| Technology | Purpose |
|------------|---------|
| **React 19** | UI framework with hooks |
| **TypeScript 5.9** | Type safety and developer experience |
| **Tailwind CSS** | Utility-first styling (build-time, PostCSS) |
| **Zustand** | Lightweight state management with persist |
| **React Router v7** | Client-side routing |
| **Vite 7** | Fast dev server and production builds |
| **Vitest** | Unit testing framework |
| **Capacitor 8** | Native iOS/Android wrappers |
| **pdf-lib** | PDF creation and manipulation |
| **pdfjs-dist** | PDF rendering and text extraction |
| **Lucide React** | Icon library |

### Design Principles

1. **Privacy First** - 100% client-side processing, no data transmission
2. **Offline Ready** - All free features work without network
3. **Battery Conscious** - Efficient processing, avoid unnecessary operations
4. **Native Feel** - No text selection, safe areas, haptic feedback

---

## 📖 Documentation

| Document | Description |
|----------|-------------|
| [**README.md**](./README.md) | This file - product overview |
| [**ARCHITECTURE.md**](./ARCHITECTURE.md) | Technical deep-dive into code structure |

---

## 🔐 Privacy & Permissions

**Tooloqo does not collect, store, or transmit any personal data.** All files are processed locally in your browser. Nothing is uploaded to a server.

### Data Practices

| What | Status |
|------|--------|
| File uploads to servers | ❌ Never |
| Analytics tracking | ❌ None |
| Personal data collection | ❌ None |
| Advertising | ❌ None on the web |
| Local storage | ✅ The theme you choose, nothing else |
| User control | ✅ Clear site data in the browser |

The privacy policy is the in-app page at https://tooloqo.zendren.net/privacy.

---

## 🛠️ Development

### Local Development

```bash
npm ci           # Install dependencies from the lockfile
npm run dev      # Start dev server at localhost:3000
```

### Production Build

```bash
npm run build    # Output to dist/
npm run preview  # Preview production build
```

### Testing

```bash
npm run test              # Run unit tests
```

### Native Deployment (Capacitor)

```bash
npx cap add ios           # Add iOS platform
npx cap add android       # Add Android platform
npm run build             # Build production bundle
npx cap sync              # Sync web assets to native
npx cap open ios          # Open in Xcode
npx cap open android      # Open in Android Studio
```

---

## 📱 PWA Support

Tooloqo is designed as a Progressive Web App:

1. Visit the app in mobile Safari/Chrome
2. Tap "Add to Home Screen"
3. Launch from home screen for fullscreen mode

PWA features:
- Offline capable (via service worker)
- Home screen icon
- Fullscreen display
- Native-like experience

---

## 🎨 UI/UX Guidelines

### Industrial Premium Design System

Tooloqo uses an "Industrial Premium" aesthetic with deep navy backgrounds, gradient buttons, and subtle glow effects.

### Color Palette

```css
/* Dark Mode (default) - Industrial Premium */
--color-background: #0a0e17;  /* Deep navy */
--color-surface: #10141f;     /* Card background */
--color-surface-elevated: #161c2a;  /* Modals, dropdowns */
--color-primary-500: #3378ff; /* Electric blue */
--color-accent-500: #fbbf24;  /* Gold accent */

/* Light Mode */
--color-background: #f8fafc;  /* Light gray */
--color-surface: #ffffff;     /* White */
```

### Typography

- **UI Font**: DM Sans - clean, modern sans-serif
- **Mono Font**: JetBrains Mono - for technical values and code

### Text Hierarchy

| Class | Usage |
|-------|-------|
| `text-text-primary` | Main headings, important text |
| `text-text-secondary` | Supporting info, descriptions |
| `text-text-tertiary` | Hints, disabled text |

### Tool Category Colors

| Category | Color | Hex |
|----------|-------|-----|
| Image Tools | Blue | #3b82f6 |
| PDF Tools | Red | #ef4444 |
| Text Tools | Green | #22c55e |
| Media Tools | Purple | #a855f7 |

### Design Conventions

- **44px touch targets** - Default button height is h-11 (44px) for accessibility
- **Dark mode default** - OLED-friendly deep navy background
- **Gradient buttons** - Primary actions use blue gradients with glow on hover
- **Staggered animations** - Cards animate in with 50ms delays for polish
- **Safe area support** - Proper handling of notches and home indicators
- **Haptic feedback** - Sound and vibration on interactions

---

## 🧪 Testing

The project uses Vitest with jsdom environment. Current test coverage includes:

- **Text Service** - Word counting, case conversion, text comparison
- **Validation Utils** - File validation, number validation, URL validation
- **Edge Cases** - Unicode support, empty inputs, large values

Run tests with:
```bash
npm run test
```

---

## 📋 Status

Shipped on the web: image tools (resize, compress, crop, convert, rotate), PDF tools (merge, split, compress, image to PDF, PDF to image), media tools (video compress, video to GIF, extract audio, audio convert) and text tools (word count, case convert, compare).

Not shipped: App Store and Play Store builds. The native projects are not committed. Generate them with `npx cap add ios` or `npx cap add android`, then `npm run cap:sync`.

---

## 📱 Supported Platforms

| Platform | Status | Notes |
|----------|--------|-------|
| **Web (PWA)** | Live | https://tooloqo.zendren.net, installable to the home screen |
| **iOS** | Not published | Generate with Capacitor |
| **Android** | Not published | Generate with Capacitor |

---

## 📄 License

© Zendren. All rights reserved. See [LICENSE](LICENSE). No open-source license is granted.

---

## 🙏 Credits

- **Icons**: [Lucide React](https://lucide.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Testing**: [Vitest](https://vitest.dev/)
- **PDF Processing**: [pdf-lib](https://pdf-lib.js.org/), [pdfjs-dist](https://mozilla.github.io/pdf.js/)

---

<div align="center">

© Zendren · <a href="https://zendren.net">zendren.net</a>

</div>
