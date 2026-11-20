// Shared building blocks for the Dating Apps episode. Times passed to these helpers are in
// SECONDS, local to whichever section or beat they sit in.
import React, { createContext, useContext } from "react";
import { Sequence, interpolate, spring, useCurrentFrame as useRawFrame, useVideoConfig } from "remotion";
import { Astronaut, type AstroMood, type AstroPose } from "../../avatar/Astronaut";
import type { Cue } from "../../avatar/driver";
import { FPS } from "../../clips";
import { clamp, colors, fonts } from "../../theme";
import { HAS_NARRATION, NARRATION_FILE, SECTION_START_FRAMES, type SectionId } from "./timing";

// A beat can play faster or slower than its slot (see Beat's `was`). Everything inside a beat reads time through this
// hook, so the animation inside is stretched to fit the words it covers. Beats with an astronaut in them stay at 1.
const WarpCtx = createContext(1);
export const useCurrentFrame = () => useRawFrame() * useContext(WarpCtx);

export const sec = (n: number) => Math.round(n * FPS);
export const SOFT = "#EDEDF0";
export const WALL = "#F7F7F9";

export const ease = (t: number) => t * t * (3 - 2 * t);
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
// 0 to 1 between two moments (seconds) of the current Sequence.
export const prog = (frame: number, a: number, b: number) => interpolate(frame, [sec(a), sec(b)], [0, 1], clamp);

// Deterministic "random" so every frame of a render agrees with the last.
export const rnd = (i: number, k = 0) => {
  const x = Math.sin(i * 127.1 + k * 311.7) * 43758.5453;
  return x - Math.floor(x);
};

// ---------- astronaut helpers ----------
export const cue = (t: number, mood?: AstroMood, pose?: AstroPose): Cue<AstroPose, AstroMood> => ({ at: sec(t), mood, pose });

// Mouth follows the narration once HAS_NARRATION is on. The offset makes the section-local
// frame read the right part of the whole-video narration file.
export const narration = (id: SectionId, extraFrames = 0) =>
  HAS_NARRATION
    ? { audio: NARRATION_FILE, audioStartFrame: -(SECTION_START_FRAMES[id] + extraFrames) }
    : { audio: undefined, audioStartFrame: 0 };

// The commentator in the bottom-right corner, like in Group Projects.
export const Corner: React.FC<{ id: SectionId; cues: Cue<AstroPose, AstroMood>[] }> = ({ id, cues }) => (
  <Astronaut x={1730} y={890} size={0.5} cues={cues} {...narration(id)} />
);

// ---------- the whiteboard and the assistant bot ----------
// Inside a <Beat write> everything is "written" by a little assistant bot on a ladder. Pop stops bouncing and
// just tells the text under it when to start, T wipes on left to right like marker ink and reports where the
// wipe edge is, Card and Chip drop their pop-up chrome. The bot's telescoping arm reaches that point.
type Pen = { x: number; y: number; color: string; f: number };
type WriteState = {
  board: boolean;
  at: number;
  report?: (p: Pen) => void;
};
const WriteCtx = createContext<WriteState>({ board: false, at: 0 });
const useWrite = () => useContext(WriteCtx);

const BC = { front: "#E9E9EF", top: "#F7F7FA", side: "#B3B3C0", edge: colors.ink };
const BD = { x: 14, y: -11 };
const BCube: React.FC<{ x: number; y: number; w: number; h: number; c?: string }> = ({ x, y, w, h, c = BC.front }) => (
  <g stroke={BC.edge} strokeWidth={4} strokeLinejoin="round">
    <polygon points={`${x + w},${y} ${x + w + BD.x},${y + BD.y} ${x + w + BD.x},${y + h + BD.y} ${x + w},${y + h}`} fill={c === BC.front ? BC.side : "#9A1F2C"} />
    <polygon points={`${x},${y} ${x + BD.x},${y + BD.y} ${x + w + BD.x},${y + BD.y} ${x + w},${y}`} fill={c === BC.front ? BC.top : "#F2586A"} />
    <rect x={x} y={y} width={w} height={h} fill={c} />
  </g>
);

