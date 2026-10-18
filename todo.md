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
- [x] Intro: dandelion seeds drift upright and then fly down to land in their slots on the slide-1 dandelion (`SeedFlight`)
- [x] Intro: 2-line caps statement + 3 centered paragraphs with connector lines
- [x] Background colour change into the next section (cream intro → blush cards section)

## 8. Home — pinned 5-slide flowers (biggest chunk, plan ~2 weeks)

- [x] Pin the section for ~8.5 viewports, split into 5 slide ranges (900svh, sticky inner, scrub 1.2 desktop / 0.2 touch)
- [x] Slide layout: flower left, heading + quote + author right (flower stage empty until part 2)
- [x] Giant background numerals 01–05 (fixed 0; stacked digits swap by clip + small slide; 0 and later digits dim to 30% on desktop)
- [x] Circular background wipe between slide colours (grows out of the next slide's progress circle; 2 timeline units per slide)
- [x] Bottom-right stacked-circle progress counter (1/5–5/5)
- [x] One fixed R3F canvas; swap the visible model per slide (fade + scale hand-off; lazy-loaded)
- [x] Scrub each model's baked animations from scroll (per-clip `action.time` + `mixer.update(0)`; `setTime` froze finished clips)
- [x] Echinacea: drive its morph targets from scroll too (comes with the clip scrubbing)
- [x] Grey → colour bloom (monochrome ink → natural colours via an `onBeforeCompile` patch, per slide)
- [x] Flower swap follows the wipe: incoming flower clipped inside the circle, outgoing outside, stippled boundary (replaces the planned particle dissolve)
- [x] Hover: flower shakes when the cursor moves over its head (damped spring)
- [x] Card titles reveal word by word from the left; section label fades as the pin starts
- [ ] Dandelion: procedural motion (no baked animation)
- [x] Slow Y rotation during the hold phase
- [ ] Performance pass: frameloop on demand outside this section, DPR cap 1.5

## 9. Home — wishes → WELLNESS → ranunculus

- [x] Featured wish card: giant initial, vertical rule, heading + paragraphs
- [x] Grid of 5 more wishes with pale initials
- [x] Pick our own 6 items whose initials spell a word
- [x] FLIP the initials from the cards into the centered word
- [x] Ranunculus scene: model + PBR textures, slow rotation
- [x] Falling petals (instanced, tumbling)
- [x] Floating dust points
- [x] Blurred foliage sprites at the edges with parallax
- [x] Exit: word fades, flower scales up and fades to cream

### 9b. Wishes rebuild to match the reference (measured 2026-10-18, see `website.md` §4.4 "Confirmed from the reference")

The current `Wishes.tsx` is wrong: bordered cards, the featured card is a static block, all items visible at once, and the letters never "fly". The reference is a borderless **stage + hover selector** that is pinned, then the letters fly into WELLNESS.

Layout (desktop ≥769px):

- [ ] Drop the card borders/boxes; plain text on the cream `#faf5ee` background
- [ ] Heading row: arrow + "YOU WANT" (shared section heading) + italic note, then a **pin track 170dvh** with a **sticky 100dvh pin** inside (`flex column, space-between`)
- [ ] Stage: grid `275rem | 560rem`, 900rem wide, 440rem tall, centred, nudged `left:-30rem`
- [ ] Letter window (275rem wide, `overflow:hidden`) holds all six giant letters stacked; letter 330rem Cormorant `#603d3b`, `letter-spacing:-.08em`, right-aligned with a per-letter `right` offset (W −90rem, others −16…−72rem) so the glyph is **cut off by the window edge at the divider**
- [ ] 1px divider at `left:275rem`, colour `hsla(3,15%,50%,.48)`
- [ ] Panels: all six stacked absolutely in column 2 (`padding-left:68rem`), only the active one visible; kicker 14rem italic → title 38rem caps `#603d3b` → lead 18rem Inter caps → copy paragraphs 18rem
- [ ] Desires row under the stage (`margin-top:auto`): 12-col grid, gap 24/22rem, items 2–4 at cols 1/5/9 span 4, items 5–6 at cols 2/8 span 4
- [ ] Each desire is a `<button>`: small pale letter (64rem, `hsla(0,9%,68%,.28)`) above a block with a 1px left rule `#e5dad4`, italic "Wish No. n" kicker (14rem) and caps title (17rem)
- [ ] Desire hover/focus/active: letter → `#603d3b` and lifts 5rem (`.55s cubic-bezier(.22,1,.36,1)`), title → `#936e6c` (`.45s`)

Hover selector (desktop):

- [ ] `mouseenter` / `focus` / `click` on desire n swaps the stage to panel n; leaving the desires grid (mouseleave, or blur out of it) returns to panel 0
- [ ] Swap timeline (desktop values; mobile in brackets): old letter `xPercent 0→108` + fade, 1.15s [.45] `power2.inOut`; new letter `xPercent 108→0`, 1.35s [.55], starts at .12s [.05]
- [ ] Old panel items fade + `blur(3px)` + `x:20`, .4s [.22] `power2.in`, stagger .025 [.015]; panel hidden at .44s
- [ ] New panel items from `opacity 0, blur(4px), x:-24` to clear, .9s [.45] `power3.out`, stagger .085 [.04], starting at .42s [.18]
- [ ] Inactive letters parked at `xPercent:108, autoAlpha:0`; reduced motion swaps instantly
- [ ] While scrolling down past 65% of the pin track, force back to panel 0 (shorter return: .75s / .85s / .32s / .65s) and lock hovering until scrolled back

Fly into WELLNESS (desktop):

- [ ] Wellness track 300dvh with a sticky 100dvh screen; centred target word: one span per char, 26rem white Cormorant caps with text-shadow `0 2rem 22rem rgba(45,12,22,.45), 0 1rem 6rem rgba(30,8,16,.3)`
- [ ] Our word: the 6 item initials are "slot" chars, the extra letters are "filler" chars (reference: W·E·L·L·N·E·S·S, the two E's are fillers)
- [ ] Fly timeline scrubbed (`scrub .5`) from pin-track `bottom bottom` over `+= innerHeight`; measure each slot's offset + scale (`target fontSize / source fontSize`) and re-measure on refresh / `document.fonts.ready`
- [ ] Stage letter: y + scale over 1 unit `power2.inOut`; x as keyframes (first `letterOffset − 5rem` in .22 `sine.inOut`, then to target .78 `power2.inOut`); window `overflow` → visible at .22; colour → white .25–1.0; text-shadow fades in from .5
- [ ] Desire letters: each starts at `.03 + .02·i` and runs `1 − start`, flying with colour → white and the shadow
- [ ] Panel text blurs out (`blur(10px)`, .35, stagger .02), desire content blurs out (`blur(8px)`, from .02), divider fades (.28), heading blurs out (`blur(6px)`, .32)
- [ ] Fillers fade in from .45: `scale .8→1, blur(4px)→0`, .5 each, stagger .1, `power2.out`
- [ ] At 1.0 swap: hide the flown letters, show the real target chars; add a `--flying` class (no pointer events, no CSS transitions) while progress > 0; scrolling back to 0 resets everything
- [ ] Exit inside the wellness track (`top top → bottom bottom`, `scrub .5`): target chars blur out (`blur(14px)`, `scale 1.04`, random stagger amount .05) at .28–.56; flower exit progress runs .3–.88 `power1.inOut`

Ranunculus tie-in (adjust existing `RanunculusScene.tsx`):

- [ ] Flower lives inside the wellness screen behind the word; canvas masked with a vertical fade (transparent top 0–10%, solid to 66%, fading out by 99%)
- [ ] Driven by fly progress: canvas opacity `smoothstep(p, 0, .45)`, canvas blur `13px·(1 − p/.94)^1.4` → none, stem bend −.15 → 0, head tilt .08 rad → 0, camera target y −.09 → 0 (all damped, λ≈8)
- [ ] Exit progress (smootherstep): flower moves toward camera (z +6.8) and down (y −5), turns y +1.6 rad, scales `1 + p^1.2·1.35`, canvas fades out over .75–1
- [ ] Idle sway + cursor-velocity tilt, reduced as exit progresses

Mobile (≤768px):

- [ ] Separate accordion list instead of the stage: tap toggles one item; collapsed letter 36px pale in a 52px column, expanded letter 86px `hsla(3,15%,50%,.5)` with a 1px vertical rule growing `scaleY 0→1`
- [ ] Items 3 and 5 are staggered (`translateX(46px)` when collapsed); 165px horizontal divider between items
- [ ] Expand: `grid-template-rows 0fr→1fr` 1.4s, titles cross-fade with blur, lead then paragraphs blur in with delays .2/.38/.56/.74s (1.3s, `cubic-bezier(.22,1,.36,1)`); `ScrollTrigger.refresh()` 1.45s after toggling
- [ ] No fly on mobile: target chars blur/scale/rise in (`blur(8px), scale .9, y 10` → clear, stagger .06, `scrub 1.2`, `top 75% → center center`)
- [ ] Remove the old `Wishes.tsx` card markup and FLIP code once the rebuild lands; update `website.md` and `CHANGELOG.md`

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
