# Snake Game

Two-player Snake game with neon Flash-era visuals and procedural audio. Built with React, TypeScript, and Vite.

## Quick Start

```bash
npm install
npm run dev
```

Open http://localhost:5173 in your browser.

## Controls

| Player | Up | Down | Left | Right |
|--------|-----|------|------|-------|
| Player 1 | W | S | A | D |
| Player 2 | ↑ | ↓ | ← | → |

Click **Start** to begin. One player dying doesn't end the game — the survivor plays on.

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
