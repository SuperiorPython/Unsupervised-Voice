import { Composition, interpolate, useVideoConfig } from "remotion";
import { fonts } from "../theme";
import { Stage } from "../pieces/ui";
import { Cue, mixObj, useDriver } from "./driver";
import { useCurrentFrame } from "remotion";

// "Relay" v2: a blocky astronaut with a see-through visor and limbs that float apart
// from the body. Black and blue suit with a cyan rim light so it reads on the dark
// background. Original design: cube proportions, not any existing game character.

export type AstroPose = "idle" | "point" | "shrug" | "hold" | "wave" | "cheer" | "chin" | "facepalm" | "open" | "crossed" | "hip" | "scratch" | "slump";
export type AstroMood = "neutral" | "happy" | "surprised" | "smug" | "thinking" | "excited" | "worried" | "skeptical" | "determined" | "deadpan" | "annoyed" | "dejected" | "confused" | "shocked" | "tired";

// Each arm is two segments with an elbow. rot = shoulder angle in degrees (0 hangs straight
// down; for the right arm negative swings it out and up, for the left arm positive does).
// bend = extra elbow angle on top of rot, same sign convention. dx/dy nudge the shoulder.
// osc = how far the whole arm swings back and forth (cheer); fosc = how far only the forearm
// wags (wave, scratch). body.lean tilts the torso, body.drop lowers torso and head in px.
type Arm = { rot: number; dx: number; dy: number; osc: number; bend: number; fosc: number };
type Body = { lean: number; drop: number };
type Pose = { l: Arm; r: Arm; body: Body };
const A = (rot: number, dx = 0, dy = 0, osc = 0, bend = 0, fosc = 0): Arm => ({ rot, dx, dy, osc, bend, fosc });
const PO = (l: Arm, r: Arm, body: Partial<Body> = {}): Pose => ({ l, r, body: { lean: 0, drop: 0, ...body } });
const POSES: Record<AstroPose, Pose> = {
  idle: PO(A(8, 0, 0, 0, -6), A(-8, 0, 0, 0, 6)),
  point: PO(A(14, 0, 0, 0, -22), A(-100, 10, -10, 0, -10)),
  shrug: PO(A(35, -4, -14, 0, 125), A(-35, 4, -14, 0, -125), { drop: 4 }),
  hold: PO(A(-25, 0, 0, 0, -60), A(25, 0, 0, 0, 60)),
  wave: PO(A(8, 0, 0, 0, -6), A(-100, 0, -6, 0, -80, 22)),
  cheer: PO(A(145, -14, -10, 8, 15), A(-145, 14, -10, 8, -15), { lean: -2 }),
  chin: PO(A(-70, 0, 6, 0, -20), A(70, 0, 0, 0, 65), { lean: 2 }),
  facepalm: PO(A(8, 0, 0, 0, -6), A(100, 0, 0, 0, 70), { lean: 3, drop: 4 }),
  open: PO(A(60, -6, 0, 0, 25), A(-60, 6, 0, 0, -25)),
  // folded arms: right forearm over the top, left tucked under
  crossed: PO(A(-70, 0, 6, 0, -20), A(70, 0, -16, 0, 20), { drop: 2 }),
  // right hand on hip, elbow out
  hip: PO(A(8, 0, 0, 0, -6), A(-40, 0, 0, 0, 105), { lean: -2 }),
  // hand at the side of the helmet, forearm wagging
  scratch: PO(A(8, 0, 0, 0, -6), A(-150, 0, 0, 0, -77, 14), { lean: 1 }),
  // arms hanging limp, sagging forward
  slump: PO(A(4, 0, 6, 0, -4), A(-4, 0, 6, 0, 4), { lean: 5, drop: 14 }),
};

