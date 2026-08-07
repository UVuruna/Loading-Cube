// The public face of the package: `Tumbler.mount(target, options)`.
//
// WHAT IS CORE AND WHAT IS OPTIONAL (owner 2026-08-07). Core is exactly one
// thing: the colour cube turning through its six faces. Emblems, the ring and
// the sky are all opt-in, and a consumer states what it wants the way it
// would state anything else it passes to a constructor:
//
//     Tumbler.mount("#splash", {
//       size: 180, palette: "gems", finish: "aquarel",
//       emblems: "elements", ring: true, sky: true,
//       background: "transparent"
//     });
//
// ONE LOOP FOR EVERY INSTANCE. A page may show a dozen of these; a dozen
// requestAnimationFrame loops would each pay the callback cost. There is one
// loop, it starts with the first instance and stops with the last, and it
// does nothing at all while every instance is paused.
//
// See src/__about/tumbler.md and src/__flow/tumbler.md.
"use strict";

import { SPEC, FACES } from "./spec.js";
import { Rotation, TILT, NORMALS, UP, mul, apply, dot, normalize, toCss, FACE_CSS } from "./geometry.js";
import { FINISHES, FINISH_RADIUS } from "./textures.js";
import { emblemElement } from "./emblems.js";
import { buildRing } from "./rings.js";
import { skyAt, skyBackground, bodyPosition, hoursOf } from "./sky.js";
import { ensureStyles } from "./styles.js";

// The ring artwork sits at 78 units on a 200-unit viewBox, so a wrapper D px
// wide puts the ring at 0.39·D from the centre. Inverting that is how a
// spec radius stated in CUBE EDGES becomes a wrapper size in pixels.
const RING_UNIT = 0.39;

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

class TumblerInstance {
  constructor(host, options) {
    this.host = host;
    this.options = {...SPEC.defaults, ...options};
    this._build();
    instances.add(this);
    startLoop();
  }

  _build() {
    const o = this.options;
    const size = o.size;
    const palette = SPEC.palettes[o.palette] || SPEC.palettes[SPEC.defaults.palette];
    const finish = FINISHES[o.finish] ? o.finish : SPEC.defaults.finish;

    this.ringDiameter = (size * SPEC.rings.radius) / RING_UNIT;
    let box = size * 1.35;
    if (o.ring) box = Math.max(box, this.ringDiameter * 1.04);
    if (o.sky) box *= 1.55;                   // room for the body outside the ring
    this.box = Math.round(box);

    ensureStyles(this.host.ownerDocument || document);
    this.host.textContent = "";

    const root = document.createElement("div");
    root.className = `tmb-root tmb-bg-${o.background}`;
    root.style.width = `${this.box}px`;
    root.style.height = `${this.box}px`;
    if (o.spinSeconds) root.style.setProperty("--tmb-spin", `${o.spinSeconds}s`);
    this.root = root;

    if (o.sky) {
      this.body = document.createElement("img");
      this.body.className = "tmb-body";
      this.body.alt = "";
      this.body.width = Math.round(this.box * 0.19);
      root.appendChild(this.body);
    }

    if (o.ring) {
      this.ringHost = document.createElement("div");
      this.ringHost.style.position = "absolute";
      this.ringHost.style.display = "grid";
      this.ringHost.style.placeItems = "center";
      root.appendChild(this.ringHost);
      this.ringFace = null;
    }

    const stage = document.createElement("div");
    stage.className = "tmb-stage";
    const cube = document.createElement("div");
    cube.className = "tmb-cube";
    cube.style.width = `${size}px`;
    cube.style.height = `${size}px`;

    this.faces = {};
    for (const face of FACES) {
      const colours = palette[face];
      const el = document.createElement("div");
      el.className = "tmb-face";
      Object.assign(el.style, FINISHES[finish](colours));
      el.style.borderRadius = FINISH_RADIUS[finish];
      el.style.transform =
        `${FACE_CSS[face] ? FACE_CSS[face] + " " : ""}translateZ(${size / 2}px)`;

      const emblem = emblemElement(o.emblems, face, colours.emblem);
      if (emblem) el.appendChild(emblem);

      const shade = document.createElement("div");
      shade.className = "tmb-shade";
      const lit = document.createElement("div");
      lit.className = "tmb-lit";
      el.append(shade, lit);

      this.faces[face] = {el, shade, lit};
      cube.appendChild(el);
    }

    stage.appendChild(cube);
    root.appendChild(stage);
    this.host.appendChild(root);

    this.cube = cube;
    this.palette = palette;
    this.rotation = new Rotation({mode: o.mode, spinSpeed: o.spinSpeed,
                                  dwellDegrees: o.dwellDegrees});
    this.running = o.autoplay !== false;
    this.lastTop = null;
    this._paint(this.rotation.display);
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
    this.cube.style.transform = toCss(view);
    if (!this.options.sky) return;

    const sky = skyAt(this._hours(), this.options);
    const dir = normalize(sky.dir);
    for (const face of FACES) {
      const {shade, lit} = this.faces[face];
      const lambert = Math.max(0, dot(apply(view, NORMALS[face]), dir));
      const brightness = sky.ambient + (1 - sky.ambient) * lambert * sky.power;
      shade.style.background = `rgba(0,0,0,${(1 - brightness).toFixed(3)})`;
      lit.style.background = lambert > 0.02
        ? sky.color.replace("rgb(", "rgba(").replace(")", `,${(lambert * 0.26).toFixed(3)})`)
        : "transparent";
    }

    if (this.body) {
      const {x, y} = bodyPosition(sky, this.box, this.body.width);
      const half = this.body.width / 2;
      this.body.style.left = `${(x - half).toFixed(1)}px`;
      this.body.style.top = `${(y - half).toFixed(1)}px`;
      this.body.style.opacity = sky.bodyOpacity.toFixed(2);
      if (this.body.getAttribute("src") !== sky.bodySrc) {
        this.body.setAttribute("src", sky.bodySrc);
      }
    }
    if (this.options.background === "sky") {
      this.root.style.background = skyBackground(sky);
    }
  }

  /** The ring belongs to whichever face is on top — green up, laurel turning. */
  _onTopChanged(top) {
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

  pause() { this.running = false; this.root.classList.add("tmb-paused"); }
  play() { this.running = true; this.root.classList.remove("tmb-paused"); startLoop(); }

  destroy() {
    instances.delete(this);
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
  if (!host) throw new Error(`Tumbler.mount: no element for ${target}`);
  return new TumblerInstance(host, options);
}

export { SPEC, FACES };
export default { mount, SPEC, FACES };
