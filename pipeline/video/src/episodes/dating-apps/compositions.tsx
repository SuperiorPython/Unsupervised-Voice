import { Composition, Folder } from "remotion";
import { FPS } from "../../clips";
import { DATING_APPS_FRAMES, DatingApps } from "./DatingApps";
import { Expectations } from "./Expectations";
import { Idea } from "./Idea";
import { Incentives } from "./Incentives";
import { PitchClose, PitchOpen } from "./PitchRoom";
import { Pricing } from "./Pricing";
import { sectionFrames, type SectionId } from "./timing";
import { Wrapup } from "./Wrapup";

const SECTIONS: { id: SectionId; name: string; component: React.FC }[] = [
  { id: "pitch", name: "DA-1-Pitch", component: PitchOpen },
  { id: "idea", name: "DA-2-Idea", component: Idea },
  { id: "pricing", name: "DA-3-Pricing", component: Pricing },
  { id: "incentives", name: "DA-4-Incentives", component: Incentives },
  { id: "expectations", name: "DA-5-Expectations", component: Expectations },
  { id: "wrapup", name: "DA-6a-Wrapup", component: Wrapup },
  { id: "close", name: "DA-6b-Close", component: PitchClose },
];

// The whole episode, plus each section on its own so a section can be previewed and re-timed alone.
export const DatingAppsCompositions: React.FC = () => (
  <>
    <Composition id="DatingApps" component={DatingApps} durationInFrames={DATING_APPS_FRAMES} fps={FPS} width={1920} height={1080} />
    <Folder name="DatingApps-Sections">
      {SECTIONS.map((s) => (
        <Composition key={s.id} id={s.name} component={s.component} durationInFrames={sectionFrames(s.id)} fps={FPS} width={1920} height={1080} />
      ))}
    </Folder>
  </>
);
