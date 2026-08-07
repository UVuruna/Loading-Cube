# geometry.js

The rotation: 3x3 matrices, the six face normals, and the `Rotation` driver.

## The frame

Everything is in the CSS 3D frame — `+x` right, `+y` **down**, `+z` toward the
viewer — because that is the frame the transform is finally written in.
Converting at the boundary is where sign errors breed, so "up" is spelled out
once as `UP = [0, -1, 0]` and never assumed again.

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