const AssistantBot: React.FC<{ w: number; h: number; pen: Pen | null }> = ({ w, h, pen }) => {
  const frame = useCurrentFrame();
  const bob = Math.sin(frame / 14) * 3;
  const bx = w + 70; // bot centre
  const K = 1.25; // bot scale
  const feet = h / 2 + 100; // the rung he stands on
  const sx = bx - 34 * K; // shoulder, on the side facing the board
  const sy = feet - 112 * K + bob * K;
  const idle = { x: w - 90, y: h / 2 - 40 };
  const tx = (pen ? pen.x : idle.x) + (pen ? Math.sin(frame * 1.9) * 2 : 0);
  const ty = (pen ? pen.y : idle.y) + (pen ? Math.cos(frame * 2.3) * 2.5 : 0);
  const color = pen ? pen.color : colors.ink;
  const dx = tx - sx;
  const dy = ty - sy;
  const len = Math.hypot(dx, dy);
  const ang = (Math.atan2(dy, dx) * 180) / Math.PI;
  const MK = 58; // marker length
  const armLen = Math.max(30, len - MK + 16);
  const look = Math.max(-1, Math.min(1, dx / 600)) * 5;
  const railTop = -40;
  const railBot = h / 2 + 520; // the floor, in board coordinates
  const rungs = Array.from({ length: 12 }, (_, i) => railTop + 50 + i * ((railBot - railTop - 100) / 11));
  const lean = 90; // how far the foot of the ladder sits from the board
  const railX = (y: number, side: 0 | 1) => w + 10 + side * 100 + ((y - railTop) / (railBot - railTop)) * lean;
  return (
    <svg width={w} height={h} style={{ position: "absolute", left: 0, top: 0, overflow: "visible", pointerEvents: "none" }}>
      {/* ladder */}
      <g stroke={BC.edge} strokeWidth={6} strokeLinecap="round">
        <line x1={railX(railTop, 0)} y1={railTop} x2={railX(railBot, 0)} y2={railBot} />
        <line x1={railX(railTop, 1)} y1={railTop} x2={railX(railBot, 1)} y2={railBot} />
        {rungs.map((y, i) => (
          <line key={i} x1={railX(y, 0)} y1={y} x2={railX(y, 1)} y2={y} />
        ))}
      </g>
      {/* the bot, standing on a rung */}
      <g transform={`translate(${bx} ${feet}) scale(${K})`}>
        <BCube x={-24} y={-22} w={18} h={22} />
        <BCube x={6} y={-22} w={18} h={22} />
        <g transform={`translate(0 ${bob})`}>
          <BCube x={-36} y={-112} w={72} h={92} />
          <rect x={-36} y={-70} width={72} height={14} fill={colors.red} stroke={BC.edge} strokeWidth={4} />
          <rect x={-14} y={-48} width={28} height={16} fill={colors.ink} />
          {/* head: a screen face that looks toward the board */}
          <g transform={`translate(${look * 0.6} 0)`}>
            <rect x={-6} y={-214} width={8} height={26} fill={BC.side} stroke={BC.edge} strokeWidth={3} />
            <circle cx={-2} cy={-218} r={8} fill={colors.red} stroke={BC.edge} strokeWidth={3} />
            <BCube x={-42} y={-188} w={84} h={72} />
            <rect x={-32} y={-178} width={64} height={46} rx={8} fill={colors.ink} />
            <rect x={-20 + look} y={-166} width={10} height={14} fill={colors.redLight} />
            <rect x={8 + look} y={-166} width={10} height={14} fill={colors.redLight} />
            <rect x={-10 + look} y={-142} width={20} height={5} fill={colors.redLight} />
          </g>
        </g>
      </g>
      {/* telescoping arm, then the marker */}
      <g transform={`translate(${sx} ${sy}) rotate(${ang})`} stroke={BC.edge} strokeWidth={4} strokeLinejoin="round">
        <rect x={0} y={-11} width={armLen * 0.4} height={22} fill={BC.front} />
        <rect x={armLen * 0.4} y={-8} width={armLen * 0.3} height={16} fill="#D4D4DD" />
        <rect x={armLen * 0.7} y={-5} width={armLen * 0.3} height={10} fill={BC.front} />
        <circle cx={0} cy={0} r={13} fill={BC.side} />
        <circle cx={armLen} cy={0} r={11} fill={BC.side} />
        {/* the marker: cap, body, tip (the tip is at the pen point) */}
        <g transform={`translate(${len} 0)`}>
          <rect x={-MK} y={-8} width={MK - 10} height={16} rx={3} fill={color} />
          <rect x={-MK} y={-8} width={14} height={16} rx={3} fill={colors.ink} />
          <polygon points="-10,-8 0,-3 0,3 -10,8" fill={BC.front} />
          <circle cx={0} cy={0} r={2.5} fill={color} stroke="none" />
        </g>
      </g>
    </svg>
  );
};

