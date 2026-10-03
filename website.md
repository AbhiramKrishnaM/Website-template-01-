# Eugenia Grab Clone — Build Spec

Reference: https://www.eugeniagrab.com/en (Awwwards-featured; built by studio O.LA)
Analysed: 2026-10-02, desktop Chrome, viewport 1920×992 CSS px.

> **Measured vs inferred.** Anything under "Observed" or "Measured" came from the live site (DOM, network, screenshots).
> Anything under "Implementation" is our proposed way to rebuild it. The real shader code was not inspected.
>
> **Content rule.** Clone the techniques and layout only. Use our own name, copy, photos and 3D models.
> Do not reuse the practitioner's text, portraits, certificates or GLB files.

---

## 1. Tech stack

### Observed on the reference

| Layer         | Reference uses                                                                                                         |
| ------------- | ---------------------------------------------------------------------------------------------------------------------- |
| App           | React SPA (create-react-app build: `/static/js/main.[hash].js`, `/static/css/main.[hash].css`)                         |
| Routing       | Client-side routes `/en`, `/en/psychotherapy`, `/en/about`, `/en/contacts`, `/en/privacy-policy`; mirrored under `/uk` |
| Animation     | GSAP (`window._gsap`, `gsapVersions`)                                                                                  |
| Smooth scroll | Lenis (`html.lenis`, `lenis-stopped` while the loader is up)                                                           |
| 3D            | Three.js r148 (`window.__THREE__ = "148"`), GLTF + Draco (`draco_decoder.wasm`, `draco_wasm_wrapper.js`)               |
| Fonts         | Self-hosted woff2: Cormorant 300/400/500, Inter 300/400/500                                                            |
| Forms         | HeroTofu endpoint with a `_gotcha` honeypot field                                                                      |
| Analytics     | Cloudflare Web Analytics beacon                                                                                        |

### Proposed for the clone

- Vite + React + TypeScript
- React Router (language prefix `/:lang/*`)
- GSAP + ScrollTrigger (+ SplitText or a hand-rolled splitter)
- Lenis, driven by `gsap.ticker`
- `@react-three/fiber` + `@react-three/drei` (`useGLTF` with Draco), Three r16x
- Custom GLSL shaders via `shaderMaterial` / raw `ShaderMaterial`
- Form endpoint: Formspree, HeroTofu or our own; always include a honeypot field

---

## 2. Design tokens (sampled from screenshots; values approximate)

```css
:root {
  --bg-cream: #f7f3ee; /* main page background */
  --bg-blush: #fcf8f7; /* "What brings you here" start */
  --bg-grey: #ecebea; /* slide 2 */
  --bg-greige: #e0dcdb; /* slide 3 */
  --bg-rose: #d3c8ca; /* slide 4 */
  --bg-mauve: #b5a7a8; /* slide 5 */
  --bg-footer: #e3dad7;
  --ink: #1e2422; /* near-black green-grey text */
  --accent: #946e6c; /* mauve: buttons, active nav, italic labels */
  --accent-dark: #5e3a3c; /* button hover, WELLNESS initials */
  --muted: #8b8583; /* quote authors, captions */
  --numeral: rgba(255, 255, 255, 0.45); /* giant 01–05 numerals */
}
```

| Role               | Font                                                   | Notes                                                    |
| ------------------ | ------------------------------------------------------ | -------------------------------------------------------- |
| Display / headings | Cormorant 400–500, UPPERCASE, tight leading (~1.0–1.1) | Page titles ~120px; slide headings ~44px; wordmark ~40px |
| Hero quote         | Cormorant 400, sentence case, ~80px                    | Staggered line indents                                   |
| Body               | Inter 300–400, 16–18px, leading ~1.4                   | Centered narrow columns (~400px)                         |
| Labels             | Cormorant italic, small, accent colour                 | e.g. "Wish No. 1", "(I can help with)"                   |
| Numbers            | Cormorant, in parentheses, e.g. `(01)`                 | Accent colour                                            |

### Layout

- Container: full width with 50px side padding (wordmark at x=50).
- Nav: right-aligned links (Psychotherapy / About / Contact), with `EN — UK` at the far right.
- Section labels: a thin horizontal arrow line (~120px) on the left, then the label in Cormorant caps.

