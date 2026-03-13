import { describe, it, expect } from 'vitest';
import { createBoard, isOutOfBounds, spawnFood, checkSnakeCollision } from '../../src/engine/board';

describe('createBoard', () => {
  it('creates a board with given dimensions', () => {
    const board = createBoard(20, 15);
    expect(board.width).toBe(20);
    expect(board.height).toBe(15);
  });
});

describe('isOutOfBounds', () => {
  const board = createBoard(20, 20);

  it('returns true for negative x', () => {
    expect(isOutOfBounds({ x: -1, y: 5 }, board)).toBe(true);
  });

  it('returns true for negative y', () => {
    expect(isOutOfBounds({ x: 5, y: -1 }, board)).toBe(true);
  });

  it('returns true for x at board width', () => {
    expect(isOutOfBounds({ x: 20, y: 5 }, board)).toBe(true);
  });

  it('returns true for y at board height', () => {
    expect(isOutOfBounds({ x: 5, y: 20 }, board)).toBe(true);
  });

  it('returns false for position inside the board', () => {
    expect(isOutOfBounds({ x: 0, y: 0 }, board)).toBe(false);
    expect(isOutOfBounds({ x: 19, y: 19 }, board)).toBe(false);
    expect(isOutOfBounds({ x: 10, y: 10 }, board)).toBe(false);
  });
});

describe('spawnFood', () => {
  it('returns a position not in the occupied list', () => {
    const board = createBoard(3, 3);
    // Occupy all but one cell
    const occupied = [
      { x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 },
      { x: 0, y: 1 }, { x: 1, y: 1 }, { x: 2, y: 1 },
      { x: 0, y: 2 }, { x: 1, y: 2 },
      // leave (2,2) free
    ];
    const food = spawnFood(board, occupied);
    expect(food).toEqual({ x: 2, y: 2 });
  });

  it('returns a position within board bounds', () => {
    const board = createBoard(20, 20);
    const food = spawnFood(board, []);
    expect(food.x).toBeGreaterThanOrEqual(0);
    expect(food.x).toBeLessThan(20);
    expect(food.y).toBeGreaterThanOrEqual(0);
    expect(food.y).toBeLessThan(20);
  });

  it('handles an empty board with no occupied positions', () => {
    const board = createBoard(5, 5);
    const food = spawnFood(board, []);
    expect(food.x).toBeGreaterThanOrEqual(0);
    expect(food.y).toBeGreaterThanOrEqual(0);
  });
});

describe('checkSnakeCollision', () => {
  it('detects when head of snake A hits body of snake B', () => {
    const snakeA = {
      segments: [{ x: 5, y: 5 }, { x: 4, y: 5 }],
      direction: 'right' as const,
      growPending: false,
      alive: true,
    };
    const snakeB = {
      segments: [{ x: 5, y: 4 }, { x: 5, y: 5 }, { x: 5, y: 6 }],
      direction: 'up' as const,
      growPending: false,
      alive: true,
    };
    expect(checkSnakeCollision(snakeA, snakeB)).toBe(true);
  });

  it('returns false when snakes do not overlap', () => {
    const snakeA = {
      segments: [{ x: 1, y: 1 }, { x: 0, y: 1 }],
      direction: 'right' as const,
      growPending: false,
      alive: true,
    };
    const snakeB = {
      segments: [{ x: 10, y: 10 }, { x: 10, y: 11 }],
      direction: 'up' as const,
      growPending: false,
      alive: true,
    };
    expect(checkSnakeCollision(snakeA, snakeB)).toBe(false);
  });

  it('returns false when other snake is dead', () => {
    const snakeA = {
      segments: [{ x: 5, y: 5 }],
      direction: 'right' as const,
      growPending: false,
      alive: true,
    };
    const snakeB = {
      segments: [{ x: 5, y: 5 }],
      direction: 'up' as const,
      growPending: false,
      alive: false,
    };
    expect(checkSnakeCollision(snakeA, snakeB)).toBe(false);
  });
});