export const Board: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const frame = useCurrentFrame();
  const ref = React.useRef<HTMLDivElement>(null);
  const [size, setSize] = React.useState({ w: 1100, h: 560 });
  const [pen, setPen] = React.useState<Pen | null>(null);
  React.useLayoutEffect(() => {
    const el = ref.current;
    if (el && (el.offsetWidth !== size.w || el.offsetHeight !== size.h)) setSize({ w: el.offsetWidth, h: el.offsetHeight });
  });
  const report = React.useCallback((n: Pen) => setPen((p) => (p && p.f === n.f && p.x === n.x && p.y === n.y ? p : n)), []);
  const value = React.useMemo<WriteState>(() => ({ board: true, at: 0, report }), [report]);
  return (
    <WriteCtx.Provider value={value}>
      <div
        ref={ref}
        data-board="1"
        style={{
          position: "relative",
          minWidth: 1100,
          maxWidth: 1380,
          minHeight: 560,
          padding: "44px 40px 70px",
          boxSizing: "border-box",
          background: colors.paper,
          border: `8px solid ${colors.ink}`,
          borderRadius: 18,
          boxShadow: `14px 14px 0 ${colors.red}`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 30,
        }}
      >
        {children}
        {/* marker tray */}
        <div style={{ position: "absolute", left: 80, right: 80, bottom: 18, height: 18, background: SOFT, border: `4px solid ${colors.ink}`, borderRadius: 6 }} />
        <AssistantBot w={size.w} h={size.h} pen={pen && pen.f === frame ? pen : null} />
      </div>
    </WriteCtx.Provider>
  );
};

// ---------- motion ----------
export const useIn = (at = 0) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: f - sec(at), fps, config: { damping: 13, stiffness: 150, mass: 0.8 } });
};

