# Mobile Layout Rules

- Use `min-height: 100svh` or `100dvh` thoughtfully; avoid relying only on `100vh` for mobile browser chrome.
- Prevent horizontal overflow with responsive max widths, wrapping, and `overflow-wrap: anywhere` for long user text.
- Keep tap targets at least 44px by 44px.
- Respect safe areas with `env(safe-area-inset-*)` for fixed headers, bottom nav, and install prompts.
- Keep important actions above or clear of bottom browser/tool/nav bars.
- Avoid fixed full-screen panels that cannot scroll internally.
- Prefer one-column mobile flows; cards can stack with consistent vertical rhythm.
- Test at 320px, 375px, 390px, 430px, and tablet widths when possible.
- Never hide critical controls behind hover-only interactions.
