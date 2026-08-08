// The public face of the package: `LoadingCube.mount(target, options)`.
//
// WHAT IS CORE AND WHAT IS OPTIONAL (owner 2026-08-07). Core is exactly one
// thing: the colour cube turning through its six faces. Emblems, the ring, the
// sky and the backdrop are all opt-in, and a consumer states what it wants the
// way it would state anything else it passes to a constructor:
//
//     LoadingCube.mount("#splash", {
//       size: 180, palette: "gems", finish: "aquarel", corners: "soft",
//       emblems: "elements", ring: true, sky: true,
//       show: "both", mode: "continuous", background: "day"
//     });
//
// WHO PICKS THE PALETTE (owner 2026-08-08). `paletteMode` decides: `fixed`
// honours `palette`, `day-night` swaps a light palette for a dark one after
// sunset, and `mono` ignores both for the white-by-day / black-by-night cube.
// `mode: "by-day"` then adds the weekday layer on top — one colour per day, and
// Sunday is the monochrome cube whatever `paletteMode` says.
//
// ONE LOOP FOR EVERY INSTANCE. A page may show a dozen of these; a dozen
// requestAnimationFrame loops would each pay the callback cost. There is one
// loop, it starts with the first instance and stops with the last, and it
// does nothing at all while every instance is paused.
//
// See src/__about/loading-cube.md and src/__flow/loading-cube.md.
"use strict";

import { SPEC, FACES } from "./spec.js";
import { Rotation, TILT, NORMALS, UP, mul, apply, dot, normalize, toCss, FACE_CSS,
         faceOfDay } from "./geometry.js";
import { FINISHES, cornerRadius, seamShadow, coreFill } from "./textures.js";
import { emblemElement } from "./emblems.js";
import { buildRing } from "./rings.js";
import { skyAt, bodyPosition, hoursOf } from "./sky.js";
import { buildBackdrop } from "./backdrop.js";
import { ensureStyles } from "./styles.js";

// The ring artwork sits at 78 units on a 200-unit viewBox, so a wrapper D px
// wide puts the ring at 0.39·D from the centre. Inverting that is how a
// spec radius stated in CUBE EDGES becomes a wrapper size in pixels.
const RING_UNIT = 0.39;

// How far outside the sharp core the rounded shell sits. It has to be the same
// number in two places — the face's translateZ and the amount its box grows —
// or the shell would enclose the core on four sides and leave a hairline slit on
// the other two. Sub-pixel on purpose: any larger and the shell's overhang
// becomes a visible flange around every edge.
const SHELL_OFFSET_PX = 0.6;

const instances = new Set();
let rafId = null;
let lastTime = 0;

function loop(now) {
  const dt = Math.min(0.06, (now - lastTime) / 1000);
  lastTime = now;
  let anyRunning = false;
  for (const instance of instances) {
    if (instance.running) { instance._frame(dt); anyRunning = true; }
  }
  rafId = anyRunning || instances.size ? requestAnimationFrame(loop) : null;
}

function startLoop() {
  if (rafId === null) {
    lastTime = performance.now();
    rafId = requestAnimationFrame(loop);
  }
}

class LoadingCubeInstance {
  constructor(host, options) {
    this.host = host;
    this.options = {...SPEC.defaults, ...options};
    this._build();
    instances.add(this);
    startLoop();
  }

  /**
   * Which palette this instance paints with, and which face `by-day` pins it to.
   *
   * Both answers come from the same place because both depend on the clock and
   * the calendar, and answering them apart is how a Sunday ends up with a
   * coloured cube. Returns the palette object and, for `by-day`, the single face
   * to sit on top.
   */
  _resolvePalette() {
    const o = this.options;
    const isDay = skyAt(this._hours(), o).isDay;
    const named = key => SPEC.palettes[key] || SPEC.palettes[SPEC.defaults.palette];
    const mono = () => {
      const style = SPEC.mono.styles[o.monoStyle] || SPEC.mono.styles[SPEC.mono.default];
      return named(isDay ? style.day : style.night);
    };

    // The weekday decides FIRST when `by-day` is on: Sunday's entry is the
    // string "mono", not a face, and it overrides paletteMode entirely.
    let face = null;
    if (o.mode === "by-day") {
      const today = faceOfDay(o.date instanceof Date ? o.date : undefined);
      if (today === "mono") return {palette: mono(), face: SPEC.sequence.tops[0]};
      face = today;
    }

    if (o.paletteMode === "mono") return {palette: mono(), face};
    if (o.paletteMode === "day-night") {
      return {palette: named(isDay ? o.paletteDay : o.paletteNight), face};
    }
    return {palette: named(o.palette), face};
  }

