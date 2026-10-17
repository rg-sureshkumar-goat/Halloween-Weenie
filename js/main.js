// Virtual Hallo-weenie: boot, app state, and input wiring.
// So far: state machine, Enter (starts sound and motion), Play/Pause of everything, auto-pause,
// ambient effects and soundscape, and one input path for every scene object.

import { clock } from './clock.js';
import { startEffects } from './effects.js';
import { reducedMotion, onReducedMotionChange } from './motion.js';
import { startAudio, pauseAudio, resumeAudio, onAudioInterrupted } from './audio.js';
import { startAmbience, playUiSound } from './soundscape.js';
import { showHint, positionHint } from './hints.js';
import { applyShowParam, initDevView } from './dev.js';

const stage = document.getElementById('stage');
const sceneInteractive = document.getElementById('scene-interactive');
const playPauseButton = document.getElementById('play-pause');
const enterButton = document.getElementById('enter-button');
const motionNote = document.getElementById('motion-note');
const soundNote = document.getElementById('sound-note');

// App state: START → SCENE → STORY → SCENE, with `paused` layered over SCENE or STORY.
const state = { mode: 'START', paused: false };

// The one place state changes. The stage's data attributes drive which UI shows (styles.css),
// the scene is made inert whenever objects must not respond, and everything that moves or makes
// sound runs only while the scene is showing and not paused. Lock and pause rules live here only.
function setState(changes) {
  Object.assign(state, changes);
  stage.dataset.mode = state.mode;
  stage.dataset.paused = String(state.paused);
  sceneInteractive.inert = !canInteract();
  playPauseButton.setAttribute('aria-label', state.paused ? 'Play' : 'Pause');

  const inScene = state.mode !== 'START';
  if (inScene) startEffects();
  if (inScene && !state.paused) {
    clock.start();
    resumeAudio();
    setAnimationsPaused(false);
  } else {
    clock.stop();
    pauseAudio();
    setAnimationsPaused(true);
  }
  positionHint();
}

function canInteract() {
  return state.mode === 'SCENE' && !state.paused;
}

// Freezes or resumes any running Web Animations (object feedback; story animations later).
function setAnimationsPaused(paused) {
  for (const animation of document.getAnimations()) {
    if (paused) animation.pause();
    else animation.play();
  }
}

// ---------- Start screen ----------

motionNote.hidden = !reducedMotion();
onReducedMotionChange(reduced => { motionNote.hidden = !reduced; });
// Where iOS can't keep Web Audio playing on silent, say so up front.
soundNote.textContent = 'audioSession' in navigator
  ? 'Best with sound on.'
  : 'Best with sound on and silent mode off.';

// The AudioContext must be created inside this tap: iOS only starts audio from a user gesture.
enterButton.addEventListener('click', () => {
  startAudio();
  setState({ mode: 'SCENE' });
  startAmbience();
  playUiSound('enter');
  playPauseButton.focus({ preventScroll: true });
});

// ---------- Play/Pause and auto-pause ----------

playPauseButton.addEventListener('click', () => {
  if (state.paused) {
    setState({ paused: false });
    playUiSound('play');
  } else {
    playUiSound('pause');       // its tick finishes before audio suspends
    setState({ paused: true });
  }
});

// Locking the phone or switching apps pauses everything; returning shows the paused screen.
document.addEventListener('visibilitychange', () => {
  if (document.hidden) pauseFromOutside();
});
// So does the system taking the audio away (a phone call, Siri).
onAudioInterrupted(pauseFromOutside);

function pauseFromOutside() {
  if (state.mode !== 'START' && !state.paused) setState({ paused: true });
}

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
  const keyframes = reducedMotion()
    ? [{ opacity: 1 }, { opacity: 0.5 }, { opacity: 1 }]
    : [{ transform: 'scale(1)' }, { transform: 'scale(1.08) rotate(-2deg)' }, { transform: 'scale(1)' }];
  object.animate(keyframes, { duration: 320, easing: 'ease-out' });
}

// ---------- Boot ----------

setState({});
applyShowParam({ setState, showHint });   // dev shortcuts skip Enter, so they run without sound
if (new URLSearchParams(location.search).get('dev') === '1') initDevView();
