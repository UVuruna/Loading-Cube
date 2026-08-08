// The rotation itself: 3x3 matrix maths, the six face normals, and the driver
// that walks the owner's top-face order one quarter turn at a time.
//
// COORDINATE FRAME. Everything here is in the CSS 3D frame — +x right, +y
// DOWN, +z toward the viewer — because that is the frame the transform is
// finally written in, and converting at the boundary is where sign errors
// breed. "Up" is therefore (0, -1, 0), spelled out once as UP and never
// assumed again.
//
// WHY MATRICES AND NOT EULER ANGLES. The cube tumbles about a DIFFERENT
// horizontal axis at every step, and that axis depends on where the next face
// currently points. Euler angles would need unwinding at every step and would
// gimbal-lock the moment a face came to rest overhead; a rotation matrix
// composed in world space just accumulates.
//
// See src/__about/geometry.md and src/__flow/geometry.md.
"use strict";

import { SPEC, FACES } from "./spec.js";

/** Up in CSS coordinates. +y points DOWN the screen, so up is negative. */
export const UP = [0, -1, 0];

/** Outward normal of each face in the cube's own frame. */
export const NORMALS = {
  gold:     [0, -1, 0],
  amethyst: [0, 1, 0],
  sapphire: [-1, 0, 0],
  copper:   [1, 0, 0],
  emerald:  [0, 0, 1],
  ruby:     [0, 0, -1]
};

/** The CSS transform that lays each face onto its side of the cube. */
export const FACE_CSS = {
  gold:     "rotateX(90deg)",
  amethyst: "rotateX(-90deg)",
  sapphire: "rotateY(-90deg)",
  copper:   "rotateY(90deg)",
  emerald:  "",
  ruby:     "rotateY(180deg)"
};

export const identity = () => [1, 0, 0, 0, 1, 0, 0, 0, 1];

/** Row-major 3x3 product a·b. */
export function mul(a, b) {
  const o = new Array(9);
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      o[r * 3 + c] = a[r * 3] * b[c] + a[r * 3 + 1] * b[3 + c] + a[r * 3 + 2] * b[6 + c];
    }
  }
  return o;
}

export const apply = (m, v) => [
  m[0] * v[0] + m[1] * v[1] + m[2] * v[2],
  m[3] * v[0] + m[4] * v[1] + m[5] * v[2],
  m[6] * v[0] + m[7] * v[1] + m[8] * v[2]
];

export const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];

export const cross = (a, b) => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0]
];

export function normalize(v) {
  const len = Math.hypot(v[0], v[1], v[2]);
  return len < 1e-9 ? null : [v[0] / len, v[1] / len, v[2] / len];
}

/** Rodrigues rotation about a unit axis, row-major. Matches CSS rotateX/Y/Z. */
export function axisAngle(axis, theta) {
  const [x, y, z] = axis;
  const c = Math.cos(theta), s = Math.sin(theta), k = 1 - c;
  return [
    c + x * x * k,     x * y * k - z * s, x * z * k + y * s,
    y * x * k + z * s, c + y * y * k,     y * z * k - x * s,
    z * x * k - y * s, z * y * k + x * s, c + z * z * k
  ];
}

/** CSS matrix3d is COLUMN-major; a row-major matrix transposes on the way out. */
export const toCss = m =>
  `matrix3d(${m[0]},${m[3]},${m[6]},0,${m[1]},${m[4]},${m[7]},0,${m[2]},${m[5]},${m[8]},0,0,0,0,1)`;

/**
 * The fixed viewing tilt, so the cube reads as a solid and not a flat square.
 *
 * The angle is the TRUE isometric one — atan(1/sqrt(2)) ≈ 35.264 degrees,
 * negated because +y points down. Paired with a 45-degree yaw it puts a VERTEX
 * of the cube at the centre of the frame and foreshortens all three visible
 * faces equally, which is the pose the owner's sketch shows and the pose the
 * animation must open in (owner 2026-08-08). At the old -20 degrees the top
 * face was merely tipped and no yaw could produce a true corner view.
 */
export const TILT = axisAngle([1, 0, 0], (SPEC.timing.viewTiltDegrees * Math.PI) / 180);

/** The opening yaw about the vertical, in radians — the other half of isometric. */
const START_YAW = (SPEC.timing.startYawDegrees * Math.PI) / 180;

/**
 * The rotation that carries `face` to the top from the current orientation.
 *
 * Generic on purpose: the axis is whatever horizontal direction is
 * perpendicular to both the face's current heading and up, and the angle is
 * however far it has to travel. For the owner's order that is always a clean
 * 90 degrees — but if a future order ever asked for a face that is currently
 * at the BOTTOM, the cross product would vanish (a vector and its opposite
 * span no plane) and there would be no axis to turn about. That case picks an
 * arbitrary horizontal axis and flips 180, so a bad order looks clumsy on
 * screen instead of throwing. tests/test_face_order.py is what keeps the
 * shipped order out of that branch.
 */
