// Reusable isometric building blocks for the SolarOS illustrations.
// Server-compatible: no hooks, no browser APIs, deterministic output.

import type { EllipseShape, Iso, Quad, Tone, Vec3 } from "./iso";
import { round } from "./iso";
import { C, SHADOW, TONE } from "./palette";

type FaceKey = "t" | "l" | "r";

export function Block({
  g,
  at,
  size,
  tone,
  faces = "tlr",
}: {
  g: Iso;
  at: Vec3;
  size: Vec3;
  tone: Tone;
  /** Which faces to paint: any combination of t (top), l (left), r (right). */
  faces?: `${FaceKey}` | `${FaceKey}${FaceKey}` | `${FaceKey}${FaceKey}${FaceKey}`;
}) {
  const f = g.box(at[0], at[1], at[2], size[0], size[1], size[2]);
  return (
    <>
      {faces.includes("l") ? <polygon points={f.left} fill={tone[1]} /> : null}
      {faces.includes("r") ? <polygon points={f.right} fill={tone[2]} /> : null}
      {faces.includes("t") ? <polygon points={f.top} fill={tone[0]} /> : null}
    </>
  );
}

export function Oval({ e, fill, opacity }: { e: EllipseShape; fill: string; opacity?: number }) {
  return (
    <ellipse
      cx={e.cx}
      cy={e.cy}
      rx={e.rx}
      ry={e.ry}
      fill={fill}
      opacity={opacity}
      transform={e.angle ? `rotate(${e.angle} ${e.cx} ${e.cy})` : undefined}
    />
  );
}

export function Cylinder({
  g,
  at,
  r,
  h,
  tone,
  lit = 0.56,
}: {
  g: Iso;
  at: Vec3;
  r: number;
  h: number;
  tone: Tone;
  lit?: number;
}) {
  const c = g.cylinder(at[0], at[1], at[2], r, h, lit);
  return (
    <>
      <path d={c.body} fill={tone[2]} />
      <path d={c.lit} fill={tone[1]} />
      <Oval e={c.top} fill={tone[0]} />
    </>
  );
}

/** Soft contact shadow: convex hull of world points, painted in low-opacity charcoal. */
export function Shadow({ g, points, opacity = 0.1 }: { g: Iso; points: readonly Vec3[]; opacity?: number }) {
  return <polygon points={g.hull(points)} fill={SHADOW} opacity={opacity} />;
}

/** Footprint rectangle plus a copy nudged towards +x (light comes from the top-left). */
export function footprintShadow(
  x: number,
  y: number,
  z: number,
  w: number,
  d: number,
  reach = 0.6,
  spread = 0.15,
): Vec3[] {
  const corners: Vec3[] = [
    [x, y, z],
    [x + w, y, z],
    [x + w, y + d, z],
    [x, y + d, z],
  ];
  return [...corners, ...corners.map((c): Vec3 => [c[0] + reach, c[1] + spread, z])];
}

/** Round contact shadow on the ground (ellipse nudged towards +x). */
export function DiscShadow({
  g,
  at,
  r,
  opacity = 0.11,
}: {
  g: Iso;
  at: Vec3;
  r: number;
  opacity?: number;
}) {
  return <Oval e={g.disc(at[0] + r * 0.35, at[1] + r * 0.05, at[2], r)} fill={SHADOW} opacity={opacity} />;
}

/**
 * Solar module on any plane. Order the quad so that `c` is the corner nearest the
 * viewer: the edges d->c and b->c then show the frame thickness.
 */
