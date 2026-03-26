import { getAudioContext, getSfxGain } from "./audioEngine";

export function playEatSound(): void {
  const ctx = getAudioContext();
  const sfxGain = getSfxGain();
  if (!ctx || !sfxGain) return;

  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(600, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
    osc.connect(gain);
    gain.connect(sfxGain);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.15);
  } catch {
    // Silently fail
  }
}

export function playCrashSound(): void {
  const ctx = getAudioContext();
  const sfxGain = getSfxGain();
  if (!ctx || !sfxGain) return;

  try {
    // Noise burst for crash
    const bufferSize = ctx.sampleRate * 0.3;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
    }
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
    source.connect(gain);
    gain.connect(sfxGain);
    source.start(ctx.currentTime);
  } catch {
    // Silently fail
  }
}

export function playPowerUpSound(): void {
  const ctx = getAudioContext();
  const sfxGain = getSfxGain();
  if (!ctx || !sfxGain) return;

  try {
    // Ascending arpeggio: bright, triumphant pickup sound
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "square";
      osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.07);
      gain.gain.setValueAtTime(0.1, ctx.currentTime + i * 0.07);
      gain.gain.exponentialRampToValueAtTime(
        0.01,
        ctx.currentTime + i * 0.07 + 0.12,
      );
      osc.connect(gain);
      gain.connect(sfxGain);
      osc.start(ctx.currentTime + i * 0.07);
      osc.stop(ctx.currentTime + i * 0.07 + 0.12);
    });
  } catch {
    // Silently fail
  }
}

export function playGameOverSound(): void {
  const ctx = getAudioContext();
  const sfxGain = getSfxGain();
  if (!ctx || !sfxGain) return;

  try {
    const notes = [400, 350, 300, 200];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.2);
      gain.gain.setValueAtTime(0.1, ctx.currentTime + i * 0.2);
      gain.gain.exponentialRampToValueAtTime(
        0.01,
        ctx.currentTime + i * 0.2 + 0.3,
      );
      osc.connect(gain);
      gain.connect(sfxGain);
      osc.start(ctx.currentTime + i * 0.2);
      osc.stop(ctx.currentTime + i * 0.2 + 0.3);
    });
  } catch {
    // Silently fail
  }
}
