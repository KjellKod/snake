import { useRef, useEffect } from 'react';
import { GameState, GameEvent } from '../engine/types';
import { renderGame } from '../rendering/canvasRenderer';
import { ParticlePool } from '../rendering/particles';
import { ScreenShake, createScreenShake, updateScreenShake } from '../rendering/effects';
import { getCellPixelCenter } from '../rendering/canvasRenderer';

const CANVAS_SIZE = 600;

interface GameCanvasProps {
  gameState: GameState;
  events: GameEvent[];
}

export function GameCanvas({ gameState, events }: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef(new ParticlePool());
  const shakeRef = useRef<ScreenShake>(createScreenShake(0, 0));
  const lastTimeRef = useRef(0);
  const rafRef = useRef(0);

  // Handle events for visual effects
  useEffect(() => {
    for (const event of events) {
      if (event.type === 'food-eaten') {
        const center = getCellPixelCenter(
          event.position,
          gameState.board.width,
          gameState.board.height,
          CANVAS_SIZE,
          CANVAS_SIZE
        );
        const color = event.player === 0 ? '#00ffff' : '#ff00ff';
        particlesRef.current.emit(center.x, center.y, 15, color);
      }
      if (event.type === 'player-died') {
        shakeRef.current = createScreenShake(8, 0.4);
      }
    }
  }, [events, gameState.board.width, gameState.board.height]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = (timestamp: number) => {
      const dt = lastTimeRef.current === 0 ? 0.016 : (timestamp - lastTimeRef.current) / 1000;
      lastTimeRef.current = timestamp;

      particlesRef.current.update(dt);
      shakeRef.current = updateScreenShake(shakeRef.current, dt);

      renderGame(ctx, gameState, particlesRef.current, shakeRef.current, timestamp / 1000);

      rafRef.current = requestAnimationFrame(render);
    };

    rafRef.current = requestAnimationFrame(render);
    return () => cancelAnimationFrame(rafRef.current);
  }, [gameState]);

  return (
    <canvas
      ref={canvasRef}
      width={CANVAS_SIZE}
      height={CANVAS_SIZE}
    />
  );
}