// Per-eye brow and eye settings let the face be lopsided (skeptical) and not just symmetric.
// tilt: degrees, positive = inner end of the brow down (determined), negative = inner end up (worried).
// smile: -1 frown to 1 big smile. mouthO: 0 to 1, a round "oh" mouth. head*/lean: body language.
type Mood = {
  browL: number; browR: number; tiltL: number; tiltR: number;
  eyeL: number; eyeR: number; lidL: number; lidR: number; look: number;
  smile: number; mouthO: number; grin: number; blush: number;
  headRot: number; headDx: number; lean: number; hop: number; bobSpeed: number;
};
const MOOD = (m: Partial<Mood>): Mood => ({
  browL: 0, browR: 0, tiltL: 0, tiltR: 0, eyeL: 1, eyeR: 1, lidL: 0, lidR: 0, look: 0,
  smile: 0.4, mouthO: 0, grin: 0, blush: 0.35, headRot: 0, headDx: 0, lean: 0, hop: 0, bobSpeed: 1, ...m,
});
const MOODS: Record<AstroMood, Mood> = {
  neutral: MOOD({}),
  happy: MOOD({ browL: -5, browR: -5, smile: 1, grin: 0.4, blush: 0.6, headRot: -3 }),
  surprised: MOOD({ browL: -16, browR: -16, eyeL: 1.3, eyeR: 1.3, smile: 0, mouthO: 1, blush: 0.2, lean: -4, headRot: 0 }),
  smug: MOOD({ browL: -2, browR: -6, tiltL: 6, tiltR: -8, lidL: 0.45, lidR: 0.45, look: 6, smile: 0.9, headRot: -7, headDx: 4, lean: 3 }),
  thinking: MOOD({ browL: -6, browR: -9, tiltL: -4, tiltR: 4, lidL: 0.1, lidR: 0.1, look: -8, smile: 0, headRot: 8, headDx: -4, blush: 0.2 }),
  excited: MOOD({ browL: -12, browR: -12, eyeL: 1.25, eyeR: 1.25, smile: 1, grin: 1, blush: 0.9, hop: 1, bobSpeed: 2.4, headRot: 2 }),
  worried: MOOD({ browL: -6, browR: -6, tiltL: -14, tiltR: -14, eyeL: 1.1, eyeR: 1.1, smile: -0.7, blush: 0.1, headRot: 4, lean: 2, bobSpeed: 2.2 }),
  skeptical: MOOD({ browL: -16, browR: 4, tiltL: -2, tiltR: 12, lidL: 0, lidR: 0.5, look: -6, smile: -0.2, headRot: -7, headDx: -3, blush: 0.15 }),
  determined: MOOD({ browL: 2, browR: 2, tiltL: 14, tiltR: 14, eyeL: 0.85, eyeR: 0.85, smile: 0.3, blush: 0.2, lean: -3, headDx: 3 }),
  // flat, half-lidded, almost still: the dry-humor default
  deadpan: MOOD({ lidL: 0.42, lidR: 0.42, smile: 0, blush: 0, bobSpeed: 0.5, headRot: 0 }),
  // inner brows down, heavy lids, small frown
  annoyed: MOOD({ browL: 4, browR: 4, tiltL: 16, tiltR: 16, lidL: 0.3, lidR: 0.3, smile: -0.5, blush: 0.15, headRot: -3, headDx: 2, lean: -2, bobSpeed: 1.6 }),
  // brows pinched up in the middle, slumped and slow
  dejected: MOOD({ browL: -4, browR: -4, tiltL: -16, tiltR: -16, eyeL: 0.9, eyeR: 0.9, lidL: 0.15, lidR: 0.15, look: -4, smile: -1, blush: 0.05, headRot: 9, headDx: -3, lean: 5, bobSpeed: 0.5 }),
  // one brow high, head cocked, eyes drifting off to the side
  confused: MOOD({ browL: -14, browR: 2, tiltL: -6, tiltR: 8, eyeL: 1.1, lidR: 0.2, look: 8, smile: -0.3, blush: 0.15, headRot: 12, headDx: -5 }),
  // bigger than surprised: huge eyes, round mouth, a little tremble
  shocked: MOOD({ browL: -20, browR: -20, eyeL: 1.55, eyeR: 1.55, smile: 0, mouthO: 1, blush: 0, lean: -6, bobSpeed: 3 }),
  // drooping lids, tilted head, barely moving
  tired: MOOD({ browL: 2, browR: 2, tiltL: -6, tiltR: -6, lidL: 0.55, lidR: 0.55, look: -3, smile: -0.2, blush: 0.1, headRot: 11, headDx: 3, lean: 4, bobSpeed: 0.45 }),
};
// Little pixel symbol that pops up above the helmet when a mood starts.
const GLYPH: Record<AstroMood, "" | "!" | "?" | "spark" | "sweat" | "dots" | "anger"> = {
  neutral: "", happy: "", surprised: "!", smug: "", thinking: "?", excited: "spark", worried: "sweat", skeptical: "?", determined: "", deadpan: "dots", annoyed: "anger", dejected: "", confused: "?", shocked: "!", tired: "",
};

