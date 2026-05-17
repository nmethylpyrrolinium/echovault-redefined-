# Navigation Flow

- Hash links must target existing IDs and should land below sticky headers.
- Programmatic scroll should account for reduced motion and fixed headers.
- Active section state should not depend only on scroll events; prefer IntersectionObserver where practical.
- Back/close behavior should be consistent across modals, onboarding, drawers, and detail views.
- Navigation buttons should fail soft: if a target is missing, do not throw; show/log a clear fallback during development.
- Avoid nested click handlers that cause double navigation or immediate open/close flicker.
- Keep route/view state synchronized with visible content and focus target.
