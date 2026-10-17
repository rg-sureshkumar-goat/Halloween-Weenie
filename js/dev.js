// Developer tools. Nothing here runs for Users unless the URL asks for it.
//
//   ?show=scene   skip the start screen
//   ?show=pause   open on the paused scene
//   ?show=hint    open on the scene with the longest hint in the raven's bubble
//   &bubble=left|above   force the hint bubble's placement (to compare the two)
//   ?motion=reduce       force the reduced-motion versions of every effect (read by motion.js)
//   ?dev=1        readout (viewport, safe area, visible part of the scene), tap-area checks
//                 (every tap area outlined, problems in red and listed), frame-rate stats, an audio
//                 line (context state, output level, recent one-shots), and window.devClock for
//                 fast-forwarding time from the console

import { clock } from './clock.js';
import { audioContext, masterOutput } from './audio.js';
import { oneShotLog } from './soundscape.js';
import { forceHintSide } from './hints.js';

const VIEWBOX = { width: 390, height: 844 };
const MIN_TAP_PX = 44;
// Longest hint in the brief (Weenie Project-Brief.md › Hints, level 2), for layout checks.
const LONGEST_HINT = 'Three gifts the forest keeps: one in the ring, one where water sleeps, one where the spider creeps.';

export function applyShowParam({ setState, showHint }) {
  const params = new URLSearchParams(location.search);
  const show = params.get('show');
  const bubble = params.get('bubble');
  if (bubble === 'left' || bubble === 'above') forceHintSide(bubble);
  if (show === 'scene' || show === 'hint') setState({ mode: 'SCENE' });
  if (show === 'pause') setState({ mode: 'SCENE', paused: true });
  if (show === 'hint') showHint(LONGEST_HINT);
}

let layoutText = '';
let framesText = 'frames: measuring…';
let audioText = 'audio: not started (tap Enter)';
let levelMeter = null;

export function initDevView() {
  document.documentElement.classList.add('dev');
  window.devClock = clock;   // console access: devClock.advance(7000) fast-forwards 7 s
  updateDevView();
  addEventListener('resize', updateDevView);
  requestAnimationFrame(measureFrames);
}

function renderReadout() {
  document.getElementById('dev-readout').textContent = `${layoutText}\n${framesText}\n${audioText}`;
}

// Frame-rate stats over the last 2 s while the clock runs: average fps and the longest frame.
// Uses its own frame loop so it measures real frames, independent of the clock it is checking.
const FRAME_WINDOW_MS = 2000;
let frameLog = [];
let lastFrame = null;
let lastReport = 0;

function measureFrames(timestamp) {
  if (clock.running && lastFrame !== null) {
    frameLog.push({ at: timestamp, length: timestamp - lastFrame });
    frameLog = frameLog.filter(frame => frame.at > timestamp - FRAME_WINDOW_MS);
  }
  if (!clock.running) frameLog = [];
  lastFrame = timestamp;

  if (timestamp - lastReport > 500) {
    lastReport = timestamp;
    if (!clock.running) {
      framesText = 'frames: clock stopped';
    } else if (frameLog.length > 10) {
      const span = (frameLog.at(-1).at - frameLog[0].at) / 1000;
      const fps = (frameLog.length - 1) / span;
      const longest = Math.max(...frameLog.map(frame => frame.length));
      framesText = `frames: ${fps.toFixed(0)} fps avg · longest ${longest.toFixed(0)} ms (last 2 s)`;
    }
    describeAudio();
    renderReadout();
  }
  requestAnimationFrame(measureFrames);
}