const C = {
  front: "#17171C",
  top: "#2B2B33",
  side: "#0A0A0D",
  accent: "#D62839",
  accentLight: "#FF5A5F",
  accentDark: "#8E1B2A",
  rim: "#FF4D4D",
  edge: "#050507",
  skin: "#08080A",
  helmet: "#1E1E25",
  ink: "#0D0D10",
  mouth: "#D62839",
};

// A cube seen from slightly above and to the right. (x, y) is the top-left of the front face.
const D = { x: 30, y: -24 };
const Cube: React.FC<{ x: number; y: number; w: number; h: number; front?: string; top?: string; side?: string; rim?: boolean }> = ({
  x, y, w, h, front = C.front, top = C.top, side = C.side, rim = true,
}) => (
  <g>
    <polygon points={`${x + w},${y} ${x + w + D.x},${y + D.y} ${x + w + D.x},${y + h + D.y} ${x + w},${y + h}`} fill={side} stroke={C.edge} strokeWidth={3} strokeLinejoin="round" />
    <polygon points={`${x},${y} ${x + D.x},${y + D.y} ${x + w + D.x},${y + D.y} ${x + w},${y}`} fill={top} stroke={C.edge} strokeWidth={3} strokeLinejoin="round" />
    <rect x={x} y={y} width={w} height={h} fill={front} stroke={C.edge} strokeWidth={3} />
    {rim ? <line x1={x + w + D.x} y1={y + D.y} x2={x + w + D.x} y2={y + h + D.y} stroke={C.rim} strokeWidth={4} opacity={0.8} /> : null}
    {rim ? <line x1={x} y1={y} x2={x + D.x} y2={y + D.y} stroke={C.rim} strokeWidth={4} opacity={0.6} /> : null}
  </g>
);

const UPPER = 88;
const LimbArm: React.FC<{ x: number; y: number; arm: Arm; left?: boolean; bob: number; frame: number; ph: number }> = ({ x, y, arm, left, bob, frame, ph }) => {
  const swing = arm.osc * Math.sin(frame / 3.2 + ph);
  const wag = arm.fosc * Math.sin(frame / 2.6 + ph);
  const bend = arm.bend + (left ? -wag : wag);
  const ey = y + UPPER;
  return (
    <g transform={`translate(${arm.dx},${arm.dy + bob}) rotate(${arm.rot + (left ? -swing : swing)} ${x + 31} ${y})`}>
      {/* forearm first, so the upper arm covers the joint */}
      <g transform={`rotate(${bend} ${x + 31} ${ey})`}>
        <Cube x={x} y={ey} w={62} h={82} />
        <rect x={x} y={ey + 40} width={62} height={42} fill={C.accent} stroke={C.edge} strokeWidth={3} />
        <polygon points={`${x + 62},${ey + 40} ${x + 62 + D.x},${ey + 40 + D.y} ${x + 62 + D.x},${ey + 82 + D.y} ${x + 62},${ey + 82}`} fill={C.accentDark} stroke={C.edge} strokeWidth={3} />
      </g>
      <Cube x={x} y={y} w={62} h={UPPER} />
    </g>
  );
};

