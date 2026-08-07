# tumbler.js

The public face: `Tumbler.mount(target, options)`.

## Core versus optional

Core is exactly one thing — the colour cube turning through its six faces.
Emblems, the ring, the sky and the background are all opt-in, and a consumer
states what it wants the way it would state anything else passed to a
constructor. `SPEC.defaults` is the answer to "what do I get if I pass
nothing".

## One loop for every instance

A page may show a dozen cubes; a dozen `requestAnimationFrame` loops would
each pay the callback cost. There is one loop, it starts with the first
instance and stops with the last, and it skips any instance that is paused.

## The box is derived, not given

`size` is the cube's EDGE. The mounted element is sized from it: a ring needs
room to stand clear of the cube, and the sun needs room outside the ring. The
orbit radius is additionally clamped so the DISC fits, not just its centre —
without that the sun was sliced in half at noon by the root's `overflow`.

Flow: [__flow/tumbler.md](../__flow/tumbler.md).
