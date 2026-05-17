/** Lightweight deterministic canvas particles for emotional ambience. */
import { createSeededRandom } from './orb-drift.mjs';

export function createParticles({ count = 80, width = 800, height = 600, seed = 11, speed = 0.18, size = [0.8, 2.6], alpha = [0.08, 0.42] } = {}) {
  const random = createSeededRandom(seed);
  return Array.from({ length: count }, (_, index) => ({
    id: index,
    x: random() * width,
    y: random() * height,
    vx: (random() - 0.5) * speed,
    vy: (random() - 0.5) * speed,
    r: size[0] + random() * (size[1] - size[0]),
    alpha: alpha[0] + random() * (alpha[1] - alpha[0]),
    twinkle: random() * Math.PI * 2,
  }));
}

export function stepParticles(particles, { width, height, delta = 16.67, reducedMotion = false } = {}) {
  const factor = reducedMotion ? 0.08 : delta / 16.67;
  for (const p of particles) {
    p.x = (p.x + p.vx * factor + width) % width;
    p.y = (p.y + p.vy * factor + height) % height;
    p.twinkle += 0.012 * factor;
  }
  return particles;
}

export function drawParticles(ctx, particles, { color = '190, 210, 255', glow = true } = {}) {
  ctx.save();
  ctx.globalCompositeOperation = glow ? 'lighter' : 'source-over';
  for (const p of particles) {
    const pulse = 0.72 + Math.sin(p.twinkle) * 0.28;
    ctx.fillStyle = `rgba(${color}, ${(p.alpha * pulse).toFixed(3)})`;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r * pulse, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

export function particleCountForViewport(width, height, { density = 0.00008, min = 24, max = 140, reducedMotion = false } = {}) {
  if (reducedMotion) return Math.max(8, Math.round(min * 0.45));
  return Math.max(min, Math.min(max, Math.round(width * height * density)));
}
