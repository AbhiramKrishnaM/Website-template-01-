# Eugenia Grab clone

A learning rebuild of https://www.eugeniagrab.com/en: scroll-driven WebGL flowers, ink page transitions, scramble text. Techniques and layout are cloned; copy, photos and branding are our own.

## Read before working

- `website.md` — the build spec. Read the section for whatever you are building; it holds measured scroll heights, timings and shader approaches.
- `todo.md` — the work plan. Pick tasks from here and tick them `- [x]` when done.
- `standards.md` — coding rules. Read before writing any code.

## Changelog

`CHANGELOG.md` is append-only. After finishing a piece of work, add an entry at the bottom with a shell append (`cat >> CHANGELOG.md <<'EOF'`), in the format shown at the top of the file. A wrong entry is fixed by appending a correction. `.githooks/pre-commit` rejects any commit that alters existing entries; leave it enabled (`git config core.hooksPath .githooks`) and commit with the hook running.

## Assets

- App code loads models from `public/models/` (renamed copies, used with O.LA's permission).
- `reference-assets/` holds the untouched originals for study only; app code never imports from it.
- Some model parts are third-party (see `reference-assets/README.md`). Keep the site local until O.LA confirms those may be redistributed, or the parts are replaced.
- Credit O.LA (https://olhalazarieva.com/) in the footer and in `CREDITS.md`.
