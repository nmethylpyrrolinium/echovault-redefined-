# Do-Not-Break Constraints

- Do not rewrite the whole project for a UX stabilization request.
- Do not remove existing user data keys, localStorage schema, or migration paths without adding compatibility.
- Do not strip the cinematic/emotional identity in favor of generic dashboard UI.
- Do not remove PWA metadata, service worker registration, icons, or install prompt behavior unless replacing with working equivalents.
- Do not introduce framework dependencies unless the project already uses them or the user asks.
- Do not make hover-only controls required on mobile.
- Do not silence errors by swallowing them without a visible or diagnosable fallback.
- Do not add animations that ignore reduced-motion preferences.
