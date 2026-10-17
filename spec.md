# Technical Specification

> EDITING DIRECTIVE: DEVELOPER AND AGENT EDIT THIS FILE COLLABORATIVELY. THE DEVELOPER MUST REVIEW AND APPROVE ITS CONTENT.

Purpose: Keep a concise, testable description of the experience currently being built.

## Working agreement

Developer: Begin with the running prototype, approve the intended behavior, test it directly, and update this file when the intended result changes.

Agent: Read `AGENTS.md`, `brief.md`, `research.md`, and this file, then inspect the project. Turn decisions into acceptance checks without inventing product choices or freezing details that still require testing.

Start a fresh chat with:

`Read the project documents, inspect the running prototype, and help me specify the next useful build checkpoint.`

## Current build contract

Define only enough to build and verify the current direction:

- the intended User experience and chosen scene, ambience, and story behavior
- the system structure, shared rules, and states that keep audiovisual behavior and interaction coordinated
- the assets and layout needed for that structure, linking to sources and credits in `research.md`
- acceptance checks for the chosen behavior and every requirement in `brief.md`, including accessibility and failure behavior

Reference the brief's fixed requirements rather than copying them. Specify your decisions precisely enough that the Developer and Agent can judge the same result. Leave untested details open until they are needed, and distinguish provisional ideas from approved behavior.

> **Status (Oct 17, 2026):** Final **Phase 1** contract, built and approved checkpoint by checkpoint (see `plan.md`) and **approved by the Developer on Oct 17, 2026**. Everything below describes the shipped Phase 1 behavior. Full creative detail lives in `Weenie Project-Brief.md`; this file holds the rules and the checks.

### User experience

The User opens the URL, reads a short start screen, and taps **Enter**. Sound and motion begin in "The Witch's Hollow". They explore by tapping objects. If they stall, the raven on the roof offers rhyming hints. Bringing three ingredients to the cauldron in order plays **Cauldron Brew** (about 8.5 s). The scene then returns, ready to explore or replay.

### Layout

- One full-screen portrait page with no scrolling: `100dvh`, `viewport-fit=cover`, and safe-area insets.
- The scene is one inline SVG with `viewBox="0 0 390 844"` and `preserveAspectRatio="xMidYMid slice"`.
- **Interactive safe region:** every tappable object sits within viewBox y ≈ 80–765 and x ≈ 10–380. That is the part still visible at 375×667 under `slice` (rows 0–75 and 769–844 are cropped). Confirmed Oct 17 on the Developer's iPhone: the `?dev=1` view showed no tappable object clipped.
- UI (Play/Pause, hint bubble, overlays) is HTML above the SVG, positioned with `env(safe-area-inset-*)`, never under the notch or home bar.
- Desktop: the scene sits in a centered phone-shaped frame. Phone in landscape: a "turn your phone upright" message.

### Layer stack (back to front)

1. Sky, stars, moon
2. Far forest silhouettes, then the ground hill
3. Fog band (behind)
4. Scene objects (cottage, raven, tree and web, cauldron, mushroom ring, pond), the **only** layer that takes taps
5. Particle canvas (fireflies, sparkles, bubbles)
6. Fog band (in front)
7. Foreground framing (branches, grass) and the edge vignette
8. UI layer

Layers 1–4 are one SVG and layers 6–7 a second SVG above the canvas. Both use the same viewBox, so their coordinates match. Layers 5–7 use `pointer-events: none`, so effects never block taps. Glows on scene objects sit outside their tappable groups, so they don't enlarge tap targets.

### States and shared rules