const Leg: React.FC<{ x: number; bob: number }> = ({ x, bob }) => (
  <g transform={`translate(0,${bob})`}>
    <Cube x={x} y={122} w={70} h={150} />
    <rect x={x} y={232} width={70} height={40} fill={C.accent} stroke={C.edge} strokeWidth={3} />
    <polygon points={`${x + 70},${232} ${x + 70 + D.x},${232 + D.y} ${x + 70 + D.x},${272 + D.y} ${x + 70},${272}`} fill={C.accentDark} stroke={C.edge} strokeWidth={3} />
  </g>
);

type Props = {
  x: number;
  y: number;
  size?: number;
  cues?: Cue<AstroPose, AstroMood>[];
  audio?: string;
  audioStartFrame?: number;
};

const Glyph: React.FC<{ kind: "" | "!" | "?" | "spark" | "sweat" | "dots" | "anger"; t: number; frame: number }> = ({ kind, t, frame }) => {
  if (!kind) return null;
  const pop = t >= 1 ? 1 : Math.sin(Math.min(1, t) * Math.PI * 0.5) * (1 + 0.35 * Math.sin(Math.min(1, t) * Math.PI));
  const float = Math.sin(frame / 9) * 4;
  const common = { transform: `translate(0,${float}) scale(${pop})`, fill: C.rim } as const;
  if (kind === "!") return (<g transform="translate(120,-300)"><g {...common} style={{ transformOrigin: "0 0" }}><rect x={-8} y={-44} width={16} height={34} /><rect x={-8} y={0} width={16} height={14} /></g></g>);
  if (kind === "?") return (
    <g transform="translate(118,-300)">
      <g {...common} style={{ transformOrigin: "0 0" }}>
        <rect x={-16} y={-46} width={32} height={10} /><rect x={8} y={-38} width={12} height={22} /><rect x={-4} y={-18} width={14} height={10} /><rect x={-4} y={-4} width={12} height={10} /><rect x={-4} y={12} width={12} height={12} />
      </g>
    </g>
  );
  if (kind === "spark") return (
    <g transform="translate(118,-300)">
      {[0, 1, 2].map((i) => (
        <g key={i} transform={`translate(${i * 46 - 20},${-i * 20}) scale(${pop * 1.5 * (0.7 + 0.3 * Math.sin(frame / 5 + i * 2))})`} fill={i === 1 ? C.accentLight : C.rim}>
          <rect x={-3} y={-14} width={6} height={28} /><rect x={-14} y={-3} width={28} height={6} />
        </g>
      ))}
    </g>
  );
  if (kind === "dots") return (
    <g transform="translate(118,-300)">
      <g {...common} style={{ transformOrigin: "0 0" }}>
        <rect x={-40} y={-10} width={14} height={14} /><rect x={-7} y={-10} width={14} height={14} /><rect x={26} y={-10} width={14} height={14} />
      </g>
    </g>
  );
  if (kind === "anger") return (
    <g transform="translate(118,-300)">
      <g {...common} style={{ transformOrigin: "0 0" }}>
        {[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([sx, sy]) => (
          <g key={`${sx}${sy}`} transform={`scale(${sx},${sy})`}>
            <rect x={5} y={5} width={20} height={7} /><rect x={5} y={5} width={7} height={20} />
          </g>
        ))}
      </g>
    </g>
  );
  // sweat drop at the visor's upper right
  return (
    <g transform="translate(86,-246)">
      <g transform={`translate(0,${Math.max(0, (frame % 40) / 40) * 16}) scale(${pop * 1.5})`} fill={C.accentLight} style={{ transformOrigin: "0 0" }}>
        <rect x={-4} y={-18} width={8} height={8} /><rect x={-9} y={-10} width={18} height={18} /><rect x={-5} y={8} width={10} height={6} />
      </g>
    </g>
  );
};

