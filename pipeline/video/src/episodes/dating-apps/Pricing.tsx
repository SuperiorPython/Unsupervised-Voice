// Section 3: "Congratulations, your love life has a pricing menu". Local seconds.
// Every brand and tier on screen here (LOVE PLUS, LOVE PREMIUM, LOVE ULTRA) is a made-up joke,
// not a real product. Keep real prices and real feature names out until they are fact-checked.
import React from "react";
import { AbsoluteFill } from "remotion";
import { colors, fonts } from "../../theme";
import { Background } from "../Background";
import { Beat, Card, Check, Chip, Corner, Cross, Heart, Pop, SOFT, Stamp, T, cue, ease, lerp, prog, sec, useIn, useCurrentFrame } from "./kit";

const CUES = [
  cue(0, "neutral", "open"), // "Because you can't just build an app... and pay everyone in good vibes."
  cue(6.1, "skeptical", "hip"), // "Developers cost money. Servers cost money..."
  cue(15.3, "deadpan", "shrug"), // "romantic tension is not an accepted form of payment"
  cue(20.7, "neutral", "open"), // "keep the lights on. Fair enough."
  cue(26.6, "determined", "point"), // "subscriptions, boosts, and paid visibility features"
  cue(31.3, "smug", "hold"), // opens the app
  cue(41.4, "surprised", "open"),
  cue(51.9, "deadpan", "shrug"), // "Okay, I made that last one up."
  cue(56.1, "skeptical", "chin"), // "But the weird feeling is real."
  cue(66.1, "thinking", "open"), // "paying for features can change what tools you have..."
  cue(73.2, "smug", "crossed"), // "You can buy a bigger megaphone. You can't purchase chemistry."
];

// ---------- 3.1 paid in good vibes ----------
const Payslip: React.FC = () => (
  <Pop>
    <Card style={{ width: 900, display: "flex", flexDirection: "column", gap: 18 }}>
      <T size={40} weight={700} color={colors.muted}>PAYROLL · everyone who built the app</T>
      <div style={{ height: 6, background: colors.ink }} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <T size={56}>amount</T>
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <T size={72} color={colors.red} weight={900}>good vibes</T>
          <Heart s={70} />
        </div>
      </div>
    </Card>
  </Pop>
);

const COSTS = ["developers", "servers", "moderation", "running a service"];
const COST_AT = [0.3, 1.9, 3.3, 5.3]; // as each one is said
const Costs: React.FC = () => (
  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 34 }}>
    {COSTS.map((c, i) => (
      <Chip key={c} at={COST_AT[i]} size={56} red={i % 2 === 1} rot={i % 2 ? 1.5 : -1.5}>
        {c} $
      </Chip>
    ))}
  </div>
);

// ---------- 3.2 the electric company ----------
const ElectricBill: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <Card style={{ width: 1000, position: "relative" }}>
      <T size={52} weight={900} color={colors.red}>ELECTRIC CO.</T>
      <div style={{ height: 6, background: colors.ink, margin: "14px 0 22px" }} />
      <T size={42} weight={700}>accepted payment:</T>
      <div style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 18 }}>
        {[
          { t: "cash", ok: true },
          { t: "card", ok: true },
          { t: "romantic tension", ok: false },
        ].map((r, i) => (
          <Pop key={r.t} at={[0.4, 0.9, 1.5][i]}>
            <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
              {r.ok ? <Check s={56} /> : <Cross s={56} c={colors.red} p={prog(frame, 2.4, 3.0)} />}
              <T size={54} weight={800} color={r.ok ? colors.ink : colors.red}>{r.t}</T>
            </div>
          </Pop>
        ))}
      </div>
      <div style={{ position: "absolute", right: 30, bottom: 30 }}>
        <Stamp at={3.1} size={40} rot={-9}>NOT ACCEPTED</Stamp>
      </div>
    </Card>
  );
};

