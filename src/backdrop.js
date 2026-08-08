// What sits BEHIND everything: six backgrounds, all of them computed.
//
// The owner's six (2026-08-08): `day` is the day sky WITH drifting clouds,
// `night` is the night sky WITH stars, `cycle` alternates the two on the clock,
// `light` and `dark` are the same two colours plain, and `transparent` is
// nothing at all.
//
// NOT ONE PICTURE ANYWHERE (project law 3). A cloud is a stack of radial
// gradients and a star field is one element carrying a list of box-shadows —
// which means the whole backdrop costs a few kilobytes of generated string and
// scales to any size, instead of putting a sky bitmap in front of the very
// thing the user is waiting for.
//
// NOTHING RUNS PER FRAME (project law 4). Cloud drift and star twinkle are CSS
// animations on the compositor. The ONE thing the clock touches is `cycle`, and
// even there `blend()` compares before it writes — a backdrop that is still
// mid-afternoon writes nothing at all.
//
// TWO CLOUD BANDS, NOT ONE. A far band drifting slowly beneath a near band
// drifting faster is what reads as depth; a single band reads as wallpaper
// sliding past. Each band is TWICE the frame wide and travels exactly half its
// own width, with every puff repeated at +50% — so the moment it wraps, the
// pixels it lands on are the pixels it left, and the seam cannot be seen.
//
// See src/__about/backdrop.md.
"use strict";

import { SPEC } from "./spec.js";
import { daylight, skyBackground } from "./sky.js";

// ═══════════════════ DETERMINISTIC SCATTER ═══════════════════
/**
 * A hash, not a linear congruential step.
 *
 * `(i * 9301 + 49297) % 233280` walks the plane in a straight line, so
 * sequential indices land on a lattice and a star field comes out visibly ruled
 * with diagonal rows — seen on the first render of the owner's proposal page.
 * An avalanche hash decorrelates neighbouring indices while staying perfectly
 * deterministic, so the sky is identical on every load without being a grid,
 * and no `Math.random` ever enters the artwork.
 */
function hash01(i) {
  let x = ((i + 1) * 2654435761) >>> 0;
  x ^= x >>> 15; x = (x * 2246822519) >>> 0;
  x ^= x >>> 13; x = (x * 3266489917) >>> 0;
  x ^= x >>> 16;
  return x / 4294967296;
}

// ═══════════════════════ THE SCENES ═══════════════════════
/**
 * One cloud band: `puffs` cumulus shapes, each three overlapping lobes because
 * a single ellipse reads as a smear. Positions are stated as percentages of the
 * band, so the band resizes with its host and never needs measuring.
 */
function cloudBand(spec) {
  const images = [];
  for (let i = 0; i < spec.puffs; i++) {
    const x = (i + 0.5) * (50 / spec.puffs) + (hash01(i * 2) - 0.5) * 4;
    const y = 24 + hash01(i * 2 + 1) * 46;
    const rx = 5.6 + hash01(i * 5) * 3.6;
    const lobes = [[0, 0, 1], [-rx * 0.82, 5, 0.74], [rx * 0.86, 6, 0.68]];
    // Every puff twice, half a band apart: that is what makes the wrap seamless.
    for (const dx of [0, 50]) {
      for (const [ox, oy, k] of lobes) {
        images.push(
          `radial-gradient(${(rx * k).toFixed(2)}% ${(rx * k * 4.6).toFixed(2)}% at ` +
          `${(x + dx + ox).toFixed(2)}% ${(y + oy).toFixed(1)}%, ` +
          `rgba(255,255,255,${spec.opacity}) 0%, ` +
          `rgba(255,255,255,${(spec.opacity * 0.42).toFixed(3)}) 46%, ` +
          `rgba(255,255,255,0) 82%)`);
      }
    }
  }
  const band = document.createElement("div");
  band.className = "lc-cloud";
  band.style.setProperty("--lc-drift", `${spec.driftSeconds}s`);
  band.style.top = `${spec.topPercent}%`;
  band.style.height = `${spec.heightPercent}%`;
  band.style.backgroundImage = images.join(",");
  return band;
}

/**
 * One star field as a single element carrying a REPEATING TILE of dots.
 *
 * The first version placed each star at an absolute pixel offset, which is a
 * trap: the frame is whatever the embedder's host is, so a field sized for 900px
 * left the right half of a 1400px window starless and put only a fifth of its
 * stars inside a portrait phone frame. A tile has no size to get wrong — it
 * repeats to fill whatever it is given, at any aspect ratio, forever.
 *
 * The two fields use DIFFERENT tile sizes on purpose. One tile repeating on its
 * own is a wallpaper and the eye finds the period; two coprime periods laid over
 * each other do not visibly repeat at any size a screen has.
 */
