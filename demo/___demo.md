# demo/ — the playground

`index.html` is the mini application the owner asked for: every option on one
page, a live cube, and the exact `LoadingCube.mount(...)` call to copy into your
own code.

Run it with `python main.py` from the project root — see the project
[README](../README.md). It needs a server rather than a double-click because
the renderer ships as ES modules, and browsers refuse `import` over `file://`.

## What is on the page

- **The configurator** — palette, finish, emblems, ring, sky, background,
  sequence mode and size, with the generated call underneath.
- **A 24-hour clock** — drag it and watch the sun cross the top of the frame
  and the moon the bottom, with the cube lit from wherever the body is.
- **The six rings** at full size, each labelled with the face it belongs to.
- **The nine finishes** as flat tiles, where the texture reads best.
- **A live cost meter** — how much of a frame this page's own JavaScript uses.

The page carries no per-file docs because its only script is inline: the
playground IS one page. `tests/test_docs_coverage.py` excludes the folder for
that reason and says so in a comment.
