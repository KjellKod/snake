import { getAudioContext, getMusicGain } from "./audioEngine";
import { MusicMode } from "../engine/types";

interface MusicModeConfig {
  bassNotes: number[];
  leadNotes: number[];
  bassType: OscillatorType;
  leadType: OscillatorType;
  baseBpm: number;
  maxBpm: number;
}

let musicNodes: {
  timeoutId: number | null;
} | null = null;

let currentMode: MusicMode = "neon-arcade";
let currentBpm = 120;
let currentIntensity = 0;
let beatIndex = 0;

const MODE_CONFIG: Record<Exclude<MusicMode, "off">, MusicModeConfig> = {
  "neon-arcade": {
    bassNotes: [65.41, 73.42, 82.41, 77.78],
    leadNotes: [261.63, 293.66, 329.63, 311.13, 261.63, 349.23, 329.63, 293.66],
    bassType: "triangle",
    leadType: "square",
    baseBpm: 120,
    maxBpm: 200,
  },
  "space-inspired": {
    bassNotes: [55.0, 65.41, 58.27, 73.42],
    leadNotes: [220.0, 246.94, 261.63, 293.66, 329.63, 293.66],
    bassType: "sine",
    leadType: "triangle",
    baseBpm: 100,
    maxBpm: 172,
  },
  "8-bit": {
    bassNotes: [65.41, 82.41, 98.0, 123.47],
    leadNotes: [523.25, 659.25, 587.33, 698.46, 523.25, 783.99],
    bassType: "square",
    leadType: "square",
    baseBpm: 132,
    maxBpm: 210,
  },
  "techno-trance": {
    bassNotes: [61.74, 61.74, 73.42, 82.41],
    leadNotes: [246.94, 293.66, 329.63, 369.99, 329.63, 293.66],
    bassType: "sawtooth",
    leadType: "sawtooth",
    baseBpm: 126,
    maxBpm: 208,
  },
};

export function tickRateToMusicParams(
  tickRate: number,
  baseTick: number,
  maxTick: number,
  mode: MusicMode = currentMode,
): { bpm: number; intensity: number } {
  const clampedMode = mode === "off" ? "neon-arcade" : mode;
  const config = MODE_CONFIG[clampedMode];
  const t = Math.max(
    0,
    Math.min(1, (tickRate - baseTick) / (maxTick - baseTick)),
  );
  return {
    bpm: config.baseBpm + t * (config.maxBpm - config.baseBpm),
    intensity: t,
  };
}

export function startMusic(mode: MusicMode): void {
  currentMode = mode;
  stopMusic();

  if (mode === "off") {
    return;
  }

  const ctx = getAudioContext();
  const musicGain = getMusicGain();
  if (!ctx || !musicGain) return;

  try {
    musicNodes = { timeoutId: null };
    beatIndex = 0;
    currentIntensity = 0;
    currentBpm = MODE_CONFIG[mode].baseBpm;
    scheduleBeat();
  } catch {
    // Silent fallback
  }
}

export function updateMusicTempo(
  tickRate: number,
  baseTick: number,
  maxTick: number,
  mode: MusicMode = currentMode,
): void {
  if (mode === "off") return;
  const params = tickRateToMusicParams(tickRate, baseTick, maxTick, mode);
  currentMode = mode;
  currentBpm = params.bpm;
  currentIntensity = params.intensity;
}

export function stopMusic(): void {
  if (!musicNodes) return;
  if (musicNodes.timeoutId !== null) {
    clearTimeout(musicNodes.timeoutId);
  }
  beatIndex = 0;
  musicNodes = null;
}

function scheduleBeat(): void {
  if (!musicNodes || currentMode === "off") return;

  const playBeat = () => {
    if (!musicNodes || currentMode === "off") return;
    const ctx2 = getAudioContext();
    const gainNode = getMusicGain();
    if (!ctx2 || !gainNode) return;

    const config = MODE_CONFIG[currentMode];

    try {
      const bassOsc = ctx2.createOscillator();
      const bassGain = ctx2.createGain();
      const bassNote = config.bassNotes[beatIndex % config.bassNotes.length];
      bassOsc.type = config.bassType;
      bassOsc.frequency.setValueAtTime(bassNote, ctx2.currentTime);
      bassOsc.frequency.exponentialRampToValueAtTime(
        bassNote * 0.5,
        ctx2.currentTime + 0.1,
      );
      bassGain.gain.setValueAtTime(
        0.2 + currentIntensity * 0.18,
        ctx2.currentTime,
      );
      bassGain.gain.exponentialRampToValueAtTime(
        0.001,
        ctx2.currentTime + 0.15,
      );
      bassOsc.connect(bassGain);
      bassGain.connect(gainNode);
      bassOsc.start(ctx2.currentTime);
      bassOsc.stop(ctx2.currentTime + 0.15);

      if (beatIndex % (currentIntensity > 0.35 ? 1 : 2) === 0) {
        const bufferSize = Math.floor(ctx2.sampleRate * 0.03);
        const buffer = ctx2.createBuffer(1, bufferSize, ctx2.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
        }
        const hatSource = ctx2.createBufferSource();
        const hatGain = ctx2.createGain();
        hatSource.buffer = buffer;
        hatGain.gain.setValueAtTime(
          0.06 + currentIntensity * 0.12,
          ctx2.currentTime,
        );
        hatGain.gain.exponentialRampToValueAtTime(
          0.001,
          ctx2.currentTime + 0.03,
        );
        hatSource.connect(hatGain);
        hatGain.connect(gainNode);
        hatSource.start(ctx2.currentTime);
      }

      if (currentIntensity > 0.15) {
        const leadOsc = ctx2.createOscillator();
        const leadGain = ctx2.createGain();
        const leadNote = config.leadNotes[beatIndex % config.leadNotes.length];
        leadOsc.type = config.leadType;
        leadOsc.frequency.setValueAtTime(leadNote, ctx2.currentTime);
        leadGain.gain.setValueAtTime(
          0.05 + currentIntensity * 0.12,
          ctx2.currentTime,
        );
        leadGain.gain.exponentialRampToValueAtTime(
          0.001,
          ctx2.currentTime + 0.08,
        );
        leadOsc.connect(leadGain);
        leadGain.connect(gainNode);
        leadOsc.start(ctx2.currentTime);
        leadOsc.stop(ctx2.currentTime + 0.08);
      }

      beatIndex++;
    } catch {
      // Silent fallback
    }
  };

  const scheduleNext = () => {
    if (!musicNodes) return;
    const beatInterval = 60000 / currentBpm / 2;
    musicNodes.timeoutId = window.setTimeout(() => {
      playBeat();
      scheduleNext();
    }, beatInterval);
  };

  playBeat();
  scheduleNext();
}

export function isMusicPlaying(): boolean {
  return musicNodes !== null;
}
