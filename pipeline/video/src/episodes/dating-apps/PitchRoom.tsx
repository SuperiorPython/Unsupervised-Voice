// The pitch meeting: the opening of the video and its closing. Same room, same board, same
// chair, so the ending lands as a callback. All times are seconds local to the section.
import React from "react";
import { AbsoluteFill, Sequence, useCurrentFrame } from "remotion";
import { Astronaut } from "../../avatar/Astronaut";
import { colors, fonts } from "../../theme";
import { Background } from "../Background";
import { PITCH_INVESTORS, Investors } from "./Investors";
import { FakeSuit, SUIT } from "./Suit";
import { Check, Pop, T, WALL, cue, ease, lerp, narration, prog, sec } from "./kit";

export const FLOOR_Y = 862;
export const BOARD = { left: 940, top: 110, w: 900, h: 620 };
const ROW0 = 150; // first step's top, inside the board
const ROW_H = 84;
const TEXT_LEFT = 104;

export const STEP_TEXT = [
  "find people who want a relationship",
  "introduce them to each other",
  "they meet somebody they like",
  "they fall in love",
  "they delete the app and never come back",
] as const;

// ---------- the room ----------
const Clock: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <div style={{ position: "absolute", left: 150, top: 80, width: 130, height: 130, borderRadius: "50%", background: colors.paper, border: `8px solid ${colors.ink}` }}>
      <div style={{ position: "absolute", left: 57, top: 20, width: 8, height: 46, background: colors.ink, borderRadius: 4, transformOrigin: "4px 38px", rotate: `${frame * 0.5}deg` }} />
      <div style={{ position: "absolute", left: 58, top: 36, width: 6, height: 30, background: colors.red, borderRadius: 3, transformOrigin: "3px 22px", rotate: `${frame * 0.04}deg` }} />
    </div>
  );
};

const Room: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const frame = useCurrentFrame();
  // a cheap fluorescent tube that flickers once or twice
  const flick = [41, 43, 97, 98, 213].includes(frame % 240) ? 0.35 : 1;
  return (
    <AbsoluteFill style={{ backgroundColor: WALL }}>
      <div style={{ position: "absolute", left: 520, top: 0, width: 760, height: 26, background: colors.paper, border: `6px solid ${colors.ink}`, borderTop: "none", borderRadius: "0 0 12px 12px", opacity: flick }} />
      <Clock />
      <div style={{ position: "absolute", left: 0, right: 0, top: FLOOR_Y, bottom: 0, background: "#E6E6EC", borderTop: `8px solid ${colors.ink}` }} />
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 10, background: colors.red }} />
      {children}
    </AbsoluteFill>
  );
};

// ---------- the board ----------
const Pen: React.FC = () => (
  <div style={{ position: "absolute", left: 0, top: 30, width: 0, height: 0 }}>
    <div style={{ position: "absolute", left: -4, top: -4, width: 84, height: 22, background: colors.red, border: `4px solid ${colors.ink}`, borderRadius: 6, rotate: "-38deg", transformOrigin: "4px 50%" }} />
  </div>
);

const Eraser: React.FC = () => (
  <div style={{ position: "absolute", left: -46, top: 4, width: 92, height: 62, background: colors.ink, border: `5px solid ${colors.ink}`, borderRadius: 8, boxShadow: `0 10px 0 ${colors.red} inset` }} />
);

type RowProps = {
  i: number;
  text: string;
  reveal: number;
  erase?: number;
  ghost?: number;
  color?: string;
  size?: number;
  weight?: number;
  under?: [number, number];
  badge?: string;
};

