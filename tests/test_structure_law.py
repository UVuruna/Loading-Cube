"""THE STRUCTURE LAW's guard — the god-file ratchet.

Root CLAUDE.md, Priority S -> THE STRUCTURE LAW (owner decree 2026-07-29,
SUPREME): any file crossing ~1,000 lines FAILS the build unless it is named in
a RATCHET allowlist, and a ratcheted file may only ever SHRINK.

This project is JavaScript with one Python launcher, and both are counted: a
1,200-line rings.js would be exactly the same defect as a 1,200-line main.py.

THE RATCHET IS EMPTY, and the intent is that it stays that way. Tumbler is
built as one module per responsibility from day one — spec, geometry,
textures, emblems, rings, sky, styles, the public face — precisely so no file
ever has a reason to grow into a god-file. Adding an entry here needs the
owner's explicit approval in the same session.
"""

import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent
MAX_LINES = 1000
SUFFIXES = (".py", ".js")
EXCLUDED_DIR_NAMES = {".venv", "venv", "node_modules", "__pycache__", ".git", "dist"}

# THE RATCHET — may only SHRINK (THE STRUCTURE LAW, clause 3). Adding an entry
# requires the owner's explicit approval in that same session.
# Entry: posix-relative path -> (why it is tolerated, who owes the split).
RATCHET: dict[str, tuple[str, str]] = {}


def _source_files():
    for path in PROJECT_ROOT.rglob("*"):
        if path.suffix not in SUFFIXES or not path.is_file():
            continue
        if any(part in EXCLUDED_DIR_NAMES for part in path.parts):
            continue
        yield path


def _line_count(path: Path) -> int:
    with path.open("r", encoding="utf-8", errors="replace") as handle:
        return sum(1 for _ in handle)


def test_no_file_crosses_the_threshold_outside_the_ratchet():
    """No new god-file, ever: every source file over MAX_LINES must be a named,
    owner-approved ratchet entry — otherwise the build fails."""
    offenders = []
    for path in _source_files():
        rel = path.relative_to(PROJECT_ROOT).as_posix()
        if rel in RATCHET:
            continue
        lines = _line_count(path)
        if lines > MAX_LINES:
            offenders.append(f"{rel} ({lines} lines)")
    assert not offenders, (
        "THE STRUCTURE LAW (root CLAUDE.md, Rule #20): these files crossed the "
        f"{MAX_LINES}-line violation threshold and are NOT in the ratchet: "
        + ", ".join(sorted(offenders))
        + ". Split by responsibility, or obtain the owner's explicit ratchet "
        "entry in this same session — never silently."
    )


def test_the_ratchet_only_shrinks():
    """A healed or vanished file must leave the list — the ratchet may never
    hold a file that no longer needs tolerating."""
    stale = []
    for rel in RATCHET:
        path = PROJECT_ROOT / rel
        if not path.exists():
            stale.append(f"{rel} (file no longer exists)")
        elif _line_count(path) <= MAX_LINES:
            stale.append(f"{rel} (healed — {_line_count(path)} lines)")
    assert not stale, (
        "THE STRUCTURE LAW ratchet must SHRINK: delete these entries — "
        + ", ".join(sorted(stale))
    )


def test_the_guard_is_actually_looking_at_this_project():
    """A guard that walks nothing passes forever. Pin that it sees both
    languages and the real source tree."""
    seen = {path.suffix for path in _source_files()}
    assert seen == {".py", ".js"}, seen
    names = {path.name for path in _source_files()}
    assert {"tumbler.js", "geometry.js", "rings.js", "main.py"} <= names
