import { Direction, Position, Snake } from './types';

export function createSnake(startPos: Position, direction: Direction): Snake {
  return {
    segments: [startPos],
    direction,
    growPending: false,
    alive: true,
  };
}

export function moveSnake(snake: Snake, direction: Direction): Snake {
  if (!snake.alive) return snake;

  const head = snake.segments[0];
  const delta = directionDelta(direction);
  const newHead: Position = { x: head.x + delta.x, y: head.y + delta.y };

  const newSegments = snake.growPending
    ? [newHead, ...snake.segments]
    : [newHead, ...snake.segments.slice(0, -1)];

  return {
    segments: newSegments,
    direction,
    growPending: false,
    alive: snake.alive,
  };
}

export function growSnake(snake: Snake): Snake {
  return { ...snake, growPending: true };
}

export function checkSelfCollision(snake: Snake): boolean {
  const head = snake.segments[0];
  return snake.segments.slice(1).some((s) => s.x === head.x && s.y === head.y);
}

export function isOppositeDirection(current: Direction, next: Direction): boolean {
  const opposites: Record<Direction, Direction> = {
    up: 'down',
    down: 'up',
    left: 'right',
    right: 'left',
  };
  return opposites[current] === next;
}

function directionDelta(direction: Direction): Position {
  switch (direction) {
    case 'up':    return { x: 0, y: -1 };
    case 'down':  return { x: 0, y: 1 };
    case 'left':  return { x: -1, y: 0 };
    case 'right': return { x: 1, y: 0 };
  }
}
