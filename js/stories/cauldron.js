// Cauldron Brew (Phase 1 story), 8.5 s, run on the pausable timeline (spec.md › Cauldron Brew).
//   Beginning 0–2 s:   gold flash, the scene dims, the brew swells gold and boils over (small shake).
//   Middle    2–6 s:   a grinning smoke spirit bursts out, loops the cottage, and crosses the moon.
//   End       6–8.5 s: it spirals back into the pot, POP, everything settles, a shimmer, the raven caws.
// Reduced motion keeps the same beats and length: the spirit fades up above the pot and pulses
// instead of flying, the flash, puff, and shimmer only fade, and nothing shakes or swells.

import { playTimeline, ease, lerp, scaleAbout } from '../timeline.js';
import { emitSparkle } from '../effects.js';
import { setAmbienceLevel } from '../audio.js';
import { playStorySound, playStoryVoice } from '../soundscape.js';
import { reducedMotion } from '../motion.js';

export const STORY_LENGTH_MS = 8500;

const POT = { x: 195, y: 575 };
const BREW = { x: 195, y: 580 };
const FIRE = { x: 196, y: 662 };
const HOVER = { x: 195, y: 455 };          // where the spirit floats in the reduced-motion version
const TAU = Math.PI * 2;

// The spirit's flight after bursting out: around the cottage, then across the moon (scene units).
const FLIGHT = [
  [195, 470], [110, 420], [75, 340], [105, 255], [195, 200], [285, 235],
  [325, 305], [370, 240], [350, 165], [300, 128], [248, 140], [210, 200],
];

