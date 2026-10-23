import { Composition } from "remotion";
import { FPS, OUTRO_FRAMES } from "./clips";
import { Outro } from "./Outro";
import { AstronautCompositions } from "./avatar/Astronaut";

// 1080p, 30 fps. Episodes get registered here as they are built.
export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition id="Outro" component={Outro} durationInFrames={OUTRO_FRAMES} fps={FPS} width={1920} height={1080} />
      <Composition
        id="OutroGuides"
        component={Outro}
        defaultProps={{ showGuides: true }}
        durationInFrames={OUTRO_FRAMES}
        fps={FPS}
        width={1920}
        height={1080}
      />
      <AstronautCompositions />
    </>
  );
};
