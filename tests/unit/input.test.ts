import { describe, it, expect } from 'vitest';
import { mapKeyToDirection, resolveDirection, isGameKey, createInputBuffer } from '../../src/engine/input';

describe('mapKeyToDirection', () => {
  it('maps WASD keys to correct directions for player 1', () => {
    expect(mapKeyToDirection('KeyW', 1)).toBe('up');
    expect(mapKeyToDirection('KeyA', 1)).toBe('left');
    expect(mapKeyToDirection('KeyS', 1)).toBe('down');
    expect(mapKeyToDirection('KeyD', 1)).toBe('right');
  });

  it('maps arrow keys to correct directions for player 2', () => {
    expect(mapKeyToDirection('ArrowUp', 2)).toBe('up');
    expect(mapKeyToDirection('ArrowLeft', 2)).toBe('left');
    expect(mapKeyToDirection('ArrowDown', 2)).toBe('down');
    expect(mapKeyToDirection('ArrowRight', 2)).toBe('right');
  });

  it('returns null for non-game keys', () => {
    expect(mapKeyToDirection('Space', 1)).toBe(null);
    expect(mapKeyToDirection('KeyZ', 2)).toBe(null);
  });

  it('returns null when player 1 keys are used with player 2 mapping', () => {
    expect(mapKeyToDirection('KeyW', 2)).toBe(null);
  });

  it('returns null when player 2 keys are used with player 1 mapping', () => {
    expect(mapKeyToDirection('ArrowUp', 1)).toBe(null);
  });
});

describe('resolveDirection', () => {
  it('allows perpendicular direction change', () => {
    expect(resolveDirection('up', 'right')).toBe('up');
    expect(resolveDirection('left', 'down')).toBe('left');
  });

  it('allows same direction', () => {
    expect(resolveDirection('up', 'up')).toBe('up');
  });

  it('rejects opposite direction (reverse)', () => {
    expect(resolveDirection('down', 'up')).toBe(null);
    expect(resolveDirection('left', 'right')).toBe(null);
    expect(resolveDirection('up', 'down')).toBe(null);
    expect(resolveDirection('right', 'left')).toBe(null);
  });
});

describe('isGameKey', () => {
  it('returns true for WASD and arrow keys', () => {
    expect(isGameKey('KeyW')).toBe(true);
    expect(isGameKey('KeyA')).toBe(true);
    expect(isGameKey('KeyS')).toBe(true);
    expect(isGameKey('KeyD')).toBe(true);
    expect(isGameKey('ArrowUp')).toBe(true);
    expect(isGameKey('ArrowDown')).toBe(true);
    expect(isGameKey('ArrowLeft')).toBe(true);
    expect(isGameKey('ArrowRight')).toBe(true);
  });

  it('returns false for non-game keys', () => {
    expect(isGameKey('Space')).toBe(false);
    expect(isGameKey('Enter')).toBe(false);
  });
});

describe('createInputBuffer', () => {
  it('creates a buffer with null directions', () => {
    const buffer = createInputBuffer();
    expect(buffer.player1).toBe(null);
    expect(buffer.player2).toBe(null);
  });
});
