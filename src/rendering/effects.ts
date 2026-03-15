export interface ScreenShake {
  intensity: number;
  duration: number;
  elapsed: number;
}

export function createScreenShake(
  intensity: number,
  duration: number,
): ScreenShake {
  return { intensity, duration, elapsed: 0 };
}

export function updateScreenShake(shake: ScreenShake, dt: number): ScreenShake {
  return { ...shake, elapsed: shake.elapsed + dt };
}

export function getShakeOffset(shake: ScreenShake): { x: number; y: number } {
  if (shake.elapsed >= shake.duration) return { x: 0, y: 0 };
  const progress = shake.elapsed / shake.duration;
  const decay = 1 - progress;
  return {
    x: (Math.random() - 0.5) * shake.intensity * decay * 2,
    y: (Math.random() - 0.5) * shake.intensity * decay * 2,
  };
}

export function applyNeonGlow(
  ctx: CanvasRenderingContext2D,
  color: string,
  blur: number,
  callback: () => void,
): void {
  ctx.save();
  ctx.shadowColor = color;
  ctx.shadowBlur = blur;
  callback();
  ctx.restore();
}

export function drawAnimatedBackground(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  time: number,
): void {
  // Dark gradient background with subtle moving grid
  const gradient = ctx.createRadialGradient(
    width / 2,
    height / 2,
    0,
    width / 2,
    height / 2,
    width * 0.7,
  );
  gradient.addColorStop(0, "#0a0a1a");
  gradient.addColorStop(1, "#000008");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  // Subtle animated grid lines
  ctx.strokeStyle = "rgba(0, 255, 255, 0.03)";
  ctx.lineWidth = 1;
  const gridSize = 30;
  const offset = (time * 10) % gridSize;

  for (let x = offset; x < width; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  for (let y = offset; y < height; y += gridSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }
}
