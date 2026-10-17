// Audio engine: one AudioContext, three volume channels, file loading that fails gracefully,
// and pause/resume. The context is created inside the Enter tap, because iOS only starts
// audio from a user gesture.

// Ambience sits well below interactions and story so every tap is clearly heard.
const CHANNEL_LEVELS = { ambience: 0.35, interactions: 0.9, story: 0.9 };

let ctx = null;
let master = null;
const channels = {};
const buffers = new Map();     // sound name → decoded AudioBuffer
const warned = new Set();
let wantRunning = false;       // true while the app expects sound to play
let pendingVoices = 0;         // short UI sounds allowed to finish before a pause suspends audio
let interruptedHandler = () => {};

// Called from the Enter tap. Safe to call again; later calls just resume.
export function startAudio() {
  if (ctx) {
    resumeAudio();
    return ctx;
  }
  // Ask iOS to treat this page's sound as media playback, so the ringer's silent switch
  // doesn't mute it (research.md › Technique notes).
  if ('audioSession' in navigator) navigator.audioSession.type = 'playback';

  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) {
    warnOnce('Web Audio is not supported here; continuing without sound.');
    return null;
  }
  ctx = new AudioContextClass();
  master = ctx.createGain();
  master.connect(ctx.destination);
  for (const [name, level] of Object.entries(CHANNEL_LEVELS)) {
    const gain = ctx.createGain();
    gain.gain.value = level;
    gain.connect(master);
    channels[name] = gain;
  }
  // If the system stops our audio on its own (a phone call, Siri), tell the app so it can pause.
  ctx.addEventListener('statechange', () => {
    if (wantRunning && ctx.state !== 'running') interruptedHandler();
  });
  resumeAudio();
  return ctx;
}

export function resumeAudio() {
  wantRunning = true;
  ctx?.resume();
}

// Suspends all sound. A short UI sound that is still playing (the Pause click) finishes first.
export function pauseAudio() {
  wantRunning = false;
  if (ctx && pendingVoices === 0) ctx.suspend();
}

export function onAudioInterrupted(handler) {
  interruptedHandler = handler;
}

export function audioContext() {
  return ctx;
}

export function channel(name) {
  return channels[name];
}

// Lowers the ambience to `fraction` of its normal level (1 restores it), gliding over ~`seconds`.
// The glide runs on audio time, so it freezes with everything else when paused.
export function setAmbienceLevel(fraction, seconds = 0.5) {
  if (!ctx) return;
  channels.ambience.gain.setTargetAtTime(CHANNEL_LEVELS.ambience * fraction, ctx.currentTime, seconds / 3);
}

// For the dev view's level meter.
export function masterOutput() {
  return master;
}

// Marks a short sound that a pause should let finish (≤ 0.2 s), so its click is heard.
export function letFinishBeforePause(sourceNode) {
  pendingVoices++;
  sourceNode.addEventListener('ended', () => {
    pendingVoices--;
    if (!wantRunning && pendingVoices === 0) ctx.suspend();
  });
}

// Fetches and decodes a sound file. On any failure, logs once and returns null so the caller
// can fall back; the app keeps running either way.
export async function loadSound(name, url) {
  if (!ctx) return null;
  if (buffers.has(name)) return buffers.get(name);
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const buffer = await ctx.decodeAudioData(await response.arrayBuffer());
    buffers.set(name, buffer);
    return buffer;
  } catch (error) {
    warnOnce(`Sound "${name}" could not load from ${url} (${error.message}); using its stand-in.`);
    return null;
  }
}

export function loadedSound(name) {
  return buffers.get(name) ?? null;
}

// Plays a decoded buffer on a channel. Looping buffers loop gaplessly.
export function playBuffer(buffer, { channel: channelName = 'interactions', gain = 1, loop = false, fadeIn = 0 } = {}) {
  if (!ctx || !buffer) return null;
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.loop = loop;
  const level = ctx.createGain();
  if (fadeIn > 0) {
    level.gain.setValueAtTime(0, ctx.currentTime);
    level.gain.linearRampToValueAtTime(gain, ctx.currentTime + fadeIn);
  } else {
    level.gain.value = gain;
  }
  source.connect(level).connect(channels[channelName]);
  source.start();
  return source;
}

function warnOnce(message) {
  if (warned.has(message)) return;
  warned.add(message);
  console.warn(message);
}
