---
name: echovault-cinematic-visuals
description: Help EchoVault improve its cinematic visual system while protecting performance and accessibility. Use when asked to improve EchoVault animations, make emotional orbs feel alive, add constellation lines, improve Wrapped cinematic/3D scenes, fix canvas performance, improve emotional weather visuals, make transitions feel premium, add glow effects, or add reduced-motion fallbacks.
---

# EchoVault Cinematic Visuals

## Mission

Make EchoVault visually stunning, smooth, emotionally expressive, and premium without adding chaos or hurting performance. Treat motion as emotional storytelling: every particle, orb, glow, constellation line, weather layer, and transition should clarify the user's emotional memory rather than distract from it.

## Operating Principles

1. **Emotion first, spectacle second**: tie movement, color, density, and timing to the current mood or memory state.
2. **One hero motion per view**: avoid competing animations; supporting layers should be subtle.
3. **Performance is part of polish**: prefer transform/opacity for DOM motion, cap canvas DPR, pause offscreen work, and throttle expensive updates.
4. **Accessibility is mandatory**: provide reduced-motion fallbacks for every premium motion path.
5. **Mobile is the baseline**: design for small screens, battery limits, and weaker GPUs before scaling up.

## Workflow

1. **Identify the visual surface**: orb, canvas particles, constellation links, Wrapped scene, emotional weather, transition, glow, or fallback.
2. **Read only the relevant reference docs** from `references/`:
   - `visual-identity.md` for overall EchoVault look and restraint.
   - `motion-rules.md` for timing, easing, and emotional motion language.
   - `canvas-performance-limits.md` for particle and render-loop budgets.
   - `mood-to-color-rules.md` for palette decisions.
   - `wrapped-scene-rules.md` for cinematic recap scenes.
   - `mobile-animation-constraints.md` for mobile-safe implementation.
3. **Reuse scripts before rewriting helpers** from `scripts/`:
   - `animation-throttle.mjs` for RAF loops, reduced motion, visibility pause, DPR caps, and FPS sampling.
   - `canvas-particles.mjs` for deterministic particle systems.
   - `orb-drift.mjs` for alive-but-calm orb motion.
   - `constellation-links.mjs` for performant point linking.
4. **Use assets as starting points** from `assets/`:
   - `visual-presets.json`, `particle-configs.json`, `transition-examples.json`, `orb-style-examples.json`, `cinematic-scene-templates.json`.
5. **Implement with fallbacks**: every animated feature must include a reduced-motion variant that preserves meaning through static composition, gradients, gentle opacity, or single-step transitions.
6. **Validate**: check animation frame cost, mobile behavior, reduced-motion behavior, resize handling, and cleanup/unmount logic.

## Implementation Heuristics

- Use CSS variables for mood colors, glow intensity, blur size, and animation duration so product surfaces stay coherent.
- Prefer deterministic seeded randomness for memory visuals; users should feel the system is intentional, not noisy.
- Cap particle counts by viewport area and device class. Lower density before lowering visual quality.
- Render canvas only when visible or when state changes. Stop loops when components unmount.
- Draw constellation connections from spatial/emotional affinity, not from every possible point pair.
- Use layered opacity and blur for premium glow; avoid large constantly animating box-shadows on many DOM nodes.
- Keep transitions under ~700ms except ceremonial Wrapped moments, which may use slower staged reveals.

## Quality Checklist

Before finishing a visual change, verify:

- The animation has a clear emotional purpose.
- The default path remains smooth on mobile.
- The reduced-motion path is implemented and testable.
- Canvas DPR and particle counts are bounded.
- Event listeners, animation frames, observers, and timers are cleaned up.
- The visual language matches EchoVault's calm, intimate, premium identity.
