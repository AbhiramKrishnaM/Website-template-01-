# Coding Standards

Rules for this repo. If code and this file disagree, fix one of them; don't leave both.

## 1. Comments

**No comments in code.** This applies to TypeScript, CSS and shaders alike. Make code explain itself through names, small functions and named constants, and record reasoning, measured values and decisions in `website.md` or `CHANGELOG.md` instead.

## 2. Language & tooling

- TypeScript in `strict` mode. No `any`; use `unknown` and narrow it.
- oxlint + Prettier (`npm run check` runs typecheck, lint and format check); don't hand-format against them.
- No unused imports, variables or exports. Delete dead code; don't leave it "for later".
- Prefer `const`; `let` only when reassigned; never `var`.
- Named exports only (no default exports), so renames stay consistent. Exception: tool configs that require one (`vite.config.ts`).

## 3. Project structure

```
src/
  app/            # router, providers, layout
  pages/          # one folder per route: Home/, Psychotherapy/, About/, Contact/
    Home/
      sections/   # Hero.tsx, Flowers.tsx, Wishes.tsx …
  components/     # shared UI: Header, Footer, RoundButton, ScrambleText …
  three/          # R3F scenes, models, materials
  shaders/        # .glsl files (vert/frag pairs)
  animation/      # GSAP/Lenis setup, shared timelines, easings
  hooks/
  lib/            # pure helpers (math, dom, i18n)
  styles/         # tokens.css, globals.css
  content/        # copy per language (en.ts, uk.ts)
public/
  models/ textures/ images/
  draco/          # generated on install by scripts/copy-draco.mjs; git-ignored
```

- One component per file; file name = component name.
- Section-specific code lives with its section; move it to `components/` only once a second place needs it.

## 4. Naming

| Thing                       | Style                   | Example                            |
| --------------------------- | ----------------------- | ---------------------------------- |
| Components, types           | PascalCase              | `RoundButton`, `SlideConfig`       |
| Functions, variables, hooks | camelCase               | `useScrollProgress`, `bloomAmount` |
| Constants                   | SCREAMING_SNAKE         | `SLIDE_COUNT`                      |
| Files (non-component)       | kebab-case              | `ink-mask.frag`, `lerp.ts`         |
| CSS classes                 | BEM-ish, kebab          | `.flower-slide__numeral--active`   |
| Shader uniforms             | `u` prefix              | `uProgress`, `uBloom`, `uTime`     |
| Shader varyings             | `v` prefix              | `vUv`, `vHeight01`                 |
| Assets                      | kebab-case, descriptive | `hydrangea.glb`, `hero-tulip.webp` |

Booleans read as questions: `isOpen`, `hasLoaded`, `canHover`.

## 5. React

- Function components + hooks only.
- Keep components small; split once a file needs scrolling to understand.
- Props typed with an interface next to the component. No prop drilling beyond 2 levels; use context.
- No business copy inside components; read it from `content/`.
- Side effects in `useEffect` / `useLayoutEffect` must clean up (listeners, observers, GSAP contexts).

## 6. Animation (GSAP / ScrollTrigger / Lenis)

- Every component that animates uses `gsap.context()` (or `useGSAP`) and reverts it on unmount.
- One Lenis instance, created in `animation/`; nothing else calls `requestAnimationFrame` for scroll.
- Drive scroll effects with ScrollTrigger `scrub`, not manual scroll listeners.
- Shared eases and durations live in `animation/tokens.ts`; no ad-hoc `"power3.out"` strings scattered around.
- Animate `transform` and `opacity` only. Avoid animating layout properties (`width`, `top`, `height`) except the accordion height tween.
- Every effect has a `prefers-reduced-motion` path.

## 7. Three.js / R3F / shaders

- One `<Canvas>` per page where possible; don't mount a canvas per component.
- Dispose geometries, materials and textures you create manually. Prefer drei loaders, which cache.
- No allocations inside `useFrame` (no `new Vector3()` per frame); reuse refs.
- Feed scroll progress in through refs/uniforms, not React state, so scrolling doesn't re-render.
- GLSL lives in `.glsl` files, imported as strings; no long inline template literals.
- Uniform names match their JS counterparts exactly.
- `frameloop="demand"` when a scene isn't animating; DPR capped at 1.5.

## 8. Styling

- All colours, fonts, spacing and z-indexes come from `styles/tokens.css` variables. No raw hex in components.
- CSS Modules or plain BEM CSS per component; no inline styles except values computed at runtime.
- Mobile-first media queries; breakpoints from tokens.
- Units: `rem` for type and spacing, `px` only for hairlines and borders.

## 9. Assets

- Models: Draco-compressed GLB in `public/models/`, kebab-case names.
- Images: WebP/AVIF, sized to the largest real display size; no 4K images shown at 400px.
- Fonts self-hosted via `@fontsource` packages (bundled woff2, `font-display: swap`); no font CDNs.
- `reference-assets/` is study-only and is never imported by app code.
- Every third-party asset is listed with its source and licence in `CREDITS.md`.

## 10. Accessibility

- Real text in the DOM for headings, nav and the WELLNESS word; canvases are `aria-hidden`.
- Scramble effects use an `aria-label` with the final text so screen readers don't hear noise.
- Everything clickable is a `<button>` or `<a>`, reachable by keyboard, with a visible focus style.
- Images have meaningful `alt`, or `alt=""` when decorative.
- Colour contrast meets WCAG AA for body text.

## 11. Performance budgets

- Initial JS (excluding three/models) under 200 KB gzipped.
- Total model payload under 12 MB; preload during the loader.
- 60 fps on a mid-range laptop; no long tasks over 50 ms during scroll.
- Lighthouse performance ≥ 80 on desktop.

## 12. Git

- Branch per todo section: `feat/preloader`, `feat/flowers-section`.
- Small commits with imperative messages: `Add scramble text component`.
- No secrets, `.env` files, or `reference-assets/` in commits.
- Before committing: lint, typecheck and build pass.

## 13. Changelog

- `CHANGELOG.md` is **append-only**. Never edit, reorder or delete an existing entry; this applies to people and AI.
- Add new entries at the bottom, in the format shown at the top of the file.
- To fix a wrong entry, append a correction entry.
- Enforced by `.githooks/pre-commit`. After cloning, run `git config core.hooksPath .githooks` once.
- Never bypass it with `git commit --no-verify`.