// ---------- 3.3 keeping the lights on ----------
const Bulb: React.FC = () => {
  const frame = useCurrentFrame();
  const on = frame >= sec(3.3);
  // flickers on, then holds
  const flick = frame < sec(3.3) + 8 ? (frame % 4 < 2 ? 0.4 : 1) : 1;
  return (
    <div style={{ position: "relative", width: 700, height: 560, display: "flex", justifyContent: "center" }}>
      {on ? <div style={{ position: "absolute", left: 100, top: 20, width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(214,40,57,0.28) 0%, rgba(214,40,57,0) 68%)", opacity: flick }} /> : null}
      <svg width={300} height={460} viewBox="0 0 150 230" style={{ position: "relative", overflow: "visible" }}>
        <path d="M75 12 C28 12 6 48 6 82 C6 112 28 126 38 150 L38 168 L112 168 L112 150 C122 126 144 112 144 82 C144 48 122 12 75 12 Z" fill={on ? "#FFE2E4" : colors.paper} stroke={colors.ink} strokeWidth={7} strokeLinejoin="round" />
        <rect x={38} y={168} width={74} height={14} fill={colors.ink} />
        <rect x={44} y={186} width={62} height={14} fill={colors.ink} />
        <rect x={56} y={204} width={38} height={14} rx={6} fill={colors.ink} />
        <path d="M58 150 L58 100 L75 80 L92 100 L92 150" fill="none" stroke={on ? colors.red : colors.muted} strokeWidth={5} strokeLinejoin="round" />
      </svg>
      <div style={{ position: "absolute", right: 0, top: 60 }}>
        <Pop at={4.0}>
          <Card style={{ padding: "14px 26px" }}>
            <T size={48} color={colors.red} weight={900}>$ / month</T>
          </Card>
        </Pop>
      </div>
    </div>
  );
};

// ---------- 3.4 how they make money ----------
const MoneyChips: React.FC = () => (
  <div style={{ display: "flex", gap: 26, flexWrap: "wrap", justifyContent: "center", maxWidth: 1300 }}>
    <Chip at={1.0} size={62}>subscriptions</Chip>
    <Chip at={2.3} size={62} rot={-2}>boosts</Chip>
    <Chip at={3.0} size={62} rot={2}>paid visibility</Chip>
  </div>
);

// ---------- 3.5 the fictional app ----------
const MENU = [
  { at: 1.8, title: "Congratulations!", sub: "You've downloaded love.", tone: "plain" as const },
  { at: 4.6, title: "Upgrade to LOVE PLUS?", sub: "", tone: "button" as const },
  { at: 7.5, title: "LOVE PLUS", sub: "extra visibility", tone: "plain" as const },
  { at: 10.3, title: "LOVE PREMIUM", sub: "see more information", tone: "plain" as const },
  { at: 13.5, title: "LOVE ULTRA", sub: "complimentary emotional-support PDF", tone: "ultra" as const },
];

const Phone: React.FC = () => {
  const frame = useCurrentFrame();
  const p = useIn(0.2);
  const heartY = lerp(300, 0, ease(prog(frame, 1.4, 2.2)));
  return (
    <div style={{ opacity: Math.min(1, p * 2), scale: String(0.9 + 0.1 * Math.min(1, p)) }}>
      <div style={{ width: 520, height: 900, borderRadius: 64, border: `10px solid ${colors.ink}`, background: colors.paper, boxShadow: `14px 14px 0 ${colors.red}`, position: "relative", overflow: "hidden", boxSizing: "border-box" }}>
        <div style={{ position: "absolute", left: 180, top: 14, width: 120, height: 22, borderRadius: 12, background: colors.ink }} />
        <div style={{ position: "absolute", left: 0, right: 0, top: 70 + heartY, display: "flex", justifyContent: "center" }}>
          <Heart s={110} />
        </div>
        <div style={{ position: "absolute", left: 24, right: 24, top: 210, display: "flex", flexDirection: "column", gap: 16 }}>
          {MENU.map((m) => (
            <Pop key={m.title} at={m.at}>
              <div
                style={{
                  borderRadius: 20,
                  border: `5px solid ${colors.ink}`,
                  padding: "14px 20px",
                  background: m.tone === "button" ? colors.red : m.tone === "ultra" ? "#FFF3F4" : colors.paper,
                  color: m.tone === "button" ? colors.paper : colors.ink,
                  fontFamily: fonts.sans,
                  position: "relative",
                  textAlign: m.tone === "button" ? "center" : "left",
                }}
              >
                <div style={{ fontSize: 34, fontWeight: 900 }}>{m.title}</div>
                {m.sub ? <div style={{ fontSize: 26, fontWeight: 600, color: m.tone === "ultra" ? colors.ink : colors.muted }}>{m.sub}</div> : null}
                {m.tone === "ultra" ? (
                  <div style={{ position: "absolute", right: -6, top: -26 }}>
                    <Stamp at={20.8} size={26} rot={9}>FICTIONAL</Stamp>
                  </div>
                ) : null}
              </div>
            </Pop>
          ))}
        </div>
      </div>
    </div>
  );
};

// ---------- 3.6 comparing tiers like cloud storage ----------
const Tiers: React.FC = () => (
  <>
    <T size={60} weight={900}>choose your plan</T>
    <div style={{ display: "flex", gap: 36 }}>
      {[
        { n: "LOVE FREE", p: "$0", hi: false },
        { n: "LOVE PLUS", p: "$$", hi: false },
        { n: "LOVE PREMIUM", p: "$$$", hi: true },
      ].map((t, i) => (
        <Pop key={t.n} at={5.5 + i * 0.6}>
          <Card style={{ width: 380, textAlign: "center", background: t.hi ? colors.red : colors.paper, color: t.hi ? colors.paper : colors.ink }}>
            <T size={38} weight={900}>{t.n}</T>
            <T size={96} weight={900} style={{ margin: "10px 0" }}>{t.p}</T>
            <T size={30} weight={600} color={t.hi ? colors.paper : colors.muted}>per month</T>
          </Card>
        </Pop>
      ))}
    </div>
  </>
);

// ---------- 3.7 megaphone, not chemistry ----------
const Megaphone: React.FC<{ s: number }> = ({ s }) => (
  <svg width={300 * s} height={220 * s} viewBox="0 0 300 220" style={{ overflow: "visible" }}>
    <path d="M20 80 L110 80 L240 14 L240 206 L110 140 L20 140 Z" fill={colors.red} stroke={colors.ink} strokeWidth={8} strokeLinejoin="round" />
    <rect x={40} y={140} width={46} height={56} rx={8} fill={colors.ink} />
    <path d="M262 60 C284 90 284 130 262 160 M280 36 C318 84 318 136 280 184" stroke={colors.ink} strokeWidth={8} fill="none" strokeLinecap="round" />
  </svg>
);

const Tools: React.FC = () => {
  const frame = useCurrentFrame();
  const grow = ease(prog(frame, 2.0, 3.4));
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 70 }}>
      <Pop at={0.2}>
        <Megaphone s={lerp(0.9, 1.9, grow)} />
      </Pop>
      <Pop at={1.6}>
        <T size={64} color={colors.red} weight={900}>$ → louder</T>
      </Pop>
    </div>
  );
};

