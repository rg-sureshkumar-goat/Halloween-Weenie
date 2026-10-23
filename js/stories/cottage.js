// The Cottage Wakes (Phase 2 story): light the three windows, then an 8.5 s sequence on the
// pausable timeline (spec.md › The Cottage Wakes).
//   Taps:             the windows burn low until tapped; each tap lights one for good, in any
//                     order. Progress holds until the story plays (decided Oct 22).
//   Beginning 0–2 s:  the clearing dims around the cottage; heavy eyelids close over the two lower
//                     windows, then lift, droop, and open wide; the pupils look around.
//   Middle    2–6 s:  the door swings open into a yawning mouth that stretches and relaxes; then
//                     the chimney puffs three smoke rings, and the eyes follow them up.
//   End       6–8.5 s: the eyelids droop shut, the door creaks closed, Z's float up from the door,
//                     the windows sink back to low, a shimmer sweeps the scene, and the raven caws.
// Reduced motion keeps the beats and length: eyelids, door, rings, and Z's fade in place, and
// nothing slides, stretches, or travels.

import { ease, lerp } from '../timeline.js';
import { flareWindow, setWindowLit } from '../effects.js';
import { playStorySound, playTapSound, playVoice } from '../soundscape.js';
import { noteProgress } from '../hints.js';
import { reducedMotion } from '../motion.js';
import { STORY_LENGTH_MS, finishTrigger, playStoryTimeline } from './frame.js';

const WINDOW_NAMES = ['left', 'right', 'attic'];
const WINDOW_NOTES = { left: 660, right: 784, attic: 988 };   // a rising triad, one note per window
const CHIMNEY = { x: 156, y: 244 };
const DOOR_HINGE_X = 180;
const DOOR_BASE = { x: 195, y: 480 };
const byId = id => document.getElementById(id);

// ---------- Choreography (ms from the story's start → value) ----------
// Each table is read by keyframes(): values ease from one row to the next.

// Eyelid offset: 0 = shut, -14 = half open (sleepy), -30 = wide open.
const LID = [[0, 0], [500, 0], [1300, -14], [1500, -8], [1850, -30], [2300, -30], [2700, -12], [3700, -12],
  [4100, -30], [6000, -30], [6500, -15], [6750, -20], [7300, 0]];
// Pupils look left, then right, then up at the smoke rings, then settle (scene units).
const PUPIL_X = [[0, 0], [1900, 0], [2150, -4], [2450, -4], [2650, 4], [2950, 4], [3150, 0], [4300, 0],
  [4600, -3], [5800, -3], [6100, 0]];
const PUPIL_Y = [[0, 0], [4300, 0], [4600, -5], [5800, -5], [6100, 0], [6500, 2]];
// The eyes appear over the lit windows and leave once shut.
const EYES_SHOWN = [[0, 0], [300, 1], [7600, 1], [8100, 0]];
// Door panel width around its hinge: 1 = shut, 0.12 = swung open.
const DOOR_SWING = [[0, 1], [2000, 1], [2600, 0.12], [6400, 0.12], [7000, 1]];
// The yawn stretches the doorway taller and a little wider, then relaxes.
const YAWN_X = [[0, 1], [2300, 1], [3300, 1.08], [4000, 1]];
const YAWN_Y = [[0, 1], [2300, 1], [3300, 1.22], [4000, 1]];
// Reduced motion: the lids fade in shut, fade away as the eyes open, and fade back as they close.
const LID_SHOWN_REDUCED = [[0, 1], [1500, 1], [1900, 0], [6800, 0], [7300, 1]];
const DOOR_SHOWN_REDUCED = [[0, 1], [2000, 1], [2600, 0.15], [6400, 0.15], [7000, 1]];
// Smoke rings and Z's: when each starts and how long it lasts.
const RINGS = { starts: [4300, 4750, 5200], life: 1600 };
const ZS = { starts: [6800, 7050, 7300], life: 1150 };

