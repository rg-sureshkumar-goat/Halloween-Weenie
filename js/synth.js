// Generated sounds (research.md › Sound sources: hybrid sound design).
// Loops are computed once into buffers and then looped gaplessly; short sounds are built from
// oscillators and filters each time they play. Every function takes the AudioContext and the
// node to play into, so this file knows nothing about channels or app state.

const TAU = Math.PI * 2;

// ---------- Rendered loops ----------

// A 4 s chorus of three crickets at different pitches and rhythms. Each rhythm divides 4 s
// evenly, so the loop repeats seamlessly. Stand-in until the recorded night bed arrives.
export function cricketLoop(ctx) {
  const seconds = 4;
  const rate = ctx.sampleRate;
  const buffer = ctx.createBuffer(1, seconds * rate, rate);
  const data = buffer.getChannelData(0);
  const crickets = [
    { pitch: 4400, every: 0.8, offset: 0.0, pulses: 3, level: 0.16 },
    { pitch: 4900, every: 1.0, offset: 0.35, pulses: 4, level: 0.11 },
    { pitch: 5300, every: 4 / 3, offset: 0.6, pulses: 2, level: 0.08 },
  ];
  const pulseLength = Math.floor(0.018 * rate);
  for (const cricket of crickets) {
    for (let start = cricket.offset; start < seconds; start += cricket.every) {
      for (let p = 0; p < cricket.pulses; p++) {
        const first = Math.floor((start + p * 0.04) * rate);
        for (let k = 0; k < pulseLength; k++) {
          const envelope = Math.sin(Math.PI * k / pulseLength) ** 2;
          data[(first + k) % data.length] += cricket.level * envelope * Math.sin(TAU * cricket.pitch * (first + k) / rate);
        }
      }
    }
  }
  return buffer;
}

// A 3 s loop of low cauldron bubbles: short rising blips at seeded-random times.
export function bubblingLoop(ctx) {
  const seconds = 3;
  const rate = ctx.sampleRate;
  const buffer = ctx.createBuffer(1, seconds * rate, rate);
  const data = buffer.getChannelData(0);
  const random = seededRandom(31);
  for (let b = 0; b < 16; b++) {
    const start = Math.floor(random() * seconds * rate);
    const length = Math.floor((0.06 + random() * 0.07) * rate);
    const from = 160 + random() * 160;
    const level = 0.12 + random() * 0.12;
    let phase = 0;
    for (let k = 0; k < length; k++) {
      const progress = k / length;
      const frequency = from * (1 + 1.3 * progress);            // pitch rises as the bubble pops
      phase += TAU * frequency / rate;
      const envelope = Math.min(1, progress * 20) * Math.exp(-5 * progress);
      data[(start + k) % data.length] += level * envelope * Math.sin(phase);
    }
  }
  return buffer;
}

// ---------- Live ambience ----------

// Night wind: looping noise through a low-pass filter. Two very slow oscillators open the
// filter and swell the level, so it gusts without ever repeating exactly.
export function startWind(ctx, destination) {
  const noise = ctx.createBufferSource();
  noise.buffer = noiseBuffer(ctx);
  noise.loop = true;
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 380;
  filter.Q.value = 0.7;
  const level = ctx.createGain();
  level.gain.value = 0.2;

  const gust = ctx.createOscillator();
  gust.frequency.value = 0.06;
  const gustDepth = ctx.createGain();
  gustDepth.gain.value = 180;
  gust.connect(gustDepth).connect(filter.frequency);

  const swell = ctx.createOscillator();
  swell.frequency.value = 0.045;
  const swellDepth = ctx.createGain();
  swellDepth.gain.value = 0.08;
  swell.connect(swellDepth).connect(level.gain);

  noise.connect(filter).connect(level).connect(destination);
  noise.start();
  gust.start();
  swell.start();
}

// ---------- Short sounds ----------

// UI sounds (final, not stand-ins). Each returns its last source node so callers can wait for it.
export const uiSounds = {
  // Enter: a soft two-note rising chime.
  enter(ctx, out) {
    tone(ctx, out, { from: 660, to: 700, duration: 0.18, peak: 0.25 });
    return tone(ctx, out, { from: 990, to: 1040, at: 0.08, duration: 0.3, peak: 0.2 });
  },
  // Pause: a short low tick.
  pause(ctx, out) {
    return tone(ctx, out, { type: 'triangle', from: 520, to: 360, duration: 0.07, peak: 0.3, attack: 0.004 });
  },
  // Play: the same tick, rising.
  play(ctx, out) {
    return tone(ctx, out, { type: 'triangle', from: 380, to: 560, duration: 0.07, peak: 0.3, attack: 0.004 });
  },
};

// Stand-ins for the five recordings until the downloaded files are processed.
export const placeholders = {
  // Two soft hoots, the second longer and a little lower.
  owl(ctx, out) {
    tone(ctx, out, { from: 430, to: 400, duration: 0.32, peak: 0.35, attack: 0.06 });
    return tone(ctx, out, { from: 420, to: 370, at: 0.45, duration: 0.5, peak: 0.35, attack: 0.08 });
  },
  // A slow wooden groan: a low buzzy tone through a narrow filter.
  creak(ctx, out) {
    tone(ctx, out, { type: 'sawtooth', from: 70, to: 96, duration: 0.9, peak: 0.25, attack: 0.15, bandpass: 900 });
    return tone(ctx, out, { type: 'sawtooth', from: 96, to: 78, at: 0.95, duration: 0.5, peak: 0.18, attack: 0.08, bandpass: 900 });
  },
  // A distant cartoon cackle: six falling "ha"s.
  cackle(ctx, out) {
    let last;
    for (let i = 0; i < 6; i++) {
      last = tone(ctx, out, { type: 'sawtooth', from: 640 - i * 25, to: 520 - i * 25, at: i * 0.14,
                              duration: 0.09, peak: 0.16, attack: 0.01, bandpass: 1300 });
    }
    return last;
  },
  // A raven caw, at a slightly different pitch each time.
  caw(ctx, out) {
    const pitch = 0.9 + Math.random() * 0.25;
    return tone(ctx, out, { type: 'sawtooth', from: 780 * pitch, to: 520 * pitch, duration: 0.28, peak: 0.28,
                            attack: 0.02, bandpass: 1600 });
  },
};

// ---------- Helpers ----------

// One oscillator with a pitch glide and a smooth attack/decay envelope, optionally filtered.
function tone(ctx, out, { type = 'sine', from, to = from, at = 0, duration, peak, attack = 0.01, bandpass = null }) {
  const start = ctx.currentTime + at;
  const oscillator = ctx.createOscillator();
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(from, start);
  oscillator.frequency.exponentialRampToValueAtTime(to, start + duration);
  const envelope = ctx.createGain();
  envelope.gain.setValueAtTime(0.0001, start);
  envelope.gain.exponentialRampToValueAtTime(peak, start + attack);
  envelope.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  let node = oscillator;
  if (bandpass) {
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = bandpass;
    filter.Q.value = 2;
    oscillator.connect(filter);
    node = filter;
  }
  node.connect(envelope).connect(out);
  oscillator.start(start);
  oscillator.stop(start + duration + 0.05);
  return oscillator;
}

// Two seconds of white noise, looped by the wind.
function noiseBuffer(ctx) {
  const buffer = ctx.createBuffer(1, 2 * ctx.sampleRate, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  return buffer;
}

// Small repeatable random generator (mulberry32), so generated loops sound the same every visit.
function seededRandom(seed) {
  return () => {
    seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
