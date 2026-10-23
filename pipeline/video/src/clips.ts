// Fixed lengths for the constant clips. Change a length here and every composition that uses it follows.
export const FPS = 30;

export const OUTRO_SECONDS = 20; // YouTube end screens run in the last 5-20 s
export const OUTRO_FRAMES = OUTRO_SECONDS * FPS;

// "Not My First Rodeo" by Dyalla. The file lives in public/constants and is not committed (*.mp3 is ignored).
// TODO: confirm the license for this track before the first upload (see rules.md).
export const OUTRO_MUSIC_FILE = "constants/outro-rodeo.mp3";
// The track fades in over its first ~10 s and holds a steady groove after that (~63 bpm),
// so start the clip once the groove is established.
export const OUTRO_MUSIC_START_SECONDS = 12;

// Starting levels (0-1), to be tuned by ear and by the -14 LUFS mix check.
export const OUTRO_MUSIC_VOLUME_UNDER_VOICE = 0.15;
export const OUTRO_MUSIC_VOLUME_FULL = 0.7;
// How long the narration's closing line runs into the end clip.
export const OUTRO_NARRATION_SECONDS = 8;
