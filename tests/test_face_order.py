"""THE FACE ORDER IS A QUARTER TURN, ALWAYS (project law 1, CLAUDE.md).

The rotation order is the one design decision here that can be wrong in a way
nobody sees until the animation runs. Two consecutive faces that do not share
a cube edge are OPPOSITE faces, and bringing one to the top from the other
takes a 180-degree double flip — five graceful turns and then a lurch, at the
same point in every loop.

That is not hypothetical. The first order proposed in this project was
yellow, red, blue, green, orange, purple; five of its six steps were clean and
the sixth, purple back to yellow, was exactly that lurch. It was caught by
computing the adjacency, not by watching. This test is that computation, kept.

Run: python -m pytest tests/test_face_order.py
"""

import json
import sys
from pathlib import Path

import pytest

PROJECT_ROOT = Path(__file__).resolve().parent.parent
SPEC = json.loads((PROJECT_ROOT / "shared" / "spec.json").read_text(encoding="utf-8"))

# Unit normals from the spec's own axis strings, so the test cannot drift from
# the file it is checking: "+y" -> (0, 1, 0), "-z" -> (0, 0, -1).
AXIS_INDEX = {"x": 0, "y": 1, "z": 2}


def _normal(axis: str):
    sign = -1 if axis[0] == "-" else 1
    vector = [0, 0, 0]
    vector[AXIS_INDEX[axis[1]]] = sign
    return tuple(vector)


# `_comment` keys document the JSON for a human reading it cold; they are not
# faces, and walking into one turns every lookup below into a string index.
AXES = {k: v for k, v in SPEC["axes"].items() if k != "_comment"}
NORMALS = {face: _normal(meta["axis"]) for face, meta in AXES.items()}
TOPS = SPEC["sequence"]["tops"]


def _dot(a, b):
    return sum(x * y for x, y in zip(a, b))


def test_every_face_appears_exactly_once():
    assert sorted(TOPS) == sorted(AXES), (
        "the sequence must be a permutation of the six faces, not a subset "
        f"or a repeat: {TOPS}"
    )


@pytest.mark.parametrize("index", range(6))
def test_each_step_is_a_quarter_turn(index):
    here = TOPS[index]
    there = TOPS[(index + 1) % len(TOPS)]
    product = _dot(NORMALS[here], NORMALS[there])
    assert product == 0, (
        f"step {index + 1}: {here} -> {there} is not a quarter turn. "
        f"Their normals give a dot product of {product}: "
        + ("they are OPPOSITE faces, so this step is a 180-degree double flip "
           "and will lurch at the same point in every loop"
           if product == -1 else "they are the same face")
    )


@pytest.mark.parametrize("face", sorted(AXES))
def test_opposite_faces_are_far_apart_in_the_cycle(face):
    """A pair of opposite faces at cycle-distance 1 IS the double flip above;
    this states the same law from the other side, so a future reorder cannot
    satisfy one check by accident while breaking the other."""
    opposite = AXES[face]["opposite"]
    assert _dot(NORMALS[face], NORMALS[opposite]) == -1, (
        f"spec says {face}'s opposite is {opposite}, but their normals "
        "are not antiparallel — the axes table itself is wrong"
    )
    distance = abs(TOPS.index(face) - TOPS.index(opposite))
    distance = min(distance, len(TOPS) - distance)
    assert distance >= 2, (
        f"{face} and {opposite} are opposite faces but sit next to each other "
        f"in the sequence {TOPS}"
    )


def test_the_guard_is_actually_looking_at_this_project():
    """A guard that walks nothing passes forever."""
    assert len(TOPS) == 6, TOPS
    assert len(NORMALS) == 6, NORMALS
    # the shipped order, spelled out — a silent reorder must fail HERE too,
    # loudly, instead of only being geometrically legal
    assert TOPS == ["gold", "copper", "ruby", "amethyst", "sapphire", "emerald"], (
        "the face order changed. That is allowed — but it is an owner "
        "decision, so update this line in the same commit and say why."
    )
