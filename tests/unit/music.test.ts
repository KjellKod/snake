import { describe, expect, it, vi } from "vitest";

vi.mock("../../src/audio/audioEngine", () => ({
  getAudioContext: vi.fn(),
  getMusicGain: vi.fn(),
}));

describe("music phrase data", () => {
  it("all lead phrases have exactly 8 steps", async () => {
    const { MODE_CONFIG } = await import("../../src/audio/music");

    for (const [mode, config] of Object.entries(MODE_CONFIG)) {
      expect(
        config.leadPhraseA.length,
        `${mode} leadPhraseA should have 8 steps`,
      ).toBe(8);
      expect(
        config.leadPhraseB.length,
        `${mode} leadPhraseB should have 8 steps`,
      ).toBe(8);
    }
  });

  it("tickRateToMusicParams handles all modes without error", async () => {
    const { tickRateToMusicParams } = await import("../../src/audio/music");

    const allModes = [
      "neon-arcade",
      "space-inspired",
      "8-bit",
      "techno-trance",
      "off",
      "drums-only",
      "sfx-only",
    ] as const;

    for (const mode of allModes) {
      const result = tickRateToMusicParams(100, 100, 200, mode);
      expect(result.bpm).toBeGreaterThan(0);
      expect(result.intensity).toBeGreaterThanOrEqual(0);
    }
  });
});