export function tumbleTo(R, face) {
  const heading = apply(R, NORMALS[face]);
  const angle = Math.acos(Math.max(-1, Math.min(1, dot(heading, UP))));
  let axis = normalize(cross(heading, UP));
  if (!axis) {
    if (angle < 1e-6) return { R, axis: [1, 0, 0], angle: 0 };
    axis = [1, 0, 0];
  }
  return { R: mul(axisAngle(axis, angle), R), axis, angle };
}

/** Which face currently points most nearly upward. */
export function topFace(R) {
  let best = null, bestDot = -2;
  for (const face of FACES) {
    const d = dot(apply(R, NORMALS[face]), UP);
    if (d > bestDot) { bestDot = d; best = face; }
  }
  return best;
}

const easeInOutCubic = p =>
  p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;

/**
 * Which single face `by-day` mode shows, for a given date.
 *
 * The owner's mapping (2026-08-08) is indexed by the weekday exactly as
 * `Date#getDay()` reports it, Sunday first — and Sunday is the one entry that
 * names no face at all but the string `"mono"`, because Sunday is the
 * monochrome cube. Callers that get `"mono"` back must choose a palette, not a
 * face; the face they show is the first of the sequence.
 */
export const faceOfDay = (date = new Date()) =>
  SPEC.sequence.weekdays[date.getDay()];

/**
 * The driver. Two phases forever: SPIN about the vertical axis (showing the
 * four sides of whichever face is up), then TUMBLE to bring the next face up.
 * The spin is frozen during a tumble — letting both run would mean the face
 * never lands where the tumble aimed it, because the target is computed once
 * at the start of the turn.
 *
 * WHY THE DWELL IS A WHOLE TURN. At 320 degrees the yaw advanced 40 degrees
 * every time a face changed, so the opening isometric pose survived exactly one
 * face and then drifted — after three tumbles the cube presented an edge, not a
 * corner. A full 360 makes the yaw periodic, and the tumble itself preserves
 * the phase (its axis is horizontal and at 45 degrees, so a quarter turn about
 * it carries a corner pose to another corner pose). The result is that EVERY
 * dwell, not merely the first, begins at the vertex.
 */
export class Rotation {
  constructor(options = {}) {
    const t = SPEC.timing;
    this.sequence = options.sequence || SPEC.sequence.tops;
    this.spinSpeed = options.spinSpeed ?? t.spinSpeed;
    this.dwellDegrees = options.dwellDegrees ?? t.dwellDegrees;
    this.tumbleSeconds = options.tumbleSeconds ?? t.tumbleSeconds;
    // Both `per-show` and `by-day` show ONE face and never tumble: the first
    // means one colour per appearance, the second one colour per weekday.
    this.once = options.mode === "per-show" || options.mode === "by-day";

    this.index = 0;
    this.mode = "spin";
    this.spun = 0;
    this.elapsed = 0;
    this.base = identity();
    // Yaw FIRST, in world space, exactly as `step` does it — so the opening
    // matrix is a pose the spin itself will return to every whole turn.
    this.R = mul(axisAngle(UP, START_YAW), tumbleTo(identity(), this.sequence[0]).R);
    this.display = this.R;
    this.axis = [1, 0, 0];
    this.angle = 0;
  }

  /** Advance by `dt` seconds and return the matrix to display. */
  step(dt) {
    if (this.mode === "spin") {
      const degrees = this.spinSpeed * dt;
      this.R = mul(axisAngle(UP, (degrees * Math.PI) / 180), this.R);
      this.spun += degrees;
      this.display = this.R;
      if (!this.once && this.spun >= this.dwellDegrees) {
        this.spun = 0;
        this.index = (this.index + 1) % this.sequence.length;
        const target = tumbleTo(this.R, this.sequence[this.index]);
        this.base = this.R;
        this.axis = target.axis;
        this.angle = target.angle;
        this.elapsed = 0;
        this.mode = "tumble";
      }
    } else {
      // A 180 turn is twice the journey and gets twice the time, so an order
      // with a double flip in it LOOKS like one instead of snapping through.
      const duration = this.tumbleSeconds * (this.angle > 2 ? 2 : 1);
      this.elapsed += dt;
      const p = Math.min(1, this.elapsed / duration);
      this.display = mul(axisAngle(this.axis, this.angle * easeInOutCubic(p)), this.base);
      if (p >= 1) {
        this.R = mul(axisAngle(this.axis, this.angle), this.base);
        this.mode = "spin";
      }
    }
    return this.display;
  }

  /** The face on top right now — during a tumble, still the one being left. */
  get top() {
    return topFace(this.mode === "spin" ? this.R : this.base);
  }
}