---

## 3. Global systems

### 3.1 Preloader (`page-loader`)

**Observed**

- Runs on every hard load, not on SPA navigation.
- 5 rows × ~19 serif capitals, centered. Brand letters are mixed into row 3 (`--brand --first` / `--last`); the rest are `--random`.
- Each letter flickers in on its own: an opacity/clip reveal plus glyph swapping. Over ~6–8 s the whole grid resolves to solid.
- Root states: `app--loading app--intro-guarded app--scroll-locked`, then `app--loading`, then `app--ready`.
- **Gate:** after assets load, the grid holds until the first `pointermove`. It then collapses: random letters fade out and the brand letters fly to the header logo (`header-logo__letter`). The hero then fades in.
- `body { overflow: hidden }` and Lenis stopped until ready.

**Implementation**

1. Render the grid as spans. Give each a random delay (0–2 s) and run 6–10 glyph swaps at 50–80 ms, then lock to its final glyph.
2. Combine `Promise.all([fonts.ready, gltfPreload, texturesLoaded])` with a `firstPointerMove` promise. On mobile, use a `touchstart` or timer fallback.
3. Exit timeline (~1.2 s):
   - random letters fade with `opacity: 0, stagger: {amount: .4, from: random}`;
   - brand letters FLIP-tween to the header logo letter rects (GSAP Flip);
   - remove the scroll lock and call `lenis.start()`.

### 3.2 Scramble-text reveal (used on nearly every heading)

**Observed:** as a heading enters the viewport, each character position cycles through random capitals and partly clipped glyphs before settling, left to right. It replays when scrolled back up into view.

**Implementation:** a `<ScrambleText>` component.

- Split into chars and keep each char's width fixed so the layout doesn't jump.
- ScrollTrigger `start: "top 85%"`.
- Per char: delay `i * 0.03 s`, 4–8 random swaps at ~40 ms, then the final char.
- Add a slight vertical clip (`clip-path: inset(0 0 x 0)`) and an opacity ramp to get the "half-drawn glyph" look.

### 3.3 Ink page transition (`ink-transition__canvas`, 2 canvases)

**Measured from the reference bundle (2026-10-03):** 5.6s round trip (5.4s under 767px), half cover with `sine.in` and half reveal with `sine.out`. The wash spreads radially from origin `[-0.16, -0.16]` (just outside the bottom-left corner). The route swaps at 94% cover. Scroll and clicks unlock 1s before the reveal ends. After the preloader, a separate 5.6s reveal spreads from origin `[0.46, 0.56]` (screen centre).

**Observed**

- On route click, a watercolour/ink bleed grows from the left edge, covers the screen in about 0.8 s, and the route swaps.
- The cover is cream with soft brown "tide-line" edges. It then dissolves to reveal the new page, which scrolls to the top.
- Total ~1.6–2 s.

**Implementation:** a full-screen WebGL quad (or a 2D canvas with a noise mask).

- `mask = smoothstep(progress - edge, progress, fbm(uv * 3.0 + time * .1) * .6 + uv.x * .4)`
- Darken the alpha near the mask edge with a band `smoothstep(.0,.03,d) - smoothstep(.03,.08,d)` to fake a watercolour tide line.
- GSAP tweens `progress` 0→1 (cover), then the route swaps, then a second pass runs 1→0 with a different noise seed (reveal).
- Wrap router navigation in a transition context that awaits the cover promise.

### 3.4 Glass-flower shader (`glass-flower-canvas__element`)

**Corrected from the reference bundle (2026-10-03):** the clear region is a cursor-driven lens (head, lagging trail and velocity), not a timed band. The base is perlin-fbm mist over the photo with a feather mask for soft edges, glass curvature, colour grading (saturation, exposure, brightness, highlight lift), an intro reveal (delay, duration, softness) and focus/hover states. Its props include scale, offset (plus mobile variants), hoverRadius, distortion, bleed, softness, grain and image fade start/end. Our implementation (`src/shaders/glass.frag`) is written independently from this description.

**Observed**

