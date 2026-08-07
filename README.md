# Tumbler

A loading animation for every screen that has to wait: a jewelled cube that
tumbles through six colours, one face at a time. It is a package, not an app —
websites and desktop applications drop it in and state which version they
want. Windows, web, no build step, no dependencies.

---

## What it is

The core is one thing only: **a cube turning through its six faces**, in the
colour-wheel order yellow → orange → red → purple → blue → green, which by
position reads top → right → back → bottom → left → front. Every consecutive
pair shares a cube edge, so every change of face is one clean quarter turn and
the loop never stutters at a seam.

Everything else is **optional**, chosen when you mount it:

| Option | What it adds |
|---|---|
| `emblems` | a small mark on every face — six families to pick from |
| `ring` | a composition circling the cube, belonging to the face on top: a laurel wreath, water, fire, an electric arc, the solar corona, the lunar phases |
| `sky` | the real sun and the real moon riding a circle around the cube at their actual position for the time of day, lighting the faces they face |
| `background` | transparent, dark, light, or a sky that follows the hour |
| `finish` | one of nine textures, from flat enamel to watercolour-with-a-gold-frame |
| `palette` | Royal Gems, Midnight Velvet, or Obsidian and Gold |

## Try it

```bash
python main.py
```

That serves the project on localhost and opens the **playground** — every
option on one page, a live cube, and the exact call to copy. See
[demo/](demo/___demo.md).

## Use it

```js
import Tumbler from "./src/tumbler.js";

Tumbler.mount("#splash", {
  size:       180,
  palette:    "gems",
  finish:     "aquarel",
  emblems:    "elements",
  ring:       true,
  sky:        true,
  background: "transparent"
});
```

`mount` returns an instance with `pause()`, `play()`, `setOptions(patch)` and
`destroy()`. Passing nothing gives you the bare turning cube — see
`defaults` in [shared/spec.json](shared/___shared.md).

---

## How it is built

| Folder | What lives there |
|---|---|
| [src/](src/___src.md) | the renderer — one module per responsibility |
| [shared/](shared/___shared.md) | `spec.json`, the one source of truth every renderer reads |
| [assets/](assets/___assets.md) | the logo, and the sun and moon artwork |
| [demo/](demo/___demo.md) | the playground page |
| [tests/](tests/___tests.md) | the guards |

Project rules and the stack decision: [CLAUDE.md](CLAUDE.md).

### Why JavaScript and no build step

The first and largest consumer is a web page — the Remote User client already
draws its loading cube in CSS 3D, and every website that will use this one is
a web page too. A cube is six rectangles and one rotation matrix, which needs
no WebGL and no framework: plain ES modules, CSS 3D transforms, and SVG for
the ornaments. Alternatives considered and rejected: **Three.js** (a whole
renderer for six quads, and a hundred-kilobyte dependency in front of the very
thing the user is waiting for), and **a canvas painter** (would have to
re-implement gradients, blend modes and text rendering that CSS already does
on the GPU).

The desktop side is deliberately NOT web: when a C# / WPF application needs
this, it reads the same `shared/spec.json` and draws with `Viewport3D`. That
is why the spec is a JSON file and not a JavaScript object — see
[shared/](shared/___shared.md).

### Speed, because a loading animation appears when the machine is busiest

Measured in the browser, 20 000 iterations per operation: the rotation costs
**0.08 µs** per frame per cube, the sun-and-moon lighting **3.5 µs**, and the
sun's position **0.85 µs** — recomputed once a minute, not per frame. Ten
cubes at once come to **0.11–0.13 ms** of a 16.7 ms frame, under 1 %.

The ring is the important case: it is a CSS animation on the compositor, so it
keeps turning even while the main thread is fully occupied with the work the
user is waiting for. Nothing about the ring runs per frame in JavaScript.
