export type Direction = 'up' | 'down' | 'left' | 'right';

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

export interface PlayerState {
  snake: Snake;
  score: number;
}

export type GamePhase = 'start' | 'playing' | 'game-over';

export interface GameState {
  phase: GamePhase;
  board: Board;
  players: [PlayerState, PlayerState];
  food: Position;
  tickRate: number;
}

export interface TickInputs {
  directions: [Direction | null, Direction | null];
}

export interface TickResult {
  state: GameState;
  events: GameEvent[];
}

export type GameEvent =
  | { type: 'food-eaten'; player: number; position: Position }
  | { type: 'player-died'; player: number }
  | { type: 'game-over' };