  _build() {
    const o = this.options;
    const size = o.size;
    const {palette, face: pinnedFace} = this._resolvePalette();
    const finish = FINISHES[o.finish] ? o.finish : SPEC.defaults.finish;
    const corners = SPEC.corners.variants[o.corners]
                  ? o.corners : SPEC.corners.default;
    const variant = SPEC.corners.variants[corners];
    // `show: "ring"` is a request for the ring, so it implies one — asking for
    // ring-only and getting an empty box would be a riddle, not a default.
    const showCube = o.show !== "ring";
    const showRing = o.show === "ring" || (o.ring && o.show !== "cube");

    this.ringDiameter = (size * SPEC.rings.radius) / RING_UNIT;
    let box = size * 1.35;
    if (showRing) box = Math.max(box, this.ringDiameter * 1.04);
    this.box = Math.round(box);

    ensureStyles(this.host.ownerDocument || document);
    this.host.textContent = "";

    const root = document.createElement("div");
    // THE ROOT FILLS ITS HOST whenever anything needs the host's extent: the sun
    // and moon ride the frame's edge, and a backdrop is a background, so both
    // want the whole area the embedder gave. Only a bare transparent mount stays
    // its own size.
    //
    // No minimum, either: a floor of the cube's own box overflowed a 330px-wide
    // portrait frame and put the moon outside the visible area — caught in the
    // mobile preview. When the host is too small it is `_measure`'s fit scale
    // that answers, not an overflow.
    const fills = o.sky || o.background !== "transparent";
    root.className = "lc-root" + (fills ? " lc-fill" : "");
    if (!fills) {
      root.style.width = `${this.box}px`;
      root.style.height = `${this.box}px`;
    }
    if (o.spinSeconds) root.style.setProperty("--lc-spin", `${o.spinSeconds}s`);
    this.root = root;
    this.fills = fills;

    this.backdrop = buildBackdrop(root, o.background);

    if (o.sky) {
      this.body = document.createElement("img");
      this.body.className = "lc-body";
      this.body.alt = "";
      root.appendChild(this.body);
    } else {
      this.body = null;
    }

    // EVERYTHING THAT MUST STAY CONCENTRIC LIVES IN ONE LAYER, so one transform
    // fits the whole composition when the host is smaller than it wants to be
    // (root rules/GUI.md, the SPACE & LEGIBILITY fix order: free space, then
    // reflow, then a raised minimum — never a silent overflow). The sun and moon
    // stay OUTSIDE it, because they ride the real frame and must not shrink with
    // the cube.
    const fit = document.createElement("div");
    fit.className = "lc-fit";
    fit.style.width = `${this.box}px`;
    fit.style.height = `${this.box}px`;
    root.appendChild(fit);
    this.fit = fit;

    if (showRing) {
      this.ringHost = document.createElement("div");
      this.ringHost.style.position = "absolute";
      this.ringHost.style.inset = "0";
      this.ringHost.style.display = "grid";
      this.ringHost.style.placeItems = "center";
      fit.appendChild(this.ringHost);
      this.ringFace = null;
    } else {
      this.ringHost = null;
    }

    this.faces = {};
    if (showCube) {
      const stage = document.createElement("div");
      stage.className = "lc-stage";
      const cube = document.createElement("div");
      cube.className = "lc-cube";
      cube.style.width = `${size}px`;
      cube.style.height = `${size}px`;

      // The core goes in FIRST so the shell paints over it, and it carries no
      // emblem and no lighting overlay: nothing of it is ever seen but the sliver
      // inside a notch.
      if (variant.core) {
        const core = document.createElement("div");
        core.className = "lc-core";
        for (const face of FACES) {
          const el = document.createElement("div");
          el.className = "lc-face";
          el.style.background = coreFill(palette[face]);
          el.style.transform = `${FACE_CSS[face] ? FACE_CSS[face] + " " : ""}` +
                               `translateZ(${size / 2}px)`;
          core.appendChild(el);
        }
        cube.appendChild(core);
      }

      const shellZ = size / 2 + (variant.core ? SHELL_OFFSET_PX : 0);
      for (const face of FACES) {
        const colours = palette[face];
        const el = document.createElement("div");
        el.className = "lc-face";
        Object.assign(el.style, FINISHES[finish](colours, size));
        if (variant.seam) el.style.boxShadow = seamShadow(size);
        el.style.borderRadius = cornerRadius(finish, corners);
        if (variant.core) el.style.inset = `${-SHELL_OFFSET_PX}px`;
        el.style.transform =
          `${FACE_CSS[face] ? FACE_CSS[face] + " " : ""}translateZ(${shellZ}px)`;

        const emblem = emblemElement(o.emblems, face, colours.emblem);
        if (emblem) el.appendChild(emblem);

        const shade = document.createElement("div");
        shade.className = "lc-shade";
        const lit = document.createElement("div");
        lit.className = "lc-lit";
        el.append(shade, lit);

        this.faces[face] = {el, shade, lit};
        cube.appendChild(el);
      }

      stage.appendChild(cube);
      fit.appendChild(stage);
      this.cube = cube;
    } else {
      this.cube = null;
    }

    this.host.appendChild(root);

    this.palette = palette;
    // A pinned face is a sequence of one: `by-day` shows Wednesday's purple and
    // nothing else, so there is no next face to tumble to.
    this.rotation = new Rotation({
      mode: o.mode,
      sequence: pinnedFace ? [pinnedFace] : undefined,
      spinSpeed: o.spinSpeed,
      dwellDegrees: o.dwellDegrees
    });
    this.running = o.autoplay !== false;
    this.lastTop = null;

    // The frame is measured on resize, never per frame: reading a rect inside
    // rAF is a forced layout, which is the one thing a loading animation must
    // not spend the main thread on (project law 4).
    this.frame = {width: this.box, height: this.box};
    this.fitScale = 1;
    this._observe();
    this._measure();
    this._paint(this.rotation.display);
    this._onTopChanged(this.rotation.top);
  }

