import { AstronautCompositions } from "./avatar/Astronaut";

// 1080p, 30 fps. Episodes get registered here as they are built.
export const RemotionRoot: React.FC = () => {
  return (
    <>
      <AstronautCompositions />
    </>
  );
};
