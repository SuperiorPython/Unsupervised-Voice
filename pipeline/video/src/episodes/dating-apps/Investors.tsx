// The "investors" / "executives": cube people seen from behind, in the foreground, facing the
// astronaut. Used in the pitch meeting and in the boardroom (confetti) bit. Drawn in SVG, animated
// from the frame number only.
import React from "react";
import { useCurrentFrame } from "remotion";
import { colors } from "../../theme";

export type Hair = "short" | "bun" | "bald" | "curly" | "long";
export type Person = { x: number; hair: Hair; hairColor: string; skin: string; suit: string; scale?: number };

const W = 220;
const H = 340;

export const HAIR = { ink: "#0D0D10", brown: "#3A2A20", grey: "#8A8A98", blonde: "#D8B26A", auburn: "#7A2E1C" } as const;
export const SKIN = { a: "#D8B98A", b: "#B98A5E", c: "#8D5B3E", d: "#F0D2B0" } as const;

// Cube people: the same blocky look as the astronaut (front face, a lit top face, a dark side face),
// seen from behind and slightly above. Their shape is a head cube, a neck cube, a torso cube and
// cube arms; the hair is blocks on and behind the head.
const D = { x: 18, y: -14 };
const shade = (hex: string, t: number) => {
  const n = parseInt(hex.slice(1), 16);
  const f = (c: number) => Math.round(t >= 0 ? c + (255 - c) * t : c * (1 + t));
  return `rgb(${f(n >> 16)},${f((n >> 8) & 255)},${f(n & 255)})`;
};
const ST = { stroke: colors.ink, strokeWidth: 4, strokeLinejoin: "round" } as const;
const Cube: React.FC<{ x: number; y: number; w: number; h: number; c: string; top?: string; side?: string }> = ({ x, y, w, h, c, top, side }) => (
  <g>
    <polygon points={`${x + w},${y} ${x + w + D.x},${y + D.y} ${x + w + D.x},${y + h + D.y} ${x + w},${y + h}`} fill={side ?? shade(c, -0.35)} {...ST} />
    <polygon points={`${x},${y} ${x + D.x},${y + D.y} ${x + w + D.x},${y + D.y} ${x + w},${y}`} fill={top ?? shade(c, 0.22)} {...ST} />
    <rect x={x} y={y} width={w} height={h} fill={c} {...ST} />
  </g>
);

const Back: React.FC<{ p: Person; i: number; cheer: number; slump: number; react: number }> = ({ p, i, cheer, slump, react }) => {
  const frame = useCurrentFrame();
  const bob = Math.sin(frame / (22 + i * 3) + i) * 3;
  const hop = cheer * Math.abs(Math.sin(frame / 5 + i * 1.3)) * 16;
  const sink = slump * 26;
  const headRot = Math.sin(frame / (40 + i * 7) + i * 2) * 1.5 + react * 9 * Math.sin(frame / 3 + i * 2.1) + slump * (i % 2 ? 7 : -7);
  const nod = slump * 10 + Math.sin(frame / (30 + i * 5)) * 1.5;
  const armAngle = cheer * (150 + Math.sin(frame / 4 + i) * 20);
  const bald = p.hair === "bald";
  const head = bald ? p.skin : p.hairColor;
  return (
    <svg width={W * (p.scale ?? 1)} height={H * (p.scale ?? 1)} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", left: p.x, overflow: "visible" }}>
      <g transform={`translate(0 ${bob - hop + sink})`}>
        {/* raised arms (behind the torso): a sleeve cube and a hand cube */}
        {([1, -1] as const).map((side) => (
          <g key={side} transform={`translate(${side === 1 ? 38 : 182} 232) rotate(${side * armAngle})`} opacity={cheer > 0.02 ? 1 : 0}>
            <Cube x={-20} y={0} w={40} h={104} c={p.suit} />
            <Cube x={-17} y={104} w={34} h={34} c={p.skin} />
          </g>
        ))}
        {/* neck and torso */}
        <Cube x={90} y={164} w={40} h={46} c={p.skin} />
        <Cube x={14} y={204} w={192} h={170} c={p.suit} />
        <rect x={82} y={206} width={56} height={14} fill={colors.paper} {...ST} />
        {/* the back of the head */}
        <g transform={`translate(0 ${nod}) rotate(${headRot} 110 170)`}>
          {p.hair === "long" ? <Cube x={50} y={110} w={120} h={130} c={p.hairColor} /> : null}
          <Cube x={50} y={44} w={120} h={122} c={head} />
          {!bald && p.hair !== "long" ? <rect x={52} y={146} width={116} height={18} fill={p.skin} stroke={colors.ink} strokeWidth={3} /> : null}
          {bald ? <rect x={66} y={62} width={34} height={10} fill={colors.paper} opacity={0.6} /> : null}
          {p.hair === "bun" ? <Cube x={92} y={6} w={40} h={38} c={p.hairColor} /> : null}
          {p.hair === "curly"
            ? [58, 90, 122].map((x, k) => <Cube key={k} x={x} y={14 + (k === 1 ? -6 : 0)} w={34} h={32} c={p.hairColor} />)
            : null}
        </g>
      </g>
    </svg>
  );
};

// cheer: arms up and hopping (0-1). slump: sinking and turning to each other (0-1).
// react: heads shaking, murmuring (0-1).
export const Investors: React.FC<{ people: Person[]; top: number; cheer?: number; slump?: number; react?: number }> = ({
  people,
  top,
  cheer = 0,
  slump = 0,
  react = 0,
}) => (
  <div style={{ position: "absolute", left: 0, top, width: 1920, height: H }}>
    {people.map((p, i) => (
      <Back key={i} p={p} i={i} cheer={cheer} slump={slump} react={react} />
    ))}
  </div>
);

// Three at the left edge for the pitch meeting.
export const PITCH_INVESTORS: Person[] = [
  { x: -30, hair: "short", hairColor: HAIR.ink, skin: SKIN.a, suit: "#2B2B33" },
  { x: 120, hair: "bun", hairColor: HAIR.brown, skin: SKIN.c, suit: "#55556A" },
  { x: 270, hair: "bald", hairColor: HAIR.ink, skin: SKIN.d, suit: "#3B3B4A" },
];

// Three on each side of the lectern for the boardroom.
export const BOARD_EXECS: Person[] = [
  { x: 10, hair: "curly", hairColor: HAIR.brown, skin: SKIN.b, suit: "#3B3B4A" },
  { x: 190, hair: "short", hairColor: HAIR.grey, skin: SKIN.d, suit: "#55556A" },
  { x: 370, hair: "long", hairColor: HAIR.auburn, skin: SKIN.a, suit: "#2B2B33" },
  { x: 1330, hair: "bald", hairColor: HAIR.ink, skin: SKIN.c, suit: "#2B2B33" },
  { x: 1510, hair: "bun", hairColor: HAIR.blonde, skin: SKIN.d, suit: "#3B3B4A" },
  { x: 1690, hair: "short", hairColor: HAIR.ink, skin: SKIN.b, suit: "#55556A" },
];