const Row: React.FC<RowProps> = ({ i, text, reveal, erase = 0, ghost = 0, color = colors.ink, size = 32, weight = 800, under, badge }) => {
  const top = ROW0 + i * ROW_H;
  const writing = reveal > 0.001 && reveal < 0.999;
  const erasing = erase > 0.001 && erase < 0.999;
  return (
    <>
      {badge ? (
        <div
          style={{
            position: "absolute",
            left: 28,
            top: top + 14,
            width: 48,
            height: 48,
            borderRadius: "50%",
            border: `5px solid ${colors.ink}`,
            background: colors.paper,
            fontFamily: fonts.sans,
            fontWeight: 900,
            fontSize: 26,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            opacity: (reveal > 0.001 ? 1 : 0) * (1 - Math.min(1, erase * 6)),
          }}
        >
          {badge}
        </div>
      ) : null}
      <div style={{ position: "absolute", left: TEXT_LEFT, top, height: ROW_H, display: "flex", alignItems: "center" }}>
        <div style={{ position: "relative", width: "fit-content" }}>
          {ghost > 0 ? (
            <div style={{ position: "absolute", left: 0, top: 0, fontFamily: fonts.sans, fontSize: size, fontWeight: weight, whiteSpace: "nowrap", color: colors.ink, opacity: 0.09 * ghost, filter: "blur(2px)" }}>{text}</div>
          ) : null}
          <div
            style={{
              fontFamily: fonts.sans,
              fontSize: size,
              fontWeight: weight,
              whiteSpace: "nowrap",
              color,
              clipPath: `inset(-12px ${(1 - reveal) * 100}% -12px ${erase * 100}%)`,
            }}
          >
            {text}
          </div>
          {writing ? (
            <div style={{ position: "absolute", left: `${reveal * 100}%`, top: 8 }}>
              <Pen />
            </div>
          ) : null}
          {erasing ? (
            <div style={{ position: "absolute", left: `${erase * 100}%`, top: -8 }}>
              <Eraser />
            </div>
          ) : null}
          {under ? (
            <svg width="100%" height={28} viewBox="0 0 200 28" preserveAspectRatio="none" style={{ position: "absolute", left: 0, bottom: -6, overflow: "visible" }}>
              <path d="M2 12 C 50 4, 120 18, 198 7" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - under[0]} opacity={under[0] > 0.001 ? 1 : 0} stroke={colors.red} strokeWidth={6} fill="none" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
              <path d="M8 23 C 60 15, 130 25, 194 16" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - under[1]} opacity={under[1] > 0.001 ? 1 : 0} stroke={colors.red} strokeWidth={6} fill="none" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
            </svg>
          ) : null}
        </div>
      </div>
    </>
  );
};

type BoardProps = {
  title: number;
  steps: [number, number, number, number, number];
  erase5?: number;
  ghost5?: number;
  rewrite?: number;
  under?: [number, number];
  check?: number;
};

const Board: React.FC<BoardProps> = ({ title, steps, erase5 = 0, ghost5 = 0, rewrite = 0, under, check = 0 }) => (
  <>
    <div style={{ position: "absolute", left: BOARD.left, top: BOARD.top, width: BOARD.w, height: BOARD.h, background: colors.paper, border: `10px solid ${colors.ink}`, borderRadius: 16, boxShadow: `14px 14px 0 ${colors.red}`, boxSizing: "border-box" }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 26, display: "flex", justifyContent: "center" }}>
        <div style={{ fontFamily: fonts.sans, fontSize: 50, fontWeight: 900, letterSpacing: 3, color: colors.red, whiteSpace: "nowrap", clipPath: `inset(-10px ${(1 - title) * 100}% -10px 0)` }}>THE PERFECT DATING APP</div>
      </div>
      {STEP_TEXT.map((t, i) =>
        i < 4 ? (
          <Row key={i} i={i} text={t} reveal={steps[i]} badge={String(i + 1)} />
        ) : (
          <Row key={i} i={i} text={t} reveal={steps[4]} erase={erase5} ghost={ghost5} badge="5" />
        ),
      )}
      {rewrite > 0 ? <Row i={4} text="THEY DELETE THE APP." reveal={rewrite} color={colors.red} size={38} weight={900} under={under} badge="5" /> : null}
      <div style={{ position: "absolute", left: 650, top: 240, opacity: check > 0.001 ? 1 : 0 }}>
        <Check s={190} p={check} />
      </div>
    </div>
    <div style={{ position: "absolute", left: BOARD.left + 50, top: BOARD.top + BOARD.h + 6, width: BOARD.w - 100, height: 24, background: colors.ink, borderRadius: "0 0 10px 10px" }} />
  </>
);

// ---------- 1. the opening ----------
// Local seconds. Narration lines are noted where they sit so the beats can be re-timed against a recording.
const OPEN_ROOM_END = 30.7; // the cut to camera, just before "Because I just realized..."
const OPEN_CUES = [
  cue(0, "smug", "idle"),
  cue(0.9, "smug", "hip"), // "Okay, everyone, hear me out. I have just invented the perfect app idea."
  cue(5.5, "happy", "point"), // "Alright, so step one..." through step five
  cue(25.3, "smug", "hip"), // check mark, proud step back
  cue(26.0, "confused", "chin"), // looks at step five
  cue(26.8, "thinking", "chin"), // looks at the investors: "Um,"
  cue(27.5, "shocked", "open"), // looks back at step five
  cue(28.1, "determined", "point"), // goes to erase it: "we'll workshop..."
  cue(30.1, "deadpan", "shrug"), // "...that last part."
];

