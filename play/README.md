# play/ — Claude `/play` plugin

This directory is the source for the Claude `/play` plugin that ships the Snake game. Run `npm run build:play` from the repo root to produce `dist-play/play.plugin` and `dist-play/play.zip` (same bytes, two extensions).

## Install

**Claude Desktop** — drag `play.plugin` into the Claude Desktop window.

**Claude web / Cowork (organization)** — at time of writing the upload dialog rejects the `.plugin` extension, so use `play.zip` instead:
1. Organization settings → Plugins
2. "Add plugins" → "Upload a file"
3. Pick `play.zip`

`play.plugin` and `play.zip` are literally the same archive bytes; the dual extension is a workaround for the upload dialog's file-filter, not a repackaging.

## Trigger

Once installed, in any Claude conversation:
- `/play:snake`
- "play snake"
- "let's play snake"

## Adding more games

Follow `docs/CREATING_A_PLAY_SKILL.md`. Drop another folder under `play/skills/<game>/` with its own `SKILL.md` and `assets/`; the plugin system auto-discovers sub-skills.
