// Reduced-motion preference: the device setting, or forced on with ?motion=reduce for testing.
// Read it at the moment of use, so a change in the device setting applies immediately.

const query = matchMedia('(prefers-reduced-motion: reduce)');
const forced = new URLSearchParams(location.search).get('motion') === 'reduce';

export function reducedMotion() {
  return forced || query.matches;
}

export function onReducedMotionChange(fn) {
  query.addEventListener('change', () => fn(reducedMotion()));
}
