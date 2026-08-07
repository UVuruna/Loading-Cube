# assets/

| File | What it is |
|---|---|
| `logo.svg` | the project mark, copied to the monorepo `logos/` folder |
| `sun.svg` | the sun the sky option draws — the owner's own artwork |
| `moon.svg` | the moon, likewise |

## Why these two are files and the textures are not

Everything else Tumbler draws is computed, because a computed texture follows
whatever palette the consumer picked. The sun and the moon are the opposite
case: they are one specific sun and one specific moon, the owner's own, and
there is nothing to recolour. Redrawing them from primitives would be worse art
for no gain in flexibility.

They are resolved through `import.meta.url` in
[../src/__about/sky.md](../src/__about/sky.md)'s module, so a consumer that
copies `src/` and `assets/` together needs no path configuration.
