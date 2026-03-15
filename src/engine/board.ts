import { Board, Position, Snake } from "./types";

export function createBoard(width: number, height: number): Board {
  return { width, height };
}

export function isOutOfBounds(pos: Position, board: Board): boolean {
  return (
    pos.x < 0 || pos.y < 0 || pos.x >= board.width || pos.y >= board.height
  );
}

export function wrapPosition(pos: Position, board: Board): Position {
  const x = ((pos.x % board.width) + board.width) % board.width;
  const y = ((pos.y % board.height) + board.height) % board.height;
  return { x, y };
}

export function spawnFood(
  board: Board,
  occupiedPositions: Position[],
): Position {
  const occupied = new Set(occupiedPositions.map((p) => `${p.x},${p.y}`));
  const free: Position[] = [];

  for (let x = 0; x < board.width; x++) {
    for (let y = 0; y < board.height; y++) {
      if (!occupied.has(`${x},${y}`)) {
        free.push({ x, y });
      }
    }
  }

  if (free.length === 0) {
    // Board is full; return a fallback position (should not happen in normal play)
    return { x: 0, y: 0 };
  }

  return free[Math.floor(Math.random() * free.length)];
}

export function checkSnakeCollision(
  headSnake: Snake,
  otherSnake: Snake,
): boolean {
  if (!otherSnake.alive) return false;
  const head = headSnake.segments[0];
  return otherSnake.segments.some((s) => s.x === head.x && s.y === head.y);
}
