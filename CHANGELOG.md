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
