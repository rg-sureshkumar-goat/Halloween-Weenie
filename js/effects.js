// Ambient effects: fog, candlelight, chimney smoke and cauldron bubbles, fireflies, bats, plus the
// sparkles, window flares, and brew bubbles that the story and objects trigger.
// Every effect moves on the shared clock, so stopping the clock freezes all of them at once.
// Each has a reduced-motion version, chosen on every frame so a settings change applies live.
// Motion uses only transform and opacity (no blur filters), and particle counts are capped.

import { clock } from './clock.js';
import { reducedMotion } from './motion.js';

const SVG_NS = 'http://www.w3.org/2000/svg';
const VIEWBOX = { width: 390, height: 844 };
const TAU = Math.PI * 2;

let started = false;

// Sparkles emitted by stories (the smoke spirit's trail), drawn on the particle canvas with the
// fireflies. Each drifts and fades over SPARKLE_LIFE_S. Capped so a long trail can't pile up.
const SPARKLE_LIFE_S = 0.9;
const MAX_SPARKLES = 120;
const sparkles = [];

export function emitSparkle(x, y) {
  sparkles.push({
    x, y,
    vx: (Math.random() - 0.5) * 14,      // scene units per second
    vy: 6 + Math.random() * 10,           // drifts down a little
    born: clock.now / 1000,
  });
  if (sparkles.length > MAX_SPARKLES) sparkles.shift();
}

// Called when the User taps Enter. Safe to call more than once.
export function startEffects() {
  if (started) return;
  started = true;
  const effects = [fog(), candlelight(), smokeAndBubbles(), fireflies(), bats()];
  clock.onTick((step, now) => {
    const reduced = reducedMotion();
    const seconds = now / 1000;
    for (const update of effects) update(seconds, reduced);
  });
}

// ---------- Fog: two bands drifting at different speeds ----------
// Reduced motion: the bands stay put and slowly fade in and out.

function fog() {
  const back = document.getElementById('fog-back');
  const front = document.getElementById('fog-front');
  return (t, reduced) => {
    if (reduced) {
      back.setAttribute('transform', 'translate(0 0)');
      front.setAttribute('transform', 'translate(0 0)');
      back.setAttribute('opacity', fixed(0.7 + 0.3 * Math.sin(TAU * t / 12)));
      front.setAttribute('opacity', fixed(0.7 + 0.3 * Math.sin(TAU * t / 12 + 2)));
    } else {
      back.setAttribute('transform', `translate(${fixed(Math.sin(TAU * t / 40) * 35)} 0)`);
      front.setAttribute('transform', `translate(${fixed(Math.sin(TAU * t / 28 + 1) * 45)} 0)`);
      back.setAttribute('opacity', '1');
      front.setAttribute('opacity', '1');
    }
  };
}

// ---------- Candlelight: irregular flicker of the window glows ----------
// Three sine waves at unrelated speeds never line up, so the flicker never visibly repeats.
// A tapped window (flareWindow) dips dark for a moment, then flares bright and wide.
// Reduced motion: a slow, gentle pulse.

const WINDOWS = { left: 34, right: 34, attic: 26 };   // window name → resting glow radius
const flareStarts = {};                                // window name → clock seconds of last tap

export function flareWindow(name) {
  flareStarts[name] = clock.now / 1000;
}

function candlelight() {
  const glows = Object.keys(WINDOWS).map(name => ({ name, glow: document.getElementById(`window-glow-${name}`) }));
  return (t, reduced) => {
    glows.forEach(({ name, glow }, i) => {
      const level = reduced
        ? 0.88 + 0.08 * Math.sin(TAU * t / 6 + i * 2)
        : 0.82 + 0.1 * Math.sin(t * 7.3 + i) + 0.06 * Math.sin(t * 13.7 + i * 2) + 0.04 * Math.sin(t * 23.1 + i * 3);
      const age = t - (flareStarts[name] ?? -Infinity);
      let flare = 0;                                   // -1 = dipped dark … +1 = full flare
      if (age < 0.15) flare = -age / 0.15;
      else if (age < 0.6) flare = Math.sin(Math.PI * (age - 0.15) / 0.45);
      const opacity = flare < 0 ? clamp(level * (1 + 0.65 * flare), 0.25, 1) : clamp(level + 0.3 * flare, 0.6, 1);
      glow.setAttribute('opacity', fixed(opacity));
      glow.setAttribute('r', fixed(WINDOWS[name] + 12 * Math.max(flare, 0)));
    });
  };
}

// ---------- Chimney smoke and cauldron bubbles ----------
// Smoke: six puffs at staggered points in a 7 s rise-and-fade cycle, drifting left past the roof.
// Bubbles: four bubbles on independent cycles rise a little, swell, and pop. Their size and color
// follow the brew's progress (setBrewBubbles), and a cauldron tap sends up one big bubble.
// Reduced motion: three still puffs that only change opacity; bubbles off; the tap bubble swells
// in place without rising.

let bubbleSize = 1;
let burstStart = null;

