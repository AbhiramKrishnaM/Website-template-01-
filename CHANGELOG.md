# Changelog

**Append-only.** Existing entries are never edited, reordered or deleted — by people or AI.
New entries go at the bottom of this file. To correct a mistake, add a new entry that says so.
Enforced by `.githooks/pre-commit`.

Entry format:

```
## YYYY-MM-DD — short title
- What changed (files / areas)
- Why, if not obvious
```

---

## 2026-10-02 — Research and planning
- Walked through every page of the reference site (eugeniagrab.com) and documented the stack: React, GSAP, Lenis, Three.js r148, Draco
- Added `website.md`: full build spec covering design tokens, global effects, and a section-by-section breakdown with measured scroll heights

## 2026-10-02 — Reference models
- Downloaded the 6 flower GLBs and the ranunculus textures into `reference-assets/` (git-ignored)
- Inspected models: triangle counts, baked animations, morph targets, materials
- Updated `website.md` section 4.3: the bloom is mostly baked keyframe animation scrubbed by scroll

## 2026-10-02 — Model renaming
- O.LA gave permission by email (per the user) to use and rename the models
- Created renamed copies in `assets/models/` (dandelion, globe-thistle, hydrangea, echinacea, artichoke, ranunculus)
- Logged all 2,311 renames in `reference-assets/rename-log.md`
- Left third-party names unchanged (Depositphotos texture, "brast" leaf, Chives / artichoke base models); noted in `reference-assets/README.md`

## 2026-10-02 — Project docs
- Added `todo.md`: 17 numbered sections of checklist tasks for the next few weeks
- Added `standards.md`: coding standards, led by the "no unwanted or bloat comments" rule
- Initialised git (user)

## 2026-10-02 — Append-only changelog
- Added `CHANGELOG.md` and the `.githooks/pre-commit` hook that blocks edits to existing changelog content
- Set `core.hooksPath` to `.githooks`

## 2026-10-02 — CLAUDE.md
- Added `CLAUDE.md` so new Claude Code sessions start with the project context: spec, todo and standards pointers, changelog rule, asset rules

## 2026-10-02 — Housekeeping (todo section 1)
- Permission email stays on the user's phone; removed the "save PERMISSION.md" instruction from `reference-assets/README.md`
- Checked the reference site at phone width; added section 9 "Mobile" to `website.md` (native scroll on `.app` with no Lenis, the Menu overlay, mobile section heights, stacked layouts)
- Psychotherapy, About and Contact couldn't be checked on mobile (loader didn't release in an iframe); added a todo to check on a real phone

## 2026-10-02 — Project setup (todo section 2)
- Scaffolded Vite 8 + React 19 + TypeScript 6 (strict) at the repo root; oxlint + Prettier; `npm run check` runs typecheck, lint and format check
- Installed react-router 7, gsap 3.15, lenis 1.3, three r186, @react-three/fiber 9, @react-three/drei 10, @fontsource Cormorant + Inter
- Added `/:lang` routing (en, uk) with Home, Psychotherapy, About, Contacts, Privacy policy placeholders and an unknown-language redirect
- Added design tokens (`src/styles/tokens.css`), global styles, typed per-language content (`src/content/`), and media-query hooks (reduced motion, fine pointer)
- Lenis wired to `gsap.ticker` and ScrollTrigger; enabled only on fine-pointer devices without reduced motion, matching the reference
- Moved models from `assets/models/` to `public/models/`; Draco decoder copied to `public/draco/` on install (git-ignored)
- Added dev-only model lab at `/dev/models`; all 6 models load, decode and render
- Fixed: drei `<Html>` as a Suspense fallback crashed the tree on unmount; replaced with a DOM progress overlay
- Updated `standards.md` (oxlint, @fontsource, config default-export exception, draco folder), `CLAUDE.md` and the reference README for the new paths

## 2026-10-02 — O.LA follow-up
- O.LA confirmed the third-party model parts may be published, on condition that some changes are made; the exact changes aren't recorded yet (todo added in section 1)
- Text and branding to be replaced later by the user; the build uses original placeholder copy, not the reference site's text

## 2026-10-02 — Shared UI components (todo section 3)
- Added `ScrambleText` (per-letter decode on scroll or mount, layout-stable, `aria-label` with the final text), `RollingText` (hover / active letter roll), `BlurReveal`, `RoundButton` (scroll-in + magnetic pull on fine pointers), `SectionLabel`, `ConnectorLine`, `LangSwitch`, `NavLinks`
- Added `Header` (frosted strip, nav, language switch; mobile "Menu" button + `MobileMenu` overlay) and `Footer` (wordmark, nav, email, © / privacy / O.LA credit), wired into `LangLayout` with scroll-to-top on route change
- Added `@gsap/react` (`useGSAP`) for animation cleanup; extended the content model (email, menu, footer strings) for en and uk
- Added `CREDITS.md` and a dev-only component lab at `/:lang/dev/ui`
- Verified in Chrome on desktop and at 390px width; `npm run check` and build pass with no lint warnings