const Shelf: React.FC = () => (
  <div style={{ display: "flex", gap: 60 }}>
    <Pop at={0.4}>
      <Card style={{ width: 460, textAlign: "center" }}>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <Megaphone s={0.8} />
        </div>
        <T size={44}>bigger megaphone</T>
        <T size={64} color={colors.red} weight={900}>$$</T>
      </Card>
    </Pop>
    <Pop at={2.6}>
      <Card style={{ width: 460, textAlign: "center", border: `6px dashed ${colors.ink}`, boxShadow: "none", background: SOFT }}>
        <div style={{ display: "flex", justifyContent: "center", height: 176, alignItems: "center" }}>
          <Heart s={120} c="transparent" stroke={colors.muted} />
        </div>
        <T size={44}>chemistry</T>
        <T size={56} color={colors.red} weight={900}>NOT FOR SALE</T>
      </Card>
    </Pop>
  </div>
);

export const Pricing: React.FC = () => (
  <AbsoluteFill>
    <Background />
    <Corner id="pricing" cues={CUES} />

    <Beat from={0} to={6.0} was={7.8}>
      <Payslip />
    </Beat>
    <Beat from={6.0} to={14.6} write>
      <Costs />
    </Beat>
    <Beat from={14.6} to={20.3}>
      <ElectricBill />
    </Beat>
    <Beat from={20.3} to={26.2}>
      <Bulb />
    </Beat>
    <Beat from={26.2} to={31.2} write>
      <MoneyChips />
    </Beat>
    <Beat from={31.2} to={55.9}>
      <Phone />
    </Beat>
    <Beat from={55.9} to={65.9}>
      <Tiers />
    </Beat>
    <Beat from={65.9} to={73.0} was={8.6}>
      <Tools />
    </Beat>
    <Beat from={73.0} to={78.2}>
      <Shelf />
    </Beat>
  </AbsoluteFill>
);
