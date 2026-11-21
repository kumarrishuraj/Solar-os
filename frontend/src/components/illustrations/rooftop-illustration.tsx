import { createIso, type Quad, type Vec3 } from "./iso";
import { IllustrationFrame, type IllustrationProps } from "./frame";
import { C, TONE } from "./palette";
import {
  Block,
  Cylinder,
  Island,
  PottedPlant,
  Shadow,
  Shrub,
  SolarPanel,
  Tree,
  footprintShadow,
} from "./primitives";

// Isometric Indian home: flat RCC terrace with parapet, stair cabin with an
// overhead water tank and a neat two-row solar array.

const g = createIso(264, 167, 15);

const W = 12; // house length along x
const D = 9; // house depth along y
const H = 6.6; // terrace level (G+1)
const P = 0.85; // parapet height
const T = 0.32; // parapet thickness
const FLOOR = H / 2;

const BRIGHT = TONE.enamel;
const GLASS_L = C.charcoal3;
const GLASS_R = C.charcoal2;

// --- Solar array -----------------------------------------------------------

const PANEL_W = 1.5;
const PANEL_GAP = 0.1;
const TILT = (22 * Math.PI) / 180;
const SLOPE = 2.3;
const RUN = SLOPE * Math.cos(TILT);
const RISE = SLOPE * Math.sin(TILT);
const LIFT = 0.45;

interface PanelRow {
  panels: Quad[];
  legs: Vec3[];
  x0: number;
  x1: number;
  yBack: number;
  yFront: number;
}

function panelRow(x0: number, yBack: number, count: number): PanelRow {
  const yFront = yBack + RUN;
  const zLow = H + LIFT;
  const zHigh = zLow + RISE;
  const panels: Quad[] = [];
  for (let i = 0; i < count; i += 1) {
    const xa = x0 + i * (PANEL_W + PANEL_GAP);
    const xb = xa + PANEL_W;
    panels.push([
      [xa, yBack, zHigh],
      [xb, yBack, zHigh],
      [xb, yFront, zLow],
      [xa, yFront, zLow],
    ]);
  }
  const x1 = x0 + count * PANEL_W + (count - 1) * PANEL_GAP;
  const legX = [x0 + 0.2, (x0 + x1) / 2, x1 - 0.32];
  const legs: Vec3[] = legX.flatMap((x): Vec3[] => [
    [x, yBack + 0.15, zHigh - 0.06],
    [x, yFront - 0.3, zLow - 0.06],
  ]);
  return { panels, legs, x0, x1, yBack, yFront };
}

const ROWS = [panelRow(4.75, 0.95, 4), panelRow(3.15, 4.35, 5)];

function ArrayRow({ row }: { row: PanelRow }) {
  return (
    <>
      <Shadow
        g={g}
        points={footprintShadow(row.x0, row.yBack, H, row.x1 - row.x0, row.yFront - row.yBack, 0.55, 0.1)}
        opacity={0.12}
      />
      {row.legs.map((leg, i) => (
        <Block key={i} g={g} at={[leg[0], leg[1], H]} size={[0.12, 0.12, leg[2] - H]} tone={TONE.steel} faces="lr" />
      ))}
      {row.panels.map((quad, i) => (
        <SolarPanel key={i} g={g} quad={quad} cols={3} rows={5} />
      ))}
    </>
  );
}

// --- Facade details ----------------------------------------------------------

/** Window on the front-left facade (plane y = D) with sill and sunshade. */
function WindowY({ x0, x1, z0, z1 }: { x0: number; x1: number; z0: number; z1: number }) {
  const mid = (x0 + x1) / 2;
  return (
    <>
      <polygon
        points={g.pts([
          [x0 + 0.1, D, z1 + 0.2],
          [x1 + 0.55, D, z1 + 0.2],
          [x1 + 0.55, D, z1 - 0.2],
          [x0 + 0.1, D, z1 - 0.2],
        ])}
        fill={C.charcoal}
        opacity={0.07}
      />
      <polygon points={g.faceY(D, x0, x1, z0, z1)} fill={C.white} />
      <polygon points={g.faceY(D, x0 + 0.12, x1 - 0.12, z0 + 0.12, z1 - 0.12)} fill={GLASS_L} />
      <polygon
        points={g.pts([
          [x0 + 0.3, D, z1 - 0.12],
          [x0 + 0.62, D, z1 - 0.12],
          [x0 + 0.24, D, z0 + 0.12],
          [x0 + 0.12, D, z0 + 0.12],
          [x0 + 0.12, D, z0 + 0.5],
        ])}
        fill={C.white}
        opacity={0.12}
      />
      <polygon points={g.faceY(D, mid - 0.05, mid + 0.05, z0, z1)} fill={C.white} />
      <Block g={g} at={[x0 - 0.1, D, z0 - 0.13]} size={[x1 - x0 + 0.2, 0.16, 0.13]} tone={BRIGHT} />
      <Block g={g} at={[x0 - 0.25, D, z1 + 0.2]} size={[x1 - x0 + 0.5, 0.5, 0.12]} tone={BRIGHT} />
    </>
  );
}