## 2026-10-02 — Layout fix: hidden page titles and floating footer
- Page titles sat underneath the fixed header; added `PageTitle` (large serif heading, padded below the header, scramble on mount) and used it on every page
- Footer rode up mid-screen on short pages; `main` now has `min-height: 100svh`
- Checked in Chrome on `/en/contacts` and `/uk/psychotherapy`

## 2026-10-02 — Preloader (todo section 4)
- Added `Preloader`: 5×19 letter grid with the site name hidden in row 3 (Latin or Cyrillic noise letters by language); letters scramble in as loading progresses, with a minimum fill time
- Preloads fonts and all 6 GLB models (plain fetch for progress, then GLTF preload decodes from cache), capped at 12s
- Waits for the first interaction (pointer move, tap, key, wheel) or 2.5s, so keyboard and touch users never get stuck (the reference can hang)
- Exit: noise letters fade, name letters fly (FLIP) onto the header logo letters, overlay fades; header logo now renders per letter
- Added `animation/intro.ts` phases (loading → reveal → done): scroll locked and Lenis stopped until done; ScrambleText, BlurReveal and RoundButton wait for reveal so nothing animates behind the loader
- Moved scramble logic and styles into shared `animation/scramble.ts` and `styles/scramble.module.css` (used by ScrambleText and the preloader)
- Runs on hard loads only; in-app navigation skips it
- Verified with checks, build, and in Chrome by driving GSAP's ticker manually (the test tab was in a background window, which pauses animation frames); the letter flight still needs a visual check in a visible tab

## 2026-10-03 — Preloader visual check
- User watched the letter flight in a visible tab: looks good, no timing changes needed

## 2026-10-03 — Ink page transition (todo section 5)
- Added `InkTransition`: full-screen raw WebGL canvas (`shaders/fullscreen.vert`, `shaders/ink.frag`) drawing a noise-edged watercolour wash with a brown tide line (`--tide` token) and paper grain
- Internal link clicks are captured globally: cover (0.9s), then route swap, then reveal (1.0s) with a new noise seed; clicks blocked and Lenis stopped while covering; ignores new-tab, modifier, external, download and same-page hash links
- Reduced motion or no WebGL: plain cream cross-fade
- Lenis scroll-to-top on route change now uses `force: true` (a stopped Lenis ignored it)
- Verified in Chrome by stepping GSAP's clock (background tab): mid-sweep frame, route swap behind the cover, reveal, and EN → UK switch

## 2026-10-03 — Ink transition slowed to match the reference
- User flagged the transition as too fast; read the reference bundle's settings: 5.6s round trip (5.4s on phones), cover `sine.in`, reveal `sine.out`, radial spread from just outside the bottom-left corner, unlock 1s before the reveal ends
- Was 1.9s total with `power2.inOut` from the left edge; now uses the reference timings, eases and corner origin (`uOrigin` uniform in `ink.frag`)
- Recorded the measured values in `website.md` section 3.3; added a todo for the reference's centre-origin ink reveal after the preloader

## 2026-10-03 — Fix: scrollbar jump and repeat clicks during the ink transition
- Scrollbar vanished during transitions: `.lenis.lenis-stopped { overflow: hidden }` in `globals.css` hid it when Lenis was stopped, shifting the layout ~15px; removed (Lenis already blocks wheel/touch while stopped) and added `scrollbar-gutter: stable` so the preloader's scroll lock can't shift the layout either
- Links could be clicked repeatedly: since the timing change, links re-enabled 1s before the reveal finished, so a click could start a new cover over the unfinished reveal; links now stay blocked until the reveal fully ends (only scrolling resumes 1s early), and ink tweens use `overwrite: true` on a shared state object
- Verified in Chrome: page width unchanged during a transition (1905px before and during); 8 clicks during the cover and 3 during the last second of the reveal were ignored, with exactly one navigation

## 2026-10-03 — Fix: page unclickable at the end of the ink reveal
- Cause: the previous fix kept the transition canvas catching clicks until the reveal fully ended, but the `sine.out` reveal's last ~1s is nearly invisible, so the page looked ready while clicks and the hand cursor were swallowed
- `InkTransition` now has explicit phases (idle → cover → reveal → tail): the canvas releases the pointer and scrolling 1s before the reveal ends (as the reference does); a click in that tail starts the next cover from the ink already on screen (same noise seed, duration scaled to the remaining distance), so there is no overlap or jump
- Clicks during the cover and the main reveal are still ignored
- Verified in Chrome with a sampled timeline (cover 2.8s, reveal 2.8s, pointer released at ~4.9s) and a tail click that continued from 0.08 ink to the next page; real mouse input can't reach the background test tab, so the hand cursor was checked via hit-testing and computed `cursor: pointer`

## 2026-10-03 — Ink transition visual check
- User watched transitions in a visible tab: looks good, no speed or colour changes needed
