# Virtual Hallo-weenie: Build Brief for Claude Code

Oct 16, 2026 · RG Sureshkumar

## How to use this brief

This file gives Claude Code the developer's direction for Project 4 and limits the current build to **Phase 1 only**. Save it in the project root as `Weenie Project-Brief.md`.

- **Read order:** `AGENTS.md` (working rules), then `brief.md` (class requirements, the source of truth if anything here conflicts), then this file.
- **Approved vs. proposed:** "Developer decisions" is settled. Anything marked *proposed* is a starting point: present it, get the developer's go-ahead or edits, then record the approved version in `research.md` or `spec.md`.
- **Scope:** Build Phase 1 now. Phase 2 details are here so the Phase 1 layout and code leave room for them. Do not build Phase 2 this week.
- **Working style (from AGENTS.md):** small checkpoints; present a plan and wait for approval before multi-step changes; prove each result with a screenshot or observed behavior; stop and report after two failed attempts; no destructive commands without confirmation.
- **Project documents:** Seed `research.md`, `spec.md`, and `plan.md` from this brief, keeping each file's existing header and working agreement. Record consequential decisions there, not every tweak.

## Timeline

Phase 1 is due Oct 19, 2026, so it fits in one weekend only if the repo and live URL exist by Saturday morning. Phase 2 (stories 2 and 3, playtest revisions, polish, debrief) is the following week.

| When | Checkpoints | Done when |
| --- | --- | --- |
| Fri night, Oct 16 | 0: setup, repo, GitHub Pages | Placeholder page loads at the HTTPS URL on the iPhone |
| Sat, Oct 17 (morning) | 1: static scene layout; 2: layers and UI shell | Screenshots at 390×844 and 375×667 approved |
| Sat, Oct 17 (afternoon) | 3: ambient effects; sound shortlist, developer downloads files | 3+ effects running; CC0 sounds in `assets/audio/source/` |
| Sun, Oct 18 (morning) | 4: start screen, ambient audio, Play/Pause, reduced motion | All four verified on the iPhone |
| Sun, Oct 18 (afternoon) | 5: Cauldron Brew sequence; 6: triggers, progress, hints, lock | Full story plays from discovery to return on the iPhone |
| Sun night to Mon morning | 7: credits, Phase 1 checklist, docs, git log | Every Phase 1 box ticked; final push deployed |

## Developer decisions (approved)

These choices are settled; build on them without re-asking.

| Decision | Choice |
| --- | --- |
| Developer | RG Sureshkumar |
| Scene | A witch's cottage in a forest clearing at night |
| Focal point | The crooked witch's cottage |
| Art approach | Code-drawn SVG and CSS, no raster art; a canvas layer is fine for particles |
| Phase 1 story | Cauldron Brew |
| Phase 2 stories | Broomstick Flight; The Cottage Wakes |
| Hint delivery | The witch's raven, perched on the roof, speaks rhyming hints in a speech bubble |
| Target device | iPhone, Safari (verification and playtesting happen there) |
| Hosting | GitHub Pages, public HTTPS URL |
| Repo setup | Claude Code initializes git in the existing project folder, creates the GitHub repo, pushes, and enables Pages; the developer does not set repos up by hand |
| Stack | Plain HTML, CSS, and JavaScript (ES modules); no framework, no build step |

## Creative direction (proposed)

The scene is "The Witch's Hollow": a moonlit clearing where a crooked cottage glows, a cauldron simmers out front, and the forest seems to wait for someone to stir things up. Tone is storybook-spooky and playful for ages 10+: mischief and magic, no gore, no menace toward people, no theme-park or franchise branding.

### Composition (portrait, back to front)

Design on a 390×844 canvas. Keep every interactive object inside the central region that still shows on a 375×667 screen.

