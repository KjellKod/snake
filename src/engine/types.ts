export type Direction = "up" | "down" | "left" | "right";
export type MusicMode =
  | "off"
  | "drums-only"
  | "sfx-only"
  | "neon-arcade"
  | "space-inspired"
  | "8-bit"
  | "techno-trance";
export type SfxLevel = "default" | "low" | "high";
export type FoodKind = "normal" | "power-up";

export interface Position {
  x: number;
  y: number;
}

export interface Snake {
  segments: Position[];
  direction: Direction;
  growPending: boolean;
  alive: boolean;
}

export interface Board {
  width: number;
  height: number;
}

export interface PlayerEffects {
  slowUntilMs: number;
  invincibleUntilMs: number;
  slowMoveOnNextTick: boolean;
}

export interface PlayerState {
  snake: Snake;
  score: number;
  effects: PlayerEffects;
}

export type GamePhase = "start" | "playing" | "game-over";

export interface GameSettings {
  musicMode: MusicMode;
  sfxLevel: SfxLevel;
  wallsLethal: boolean;
  otherSnakeLethal: boolean;
  powerUpsEnabled: boolean;
  monoSpeed: boolean;
}

export interface FoodState {
  position: Position;
  kind: FoodKind;
  spawnIndex: number;
}

export interface GameState {
  phase: GamePhase;
  board: Board;
  players: [PlayerState, PlayerState];
  food: FoodState;
  tickRate: number;
  settings: GameSettings;
  elapsedMs: number;
}

export interface TickInputs {
  directions: [Direction | null, Direction | null];
}

export interface TickResult {
  state: GameState;
  events: GameEvent[];
}

export type GameEvent =
  | { type: "food-eaten"; player: number; position: Position; kind: FoodKind }
  | { type: "player-died"; player: number }
  | {
      type: "effect-applied";
      player: number;
      effect: "slowdown" | "invincibility";
      sourcePlayer?: number;
    }
  | { type: "game-over" };

export function createDefaultSettings(): GameSettings {
  return {
    musicMode: "neon-arcade",
    sfxLevel: "default",
    wallsLethal: true,
    otherSnakeLethal: true,
    powerUpsEnabled: false,
    monoSpeed: false,
  };
}

export function createPlayerEffects(): PlayerEffects {
  return {
    slowUntilMs: 0,
    invincibleUntilMs: 0,
    slowMoveOnNextTick: true,
  };
}

export function isPlayerInvincible(
  player: PlayerState,
  elapsedMs: number,
): boolean {
  return player.effects.invincibleUntilMs > elapsedMs;
}

export function isPlayerSlowed(
  player: PlayerState,
  elapsedMs: number,
): boolean {
  return player.effects.slowUntilMs > elapsedMs;
}
