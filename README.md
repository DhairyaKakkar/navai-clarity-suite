# NavAI

Monorepo containing the NavAI UI and Chrome extension.

```
apps/
  ui/          — React landing page & demo (Vite + shadcn)
  extension/   — Chrome extension (esbuild + TypeScript)
```

## Setup

```bash
npm install
```

## Development

### UI (landing page / demo)

```bash
npm run dev
```

Opens at `http://localhost:8080`.

### Extension

```bash
npm run dev:extension
```

This watches for changes and rebuilds to `apps/extension/dist/`.

**Load in Chrome:**

1. Go to `chrome://extensions/`
2. Enable **Developer mode** (top right)
3. Click **Load unpacked**
4. Select `apps/extension/dist/`

## Build

```bash
# Build both UI and extension
npm run build

# Build extension only
npm run build:extension
```

## Package extension for release

```bash
npm run pack:extension
```

Creates `apps/extension.zip` ready for Chrome Web Store or distribution.

## Other commands

| Command | Description |
|---|---|
| `npm run lint` | Lint the UI |
| `npm run typecheck` | Typecheck the extension |
| `npm test` | Run UI tests |
| `npm run clean` | Remove all build artifacts and node_modules |
