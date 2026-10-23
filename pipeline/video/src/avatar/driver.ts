import { staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { useAudioData, visualizeAudio } from "@remotion/media-utils";

// Shared by every presenter character: mouth openness from the narration audio, and the
// cue timeline (which pose and mood are active, and how far each blend has progressed).
export type Cue<P extends string, M extends string> = { at: number; pose?: P; mood?: M };

const ease = (t: number) => t * t * (3 - 2 * t);
const BLEND = 12;

export const mixNum = (a: number, b: number, t: number) => a + (b - a) * t;
export const mixObj = <T extends Record<string, number>>(a: T, b: T, t: number): T => {
  const out: Record<string, number> = {};
  Object.keys(a).forEach((k) => (out[k] = mixNum(a[k], b[k], t)));
  return out as T;
};

export const useDriver = <P extends string, M extends string>(
  cues: Cue<P, M>[],
  idlePose: P,
  idleMood: M,
  audio?: string,
  audioStartFrame = 0,
) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const data = useAudioData(staticFile(audio ?? "silence.mp3"));
  const level = (fr: number) => {
    if (!data || !audio) return 0;
    const v = visualizeAudio({ fps, frame: Math.max(0, fr - audioStartFrame), audioData: data, numberOfSamples: 32 });
    const lo = v.slice(1, 12);
    return lo.reduce((a, b) => a + b, 0) / lo.length;
  };
  const raw = (level(frame) + level(frame - 1) + level(frame - 2)) / 3;
  const open = Math.min(1, Math.max(0, raw - 0.004) * 38);

  let poseFrom = idlePose;
  let poseTo = idlePose;
  let moodFrom = idleMood;
  let moodTo = idleMood;
  let poseT = 1;
  let moodT = 1;
  [...cues].sort((a, b) => a.at - b.at).forEach((c) => {
    if (frame >= c.at) {
      if (c.pose) {
        poseFrom = poseTo;
        poseTo = c.pose;
        poseT = ease(Math.min(1, (frame - c.at) / BLEND));
      }
      if (c.mood) {
        moodFrom = moodTo;
        moodTo = c.mood;
        moodT = ease(Math.min(1, (frame - c.at) / BLEND));
      }
    }
  });
  return { frame, open, poseFrom, poseTo, poseT, moodFrom, moodTo, moodT };
};