  _observe() {
    if (this.resizeObserver) this.resizeObserver.disconnect();
    // Only a filling root can change size under us; a fixed box cannot.
    if (!this.fills || typeof ResizeObserver === "undefined") return;
    this.resizeObserver = new ResizeObserver(() => this._measure());
    this.resizeObserver.observe(this.root);
  }

  /**
   * Read the frame once, and derive from it the two things that depend on it:
   * how big the sun and moon are, and whether the composition has to shrink to
   * fit. Called on mount and on resize — never per frame, because reading a
   * rect inside rAF forces a layout.
   */
  _measure() {
    const rect = this.root.getBoundingClientRect();
    const width = rect.width || this.box;
    const height = rect.height || this.box;
    this.frame = {width, height};

    if (this.body) {
      // BOTH dimensions, stated. With only `width` set, an <img>'s height comes
      // from the file's intrinsic ratio — and is 0 until the file has loaded, so
      // the disc was positioned by a box half a body too short and stopped 51px
      // shy of the bottom edge on the very hours the owner cares about. sun.svg
      // is 512 square and moon.svg 640 square, so a square box is also the truth.
      const disc = Math.round(Math.min(width, height) * SPEC.sky.bodySizeFactor);
      this.body.width = disc;
      this.body.height = disc;
    }

    // Never above 1: `size` is a ceiling the embedder asked for, not a target to
    // inflate to. Below 1 only when the host genuinely cannot hold the cube and
    // its ring — a 160px cube with a 1.15-edge ring wants 490px, which no
    // portrait phone frame has.
    const scale = Math.min(1, Math.min(width, height) / this.box);
    const rounded = Math.round(scale * 1000) / 1000;
    if (rounded !== this.fitScale) {
      this.fitScale = rounded;
      this.fit.style.transform = rounded === 1 ? "" : `scale(${rounded})`;
    }
  }

