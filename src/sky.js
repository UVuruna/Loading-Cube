// Where the sun and the moon actually are, and what that does to the cube.
//
// The owner's two sketches (morning.png, evening.png) are the spec: a real
// SUN drawn in the upper-left in the morning, a real MOON in the lower-right
// at night — bodies riding a circle around the cube, not merely a direction
// the light comes from. Upper half of that circle is the sun's, lower half
// the moon's: 06:00 left, 12:00 at the zenith, 18:00 right, 00:00 at the
// bottom.
//
// A FULL MOON REALLY LIGHTS IT (owner 2026-08-07). Moonlight is weaker and
// colder, it falls on the LOWER faces because that is where the moon hangs,
// and its strength follows the phase — a new moon lights nothing. The phase
// comes from the synodic month counted off a known new moon, which is a
// dozen arithmetic operations and needs no ephemeris.
//
// ACCURACY IS A CHOICE, AND THIS IS LEVEL 2 (see README): the clock plus the
// machine's UTC offset, which puts noon at true solar noon within the width
// of a time zone and needs no coordinates, no permission dialog and no
// network. Level 3 — real sunrise and sunset for a date and a place — is the
// `latitude`/`longitude` option, unset by default; a loading spinner has no
// business asking anyone where they live.
//
// See src/__about/sky.md and src/__flow/sky.md.
"use strict";

import { SPEC } from "./spec.js";

export const SUN_SVG = new URL("../assets/sun.svg", import.meta.url).href;
export const MOON_SVG = new URL("../assets/moon.svg", import.meta.url).href;

const NEW_MOON_MS = Date.parse(SPEC.sky.knownNewMoonUtc);
const DAY_MS = 86400000;

/** 0 = new, 0.5 = full, approaching 1 = new again. */
export function moonPhase(date = new Date()) {
  const days = (date.getTime() - NEW_MOON_MS) / DAY_MS;
  const p = (days / SPEC.sky.synodicMonthDays) % 1;
  return p < 0 ? p + 1 : p;
}

/** Fraction of the moon's disc that is lit — 0 at new, 1 at full. */
export const moonIllumination = phase => (1 - Math.cos(2 * Math.PI * phase)) / 2;

function mixHex(a, b, t) {
  const parse = s => [parseInt(s.slice(1, 3), 16), parseInt(s.slice(3, 5), 16), parseInt(s.slice(5, 7), 16)];
  const [r1, g1, b1] = parse(a), [r2, g2, b2] = parse(b);
  const k = Math.max(0, Math.min(1, t));
  const c = (x, y) => Math.round(x + (y - x) * k);
  return `rgb(${c(r1, r2)},${c(g1, g2)},${c(b1, b2)})`;
}

/**
 * The state of the sky at a given hour.
 *
 * `angle` is measured counter-clockwise from the 3 o'clock direction, so 90
 * is the zenith and 270 the nadir; `dir` is the same direction as a vector in
 * the CSS frame (+y DOWN), tipped toward the viewer so a face turned to the
 * light actually brightens instead of only the silhouette edge.
 */
export function skyAt(hour, options = {}) {
  const s = SPEC.sky;
  const h = ((hour % 24) + 24) % 24;
  const rise = options.sunriseHour ?? s.sunriseHour;
  const set = options.sunsetHour ?? s.sunsetHour;
  const isDay = h >= rise && h < set;

  const dayLength = set - rise;
  const nightLength = 24 - dayLength;
  const t = isDay
    ? (h - rise) / dayLength
    : (h < rise ? h + (24 - set) : h - set) / nightLength;

  const angle = isDay ? 180 - 180 * t : 360 - 180 * t;
  const rad = (angle * Math.PI) / 180;
  // 0 on the horizon, 1 at the top of the body's own arc
  const altitude = Math.sin(rad < Math.PI ? rad : rad - Math.PI);

  const body = isDay ? s.sun : s.moon;
  const phase = moonPhase(options.date);
  const lit = moonIllumination(phase);
  // A new moon is a black disc: no light, and nearly nothing to draw.
  const power = isDay ? body.power : body.power * lit;
  const ambient = isDay ? body.ambient : s.moon.ambient * (0.55 + 0.45 * lit);

  return {
    isDay,
    hour: h,
    angle,
    altitude,
    phase,
    illumination: lit,
    dir: [Math.cos(rad), -Math.sin(rad), 0.42],
    color: mixHex(body.horizonColor, body.zenithColor, Math.pow(altitude, 0.7)),
    ambient,
    power,
    bodySrc: isDay ? SUN_SVG : MOON_SVG,
    bodyOpacity: isDay ? 1 : 0.35 + 0.65 * lit
  };
}