1. **Sky:** deep indigo-to-teal gradient, faint stars, large full moon upper right.
2. **Far forest:** layered tree-line silhouettes, lighter with distance.
3. **Focal point:** crooked cottage, centered in the upper-middle third, with warm glowing windows, a leaning chimney, a broom by the door, and the raven on the roof peak.
4. **Crooked tree (left):** gnarled branch holding a glowing spider web.
5. **Ground:** cauldron over a small fire, front center; mushroom ring lower left; small pond with a moonflower lower right.
6. **Foreground framing:** dark branches and tall grass at the edges, overlapping the effects for depth.
7. **Effects layers** between background and foreground (fog both behind and in front of ground objects).
8. **UI:** Play/Pause in a top corner inside the safe area, the raven's hint bubble, start screen and pause overlays.

Environmental features (3+ required): the cauldron, the mushroom ring, the pond with its moonflower, and the crooked tree with its web.

### Visual style

Layered silhouette "cut-paper storybook" look: flat shapes, soft gradients, and glows. Light comes only from the moon (cool silver-blue) and from magic (amber windows, green cauldron).

| Role | Color |
| --- | --- |
| Night sky | #0E1230 to #1B3A4B |
| Silhouettes | #070A14 |
| Moonlight | #DCE6F2 |
| Window glow | #FFB547 |
| Cauldron magic | #7CFF6B |
| Spell accent | #B46CFF |

### Ambient effects (3+ required; build 5, keep the best)

| Effect | Behavior | Reduced-motion version |
| --- | --- | --- |
| Ground fog | Two translucent bands drifting slowly at different speeds | Static fog that gently fades in and out |
| Fireflies / wisps | 10 to 20 glowing dots wandering near the mushroom ring and pond | Dots pulse in place without traveling |
| Bats | A small flock crosses the moon every 15 to 40 s (randomized) | Bats fade in on the moon briefly instead of flying |
| Window candlelight | Irregular flicker of the window glow | Slow, subtle brightness pulse |
| Chimney smoke and cauldron bubbles | Curling smoke; bubbles rise and pop | Smoke shifts opacity only; bubbles off |

### Soundscape

One Web Audio mix with separate volume channels for ambience, interactions, and the story. Ambience sits well below interaction sounds so every tap is clearly heard.

- **Bed (seamless loop):** night forest wind with crickets.
- **Random one-shots every 15 to 40 s:** owl hoot, creaking branch, distant cackle, raven caw (skipped while a hint is showing).
- **Local loop:** low cauldron bubbling.
- **Interaction and story sounds:** listed under Cauldron Brew and in the sound list below.

## Story 1 (Phase 1): Cauldron Brew

The User brings the cauldron three glowing ingredients from around the clearing, in the right order, and the brew erupts into a cackling smoke spirit that swirls through the scene before being sucked back into the pot. Target length is about 8.5 s from the third ingredient landing to interaction returning (the brief requires 5 to 10 s). Details below are proposed.

### Triggers

Each ingredient sits in a different part of the scene, so finding them rewards exploring.

| Order | Ingredient | Where | Unique tap feedback |
| --- | --- | --- | --- |
| 1 | Glowing toadstool | Biggest mushroom in the ring, lower left | Spore puff and a soft "poink"; it floats in an arc into the cauldron |
| 2 | Moonflower | Edge of the pond, lower right | Petals open with a chime; the flower drifts to the cauldron trailing sparkles |
| 3 | Spider silk | Web in the crooked tree, left | Web shimmers with a harp-like twang; a silver thread spools into the cauldron |

**Progress.** After each correct ingredient the brew changes color (dark, then green, then purple, then gold), the bubbles and fire grow, and one of three runes on the cauldron rim lights up. Progress holds until the story plays or the User makes a mistake.

**Wrong order.** The cauldron burps a puff of sour purple smoke with a comic "blorp," the runes go dark, the brew resets, and the ingredients reappear in place. The raven may add a short reaction ("Hrk. Not like that."). Resetting is the only penalty.

**Other tap feedback in Phase 1.** Every tappable object responds differently:

- Cauldron before any ingredient: one bubble and a low gurgle.
- Raven: caws and repeats the current hint, or a flavor line if no hint is due yet.
- Windows and broom (Phase 2 triggers): a small flicker or twitch with a sound, so they already feel alive.

### Sequence

