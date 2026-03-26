import { getAudioContext, getMusicGain } from "./audioEngine";
import { MusicMode } from "../engine/types";

interface PhraseStep {
  note: number | null;
  length: number;
  accent?: number;
  glide?: number;
}

interface ChordStep {
  notes: number[];
  length: number;
  accent?: number;
}

interface MusicModeConfig {
  bassPattern: number[];
  leadPhraseA: PhraseStep[];
  leadPhraseB: PhraseStep[];
  harmonyPattern: Array<ChordStep | null>;
  bassType: OscillatorType;
  leadType: OscillatorType;
  harmonyType: OscillatorType;
  baseBpm: number;
  maxBpm: number;
  swing: number;
  hatPattern: number[];
  kickPattern: number[];
  snarePattern: number[];
  bassLevel?: number;
  leadLevel?: number;
  harmonyLevel?: number;
  hatLevel?: number;
  hatTone?: number;
}

let musicNodes: {
  timeoutId: number | null;
} | null = null;

let currentMode: MusicMode = "neon-arcade";
let currentBpm = 120;
let currentIntensity = 0;
let stepIndex = 0;

export const MODE_CONFIG: Record<Exclude<MusicMode, "off" | "drums-only" | "sfx-only">, MusicModeConfig> = {
  "neon-arcade": {
    bassPattern: [65.41, 65.41, 73.42, 82.41, 77.78, 73.42, 82.41, 98.0],
    leadPhraseA: [
      { note: 523.25, length: 1, accent: 0.8 },
      { note: 659.25, length: 1, accent: 0.45 },
      { note: 783.99, length: 1, accent: 0.55 },
      { note: 659.25, length: 1, accent: 0.3 },
      { note: 698.46, length: 1, accent: 0.65 },
      { note: 659.25, length: 1, accent: 0.35 },
      { note: 587.33, length: 1, accent: 0.25 },
      { note: null, length: 1 },
    ],
    leadPhraseB: [
      { note: 523.25, length: 1, accent: 0.7 },
      { note: 659.25, length: 1, accent: 0.4 },
      { note: 880.0, length: 1, accent: 0.8 },
      { note: 783.99, length: 1, accent: 0.55 },
      { note: 698.46, length: 1, accent: 0.5 },
      { note: 659.25, length: 1, accent: 0.35 },
      { note: 587.33, length: 2, accent: 0.35, glide: 523.25 },
      { note: null, length: 1 },
    ],
    harmonyPattern: [
      { notes: [392.0, 523.25], length: 2, accent: 0.35 },
      null,
      { notes: [440.0, 587.33], length: 2, accent: 0.25 },
      null,
      { notes: [466.16, 622.25], length: 2, accent: 0.3 },
      null,
      { notes: [392.0, 523.25], length: 2, accent: 0.25 },
      null,
    ],
    bassType: "triangle",
    leadType: "square",
    harmonyType: "triangle",
    baseBpm: 122,
    maxBpm: 196,
    swing: 0.07,
    hatPattern: [1, 0, 1, 1, 1, 0, 1, 1],
    kickPattern: [1, 0, 0, 0, 1, 0, 1, 0],
    snarePattern: [0, 0, 1, 0, 0, 0, 1, 0],
  },
  "space-inspired": {
    bassPattern: [55.0, 55.0, 65.41, 58.27, 73.42, 65.41, 58.27, 49.0],
    leadPhraseA: [
      { note: 329.63, length: 2, accent: 0.45 },
      { note: 392.0, length: 1, accent: 0.3 },
      { note: 440.0, length: 1, accent: 0.3 },
      { note: 493.88, length: 2, accent: 0.55, glide: 523.25 },
      { note: 440.0, length: 1, accent: 0.25 },
      { note: 392.0, length: 1, accent: 0.2 },
      { note: null, length: 1 },
      { note: null, length: 1 },
    ],
    leadPhraseB: [
      { note: 329.63, length: 2, accent: 0.4 },
      { note: 392.0, length: 1, accent: 0.25 },
      { note: 523.25, length: 1, accent: 0.5 },
      { note: 587.33, length: 2, accent: 0.6, glide: 659.25 },
      { note: 523.25, length: 1, accent: 0.35 },
      { note: 440.0, length: 1, accent: 0.2 },
      { note: null, length: 1 },
      { note: null, length: 1 },
    ],
    harmonyPattern: [
      { notes: [220.0, 261.63], length: 3, accent: 0.2 },
      null,
      { notes: [246.94, 293.66], length: 3, accent: 0.18 },
      null,
      { notes: [261.63, 329.63], length: 3, accent: 0.2 },
      null,
      { notes: [220.0, 293.66], length: 2, accent: 0.16 },
      null,
    ],
    bassType: "sine",
    leadType: "triangle",
    harmonyType: "sine",
    baseBpm: 102,
    maxBpm: 168,
    swing: 0.03,
    hatPattern: [1, 0, 0, 1, 1, 0, 0, 1],
    kickPattern: [1, 0, 0, 0, 1, 0, 0, 0],
    snarePattern: [0, 0, 1, 0, 0, 0, 1, 0],
  },
  "8-bit": {
    bassPattern: [65.41, 82.41, 98.0, 123.47, 98.0, 82.41, 73.42, 65.41],
    leadPhraseA: [
      { note: 659.25, length: 1, accent: 0.65 },
      { note: 783.99, length: 1, accent: 0.45 },
      { note: 880.0, length: 1, accent: 0.55 },
      { note: 1046.5, length: 1, accent: 0.7 },
      { note: 880.0, length: 1, accent: 0.45 },
      { note: 783.99, length: 1, accent: 0.35 },
      { note: 698.46, length: 1, accent: 0.3 },
      { note: 783.99, length: 1, accent: 0.4 },
    ],
    leadPhraseB: [
      { note: 659.25, length: 1, accent: 0.65 },
      { note: 783.99, length: 1, accent: 0.45 },
      { note: 932.33, length: 1, accent: 0.55 },
      { note: 1174.66, length: 1, accent: 0.8 },
      { note: 1046.5, length: 1, accent: 0.55 },
      { note: 932.33, length: 1, accent: 0.35 },
      { note: 783.99, length: 1, accent: 0.25 },
      { note: 698.46, length: 1, accent: 0.25 },
    ],
    harmonyPattern: [
      { notes: [523.25, 659.25], length: 2, accent: 0.28 },
      null,
      { notes: [587.33, 698.46], length: 2, accent: 0.24 },
      null,
      { notes: [659.25, 783.99], length: 2, accent: 0.26 },
      null,
      { notes: [523.25, 659.25], length: 2, accent: 0.22 },
      null,
    ],
    bassType: "square",
    leadType: "square",
    harmonyType: "square",
    baseBpm: 112,
    maxBpm: 208,
    swing: 0,
    hatPattern: [1, 1, 1, 1, 1, 1, 1, 1],
    kickPattern: [1, 0, 0, 0, 1, 0, 0, 1],
    snarePattern: [0, 0, 1, 0, 0, 0, 1, 0],
  },
  "techno-trance": {
    bassPattern: [61.74, 61.74, 73.42, 82.41, 73.42, 61.74, 55.0, 61.74],
    leadPhraseA: [
      { note: 369.99, length: 1, accent: 0.35 },
      { note: null, length: 1 },
      { note: 415.3, length: 1, accent: 0.35 },
      { note: 493.88, length: 1, accent: 0.55 },
      { note: null, length: 1 },
      { note: 554.37, length: 1, accent: 0.65 },
      { note: 493.88, length: 1, accent: 0.45 },
      { note: 415.3, length: 1, accent: 0.3 },
    ],
    leadPhraseB: [
      { note: 369.99, length: 1, accent: 0.35 },
      { note: 415.3, length: 1, accent: 0.28 },
      { note: 493.88, length: 1, accent: 0.45 },
      { note: 554.37, length: 1, accent: 0.55 },
      { note: 622.25, length: 1, accent: 0.65 },
      { note: 554.37, length: 1, accent: 0.45 },
      { note: 493.88, length: 1, accent: 0.35 },
      { note: 415.3, length: 1, accent: 0.25 },
    ],
    harmonyPattern: [
      { notes: [246.94, 369.99], length: 2, accent: 0.24 },
      null,
      { notes: [293.66, 415.3], length: 2, accent: 0.22 },
      null,
      { notes: [329.63, 493.88], length: 2, accent: 0.26 },
      null,
      { notes: [293.66, 415.3], length: 2, accent: 0.2 },
      null,
    ],
    bassType: "triangle",
    leadType: "triangle",
    harmonyType: "triangle",
    baseBpm: 128,
    maxBpm: 204,
    swing: 0.04,
    hatPattern: [1, 0, 1, 0, 1, 1, 1, 0],
    kickPattern: [1, 0, 1, 0, 1, 0, 1, 0],
    snarePattern: [0, 0, 1, 0, 0, 0, 1, 0],
    bassLevel: 0.9,
    leadLevel: 0.72,
    harmonyLevel: 0.85,
    hatLevel: 0.68,
    hatTone: 5200,
  },
};

