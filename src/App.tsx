import {
  useState,
  useCallback,
  useRef,
  useLayoutEffect,
  useEffect,
} from "react";
import {
  GameEvent,
  GameState,
  GameSettings,
  createDefaultSettings,
} from "./engine/types";
import { StartScreen } from "./components/StartScreen";
import { GameOverScreen } from "./components/GameOverScreen";
import { GameCanvas } from "./components/GameCanvas";
import { HUD } from "./components/HUD";
import { SettingsScreen } from "./components/SettingsScreen";
import { useGameLoop } from "./hooks/useGameLoop";
import { useAudio } from "./hooks/useAudio";

type AppPhase = "start" | "settings" | "playing" | "game-over";

export function App() {
  const [phase, setPhase] = useState<AppPhase>("start");
  const [settings, setSettings] = useState<GameSettings>(() =>
    createDefaultSettings(),
  );
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const {
    ensureAudio,
    applySettings,
    handleGameEvent,
    startGameAudio,
    stopGameAudio,
  } = useAudio();

  const pendingEventsRef = useRef<GameEvent[]>([]);
  const [currentEvents, setCurrentEvents] = useState<GameEvent[]>([]);

  useLayoutEffect(() => {
    if (phase !== "playing") return;
    if (pendingEventsRef.current.length === 0) return;
    const drained = pendingEventsRef.current;
    pendingEventsRef.current = [];
    setCurrentEvents(drained);
  });

  const onEvent = useCallback(
    (event: GameEvent, state: GameState) => {
      pendingEventsRef.current.push(event);
      handleGameEvent(event, state);

      if (event.type === "game-over") {
        setPhase("game-over");
      }
    },
    [handleGameEvent],
  );

  const { gameState, start, stop, paused, togglePause } = useGameLoop(
    { onEvent },
    canvasRef,
    phase === "playing",
  );

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "p" || e.key === "P") {
        if (phase === "playing") togglePause();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [phase, togglePause]);

  const handleStart = useCallback(() => {
    ensureAudio();
    applySettings(settings);
    setPhase("playing");
    pendingEventsRef.current = [];
    start(settings);
    startGameAudio(settings);
  }, [applySettings, ensureAudio, settings, start, startGameAudio]);

  const handleRestart = useCallback(() => {
    ensureAudio();
    applySettings(settings);
    stop();
    stopGameAudio();
    setPhase("playing");
    pendingEventsRef.current = [];
    start(settings);
    startGameAudio(settings);
  }, [
    applySettings,
    ensureAudio,
    settings,
    stop,
    stopGameAudio,
    start,
    startGameAudio,
  ]);

  if (phase === "start") {
    return (
      <StartScreen
        onStart={handleStart}
        onOpenSettings={() => setPhase("settings")}
      />
    );
  }

  if (phase === "settings") {
    return (
      <SettingsScreen
        settings={settings}
        onChange={setSettings}
        onBack={() => setPhase("start")}
        onStart={handleStart}
      />
    );
  }

  if (phase === "game-over") {
    return (
      <GameOverScreen
        scores={[gameState.players[0].score, gameState.players[1].score]}
        onRestart={handleRestart}
      />
    );
  }

  return (
    <div className="game-container" style={{ position: "relative" }}>
      <HUD gameState={gameState} />
      <GameCanvas
        ref={canvasRef}
        gameState={gameState}
        events={currentEvents}
        paused={paused}
      />
      {paused && (
        <div
          style={{
            position: "absolute",
            bottom: 12,
            right: 16,
            color: "rgba(255,255,255,0.4)",
            fontSize: 14,
            fontFamily: "monospace",
            pointerEvents: "none",
          }}
        >
          Paused
        </div>
      )}
    </div>
  );
}
