// Section 2: "The idea is actually brilliant" (script v4). Local seconds; the beats follow the script's paragraphs.
import React from "react";
import { AbsoluteFill } from "remotion";
import { Astronaut } from "../../avatar/Astronaut";
import { colors } from "../../theme";
import { Background } from "../Background";
import { Beat, Check, Chip, Corner, Face, Heart, Pop, SOFT, Shopper, Stamp, T, WALL, cue, ease, lerp, narration, prog, sec, useCurrentFrame } from "./kit";
import { PITCH_INVESTORS, Investors } from "./Investors";
import { FakeSuit, SUIT } from "./Suit";

// Beat times (local seconds) follow the recorded narration, one beat per paragraph:
//  0.0 title · 4.2 everyday life · 11.5 school/work/friends · 18.3 "works for most people" ·
//  21.0 shy/busy/met everyone · 27.0 knocking on doors · 34.1 apps connect people ·
//  47.4 "a good thing" · 50.5 "the concept isn't the problem" · 54.0 corporate room
const KNOCK_AT = 27.0;
const CORP_AT = 54.0;

const CUES = [
  cue(0, "happy", "open"), // "...actually a pretty great idea."
  cue(4.4, "thinking", "chin"), // "Think about it."
  cue(18.9, "smug", "hold"), // "that works for most people."
  cue(21.0, "worried", "hold"), // "But what if you're shy?"
  cue(24.8, "dejected", "slump"), // "...already met everyone in your social circle?"
  cue(34.3, "happy", "open"), // "Dating apps give you a way to meet people..."
  cue(47.6, "excited", "open"), // "And that's a generally good thing."
  cue(50.9, "deadpan", "idle"), // "The concept isn't the problem."
];

// ---------- 2.1 your everyday life: a small circle ----------
const EverydayLife: React.FC = () => {
  const frame = useCurrentFrame();
  const ring = ease(prog(frame, 0.2, 1.4));
  // circle centre is (530, 370), radius 260. The face sits in the middle and four shoppers around it, all well inside the ring.
  const inside = [
    { x: 530, y: 205, at: 3.0 },
    { x: 365, y: 370, at: 4.2 },
    { x: 695, y: 370, at: 5.4 },
    { x: 530, y: 535, at: 6.6 },
  ];
  // everyone else: two columns left of the circle, a small grid on the right, none touching
  const outside = [
    { x: 50, y: 180 },
    { x: 150, y: 300 },
    { x: 50, y: 420 },
    { x: 940, y: 200 },
    { x: 1090, y: 200 },
    { x: 1015, y: 340 },
    { x: 940, y: 480 },
    { x: 1090, y: 480 },
  ];
  return (
    <div style={{ position: "relative", width: 1300, height: 700 }}>
      <div
        style={{
          position: "absolute",
          left: 270,
          top: 110,
          width: 520,
          height: 520,
          borderRadius: "50%",
          border: `10px dashed ${colors.ink}`,
          background: "rgba(224,42,60,0.06)",
          transform: `scale(${ring})`,
        }}
      />
      <Pop at={0.8} style={{ position: "absolute", left: 270, top: 30, width: 520, textAlign: "center" }}>
        <T size={52} weight={900}>your everyday life</T>
      </Pop>
      <Pop at={1.6} style={{ position: "absolute", left: 475, top: 315 }}>
        <Face size={110} />
      </Pop>
      {inside.map((p, i) => (
        <Pop key={i} at={p.at} style={{ position: "absolute", left: p.x - 50, top: p.y - 55 }}>
          <Shopper size={100} />
        </Pop>
      ))}
      {outside.map((o, i) => (
        <Pop key={i} at={8.2 + i * 0.12} style={{ position: "absolute", left: o.x, top: o.y, opacity: 0.35 }}>
          <Shopper size={100} />
        </Pop>
      ))}
      <Pop at={8.8} style={{ position: "absolute", left: 880, top: 90 }}>
        <T size={44} weight={700} color={colors.muted}>everyone else</T>
      </Pop>
    </div>
  );
};

