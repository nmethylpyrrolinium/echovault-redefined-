# Button States

```css
.ev-button {
  min-height: 44px;
  border-radius: 999px;
  transition: transform 160ms ease, border-color 160ms ease, background 160ms ease, opacity 160ms ease;
}
.ev-button:hover { transform: translateY(-1px); }
.ev-button:active { transform: translateY(0) scale(.99); }
.ev-button:focus-visible { outline: 2px solid rgba(255,255,255,.82); outline-offset: 3px; }
.ev-button:disabled { opacity: .48; cursor: not-allowed; transform: none; }
@media (prefers-reduced-motion: reduce) {
  .ev-button { transition: none; }
  .ev-button:hover, .ev-button:active { transform: none; }
}
```

Checklist: visible label, explicit `type`, disabled styling, loading state, focus-visible state, mobile hit target.
