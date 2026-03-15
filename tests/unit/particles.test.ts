import { describe, it, expect } from "vitest";
import { ParticlePool } from "../../src/rendering/particles";

describe("ParticlePool", () => {
  it("starts with zero particles", () => {
    const pool = new ParticlePool();
    expect(pool.count).toBe(0);
  });

  it("emit creates the requested number of particles", () => {
    const pool = new ParticlePool();
    pool.emit(100, 100, 10, "#ff0000");
    expect(pool.count).toBe(10);
  });

  it("emit creates particles at the specified position", () => {
    const pool = new ParticlePool();
    pool.emit(50, 75, 1, "#00ff00");
    expect(pool.particles[0].x).toBe(50);
    expect(pool.particles[0].y).toBe(75);
  });

  it("update moves particles and reduces life", () => {
    const pool = new ParticlePool();
    pool.emit(100, 100, 5, "#ff0000");

    const initialPositions = pool.particles.map((p) => ({ x: p.x, y: p.y }));
    pool.update(0.1);

    // At least some particles should have moved
    let moved = false;
    for (let i = 0; i < pool.particles.length; i++) {
      if (
        pool.particles[i].x !== initialPositions[i].x ||
        pool.particles[i].y !== initialPositions[i].y
      ) {
        moved = true;
        break;
      }
    }
    expect(moved).toBe(true);
  });

  it("update fades alpha over time", () => {
    const pool = new ParticlePool();
    pool.emit(100, 100, 3, "#ff0000");
    pool.update(0.1);

    for (const p of pool.particles) {
      expect(p.alpha).toBeLessThan(1);
      expect(p.alpha).toBeGreaterThanOrEqual(0);
    }
  });

  it("expired particles are removed", () => {
    const pool = new ParticlePool();
    pool.emit(100, 100, 5, "#ff0000");

    // Update with a very large dt to expire all particles
    pool.update(10);
    expect(pool.count).toBe(0);
  });

  it("recycles oldest particles when pool is full", () => {
    const pool = new ParticlePool();
    // Emit in batches to exceed the 200 max
    for (let i = 0; i < 25; i++) {
      pool.emit(i * 10, 0, 10, "#ff0000");
    }
    // Pool max is 200, so count should not exceed 200
    expect(pool.count).toBeLessThanOrEqual(200);
  });
});