export function tickRateToMusicParams(
  tickRate: number,
  baseTick: number,
  maxTick: number,
  mode: MusicMode = currentMode,
): { bpm: number; intensity: number } {
  const clampedMode =
    mode === "off" || mode === "drums-only" || mode === "sfx-only"
      ? "neon-arcade"
      : mode;
  const config = MODE_CONFIG[clampedMode];
  const denominator = Math.max(1, maxTick - baseTick);
  const t = Math.max(0, Math.min(1, (tickRate - baseTick) / denominator));

  return {
    bpm: config.baseBpm + t * (config.maxBpm - config.baseBpm),
    intensity: t,
  };
}

export function startMusic(mode: MusicMode): void {
  currentMode = mode;
  stopMusic();

  if (mode === "off" || mode === "sfx-only") {
    return;
  }

  const ctx = getAudioContext();
  const gainNode = getMusicGain();
  if (!ctx || !gainNode) return;

  const configKey = mode === "drums-only" ? "neon-arcade" : mode;

  try {
    musicNodes = { timeoutId: null };
    stepIndex = 0;
    currentIntensity = 0;
    currentBpm = MODE_CONFIG[configKey].baseBpm;
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
  if (mode === "off" || mode === "sfx-only") return;

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
  stepIndex = 0;
  musicNodes = null;
}

function scheduleBeat(): void {
  if (!musicNodes || currentMode === "off") return;

  const playStep = () => {
    if (!musicNodes || currentMode === "off") return;

    const ctx = getAudioContext();
    const gainNode = getMusicGain();
    if (!ctx || !gainNode) return;

    const configKey =
      currentMode === "drums-only" || currentMode === "sfx-only"
        ? "neon-arcade"
        : currentMode;
    const config = MODE_CONFIG[configKey];
    const localStep = stepIndex % 8;

    try {
      playKick(ctx, gainNode, config, localStep);
      playSnare(ctx, gainNode, config, localStep);
      playHat(ctx, gainNode, config, localStep);

      if (currentMode !== "drums-only") {
        const phrase =
          Math.floor(stepIndex / 8) % 2 === 0
            ? config.leadPhraseA
            : config.leadPhraseB;
        const leadStep = phrase[localStep];
        const harmonyStep = config.harmonyPattern[localStep];
        playBass(ctx, gainNode, config, stepIndex);
        playLead(ctx, gainNode, config, leadStep);
        playHarmony(ctx, gainNode, config, harmonyStep);
      }

      stepIndex++;
    } catch {
      // Silent fallback
    }
  };

  const scheduleNext = () => {
    if (!musicNodes || currentMode === "off") return;

    const configKey =
      currentMode === "drums-only" || currentMode === "sfx-only"
        ? "neon-arcade"
        : currentMode;
    const config = MODE_CONFIG[configKey];
    const baseInterval = 60000 / currentBpm / 2;
    const isOffBeat = stepIndex % 2 === 1;
    const interval = isOffBeat
      ? baseInterval * (1 + config.swing)
      : baseInterval * (1 - config.swing);

    musicNodes.timeoutId = window.setTimeout(() => {
      playStep();
      scheduleNext();
    }, interval);
  };

  playStep();
  scheduleNext();
}

function playBass(
  ctx: AudioContext,
  gainNode: GainNode,
  config: MusicModeConfig,
  index: number,
): void {
  const bassNote = config.bassPattern[index % config.bassPattern.length];
  const bassOsc = ctx.createOscillator();
  const bassGain = ctx.createGain();
  const accent = index % 4 === 0 ? 0.05 : 0;
  const duration = 0.24;
  const volume =
    (0.14 + currentIntensity * 0.16 + accent) * (config.bassLevel ?? 1);

  bassOsc.type = config.bassType;
  bassOsc.frequency.setValueAtTime(bassNote, ctx.currentTime);
  bassOsc.frequency.exponentialRampToValueAtTime(
    Math.max(30, bassNote * 0.58),
    ctx.currentTime + duration,
  );
  bassGain.gain.setValueAtTime(volume, ctx.currentTime);
  bassGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

  bassOsc.connect(bassGain);
  bassGain.connect(gainNode);
  bassOsc.start(ctx.currentTime);
  bassOsc.stop(ctx.currentTime + duration + 0.01);
}

function playKick(
  ctx: AudioContext,
  gainNode: GainNode,
  config: MusicModeConfig,
  step: number,
): void {
  if (!config.kickPattern[step % config.kickPattern.length]) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const volume = 0.12 + currentIntensity * 0.08;

  osc.type = "sine";
  osc.frequency.setValueAtTime(150, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(42, ctx.currentTime + 0.12);
  gain.gain.setValueAtTime(volume, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.14);

  osc.connect(gain);
  gain.connect(gainNode);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.15);
}

function playSnare(
  ctx: AudioContext,
  gainNode: GainNode,
  config: MusicModeConfig,
  step: number,
): void {
  if (!config.snarePattern[step % config.snarePattern.length]) return;

  const bufferSize = Math.floor(ctx.sampleRate * 0.09);
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
  }

  const source = ctx.createBufferSource();
  const filter = ctx.createBiquadFilter();
  const gain = ctx.createGain();
  source.buffer = buffer;
  filter.type = "highpass";
  filter.frequency.setValueAtTime(1200, ctx.currentTime);
  gain.gain.setValueAtTime(0.04 + currentIntensity * 0.06, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);

  source.connect(filter);
  filter.connect(gain);
  gain.connect(gainNode);
  source.start(ctx.currentTime);
}

