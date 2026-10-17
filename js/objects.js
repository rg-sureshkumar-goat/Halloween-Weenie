// Tap feedback for the objects that belong to Phase 2's stories: the three windows (The Cottage
// Wakes) and the broom (Broomstick Flight). Each gives its own small response so the scene
// already feels alive; their stories replace these in Phase 2.

import { flareWindow } from './effects.js';
import { playTapSound } from './soundscape.js';
import { reducedMotion } from './motion.js';

// Each window has its own note, so the three sound distinct (a rising triad).
const WINDOW_NOTES = { left: 660, right: 784, attic: 988 };

export function flickerWindow(name) {
  flareWindow(name);
  playTapSound('candle', { note: WINDOW_NOTES[name] });
}

// The broom twitches on its bristles, or briefly dims when motion is reduced.
export function twitchBroom() {
  const art = document.querySelector('#broom .art');
  const keyframes = reducedMotion()
    ? [{ opacity: 1 }, { opacity: 0.55 }, { opacity: 1 }]
    : [{ transform: 'rotate(0deg)' }, { transform: 'rotate(-9deg)' }, { transform: 'rotate(6deg)' },
       { transform: 'rotate(-3deg)' }, { transform: 'rotate(0deg)' }];
  art.animate(keyframes, { duration: 450, easing: 'ease-out' });
  playTapSound('rustle');
}
