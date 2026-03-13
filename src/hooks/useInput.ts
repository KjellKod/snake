import { useEffect, useRef } from 'react';
import { Direction } from '../engine/types';
import { mapKeyToDirection, resolveDirection, isGameKey } from '../engine/input';

export interface InputState {
  player1Dir: Direction | null;
  player2Dir: Direction | null;
}

export function useInput(
  player1CurrentDir: Direction,
  player2CurrentDir: Direction,
  enabled: boolean
): React.MutableRefObject<InputState> {
  const inputRef = useRef<InputState>({ player1Dir: null, player2Dir: null });
  const currentDirsRef = useRef({ p1: player1CurrentDir, p2: player2CurrentDir });

  // Keep current directions up to date
  currentDirsRef.current = { p1: player1CurrentDir, p2: player2CurrentDir };

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

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enabled]);

  return inputRef;
}
