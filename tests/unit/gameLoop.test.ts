import { describe, it, expect } from "vitest";
import {
  createInitialState,
  tick,
  BASE_TICK_RATE,
  MEDIUM_TICK_RATE,
  SLOW_TICK_RATE,
  INVINCIBILITY_DURATION_MS,
  POWER_UP_INTERVAL,
  SLOWDOWN_DURATION_MS,
} from "../../src/engine/gameLoop";
import {
  GameSettings,
  GameState,
  TickInputs,
  createDefaultSettings,
  createPlayerEffects,
} from "../../src/engine/types";

function makeState(
  overrides?: Partial<GameState>,
  settings?: Partial<GameSettings>,
): GameState {
  const base = createInitialState({ ...createDefaultSettings(), ...settings });
  return { ...base, ...overrides };
}

function move(
  state: GameState,
  directions: TickInputs["directions"] = [null, null],
  deltaMs = 125,
) {
  return tick(state, { directions }, deltaMs);
}

describe("createInitialState", () => {
  it("creates a state with two alive players and default settings", () => {
    const state = createInitialState();

    expect(state.phase).toBe("playing");
    expect(state.settings).toEqual(createDefaultSettings());
    expect(state.players[0].snake.alive).toBe(true);
    expect(state.players[1].snake.alive).toBe(true);
    expect(state.food.spawnIndex).toBe(1);
    expect(state.food.kind).toBe("normal");
  });

  it("applies selected mono speed to the initial tick rate", () => {
    expect(
      createInitialState({ ...createDefaultSettings(), monoSpeed: "slow" }).tickRate,
    ).toBe(SLOW_TICK_RATE);
    expect(
      createInitialState({ ...createDefaultSettings(), monoSpeed: "medium" }).tickRate,
    ).toBe(MEDIUM_TICK_RATE);
    expect(
      createInitialState({ ...createDefaultSettings(), monoSpeed: "fast" }).tickRate,
    ).toBe(BASE_TICK_RATE);
    expect(
      createInitialState({ ...createDefaultSettings(), monoSpeed: "accelerating" }).tickRate,
    ).toBe(SLOW_TICK_RATE);
  });
});