export function SolarPanel({
  g,
  quad,
  cols = 3,
  rows = 5,
  depth = 0.09,
  inset = 0.045,
}: {
  g: Iso;
  quad: Quad;
  cols?: number;
  rows?: number;
  /** Frame thickness in world units. */
  depth?: number;
  /** Frame border as a share of the quad. */
  inset?: number;
}) {
  const [a, b, c, d] = quad;
  const down = (v: Vec3): Vec3 => [v[0], v[1], v[2] - depth];
  const glass: Quad = [
    g.onQuad(quad, inset, inset * 0.7),
    g.onQuad(quad, 1 - inset, inset * 0.7),
    g.onQuad(quad, 1 - inset, 1 - inset * 0.7),
    g.onQuad(quad, inset, 1 - inset * 0.7),
  ];
  const upper = Math.max(1, Math.round(rows * 0.34));
  const lower = Math.max(upper + 1, Math.round(rows * 0.67));
  return (
    <>
      <polygon points={g.pts([d, c, down(c), down(d)])} fill={C.ash} />
      <polygon points={g.pts([b, c, down(c), down(b)])} fill={C.muted} />
      <polygon points={g.pts([a, b, c, d])} fill={C.pebble} />
      <polygon points={g.pts(glass)} fill={C.glass} />
      <polygon points={g.subQuad(glass, 0, 1, 0, lower / rows)} fill={C.glassMid} />
      <polygon points={g.subQuad(glass, 0, 1, 0, upper / rows)} fill={C.glassLight} />
      <path d={g.grid(glass, cols, rows)} stroke={C.cell} strokeOpacity={0.45} strokeWidth={0.6} fill="none" />
      <path d={g.line([glass[0], glass[1]])} stroke={C.glassEdge} strokeWidth={0.8} fill="none" />
    </>
  );
}

interface SphereSpec {
  /** Screen-space offset from the anchor, in canopy radii. */
  dx: number;
  dy: number;
  r: number;
}

/** Flat-shaded sphere: dark base, lit body shifted to the top-left and a small highlight. */
export function Sphere({
  cx,
  cy,
  r,
  tone,
}: {
  cx: number;
  cy: number;
  r: number;
  tone: Tone;
}) {
  return (
    <>
      <circle cx={round(cx)} cy={round(cy)} r={round(r)} fill={tone[2]} />
      <circle cx={round(cx - r * 0.12)} cy={round(cy - r * 0.14)} r={round(r * 0.9)} fill={tone[1]} />
      <circle cx={round(cx - r * 0.38)} cy={round(cy - r * 0.42)} r={round(r * 0.32)} fill={tone[0]} />
    </>
  );
}

const FOLIAGE: Tone = [C.grassSide, C.leaf, C.forest];
const FOLIAGE_LIGHT: Tone = [C.grass, C.grassSide, C.leaf];

const TREE_LOBES: readonly SphereSpec[] = [
  { dx: -0.72, dy: 0.42, r: 0.6 },
  { dx: 0.74, dy: 0.38, r: 0.62 },
  { dx: 0, dy: 0, r: 1 },
];

/** Rounded mango/neem-like tree standing at `at` (ground point). */
export function Tree({
  g,
  at,
  r,
  trunk,
  light = false,
}: {
  g: Iso;
  at: Vec3;
  /** Canopy radius in world units. */
  r: number;
  /** Visible trunk height in world units. */
  trunk: number;
  light?: boolean;
}) {
  const tone = light ? FOLIAGE_LIGHT : FOLIAGE;
  const t = 0.11 * r + 0.06;
  const [cx, cy] = g.p(at[0], at[1], at[2] + trunk + r * 0.72);
  const R = r * g.unit;
  return (
    <>
      <DiscShadow g={g} at={at} r={r * 0.95} />
      <Block g={g} at={[at[0] - t / 2, at[1] - t / 2, at[2]]} size={[t, t, trunk + r * 0.4]} tone={TONE.wood} faces="lr" />
      {TREE_LOBES.map((lobe, i) => (
        <Sphere key={i} cx={cx + lobe.dx * R} cy={cy + lobe.dy * R} r={lobe.r * R} tone={tone} />
      ))}
    </>
  );
}

const SHRUB_LOBES: readonly SphereSpec[] = [
  { dx: -0.55, dy: 0.18, r: 0.68 },
  { dx: 0.5, dy: 0.22, r: 0.62 },
  { dx: 0, dy: -0.12, r: 0.8 },
];

/** Low rounded shrub sitting on the ground at `at`. */
export function Shrub({ g, at, r, light = false }: { g: Iso; at: Vec3; r: number; light?: boolean }) {
  const [cx, cy] = g.p(at[0], at[1], at[2] + r * 0.55);
  const R = r * g.unit;
  return (
    <>
      <DiscShadow g={g} at={at} r={r * 1.05} />
      {SHRUB_LOBES.map((lobe, i) => (
        <Sphere key={i} cx={cx + lobe.dx * R} cy={cy + lobe.dy * R} r={lobe.r * R} tone={light ? FOLIAGE_LIGHT : FOLIAGE} />
      ))}
    </>
  );
}

