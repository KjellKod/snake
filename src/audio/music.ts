import { getAudioContext, getMasterGain } from './audioEngine';

let musicNodes: {
  oscillators: OscillatorNode[];
  gains: GainNode[];
  timeoutId: number | null;
} | null = null;

let currentBpm = 120;
let currentIntensity = 0; // 0..1

// Notes for a simple bass pattern (minor key, ominous)
const BASS_NOTES = [65.41, 73.42, 82.41, 77.78]; // C2, D2, E2, Eb2
const LEAD_NOTES = [261.63, 293.66, 329.63, 311.13, 261.63, 349.23, 329.63, 293.66];

/**
 * Maps a game tick rate to BPM and intensity.
 * baseTick=8 -> BPM 120, intensity 0
 * maxTick=12 -> BPM 200, intensity 1
 */
export function tickRateToMusicParams(tickRate: number, baseTick: number, maxTick: number): { bpm: number; intensity: number } {
  const t = Math.max(0, Math.min(1, (tickRate - baseTick) / (maxTick - baseTick)));
  return {
    bpm: 120 + t * 80,
    intensity: t,
  };
}

export function startMusic(): void {
  if (musicNodes) return;
  const ctx = getAudioContext();
  const master = getMasterGain();
  if (!ctx || !master) return;

  try {
    musicNodes = { oscillators: [], gains: [], timeoutId: null };
    currentBpm = 120;
    currentIntensity = 0;
    scheduleBeat(ctx, master);
  } catch {
    // Silent fallback
  }
}

export function updateMusicTempo(tickRate: number, baseTick: number, maxTick: number): void {
  const params = tickRateToMusicParams(tickRate, baseTick, maxTick);
  currentBpm = params.bpm;
  currentIntensity = params.intensity;
}

export function stopMusic(): void {
  if (!musicNodes) return;
  if (musicNodes.timeoutId !== null) {
    clearTimeout(musicNodes.timeoutId);
  }
  for (const osc of musicNodes.oscillators) {
    try { osc.stop(); } catch { /* already stopped */ }
  }
  beatIndex = 0;
  musicNodes = null;
}

let beatIndex = 0;

function scheduleBeat(ctx: AudioContext, master: GainNode): void {
  if (!musicNodes) return;

  const scheduleOneBeat = () => {
    if (!musicNodes) return;
    const ctx2 = getAudioContext();
    const master2 = getMasterGain();
    if (!ctx2 || !master2) return;

    try {
      // Bass drum-like hit
      const bassOsc = ctx2.createOscillator();
      const bassGain = ctx2.createGain();
      bassOsc.type = 'triangle';
      const bassNote = BASS_NOTES[beatIndex % BASS_NOTES.length];
      bassOsc.frequency.setValueAtTime(bassNote, ctx2.currentTime);
      bassOsc.frequency.exponentialRampToValueAtTime(bassNote * 0.5, ctx2.currentTime + 0.1);
      const bassVol = 0.25 + currentIntensity * 0.15;
      bassGain.gain.setValueAtTime(bassVol, ctx2.currentTime);
      bassGain.gain.exponentialRampToValueAtTime(0.001, ctx2.currentTime + 0.15);
      bassOsc.connect(bassGain);
      bassGain.connect(master2);
      bassOsc.start(ctx2.currentTime);
      bassOsc.stop(ctx2.currentTime + 0.15);

      // Hi-hat on every other beat (more frequent at higher intensity)
      const hatFrequency = currentIntensity > 0.3 ? 1 : 2;
      if (beatIndex % hatFrequency === 0) {
        const bufferSize = Math.floor(ctx2.sampleRate * 0.03);
        const buffer = ctx2.createBuffer(1, bufferSize, ctx2.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
        }
        const hatSource = ctx2.createBufferSource();
        hatSource.buffer = buffer;
        const hatGain = ctx2.createGain();
        const hatVol = 0.08 + currentIntensity * 0.12;
        hatGain.gain.setValueAtTime(hatVol, ctx2.currentTime);
        hatGain.gain.exponentialRampToValueAtTime(0.001, ctx2.currentTime + 0.03);
        hatSource.connect(hatGain);
        hatGain.connect(master2);
        hatSource.start(ctx2.currentTime);
      }

      // Lead synth layer (only at higher intensity)
      if (currentIntensity > 0.2) {
        const leadOsc = ctx2.createOscillator();
        const leadGain = ctx2.createGain();
        leadOsc.type = 'square';
        const leadNote = LEAD_NOTES[beatIndex % LEAD_NOTES.length];
        leadOsc.frequency.setValueAtTime(leadNote, ctx2.currentTime);
        const leadVol = 0.06 + (currentIntensity - 0.2) * 0.15;
        leadGain.gain.setValueAtTime(leadVol, ctx2.currentTime);
        leadGain.gain.exponentialRampToValueAtTime(0.001, ctx2.currentTime + 0.08);
        leadOsc.connect(leadGain);
        leadGain.connect(master2);
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
    const beatInterval = 60000 / currentBpm / 2; // 8th notes
    musicNodes.timeoutId = window.setTimeout(() => {
      scheduleOneBeat();
      scheduleNext();
    }, beatInterval);
  };

  scheduleOneBeat();
  scheduleNext();
}

export function isMusicPlaying(): boolean {
  return musicNodes !== null;
}