- States: `START → SCENE → STORY → SCENE`, plus a `paused` flag over SCENE or STORY. One function owns every transition, so lock and unlock rules live in one place.
- Objects respond only when `state === SCENE && !paused`. In STORY, only Play/Pause works.
- `setState()` in `js/main.js` is that one function. It writes `data-mode` and `data-paused` on the stage, CSS shows the matching UI (start screen, pause overlay, Play/Pause icon), and the scene wrapper is made `inert` whenever objects must not respond, which blocks touch, keyboard, and screen readers in one step.
- **One pausable clock** (`js/clock.js`, driven by `requestAnimationFrame`) schedules every timed thing: hints, random sounds, story timelines, effect spawns. There is no raw `setTimeout`/`setInterval` outside `clock.js`.
- **Pause** stops input, CSS animations and Web Animations, the particle loop, the clock, and audio (`audioContext.suspend()`). **Resume** continues exactly where it stopped, including mid-story.
- When the page is hidden (`visibilitychange`), it auto-pauses. On return the paused overlay shows and the User resumes it; it does not auto-resume.

### Ambient effects (CP3)

- Five effects, all kept: two fog bands (one behind the objects, one low in front), window candlelight, chimney smoke with cauldron bubbles, 15 fireflies on the particle canvas (by the ring and pond), and a five-bat flock crossing the moon. The first flight comes 6 s after Enter, then every 15–40 s.
- Every effect moves on the clock (`js/effects.js`), using only transform and opacity. They start on the first Enter, and stopping the clock (Pause) freezes them all.
- Reduced motion is read on every frame through `js/motion.js` (device setting, or `?motion=reduce` for testing). Fog only fades, bats fade in on the moon, smoke changes opacity in place, bubbles are off, the windows pulse slowly, and fireflies pulse in place.
- `clock.advance(ms)` (dev tools only, exposed as `devClock` with `?dev=1`) fast-forwards time in simulated frames, for checking timers without waiting.

### Audio

- One `AudioContext` (`js/audio.js`), created inside the Enter tap after setting `navigator.audioSession.type = "playback"` where supported, so the silent switch doesn't mute it. Three gain channels feed a master gain: ambience 0.35, interactions 0.9, story 0.9. Ambience ducks to 40% during the story.
- Hybrid sound design (`research.md` › *Sound sources*). `js/synth.js` generates the wind, the cauldron bubbling loop, the UI clicks, and, until the downloads are processed, stand-ins for the five recordings. `js/soundscape.js` lists processed recordings in `RECORDINGS`; each empty slot uses its stand-in, so the app never requests a missing file. A file that fails to load is logged once and replaced by its stand-in.
- The night bed and bubbling loop through `AudioBufferSourceNode.loop` (gapless). A random ambient one-shot plays every 15–40 s on the clock, never the same one twice in a row. The raven caw is skipped while a hint is showing (hook `setOneShotFilter`, wired at CP6).
- **Pause** (in `setState()`) stops the clock, suspends audio (a Pause click still playing finishes first), and pauses Web Animations. **Play** reverses all three. Hiding the page (`visibilitychange`) or the system interrupting audio pauses automatically. The start screen says "Best with sound on.", plus "and silent mode off" where `navigator.audioSession` is unavailable.
- **Phase 1 ships with generated sound only** (decided Oct 17): no recorded files, so nothing to load, cache, or credit beyond the developer. To add recordings later, process them into `assets/audio/` (about 2 MB total; AAC via macOS `afconvert`, or MP3 via ffmpeg), list them in `RECORDINGS` in `js/soundscape.js`, and credit each in `CREDITS.md` and the Credits panel.
- Every CSS and JS link in `index.html` carries `?v=N`, and an import map applies it to module imports. Bump N on every deploy that changes CSS or JS, so phones never mix cached and new files.

### Cauldron Brew (Phase 1 story)

Triggers, feedback, sequence beats, and hint rhymes follow `Weenie Project-Brief.md` › *Story 1*. These rules are fixed:

