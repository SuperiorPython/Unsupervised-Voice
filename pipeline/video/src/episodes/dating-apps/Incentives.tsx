// Section 4: "The part that makes the room go quiet". Local seconds.
// The argument here is about incentives, not intent: the boardroom, the warehouse and the
// "executives" are clearly labelled jokes. Keep it that way (see the script's editorial guardrails).
import React from "react";
import { AbsoluteFill } from "remotion";
import { Astronaut } from "../../avatar/Astronaut";
import { colors, fonts } from "../../theme";
import { Background } from "../Background";
import { STEP_TEXT } from "./PitchRoom";
import { BOARD_EXECS, Investors } from "./Investors";
import { FakeSuit, SUIT } from "./Suit";
import { Beat, Card, Check, Chip, Corner, Pop, SOFT, T, WALL, cue, ease, lerp, narration, prog, rnd, sec, useCurrentFrame } from "./kit";

const CUES = [
  cue(0, "thinking", "chin"), // "And this brings me back to our poor little business plan."
  cue(3.9, "determined", "point"), // "What does success actually look like for a dating app?"
  cue(8.1, "happy", "open"), // "...that's a pretty good result for that person."
  cue(18.9, "deadpan", "shrug"), // "...a departing customer is also a decrease in profits."
  cue(33.0, "neutral", "open"), // "Now before this becomes a conspiracy documentary..."
  cue(50.9, "happy", "hold"), // "A successful couple could recommend the app to friends."
  cue(61.3, "determined", "point"), // "So I'm not arguing that the company ALWAYS benefits..."
  cue(65.6, "thinking", "chin"), // "I'm just saying the business has to measure success somehow..."
  cue(81.0, "tired", "slump"), // "That's the uncomfortable little gap I keep coming back to."
];

// ---------- 4.1 what is success? ----------
const MiniPlan: React.FC = () => (
  <Card style={{ width: 1100, padding: "24px 44px" }}>
    <T size={44} weight={900} color={colors.red}>THE PERFECT DATING APP</T>
    <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 14 }}>
      {STEP_TEXT.map((t, i) => (
        <T key={t} size={40} weight={i === 4 ? 900 : 700} color={i === 4 ? colors.red : colors.ink}>
          {i + 1}. {t}
        </T>
      ))}
    </div>
  </Card>
);

const WhatIsSuccess: React.FC = () => (
  <>
    <Pop>
      <MiniPlan />
    </Pop>
    <Pop at={3.8}>
      <T size={90} weight={900}>what is success?</T>
    </Pop>
  </>
);

// ---------- 4.2 / 4.3 two points of view ----------
const ForPerson: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <Card style={{ width: 1000 }}>
      <T size={44} weight={700} color={colors.muted}>for the person</T>
      <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 14 }}>
        <Pop at={0.9}><T size={60}>wants a relationship</T></Pop>
        <Pop at={2.8}><T size={60}>finds one</T></Pop>
        <Pop at={3.8}><T size={60}>happily deletes the app</T></Pop>
      </div>
      <div style={{ position: "absolute", right: -140, top: 20 }}>
        <Check s={150} p={prog(frame, 6.0, 6.9)} />
      </div>
    </Card>
  );
};

const ForSubscription: React.FC = () => {
  const frame = useCurrentFrame();
  // the count starts dropping as the customer leaves and just keeps going down
  const lost = Math.floor(Math.max(0, frame / 30 - 4.8) * 55);
  const count = 12000 - lost;
  return (
    <Card style={{ width: 1000 }} dark>
      <T size={44} weight={700} color="#B9B9C4">for the subscription</T>
      <Pop at={4.0}><T size={60} color={colors.paper} style={{ marginTop: 14 }}>a customer leaves</T></Pop>
      <Pop at={4.3}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 26, marginTop: 20 }}>
          <T size={96} weight={900} color={colors.redLight}>{count.toLocaleString("en-US")}</T>
          <T size={44} weight={700} color="#B9B9C4">subscribers</T>
        </div>
      </Pop>
    </Card>
  );
};

