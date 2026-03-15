let audioContext: AudioContext | null = null;
let masterGain: GainNode | null = null;
let musicGain: GainNode | null = null;
let sfxGain: GainNode | null = null;

export function getAudioContext(): AudioContext | null {
  return audioContext;
}

export function getMasterGain(): GainNode | null {
  return masterGain;
}

export function getMusicGain(): GainNode | null {
  return musicGain;
}

export function getSfxGain(): GainNode | null {
  return sfxGain;
}

export function initAudio(): AudioContext | null {
  if (audioContext) return audioContext;

  try {
    audioContext = new AudioContext();
    masterGain = audioContext.createGain();
    musicGain = audioContext.createGain();
    sfxGain = audioContext.createGain();
    masterGain.gain.value = 0.5;
    musicGain.gain.value = 1;
    sfxGain.gain.value = 1;
    musicGain.connect(masterGain);
    sfxGain.connect(masterGain);
    masterGain.connect(audioContext.destination);
  } catch {
    // Silent fallback -- game remains playable without audio
  }

  return audioContext;
}

export function resumeAudio(): void {
  if (audioContext && audioContext.state === "suspended") {
    audioContext.resume().catch(() => {});
  }
}

export function setSfxGainLevel(level: number): void {
  if (!sfxGain) return;
  sfxGain.gain.value = level;
}
