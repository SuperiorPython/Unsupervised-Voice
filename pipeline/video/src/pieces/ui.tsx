import { AbsoluteFill, interpolate } from "remotion";
import { clamp, colors, fonts } from "../theme";

export const fadeIn = (frame: number, start: number, len = 14) =>
  interpolate(frame, [start, start + len], [0, 1], clamp);

const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

// 0 to 1 with an ease-out curve, starting at `start`.
export const rise = (frame: number, start: number, len = 18) =>
  easeOut(interpolate(frame, [start, start + len], [0, 1], clamp));

// Full-frame wrapper on a white page. background={false} lets a piece sit over another scene.
export const Stage: React.FC<{ background?: boolean; children: React.ReactNode }> = ({
  background = true,
  children,
}) => (
  <AbsoluteFill
    style={{
      backgroundColor: background ? colors.paper : "transparent",
      fontFamily: fonts.sans,
      color: colors.ink,
    }}
  >
    {children}
  </AbsoluteFill>
);
