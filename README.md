# Snake Game

Two-player Snake game with neon Flash-era visuals and procedural audio. Built with React, TypeScript, and Vite.

# [ --> [Play it now](https://kjellkod.github.io/snake/) <--]

<img width="654" height="674" alt="Screenshot 2026-03-13 at 6 59 40 AM" src="https://github.com/user-attachments/assets/5bc8890d-7488-413b-89a8-01aecba7ecf1" />

## Quick Start

```bash
npm install
npm run dev
```

Open http://localhost:5173 in your browser.

## What Each Command Does

- `npm install` installs the project dependencies from `package.json`.
- `npm run dev` starts the Vite development server for local development.
- `npm run build` creates the production build in `dist/` and runs TypeScript checks.
- `npm run preview` serves the built `dist/` output locally so you can test the production build.

Typical local development flow:

```bash
npm install
npm run dev
```

To verify the production build locally:

```bash
npm run build
npm run preview
```

## Controls

| Player | Up | Down | Left | Right |
|--------|-----|------|------|-------|
| Player 1 | W | S | A | D |
| Player 2 | ↑ | ↓ | ← | → |
| Mobile | Tap above head | Tap below head | Tap left of head | Tap right of head |

Click **Start** to begin. One player dying doesn't end the game — the survivor plays on.

**Mobile**: Single-player works on mobile — tap anywhere on the canvas relative to the snake's head to steer. The canvas scales to fit your screen.

## Scripts

```bash
npm run dev      # Start dev server
npm run build    # Production build
npm run build:single  # Build a single self-contained HTML file in dist-single/
npm run build:mcpb    # Build snake.mcpb bundle in dist-mcpb/
npm run preview  # Preview production build
npm test         # Run unit tests
```

## Standalone Single-File Build

Run `npm run build:single` to produce `dist-single/index.html` as a single-file build with inlined assets.

### Install in Claude Desktop

1. Download `snake.mcpb` from the latest GitHub Release.
2. Double-click the file (or drag it into Claude Desktop) to install.
3. In any conversation, ask Claude to `play snake`.
4. This is an intentional showcase bundle: the MCP server only exposes one tool and one UI resource, and MCPB is used as a delivery mechanism for a native one-click inline widget install.

## Tech Stack

- **React 18** + **TypeScript** + **Vite**
- **Canvas API** for rendering (neon glow, particles, screen shake)
- **Web Audio API** for procedural sound effects and dynamic background music
- **Vitest** for unit testing (87 tests)
