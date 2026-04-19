# Quest Journal: Quest Brief — snake-mcpb-bundle

- Quest ID: `snake-mcpb-bundle_2026-04-18__2201`
- Completed: 2026-04-19
- Mode: workflow
- Quality: Gold
- Outcome: Package the snake game as a Claude Desktop MCPB (MCP Bundle) so users can one-click install snake.mcpb and then summon the game inline in any conversation via a tool call. This is a "fun/thought-pr...

## What Shipped

**Problem**: Deliver the snake game as a one-click installable Claude Desktop MCPB bundle (`snake.mcpb`) that renders the existing single-file HTML build inline inside a Claude conversation via a minimal MCP server (one tool, one resource, stdio transport, no business logic). Ship a tagged GitHub...

## Files Changed

- `.quest/snake-mcpb-bundle_2026-04-18__2201/phase_01_plan/plan.md`
- `.quest/snake-mcpb-bundle_2026-04-18__2201/phase_01_plan/arbiter_verdict.md`
- `.quest/snake-mcpb-bundle_2026-04-18__2201/phase_01_plan/review_findings.json`
- `.quest/snake-mcpb-bundle_2026-04-18__2201/phase_01_plan/review_backlog.json`
- `.quest/snake-mcpb-bundle_2026-04-18__2201/phase_01_plan/review_plan-reviewer-a.md`
- `.quest/snake-mcpb-bundle_2026-04-18__2201/phase_01_plan/review_plan-reviewer-b.md`
- `.quest/snake-mcpb-bundle_2026-04-18__2201/phase_02_implementation/pr_description.md`
- `.quest/snake-mcpb-bundle_2026-04-18__2201/phase_02_implementation/builder_feedback_discussion.md`
- `.quest/snake-mcpb-bundle_2026-04-18__2201/phase_03_review/review_code-reviewer-a.md`
- `.quest/snake-mcpb-bundle_2026-04-18__2201/phase_03_review/review_findings_code-reviewer-a.json`
- `.quest/snake-mcpb-bundle_2026-04-18__2201/phase_03_review/review_code-reviewer-b.md`
- `.quest/snake-mcpb-bundle_2026-04-18__2201/phase_03_review/review_findings_code-reviewer-b.json`
- `.quest/snake-mcpb-bundle_2026-04-18__2201/phase_03_review/review_fix_feedback_discussion.md`

## Iterations

- Plan iterations: 2
- Fix iterations: 1

## Agents

- **The Judge** (arbiter): 
- **The Implementer** (builder): 

## Quest Brief

Package the snake game as a Claude Desktop MCPB (MCP Bundle) so users can one-click install snake.mcpb and then summon the game inline in any conversation via a tool call. This is a "fun/thought-provoking" showcase of MCPB + MCP Apps beyond the intended tool-surface use case — the MCP server is intentionally minimal (one tool, one resource, no business logic). Reuse the existing standalone HTML artifact; do not duplicate the game code.

### Deliverables

1. New directory `mcpb/` at the repo root containing:
   - `server.ts` — minimal TypeScript MCP server using `@modelcontextprotocol/sdk` and `@modelcontextprotocol/ext-apps`. Registers one UI resource at `ui://snake/game.html` (served from the packaged HTML file) and one tool `play_snake` with `_meta.ui.resourceUri` pointing at that URI. Stdio transport. No credentials, no upstream calls, no state.
   - `manifest.json` — MCPB manifest per the Claude Desktop extension spec (server command/args, entrypoint, icon, tools list, description, permissions: none).
   - `package.json` and `tsconfig.json` scoped to the MCPB build, independent of the root Vite project.
   - A build step that pulls `dist-single/index.html` (produced by `npm run build:single` at the repo root) into the MCPB as `widget/index.html` at pack time.
   - `icon.png` (can be a simple generated snake-themed placeholder; do not block the quest on design).

2. New root npm scripts:
   - `build:mcpb` — runs `npm run build:single`, then builds the MCPB TypeScript, then packs `mcpb/` into `dist-mcpb/snake.mcpb`.
   - Keep `build` and `build:single` untouched.