export const Pop: React.FC<{ at?: number; rot?: number; style?: React.CSSProperties; children: React.ReactNode }> = ({
  at = 0,
  rot = 0,
  style,
  children,
}) => {
  const p = useIn(at);
  const w = useWrite();
  if (w.board) {
    return (
      <WriteCtx.Provider value={{ ...w, at }}>
        <div style={{ transform: rot ? `rotate(${rot * 0.5}deg)` : undefined, ...style }}>{children}</div>
      </WriteCtx.Provider>
    );
  }
  return (
    <div
      style={{
        opacity: Math.max(0, Math.min(1, p * 1.6)),
        transform: `translateY(${(1 - p) * 40}px) scale(${0.85 + 0.15 * p}) rotate(${rot}deg)`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

// ---------- beats ----------
// A beat is a stretch of the section with its own visual. mode:
//   side    centered in the left area (x 40..1540), leaving the corner astronaut visible
//   overlay the whole frame, transparent, so the corner astronaut stays visible
//   full    the whole frame, no fade: a hard cut (the piece brings its own background)
type Mode = "side" | "overlay" | "full";

const BeatBody: React.FC<{ mode: Mode; children: React.ReactNode }> = ({ mode, children }) => {
  const f = useRawFrame();
  const { durationInFrames } = useVideoConfig();
  if (mode === "full") return <div style={{ position: "absolute", inset: 0 }}>{children}</div>;
  const o = interpolate(f, [0, 4, Math.max(5, durationInFrames - 6), Math.max(6, durationInFrames)], [0, 1, 1, 0], clamp);
  if (mode === "overlay") return <div style={{ position: "absolute", inset: 0, opacity: o }}>{children}</div>;
  return (
    <div
      style={{
        position: "absolute",
        left: 40,
        top: 40,
        width: 1500,
        height: 1000,
        opacity: o,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 30,
      }}
    >
      {children}
    </div>
  );
};

// from/to: where the beat sits in the section (seconds). was: how long the beat was written for; when it differs from
// to - from, the whole beat plays at that ratio, so a beat written for 10 s still finishes inside a 7 s slot.
export const Beat: React.FC<{ from: number; to: number; was?: number; mode?: Mode; write?: boolean; children: React.ReactNode }> = ({
  from,
  to,
  was,
  mode = "side",
  write = false,
  children,
}) => (
  <Sequence from={sec(from)} durationInFrames={Math.max(1, sec(to) - sec(from))} layout="none">
    <WarpCtx.Provider value={was ? was / (to - from) : 1}>
      <BeatBody mode={mode}>{write ? <Board>{children}</Board> : children}</BeatBody>
    </WarpCtx.Provider>
  </Sequence>
);

// ---------- type and cards ----------
export const T: React.FC<{ size?: number; color?: string; weight?: number; style?: React.CSSProperties; children: React.ReactNode }> = ({
  size = 64,
  color = colors.ink,
  weight = 800,
  style,
  children,
}) => {
  const frame = useCurrentFrame();
  const w = useWrite();
  const ref = React.useRef<HTMLDivElement>(null);
  let clip: string | undefined;
  let p = 0;
  if (w.board) {
    const len = typeof children === "string" ? children.length : React.Children.toArray(children).reduce<number>((n, c) => n + (typeof c === "string" ? c.length : 8), 0);
    p = prog(frame, w.at, w.at + 0.3 + len * 0.045);
    clip = `inset(-12px ${(1 - p) * 100}% -12px -12px)`;
  }
  // tell the board's bot where the ink edge is, in board coordinates
  React.useLayoutEffect(() => {
    const el = ref.current;
    const b = el?.closest<HTMLElement>("[data-board]");
    if (!w.board || !w.report || !el || !b || p <= 0 || p >= 1) return;
    const r = el.getBoundingClientRect();
    const br = b.getBoundingClientRect();
    const sc = b.offsetWidth ? br.width / b.offsetWidth : 1;
    w.report({ x: (r.left + r.width * p - br.left) / sc, y: (r.top + r.height * 0.6 - br.top) / sc, color, f: frame });
  });
  return (
    <div ref={ref} style={{ fontFamily: fonts.sans, fontSize: size, fontWeight: weight, color, lineHeight: 1.1, clipPath: clip, ...style }}>
      {children}
    </div>
  );
};

// A stage direction, shown the way a caption would be: "*dramatic violin*".
export const Aside: React.FC<{ at?: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ at = 0, children, style }) => (
  <Pop at={at} style={style}>
    <T size={40} weight={600} color={colors.muted} style={{ fontStyle: "italic" }}>
      *{children}*
    </T>
  </Pop>
);

export const Card: React.FC<{ style?: React.CSSProperties; dark?: boolean; children: React.ReactNode }> = ({ style, dark = false, children }) => {
  const w = useWrite();
  if (w.board && !dark) return <div style={{ position: "relative", fontFamily: fonts.sans, color: colors.ink, boxSizing: "border-box", ...style, width: undefined, maxWidth: undefined, padding: "6px 10px" }}>{children}</div>;
  return (
  <div
    style={{
      background: dark ? colors.ink : colors.paper,
      border: `6px solid ${dark ? colors.red : colors.ink}`,
      borderRadius: 22,
      boxShadow: `12px 12px 0 ${dark ? colors.redDark : colors.red}`,
      padding: "28px 40px",
      boxSizing: "border-box",
      fontFamily: fonts.sans,
      color: dark ? colors.paper : colors.ink,
      ...style,
    }}
  >
    {children}
  </div>
  );
};

export const Chip: React.FC<{ at?: number; red?: boolean; size?: number; rot?: number; children: React.ReactNode }> = ({ at = 0, red = false, size = 48, rot = 0, children }) => {
  const frame = useCurrentFrame();
  const w = useWrite();
  if (w.board) {
    // on the board a chip is a hand-drawn oval round the written words
    return (
      <Pop at={at} rot={rot}>
        <div style={{ position: "relative", padding: "8px 30px", whiteSpace: "nowrap", textAlign: "center" }}>
          <div style={{ position: "absolute", inset: 0, border: `5px solid ${red ? colors.red : colors.ink}`, borderRadius: 56, opacity: prog(frame, at + 0.2, at + 0.6) }} />
          <T size={size} weight={800} color={red ? colors.red : colors.ink}>{children}</T>
        </div>
      </Pop>
    );
  }
  return (
  <Pop at={at} rot={rot}>
    <div
      style={{
        fontFamily: fonts.sans,
        fontSize: size,
        fontWeight: 800,
        padding: "12px 34px",
        borderRadius: 999,
        border: `6px solid ${colors.ink}`,
        background: red ? colors.red : colors.paper,
        color: red ? colors.paper : colors.ink,
        boxShadow: `7px 7px 0 ${red ? colors.ink : colors.red}`,
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </div>
  </Pop>
  );
};

// A rubber stamp that slams down: starts big and transparent, lands at its final size.
export const Stamp: React.FC<{ at?: number; rot?: number; color?: string; size?: number; style?: React.CSSProperties; children: React.ReactNode }> = ({
  at = 0,
  rot = -8,
  color = colors.red,
  size = 44,
  style,
  children,
}) => {
  const p = useIn(at);
  return (
    <div
      style={{
        opacity: Math.min(1, p * 2),
        transform: `rotate(${rot}deg) scale(${2 - Math.min(1, p) * 1 + Math.max(0, p - 1) * 0.5})`,
        border: `8px solid ${color}`,
        color,
        padding: "6px 22px",
        borderRadius: 10,
        fontFamily: fonts.sans,
        fontSize: size,
        fontWeight: 900,
        letterSpacing: 4,
        background: "rgba(255,255,255,0.7)",
        whiteSpace: "nowrap",
        ...style,
      }}
    >
      {children}
    </div>
  );
};

// ---------- drawn marks ----------
// p draws the stroke from start to end (0 to 1).
export const Check: React.FC<{ s?: number; c?: string; p?: number }> = ({ s = 64, c = colors.red, p = 1 }) => (
  <svg width={s} height={s} viewBox="0 0 64 64" style={{ overflow: "visible" }}>
    <path
      d="M10 34 L26 50 L54 14"
      pathLength={1}
      strokeDasharray={1}
      strokeDashoffset={1 - p}
      opacity={p > 0.001 ? 1 : 0}
      fill="none"
      stroke={c}
      strokeWidth={10}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const Cross: React.FC<{ s?: number; c?: string; p?: number }> = ({ s = 64, c = colors.ink, p = 1 }) => (
  <svg width={s} height={s} viewBox="0 0 64 64" style={{ overflow: "visible" }}>
    <path d="M14 14 L50 50" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - Math.min(1, p * 2)} opacity={p > 0.001 ? 1 : 0} fill="none" stroke={c} strokeWidth={10} strokeLinecap="round" />
    <path d="M50 14 L14 50" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - Math.max(0, p * 2 - 1)} opacity={p > 0.5 ? 1 : 0} fill="none" stroke={c} strokeWidth={10} strokeLinecap="round" />
  </svg>
);

// The same little pixel face the astronaut wears, as a flat person. ghost = a dashed "who?" slot.
export const Face: React.FC<{ label?: string; fill?: string; eye?: string; size?: number; ghost?: boolean }> = ({
  label,
  fill = colors.ink,
  eye = colors.redLight,
  size = 150,
  ghost = false,
}) => (
  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
    <div
      style={{
        width: size,
        height: size,
        boxSizing: "border-box",
        borderRadius: size * 0.16,
        background: ghost ? "transparent" : fill,
        border: ghost ? `6px dashed ${colors.muted}` : `6px solid ${colors.ink}`,
        position: "relative",
      }}
    >
      {ghost ? (
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: fonts.sans, fontSize: size * 0.6, fontWeight: 900, color: colors.muted }}>?</div>
      ) : (
        <>
          <div style={{ position: "absolute", left: size * 0.24, top: size * 0.32, width: size * 0.14, height: size * 0.18, background: eye }} />
          <div style={{ position: "absolute", right: size * 0.24, top: size * 0.32, width: size * 0.14, height: size * 0.18, background: eye }} />
          <div style={{ position: "absolute", left: size * 0.34, top: size * 0.66, width: size * 0.32, height: size * 0.07, background: colors.red }} />
        </>
      )}
    </div>
    {label ? <T size={size > 130 ? 34 : 26}>{label}</T> : null}
  </div>
);

// A grey bystander: same shape as Face, but a different colour so the crowd reads as "other people".
export const Shopper: React.FC<{ size?: number }> = ({ size = 120 }) => <Face size={size} fill="#C9C9D2" eye={colors.ink} />;

export const Heart: React.FC<{ s?: number; c?: string; stroke?: string }> = ({ s = 80, c = colors.red, stroke = colors.ink }) => (
  <svg width={s} height={s} viewBox="0 0 64 64" style={{ overflow: "visible" }}>
    <path d="M32 56 C8 38 4 24 12 16 C20 8 30 12 32 20 C34 12 44 8 52 16 C60 24 56 38 32 56 Z" fill={c} stroke={stroke} strokeWidth={5} strokeLinejoin="round" />
  </svg>
);
