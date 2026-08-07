# tests/ — the guards

Per root `CODE.md` -> Enforcement, plus two the component owns itself.

| Test | What fails the build |
|---|---|
| `test_structure_law.py` | any `.py`/`.js` file over ~1,000 lines; the ratchet is EMPTY and meant to stay so |
| `test_config_sections.py` | a config table defined outside its named section, or patched after definition |
| `test_docs_coverage.py` | a source file missing the docs its tier requires, or carrying docs it did not earn |
| `test_doc_links.py` | a doc unreachable from `README.md`, or a relative link with no target |
| `test_face_order.py` | the face order needing anything but clean 90-degree quarter turns |
| `test_spec_parity.py` | `src/spec.js` disagreeing with `shared/spec.json` |

`run_guards.py` is what the hooks call: `--fast` on every edit (structure +
config), the full four on Stop. It exits **2** on failure, which is what makes
a hook blocking.

## Why the last two exist

**Face order.** The rotation order is the one design decision that can be wrong
in a way nobody sees until the animation runs: two consecutive faces that do
not share a cube edge force a 180-degree double flip at that seam. An earlier
candidate order had exactly that defect. The test proves every step is a
quarter turn instead of trusting it.

**Spec parity.** `src/spec.js` restates `shared/spec.json` so that mounting
needs no `fetch`. Two copies of one truth is only safe while something checks
them, and this is that something.

## What is NOT here

Rendering itself is not unit-tested. The component's output is a picture, and a
picture is verified by looking at it — `python main.py`, then the graded
screenshot the visual-proof gate asks for.
