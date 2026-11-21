// Colour system for the SolarOS illustration set. Hex values are allowed here:
// illustrations are self-contained SVG artwork that must render identically on
// white cards and on the pale-sage hero panel.

import type { Tone } from "./iso";

export const C = {
  forest: "#55764D",
  leaf: "#6B8C61",
  sage: "#829B83",
  lime: "#A8CE45",
  hero: "#C5D1C5",
  mist: "#DCE5D8",
  dew: "#EEF3EA",

  white: "#FFFFFF",
  canvas: "#F1F2EF",
  stone: "#E4E7E0",
  pebble: "#D2D7CE",
  ash: "#A9B0A6",
  muted: "#858B84",

  charcoal: "#292C29",
  charcoal2: "#3B423A",
  charcoal3: "#4A524A",

  glass: "#2F3B47",
  glassMid: "#394757",
  glassLight: "#435467",
  cell: "#6E8297",
  glassEdge: "#8FA3B6",

  terracotta: "#C98B6B",
  wood: "#B98C62",
  amber: "#D9A441",
  sun: "#F2C14E",

  grass: "#A9C29B",
  grassSide: "#8FAE83",
  grassDeep: "#7E9C72",
  soil: "#C9B79C",
  soilDeep: "#B19E83",
} as const;

/** Contact shadow colour; always used with 0.08-0.14 opacity. */
export const SHADOW = C.charcoal;

export const TONE = {
  /** Painted RCC walls. */
  wall: [C.canvas, C.stone, C.pebble],
  /** Bright enamel casings (inverters, cabinets). */
  enamel: [C.white, C.canvas, C.stone],
  /** Light aluminium frames and rails. */
  aluminium: [C.stone, C.ash, C.muted],
  /** Galvanised steel structure. */
  steel: [C.pebble, C.ash, C.muted],
  /** Dark plastics, tanks, battery cabinets. */
  charcoal: [C.charcoal3, C.charcoal2, C.charcoal],
  /** Clean sage plinth. */
  plinth: [C.dew, C.mist, C.sage],
  /** Sage panels and accents. */
  sage: [C.mist, C.hero, C.sage],
  /** Brand green. */
  forest: [C.leaf, C.forest, "#46633F"],
  terracotta: ["#D9A386", C.terracotta, "#B47658"],
  wood: ["#CDA47C", C.wood, "#9E7550"],
  grass: [C.grass, C.grassSide, C.grassDeep],
  soil: [C.grass, C.soil, C.soilDeep],
} as const satisfies Record<string, Tone>;
