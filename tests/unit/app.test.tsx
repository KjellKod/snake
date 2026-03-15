import { beforeEach, describe, expect, it, vi } from "vitest";
import type { GameSettings, GameState } from "../../src/engine/types";

const customSettings: GameSettings = {
  musicMode: "space-inspired",
  sfxLevel: "high",
  wallsLethal: false,
  otherSnakeLethal: false,
  powerUpsEnabled: true,
};

const gameState: GameState = {
  phase: "start",
  board: { width: 20, height: 20 },
  players: [
    {
      snake: {
        segments: [{ x: 3, y: 10 }],
        direction: "right",
        growPending: false,
        alive: true,
      },
      score: 0,
      effects: {
        slowUntilMs: 0,
        invincibleUntilMs: 0,
        slowMoveOnNextTick: true,
      },
    },
    {
      snake: {
        segments: [{ x: 16, y: 10 }],
        direction: "left",
        growPending: false,
        alive: true,
      },
      score: 0,
      effects: {
        slowUntilMs: 0,
        invincibleUntilMs: 0,
        slowMoveOnNextTick: true,
      },
    },
  ],
  food: { position: { x: 10, y: 10 }, kind: "normal", spawnIndex: 1 },
  tickRate: 8,
  settings: customSettings,
  elapsedMs: 0,
};

describe("App", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("forwards selected settings into game start and audio start when launching from settings", async () => {
    const setPhase = vi.fn();
    const setSettings = vi.fn();
    const setCurrentEvents = vi.fn();
    const start = vi.fn();
    const stop = vi.fn();
    const togglePause = vi.fn();
    const ensureAudio = vi.fn();
    const applySettings = vi.fn();
    const handleGameEvent = vi.fn();
    const startGameAudio = vi.fn();
    const stopGameAudio = vi.fn();
    const useState = vi
      .fn()
      .mockImplementationOnce(() => ["settings", setPhase])
      .mockImplementationOnce(() => [customSettings, setSettings])
      .mockImplementationOnce(() => [[], setCurrentEvents]);
    const useRef = vi
      .fn()
      .mockImplementationOnce(() => ({ current: null }))
      .mockImplementationOnce(() => ({ current: [] }));

    vi.doMock("react", async () => {
      const actual = await vi.importActual<typeof import("react")>("react");
      return {
        ...actual,
        useState,
        useRef,
        useCallback: <T,>(fn: T) => fn,
        useLayoutEffect: () => undefined,
        useEffect: () => undefined,
      };
    });

    const useGameLoop = vi.fn(() => ({
      gameState,
      start,
      stop,
      paused: false,
      togglePause,
    }));

    vi.doMock("../../src/hooks/useGameLoop", () => ({
      useGameLoop,
    }));

    vi.doMock("../../src/hooks/useAudio", () => ({
      useAudio: () => ({
        ensureAudio,
        applySettings,
        handleGameEvent,
        startGameAudio,
        stopGameAudio,
      }),
    }));

    vi.doMock("../../src/components/SettingsScreen", () => ({
      SettingsScreen: (props: unknown) => ({ type: "settings-screen", props }),
    }));

    const { App } = await import("../../src/App");
    const tree = App() as {
      props: {
        onStart: () => void;
        onChange: (settings: GameSettings) => void;
      };
    };

    tree.props.onChange(customSettings);
    tree.props.onStart();

    expect(setSettings).toHaveBeenCalledWith(customSettings);
    expect(ensureAudio).toHaveBeenCalledTimes(1);
    expect(applySettings).toHaveBeenCalledWith(customSettings);
    expect(start).toHaveBeenCalledWith(customSettings);
    expect(startGameAudio).toHaveBeenCalledWith(customSettings);
    expect(setPhase).toHaveBeenCalledWith("playing");
    expect(stop).not.toHaveBeenCalled();
    expect(stopGameAudio).not.toHaveBeenCalled();
    expect(handleGameEvent).not.toHaveBeenCalled();
    expect(useGameLoop).toHaveBeenCalledWith(
      expect.any(Object),
      expect.any(Object),
      false,
    );
  });

  it("disables gameplay input while the settings screen is active", async () => {
    const setPhase = vi.fn();
    const setSettings = vi.fn();
    const setCurrentEvents = vi.fn();
    const start = vi.fn();
    const stop = vi.fn();
    const togglePause = vi.fn();
    const ensureAudio = vi.fn();
    const applySettings = vi.fn();
    const handleGameEvent = vi.fn();
    const startGameAudio = vi.fn();
    const stopGameAudio = vi.fn();
    const useState = vi
      .fn()
      .mockImplementationOnce(() => ["settings", setPhase])
      .mockImplementationOnce(() => [customSettings, setSettings])
      .mockImplementationOnce(() => [[], setCurrentEvents]);
    const useRef = vi
      .fn()
      .mockImplementationOnce(() => ({ current: null }))
      .mockImplementationOnce(() => ({ current: [] }));
    const useGameLoop = vi.fn(() => ({
      gameState,
      start,
      stop,
      paused: false,
      togglePause,
    }));

    vi.doMock("react", async () => {
      const actual = await vi.importActual<typeof import("react")>("react");
      return {
        ...actual,
        useState,
        useRef,
        useCallback: <T,>(fn: T) => fn,
        useLayoutEffect: () => undefined,
        useEffect: () => undefined,
      };
    });

    vi.doMock("../../src/hooks/useGameLoop", () => ({
      useGameLoop,
    }));

    vi.doMock("../../src/hooks/useAudio", () => ({
      useAudio: () => ({
        ensureAudio,
        applySettings,
        handleGameEvent,
        startGameAudio,
        stopGameAudio,
      }),
    }));

    vi.doMock("../../src/components/SettingsScreen", () => ({
      SettingsScreen: (props: unknown) => ({ type: "settings-screen", props }),
    }));

    const { App } = await import("../../src/App");

    App();

    expect(useGameLoop).toHaveBeenCalledWith(
      expect.any(Object),
      expect.any(Object),
      false,
    );
  });
});
