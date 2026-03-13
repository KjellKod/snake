let audioContext: AudioContext | null = null;
let masterGain: GainNode | null = null;

export function getAudioContext(): AudioContext | null {
  return audioContext;
}

export function getMasterGain(): GainNode | null {
  return masterGain;
}

export function initAudio(): AudioContext | null {
  if (audioContext) return audioContext;

  try {
    audioContext = new AudioContext();
    masterGain = audioContext.createGain();
    masterGain.gain.value = 0.5;
    masterGain.connect(audioContext.destination);
  } catch {
    // Silent fallback -- game remains playable without audio
  }

  return audioContext;
}

export function resumeAudio(): void {
  if (audioContext && audioContext.state === 'suspended') {
    audioContext.resume().catch(() => {});
  }
}
