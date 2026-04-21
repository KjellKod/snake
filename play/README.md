# play/ — Claude `/play` plugin

This directory is the source for the Claude `/play` plugin that ships the Snake game. Run `npm run build:play` from the repo root to produce `dist-play/play.plugin` and `dist-play/play.zip` (same archive bytes under two extensions).

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

**Claude Desktop** — drag `play.plugin` into the Claude Desktop window.

**Claude web (Personal → Local uploads)** — Plugins directory → **Personal** tab → **Local uploads** → **+** → **Upload local plugin** → pick `play.plugin` (or `play.zip` if the `.plugin` extension is rejected on your platform).

**Local install from a clone** (developer flow, via a tiny marketplace wrapper Claude Code CLI expects):
```bash
# Claude Code CLI marketplace install requires a marketplace.json.
# You can script this with a temp directory — see the repo-level CI script.
# Simpler: clone, build, drag the resulting .plugin into Claude Desktop.
```

## Trigger

Once installed, in any Claude conversation:
- `/play:snake`
- "play snake"
- "let's play snake"

## Adding more games

Follow `docs/CREATING_A_PLAY_SKILL.md`. Drop another folder under `play/skills/<game>/` with its own `SKILL.md` and `assets/`; the plugin system auto-discovers sub-skills.
