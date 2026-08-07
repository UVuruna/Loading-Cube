# src/ — the renderer

One module per responsibility, no build step, no dependencies. A consumer
imports `loading-cube.js` and nothing else; every other module here exists because
it is a different KIND of decision.

| Module | Responsibility | Docs |
|---|---|---|
| `spec.js` | the values every renderer must agree on — mirror of `../shared/spec.json` | [about](__about/spec.md) |
| `geometry.js` | rotation maths and the driver that walks the face order | [about](__about/geometry.md) · [flow](__flow/geometry.md) |
| `textures.js` | the nine finishes, all computed | [about](__about/textures.md) |
| `emblems.js` | the glyphs and the six families | [about](__about/emblems.md) |
| `rings.js` | the six ring compositions | [about](__about/rings.md) · [flow](__flow/rings.md) |
| `sky.js` | where the sun and moon are, and what they light | [about](__about/sky.md) · [flow](__flow/sky.md) |
| `styles.js` | the one injected stylesheet | [about](__about/styles.md) |
| `loading-cube.js` | the public API and the shared frame loop | [about](__about/loading-cube.md) · [flow](__flow/loading-cube.md) |

## Why these boundaries

The split follows the axis along which each thing CHANGES. Colours change when
the owner picks a palette; the tumble maths never changes. A finish is a
web-specific recipe; the face order is a cross-stack fact. Keeping them apart
is what lets a future C#/WPF renderer read `shared/spec.json` and reimplement
only `textures.js` and `rings.js` — the two files genuinely about CSS and SVG
— instead of re-deriving the whole component.

## The one import rule

`spec.js` imports nothing. Everything else may import `spec.js`. Only
`loading-cube.js` imports the rest. A cycle here would mean two modules disagree
about who owns a decision.