// ---------- 4.4 the boardroom (a joke) ----------
const PIECES = Array.from({ length: 80 }, (_, i) => i);
const CONFETTI = [colors.red, colors.redLight, colors.ink, "#FFB3B8", "#8E1B2A"];
// section-local start of each beat that holds an astronaut (see the Beat list at the bottom)
const BOARDROOM_AT = 23.0;
const DOOR_AT = 44.3;
const FREEZE = 8.0; // the confetti stops midair here (on "accounts")
const BOARDROOM_CUES = [
  cue(0, "smug", "idle"),
  cue(0.5, "excited", "open"), // "Ladies and gentlemen, wonderful news. We helped another couple find love."
  cue(3.0, "excited", "cheer"),
  cue(6.4, "excited", "open"), // "And they deleted their accounts."
  cue(8.0, "worried", "idle"), // the confetti stops
  cue(8.9, "deadpan", "hip"),
];

const Boardroom: React.FC = () => {
  const frame = useCurrentFrame();
  const t = (Math.min(frame / 30, FREEZE) - 4.6) * 1.4; // confetti starts on "find love" and falls a bit faster
  const banner = ease(prog(frame, 8.2, 10.0));
  return (
    <AbsoluteFill style={{ backgroundColor: WALL }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 862, bottom: 0, background: "#E6E6EC", borderTop: `8px solid ${colors.ink}` }} />
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 10, background: colors.red }} />
      {/* party banner: one end gets taken down */}
      <div style={{ position: "absolute", left: 360, top: 70, width: 1200, height: 130, rotate: `${lerp(0, 14, banner)}deg`, transformOrigin: "0 0", translate: `0 ${lerp(0, 40, banner)}px` }}>
        <div style={{ width: "100%", height: "100%", background: colors.red, border: `8px solid ${colors.ink}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: fonts.sans, fontSize: 70, fontWeight: 900, letterSpacing: 4, color: colors.paper }}>
          WE HELP PEOPLE FIND LOVE
        </div>
      </div>
      {/* the executives, seen from behind: they cheer, then the confetti stops and so do they */}
      <Investors
        people={BOARD_EXECS}
        top={740}
        cheer={ease(prog(frame, 4.8, 5.4)) * (1 - ease(prog(frame, 8.0, 8.8)))}
        slump={ease(prog(frame, 8.2, 9.6))}
        react={ease(prog(frame, 8.5, 9.1)) * (1 - ease(prog(frame, 9.6, 10.0)))}
      />
      {/* lectern in front of the astronaut */}
      <Astronaut x={960} y={640} size={0.85} cues={BOARDROOM_CUES} torsoExtra={<FakeSuit />} outfit={SUIT} {...narration("incentives", sec(BOARDROOM_AT))} />
      <div style={{ position: "absolute", left: 770, top: 748, width: 380, height: 160, background: colors.paper, border: `8px solid ${colors.ink}`, borderRadius: "14px 14px 0 0" }}>
        <div style={{ position: "absolute", left: 120, top: 40, width: 140, height: 70, background: colors.red, border: `6px solid ${colors.ink}`, fontFamily: fonts.sans, fontWeight: 900, fontSize: 30, color: colors.paper, textAlign: "center", lineHeight: "58px" }}>
          Q3
        </div>
      </div>
      {/* confetti */}
      {t > 0
        ? PIECES.map((i) => {
            const delay = rnd(i, 1) * 1.6;
            const ti = Math.max(0, t - delay);
            const speed = 150 + rnd(i, 2) * 170;
            const y = -40 + ti * speed;
            const x = 140 + rnd(i, 3) * 1640 + Math.sin(ti * 3 + i) * 26;
            return (
              <div key={i} style={{ position: "absolute", left: x, top: y, width: 18, height: 30, background: CONFETTI[i % CONFETTI.length], rotate: `${ti * 220 * (rnd(i, 4) - 0.5) * 3 + i * 40}deg`, opacity: ti > 0 ? 1 : 0 }} />
            );
          })
        : null}
    </AbsoluteFill>
  );
};

// ---------- 4.5 not a conspiracy ----------
const Conspiracy: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <>
      <Card dark style={{ width: 1200, textAlign: "center", position: "relative" }}>
        <T size={34} weight={700} color="#B9B9C4" style={{ letterSpacing: 8 }}>A CONSPIRACY DOCUMENTARY</T>
        <T size={100} weight={900} color={colors.redLight} style={{ marginTop: 12 }}>THE SOULMATE WAREHOUSE</T>
        <div style={{ position: "absolute", left: 40, top: "50%", height: 12, marginTop: 20, background: colors.paper, width: `${prog(frame, 3.6, 4.6) * 94}%`, opacity: 0.9 }} />
      </Card>
      <Chip at={9.1} size={56} red>$15</Chip>
    </>
  );
};

// ---------- 4.6 the door (full) ----------
const DOOR_CUES = [
  cue(0, "smug", "point"),
  cue(1.2, "deadpan", "idle"), // the door opens
  cue(2.0, "deadpan", "shrug"), // "...a terrible way to store soulmates."
];

const Mop: React.FC = () => (
  <svg width={110} height={420} viewBox="0 0 110 420" style={{ overflow: "visible" }}>
    <rect x={50} y={0} width={10} height={300} fill="#D8B98A" stroke={colors.ink} strokeWidth={4} />
    <path d="M10 300 L100 300 L110 410 L0 410 Z" fill={SOFT} stroke={colors.ink} strokeWidth={5} strokeLinejoin="round" />
    {[20, 40, 55, 70, 90].map((x) => (
      <line key={x} x1={x} y1={316} x2={x} y2={404} stroke={colors.muted} strokeWidth={4} />
    ))}
  </svg>
);

const FoldingChair: React.FC = () => (
  <svg width={190} height={300} viewBox="0 0 190 300" style={{ overflow: "visible" }}>
    <path d="M40 150 L40 20 L150 20 L150 150 Z" fill="none" stroke="#B9B9C4" strokeWidth={9} strokeLinejoin="round" />
    <rect x={30} y={150} width={130} height={22} fill="#B9B9C4" stroke={colors.ink} strokeWidth={4} />
    <path d="M44 172 L144 290 M146 172 L46 290" stroke="#B9B9C4" strokeWidth={9} strokeLinecap="round" />
  </svg>
);

const DoorScene: React.FC = () => {
  const frame = useCurrentFrame();
  const open = ease(prog(frame, 0.4, 1.6));
  return (
    <AbsoluteFill style={{ backgroundColor: WALL }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 862, bottom: 0, background: "#E6E6EC", borderTop: `8px solid ${colors.ink}` }} />
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 10, background: colors.red }} />
      <Astronaut x={520} y={650} size={0.8} cues={DOOR_CUES} torsoExtra={<FakeSuit />} outfit={SUIT} {...narration("incentives", sec(DOOR_AT))} />
      <div style={{ position: "absolute", left: 1060, top: 250, width: 520, perspective: 1400 }}>
        <div style={{ position: "relative", width: 520, height: 612 }}>
          {/* inside the closet */}
          <div style={{ position: "absolute", inset: 0, background: "#16161B", border: `10px solid ${colors.ink}`, display: "flex", alignItems: "flex-end", justifyContent: "space-around", padding: "0 30px 0", boxSizing: "border-box", overflow: "hidden" }}>
            <div style={{ position: "absolute", left: 250, top: 0, width: 6, height: 70, background: colors.muted }} />
            <div style={{ position: "absolute", left: 226, top: 66, width: 54, height: 54, borderRadius: "50%", background: "#FFE9A8", boxShadow: "0 0 80px 30px rgba(255,233,168,0.45)" }} />
            <Mop />
            <FoldingChair />
          </div>
          {/* the door itself, hinged on the left */}
          <div style={{ position: "absolute", inset: 0, background: colors.paper, border: `10px solid ${colors.ink}`, transformOrigin: "0 50%", transform: `rotateY(${-open * 112}deg)`, boxSizing: "border-box", backfaceVisibility: "hidden" }}>
            <div style={{ position: "absolute", right: 36, top: 290, width: 30, height: 30, borderRadius: "50%", background: colors.ink }} />
            <div style={{ position: "absolute", left: 40, top: 60, right: 40, height: 140, border: `6px solid ${colors.ink}`, background: "#FFF3F4", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: fonts.sans, fontWeight: 900, fontSize: 36, textAlign: "center", color: colors.red, lineHeight: 1.1, padding: 10, boxSizing: "border-box" }}>
              SOULMATES — AUTHORIZED PERSONNEL ONLY
            </div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ---------- 4.7 word of mouth ----------
const Loop: React.FC = () => {
  const frame = useCurrentFrame();
  const nodes = [
    { t: "happy couple", at: 0.7 },
    { t: "tells friends", at: 2.1 },
    { t: "new users", at: 4.2 },
    { t: "the app", at: 6.8 },
  ];
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
      {nodes.map((n, i) => (
        <React.Fragment key={n.t}>
          <Pop at={n.at}>
            <Card style={{ padding: "22px 28px", background: i === 3 ? colors.red : colors.paper, color: i === 3 ? colors.paper : colors.ink }}>
              <T size={44}>{n.t}</T>
            </Card>
          </Pop>
          {i < 3 ? (
            <T size={64} color={colors.red} style={{ opacity: prog(frame, n.at + 0.8, n.at + 1.2) }}>→</T>
          ) : null}
        </React.Fragment>
      ))}
    </div>
  );
};

const NotAlways: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <>
      <div style={{ position: "relative" }}>
        <Pop at={0.1}>
          <T size={64} weight={800} style={{ textAlign: "center" }}>
            the company <span style={{ color: colors.red, fontWeight: 900 }}>ALWAYS</span> wins
          </T>
        </Pop>
        <Pop at={1.5}>
          <T size={64} weight={800} style={{ textAlign: "center" }}>when people fail</T>
        </Pop>
        <div style={{ position: "absolute", left: 0, right: 0, top: "27%", height: 12, background: colors.red, width: `${prog(frame, 2.9, 3.6) * 100}%` }} />
      </div>
    </>
  );
};

// ---------- 4.8 what's easy to count ----------
const Gauge: React.FC<{ label: string; at: number; v: number }> = ({ label, at, v }) => {
  const frame = useCurrentFrame();
  const w = ease(prog(frame, at + 0.3, at + 1.4)) * v;
  return (
    <Pop at={at}>
      <div style={{ display: "flex", alignItems: "center", gap: 30 }}>
        <T size={48} style={{ width: 330 }}>{label}</T>
        <div style={{ width: 560, height: 44, border: `6px solid ${colors.ink}`, borderRadius: 12, overflow: "hidden", background: colors.paper }}>
          <div style={{ width: `${w * 100}%`, height: "100%", background: colors.red }} />
        </div>
      </div>
    </Pop>
  );
};

const EasyToCount: React.FC = () => (
  <>
    <T size={60} weight={900}>what's easy to count</T>
    <Card style={{ display: "flex", flexDirection: "column", gap: 26, width: 1100 }}>
      <Gauge label="subscriptions" at={5.3} v={0.8} />
      <Gauge label="activity" at={6.8} v={0.9} />
      <Gauge label="time in the app" at={8.0} v={0.7} />
    </Card>
    <Pop at={11.2}>
      <T size={48} color={colors.muted} weight={700}>≠ what a person hopes for</T>
    </Pop>
  </>
);

// ---------- 4.9 the gap ----------
const Dashboard: React.FC = () => {
  const frame = useCurrentFrame();
  const users = Math.round(lerp(11200, 12000, ease(prog(frame, 0.4, 2.4))));
  return (
    <div style={{ display: "flex", gap: 40 }}>
      <Pop>
        <Card style={{ width: 600, textAlign: "center" }}>
          <T size={38} weight={700} color={colors.muted}>USERS ONLINE</T>
          <T size={120} weight={900}>{users.toLocaleString("en-US")}</T>
        </Card>
      </Pop>
      <Pop at={2.2}>
        <Card style={{ width: 600, textAlign: "center" }}>
          <T size={38} weight={700} color={colors.muted}>TRUE LOVE</T>
          <T size={110} weight={900} color={colors.red}>¯\_(ツ)_/¯</T>
        </Card>
      </Pop>
    </div>
  );
};

export const Incentives: React.FC = () => (
  <AbsoluteFill>
    <Background />
    <Corner id="incentives" cues={CUES} />

    <Beat from={0} to={7.7}>
      <WhatIsSuccess />
    </Beat>
    <Beat from={7.7} to={15.2} write>
      <ForPerson />
    </Beat>
    <Beat from={15.2} to={BOARDROOM_AT}>
      <ForSubscription />
    </Beat>
    <Beat from={BOARDROOM_AT} to={33.0} mode="full">
      <Boardroom />
    </Beat>
    <Beat from={33.0} to={DOOR_AT}>
      <Conspiracy />
    </Beat>
    <Beat from={DOOR_AT} to={50.7} mode="full">
      <DoorScene />
    </Beat>
    <Beat from={50.7} to={61.1}>
      <Loop />
    </Beat>
    <Beat from={61.1} to={65.5} write>
      <NotAlways />
    </Beat>
    <Beat from={65.5} to={79.5}>
      <EasyToCount />
    </Beat>
    <Beat from={79.5} to={86.3}>
      <Dashboard />
    </Beat>
  </AbsoluteFill>
);
