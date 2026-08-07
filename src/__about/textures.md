# textures.js

Nine finishes: matte, velvet, leather, deep leather, watercolour-with-frame,
damask, gold frame, enamel and obsidian. Each takes one face's colours and
returns the inline style for it.

## Everything is computed

Gradients and SVG `feTurbulence`, never a bitmap (root `CODE.md`, Compute
Don't Generate). Three palettes times six faces is eighteen colour
combinations of every finish; pictures would mean either eighteen files per
finish or a texture that ignores the palette. Computed recipes also keep the
package in kilobytes, which matters for a thing whose whole job is to appear
instantly.

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
