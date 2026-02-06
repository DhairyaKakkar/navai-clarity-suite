# NavAI

Monorepo containing the NavAI UI and Chrome extension.

```
apps/
  ui/          — React landing page & demo (Vite + shadcn)
  extension/   — Chrome extension (esbuild + TypeScript)
```

## Prerequisites

- [Node.js](https://nodejs.org/) v18 or later
- npm (comes with Node.js)
- Google Chrome (for the extension)

## Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/dhairyakakkar/navai-clarity-suite.git
cd navai-clarity-suite
```

### 2. Install dependencies

```bash
npm install
```

This installs dependencies for both the UI and the extension via npm workspaces.

### 3. Run the UI

```bash
npm run dev
```

Opens at [http://localhost:8080](http://localhost:8080). Visit `/demo` for the interactive accessibility demo.

### 4. Run the Chrome Extension

In a separate terminal:

```bash
npm run dev:extension
```

This watches for changes and rebuilds to `apps/extension/dist/`.

Then load the extension in Chrome:

1. Go to `chrome://extensions/`
2. Enable **Developer mode** (toggle in the top-right corner)
3. Click **Load unpacked**
4. Select the `apps/extension/dist/` folder

The extension will automatically reload when you make changes (you may need to click the refresh icon on the extensions page for some changes).

## Build

```bash
# Build both UI and extension
npm run build

# Build extension only
npm run build:extension
```

## Package Extension for Release

```bash
npm run pack:extension
```

Creates `apps/extension.zip` ready for Chrome Web Store or distribution.

## Other Commands

| Command | Description |
|---|---|
| `npm run dev` | Start the UI dev server |
| `npm run dev:extension` | Watch & rebuild the extension |
| `npm run build` | Production build (UI + extension) |
| `npm run build:extension` | Production build (extension only) |
| `npm run pack:extension` | Zip the extension for distribution |
| `npm run lint` | Lint the UI |
| `npm run typecheck` | Typecheck the extension |
| `npm test` | Run UI tests |
| `npm run clean` | Remove all build artifacts and node_modules |
