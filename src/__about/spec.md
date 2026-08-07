# spec.js

The web renderer's copy of `../../shared/spec.json`: palettes, the face order,
timing, which finishes and emblem families and rings exist, and the sky rules.

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
web-only and live in `textures.js` and `rings.js` — a WPF renderer cannot
honour a `radial-gradient(...)` string, and pretending otherwise would put a
lie in the shared file.
