import { useCallback, useRef } from 'react';
import { initAudio, resumeAudio } from '../audio/audioEngine';
import { playEatSound, playCrashSound, playGameOverSound } from '../audio/sfx';
import { startMusic, stopMusic, updateMusicTempo } from '../audio/music';
import { GameEvent, GameState } from '../engine/types';
import { BASE_TICK_RATE, MAX_TICK_RATE } from '../engine/gameLoop';

export function useAudio() {
  const initializedRef = useRef(false);

  const ensureAudio = useCallback(() => {
    if (!initializedRef.current) {
      try {
        initAudio();
        initializedRef.current = true;
      } catch {
        // Audio not available
      }
    }
    resumeAudio();
  }, []);

  const handleGameEvent = useCallback((event: GameEvent, state: GameState) => {
    switch (event.type) {
      case 'food-eaten':
        playEatSound();
        updateMusicTempo(state.tickRate, BASE_TICK_RATE, MAX_TICK_RATE);
        break;
      case 'player-died':
        playCrashSound();
        break;
      case 'game-over':
        playGameOverSound();
        stopMusic();
        break;
    }
  }, []);

  const startGameAudio = useCallback(() => {
    ensureAudio();
    startMusic();
  }, [ensureAudio]);

  const stopGameAudio = useCallback(() => {
    stopMusic();
  }, []);

  return { ensureAudio, handleGameEvent, startGameAudio, stopGameAudio };
}