function starTile(perTile, tilePx, dotPx, className, salt) {
  const dots = [];
  for (let i = 0; i < perTile; i++) {
    const x = hash01(i * 3 + salt) * 100;
    const y = hash01(i * 3 + 1 + salt) * 100;
    const alpha = 0.45 + hash01(i * 3 + 2 + salt) * 0.5;
    // A SOLID CORE, then the falloff. A gradient that fades from the centre
    // outward has no opaque pixel at all at this radius, so the first sky came
    // out with two hundred stars in it and looked empty.
    dots.push(
      `radial-gradient(${dotPx}px ${dotPx}px at ${x.toFixed(2)}% ${y.toFixed(2)}%,` +
      `rgba(255,255,255,${alpha.toFixed(2)}) 0%,` +
      `rgba(255,255,255,${alpha.toFixed(2)}) 42%,` +
      `rgba(255,255,255,0) 100%)`);
  }
  const field = document.createElement("div");
  field.className = className;
  field.style.backgroundImage = dots.join(",");
  // With a background-size set, each gradient's own `at X% Y%` resolves inside
  // the TILE — which is what makes one declaration place one star per tile.
  field.style.backgroundSize = `${tilePx}px ${tilePx}px`;
  return field;
}

const layer = className => {
  const div = document.createElement("div");
  div.className = className;
  return div;
};

function dayScene() {
  const wrap = layer("lc-scene");
  wrap.appendChild(layer("lc-ground-day"));
  for (const band of SPEC.backdrop.clouds) wrap.appendChild(cloudBand(band));
  return wrap;
}

function nightScene() {
  const s = SPEC.backdrop.stars;
  const wrap = layer("lc-scene");
  wrap.appendChild(layer("lc-ground-night"));
  wrap.appendChild(starTile(s.perTile, s.tilePx, s.sizePx, "lc-stars", 0));
  // A different salt as well as a different period: the same hash sequence at a
  // different tile size would still put the bright stars on top of the faint ones.
  wrap.appendChild(starTile(s.twinklePerTile, s.twinkleTilePx, s.twinkleSizePx,
                            "lc-stars lc-twinkle", 977));
  return wrap;
}

// ═══════════════════════ THE BACKDROP ═══════════════════════
/**
 * Build the backdrop for one background name and attach it to `root`.
 *
 * Returns an object with a `blend(sky)` method, or null when the background has
 * nothing to blend. Only `cycle` needs the clock; every other background is
 * finished the moment it is built, which is why `blend` is a no-op rather than a
 * branch the caller has to remember.
 */
export function buildBackdrop(root, background) {
  if (background === "transparent") return null;

  if (background === "light" || background === "dark") {
    root.style.background = background === "light"
      ? SPEC.sky.plainDay : SPEC.sky.plainNight;
    return null;
  }

  if (background === "day" || background === "night") {
    root.appendChild(background === "day" ? dayScene() : nightScene());
    return null;
  }

  if (background !== "cycle") return null;

  // `cycle` is the only one that keeps a handle on the clock: both scenes are
  // built once and the night one is cross-faded over the day one. Rebuilding a
  // sky field twice a day would be the expensive way to do the same thing.
  //
  // NO CSS TRANSITION on that cross-fade, and the reason is worth the comment.
  // A `transition: opacity .9s` re-arms on every rebuild, and an element born
  // with the default opacity of 1 then TRAVELS from full night to the correct
  // value — so setting the clock to noon flashed a starry dusk for most of a
  // second, and so did changing any unrelated control. Graded 6/10.
  // It buys nothing either way: `daylight` is continuous and this writes at 1%
  // granularity, which over a 1.5-hour blend is one step every fifty seconds.
  // The value IS the animation.
  const day = dayScene();
  const night = nightScene();
  night.style.opacity = "0";      // a definite start, never the default 1
  root.append(day, night);

  let painted = -1;
  return {
    blend(sky) {
      const lit = daylight(sky);
      // Two decimals is finer than any eye and coarser than any frame, so a
      // still afternoon writes to the DOM exactly zero times.
      const step = Math.round(lit * 100) / 100;
      if (step === painted) return;
      painted = step;
      night.style.opacity = (1 - step).toFixed(2);
      root.style.background = skyBackground(sky);
    }
  };
}
