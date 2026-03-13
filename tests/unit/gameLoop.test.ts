import { describe, it, expect } from 'vitest';
import { createInitialState, tick } from '../../src/engine/gameLoop';
import { GameState, TickInputs } from '../../src/engine/types';

function makeState(overrides?: Partial<GameState>): GameState {
  const base = createInitialState();
  return { ...base, ...overrides };
}

describe('createInitialState', () => {
  it('creates a state with two alive players', () => {
    const state = createInitialState();
    expect(state.phase).toBe('playing');
    expect(state.players[0].snake.alive).toBe(true);
    expect(state.players[1].snake.alive).toBe(true);
    expect(state.players[0].score).toBe(0);
    expect(state.players[1].score).toBe(0);
  });

  it('places food on the board', () => {
    const state = createInitialState();
    expect(state.food.x).toBeGreaterThanOrEqual(0);
    expect(state.food.x).toBeLessThan(state.board.width);
    expect(state.food.y).toBeGreaterThanOrEqual(0);
    expect(state.food.y).toBeLessThan(state.board.height);
  });
});

describe('tick', () => {
  it('advances snake position', () => {
    const state = createInitialState();
    const inputs: TickInputs = { directions: [null, null] };
    const result = tick(state, inputs);

    // Player 1 starts at x:3, direction right -> head should be at x:4
    expect(result.state.players[0].snake.segments[0].x).toBe(4);
    // Player 2 starts at x:16, direction left -> head should be at x:15
    expect(result.state.players[1].snake.segments[0].x).toBe(15);
  });

  it('does not process ticks when not in playing phase', () => {
    const state = makeState({ phase: 'game-over' });
    const inputs: TickInputs = { directions: [null, null] };
    const result = tick(state, inputs);
    expect(result.state).toBe(state);
    expect(result.events).toHaveLength(0);
  });

  it('eating food increments score and grows snake', () => {
    // Place food directly in front of player 1
    const state = createInitialState();
    const p1Head = state.players[0].snake.segments[0];
    const foodPos = { x: p1Head.x + 1, y: p1Head.y };
    const stateWithFood = { ...state, food: foodPos };

    const inputs: TickInputs = { directions: [null, null] };
    const result = tick(stateWithFood, inputs);

    expect(result.state.players[0].score).toBe(1);
    expect(result.state.players[0].snake.growPending).toBe(true);
    expect(result.events.some(e => e.type === 'food-eaten' && e.player === 0)).toBe(true);
  });

  it('wall collision marks player dead', () => {
    const state = createInitialState();
    // Move player 1 to the right edge
    state.players[0].snake.segments = [{ x: 19, y: 10 }];
    state.players[0].snake.direction = 'right';

    const inputs: TickInputs = { directions: [null, null] };
    const result = tick(state, inputs);

    expect(result.state.players[0].snake.alive).toBe(false);
    expect(result.events.some(e => e.type === 'player-died' && e.player === 0)).toBe(true);
  });

  it('self collision marks player dead', () => {
    const state = createInitialState();
    // Create a snake that will collide with itself
    state.players[0].snake.segments = [
      { x: 5, y: 5 }, { x: 6, y: 5 }, { x: 6, y: 6 }, { x: 5, y: 6 }, { x: 4, y: 6 },
    ];
    state.players[0].snake.direction = 'down';

    const inputs: TickInputs = { directions: ['down', null] };
    const result = tick(state, inputs);

    // Head moves to (5, 6) which is occupied by segment at index 3
    expect(result.state.players[0].snake.alive).toBe(false);
    expect(result.events.some(e => e.type === 'player-died' && e.player === 0)).toBe(true);
  });

  it('snake collision with body marks only the colliding player dead', () => {
    const state = createInitialState();
    // Player 1 head will land on player 2's body (not head)
    state.players[0].snake.segments = [{ x: 9, y: 10 }];
    state.players[0].snake.direction = 'right';
    state.players[1].snake.segments = [{ x: 10, y: 9 }, { x: 10, y: 10 }, { x: 10, y: 11 }];
    state.players[1].snake.direction = 'up';

    const inputs: TickInputs = { directions: [null, null] };
    const result = tick(state, inputs);

    expect(result.state.players[0].snake.alive).toBe(false);
    expect(result.state.players[1].snake.alive).toBe(true);
    expect(result.events.some(e => e.type === 'player-died' && e.player === 0)).toBe(true);
  });

  it('head-on-head collision kills both players', () => {
    const state = createInitialState();
    // Set up snakes moving toward each other, heads will meet at (5, 5)
    state.players[0].snake.segments = [{ x: 4, y: 5 }, { x: 3, y: 5 }];
    state.players[0].snake.direction = 'right';
    state.players[1].snake.segments = [{ x: 6, y: 5 }, { x: 7, y: 5 }];
    state.players[1].snake.direction = 'left';

    const inputs: TickInputs = { directions: [null, null] };
    const result = tick(state, inputs);

    expect(result.state.players[0].snake.alive).toBe(false);
    expect(result.state.players[1].snake.alive).toBe(false);
    expect(result.events.some(e => e.type === 'player-died' && e.player === 0)).toBe(true);
    expect(result.events.some(e => e.type === 'player-died' && e.player === 1)).toBe(true);
    expect(result.events.some(e => e.type === 'game-over')).toBe(true);
  });

  it('one player dead while other continues playing', () => {
    const state = createInitialState();
    state.players[0].snake = { ...state.players[0].snake, alive: false };

    const inputs: TickInputs = { directions: [null, null] };
    const result = tick(state, inputs);

    expect(result.state.phase).toBe('playing');
    expect(result.state.players[0].snake.alive).toBe(false);
    expect(result.state.players[1].snake.alive).toBe(true);
  });

  it('both dead transitions to game over', () => {
    const state = createInitialState();
    // Both at right wall
    state.players[0].snake.segments = [{ x: 19, y: 5 }];
    state.players[0].snake.direction = 'right';
    state.players[1].snake.segments = [{ x: 19, y: 15 }];
    state.players[1].snake.direction = 'right';

    const inputs: TickInputs = { directions: [null, null] };
    const result = tick(state, inputs);

    expect(result.state.phase).toBe('game-over');
    expect(result.state.players[0].snake.alive).toBe(false);
    expect(result.state.players[1].snake.alive).toBe(false);
    expect(result.events.some(e => e.type === 'game-over')).toBe(true);
  });

  it('respects direction input from players', () => {
    const state = createInitialState();
    const inputs: TickInputs = { directions: ['up', 'down'] };
    const result = tick(state, inputs);

    // Player 1 was going right, now goes up: y decreases
    expect(result.state.players[0].snake.segments[0].y).toBe(
      state.players[0].snake.segments[0].y - 1
    );
    // Player 2 was going left, now goes down: y increases
    expect(result.state.players[1].snake.segments[0].y).toBe(
      state.players[1].snake.segments[0].y + 1
    );
  });
});