/** Lens-shaped leaf in screen space from a base point, pointing at `angle` degrees (0 = up). */
function leafPath(bx: number, by: number, length: number, width: number, angle: number): string {
  const rad = (angle * Math.PI) / 180;
  const ux = Math.sin(rad);
  const uy = -Math.cos(rad);
  const tx = bx + ux * length;
  const ty = by + uy * length;
  const mx = bx + ux * length * 0.5;
  const my = by + uy * length * 0.5;
  const nx = -uy * width;
  const ny = ux * width;
  return `M${round(bx)} ${round(by)}Q${round(mx + nx)} ${round(my + ny)} ${round(tx)} ${round(ty)}Q${round(mx - nx)} ${round(my - ny)} ${round(bx)} ${round(by)}Z`;
}

const LEAVES: readonly { angle: number; length: number; tone: 0 | 1 | 2 }[] = [
  { angle: -48, length: 0.85, tone: 2 },
  { angle: 42, length: 0.9, tone: 2 },
  { angle: -22, length: 1.15, tone: 1 },
  { angle: 18, length: 1.2, tone: 1 },
  { angle: -2, length: 1.35, tone: 0 },
];

/** Terracotta pot with either round foliage or upright leaves. */
export function PottedPlant({
  g,
  at,
  r = 0.32,
  h = 0.42,
  variant = "round",
}: {
  g: Iso;
  at: Vec3;
  r?: number;
  h?: number;
  variant?: "round" | "leafy";
}) {
  const potTop = at[2] + h;
  const soil = g.disc(at[0], at[1], potTop, r * 0.82);
  const [cx, cy] = g.p(at[0], at[1], potTop);
  const R = r * g.unit;
  return (
    <>
      <DiscShadow g={g} at={at} r={r * 1.1} opacity={0.12} />
      <Cylinder g={g} at={at} r={r} h={h} tone={TONE.terracotta} />
      <Oval e={soil} fill="#8C6A52" />
      {variant === "round" ? (
        <>
          <Sphere cx={cx - R * 0.42} cy={cy - R * 0.55} r={R * 0.72} tone={FOLIAGE} />
          <Sphere cx={cx + R * 0.45} cy={cy - R * 0.5} r={R * 0.66} tone={FOLIAGE} />
          <Sphere cx={cx} cy={cy - R * 1.05} r={R * 0.86} tone={FOLIAGE} />
        </>
      ) : (
        LEAVES.map((leaf, i) => (
          <path
            key={i}
            d={leafPath(cx + (leaf.angle / 60) * R * 0.35, cy, leaf.length * R * 2.2, R * 0.34, leaf.angle)}
            fill={FOLIAGE[leaf.tone]}
          />
        ))
      )}
    </>
  );
}

/** Floating ground island: grass top, grass lip and soil sides. */
export function Island({
  g,
  x0,
  y0,
  x1,
  y1,
  depth = 1.2,
  lip = 0.28,
  grass = C.grass,
}: {
  g: Iso;
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  depth?: number;
  lip?: number;
  grass?: string;
}) {
  return (
    <>
      <polygon points={g.faceY(y1, x0, x1, -depth, 0)} fill={C.soil} />
      <polygon points={g.faceX(x1, y0, y1, -depth, 0)} fill={C.soilDeep} />
      <polygon points={g.faceY(y1, x0, x1, -lip, 0)} fill={C.grassSide} />
      <polygon points={g.faceX(x1, y0, y1, -lip, 0)} fill={C.grassDeep} />
      <polygon points={g.faceZ(0, x0, x1, y0, y1)} fill={grass} />
    </>
  );
}

/** Clean sage plinth with a thin lighter bevel on its top edge. */
export function Plinth({
  g,
  x0,
  y0,
  x1,
  y1,
  depth = 0.7,
  tone = TONE.plinth,
}: {
  g: Iso;
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  depth?: number;
  tone?: Tone;
}) {
  return (
    <>
      <polygon points={g.faceY(y1, x0, x1, -depth, 0)} fill={tone[1]} />
      <polygon points={g.faceX(x1, y0, y1, -depth, 0)} fill={tone[2]} />
      <polygon points={g.faceZ(0, x0, x1, y0, y1)} fill={tone[0]} />
    </>
  );
}
