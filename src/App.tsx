import { useState, useCallback, useRef, useLayoutEffect, useEffect } from 'react';
import { GamePhase, GameEvent, GameState } from './engine/types';
import { StartScreen } from './components/StartScreen';
import { GameOverScreen } from './components/GameOverScreen';
import { GameCanvas } from './components/GameCanvas';
import { HUD } from './components/HUD';
import { useGameLoop } from './hooks/useGameLoop';
import { useAudio } from './hooks/useAudio';

export function App() {
  const [phase, setPhase] = useState<GamePhase>('start');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { ensureAudio, handleGameEvent, startGameAudio, stopGameAudio } = useAudio();

  const pendingEventsRef = useRef<GameEvent[]>([]);
  const [currentEvents, setCurrentEvents] = useState<GameEvent[]>([]);

  useLayoutEffect(() => {
    if (phase !== 'playing') return;
    if (pendingEventsRef.current.length === 0) return;
    const drained = pendingEventsRef.current;
    pendingEventsRef.current = [];
    setCurrentEvents(drained);
  });

  const onEvent = useCallback((event: GameEvent, state: GameState) => {
    pendingEventsRef.current.push(event);
    handleGameEvent(event, state);

    if (event.type === 'game-over') {
      setPhase('game-over');
    }
  }, [handleGameEvent]);

  const { gameState, start, stop, paused, togglePause } = useGameLoop({ onEvent }, canvasRef);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'p' || e.key === 'P') {
        if (phase === 'playing') togglePause();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [phase, togglePause]);

  const handleStart = useCallback(() => {
    ensureAudio();
    setPhase('playing');
    pendingEventsRef.current = [];
    start();
    startGameAudio();
  }, [ensureAudio, start, startGameAudio]);

  const handleRestart = useCallback(() => {
    ensureAudio();
    stop();
    stopGameAudio();
    setPhase('playing');
    pendingEventsRef.current = [];
    start();
    startGameAudio();
  }, [ensureAudio, stop, stopGameAudio, start, startGameAudio]);

  if (phase === 'start') {
    return <StartScreen onStart={handleStart} />;
  }

  if (phase === 'game-over') {
    return (
      <GameOverScreen
        scores={[gameState.players[0].score, gameState.players[1].score]}
        onRestart={handleRestart}
      />
    );
  }

  return (
    <div className="game-container" style={{ position: 'relative' }}>
      <HUD scores={[gameState.players[0].score, gameState.players[1].score]} />
      <GameCanvas ref={canvasRef} gameState={gameState} events={currentEvents} paused={paused} />
      {paused && (
        <div style={{
          position: 'absolute',
          bottom: 12,
          right: 16,
          color: 'rgba(255,255,255,0.4)',
          fontSize: 14,
          fontFamily: 'monospace',
          pointerEvents: 'none',
        }}>
          Paused
        </div>
      )}
    </div>
  );
}
