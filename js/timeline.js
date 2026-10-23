// Story timelines on the pausable clock (reusable by every story).
// A timeline has a length, tracks, and cues, all timed in ms from its start:
//   tracks: { at, duration, update(progress) } – update runs every frame while 0 ≤ progress ≤ 1,
//           and once more with exactly 1 if a frame skips past the end, so every track finishes cleanly.
//   cues:   { at, run() } – one-off actions such as sounds.
// Because it runs on the clock, pausing freezes a story on its exact frame and Play continues it.

import { clock } from './clock.js';

export function playTimeline({ length, tracks = [], cues = [], onDone = () => {} }) {
  const start = clock.now;
  const pendingCues = [...cues].sort((a, b) => a.at - b.at);
  const states = tracks.map(track => ({ track, finished: false }));

  const unsubscribe = clock.onTick(() => {
    const elapsed = clock.now - start;
    while (pendingCues.length && pendingCues[0].at <= elapsed) pendingCues.shift().run();
    for (const state of states) {
      if (state.finished) continue;
      const progress = (elapsed - state.track.at) / state.track.duration;
      if (progress < 0) continue;
      state.track.update(Math.min(progress, 1));
      if (progress >= 1) state.finished = true;
    }
    if (elapsed >= length) {
      unsubscribe();
      onDone(elapsed);
    }
  });

  return { cancel: unsubscribe };
}

// Shared easing and geometry helpers for story tracks.
export const ease = p => (p < 0.5 ? 2 * p * p : 1 - (-2 * p + 2) ** 2 / 2);   // ease-in-out
export const lerp = (from, to, p) => from + (to - from) * p;
export const scaleAbout = (x, y, scale) => `translate(${x} ${y}) scale(${scale.toFixed(3)}) translate(${-x} ${-y})`;

// Smooth curve through the waypoints (Catmull-Rom), u from 0 (first point) to 1 (last point).
export function catmullRom(points, u) {
  const last = points.length - 1;
  const scaled = Math.min(Math.max(u, 0), 1) * last;
  const i = Math.min(Math.floor(scaled), last - 1);
  const t = scaled - i;
  const p0 = points[Math.max(i - 1, 0)];
  const p1 = points[i];
  const p2 = points[i + 1];
  const p3 = points[Math.min(i + 2, last)];
  const blend = (a, b, c, d) =>
    0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t * t + (-a + 3 * b - 3 * c + d) * t * t * t);
  return [blend(p0[0], p1[0], p2[0], p3[0]), blend(p0[1], p1[1], p2[1], p3[1])];
}
