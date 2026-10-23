# Rules

Status: DRAFT written from the 2026-10-23 planning discussion. Edit freely; anything marked (proposed) was suggested and not yet confirmed by Bryson.

## 1. What this is

Unsupervised Voice is an experiment in animated commentary: Bryson riffs on a topic he genuinely cares about, and a red-and-black pixel-style astronaut (code-drawn in Remotion) delivers it on a white background. It is separate from Epoch Relay (the documentary channel); the documentary workflow stays in its own repo.

The experiment is not a commitment. See section 7 for how it gets judged.

## 2. Authenticity (the main rule)

- Topics start from Bryson's real interests, observations, questions and opinions. Not from "what would perform."
- The script is built from Bryson's own spoken riff (transcribed), keeping his wording. AI helps pick the strongest bits and structure them; it does not write the jokes or the opinions. (proposed)
- Every first-person statement ("I always...", "I remember...") must trace to something Bryson actually said or lived. No invented anecdotes, no manufactured reactions. If a bit needs a story he doesn't have, cut it or turn it into a general observation. (proposed)
- Conversational and observant, sometimes funny. Not artificially exaggerated and not forced into outrage.
- Avoid stock jokes for the topic. If the line could appear in any video on the subject, it needs a more specific version.
- The astronaut is Bryson's avatar. The opinions are his. (Revisit if the character ever becomes a separate persona with its own bits.)

## 3. Voice

- Narration is Bryson's real recorded voice. The ElevenLabs voice clone was tested on 2026-10-23 and sounded bland, so it is not used for narration.
- Workflow (proposed): riff first, unscripted, 3 to 5 minutes, don't stop to fix anything. Transcribe. Write the script from the transcript. Record the final script in short chunks, a few takes per line. Pick the best take per line.
- Pauses and comic timing are set in the Remotion timeline, not by the recording alone.
- Sound effects are added in Remotion, frame-accurate, not baked into the audio.

## 4. Character and look

- Astronaut: black suit, black visor face, red eyes and mouth, red accents and rim light. White page background.
- The expression set lives in code: `pipeline/video/src/avatar/Astronaut.tsx` (15 moods, 13 poses). Script cues name a mood and a pose; one annotation drives the face and the body.
- Only build what the current script calls for. Don't expand the art ahead of the writing.
- No logos, brand marks or real-person likeness on the suit. Original design only.

## 5. Production

- Remotion, React and code-generated visuals. No frame-by-frame drawing and no heavy 3D or rendering pipelines (college laptop).
- Log hours per video in these buckets: topic and riff, script, recording and cleanup, art, animation, render. Sustainability can't be judged without it.

## 6. YouTube policy

- The Epoch Relay repo has a checked summary of YouTube's "inauthentic content" (formerly "generic or repetitive") rules: `docs/risks-and-rules.md` there, checked 2026-10-17.
- Re-read the live policy before the first upload and again before applying for monetization. A reusable character and template visuals are fine only if each video's substance differs.
- Check the channel name and handle availability before publishing anything under "Unsupervised Voice." (not yet done)

## 7. Proof of concept (about 60 seconds)

Not a full episode. Judge it on:

1. Can viewers read the astronaut's mood from his face and pose with the sound off?
2. Does it sound like Bryson?
3. How many hours did it take, and how many were reusable assets?
4. Would Bryson watch it cold?
5. Outside feedback: show 3 to 5 people who haven't seen the channel, with no explanation. Ask what it was about and which line they'd repeat. Don't ask whether they liked it.

Two videos of data can't judge a format, and a 60-second video can't test 8-minute pacing or audience demand. Treat the result as a signal.

## 8. Video ideas CSV (`video-ideas.csv`)

- `status`: riff pending, riff recorded, scripting, recording, animating, rendered, published, parked.
- `my_take` and `best_moments` are in Bryson's own words, copied from the riff transcript.
- `origin`: where the idea came from (own observation, something watched or played, a question, etc.).

## 9. Open items

- Astronaut name (working name from Epoch Relay: Relay).
- What happens to Epoch Relay if this works: stay separate, merge, or a broader channel.
- Folder layout: `videos/` is for per-video scripts, transcripts and assets (one folder per idea id); `pipeline/video/` is the Remotion project.
