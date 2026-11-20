// Section 5: "Unfortunately, we are also in the app". Local seconds.
// This is where the video keeps its balance: users have expectations and habits of their own.
// The therapist joke is a boundary, not a diagnosis: no jokes about specific people's mental health.
import React from "react";
import { AbsoluteFill } from "remotion";
import { colors, fonts } from "../../theme";
import { Background } from "../Background";
import { Beat, Card, Check, Chip, Corner, Cross, Face, Heart, Pop, SOFT, Shopper, T, cue, ease, lerp, prog, rnd, sec, useCurrentFrame } from "./kit";

const CUES = [
  cue(0, "neutral", "hold"), // "And here's where I have to be fair..."
  cue(6.4, "smug", "open"), // "They made the app, but we brought the personalities."
  cue(9.9, "thinking", "open"), // "Some people have different expectations..."
  cue(19.9, "determined", "open"), // "...the requirements document is 47 pages too long." unrolls the checklist
  cue(24.3, "deadpan", "idle"), // "Sometimes you get a match and then spend three business days..."
  cue(34.6, "annoyed", "facepalm"), // "...overthink the punctuation until the phone became an archaeological artifact."
  cue(37.8, "dejected", "hip"), // "This one is essentially on us."
  cue(40.1, "worried", "open"), // "...I'd be trying to psychoanalyze everyone in society..."
  cue(50.9, "skeptical", "shrug"), // "...I'm no therapist." glances at the certificate
  cue(52.3, "neutral", "point"), // "All I'm saying is, software can introduce two people."
  cue(63.3, "happy", "open"), // "A match is simply an introduction, but it's not an ending."
];

// ---------- 5.1 who brought what ----------
const WhoBroughtWhat: React.FC = () => (
  <div style={{ display: "flex", gap: 60, alignItems: "stretch" }}>
    <Pop at={0.3}>
      <Card style={{ width: 560, textAlign: "center" }}>
        <T size={40} weight={700} color={colors.muted}>they made</T>
        <T size={80} weight={900} color={colors.red}>the app</T>
      </Card>
    </Pop>
    <Pop at={1.5}>
      <Card style={{ width: 560, textAlign: "center" }}>
        <T size={40} weight={700} color={colors.muted}>we brought</T>
        <T size={56} weight={900}>the personalities</T>
        <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 8 }}>
          <Shopper size={56} />
          <Face size={56} />
          <Shopper size={56} />
        </div>
      </Card>
    </Pop>
  </div>
);

const Fair: React.FC = () => (
  <>
    <Pop>
      <T size={92} weight={900} style={{ textAlign: "center" }}>fair is fair.</T>
    </Pop>
    <Pop at={2.0}>
      <T size={54} weight={700} color={colors.muted} style={{ textAlign: "center", maxWidth: 880 }}>
        the companies didn't invent every dating problem
      </T>
    </Pop>
  </>
);

// ---------- 5.2 different people, different wants ----------
const Wants: React.FC = () => (
  <div style={{ display: "flex", flexWrap: "wrap", gap: 28, justifyContent: "center", maxWidth: 1250 }}>
    <Chip at={1.2} size={58}>expectations</Chip>
    <Chip at={2.6} size={58} rot={-2}>intentions</Chip>
    <Chip at={4.5} size={58} rot={2}>effort</Chip>
    <Chip at={6.2} size={58} rot={-1}>not sure yet ?</Chip>
    <Chip at={8.4} size={58} red>knows exactly</Chip>
  </div>
);

