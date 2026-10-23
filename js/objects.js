// Tap feedback for scene objects that aren't story ingredients: the blue mushrooms (decoys around the
// green toadstool), and the three windows and the broom, which belong to Phase 2's stories. Each
// gives its own small response so every tap is answered.

import { emitSparkle, flareWindow } from './effects.js';
import { playTapSound } from './soundscape.js';
import { reducedMotion } from './motion.js';

// Each window has its own note, so the three sound distinct (a rising triad).
const WINDOW_NOTES = { left: 660, right: 784, attic: 988 };

export function flickerWindow(name) {
  flareWindow(name);
  playTapSound('candle', { note: WINDOW_NOTES[name] });
}

// A blue mushroom bounces and puffs blue spores with a soft "boop". The one nearest the tap
// responds; from the keyboard, a random one does. No progress: only the green toadstool counts.
export function tapBlueMushrooms(event) {
  const mushrooms = [...document.querySelectorAll('#blue-mushrooms .blue-mushroom')];
  const mushroom = 'clientX' in event ? nearestTo(mushrooms, event.clientX, event.clientY)
    : mushrooms[Math.floor(Math.random() * mushrooms.length)];
  const x = +mushroom.getAttribute('x') + mushroom.getAttribute('width') / 2;
  const y = +mushroom.getAttribute('y') + 2;
  if (reducedMotion()) {
    mushroom.animate([{ opacity: 1 }, { opacity: 0.45 }, { opacity: 1 }], { duration: 400, easing: 'ease-out' });
  } else {
    mushroom.animate([{ transform: 'translateY(0) scale(1)' }, { transform: 'translateY(-4px) scale(1.12, 0.9)' },
      { transform: 'translateY(0) scale(1)' }], { duration: 320, easing: 'ease-out' });
    for (let i = 0; i < 8; i++) emitSparkle(x + (Math.random() - 0.5) * 14, y + (Math.random() - 0.5) * 8, 'blue');
  }
  playTapSound('boop', { pitch: 0.85 + mushrooms.indexOf(mushroom) * 0.03 });
}

function nearestTo(elements, clientX, clientY) {
  const distance = element => {
    const box = element.getBoundingClientRect();
    return Math.hypot(box.x + box.width / 2 - clientX, box.y + box.height / 2 - clientY);
  };
  return elements.reduce((best, element) => (distance(element) < distance(best) ? element : best));
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
