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
// The explanations live in shared/spec.json's `_comment` keys — that file is
// the one a future C#/WPF or Qt renderer opens cold, so the prose belongs
// there and the parity guard strips those keys before comparing.
//
// See src/__about/spec.md.
"use strict";

// ═══════════ THE SPEC — mirror of shared/spec.json ═══════════
export const SPEC = {
  version: 2,

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
    weekdays: ["mono", "sapphire", "copper", "amethyst", "gold", "ruby", "emerald"],
    mode: "continuous",
    modes: ["continuous", "per-show", "by-day"]
  },

  timing: {
    spinSpeed: 78,
    dwellDegrees: 360,
    tumbleSeconds: 0.7,
    viewTiltDegrees: -35.264,
    startYawDegrees: 45
  },

  corners: {
    default: "soft",
    variants: {
      soft:  {label: "Soft bevel", maxRadiusPercent: 5,   core: true,  seam: false},
      bevel: {label: "Deep bevel", maxRadiusPercent: 100, core: true,  seam: false},
      sharp: {label: "Sharp",      maxRadiusPercent: 0,   core: false, seam: false},
      seam:  {label: "Gold seam",  maxRadiusPercent: 0,   core: false, seam: true}
    }
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
    },
    porcelain: {
      label: "Ceramic White",
      gold:     {base: "#ECE7DC", lit: "#FFFFFF", deep: "#B4AD9D", emblem: "#6A6357"},
      copper:   {base: "#ECE7DC", lit: "#FFFFFF", deep: "#B4AD9D", emblem: "#6A6357"},
      ruby:     {base: "#ECE7DC", lit: "#FFFFFF", deep: "#B4AD9D", emblem: "#6A6357"},
      amethyst: {base: "#ECE7DC", lit: "#FFFFFF", deep: "#B4AD9D", emblem: "#6A6357"},
      sapphire: {base: "#ECE7DC", lit: "#FFFFFF", deep: "#B4AD9D", emblem: "#6A6357"},
      emerald:  {base: "#ECE7DC", lit: "#FFFFFF", deep: "#B4AD9D", emblem: "#6A6357"}
    },
    basalt: {
      label: "Ceramic Black",
      gold:     {base: "#23252B", lit: "#4E535E", deep: "#0B0C10", emblem: "#C8CBD2"},
      copper:   {base: "#23252B", lit: "#4E535E", deep: "#0B0C10", emblem: "#C8CBD2"},
      ruby:     {base: "#23252B", lit: "#4E535E", deep: "#0B0C10", emblem: "#C8CBD2"},
      amethyst: {base: "#23252B", lit: "#4E535E", deep: "#0B0C10", emblem: "#C8CBD2"},
      sapphire: {base: "#23252B", lit: "#4E535E", deep: "#0B0C10", emblem: "#C8CBD2"},
      emerald:  {base: "#23252B", lit: "#4E535E", deep: "#0B0C10", emblem: "#C8CBD2"}
    },
    silver: {
      label: "Brushed Silver",
      gold:     {base: "#B9BDC4", lit: "#F2F5F8", deep: "#6E747E", emblem: "#3A3F48"},
      copper:   {base: "#B9BDC4", lit: "#F2F5F8", deep: "#6E747E", emblem: "#3A3F48"},
      ruby:     {base: "#B9BDC4", lit: "#F2F5F8", deep: "#6E747E", emblem: "#3A3F48"},
      amethyst: {base: "#B9BDC4", lit: "#F2F5F8", deep: "#6E747E", emblem: "#3A3F48"},
      sapphire: {base: "#B9BDC4", lit: "#F2F5F8", deep: "#6E747E", emblem: "#3A3F48"},
      emerald:  {base: "#B9BDC4", lit: "#F2F5F8", deep: "#6E747E", emblem: "#3A3F48"}
    },
    onyx: {
      label: "Obsidian Black",
      gold:     {base: "#14161C", lit: "#3E4350", deep: "#05060A", emblem: "#C9CEDA"},
      copper:   {base: "#14161C", lit: "#3E4350", deep: "#05060A", emblem: "#C9CEDA"},
      ruby:     {base: "#14161C", lit: "#3E4350", deep: "#05060A", emblem: "#C9CEDA"},
      amethyst: {base: "#14161C", lit: "#3E4350", deep: "#05060A", emblem: "#C9CEDA"},
      sapphire: {base: "#14161C", lit: "#3E4350", deep: "#05060A", emblem: "#C9CEDA"},
      emerald:  {base: "#14161C", lit: "#3E4350", deep: "#05060A", emblem: "#C9CEDA"}
    }
  },

  mono: {
    default: "ceramic",
    styles: {
      ceramic: {label: "Ceramic", day: "porcelain", night: "basalt"},
      metal:   {label: "Metal",   day: "silver",    night: "onyx"}
    }
  },

  finishes: {
    matte:       {label: "Matte enamel",               radiusPercent: 9},
    velvet:      {label: "Velvet",                      radiusPercent: 9},
    leather:     {label: "Leather / plaster",           radiusPercent: 9},
    leatherdeep: {label: "Deep leather",                radiusPercent: 9},
    aquarel:     {label: "Watercolour with gold frame", radiusPercent: 6},
    damask:      {label: "Damask",                      radiusPercent: 6},
    frame:       {label: "Gold frame",                  radiusPercent: 6},
    enamel:      {label: "Enamel / cloisonne",          radiusPercent: 11},
    obsidian:    {label: "Obsidian",                    radiusPercent: 11}
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
      emerald:  {kind: "laurel",   label: "Laurel wreath", art: "Laurel"},
      sapphire: {kind: "water",    label: "Water",         art: "Water"},
      copper:   {kind: "fire",     label: "Fire",          art: "Fire"},
      ruby:     {kind: "electric", label: "Electric arc",  art: "Electric"},
      gold:     {kind: "corona",   label: "Solar corona",  art: "Corona"},
      amethyst: {kind: "phases",   label: "Lunar phases",  art: "MoonPhases"}
    }
  },

  sky: {
    bodySizeFactor: 0.17,
    bodyMarginPx: 6,
    sunriseHour: 6,
    sunsetHour: 18,
    sun:  {ambient: 0.4, power: 0.95, horizonColor: "#FFB454", zenithColor: "#FFF6E0"},
    moon: {ambient: 0.28, power: 0.55, horizonColor: "#7E93C8", zenithColor: "#CBDCFF"},
    synodicMonthDays: 29.530588853,
    knownNewMoonUtc: "2000-01-06T18:14:00Z",
    dayGradient:   ["#8FCDF2", "#DCEEF8"],
    nightGradient: ["#0B0E1A", "#2A3145"],
    plainDay:   "#A9D6F0",
    plainNight: "#151925"
  },

  backdrop: {
    clouds: [
      {puffs: 3, opacity: 0.42, driftSeconds: 150, topPercent: 30, heightPercent: 58},
      {puffs: 4, opacity: 0.88, driftSeconds: 86, topPercent: 4, heightPercent: 56}
    ],
    stars: {perTile: 26, tilePx: 300, sizePx: 1.6, twinklePerTile: 5, twinkleTilePx: 430, twinkleSizePx: 2.6},
    blendHours: 1.5
  },

  defaults: {
    size: 160,
    palette: "gems",
    paletteMode: "fixed",
    paletteModes: ["fixed", "day-night", "mono"],
    paletteDay: "gems",
    paletteNight: "velvet",
    monoStyle: "ceramic",
    finish: "enamel",
    corners: "soft",
    emblems: "elements",
    ring: false,
    sky: false,
    show: "both",
    shows: ["both", "cube", "ring"],
    background: "transparent",
    backgrounds: ["transparent", "light", "dark", "day", "night", "cycle"]
  }
};

// ═════════════════════════ FACE ORDER ═════════════════════════
/** Face keys in axis order — NOT the rotation order, which is SPEC.sequence.tops. */
export const FACES = ["gold", "copper", "ruby", "amethyst", "sapphire", "emerald"];
