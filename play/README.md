# play/ — Claude `/play` plugin

This directory is the source for the Claude `/play` plugin that ships the Snake game. Run `npm run build:play` from the repo root to produce `dist-play/snake.zip`.

Layout matches Anthropic's own `claude-plugins-official` repo for a skills-only plugin (e.g. `plugins/claude-code-setup/`):

```
play/
├── .claude-plugin/
│   └── plugin.json           ← plugin name="play" → /play:<skill>
├── skills/
│   └── snake/
│       ├── SKILL.md          ← skill name="snake" → /play:snake
│       └── assets/snake.html ← build artifact (gitignored)
└── pack.sh
```

## Install

1. Download `snake.zip` from the latest Release (or build locally with `npm run build:play`).
2. In Claude (Desktop or Cowork): **Plugins directory → Personal → Local uploads → +** → **Upload local plugin** → pick `snake.zip`.
3. In any conversation, type `/play:snake` or say "play snake".

The artifact uses a `.zip` extension because the current upload dialog only accepts `.zip` — the contents are a standard Claude plugin bundle.

## Trigger

Once installed, in any conversation:
- `/play:snake`
- "play snake"
- "let's play snake"

## Adding more games

Follow `docs/CREATING_A_PLAY_SKILL.md`. Drop another folder under `play/skills/<game>/` with its own `SKILL.md` and `assets/`; the plugin system auto-discovers sub-skills.
