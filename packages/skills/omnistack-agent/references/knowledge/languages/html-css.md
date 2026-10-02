# HTML & CSS Essentials

> The structure and presentation layer of the web. Semantic HTML gives meaning; modern CSS (Flexbox, Grid) gives layout — get both right and accessibility and responsiveness come mostly for free.

## Concepts

- **Semantic HTML:** use elements for their meaning — `<header>`, `<nav>`, `<main>`, `<article>`,
  `<button>`, `<label>` — not `<div>` for everything. Semantics drive accessibility, SEO, and default
  behavior.
- **The box model:** every element is a box of `content` → `padding` → `border` → `margin`. Set
  `box-sizing: border-box` so `width` includes padding and border (far more predictable).
- **Flexbox:** one-dimensional layout — distribute items along a row *or* column (nav bars, toolbars,
  centering).
- **Grid:** two-dimensional layout — rows *and* columns at once (page layouts, card galleries).
- **Responsive units & media queries:** relative units (`rem`, `%`, `fr`, `vw`) plus `@media`
  breakpoints adapt the layout to the viewport instead of hardcoding pixels.
- **Accessibility basics:** label every input, provide `alt` text, ensure sufficient color contrast,
  and keep a logical focus order.

## Best Practices

- Reach for the right element first; only style a `<div>`/`<span>` when no semantic element fits.
- Use Flexbox for a single axis, Grid for two — don't force one to do the other's job.
- Size with `rem`/`em` and layout with `fr`/`%`; design mobile-first, then add `min-width` media
  queries.
- Always pair an `<input>` with a `<label>` (via `for`/`id`) and give images meaningful `alt`.

## Patterns & Examples

```html
<!-- Semantic structure + an accessible, labeled form control. -->
<main>
  <article class="card">
    <h2>Sign in</h2>
    <form>
      <label for="email">Email</label>
      <input id="email" name="email" type="email" required />
      <button type="submit">Continue</button>
    </form>
  </article>
</main>
```

```css
/* Predictable box model + responsive Grid that reflows with no media query. */
*, *::before, *::after { box-sizing: border-box; }

.gallery {
  display: grid;
  gap: 1rem;
  /* fit as many ~16rem columns as fit; each flexes to fill the row */
  grid-template-columns: repeat(auto-fit, minmax(16rem, 1fr));
}

/* Center a toolbar's items on one axis with Flexbox. */
.toolbar { display: flex; align-items: center; justify-content: space-between; }
```

## Common Pitfalls / Anti-patterns

- **Divitis:** wrapping everything in nameless `<div>`s instead of semantic elements — invisible to
  assistive tech and harder to style and read.
- **Layout with floats / absolute positioning:** legacy hacks for jobs Flexbox/Grid do cleanly. Floats
  are for wrapping text around images, nothing more.
- **Pixel-locked layouts:** fixed `px` widths that don't reflow; the page breaks on phones.
- **Inaccessible controls:** a styled `<div onclick>` instead of a `<button>` — no keyboard focus, no
  role, no default behavior.

## References

- MDN HTML elements reference — https://developer.mozilla.org/docs/Web/HTML/Element
- MDN CSS Flexbox & Grid guides — https://developer.mozilla.org/docs/Web/CSS/CSS_grid_layout
- WCAG 2.2 quick reference — https://www.w3.org/WAI/WCAG22/quickref/

<!-- level: beginner -->
