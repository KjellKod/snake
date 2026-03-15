import { useCallback, useRef } from "react";
import { initAudio, resumeAudio, setSfxGainLevel } from "../audio/audioEngine";
import { playEatSound, playCrashSound, playGameOverSound } from "../audio/sfx";
import { startMusic, stopMusic, updateMusicTempo } from "../audio/music";
import { GameEvent, GameSettings, GameState, SfxLevel } from "../engine/types";
import { BASE_TICK_RATE, MAX_TICK_RATE } from "../engine/gameLoop";

function sfxLevelToGain(level: SfxLevel): number {
  switch (level) {
    case "low":
      return 0.55;
    case "high":
      return 1.35;
    case "default":
    default:
      return 1;
  }
}

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

  const applySettings = useCallback((settings: GameSettings) => {
    setSfxGainLevel(sfxLevelToGain(settings.sfxLevel));
  }, []);

  const handleGameEvent = useCallback((event: GameEvent, state: GameState) => {
    switch (event.type) {
      case "food-eaten":
        playEatSound();
        updateMusicTempo(
          state.tickRate,
          BASE_TICK_RATE,
          MAX_TICK_RATE,
          state.settings.musicMode,
        );
        break;
      case "player-died":
        playCrashSound();
        break;
      case "effect-applied":
        if (event.effect === "invincibility") {
          playEatSound();
        }
        break;
      case "game-over":
        playGameOverSound();
        stopMusic();
        break;
    }
  }, []);

  const startGameAudio = useCallback(
    (settings: GameSettings) => {
      ensureAudio();
      applySettings(settings);
      startMusic(settings.musicMode);
    },
    [applySettings, ensureAudio],
  );

  const stopGameAudio = useCallback(() => {
    stopMusic();
  }, []);

  return {
    ensureAudio,
    applySettings,
    handleGameEvent,
    startGameAudio,
    stopGameAudio,
  };
}
