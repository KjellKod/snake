import { useCallback } from "react";
import { initAudio, resumeAudio, setSfxGainLevel } from "../audio/audioEngine";
import { playEatSound, playCrashSound, playGameOverSound, playPowerUpSound } from "../audio/sfx";
import {
  startMusic,
  stopMusic,
  updateMusicTempo,
  startInvincibilityMusic,
  stopInvincibilityMusic,
  isInvincibilityMusicActive,
} from "../audio/music";
import { GameEvent, GameSettings, GameState, SfxLevel, isPlayerInvincible } from "../engine/types";
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

function anyPlayerInvincible(state: GameState): boolean {
  return state.players.some((p) => isPlayerInvincible(p, state.elapsedMs));
}

export function useAudio() {
  const ensureAudio = useCallback(() => {
    try {
      initAudio();
    } catch {
      // Audio not available
    }
    resumeAudio();
  }, []);

  const applySettings = useCallback((settings: GameSettings) => {
    if (settings.musicMode === "off") {
      setSfxGainLevel(0);
    } else {
      setSfxGainLevel(sfxLevelToGain(settings.sfxLevel));
    }
  }, []);

  const handleGameEvent = useCallback((event: GameEvent, state: GameState) => {
    const muted = state.settings.musicMode === "off";
    const musicEnabled =
      muted === false &&
      state.settings.musicMode !== "sfx-only";

    switch (event.type) {
      case "food-eaten":
        if (!muted) playEatSound();
        if (!isInvincibilityMusicActive()) {
          updateMusicTempo(
            state.tickRate,
            BASE_TICK_RATE,
            MAX_TICK_RATE,
            state.settings.musicMode,
          );
        }
        break;
      case "player-died":
        if (!muted) playCrashSound();
        break;
      case "effect-applied":
        if (event.effect === "invincibility") {
          if (!muted) playPowerUpSound();
          if (musicEnabled) {
            startInvincibilityMusic();
          }
        }
        break;
      case "game-over":
        if (!muted) playGameOverSound();
        stopMusic();
        break;
    }
  }, []);

  // Called every game tick (not during pause) to check invincibility expiry
  const checkInvincibilityExpiry = useCallback((state: GameState) => {
    if (isInvincibilityMusicActive() && !anyPlayerInvincible(state)) {
      stopInvincibilityMusic();
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
    checkInvincibilityExpiry,
    startGameAudio,
    stopGameAudio,
  };
}
