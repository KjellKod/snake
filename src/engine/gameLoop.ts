import {
  GameState,
  TickInputs,
  TickResult,
  GameEvent,
  GameSettings,
  FoodState,
  PlayerState,
  MonoSpeed,
  createDefaultSettings,
  createPlayerEffects,
  isPlayerInvincible,
  isPlayerSlowed,
} from "./types";
import { moveSnake, growSnake, checkSelfCollision } from "./snake";
import { isOutOfBounds, spawnFood, wrapPosition } from "./board";
import { createBoard } from "./board";
import { createSnake } from "./snake";

const DEFAULT_BOARD_WIDTH = 20;
const DEFAULT_BOARD_HEIGHT = 20;
const BASE_TICK_RATE = 8;
const MAX_TICK_RATE = 12;
const SLOW_TICK_RATE = 4;
const MEDIUM_TICK_RATE = 6;
const SLOWDOWN_DURATION_MS = 15_000;
const INVINCIBILITY_DURATION_MS = 15_000;
const POWER_UP_INTERVAL = 10;

export function createInitialState(
  settings: GameSettings = createDefaultSettings(),
): GameState {
  const board = createBoard(DEFAULT_BOARD_WIDTH, DEFAULT_BOARD_HEIGHT);
  const snake1 = createSnake({ x: 3, y: 10 }, "right");
  const snake2 = createSnake({ x: 16, y: 10 }, "left");
  const players: [PlayerState, PlayerState] = [
    { snake: snake1, score: 0, effects: createPlayerEffects() },
    { snake: snake2, score: 0, effects: createPlayerEffects() },
  ];

  return {
    phase: "playing",
    board,
    players,
    food: spawnFoodState(board, players, settings, 1),
    tickRate: BASE_TICK_RATE,
    settings,
    elapsedMs: 0,
  };
}

export function tick(
  state: GameState,
  inputs: TickInputs,
  deltaMs = 1000 / state.tickRate,
): TickResult {
  if (state.phase !== "playing") {
    return { state, events: [] };
  }

  const elapsedMs = state.elapsedMs + deltaMs;
  const events: GameEvent[] = [];
  const newPlayers = clonePlayers(state.players);

  for (let i = 0; i < newPlayers.length; i++) {
    newPlayers[i] = advancePlayer(
      newPlayers[i],
      inputs.directions[i],
      state,
      elapsedMs,
    );
  }

  const killFlags = [false, false];
  const collisionIndices = [
    getOtherSnakeCollisionIndex(newPlayers[0], newPlayers[1]),
    getOtherSnakeCollisionIndex(newPlayers[1], newPlayers[0]),
  ] as const;
  const headOnHead = isHeadOnHead(newPlayers);

  for (let i = 0; i < newPlayers.length; i++) {
    const player = newPlayers[i];
    if (!player.snake.alive) continue;

    const invincible = isPlayerInvincible(player, elapsedMs);
    if (isOutOfBounds(player.snake.segments[0], state.board) && !invincible) {
      killFlags[i] = true;
      continue;
    }

    if (checkSelfCollision(player.snake) && !invincible) {
      killFlags[i] = true;
      continue;
    }

    if (!state.settings.otherSnakeLethal) {
      continue;
    }

    if (headOnHead && !invincible) {
      killFlags[i] = true;
      continue;
    }

    if (collisionIndices[i] !== -1 && !invincible) {
      killFlags[i] = true;
    }
  }

  for (let i = 0; i < killFlags.length; i++) {
    if (!killFlags[i]) continue;
    newPlayers[i] = {
      ...newPlayers[i],
      snake: { ...newPlayers[i].snake, alive: false },
    };
    events.push({ type: "player-died", player: i });
  }

  if (!state.settings.otherSnakeLethal) {
    if (headOnHead) {
      applySlowdown(newPlayers, 0, elapsedMs, events);
      applySlowdown(newPlayers, 1, elapsedMs, events);
    } else {
      for (let i = 0; i < collisionIndices.length; i++) {
        if (collisionIndices[i] === -1 || !newPlayers[i].snake.alive) continue;
        applySlowdown(newPlayers, i === 0 ? 1 : 0, elapsedMs, events, i);
      }
    }
  }

  let currentFood = state.food;
  for (let i = 0; i < newPlayers.length; i++) {
    const player = newPlayers[i];
    if (!player.snake.alive) continue;

    const head = player.snake.segments[0];
    if (!samePosition(head, currentFood.position)) continue;

    let updatedPlayer: PlayerState = {
      ...player,
      snake: growSnake(player.snake),
      score: player.score + 1,
    };
    events.push({
      type: "food-eaten",
      player: i,
      position: currentFood.position,
      kind: currentFood.kind,
    });

    if (currentFood.kind === "power-up") {
      updatedPlayer = {
        ...updatedPlayer,
        effects: {
          ...updatedPlayer.effects,
          invincibleUntilMs: elapsedMs + INVINCIBILITY_DURATION_MS,
        },
      };
      events.push({
        type: "effect-applied",
        player: i,
        effect: "invincibility",
      });
    }

    newPlayers[i] = updatedPlayer;
    currentFood = spawnFoodState(
      state.board,
      newPlayers,
      state.settings,
      currentFood.spawnIndex + 1,
    );
  }

  const bothDead = !newPlayers[0].snake.alive && !newPlayers[1].snake.alive;
  const totalLength =
    newPlayers[0].snake.segments.length + newPlayers[1].snake.segments.length;
  const speedBoost = Math.floor(totalLength / 5) * 0.5;
  const tickRate = computeTickRate(state.settings.monoSpeed, speedBoost);

  const nextState: GameState = {
    ...state,
    players: [newPlayers[0], newPlayers[1]],
    food: currentFood,
    phase: bothDead ? "game-over" : "playing",
    tickRate,
    elapsedMs,
  };

  if (bothDead) {
    events.push({ type: "game-over" });
  }

  return { state: nextState, events };
}

