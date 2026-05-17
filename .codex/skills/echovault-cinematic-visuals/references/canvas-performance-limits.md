# Canvas Performance Limits

## Budgets

- Target 60fps on desktop, 30-60fps on mobile depending on surface complexity.
- Keep render work under 8ms per frame for interactive views.
- Cap device pixel ratio between 1.5 and 1.75 for fullscreen atmospheric canvas.
- Use 24-140 particles for ambient backgrounds; only exceed for non-interactive Wrapped scenes after testing.

## Required safeguards

- Stop RAF loops on unmount.
- Pause or reduce render work while `document.visibilityState === 'hidden'`.
- Recompute particle counts on resize using viewport area.
- Precompute expensive relationships such as constellation links; do not all-pairs scan every frame.
- Batch canvas drawing by style where practical.

## Degradation ladder

1. Reduce particle count.
2. Reduce link distance or links per point.
3. Lower DPR cap.
4. Lower target FPS.
5. Switch to reduced-motion/static composition.
