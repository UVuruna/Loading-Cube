# demo/ — the playground

`index.html` is the mini application the owner asked for: every option on one
page, a live cube, and the exact `LoadingCube.mount(...)` call to copy into your
own code.

Run it with `python main.py` from the project root — see the project
[README](../README.md). It needs a server rather than a double-click because
the renderer ships as ES modules, and browsers refuse `import` over `file://`.

The page is in **English**, like everything else that is code or product here
(root `CLAUDE.md`, Universal Conduct: Serbian with the owner, English in the
work). It was Serbian until 2026-08-08, which was simply a rule violation.

## What is on the page

- **The configurator** — `show`, sequence mode, who picks the palette, palette,
  monochrome material, finish, corners, emblems, ring, sky, backdrop and size,
  with the generated `mount()` call underneath.
- **A viewport switch** — Desktop 16:9, Mobile 9:16, or Fit. It reshapes the
  MOUNT, not the cube: the question it answers is how much air is left around the
  cube at each shape, and resizing the cube would answer nothing. The frame's
  live pixel size is printed beside the buttons.
- **A 24-hour clock** — drag it and watch the sun and moon travel the frame's
  own edge, with the cube lit from wherever the body is.
- **Four corner treatments**, each a live cube, on a LIGHT cell on purpose: a
  hole at a vertex only reads as a hole when something bright is behind it, which
  is exactly why the defect survived six rounds of being looked at on black.
- **Six backdrops**, live — clouds drifting, stars twinkling, the day cycle
  caught at dusk where it actually shows what it does.
- **The six rings** at full size, each labelled with the face it belongs to.
- **The nine finishes** as flat tiles, where the texture reads best. They are
  drawn at a stated 220 px edge rather than the tile's own width, because the
  recipes take the CUBE's edge and a swatch that lied about its size would draw a
  gold rim of the wrong weight.
- **A live cost meter** — how much of a frame this page's own JavaScript uses.

The page carries no per-file docs because its only script is inline: the
playground IS one page. `tests/test_docs_coverage.py` excludes the folder for
that reason and says so in a comment.
