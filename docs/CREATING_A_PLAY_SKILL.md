# Creating a `/play:snake` Plugin

This guide explains how to package a game as a Claude plugin so users can launch it with `/play:<game>`.

## Skill vs Plugin

A **skill** is a single `SKILL.md` with optional assets, invoked as `/skillname args` (space-separated). A **plugin** is a bundle that can contain multiple skills, each invoked as `/pluginname:skillname` (colon-separated). The colon syntax gives each game its own entry in autocomplete with its own description.

We use a plugin so `/play:snake`, `/play:tetris`, etc. each show up individually.

## Plugin Structure

```
play/
├── .claude-plugin/
│   └── plugin.json           # Required: plugin manifest
├── skills/
│   └── snake/
│       ├── SKILL.md          # Instructions Claude follows for this game
│       └── assets/
│           └── snake.html    # The game (single-file HTML build)
└── README.md
```

Each game gets its own folder under `skills/` with its own `SKILL.md` and assets.

## plugin.json

Located at `.claude-plugin/plugin.json`. Minimal manifest:

```json
{
  "name": "play",
  "version": "0.1.0",
  "description": "A game launcher for Claude. Each game is a skill invoked as /play:<game>.",
  "author": {
    "name": "Your Name"
  }
}
```

The `name` field determines the prefix before the colon — `"name": "play"` means `/play:<skill>`.

## Per-Game SKILL.md

Each game's `SKILL.md` has YAML frontmatter and instructions:

```yaml
---
name: snake
description: "Play Snake! Trigger when the user says /play:snake, \"play snake\",
  \"snake game\", or any mention of wanting to play the Snake game."
---

# Snake

Launch the Snake game for the user.

## Instructions

1. Read the game file from `assets/snake.html` (relative to this SKILL.md)
2. Copy it to the outputs folder as `snake.html`
3. Share the link with the user
```

The `name` field is the part after the colon — `"name": "snake"` means this skill is invoked as `/play:snake`.

The `description` field controls when Claude auto-triggers the skill. Be explicit about trigger phrases.

## The Game Asset

The game must be a single self-contained HTML file — all JS, CSS, and assets inlined. No external dependencies. For this project:

```bash
npm run build:single
# produces dist-single/index.html
```

Copy that into the skill:

```bash
cp dist-single/index.html skills/snake/assets/snake.html
```

## Packaging

The plugin is a **zip** created from inside the plugin directory (paths are relative to the plugin root, not the parent). Use the `.zip` extension — Claude's current plugin upload dialog accepts `.zip` and rejects other extensions like `.plugin`.

```bash
cd /path/to/play
zip -r play.zip . -x "*.DS_Store"
```

Or with Python:

```python
import zipfile
from pathlib import Path

plugin_path = Path("/path/to/play")
out = Path("play.zip")

with zipfile.ZipFile(out, "w", zipfile.ZIP_DEFLATED) as zipf:
    for f in plugin_path.rglob("*"):
        if f.is_file() and ".DS_Store" not in str(f):
            arcname = f.relative_to(plugin_path)
            zipf.write(f, arcname)
```

Install via: Plugins directory → Personal → Local uploads → + → Upload local plugin → pick `play.zip`.

## Adding More Games

To add `tetris`:

1. Create the directory and skill:

```
skills/
├── snake/
│   ├── SKILL.md
│   └── assets/snake.html
└── tetris/
    ├── SKILL.md
    └── assets/tetris.html
```

2. Write `skills/tetris/SKILL.md`:

```yaml
---
name: tetris
description: "Play Tetris! Trigger when the user says /play:tetris,
  \"play tetris\", \"tetris game\", or any mention of wanting to play Tetris."
---

# Tetris

Launch the Tetris game for the user.

## Instructions

1. Read the game file from `assets/tetris.html` (relative to this SKILL.md)
2. Copy it to the outputs folder as `tetris.html`
3. Share the link with the user
```

3. Build the game as a single HTML file and copy it to `skills/tetris/assets/tetris.html`

4. Repackage and reinstall `play.zip`

No changes needed to `plugin.json` or the snake skill — the plugin system auto-discovers new skill folders.

## Automation Script

```bash
npm run build:single \
  && cp dist-single/index.html skills/snake/assets/snake.html \
  && cd /path/to/play \
  && zip -r play.zip . -x "*.DS_Store" \
  && echo "Done: play.zip"
```

## Gotchas

- **Use `.zip` as the archive extension.** Claude's Upload Local Plugin dialog currently accepts `.zip` and rejects `.plugin` / `.skill`. The archive itself is a standard plugin bundle regardless of extension.
- **Zip from inside the directory.** The archive must have `.claude-plugin/`, `skills/`, etc. as top-level entries — no wrapping folder.
- **`name` in plugin.json = prefix.** Whatever you set as `name` becomes the `/name:` prefix for all sub-skills.
- **`name` in SKILL.md = suffix.** The skill's `name` frontmatter becomes the part after the colon.
- **Single-file HTML only.** Multi-file assets won't render in Claude's artifact viewer. Use `vite-plugin-singlefile` or equivalent.
- **Description triggers matter.** If a game doesn't trigger, the problem is almost always the `description` field in that game's SKILL.md. Add more trigger phrases.
- **Keep games small.** The snake build is ~178 KB. Keep under a few hundred KB for fast loading.
