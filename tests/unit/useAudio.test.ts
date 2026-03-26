import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("react", () => ({
  useCallback: <T extends (...args: never[]) => unknown>(fn: T) => fn,
  useRef: <T>(value: T) => ({ current: value }),
}));

const initAudio = vi.fn();
const resumeAudio = vi.fn();
const setSfxGainLevel = vi.fn();
const startMusic = vi.fn();
const stopMusic = vi.fn();
const updateMusicTempo = vi.fn();

vi.mock("../../src/audio/audioEngine", () => ({
  initAudio,
  resumeAudio,
  setSfxGainLevel,
}));

vi.mock("../../src/audio/music", () => ({
  startMusic,
  stopMusic,
  updateMusicTempo,
}));

vi.mock("../../src/audio/sfx", () => ({
  playEatSound: vi.fn(),
  playCrashSound: vi.fn(),
  playGameOverSound: vi.fn(),
}));

describe("useAudio", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("applies default settings with the current-like music mode and default sfx gain", async () => {
    const { useAudio } = await import("../../src/hooks/useAudio");
    const { createDefaultSettings } = await import("../../src/engine/types");
    const audio = useAudio();

    audio.startGameAudio(createDefaultSettings());

    expect(initAudio).toHaveBeenCalledTimes(1);
    expect(resumeAudio).toHaveBeenCalledTimes(1);
    expect(setSfxGainLevel).toHaveBeenCalledWith(1);
    expect(startMusic).toHaveBeenCalledWith("neon-arcade");
  });

  it("off mode mutes all sound including sfx", async () => {
    const { useAudio } = await import("../../src/hooks/useAudio");
    const audio = useAudio();

    audio.startGameAudio({
      musicMode: "off",
      sfxLevel: "low",
      wallsLethal: false,
      otherSnakeLethal: false,
      powerUpsEnabled: true,
      monoSpeed: "fast",
    });

    expect(setSfxGainLevel).toHaveBeenCalledWith(0);
    expect(startMusic).toHaveBeenCalledWith("off");
  });

  it("drums-only mode starts music and applies sfx gain normally", async () => {
    const { useAudio } = await import("../../src/hooks/useAudio");
    const audio = useAudio();

    audio.startGameAudio({
      musicMode: "drums-only",
      sfxLevel: "default",
      wallsLethal: true,
      otherSnakeLethal: true,
      powerUpsEnabled: false,
      monoSpeed: "slow",
    });

    expect(startMusic).toHaveBeenCalledWith("drums-only");
    expect(setSfxGainLevel).toHaveBeenCalledWith(1);
  });

  it("sfx-only mode does not start music sequencer but keeps sfx gain", async () => {
    const { useAudio } = await import("../../src/hooks/useAudio");
    const audio = useAudio();

    audio.startGameAudio({
      musicMode: "sfx-only",
      sfxLevel: "high",
      wallsLethal: true,
      otherSnakeLethal: true,
      powerUpsEnabled: false,
      monoSpeed: "slow",
    });

    expect(startMusic).toHaveBeenCalledWith("sfx-only");
    expect(setSfxGainLevel).toHaveBeenCalledWith(1.35);
  });
});
