import { useRef, useCallback, useEffect, useState } from 'react';
import { GameState, TickInputs, GameEvent } from '../engine/types';
import { createInitialState, tick } from '../engine/gameLoop';
import { useInput } from './useInput';

export interface GameLoopCallbacks {
  onEvent: (event: GameEvent, state: GameState) => void;
}

export function useGameLoop(callbacks: GameLoopCallbacks) {
  const [gameState, setGameState] = useState<GameState>(() => createInitialState());
  const stateRef = useRef(gameState);
  const rafRef = useRef<number>(0);
  const lastTickRef = useRef<number>(0);
  const runningRef = useRef(false);

  const isPlaying = gameState.phase === 'playing';

  const inputRef = useInput(
    gameState.players[0].snake.direction,
    gameState.players[1].snake.direction,
    isPlaying
  );

  // Keep stateRef in sync
  stateRef.current = gameState;

  const loop = useCallback((timestamp: number) => {
    if (!runningRef.current) return;

    const state = stateRef.current;
    if (state.phase !== 'playing') {
      rafRef.current = requestAnimationFrame(loop);
      return;
    }

    const tickInterval = 1000 / state.tickRate;
    if (timestamp - lastTickRef.current >= tickInterval) {
      lastTickRef.current = timestamp;

      const inputs: TickInputs = {
        directions: [inputRef.current.player1Dir, inputRef.current.player2Dir],
      };

      // Clear input buffer after reading
      inputRef.current.player1Dir = null;
      inputRef.current.player2Dir = null;

      const result = tick(state, inputs);
      stateRef.current = result.state;
      setGameState(result.state);

      for (const event of result.events) {
        callbacks.onEvent(event, result.state);
      }
    }

    rafRef.current = requestAnimationFrame(loop);
  }, [callbacks, inputRef]);

  const start = useCallback(() => {
    const newState = createInitialState();
    stateRef.current = newState;
    setGameState(newState);
    lastTickRef.current = 0;
    runningRef.current = true;
    rafRef.current = requestAnimationFrame(loop);
  }, [loop]);

  const stop = useCallback(() => {
    runningRef.current = false;
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      runningRef.current = false;
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  return { gameState, start, stop };
}
