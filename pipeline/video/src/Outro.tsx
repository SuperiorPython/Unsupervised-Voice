import { AbsoluteFill, Html5Audio, interpolate, staticFile, useCurrentFrame } from "remotion";
import {
  FPS,
  OUTRO_FRAMES,
  OUTRO_MUSIC_FILE,
  OUTRO_MUSIC_START_SECONDS,
  OUTRO_MUSIC_VOLUME_FULL,
  OUTRO_MUSIC_VOLUME_UNDER_VOICE,
  OUTRO_NARRATION_SECONDS,
} from "./clips";
import { clamp, colors, fonts } from "./theme";

// Zones YouTube's end screen editor fills by default (measured from a Studio
// screenshot, 2026-10-17, in 1920x1080 pixels). Keep them free of artwork:
// the boxes below are solid, so the sky and city never show through them.
export const ZONES = {
  videoTop: { x: 29, y: 136, w: 693, h: 390 },
  videoBottom: { x: 29, y: 564, w: 693, h: 390 },
  channel: { x: 1496, y: 358, w: 335, h: 335 },
} as const;

// The drawn outlines sit a little outside each zone so YouTube's elements
// fit inside them even if they land a few pixels off.
const FRAME_PAD = 14;

// ---- city skyline: three parallax layers, drawn once from a seed so every frame matches ----
const W = 1920;
const H = 1080;

