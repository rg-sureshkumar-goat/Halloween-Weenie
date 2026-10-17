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

> **Status (Oct 16, 2026):** **Phase 1** contract seeded from `Weenie Project-Brief.md` and approved by the Developer. *(provisional)* marks details that still need testing or a Developer decision. Full creative detail lives in that brief; this file holds the rules and the checks.

### User experience

The User opens the URL, reads a short start screen, and taps **Enter**. Sound and motion begin in "The Witch's Hollow" *(provisional title)*. They explore by tapping objects. If they stall, the raven on the roof offers rhyming hints. Bringing three ingredients to the cauldron in order plays **Cauldron Brew** (about 8.5 s). The scene then returns, ready to explore or replay.

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

- One `AudioContext`, created or resumed inside the Enter tap. Three gain channels (ambience, interactions, story) feed a master gain. Ambience sits well below interactions and ducks slightly during the story *(amount provisional)*.
- The ambience bed loops through `AudioBufferSourceNode.loop`. Random one-shots play every 15–40 s; the raven caw is skipped while a hint is showing.
- Files are MP3, about 2 MB total. Generated placeholder tones stand in until the real files arrive.

### Cauldron Brew (Phase 1 story)

Triggers, feedback, sequence beats, and hint rhymes follow `Weenie Project-Brief.md` › *Story 1*. These rules are fixed:

- **Order:** toadstool → moonflower → spider silk. *(provisional: required order is an open decision for CP6)*
- **Progress:** each correct ingredient changes the brew color (dark → green → purple → gold), grows the bubbles and fire, and lights one of 3 rim runes.
- **Wrong order:** a sour puff and a "blorp", then the runes go dark, the brew resets, and the ingredients reappear. Nothing else is penalized.
- **Sequence:** Beginning 0–2 s, Middle 2–6 s, End 6–8.5 s *(timings provisional; the 5–10 s limit is fixed)*. Measured from the third ingredient landing to interaction returning.
- **Return:** a brief shimmer and the raven's caw. Keyboard focus moves to the cauldron *(provisional)*. Replays without reloading, any number of times.
- **Reduced motion:** the same beats and length, using crossfades, glows, and pulses instead of travel, with no shaking.

### Hints

- The hint engine holds **one ladder per story** and hints toward the next story not yet played. Phase 1 registers only the cauldron ladder.
- Hints advance on clock time without progress: 20 s, then +45 s, then +45 s *(provisional)*. Each stays at least 6 s and pauses with Play/Pause. A correct ingredient resets the timer. After the story has played, cauldron hints stop.
- Tapping the raven caws and repeats the current hint, or gives a flavor line if no hint is due yet.

### Input and accessibility

Every object is focusable (`role="button"`, `tabindex="0"`, Enter and Space). Accessible names don't give the solution away. Hit areas are at least 44×44 CSS px. Focus rings are visible and on theme. Hint text is at least 16 px, AA contrast, `aria-live="polite"`. Play/Pause is labeled and reflects its state. Scene objects block double-tap zoom, long-press, and text selection. Full list: `Weenie Project-Brief.md` › *Input and accessibility*.

Structure rules (CP2):

- Each tappable object is `<g class="scene-object" role="button" tabindex="0" aria-label="…">` holding an invisible `.hit` rectangle and an `.art` group. Tap areas are axis-aligned, at least 50×50 scene units (≥ 44 CSS px on phones), and never overlap. Any static transform goes on `.art`, never on the object, so animations on the object can't overwrite it.
- DOM order is tab order: Play/Pause, then objects top to bottom, left to right. The focus ring is drawn on the tap area, because Safari's outlines on SVG are unreliable.
- Touch, mouse, and keyboard reach objects through one input path in `js/main.js`.
- UI: Play/Pause sits top left. The pause overlay is passive; only Play/Pause resumes. The hint bubble is parchment with dark text (15.1:1 contrast), placed left of the raven, falling back to above the raven when there's less than 140 px beside it. *(Placement still open: left gives the longest hint 7 lines at phone width, above gives 3 lines but covers the moon. Decide at CP6.)*

### Assets

- **Visuals:** all original, code-drawn SVG/CSS (plus a canvas for particles).
- **Sounds:** CC0 or public domain only, chosen in `research.md` › *Sound sources*. Source files go in `assets/audio/source/` and processed MP3s in `assets/audio/`.
- **Credits:** `CREDITS.md` and a Credits panel on the start screen.

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
