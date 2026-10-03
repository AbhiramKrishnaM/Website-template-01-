# Eugenia Grab Clone — TODO

Spec: [website.md](website.md) · Models: `public/models/` · Model lab: `/dev/models` (dev only) · Originals + notes: `reference-assets/`
Rough pace: 1–2 sections per week. Sections 1–4 are the foundation; do them in order.

## 0. Research (done)

- [x] Walk through every page of the reference site in the browser
- [x] Identify the stack (React, GSAP, Lenis, Three.js r148, Draco)
- [x] Write the build spec in `website.md`
- [x] Download the 6 flower models + ranunculus textures
- [x] Inspect models (triangle counts, animations, materials)
- [x] Rename model files and O.LA-specific names, log changes in `rename-log.md`

## 1. Housekeeping

- [x] Keep O.LA's permission email safe (stored on the user's phone, not in the repo)
- [x] Ask O.LA whether the third-party parts (Depositphotos texture, "brast" leaf, Chives / artichoke base models) can be redistributed (yes, with changes)
- [ ] Record O.LA's requested changes in `reference-assets/README.md` and apply them
- [x] `git init`, first commit (check `reference-assets/` is ignored)
- [x] Check the reference site at 390px width and fill in the mobile notes in `website.md`
- [ ] Check the Psychotherapy sticky card, About diplomas and Contact on a real phone (iframe check didn't load them)
- [ ] Decide our own name, copy and colour tweaks (no reused text or photos) — later; original placeholder copy for now

## 2. Project setup

- [x] Scaffold Vite + React + TypeScript
- [x] Add React Router with `/:lang/*` routes (`/en`, `/uk`) and the 4 pages + privacy policy
- [x] Install GSAP, ScrollTrigger, Lenis, three, @react-three/fiber, @react-three/drei
- [x] Wire Lenis to `gsap.ticker` and `ScrollTrigger.update` (desktop only, like the reference)
- [x] Self-host Cormorant + Inter (via `@fontsource`, bundled woff2)
- [x] Add the design tokens from spec section 2 as CSS variables
- [x] Set up the Draco decoder path and test-load all 6 GLBs in a scratch scene
- [x] Add a `prefers-reduced-motion` hook for later sections

## 3. Shared UI components

- [x] Header: wordmark, nav links, `EN — UK` toggle
- [x] Header frosted strip (`backdrop-filter` blur with a fade-out mask)
- [x] Rolling-text hover on nav links + active-route underline
- [x] `RoundButton`: mauve circle, darker on hover, magnetic pull toward the cursor
- [x] `RoundButton` scroll-in (scale 0.6 → 1 + fade)
- [x] `ScrambleText`: per-letter random swaps, fixed widths, ScrollTrigger replay
- [x] `BlurReveal`: paragraphs fade in from blur, staggered by line
- [x] `SectionLabel`: thin arrow line + caps label
- [x] Vertical connector line that draws itself on scroll
- [x] Footer: wordmark, nav, email, © / privacy / credits row (credit O.LA)
- [x] Mobile header: "Menu" button with Menu → Close roll and full-screen menu overlay

## 4. Preloader

- [x] 5×19 letter grid with brand letters hidden in row 3
- [x] Per-letter flicker / glyph-swap animation (letters appear as loading progresses)
- [x] Preload fonts, GLBs and textures; track progress (textures added when sections need them)
- [x] Wait for the first `pointermove` (with touch / timer fallback on mobile) — also key, wheel, and a 2.5s timeout
- [x] Exit: random letters fade, brand letters FLIP to the header logo
- [x] Lock scroll and stop Lenis until ready
- [x] Only run on hard loads, not on in-app navigation
- [x] Watch the letter flight in a visible tab and tune timings if needed (user: looks good)
- [ ] After the preloader, reveal the page with a 5.6s ink wash spreading from the screen centre (as the reference does)

## 5. Ink page transition

- [x] Full-screen canvas / WebGL quad above the app (raw WebGL, no Three.js)
- [x] Noise-based ink mask with a darker "tide-line" edge
- [x] Cover animation (0 → 1), then swap route, then reveal (1 → 0, new seed)
- [x] Transition context so links wait for the cover to finish (global click capture, no Link changes needed)
- [x] Scroll to top and restart ScrollTriggers after the swap
- [x] Reduced-motion fallback: simple cross-fade (also used when WebGL is unavailable)
- [x] Watch a transition in a visible tab and tune speed / edge colour if needed (user: looks good)

## 6. Glass-flower shader

- [x] Plane component that takes an image texture (`GlassFlower`, raw WebGL, renders only while on screen)
- [x] Frosted blur + desaturation pass
- [x] Clear lens with sharper colour inside — rebuilt as a cursor-following lens with a lagging trail and curved-glass magnification (auto-drifts on touch screens)
- [x] Film grain + bottom fade
- [x] `uDissolve` uniform: grain breaks up and lifts on scroll-out
- [x] Source / prepare our own 4 flower photos (hero, 2 CTAs, contact) — using the reference photos (permission per user) in `public/images/flowers/`
- [x] Misty noise frosting, feathered photo edges, colour grading, and an intro reveal through noise
- [ ] Tune each flower's scale / position / look when it's placed in its real section (sections 7, 11, 12, 13)

## 7. Home — hero + intro

- [x] Hero: 4-line staggered quote layout over the glass flower
- [x] Pin hero; scramble quote lines out on scroll (230svh hero, sticky inner, scrub 1.4, matches reference timing)
- [x] Hook hero scroll progress to the flower dissolve
- [ ] Intro: instanced dandelion seeds drifting (fall, sway, rotate, parallax)
- [ ] Intro: 2-line caps statement + 3 centered paragraphs with connector lines
- [ ] Background colour change into the next section

## 8. Home — pinned 5-slide flowers (biggest chunk, plan ~2 weeks)

- [ ] Pin the section for ~8.5 viewports, split into 5 slide ranges
- [ ] Slide layout: flower left, heading + quote + author right
- [ ] Giant background numerals 01–05 with cross-fade
- [ ] Circular background wipe between slide colours
- [ ] Bottom-right stacked-circle progress counter (1/5–5/5)
- [ ] One fixed R3F canvas; swap the visible model per slide
- [ ] Scrub each model's baked animations with `mixer.setTime(progress × duration)`
- [ ] Echinacea: drive its morph targets from scroll too
- [ ] Grey → colour bloom (mix texture sets or `onBeforeCompile` height mask)
- [ ] Particle dissolve on exit (`MeshSurfaceSampler` points pushed by curl noise)
- [ ] Dandelion: procedural motion (no baked animation)
- [ ] Slow Y rotation during the hold phase
- [ ] Performance pass: frameloop on demand outside this section, DPR cap 1.5

## 9. Home — wishes → WELLNESS → ranunculus

- [ ] Featured wish card: giant initial, vertical rule, heading + paragraphs
- [ ] Grid of 5 more wishes with pale initials
- [ ] Pick our own 6 items whose initials spell a word
- [ ] FLIP the initials from the cards into the centered word
- [ ] Ranunculus scene: model + PBR textures, slow rotation
- [ ] Falling petals (instanced, tumbling)
- [ ] Floating dust points
- [ ] Blurred foliage sprites at the edges with parallax
- [ ] Exit: word fades, flower scales up and fades to cream

## 10. Home — profile + accordion

- [ ] Profile: section label, portrait clip-path reveal
- [ ] Name, certified-specialist list with logos
- [ ] Experience list (years | description) + "More details" button
- [ ] Accordion: 4 underlined caps headings, one open at a time
- [ ] Open / close height tween with blur-in content
- [ ] First item open by default

## 11. Psychotherapy page

- [ ] Page title + 4 numbered panels on alternating tints
- [ ] Sticky center image card across all panels
- [ ] Ink-gradient wipe between card images per panel
- [ ] Paper-bend vertex shader driven by scroll velocity
- [ ] Prepare our own 4 pressed-flower artworks with torn-edge masks
- [ ] Panel 03 "free consultation" sub-block; panel 04 round CTA
- [ ] Session length & frequency heading + 2×2 info grid
- [ ] Closing CTA with glass flower + "Book a Session"

## 12. About page

- [ ] Huge split name around the portrait
- [ ] Opposite horizontal parallax on the name lines; portrait parallax
- [ ] Zig-zag numbered text blocks + second portrait
- [ ] Big mauve statement + "Send a request" + connector line
- [ ] Diplomas: scattered mosaic of 7 certificate cards
- [ ] Diplomas: numbered list of 7 qualifications
- [ ] Hover a list item → its card FLIPs to the enlarged slot
- [ ] Non-hover devices: advance the active diploma on scroll
- [ ] Closing CTA with glass flower

## 13. Contact page

- [ ] Title over full-bleed glass-flower background
- [ ] Two location columns, availability, email block
- [ ] "Get in touch" form: name, email, country, message
- [ ] Underline-only inputs that turn accent on focus
- [ ] Custom radio buttons for session type
- [ ] Honeypot field + POST to a form endpoint (Formspree / HeroTofu / own)
- [ ] Design and build success + error states
- [ ] Client-side validation messages

## 14. Language + content

- [ ] i18n setup (EN + second language) with route-based switching
- [ ] Translate all copy; check long words don't break layouts
- [ ] Privacy policy page
- [ ] Page titles, meta descriptions, Open Graph image, favicon

## 15. Responsive, accessibility, performance

- [ ] Mobile layouts for every section (stack slides, shorten pins)
- [ ] Tablet check (768–1024px)
- [ ] Reduced-motion versions of scramble, ink, dissolve and pins
- [ ] Keyboard focus styles; canvases `aria-hidden`; real text in the DOM
- [ ] Compress textures (KTX2 or smaller WebP), decimate heavy models if needed
- [ ] Lighthouse pass; test on a low-end phone
- [ ] Cross-browser check (Chrome, Safari, Firefox)

## 16. Ship

- [ ] Get answers on third-party parts, or replace them (section 1)
- [ ] Credits page / footer credit for O.LA and any CC-BY assets
- [ ] Deploy (Vercel / Netlify)
- [ ] Final walkthrough against the reference site
