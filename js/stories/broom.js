// Broomstick Flight (Phase 2 story): three taps wake the witch's broom, then an 8.5 s flight on the
// pausable timeline (spec.md › Broomstick Flight).
//   Taps:             1 a twitch, 2 a shake and gold dust, 3 a rattle; the bristles glow brighter
//                     each time. Progress holds until the story plays (decided Oct 22).
//   Beginning 0–2 s:  the scene dims; the broom lifts off the wall and the witch fades in riding it.
//   Middle    2–6 s:  she swoops up to the moon, loops once in front of it with a flock of bats,
//                     and sweeps away across the sky.
//   End       6–8.5 s: she glides down to the door; she fades, the broom leans back in place, a
//                     shimmer sweeps the scene, and the raven caws.
// Reduced motion keeps the beats and length: the witch fades up above the door, a pulsing
// silhouette appears in front of the moon while the bats fade in, then the broom fades back.

import { clock } from '../clock.js';
import { catmullRom, ease, lerp } from '../timeline.js';
import { BAT_SHAPE, emitSparkle } from '../effects.js';
import { playStorySound, playTapSound, playVoice } from '../soundscape.js';
import { noteProgress } from '../hints.js';
import { reducedMotion } from '../motion.js';
import { finishTrigger, playStoryTimeline } from './frame.js';

const SVG_NS = 'http://www.w3.org/2000/svg';
const TAPS_TO_FLY = 3;
const DOOR = { x: 266, y: 445 };              // where the broom leans, takes off, and lands
const HOVER = { x: 266, y: 400 };             // above the door (reduced motion)
const MOON = { x: 300, y: 144 };
const GLOW_BY_TAP = [0, 0.4, 0.75, 1];
const TAU = Math.PI * 2;
const byId = id => document.getElementById(id);

// Middle: up the right of the moon, one loop in front of it, then away to the left (scene units).
const TO_THE_MOON = [
  [276, 392], [312, 330], [338, 255], [342, 190], [335, 128], [300, 98], [262, 120], [258, 165],
  [292, 190], [334, 170], [330, 118], [260, 100], [180, 110], [100, 150], [52, 205],
];
// End: a glide down across the clearing to the door.
const HOME = [[52, 205], [80, 280], [150, 350], [220, 420], [266, 445]];

// ---------- Trigger: three taps ----------

let taps = 0;
let onAllTaps = () => true;

// main.js passes the function that starts the story; it returns false if a story couldn't start.
export function initBroom({ onComplete }) {
  onAllTaps = onComplete;
}

// A tap on the broom: each one shakes it harder and makes its bristles glow brighter.
export function tapBroom() {
  if (taps >= TAPS_TO_FLY) return;                  // already lifting off
  taps++;
  const reduced = reducedMotion();
  const swing = [6, 12, 18][taps - 1];
  byId('broom').querySelector('.art').animate(reduced
    ? [{ opacity: 1 }, { opacity: 0.5 }, { opacity: 1 }]
    : [{ transform: 'rotate(0deg)' }, { transform: `rotate(${-swing}deg)` }, { transform: `rotate(${swing * 0.7}deg)` },
       { transform: `rotate(${-swing * 0.4}deg)` }, { transform: 'rotate(0deg)' }],
  { duration: 380 + taps * 80, easing: 'ease-out' });
  byId('broom-glow').setAttribute('opacity', String(GLOW_BY_TAP[taps]));
  playTapSound('rustle', { pitch: 1 + 0.2 * (taps - 1) });
  if (!reduced && taps >= 2) {
    for (let i = 0; i < taps * 6; i++) emitSparkle(262 + (Math.random() - 0.5) * 26, 474 + (Math.random() - 0.5) * 10, 'gold');
  }
  noteProgress();
  // A twinkle and a beat to see the rattle, then lift-off. If a story is already playing, the broom settles.
  if (taps === TAPS_TO_FLY) finishTrigger({ start: onAllTaps, reset: resetBroom, chime: true });
}

function resetBroom() {
  taps = 0;
  byId('broom-glow').setAttribute('opacity', '0');
}

// ---------- The story sequence ----------

