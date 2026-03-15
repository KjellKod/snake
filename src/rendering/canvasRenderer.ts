import {
  FoodKind,
  GameState,
  PlayerState,
  Position,
  isPlayerInvincible,
  isPlayerSlowed,
} from "../engine/types";
import { ParticlePool } from "./particles";
import {
  ScreenShake,
  getShakeOffset,
  applyNeonGlow,
  drawAnimatedBackground,
} from "./effects";

const PLAYER_COLORS = ["#00ffff", "#ff00ff"] as const;
const PLAYER_GLOW_COLORS = [
  "rgba(0,255,255,0.6)",
  "rgba(255,0,255,0.6)",
] as const;
const FOOD_COLOR = "#ffff00";
const FOOD_GLOW = "rgba(255,255,0,0.8)";
const POWER_UP_COLOR = "#ffd166";
const POWER_UP_GLOW = "rgba(255, 209, 102, 0.85)";
const INVINCIBLE_GLOW = "rgba(255, 255, 255, 0.95)";

export function getFoodRenderState(
  kind: FoodKind,
  time: number,
  cellW: number,
) {
  const pulse = 1 + Math.sin(time * 6) * (kind === "power-up" ? 0.28 : 0.15);

  return {
    glow: kind === "power-up" ? POWER_UP_GLOW : FOOD_GLOW,
    color: kind === "power-up" ? POWER_UP_COLOR : FOOD_COLOR,
    radius: cellW * 0.3 * pulse * (kind === "power-up" ? 1.25 : 1),
  };
}

export function getSnakeRenderState(
  player: PlayerState,
  elapsedMs: number,
  playerIndex: 0 | 1,
) {
  const invincible = isPlayerInvincible(player, elapsedMs);
  const slowed = isPlayerSlowed(player, elapsedMs);
  const blinkAlpha = slowed ? (Math.sin(elapsedMs / 120) > 0 ? 0.35 : 1) : 1;

  return {
    color: invincible ? "#ffffff" : PLAYER_COLORS[playerIndex],
    glow: invincible ? INVINCIBLE_GLOW : PLAYER_GLOW_COLORS[playerIndex],
    alpha: player.snake.alive ? blinkAlpha : 0.3,
    headHighlight: invincible
      ? PLAYER_COLORS[playerIndex]
      : PLAYER_COLORS[playerIndex],
  };
}

export function renderGame(
  ctx: CanvasRenderingContext2D,
  state: GameState,
  particles: ParticlePool,
  shake: ScreenShake,
  time: number,
): void {
  const canvas = ctx.canvas;
  const cellW = canvas.width / state.board.width;
  const cellH = canvas.height / state.board.height;

  ctx.save();

  // Apply screen shake
  const shakeOff = getShakeOffset(shake);
  ctx.translate(shakeOff.x, shakeOff.y);

  // Background
  drawAnimatedBackground(ctx, canvas.width, canvas.height, time);

  // Draw grid lines (subtle)
  ctx.strokeStyle = "rgba(255,255,255,0.04)";
  ctx.lineWidth = 0.5;
  for (let x = 0; x <= state.board.width; x++) {
    ctx.beginPath();
    ctx.moveTo(x * cellW, 0);
    ctx.lineTo(x * cellW, canvas.height);
    ctx.stroke();
  }
  for (let y = 0; y <= state.board.height; y++) {
    ctx.beginPath();
    ctx.moveTo(0, y * cellH);
    ctx.lineTo(canvas.width, y * cellH);
    ctx.stroke();
  }

  // Draw food with glow
  const fx = state.food.position.x * cellW + cellW / 2;
  const fy = state.food.position.y * cellH + cellH / 2;
  const foodRenderState = getFoodRenderState(state.food.kind, time, cellW);
  applyNeonGlow(
    ctx,
    foodRenderState.glow,
    state.food.kind === "power-up" ? 22 : 15,
    () => {
      ctx.fillStyle = foodRenderState.color;
      ctx.beginPath();
      ctx.arc(fx, fy, foodRenderState.radius, 0, Math.PI * 2);
      ctx.fill();
    },
  );

  // Draw snakes
  for (let p = 0; p < 2; p++) {
    const player = state.players[p];
    if (!player.snake.alive && player.snake.segments.length === 0) continue;

    const snakeRenderState = getSnakeRenderState(
      player,
      state.elapsedMs,
      p as 0 | 1,
    );

    applyNeonGlow(
      ctx,
      snakeRenderState.glow,
      isPlayerInvincible(player, state.elapsedMs) ? 18 : 10,
      () => {
        ctx.globalAlpha = snakeRenderState.alpha;
        for (let i = 0; i < player.snake.segments.length; i++) {
          const seg = player.snake.segments[i];
          const isHead = i === 0;
          const x = seg.x * cellW;
          const y = seg.y * cellH;
          const padding = isHead ? 0.5 : 1.5;

          ctx.fillStyle = isHead ? "#ffffff" : snakeRenderState.color;
          ctx.fillRect(
            x + padding,
            y + padding,
            cellW - padding * 2,
            cellH - padding * 2,
          );

          // Head highlight
          if (isHead && player.snake.alive) {
            ctx.fillStyle = snakeRenderState.headHighlight;
            ctx.fillRect(
              x + cellW * 0.25,
              y + cellH * 0.25,
              cellW * 0.5,
              cellH * 0.5,
            );
          }
        }
        ctx.globalAlpha = 1;
      },
    );
  }

  // Draw particles
  particles.draw(ctx);

  // Border glow
  applyNeonGlow(ctx, "rgba(0,255,255,0.3)", 8, () => {
    ctx.strokeStyle = "rgba(0,255,255,0.2)";
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, canvas.width, canvas.height);
  });

  ctx.restore();
}

export function getCellPixelCenter(
  pos: Position,
  boardWidth: number,
  boardHeight: number,
  canvasWidth: number,
  canvasHeight: number,
): { x: number; y: number } {
  const cellW = canvasWidth / boardWidth;
  const cellH = canvasHeight / boardHeight;
  return {
    x: pos.x * cellW + cellW / 2,
    y: pos.y * cellH + cellH / 2,
  };
}
