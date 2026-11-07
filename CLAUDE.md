# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Personal website of Cristiano (Chris) Federico, served by GitHub Pages from the `main` branch at `https://chrisfederico.github.io/`. Static pages in English: the main site (`index.html`, `assets/css/style.css`, `assets/js/main.js`) and the web CV (`cv.html`, `assets/css/cv.css`). There is no build step, package manager, linter or test suite. The only external dependency is Google Fonts (Poppins, Roboto).

## Running locally

```bash
python3 -m http.server 8000   # then open http://localhost:8000
```

Deploying means pushing to `main`; GitHub Pages publishes the repo root as-is.

## Structure

- Page order: fixed nav → full-screen hero (name, role, tagline, "Contact me" / "Download CV") → `#projects` (cards) → `#experience` (timeline) → `#skills` (grouped tags + education + languages) → `#contact` → footer. The nav links target those ids. `main.js` sets `aria-current="location"` on the link of the section in view.
- `index.html` also holds the SEO metadata (meta description, canonical, Open Graph, Twitter card, JSON-LD `Person`) and an inline SVG icon sprite (`<symbol id="i-…">`, used via `<use href="#i-…">`). Icons are decorative (`aria-hidden`) and always sit next to text. Use `class="solid"` on filled paths: `.icon` defaults to stroke-only.
- Both "Download CV" buttons link to `cv.html`, which reproduces the layout of the original CV document. Its "Download PDF" button calls `window.print()`, and the `@media print` rules in `cv.css` lay it out as exactly one A4 sheet with `@page { margin: 0 }`. No PDF is committed on purpose: the original CV contains the street address, while the web CV shows only the city. After editing `cv.html`, check that the print preview still fits on one page. `cv.css` is self-contained (it doesn't load `style.css`) and always light-themed, because the page represents paper. Its sizes are in pt/mm so the screen sheet and the PDF match. Mobile styles are scoped to `@media screen` so they never affect printing.
- The page works without JavaScript. `main.js` only adds the scroll reveal, the nav border on scroll and the active section link.

## Motion

- The hero entrance is pure CSS (`.hero-in`, staggered via inline `style="--i: n"`), inside `@media (prefers-reduced-motion: no-preference)`.
- Scroll reveal: add `class="reveal"` to an element. An inline script in `<head>` adds `js-reveal` to `<html>` only if `IntersectionObserver` exists and reduced motion is off. Without that class, `.reveal` elements are never hidden. `main.js` removes `.reveal` after the fade so cards get their own fast hover transitions back.
- Keep durations between 200 and 600ms and never add looping animations. A global `prefers-reduced-motion: reduce` block neutralizes all transitions and animations.

## Content rules

- The owner's original CV PDF (kept outside the repo) is the source of truth for roles, dates, skills, education and contacts. `cv.html` mirrors its content verbatim, except that the address is reduced to the city and there are small grammar fixes. Don't invent projects, figures or skills.
- The owner confirmed that all featured projects use Laravel, TypeScript, React, AWS (S3, CloudFront, Lambda) and GitHub Actions; React and GitHub Actions are not in the PDF. Project cards intentionally show no technology tags (owner request).
- Only the city is published, not the street address.
- The page intentionally shows no years-of-experience figure (owner request).
- When the CV changes, update `cv.html`, the main page text, the OG/meta description and the JSON-LD together.

## Visual style and accessibility

- Colors are CSS variables on `:root`: greys from the CV plus one accent, petrol `#0f766e`. Contrast ratios are documented at the top of `style.css`. Don't introduce a second accent.
- Dark mode: the theme follows `prefers-color-scheme` unless the nav toggle has saved a choice. The choice is stored in `localStorage.theme` and applied as `html[data-theme="light"|"dark"]` by an inline `<head>` script before first paint. The dark values are defined twice in `style.css` (inside the media query with `:root:not([data-theme="light"])`, and under `:root[data-theme="dark"]`), so change both. Any new color must be a variable with a dark value: don't hardcode `#fff` or `rgb()`. The toggle is `hidden` until `main.js` runs, and its state is `aria-pressed`.
- `--color-rule` and `--color-rule-soft` are decorative only. Don't use them for text, control borders or focus.
- The accent is only about 2.2:1 against body text, so links inside text must stay underlined.
- Focus uses a global `:focus-visible` outline in the accent color. There's a skip link to `#main`, which has `tabindex="-1"`. Below 48rem the nav switches to a menu button (`.site-nav__menu-btn`, `aria-expanded`) that opens a drop-down panel. `main.js` closes it on link click, Escape (focus returns to the button), outside click, or resize to desktop. The button only renders when `html.js` is set (inline `<head>` script); without JS the links stay inline. Below 24rem only the "CF" mark is shown. Below 56rem the hero is a single centered column; below 30rem its buttons stack at equal width.
- Headings: Poppins; body: Roboto. The heading order is h1 (name) → h2 (sections) → h3 (cards, roles, skill groups).
