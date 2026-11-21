// Shared isometric geometry for the SolarOS illustration set.
//
// True isometric (30 degree) projection: world x runs screen right-down, world y
// runs screen left-down and z runs straight up, so vertical edges stay vertical
// and x/y edges sit at +/-30 degrees. Light comes from the top-left: top faces
// are lightest, faces looking towards +y ("left" faces) are mid-tone and faces
// looking towards +x ("right" faces) are darkest.
//
// Everything here is pure and deterministic so the illustrations can render in
// Server Components and Client Components alike.

export type Vec3 = readonly [number, number, number];
export type Vec2 = readonly [number, number];
/** Three tones of one material: top (lightest), left (mid), right (darkest). */
export type Tone = readonly [top: string, left: string, right: string];

export interface EllipseShape {
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  /** Rotation in degrees (clockwise, SVG convention). */
  angle: number;
}

export interface BoxFaces {
  top: string;
  left: string;
  right: string;
}

export interface CylinderShape {
  /** Full side silhouette (paint in the dark tone). */
  body: string;
  /** Lit left portion of the side (paint in the mid tone). */
  lit: string;
  /** Top cap ellipse (paint in the light tone). */
  top: EllipseShape;
}

export interface Iso {
  unit: number;
  /** Screen point for a world point. */
  p(x: number, y: number, z?: number): [number, number];
  /** SVG `points` attribute for a polygon of world points. */
  pts(points: readonly Vec3[]): string;
  /** SVG path data for a polyline / polygon of world points. */
  line(points: readonly Vec3[], closed?: boolean): string;
  /** Visible faces of an axis-aligned box. */
  box(x: number, y: number, z: number, w: number, d: number, h: number): BoxFaces;
  /** Rectangle on the plane y = const (a "left" face). */
  faceY(y: number, x0: number, x1: number, z0: number, z1: number): string;
  /** Rectangle on the plane x = const (a "right" face). */
  faceX(x: number, y0: number, y1: number, z0: number, z1: number): string;
  /** Rectangle on the plane z = const (a "top" face). */
  faceZ(z: number, x0: number, x1: number, y0: number, y1: number): string;
  /** Circle lying in the horizontal plane. */
  disc(x: number, y: number, z: number, r: number): EllipseShape;
  /** Circle on an arbitrary plane spanned by orthonormal world vectors u, v. */
  circle(center: Vec3, u: Vec3, v: Vec3, r: number): EllipseShape;
  /** Vertical cylinder standing at (x, y, z). `litFraction` sets the lit share of the side. */
  cylinder(x: number, y: number, z: number, r: number, h: number, litFraction?: number): CylinderShape;
  /** Point on a quad (a, b, c, d) by bilinear interpolation, u along a->b, v along a->d. */
  onQuad(quad: Quad, u: number, v: number): Vec3;
  /** Polygon points of a sub-rectangle of a quad in (u, v) space. */
  subQuad(quad: Quad, u0: number, u1: number, v0: number, v1: number): string;
  /** Path data of the interior grid lines of a quad. */
  grid(quad: Quad, cols: number, rows: number): string;
  /** Convex hull (screen space) of world points, as polygon points. */
  hull(points: readonly Vec3[]): string;
}

/** Quad corners in drawing order: a (top-left), b (top-right), c (bottom-right), d (bottom-left). */
export type Quad = readonly [Vec3, Vec3, Vec3, Vec3];

const COS30 = Math.sqrt(3) / 2;

export function round(n: number): number {
  return Math.round(n * 100) / 100;
}

function lerp3(a: Vec3, b: Vec3, t: number): Vec3 {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
}

