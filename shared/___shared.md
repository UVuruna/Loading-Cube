# shared/ — the one source of truth

`spec.json` holds every value that more than one renderer must agree on: the
axis colours, the face order and the weekday map, timing, the corner treatments,
the names of the finishes, emblem families and rings, the sky rules and the
backdrop's counts.

At `version: 2` it also carries the monochrome palettes and the `mono` day/night
pairs — the Sunday cube (owner 2026-08-08).

## The contract

- A renderer READS this file. It never writes it and never keeps a private
  opinion about a value that lives here.
- The web renderer restates it in `../src/spec.js` so that mounting needs no
  `fetch`; `../tests/test_spec_parity.py` fails the build when the two drift.
- A future C#/WPF or Qt renderer reads THIS file, never the JavaScript.

## What deliberately stays out

CSS gradient strings and SVG path data. They are web-only, and a stack with no
CSS cannot honour them — putting them in the shared file would be stating
something untrue about what is shared. Per-stack recipes live beside their
renderer, and the spec names only WHICH finishes and rings must exist, so a
stack that cannot draw one has to say so instead of silently substituting
another.

The line is drawn at *what*, not *how*, and the 2026-08-08 additions are the
clearest test of it. "Two cloud bands, the near one drifting in 86 seconds" and
"stars at 26 per 300 px tile" are facts any renderer can honour, so they are
here; the `radial-gradient` string that draws one puff is not. "Cap the finish's
rounding at 5% and put a solid core of the same edge behind it" travels; the CSS
that offsets the shell 0.6 px does not.

Colour language is shared with `Gadgets/3D Preview` (same axis-to-colour map)
and the symbolism with `Gadgets/Watch Academy` — see
[../src/__about/emblems.md](../src/__about/emblems.md).
