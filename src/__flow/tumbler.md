# tumbler.js — flow

## Mount, then one shared loop

```mermaid
flowchart TD
    A[mount with target and options] --> B[merge over SPEC.defaults]
    B --> C[derive box: cube, then ring room, then sky room]
    C --> D[ensureStyles once per document]
    D --> E[build root, optional body image, optional ring host, stage, six faces]
    E --> F[each face: finish style + emblem + shade layer + lit layer]
    F --> G[register in the shared instance set]
    G --> H{loop already running?}
    H -->|no| I[start requestAnimationFrame]
    I --> J[frame]
    H -->|yes| J
    J --> K[for each running instance: rotation step, then paint]
    K --> L{sky on?}
    L -->|yes| M[shade six faces, move the body, maybe repaint the background]
    L -->|no| N[skip]
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

## destroy() stops the world

When the last instance is destroyed the loop is cancelled. A page that mounts
and unmounts cubes (a router, a modal) leaves nothing running behind it.