function cross2(o: Vec2, a: Vec2, b: Vec2): number {
  return (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
}

function convexHull(input: Vec2[]): Vec2[] {
  const points = [...input].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  if (points.length < 3) return points;
  const lower: Vec2[] = [];
  for (const point of points) {
    while (lower.length >= 2 && cross2(lower[lower.length - 2], lower[lower.length - 1], point) <= 0) lower.pop();
    lower.push(point);
  }
  const upper: Vec2[] = [];
  for (let i = points.length - 1; i >= 0; i -= 1) {
    const point = points[i];
    while (upper.length >= 2 && cross2(upper[upper.length - 2], upper[upper.length - 1], point) <= 0) upper.pop();
    upper.push(point);
  }
  upper.pop();
  lower.pop();
  return [...lower, ...upper];
}

/**
 * Creates a projector. `originX/originY` is the screen position of world (0, 0, 0)
 * and `unit` the length in px of one world unit.
 */
export function createIso(originX: number, originY: number, unit: number): Iso {
  const p = (x: number, y: number, z = 0): [number, number] => [
    round(originX + (x - y) * COS30 * unit),
    round(originY + (x + y) * 0.5 * unit - z * unit),
  ];
  const screenVector = (v: Vec3): Vec2 => [(v[0] - v[1]) * COS30 * unit, (v[0] + v[1]) * 0.5 * unit - v[2] * unit];
  const pts = (points: readonly Vec3[]) => points.map((v) => p(v[0], v[1], v[2]).join(",")).join(" ");
  const line = (points: readonly Vec3[], closed = false) =>
    points.map((v, i) => `${i === 0 ? "M" : "L"}${p(v[0], v[1], v[2]).join(" ")}`).join("") + (closed ? "Z" : "");

  const circle = (center: Vec3, u: Vec3, v: Vec3, r: number): EllipseShape => {
    const [cx, cy] = p(center[0], center[1], center[2]);
    const su = screenVector(u);
    const sv = screenVector(v);
    // Closed-form SVD of the 2x2 matrix [su sv] * r.
    const a = su[0] * r;
    const b = sv[0] * r;
    const c = su[1] * r;
    const d = sv[1] * r;
    const e = (a + d) / 2;
    const f = (a - d) / 2;
    const g = (c + b) / 2;
    const h = (c - b) / 2;
    const q = Math.hypot(e, h);
    const s = Math.hypot(f, g);
    const a1 = Math.atan2(g, f);
    const a2 = Math.atan2(h, e);
    return {
      cx,
      cy,
      rx: round(q + s),
      ry: round(Math.abs(q - s)),
      angle: round((((a2 + a1) / 2) * 180) / Math.PI),
    };
  };

  const onQuad = (quad: Quad, u: number, v: number): Vec3 => {
    const top = lerp3(quad[0], quad[1], u);
    const bottom = lerp3(quad[3], quad[2], u);
    return lerp3(top, bottom, v);
  };

  return {
    unit,
    p,
    pts,
    line,
    box(x, y, z, w, d, h) {
      const x1 = x + w;
      const y1 = y + d;
      const z1 = z + h;
      return {
        top: pts([
          [x, y, z1],
          [x1, y, z1],
          [x1, y1, z1],
          [x, y1, z1],
        ]),
        left: pts([
          [x, y1, z],
          [x1, y1, z],
          [x1, y1, z1],
          [x, y1, z1],
        ]),
        right: pts([
          [x1, y, z],
          [x1, y1, z],
          [x1, y1, z1],
          [x1, y, z1],
        ]),
      };
    },
    faceY(y, x0, x1, z0, z1) {
      return pts([
        [x0, y, z0],
        [x1, y, z0],
        [x1, y, z1],
        [x0, y, z1],
      ]);
    },
    faceX(x, y0, y1, z0, z1) {
      return pts([
        [x, y0, z0],
        [x, y1, z0],
        [x, y1, z1],
        [x, y0, z1],
      ]);
    },
    faceZ(z, x0, x1, y0, y1) {
      return pts([
        [x0, y0, z],
        [x1, y0, z],
        [x1, y1, z],
        [x0, y1, z],
      ]);
    },
    disc(x, y, z, r) {
      const [cx, cy] = p(x, y, z);
      return { cx, cy, rx: round(r * Math.SQRT2 * COS30 * unit), ry: round(r * Math.SQRT2 * 0.5 * unit), angle: 0 };
    },
    circle,
    cylinder(x, y, z, r, h, litFraction = 0.56) {
      const [cx, cyTop] = p(x, y, z + h);
      const cyBottom = p(x, y, z)[1];
      const rx = round(r * Math.SQRT2 * COS30 * unit);
      const ry = round(r * Math.SQRT2 * 0.5 * unit);
      const split = round(cx - rx + 2 * rx * litFraction);
      const t = (split - cx) / rx;
      const drop = round(ry * Math.sqrt(Math.max(0, 1 - t * t)));
      return {
        body: `M${round(cx - rx)} ${cyTop}L${round(cx - rx)} ${cyBottom}A${rx} ${ry} 0 0 0 ${round(cx + rx)} ${cyBottom}L${round(cx + rx)} ${cyTop}Z`,
        lit: `M${round(cx - rx)} ${cyTop}L${round(cx - rx)} ${cyBottom}A${rx} ${ry} 0 0 0 ${split} ${round(cyBottom + drop)}L${split} ${cyTop}Z`,
        top: { cx, cy: cyTop, rx, ry, angle: 0 },
      };
    },
    onQuad,
    subQuad(quad, u0, u1, v0, v1) {
      return pts([onQuad(quad, u0, v0), onQuad(quad, u1, v0), onQuad(quad, u1, v1), onQuad(quad, u0, v1)]);
    },
    grid(quad, cols, rows) {
      let d = "";
      for (let i = 1; i < cols; i += 1) d += line([onQuad(quad, i / cols, 0), onQuad(quad, i / cols, 1)]);
      for (let j = 1; j < rows; j += 1) d += line([onQuad(quad, 0, j / rows), onQuad(quad, 1, j / rows)]);
      return d;
    },
    hull(points) {
      return convexHull(points.map((v) => p(v[0], v[1], v[2])))
        .map((pt) => pt.join(","))
        .join(" ");
    },
  };
}
