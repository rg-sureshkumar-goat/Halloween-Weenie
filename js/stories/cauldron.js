// Cauldron Brew (Phase 1 story): its three ingredient triggers and progress, then the 8.5 s
// sequence on the pausable timeline (spec.md › Cauldron Brew).
//   Beginning 0–2 s:   gold flash, the scene dims, the brew swells gold and boils over (small shake).
//   Middle    2–6 s:   a grinning smoke spirit bursts out, loops the cottage, and crosses the moon.
//   End       6–8.5 s: it spirals back into the pot, POP, everything settles, a shimmer, the raven caws.
// Reduced motion keeps the same beats and length: the spirit fades up above the pot and pulses
// instead of flying, the flash, puff, and shimmer only fade, and nothing shakes or swells.

import { playTimeline, ease, lerp, scaleAbout } from '../timeline.js';
import { burstBubble, emitSparkle, setBrewBubbles } from '../effects.js';
import { setAmbienceLevel } from '../audio.js';
import { playStorySound, playTapSound, playVoice } from '../soundscape.js';
import { noteProgress, showReaction } from '../hints.js';
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

const byId = id => document.getElementById(id);

// ---------- Ingredients and progress ----------
// Ingredients must arrive in order: toadstool (ground), moonflower (water), spider silk (web).
// Each correct one turns the brew a new color, lights a rune, and grows the bubbles and the fire's
// glow; the third starts the story. A wrong one still flies in, but the pot burps it back and all
// progress resets: the runes go dark, the brew clears, and every used ingredient grows back.
// Reduced motion: ingredients fade out in place instead of flying; spores and sparkles become glows.

const ORDER = ['toadstool', 'moonflower', 'web'];
const POT_MOUTH = { x: 195, y: 576 };
const INGREDIENT_CENTRES = { toadstool: { x: 128, y: 697 }, moonflower: { x: 246, y: 690 }, web: { x: 100, y: 385 } };
const HALO_OPACITY = { toadstool: 1, moonflower: 1, web: 0.5 };
const PROGRESS_LOOKS = [            // indexed by how many correct ingredients are in the pot
  { brew: null, bubbles: { size: 1, color: '#6E9E5A' }, fireGlow: 62 },
  { brew: 'brew-green', bubbles: { size: 1.25, color: '#9DFF8E' }, fireGlow: 70 },
  { brew: 'brew-purple', bubbles: { size: 1.45, color: '#C9A2FF' }, fireGlow: 78 },
  { brew: 'brew-purple', bubbles: { size: 1.6, color: '#FFE58A' }, fireGlow: 86 },
];
const RUNE_DARK = '#3B2F5C';
const RUNE_LIT = '#E7CCFF';

let progress = 0;
let ingredientInFlight = false;
const inPot = new Set();
let onAllIngredients = () => {};

// main.js passes the function that starts the story once all three ingredients are in.
export function initCauldron({ onComplete }) {
  onAllIngredients = onComplete;
}

// A tap on an ingredient: its own feedback, then a trip into the pot, where the order is checked.
export function offerIngredient(name) {
  if (ingredientInFlight || inPot.has(name)) return;
  ingredientInFlight = true;
  const object = byId(name);
  const hadFocus = document.activeElement === object;
  setTappable(object, false);
  INGREDIENT_TRIPS[name](reducedMotion(), () => {
    ingredientInFlight = false;
    inPot.add(name);
    object.style.visibility = 'hidden';
    playTapSound('plop');
    if (hadFocus) byId('cauldron').focus({ preventScroll: true });
    if (name !== ORDER[progress]) {
      burp();
      return;
    }
    progress++;
    showProgress(progress);
    noteProgress();
    if (progress === ORDER.length) onAllIngredients();
  });
}

// A tap on the cauldron itself: one big bubble and a gurgle that rises with the brew's progress.
export function tapCauldron() {
  burstBubble();
  playTapSound('gurgle', { pitch: 1 + 0.15 * progress });
}

// Brew color, lit runes, bubble size and color, and fire glow for a progress level (0–3).
function showProgress(level) {
  const look = PROGRESS_LOOKS[level];
  setBrewBubbles(look.bubbles);
  byId('fire-halo').setAttribute('r', look.fireGlow);
  for (let rune = 1; rune <= ORDER.length; rune++) {
    const lit = rune <= level;
    byId(`rune-${rune}`).setAttribute('stroke', lit ? RUNE_LIT : RUNE_DARK);
    fadeTo(byId(`rune-glow-${rune}`), lit ? 1 : 0);
  }
  for (const layer of ['brew-green', 'brew-purple']) fadeTo(byId(layer), layer === look.brew ? 1 : 0);
}