// ---------- 2.2 the places you meet people ----------
const Places: React.FC = () => (
  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 36 }}>
    <div style={{ display: "flex", gap: 30, flexWrap: "wrap", justifyContent: "center" }}>
      <Chip at={0.9} size={64}>school</Chip>
      <Chip at={1.6} size={64} rot={-2}>work</Chip>
      <Chip at={2.2} size={64} rot={2}>mutual friends</Chip>
    </div>
    <Chip at={3.5} size={58} red rot={-1}>working up the courage<br />to approach someone in public</Chip>
  </div>
);

// ---------- 2.3 works for some people ----------
const WorksForSome: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 36 }}>
      <Check s={150} p={prog(frame, 0.2, 1.0)} />
      <Pop at={0.5}>
        <T size={90} weight={900}>works for most people</T>
      </Pop>
    </div>
  );
};

// ---------- 2.4 what if you're shy / busy / already met everyone ----------
const WhatIf: React.FC = () => (
  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 44 }}>
    <div style={{ display: "flex", gap: 30 }}>
      <Chip at={1.0} size={72}>shy?</Chip>
      <Chip at={1.8} size={72} rot={-2}>busy?</Chip>
    </div>
    <div style={{ display: "flex", gap: 14 }}>
      {Array.from({ length: 8 }, (_, i) => (
        <Pop key={i} at={2.9 + i * 0.25}>
          <Face size={96} fill={i % 2 ? "#C9C9D2" : undefined} eye={i % 2 ? colors.ink : undefined} />
        </Pop>
      ))}
    </div>
    <Pop at={4.7}>
      <Stamp rot={-4} size={56}>ALREADY MET</Stamp>
    </Pop>
  </div>
);

// ---------- 2.5 knocking on doors ----------
const KNOCK_CUES = [
  cue(0, "determined", "hold"),
  cue(2.3, "happy", "hold"), // flowers up
  cue(3.9, "worried", "hold"), // door slams
  cue(4.8, "deadpan", "shrug"), // "Yeah. Let's not do that."
];

const SLAM = 3.9;

const Flowers: React.FC<{ drop: number }> = ({ drop }) => (
  <svg width={80} height={120} viewBox="0 0 80 120" style={{ overflow: "visible", transform: `rotate(${drop * 70}deg)`, transformOrigin: "40px 110px" }}>
    <rect x={36} y={50} width={8} height={66} fill="#5E7A3A" stroke={colors.ink} strokeWidth={3} />
    {[
      [18, 34],
      [40, 22],
      [62, 34],
    ].map(([x, y], i) => (
      <g key={i}>
        <circle cx={x} cy={y} r={16} fill={i === 1 ? colors.redLight : colors.red} stroke={colors.ink} strokeWidth={4} />
        <circle cx={x} cy={y} r={5} fill="#F0D2B0" stroke={colors.ink} strokeWidth={2} />
      </g>
    ))}
  </svg>
);

