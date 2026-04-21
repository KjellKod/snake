import { describe, it, expect } from "vitest";
import { directionsFromTouch } from "../../src/hooks/useInput";

const CELL = 40;
const HEAD_X = 200;
const HEAD_Y = 200;

describe("directionsFromTouch", () => {
  it("returns null for taps within the dead zone", () => {
    expect(directionsFromTouch(HEAD_X + 5, HEAD_Y + 5, HEAD_X, HEAD_Y, CELL)).toBe(null);
  });

  it("returns primary and secondary for a diagonal tap", () => {
    const result = directionsFromTouch(HEAD_X + 80, HEAD_Y + 40, HEAD_X, HEAD_Y, CELL);
    expect(result).toEqual(["right", "down"]);
  });

  it("returns null secondary when tap is directly horizontal", () => {
    const result = directionsFromTouch(HEAD_X + 80, HEAD_Y, HEAD_X, HEAD_Y, CELL);
    expect(result).not.toBe(null);
    expect(result![0]).toBe("right");
    expect(result![1]).toBe(null);
  });

  it("returns null secondary when tap is directly vertical", () => {
    const result = directionsFromTouch(HEAD_X, HEAD_Y + 80, HEAD_X, HEAD_Y, CELL);
    expect(result).not.toBe(null);
    expect(result![0]).toBe("down");
    expect(result![1]).toBe(null);
  });

  it("returns null secondary when minor axis is within dead zone", () => {
    const result = directionsFromTouch(HEAD_X - 80, HEAD_Y + 5, HEAD_X, HEAD_Y, CELL);
    expect(result).not.toBe(null);
    expect(result![0]).toBe("left");
    expect(result![1]).toBe(null);
  });

  it("returns valid secondary when minor axis exceeds dead zone", () => {
    const result = directionsFromTouch(HEAD_X - 80, HEAD_Y + 30, HEAD_X, HEAD_Y, CELL);
    expect(result).not.toBe(null);
    expect(result![0]).toBe("left");
    expect(result![1]).toBe("down");
  });
});
