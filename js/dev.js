// Developer tools. Nothing here runs for Users unless the URL asks for it.
//
//   ?show=scene   skip the start screen
//   ?show=pause   open on the paused scene
//   ?show=hint    open on the scene with the longest hint in the raven's bubble
//   &bubble=left|above   force the hint bubble's placement (to compare the two)
//   ?dev=1        readout (viewport, safe area, visible part of the scene) and tap-area checks:
//                 every tap area outlined, problems in red, and listed in the readout

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

export function initDevView() {
  document.documentElement.classList.add('dev');
  updateDevView();
  addEventListener('resize', updateDevView);
}

function updateDevView() {
  const stage = document.getElementById('stage').getBoundingClientRect();
  const visible = visibleSceneArea(stage.width, stage.height);
  const taps = checkTapAreas(stage);
  const [top, right, bottom, left] = safeAreaInsets();
  const round = Math.round;
  const list = names => (names.length ? names.join(', ') : 'none');

  document.getElementById('dev-readout').textContent =
    `viewport ${innerWidth} × ${innerHeight}  (stage ${round(stage.width)} × ${round(stage.height)})\n` +
    `safe area t${top} r${right} b${bottom} l${left}\n` +
    `visible scene y ${round(visible.top)}–${round(visible.bottom)}, x ${round(visible.left)}–${round(visible.right)}\n` +
    `tap areas ${taps.count} · smallest ${round(taps.smallest.width)}×${round(taps.smallest.height)} px\n` +
    `under ${MIN_TAP_PX} px: ${list(taps.small)} · clipped: ${list(taps.clipped)}\n` +
    `overlapping: ${list(taps.overlapping)}`;
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
