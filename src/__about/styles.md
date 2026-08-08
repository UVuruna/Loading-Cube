# styles.js

The one stylesheet, injected once per document on the first mount.

## Why the CSS lives in JS

A consumer gets Loading Cube by importing one module. Asking them to also remember
a `<link>` is how a component ends up unstyled in somebody's build. Every rule
is namespaced `lc-` and touches nothing outside the mounted element, so
dropping it into a host page cannot collide with the host's own styles.

## Only compositor properties

Every animation here moves `transform` or `opacity` and nothing else — never a
property that forces layout. That is what lets the ring keep turning while the
main thread is busy doing the very work the user is waiting for.

## Painting order, stated once

Backdrop 0, ring 1, sun and moon 2, cube 3. The cube is the subject so nothing
ever covers it, and the body passes in FRONT of the ring — which is what the
owner's `morning.png` and `evening.png` sketches show.

## The fit layer

`.lc-fit` holds everything that must stay concentric — the ring and the cube — so
ONE transform shrinks the whole composition when the host is smaller than it
wants to be (root `GUI.md`, the SPACE & LEGIBILITY fix order: free space, then
reflow, then a raised minimum, never a silent overflow). It is **in flow**, not
absolute, and carries the cube's own box as its width and height: that is what
gives a filling root an intrinsic size, so a host with no stated height shows
something instead of collapsing to nothing. A transform does not affect layout,
so scaling it down never takes that away.

The sun and the moon sit outside it: they ride the real frame and must not shrink
with the cube.

## The core that closes the vertices

`.lc-core` is a SHARP cube of the same edge, with the rounded shell pushed
0.6 px outside it, so every notch looks onto the core instead of onto the page. A
merely SCALED inner cube cannot do this: the notch sits at the outermost point of
the silhouette, so an inner cube at 94% covers 94% and leaves the last 6% open —
a light sliver, which is the defect with extra steps. The 0.6 px lives in JS
(`loading-cube.js`, `SHELL_OFFSET_PX`) because the same number must move the
face's `translateZ` and grow its `inset`; two copies could drift.

## One rule about this file's own shape

The whole stylesheet is a single template literal, so **a backtick anywhere
inside it ends the string**. One in a CSS comment broke every module on the first
run of the backdrop work. There are none below the `const CSS =` line, and a
comment there says so.

## Reduced motion slows, it does not stop

A loading indicator that stands still is a broken loading indicator. Under
`prefers-reduced-motion` the ornament slows by roughly 3x and the flicker
stops, but the ring still turns.
