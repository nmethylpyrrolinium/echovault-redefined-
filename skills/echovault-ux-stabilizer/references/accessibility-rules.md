# Accessibility Rules

- Every button and link needs a visible label or an accessible name.
- Use semantic buttons for actions and links for navigation.
- Preserve visible focus states that fit the brand; do not remove outlines without replacement.
- Modals need focus management, `Escape` close when safe, a labeled close control, and background inertness or equivalent protection.
- Respect `prefers-reduced-motion` for transitions, smooth scrolling, parallax, particles, and ambient loops.
- Use sufficient contrast for body copy, captions, placeholders, and disabled states.
- Form errors should be text-based, close to the field, and announced when possible.
- Do not use color alone to communicate state.
- Keep DOM order aligned with visual order for keyboard and screen-reader navigation.
