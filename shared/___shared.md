# shared/ — the one source of truth

`spec.json` holds every value that more than one renderer must agree on: the
axis colours, the face order, timing, the names of the finishes, emblem
families and rings, and the sky rules.

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

Colour language is shared with `Gadgets/3D Preview` (same axis-to-colour map)
and the symbolism with `Gadgets/DOMY Watch` — see
[../src/__about/emblems.md](../src/__about/emblems.md).
