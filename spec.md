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

> **Status (Oct 22, 2026):** **Phase 2** contract. Phase 1 was approved by the Developer on Oct 17, 2026. Phase 2 added the playtest 1 revisions (R1–R3), Broomstick Flight, and The Cottage Wakes, each verified on the Developer's iPhone on Oct 22 (see `plan.md`). After the CP10 re-verification on the iPhone, the Developer **approved this version on Oct 22, 2026**. Everything below describes the current build. Full creative detail lives in `Weenie Project-Brief.md`; this file holds the rules and the checks.

### User experience

The User opens the URL, reads a short start screen, and taps **Enter**. Sound and motion begin in "The Witch's Hollow". They explore by tapping objects. If they stall, the raven on the roof offers rhyming hints. Three stories wait to be found, each about 8.5 s: bringing three ingredients to the cauldron in order plays **Cauldron Brew**, waking the broom by the door with three taps plays **Broomstick Flight**, and lighting the cottage's three windows plays **The Cottage Wakes**. After each, the scene returns, ready to explore or replay.

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
4. Scene objects (cottage and its three windows, broom, raven, tree and web, cauldron, mushroom ring, pond), the **only** layer that takes taps
5. Particle canvas (fireflies, sparkles, bubbles)
6. Fog band (in front)
7. Foreground framing (branches, grass), the edge vignette, and the story layer (dims, spirit, witch and bats, smoke rings, Z's, shimmer)
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

- Five effects, all kept: two fog bands (one behind the objects, one low in front), window candlelight (the windows burn low until The Cottage Wakes lights them), chimney smoke with cauldron bubbles, 15 fireflies on the particle canvas (by the ring and pond), and a five-bat flock crossing the moon. The first flight comes 6 s after Enter, then every 15–40 s.
- Every effect moves on the clock (`js/effects.js`), using only transform and opacity. They start on the first Enter, and stopping the clock (Pause) freezes them all.
- Reduced motion is read on every frame through `js/motion.js` (device setting, or `?motion=reduce` for testing). Fog only fades, bats fade in on the moon, smoke changes opacity in place, bubbles are off, the windows pulse slowly, and fireflies pulse in place.
- `clock.advance(ms)` (dev tools only, exposed as `devClock` with `?dev=1`) fast-forwards time in simulated frames, for checking timers without waiting.

### Audio

- One `AudioContext` (`js/audio.js`), created inside the Enter tap after setting `navigator.audioSession.type = "playback"` where supported, so the silent switch doesn't mute it. Three gain channels feed a master gain: ambience 0.35, interactions 0.9, story 0.9. Ambience ducks to 40% during every story.
- Hybrid sound design (`research.md` › *Sound sources*). `js/synth.js` generates every sound: the wind and crickets, the cauldron bubbling loop, the UI clicks, the tap and story sounds, and the five sounds that have recording slots (night bed, owl, creak, cackle, caw). `js/soundscape.js` lists processed recordings in `RECORDINGS`; every slot is empty, so each uses its generated version, so the app never requests a missing file. A file that fails to load is logged once and replaced by its stand-in.
- The night bed and bubbling loop through `AudioBufferSourceNode.loop` (gapless). A random ambient one-shot plays every 15–40 s on the clock, never the same one twice in a row. The raven caw is skipped while a hint is showing (hook `setOneShotFilter`, wired at CP6).
- **Pause** (in `setState()`) stops the clock, suspends audio (a Pause click still playing finishes first), and pauses Web Animations. **Play** reverses all three. Hiding the page (`visibilitychange`) or the system interrupting audio pauses automatically. The start screen says "Best with sound on.", plus "and silent mode off" where `navigator.audioSession` is unavailable.
- **The app ships with generated sound only** (decided Oct 17, unchanged in Phase 2): no recorded files, so nothing to load, cache, or credit beyond the developer. To add recordings later, process them into `assets/audio/` (about 2 MB total; AAC via macOS `afconvert`, or MP3 via ffmpeg), list them in `RECORDINGS` in `js/soundscape.js`, and credit each in `CREDITS.md` and the Credits panel.
- Every CSS and JS link in `index.html` carries `?v=N`, and an import map applies it to module imports. Bump N on every deploy that changes CSS or JS, so phones never mix cached and new files.

### Stories: shared rules

- Every story lasts 8.5 s on the pausable timeline (`js/timeline.js`), measured from the story starting to interaction returning, and replays without reloading any number of times.
- `startStory()` in `js/main.js` plays any story: story mode makes the scene inert (only Play/Pause works), the raven goes quiet, and at the end the scene unlocks, the raven moves on to the next unplayed story, and keyboard focus returns to that story's object.
- **The shared frame** (`js/stories/frame.js`, CP10): a dim settles over the scene in the first second and lifts from 7.2 s, ambience ducks to 40% and returns from 7.6 s, and a shimmer sweeps the scene from 7.6 s to 8.5 s (reduced motion: a full-width wash that only fades). Each story chooses only which dim it uses and how dark.
- **Finishing a trigger:** the completed trigger starts its story. If another story is already playing, that trigger's progress resets so it can be completed again (fixed in CP10: the cauldron used to stay full with nothing happening if the broom started while the last ingredient was on its way). The broom and windows add a twinkle and a 0.45 s beat first.
- **Dev triggers:** with `?dev=1`, "Brew (dev)", "Fly (dev)", and "Wake (dev)" play each story directly, and the readout lists each run's measured length.

### Cauldron Brew (story 1)

Triggers, feedback, sequence beats, and hint rhymes follow `Weenie Project-Brief.md` › *Story 1*. These rules are fixed:

- **Order (required, decided Oct 17):** toadstool → moonflower → spider silk. Each tap gives its own feedback, then the ingredient travels into the pot: the toadstool puffs spores, says "poink", and arcs in; the moonflower blooms with a chime and drifts in trailing sparkles; the web shimmers with a harp twang and spools a silver thread into the pot. While an ingredient is in the pot it is hidden and out of touch and tab reach. Reduced motion: ingredients fade out in place.
- **Progress:** each correct ingredient changes the brew color (dark → green → purple; gold comes with the story), lights one of 3 rim runes, and grows the bubbles and fire glow. The third ingredient landing starts the story (see *Finishing a trigger*). After the POP, the brew clears, the runes go dark, and all three ingredients grow back.
- **Wrong order:** the wrong ingredient still travels in, then the pot burps a sour purple puff with a "blorp" and a wobble, the raven says "Hrk. Not like that.", the runes go dark, the brew clears, and every used ingredient grows back. Nothing else is penalized.
- **Blue mushrooms (revision R1):** a fairy ring of 13 small, dim blue mushrooms surrounds the one big green glowing toadstool, so the ingredient is the odd one out. The ring is one button with two tap areas, one on each side of the toadstool's. A tap makes the nearest blue mushroom bounce and puff blue spores with a soft "boop"; it never counts as progress.
- **Ingredient pulses (revision R3):** every 5 s, each ingredient still in the scene glows brighter in turn (reduced motion: a slower glow that doesn't grow).
- **Other objects:** a cauldron tap sends up one big bubble with a gurgle that rises with progress. The broom and the windows are the Phase 2 story triggers (below).
- **Sequence (approved Oct 17 on the iPhone):** 8.5 s on the pausable timeline (`js/timeline.js`, `js/stories/cauldron.js`). Beginning 0–2 s: gold flash, scene dims, brew swells gold and boils over, 0.35 s shake. Middle 2–6 s: a friendly, mischievous grinning smoke spirit bursts out, loops the cottage, and crosses the moon with a sparkle trail. End 6–8.5 s: it spirals back into the pot, POP and puff, brew and fire settle, a shimmer sweeps the scene, and the raven bobs and caws twice. Sounds are generated (rumble, panned whooshes, shimmer, fwoop, pop); the cackle and caws are generated too. Ambience ducks to 40% for the story. Measured from the story starting to interaction returning.
- **Lock and return:** story mode (`setState({ mode: 'STORY' })`) makes the scene inert, so only Play/Pause works. At the end the scene unlocks and keyboard focus moves to the cauldron. Every story element is reset to rest, so it replays without reloading, any number of times.
- **Reduced motion:** the same beats and length. The spirit fades up above the pot and pulses instead of flying; flash, puff, and shimmer only fade; no swell, spill travel, shake, or raven bob.

### Broomstick Flight (story 2, Phase 2)

- **Trigger (decided Oct 22):** tap the broom by the door 3 times. Tap 1: a twitch and a straw rustle. Tap 2: a bigger shake, gold dust, and a higher rustle. Tap 3: a hard rattle, a twinkle, and lift-off 0.45 s later. The bristles glow brighter with each tap (0.4 → 0.75 → 1). Progress holds until the story plays. If another story is already playing, the broom settles back.
- **Sequence (8.5 s, `js/stories/broom.js`):** Beginning 0–2 s: the scene dims; the leaning broom hands over to a flying one, and a witch silhouette (moonlit outline) fades in riding it. Middle 2–6 s: she swoops up the right of the moon, loops once in front of it, and sweeps left across the sky, trailing gold sparkles and a flock of six bats. End 6–8.5 s: she glides down to the door, fades, the broom leans back, a shimmer sweeps the scene, and the raven caws. Sounds are generated (whooshes, bat flutter, landing thump) plus the shared cackle and caw. Ambience ducks to 40%.
- **Reduced motion:** the same beats and length. The witch fades up above the door, a pulsing silhouette appears in front of the moon while the bats fade in around it, then the broom fades back. Nothing travels or rotates.
- **Lock and return:** the same story mode as the Cauldron Brew, through one shared `startStory()` in `js/main.js`. Focus returns to the broom, and the broom can be woken again.

### The Cottage Wakes (story 3, Phase 2)

- **Trigger (decided Oct 22):** the three windows burn low (dim panes, a faint flicker) until tapped. A tap makes a window dip, flare, and play its own note (left, right, and attic form a rising triad), and it stays lit: that is the progress. Any order. Tapping a lit window only flickers. Progress holds until the story plays; the third window adds a twinkle, and the story starts 0.45 s later. If another story is already playing, the windows burn low again.
- **Sequence (8.5 s, `js/stories/cottage.js`):** Beginning 0–2 s: the clearing dims around the cottage with a wooden groan; heavy eyelids close over the two lower windows, lift, droop, and open wide as the attic window flares like a raised brow; the pupils look left and right. Middle 2–6 s: the door swings open into a yawning mouth (warm light and a tongue) that stretches taller and relaxes, with a deep yawn; then the chimney puffs three smoke rings (three rising "poofs") and the eyes follow them up. End 6–8.5 s: the eyelids droop shut, the door creaks closed, Z's float up from the door with a snore, the windows sink back to low, a shimmer sweeps the scene, and the raven caws. Ambience ducks to 40%. The sounds are generated (yawn, poof, snore) plus the shared creak and caw.
- **Reduced motion:** the same beats and length. The eyelids fade in shut, fade away to show still pupils, and fade back; the door fades to show the mouth; the rings and Z's fade in and out in place. Nothing slides, stretches, or travels.
- **Lock and return:** the shared story mode through `startStory()`. Focus returns to the attic window. The windows end low, ready to be lit again.

### Hints

- The hint engine holds **one ladder per story** and hints toward the first story not yet played, in the order cauldron, broom, then cottage. Each story keeps its own place on its ladder, so playing the broom first doesn't reset the cauldron's hints. A story's first hint comes 20 s after the previous story ends (the cauldron's comes 12 s after Enter), then +30 s and +30 s. Broom rhymes (decided Oct 22): "The witch left her broom by the door tonight. It's itching to fly, if you wake it just right." / "Once it twitches, twice it shakes. Knock a third time, and see what wakes." / "Three taps on the broom by the cottage door, and up she'll go to the moon once more." Cottage rhymes (decided Oct 22): "The old cottage dozes, its candles burned low. Give each one a spark, and it might say hello." / "Three sleepy windows, two low and one high. Light every one, and the house opens an eye." / "Tap all three windows, the attic one too, and the cottage will wake with a yawn just for you." A window lit counts as progress.
- Hints advance on clock time without progress: 12 s, then +30 s, then +30 s, each shown 8 s with a caw (revised Oct 22 after playtest 1; was 20 / 45 / 45 s). They pause with Play/Pause. Progress on any story (a correct ingredient, a broom tap, a window lit) resets the countdown. The raven stays quiet during a story; once a story has played its hints stop, and after all three it only says flavor lines. The ambient raven caw is skipped while a hint is showing.
- The bubble sits above the raven (decided Oct 17).
- **A visible raven (revision R2):** a moonlit outline, a glowing amber eye, and a halo that brightens while it speaks. Every 6.5 s it blinks and glances over its shoulder, and its wing flaps whenever it speaks. Reduced motion: blinks only, and the eye flashes instead of the wing flapping.
- Tapping the raven caws, bobs, and repeats the latest hint, or says a flavor line if none is due yet (a different set once all three stories have played, e.g. "Caw! Again! Again!").

### Input and accessibility

Every object is focusable (`role="button"`, `tabindex="0"`, Enter and Space). Accessible names don't give the solution away. Hit areas are at least 44×44 CSS px. Focus rings are visible and on theme. Hint text is at least 16 px, AA contrast, `aria-live="polite"`. Play/Pause is labeled and reflects its state. Scene objects block double-tap zoom, long-press, and text selection. Full list: `Weenie Project-Brief.md` › *Input and accessibility*.

Structure rules (CP2):

- Each tappable object is `<g class="scene-object" role="button" tabindex="0" aria-label="…">` holding one or more invisible `.hit` rectangles and an `.art` group. The drawing never takes taps (`pointer-events: none`), so an object's tap area is exactly its `.hit` rectangles. Tap areas are axis-aligned, at least 50×50 scene units (≥ 44 CSS px on phones), and never overlap. Any static transform goes on `.art`, never on the object, so animations on the object can't overwrite it.
- DOM order is tab order: Play/Pause, then objects top to bottom, left to right. The focus ring is drawn on the tap area, because Safari's outlines on SVG are unreliable.
- Touch, mouse, and keyboard reach objects through one input path in `js/main.js`.
- UI: Play/Pause sits top left. The pause overlay is passive; only Play/Pause resumes. The hint bubble is parchment with dark text (15.1:1 contrast), placed above the raven (decided at CP6).

### Assets

- **Visuals:** all original, code-drawn SVG/CSS (plus a canvas for particles).
- **Sounds:** all generated in code (see *Audio*). Any recording added later must be CC0 or public domain, chosen in `research.md` › *Sound sources*, processed into `assets/audio/`, and credited.
- **Credits:** `CREDITS.md` and a Credits panel on the start screen.

### Credits

`CREDITS.md` and a Credits panel on the start screen (a dialog: Close button or Escape, focus moves in and back, the start screen is inert behind it) credit the Developer and Claude Code and state that all art and sound are original and generated in code, with system fonts and no libraries.

### Failure behavior

- A sound file fails to load: the app keeps running without that sound and logs once.
- The AudioContext can't start: the visuals and story still work.
- Phone in landscape: rotate message. Scripts disabled: a `<noscript>` line.

### Acceptance checks

Agent evidence: screenshots in the built-in browser at 390×844 and 375×667, a console free of errors, and the observed behavior. Only the Developer ticks iPhone checks, in `plan.md`.

| # | Check | How verified |
| --- | --- | --- |
| A1 | Scene fills the phone with no scroll, rubber-banding, zoom, or selection pop-ups | Screenshots at both sizes; iPhone |
| A2 | Cottage reads as the focal point; 4 features visible; all objects inside the safe region | Screenshots; Developer judgment |
| A3 | 3+ ambient effects run; each has its reduced-motion version | Observed in browser and on iPhone |
| A4 | Ambience loop plays gaplessly after Enter, including with the silent switch on (or the start screen says to turn it off) | iPhone, by ear |
| A5 | Reduce Motion is applied before Enter and noted on the start screen | iPhone with the setting on and off |
| A6 | Play/Pause freezes all motion, sound, timers, hints, and input; resume continues mid-story | Pause at ~4 s into the story, wait, resume; story ends on time |
| A7 | Locking the phone or switching apps pauses; return shows the paused state | iPhone |
| A8 | Each of the three stories runs 5–10 s with a clear beginning, middle, and end | Duration logged by the clock in `?dev=1` |
| A9 | Every tappable object gives unique audiovisual feedback; every trigger shows progress (brew color and runes, broom glow, lit windows); wrong ingredient order resets | Tap every object; screenshot each progress state |
| A10 | During a story, object taps and keys do nothing; the return is clearly signaled; each story replays 3× in a row; a trigger completed while another story plays resets instead of sticking | Browser and iPhone |
| A11 | Hints appear on schedule for each story in turn, hint without instructing, and stop once all three stories have played | Watch with the clock sped up in `?dev=1`; Developer judges wording |
| A12 | Every story is reachable by keyboard alone; logical tab order; visible focus | Keyboard in the desktop browser |
| A13 | Tap targets ≥ 44 px; hint text ≥ 16 px at ≥ 4.5:1 contrast | Measured in the browser |
| A14 | Developer and every external asset credited in `CREDITS.md` and the Credits panel | Compare against `research.md` › *Sound sources* |
| A15 | Live at the public HTTPS Pages URL; first tap on every object registers on the iPhone | Developer on iPhone |

## Scope and revisions

Record excluded ideas, the next behavior that must work, and consequential requirement changes with their evidence.

- **Phase 1 scope:** scene, ambience, start screen, Play/Pause, Cauldron Brew, hints, credits, deploy.
- **Phase 2 scope:** playtest revisions R1–R3 (done), Broomstick Flight (CP8), The Cottage Wakes (CP9), then polish, full re-verification, and the debrief (CP10; playtest 2 skipped by the Developer's decision (Oct 22)). Still excluded: raster art, frameworks or a build step, 3D.
- **Next behavior that must work:** none. Every requirement was re-verified on the Developer's iPhone on Oct 22; what remains is delivery (the debrief and the zip).
- **Requirement changes:** *none yet.*

## Saving the transcript

When directed, save the complete conversation as `transcripts/spec-YYYY-MM-DD_HHMMSS.md`, label messages `Developer` and `Agent`, and confirm the path.