function advancePlayer(
  player: PlayerState,
  nextDirection: TickInputs["directions"][number],
  state: GameState,
  elapsedMs: number,
): PlayerState {
  if (!player.snake.alive) {
    return player;
  }

  const direction = nextDirection ?? player.snake.direction;
  const slowed = isPlayerSlowed(player, elapsedMs);
  const shouldMove = !slowed || player.effects.slowMoveOnNextTick;
  const effects = slowed
    ? {
        ...player.effects,
        slowMoveOnNextTick: !player.effects.slowMoveOnNextTick,
      }
    : { ...player.effects, slowMoveOnNextTick: true };

  let snake = shouldMove
    ? moveSnake(player.snake, direction)
    : { ...player.snake, direction };
  const invincible = isPlayerInvincible(player, elapsedMs);
  if (
    isOutOfBounds(snake.segments[0], state.board) &&
    (invincible || !state.settings.wallsLethal)
  ) {
    snake = {
      ...snake,
      segments: [
        wrapPosition(snake.segments[0], state.board),
        ...snake.segments.slice(1),
      ],
    };
  }

  return {
    ...player,
    snake,
    effects,
  };
}

function spawnFoodState(
  board: GameState["board"],
  players: GameState["players"],
  settings: GameSettings,
  spawnIndex: number,
): FoodState {
  const occupied = players.flatMap((player) => player.snake.segments);
  return {
    position: spawnFood(board, occupied),
    kind:
      settings.powerUpsEnabled && spawnIndex % POWER_UP_INTERVAL === 0
        ? "power-up"
        : "normal",
    spawnIndex,
  };
}

function applySlowdown(
  players: [PlayerState, PlayerState],
  playerIndex: number,
  elapsedMs: number,
  events: GameEvent[],
  sourcePlayer?: number,
): void {
  const player = players[playerIndex];
  if (!player.snake.alive || isPlayerInvincible(player, elapsedMs)) {
    return;
  }

  players[playerIndex] = {
    ...player,
    effects: {
      ...player.effects,
      slowUntilMs: elapsedMs + SLOWDOWN_DURATION_MS,
      slowMoveOnNextTick: true,
    },
  };
  events.push({
    type: "effect-applied",
    player: playerIndex,
    effect: "slowdown",
    sourcePlayer,
  });
}

function clonePlayers(
  players: GameState["players"],
): [PlayerState, PlayerState] {
  return players.map((player) => ({
    ...player,
    snake: {
      ...player.snake,
      segments: player.snake.segments.map((segment) => ({ ...segment })),
    },
    effects: { ...player.effects },
  })) as [PlayerState, PlayerState];
}

function getOtherSnakeCollisionIndex(
  player: PlayerState,
  otherPlayer: PlayerState,
): number {
  if (!player.snake.alive || !otherPlayer.snake.alive) {
    return -1;
  }

  const head = player.snake.segments[0];
  return otherPlayer.snake.segments.findIndex((segment) =>
    samePosition(segment, head),
  );
}

function isHeadOnHead(players: [PlayerState, PlayerState]): boolean {
  if (!players[0].snake.alive || !players[1].snake.alive) {
    return false;
  }

  return samePosition(
    players[0].snake.segments[0],
    players[1].snake.segments[0],
  );
}

function computeTickRate(monoSpeed: MonoSpeed, speedBoost: number): number {
  switch (monoSpeed) {
    case "slow": return SLOW_TICK_RATE;
    case "medium": return MEDIUM_TICK_RATE;
    case "fast": return BASE_TICK_RATE;
    case "accelerating": return Math.min(SLOW_TICK_RATE + speedBoost, MAX_TICK_RATE);
  }
}

function samePosition(
  a: { x: number; y: number },
  b: { x: number; y: number },
): boolean {
  return a.x === b.x && a.y === b.y;
}

export {
  BASE_TICK_RATE,
  MAX_TICK_RATE,
  SLOW_TICK_RATE,
  MEDIUM_TICK_RATE,
  SLOWDOWN_DURATION_MS,
  INVINCIBILITY_DURATION_MS,
  POWER_UP_INTERVAL,
};
