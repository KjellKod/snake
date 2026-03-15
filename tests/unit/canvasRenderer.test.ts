import { describe, expect, it } from "vitest";
import {
  getFoodRenderState,
  getSnakeRenderState,
} from "../../src/rendering/canvasRenderer";
import { createPlayerEffects, PlayerState } from "../../src/engine/types";

function makePlayer(): PlayerState {
  return {
    snake: {
      segments: [{ x: 1, y: 1 }],
      direction: "right",
      growPending: false,
      alive: true,
    },
    score: 0,
    effects: createPlayerEffects(),
  };
}

describe("getFoodRenderState", () => {
  it("renders power-up food larger than normal food", () => {
    const normal = getFoodRenderState("normal", 0.25, 20);
    const powerUp = getFoodRenderState("power-up", 0.25, 20);

    expect(powerUp.radius).toBeGreaterThan(normal.radius);
    expect(powerUp.color).not.toBe(normal.color);
    expect(powerUp.glow).not.toBe(normal.glow);
  });
});

describe("getSnakeRenderState", () => {
  it("blinks slowed snakes by lowering alpha on alternating intervals", () => {
    const player = makePlayer();
    player.effects.slowUntilMs = 5_000;

    expect(getSnakeRenderState(player, 120, 0).alpha).toBe(0.35);
    expect(getSnakeRenderState(player, 480, 0).alpha).toBe(1);
  });

  it("uses the invincibility treatment when active", () => {
    const player = makePlayer();
    player.effects.invincibleUntilMs = 10_000;

    const renderState = getSnakeRenderState(player, 2_000, 1);

    expect(renderState.color).toBe("#ffffff");
    expect(renderState.glow).toBe("rgba(255, 255, 255, 0.95)");
    expect(renderState.headHighlight).toBe("#ff00ff");
  });
});
