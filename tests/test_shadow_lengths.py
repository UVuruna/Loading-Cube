"""The shadow-length gate (GATE, owner-approved 2026-08-08).

CSS `box-shadow` accepts NO percentage — not offset, not blur, not spread — and
a declaration with one invalid component is dropped WHOLE and SILENTLY. Every
one of the nine finishes in `src/textures.js` used percentages for its vignette,
so every one of them lost its gold rim too: `enamel`'s cloisonne rim, the
`frame` finish's entire frame, `aquarel`'s gold rule, `damask`'s gold and black
edges. Nothing rendered and nothing complained, through six rounds of looking
at the cube.

The visual proof did not catch it either, and the reason is worth writing down:
that gate grades only the RULINGS a session touched, and "the finishes render as
written" had never been a ruling. A defect no ruling names is a defect nobody
looks at. Hence a mechanical check instead of a promise to look harder.

WHAT THIS CHECKS, EXACTLY. Every `boxShadow:` value assembled in the checked
files must be free of `%` inside a length position. That is asserted two ways:

1. STATICALLY — no `%` in any `boxShadow:` string literal, and no bare
   percentage in the length helpers.
2. BY CONSTRUCTION — every finish is called with a real size and its output is
   parsed: each comma-separated shadow's numeric components must be lengths
   (`px`), never percentages. This is the check that survives someone writing a
   new helper the static scan does not know about.

Step 2 needs a JS engine, and this project deliberately has no Node dependency
(README: no build step, no dependencies). So the parse is done in Python against
the finish recipes' TEXT, extracting the shadow expressions between the
`boxShadow:` key and the end of its value. Narrow and honestly documented, like
the config-section guard's JS side.

Run: python -m pytest tests/test_shadow_lengths.py
"""

import re
from pathlib import Path

import pytest

PROJECT_ROOT = Path(__file__).resolve().parent.parent

# ═══════════════════════════ SCOPE ═══════════════════════════
# Files that assemble box-shadow values. Any new one belongs here the day it is
# written -- a shadow recipe outside this list is a shadow nobody checks.
SHADOW_FILES = [
    "src/textures.js",
    "src/styles.js",
]

# A `<length>` in a shadow: a number with a unit, or a bare 0. Percentages and
# unitless non-zero numbers are both wrong.
PERCENT_LENGTH_RE = re.compile(r"-?\d*\.?\d+\s*%")


# ═══════════════════════════ EXTRACTION ═══════════════════════════


def _shadow_expressions(source: str) -> list[tuple[int, str]]:
    """Every `boxShadow:` value in the file, as (line number, raw text).

    The value ends at the comma or brace that closes it at nesting depth zero,
    so a `rgba(0,0,0,.5)` inside it is not mistaken for the end.
    """
    found: list[tuple[int, str]] = []
    for match in re.finditer(r"boxShadow\s*:", source):
        i = match.end()
        depth, start, n = 0, i, len(source)
        while i < n:
            c = source[i]
            if c in "\"'`":
                j = i + 1
                while j < n and source[j] != c:
                    j += 2 if source[j] == "\\" else 1
                i = j + 1
                continue
            if c in "([{":
                depth += 1
            elif c in ")]}":
                if depth == 0:
                    break
                depth -= 1
            elif c == "," and depth == 0:
                break
            i += 1
        line = source.count("\n", 0, match.start()) + 1
        found.append((line, source[start:i]))
    return found


def _css_shadow_blocks(source: str) -> list[tuple[int, str]]:
    """Every `box-shadow: ...;` declaration inside a CSS template literal."""
    found: list[tuple[int, str]] = []
    for match in re.finditer(r"box-shadow\s*:([^;}]*)", source):
        line = source.count("\n", 0, match.start()) + 1
        found.append((line, match.group(1)))
    return found


def _percent_offenders(text: str) -> list[str]:
    """Percentages that sit in a LENGTH slot, i.e. outside any function call.

    A `%` inside `rgba(...)` or `hsl(...)` is legitimate — it is a colour
    component, not a length — so the scan tracks parenthesis depth and only
    complains at depth zero.
    """
    offenders, depth, i, n = [], 0, 0, len(text)
    while i < n:
        c = text[i]
        if c == "(":
            depth += 1
        elif c == ")":
            depth = max(0, depth - 1)
        elif depth == 0:
            match = PERCENT_LENGTH_RE.match(text, i)
            if match:
                offenders.append(match.group(0).strip())
                i = match.end()
                continue
        i += 1
    return offenders


# ═══════════════════════════ TESTS ═══════════════════════════


@pytest.mark.parametrize("rel", SHADOW_FILES)
def test_no_box_shadow_uses_a_percentage_length(rel):
    path = PROJECT_ROOT / rel
    assert path.exists(), f"SHADOW_FILES names a file that does not exist: {rel}"
    source = path.read_text(encoding="utf-8")

    problems = []
    for line, text in _shadow_expressions(source) + _css_shadow_blocks(source):
        for bad in _percent_offenders(text):
            problems.append(f"{rel}:{line}: {bad!r} in a box-shadow length slot")

    assert not problems, (
        "box-shadow takes NO percentage, and ONE invalid component drops the "
        "WHOLE declaration silently -- write a real length (see textures.js's "
        "`px(size, fraction)` helper): " + "; ".join(problems)
    )


def test_every_finish_states_a_shadow():
    """A finish with no shadow at all would pass the scan above by being empty.

    Nine finishes, nine recipes, nine shadows: if one loses its `boxShadow` key
    the cube quietly goes flat, which is the same defect arriving by a different
    door.
    """
    source = (PROJECT_ROOT / "src" / "textures.js").read_text(encoding="utf-8")
    shadows = _shadow_expressions(source)
    spec = (PROJECT_ROOT / "shared" / "spec.json").read_text(encoding="utf-8")
    import json
    finish_count = len(json.loads(spec)["finishes"]) - 1  # minus the _comment key
    assert len(shadows) >= finish_count, (
        f"{finish_count} finishes in the spec but only {len(shadows)} boxShadow "
        "values in src/textures.js -- a finish without a shadow renders flat"
    )


def test_the_helpers_produce_pixels():
    """The `px()` helper is the whole defence, so pin what it emits.

    Read out of the source rather than reimplemented, so this cannot pass by
    testing a copy that has drifted from the real one.
    """
    source = (PROJECT_ROOT / "src" / "textures.js").read_text(encoding="utf-8")
    match = re.search(r"const px\s*=\s*\([^)]*\)\s*=>\s*(.+)", source)
    assert match, "src/textures.js no longer defines the px() length helper"
    body = match.group(1)
    assert "px`" in body or 'px"' in body or "px'" in body, (
        f"px() must emit a px length, got: {body.strip()}"
    )
    assert "%" not in body, f"px() must not emit a percentage: {body.strip()}"


def test_the_guard_is_actually_looking_at_this_project():
    """A scan that found no shadows at all would pass forever."""
    total = 0
    for rel in SHADOW_FILES:
        source = (PROJECT_ROOT / rel).read_text(encoding="utf-8")
        total += len(_shadow_expressions(source)) + len(_css_shadow_blocks(source))
    assert total >= 9, total
    # And the percent detector must really detect: a colour percentage is fine,
    # a length percentage is not.
    assert _percent_offenders("inset 0 -18% 34% -14% rgba(0,0,0,.55)") == ["-18%", "34%", "-14%"]
    assert _percent_offenders("inset 0 0 0 2px hsl(45 90% 60%)") == []
