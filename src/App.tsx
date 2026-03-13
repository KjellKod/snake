import { useState, useCallback, useRef, useLayoutEffect } from 'react';
import { GamePhase, GameEvent, GameState } from './engine/types';
import { StartScreen } from './components/StartScreen';
import { GameOverScreen } from './components/GameOverScreen';
import { GameCanvas } from './components/GameCanvas';
import { HUD } from './components/HUD';
import { useGameLoop } from './hooks/useGameLoop';
import { useAudio } from './hooks/useAudio';

export function App() {
  const [phase, setPhase] = useState<GamePhase>('start');
  const { ensureAudio, handleGameEvent, startGameAudio, stopGameAudio } = useAudio();

  const pendingEventsRef = useRef<GameEvent[]>([]);

  const onEvent = useCallback((event: GameEvent, state: GameState) => {
    pendingEventsRef.current.push(event);
    handleGameEvent(event, state);

    if (event.type === 'game-over') {
      setPhase('game-over');
    }
  }, [handleGameEvent]);

  const { gameState, start, stop } = useGameLoop({ onEvent });

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

  const [currentEvents, setCurrentEvents] = useState<GameEvent[]>([]);

  useLayoutEffect(() => {
    const drained = pendingEventsRef.current;
    pendingEventsRef.current = [];
    setCurrentEvents(drained);
  });

  return (
    <div className="game-container">
      <HUD scores={[gameState.players[0].score, gameState.players[1].score]} />
      <GameCanvas gameState={gameState} events={currentEvents} />
    </div>
  );
}
