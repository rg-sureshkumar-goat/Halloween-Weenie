// Raven hint bubble: rendering and placement only. Hint ladders and timers arrive at CP6.

const stage = document.getElementById('stage');
const bubble = document.getElementById('hint-bubble');
const hintText = document.getElementById('hint-text');
const ravenArt = document.querySelector('#raven .art');
const playPauseButton = document.getElementById('play-pause');

const GAP = 10;               // px between the bubble's tail and the raven
const EDGE = 12;              // px kept clear of the stage edges
const MAX_SIDE_WIDTH = 260;   // px; widest the bubble gets beside the raven
const MIN_SIDE_WIDTH = 140;   // px; narrower than this, the bubble moves above the raven
const MAX_ABOVE_WIDTH = 320;  // px

let forcedSide = null;        // 'left' | 'above' | null (automatic); set only from the dev tools

export function forceHintSide(side) {
  forcedSide = side;
  positionHint();
}

export function showHint(message) {
  hintText.textContent = message;
  bubble.classList.add('is-visible');
  positionHint();
}

export function hideHint() {
  bubble.classList.remove('is-visible');
}

// Places the bubble in the sky left of the raven, tail pointing at it. If there isn't room
// beside the raven, it sits above the raven instead. Coordinates are relative to the stage,
// so the bubble follows the raven wherever the scene's crop puts it.
export function positionHint() {
  if (!bubble.classList.contains('is-visible')) return;

  const stageBox = stage.getBoundingClientRect();
  const bird = toStage(ravenArt.getBoundingClientRect(), stageBox);
  const button = toStage(playPauseButton.getBoundingClientRect(), stageBox);
  const buttonShown = button.height > 0;
  const minTop = buttonShown ? button.bottom + 8 : EDGE;

  const sideWidth = Math.min(MAX_SIDE_WIDTH, bird.left - GAP - EDGE);
  const placeLeft = forcedSide ? forcedSide === 'left' : sideWidth >= MIN_SIDE_WIDTH;
  if (placeLeft) {
    bubble.dataset.side = 'left';
    bubble.style.width = `${sideWidth}px`;
    const height = bubble.offsetHeight;
    const birdMiddle = (bird.top + bird.bottom) / 2;
    const top = clamp(birdMiddle - height / 2, minTop, stageBox.height - EDGE - height);
    bubble.style.left = `${bird.left - GAP - sideWidth}px`;
    bubble.style.top = `${top}px`;
    bubble.style.setProperty('--tail', `${clamp(birdMiddle - top, 14, height - 14)}px`);
  } else {
    bubble.dataset.side = 'above';
    const left = buttonShown ? Math.max(EDGE, button.right + 8) : EDGE;
    const width = Math.min(MAX_ABOVE_WIDTH, stageBox.width - left - EDGE);
    bubble.style.width = `${width}px`;
    const height = bubble.offsetHeight;
    const top = Math.max(EDGE, bird.top - GAP - height);
    bubble.style.left = `${left}px`;
    bubble.style.top = `${top}px`;
    const birdCentre = (bird.left + bird.right) / 2;
    bubble.style.setProperty('--tail', `${clamp(birdCentre - left, 14, width - 14)}px`);
  }
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
