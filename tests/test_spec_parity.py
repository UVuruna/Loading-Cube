"""THE SPEC IS ONE TRUTH, READ TWICE (project law 2, CLAUDE.md).

`src/spec.js` restates `shared/spec.json` so that `mount()` needs no `fetch`
and works from any origin with no build step. Two copies of one truth is only
safe while something checks them — this is that something.

HOW IT READS THE JS WITHOUT A JS ENGINE. The mirror is a plain object literal
of JSON-compatible values by construction, so the `export const SPEC = {...}`
block is extracted by brace matching and converted to JSON: quote the bare
keys, drop trailing commas. That is a narrow parser and it is meant to be —
if someone puts a function or a template string in the mirror, the conversion
fails loudly here rather than the two files drifting quietly. Anything that
cannot survive this trip does not belong in a cross-stack spec anyway.

Run: python -m pytest tests/test_spec_parity.py
"""

import json
import re
import sys
from pathlib import Path

import pytest

PROJECT_ROOT = Path(__file__).resolve().parent.parent
JSON_PATH = PROJECT_ROOT / "shared" / "spec.json"
JS_PATH = PROJECT_ROOT / "src" / "spec.js"

# `_comment` keys document the JSON for a human reading the file cold; the JS
# module carries the same explanations as real comments, so they are not
# expected to appear twice.
COMMENT_KEY = "_comment"


def _strip_comments(node):
    if isinstance(node, dict):
        return {k: _strip_comments(v) for k, v in node.items() if k != COMMENT_KEY}
    if isinstance(node, list):
        return [_strip_comments(v) for v in node]
    return node


def _extract_object(source: str, marker: str) -> str:
    start = source.index(marker) + len(marker)
    depth, i = 0, start
    while i < len(source):
        if source[i] == "{":
            depth += 1
        elif source[i] == "}":
            depth -= 1
            if depth == 0:
                return source[start:i + 1]
        i += 1
    raise AssertionError(f"unbalanced braces after {marker!r} in {JS_PATH}")


def _js_object_to_json(text: str):
    # line comments and banners
    text = re.sub(r"^\s*//.*$", "", text, flags=re.M)
    # bare keys -> quoted keys (never touches a key already quoted)
    text = re.sub(r'([{,]\s*)([A-Za-z_$][\w$]*)(\s*:)', r'\1"\2"\3', text)
    # trailing commas
    text = re.sub(r",(\s*[}\]])", r"\1", text)
    return json.loads(text)


@pytest.fixture(scope="module")
def pair():
    on_disk = _strip_comments(json.loads(JSON_PATH.read_text(encoding="utf-8")))
    source = JS_PATH.read_text(encoding="utf-8")
    mirror = _js_object_to_json(_extract_object(source, "export const SPEC ="))
    return on_disk, mirror


def test_the_two_specs_are_identical(pair):
    on_disk, mirror = pair
    if on_disk == mirror:
        return
    # a bare "dicts differ" on a 130-line spec is useless; name the keys
    def flatten(node, prefix=""):
        out = {}
        if isinstance(node, dict):
            for k, v in node.items():
                out.update(flatten(v, f"{prefix}.{k}" if prefix else k))
        elif isinstance(node, list):
            out[prefix] = json.dumps(node)
        else:
            out[prefix] = node
        return out

    a, b = flatten(on_disk), flatten(mirror)
    problems = []
    for key in sorted(set(a) | set(b)):
        if key not in a:
            problems.append(f"  {key}: missing from shared/spec.json (JS has {b[key]!r})")
        elif key not in b:
            problems.append(f"  {key}: missing from src/spec.js (JSON has {a[key]!r})")
        elif a[key] != b[key]:
            problems.append(f"  {key}: JSON {a[key]!r} vs JS {b[key]!r}")
    raise AssertionError(
        "shared/spec.json and src/spec.js have drifted:\n" + "\n".join(problems))


def test_the_faces_list_matches_the_axes(pair):
    """FACES is exported separately from SPEC and is easy to forget."""
    on_disk, _ = pair
    source = JS_PATH.read_text(encoding="utf-8")
    match = re.search(r"export const FACES\s*=\s*\[(.*?)\]", source, re.S)
    assert match, "src/spec.js no longer exports FACES"
    faces = re.findall(r'"([^"]+)"', match.group(1))
    assert sorted(faces) == sorted(on_disk["axes"]), (
        f"FACES {faces} does not cover exactly the spec's axes "
        f"{sorted(on_disk['axes'])}")


def test_the_guard_is_actually_looking_at_this_project(pair):
    """A parser that silently produced an empty dict would pass everything."""
    on_disk, mirror = pair
    assert len(mirror) >= 8, mirror.keys()
    # `>= 3`, not `== N`: the point is that the narrow parser really produced the
    # tables and not an empty dict, and pinning the exact count would just mean
    # editing this line every time a palette is born (four arrived 2026-08-08).
    assert "palettes" in mirror and len(mirror["palettes"]) >= 3
    assert len(mirror["sequence"]["tops"]) == 6
    assert on_disk["version"] == mirror["version"]