export const Astronaut: React.FC<Props> = ({ x, y, size = 1, cues = [], audio, audioStartFrame = 0 }) => {
  const d = useDriver<AstroPose, AstroMood>(cues, "idle", "neutral", audio, audioStartFrame);
  const { frame, open } = d;
  // a touch of overshoot when a pose or mood changes, so moves feel springy
  const pt = d.poseT + 0.16 * Math.sin(d.poseT * Math.PI);
  const mt = d.moodT;
  const mixA = (a: Arm, b: Arm): Arm => mixObj(a, b, pt);
  const pose: Pose = {
    l: mixA(POSES[d.poseFrom].l, POSES[d.poseTo].l),
    r: mixA(POSES[d.poseFrom].r, POSES[d.poseTo].r),
    body: mixObj(POSES[d.poseFrom].body, POSES[d.poseTo].body, pt),
  };
  const m = mixObj(MOODS[d.moodFrom], MOODS[d.moodTo], mt);

  const bob = Math.sin((frame / 18) * m.bobSpeed) * 7 - m.hop * Math.abs(Math.sin(frame / 6)) * 22;
  const talkBounce = -open * 6;
  const limbBob = (ph: number) => bob + pose.body.drop + Math.sin(frame / 13 + ph) * 5;
  const bp = frame % 100;
  const blink = bp < 5 ? Math.abs(bp - 2.5) / 2.5 : 1;
  const eyeHL = 22 * m.eyeL * Math.max(0.1, blink) * (1 - m.lidL);
  const eyeHR = 22 * m.eyeR * Math.max(0.1, blink) * (1 - m.lidR);
  const mouthH = 8 + open * 34;
  const lit = open > 0.25;
  // head: tilt and sideways shift from the mood, plus a nod while talking and a small snap on mood change
  const nod = Math.sin(frame / 4.5) * open * 3;
  const snap = mt < 1 ? Math.sin(mt * Math.PI) * 4 : 0;
  const headRot = m.headRot + nod + snap * Math.sign(m.headRot || 1);
  const lean = m.lean + pose.body.lean + (d.poseTo === "cheer" ? Math.sin(frame / 6) * 2 : 0);

  // visor geometry (inside the helmet's front face: x -95..95, y -290..-110)
  const vx = -76;
  const vy = -266;
  const vw = 152;
  const vh = 116;
  const barY = -170;
  const corner = m.smile * 10;

  const eye = (ex: number, h: number, browY: number, tilt: number, flip: number) => (
    <g key={ex}>
      <rect x={ex - 11 + m.look * 0.4} y={-226 + (22 - h) / 2} width={22} height={Math.max(3, h)} fill={C.rim} />
      <rect x={ex - 11 + m.look * 0.4 + 12} y={-226 + (22 - h) / 2 + 2} width={6} height={6} fill="#fff" opacity={h > 10 ? 1 : 0} />
      {m.eyeL > 1.2 && h > 14 ? <rect x={ex - 11 + m.look * 0.4 + 3} y={-226 + (22 - h) / 2 + h - 9} width={5} height={5} fill="#fff" opacity={0.8} /> : null}
      <rect x={ex - 17} y={-256 + browY} width={34} height={7} fill={C.rim} transform={`rotate(${tilt * flip} ${ex} ${-252 + browY})`} />
    </g>
  );

  return (
    <svg width={900} height={900} viewBox="-450 -330 900 900" style={{ position: "absolute", left: x - 450 * size, top: y - 330 * size, transform: `scale(${size})`, transformOrigin: "450px 330px", overflow: "visible" }}>
      <ellipse cx={10} cy={318} rx={150 - Math.abs(bob) * 1.5} ry={18} fill="#000" opacity={0.28} />
      <g transform={`rotate(${lean} 0 280)`}>
        {/* legs and torso */}
        <Leg x={-78} bob={limbBob(1)} />
        <Leg x={8} bob={limbBob(2)} />
        <g transform={`translate(0,${bob + talkBounce + pose.body.drop})`}>
          <Cube x={-75} y={-98} w={150} h={190} />
          <rect x={-48} y={-66} width={96} height={66} rx={6} fill={C.accentDark} stroke={C.edge} strokeWidth={3} />
          <rect x={-38} y={-56} width={22} height={14} fill={C.accentLight} />
          <rect x={-10} y={-56} width={22} height={14} fill={lit ? C.rim : C.accent} />
          <rect x={18} y={-56} width={20} height={14} fill={C.accent} />
          <rect x={-38} y={-34} width={76} height={8} fill={C.accent} opacity={0.7} />
          <rect x={-75} y={60} width={150} height={14} fill={C.accent} stroke={C.edge} strokeWidth={3} />
        </g>
        {/* helmet */}
        <g transform={`translate(${m.headDx},${(bob + talkBounce) * 1.2 + pose.body.drop}) rotate(${headRot} 0 -110)`}>
          <Cube x={-95} y={-290} w={190} h={180} front={C.helmet} />
          {/* antenna */}
          <rect x={52} y={-322} width={14} height={34} fill={C.side} stroke={C.edge} strokeWidth={3} />
          <rect x={48} y={-340} width={22} height={20} fill={lit ? C.rim : C.accent} stroke={C.edge} strokeWidth={3} />
          {/* visor */}
          <rect x={vx - 6} y={vy - 6} width={vw + 12} height={vh + 12} rx={22} fill={C.edge} />
          <rect x={vx} y={vy} width={vw} height={vh} rx={18} fill={C.skin} />
          {/* pixel face */}
          {eye(-30, eyeHL, m.browL, m.tiltL, 1)}
          {eye(30, eyeHR, m.browR, m.tiltR, -1)}
          <rect x={-48} y={-204} width={22} height={14} fill={C.accentDark} opacity={m.blush} />
          <rect x={26} y={-204} width={22} height={14} fill={C.accentDark} opacity={m.blush} />
          {open >= 0.12 ? (
            <g>
              <rect x={-22} y={-184} width={44} height={mouthH} fill={C.mouth} stroke={C.ink} strokeWidth={4} />
              {open > 0.35 ? <rect x={-14} y={-184 + mouthH - 12} width={28} height={9} fill={C.accentDark} /> : null}
            </g>
          ) : m.grin > 0.7 ? (
            <g>
              <rect x={-26} y={-184} width={52} height={18} fill={C.mouth} stroke={C.ink} strokeWidth={4} />
              <rect x={-20} y={-182} width={40} height={6} fill="#fff" />
            </g>
          ) : m.mouthO > 0.35 ? (
            <rect x={-13} y={-186} width={26} height={22 + m.mouthO * 8} fill={C.mouth} stroke={C.ink} strokeWidth={4} />
          ) : (
            <g fill={C.rim}>
              <rect x={-20} y={barY} width={40} height={7} />
              <rect x={-28} y={barY - corner} width={8} height={7} />
              <rect x={20} y={barY - corner} width={8} height={7} />
            </g>
          )}
          {/* glass: faint tint, edge and a highlight */}
          <rect x={vx} y={vy} width={vw} height={vh} rx={18} fill={C.accent} opacity={0.1} />
          <rect x={vx} y={vy} width={vw} height={vh} rx={18} fill="none" stroke={C.accentLight} strokeWidth={4} opacity={0.9} />
          <polygon points={`${vx + 14},${vy + 8} ${vx + 52},${vy + 8} ${vx + 26},${vy + vh - 12} ${vx + 8},${vy + vh - 12}`} fill="#fff" opacity={0.18} />
          {/* collar */}
          <rect x={-95} y={-138} width={190} height={28} fill={C.accent} stroke={C.edge} strokeWidth={3} />
          <polygon points={`95,-138 ${95 + D.x},${-138 + D.y} ${95 + D.x},${-110 + D.y} 95,-110`} fill={C.accentDark} stroke={C.edge} strokeWidth={3} />
          <Glyph kind={GLYPH[d.moodTo]} t={mt} frame={frame} />
        </g>
        {/* arms are drawn last so a hand can rest on the chin or cover the visor */}
        <LimbArm x={-161} y={-90} arm={pose.l} left bob={limbBob(0)} frame={frame} ph={0} />
        <LimbArm x={99} y={-90} arm={pose.r} bob={limbBob(3)} frame={frame} ph={1.7} />
      </g>
    </svg>
  );
};