/**
 * How much of the sky is DAY right now: 1 in full daylight, 0 in full night,
 * and a smooth ramp centred on sunrise and on sunset.
 *
 * This is the one number the backdrop needs — clouds fade in with it, stars
 * fade out with it, and the ground colour is a straight mix on it — so it is
 * computed here, where the sun and the moon already live, rather than twice.
 *
 * Centred, not clamped at the boundary: the old version jumped straight to 0.25
 * at sunrise, which read as the sky switching on. `blendHours` is half above and
 * half below each boundary, so 06:00 with a 1.5-hour blend is exactly half lit
 * and the last star goes out at 06:45.
 */
export function daylight(sky, blend = SPEC.backdrop.blendHours) {
  const s = SPEC.sky;
  const rise = s.sunriseHour, set = s.sunsetHour;
  const dayLength = set - rise;
  const sinceRise = (((sky.hour - rise) % 24) + 24) % 24;
  // Hours to the NEAREST boundary — positive inside the day, negative at night.
  const edge = sinceRise <= dayLength
    ? Math.min(sinceRise, dayLength - sinceRise)
    : -Math.min(sinceRise - dayLength, 24 - sinceRise);
  return Math.max(0, Math.min(1, 0.5 + edge / blend));
}

/** The sky's own ground colour right now, day and night gradients blended. */
export function skyBackground(sky) {
  const s = SPEC.sky;
  const [d0, d1] = s.dayGradient;
  const [n0, n1] = s.nightGradient;
  const lit = daylight(sky);
  return `linear-gradient(180deg, ${mixHex(n0, d0, lit)}, ${mixHex(n1, d1, lit)})`;
}

/**
 * Place the body ON THE FRAME (owner 2026-08-08: "sunce/mesec TREBA da ide po
 * ivicama ekrana ... uvek hvata ivicu u tom uglu").
 *
 * The old version put the body on a CIRCLE of radius 0.44 x box, and a circle
 * knows nothing about the shape it sits in: along a diagonal it stopped well
 * short of the corner, which is exactly the "barely visible behind the cube"
 * the owner photographed. What is wanted is the rectangle's PERIMETER — at noon
 * the top edge, at 15:00 the corner, at 18:00 the right edge — so the body is
 * always as far out as the frame allows in whatever direction the hour points.
 *
 * That is a ray-rectangle intersection and it is one line of arithmetic: for a
 * unit direction (dx, dy) the ray leaves a half-width/half-height box at
 * t = min(halfW/|dx|, halfH/|dy|), whichever wall it reaches first. The box is
 * shrunk by half the body plus a margin BEFORE the intersection, so what lands
 * on the edge is the disc's rim and not its centre — an unshrunk box put half
 * the sun outside, where the root's overflow:hidden sliced it off.
 *
 * `width` and `height` are the frame's, not the cube's: with `sky` on the root
 * fills its host and the host may be any shape, so a wide window really does
 * carry the sun further out sideways than up.
 */
export function bodyPosition(sky, width, height, bodySize = 0,
                             margin = SPEC.sky.bodyMarginPx) {
  const rad = (sky.angle * Math.PI) / 180;
  const dx = Math.cos(rad);
  const dy = -Math.sin(rad);              // screen y grows downward
  const halfW = Math.max(0, width / 2 - bodySize / 2 - margin);
  const halfH = Math.max(0, height / 2 - bodySize / 2 - margin);

  // A direction exactly along an axis has one zero component; Infinity is the
  // right answer for that wall (it is never reached) and `min` discards it.
  const tx = Math.abs(dx) < 1e-9 ? Infinity : halfW / Math.abs(dx);
  const ty = Math.abs(dy) < 1e-9 ? Infinity : halfH / Math.abs(dy);
  const t = Math.min(tx, ty);

  return {x: width / 2 + dx * t, y: height / 2 + dy * t};
}

/** Hours since midnight, as a float, from a Date. */
export const hoursOf = (date = new Date()) =>
  date.getHours() + date.getMinutes() / 60 + date.getSeconds() / 3600;
