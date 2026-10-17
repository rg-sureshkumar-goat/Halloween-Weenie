// Virtual Hallo-weenie: boot and wiring.
// Checkpoint 1: only the dev view exists so far. Open the page with ?dev=1 to see
// which part of the 390×844 scene this screen shows, and whether any object that
// Users will tap is cropped off (spec.md › Layout, interactive safe region).

const VIEWBOX = { width: 390, height: 844 };
const SVG_NS = 'http://www.w3.org/2000/svg';
const isDev = new URLSearchParams(location.search).get('dev') === '1';

if (isDev) {
  document.documentElement.classList.add('dev');
  updateDevView();
  addEventListener('resize', updateDevView);
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

function updateDevView() {
  const stage = document.getElementById('stage').getBoundingClientRect();
  const visible = visibleSceneArea(stage.width, stage.height);
  const outlines = document.getElementById('dev-hit-outlines');
  outlines.replaceChildren();

  // Outline every tappable object and note any that fall outside the visible area.
  const clipped = [];
  for (const object of document.querySelectorAll('[data-tappable]')) {
    const box = object.getBBox();
    const isClipped = box.x < visible.left || box.x + box.width > visible.right ||
                      box.y < visible.top || box.y + box.height > visible.bottom;
    if (isClipped) clipped.push(object.dataset.tappable);

    const rect = document.createElementNS(SVG_NS, 'rect');
    rect.setAttribute('class', isClipped ? 'dev-hit clipped' : 'dev-hit');
    for (const [attr, value] of Object.entries({ x: box.x, y: box.y, width: box.width, height: box.height })) {
      rect.setAttribute(attr, value.toFixed(1));
    }
    outlines.append(rect);
  }

  const [top, right, bottom, left] = safeAreaInsets();
  const round = n => Math.round(n);
  document.getElementById('dev-readout').textContent =
    `viewport ${innerWidth} × ${innerHeight}  (stage ${round(stage.width)} × ${round(stage.height)})\n` +
    `safe area t${top} r${right} b${bottom} l${left}\n` +
    `visible scene y ${round(visible.top)}–${round(visible.bottom)}, x ${round(visible.left)}–${round(visible.right)}\n` +
    `tappables clipped: ${clipped.length ? clipped.join(', ') : 'none'}`;
}
