# UI Patterns

## Modal Shell

```html
<div class="ev-modal-backdrop" data-modal="memory" hidden>
  <section class="ev-modal" role="dialog" aria-modal="true" aria-labelledby="memory-title" tabindex="-1">
    <button class="ev-icon-button" type="button" data-close-modal aria-label="Close memory panel">×</button>
    <h2 id="memory-title">A quiet place for this echo</h2>
    <div class="ev-modal-body">...</div>
  </section>
</div>
```

## Safe Scroll Target

```css
.ev-section {
  scroll-margin-top: clamp(72px, 12vh, 120px);
}
```

## Reduced Motion Gate

```js
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
target.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'start' });
```
