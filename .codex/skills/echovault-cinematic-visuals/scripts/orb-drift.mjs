/** Calm emotional orb drift helpers. Values are designed for transform-based UI animation. */
const TAU = Math.PI * 2;

export function createSeededRandom(seed = 7) {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

export function createOrbDrift({ seed = 7, radius = 10, breathing = 0.035, tempo = 1, moodWeight = 1 } = {}) {
  const random = createSeededRandom(seed);
  const phaseX = random() * TAU;
  const phaseY = random() * TAU;
  const phaseScale = random() * TAU;
  const safeTempo = Math.max(0.15, tempo);
  const safeRadius = Math.max(0, radius * moodWeight);

  return function sampleOrbDrift(timeMs, { reducedMotion = false } = {}) {
    if (reducedMotion) return { x: 0, y: 0, scale: 1, rotate: 0 };
    const t = (timeMs / 1000) * safeTempo;
    const x = Math.sin(t * 0.42 + phaseX) * safeRadius;
    const y = Math.cos(t * 0.36 + phaseY) * safeRadius * 0.72;
    const scale = 1 + Math.sin(t * 0.28 + phaseScale) * breathing;
    const rotate = Math.sin(t * 0.18 + phaseX) * 1.8;
    return { x, y, scale, rotate };
  };
}

export function orbTransform({ x = 0, y = 0, scale = 1, rotate = 0 }) {
  return `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0) rotate(${rotate.toFixed(2)}deg) scale(${scale.toFixed(4)})`;
}