// ---------- Trigger: light the three windows ----------

const lit = new Set();
let onAllLit = () => true;

// main.js passes the function that starts the story; it returns false if a story couldn't start.
export function initCottage({ onComplete }) {
  onAllLit = onComplete;
}

// A tap on a window: it flares with its own note. A low window lights for good (progress);
// a lit one only flickers.
export function tapWindow(name) {
  flareWindow(name);
  playTapSound('candle', { note: WINDOW_NOTES[name] });
  if (lit.has(name) || lit.size === WINDOW_NAMES.length) return;
  lit.add(name);
  setWindowLit(name, true);
  noteProgress();
  // A twinkle and a beat to see the third window catch, then the cottage stirs. If a story is
  // already playing, the windows burn low again.
  if (lit.size === WINDOW_NAMES.length) finishTrigger({ start: onAllLit, reset: resetWindows, chime: true });
}

function resetWindows(seconds) {
  lit.clear();
  for (const name of WINDOW_NAMES) setWindowLit(name, false, seconds);
}

// ---------- The story sequence ----------

export function playCottageWakes({ onDone }) {
  const reduced = reducedMotion();
  const eyes = ['left', 'right'].map(side => {
    const eye = byId(`window-${side}`).querySelector('.window-eye');
    return { eye, pupil: eye.querySelector('.pupil'), lid: eye.querySelector('.eyelid') };
  });
  const doorYawn = byId('door-yawn');
  const doorPanel = byId('door-panel');
  const rings = [...byId('smoke-rings').children];
  const zs = [...byId('snore-zs').children];
  const dim = byId('cottage-dim');

  // The face: eyes and mouth, all read from the choreography tables at time `ms`.
  function placeFace(ms) {
    for (const { eye, pupil, lid } of eyes) {
      eye.setAttribute('opacity', keyframes(EYES_SHOWN, ms).toFixed(3));
      if (reduced) {
        lid.setAttribute('transform', 'translate(0 0)');
        lid.setAttribute('opacity', keyframes(LID_SHOWN_REDUCED, ms).toFixed(3));
        continue;
      }
      lid.setAttribute('transform', `translate(0 ${keyframes(LID, ms).toFixed(2)})`);
      pupil.setAttribute('transform', `translate(${keyframes(PUPIL_X, ms).toFixed(2)} ${keyframes(PUPIL_Y, ms).toFixed(2)})`);
    }
    if (reduced) {
      doorPanel.setAttribute('opacity', keyframes(DOOR_SHOWN_REDUCED, ms).toFixed(3));
      return;
    }
    const swing = keyframes(DOOR_SWING, ms);
    doorPanel.setAttribute('transform', `translate(${DOOR_HINGE_X} 0) scale(${swing.toFixed(3)} 1) translate(${-DOOR_HINGE_X} 0)`);
    const stretch = `${keyframes(YAWN_X, ms).toFixed(3)} ${keyframes(YAWN_Y, ms).toFixed(3)}`;
    doorYawn.setAttribute('transform', `translate(${DOOR_BASE.x} ${DOOR_BASE.y}) scale(${stretch}) translate(${-DOOR_BASE.x} ${-DOOR_BASE.y})`);
  }

  // Smoke rings rise from the chimney, widening as they drift left with the wind.
  // Reduced motion: each appears in place, one above the other, and fades.
  function placeRings(ms) {
    rings.forEach((ring, i) => {
      const p = (ms - RINGS.starts[i]) / RINGS.life;
      if (p < 0 || p > 1) {
        ring.setAttribute('opacity', '0');
        return;
      }
      const fade = Math.min(1, p / 0.1) * Math.min(1, (1 - p) / 0.5);
      if (reduced) {
        ring.setAttribute('cx', String(CHIMNEY.x - 4 * i));
        ring.setAttribute('cy', String(CHIMNEY.y - 24 - 26 * i));
        ring.setAttribute('rx', String(8 + 3 * i));
        ring.setAttribute('ry', String(3.5 + 1.2 * i));
        ring.setAttribute('opacity', (0.9 * Math.sin(Math.PI * p)).toFixed(3));
        return;
      }
      const rise = ease(p);
      ring.setAttribute('cx', (CHIMNEY.x - 30 * rise).toFixed(1));
      ring.setAttribute('cy', (CHIMNEY.y - 130 * rise).toFixed(1));
      ring.setAttribute('rx', lerp(6, 18, p).toFixed(2));
      ring.setAttribute('ry', lerp(2.5, 7, p).toFixed(2));
      ring.setAttribute('opacity', (0.9 * fade).toFixed(3));
    });
  }

  // Z's float up and to the right from the door, growing as they go.
  // Reduced motion: they fade in and out in place along the same line.
  function placeZs(ms) {
    zs.forEach((z, i) => {
      const p = (ms - ZS.starts[i]) / ZS.life;
      if (p < 0 || p > 1) {
        z.setAttribute('opacity', '0');
        return;
      }
      const along = reduced ? 0.3 + 0.3 * i : p;
      const scale = reduced ? 1 + 0.25 * i : lerp(0.8, 1.6, p);
      z.setAttribute('transform', `translate(${lerp(212, 290, along).toFixed(1)} ${lerp(432, 350, along).toFixed(1)}) scale(${scale.toFixed(3)})`);
      z.setAttribute('opacity', Math.sin(Math.PI * p).toFixed(3));
    });
  }

  const tracks = [
    // One track drives the face, rings, and Z's from the tables above.
    { at: 0, duration: STORY_LENGTH_MS, update: p => {
      const ms = p * STORY_LENGTH_MS;
      placeFace(ms);
      placeRings(ms);
      placeZs(ms);
    } },
  ];

  const cues = [
    { at: 0, run: () => playVoice('creak') },                                   // the old house groans awake
    { at: 300, run: () => flareWindow('attic') },                               // a raised brow
    { at: 1850, run: () => { flareWindow('left'); flareWindow('right'); } },    // eyes wide open
    { at: 2000, run: () => playStorySound('yawn', { duration: 2.2 }) },
    ...RINGS.starts.map((at, i) => ({ at, run: () => playStorySound('poof', { pitch: 1 + 0.15 * i }) })),
    { at: 6400, run: () => playVoice('creak') },                                // the door swings shut
    { at: 6900, run: () => { playStorySound('snore'); resetWindows(1.2); } },   // dozing; windows sink low
    { at: 8200, run: () => playVoice('caw', { pitch: 1.05 }) },
  ];

  // The shared frame adds the dim, the closing shimmer, and the ambience dip (frame.js).
  return playStoryTimeline({ dim, dimTo: 0.8, reduced, tracks, cues, reset: resetScene, onDone });

  // Puts every story element back to rest; the windows are already low, ready to be lit again.
  function resetScene() {
    for (const { eye, pupil, lid } of eyes) {
      eye.setAttribute('opacity', '0');
      pupil.removeAttribute('transform');
      lid.removeAttribute('transform');
      lid.removeAttribute('opacity');
    }
    doorPanel.removeAttribute('transform');
    doorPanel.removeAttribute('opacity');
    doorYawn.removeAttribute('transform');
    for (const element of [...rings, ...zs]) element.setAttribute('opacity', '0');
  }
}

// The value of a choreography table at time `ms`, eased between rows and held past either end.
function keyframes(table, ms) {
  if (ms <= table[0][0]) return table[0][1];
  for (let i = 1; i < table.length; i++) {
    const [time, value] = table[i];
    if (ms <= time) {
      const [lastTime, lastValue] = table[i - 1];
      return lerp(lastValue, value, ease((ms - lastTime) / (time - lastTime)));
    }
  }
  return table.at(-1)[1];
}
