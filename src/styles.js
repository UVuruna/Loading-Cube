// The one stylesheet, injected once per document on first mount.
//
// WHY THE CSS LIVES IN JS. A consumer gets Tumbler by importing one module —
// asking them to also remember a <link> is how a component ends up unstyled
// in somebody's build. The rules are namespaced `tmb-` throughout and touch
// nothing outside the mounted element, so dropping them into a host page
// cannot collide with the host's own styles.
//
// EVERY ANIMATION HERE IS COMPOSITOR WORK — transform and opacity only, never
// a property that forces layout. That is what lets the ring keep turning
// while the main thread is busy doing the very work the user is waiting for.
//
// See src/__about/styles.md.
"use strict";

const STYLE_ID = "tumbler-styles";

const CSS = `
.tmb-root{position:relative;display:grid;place-items:center;overflow:hidden;
  border-radius:inherit;--tmb-spin:26s}
.tmb-root.tmb-bg-transparent{background:transparent}
.tmb-root.tmb-bg-dark{background:#05060A}
.tmb-root.tmb-bg-light{background:#E8E4DA}

.tmb-stage{position:relative;display:grid;place-items:center;transform-style:preserve-3d}
.tmb-cube{position:relative;transform-style:preserve-3d;will-change:transform}
.tmb-face{position:absolute;inset:0;display:grid;place-items:center;
  backface-visibility:hidden;overflow:hidden}
.tmb-emblem{width:44%;height:44%;opacity:.85;position:relative;z-index:1}
.tmb-shade,.tmb-lit{position:absolute;inset:0;pointer-events:none;z-index:2}

/* the sun or the moon, riding its orbit */
.tmb-body{position:absolute;pointer-events:none;user-select:none;z-index:0;
  filter:drop-shadow(0 0 14px rgba(255,255,255,.18))}

/* ── rings ────────────────────────────────────────────────────────────
   Each layer is a DIV so its transform-origin is its own centre. An SVG <g>
   needs transform-box, and getting that wrong makes the ring orbit the page
   instead of spinning in place. */
.tmb-ring{position:absolute;pointer-events:none;z-index:0}
.tmb-ring-layer{position:absolute;inset:0}
.tmb-ring-layer svg{width:100%;height:100%;display:block}

@keyframes tmb-turn{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
@keyframes tmb-turn-rev{from{transform:rotate(360deg)}to{transform:rotate(0deg)}}
@keyframes tmb-breathe{0%,100%{transform:scale(1)}50%{transform:scale(1.035)}}
@keyframes tmb-flicker{0%,100%{opacity:1}45%{opacity:.35}70%{opacity:.8}}
@keyframes tmb-twinkle{0%,100%{opacity:.25}50%{opacity:1}}
@keyframes tmb-chase{from{stroke-dashoffset:0}to{stroke-dashoffset:-496}}

.tmb-spin-slow{animation:tmb-turn calc(var(--tmb-spin) * 1.6) linear infinite}
.tmb-spin-med {animation:tmb-turn var(--tmb-spin) linear infinite}
.tmb-spin-rev {animation:tmb-turn-rev calc(var(--tmb-spin) * 0.75) linear infinite}
.tmb-breathe  {animation:tmb-breathe 5.2s ease-in-out infinite}
.tmb-flicker  {animation:tmb-flicker 1.4s ease-in-out infinite}
.tmb-twinkle  {animation:tmb-twinkle 2.6s ease-in-out infinite}
.tmb-chase    {animation:tmb-chase 2.2s linear infinite}

.tmb-root.tmb-paused .tmb-ring-layer,
.tmb-root.tmb-paused .tmb-flicker,
.tmb-root.tmb-paused .tmb-twinkle,
.tmb-root.tmb-paused .tmb-chase{animation-play-state:paused}

/* A loading indicator that stands still is a broken loading indicator, so
   reduced motion SLOWS the ornament rather than freezing it. */
@media (prefers-reduced-motion: reduce){
  .tmb-root{--tmb-spin:78s}
  .tmb-flicker,.tmb-twinkle,.tmb-chase{animation:none;opacity:.8}
  .tmb-breathe{animation-duration:14s}
}
`;

/** Inject the stylesheet once. Safe to call on every mount. */
export function ensureStyles(doc = document) {
  if (doc.getElementById(STYLE_ID)) return;
  const style = doc.createElement("style");
  style.id = STYLE_ID;
  style.textContent = CSS;
  (doc.head || doc.documentElement).appendChild(style);
}