export function playCauldronBrew({ onDone }) {
  const reduced = reducedMotion();
  const byId = id => document.getElementById(id);
  const brew = byId('cauldron-brew');
  const gold = byId('brew-gold');
  const spill = byId('brew-spill');
  const fire = byId('fire');
  const spirit = byId('spirit');
  const spiritGlow = spirit.querySelector('.spirit-glow');
  const dim = byId('story-dim');
  const flash = byId('story-flash');
  const puff = byId('story-puff');
  const shimmer = byId('story-shimmer');
  const ravenArt = document.querySelector('#raven .art');
  const shakeLayers = ['scene-interactive', 'particles', 'scene-front'].map(byId);
  let previous = { x: POT.x, y: POT.y };   // last spirit position, for tilt and the sparkle trail

  const set = (element, attribute, value) => element.setAttribute(attribute, typeof value === 'number' ? value.toFixed(3) : value);
  const swellBrew = scale => {
    set(brew, 'transform', scaleAbout(BREW.x, BREW.y, scale));
    set(gold, 'transform', scaleAbout(BREW.x, BREW.y, scale));
  };

  // Places the spirit, tilting it toward its direction of travel and leaving a sparkle trail.
  function placeSpirit(x, y, scale, opacity, { trail = true } = {}) {
    const tilt = reduced ? 0 : Math.max(-20, Math.min(20, (x - previous.x) * 2.5));
    set(spirit, 'transform', `translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${tilt.toFixed(1)}) scale(${scale.toFixed(3)})`);
    set(spirit, 'opacity', Math.max(0, opacity));
    if (trail && !reduced && opacity > 0.3) emitSparkle(x + (Math.random() - 0.5) * 10 * scale, y + 30 * scale);
    previous = { x, y };
  }

  const tracks = [
    // ---------- Beginning (0–2 s) ----------
    { at: 0, duration: 450, update: p => {
      set(flash, 'opacity', Math.sin(Math.PI * p) * 0.9);
      set(flash, 'transform', reduced ? '' : scaleAbout(POT.x, POT.y, lerp(0.4, 2.2, p)));
    } },
    { at: 0, duration: 1000, update: p => set(dim, 'opacity', 0.6 * ease(p)) },
    { at: 200, duration: 700, update: p => set(gold, 'opacity', ease(p)) },
    { at: 200, duration: 1600, update: p => {
      if (reduced) return;
      swellBrew(lerp(1, 1.25, ease(p)));
      set(fire, 'transform', scaleAbout(FIRE.x, FIRE.y, lerp(1, 1.35, ease(p))));
    } },
    { at: 1100, duration: 900, update: p => {
      set(spill, 'opacity', Math.min(1, p / 0.2));
      set(spill, 'transform', reduced ? '' : `translate(0 ${(22 * ease(p)).toFixed(2)})`);
    } },
    { at: 1450, duration: 350, update: p => {
      if (reduced) return;
      const strength = 3 * (1 - p);       // fades to nothing, so the final frame is perfectly still
      const offset = `translate(${(Math.sin(p * 60) * strength).toFixed(2)}px, ${(Math.cos(p * 47) * strength).toFixed(2)}px)`;
      for (const layer of shakeLayers) layer.style.transform = p < 1 ? offset : '';
    } },

    // ---------- Middle (2–6 s) ----------
    { at: 2000, duration: 4000, update: p => {
      const ms = p * 4000;
      if (reduced) {
        const pulse = 0.6 + 0.4 * Math.sin(TAU * ms / 900);
        set(spiritGlow, 'opacity', pulse);
        placeSpirit(HOVER.x, HOVER.y, 1, Math.min(1, ms / 600), { trail: false });
        return;
      }
      if (ms < 600) {                       // burst up out of the pot, growing
        const q = ease(ms / 600);
        placeSpirit(POT.x, lerp(POT.y, FLIGHT[0][1], q), lerp(0.25, 0.9, q), Math.min(1, ms / 250));
      } else {                              // loop the cottage, then cross the moon
        const [x, y] = catmullRom(FLIGHT, (ms - 600) / 3400);
        placeSpirit(x, y, lerp(0.9, 1.2, Math.min(1, (ms - 600) / 600)), 1);
      }
    } },

    // ---------- End (6–8.5 s) ----------
    { at: 6000, duration: 1200, update: p => {
      if (reduced) {
        placeSpirit(HOVER.x, HOVER.y, 1, 1 - p, { trail: false });
        return;
      }
      // Spiral down: the centre sinks to the pot while the radius shrinks to nothing.
      const last = FLIGHT[FLIGHT.length - 1];
      const radius = 60 * (1 - p);
      const angle = -Math.PI / 2 + p * TAU * 2.5;
      const centreX = lerp(last[0], POT.x, ease(p));
      const centreY = lerp(last[1] + 36, POT.y - 10, ease(p));
      const x = centreX + Math.cos(angle) * radius;
      const y = centreY + Math.sin(angle) * radius * 0.6;
      placeSpirit(x, y, lerp(1.2, 0.2, p), p < 0.85 ? 1 : 1 - (p - 0.85) / 0.15);
    } },
    { at: 7200, duration: 300, update: p => {
      set(flash, 'opacity', Math.sin(Math.PI * p) * 0.6);
      set(flash, 'transform', reduced ? '' : scaleAbout(POT.x, POT.y, lerp(0.3, 1.2, p)));
    } },
    { at: 7200, duration: 800, update: p => {
      set(puff, 'opacity', 0.8 * (1 - p));
      set(puff, 'transform', reduced ? '' : scaleAbout(POT.x, POT.y - 10, lerp(0.5, 1.8, ease(p))));
    } },
    { at: 7200, duration: 800, update: p => {
      set(gold, 'opacity', 1 - p);
      set(spill, 'opacity', 1 - p);
      if (!reduced) {
        swellBrew(lerp(1.25, 1, ease(p)));
        set(fire, 'transform', scaleAbout(FIRE.x, FIRE.y, lerp(1.35, 1, ease(p))));
      }
    } },
    { at: 7200, duration: 1000, update: p => set(dim, 'opacity', 0.6 * (1 - ease(p))) },
    { at: 7600, duration: 900, update: p => {
      if (reduced) {
        set(shimmer, 'transform', 'translate(-5 0) scale(2 1)');      // a gentle full-width wash
        set(shimmer, 'opacity', Math.sin(Math.PI * p) * 0.6);
      } else {
        set(shimmer, 'transform', `translate(${lerp(-220, 410, p).toFixed(1)} 0)`);   // sweeps left to right
        set(shimmer, 'opacity', Math.sin(Math.PI * p));
      }
    } },
    { at: 7800, duration: 600, update: p => {
      if (!reduced) set(ravenArt, 'transform', `translate(0 ${(-5 * Math.abs(Math.sin(TAU * p))).toFixed(2)})`);
    } },
  ];

  const cues = [
    { at: 0, run: () => { setAmbienceLevel(0.4); playStorySound('rumble', { duration: 2 }); } },
    { at: 2000, run: () => playStorySound('whoosh', { duration: 1.4, panFrom: -0.7, panTo: 0.7 }) },
    { at: 2400, run: () => playStoryVoice('cackle') },
    { at: 3400, run: () => playStorySound('shimmer') },
    { at: 4400, run: () => playStorySound('whoosh', { duration: 1.2, panFrom: 0.7, panTo: -0.5 }) },
    { at: 6000, run: () => playStorySound('fwoop', { duration: 1.2 }) },
    { at: 7200, run: () => playStorySound('pop') },
    { at: 7600, run: () => { setAmbienceLevel(1, 0.8); playStorySound('shimmer'); } },
    { at: 7900, run: () => playStoryVoice('caw', { pitch: 0.85 }) },
    { at: 8150, run: () => playStoryVoice('caw', { pitch: 0.8 }) },
  ];

  return playTimeline({
    length: STORY_LENGTH_MS,
    tracks,
    cues,
    onDone: elapsed => {
      resetScene();
      onDone(elapsed);
    },
  });

  // Puts every story element back to its resting state, whatever frame the story ended on.
  function resetScene() {
    for (const element of [dim, flash, puff, shimmer, spirit, gold, spill]) set(element, 'opacity', 0);
    for (const element of [brew, gold, fire, spill, flash, puff, ravenArt]) element.removeAttribute('transform');
    set(spiritGlow, 'opacity', 1);
    for (const layer of shakeLayers) layer.style.transform = '';
  }
}

// Smooth curve through the waypoints (Catmull-Rom), u from 0 (first point) to 1 (last point).
function catmullRom(points, u) {
  const last = points.length - 1;
  const scaled = Math.min(Math.max(u, 0), 1) * last;
  const i = Math.min(Math.floor(scaled), last - 1);
  const t = scaled - i;
  const p0 = points[Math.max(i - 1, 0)];
  const p1 = points[i];
  const p2 = points[i + 1];
  const p3 = points[Math.min(i + 2, last)];
  const blend = (a, b, c, d) =>
    0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t * t + (-a + 3 * b - 3 * c + d) * t * t * t);
  return [blend(p0[0], p1[0], p2[0], p3[0]), blend(p0[1], p1[1], p2[1], p3[1])];
}