- A flat photo (`hero-canvas.webp`) rendered through a frosted-glass look.
- A vertical refraction band, roughly the width of a stem, drifts across the flower and shows sharper, more saturated colour inside it.
- Heavy film grain; soft vignette fade at the bottom.
- On scroll-out it breaks up into grain/particles.
- Reused, with a different image, behind the CTA blocks on Psychotherapy, About and Contact.

**Implementation:** fragment shader on a plane sized to the image.

- Frosted pass: sample the texture with a 9-tap jitter blur offset by `hash(uv*res + time)`, desaturated 30%, mixed toward the background colour.
- Clear band: `band = smoothstep(w, 0., abs(uv.x - bandX(time)))`, where `bandX` oscillates slowly (sin, ~8 s period). Inside the band, sample with a small refraction offset (`uv + normal * .01`) at full saturation.
- Grain: `+ (hash(gl_FragCoord.xy + time) - .5) * .08`.
- Scroll dissolve: a `uDissolve` uniform tied to the ScrollTrigger progress of the hero leaving. Discard where `hash(floor(uv*400.)) < uDissolve` and offset UVs upward with noise, so it looks like dust lifting off.

### 3.5 Smooth scroll

- Lenis with `lerp ~0.1`, wired up as `lenis.on('scroll', ScrollTrigger.update)` and `gsap.ticker.add(t => lenis.raf(t*1000))`.
- Stop Lenis during the loader and the transitions.

### 3.6 Header

- Fixed. Wordmark on the left (Cormorant caps), nav links, language toggle.
- A **72px frosted strip**: `backdrop-filter: blur(12px)` with a mask fading out downward, so content blurs as it passes under.
- Nav link markup holds the label 2–3× (rolling-text hover). On hover the label rolls up and turns `--accent`; the active route is underlined and in `--accent`.

### 3.7 Round CTA buttons

- ~135px circle, `--accent` fill, white Inter 13px label.
- Hover: fill goes to `--accent-dark`, and a magnetic pull moves the button ~6–10px toward the cursor (quickTo x/y, ease `power3`).
- On scroll-in: scale from 0.6 plus opacity.

### 3.8 Body text reveal

- Paragraphs enter with `filter: blur(8px); opacity: 0; y: 20` → `blur(0)`, line by line (stagger 0.08).

---

## 4. Home page (`/en`)

### Measured section heights (scroll budget at 992px viewport)

| #   | Section class     | Height | Role                                              |
| --- | ----------------- | ------ | ------------------------------------------------- |
| 1   | `.hero`           | 2153   | Pinned hero quote + glass tulip                   |
| 2   | `.psychoanalytic` | 2426   | Intro statement + floating dandelion seeds        |
| 3   | `.cards`          | 8424   | Pinned 5-slide "What brings you here"             |
| 4   | `.want`           | 4561   | "I can help with": wishes, then WELLNESS assembly |
| 5   | `.profile`        | 2044   | About teaser                                      |
| 6   | `.expect`         | 1610   | "What to expect" accordion                        |
| —   | footer            | ~700   |                                                   |

### 4.1 Hero (2153px ≈ 2.2 viewports)

**Confirmed from the reference CSS and scroll setup (2026-10-03):**

- `.hero` is `230dvh` tall; `.hero__sticky` is `100dvh`, `position: sticky; top: 0; overflow: hidden`. So the hero stays pinned for ~1.3 screens of scrolling.
- One ScrollTrigger timeline from `top top` to `bottom bottom` with `scrub: 1.4` (the animation trails the scroll by ~1.4s).
- Quote: Cormorant ~80px (50px under 1100px, 32px under 600px), line-height ~1.15, colour `#142022`, positioned at `top: 45%` (55% on phones); separate line breaks on mobile.
- Reduced motion: hero collapses to `100dvh` (no pin).

**Observed timing (desktop walkthrough):** after ~0.5 screen of scroll only the first quote line was scrambling out and the tulip was intact; after ~1 screen the last lines were going and the tulip was mostly dust.