// ---------- 5.3 the 47 page requirements doc ----------
const REQS = ["emotionally available", "has a plan for Saturday", "texts back within 4 minutes", "also hates small talk", "likes my dog", "knows what they want", "goes outside (sometimes)", "good at banter", "reads the whole bio"];
const Checklist: React.FC = () => {
  const frame = useCurrentFrame();
  const grow = ease(prog(frame, 0.2, 2.0));
  const roll = ease(prog(frame, 2.6, 5.3));
  const H = 2000;
  // a long paper hangs down from the top edge, reads top to bottom, then keeps rolling down and out of frame
  return (
    <div style={{ position: "absolute", left: 880, top: 30, width: 780, height: H, translate: `0 ${roll * (H + 100)}px` }}>
      <div style={{ width: "100%", height: H * grow, overflow: "hidden", background: colors.paper, border: `8px solid ${colors.ink}`, borderTop: "none", boxShadow: `10px 10px 0 ${colors.red}`, boxSizing: "border-box" }}>
        <div style={{ padding: "26px 36px", display: "flex", flexDirection: "column", gap: 30 }}>
          <T size={40} color={colors.red} weight={900} style={{ whiteSpace: "nowrap" }}>REQUIREMENTS · PAGE 1 OF 47</T>
          {REQS.concat(REQS).concat(REQS).map((r, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 18 }}>
              <div style={{ width: 40, height: 40, flexShrink: 0, border: `6px solid ${colors.ink}` }} />
              <T size={44} weight={700} style={{ whiteSpace: "nowrap" }}>{r}</T>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ---------- 5.4 three business days of "hey" ----------
const mix = (a: number[], b: number[], t: number) => a.map((v, i) => Math.round(lerp(v, b[i], t)));

const HeyWindow: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / 30; // seconds into this beat
  const DAY = 3.6;
  const d = t / DAY; // days elapsed
  const night = (1 - Math.cos(d * Math.PI * 2)) / 2;
  const sky = mix([243, 243, 248], [31, 31, 43], night);
  const ang = d * Math.PI * 2;
  const sunY = 190 - Math.cos(ang) * 190;
  const moonY = 190 + Math.cos(ang) * 190;
  const dayNo = Math.min(6, 1 + Math.floor(d));
  const stalk = ease(prog(frame, 4.0, 19.0));
  const caret = Math.floor(frame / 15) % 2 === 0;
  const punct = ["hey", "hey.", "hey!", "hey?", "hey..."];
  const text = t > 12 ? punct[Math.floor((t - 12) / 1.6) % punct.length] : "hey";
  return (
    <Card style={{ width: 1300, height: 760, padding: 0, position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, background: `rgb(${sky[0]},${sky[1]},${sky[2]})` }} />
      <div style={{ position: "absolute", left: 560, top: sunY, width: 120, height: 120, borderRadius: "50%", background: colors.red, border: `6px solid ${colors.ink}` }} />
      <div style={{ position: "absolute", left: 760, top: moonY, width: 96, height: 96, borderRadius: "50%", background: colors.paper, border: `6px solid ${colors.ink}` }} />
      <div style={{ position: "absolute", left: 26, top: 22, fontFamily: fonts.sans, fontSize: 56, fontWeight: 900, color: night > 0.5 ? colors.paper : colors.ink }}>
        day {dayNo}
      </div>
      {/* desk */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 520, bottom: 0, background: "#D8B98A", borderTop: `8px solid ${colors.ink}` }} />
      {/* phone */}
      <div style={{ position: "absolute", left: 540, top: 300, width: 230, height: 360, border: `8px solid ${colors.ink}`, borderRadius: 30, background: colors.paper, boxSizing: "border-box" }}>
        <div style={{ position: "absolute", left: 14, right: 14, bottom: 22, height: 56, border: `4px solid ${colors.ink}`, borderRadius: 14, display: "flex", alignItems: "center", paddingLeft: 12, fontFamily: fonts.sans, fontSize: 30, fontWeight: 700 }}>
          {text}
          <span style={{ display: "inline-block", width: 3, height: 32, background: colors.red, marginLeft: 3, opacity: caret ? 1 : 0 }} />
        </div>
        <div style={{ position: "absolute", left: 18, top: 28, width: 120, height: 36, borderRadius: 14, background: SOFT, border: `4px solid ${colors.ink}` }} />
      </div>
      {/* the plant that grows through the desk */}
      <div style={{ position: "absolute", left: 930, top: 520 - 320 * stalk, width: 18, height: 320 * stalk + 60, background: "#5E7A3A", border: `4px solid ${colors.ink}`, boxSizing: "border-box" }}>
        {[0.25, 0.5, 0.75].map((h, i) =>
          stalk > h ? (
            <div key={i} style={{ position: "absolute", top: 20 + i * 70, left: i % 2 ? 10 : -64, width: 74, height: 36, borderRadius: i % 2 ? "0 40px 40px 0" : "40px 0 0 40px", background: "#7A9A4A", border: `4px solid ${colors.ink}`, boxSizing: "border-box" }} />
          ) : null,
        )}
      </div>
      {/* the phone becomes an artifact */}
      <div style={{ position: "absolute", right: 26, top: 22, opacity: prog(frame, 14.0, 14.8) }}>
        <div style={{ background: colors.paper, border: `6px solid ${colors.ink}`, padding: "12px 24px", fontFamily: fonts.sans }}>
          <div style={{ fontSize: 30, fontWeight: 900 }}>ARTIFACT No. 1</div>
          <div style={{ fontSize: 28, fontWeight: 600, color: colors.muted }}>mobile phone, c. 2026. contents: "hey" (unsent)</div>
        </div>
      </div>
    </Card>
  );
};

// ---------- 5.5 not a therapist ----------
const Crowd: React.FC = () => (
  <div style={{ display: "grid", gridTemplateColumns: "repeat(8, 1fr)", gap: 16 }}>
    {Array.from({ length: 24 }, (_, i) => (
      <Pop key={i} at={1.8 + rnd(i, 7) * 4.0}>
        {i % 3 === 0 ? <Face size={96} /> : <Shopper size={96} />}
      </Pop>
    ))}
  </div>
);

const Certificate: React.FC = () => (
  <Pop at={0.2}>
    <div style={{ width: 1000, padding: 20, background: colors.paper, border: `10px solid ${colors.ink}`, boxShadow: `14px 14px 0 ${colors.red}`, rotate: "-2deg" }}>
      <div style={{ border: `5px solid ${colors.red}`, padding: "26px 40px", textAlign: "center", fontFamily: fonts.sans }}>
        <div style={{ fontSize: 34, fontWeight: 700, letterSpacing: 10, color: colors.muted }}>CERTIFICATE OF</div>
        <div style={{ fontSize: 86, fontWeight: 900, color: colors.red, lineHeight: 1 }}>ABSOLUTELY</div>
        <div style={{ fontSize: 86, fontWeight: 900, lineHeight: 1 }}>NOT QUALIFIED</div>
        <div style={{ fontSize: 28, fontWeight: 600, color: colors.muted, marginTop: 16 }}>(signed: some guy)</div>
      </div>
    </div>
  </Pop>
);

// ---------- 5.6 what software can't do ----------
const CanCant: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <div style={{ display: "flex", gap: 40 }}>
      <Pop at={0.3}>
        <Card style={{ width: 500 }}>
          <T size={44} weight={900} color={colors.red}>software can</T>
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 18 }}>
            <Check s={44} />
            <T size={40}>introduce two people</T>
          </div>
        </Card>
      </Pop>
      <Card style={{ width: 760 }}>
        <Pop at={2.6}><T size={44} weight={900}>it can't</T></Pop>
        <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 18 }}>
          {[
            { t: "do the conversation for them", at: 3.4 },
            { t: "create mutual attraction", at: 5.2 },
            { t: "guarantee honesty or effort", at: 8.4 },
          ].map((r) => (
            <Pop key={r.t} at={r.at}>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <div style={{ opacity: frame >= sec(r.at) ? 1 : 0 }}>
                  <Cross s={40} c={colors.red} />
                </div>
                <T size={40} style={{ maxWidth: 440 }}>{r.t}</T>
              </div>
            </Pop>
          ))}
        </div>
      </Card>
    </div>
  );
};

