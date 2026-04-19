import { useEffect, useRef } from "react";
import { Direction, Position } from "../engine/types";
import {
  mapKeyToDirection,
  resolveDirection,
  isGameKey,
} from "../engine/input";

export interface InputState {
  player1Dir: Direction | null;
  player2Dir: Direction | null;
}

export interface TouchContext {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  player1Head: Position;
  boardWidth: number;
  boardHeight: number;
}

/** Return [primary, secondary] directions based on touch relative to head. */
export function directionsFromTouch(
  touchCanvasX: number,
  touchCanvasY: number,
  headCanvasX: number,
  headCanvasY: number,
  cellSize: number,
): [Direction, Direction | null] | null {
  const dx = touchCanvasX - headCanvasX;
  const dy = touchCanvasY - headCanvasY;

  const deadZone = cellSize * 0.25;

  // Ignore taps very close to the head (within a quarter cell)
  if (Math.abs(dx) < deadZone && Math.abs(dy) < deadZone) return null;

  const horizontal: Direction = dx > 0 ? "right" : "left";
  const vertical: Direction = dy > 0 ? "down" : "up";

  if (Math.abs(dx) > Math.abs(dy)) {
    const secondary = Math.abs(dy) < deadZone ? null : vertical;
    return [horizontal, secondary];
  } else {
    const secondary = Math.abs(dx) < deadZone ? null : horizontal;
    return [vertical, secondary];
  }
}

export function useInput(
  player1CurrentDir: Direction,
  player2CurrentDir: Direction,
  enabled: boolean,
  touchContext?: TouchContext,
): React.MutableRefObject<InputState> {
  const inputRef = useRef<InputState>({ player1Dir: null, player2Dir: null });
  const currentDirsRef = useRef({
    p1: player1CurrentDir,
    p2: player2CurrentDir,
  });
  const touchContextRef = useRef(touchContext);

  // Keep current directions and touch context up to date
  currentDirsRef.current = { p1: player1CurrentDir, p2: player2CurrentDir };
  touchContextRef.current = touchContext;

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (isGameKey(e.code)) {
        e.preventDefault();
      }

      const p1Dir = mapKeyToDirection(e.code, 1);
      if (p1Dir !== null) {
        const resolved = resolveDirection(p1Dir, currentDirsRef.current.p1);
        if (resolved !== null) {
          inputRef.current.player1Dir = resolved;
        }
      }

      const p2Dir = mapKeyToDirection(e.code, 2);
      if (p2Dir !== null) {
        const resolved = resolveDirection(p2Dir, currentDirsRef.current.p2);
        if (resolved !== null) {
          inputRef.current.player2Dir = resolved;
        }
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      const ctx = touchContextRef.current;
      if (!ctx) return;

      const canvas = ctx.canvasRef.current;
      if (!canvas) return;

      const touch = e.touches[0];
      const rect = canvas.getBoundingClientRect();

      // Ignore touches outside the canvas
      if (
        touch.clientX < rect.left ||
        touch.clientX > rect.right ||
        touch.clientY < rect.top ||
        touch.clientY > rect.bottom
      )
        return;

      e.preventDefault();

      // Touch position relative to the canvas display area
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      const touchCanvasX = (touch.clientX - rect.left) * scaleX;
      const touchCanvasY = (touch.clientY - rect.top) * scaleY;

      // Snake head center in canvas pixels
      const cellW = canvas.width / ctx.boardWidth;
      const cellH = canvas.height / ctx.boardHeight;
      const headPixelX = (ctx.player1Head.x + 0.5) * cellW;
      const headPixelY = (ctx.player1Head.y + 0.5) * cellH;

      const dirs = directionsFromTouch(
        touchCanvasX,
        touchCanvasY,
        headPixelX,
        headPixelY,
        Math.min(cellW, cellH),
      );

      if (dirs !== null) {
        const currentDir = currentDirsRef.current.p1;
        // Try primary direction; fall back to secondary if it's opposite to current
        // and a secondary direction was actually intended (i.e. non-null minor axis).
        const primary = resolveDirection(dirs[0], currentDir);
        const secondary =
          dirs[1] !== null ? resolveDirection(dirs[1], currentDir) : null;
        const resolved = primary ?? secondary;
        if (resolved !== null) {
          inputRef.current.player1Dir = resolved;
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    document.addEventListener("touchstart", handleTouchStart, {
      passive: false,
    });

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("touchstart", handleTouchStart);
    };
  }, [enabled]);

  return inputRef;
}