- **Layout:** 4-line serif quote, staggered indents (left, right-offset, center-left, right-offset). The glass tulip sits behind it at center.
- **Timeline** (pinned, scrubbed, progress 0–1 over the pinned distance):
  - Quote lines scramble out one after another, top line first, across ~0.3–0.75.
  - Tulip `uDissolve` ramps over ~0.2–0.95: grain drifts up and the shape thins to dust.
  - Near the end the dandelion seed layer from section 4.2 starts to drift in.

### 4.2 Psychoanalytic intro (2426px)

**Corrected (2026-10-03):** the intro seeds are the dandelion's own five seeds. They hang upright (fluff up, seed down, slight tilt) and scroll with the page at slightly different speeds. As the five-slide section arrives they curve down one after another and land in their slots on the slide-1 dandelion, which starts monochrome and then takes on its natural colours (all five flowers do). The reference materials carry `monochromeColor` / `naturalColor` with `monochrome` / `colored` modes; seed settings include `isPlume`, `uprightRotation`, `baseRotationZ` and `hitRadius`.

- **3D:** ~8–10 instanced dandelion seeds (pappus + seed). Each drifts on its own path: slow fall, sine sway, slow Y rotation, with a parallax speed tied to scroll.
- **Content:** a two-line statement in caps (line 2 in `--accent`), then three short centered paragraphs. A thin vertical connector line (1px, `--muted`) between them draws itself in on scroll (`scaleY` 0→1). The last connector ends in a small arrowhead.
- Background switches from cream to `--bg-blush` at the section end.

### 4.3 "What brings you here" (8424px ≈ 8.5 viewports, pinned) — the signature section

**Timeline, confirmed from the reference (2026-10-03):** two units per slide. Transition k starts at 2(k−1): the fill wipes as a `clip-path` circle growing from the next slide's progress circle (its own size and colour) to past the farthest corner over 1 unit (`power1.inOut`); the old card and progress label hide instantly; digits are stacked, the old one clips away downward while sliding 20% (from +0.1, 0.28 units) and the new one is revealed from the top while settling from −20% (from +0.38, 0.48 units); at +0.5 the new card shows and its title words slide in from −110% (1.05s, `power2.out`, stagger ≤ 0.085). The section label fades at 0; on desktop the "0" and later digits sit at 30% opacity. Flowers are split by the same wipe: the incoming one (monochrome, closed) inside the circle, the outgoing outside, with a dithered boundary; it then opens and colours in. Hovering a flower makes it shake.

**Confirmed from the reference CSS (2026-10-03):** `.cards` 900dvh with a sticky 100dvh inner, base `#fefbfb`; four `clip-path` fill layers `#ededed`, `#dfdbdb`, `#d3c9c9`, `#b5a7a7`; card on the right (right 200px, width 640px, vertically centred); title Cormorant 46px/500 uppercase, letter-spacing −4%; quote 24px italic `#444`; author 16px italic 300 in accent after a 65px rule; numeral 800px weight 300 white at left 70% / top 35%, built as a fixed "0" plus a rolling digit window; progress widget 150px box with circles 93/70/56/42px and 10px labels; scrub 1.2 (0.2 on touch). Mobile: card at top 57% full width, numeral centred at 66% in 50% white, 68px progress widget without labels.

- **Layout** (per slide, 50/50):
  - left: a 3D flower on a stem rising from the bottom edge;
  - right: an uppercase heading (~44px, 2 lines), a quote in Inter italic ~22px, then an author line (short rule + italic accent name);
  - behind the heading: a giant numeral `01`–`05` in Cormorant ~500px, `--numeral` colour.
- **Section label:** arrow line + "WHAT BRINGS YOU HERE" at the top left, which scrambles in.
- **Progress widget**, bottom right: stacked translucent circles labelled `1/5 … 5/5` (Cormorant italic, tiny). Circles collapse into the next as each slide passes.
- **Per-slide budget:** ~1.6 viewports each. Proposed phases:

