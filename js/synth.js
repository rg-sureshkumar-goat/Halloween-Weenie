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
  // A raven caw, at a slightly different pitch each time unless one is given.
  caw(ctx, out, { pitch = 0.9 + Math.random() * 0.25 } = {}) {
    return tone(ctx, out, { type: 'sawtooth', from: 780 * pitch, to: 520 * pitch, duration: 0.28, peak: 0.28,
                            attack: 0.02, bandpass: 1600 });
  },
};

// Tap feedback sounds (CP6). Each returns its last source node.
export const tapSounds = {
  // Toadstool: a soft, bouncy "poink".
  poink(ctx, out) {
    tone(ctx, out, { from: 320, to: 860, duration: 0.09, peak: 0.35, attack: 0.005 });
    return tone(ctx, out, { from: 640, to: 1100, at: 0.07, duration: 0.12, peak: 0.2, attack: 0.005 });
  },
  // Moonflower: a bell-like chime as the petals open.
  chime(ctx, out) {
    tone(ctx, out, { from: 1319, duration: 1.2, peak: 0.22, attack: 0.004 });
    tone(ctx, out, { from: 1976, duration: 0.9, peak: 0.12, attack: 0.004 });
    return tone(ctx, out, { from: 2637, at: 0.05, duration: 0.7, peak: 0.08, attack: 0.004 });
  },
  // Web: a harp-like twang (a plucked string, Karplus-Strong synthesis).
  twang(ctx, out) {
    const source = ctx.createBufferSource();
    source.buffer = pluckBuffer(ctx, 196, 1.4);
    const level = ctx.createGain();
    level.gain.value = 0.6;
    source.connect(level).connect(out);
    source.start();
    return source;
  },
  // Wrong order: a comic, wobbly "blorp".
  blorp(ctx, out) {
    const start = ctx.currentTime;
    const oscillator = ctx.createOscillator();
    oscillator.type = 'sawtooth';
    oscillator.frequency.setValueAtTime(240, start);
    oscillator.frequency.exponentialRampToValueAtTime(70, start + 0.45);
    const wobble = ctx.createOscillator();
    wobble.frequency.value = 14;
    const wobbleDepth = ctx.createGain();
    wobbleDepth.gain.value = 25;
    wobble.connect(wobbleDepth).connect(oscillator.frequency);
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 700;
    const envelope = ctx.createGain();
    envelope.gain.setValueAtTime(0.0001, start);
    envelope.gain.exponentialRampToValueAtTime(0.4, start + 0.03);
    envelope.gain.exponentialRampToValueAtTime(0.0001, start + 0.5);
    oscillator.connect(filter).connect(envelope).connect(out);
    oscillator.start(start);
    wobble.start(start);
    oscillator.stop(start + 0.55);
    wobble.stop(start + 0.55);
    return oscillator;
  },
  // Cauldron tap: a low gurgle of three bubbles, a little higher as the brew progresses.
  gurgle(ctx, out, { pitch = 1 } = {}) {
    let last;
    [0, 0.09, 0.2].forEach((at, i) => {
      last = tone(ctx, out, { from: (120 + i * 30) * pitch, to: (260 + i * 40) * pitch, at, duration: 0.09, peak: 0.3, attack: 0.008 });
    });
    return last;
  },
  // An ingredient landing in the pot: a small plop.
  plop(ctx, out) {
    noiseBurst(ctx, out, { duration: 0.05, type: 'highpass', frequency: 1800, peak: 0.15 });
    return tone(ctx, out, { from: 520, to: 140, duration: 0.15, peak: 0.35, attack: 0.004 });
  },
  // Window: a candle "fwip" plus a soft note (each window has its own).
  candle(ctx, out, { note = 660 } = {}) {
    noiseBurst(ctx, out, { duration: 0.15, type: 'bandpass', frequency: 900, peak: 0.12 });
    return tone(ctx, out, { from: note, to: note * 1.01, at: 0.04, duration: 0.5, peak: 0.14, attack: 0.01 });
  },
  // Broom: a dry straw rustle.
  rustle(ctx, out) {
    noiseBurst(ctx, out, { duration: 0.12, type: 'bandpass', frequency: 3200, peak: 0.22 });
    return noiseBurst(ctx, out, { at: 0.1, duration: 0.18, type: 'bandpass', frequency: 2600, peak: 0.16 });
  },
  // Ingredients growing back: a three-note twinkle.
  twinkle(ctx, out) {
    let last;
    [1568, 2093, 2637].forEach((frequency, i) => {
      last = tone(ctx, out, { from: frequency, at: i * 0.07, duration: 0.4, peak: 0.1, attack: 0.004 });
    });
    return last;
  },
};

