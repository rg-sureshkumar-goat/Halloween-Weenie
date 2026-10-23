// Virtual Hallo-weenie: boot, app state, and input wiring.
// State machine, Enter (starts sound and motion), Play/Pause of everything, auto-pause, ambient
// effects and soundscape, one input path that gives every scene object its own response, the
// stories with their triggers (Cauldron Brew, Broomstick Flight), and the raven's hints.

import { clock } from './clock.js';
import { startEffects } from './effects.js';
import { reducedMotion, onReducedMotionChange } from './motion.js';
import { startAudio, pauseAudio, resumeAudio, onAudioInterrupted } from './audio.js';
import { startAmbience, playUiSound } from './soundscape.js';
import { initCauldron, offerIngredient, playCauldronBrew, tapCauldron } from './stories/cauldron.js';
import { initBroom, playBroomstickFlight, tapBroom } from './stories/broom.js';
import { flickerWindow, tapBlueMushrooms } from './objects.js';
import { noteStoryPlayed, noteStoryStarted, positionHint, showHint, startHints, tapRaven } from './hints.js';
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
  if (inScene) {
    startEffects();
    startHints();
  }
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

// ---------- Credits panel ----------

const startScreen = document.getElementById('start-screen');
const creditsButton = document.getElementById('credits-button');
const creditsPanel = document.getElementById('credits-panel');
const creditsClose = document.getElementById('credits-close');

function setCreditsOpen(open) {
  creditsPanel.hidden = !open;
  startScreen.inert = open;              // nothing behind the panel can be reached while it's open
  (open ? creditsClose : creditsButton).focus({ preventScroll: true });
}

creditsButton.addEventListener('click', () => setCreditsOpen(true));
creditsClose.addEventListener('click', () => setCreditsOpen(false));
creditsPanel.addEventListener('keydown', event => {
  if (event.key === 'Escape') setCreditsOpen(false);
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

// ---------- Stories ----------

// Each story's sequence and the object that gets keyboard focus when it ends.
const STORIES = {
  cauldron: { play: playCauldronBrew, focusAfter: 'cauldron' },
  broom: { play: playBroomstickFlight, focusAfter: 'broom' },
};
const storyRuns = [];   // { story, ms } measured on the clock, for the dev readout

// Plays a story: called the moment its trigger completes (or by a dev trigger). Every object locks
// for the whole story (only Play/Pause still works); at the end the scene unlocks, the raven moves
// on to the next unplayed story, and keyboard focus returns to the story's object.
function startStory(id) {
  if (!canInteract()) return false;
  const story = STORIES[id];
  const startedAt = clock.now;
  setState({ mode: 'STORY' });
  noteStoryStarted(id);
  story.play({
    onDone: () => {
      storyRuns.push({ story: id, ms: clock.now - startedAt });
      setState({ mode: 'SCENE' });
      noteStoryPlayed(id);
      document.getElementById(story.focusAfter).focus({ preventScroll: true });
    },
  });
  return true;
}
initCauldron({ onComplete: () => startStory('cauldron') });
initBroom({ onComplete: () => startStory('broom') });

// ---------- Scene input: one path for touch, mouse, and keyboard ----------

sceneInteractive.addEventListener('click', event => {
  const object = event.target.closest('.scene-object');
  if (object) activateObject(object, event);
});

sceneInteractive.addEventListener('keydown', event => {
  if (event.key !== 'Enter' && event.key !== ' ') return;
  const object = event.target.closest('.scene-object');
  if (!object) return;
  event.preventDefault();
  activateObject(object, event);
});

// Every tappable object's own response, by element id.
const OBJECT_ACTIONS = {
  toadstool: () => offerIngredient('toadstool'),
  moonflower: () => offerIngredient('moonflower'),
  web: () => offerIngredient('web'),
  cauldron: tapCauldron,
  'blue-mushrooms': tapBlueMushrooms,
  raven: tapRaven,
  'window-left': () => flickerWindow('left'),
  'window-right': () => flickerWindow('right'),
  'window-attic': () => flickerWindow('attic'),
  broom: tapBroom,
};

function activateObject(object, event) {
  if (!canInteract()) return;
  OBJECT_ACTIONS[object.id]?.(event);
}

// ---------- Boot ----------

setState({});
applyShowParam({ setState, showHint });   // dev shortcuts skip Enter, so they run without sound
if (new URLSearchParams(location.search).get('dev') === '1') {
  initDevView({ playStory: startStory, storyRuns });
}
