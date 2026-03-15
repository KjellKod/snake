import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { Announcement, HUD, getStatusText } from "../../src/components/HUD";
import {
  createDefaultSettings,
  createPlayerEffects,
  GameState,
} from "../../src/engine/types";

function makeGameState(): GameState {
  return {
    phase: "playing",
    board: { width: 20, height: 20 },
    players: [
      {
        snake: {
          segments: [{ x: 2, y: 2 }],
          direction: "right",
          growPending: false,
          alive: true,
        },
        score: 4,
        effects: createPlayerEffects(),
      },
      {
        snake: {
          segments: [{ x: 10, y: 10 }],
          direction: "left",
          growPending: false,
          alive: true,
        },
        score: 7,
        effects: createPlayerEffects(),
      },
    ],
    food: { position: { x: 5, y: 5 }, kind: "normal", spawnIndex: 1 },
    tickRate: 8,
    settings: createDefaultSettings(),
    elapsedMs: 5_000,
  };
}

describe("HUD", () => {
  it("shows active invincibility and slowdown status text", () => {
    const state = makeGameState();
    state.players[0].effects.invincibleUntilMs = 17_000;
    state.players[0].effects.slowUntilMs = 8_000;

    expect(getStatusText(state, 0)).toBe("Invincible 12s | Slowed 3s");
  });

  it("renders player statuses in the HUD", () => {
    const state = makeGameState();
    state.players[0].effects.slowUntilMs = 9_000;
    const markup = renderToStaticMarkup(HUD({ gameState: state }));

    expect(markup).toContain("P1: 4");
    expect(markup).toContain("P2: 7");
    expect(markup).toContain("Slowed 4s");
    expect(markup).toContain("Normal");
  });

  it("renders an active announcement banner above the scores", () => {
    const state = makeGameState();
    const announcement: Announcement = {
      text: "P1 smashed P2",
      tone: "hit",
      expiresAt: 7_000,
    };

    const markup = renderToStaticMarkup(
      HUD({ gameState: state, announcement }),
    );

    expect(markup).toContain("announcement-banner hit");
    expect(markup).toContain("P1 smashed P2");
  });
});
