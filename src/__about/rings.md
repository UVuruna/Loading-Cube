# rings.js

Six compositions, one per face, shown for whichever face is on top: a laurel
wreath (green), water (blue), fire (orange), an electric arc (red), the solar
corona (yellow) and the lunar phases (purple).

## Not icons on a circle

The first draft repeated one small glyph around a circle and the owner
rejected exactly that. A wreath has two branches meeting at a tie and opening
at the top; water undulates at three wavelengths; fire leans both ways. Each
is drawn from geometry, so it takes any palette colour and any size.

## How motion is built

A ring is a stack of **layer divs**, each holding one SVG, each with its own
CSS animation. Two reasons:

1. **Compositor.** A CSS transform on a plain div is handed to the GPU, so the
   ring keeps turning while the main thread is busy — which is the whole point
   of a loading animation. Nothing here runs per frame in JS.
2. **transform-origin.** An HTML element rotates about its own centre. An SVG
   `<g>` needs `transform-box`, and getting it wrong makes the ring ORBIT the
   page instead of spinning in place — seen live on 2026-08-07.

Inside an SVG only **opacity** is animated (flicker, twinkle), which has no
origin to get wrong.

## Realistic artwork is coming, and it is not here yet

The owner asked (2026-08-08) for realistic rings written as a PromptPainter
prompt sheet rather than a third attempt at curves. That sheet is
`UV/rings-prompts.md` — seven entries, validated against PromptPainter's own
dry-run — and he generates the images on his own machine. Until a set is
approved, **these drawn rings stay the shipped artwork** (his words: *"nek se
vide ove kao i do sada dok ja ne napravim slike"*), so nothing in this module is
waiting on that file.

`shared/spec.json` already names the file stem each ring's image will take
(`rings.perFace[*].art`), which is the only preparation that costs nothing. The
sheet also carries the constraint the artwork must satisfy: the renderer spins a
ring with CSS, so an image drawn off centre would orbit rather than turn — the
same defect a mis-set `transform-box` caused live on 2026-08-07, arriving through
a different door.

Flow: [__flow/rings.md](../__flow/rings.md).