// Story sounds (Cauldron Brew). Generated, not stand-ins.
export const storySounds = {
  // Rising bubbling rumble under the boil-over: low noise opening up plus a climbing sub tone.
  rumble(ctx, out, { duration = 2 } = {}) {
    const start = ctx.currentTime;
    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuffer(ctx);
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(180, start);
    filter.frequency.exponentialRampToValueAtTime(900, start + duration);
    const level = swellEnvelope(ctx, start, duration, 0.5);
    noise.connect(filter).connect(level).connect(out);
    noise.start(start);
    noise.stop(start + duration + 0.1);
    tone(ctx, out, { from: 55, to: 120, duration, peak: 0.3, attack: duration * 0.8 });
  },

  // Whoosh as the spirit flies, panned from one side to the other.
  whoosh(ctx, out, { duration = 1.3, panFrom = -0.7, panTo = 0.7 } = {}) {
    const start = ctx.currentTime;
    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuffer(ctx);
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.Q.value = 1.2;
    filter.frequency.setValueAtTime(400, start);
    filter.frequency.exponentialRampToValueAtTime(2400, start + duration * 0.5);
    filter.frequency.exponentialRampToValueAtTime(600, start + duration);
    const level = bellEnvelope(ctx, start, duration, 0.45);
    const pan = ctx.createStereoPanner();
    pan.pan.setValueAtTime(panFrom, start);
    pan.pan.linearRampToValueAtTime(panTo, start + duration);
    noise.connect(filter).connect(level).connect(pan).connect(out);
    noise.start(start);
    noise.stop(start + duration + 0.1);
  },

  // Magical shimmer: a quick rising run of bell-like notes.
  shimmer(ctx, out) {
    const notes = [1047, 1175, 1319, 1568, 1760, 2093, 2349];
    notes.forEach((frequency, i) => {
      tone(ctx, out, { from: frequency, to: frequency * 1.003, at: i * 0.07, duration: 0.45, peak: 0.12, attack: 0.005 });
    });
  },

  // Reverse "fwoop" as the spirit is sucked back down: a falling sweep that swells, then cuts.
  fwoop(ctx, out, { duration = 1.2 } = {}) {
    const start = ctx.currentTime;
    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuffer(ctx);
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.Q.value = 2;
    filter.frequency.setValueAtTime(2400, start);
    filter.frequency.exponentialRampToValueAtTime(260, start + duration);
    const level = swellEnvelope(ctx, start, duration, 0.5);
    noise.connect(filter).connect(level).connect(out);
    noise.start(start);
    noise.stop(start + duration + 0.1);
    tone(ctx, out, { from: 900, to: 140, duration, peak: 0.18, attack: duration * 0.85 });
  },

  // The POP as the spirit vanishes into the pot.
  pop(ctx, out) {
    tone(ctx, out, { from: 620, to: 80, duration: 0.12, peak: 0.6, attack: 0.003 });
    const start = ctx.currentTime;
    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuffer(ctx);
    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 1500;
    const level = ctx.createGain();
    level.gain.setValueAtTime(0.4, start);
    level.gain.exponentialRampToValueAtTime(0.0001, start + 0.04);
    noise.connect(filter).connect(level).connect(out);
    noise.start(start);
    noise.stop(start + 0.06);
  },
};

// ---------- Helpers ----------

// Gain that swells from silence to `peak` over `duration`, then cuts off quickly.
function swellEnvelope(ctx, start, duration, peak) {
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(peak, start + duration * 0.9);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration + 0.08);
  return gain;
}

// Gain that rises to `peak` at the midpoint and falls back, like a bell curve.
function bellEnvelope(ctx, start, duration, peak) {
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(peak, start + duration * 0.5);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  return gain;
}

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

// A short filtered noise burst (swishes, rustles, splashes). Returns its source node.
function noiseBurst(ctx, out, { at = 0, duration, type, frequency, peak }) {
  const start = ctx.currentTime + at;
  const noise = ctx.createBufferSource();
  noise.buffer = noiseBuffer(ctx);
  const filter = ctx.createBiquadFilter();
  filter.type = type;
  filter.frequency.value = frequency;
  const envelope = ctx.createGain();
  envelope.gain.setValueAtTime(0.0001, start);
  envelope.gain.exponentialRampToValueAtTime(peak, start + Math.min(0.01, duration / 3));
  envelope.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  noise.connect(filter).connect(envelope).connect(out);
  noise.start(start);
  noise.stop(start + duration + 0.02);
  return noise;
}

// A plucked string: a burst of noise circulating through a short delay line that averages
// neighbouring samples, which damps the high notes the way a real string does.
function pluckBuffer(ctx, frequency, seconds) {
  const rate = ctx.sampleRate;
  const buffer = ctx.createBuffer(1, Math.floor(seconds * rate), rate);
  const data = buffer.getChannelData(0);
  const ring = new Float32Array(Math.round(rate / frequency));
  for (let i = 0; i < ring.length; i++) ring[i] = Math.random() * 2 - 1;
  let index = 0;
  for (let i = 0; i < data.length; i++) {
    const next = (index + 1) % ring.length;
    data[i] = ring[index] * 0.5;
    ring[index] = 0.996 * 0.5 * (ring[index] + ring[next]);
    index = next;
  }
  return buffer;
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
