import { Direction } from './types';
import { isOppositeDirection } from './snake';

const PLAYER1_KEYS: Record<string, Direction> = {
  KeyW: 'up',
  KeyA: 'left',
  KeyS: 'down',
  KeyD: 'right',
};

const PLAYER2_KEYS: Record<string, Direction> = {
  ArrowUp: 'up',
  ArrowLeft: 'left',
  ArrowDown: 'down',
  ArrowRight: 'right',
};

export function mapKeyToDirection(code: string, player: 1 | 2): Direction | null {
  const map = player === 1 ? PLAYER1_KEYS : PLAYER2_KEYS;
  return map[code] ?? null;
}

export function resolveDirection(
  newDir: Direction,
  currentDir: Direction
): Direction | null {
  if (isOppositeDirection(currentDir, newDir)) {
    return null;
  }
  return newDir;
}

export type InputBuffer = {
  player1: Direction | null;
  player2: Direction | null;
};

export function createInputBuffer(): InputBuffer {
  return { player1: null, player2: null };
}

const GAME_KEYS = new Set([
  'KeyW', 'KeyA', 'KeyS', 'KeyD',
  'ArrowUp', 'ArrowLeft', 'ArrowDown', 'ArrowRight',
]);

export function isGameKey(code: string): boolean {
  return GAME_KEYS.has(code);
}
