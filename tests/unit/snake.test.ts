import { describe, it, expect } from "vitest";
import {
  createSnake,
  moveSnake,
  growSnake,
  checkSelfCollision,
  isOppositeDirection,
} from "../../src/engine/snake";

describe("createSnake", () => {
  it("creates a snake at the given position with given direction", () => {
    const snake = createSnake({ x: 5, y: 5 }, "right");
    expect(snake.segments).toEqual([{ x: 5, y: 5 }]);
    expect(snake.direction).toBe("right");
    expect(snake.alive).toBe(true);
    expect(snake.growPending).toBe(false);
  });
});

describe("moveSnake", () => {
  it("advances head in the right direction", () => {
    const snake = createSnake({ x: 5, y: 5 }, "right");
    const moved = moveSnake(snake, "right");
    expect(moved.segments[0]).toEqual({ x: 6, y: 5 });
  });

  it("advances head upward", () => {
    const snake = createSnake({ x: 5, y: 5 }, "up");
    const moved = moveSnake(snake, "up");
    expect(moved.segments[0]).toEqual({ x: 5, y: 4 });
  });

  it("advances head downward", () => {
    const snake = createSnake({ x: 5, y: 5 }, "down");
    const moved = moveSnake(snake, "down");
    expect(moved.segments[0]).toEqual({ x: 5, y: 6 });
  });

  it("advances head to the left", () => {
    const snake = createSnake({ x: 5, y: 5 }, "left");
    const moved = moveSnake(snake, "left");
    expect(moved.segments[0]).toEqual({ x: 4, y: 5 });
  });

  it("does not move a dead snake", () => {
    const snake = { ...createSnake({ x: 5, y: 5 }, "right"), alive: false };
    const moved = moveSnake(snake, "right");
    expect(moved.segments[0]).toEqual({ x: 5, y: 5 });
  });

  it("removes tail segment when not growing", () => {
    // Build a 3-segment snake manually
    const snake = {
      segments: [
        { x: 3, y: 0 },
        { x: 2, y: 0 },
        { x: 1, y: 0 },
      ],
      direction: "right" as const,
      growPending: false,
      alive: true,
    };
    const moved = moveSnake(snake, "right");
    expect(moved.segments).toEqual([
      { x: 4, y: 0 },
      { x: 3, y: 0 },
      { x: 2, y: 0 },
    ]);
  });
});

describe("growSnake", () => {
  it("flags the snake to grow on next move", () => {
    const snake = createSnake({ x: 5, y: 5 }, "right");
    const grown = growSnake(snake);
    expect(grown.growPending).toBe(true);
  });

  it("increases length after move when growPending is true", () => {
    const snake = {
      segments: [
        { x: 3, y: 0 },
        { x: 2, y: 0 },
      ],
      direction: "right" as const,
      growPending: true,
      alive: true,
    };
    const moved = moveSnake(snake, "right");
    expect(moved.segments).toHaveLength(3);
    expect(moved.segments).toEqual([
      { x: 4, y: 0 },
      { x: 3, y: 0 },
      { x: 2, y: 0 },
    ]);
    expect(moved.growPending).toBe(false);
  });
});

describe("checkSelfCollision", () => {
  it("returns false for a single-segment snake", () => {
    const snake = createSnake({ x: 5, y: 5 }, "right");
    expect(checkSelfCollision(snake)).toBe(false);
  });

  it("returns false when head does not overlap body", () => {
    const snake = {
      segments: [
        { x: 3, y: 0 },
        { x: 2, y: 0 },
        { x: 1, y: 0 },
      ],
      direction: "right" as const,
      growPending: false,
      alive: true,
    };
    expect(checkSelfCollision(snake)).toBe(false);
  });

  it("returns true when head overlaps a body segment", () => {
    const snake = {
      segments: [
        { x: 2, y: 0 },
        { x: 3, y: 0 },
        { x: 3, y: 1 },
        { x: 2, y: 1 },
        { x: 2, y: 0 },
      ],
      direction: "up" as const,
      growPending: false,
      alive: true,
    };
    expect(checkSelfCollision(snake)).toBe(true);
  });
});

describe("isOppositeDirection", () => {
  it("up is opposite of down", () => {
    expect(isOppositeDirection("up", "down")).toBe(true);
  });

  it("left is opposite of right", () => {
    expect(isOppositeDirection("left", "right")).toBe(true);
  });

  it("up is not opposite of left", () => {
    expect(isOppositeDirection("up", "left")).toBe(false);
  });

  it("same direction is not opposite", () => {
    expect(isOppositeDirection("up", "up")).toBe(false);
  });
});