  /** Hours since midnight — overridable so a demo can drive the clock. */
  _hours() {
    const o = this.options;
    if (typeof o.clock === "function") return o.clock();
    if (typeof o.hour === "number") return o.hour;
    return hoursOf();
  }

  _frame(dt) {
    const matrix = this.rotation.step(dt * (this.options.speed || 1));
    this._paint(matrix);
    const top = this.rotation.top;
    if (top !== this.lastTop) {
      this.lastTop = top;
      this._onTopChanged(top);
    }
  }

  _paint(matrix) {
    const view = mul(TILT, matrix);
    if (this.cube) this.cube.style.transform = toCss(view);
    if (!this.options.sky) {
      if (this.backdrop) this.backdrop.blend(skyAt(this._hours(), this.options));
      return;
    }

    const sky = skyAt(this._hours(), this.options);
    if (this.backdrop) this.backdrop.blend(sky);

    const dir = normalize(sky.dir);
    if (this.cube) {
      for (const face of FACES) {
        const {shade, lit} = this.faces[face];
        const lambert = Math.max(0, dot(apply(view, NORMALS[face]), dir));
        const brightness = sky.ambient + (1 - sky.ambient) * lambert * sky.power;
        shade.style.background = `rgba(0,0,0,${(1 - brightness).toFixed(3)})`;
        lit.style.background = lambert > 0.02
          ? sky.color.replace("rgb(", "rgba(").replace(")", `,${(lambert * 0.26).toFixed(3)})`)
          : "transparent";
      }
    }

    if (this.body) {
      const {width, height} = this.frame;
      const {x, y} = bodyPosition(sky, width, height, this.body.width);
      const half = this.body.width / 2;
      this.body.style.left = `${(x - half).toFixed(1)}px`;
      this.body.style.top = `${(y - half).toFixed(1)}px`;
      this.body.style.opacity = sky.bodyOpacity.toFixed(2);
      if (this.body.getAttribute("src") !== sky.bodySrc) {
        this.body.setAttribute("src", sky.bodySrc);
      }
    }
  }

  /** The ring belongs to whichever face is on top — green up, laurel turning. */
  _onTopChanged(top) {
    this.lastTop = top;
    if (!this.ringHost || top === this.ringFace) return;
    this.ringFace = top;
    const kind = this.options.ringKind || SPEC.rings.perFace[top].kind;
    this.ringHost.textContent = "";
    this.ringHost.appendChild(
      buildRing(kind, this.palette[top].lit, this.ringDiameter));
  }

  /** Rebuild with changed options — what the demo's controls call. */
  setOptions(patch) {
    this.options = {...this.options, ...patch};
    this._build();
  }

  pause() { this.running = false; this.root.classList.add("lc-paused"); }
  play() { this.running = true; this.root.classList.remove("lc-paused"); startLoop(); }

  destroy() {
    instances.delete(this);
    if (this.resizeObserver) this.resizeObserver.disconnect();
    this.host.textContent = "";
    if (instances.size === 0 && rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  }
}

/**
 * Mount a cube into `target` (an element or a selector) and return the
 * instance. Everything except the turning cube itself is opt-in — see
 * SPEC.defaults for what you get when you pass nothing.
 */
export function mount(target, options = {}) {
  const host = typeof target === "string" ? document.querySelector(target) : target;
  if (!host) throw new Error(`LoadingCube.mount: no element for ${target}`);
  return new LoadingCubeInstance(host, options);
}

export { SPEC, FACES };
export default { mount, SPEC, FACES };