| Phase (slide-local progress) | What happens                                                                                                                                                                                                            |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 0.00–0.15                    | A circular background wipe grows from the bottom right (clip-path circle 0→150%) in the next slide's colour. The previous heading and quote fade to 30%, and the previous flower dissolves into particles at the edges. |
| 0.10–0.30                    | Numeral cross-fades (old fades, new fades and rises ~40px). Heading scrambles in.                                                                                                                                       |
| 0.20–0.40                    | New flower grows/rises in **monochrome dark grey**.                                                                                                                                                                     |
| 0.35–0.70                    | **Bloom:** colour sweeps through the flower from the stem up (or centre out) and petals open slightly. Quote blurs in.                                                                                                  |
| 0.70–1.00                    | Hold; flower rotates slowly on Y (~15°).                                                                                                                                                                                |

- **Slides** (our content goes here; reference pairing shown for model choice only):

| #   | Reference flower model                    | Background token |
| --- | ----------------------------------------- | ---------------- |
| 01  | Dandelion seed head                       | `--bg-blush`     |
| 02  | Globe thistle (black ball → blue spikes)  | `--bg-grey`      |
| 03  | Hydrangea (grey → white/green)            | `--bg-greige`    |
| 04  | Echinacea (black, drooping → pink petals) | `--bg-rose`      |
| 05  | Artichoke (black → green with purple top) | `--bg-mauve`     |

- **Reference GLB findings** (inspected locally from `reference-assets/`, which is study-only and must not be deployed):

  | File                      | ~Tris | Meshes           | Animations | Morph   | Notable extensions              |
  | ------------------------- | ----- | ---------------- | ---------- | ------- | ------------------------------- |
  | dandelion-next            | 300k  | 19               | 0          | no      | clearcoat                       |
  | mordovnik (globe thistle) | 169k  | 553 (1652 nodes) | 1100       | no      | ior, specular                   |
  | gortenzia (hydrangea)     | 55k   | 120              | 120        | no      | ior, specular                   |
  | echinacea-web             | 38k   | 20               | 19         | **yes** | —                               |
  | artichok                  | 254k  | 50               | 51         | no      | —                               |
  | ranunculus-happiness-web2 | 236k  | 33               | 0          | no      | clearcoat, sheen, specular, ior |
  - All files are Draco + WebP compressed. Exporters: Blender glTF I/O 5.0 and glTF-Transform 4.x.
  - **The bloom is mostly baked keyframe animation** (one clip per petal/floret node), not only a shader. The likely approach is `AnimationMixer` with every action playing, then `mixer.setTime(progress * clipDuration)` driven by ScrollTrigger scrub.
  - Echinacea also uses morph targets (likely the petal droop to open).
  - Material names hint at a colour swap: e.g. Gortenzia `Baked_Ivory / Baked_Cool / Baked_Blush`, Mordovnik `Live_Baked`. The grey→colour change may be a mix between baked texture sets.
  - Dandelion and ranunculus have no animations; their motion is procedural (rotation, seeds, petals).
  - Requires a `DRACOLoader` with decoder path set; drei `useGLTF(url, true)` handles this.

- **Bloom shader (implementation; layer on top of the scrubbed animation):** patch `MeshStandardMaterial` with `onBeforeCompile`.
  - `float m = smoothstep(uBloom - .15, uBloom, vHeight01 + noise(vPos*4.)*.1);`
  - `diffuse = mix(vec3(luma(diffuse))*.25, diffuse, m);`
  - `vHeight01` is the model-space Y normalised over the bounding box.
  - Optional: ease petal morph targets or bone rotations with the same `uBloom`.
- **Particle dissolve (implementation):** sample N points on the mesh surface (`MeshSurfaceSampler`, ~20k) into a `Points` object with matching colour. While a flower exits, fade mesh opacity and push the points outward along the normal plus curl noise, fading them over 0.15 progress. The stippled look in the screenshots suggests the dandelion may be point-based throughout.
- One R3F `<Canvas>` fixed behind the pinned section; swap the visible model by slide index. Preload all GLBs during the loader.

### 4.4 "I can help with" / Wishes → WELLNESS (4561px)

- **Part A — wishes grid** (~1.5 viewports):
  - Label: arrow line + "YOU WANT" style heading + italic "(I can help with)".
  - Featured wish: a giant serif initial on the left (~250px, `--accent-dark`) beside a vertical 1px rule; on the right, italic "Wish No. 1", an accent heading, a caps subheading and three paragraphs.
  - Below: a row of 3 then a row of 2 wishes, each with a pale giant initial, an italic "Wish No. n" label and a caps title.
  - The six initials spell **W-E-L-L-N-E-S-S** minus duplicates: W, L, L, N, S, S are visible. Pick our own six items whose initials assemble into a word.
