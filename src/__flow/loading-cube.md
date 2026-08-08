# loading-cube.js — flow

## Mount, then one shared loop

```mermaid
flowchart TD
    A[mount with target and options] --> A2[resolve palette: weekday, then paletteMode]
    A2 --> B[merge over SPEC.defaults]
    B --> C[derive box: cube, then ring room]
    C --> D[ensureStyles once per document]
    D --> D2[build backdrop for the chosen background]
    D2 --> E[root, optional body image, fit layer, optional ring host, stage]
    E --> E2{corners variant wants a core?}
    E2 -->|yes| E3[six sharp core faces first, no emblem, no lighting]
    E2 -->|no| F
    E3 --> F[each shell face: finish style + emblem + shade layer + lit layer]
    F --> F2[measure the frame: body size and fit scale]
    F2 --> G[register in the shared instance set]
    G --> H{loop already running?}
    H -->|no| I[start requestAnimationFrame]
    I --> J[frame]
    H -->|yes| J
    J --> K[for each running instance: rotation step, then paint]
    K --> L{sky on?}
    L -->|yes| M[shade six faces, move the body to the frame edge, blend the backdrop]
    L -->|no| N[blend the backdrop only — the day cycle still follows the clock]
    M --> O{top face changed?}
    N --> O
    O -->|yes| P[swap the ring for the new face's composition]
    O -->|no| J
    P --> J
```

## The ring only rebuilds on a face change

Six times per cycle, not sixty times per second. Between changes the ring is
untouched DOM turning on the compositor, which is why switching it on does not
move the cost meter.

## What the clock touches, and how rarely

Only the day-cycle backdrop, and it compares before it writes: the daylight
fraction is rounded to two decimals, so a still afternoon writes to the DOM zero
times. The frame is read on resize, never per frame — see
[__about/loading-cube.md](../__about/loading-cube.md).

## destroy() stops the world

When the last instance is destroyed the loop is cancelled. A page that mounts
and unmounts cubes (a router, a modal) leaves nothing running behind it.