function playHat(
  ctx: AudioContext,
  gainNode: GainNode,
  config: MusicModeConfig,
  step: number,
): void {
  if (!config.hatPattern[step % config.hatPattern.length]) return;

  const bufferSize = Math.floor(ctx.sampleRate * 0.02);
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
  }

  const source = ctx.createBufferSource();
  const filter = ctx.createBiquadFilter();
  const gain = ctx.createGain();
  source.buffer = buffer;
  filter.type = "bandpass";
  filter.frequency.setValueAtTime(7000, ctx.currentTime);
  gain.gain.setValueAtTime(
    (0.03 + currentIntensity * 0.07) * (config.hatLevel ?? 1),
    ctx.currentTime,
  );
  filter.frequency.setValueAtTime(config.hatTone ?? 7000, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.035);

  source.connect(filter);
  filter.connect(gain);
  gain.connect(gainNode);
  source.start(ctx.currentTime);
}

function playLead(
  ctx: AudioContext,
  gainNode: GainNode,
  config: MusicModeConfig,
  step: PhraseStep,
): void {
  if (step.note === null) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const accent = step.accent ?? 0;
  const duration = 0.11 * step.length + accent * 0.05;
  const volume =
    (0.04 + currentIntensity * 0.1 + accent * 0.04) * (config.leadLevel ?? 1);

  osc.type = config.leadType;
  osc.frequency.setValueAtTime(step.note, ctx.currentTime);
  if (step.glide) {
    osc.frequency.linearRampToValueAtTime(
      step.glide,
      ctx.currentTime + duration,
    );
  }
  gain.gain.setValueAtTime(volume, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

  osc.connect(gain);
  gain.connect(gainNode);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + duration + 0.01);
}

function playHarmony(
  ctx: AudioContext,
  gainNode: GainNode,
  config: MusicModeConfig,
  step: ChordStep | null,
): void {
  if (!step || currentIntensity < 0.08) return;

  const duration = 0.12 * step.length + (step.accent ?? 0) * 0.06;
  const baseVolume =
    (0.02 + currentIntensity * 0.05 + (step.accent ?? 0) * 0.02) *
    (config.harmonyLevel ?? 1);

  for (const note of step.notes) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = config.harmonyType;
    osc.frequency.setValueAtTime(note, ctx.currentTime);
    gain.gain.setValueAtTime(baseVolume / step.notes.length, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(gainNode);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration + 0.01);
  }
}

export function isMusicPlaying(): boolean {
  return musicNodes !== null;
}
