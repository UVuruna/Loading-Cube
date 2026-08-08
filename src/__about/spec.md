# spec.js

The web renderer's copy of `../../shared/spec.json`: palettes, the face order,
timing, the corner treatments, which finishes and emblem families and rings
exist, the sky rules and the backdrop's counts.

At `version: 2` (2026-08-08) it also carries what the owner added that round:
`sequence.weekdays` for `by-day` mode, `corners.variants`, the four monochrome
palettes with the `mono` day/night pairs, each finish's own `radiusPercent`, and
the `backdrop` numbers.

## Why it is a copy

A consumer drops `src/` into any page from any origin with no build step.
`fetch()` of the JSON would make `mount()` asynchronous and would break the
moment someone moved the file; JSON import attributes are still too young to
demand of every embedder. So the values are stated twice and
`tests/test_spec_parity.py` fails the build the moment the two disagree.

A copy nobody checks is drift. A copy a guard checks is a second reader of one
truth.

## What belongs here and what does not

Only facts a DIFFERENT STACK would also need: hex colours, the order of the
faces, seconds and degrees. CSS gradient strings and SVG path data are
web-only and live in `textures.js`, `rings.js` and `backdrop.js` — a WPF
renderer cannot honour a `radial-gradient(...)` string, and pretending otherwise
would put a lie in the shared file.

The line is drawn at *what*, not *how*. "Two cloud bands, the near one drifting
in 86 seconds" is a fact any renderer can honour, so it lives here; the gradient
string that draws one puff of that band does not. Same for corners: "cap the
finish's rounding at 5% and put a solid core behind it" travels, while the CSS
that positions the shell 0.6 px outside that core does not.