const PitchOpenRoom: React.FC = () => {
  const frame = useCurrentFrame();
  const p = (a: number, b: number) => prog(frame, a, b);
  const x = lerp(-240, 600, ease(p(0.2, 2.8))) + lerp(0, -80, ease(p(25.3, 26.6))) + lerp(0, 220, ease(p(27.9, 28.7)));
  return (
    <Room>
      <Investors people={PITCH_INVESTORS} top={740} react={ease(p(26.6, 27.2)) * (1 - ease(p(27.9, 28.5)))} />
      <Board
        title={p(3.0, 4.8)}
        steps={[p(6.9, 8.9), p(9.8, 12.8), p(14.5, 17.0), p(18.0, 19.7), p(22.0, 24.8)]}
        erase5={ease(p(28.6, 30.6))}
        ghost5={ease(p(28.6, 30.6))}
        check={p(25.3, 26.1)}
      />
      <Astronaut x={x} y={650} size={0.8} cues={OPEN_CUES} torsoExtra={<FakeSuit />} outfit={SUIT} {...narration("pitch")} />
    </Room>
  );
};

// "Cut. Astronaut looks directly into camera."
const CAMERA_CUES = [
  cue(0, "deadpan", "idle"),
  cue(3.8, "thinking", "chin"), // "...doing your job"
  cue(5.3, "worried", "open"), // "really, really well"
  cue(6.6, "dejected", "slump"), // "means your customers leave."
];

const PitchCamera: React.FC = () => (
  <AbsoluteFill>
    <Background astroX={1480} astroY={700} />
    <div style={{ position: "absolute", left: 140, top: 250, display: "flex", flexDirection: "column", gap: 26 }}>
      <Pop at={3.7}>
        <T size={78} weight={800}>do your job really well</T>
      </Pop>
      <Pop at={6.5}>
        <T size={132} color={colors.red} weight={900}>customers leave.</T>
      </Pop>
    </div>
    <Astronaut x={1560} y={628} size={1} cues={CAMERA_CUES} torsoExtra={<FakeSuit />} outfit={SUIT} {...narration("pitch", sec(OPEN_ROOM_END))} />
  </AbsoluteFill>
);

export const PitchOpen: React.FC = () => (
  <>
    <Sequence durationInFrames={sec(OPEN_ROOM_END)}>
      <PitchOpenRoom />
    </Sequence>
    <Sequence from={sec(OPEN_ROOM_END)}>
      <PitchCamera />
    </Sequence>
  </>
);

// ---------- 6b. the closing ----------
const CLOSE_CUES = [
  cue(0, "thinking", "chin"), // "Because if the goal is to help somebody find a person they don't want to swipe past..."
  cue(5.6, "skeptical", "chin"), // "...something a little strange about celebrating how long they keep swiping."
  cue(9.7, "determined", "point"), // picks up the marker, rewrites step five
  cue(11.8, "smug", "hip"), // "Actually, no, I'm keeping that step."
  cue(13.8, "thinking", "idle"), // faces the investors
  cue(16.5, "deadpan", "shrug"), // "...never getting invited to another investor meeting."
  cue(21.8, "deadpan", "idle"), // looks at the camera
];

export const PitchClose: React.FC = () => {
  const frame = useCurrentFrame();
  const p = (a: number, b: number) => prog(frame, a, b);
  const x = 600 + lerp(0, 100, ease(p(19.4, 21.4)));
  const signOn = frame >= sec(20.8);
  const flicker = 0.78 + 0.22 * Math.sin(frame / 3);
  return (
    <Room>
      <Investors people={PITCH_INVESTORS} top={740} react={ease(p(16.9, 17.5)) * (1 - ease(p(19.2, 19.8)))} />
      <Board
        title={1}
        steps={[1, 1, 1, 1, 1]}
        erase5={1}
        ghost5={frame >= sec(9.8) ? 0 : 1}
        rewrite={p(9.8, 11.4)}
        under={[p(11.5, 12.0), p(12.1, 12.6)]}
      />
      {signOn ? (
        <div style={{ position: "absolute", left: BOARD.left + 120, top: 30, opacity: flicker }}>
          <Pop at={20.8}>
            <div style={{ fontFamily: fonts.sans, fontSize: 44, fontWeight: 900, letterSpacing: 3, color: colors.paper, background: colors.red, border: `8px solid ${colors.ink}`, borderRadius: 14, padding: "10px 30px", whiteSpace: "nowrap", boxShadow: `0 0 50px 8px rgba(214,40,57,0.45)` }}>
              YOUR FREE TRIAL HAS ENDED
            </div>
          </Pop>
        </div>
      ) : null}
      <Astronaut x={x} y={650} size={0.8} cues={CLOSE_CUES} torsoExtra={<FakeSuit />} outfit={SUIT} {...narration("close")} />
      <AbsoluteFill style={{ backgroundColor: "#000", opacity: p(23.0, 23.8) }} />
    </Room>
  );
};
