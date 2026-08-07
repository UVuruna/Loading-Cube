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

/** The page background for `background: "sky"`, blended across dawn and dusk. */
export function skyBackground(sky) {
  const s = SPEC.sky;
  const [d0, d1] = s.dayGradient;
  const [n0, n1] = s.nightGradient;
  // altitude does the fading by itself: it is 0 at both horizons
  const daylight = sky.isDay ? Math.min(1, 0.25 + sky.altitude) : 0;
  const top = mixHex(n0, d0, daylight);
  const bottom = mixHex(n1, d1, daylight);
  return `linear-gradient(180deg, ${top}, ${bottom})`;
}

/**
 * Place the body on its orbit. `box` is the square the cube sits in; the
 * radius comes from the spec so the sun clears the ring as the ring clears
 * the cube.
 */
export function bodyPosition(sky, box, bodySize = 0, radiusFactor = SPEC.sky.bodyRadius) {
  const rad = (sky.angle * Math.PI) / 180;
  // The orbit is pulled in so the DISC fits, not just its centre: at the
  // zenith an unclamped radius pushed the sun's upper half out of the frame,
  // where the root's overflow:hidden sliced it off.
  const fits = box / 2 - bodySize / 2 - 4;
  const r = Math.min(box * radiusFactor, Math.max(0, fits));
  return {
    x: box / 2 + r * Math.cos(rad),
    y: box / 2 - r * Math.sin(rad)   // screen y grows downward
  };
}

/** Hours since midnight, as a float, from a Date. */
export const hoursOf = (date = new Date()) =>
  date.getHours() + date.getMinutes() / 60 + date.getSeconds() / 3600;