- **Order (required, decided Oct 17):** toadstool → moonflower → spider silk. Each tap gives its own feedback, then the ingredient travels into the pot: the toadstool puffs spores, says "poink", and arcs in; the moonflower blooms with a chime and drifts in trailing sparkles; the web shimmers with a harp twang and spools a silver thread into the pot. While an ingredient is in the pot it is hidden and out of touch and tab reach. Reduced motion: ingredients fade out in place.
- **Progress:** each correct ingredient changes the brew color (dark → green → purple; gold comes with the story), lights one of 3 rim runes, and grows the bubbles and fire glow. The third ingredient landing starts the story. After the POP, the brew clears, the runes go dark, and all three ingredients grow back.
- **Wrong order:** the wrong ingredient still travels in, then the pot burps a sour purple puff with a "blorp" and a wobble, the raven says "Hrk. Not like that.", the runes go dark, the brew clears, and every used ingredient grows back. Nothing else is penalized.
- **Other objects:** cauldron tap sends up one big bubble with a gurgle that rises with progress; each window flares with its own note; the broom twitches with a rustle (Phase 2 story objects).
- **Sequence (approved Oct 17 on the iPhone):** 8.5 s on the pausable timeline (`js/timeline.js`, `js/stories/cauldron.js`). Beginning 0–2 s: gold flash, scene dims, brew swells gold and boils over, 0.35 s shake. Middle 2–6 s: a friendly, mischievous grinning smoke spirit bursts out, loops the cottage, and crosses the moon with a sparkle trail. End 6–8.5 s: it spirals back into the pot, POP and puff, brew and fire settle, a shimmer sweeps the scene, and the raven bobs and caws twice. Sounds are generated (rumble, panned whooshes, shimmer, fwoop, pop); the cackle and caws use the recordings once processed. Ambience ducks to 40% for the story. Measured from the story starting to interaction returning.
- **Lock and return:** story mode (`setState({ mode: 'STORY' })`) makes the scene inert, so only Play/Pause works. At the end the scene unlocks and keyboard focus moves to the cauldron. Every story element is reset to rest, so it replays without reloading, any number of times.
- **Reduced motion:** the same beats and length. The spirit fades up above the pot and pulses instead of flying; flash, puff, and shimmer only fade; no swell, spill travel, shake, or raven bob.
- **Dev trigger:** with `?dev=1`, a "Brew (dev)" button plays the story, and the readout lists each run's measured length. CP6 replaces it with the ingredient triggers.

### Hints

- The hint engine holds **one ladder per story** and hints toward the next story not yet played. Phase 1 registers only the cauldron ladder.
- Hints advance on clock time without progress: 20 s, then +45 s, then +45 s, each shown 8 s with a caw (decided Oct 17). They pause with Play/Pause. A correct ingredient resets the countdown. The raven stays quiet during the story, and after it has played the cauldron hints stop. The ambient raven caw is skipped while a hint is showing.
- The bubble sits above the raven (decided Oct 17).
- Tapping the raven caws, bobs, and repeats the latest hint, or says a flavor line if none is due yet (a different set after the story, e.g. "Caw! Again! Again!").

### Input and accessibility

Every object is focusable (`role="button"`, `tabindex="0"`, Enter and Space). Accessible names don't give the solution away. Hit areas are at least 44×44 CSS px. Focus rings are visible and on theme. Hint text is at least 16 px, AA contrast, `aria-live="polite"`. Play/Pause is labeled and reflects its state. Scene objects block double-tap zoom, long-press, and text selection. Full list: `Weenie Project-Brief.md` › *Input and accessibility*.

Structure rules (CP2):

- Each tappable object is `<g class="scene-object" role="button" tabindex="0" aria-label="…">` holding an invisible `.hit` rectangle and an `.art` group. Tap areas are axis-aligned, at least 50×50 scene units (≥ 44 CSS px on phones), and never overlap. Any static transform goes on `.art`, never on the object, so animations on the object can't overwrite it.
- DOM order is tab order: Play/Pause, then objects top to bottom, left to right. The focus ring is drawn on the tap area, because Safari's outlines on SVG are unreliable.
- Touch, mouse, and keyboard reach objects through one input path in `js/main.js`.
- UI: Play/Pause sits top left. The pause overlay is passive; only Play/Pause resumes. The hint bubble is parchment with dark text (15.1:1 contrast), placed above the raven (decided at CP6).