/** Window on the front-right facade (plane x = W) with sill and sunshade. */
function WindowX({ y0, y1, z0, z1 }: { y0: number; y1: number; z0: number; z1: number }) {
  const mid = (y0 + y1) / 2;
  return (
    <>
      <polygon
        points={g.pts([
          [W, y0 - 0.25, z1 + 0.2],
          [W, y1 + 0.25, z1 + 0.2],
          [W, y1 + 0.25, z1 - 0.12],
          [W, y0 - 0.25, z1 - 0.12],
        ])}
        fill={C.charcoal}
        opacity={0.08}
      />
      <polygon points={g.faceX(W, y0, y1, z0, z1)} fill={C.canvas} />
      <polygon points={g.faceX(W, y0 + 0.12, y1 - 0.12, z0 + 0.12, z1 - 0.12)} fill={GLASS_R} />
      <polygon
        points={g.pts([
          [W, y0 + 0.3, z1 - 0.12],
          [W, y0 + 0.62, z1 - 0.12],
          [W, y0 + 0.24, z0 + 0.12],
          [W, y0 + 0.12, z0 + 0.12],
          [W, y0 + 0.12, z0 + 0.5],
        ])}
        fill={C.white}
        opacity={0.08}
      />
      <polygon points={g.faceX(W, mid - 0.05, mid + 0.05, z0, z1)} fill={C.canvas} />
      <Block g={g} at={[W, y0 - 0.1, z0 - 0.13]} size={[0.16, y1 - y0 + 0.2, 0.13]} tone={BRIGHT} />
      <Block g={g} at={[W, y0 - 0.25, z1 + 0.2]} size={[0.5, y1 - y0 + 0.5, 0.12]} tone={BRIGHT} />
    </>
  );
}

function House() {
  return (
    <>
      <Shadow g={g} points={footprintShadow(0, 0, 0, W, D, 1.1, 0.2)} opacity={0.12} />

      {/* Walls with plinth band */}
      <polygon points={g.faceY(D, 0, W, 0, H)} fill={TONE.wall[1]} />
      <polygon points={g.faceX(W, 0, D, 0, H)} fill={TONE.wall[2]} />
      <polygon points={g.faceY(D, 0, W, 0, 0.5)} fill={C.pebble} />
      <polygon points={g.faceX(W, 0, D, 0, 0.5)} fill={C.ash} />

      {/* Floor band and roof drip band */}
      <Block g={g} at={[0, 0, FLOOR - 0.08]} size={[W + 0.1, D + 0.1, 0.16]} tone={BRIGHT} faces="lr" />
      <Block g={g} at={[0, 0, H - 0.22]} size={[W + 0.12, D + 0.12, 0.22]} tone={BRIGHT} faces="lr" />

      {/* Ground floor, front-left facade: door with steps, two windows */}
      <Block g={g} at={[1.7, D, 0]} size={[2, 0.8, 0.22]} tone={TONE.steel} />
      <Block g={g} at={[1.7, D, 0.22]} size={[2, 0.42, 0.24]} tone={TONE.aluminium} />
      <polygon points={g.faceY(D, 2.0, 3.4, 0.46, 2.72)} fill={C.white} />
      <polygon points={g.faceY(D, 2.12, 3.28, 0.46, 2.6)} fill={C.wood} />
      <polygon points={g.faceY(D, 2.3, 3.1, 1.66, 2.42)} fill={TONE.wood[2]} opacity={0.55} />
      <polygon points={g.faceY(D, 2.3, 3.1, 0.66, 1.48)} fill={TONE.wood[2]} opacity={0.55} />
      <Block g={g} at={[1.65, D, 2.94]} size={[2.1, 0.72, 0.13]} tone={BRIGHT} />
      <WindowY x0={5.3} x1={7.7} z0={1.15} z1={2.55} />
      <WindowY x0={9.1} x1={11.0} z0={1.15} z1={2.55} />

      {/* First floor, front-left facade */}
      <WindowY x0={1.6} x1={3.8} z0={4.45} z1={5.75} />
      <WindowY x0={5.3} x1={7.7} z0={4.45} z1={5.75} />
      <WindowY x0={9.1} x1={11.0} z0={4.45} z1={5.75} />

      {/* Front-right facade */}
      <WindowX y0={1.4} y1={3.4} z0={1.15} z1={2.55} />
      <WindowX y0={5.3} y1={7.3} z0={1.15} z1={2.55} />
      <WindowX y0={1.4} y1={3.4} z0={4.45} z1={5.75} />
      <WindowX y0={5.3} y1={7.3} z0={4.45} z1={5.75} />

      {/* Terrace floor and back parapets */}
      <polygon points={g.faceZ(H, T, W - T, T, D - T)} fill={C.mist} />
      <Block g={g} at={[0, 0, H]} size={[W, T, P]} tone={TONE.wall} />
      <Block g={g} at={[0, T, H]} size={[T, D - T, P]} tone={TONE.wall} />
    </>
  );
}