const Knock: React.FC = () => {
  const frame = useCurrentFrame();
  const walk = ease(prog(frame, 0.4, 3.1));
  const ax = lerp(240, 1060, walk);
  // the door cracks open, then slams shut right away
  const open = ease(prog(frame, 3.2, 3.45)) * (1 - ease(prog(frame, 3.6, SLAM)));
  const shake = frame >= sec(SLAM) && frame < sec(SLAM + 0.5) ? Math.sin(frame * 2.6) * 7 : 0;
  const drop = ease(prog(frame, SLAM, SLAM + 0.7));
  return (
    <AbsoluteFill style={{ backgroundColor: WALL }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 700, bottom: 0, background: "#E6E6EC", borderTop: `8px solid ${colors.ink}` }} />
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 10, background: colors.red }} />
      {/* the house */}
      <div style={{ position: "absolute", left: 1250, top: 250, transform: `translateX(${shake}px)` }}>
        <svg width={520} height={460} viewBox="0 0 520 460" style={{ overflow: "visible" }}>
          <polygon points="10,210 260,20 510,210" fill={colors.red} stroke={colors.ink} strokeWidth={10} strokeLinejoin="round" />
          <rect x={50} y={210} width={420} height={250} fill={colors.paper} stroke={colors.ink} strokeWidth={10} />
          <rect x={90} y={250} width={90} height={80} fill={SOFT} stroke={colors.ink} strokeWidth={7} />
          <rect x={340} y={250} width={90} height={80} fill={SOFT} stroke={colors.ink} strokeWidth={7} />
          <rect x={210} y={290} width={100} height={170} fill={colors.ink} />
          {/* door leaf: swings open a crack, then slams */}
          <g transform={`translate(210 0) scale(${1 - open * 0.7} 1)`}>
            <rect x={0} y={290} width={100} height={170} fill="#7A2E1C" stroke={colors.ink} strokeWidth={7} />
            <circle cx={82} cy={380} r={7} fill={colors.ink} />
          </g>
        </svg>
        <Pop at={SLAM} style={{ position: "absolute", left: 120, top: -130 }}>
          <Stamp rot={-8} size={90}>SLAM!</Stamp>
        </Pop>
      </div>
      <Astronaut x={ax} y={500} size={0.8} cues={KNOCK_CUES} {...narration("idea", sec(KNOCK_AT))} />
      {/* flowers held in front of the chest */}
      <div style={{ position: "absolute", left: ax - 40, top: 450 + drop * 150 }}>
        <Flowers drop={drop} />
      </div>
    </AbsoluteFill>
  );
};

// ---------- 2.6 apps connect people ----------
const House: React.FC<{ label: string }> = ({ label }) => (
  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
    <svg width={230} height={210} viewBox="0 0 230 210" style={{ overflow: "visible" }}>
      <polygon points="14,100 115,12 216,100" fill={colors.red} stroke={colors.ink} strokeWidth={8} strokeLinejoin="round" />
      <rect x={34} y={100} width={162} height={100} fill={colors.paper} stroke={colors.ink} strokeWidth={8} />
      <rect x={96} y={130} width={38} height={70} fill={colors.ink} />
      <rect x={52} y={118} width={30} height={28} fill={SOFT} stroke={colors.ink} strokeWidth={5} />
      <rect x={148} y={118} width={30} height={28} fill={SOFT} stroke={colors.ink} strokeWidth={5} />
    </svg>
    <T size={34}>{label}</T>
  </div>
);

const Connect: React.FC = () => {
  const frame = useCurrentFrame();
  const line = ease(prog(frame, 1.6, 5.4));
  return (
    <div style={{ position: "relative", width: 1300, height: 640 }}>
      <Pop at={0.2} style={{ position: "absolute", left: 40, top: 90 }}>
        <House label="you" />
      </Pop>
      <Pop at={0.6} style={{ position: "absolute", right: 40, top: 90 }}>
        <House label="someone you'd never have met" />
      </Pop>
      <div style={{ position: "absolute", left: 300, top: 225, width: 540 * line, height: 12, overflow: "hidden" }}>
        <svg width={540} height={12}>
          <line x1={6} y1={6} x2={534} y2={6} stroke={colors.ink} strokeWidth={9} strokeLinecap="round" strokeDasharray="1 24" />
        </svg>
      </div>
      <Pop at={5.8} style={{ position: "absolute", left: 520, top: 90 }}>
        <Heart s={110} />
      </Pop>
      <div style={{ position: "absolute", left: 0, width: 1300, top: 430, display: "flex", flexWrap: "wrap", gap: 24, justifyContent: "center" }}>
        <Chip at={7.1} size={44}>similar interests</Chip>
        <Chip at={8.4} size={44} rot={-2}>similar goals</Chip>
        <Chip at={9.7} size={44} rot={2}>someone you enjoy talking to</Chip>
      </div>
    </div>
  );
};