- **Part B — assembly** (~1 viewport):
  - Card text blurs out.
  - The giant initials (absolutely positioned clones) FLIP-tween from their card positions to center, forming the word.
  - The word shrinks to ~28px white Cormorant caps, letter-spaced.
- **Part C — ranunculus scene** (~2 viewports, pinned):
  - 3D ranunculus (PBR basecolor + 4K normal map, reference uses `ranunculus-petals-*` textures), centered and slowly rotating.
  - Word sits on top of the bloom.
  - Falling petals: instanced petal meshes with tumble rotation.
  - Floating white dust points.
  - Blurred foliage PNG sprites (`grass.webp`) at the left and right edges, slight parallax.
  - Exit: the word fades, the flower scales up slightly and fades to cream, foliage blurs out.

### 4.5 Profile teaser (2044px)

- Label "ABOUT ME"; centered portrait (~460×600) with a clip-path reveal upward plus a slight scale 1.1→1.
- Name in large caps beneath.
- "Certified specialist:" block: arrow line, list of 3 bodies, small association logos.
- Experience list in two columns (years | description), Inter, muted.
- "More details" round CTA linking to `/about`.

### 4.6 "What to expect" accordion (1610px)

- Label "WHAT TO EXPECT".
- 4 items as centered underlined Cormorant caps headings (~40px). The open item is in `--accent`, the others in `--ink`.
- Only one open at a time (`expect-accordion__item`, trigger is a `<button>`).
- **Open:** height auto-tween ~0.6 s `power2.inOut`; content does blur 8px → 0 plus opacity, stagger by paragraph.
- **Close:** the reverse, ~0.4 s.
- First item open by default.

### 4.7 Footer (shared)

- `--bg-footer` block: centered large wordmark (scrambles in), nav row, email link, then a bottom row with © year, privacy policy and studio credit.
- Footer content blurs in.

---

## 5. Psychotherapy page (`/en/psychotherapy`) — total ~6677px

| Section          | Height |
| ---------------- | ------ |
| `.psychotherapy` | 3168   |
| `.details`       | 1738   |
| `.cta`           | 1123   |

### 5.1 Numbered panels with pinned morphing card (3168px)

- **Layout:**
  - page title ~120px caps at the top left;
  - 4 full-width rounded-rect panels on alternating tints (`#F3EEEA` / `#F2E9E5`), each holding a number `(0n)`, a 2-line caps heading on the left, and 2–3 paragraphs on the right;
  - a center image card (~250×360, white matte border, soft shadow), **sticky** across all panels.
- **Card:**
  - Content: pressed-flower artwork (botanical on a cyanotype-style ink background with torn edges).
  - Transitions: as each panel passes the center, the image changes with an **ink-gradient wipe**. The next image's background colour floods in from the bottom with a soft, noisy edge.
  - Reference sequence: navy → green → burgundy → red.
  - The card **bends**: during the wipe its sides bow inward and outward like paper flexing.
- **Implementation:**
  - Card = R3F plane with 32×32 segments.
  - Vertex shader: `pos.x *= 1. + sin(uv.y*PI) * uBend * sign(pos.x) * .08`, where `uBend` follows scroll velocity.
  - Fragment shader: `mix(texA, texB, smoothstep(p-.1, p, 1.-uv.y + fbm(uv*4.)*.15))`.
  - Panel headings use ScrambleText; paragraphs blur in.
- Panel 03 includes a "FREE INITIAL CONSULTATION" sub-block (arrow line + caps + small paragraph).
- Panel 04 includes a "Send a request" round CTA on the right.

### 5.2 Details (1738px)

- Huge 2-line centered heading ("SESSION LENGTH & FREQUENCY" style, ~90px), then a short centered paragraph.
- 2×2 grid of info blocks: arrow line, accent caps title, bold first line, then paragraphs.
- Topics: fee, payment, commitment, weekly slot.

### 5.3 CTA (1123px)

