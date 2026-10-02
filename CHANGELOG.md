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
