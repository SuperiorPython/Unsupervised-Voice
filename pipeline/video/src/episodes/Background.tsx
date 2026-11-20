import { AbsoluteFill, useCurrentFrame } from "remotion";
import { colors } from "../theme";

// Quiet light backdrop for the commentary: off-white page, a slow-drifting dot grid, two faint red
// washes at the left edge, and a soft red glow behind the astronaut's corner.
// Keep it low-contrast so the cards and the astronaut stay the loudest things on screen.
export const BG_BASE = "#F7F7F9";
const DOT = "#D8D8DE";

export const Background: React.FC<{ astroX?: number; astroY?: number }> = ({ astroX = 1730, astroY = 800 }) => {
  const frame = useCurrentFrame();
  const drift = (frame * 0.2) % 56;
  return (
    <AbsoluteFill style={{ backgroundColor: BG_BASE }}>
      <AbsoluteFill
        style={{
          backgroundImage: `radial-gradient(${DOT} 3px, transparent 3.5px)`,
          backgroundSize: "56px 56px",
          backgroundPosition: `${drift}px ${drift}px`,
        }}
      />
      <div style={{ position: "absolute", left: -260, top: -240, width: 700, height: 700, borderRadius: "50%", background: "rgba(214,40,57,0.06)" }} />
      <div style={{ position: "absolute", left: -180, bottom: -300, width: 620, height: 620, borderRadius: "50%", background: "rgba(214,40,57,0.05)" }} />
      <div
        style={{
          position: "absolute",
          left: astroX - 340,
          top: astroY - 340,
          width: 680,
          height: 680,
          background: `radial-gradient(circle, rgba(214,40,57,0.16) 0%, rgba(214,40,57,0.06) 45%, rgba(214,40,57,0) 70%)`,
        }}
      />
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 10, background: colors.red }} />
    </AbsoluteFill>
  );
};
