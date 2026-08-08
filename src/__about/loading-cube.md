# loading-cube.js

The public face: `LoadingCube.mount(target, options)`.

## Core versus optional

Core is exactly one thing — the colour cube turning through its six faces.
Emblems, the ring, the sky and the backdrop are all opt-in, and a consumer
states what it wants the way it would state anything else passed to a
constructor. `SPEC.defaults` is the answer to "what do I get if I pass
nothing".

## Who picks the palette

Three switches, deliberately orthogonal (owner 2026-08-08):

| Option | Effect |
|---|---|
| `show` | `both`, `cube` or `ring` — `ring` implies a ring, since asking for ring-only and getting an empty box would be a riddle |
| `mode` | `continuous`, `per-show`, or `by-day` (the weekday picks one colour; Sunday is monochrome) |
| `paletteMode` | `fixed` honours `palette`; `day-night` swaps `paletteDay` for `paletteNight` after sunset; `mono` uses the white-by-day / black-by-night pair named by `monoStyle` |

`_resolvePalette` answers "which palette" and "which single face" **together**,
because both depend on the clock and the calendar, and answering them apart is
how a Sunday ends up with a coloured cube. The weekday wins first: Sunday's entry
is the string `"mono"`, not a face, and it overrides `paletteMode` entirely.

## The clock can change the palette under you

All three of those switches are hour-dependent, and answering them once at mount
is not enough: a page that stays up across a sunset would show the wrong cube for
the rest of the night. That is exactly what happened — the moon rose, the
lighting turned cold, and the monochrome cube stayed white until someone touched
an unrelated control and forced the rebuild that should have happened by itself.
Found by the independent grader, who also named why it looked fine in testing:
every manual check happens to touch a control.

So `_resolvePalette` returns a `key` that changes exactly when its answer does,
and `_frame` compares it. The comparison is a string compare on frames where the
clock matters at all (`_clockDecidesPalette`), and the rebuild it guards happens
at most twice a day. `_rebuildForClock` carries the rotation across when the face
being walked is unchanged, so a sunset re-skins the cube without jolting the
tumble back to its first face; when `by-day` rolls over midnight the sequence
really is different and a fresh rotation is the right answer.

## The root fills its host when anything needs the host's extent

That means whenever `sky` is on or a backdrop is set: the bodies ride the frame's
edge, and a backdrop is a background, so both want the whole area the embedder
gave. Only a bare transparent mount keeps its own box.

It takes NO minimum. A floor of the cube's own box overflowed a 330 px portrait
frame and put the moon outside the visible area — caught the first time the
mobile preview was clicked. When the host is too small it is the **fit scale**
that answers: `min(1, min(width, height) / box)` on the one layer that holds the
ring and the cube. Never above 1 — `size` is a ceiling the embedder asked for,
not a target to inflate to.

## Measured on resize, never per frame

Reading a rect inside `requestAnimationFrame` forces a layout, which is the one
thing a loading animation must not spend the main thread on (project law 4). A
`ResizeObserver` caches the frame; `_measure` derives from it both the body's size
and the fit scale, and writes the transform only when the rounded value changes.

## One loop for every instance

A page may show a dozen cubes; a dozen `requestAnimationFrame` loops would
each pay the callback cost. There is one loop, it starts with the first
instance and stops with the last, and it skips any instance that is paused.

## The box is derived, not given

`size` is the cube's EDGE. The box is derived from it: the cube plus a margin, or
the ring's diameter when a ring is on. The box is no longer stretched for the sky
— the bodies ride the frame now, so there is nothing to make room for.

## The core is built first, and carries nothing

When the chosen `corners` variant asks for one, six extra faces go in BEFORE the
shell so the shell paints over them. They get no emblem and no lighting overlay:
nothing of the core is ever seen but the sliver inside a notch. `SHELL_OFFSET_PX`
is 0.6 and is used twice — it moves each shell face's `translateZ` and grows its
`inset` by the same amount. One constant, because a shell that enclosed the core
on four sides and left a hairline slit on the other two would be worse than the
hole.

Flow: [__flow/loading-cube.md](../__flow/loading-cube.md).
