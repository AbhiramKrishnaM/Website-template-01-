# Eugenia Grab clone

A learning rebuild of https://www.eugeniagrab.com/en: scroll-driven WebGL flowers, ink page transitions, scramble text. The goal is to match the reference's behaviour and look exactly; the text and branding are placeholders the user will replace.

## Read before working

- `website.md` — the build spec. Read the section for whatever you are building; it holds measured scroll heights, timings and shader approaches, including values confirmed from the reference.
- `todo.md` — the work plan. Pick tasks from here and tick them `- [x]` when done.
- `standards.md` — coding rules. Read before writing any code.

## Matching the reference

Measure the reference before building a section, then build. Guessing from screenshots has repeatedly produced the wrong effect.

- Layout values: read `https://www.eugeniagrab.com/static/css/main.45606d42.css` (cached as `/tmp/eg-main.css` when present).
- Timings, eases and technique: skim the bundle `https://www.eugeniagrab.com/static/js/main.51194873.js` (cached as `/tmp/eg-main.js`) for setting names and numbers near the section's class names (e.g. `.cards__fill`, `glass-flower-canvas`).
- Record confirmed values in `website.md` under the section.
- Write our own implementation from those facts; keep the reference's source out of this repo.
- Copy: write original placeholder text in `src/content/en.ts` and `uk.ts`. The reference's quotes and portraits stay out.

## Code map

- `src/pages/Home/sections/` — Hero (pinned quote + glass tulip), Intro, SeedFlight (seeds fall from the top, then land on the slide-1 dandelion), Cards + FlowerStage (pinned five slides, wipes, 3D flowers).
- `src/three/` — `fitModel.ts` (flower setups and fitting, shared by every canvas), `monochrome.ts` (`patchFlowerMaterial`: monochrome→colour blend and wipe clipping), `seedFlight.ts` (landing progress shared between canvases), `StageLights.tsx`, `models.ts`.
- `src/animation/intro.ts` — intro phases `loading → reveal → done`; scroll-reveal components wait for `reveal`, scrolling unlocks at `done`.
- `src/components/` — Preloader, InkTransition, GlassFlower, Header/Footer/MobileMenu, ScrambleText, BlurReveal, RoundButton and friends.
- `src/shaders/` — `ink.frag`, `glass.frag`, `fullscreen.vert`, loaded with `?raw` through `src/lib/webgl.ts`.
- Dev-only pages: `/en/dev/ui` (components) and `/dev/models` (all six models).

## Verifying in Chrome

The automation tab sits in a background window, so the browser pauses animation frames and throttles timers. To test:

- Step GSAP manually: import the app's gsap from the Vite deps URL found in `performance.getEntriesByType('resource')`, then loop `busy-wait 16ms → gsap.ticker.tick() → yield via MessageChannel`.
- Scroll with `(await import('/src/animation/useSmoothScroll.ts')).getLenis().scrollTo(y, { immediate: true })`.
- A WebGL canvas only redraws when a screenshot forces a frame: take a tiny throwaway screenshot before the real one.
- Real mouse input doesn't reach the background tab; dispatch synthetic `PointerEvent`s instead and say so when reporting.
- Run `npm run check` and `npm run build` before reporting; both must be clean with no lint warnings.

## Code style

Write no comments in code (TypeScript, CSS, shaders); the user had all comments removed. Explain through names and named constants, and put reasoning and measured values in `website.md` or `CHANGELOG.md`.

## Deployment

- Deployed on Vercel at https://therapy-template-omega.vercel.app (pushes redeploy automatically).
- `vercel.json` rewrites every path without a matching file to `/index.html`, so refreshing a client-side route like `/en` works. Keep it when changing routing.

## Changelog

`CHANGELOG.md` is append-only. After finishing a piece of work, add an entry at the bottom with a shell append (`cat >> CHANGELOG.md <<'EOF'`), in the format shown at the top of the file. A wrong entry is fixed by appending a correction. `.githooks/pre-commit` rejects any commit that alters existing entries; leave it enabled (`git config core.hooksPath .githooks`) and commit with the hook running.

## Assets

- App code loads models from `public/models/` and glass-flower photos from `public/images/flowers/` (used with O.LA's permission, which the user reports also covers the site's photos).
- `reference-assets/` holds the untouched originals for study only; app code never imports from it.
- Some model parts are third-party (see `reference-assets/README.md`). O.LA approved publishing them with changes that are still to be recorded and applied; the site is already public, so raise this with the user until it's done.
- Credit O.LA (https://olhalazarieva.com/) in the footer and in `CREDITS.md`.
