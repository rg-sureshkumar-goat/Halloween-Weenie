// What every story shares (spec.md › Stories): one length, the end of its trigger, and the frame
// around its sequence. The frame is a dim that settles over the scene in the first second and
// lifts near the end, ambience that ducks under the story and returns as it ends, and a closing
// shimmer that sweeps the scene to show it's the User's turn again.

import { clock } from '../clock.js';
import { playTimeline, ease, lerp } from '../timeline.js';
import { setAmbienceLevel } from '../audio.js';
import { playTapSound } from '../soundscape.js';

export const STORY_LENGTH_MS = 8500;
const DIM_IN_MS = 1000;
const LIFT_AT_MS = STORY_LENGTH_MS - 1300;     // 7.2 s: the dim lifts over 1 s
const SHIMMER_AT_MS = STORY_LENGTH_MS - 900;   // 7.6 s: the shimmer sweeps and ambience returns
const STORY_AMBIENCE = 0.4;                    // ambience level under a story
const CHIME_BEAT_MS = 450;                     // after a trigger's chime, a beat before the story

// The end of a trigger: start the story or, if another story is already playing, reset the
// trigger so it can be completed again. With `chime`, a twinkle and a short beat come first.
export function finishTrigger({ start, reset, chime = false }) {
  const startOrReset = () => {
    if (!start()) reset();
  };
  if (!chime) {
    startOrReset();
    return;
  }
  playTapSound('twinkle');
  clock.after(CHIME_BEAT_MS, startOrReset);
}

// Plays a story's own tracks and cues inside the shared frame. `dim` is the overlay the story
// dims with, up to `dimTo`. At the end the frame and the story's own elements (`reset`) go back
// to rest before main.js unlocks the scene (`onDone`).
export function playStoryTimeline({ dim, dimTo, reduced, tracks, cues, reset, onDone }) {
  const shimmer = document.getElementById('story-shimmer');
  const frameTracks = [
    { at: 0, duration: DIM_IN_MS, update: p => dim.setAttribute('opacity', (dimTo * ease(p)).toFixed(3)) },
    { at: LIFT_AT_MS, duration: 1000, update: p => dim.setAttribute('opacity', (dimTo * (1 - ease(p))).toFixed(3)) },
    { at: SHIMMER_AT_MS, duration: 900, update: p => {
      if (reduced) {
        shimmer.setAttribute('transform', 'translate(-5 0) scale(2 1)');                // a gentle full-width wash
        shimmer.setAttribute('opacity', (Math.sin(Math.PI * p) * 0.6).toFixed(3));
      } else {
        shimmer.setAttribute('transform', `translate(${lerp(-220, 410, p).toFixed(1)} 0)`);   // sweeps left to right
        shimmer.setAttribute('opacity', Math.sin(Math.PI * p).toFixed(3));
      }
    } },
  ];
  const frameCues = [
    { at: 0, run: () => setAmbienceLevel(STORY_AMBIENCE) },
    { at: SHIMMER_AT_MS, run: () => setAmbienceLevel(1, 0.8) },
  ];

  return playTimeline({
    length: STORY_LENGTH_MS,
    tracks: [...frameTracks, ...tracks],
    cues: [...frameCues, ...cues],
    onDone: elapsed => {
      dim.setAttribute('opacity', '0');
      shimmer.setAttribute('opacity', '0');
      reset();
      onDone(elapsed);
    },
  });
}