| Time | Act | What happens | Sound |
| --- | --- | --- | --- |
| 0.0 to 2.0 s | Beginning | Third ingredient lands; gold flash; the scene dims under a vignette; the brew swells and boils over | Rising bubbling rumble |
| 2.0 to 6.0 s | Middle | A grinning green smoke spirit bursts out, grows, cackles, and loops around the cottage and across the moon, trailing sparkles | Whoosh, cackle, magical shimmer |
| 6.0 to 8.5 s | End | The spirit is pulled back down in a spiral, then POP and a smoke puff; brew, fire, and lighting return to normal; ingredients regrow in place; the raven caws approval | Reverse "fwoop," pop, a satisfied caw |

### Lock and return

When the story starts, all scene interactions stop responding to touch and keyboard; only Play/Pause still works. At the end, a brief shimmer across the scene and the raven's caw signal that it is the User's turn again, and keyboard focus returns to a sensible object. The story can be replayed any number of times without reloading.

### Hints (raven rhymes)

Hints appear in the raven's speech bubble with a caw. They advance on time spent without progress toward the story, stay on screen at least 6 s, and pause with Play/Pause. A correct ingredient resets the timer.

| Level | Appears after | Hint |
| --- | --- | --- |
| 1 | About 20 s in the scene | "The witch's pot is cold tonight. It's hungry for things that glow." |
| 2 | About 45 s more | "Three gifts the forest keeps: one in the ring, one where water sleeps, one where the spider creeps." |
| 3 | About 45 s more | "Ground, then water, then the web. Mix them wrong and the pot will burp." |

Once the story has played, the raven stops hinting about the cauldron. Build the hint system so it can track several stories and hint toward the next undiscovered one in Phase 2.

### Reduced motion

Keep the same beats and length, using crossfades and glows instead of travel: ingredients fade out and reappear in the cauldron, the spirit fades up above the pot and pulses instead of looping the scene, and nothing shakes.

## Stories 2 and 3 (Phase 2, context only)

Do not build these this week, but place their objects in the Phase 1 scene so Phase 2 needs no re-layout.

- **Broomstick Flight.** Tap the broom by the door three times; it shakes harder with each tap (progress), then launches a witch silhouette across the moon with a trail of bats, loops once, and lands back by the door.
- **The Cottage Wakes.** Light the cottage's three windows one tap at a time (progress); the cottage opens sleepy window-eyes, yawns through its door, puffs smoke rings from the chimney, then dozes off.
- Both will get their own raven hint ladders, so the hint system should support multiple stories from the start.

## Technical architecture

The app is one static page: inline SVG for the scene, a canvas for particles, CSS and Web Animations for motion, and Web Audio for sound, all coordinated by one state machine and one pausable clock. Claude Code may adjust the structure but should explain why.

### Suggested files

```
index.html               start screen, scene SVG, UI, credits panel
css/styles.css           layout, color tokens, focus styles, reduced-motion rules
js/main.js               boot, state machine, wiring
js/clock.js              pausable time and scheduler (replaces raw setTimeout/setInterval)
js/audio.js              AudioContext, buffers, volume channels, loops, one-shots
js/effects.js            ambient effects (canvas particles + SVG animations)
js/hints.js              raven hint ladders, timers, speech bubble
js/stories/cauldron.js   Cauldron Brew triggers, progress, sequence
assets/audio/            final MP3 files (source/ holds the downloaded originals)
CREDITS.md               developer credit and every external asset
```

Use relative paths everywhere, since GitHub Pages serves the site from `/<repo-name>/`. ES modules need a local HTTP server, not `file://`.

### States

`START → SCENE → STORY → SCENE`, with `paused` as a flag that can sit on top of SCENE or STORY. Only SCENE accepts object interactions; STORY accepts only Play/Pause. One function owns every transition so the lock and unlock rules live in one place.

### One pausable clock

All timed behavior (hint timers, random ambient sounds, story timelines, effect spawns) is scheduled through `clock.js`, driven by `requestAnimationFrame` with elapsed time that stops while paused. Pausing:

