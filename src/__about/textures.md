# textures.js

Nine finishes: matte, velvet, leather, deep leather, watercolour-with-frame,
damask, gold frame, enamel and obsidian. Each takes one face's colours **and
the cube's edge in pixels** and returns the inline style for it. The file also
owns the corner treatment — `cornerRadius`, `seamShadow` and `coreFill`.

## Everything is computed

Gradients and SVG `feTurbulence`, never a bitmap (root `CODE.md`, Compute
Don't Generate). Seven palettes times six faces is forty-two colour
combinations of every finish; pictures would mean either forty-two files per
finish or a texture that ignores the palette. Computed recipes also keep the
package in kilobytes, which matters for a thing whose whole job is to appear
instantly.

## The bug that shipped, and the gate that now stops it

**`box-shadow` accepts no percentage — anywhere.** Not offset, not blur, not
spread. And CSS drops a declaration with one invalid component **whole and
silently**. All nine recipes wrote their vignette as
`inset 0 -18% 34% -14% ...`, so every one of them lost not just the vignette but
its rim as well: `enamel`'s gold cloisonne edge, the `frame` finish's entire
frame, `aquarel`'s gold rule, `damask`'s gold and black lines. Nothing rendered
and nothing complained, through six rounds of looking at the cube.

That is why every recipe now takes `size` and every length goes through
`px(size, fraction)`, and why `tests/test_shadow_lengths.py` (GATE, 2026-08-08)
refuses to let a percentage back in.

The process failure is worth naming too, because a mechanism that fails silently
spends the same week twice: the visual-proof gate grades only the RULINGS a
session touched, and "the finishes render as written" had never been a ruling.
A defect no ruling names is a defect nobody looks at. A new or changed finish now
gets its own ruling in `.claude/visual-proof.json`.

## The corner treatment

Six rounded faces meeting at 90 degrees leave a triangular NOTCH at each of the
eight vertices, and the page shows through it — the owner photographed it. The
answer has two parts and only one of them is here.

`cornerRadius(finish, corners)` CAPS the finish's own `radiusPercent` with the
chosen variant's `maxRadiusPercent`, so `bevel` keeps the difference between a
framed face (6%) and a jewelled one (11%) while `soft` levels every finish to the
same fine edge. `coreFill` is the other part's material: the facet seen through a
notch, derived from that face's OWN colours so obsidian never gets a silver
chamfer. Fully opaque on purpose — a translucent stop would let the notch see
straight through to the core's far side, which is the hole again.

The geometry that makes the core work lives in
[loading-cube.js](loading-cube.md) and [styles.js](styles.md), because it is
about where elements sit rather than what they look like.

## Two traps this file already fell into

**The `#` in `url(#filterId)`.** It must reach `encodeURIComponent` literal so
it comes out as `%23` exactly once. Pre-writing `%23` yields `%2523`, the
filter reference dies silently, and the tile renders flat black — which looks
like a colour bug and is not one.

**Anisotropy is the difference between leather and brushed metal.** A
`baseFrequency` like `0.012 0.34` streaks; near-isotropic low frequency
mottles. The first leather draft used the streaking value and came out looking
like a brushed steel plate.

## Key order matters

`background` is a shorthand and resets `background-size`, so every recipe
writes it before `backgroundSize` and `backgroundBlendMode`.
