import { useCallback, useRef } from "react";
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
  const invincibilityTimerRef = useRef<number | null>(null);

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
    if (settings.musicMode === "off") {
      setSfxGainLevel(0);
    } else {
      setSfxGainLevel(sfxLevelToGain(settings.sfxLevel));
    }
  }, []);

  const scheduleInvincibilityEnd = useCallback((remainingMs: number) => {
    if (invincibilityTimerRef.current !== null) {
      clearTimeout(invincibilityTimerRef.current);
    }
    invincibilityTimerRef.current = window.setTimeout(() => {
      invincibilityTimerRef.current = null;
      if (isInvincibilityMusicActive()) {
        stopInvincibilityMusic();
      }
    }, remainingMs);
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
          const player = state.players[event.player];
          const remainingMs = player.effects.invincibleUntilMs - state.elapsedMs;
          scheduleInvincibilityEnd(remainingMs);
        }
        break;
      case "game-over":
        if (!muted) playGameOverSound();
        if (invincibilityTimerRef.current !== null) {
          clearTimeout(invincibilityTimerRef.current);
          invincibilityTimerRef.current = null;
        }
        stopMusic();
        break;
    }
  }, [scheduleInvincibilityEnd]);

  const startGameAudio = useCallback(
    (settings: GameSettings) => {
      ensureAudio();
      applySettings(settings);
      startMusic(settings.musicMode);
    },
    [applySettings, ensureAudio],
  );

  const stopGameAudio = useCallback(() => {
    if (invincibilityTimerRef.current !== null) {
      clearTimeout(invincibilityTimerRef.current);
      invincibilityTimerRef.current = null;
    }
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
