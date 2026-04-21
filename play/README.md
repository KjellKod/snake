# play/ — Claude `/play` plugin marketplace

This directory is a Claude plugin **marketplace** shipping one plugin (`play`) that provides one skill (`snake`). The marketplace wrapper is what makes the archive installable — a bare `plugin.json` alone is not accepted by Claude's plugin system, which is why uploads fail with "upload failed" if the archive is missing `.claude-plugin/marketplace.json`.

Layout:
```
play/
├── .claude-plugin/
│   ├── marketplace.json  ← makes the archive installable
│   └── plugin.json       ← the plugin manifest
├── skills/
│   └── snake/SKILL.md
└── pack.sh
```

Run `npm run build:play` from the repo root to produce `dist-play/play.plugin` and `dist-play/play.zip` (same archive bytes under two extensions).

## Install

**Claude Desktop** — drag `play.plugin` into the Claude Desktop window.

**Claude web / Cowork (organization)** — at time of writing the upload dialog rejects the `.plugin` extension, so use `play.zip` instead:
1. Organization settings → Plugins
2. "Add plugins" → "Upload a file"
3. Pick `play.zip`

**Local install from a clone** (developer flow):
```bash
claude plugin marketplace add "$(pwd)/play" --scope local
claude plugin install play@play --scope local
```

`play.plugin` and `play.zip` are literally the same archive bytes; the dual extension is a workaround for the upload dialog's file-filter, not a repackaging.

## Trigger

Once installed, in any Claude conversation:
- `/play:snake`
- "play snake"
- "let's play snake"

## Adding more games

Follow `docs/CREATING_A_PLAY_SKILL.md`. Drop another folder under `play/skills/<game>/` with its own `SKILL.md` and `assets/`; the plugin system auto-discovers sub-skills.