function StairCabin() {
  const x0 = T;
  const y0 = T;
  const w = 3.4;
  const d = 3.2;
  const h = 2.4;
  const roof = H + h;
  const cx = x0 + w / 2;
  const cy = y0 + d / 2;
  const tankZ = roof + 0.3;
  const tank = g.cylinder(cx, cy, tankZ, 0.95, 1.45);
  const rib = (z: number) => {
    const [x, y] = g.p(cx, cy, z);
    const rx = tank.top.rx;
    const ry = tank.top.ry;
    return `M${x - rx} ${y}A${rx} ${ry} 0 0 0 ${x + rx} ${y}`;
  };
  return (
    <>
      <Block g={g} at={[x0, y0, H]} size={[w, d, h]} tone={TONE.wall} faces="lr" />
      <polygon points={g.faceY(y0 + d, x0 + 0.75, x0 + 1.85, H, H + 1.95)} fill={C.white} />
      <polygon points={g.faceY(y0 + d, x0 + 0.86, x0 + 1.74, H, H + 1.84)} fill={C.wood} />
      <Block g={g} at={[x0 - 0.12, y0 - 0.12, roof]} size={[w + 0.24, d + 0.24, 0.16]} tone={BRIGHT} />
      <Shadow g={g} points={footprintShadow(cx - 0.9, cy - 0.9, roof + 0.16, 1.8, 1.8, 0.5, 0.1)} opacity={0.12} />
      <Block g={g} at={[cx - 0.85, cy - 0.85, roof + 0.16]} size={[1.7, 1.7, 0.14]} tone={TONE.steel} />
      <path d={tank.body} fill={C.charcoal} />
      <path d={tank.lit} fill={C.charcoal2} />
      <path d={rib(tankZ + 0.48)} stroke={C.charcoal3} strokeWidth={1} fill="none" />
      <path d={rib(tankZ + 0.96)} stroke={C.charcoal3} strokeWidth={1} fill="none" />
      <ellipse cx={tank.top.cx} cy={tank.top.cy} rx={tank.top.rx} ry={tank.top.ry} fill={C.charcoal3} />
      <Cylinder g={g} at={[cx, cy, tankZ + 1.45]} r={0.38} h={0.1} tone={[C.muted, C.charcoal2, C.charcoal]} />
    </>
  );
}

function FrontParapets() {
  return (
    <>
      <Block g={g} at={[W - T, T, H]} size={[T, D - 2 * T, P]} tone={TONE.wall} />
      <Block g={g} at={[T, D - T, H]} size={[W - T, T, P]} tone={TONE.wall} />
    </>
  );
}

function Grounds() {
  const pavers: Vec3[] = [
    [2.0, 9.95, 0],
    [2.15, 10.95, 0],
    [2.0, 11.95, 0],
  ];
  return (
    <>
      {pavers.map((at, i) => (
        <Block key={i} g={g} at={at} size={[1.4, 0.75, 0.08]} tone={TONE.wall} />
      ))}
    </>
  );
}

export function RooftopIllustration({ className, title }: IllustrationProps) {
  return (
    <IllustrationFrame viewBox="0 0 560 420" className={className} title={title}>
      <Island g={g} x0={-1.6} y0={-1.6} x1={15.2} y1={12.8} depth={1.2} />
      <Shrub g={g} at={[-0.6, 1.2, 0]} r={0.75} />
      <House />
      <StairCabin />
      {ROWS.map((row, i) => (
        <ArrayRow key={i} row={row} />
      ))}
      <PottedPlant g={g} at={[1.15, 4.9, H]} />
      <PottedPlant g={g} at={[1.15, 6.25, H]} variant="leafy" />
      <PottedPlant g={g} at={[1.2, 7.6, H]} />
      <FrontParapets />
      <Grounds />
      <Shrub g={g} at={[13.4, 2.0, 0]} r={0.8} />
      <Shrub g={g} at={[13.7, 7.4, 0]} r={0.65} light />
      <Tree g={g} at={[-0.4, 11.0, 0]} r={1.7} trunk={1.5} />
      <Shrub g={g} at={[13.8, 11.4, 0]} r={0.7} />
    </IllustrationFrame>
  );
}