export function setBrewBubbles({ size, color }) {
  bubbleSize = size;
  document.getElementById('cauldron-bubbles').setAttribute('fill', color);
  document.getElementById('cauldron-burst').setAttribute('fill', color);
}

export function burstBubble() {
  burstStart = clock.now / 1000;
}

function smokeAndBubbles() {
  const puffs = [...document.querySelectorAll('#chimney-smoke circle')];
  const bubbles = [...document.querySelectorAll('#cauldron-bubbles circle')];
  const burst = document.getElementById('cauldron-burst');
  const SMOKE_CYCLE_S = 7;
  const CHIMNEY = { x: 156, y: 246 };

  return (t, reduced) => {
    puffs.forEach((puff, i) => {
      if (reduced) {
        const still = i % 2 === 0;                 // keep every other puff, frozen partway up
        const age = 0.2 + i * 0.1;
        placePuff(puff, age);
        puff.setAttribute('opacity', still ? fixed(0.14 + 0.08 * Math.sin(TAU * t / 8 + i)) : '0');
        return;
      }
      const age = (t / SMOKE_CYCLE_S + i / puffs.length) % 1;
      placePuff(puff, age);
      puff.setAttribute('opacity', fixed(0.32 * Math.sin(Math.PI * age)));
    });

    bubbles.forEach((bubble, i) => {
      if (reduced) {
        bubble.setAttribute('opacity', '0');
        return;
      }
      const period = 1.6 + i * 0.27;               // seconds per bubble cycle
      const cycles = t / period + i * 0.37;
      const phase = cycles % 1;
      const x = 195 + (pseudoRandom(i * 97 + Math.floor(cycles)) - 0.5) * 52;
      const popping = phase > 0.85;
      const radius = (popping ? 3 + ((phase - 0.85) / 0.15) * 2 : 1.5 + phase * 1.8) * bubbleSize;
      bubble.setAttribute('cx', fixed(x));
      bubble.setAttribute('cy', fixed(580 - phase * 8 * bubbleSize));
      bubble.setAttribute('r', fixed(radius));
      bubble.setAttribute('opacity', fixed(popping ? 0.85 * (1 - (phase - 0.85) / 0.15) : 0.85));
    });

    // One big bubble after a cauldron tap: swells for 0.55 s, then pops.
    const age = burstStart === null ? Infinity : t - burstStart;
    if (age > 0.7) {
      burst.setAttribute('opacity', '0');
      burstStart = null;
    } else {
      burst.setAttribute('cy', fixed(reduced ? 578 : 578 - age * 18));
      burst.setAttribute('r', fixed(3 + age * 9));
      burst.setAttribute('opacity', fixed(age < 0.55 ? 0.9 : 0.9 * (1 - (age - 0.55) / 0.15)));
    }
  };

  // age 0 → just leaving the chimney; age 1 → high, wide, and faded
  function placePuff(puff, age) {
    puff.setAttribute('cx', fixed(CHIMNEY.x - age * 34 + Math.sin(age * 6) * 4));
    puff.setAttribute('cy', fixed(CHIMNEY.y - age * 95));
    puff.setAttribute('r', fixed(5 + age * 13));
  }
}

// ---------- Fireflies (and story sparkles): glowing dots on the particle canvas ----------
// Drawn on the particle canvas, mapped to scene coordinates with the same "slice" fit as the SVGs.
// Reduced motion: the dots stay in place and pulse slowly.

function fireflies() {
  const canvas = document.getElementById('particles');
  const ctx = canvas.getContext('2d');
  const sprite = glowSprite();
  const homes = [
    { x: 85, y: 668, count: 8 },   // above the mushroom ring
    { x: 300, y: 666, count: 7 },  // above the pond
  ];
  const flies = homes.flatMap(home => Array.from({ length: home.count }, () => ({
    home,
    reachX: 24 + Math.random() * 22,
    reachY: 12 + Math.random() * 14,
    speeds: [0.15, 0.31, 0.12, 0.27].map(base => base + Math.random() * 0.25),
    phases: Array.from({ length: 5 }, () => Math.random() * TAU),
    blink: 0.5 + Math.random() * 0.7,
  })));

  let view = fitCanvas(canvas);
  addEventListener('resize', () => { view = fitCanvas(canvas); });

  return (t, reduced) => {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.setTransform(view.ratio, 0, 0, view.ratio, view.offsetX, view.offsetY);
    ctx.globalCompositeOperation = 'lighter';

    for (const fly of flies) {
      const [s1, s2, s3, s4] = fly.speeds;
      const [p1, p2, p3, p4, pBlink] = fly.phases;
      const time = reduced ? 0 : t;                // frozen position when motion is reduced
      const x = fly.home.x + fly.reachX * (0.6 * Math.sin(time * s1 + p1) + 0.4 * Math.sin(time * s2 + p2));
      const y = fly.home.y + fly.reachY * (0.6 * Math.sin(time * s3 + p3) + 0.4 * Math.sin(time * s4 + p4));
      const blinkSpeed = reduced ? fly.blink * 0.4 : fly.blink;
      const glow = Math.max(0, Math.sin(t * TAU * blinkSpeed / 2 + pBlink));
      ctx.globalAlpha = 0.15 + 0.85 * glow;
      ctx.drawImage(sprite, x - 6, y - 6, 12, 12);
    }

    // Story sparkles: drift, shrink, and fade; expired ones are dropped.
    while (sparkles.length && t - sparkles[0].born > SPARKLE_LIFE_S) sparkles.shift();
    for (const sparkle of sparkles) {
      const age = t - sparkle.born;
      const life = 1 - age / SPARKLE_LIFE_S;
      const size = 3 + 7 * life;
      ctx.globalAlpha = life;
      ctx.drawImage(sprite, sparkle.x + sparkle.vx * age - size / 2, sparkle.y + sparkle.vy * age - size / 2, size, size);
    }
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
  };
}