// A guest appearance. Mount it inside a <Sequence> that covers exactly the moment he is
// on screen: he slides in from the side edge, stays, and slides out again.
//   talk  = the mouth follows the narration (he "says" the line). Off = a silent reaction.
//   startAtFrame = the frame of the whole video at which this Sequence begins, so the
//   mouth reads the right part of the narration.
export const Cameo: React.FC<{
  side?: "left" | "right";
  y?: number;
  size?: number;
  talk?: boolean;
  audio?: string;
  startAtFrame?: number;
  cues?: Cue<AstroPose, AstroMood>[];
  restX?: number;
}> = ({ side = "right", y = 640, size = 0.8, talk = false, audio, startAtFrame = 0, cues = [], restX: restXProp }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const IN = 14;
  const slide = Math.min(
    interpolate(frame, [0, IN], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
    interpolate(frame, [durationInFrames - IN, durationInFrames], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
  );
  const eased = 1 - Math.pow(1 - slide, 3);
  const restX = restXProp ?? (side === "right" ? 1920 - 300 : 300);
  const offX = side === "right" ? 1920 + 200 : -200;
  const x = offX + (restX - offX) * eased;
  return <Astronaut x={x} y={y} size={size} cues={cues} audio={talk ? audio : undefined} audioStartFrame={-startAtFrame} />;
};

const MOOD_LIST: AstroMood[] = ["neutral", "happy", "surprised", "smug", "thinking", "excited", "worried", "skeptical", "determined", "deadpan", "annoyed", "dejected", "confused", "shocked", "tired"];
const POSE_LIST: AstroPose[] = ["idle", "point", "shrug", "hold", "wave", "cheer", "chin", "facepalm", "open", "crossed", "hip", "scratch", "slump"];

// Studio-only reference sheets: every mood (idle pose) and every pose (neutral mood).
const Gallery: React.FC<{ kind: "mood" | "pose" }> = ({ kind }) => {
  const items = kind === "mood" ? MOOD_LIST : POSE_LIST;
  return (
    <Stage>
      {items.map((it, i) => {
        const col = i % 5;
        const row = Math.floor(i / 5);
        const dense = items.length > 10;
        const sz = dense ? 0.42 : 0.56;
        const cx = 230 + col * 365;
        const cy = dense ? 185 + row * 345 : 290 + row * 440;
        return (
          <div key={it}>
            <Astronaut
              x={cx - 450 * (1 - sz)}
              y={cy - 330 * (1 - sz)}
              size={sz}
              cues={[kind === "mood" ? { at: 0, mood: it as AstroMood } : { at: 0, pose: it as AstroPose, mood: "neutral" }]}
            />
            <div style={{ position: "absolute", left: cx - 150, width: 300, top: cy + (dense ? 150 : 200), textAlign: "center", fontFamily: fonts.sans, fontSize: dense ? 28 : 34, fontWeight: 700, color: C.accent }}>{it}</div>
          </div>
        );
      })}
    </Stage>
  );
};

export const AstronautCompositions: React.FC = () => (
  <>
    <Composition id="C-Astronaut-Moods" component={() => <Gallery kind="mood" />} durationInFrames={90} fps={30} width={1920} height={1080} />
    <Composition id="C-Astronaut-Poses" component={() => <Gallery kind="pose" />} durationInFrames={90} fps={30} width={1920} height={1080} />
  </>
);
