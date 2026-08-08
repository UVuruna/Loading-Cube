# sky.js

Where the sun and the moon are, what colour their light is, and how strongly
it falls on the cube.

## Real bodies, not just a direction

The owner's sketches are the spec: a real sun drawn upper-left in the morning,
a real moon lower-right at night. The upper half of the orbit belongs to the
sun and the lower half to the moon — 06:00 left, 12:00 at the zenith, 18:00
right, 00:00 at the bottom. The artwork is the owner's own `assets/sun.svg`
and `assets/moon.svg`, resolved through `import.meta.url` so a consumer needs
no asset path configuration.

## The body rides the FRAME, not a circle inside it

Owner decree 2026-08-08: *"sunce/mesec TREBA da ide po ivicama ekrana ... uvek
hvata ivicu u tom uglu"*. The old version put the body on a circle of radius
0.44 x box, and a circle knows nothing about the shape it sits in — along a
diagonal it stopped well short of the corner, which is exactly the "barely
visible behind the cube" the owner photographed. The cause was never a wrong
radius; it was that a circle cannot hug a rectangle.

`bodyPosition` is now a ray-rectangle intersection, one line of arithmetic: for
a unit direction `(dx, dy)` the ray leaves a half-width/half-height box at
`t = min(halfW/|dx|, halfH/|dy|)` — whichever wall it reaches first. The box is
shrunk by half the body plus `bodyMarginPx` BEFORE intersecting, so what lands on
the edge is the disc's rim and not its centre.

It takes the frame's **width and height separately**, because with `sky` on the
root fills its host and the host may be any shape. That is not a detail: in a
16:9 frame the 15:00 ray exits through the TOP edge, while in a 9:16 frame the
same hour exits through the SIDE. Both are correct — the body is always as far
out as that frame allows in that direction.

## `daylight` — one number the backdrop borrows

How much of the sky is day right now: 1 in full daylight, 0 in full night, a
smooth ramp CENTRED on sunrise and on sunset. Clouds fade in with it, stars fade
out with it, and the ground colour is a straight mix on it, so it is computed
here — where the sun and moon already live — rather than twice. The old
`skyBackground` jumped straight to 0.25 at sunrise, which read as the sky
switching on; `blendHours` is half above and half below each boundary, so 06:00
is exactly half lit and the last star goes out at 06:45.

## A full moon really lights it

Moonlight is weaker and colder, it falls on the LOWER faces because that is
where the moon hangs, and its strength follows the phase — a new moon lights
nothing. The phase comes from the synodic month counted off a known new moon:
a dozen arithmetic operations, no ephemeris.

## Accuracy is a choice, and this is level 2

The clock plus the machine's own offset, which puts noon at true solar noon
within the width of a time zone and needs no coordinates, no permission dialog
and no network. Level 3 — real sunrise and sunset for a date and a place — is
the `sunriseHour`/`sunsetHour` options. A loading spinner has no business
asking anyone where they live, so nothing here ever prompts.

Flow: [__flow/sky.md](../__flow/sky.md).
