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

## Standalone single-file build

Download [**standalone.html**](https://kjellkod.github.io/snake/standalone.html) — one self-contained HTML file (~178 KB) with React, game logic, and CSS all inlined. Double-click to play. No server, no install, works offline. Drag it into a Claude conversation (Claude.ai or Claude Desktop) and it renders as a playable Artifact right in the chat.
You can also download `snake.html` directly from the [latest Release](https://github.com/KjellKod/snake/releases/latest).

Build it yourself with:

```bash
npm run build:single
# → dist-single/index.html
```

## Install as a Claude /play plugin

The `/play` plugin bundles Snake as a Claude game skill so users can launch it with `/play:snake` or by saying "play snake". For authoring additional games later, see [docs/CREATING_A_PLAY_SKILL.md](docs/CREATING_A_PLAY_SKILL.md).

**Install (Claude Desktop / Cowork):**
1. Download **[`play.zip`](https://github.com/KjellKod/snake/releases/latest)** from the latest Release.
2. In Claude: **Plugins directory → Personal → Local uploads → +** → **Upload local plugin** → pick `play.zip`.
3. In any conversation, type `/play:snake` or say "play snake".

The archive is distributed with a `.zip` extension because Claude's current upload dialog only accepts `.zip`. Internally it's a standard Claude plugin bundle (`.claude-plugin/plugin.json` + `skills/snake/`).

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
npm run preview  # Preview production build
npm test         # Run unit tests
```

## Tech Stack

- **React 18** + **TypeScript** + **Vite**
- **Canvas API** for rendering (neon glow, particles, screen shake)
- **Web Audio API** for procedural sound effects and dynamic background music
- **Vitest** for unit testing (58 tests)
