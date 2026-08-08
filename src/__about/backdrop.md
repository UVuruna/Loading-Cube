# `backdrop.js` — the six backgrounds

What sits BEHIND everything. Owner decree 2026-08-08: six named backgrounds, no
more and no fewer.

| `background` | What it is |
|---|---|
| `transparent` | nothing at all — the host's own page shows through |
| `light` | the day sky's colour, flat (`sky.plainDay`) |
| `dark` | the night sky's colour, flat (`sky.plainNight`) |
| `day` | the day sky gradient WITH drifting clouds |
| `night` | the night sky gradient WITH stars |
| `cycle` | `day` and `night` cross-faded on the clock |

The default is `transparent`, because the only thing this component owes a
consumer is the turning cube.

## Not one picture anywhere

Project law 3 (`CLAUDE.md`) with an extra reason here: a loading backdrop is the
first thing painted while the machine is at its busiest, so a sky bitmap would
put hundreds of kilobytes in front of the very thing the user is waiting for. A
cloud is a stack of `radial-gradient` lobes; a star field is one element
carrying a repeating tile of computed dots. The whole backdrop is a generated
string measured in kilobytes and it is resolution-independent.

## Two cloud bands, and why the seam cannot be seen

A single drifting band reads as wallpaper sliding past. Two — a far one slow and
faint, a near one faster and solid — read as depth. Each band is **twice** the
frame wide and travels **exactly half its own width**, and every puff is emitted
twice, half a band apart. So at the moment the animation wraps, the pixels it
lands on are the pixels it left.

Each puff is three overlapping lobes rather than one ellipse: a single ellipse
at cloud proportions reads as a smear.

## Stars are a TILE, not a list of positions

The first version placed each star at an absolute pixel offset. That is a trap,
and it showed: the frame is whatever the embedder's host is, so a field sized for
900 px left the right half of a 1400 px window starless and put only a fifth of
its stars inside a portrait phone frame. A repeating tile has no size to get
wrong — it fills whatever it is given, at any aspect ratio.

The two fields use different tile periods **and** different hash salts. One tile
repeating alone is a wallpaper and the eye finds the period; two coprime periods
laid over each other do not visibly repeat at any size a screen has, and
different salts keep the bright stars off the faint ones.

Each dot has a **solid core** before its falloff. A gradient that fades from the
centre outward has no fully opaque pixel at all at a 1.6 px radius, so the first
sky had two hundred stars in it and looked empty.

## The hash, and why not an LCG

`(i * 9301 + 49297) % 233280` walks the plane in a straight line: sequential
indices land on a lattice and the sky comes out visibly ruled with diagonal
rows. That happened on the first render of the owner's proposal page. `hash01`
is an avalanche hash — neighbouring indices decorrelate — and it is still
perfectly deterministic, so the sky is identical on every load and no
`Math.random` ever enters the artwork.

## What touches the clock, and how rarely

Only `cycle`. Both scenes are built once and the night one is cross-faded over
the day one; rebuilding a sky field twice a day would be the expensive way to do
the same thing. `blend(sky)` rounds the daylight fraction to two decimals and
compares before it writes, so a still afternoon writes to the DOM **zero**
times. Project law 4 is kept by not needing to be kept.

The daylight fraction itself is not computed here — it comes from
[sky.js](sky.md), which already owns what colour the sky is at a given hour. One
module answers "what time is it in the sky", the other "what does that look
like".

## Where the numbers live

Counts, opacities, drift durations and tile periods are in
`../../shared/spec.json` under `backdrop`, because they are cross-stack facts: a
WPF renderer can honour "two cloud bands, the near one drifting in 86 seconds".
The gradient strings that draw a puff are not there — they are CSS, and a stack
without CSS cannot honour them ([shared/___shared.md](../../shared/___shared.md)).

Back to [src/](../___src.md).
