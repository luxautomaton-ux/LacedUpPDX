# Laced Up PDX media migration

The Wix export contains 315 source files. Set `LACEDUP_MEDIA_SOURCE` to that folder before running `npm run media:prepare`; if it is unset, the script looks for a sibling folder named `Site Files (1)`. The command preserves or converts every source file and rebuilds `media-manifest.json`.

- 284 JPEG files are resized and compressed for the public photo archive.
- 27 PNG files are preserved in the public graphics archive.
- 1 MOV file is converted to a browser-ready MP4.
- 3 EPS files are retained as original source graphics. The official embedded TIFF preview in the Quantum Fiber EPS is also extracted for its public partner card.

The public gallery reads the manifest directly, so every web-ready export is browsable without hand-maintaining hundreds of paths. Images are revealed in batches to protect page performance.

Annual event artwork supplied outside the Wix export is stored in `public/media/brand`. The permanent organization palette is black, yellow, and white; annual event themes are maintained separately:

- 2026: black, electric blue, and white
- 2025: forest green, lime, and white
- 2024: black, yellow, and white

Lux Automaton is a separately supplied partner asset and is not part of the Wix export.

The supplied `Sponsors & Partners` reference sheet is preserved as `sponsors-partners-sheet.jpg`. Run `npm run media:sponsors` to reproducibly extract its 51 marks into individual transparent PNG files. The Sponsors page combines those 51 sheet entries with 12 separately supplied partners for 63 individually labeled cards. Crop provenance is recorded in `sponsor-sheet-manifest.json`; the three symbol-only marks use descriptive labels because the source sheet does not identify their organization names.
