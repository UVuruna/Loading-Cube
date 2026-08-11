# CLAUDE.md — Loading Cube

Project-specific guidance. Inherits the [root constitution](../../CLAUDE.md) —
read it first, then use its Router to load only the rulebook your job needs.
This file only ADDS or TIGHTENS; it never restates or loosens the root's.

---

## What This Project Is

A reusable loading animation — a colour cube that tumbles through its six
faces — shipped as a package for websites and applications. Full description
and the option list: [README](README.md).

## Tech Stack (decided — do not relitigate without owner approval)

**Vanilla ES modules + CSS 3D + SVG. No framework, no bundler, no
dependencies, no build step.** The justification and the two rejected
alternatives (Three.js, a canvas painter) are written out in
[README](README.md) → *Why JavaScript and no build step*.

This does NOT contradict the GUI default policy (root `START.md` → Step 3,
C# / WPF for new desktop GUIs). Loading Cube has no GUI of its own: it is a
component that mounts into someone else's. The desktop story is a future
`Viewport3D` renderer reading the same `shared/spec.json` — which is exactly
why the spec is a JSON file and not a JavaScript object.

`main.py` is a thirty-line static file server so the playground can open.
Python is not the product here and never renders anything.

---

## Project Laws

These are ADDITIONS to the root's. Both have teeth.

1. **THE FACE ORDER IS A QUARTER TURN, ALWAYS.** The rotation order in
   `shared/spec.json` must walk faces that share a cube edge, so no step is
   ever a 180-degree double flip. An earlier candidate order broke exactly
   this at its loop seam and nobody would have seen it until the animation
   ran. Gate: `tests/test_face_order.py`.

2. **THE SPEC IS ONE TRUTH, READ TWICE.** `src/spec.js` restates
   `shared/spec.json` so that mounting needs no `fetch`. Changing one without
   the other is a build failure. Gate: `tests/test_spec_parity.py`.
   Corollary: a value that only one stack can honour (a CSS gradient string,
   an SVG path) does NOT belong in the shared file.

3. **COMPUTE, NEVER GENERATE — and here it is not merely a preference.**
   Three palettes times six faces is eighteen colourings of every texture and
   every ring. A bitmap would lock each to one colour and one resolution, and
   would put hundreds of kilobytes in front of the very thing the user is
   waiting for. The two exceptions are the owner's own `sun.svg` and
   `moon.svg`: there is one sun and one moon, and nothing to recolour.

4. **NOTHING RUNS PER FRAME THAT DOES NOT HAVE TO.** A loading animation
   appears when the machine is busiest, so ornament motion is CSS on the
   compositor, never JavaScript. The ring rebuilds six times per cycle — on a
   face change — not sixty times per second. Before adding anything to the
   frame loop, measure it.

## Symbolism Is Borrowed, Not Invented

The `planets` and `virtues` emblem families are copied from
`Gadgets/Watch Academy/SYMBOLISM.md`, and the axis-to-colour map is shared with
`Gadgets/3D Preview`. If either changes, this project follows — never the
other way round. The `elements` family is Loading Cube's own and is the default
(owner 2026-08-07: moon on amethyst, water on sapphire).

## Verifying Work Here

The output is a picture, so it is checked by LOOKING at it: `python main.py`,
then full-window screenshots graded against the ruling they are meant to
satisfy (root `GUI.md` → The Visual Proof). Unit tests cover the geometry and
the spec, never the appearance — a green test suite has never once proved a
cube looked right.
