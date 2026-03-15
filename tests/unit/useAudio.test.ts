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

  it("applies selected music and sfx settings before game audio starts", async () => {
    const { useAudio } = await import("../../src/hooks/useAudio");
    const audio = useAudio();

    audio.startGameAudio({
      musicMode: "off",
      sfxLevel: "low",
      wallsLethal: false,
      otherSnakeLethal: false,
      powerUpsEnabled: true,
    });

    expect(setSfxGainLevel).toHaveBeenCalledWith(0.55);
    expect(startMusic).toHaveBeenCalledWith("off");
  });
});
