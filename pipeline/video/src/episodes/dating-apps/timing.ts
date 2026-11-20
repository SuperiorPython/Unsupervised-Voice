// Timing for "dating apps, aka love with a monthly subscription" (script v4), set from the recorded narration.
//
// The numbers come from a Whisper-style transcript of public/dating-apps/narration.mp3 (388.7 s). Each section starts
// about 0.3 s before its first spoken word, so the picture changes just ahead of the voice. The last section also
// carries 4.5 s after the final word for the "free trial has ended" sign and the cut to black.
//
// If you re-record: update SECTION_SECONDS from where each section's first line starts, then nudge the beat times
// (Beat from/to, in seconds local to the section) and the Pop/Chip "at" times inside each section file.
import { FPS } from "../../clips";

export const NARRATION_FILE = "dating-apps/narration.mp3";
export const ROOM_TONE_FILE = "room-tone.wav";
// On: the narration plays and the astronaut mouth follows it. (Needs public/dating-apps/narration.mp3.)
export const HAS_NARRATION = true;

export type SectionId = "pitch" | "idea" | "pricing" | "incentives" | "expectations" | "wrapup" | "close";

export const SECTION_ORDER: SectionId[] = ["pitch", "idea", "pricing", "incentives", "expectations", "wrapup", "close"];

// Seconds per section. Script headings: 1 pitch meeting, 2 the idea, 3 pricing menu,
// 4 the room goes quiet, 5 we are also in the app, 6 back to the board (split in two:
// "wrapup" is the commentary, "close" is the return to the pitch room).
export const SECTION_SECONDS: Record<SectionId, number> = {
  pitch: 40.8,
  idea: 65.2,
  pricing: 78.2,
  incentives: 86.3,
  expectations: 68.1,
  wrapup: 30.4,
  close: 24.2,
};

export const sectionFrames = (id: SectionId) => Math.round(SECTION_SECONDS[id] * FPS);

const starts = {} as Record<SectionId, number>;
let acc = 0;
SECTION_ORDER.forEach((id) => {
  starts[id] = acc;
  acc += sectionFrames(id);
});

// Where each section begins in the whole video (frames). Used to line the mouth up with the narration.
export const SECTION_START_FRAMES: Record<SectionId, number> = starts;
export const BODY_FRAMES = acc;