// Wrong order: a sour purple puff, a "blorp", a wobble, and a fresh start.
function burp() {
  const reduced = reducedMotion();
  const puff = byId('burp-puff');
  playTapSound('blorp');
  playTimeline({
    length: 900,
    tracks: [{ at: 0, duration: 900, update: p => {
      puff.setAttribute('opacity', (0.85 * (1 - p)).toFixed(3));
      if (!reduced) puff.setAttribute('transform', `translate(0 ${(-20 * p).toFixed(1)}) ${scaleAbout(195, 556, lerp(0.5, 1.7, ease(p)))}`);
    } }],
    onDone: () => puff.removeAttribute('transform'),
  });
  byId('cauldron').querySelector('.art').animate(reduced
    ? [{ opacity: 1 }, { opacity: 0.6 }, { opacity: 1 }]
    : [{ transform: 'scale(1)' }, { transform: 'scale(1.08, 0.92)' }, { transform: 'scale(0.96, 1.05)' }, { transform: 'scale(1)' }],
  { duration: 450, easing: 'ease-out' });
  showReaction('Hrk. Not like that.');
  progress = 0;
  showProgress(0);
  regrowIngredients();
}

// Every ingredient in the pot grows back in place (after a burp, and at the end of the story).
function regrowIngredients() {
  const returning = [...inPot];
  if (!returning.length) return;
  inPot.clear();
  playTapSound('twinkle');
  const reduced = reducedMotion();
  for (const name of returning) {
    const object = byId(name);
    const art = object.querySelector('.art');
    const halo = byId(`${name}-halo`);
    const centre = INGREDIENT_CENTRES[name];
    resetIngredientLook(name);
    art.setAttribute('opacity', '0');
    object.style.visibility = '';
    playTimeline({
      length: 600,
      tracks: [{ at: 0, duration: 600, update: p => {
        art.setAttribute('opacity', ease(p).toFixed(3));
        if (!reduced) art.setAttribute('transform', scaleAbout(centre.x, centre.y, lerp(0.3, 1, ease(p))));
        halo.setAttribute('opacity', (HALO_OPACITY[name] * ease(p)).toFixed(3));
      } }],
      onDone: () => {
        art.removeAttribute('opacity');
        art.removeAttribute('transform');
        setTappable(object, true);
      },
    });
  }
}

// After the story: the brew clears, the runes go dark, and the ingredients grow back.
function settleAfterStory() {
  progress = 0;
  showProgress(0);
  regrowIngredients();
}

// Takes an object out of (or puts it back in) touch, keyboard, and screen-reader reach.
function setTappable(object, tappable) {
  object.setAttribute('tabindex', tappable ? '0' : '-1');
  object.style.pointerEvents = tappable ? '' : 'none';
  if (tappable) object.removeAttribute('aria-disabled');
  else object.setAttribute('aria-disabled', 'true');
}

function resetIngredientLook(name) {
  if (name === 'moonflower') {
    const art = byId('moonflower').querySelector('.art');
    art.querySelector('.bud').setAttribute('opacity', '1');
    art.querySelector('.bloom').setAttribute('opacity', '0');
    art.querySelector('.bloom').removeAttribute('transform');
  }
  if (name === 'web') byId('silk-thread').setAttribute('opacity', '0');
}

// Fades an element's opacity to `target` over `ms` on the clock.
function fadeTo(element, target, ms = 600) {
  const from = parseFloat(element.getAttribute('opacity') ?? '1');
  if (Math.abs(from - target) < 0.001) return;
  playTimeline({
    length: ms,
    tracks: [{ at: 0, duration: ms, update: p => element.setAttribute('opacity', lerp(from, target, ease(p)).toFixed(3)) }],
  });
}

// ---------- Each ingredient's trip into the pot ----------

const INGREDIENT_TRIPS = { toadstool: tripToadstool, moonflower: tripMoonflower, web: tripWeb };

// Toadstool: a spore puff and a "poink", a little squash, then an arc up and into the pot.
function tripToadstool(reduced, onLanded) {
  const art = byId('toadstool').querySelector('.art');
  const halo = byId('toadstool-halo');
  const start = INGREDIENT_CENTRES.toadstool;
  playTapSound('poink');
  if (!reduced) {
    for (let i = 0; i < 14; i++) emitSparkle(start.x + (Math.random() - 0.5) * 30, start.y - 9 + (Math.random() - 0.5) * 14);
  }
  playTimeline({
    length: 1150,
    tracks: [
      { at: 0, duration: 250, update: p => {
        if (reduced) halo.setAttribute('r', (28 + 8 * Math.sin(Math.PI * p)).toFixed(1));
        else art.setAttribute('transform', scaleAbout(start.x, 705, 1 + 0.15 * Math.sin(Math.PI * p)));
      } },
      { at: 250, duration: 900, update: p => {
        halo.setAttribute('opacity', (1 - p).toFixed(3));
        if (reduced) {
          art.setAttribute('opacity', (1 - p).toFixed(3));
          return;
        }
        const [x, y] = quadratic(start, { x: 150, y: 515 }, POT_MOUTH, ease(p));
        art.setAttribute('transform', `translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(${lerp(1, 0.55, p).toFixed(3)}) translate(${-start.x} ${-start.y})`);
      } },
    ],
    onDone: () => {
      art.removeAttribute('transform');
      art.removeAttribute('opacity');
      halo.setAttribute('r', '28');
      onLanded();
    },
  });
}