const rng = (seed: number) => () => {
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

type Building = { x: number; w: number; h: number; roof: "flat" | "step" | "antenna"; wins: { x: number; y: number; lit: boolean }[] };
type Layer = { speed: number; width: number; buildings: Building[]; fill: string; win: string; lit: string; hasWindows: boolean };

const makeLayer = (opts: {
  seed: number;
  speed: number; // pixels per frame
  minW: number; maxW: number; minH: number; maxH: number;
  gap: number;
  fill: string; win: string; lit: string;
  hasWindows: boolean;
  litChance: number;
}): Layer => {
  const rand = rng(opts.seed);
  const width = W + opts.speed * OUTRO_FRAMES + 240;
  const buildings: Building[] = [];
  let x = -40;
  while (x < width) {
    const w = Math.round(opts.minW + rand() * (opts.maxW - opts.minW));
    const h = Math.round(opts.minH + rand() * (opts.maxH - opts.minH));
    const r = rand();
    const roof = r < 0.25 ? "step" : r < 0.4 ? "antenna" : "flat";
    const wins: Building["wins"] = [];
    if (opts.hasWindows) {
      const cols = Math.floor((w - 20) / 28);
      const rows = Math.floor((h - 36) / 38);
      for (let cx = 0; cx < cols; cx++) {
        for (let cy = 0; cy < rows; cy++) {
          wins.push({ x: 12 + cx * 28 + (w - 20 - cols * 28) / 2, y: 22 + cy * 38, lit: rand() < opts.litChance });
        }
      }
    }
    buildings.push({ x, w, h, roof, wins });
    x += w + Math.round(rand() * opts.gap);
  }
  return { speed: opts.speed, width, buildings, fill: opts.fill, win: opts.win, lit: opts.lit, hasWindows: opts.hasWindows };
};

const LAYERS: Layer[] = [
  makeLayer({ seed: 11, speed: 0.5, minW: 90, maxW: 190, minH: 260, maxH: 520, gap: 14, fill: "#1D2040", win: "#1D2040", lit: "#1D2040", hasWindows: false, litChance: 0 }),
  makeLayer({ seed: 23, speed: 1.3, minW: 110, maxW: 220, minH: 170, maxH: 340, gap: 20, fill: "#12142B", win: "#1A1D3A", lit: "#F4E4CF", hasWindows: true, litChance: 0.3 }),
  makeLayer({ seed: 37, speed: 3.2, minW: 130, maxW: 260, minH: 90, maxH: 230, gap: 28, fill: "#07080D", win: "#12141F", lit: colors.redLight, hasWindows: true, litChance: 0.22 }),
];

// ---- night sky ----
const SKY = "linear-gradient(180deg, #06070E 0%, #10122A 62%, #2B1426 100%)";

type Star = { x: number; y: number; size: number; phase: number; speed: number; base: number; color: string };
const STARS: Star[] = (() => {
  const rand = rng(5);
  return Array.from({ length: 230 }, () => ({
    x: rand() * W,
    y: rand() * 780,
    size: rand() < 0.12 ? 4 : rand() < 0.4 ? 3 : 2,
    phase: rand() * Math.PI * 2,
    speed: 0.04 + rand() * 0.08,
    base: 0.35 + rand() * 0.5,
    color: rand() < 0.06 ? colors.redLight : "#FFFFFF",
  }));
})();

const Stars: React.FC<{ frame: number }> = ({ frame }) => (
  <svg width={W} height={H} style={{ position: "absolute", left: 0, top: 0 }}>
    {STARS.map((st, i) => {
      // the whole sky drifts left very slowly, and each star twinkles on its own
      const x = (((st.x - 0.12 * frame) % W) + W) % W;
      return <rect key={i} x={x} y={st.y} width={st.size} height={st.size} fill={st.color} opacity={st.base * (0.6 + 0.4 * Math.sin(frame * st.speed + st.phase))} />;
    })}
  </svg>
);

// A streak that crosses the upper sky from right to left, then is gone.
const SHOOTS = [
  { start: 150, x: 1500, y: 90 },
  { start: 410, x: 1050, y: 160 },
];
const ShootingStars: React.FC<{ frame: number }> = ({ frame }) => (
  <svg width={W} height={H} style={{ position: "absolute", left: 0, top: 0 }}>
    {SHOOTS.map((sh, i) => {
      const p = (frame - sh.start) / 26;
      if (p < 0 || p > 1) return null;
      const hx = sh.x - 620 * p;
      const hy = sh.y + 260 * p;
      return (
        <g key={i}>
          {Array.from({ length: 10 }, (_, k) => (
            <rect key={k} x={hx + k * 16} y={hy - k * 6.7} width={6} height={6} fill="#FFFFFF" opacity={(1 - k / 10) * (1 - p * 0.3)} />
          ))}
        </g>
      );
    })}
  </svg>
);

const CityLayer: React.FC<{ layer: Layer; frame: number }> = ({ layer, frame }) => (
  <svg
    width={layer.width}
    height={H}
    style={{ position: "absolute", left: 0, top: 0, transform: `translateX(${-layer.speed * frame}px)` }}
  >
    {layer.buildings.map((b, i) => {
      const top = H - b.h;
      return (
        <g key={i}>
          <rect x={b.x} y={top} width={b.w} height={b.h} fill={layer.fill} />
          {b.roof === "step" ? <rect x={b.x + b.w * 0.2} y={top - 36} width={b.w * 0.6} height={36} fill={layer.fill} /> : null}
          {b.roof === "antenna" ? (
            <g>
              <rect x={b.x + b.w / 2 - 3} y={top - 64} width={6} height={64} fill={layer.fill} />
              {layer.hasWindows ? <rect x={b.x + b.w / 2 - 6} y={top - 74} width={12} height={12} fill={colors.red} /> : null}
            </g>
          ) : null}
          {b.wins.map((wn, j) => (
            <rect key={j} x={b.x + wn.x} y={top + wn.y} width={16} height={22} fill={wn.lit ? layer.lit : layer.win} />
          ))}
        </g>
      );
    })}
  </svg>
);

type Props = {
  showGuides?: boolean;
  // seconds of narration still running at the start of the clip
  narrationSeconds?: number;
};

export const Outro: React.FC<Props> = ({
  showGuides = false,
  narrationSeconds = OUTRO_NARRATION_SECONDS,
}) => {
  const frame = useCurrentFrame();

  const textIn = interpolate(frame, [12, 40], [0, 1], clamp);
  const lineIn = interpolate(frame, [8, 60], [0, 1], clamp);
  const fadeOut = interpolate(frame, [OUTRO_FRAMES - 20, OUTRO_FRAMES], [1, 0], clamp);
  // music sits under the narration, then comes up, then fades out over 3 seconds
  const voiceEnd = narrationSeconds * FPS;
  const musicVolume =
    interpolate(frame, [voiceEnd - 15, voiceEnd + 45], [OUTRO_MUSIC_VOLUME_UNDER_VOICE, OUTRO_MUSIC_VOLUME_FULL], clamp) *
    interpolate(frame, [0, 45], [0, 1], clamp) *
    interpolate(frame, [OUTRO_FRAMES - 90, OUTRO_FRAMES], [1, 0], clamp);

  return (
    <AbsoluteFill style={{ background: SKY }}>
      <Html5Audio src={staticFile(OUTRO_MUSIC_FILE)} trimBefore={OUTRO_MUSIC_START_SECONDS * FPS} volume={musicVolume} />
      <AbsoluteFill style={{ opacity: fadeOut }}>
        <Stars frame={frame} />
        <ShootingStars frame={frame} />
        {/* the city rolls by in front of the sky */}
        {LAYERS.map((layer, i) => (
          <CityLayer key={i} layer={layer} frame={frame} />
        ))}

        {/* solid boxes for the elements YouTube places over this clip */}
        {Object.entries(ZONES).map(([name, z], i) => {
          const appear = interpolate(frame, [20 + i * 8, 50 + i * 8], [0, 1], clamp);
          const isChannel = name === "channel";
          return (
            <div
              key={`frame-${name}`}
              style={{
                position: "absolute",
                left: z.x - FRAME_PAD,
                top: z.y - FRAME_PAD,
                width: z.w + FRAME_PAD * 2,
                height: z.h + FRAME_PAD * 2,
                boxSizing: "border-box",
                border: `4px solid ${isChannel ? colors.red : "#FFFFFF"}`,
                borderRadius: isChannel ? "50%" : 18,
                backgroundColor: "#0A0B14",
                opacity: appear,
                transform: `scale(${0.97 + 0.03 * appear})`,
              }}
            />
          );
        })}

        {/* centre column between the video slots and the channel element */}
        <div
          style={{
            position: "absolute",
            left: 760,
            width: 700,
            top: 0,
            bottom: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              fontFamily: fonts.sans,
              fontWeight: 700,
              fontSize: 58,
              color: "#FFFFFF",
              opacity: textIn,
              transform: `translateY(${(1 - textIn) * 14}px)`,
            }}
          >
            Thanks for watching
          </div>
          <div
            style={{
              marginTop: 28,
              height: 5,
              width: 460 * lineIn,
              borderRadius: 3,
              background: `linear-gradient(90deg, ${colors.red}, #FFFFFF)`,
            }}
          />
          <div
            style={{
              marginTop: 28,
              fontFamily: fonts.sans,
              fontSize: 30,
              letterSpacing: 10,
              textTransform: "uppercase",
              color: colors.redLight,
              opacity: textIn,
            }}
          >
            Unsupervised Voice
          </div>
        </div>

        {showGuides &&
          Object.entries(ZONES).map(([name, z]) => (
            <div
              key={name}
              style={{
                position: "absolute",
                left: z.x,
                top: z.y,
                width: z.w,
                height: z.h,
                border: `3px dashed ${colors.red}`,
                borderRadius: name === "channel" ? "50%" : 8,
                color: colors.red,
                fontFamily: fonts.sans,
                fontSize: 28,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {name}
            </div>
          ))}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
