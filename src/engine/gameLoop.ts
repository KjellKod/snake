import { GameState, TickInputs, TickResult, GameEvent, Direction } from './types';
import { moveSnake, growSnake, checkSelfCollision } from './snake';
import { isOutOfBounds, spawnFood, checkSnakeCollision } from './board';
import { createBoard } from './board';
import { createSnake } from './snake';

const DEFAULT_BOARD_WIDTH = 20;
const DEFAULT_BOARD_HEIGHT = 20;
const BASE_TICK_RATE = 8;
const MAX_TICK_RATE = 12;

export function createInitialState(): GameState {
  const board = createBoard(DEFAULT_BOARD_WIDTH, DEFAULT_BOARD_HEIGHT);
  const snake1 = createSnake({ x: 3, y: 10 }, 'right');
  const snake2 = createSnake({ x: 16, y: 10 }, 'left');

  const allSegments = [...snake1.segments, ...snake2.segments];
  const food = spawnFood(board, allSegments);

  return {
    phase: 'playing',
    board,
    players: [
      { snake: snake1, score: 0 },
      { snake: snake2, score: 0 },
    ],
    food,
    tickRate: BASE_TICK_RATE,
  };
}

export function tick(state: GameState, inputs: TickInputs): TickResult {
  if (state.phase !== 'playing') {
    return { state, events: [] };
  }

  const events: GameEvent[] = [];
  let newState = { ...state };
  const newPlayers = [...state.players] as [typeof state.players[0], typeof state.players[1]];

  // Move each living player
  for (let i = 0; i < 2; i++) {
    const player = newPlayers[i];
    if (!player.snake.alive) continue;

    const dir = inputs.directions[i] ?? player.snake.direction;
    const movedSnake = moveSnake(player.snake, dir);
    newPlayers[i] = { ...player, snake: movedSnake };
  }

  // Detect head-on-head collision before sequential processing
  const head0 = newPlayers[0].snake.segments[0];
  const head1 = newPlayers[1].snake.segments[0];
  const headOnHead = newPlayers[0].snake.alive && newPlayers[1].snake.alive &&
    head0.x === head1.x && head0.y === head1.y;

  // Check collisions for each living player
  const killFlags = [false, false];
  for (let i = 0; i < 2; i++) {
    const player = newPlayers[i];
    if (!player.snake.alive) continue;

    const otherIndex = i === 0 ? 1 : 0;

    // Wall collision
    if (isOutOfBounds(player.snake.segments[0], state.board)) {
      killFlags[i] = true;
      continue;
    }

    // Self collision
    if (checkSelfCollision(player.snake)) {
      killFlags[i] = true;
      continue;
    }

    // Head-on-head collision: both die
    if (headOnHead) {
      killFlags[i] = true;
      continue;
    }

    // Collision with other snake (body)
    if (checkSnakeCollision(player.snake, newPlayers[otherIndex].snake)) {
      killFlags[i] = true;
      continue;
    }
  }

  // Apply deaths after all collision checks
  for (let i = 0; i < 2; i++) {
    if (killFlags[i]) {
      newPlayers[i] = { ...newPlayers[i], snake: { ...newPlayers[i].snake, alive: false } };
      events.push({ type: 'player-died', player: i });
    }
  }

  // Check food consumption for living players
  let currentFood = state.food;
  for (let i = 0; i < 2; i++) {
    const player = newPlayers[i];
    if (!player.snake.alive) continue;

    const head = player.snake.segments[0];
    if (head.x === currentFood.x && head.y === currentFood.y) {
      const grownSnake = growSnake(player.snake);
      newPlayers[i] = { ...player, snake: grownSnake, score: player.score + 1 };
      events.push({ type: 'food-eaten', player: i, position: currentFood });

      const allSegments = [
        ...newPlayers[0].snake.segments,
        ...newPlayers[1].snake.segments,
      ];
      currentFood = spawnFood(state.board, allSegments);
    }
  }

  // Check if both players are dead
  const bothDead = !newPlayers[0].snake.alive && !newPlayers[1].snake.alive;

  // Calculate dynamic tick rate based on total snake length
  const totalLength = newPlayers[0].snake.segments.length + newPlayers[1].snake.segments.length;
  const speedBoost = Math.floor(totalLength / 5) * 0.5;
  const newTickRate = Math.min(BASE_TICK_RATE + speedBoost, MAX_TICK_RATE);

  newState = {
    ...newState,
    players: [newPlayers[0], newPlayers[1]],
    food: currentFood,
    phase: bothDead ? 'game-over' : 'playing',
    tickRate: newTickRate,
  };

  if (bothDead) {
    events.push({ type: 'game-over' });
  }

  return { state: newState, events };
}

export { BASE_TICK_RATE, MAX_TICK_RATE };
