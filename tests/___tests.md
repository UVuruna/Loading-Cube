# tests/ — the guards

Per root `CODE.md` -> Enforcement, plus three the component owns itself.

| Test | What fails the build |
|---|---|
| `test_structure_law.py` | any `.py`/`.js` file over ~1,000 lines; the ratchet is EMPTY and meant to stay so |
| `test_config_sections.py` | a config table defined outside its named section, or patched after definition |
| `test_docs_coverage.py` | a source file missing the docs its tier requires, or carrying docs it did not earn |
| `test_doc_links.py` | a doc unreachable from `README.md`, or a relative link with no target |
| `test_face_order.py` | the face order needing anything but clean 90-degree quarter turns |
| `test_spec_parity.py` | `src/spec.js` disagreeing with `shared/spec.json` |
| `test_shadow_lengths.py` | a `box-shadow` written with a percentage length |

`run_guards.py` is what the hooks call: `--fast` on every edit (structure +
config), the full set on Stop. It exits **2** on failure, which is what makes
a hook blocking.

## Why the last three exist

**Face order.** The rotation order is the one design decision that can be wrong
in a way nobody sees until the animation runs: two consecutive faces that do
not share a cube edge force a 180-degree double flip at that seam. An earlier
candidate order had exactly that defect. The test proves every step is a
quarter turn instead of trusting it.

**Spec parity.** `src/spec.js` restates `shared/spec.json` so that mounting
needs no `fetch`. Two copies of one truth is only safe while something checks
them, and this is that something.

**Shadow lengths** (GATE, owner-approved 2026-08-08). CSS `box-shadow` accepts no
percentage anywhere, and it drops a declaration with one invalid component WHOLE
and SILENTLY. All nine finishes wrote their vignette with percentages, so all
nine lost their gold rims as well, and the cube rendered flat for six rounds
without one error in the console. This gate scans every `boxShadow:` value and
every CSS `box-shadow` declaration for a percentage in a length slot — tracking
parenthesis depth, so a legitimate `hsl(45 90% 60%)` is left alone — and pins
that the `px()` helper still emits pixels.

Its negative control is inside the guard: the self-check asserts that the exact
old string `inset 0 -18% 34% -14% rgba(0,0,0,.55)` IS reported. A detector that
cannot fail is theatre.

## What is NOT here

Rendering itself is not unit-tested. The component's output is a picture, and a
picture is verified by looking at it — `python main.py`, then the graded
screenshot the visual-proof gate asks for.
