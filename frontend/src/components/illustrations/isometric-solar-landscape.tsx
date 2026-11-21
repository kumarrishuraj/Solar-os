"use client";

import React from "react";

export interface IsometricSolarLandscapeProps {
  className?: string;
  width?: string | number;
  height?: string | number;
}

export function IsometricSolarLandscape({
  className = "w-full h-auto max-h-[350px] block",
}: IsometricSolarLandscapeProps) {
  // Isometric projection math
  const CX = 320;
  const CY = 178;
  const P = (x: number, y: number, z: number): [number, number] => [
    CX + (x - y),
    CY + (x + y) / 2 - z,
  ];

  const pts = (a: [number, number][]) =>
    a.map((p) => p.map((n) => n.toFixed(1)).join(",")).join(" ");

  const poly = (a: [number, number][], fill: string, extra = "") => (
    <polygon points={pts(a)} fill={fill} {...(extra ? { className: extra } : {})} />
  );

  const box = (
    x: number,
    y: number,
    w: number,
    d: number,
    h: number,
    z0: number,
    c: [string, string, string]
  ) => {
    return (
      <g key={`box-${x}-${y}-${z0}`}>
        {poly(
          [
            P(x, y + d, z0),
            P(x + w, y + d, z0),
            P(x + w, y + d, z0 + h),
            P(x, y + d, z0 + h),
          ],
          c[1]
        )}
        {poly(
          [
            P(x + w, y, z0),
            P(x + w, y + d, z0),
            P(x + w, y + d, z0 + h),
            P(x + w, y, z0 + h),
          ],
          c[2]
        )}
        {poly(
          [
            P(x, y, z0 + h),
            P(x + w, y, z0 + h),
            P(x + w, y + d, z0 + h),
            P(x, y + d, z0 + h),
          ],
          c[0]
        )}
      </g>
    );
  };

  const winY = (x1: number, x2: number, z1: number, z2: number, yp: number) =>
    poly([P(x1, yp, z1), P(x2, yp, z1), P(x2, yp, z2), P(x1, yp, z2)], "#A7B8AA");

  const winX = (y1: number, y2: number, z1: number, z2: number, xp: number) =>
    poly([P(xp, y1, z1), P(xp, y2, z1), P(xp, y2, z2), P(xp, y1, z2)], "#93A697");

  const panel = (x: number, y: number, w: number, d: number, z: number, key: string) => {
    const a: [number, number][] = [
      P(x, y, z + 5),
      P(x + w, y, z + 5),
      P(x + w, y + d, z + 1),
      P(x, y + d, z + 1),
    ];
    const p1 = P(x + w / 2, y, z + 5);
    const p2 = P(x + w / 2, y + d, z + 1);
    const p3 = P(x, y + d / 2, z + 3);
    const p4 = P(x + w, y + d / 2, z + 3);

    return (
      <g key={key}>
        {poly(
          [
            P(x, y + d, z),
            P(x + w, y + d, z),
            P(x + w, y + d, z + 1),
            P(x, y + d, z + 1),
          ],
          "#1F2830"
        )}
        {poly(a, "url(#pg)")}
        <line
          x1={p1[0]}
          y1={p1[1]}
          x2={p2[0]}
          y2={p2[1]}
          stroke="#6E8297"
          strokeWidth="0.6"
          opacity="0.55"
        />
        <line
          x1={p3[0]}
          y1={p3[1]}
          x2={p4[0]}
          y2={p4[1]}
          stroke="#6E8297"
          strokeWidth="0.6"
          opacity="0.55"
        />
        <polyline
          points={pts([P(x, y + d, z + 1), P(x, y, z + 5), P(x + w, y, z + 5)])}
          fill="none"
          stroke="#8FA3B6"
          strokeWidth="0.7"
          opacity="0.8"
        />
      </g>
    );
  };

  const array = (
    x: number,
    y: number,
    cols: number,
    rows: number,
    z: number,
    w = 15,
    d = 11,
    g = 3,
    prefix = "arr"
  ) => {
    const items = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        items.push(
          panel(
            x + c * (w + g),
            y + r * (d + 5),
            w,
            d,
            z,
            `${prefix}-${r}-${c}`
          )
        );
      }
    }
    return <g key={prefix}>{items}</g>;
  };

  const tree = (x: number, y: number, r: number, h = 14, key = `t-${x}-${y}`) => {
    const b = P(x, y, 0);
    return (
      <g key={key}>
        <ellipse
          cx={b[0] + 4}
          cy={b[1] + 1}
          rx={r * 1.05}
          ry={r * 0.45}
          fill="#292C29"
          opacity="0.12"
        />
        <rect
          x={b[0] - 2}
          y={b[1] - h}
          width={4}
          height={h}
          rx={1.5}
          fill="#B98C62"
        />
        <circle cx={b[0]} cy={b[1] - h - r * 0.7} r={r} fill="#5E8155" />
        <circle
          cx={b[0] - r * 0.28}
          cy={b[1] - h - r * 0.95}
          r={r * 0.68}
          fill="#7A9E6C"
        />
        <circle
          cx={b[0] - r * 0.42}
          cy={b[1] - h - r * 1.15}
          r={r * 0.3}
          fill="#94B784"
        />
      </g>
    );
  };

  const tank = (x: number, y: number, z: number, key = `tnk-${x}-${y}`) => {
    const b = P(x, y, z);
    return (
      <g key={key}>
        <rect
          x={b[0] - 7}
          y={b[1] - 15}
          width={14}
          height={15}
          fill="#3B423A"
        />
        <ellipse cx={b[0]} cy={b[1]} rx={7} ry={3.2} fill="#292C29" />
        <ellipse cx={b[0]} cy={b[1] - 15} rx={7} ry={3.2} fill="#55605A" />
      </g>
    );
  };

  const wall: [string, string, string] = ["#F4F5F1", "#E3E7DF", "#CBD2C5"];
  const tPos = P(105, -132, 0);
  const e1 = P(70, 50, 58);
  const e2 = P(130, -14, 24);
  const e3 = P(-70, -10, 80);

  return (
    <svg
      viewBox="0 0 640 372"
      role="img"
      aria-label="Isometric renewable-energy landscape with rooftop solar installations"
      className={className}
    >
      <defs>
        <linearGradient id="gr" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#B5CBA6" />
          <stop offset="1" stopColor="#93B086" />
        </linearGradient>
        <linearGradient id="pg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#435467" />
          <stop offset="1" stopColor="#2F3B47" />
        </linearGradient>
      </defs>

      {/* Ground shadow & terrain */}
      <ellipse cx={320} cy={345} rx={250} ry={20} fill="#292C29" opacity="0.07" />
      {box(-150, -150, 300, 300, 24, -24, ["url(#gr)", "#C9B79C", "#B19E83"])}

      {/* Path / walkways */}
      {poly(
        [P(-6, 150, 0), P(10, 150, 0), P(10, 40, 0), P(-6, 40, 0)],
        "#E6E1D3"
      )}
      {poly(
        [P(10, 40, 0), P(10, 24, 0), P(-60, 24, 0), P(-60, 40, 0)],
        "#E6E1D3"
      )}

      {/* Trees background */}
      {tree(-128, -118, 13)}
      {tree(-86, -136, 11)}
      {tree(116, -60, 11)}

      {/* Wind Turbine with animated blades */}
      <rect
        x={tPos[0] - 2}
        y={tPos[1] - 128}
        width={4}
        height={128}
        fill="#E4E7E0"
      />
      <rect
        x={tPos[0]}
        y={tPos[1] - 128}
        width={2}
        height={128}
        fill="#C9D0C3"
      />
      <g
        className="origin-[105px_44px] animate-[spin_9s_linear_infinite]"
        style={{
          transformBox: "fill-box",
          transformOrigin: `${tPos[0]}px ${tPos[1] - 128}px`,
        }}
      >
        <path
          d={`M${tPos[0]} ${tPos[1] - 128} l-3 -46 l3 -2 l3 2z`}
          fill="#FFFFFF"
        />
        <path
          d={`M${tPos[0]} ${tPos[1] - 128} l-3 -46 l3 -2 l3 2z`}
          fill="#F1F2EF"
          transform={`rotate(120 ${tPos[0]} ${tPos[1] - 128})`}
        />
        <path
          d={`M${tPos[0]} ${tPos[1] - 128} l-3 -46 l3 -2 l3 2z`}
          fill="#E4E7E0"
          transform={`rotate(240 ${tPos[0]} ${tPos[1] - 128})`}
        />
      </g>
      <circle cx={tPos[0]} cy={tPos[1] - 128} r={4} fill="#55764D" />

      {/* House C (back right) */}
      {box(28, -118, 82, 58, 40, 0, wall)}
      {winY(38, 62, 14, 28, -60)}
      {winY(74, 98, 14, 28, -60)}
      {winX(-110, -90, 14, 28, 110)}
      {winX(-82, -66, 14, 28, 110)}
      {array(36, -110, 4, 2, 40, 15, 11, 3, "arr-c")}

      {/* House A (left, two storey) */}
      {box(-122, -62, 92, 82, 76, 0, wall)}
      {poly(
        [
          P(-122, -62, 76),
          P(-30, -62, 76),
          P(-30, 20, 76),
          P(-122, 20, 76),
        ],
        "#E9ECE4"
      )}
      {poly(
        [
          P(-117, -57, 77),
          P(-35, -57, 77),
          P(-35, 15, 77),
          P(-117, 15, 77),
        ],
        "#F4F5F1"
      )}
      {winY(-112, -92, 46, 64, 20)}
      {winY(-82, -62, 46, 64, 20)}
      {winY(-112, -92, 14, 32, 20)}
      {poly(
        [P(-76, 20, 0), P(-58, 20, 0), P(-58, 20, 28), P(-76, 20, 28)],
        "#8C7A62"
      )}
      {winX(-52, -30, 46, 64, -30)}
      {winX(-20, 4, 46, 64, -30)}
      {winX(-52, -30, 14, 32, -30)}
      {array(-112, -52, 4, 3, 77, 15, 11, 3, "arr-a")}
      {tank(-44, -54, 77)}

      {/* Battery & Inverter Cabinet */}
      {box(124, -22, 18, 14, 30, 0, ["#FFFFFF", "#E4E7E0", "#CBD2C5"])}
      {poly(
        [
          P(128, -8, 18),
          P(136, -8, 18),
          P(136, -8, 22),
          P(128, -8, 22),
        ],
        "#A8CE45"
      )}

      {/* Ground Mounted Solar Array */}
      {array(-128, 64, 4, 2, 9, 15, 11, 4, "arr-g")}
      {[0, 1, 2, 3].map((c) => {
        const a = P(-128 + c * 19 + 7, 64 + 27, 0);
        return (
          <line
            key={`leg-${c}`}
            x1={a[0]}
            y1={a[1]}
            x2={a[0]}
            y2={a[1] - 9}
            stroke="#858B84"
            strokeWidth="1"
          />
        );
      })}

      {/* House B (front right) */}
      {box(22, 8, 94, 94, 54, 0, wall)}
      {poly(
        [P(22, 8, 54), P(116, 8, 54), P(116, 102, 54), P(22, 102, 54)],
        "#E9ECE4"
      )}
      {poly(
        [P(27, 13, 55), P(111, 13, 55), P(111, 97, 55), P(27, 97, 55)],
        "#F4F5F1"
      )}
      {winY(34, 60, 18, 36, 102)}
      {winY(70, 96, 18, 36, 102)}
      {poly(
        [P(100, 102, 0), P(112, 102, 0), P(112, 102, 30), P(100, 102, 30)],
        "#8C7A62"
      )}
      {winX(20, 46, 18, 36, 116)}
      {winX(58, 84, 18, 36, 116)}
      {array(32, 18, 5, 3, 55, 15, 11, 3, "arr-b")}
      {tank(104, 24, 55)}

      {/* Foreground Trees */}
      {tree(-40, 118, 12)}
      {tree(140, 88, 14)}
      {tree(-142, 22, 10)}
      {tree(66, 132, 9, 10)}

      {/* Green energy flow paths */}
      <path
        d={`M${e1[0]} ${e1[1]} Q ${e1[0] + 40} ${e1[1] - 50} ${e2[0]} ${e2[1]}`}
        fill="none"
        stroke="#A8CE45"
        strokeWidth="2"
        strokeDasharray="4 6"
        className="animate-[flow_1.6s_linear_infinite]"
      />
      <path
        d={`M${e3[0]} ${e3[1]} Q ${(e3[0] + e2[0]) / 2} ${e3[1] - 70} ${e2[0]} ${e2[1] - 4}`}
        fill="none"
        stroke="#A8CE45"
        strokeWidth="2"
        strokeDasharray="4 6"
        className="animate-[flow_1.6s_linear_infinite]"
      />

      {/* Sun glow in the distance */}
      <circle
        cx={P(-20, -150, 0)[0] + 200}
        cy={40}
        r={15}
        fill="#F2C14E"
        opacity="0.9"
      />
      <circle
        cx={P(-20, -150, 0)[0] + 200}
        cy={40}
        r={25}
        fill="#F2C14E"
        opacity="0.18"
      />
    </svg>
  );
}