### Assets

- **Visuals:** all original, code-drawn SVG/CSS (plus a canvas for particles).
- **Sounds:** CC0 or public domain only, chosen in `research.md` › *Sound sources*. Source files go in `assets/audio/source/` and processed MP3s in `assets/audio/`.
- **Credits:** `CREDITS.md` and a Credits panel on the start screen.

### Credits

`CREDITS.md` and a Credits panel on the start screen (a dialog: Close button or Escape, focus moves in and back, the start screen is inert behind it) credit the Developer and Claude Code and state that all art and sound are original and generated in code, with system fonts and no libraries.

### Failure behavior

- A sound file fails to load: the app keeps running without that sound and logs once.
- The AudioContext can't start: the visuals and story still work.
- Phone in landscape: rotate message. Scripts disabled: a `<noscript>` line.

### Acceptance checks (Phase 1)

Agent evidence: headless screenshots at 390×844 and 375×667, a console free of errors, and the observed behavior. Only the Developer ticks iPhone checks, in `plan.md`.

| # | Check | How verified |
| --- | --- | --- |
| A1 | Scene fills the phone with no scroll, rubber-banding, zoom, or selection pop-ups | Screenshots at both sizes; iPhone |
| A2 | Cottage reads as the focal point; 4 features visible; all objects inside the safe region | Screenshots; Developer judgment |
| A3 | 3+ ambient effects run; each has its reduced-motion version | Observed in browser and on iPhone |
| A4 | Ambience loop plays gaplessly after Enter, including with the silent switch on (or the start screen says to turn it off) | iPhone, by ear |
| A5 | Reduce Motion is applied before Enter and noted on the start screen | iPhone with the setting on and off |
| A6 | Play/Pause freezes all motion, sound, timers, hints, and input; resume continues mid-story | Pause at ~4 s into the story, wait, resume; story ends on time |
| A7 | Locking the phone or switching apps pauses; return shows the paused state | iPhone |
| A8 | Story runs 5–10 s with a clear beginning, middle, and end | Duration logged by the clock in `?dev=1` |
| A9 | Every tappable object gives unique audiovisual feedback; progress shows after each correct ingredient; wrong order resets | Tap every object; screenshot each progress state |
| A10 | During the story, object taps and keys do nothing; the return is clearly signaled; replay works 3× in a row | Browser and iPhone |
| A11 | Hints appear on schedule, hint without instructing, and stop after the story plays | Watch with the clock sped up in `?dev=1`; Developer judges wording |
| A12 | Story is reachable by keyboard alone; logical tab order; visible focus | Tab through in desktop browser |
| A13 | Tap targets ≥ 44 px; hint text ≥ 16 px at ≥ 4.5:1 contrast | Measured in the browser |
| A14 | Developer and every external asset credited in `CREDITS.md` and the Credits panel | Compare against `research.md` › *Sound sources* |
| A15 | Live at the public HTTPS Pages URL; first tap on every object registers on the iPhone | Developer on iPhone |

## Scope and revisions

Record excluded ideas, the next behavior that must work, and consequential requirement changes with their evidence.

- **Phase 1 scope:** scene, ambience, start screen, Play/Pause, Cauldron Brew, hints, credits, deploy.
- **Excluded this week:** Broomstick Flight and The Cottage Wakes behavior. Their objects (broom, windows) are placed now and give small flavor feedback only. Also excluded: playtest revisions, Phase 2 polish, raster art, frameworks or a build step, 3D.
- **Next behavior that must work:** CP0, the placeholder page live at the HTTPS URL on the iPhone.
- **Requirement changes:** *none yet.*

## Saving the transcript

When directed, save the complete conversation as `transcripts/spec-YYYY-MM-DD_HHMMSS.md`, label messages `Developer` and `Agent`, and confirm the path.