// ---------- 5.7 a match is an introduction ----------
const Intro: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <>
      <Pop>
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <Heart s={110} />
          <T size={120} weight={900} color={colors.red}>IT'S A MATCH!</T>
        </div>
      </Pop>
      <Pop at={1.0}>
        <T size={72} weight={800}>= an introduction</T>
      </Pop>
      <Pop at={2.6}>
        <div style={{ position: "relative" }}>
          <T size={72} weight={800}>not an ending</T>
          <div style={{ position: "absolute", left: -10, right: -10, top: "56%", height: 10, background: colors.red, width: `${prog(frame, 3.9, 4.5) * 108}%` }} />
        </div>
      </Pop>
    </>
  );
};

export const Expectations: React.FC = () => (
  <AbsoluteFill>
    <Background />
    <Corner id="expectations" cues={CUES} />

    <Beat from={0} to={6.2} write>
      <Fair />
    </Beat>
    <Beat from={6.2} to={9.7} write>
      <WhoBroughtWhat />
    </Beat>
    <Beat from={9.7} to={19.9} write>
      <Wants />
    </Beat>
    <Beat from={19.9} to={25.5} mode="overlay">
      <Checklist />
    </Beat>
    <Beat from={25.5} to={40.0} was={20.2}>
      <HeyWindow />
    </Beat>
    <Beat from={40.0} to={50.9}>
      <Crowd />
    </Beat>
    <Beat from={50.9} to={52.6}>
      <Certificate />
    </Beat>
    <Beat from={52.6} to={63.0} write>
      <CanCant />
    </Beat>
    <Beat from={63.0} to={68.1} write>
      <Intro />
    </Beat>
  </AbsoluteFill>
);
