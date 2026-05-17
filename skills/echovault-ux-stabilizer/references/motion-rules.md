# Motion Rules

EchoVault motion should feel cinematic, weighted, and calm.

## Prefer

- `transform` and `opacity` transitions.
- Short interaction feedback: 120ms-220ms.
- Slower atmospheric transitions: 400ms-900ms when non-blocking.
- Subtle easing: ease-out for reveals, ease-in for dismissals, custom cubic bezier for premium feel.
- `will-change` only shortly before animation or on a small number of elements.

## Avoid

- Animating `top`, `left`, `width`, `height`, margins, padding, or filters on large elements.
- Large blur filters on mobile.
- Infinite animations that compete with reading.
- Smooth scrolling when `prefers-reduced-motion: reduce` is active.
- Animation that delays essential controls or creates dead time.
