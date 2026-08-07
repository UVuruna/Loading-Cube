// The web renderer's copy of shared/spec.json.
//
// WHY A COPY AND NOT AN IMPORT: a consumer drops these modules into any page,
// from any origin, with no build step — `fetch('../shared/spec.json')` would
// make mounting async and would break the moment the consumer moves the file,
// and JSON import attributes are still too young to demand of every embedder.
// So the values are stated twice, and tests/test_spec_parity.py FAILS the
// build the moment the two disagree. A copy nobody checks is drift; a copy a
// guard checks is just a second reader of one truth.
//
// See src/__about/spec.md.
"use strict";

// ═══════════ THE SPEC — mirror of shared/spec.json ═══════════
export const SPEC = {
  version: 1,

  axes: {
    gold:     {axis: "+y", position: "top",    opposite: "amethyst"},
    copper:   {axis: "+x", position: "right",  opposite: "sapphire"},
    ruby:     {axis: "-z", position: "back",   opposite: "emerald"},
    amethyst: {axis: "-y", position: "bottom", opposite: "gold"},
    sapphire: {axis: "-x", position: "left",   opposite: "copper"},
    emerald:  {axis: "+z", position: "front",  opposite: "ruby"}
  },

  sequence: {
    tops: ["gold", "copper", "ruby", "amethyst", "sapphire", "emerald"],
    mode: "continuous",
    modes: ["continuous", "per-show"]
  },

  timing: {
    spinSpeed: 78,
    dwellDegrees: 320,
    tumbleSeconds: 0.7,
    viewTiltDegrees: -20
  },

  palettes: {
    gems: {
      label: "Royal Gems",
      gold:     {base: "#D9A62C", lit: "#FFE08A", deep: "#7E5510", emblem: "#3A2705"},
      copper:   {base: "#C25A11", lit: "#F79B4E", deep: "#5F2A04", emblem: "#FFEAD6"},
      ruby:     {base: "#A81436", lit: "#EF5C7B", deep: "#500518", emblem: "#FFE0E6"},
      amethyst: {base: "#6B2FA8", lit: "#B183EC", deep: "#33125A", emblem: "#F0DEFF"},
      sapphire: {base: "#1F3BB8", lit: "#6E8BFF", deep: "#0C1861", emblem: "#DDE5FF"},
      emerald:  {base: "#0E7A57", lit: "#3ED3A0", deep: "#043826", emblem: "#DCFFF1"}
    },
    velvet: {
      label: "Midnight Velvet",
      gold:     {base: "#6E5619", lit: "#C9A227", deep: "#2E2208", emblem: "#FFE9AE"},
      copper:   {base: "#5E2C0E", lit: "#B96A28", deep: "#291102", emblem: "#FFE3C8"},
      ruby:     {base: "#4E1026", lit: "#A72E52", deep: "#22040F", emblem: "#FFD5DF"},
      amethyst: {base: "#341A55", lit: "#7A4CB8", deep: "#150826", emblem: "#E9D5FF"},
      sapphire: {base: "#16256B", lit: "#3E5BD4", deep: "#070E30", emblem: "#D5DEFF"},
      emerald:  {base: "#0A3F31", lit: "#1E8A67", deep: "#031B14", emblem: "#CFF5E6"}
    },
    obsidian: {
      label: "Obsidian and Gold",
      gold:     {base: "#0D0E14", lit: "#FFE08A", deep: "#05060A", emblem: "#FFE08A"},
      copper:   {base: "#0D0E14", lit: "#F79B4E", deep: "#05060A", emblem: "#F79B4E"},
      ruby:     {base: "#0D0E14", lit: "#EF5C7B", deep: "#05060A", emblem: "#EF5C7B"},
      amethyst: {base: "#0D0E14", lit: "#B183EC", deep: "#05060A", emblem: "#B183EC"},
      sapphire: {base: "#0D0E14", lit: "#6E8BFF", deep: "#05060A", emblem: "#6E8BFF"},
      emerald:  {base: "#0D0E14", lit: "#3ED3A0", deep: "#05060A", emblem: "#3ED3A0"}
    }
  },

  finishes: {
    matte:       {label: "Matte enamel"},
    velvet:      {label: "Velvet"},
    leather:     {label: "Leather / plaster"},
    leatherdeep: {label: "Deep leather"},
    aquarel:     {label: "Watercolour with gold frame"},
    damask:      {label: "Damask"},
    frame:       {label: "Gold frame"},
    enamel:      {label: "Enamel / cloisonne"},
    obsidian:    {label: "Obsidian"}
  },

  emblems: {
    default: "elements",
    families: {
      elements:     {label: "Elements",        gold: "sun",     copper: "flame",  ruby: "bolt",   amethyst: "moon",    sapphire: "wave",       emerald: "leaf"},
      elementsDomy: {label: "Elements (DOMY)", gold: "sun",     copper: "flame",  ruby: "bolt",   amethyst: "star",    sapphire: "moon",       emerald: "leaf"},
      planets:      {label: "Planets (DOMY)",  gold: "jupiter", copper: "mars",   ruby: "venus",  amethyst: "mercury", sapphire: "luna",       emerald: "saturn"},
      virtues:      {label: "Virtues (DOMY)",  gold: "give",    copper: "shield", ruby: "heart",  amethyst: "eye",     sapphire: "stillwater", emerald: "hourglass"},
      heraldic:     {label: "Heraldic",        gold: "crown",   copper: "key",    ruby: "shield", amethyst: "star",    sapphire: "anchor",     emerald: "laurel"},
      ordinal:      {label: "Ordinal",         gold: "one",     copper: "two",    ruby: "three",  amethyst: "four",    sapphire: "five",       emerald: "six"}
    }
  },

  rings: {
    radius: 1.15,
    perFace: {
      emerald:  {kind: "laurel",   label: "Laurel wreath"},
      sapphire: {kind: "water",    label: "Water"},
      copper:   {kind: "fire",     label: "Fire"},
      ruby:     {kind: "electric", label: "Electric arc"},
      gold:     {kind: "corona",   label: "Solar corona"},
      amethyst: {kind: "phases",   label: "Lunar phases"}
    }
  },

  sky: {
    bodyRadius: 0.44,
    sunriseHour: 6,
    sunsetHour: 18,
    sun:  {ambient: 0.40, power: 0.95, horizonColor: "#FFB454", zenithColor: "#FFF6E0"},
    moon: {ambient: 0.28, power: 0.55, horizonColor: "#7E93C8", zenithColor: "#CBDCFF"},
    synodicMonthDays: 29.530588853,
    knownNewMoonUtc: "2000-01-06T18:14:00Z",
    dayGradient:   ["#BFE6FB", "#8FCDF2"],
    nightGradient: ["#2A2E38", "#14161C"]
  },

  defaults: {
    size: 160,
    palette: "gems",
    finish: "enamel",
    emblems: "elements",
    ring: false,
    sky: false,
    background: "transparent",
    backgrounds: ["transparent", "dark", "light", "sky"]
  }
};

// ═════════════════════════ FACE ORDER ═════════════════════════
/** Face keys in axis order — NOT the rotation order, which is SPEC.sequence.tops. */
export const FACES = ["gold", "copper", "ruby", "amethyst", "sapphire", "emerald"];
