// Virtual Hallo-weenie: boot, app state, and input wiring.
// Checkpoint 2: state machine skeleton, Enter, Play/Pause (visual + input lock only), and one
// input path for every scene object. Sound, motion, and the pausable clock arrive at CP3–CP4.

import { showHint, positionHint } from './hints.js';
import { applyShowParam, initDevView } from './dev.js';

const stage = document.getElementById('stage');
const sceneInteractive = document.getElementById('scene-interactive');
const playPauseButton = document.getElementById('play-pause');
const enterButton = document.getElementById('enter-button');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');

// App state: START → SCENE → STORY → SCENE, with `paused` layered over SCENE or STORY.
const state = { mode: 'START', paused: false };

// The one place state changes. The stage's data attributes drive which UI shows (styles.css),
// and the scene is made inert whenever objects must not respond, so the lock rule lives here only.
function setState(changes) {
  Object.assign(state, changes);
  stage.dataset.mode = state.mode;
  stage.dataset.paused = String(state.paused);
  sceneInteractive.inert = !canInteract();
  playPauseButton.setAttribute('aria-label', state.paused ? 'Play' : 'Pause');
  positionHint();
}

function canInteract() {
  return state.mode === 'SCENE' && !state.paused;
}

// ---------- Start screen and Play/Pause ----------

document.getElementById('motion-note').hidden = !reducedMotion.matches;
reducedMotion.addEventListener('change', () => {
  document.getElementById('motion-note').hidden = !reducedMotion.matches;
});

enterButton.addEventListener('click', () => {
  setState({ mode: 'SCENE' });
  playPauseButton.focus({ preventScroll: true });
});

playPauseButton.addEventListener('click', () => {
  setState({ paused: !state.paused });
});

// ---------- Scene input: one path for touch, mouse, and keyboard ----------

sceneInteractive.addEventListener('click', event => {
  const object = event.target.closest('.scene-object');
  if (object) activateObject(object);
});

sceneInteractive.addEventListener('keydown', event => {
  if (event.key !== 'Enter' && event.key !== ' ') return;
  const object = event.target.closest('.scene-object');
  if (!object) return;
  event.preventDefault();
  activateObject(object);
});

function activateObject(object) {
  if (!canInteract()) return;
  pokeObject(object);
}

// Placeholder feedback until each object gets its own at CP6: a quick wiggle,
// or a brief dim-and-return when the device asks for reduced motion.
function pokeObject(object) {
  const keyframes = reducedMotion.matches
    ? [{ opacity: 1 }, { opacity: 0.5 }, { opacity: 1 }]
    : [{ transform: 'scale(1)' }, { transform: 'scale(1.08) rotate(-2deg)' }, { transform: 'scale(1)' }];
  object.animate(keyframes, { duration: 320, easing: 'ease-out' });
}

// ---------- Boot ----------

setState({});
applyShowParam({ setState, showHint });
if (new URLSearchParams(location.search).get('dev') === '1') initDevView();