// Moonflower: the petals open with a chime, then it drifts to the pot trailing sparkles.
function tripMoonflower(reduced, onLanded) {
  const art = byId('moonflower').querySelector('.art');
  const bud = art.querySelector('.bud');
  const bloom = art.querySelector('.bloom');
  const halo = byId('moonflower-halo');
  const start = INGREDIENT_CENTRES.moonflower;
  playTapSound('chime');
  playTimeline({
    length: 1450,
    tracks: [
      { at: 0, duration: 300, update: p => {
        bud.setAttribute('opacity', (1 - p).toFixed(3));
        bloom.setAttribute('opacity', p.toFixed(3));
        if (!reduced) bloom.setAttribute('transform', scaleAbout(246, 685, lerp(0.6, 1.15, ease(p))));
      } },
      { at: 350, duration: 1100, update: p => {
        halo.setAttribute('opacity', (1 - p).toFixed(3));
        if (reduced) {
          art.setAttribute('opacity', (1 - p).toFixed(3));
          return;
        }
        const [x, y] = quadratic(start, { x: 262, y: 585 }, POT_MOUTH, ease(p));
        const sway = Math.sin(p * Math.PI * 3) * 6 * (1 - p);
        art.setAttribute('transform', `translate(${(x + sway).toFixed(1)} ${y.toFixed(1)}) scale(${lerp(1, 0.6, p).toFixed(3)}) translate(${-start.x} ${-start.y})`);
        emitSparkle(x + sway, y + 6);
      } },
    ],
    onDone: () => {
      art.removeAttribute('transform');
      art.removeAttribute('opacity');
      onLanded();
    },
  });
}

// Spider silk: the web shimmers with a twang, then a silver thread spools from it into the pot.
function tripWeb(reduced, onLanded) {
  const art = byId('web').querySelector('.art');
  const halo = byId('web-halo');
  const thread = byId('silk-thread');
  const length = thread.getTotalLength();
  thread.setAttribute('stroke-dasharray', `${length.toFixed(1)} ${length.toFixed(1)}`);
  playTapSound('twang');
  playTimeline({
    length: 1450,
    tracks: [
      { at: 0, duration: 400, update: p => {                    // shimmer
        art.setAttribute('opacity', (0.55 + 0.45 * Math.cos(p * Math.PI * 4)).toFixed(3));
        halo.setAttribute('opacity', (0.5 + 0.4 * Math.sin(Math.PI * p)).toFixed(3));
      } },
      { at: 400, duration: 700, update: p => {                  // the thread spools toward the pot
        thread.setAttribute('opacity', reduced ? ease(p).toFixed(3) : '1');
        thread.setAttribute('stroke-dashoffset', reduced ? '0' : (length * (1 - ease(p))).toFixed(1));
      } },
      { at: 1100, duration: 350, update: p => {                 // the web fades; the thread slips in
        art.setAttribute('opacity', (1 - p).toFixed(3));
        halo.setAttribute('opacity', (0.5 * (1 - p)).toFixed(3));
        thread.setAttribute('opacity', (1 - p).toFixed(3));
        if (!reduced) thread.setAttribute('stroke-dashoffset', (-length * ease(p)).toFixed(1));
      } },
    ],
    onDone: () => {
      art.removeAttribute('opacity');
      thread.setAttribute('opacity', '0');
      onLanded();
    },
  });
}

// Point on a quadratic curve from a through control to b, t from 0 to 1.
function quadratic(a, control, b, t) {
  const u = 1 - t;
  return [u * u * a.x + 2 * u * t * control.x + t * t * b.x, u * u * a.y + 2 * u * t * control.y + t * t * b.y];
}

// ---------- The story sequence ----------

export function playCauldronBrew({ onDone }) {
  const reduced = reducedMotion();
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
    { at: 2400, run: () => playVoice('cackle') },
    { at: 3400, run: () => playStorySound('shimmer') },
    { at: 4400, run: () => playStorySound('whoosh', { duration: 1.2, panFrom: 0.7, panTo: -0.5 }) },
    { at: 6000, run: () => playStorySound('fwoop', { duration: 1.2 }) },
    { at: 7200, run: () => { playStorySound('pop'); settleAfterStory(); } },
    { at: 7600, run: () => { setAmbienceLevel(1, 0.8); playStorySound('shimmer'); } },
    { at: 7900, run: () => playVoice('caw', { pitch: 0.85 }) },
    { at: 8150, run: () => playVoice('caw', { pitch: 0.8 }) },
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