// Sizes the canvas to its on-screen box (sharp up to 2× pixel density) and returns the transform
// from scene units to canvas pixels, matching preserveAspectRatio="xMidYMid slice".
function fitCanvas(canvas) {
  const box = canvas.getBoundingClientRect();
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.round(box.width * dpr);
  canvas.height = Math.round(box.height * dpr);
  const scale = Math.max(box.width / VIEWBOX.width, box.height / VIEWBOX.height);
  return {
    ratio: dpr * scale,
    offsetX: dpr * (box.width - VIEWBOX.width * scale) / 2,
    offsetY: dpr * (box.height - VIEWBOX.height * scale) / 2,
  };
}

// A soft yellow-green glow, drawn once and reused for every firefly.
function glowSprite() {
  const sprite = document.createElement('canvas');
  sprite.width = sprite.height = 64;
  const g = sprite.getContext('2d');
  const gradient = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  gradient.addColorStop(0, 'rgba(245, 255, 190, 1)');
  gradient.addColorStop(0.12, 'rgba(225, 255, 130, 0.95)');
  gradient.addColorStop(0.4, 'rgba(190, 255, 100, 0.25)');
  gradient.addColorStop(1, 'rgba(190, 255, 100, 0)');
  g.fillStyle = gradient;
  g.fillRect(0, 0, 64, 64);
  return sprite;
}

// ---------- Bats: a small flock crosses the moon every 15–40 s ----------
// The first flight comes 6 s after Enter so Users see it early.
// Reduced motion: the bats fade in on the moon briefly instead of flying.

const BAT_SHAPE = 'M0 0 C-2 -3 -5 -4 -9 -3 C-7 -1 -8 1 -10 2 C-6 1 -3 2 0 4 C3 2 6 1 10 2 C8 1 7 -1 9 -3 C5 -4 2 -3 0 0 Z';
const FLOCK = [
  { dx: 0, dy: 0, size: 1 },
  { dx: 16, dy: -10, size: 0.85 },
  { dx: 22, dy: 9, size: 0.9 },
  { dx: 38, dy: -4, size: 0.75 },
  { dx: 50, dy: 12, size: 0.7 },
];
const FLIGHT_MS = 5000;
const FADE_MS = 3000;

function bats() {
  const group = document.getElementById('bats');
  const shapes = FLOCK.map(() => {
    const bat = document.createElementNS(SVG_NS, 'path');
    bat.setAttribute('d', BAT_SHAPE);
    group.append(bat);
    return bat;
  });
  let flightStart = null;

  function scheduleFlight(delayMs) {
    clock.after(delayMs, () => {
      flightStart = clock.now;
      scheduleFlight(15000 + Math.random() * 25000);
    });
  }
  scheduleFlight(6000);

  return (t, reduced) => {
    if (flightStart === null) return;
    const elapsed = clock.now - flightStart;
    const duration = reduced ? FADE_MS : FLIGHT_MS;
    if (elapsed > duration) {
      group.setAttribute('opacity', '0');
      flightStart = null;
      return;
    }
    const progress = elapsed / duration;

    if (reduced) {
      group.setAttribute('opacity', fixed(0.9 * Math.sin(Math.PI * progress)));
      shapes.forEach((bat, i) => {
        const { dx, dy, size } = FLOCK[i];
        bat.setAttribute('transform', `translate(${272 + dx} ${128 + dy}) scale(${size})`);
      });
      return;
    }

    group.setAttribute('opacity', '1');
    shapes.forEach((bat, i) => {
      const { dx, dy, size } = FLOCK[i];
      const x = 430 - progress * 500 + dx;                       // right to left, across the moon
      const y = 150 + dy + Math.sin(progress * TAU * 1.5 + i) * 6;
      const flap = 0.3 + 0.7 * Math.abs(Math.sin(t * TAU * 6 + i));
      bat.setAttribute('transform', `translate(${fixed(x)} ${fixed(y)}) scale(${size} ${fixed(size * flap)})`);
    });
  };
}

// ---------- Helpers ----------

function fixed(value) {
  return value.toFixed(2);
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

// Repeatable 0–1 value for a given integer, so each bubble cycle gets a stable random position.
function pseudoRandom(n) {
  const s = Math.sin(n * 12.9898) * 43758.5453;
  return s - Math.floor(s);
}
