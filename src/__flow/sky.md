# sky.js — flow

## From a clock reading to a lit cube

```mermaid
flowchart TD
    A[hour 0 to 24] --> B{between sunrise and sunset?}
    B -->|yes| C[body = sun, t = progress through the day]
    B -->|no| D[body = moon, t = progress through the night]
    C --> E[angle = 180 - 180t: left, zenith, right]
    D --> F[angle = 360 - 180t: right, nadir, left]
    E --> G[altitude = sin of the arc position]
    F --> G
    G --> H[colour = mix of horizon and zenith by altitude]
    H --> I{moon?}
    I -->|yes| J[phase from the synodic month; power times illumination]
    I -->|no| K[power = full]
    J --> L[dir = cos a, minus sin a, 0.42]
    K --> L
    L --> M[per face: lambert = max of 0 and normal dot dir]
    M --> N[brightness = ambient + rest times lambert times power]
    N --> O[shade layer = black at 1 minus brightness; lit layer = light colour]
```

## Why the light direction is tipped toward the viewer

A purely in-plane direction would brighten only the silhouette edges: the faces
we actually see point mostly at the camera, so their dot product with a flat
light would sit near zero all the time. The `+0.42` z component gives the
visible faces something to catch while keeping the left/right and up/down
difference the eye is reading.

## Where the body lands

```mermaid
flowchart TD
    A[angle from the hour] --> B[dx = cos a, dy = minus sin a]
    B --> C[halfW = width/2 minus half the disc minus margin]
    B --> D[halfH = height/2 minus half the disc minus margin]
    C --> E[tx = halfW / abs dx, or Infinity when dx is 0]
    D --> F[ty = halfH / abs dy, or Infinity when dy is 0]
    E --> G[t = min of tx and ty: the nearer wall wins]
    F --> G
    G --> H[centre + direction times t]
```

The body is placed by its CENTRE, so the box is shrunk by half the disc plus the
margin BEFORE the intersection — an unshrunk box put half the sun outside the
root, where `overflow: hidden` sliced it off.

Which wall wins depends on the frame's shape, and that is the point. In a wide
16:9 frame the 15:00 diagonal ray reaches the TOP edge first; in a tall 9:16
frame the same hour reaches the SIDE first. Either way the body touches the
frame, which is what the owner asked for — the previous circle touched nothing.
