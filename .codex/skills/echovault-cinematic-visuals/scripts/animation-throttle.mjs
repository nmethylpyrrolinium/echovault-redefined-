/** EchoVault animation helpers for performance-safe cinematic rendering. */
export const DEFAULT_FRAME_BUDGET_MS = 8;

export function prefersReducedMotion(win = globalThis.window) {
  return Boolean(win?.matchMedia?.('(prefers-reduced-motion: reduce)').matches);
}

export function clampDevicePixelRatio(raw = globalThis.devicePixelRatio || 1, max = 1.75) {
  return Math.max(1, Math.min(max, Number.isFinite(raw) ? raw : 1));
}

export function resizeCanvasToDisplaySize(canvas, { maxDpr = 1.75 } = {}) {
  const dpr = clampDevicePixelRatio(globalThis.devicePixelRatio || 1, maxDpr);
  const rect = canvas.getBoundingClientRect();
  const width = Math.max(1, Math.round(rect.width * dpr));
  const height = Math.max(1, Math.round(rect.height * dpr));
  const changed = canvas.width !== width || canvas.height !== height;
  if (changed) {
    canvas.width = width;
    canvas.height = height;
  }
  const ctx = canvas.getContext('2d');
  ctx?.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { changed, dpr, width: rect.width, height: rect.height, pixelWidth: width, pixelHeight: height };
}

export function createRafLoop(render, options = {}) {
  const {
    targetFps = 60,
    pauseWhenHidden = true,
    reducedMotion = prefersReducedMotion(),
    reducedMotionFps = 8,
    now = () => performance.now(),
  } = options;
  const fps = reducedMotion ? reducedMotionFps : targetFps;
  const minDelta = 1000 / Math.max(1, fps);
  let rafId = 0;
  let running = false;
  let last = 0;

  const tick = (time = now()) => {
    if (!running) return;
    if (!pauseWhenHidden || globalThis.document?.visibilityState !== 'hidden') {
      const delta = time - last;
      if (delta >= minDelta) {
        render({ time, delta: last ? delta : minDelta, reducedMotion });
        last = time;
      }
    }
    rafId = requestAnimationFrame(tick);
  };

  return {
    start() {
      if (running) return;
      running = true;
      last = now();
      rafId = requestAnimationFrame(tick);
    },
    stop() {
      running = false;
      if (rafId) cancelAnimationFrame(rafId);
      rafId = 0;
    },
    isRunning() {
      return running;
    },
  };
}

export function makeFpsSampler(sampleSize = 45) {
  const samples = [];
  return function sample(deltaMs) {
    if (deltaMs > 0) samples.push(1000 / deltaMs);
    if (samples.length > sampleSize) samples.shift();
    return samples.length ? samples.reduce((a, b) => a + b, 0) / samples.length : 0;
  };
}

export function budgetedRender(fn, { budgetMs = DEFAULT_FRAME_BUDGET_MS, onOverBudget } = {}) {
  return (...args) => {
    const start = performance.now();
    const result = fn(...args);
    const cost = performance.now() - start;
    if (cost > budgetMs) onOverBudget?.({ cost, budgetMs });
    return result;
  };
}
