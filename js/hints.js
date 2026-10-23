// The raven's hints: one hint ladder per story, timed on the pausable clock, shown in the speech
// bubble above the raven. Hints advance with time spent without progress, aim at the next story
// not yet found, and stop once every story has played (spec.md › Hints).

import { clock } from './clock.js';
import { playVoice, setOneShotFilter } from './soundscape.js';
import { reducedMotion } from './motion.js';

// ---------- Hint content ----------

// Each step appears `afterMs` after the previous one (or after the last progress).
const LADDERS = {
  cauldron: [
    // Timing revised after playtest 1 (was 20 / 45 / 45 s): Users were guessing and getting frustrated.
    { afterMs: 12000, text: "The witch's pot is cold tonight. It's hungry for things that glow." },
    { afterMs: 30000, text: 'Three gifts the forest keeps: one in the ring, one where water sleeps, one where the spider creeps.' },
    { afterMs: 30000, text: 'Ground, then water, then the web. Mix them wrong and the pot will burp.' },
  ],
};
const STORY_ORDER = ['cauldron'];   // Phase 2 adds Broomstick Flight and The Cottage Wakes
const HINT_SHOW_MS = 8000;          // the brief asks for at least 6 s
const REACTION_SHOW_MS = 3000;

// What the raven says when tapped with no hint given yet, and after every story has played.
const FLAVOR_BEFORE = ['Caw! A fine night for mischief.', 'The witch is out. Her pot is not.', 'Hrrk. Something in this clearing wants stirring.'];
const FLAVOR_AFTER = ['Caw! Again! Again!', 'Hrk. That spirit owes me a feather.'];

// ---------- Hint state ----------

let started = false;
const playedStories = new Set();
let step = 0;                  // next hint step on the current story's ladder
let lastHint = null;           // repeated when the raven is tapped
let flavorCount = 0;
let cancelNextHint = () => {};
let cancelHide = () => {};

// Begins the hint countdown (once, at the first Enter).
export function startHints() {
  if (started) return;
  started = true;
  setOneShotFilter(name => name === 'caw' && isHintShowing());   // no ambient caw over a hint
  scheduleNextHint();
}

// A correct ingredient resets the countdown to the next hint.
export function noteProgress() {
  scheduleNextHint();
}

// While a story plays, the raven stays quiet.
export function noteStoryStarted() {
  cancelNextHint();
  hideHint();
}

// Once a story has played, its hints stop and the ladder moves to the next unfound story.
export function noteStoryPlayed(story) {
  playedStories.add(story);
  step = 0;
  lastHint = null;
  scheduleNextHint();
}

// A short reaction (e.g. to a wrong ingredient), without a caw.
export function showReaction(text) {
  say(text, REACTION_SHOW_MS, { caw: false });
}

// Tapping the raven: it caws, bobs, and repeats the latest hint, or says a flavor line.
export function tapRaven() {
  playVoice('caw', { channel: 'interactions' });
  const art = document.querySelector('#raven .art');
  art.animate(reducedMotion()
    ? [{ opacity: 1 }, { opacity: 0.55 }, { opacity: 1 }]
    : [{ transform: 'translateY(0)' }, { transform: 'translateY(-6px)' }, { transform: 'translateY(0)' }],
  { duration: 300, easing: 'ease-out' });
  const flavor = currentStory() ? FLAVOR_BEFORE : FLAVOR_AFTER;
  say(lastHint ?? flavor[flavorCount++ % flavor.length], HINT_SHOW_MS, { caw: false });
}

// The longest hint text, for the dev view's layout check (?show=hint).
export function longestHint() {
  return Object.values(LADDERS).flat().map(step => step.text).reduce((a, b) => (b.length > a.length ? b : a));
}

// The raven flaps its wing as it speaks (revision R2), so eyes go to where the words come from.
// Reduced motion: its eye flashes instead.
function ravenSpeaks() {
  if (reducedMotion()) {
    document.querySelector('#raven .raven-eye-glow').animate(
      [{ opacity: 1 }, { opacity: 0.2 }, { opacity: 1 }, { opacity: 0.2 }, { opacity: 1 }], { duration: 700 });
    return;
  }
  document.querySelector('#raven .raven-wing').animate(
    [{ transform: 'rotate(0deg)' }, { transform: 'rotate(-38deg)' }, { transform: 'rotate(0deg)' },
     { transform: 'rotate(-28deg)' }, { transform: 'rotate(0deg)' }], { duration: 650, easing: 'ease-in-out' });
}

function currentStory() {
  return STORY_ORDER.find(story => !playedStories.has(story)) ?? null;
}

function scheduleNextHint() {
  cancelNextHint();
  cancelNextHint = () => {};
  const story = currentStory();
  if (!story || step >= LADDERS[story].length) return;
  cancelNextHint = clock.after(LADDERS[story][step].afterMs, () => {
    lastHint = LADDERS[story][step].text;
    step++;
    say(lastHint, HINT_SHOW_MS);
    scheduleNextHint();
  });
}

// Shows text in the bubble for `durationMs` of clock time (so a pause holds it on screen).
function say(text, durationMs, { caw = true } = {}) {
  if (caw) playVoice('caw', { channel: 'interactions' });
  ravenSpeaks();
  showHint(text);
  cancelHide();
  cancelHide = clock.after(durationMs, () => {
    hideHint();
    cancelHide = () => {};
  });
}

// ---------- The speech bubble ----------

const stage = document.getElementById('stage');
const bubble = document.getElementById('hint-bubble');
const hintText = document.getElementById('hint-text');
const ravenArt = document.querySelector('#raven .art');
const ravenHalo = document.getElementById('raven-halo');
const playPauseButton = document.getElementById('play-pause');

const GAP = 10;               // px between the bubble's tail and the raven
const EDGE = 12;              // px kept clear of the stage edges
const MAX_WIDTH = 320;        // px

// While the bubble shows, the raven's halo brightens, linking the words to the bird.
export function showHint(message) {
  hintText.textContent = message;
  bubble.classList.add('is-visible');
  ravenHalo.setAttribute('opacity', '0.95');
  positionHint();
}

function hideHint() {
  bubble.classList.remove('is-visible');
  ravenHalo.setAttribute('opacity', '0.55');
}

function isHintShowing() {
  return bubble.classList.contains('is-visible');
}

// Places the bubble above the raven, between the Play/Pause button and the right edge, with its
// tail pointing at the bird. Positions are relative to the stage, so the bubble follows the raven
// wherever the scene's crop puts it.
export function positionHint() {
  if (!isHintShowing()) return;

  const stageBox = stage.getBoundingClientRect();
  const bird = toStage(ravenArt.getBoundingClientRect(), stageBox);
  const button = toStage(playPauseButton.getBoundingClientRect(), stageBox);
  const left = button.height > 0 ? Math.max(EDGE, button.right + 8) : EDGE;
  const width = Math.min(MAX_WIDTH, stageBox.width - left - EDGE);
  bubble.style.width = `${width}px`;
  const height = bubble.offsetHeight;
  const top = Math.max(EDGE, bird.top - GAP - height);
  bubble.style.left = `${left}px`;
  bubble.style.top = `${top}px`;
  const birdCentre = (bird.left + bird.right) / 2;
  bubble.style.setProperty('--tail', `${clamp(birdCentre - left, 14, width - 14)}px`);
}

addEventListener('resize', positionHint);

function toStage(box, stageBox) {
  return {
    left: box.left - stageBox.left,
    right: box.right - stageBox.left,
    top: box.top - stageBox.top,
    bottom: box.bottom - stageBox.top,
    height: box.height,
  };
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}
