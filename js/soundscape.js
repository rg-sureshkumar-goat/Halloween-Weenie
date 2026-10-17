// Soundscape: the night bed (crickets) + wind + cauldron bubbling, and a random ambient one-shot
// (owl, creak, cackle, raven caw) every 15–40 s on the pausable clock. Also plays UI sounds.

import { clock } from './clock.js';
import { audioContext, channel, letFinishBeforePause, loadSound, loadedSound, playBuffer } from './audio.js';
import { bubblingLoop, cricketLoop, placeholders, startWind, storySounds, tapSounds, uiSounds } from './synth.js';

// Processed recordings in assets/audio/. Empty until the Developer's downloads are processed;
// every slot falls back to its generated stand-in, so the app never requests a missing file.
const RECORDINGS = {
  // bed: 'assets/audio/night-bed.m4a',
  // owl: 'assets/audio/owl.m4a',
  // creak: 'assets/audio/creak.m4a',
  // cackle: 'assets/audio/cackle.m4a',
  // caw: 'assets/audio/raven-caw.m4a',
};
const ONE_SHOTS = ['owl', 'creak', 'cackle', 'caw'];
const LEVELS = { bed: 0.7, bubbling: 0.45, oneShot: 0.8 };   // within the ambience channel

let started = false;
let lastOneShot = null;
let skipOneShot = () => false;    // CP6: skips the raven's caw while a hint is showing
export const oneShotLog = [];     // recent one-shots, shown in the dev readout

// Starts the ambience once, right after Enter has created the AudioContext.
export async function startAmbience() {
  if (started) return;
  started = true;
  const ctx = audioContext();
  if (!ctx) return;

  for (const name of ONE_SHOTS) if (RECORDINGS[name]) loadSound(name, RECORDINGS[name]);
  const bed = RECORDINGS.bed ? await loadSound('bed', RECORDINGS.bed) : null;
  playBuffer(bed ?? cricketLoop(ctx), { channel: 'ambience', loop: true, gain: LEVELS.bed, fadeIn: 1.5 });
  startWind(ctx, channel('ambience'));
  playBuffer(bubblingLoop(ctx), { channel: 'ambience', loop: true, gain: LEVELS.bubbling, fadeIn: 1.5 });

  scheduleOneShot(8000 + Math.random() * 7000);   // the first comes a little sooner than the rest
}

export function setOneShotFilter(shouldSkip) {
  skipOneShot = shouldSkip;
}

// Plays a UI sound on the interactions channel. A pause right after it lets it finish.
export function playUiSound(name) {
  const ctx = audioContext();
  if (!ctx) return;
  letFinishBeforePause(uiSounds[name](ctx, channel('interactions')));
}

// Plays a generated story sound on the story channel.
export function playStorySound(name, options) {
  const ctx = audioContext();
  if (ctx) storySounds[name](ctx, channel('story'), options);
}

// Plays a tap feedback sound on the interactions channel.
export function playTapSound(name, options) {
  const ctx = audioContext();
  if (ctx) tapSounds[name](ctx, channel('interactions'), options);
}

// Plays a voice that has a recording slot (cackle, caw): the recording when it has loaded,
// otherwise its generated stand-in. Story channel unless another is given.
export function playVoice(name, { channel: channelName = 'story', ...options } = {}) {
  const ctx = audioContext();
  if (!ctx) return;
  const recording = loadedSound(name);
  if (recording) playBuffer(recording, { channel: channelName });
  else placeholders[name](ctx, channel(channelName), options);
}

function scheduleOneShot(delayMs) {
  clock.after(delayMs, () => {
    playOneShot();
    scheduleOneShot(15000 + Math.random() * 25000);
  });
}

// Picks a one-shot that differs from the last one, preferring the recording when it has loaded.
function playOneShot() {
  const choices = ONE_SHOTS.filter(name => name !== lastOneShot && !skipOneShot(name));
  if (!choices.length) return;
  const name = choices[Math.floor(Math.random() * choices.length)];
  lastOneShot = name;
  const recording = loadedSound(name);
  if (recording) playBuffer(recording, { channel: 'ambience', gain: LEVELS.oneShot });
  else placeholders[name](audioContext(), channel('ambience'));
  oneShotLog.push({ name, atSeconds: Math.round(clock.now / 1000), source: recording ? 'file' : 'generated' });
  if (oneShotLog.length > 6) oneShotLog.shift();
}
