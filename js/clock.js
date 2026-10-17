// One pausable clock for everything timed (spec.md › States and shared rules).
// Time advances only while the clock runs, so stopping it freezes effects, timers, and (later)
// hints and story timelines together, and starting it resumes exactly where they stopped.
// Nothing else in the app uses setTimeout or setInterval.

const MAX_STEP_MS = 100;   // a slow frame or tab switch advances time by at most this much

let now = 0;               // ms of running time
let running = false;
let frameId = 0;
let lastTimestamp = null;
const tickers = new Set();
let timers = [];

export const clock = {
  get now() { return now; },
  get running() { return running; },

  start() {
    if (running) return;
    running = true;
    lastTimestamp = null;  // the first frame after a start measures nothing, so paused time is skipped
    frameId = requestAnimationFrame(frame);
  },

  stop() {
    running = false;
    cancelAnimationFrame(frameId);
  },

  // Calls fn(stepMs, nowMs) on every frame while running. Returns an unsubscribe function.
  onTick(fn) {
    tickers.add(fn);
    return () => tickers.delete(fn);
  },

  // Calls fn once after `ms` of running time. Returns a cancel function.
  after(ms, fn) {
    const timer = { at: now + ms, fn };
    timers.push(timer);
    return () => { timers = timers.filter(t => t !== timer); };
  },

  // Dev tools only: fast-forwards `ms` of time in simulated 16 ms frames, firing timers and
  // tickers exactly as real frames would. Lets hint and story timing be checked without waiting.
  advance(ms) {
    for (let elapsed = 0; elapsed < ms; elapsed += 16) step(Math.min(16, ms - elapsed));
  },
};

function frame(timestamp) {
  if (lastTimestamp !== null) step(Math.min(timestamp - lastTimestamp, MAX_STEP_MS));
  lastTimestamp = timestamp;
  if (running) frameId = requestAnimationFrame(frame);
}

// Moves time forward by `ms`: fires any timers now due, then calls every ticker.
function step(ms) {
  now += ms;
  const due = timers.filter(t => t.at <= now);
  if (due.length) {
    timers = timers.filter(t => t.at > now);
    for (const timer of due) timer.fn();
  }
  for (const fn of tickers) fn(ms, now);
}