- Huge 2-line statement, glass-flower shader behind it (a different flower image), small 2-line caption, "Book a Session" round button.
- The glass flower dissolves on exit.

---

## 6. About page (`/en/about`) — total ~8172px

| Section      | Height |
| ------------ | ------ |
| `.about`     | 2973   |
| `.provide`   | 983    |
| `.diplomas`  | 2360   |
| `.about-cta` | 1208   |

### 6.1 Intro (2973px)

- "ABOUT ME" title, then small "I'M".
- First name in huge `--accent` caps (~130px) on the left.
- Portrait (~330×500) overlapping the baseline.
- Surname to the right of the portrait.
- On scroll, the name lines drift horizontally in opposite directions (parallax x ±80px) and the portrait parallaxes up.
- Then a zig-zag of text blocks (`(01)`, `(02)`…, tiny numbered labels), alternating columns, plus a second portrait on the left.

### 6.2 Provide (983px)

- Huge 2-line mauve caps statement (~70px), centered, scramble reveal.
- Supporting line blurs in.
- "Send a request" round CTA.
- A vertical connector line draws in below.

### 6.3 Diplomas (2360px)

- **Left: mosaic** of 7 certificate thumbnails (`diplomas-mosaic__item--1..7`) in a scattered collage, each on a pale card. The **active** item is enlarged (~385×481) at a focal position.
- **Right: list** of 7 items (`diplomas-texts__item`), each with a `(0n)` label, a caps Cormorant title (~24px) and a bottom hairline.
- **Interaction:** hovering a list item sets `--active` on both the list item and the matching mosaic item.
  - The active list title turns `--accent`.
  - The mosaic item animates to the enlarged focal slot while the previous one shrinks back (FLIP).
  - Inactive mosaic items are slightly blurred and faded.
- On mobile / no-hover, use a ScrollTrigger to advance the active item instead (suggested).

### 6.4 About CTA (1208px)

- Same pattern as 5.3: big statement, a glass shader using a lily-type image, caption, "Book a Session".

---

## 7. Contact page (`/en/contacts`)

| Section         | Height |
| --------------- | ------ |
| `.contacts`     | 1568   |
| `.tought` (sic) | 1317   |

### 7.1 Contacts

- "CONTACTS" title over a large full-bleed glass-flower background (magnolia-type image). Heavy frosted look, centre stamen in focus.
- Two columns: arrow line + location title (UK / Ukraine), then address lines.
- Centered blocks: "Availability" (days + note), "Email me directly" + email link.
- Text blurs in.

### 7.2 Get in touch form

- "GET IN TOUCH" title ~100px, scramble.
- Fields: Name, Email, Country, Message (textarea). Each has a tiny Inter label above an underline-only input; the 1px line uses `--muted` and turns `--accent` on focus.
- Radio group "session type" with 2 options; custom circle radios with an accent inner dot.
- Small muted "I will contact you within 24 hours" next to a "Send a request" round submit button.
- Hidden honeypot input `_gotcha`.
- Submit with `fetch` POST to the form endpoint, then show success/error states inline (needs design; not observed).

---

## 8. Assets to source or create (our own)

| Asset                      | Reference equivalent                                                                         | Notes                                                                                                                                |
| -------------------------- | -------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| 6 flower GLBs              | dandelion, gortenzia (hydrangea), artichok, mordovnik (globe thistle), ranunculus, echinacea | Draco-compress with `gltf-transform`. Need clean UVs + vertex height for the bloom mask. Sketchfab (CC-BY), Poly Haven, or modelled. |
| Petal texture + normal map | ranunculus basecolor + 4K normal                                                             | Downscale the normal map to 2K for the web.                                                                                          |
| Glass-flower photos ×4     | tulip, CTA flower, lily, magnolia                                                            | High-key, soft background, ~2000px WebP.                                                                                             |
| Pressed-flower artworks ×4 | cyanotype-style botanicals                                                                   | Torn-edge PNG mask + coloured ink backgrounds.                                                                                       |
| Foliage sprites            | `grass.webp`                                                                                 | Blurred leaves, transparent WebP.                                                                                                    |
| Portraits ×2               | —                                                                                            | Our subject.                                                                                                                         |
| Certificates ×7            | —                                                                                            | Placeholder documents.                                                                                                               |
| Fonts                      | Cormorant, Inter                                                                             | Both on Google Fonts (OFL); self-host woff2.                                                                                         |

