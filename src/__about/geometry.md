# geometry.js

The rotation: 3x3 matrices, the six face normals, and the `Rotation` driver.

## The frame

Everything is in the CSS 3D frame — `+x` right, `+y` **down**, `+z` toward the
viewer — because that is the frame the transform is finally written in.
Converting at the boundary is where sign errors breed, so "up" is spelled out
once as `UP = [0, -1, 0]` and never assumed again.

## The opening pose is a VERTEX, never a face

Owner decree 2026-08-08: the animation opens orthographic onto a corner, as in
his sketch. That is two numbers working together — `viewTiltDegrees` of
**-35.264**, which is `atan(1/sqrt(2))` negated and therefore the true isometric
tilt, and `startYawDegrees` of **45**. At the old -20 degrees the top face was
merely tipped and no yaw could have produced a corner view at all.

`dwellDegrees` had to change with it, 320 to **360**. At 320 the yaw advanced 40
degrees every time a face changed, so the corner pose survived exactly one face
and then drifted — after three tumbles the cube presented an edge. A whole turn
makes the yaw periodic, and the tumble preserves the phase: its axis is
horizontal and itself at 45 degrees, so a quarter turn about it carries a corner
pose to another corner pose.

**And the overshoot has to be CARRIED, or none of that holds.** A frame advances
the yaw by about 1.3 degrees, which does not divide 360, so the dwell threshold
is always crossed a sliver late. `this.R` keeps that sliver because it is real
rotation; the first version zeroed the counter and threw away the only record of
it, so the error was always positive and compounded on every dwell. The corner
pose drifted without bound — visibly skewed after five minutes, nearly edge-on at
forty, true again only after eighty. The claim that "every dwell opens at the
vertex" was made on a one-cycle check and was wrong; the independent grader found
it by watching for three hours instead of six landings.

`spun -= dwellDegrees` keeps the total spin equal to a whole number of dwells
plus whatever is left over right now, so the yaw is always within one frame of
where it started. Measured across 2026 landings in three simulated hours at a
deliberately awkward frame time: the corner spread stays under 0.012 and cycles
rather than climbing.

## `by-day` shows one face and never tumbles

`faceOfDay` reads `SPEC.sequence.weekdays` indexed exactly as `Date#getDay()`
reports it — Sunday first. Sunday's entry names no face at all but the string
`"mono"`, because Sunday is the monochrome cube; a caller that gets `"mono"` back
must choose a palette, not a face. `Rotation` treats `by-day` like `per-show`:
one face, spin only, no tumble.

## Why matrices

The cube tumbles about a different horizontal axis at every step, and which
axis depends on where the next face currently points. Euler angles would need
unwinding at every step and would gimbal-lock the moment a face came to rest
overhead. A rotation matrix composed in world space just accumulates.

## The 180-degree branch

`tumbleTo` is generic: the axis is whatever is perpendicular to the face's
current heading and to up. If a face were ever asked for while it sat at the
BOTTOM, that cross product would vanish — a vector and its opposite span no
plane — and there would be no axis to turn about. That case picks an arbitrary
horizontal axis and flips 180 degrees, so a bad order looks clumsy instead of
throwing. `tests/test_face_order.py` keeps the shipped order out of that
branch entirely.

Flow: [__flow/geometry.md](../__flow/geometry.md).