- sets the paused flag and blocks object input;
- pauses every CSS animation and Web Animation (for example a `paused` class setting `animation-play-state: paused`, plus `document.getAnimations()`);
- stops the particle loop;
- calls `audioContext.suspend()`, and resuming calls `resume()`.

Also auto-pause on `visibilitychange` (tab hidden or phone locked). Pausing mid-story must resume exactly where it stopped.

### Audio

Create or resume the AudioContext inside the Enter button's tap handler. Decode files into AudioBuffers and loop the ambience with `AudioBufferSourceNode.loop`, which is gapless, unlike `<audio loop>`. Use separate gain nodes for ambience, interactions, and the story, and duck the ambience slightly during the story. If a file fails to load, the app keeps running silently and logs once.

### Layout and scaling

- Full-screen portrait with no scrolling: `height: 100dvh`, `viewport-fit=cover`, and safe-area insets for the notch and home bar.
- Scene SVG uses a fixed viewBox (390×844) with `preserveAspectRatio="xMidYMid slice"` so it fills any phone; interactive objects stay in the safe central region.
- On desktop, show the scene in a centered phone-shaped frame.
- In landscape on a phone, show a "turn your phone upright" message rather than a broken layout.

### Input and accessibility

- Every interactive object is a real `<button>`, or an SVG element with `role="button"`, `tabindex="0"`, and Enter/Space handlers.
- Accessible names describe the object without giving away the solution ("Toadstool," not "Tap me first").
- Hit areas are at least 44×44 CSS px, enlarged with invisible shapes around small objects.
- Visible, on-theme focus ring and a logical tab order across the scene.
- Hint bubble text is at least 16 px with WCAG AA contrast (4.5:1) and `aria-live="polite"`.
- Play/Pause is a labeled button whose icon and label reflect its state; small and in a corner, but still 44×44.
- Block double-tap zoom and long-press menus on scene objects (`touch-action: manipulation`, `-webkit-touch-callout: none`, `user-select: none`).

### Reduced motion

Read `matchMedia('(prefers-reduced-motion: reduce)')` on load, before the start screen shows, and apply the reduced versions listed above. Note it quietly on the start screen, and listen for changes.

### Performance

Animate `transform` and `opacity`; avoid animating SVG blur filters, which are slow on iPhone; cap particle counts; keep total audio under about 2 MB.

## iPhone Safari checklist

Check each item on the physical iPhone at the live URL, not only in the desktop preview.

- [ ] Audio starts only after Enter and is audible at normal volume.
- [ ] With the ringer switch on silent, sound still plays: investigate Safari's Audio Session API (`navigator.audioSession.type = "playback"`); if that doesn't work, add a start-screen line asking Users to turn silent mode off.
- [ ] Sound files are MP3 for broad Safari compatibility.
- [ ] Locking the phone or switching apps pauses everything; returning shows the paused state and resumes cleanly.
- [ ] No scrolling, rubber-banding, accidental zoom, or text-selection pop-ups.
- [ ] Nothing is hidden under the notch, Dynamic Island, or home bar.
- [ ] Reduce Motion (Settings → Accessibility → Motion) changes the experience before Enter.
- [ ] Every object registers taps reliably on the first try.
- [ ] Animation stays smooth during the story.

## Assets, sound sourcing, and credits

All visuals are original code-drawn SVG and CSS; every sound is CC0 or public domain with its source verified before use.

### Sound workflow

