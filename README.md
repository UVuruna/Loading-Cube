# Loading Cube

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

It opens **orthographic onto a vertex** — the true isometric pose, a corner
facing you with all three visible faces equally foreshortened — and returns to
that pose before every change of face.

Everything else is **optional**, chosen when you mount it:

| Option | What it adds |
|---|---|
| `show` | `both`, `cube` only, or `ring` only |
| `mode` | `continuous` through all six, `per-show` (one face per appearance), or `by-day` — the weekday picks the colour, and Sunday is the monochrome cube |
| `palette` | Royal Gems, Midnight Velvet, Obsidian and Gold, or the four monochrome materials: Ceramic White, Ceramic Black, Brushed Silver, Obsidian Black |
| `paletteMode` | who picks it: `fixed`, `day-night` (light by day, dark by night), or `mono` (white by day, black by night) |
| `monoStyle` | the monochrome pair — `ceramic` or `metal` |
| `finish` | one of nine textures, from flat enamel to watercolour-with-a-gold-frame |
| `corners` | how the eight vertices are treated — `soft`, `bevel`, `sharp` or `seam` |
| `emblems` | a small mark on every face — six families to pick from |
| `ring` | a composition circling the cube, belonging to the face on top: a laurel wreath, water, fire, an electric arc, the solar corona, the lunar phases |
| `sky` | the real sun and the real moon riding the frame's own edge at their actual position for the time of day, lighting the faces they face |
| `background` | `transparent`, `light`, `dark`, `day` (sky and clouds), `night` (sky and stars), or `cycle` — the two alternating on the clock |

### The weekday cube

`mode: "by-day"` shows one colour all day: Monday blue, Tuesday orange,
Wednesday purple, Thursday yellow, Friday red, Saturday green — and **Sunday**
the monochrome cube, white by day and black by night. On those days the cube
spins but never tumbles: there is no next face to go to.

## Try it

```bash
python main.py
```

That serves the project on localhost and opens the **playground** — every
option on one page, a live cube, and the exact call to copy. See
[demo/](demo/___demo.md).

## Use it

```js
import LoadingCube from "./src/loading-cube.js";

LoadingCube.mount("#splash", {
  size:       180,
  palette:    "gems",
  finish:     "aquarel",
  corners:    "soft",
  emblems:    "elements",
  ring:       true,
  sky:        true,
  background: "day"
});
```

`mount` returns an instance with `pause()`, `play()`, `setOptions(patch)` and
`destroy()`. Passing nothing gives you the bare turning cube — see
`defaults` in [shared/spec.json](shared/___shared.md).

### How much room it takes

`size` is the cube's **edge**. With `sky` or a backdrop on, the mounted element
**fills its host** — the sun and moon ride the frame's edge, so the frame has to
be the one you chose — and the cube stays its stated size in the middle. If the
host is smaller than the cube and its ring need, the whole composition scales
down to fit rather than overflowing; `size` is a ceiling, never inflated past
what you asked for. Give the host a fixed size and you get a fixed widget; give
it the viewport and you get a full-screen splash.

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

The first and largest consumer is a web page — the Vibe Coder client already
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

The same holds for the backdrop. Clouds drift and stars twinkle as compositor
animations; the only thing the clock touches is the `cycle` cross-fade, and that
compares before it writes, so a still afternoon writes to the DOM zero times. The
frame's size is read on resize through a `ResizeObserver`, never inside the frame
loop — reading a rect there would force a layout, which is precisely the cost a
loading animation must not add.

### The realistic rings

The drawn SVG rings are what ships today. Realistic artwork is specified as a
PromptPainter prompt sheet in the owner's own `UV/` folder — seven ring images,
validated against PromptPainter's dry-run — and the file stems those images will
take are already named in `shared/spec.json` (`rings.perFace[*].art`).