---

## 9. Mobile (observed at 390×817 in an iframe) and performance notes

### Scrolling

- **No Lenis on mobile.** `html` has no `lenis` class. The scroll container is `div.app` with native `overflow-y: auto`; `html` and `body` are `overflow: hidden`.
- ScrollTrigger must use `scroller: ".app"` on mobile (or the same container everywhere, for consistency).
- The loader's pointer gate still applies. In an iframe it sometimes never released, so give the gate a touch/timer fallback.

### Header and menu

- Header becomes the wordmark (smaller, ~18px) plus a single **"Menu"** text link, underlined in `--accent`.
- Tapping it opens a full-screen cream overlay:
  - the header label rolls letter-by-letter from "Menu" to "Close" (`header-menu__char` masks);
  - "MENU" title in accent caps;
  - numbered links `(01) Psychotherapy`, `(02) About`, `(03) Contact` in Inter ~22px, scrambling in;
  - an underlined "Book 20-min session" link, the email, and an `Eng  Uk` toggle at the bottom.
- Closing reverses it, with the links scrambling out.

### Measured section heights (mobile vs desktop)

| Section                        | Mobile | Desktop |
| ------------------------------ | ------ | ------- |
| Home `.hero`                   | 1879   | 2153    |
| Home `.psychoanalytic`         | 1852   | 2426    |
| Home `.cards`                  | 7353   | 8424    |
| Home `.want`                   | 2034   | 4561    |
| Home `.profile`                | 1327   | 2044    |
| Home `.expect`                 | 853    | 1610    |
| Psychotherapy `.psychotherapy` | 3269   | 3168    |
| Psychotherapy `.details`       | 1279   | 1738    |
| Psychotherapy `.cta`           | 817    | 1123    |

### Layout changes

- **Hero:** quote ~26px, still staggered; the glass tulip fills the width. Same scroll dissolve.
- **5-slide flowers:**
  - stacks vertically, with the flower in the top half (stem cut off mid-screen) and the numeral + heading + quote below;
  - the circular colour wipe and the bottom-right progress counter are kept;
  - still pinned, with ~1.5 viewports per slide.
- **Wishes:** single column. The giant initial sits to the left of each item, with the featured wish text full-width. The WELLNESS assembly and ranunculus scene are kept, with the flower filling the screen.
- **Profile:** full-width portrait; lists become a single column with short rules; the "More details" circle is centered.
- Not verified on mobile: the Psychotherapy sticky card, the About diplomas, and Contact (the loader didn't release in the iframe). Check these on a real phone.

### Performance

- One shared R3F canvas per page, with `frameloop="demand"` outside active pinned sections and DPR capped at 1.5.
- Preload GLBs and textures during the loader; the loader's pointer gate gives free load time.
- Respect `prefers-reduced-motion`: skip scramble, use cross-fades instead of ink and dissolve, and don't pin sections.
- Keep real text in the DOM (headings, the WELLNESS word, nav) for accessibility and SEO; canvases are decorative (`aria-hidden`).

---

## 10. Build order

1. **Scaffold:** Vite + React + Router (lang prefix) + tokens + fonts + Lenis/GSAP wiring.
2. **Shared UI:** Header (frost strip, rolling links, lang toggle), Footer, RoundButton (magnetic), ScrambleText, BlurReveal.
3. Preloader with the pointer gate and FLIP to the header logo.
4. Ink page transition.
5. Glass-flower shader component (reused 4×).
6. Home hero + dissolve.
7. Dandelion seeds section.
8. **Pinned 5-slide flowers:** models, bloom shader, particle dissolve, circular wipes, progress widget.
9. Wishes → WELLNESS → ranunculus scene.
10. Profile teaser + accordion.
11. Psychotherapy page (sticky bending card).
12. About page (name parallax, diplomas mosaic).
13. Contact page + form.
14. Responsive pass, reduced-motion, performance tuning.