// Context state, the master output level (proof that sound is actually being produced), and the
// last few ambient one-shots with whether each came from a file or was generated.
function describeAudio() {
  const ctx = audioContext();
  if (!ctx) return;
  if (!levelMeter) {
    levelMeter = ctx.createAnalyser();
    levelMeter.fftSize = 2048;
    masterOutput().connect(levelMeter);
  }
  const samples = new Float32Array(levelMeter.fftSize);
  levelMeter.getFloatTimeDomainData(samples);
  const rms = Math.sqrt(samples.reduce((sum, v) => sum + v * v, 0) / samples.length);
  const level = rms > 0 ? `${(20 * Math.log10(rms)).toFixed(0)} dB` : 'silent';
  const recent = oneShotLog.map(shot => `${shot.name}@${shot.atSeconds}s(${shot.source})`).join(' ') || 'none yet';
  audioText = `audio: ${ctx.state} · level ${level} · one-shots: ${recent}`;
}

function updateDevView() {
  const stage = document.getElementById('stage').getBoundingClientRect();
  const visible = visibleSceneArea(stage.width, stage.height);
  const taps = checkTapAreas(stage);
  const [top, right, bottom, left] = safeAreaInsets();
  const round = Math.round;
  const list = names => (names.length ? names.join(', ') : 'none');

  layoutText =
    `viewport ${innerWidth} × ${innerHeight}  (stage ${round(stage.width)} × ${round(stage.height)})\n` +
    `safe area t${top} r${right} b${bottom} l${left}\n` +
    `visible scene y ${round(visible.top)}–${round(visible.bottom)}, x ${round(visible.left)}–${round(visible.right)}\n` +
    `tap areas ${taps.count} · smallest ${round(taps.smallest.width)}×${round(taps.smallest.height)} px\n` +
    `under ${MIN_TAP_PX} px: ${list(taps.small)} · clipped: ${list(taps.clipped)}\n` +
    `overlapping: ${list(taps.overlapping)}`;
  renderReadout();
}

// Measures every tap area on screen: too small, cropped off the stage, or overlapping another.
// Problem areas get the .dev-problem class so styles.css outlines them in red.
function checkTapAreas(stage) {
  const areas = [...document.querySelectorAll('.scene-object')].map(object => {
    const hit = object.querySelector('.hit');
    return { name: object.getAttribute('aria-label'), hit, box: hit.getBoundingClientRect() };
  });
  const small = [], clipped = [], overlapping = [];
  let smallest = { width: Infinity, height: Infinity };

  for (const area of areas) {
    const { box } = area;
    area.problem = false;
    if (box.width * box.height < smallest.width * smallest.height) smallest = box;
    if (box.width < MIN_TAP_PX - 0.5 || box.height < MIN_TAP_PX - 0.5) {
      small.push(area.name);
      area.problem = true;
    }
    if (box.left < stage.left || box.right > stage.right || box.top < stage.top || box.bottom > stage.bottom) {
      clipped.push(area.name);
      area.problem = true;
    }
  }
  for (let i = 0; i < areas.length; i++) {
    for (let j = i + 1; j < areas.length; j++) {
      const a = areas[i].box, b = areas[j].box;
      if (a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom) {
        overlapping.push(`${areas[i].name} + ${areas[j].name}`);
        areas[i].problem = areas[j].problem = true;
      }
    }
  }
  for (const area of areas) area.hit.classList.toggle('dev-problem', area.problem);
  return { count: areas.length, smallest, small, clipped, overlapping };
}

// With preserveAspectRatio="xMidYMid slice", the scene scales up until it covers the
// stage, then crops equally from both sides of the longer axis. Returns the visible
// part of the scene in viewBox units.
function visibleSceneArea(stageWidth, stageHeight) {
  const scale = Math.max(stageWidth / VIEWBOX.width, stageHeight / VIEWBOX.height);
  const width = stageWidth / scale;
  const height = stageHeight / scale;
  return {
    left: (VIEWBOX.width - width) / 2,
    right: (VIEWBOX.width + width) / 2,
    top: (VIEWBOX.height - height) / 2,
    bottom: (VIEWBOX.height + height) / 2,
  };
}

// Reads the CSS env() safe-area insets through a hidden probe element.
function safeAreaInsets() {
  const probe = getComputedStyle(document.getElementById('inset-probe'));
  return ['Top', 'Right', 'Bottom', 'Left'].map(side => parseFloat(probe['padding' + side]) || 0);
}