export function playBroomstickFlight({ onDone }) {
  const reduced = reducedMotion();
  const witch = byId('witch-flight');
  const batGroup = byId('flight-bats');
  const broomArt = byId('broom').querySelector('.art');
  const glow = byId('broom-glow');
  const dim = byId('story-dim');
  const bats = makeBats(batGroup, 6);
  const trail = [];                                  // recent witch positions, newest first
  let previous = { ...DOOR };
  let heading = 0;

  // Places the witch. When steering, she points along her direction of travel and is mirrored
  // when flying left, so she stays upright (as in the loop over the moon).
  function placeWitch(x, y, scale, opacity, { steer = true } = {}) {
    const dx = x - previous.x;
    const dy = y - previous.y;
    if (steer && !reduced && Math.hypot(dx, dy) > 0.3) heading = Math.atan2(dy, dx) * 180 / Math.PI;
    if (!steer || reduced) heading = 0;
    const mirror = Math.abs(heading) > 90 ? ' scale(1 -1)' : '';
    witch.setAttribute('transform', `translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${heading.toFixed(1)})${mirror} scale(${scale.toFixed(3)})`);
    witch.setAttribute('opacity', Math.max(0, Math.min(1, opacity)).toFixed(3));
    previous = { x, y };
    trail.unshift({ x, y });
    if (trail.length > 48) trail.pop();
  }

  // The flock follows the witch's recent path, each bat a little further back, wings beating.
  function flyBats(opacity) {
    batGroup.setAttribute('opacity', Math.max(0, Math.min(1, opacity)).toFixed(3));
    const seconds = clock.now / 1000;
    bats.forEach((bat, i) => {
      const point = trail[Math.min(trail.length - 1, 8 + i * 6)] ?? previous;
      const side = (i % 2 ? -1 : 1) * (4 + i * 2);
      const flap = 0.3 + 0.7 * Math.abs(Math.sin(seconds * TAU * 6 + i));
      bat.setAttribute('transform', `translate(${(point.x + side).toFixed(1)} ${(point.y + (i - 2.5) * 4).toFixed(1)}) scale(0.8 ${(0.8 * flap).toFixed(3)})`);
    });
  }

  // Reduced motion: the bats sit still around the moon and only fade.
  function batsAroundMoon(opacity) {
    batGroup.setAttribute('opacity', Math.max(0, Math.min(1, opacity)).toFixed(3));
    bats.forEach((bat, i) => {
      const angle = (i / bats.length) * TAU;
      bat.setAttribute('transform', `translate(${(MOON.x + Math.cos(angle) * 62).toFixed(1)} ${(MOON.y + Math.sin(angle) * 40).toFixed(1)}) scale(0.8)`);
    });
  }

  const tracks = [
    // ---------- Beginning (0–2 s) ----------
    { at: 0, duration: 600, update: p => {                        // the leaning broom hands over to the flying one
      broomArt.setAttribute('opacity', (1 - p).toFixed(3));
      glow.setAttribute('opacity', (1 - p).toFixed(3));
    } },
    { at: 0, duration: 2000, update: p => {
      if (reduced) {
        placeWitch(HOVER.x, HOVER.y, 0.85, (p - 0.1) / 0.5, { steer: false });
        return;
      }
      const x = lerp(DOOR.x, TO_THE_MOON[0][0], ease(p));
      const y = lerp(DOOR.y, TO_THE_MOON[0][1], ease(p)) + Math.sin(p * Math.PI * 3) * 2 * p;
      placeWitch(x, y, 0.85, p / 0.3, { steer: false });
    } },

    // ---------- Middle (2–6 s) ----------
    { at: 2000, duration: 4000, update: p => {
      if (reduced) {
        if (p < 0.15) {
          placeWitch(HOVER.x, HOVER.y, 0.85, 1 - p / 0.15, { steer: false });
        } else {
          const pulse = 0.8 + 0.2 * Math.sin(TAU * p * 4);
          placeWitch(MOON.x, MOON.y, 0.8, ((p - 0.15) / 0.15) * pulse, { steer: false });
        }
        batsAroundMoon(Math.sin(Math.PI * p));
        return;
      }
      const [x, y] = catmullRom(TO_THE_MOON, p);
      placeWitch(x, y, 0.85, 1);
      const behind = trail[3] ?? previous;
      emitSparkle(behind.x + (Math.random() - 0.5) * 8, behind.y + 6, 'gold');
      flyBats(p / 0.1);
    } },

    // ---------- End (6–8.5 s) ----------
    { at: 6000, duration: 1900, update: p => {
      if (reduced) {
        placeWitch(MOON.x, MOON.y, 0.8, 1 - p / 0.3, { steer: false });
        return;
      }
      const [x, y] = catmullRom(HOME, 1 - (1 - p) ** 2);   // eases into the landing
      placeWitch(x, y, 0.85, p < 0.85 ? 1 : 1 - (p - 0.85) / 0.15);
      flyBats(1 - p * 2);
    } },
    { at: 7700, duration: 700, update: p => broomArt.setAttribute('opacity', ease(p).toFixed(3)) },
  ];

  const cues = [
    { at: 0, run: () => playStorySound('whoosh', { duration: 1.8, panFrom: 0.2, panTo: 0.5 }) },
    { at: 2100, run: () => playStorySound('flutter', { duration: 3.6, panFrom: 0.6, panTo: -0.6 }) },
    { at: 2600, run: () => playVoice('cackle') },
    { at: 3400, run: () => playStorySound('shimmer') },
    { at: 4600, run: () => playStorySound('whoosh', { duration: 1.4, panFrom: 0.5, panTo: -0.7 }) },
    { at: 6300, run: () => playStorySound('whoosh', { duration: 1.5, panFrom: -0.6, panTo: 0.4 }) },
    { at: 7900, run: () => playStorySound('thump') },
    { at: 8100, run: () => playVoice('caw', { pitch: 0.85 }) },
  ];

  // The shared frame adds the dim, the closing shimmer, and the ambience dip (frame.js).
  return playStoryTimeline({ dim, dimTo: 0.55, reduced, tracks, cues, reset: resetScene, onDone });

  // Puts every story element back to rest and lets the broom be woken again.
  function resetScene() {
    witch.setAttribute('opacity', '0');
    witch.setAttribute('transform', `translate(${DOOR.x} ${DOOR.y})`);
    batGroup.setAttribute('opacity', '0');
    batGroup.replaceChildren();
    broomArt.removeAttribute('opacity');
    resetBroom();
  }
}

function makeBats(group, count) {
  group.replaceChildren();
  return Array.from({ length: count }, () => {
    const bat = document.createElementNS(SVG_NS, 'path');
    bat.setAttribute('d', BAT_SHAPE);
    group.append(bat);
    return bat;
  });
}
