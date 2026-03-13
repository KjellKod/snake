import { useEffect, useRef } from 'react';
import { Direction, Position } from '../engine/types';
import { mapKeyToDirection, resolveDirection, isGameKey } from '../engine/input';

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

function directionFromTouchRelativeToHead(
  touchCanvasX: number,
  touchCanvasY: number,
  headCanvasX: number,
  headCanvasY: number,
  cellSize: number
): Direction | null {
  const dx = touchCanvasX - headCanvasX;
  const dy = touchCanvasY - headCanvasY;

  // Ignore taps too close to the head (within half a cell)
  if (Math.abs(dx) < cellSize * 0.5 && Math.abs(dy) < cellSize * 0.5) return null;

  if (Math.abs(dx) > Math.abs(dy)) {
    return dx > 0 ? 'right' : 'left';
  } else {
    return dy > 0 ? 'down' : 'up';
  }
}

export function useInput(
  player1CurrentDir: Direction,
  player2CurrentDir: Direction,
  enabled: boolean,
  touchContext?: TouchContext
): React.MutableRefObject<InputState> {
  const inputRef = useRef<InputState>({ player1Dir: null, player2Dir: null });
  const currentDirsRef = useRef({ p1: player1CurrentDir, p2: player2CurrentDir });
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

      e.preventDefault();

      const touch = e.touches[0];
      const rect = canvas.getBoundingClientRect();

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

      const dir = directionFromTouchRelativeToHead(
        touchCanvasX, touchCanvasY,
        headPixelX, headPixelY,
        Math.min(cellW, cellH)
      );

      if (dir !== null) {
        const resolved = resolveDirection(dir, currentDirsRef.current.p1);
        if (resolved !== null) {
          inputRef.current.player1Dir = resolved;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('touchstart', handleTouchStart, { passive: false });

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('touchstart', handleTouchStart);
    };
  }, [enabled]);

  return inputRef;
}
