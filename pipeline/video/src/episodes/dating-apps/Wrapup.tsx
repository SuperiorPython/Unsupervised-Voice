// Section 6, first half: "Back to the board", the commentary before the astronaut returns to the
// pitch room (see PitchRoom.tsx for the second half). Local seconds.
import React from "react";
import { AbsoluteFill } from "remotion";
import { colors, fonts } from "../../theme";
import { Background } from "../Background";
import { Beat, Card, Corner, Cross, Face, Pop, T, cue, ease, lerp, prog, useCurrentFrame } from "./kit";

const CUES = [
  cue(0, "neutral", "open"), // "So I don't think dating apps are cartoon villains..."
  cue(6.0, "determined", "hip"), // "I also don't think every bad date is the user's fault..."
  cue(12.0, "thinking", "chin"), // "I just think dating apps are a genuinely useful concept placed inside a business model..."
  cue(22.7, "skeptical", "shrug"), // "...people."
  cue(24.0, "happy", "open"), // "And sometimes those interests fit together beautifully."
  cue(27.6, "worried", "shrug"), // "Sometimes they pull in different directions."
];

const Mustache: React.FC = () => (
  <svg width={150} height={60} viewBox="0 0 150 60" style={{ overflow: "visible" }}>
    <path d="M75 20 C60 4 30 6 12 26 C6 34 14 40 22 34 C40 22 56 34 75 34 C94 34 110 22 128 34 C136 40 144 34 138 26 C120 6 90 4 75 20 Z" fill={colors.ink} />
  </svg>
);

const NotVillains: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <>
      <div style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center" }}>
        <Pop>
          <div style={{ position: "relative" }}>
            <Face size={230} label="the dating app" />
            <div style={{ position: "absolute", left: 40, top: 150 }}>
              <Mustache />
            </div>
          </div>
        </Pop>
        <div style={{ position: "absolute", left: 20, top: 0, opacity: prog(frame, 2.4, 2.6) }}>
          <Cross s={290} c={colors.red} p={prog(frame, 2.4, 3.2)} />
        </div>
      </div>
      <Pop at={1.2}>
        <T size={72} weight={900}>not a cartoon villain.</T>
      </Pop>
    </>
  );
};

const NotAllTheirFault: React.FC = () => (
  <div style={{ display: "flex", flexDirection: "column", gap: 30 }}>
    {[
      { t: "every bad date is the user's fault?", at: 0.9 },
      { t: "paying for a premium feature is immoral?", at: 3.2 },
    ].map((r) => (
      <Pop key={r.t} at={r.at}>
        <Card style={{ display: "flex", alignItems: "center", gap: 28, width: 1250 }}>
          <Cross s={80} c={colors.red} />
          <T size={56}>{r.t}</T>
        </Card>
      </Pop>
    ))}
  </div>
);

// concept inside a business model inside people
const Nest: React.FC = () => {
  const frame = useCurrentFrame();
  const a = ease(prog(frame, 3.2, 4.4));
  const b = ease(prog(frame, 6.8, 7.8));
  return (
    <div style={{ position: "relative", width: 1250, height: 760, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ position: "absolute", inset: 0, border: `8px dashed ${colors.ink}`, borderRadius: 40, opacity: b }} />
      <T size={52} color={colors.muted} style={{ position: "absolute", left: 50, top: 30, opacity: b }}>
        run by people
      </T>
      <div style={{ position: "relative", width: lerp(560, 1000, a), height: lerp(300, 520, a), border: `8px solid ${colors.ink}`, borderRadius: 30, background: "#FFF3F4", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <T size={46} color={colors.red} style={{ position: "absolute", left: 34, top: 22, opacity: a }}>
          business model (needs revenue)
        </T>
        <Pop at={1.4}>
          <Card style={{ padding: "22px 44px" }}>
            <T size={64} weight={900}>a useful idea</T>
          </Card>
        </Pop>
      </div>
    </div>
  );
};

// two circles: sometimes they line up, sometimes they pull apart
const Interests: React.FC = () => {
  const frame = useCurrentFrame();
  const gap = lerp(90, 560, ease(prog(frame, 4.0, 6.0)));
  const R = 210;
  return (
    <div style={{ position: "relative", width: 1250, height: 560 }}>
      {[
        { t: "what people want", x: 625 - gap / 2, c: colors.red },
        { t: "what the business needs", x: 625 + gap / 2, c: colors.ink },
      ].map((o) => (
        <div key={o.t} style={{ position: "absolute", left: o.x - R, top: 280 - R, width: R * 2, height: R * 2, borderRadius: "50%", background: o.c, opacity: 0.55, border: `8px solid ${colors.ink}`, boxSizing: "border-box" }} />
      ))}
      <div style={{ position: "absolute", left: 625 - gap / 2 - 150, top: 480, width: 300, textAlign: "center", opacity: prog(frame, 4.6, 5.4), fontFamily: fonts.sans, fontSize: 36, fontWeight: 800 }}>what people want</div>
      <div style={{ position: "absolute", left: 625 + gap / 2 - 160, top: 480, width: 320, textAlign: "center", opacity: prog(frame, 4.6, 5.4), fontFamily: fonts.sans, fontSize: 36, fontWeight: 800 }}>what the business needs</div>
      <Pop at={0.4} style={{ position: "absolute", left: 0, right: 0, top: 0, textAlign: "center" }}>
        <T size={56} weight={900} color={colors.red}>{frame < 4.0 * 30 ? "fit together beautifully" : "pull in different directions"}</T>
      </Pop>
    </div>
  );
};

export const Wrapup: React.FC = () => (
  <AbsoluteFill>
    <Background />
    <Corner id="wrapup" cues={CUES} />
    <Beat from={0} to={5.9}>
      <NotVillains />
    </Beat>
    <Beat from={5.9} to={11.9} write>
      <NotAllTheirFault />
    </Beat>
    <Beat from={11.9} to={23.5}>
      <Nest />
    </Beat>
    <Beat from={23.5} to={30.4}>
      <Interests />
    </Beat>
  </AbsoluteFill>
);