describe("tick with settings and power-ups", () => {
  it("with default settings preserves lethal rules and normal food spawns", () => {
    const state = makeState(undefined, { powerUpsEnabled: false });
    state.players[0].snake.segments = [{ x: 19, y: 10 }];
    state.players[0].snake.direction = "right";
    state.players[1].snake.segments = [
      { x: 6, y: 5 },
      { x: 7, y: 5 },
    ];
    state.players[1].snake.direction = "left";
    state.food = {
      position: { x: 4, y: 10 },
      kind: "normal",
      spawnIndex: POWER_UP_INTERVAL - 1,
    };

    const result = move(state);

    expect(result.state.players[0].snake.alive).toBe(false);
    expect(result.events).toContainEqual({ type: "player-died", player: 0 });
    expect(result.state.food.kind).toBe("normal");
    expect(result.state.settings.wallsLethal).toBe(true);
    expect(result.state.settings.otherSnakeLethal).toBe(true);
    expect(result.state.settings.monoSpeed).toBe("slow");
  });

  it("keeps the base tick rate when mono speed is set to fast", () => {
    const state = makeState(undefined, { monoSpeed: "fast" });
    state.players[0].snake.segments = Array.from(
      { length: 12 },
      (_, index) => ({
        x: 3 + index,
        y: 10,
      }),
    );
    state.players[1].snake.segments = Array.from(
      { length: 10 },
      (_, index) => ({
        x: 16 - index,
        y: 12,
      }),
    );

    const result = move(state);

    expect(result.state.tickRate).toBe(8);
  });

  it("keeps the slow tick rate when mono speed is set to slow", () => {
    const state = makeState(undefined, { monoSpeed: "slow" });
    state.players[0].snake.segments = Array.from(
      { length: 12 },
      (_, index) => ({
        x: 3 + index,
        y: 10,
      }),
    );
    state.players[1].snake.segments = Array.from(
      { length: 10 },
      (_, index) => ({
        x: 16 - index,
        y: 12,
      }),
    );

    const result = move(state);

    expect(result.state.tickRate).toBe(4);
  });

  it("keeps the medium tick rate when mono speed is set to medium", () => {
    const state = makeState(undefined, { monoSpeed: "medium" });
    state.players[0].snake.segments = Array.from(
      { length: 12 },
      (_, index) => ({
        x: 3 + index,
        y: 10,
      }),
    );
    state.players[1].snake.segments = Array.from(
      { length: 10 },
      (_, index) => ({
        x: 16 - index,
        y: 12,
      }),
    );

    const result = move(state);

    expect(result.state.tickRate).toBe(6);
  });

  it("accelerates tick rate when mono speed is set to accelerating", () => {
    const state = makeState(undefined, { monoSpeed: "accelerating" });
    state.players[0].snake.segments = Array.from(
      { length: 12 },
      (_, index) => ({
        x: 3 + index,
        y: 10,
      }),
    );
    state.players[1].snake.segments = Array.from(
      { length: 10 },
      (_, index) => ({
        x: 16 - index,
        y: 12,
      }),
    );

    const result = move(state);

    expect(result.state.tickRate).toBeGreaterThan(4);
  });

  it("wraps a snake at the board edge when walls are non-lethal", () => {
    const state = makeState(undefined, { wallsLethal: false });
    state.players[0].snake.segments = [{ x: 19, y: 10 }];
    state.players[0].snake.direction = "right";

    const result = move(state);

    expect(result.state.players[0].snake.alive).toBe(true);
    expect(result.state.players[0].snake.segments[0]).toEqual({ x: 0, y: 10 });
  });

  it("wraps an invincible snake through lethal walls", () => {
    const state = makeState();
    state.players[0].snake.segments = [{ x: 19, y: 10 }];
    state.players[0].snake.direction = "right";
    state.players[0].effects.invincibleUntilMs = 5_000;

    const result = move(state, [null, null], 1_000);

    expect(result.state.players[0].snake.alive).toBe(true);
    expect(result.state.players[0].snake.segments[0]).toEqual({ x: 0, y: 10 });
    expect(result.state.players[0].effects.invincibleUntilMs).toBe(5_000);
  });

  it("keeps lethal other-snake collisions intact when enabled", () => {
    const state = makeState();
    state.players[0].snake.segments = [{ x: 9, y: 10 }];
    state.players[0].snake.direction = "right";
    state.players[1].snake.segments = [
      { x: 10, y: 9 },
      { x: 10, y: 10 },
      { x: 10, y: 11 },
    ];

    const result = move(state);

    expect(result.state.players[0].snake.alive).toBe(false);
    expect(result.state.players[1].snake.alive).toBe(true);
  });

  it("lets an invincible snake survive lethal other-snake contact", () => {
    const state = makeState();
    state.players[0].snake.segments = [{ x: 9, y: 10 }];
    state.players[0].snake.direction = "right";
    state.players[0].effects.invincibleUntilMs = 10_000;
    state.players[1].snake.segments = [
      { x: 10, y: 9 },
      { x: 10, y: 10 },
      { x: 10, y: 11 },
    ];

    const result = move(state, [null, null], 1_000);

    expect(result.state.players[0].snake.alive).toBe(true);
    expect(result.state.players[1].snake.alive).toBe(true);
    expect(
      result.events.some(
        (event) => event.type === "player-died" && event.player === 0,
      ),
    ).toBe(false);
  });

  it("applies slowdown to the impacted player in non-lethal other-snake collisions", () => {
    const state = makeState(undefined, { otherSnakeLethal: false });
    state.players[0].snake.segments = [{ x: 9, y: 10 }];
    state.players[0].snake.direction = "right";
    state.players[1].snake.segments = [
      { x: 10, y: 9 },
      { x: 10, y: 10 },
      { x: 10, y: 11 },
    ];

    const result = move(state, [null, null], 1_000);

    expect(result.state.players[0].snake.alive).toBe(true);
    expect(result.state.players[1].snake.alive).toBe(true);
    expect(result.state.players[1].effects.slowUntilMs).toBe(
      1_000 + SLOWDOWN_DURATION_MS,
    );
    expect(result.events).toContainEqual({
      type: "effect-applied",
      player: 1,
      effect: "slowdown",
      sourcePlayer: 0,
    });
  });

  it("applies slowdown to both players in non-lethal head-to-head collisions", () => {
    const state = makeState(undefined, { otherSnakeLethal: false });
    state.players[0].snake.segments = [
      { x: 4, y: 5 },
      { x: 3, y: 5 },
    ];
    state.players[0].snake.direction = "right";
    state.players[1].snake.segments = [
      { x: 6, y: 5 },
      { x: 7, y: 5 },
    ];
    state.players[1].snake.direction = "left";

    const result = move(state, [null, null], 1_000);

    expect(result.state.players[0].snake.alive).toBe(true);
    expect(result.state.players[1].snake.alive).toBe(true);
    expect(result.state.players[0].effects.slowUntilMs).toBe(
      1_000 + SLOWDOWN_DURATION_MS,
    );
    expect(result.state.players[1].effects.slowUntilMs).toBe(
      1_000 + SLOWDOWN_DURATION_MS,
    );
  });

  it("does not apply slowdown to an invincible player", () => {
    const state = makeState(undefined, { otherSnakeLethal: false });
    state.players[0].snake.segments = [{ x: 9, y: 10 }];
    state.players[0].snake.direction = "right";
    state.players[1].snake.segments = [
      { x: 10, y: 9 },
      { x: 10, y: 10 },
      { x: 10, y: 11 },
    ];
    state.players[1].effects.invincibleUntilMs = 10_000;

    const result = move(state, [null, null], 1_000);

    expect(result.state.players[1].effects.slowUntilMs).toBe(0);
    expect(
      result.events.some(
        (event) =>
          event.type === "effect-applied" && event.effect === "slowdown",
      ),
    ).toBe(false);
  });

  it("moves slowed snakes at half cadence until the penalty expires", () => {
    const state = makeState();
    state.players[0].effects = {
      ...createPlayerEffects(),
      slowUntilMs: 15_000,
      slowMoveOnNextTick: true,
    };

    const firstTick = move(state, [null, null], 1_000);
    const secondTick = move(firstTick.state, [null, null], 1_000);
    const thirdTick = move(secondTick.state, [null, null], 14_500);

    expect(firstTick.state.players[0].snake.segments[0]).toEqual({
      x: 4,
      y: 10,
    });
    expect(secondTick.state.players[0].snake.segments[0]).toEqual({
      x: 4,
      y: 10,
    });
    expect(thirdTick.state.players[0].snake.segments[0]).toEqual({
      x: 5,
      y: 10,
    });
  });

  it("grants invincibility from every 10th spawned snack and refreshes the timer on recollect", () => {
    const state = makeState(undefined, { powerUpsEnabled: true });
    state.food = {
      position: { x: 4, y: 10 },
      kind: "power-up",
      spawnIndex: POWER_UP_INTERVAL,
    };

    const firstPickup = move(state, [null, null], 1_000);

    expect(firstPickup.state.players[0].score).toBe(1);
    expect(firstPickup.state.players[0].effects.invincibleUntilMs).toBe(
      1_000 + INVINCIBILITY_DURATION_MS,
    );
    expect(firstPickup.events).toContainEqual({
      type: "effect-applied",
      player: 0,
      effect: "invincibility",
    });

    firstPickup.state.food = {
      position: { x: 5, y: 10 },
      kind: "power-up",
      spawnIndex: POWER_UP_INTERVAL * 2,
    };
    const refreshedPickup = move(firstPickup.state, [null, null], 5_000);

    expect(refreshedPickup.state.players[0].effects.invincibleUntilMs).toBe(
      firstPickup.state.elapsedMs + 5_000 + INVINCIBILITY_DURATION_MS,
    );
  });

  it("marks every 10th spawned snack as a power-up when enabled", () => {
    const state = makeState(undefined, { powerUpsEnabled: true });
    state.food = {
      position: { x: 4, y: 10 },
      kind: "normal",
      spawnIndex: POWER_UP_INTERVAL - 1,
    };

    const result = move(state);

    expect(result.state.food.spawnIndex).toBe(POWER_UP_INTERVAL);
    expect(result.state.food.kind).toBe("power-up");
  });

  it("lets invincible snakes survive walls and self-collision", () => {
    const state = makeState();
    state.elapsedMs = 1_000;
    state.players[0].effects.invincibleUntilMs = 10_000;
    state.players[0].snake.segments = [
      { x: 5, y: 5 },
      { x: 6, y: 5 },
      { x: 6, y: 6 },
      { x: 5, y: 6 },
      { x: 4, y: 6 },
    ];
    state.players[0].snake.direction = "down";

    const result = move(state, ["down", null], 1_000);

    expect(result.state.players[0].snake.alive).toBe(true);
    expect(
      result.events.some(
        (event) => event.type === "player-died" && event.player === 0,
      ),
    ).toBe(false);
  });
});
