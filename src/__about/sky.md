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