1. Claude Code searches [Freesound](https://freesound.org/) with the Creative Commons 0 license filter and lists two options per needed sound in `research.md`: name, URL, author, license, length, and why it fits.
2. Claude Code opens each sound's page to confirm the license is CC0 before listing it; anything with attribution or non-commercial terms is flagged, not used.
3. The developer listens and downloads the picks into `assets/audio/source/` (Freesound requires a free account to download).
4. Claude Code trims, fades, converts to MP3, and roughly levels loudness with ffmpeg (ask before installing it), writing results to `assets/audio/`.
5. Until real files arrive, short Web Audio placeholder tones keep the build moving.

### Phase 1 sound list

- **Ambience:** forest wind and crickets loop; owl hoot; creaking branch; distant cackle; raven caw (2 or 3 variants); cauldron bubbling loop.
- **Interactions:** toadstool "poink"; moonflower chime; web twang; wrong-order "blorp"; window flicker and broom twitch sounds; Enter and Play/Pause clicks.
- **Story:** boil-over rumble; spirit whoosh; spirit cackle; suction "fwoop"; pop.

### Fonts

Use system fonts for UI and hints. A display font for the title is fine if it is OFL-licensed (for example from Google Fonts) and credited.

### Credits

Add `CREDITS.md` and a Credits panel reachable from the start screen: "Designed and developed by RG Sureshkumar, with Claude Code (Anthropic)," then each sound (title, author, URL, license) and any font or code library. Credit CC0 sounds even though the license doesn't require it, because the class brief does.

## Repo, deployment, and verification

Claude Code sets up version control and hosting in the existing project folder; the template files stay where they are.

### Setup (Checkpoint 0)

1. Confirm `git` and the GitHub CLI work (`gh auth status`). If `gh` is missing or signed out, stop and ask the developer.
2. Add a `.gitignore` covering `.DS_Store` and editor files.
3. Run `git init` and make a first commit of the template files as they are.
4. Create a **public** GitHub repo (proposed name `virtual-halloweenie`; free GitHub Pages requires a public repo) and push.
5. Enable GitHub Pages from `main`, root folder, and confirm the HTTPS URL (`https://<username>.github.io/virtual-halloweenie/`).
6. Deploy a placeholder `index.html` for the developer to open on the iPhone.
7. Fill in the Project section of `AGENTS.md`: how to run locally, test, and deploy.

### Local preview

Run a local server (for example `python3 -m http.server 8000`) and keep VS Code's browser preview open on it while developing, as the class workflow asks.

### Proving each checkpoint

Claude Code shows evidence rather than claims: headless-browser screenshots at 390×844 and 375×667 (Playwright or similar), a browser console free of errors, and a short description of the behavior observed. The developer then checks the live URL on the iPhone. Only the developer marks iPhone verification complete in `plan.md`.

### Git

Commit and push at each verified checkpoint with a clear message (for example `Checkpoint 3: fog, fireflies, and bats`), checking for secrets before every commit. Before submitting, export the log:

```
git log --date=iso --pretty=format:"%h %ad %s" > git-log.txt
```

### Transcripts

At the end of each working session, the developer asks Claude Code to save the transcript to `transcripts/` following `AGENTS.md`.

## Phase 1 build checkpoints

Eight small checkpoints take the project from empty folder to submittable prototype. For each one, present the plan, build it, show the evidence, and commit only after the developer approves.

| # | Produces | Main risk | Verify by |
| --- | --- | --- | --- |
| 0 | Repo, Pages URL, placeholder page, project docs seeded | `gh` sign-in or Pages permissions | Live URL loads on the iPhone |
| 1 | Static scene: sky, moon, forest, cottage, cauldron, mushroom ring, pond, crooked tree, framing | Composition crops badly on short phones | Screenshots at both sizes; developer approves the look |
| 2 | Layer structure, effects layers, UI shell (Play/Pause, hint bubble, start and pause overlays, static) | Layer order or overlapping hit areas | Screenshot; tab through all objects by keyboard |
| 3 | Ambient effects, one at a time, each with its reduced-motion version | Mobile performance | Smooth on the iPhone |
| 4 | Start screen and Enter, ambient audio, Play/Pause of everything, auto-pause on hide, reduced motion before Enter | iOS audio unlock and the silent switch | On the iPhone: sound after Enter; pause freezes all motion, sound, and timers |
| 5 | Cauldron Brew sequence, fired by a dev-only trigger (`?dev=1`) | Pacing feels flat or runs past 10 s | Measured duration 5 to 10 s; developer approves pacing |
| 6 | Ingredient triggers, unique feedback, progress, wrong-order reset, lock and return, raven hints | Users can't find the triggers | From a fresh load, reach the story by touch and by keyboard; pause mid-story resumes correctly; replay works |
| 7 | Credits, full Phase 1 checklist, docs updated, git log, final deploy | Last-minute regressions | Every Phase 1 box ticked on the iPhone at the live URL |

If time allows after Checkpoint 6, have one person try it cold on the iPhone and note where they got stuck. It is a cheap preview of next week's playtest.

## Deliverables

Phase 1 is submittable when every box below is ticked; Phase 2 is listed so this week's work sets it up.

### Phase 1: playtest prototype, due Oct 19, 2026

**1. Working prototype**

- [ ] One vertical scene that fits the phone screen with no scrolling or page changes
- [ ] Clear focal point (the cottage) and at least 3 environmental features
- [ ] At least 3 ambient effects running
- [ ] Looping ambient background sound
- [ ] Start screen whose Enter button starts audio and animation
- [ ] Reduced-motion preference honored before the experience begins
- [ ] One Play/Pause control that pauses and resumes all motion, sound, effects, timers, and interaction together
- [ ] Cauldron Brew has a clear beginning, middle, and end, lasts 5 to 10 s, and replays without reloading
- [ ] Story triggered by scene interaction; every tap gives audiovisual feedback; triggers respond uniquely and show progress
- [ ] Raven hints progress over time and hint rather than instruct
- [ ] Other interactions disabled during the story, with a clear return to the scene afterward
- [ ] Works by touch and keyboard, with readable text, sufficient contrast, and 44 px tap targets
- [ ] Developer and all external assets credited (do it now, since sounds are already in use)

**2. Shareable URL**

- [ ] Public HTTPS GitHub Pages URL
- [ ] Verified on the physical iPhone (date and iOS version noted in `plan.md`)

**3. Project files**

- [ ] All code and assets pushed to the repo
- [ ] `research.md`, `spec.md`, and `plan.md` current and developer-approved
- [ ] `Weenie Project-Brief.md`, `AGENTS.md` (Project section filled in), and `CREDITS.md`
- [ ] Git log (`git-log.txt` plus the repo history)
- [ ] Session transcripts in `transcripts/`

### Phase 2: playtest, complete, and polish (following week)

1. **Playtest evidence.** Peers explore on smartphones with no explanation or help; the developer observes first and asks questions afterward. `plan.md` records non-identifying observations (what Users did and said, kept separate from interpretation), the revision priorities chosen, what changed, and how each improvement was verified.
2. **Completed app.** Broomstick Flight and The Cottage Wakes built to the same standard as Cauldron Brew; hints covering all three stories; playtest-driven revisions; polished visuals, sound, interactions, and pacing; every requirement re-verified on the iPhone at the live URL.
3. **Project files.** Updated `research.md`, `spec.md`, and `plan.md`; complete sources and credits; git log; the class-provided `debrief.md` added and completed.

## Open decisions for the developer

Claude Code should raise each of these at the checkpoint where it matters rather than deciding alone.

- **Ingredient order:** required (more puzzle, more value from hints) or any order (less frustration)? Proposed: required, revisited after the playtest.
- **Hint timing and wording:** 20 s, then 45 s, then 45 s is proposed; final rhymes are the developer's call.
- **Start-screen title:** proposed "Virtual Hallo-weenie" with the subtitle "The Witch's Hollow."
- **Final palette and look:** decided from the Checkpoint 1 screenshots.
- **Which ambient effects to keep:** decided after seeing them on the iPhone.
- **Original sound files:** commit them to the repo, or only the processed MP3s?
- **Phase 2 due date:** not yet known.

## Suggested first prompt for Claude Code

Save this brief as `Weenie Project-Brief.md` in the project folder, open Claude Code there, and start with:

```
Read AGENTS.md, brief.md, and Weenie Project-Brief.md, then inspect the project folder. We are building Phase 1 only, due Monday, Oct 19. Start with Checkpoint 0: confirm git and the GitHub CLI work, then show me your plan to initialize the repo, create the public GitHub repo, enable GitHub Pages, and deploy a placeholder page. Also draft first versions of research.md, spec.md, and plan.md from Weenie Project-Brief.md, keeping their existing headers and working agreements, and show them to me for approval before building the scene.
```