3. New GitHub Actions workflow `.github/workflows/release.yml`:
   - Triggered on tag push `v*.*.*`.
   - Runs `npm ci`, `npm run build:mcpb`.
   - Attaches `dist-mcpb/snake.mcpb` to the GitHub Release for that tag.
   - Does NOT touch the existing Pages deploy workflow.

4. README update — new 'Install in Claude Desktop' section under the existing 'Standalone single-file build' section, explaining:
   - Download snake.mcpb from the latest Release.
   - Double-click (or drag into Claude Desktop) to install.
   - Say 'play snake' in any conversation to launch.
   - Honest note that this is a showcase: the MCP has no tools beyond the game widget; MCPB is being used as a delivery mechanism, not a full MCP server, because that's currently the only way to get a native one-click installable inline-rendering widget in Claude Desktop.

5. Update `.gitignore` to ignore `dist-mcpb/` and `mcpb/node_modules/`.

### Constraints (KISS / YAGNI / SRP)

- Do not add telemetry, analytics, crash reporting, or auto-update.
- Do not introduce new root-level dependencies — the MCPB has its own `package.json` so `@modelcontextprotocol/sdk` and ext-apps live there, not in the Vite project.
- Do not change any game code in `src/`.
- Do not pre-bundle the MCP server with Vite or add Vite plugins for the MCPB — use plain `tsc`.
- Stdio transport only; no HTTP server.
- One tool, one resource. No elicitation, no sampling, no prompts.
- Minimum Claude Desktop MCPB spec fields in the manifest — nothing aspirational.

### Tests Expected

- A minimal vitest unit test that imports the server module and asserts the tool list contains exactly `play_snake` and the resource list contains exactly `ui://snake/game.html`. Do not attempt a full MCP client integration test — the masquerade is simple enough that the tool/resource registration check is the signal that matters.

### Acceptance

- `npm run build:mcpb` produces a valid `snake.mcpb` that Claude Desktop accepts via the install dialog (manual verification — this is a showcase, not a CI-verifiable install flow).
- After installing, typing 'play snake' in Claude Desktop triggers the tool, renders the game widget inline, and the game is playable.
- A v0.1.0 tag pushed to main attaches `snake.mcpb` to the GitHub Release.

### Skip If Tempted

- Multiple tools, settings UI, configuration, rate limiting, auth, telemetry, a splash screen, a second widget, anything that fights the 'minimal masquerade' framing.

## Carry-Over Findings

- No carry-over findings this round; nothing was inherited from earlier quests and nothing needs to be saved for the next one.

## Celebration

This journal embeds the celebration payload used by `/celebrate`.

- [Jump to Celebration Data](#celebration-data)
- Replay locally: `/celebrate docs/quest-journal/snake-mcpb-bundle_2026-04-19.md`

## Celebration Data

<!-- celebration-data-start -->
```json
{
  "quest_mode": "workflow",
  "agents": [
    {
      "name": "arbiter",
      "model": "",
      "role": "The Judge"
    },
    {
      "name": "builder",
      "model": "",
      "role": "The Implementer"
    }
  ],
  "achievements": [
    {
      "icon": "[BUG]",
      "title": "Gremlin Slayer",
      "desc": "Tackled 11 review findings"
    },
    {
      "icon": "[TEST]",
      "title": "Battle Tested",
      "desc": "Survived 5 reviews"
    },
    {
      "icon": "[PLAN]",
      "title": "Plan Perfectionist",
      "desc": "Iterated plan 2 times"
    },
    {
      "icon": "[WIN]",
      "title": "Quest Complete",
      "desc": "All phases finished successfully"
    }
  ],
  "metrics": [
    {
      "icon": "📊",
      "label": "Plan iterations: 2"
    },
    {
      "icon": "🔧",
      "label": "Fix iterations: 1"
    },
    {
      "icon": "📝",
      "label": "Review findings: 5"
    }
  ],
  "quality": {
    "tier": "Gold",
    "grade": "G"
  },
  "inherited_findings_used": {
    "count": 0,
    "summaries": []
  },
  "findings_left_for_future_quests": {
    "count": 0,
    "summaries": []
  },
  "test_count": null,
  "tests_added": null,
  "files_changed": 13
}
```
<!-- celebration-data-end -->
