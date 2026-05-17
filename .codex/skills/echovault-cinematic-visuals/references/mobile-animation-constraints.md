# Mobile Animation Constraints

## Mobile defaults

- Treat mobile as the primary performance target.
- Lower canvas DPR cap to 1.5 for fullscreen effects.
- Use fewer particles and shorter constellation links.
- Avoid large backdrop-filter regions that animate continuously.
- Prefer CSS transforms and opacity for DOM animation.

## Interaction constraints

- Do not animate in ways that interfere with scrolling.
- Respect safe areas and avoid glow-heavy edges around notches.
- Disable pointer-follow effects on touch devices unless they have a clear tap equivalent.
- Keep battery impact low by pausing nonessential ambience after inactivity.
