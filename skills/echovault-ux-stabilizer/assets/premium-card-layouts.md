# Premium Card Layouts

```html
<article class="ev-card">
  <p class="ev-card-kicker">Memory signal</p>
  <h3>Midnight rain on the window</h3>
  <p>A preserved echo with enough contrast and breathing room to read comfortably.</p>
  <div class="ev-card-actions">
    <button type="button" class="ev-button ev-button-secondary">Reflect</button>
    <button type="button" class="ev-button ev-button-primary">Open</button>
  </div>
</article>
```

```css
.ev-card {
  display: grid;
  gap: .85rem;
  padding: clamp(1rem, 4vw, 1.5rem);
  border: 1px solid rgba(255,255,255,.12);
  border-radius: 28px;
  background: linear-gradient(145deg, rgba(255,255,255,.10), rgba(255,255,255,.035));
  box-shadow: 0 24px 80px rgba(0,0,0,.28);
}
.ev-card-actions {
  display: flex;
  flex-wrap: wrap;
  gap: .75rem;
}
```