// ---------- 2.7 good thing / the concept isn't the problem ----------
const GoodThing: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
      <Pop>
        <T size={110} weight={900}>a good thing.</T>
      </Pop>
      <Check s={130} p={prog(frame, 0.3, 1.0)} />
    </div>
  );
};

const ConceptFine: React.FC = () => (
  <>
    <Pop>
      <T size={96} weight={900}>the concept</T>
    </Pop>
    <Pop at={0.8}>
      <T size={96} weight={900}>
        isn't <span style={{ color: colors.red }}>the problem.</span>
      </T>
    </Pop>
  </>
);

// ---------- 2.8 corporate room: somebody has to make money ----------
const CORP_CUES = [
  cue(0, "deadpan", "idle"),
  cue(1.0, "thinking", "chin"), // "...figure out how to make money off of it."
  cue(8.4, "smug", "open"), // "And that's where things start to get interesting."
];

const Corporate: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  return (
    <AbsoluteFill style={{ backgroundColor: WALL }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 700, bottom: 0, background: "#E6E6EC", borderTop: `8px solid ${colors.ink}` }} />
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 10, background: colors.red }} />
      {/* board on the wall */}
      <div style={{ position: "absolute", left: 760, top: 110, width: 860, height: 470, background: colors.paper, border: `8px solid ${colors.ink}`, borderRadius: 14, boxShadow: `14px 14px 0 ${colors.red}` }}>
        <Pop at={0.9} style={{ position: "absolute", left: 40, top: 30 }}>
          <T size={60} weight={900}>how do we pay for this?</T>
        </Pop>
        <Pop at={4.0} style={{ position: "absolute", left: 60, top: 150 }}>
          <T size={140} weight={900} color={colors.red}>$ $ $</T>
        </Pop>
        <Pop at={5.6} style={{ position: "absolute", left: 60, top: 340 }}>
          <T size={46} weight={700} color={colors.muted}>servers · developers · moderation</T>
        </Pop>
      </div>
      <Astronaut x={480} y={500} size={0.9} cues={CORP_CUES} torsoExtra={<FakeSuit />} outfit={SUIT} {...narration("idea", sec(CORP_AT))} />
      <Investors people={PITCH_INVESTORS.map((p, i) => ({ ...p, x: 1180 + i * 150 }))} top={740} react={ease(prog(frame, 6.5, 7.1)) * (1 - ease(prog(frame, 9.0, 9.6)))} />
      <Pop at={8.5} style={{ position: "absolute", left: 120, top: 80 }}>
        <T size={46} weight={600} color={colors.muted} style={{ fontStyle: "italic", opacity: t > 0 ? 1 : 0 }}>…interesting.</T>
      </Pop>
    </AbsoluteFill>
  );
};

export const Idea: React.FC = () => (
  <AbsoluteFill>
    <Background />
    <Corner id="idea" cues={CUES} />

    <Beat from={0} to={4.2} write>
      <Pop>
        <T size={110} weight={900}>a pretty great idea.</T>
      </Pop>
    </Beat>
    <Beat from={4.2} to={11.5} was={10.2}>
      <EverydayLife />
    </Beat>
    <Beat from={11.5} to={18.3} write>
      <Places />
    </Beat>
    <Beat from={18.3} to={21.0} write>
      <WorksForSome />
    </Beat>
    <Beat from={21.0} to={KNOCK_AT}>
      <WhatIf />
    </Beat>
    <Beat from={KNOCK_AT} to={34.1} mode="full">
      <Knock />
    </Beat>
    <Beat from={34.1} to={47.4}>
      <Connect />
    </Beat>
    <Beat from={47.4} to={50.5} write>
      <GoodThing />
    </Beat>
    <Beat from={50.5} to={CORP_AT} write>
      <ConceptFine />
    </Beat>
    <Beat from={CORP_AT} to={65.2} mode="full">
      <Corporate />
    </Beat>
  </AbsoluteFill>
);
