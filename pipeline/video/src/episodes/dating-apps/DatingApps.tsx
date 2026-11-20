import { Html5Audio, interpolate, Sequence, Series, staticFile, useCurrentFrame } from "remotion";
import { OUTRO_FRAMES } from "../../clips";
import { Outro } from "../../Outro";
import { Stage } from "../../pieces/ui";
import { clamp } from "../../theme";
import { Expectations } from "./Expectations";
import { Idea } from "./Idea";
import { Incentives } from "./Incentives";
import { PitchClose, PitchOpen } from "./PitchRoom";
import { Pricing } from "./Pricing";
import { BODY_FRAMES, HAS_NARRATION, NARRATION_FILE, ROOM_TONE_FILE, sectionFrames } from "./timing";
import { Wrapup } from "./Wrapup";

// "dating apps, aka love with a monthly subscription": seven sections, then the 20 s outro.
// Files in public/ (not committed, *.wav and *.mp3 are ignored):
//   dating-apps/narration.wav   your recording (turn HAS_NARRATION on in timing.ts)
//   room-tone.wav               made by scripts/make_room_tone.py
//   constants/outro-rodeo.mp3   outro music
const OUTRO_FADE_FRAMES = 12; // the outro fades in over the last 12 frames of the body
export const DATING_APPS_FRAMES = BODY_FRAMES - OUTRO_FADE_FRAMES + OUTRO_FRAMES;

const OutroWithFade: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <div style={{ position: "absolute", inset: 0, opacity: interpolate(frame, [0, OUTRO_FADE_FRAMES], [0, 1], clamp) }}>
      <Outro narrationSeconds={0} />
    </div>
  );
};

export const DatingApps: React.FC = () => (
  <Stage>
    <Sequence durationInFrames={BODY_FRAMES}>
      {HAS_NARRATION ? (
        <>
          <Html5Audio src={staticFile(ROOM_TONE_FILE)} loop />
          <Html5Audio src={staticFile(NARRATION_FILE)} />
        </>
      ) : null}
      <Series>
        <Series.Sequence durationInFrames={sectionFrames("pitch")}>
          <PitchOpen />
        </Series.Sequence>
        <Series.Sequence durationInFrames={sectionFrames("idea")}>
          <Idea />
        </Series.Sequence>
        <Series.Sequence durationInFrames={sectionFrames("pricing")}>
          <Pricing />
        </Series.Sequence>
        <Series.Sequence durationInFrames={sectionFrames("incentives")}>
          <Incentives />
        </Series.Sequence>
        <Series.Sequence durationInFrames={sectionFrames("expectations")}>
          <Expectations />
        </Series.Sequence>
        <Series.Sequence durationInFrames={sectionFrames("wrapup")}>
          <Wrapup />
        </Series.Sequence>
        <Series.Sequence durationInFrames={sectionFrames("close")}>
          <PitchClose />
        </Series.Sequence>
      </Series>
    </Sequence>
    <Sequence from={BODY_FRAMES - OUTRO_FADE_FRAMES} durationInFrames={OUTRO_FRAMES}>
      <OutroWithFade />
    </Sequence>
  </Stage>
);
