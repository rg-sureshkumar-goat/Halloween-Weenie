# Implementation Plan

> EDITING DIRECTIVE: DEVELOPER AND AGENT EDIT THIS FILE COLLABORATIVELY. THE DEVELOPER MUST REVIEW AND APPROVE ITS CONTENT.

Purpose: Track the next useful build checkpoints, verification, and consequential revisions.

## Working agreement

Developer: Keep the browser preview running, choose priorities, test results directly, and plan only the next few checkpoints.

Agent: Read the project documents and inspect the files. Keep each checkpoint small enough to run and judge. Do not expand scope or mark Developer verification complete.

Start or continue a fresh chat with:

`Read the project documents, inspect the current build, and help me complete the next unchecked checkpoint.`

## Checkpoints

Create your own checklist for the next few results, using the workflow in `brief.md` and the current `spec.md`. Name the main risk, what each checkpoint should produce, and how you will verify it. Review and approve the approach before implementation.

Test each result before continuing, including related behavior that already works. Update priorities as evidence emerges and preserve meaningful working checkpoints in git. Before delivery, verify the deployed app against the brief and specification.

> **Status (Oct 17, 2026):** **Phase 1 (due Mon, Oct 19, 2026)** complete: all eight checkpoints built, verified on the Developer's iPhone, and **approved by the Developer on Oct 17, 2026** (final docs included). Each checkpoint follows the same loop: Agent presents the plan → Developer approves → Agent builds and shows evidence → Developer checks → commit and push.

| # | Target | Produces | Main risk | Verify by | Spec checks |
| --- | --- | --- | --- | --- | --- |
| 0 | Fri Oct 16 | Git repo, public GitHub repo, Pages URL, placeholder page, docs seeded, AGENTS.md Project section | GitHub CLI missing; Pages permissions | Placeholder loads at the HTTPS URL on the iPhone | A15 (partial) |
| 1 | Sat AM | Static scene: sky, moon, forest, cottage, raven, tree, cauldron, ring, pond, framing | Composition crops badly on short phones / Safari toolbars | Screenshots at 390×844 and 375×667; iPhone `innerHeight` logged; Developer approves the look | A1, A2 |
| 2 | Sat AM | Layer stack, effects layers, static UI shell (Play/Pause, hint bubble, start and pause overlays) | Layer order or hit areas overlap | Screenshot; tab through every object | A12, A13 |
| 3 | Sat PM | Ambient effects one at a time, each with its reduced-motion version; sound shortlist in `research.md` | Mobile performance | Smooth on the iPhone; Developer picks the effects to keep and downloads the sounds | A3 |
| 4 | Sun AM | Start screen and Enter, ambient audio, Play/Pause of everything, auto-pause on hide, reduced motion before Enter | iOS audio unlock; silent switch | On the iPhone: sound after Enter; pause freezes everything | A4–A7 |
| 5 | Sun PM | Cauldron Brew sequence, fired by a dev-only `?dev=1` trigger | Pacing flat or longer than 10 s | Measured duration; Developer approves pacing | A8 |
| 6 | Sun PM | Ingredient triggers, unique feedback, progress, wrong-order reset, lock and return, raven hints | Users can't find the triggers | From a fresh load, reach the story by touch and by keyboard; pause mid-story; replay 3× | A6, A9–A12 |
| 7 | Sun night–Mon AM | `CREDITS.md` and Credits panel, full Phase 1 check, docs current, `git-log.txt`, final deploy | Last-minute regressions | Every acceptance check passes on the iPhone at the live URL | A1–A15 |

**Regression rule:** at each checkpoint, re-run the checks of the earlier checkpoints before committing.

### Checkpoint 0 steps

1. ✅ Confirm `git` and `gh auth status`: git 2.50.1 OK; `gh` not installed. The Developer chose to create the repo and enable Pages by hand, so `gh` isn't needed.
2. ✅ Add `.gitignore` (`.DS_Store`, editor folders, `node_modules/`).
3. ✅ `git init` on `main`; commits use the GitHub noreply address (repo-local config, Developer's choice). Commit 1 holds the template files exactly as they were. The approved versions of these three docs follow in a later commit.
4. ✅ Developer created the **public** repo [`rg-sureshkumar-goat/Halloween-Weenie`](https://github.com/rg-sureshkumar-goat/Halloween-Weenie); Agent pushed `main`.
5. ✅ Add a placeholder `index.html` (with a viewport, safe-area, and reduced-motion readout for the iPhone) and `.nojekyll`. Checked at 390×844 and 375×667 with no console errors, then pushed.
6. ✅ Developer enabled Pages (Settings → Pages → Deploy from a branch → `main`, `/ (root)`). No build started from the Settings save; the next push triggered one. Live at https://rg-sureshkumar-goat.github.io/Halloween-Weenie/.
7. ✅ Fill in the Project section of `AGENTS.md` (run locally, test, deploy). Committed and pushed (`8f56872`).
8. Developer opens the URL on the iPhone and records the model, iOS version, and readout numbers below.

### Status

- [x] CP0 · [x] CP1 · [x] CP2 · [x] CP3 · [x] CP4 · [x] CP5 · [x] CP6 · [x] CP7 *(ticked Oct 17, 2026 at the Developer's request after the final iPhone check)*

### Phase 2 checkpoints (due Mon, Oct 26, 2026)

> **Status (Oct 22, 2026):** R1–R3, CP8, and CP9 are built and verified on the Developer's iPhone. CP10 is under way: the code cleanup and docs pass are done; the Developer's full iPhone check, playtest 2, the debrief, and the zip remain.

| # | Produces | Main risk | Verify by | Status |
| --- | --- | --- | --- | --- |
| R | Playtest 1 revisions R1–R3 | Making it clearer without solving it for Users | Browser regression; iPhone | Done (Oct 22) |
| 8 | Broomstick Flight: 3-tap trigger with progress, 8.5 s flight, hints | The loop over the moon reads as a mess, or the broom trigger collides with the cauldron story | Browser: touch, keyboard, timing, pause, replay, hints, reduced motion; iPhone | Done: Developer verified on iPhone (Oct 22) |
| 9 | The Cottage Wakes: light 3 windows, the cottage wakes and dozes | Three stories competing for attention and sound | Same checks | Done: Developer verified on iPhone (Oct 22) |
| 10 | Polish, full re-verification on the iPhone, playtest 2, docs, git log, debrief, zip | Last-minute regressions | Every requirement on the iPhone at the live URL | In progress: cleanup and docs done (Oct 22); iPhone check, playtest 2, debrief, zip to come |

## Evidence and revisions

Record non-identifying playtest observations, separating what Users did or said from your interpretation. Use the findings to choose revision priorities and record what changed and how you verified the improvement.

Keep implementation progress and verification here. Update `research.md` when evidence changes a decision and `spec.md` when intended behavior changes; link to those updates rather than duplicating them. Record consequential changes, not every small adjustment.

### iPhone verification log (Developer only)

| Date | Checkpoint | iPhone model / iOS version | Result | Notes |
| --- | --- | --- | --- | --- |
| Oct 17, 2026 | Phase 1 final build (CP0–CP7), live URL | iOS 26.6.2 (model not given) | **Pass:** all applicable checks | Developer tested the final build at https://rg-sureshkumar-goat.github.io/Halloween-Weenie/ and reported: "everything looks exactly as it is supposed to look" and "all checks passed today". Recorded by the Agent at the Developer's request. |
| Oct 22, 2026 | CP8 Broomstick Flight, live URL (`d6b6276`) | Not restated (Oct 17: iOS 26.6.2) | **Pass** | Developer tested Broomstick Flight at the live URL and reported: "Broomstick Flight works on my iPhone." Recorded by the Agent at the Developer's request. |
| Oct 22, 2026 | CP9 The Cottage Wakes, live URL (`5f5c771`) | Not restated (Oct 17: iOS 26.6.2) | **Pass** | Developer tested The Cottage Wakes at the live URL and reported: "Alright all of this looks really good." Recorded by the Agent at the Developer's request. |

### Agent evidence log

| Date | Checkpoint | Evidence (screenshots, console, behavior observed) | Commit |
| --- | --- | --- | --- |
| Oct 16, 2026 | 0 | Pages run "pages build and deployment" succeeded about 35 s after the push. Live URL returns HTTP 200 over HTTPS (HTTP redirects with a 301), and the live HTML matches local `index.html` byte for byte. Built-in browser at 390×844 and 375×667: readout matches each size, no scroll, no console errors. | `8f56872` |
| Oct 17, 2026 | 1 | Rough layout approved first (`3bccc51`), then the detailed art (`3e1ab06`). `?dev=1` reported no tappable object clipped at 390×844, 375×667, and 390×664. At an estimated SE-size viewport (375×548) the toadstool clips. Desktop frame shows the whole scene at exactly 390:844. No console errors. The Developer reported no clipping on their iPhone and approved the look and the brief's palette in chat. Found: Pages caches files for 10 min (see `research.md`). | `8298055` |
| Oct 17, 2026 | 2 | 9 objects are focusable buttons. `?dev=1` tap check: smallest tap area 50 / 48 / 50 / 45 px at 390×844 / 375×667 / 390×664 / desktop, none clipped or overlapping. Keyboard order Enter → Pause → Raven → Attic window → Spider web → Left window → Right window → Broom → Cauldron → Toadstool → Moonflower, with a visible focus ring; Space and Enter activate. Pause lock: a cauldron tap animates while playing and does nothing while paused. Hint contrast 15.1:1, Enter button 10.2:1. Landscape message shows at 667×375. No console errors. Live files match the commit (`a864163`). The Developer said to keep going; the iPhone tap test result was not reported. | `5734c7b` |
| Oct 17, 2026 | 3 | Five effects on the clock. Before Enter the clock stays at 0 with no effects. First bat flight at 6 s crossed the moon (screenshot); later gaps over 2 min of fast-forwarded time were 34.8, 18.7, 26.0, and 27.0 s. Pause stops the clock and Play restarts it. `?motion=reduce`: fog stays put, bats don't move, smoke doesn't rise, bubbles off. 120 fps on the Mac (longest frame 9 ms). Tap areas unchanged (smallest 48 px at 375×667). No console errors. Live files match `e09a3e3`. The Developer checked it on the iPhone and said "this is good"; all five effects kept. | `cca993c` |
| Oct 17, 2026 | 4 | Before Enter: no AudioContext, clock at 0. After a real click on Enter: context `running`, master output −39 dB (quiet ambience playing), focus on Pause. Pause: context `suspended`, audio and app clocks both still for 0.8 s, scene inert, Web Animation paused; Play resumed all of it. Simulated hide auto-paused with the overlay shown. One-shots over 3 min of fast-forwarded time: first at 14 s, then gaps 39, 25, 16, 29, 30, 35 s, no repeats (all generated stand-ins). All 10 CSS/JS files load as `?v=4`. No console errors or warnings. Live files match `5f89b49`. The Developer asked to commit CP4; the iPhone listening test (silent switch, lock and unlock, Reduce Motion) was **not reported**, so it is still owed. | `e21ab0f` |
| Oct 17, 2026 | 5 | Cauldron Brew on the pausable timeline. Real-time runs measured 8.53, 8.53, 8.50 s; fast-forwarded replays 8.51 ×3 (all within 5–10 s). Screenshots at 1.6 s (gold boil-over), 3.5 s (spirit looping the cottage), 5.4 s (crossing the moon), 6.9 s (spiral), 7.4 s (POP). Paused at about 2.5 s: frozen for 2 s; Play finished at 8.50 s of story time. A toadstool tap during the story did nothing. Return: scene unlocked, focus on the cauldron, all story elements at rest. `?motion=reduce`: no swell, spill travel, scaling, or shake; spirit hovers and pulses. No console errors. Live files match `a112d8c`. The Developer checked it on the iPhone and said "everything is good" (pacing, spirit, and dimming kept as built). | `8eeda0c` |
| Oct 17, 2026 | 6 | Touch path from a fresh load (real clicks): toadstool → green brew + rune 1, moonflower → purple + rune 2, web → rune 3 and the story on landing, 8.50 s to unlock; afterwards focus on the cauldron, all ingredients back and tappable, runes dark, brew cleared. Keyboard path from a fresh load: Enter → 8 Tabs → Toadstool → (focus to Cauldron) → Moonflower → Cauldron → 4 Shift+Tabs → Web → story. Wrong order (toadstool then web): burp, "Hrk. Not like that." above the raven, full reset and regrow. Hints with no progress at 20.0, 65.0, 110.0 s, 8 s each, then none; an ingredient landing at 31.2 s moved the next to 76.2 s; raven tap repeats it; no hints for 130 s after the story, then "Caw! Again! Again!". Window flare (glow r 34 → 44), broom twitch, cauldron bubble. `?motion=reduce`: ingredients fade in place, no scaling. Tap areas unchanged; no console errors. Live files match `9a39a5a`. The Developer played it on the iPhone: "cp6 is all good". | `a2c2ad2` |
| Oct 17, 2026 | 7 | Credits: `CREDITS.md` plus a Credits panel (opens with focus on Close, start screen inert behind it; Escape and Close both close it and return focus). Cleanup: left-of-raven bubble code and `?bubble=` removed, the dev view reads the longest hint from the real ladders, unused exports made private, stale checkpoint notes rewritten; title kept on one line at 375 px. Full regression on asset version 7: touch path with audio running (story 8.50 s, all ingredients back, focus on the cauldron); pause mid-story frozen 2 s with audio suspended, then 8.50 s; keyboard path to the story; hints at 20 / 65 / 110 s; longest hint 3 lines above the raven at 375×667; tap areas smallest 48 / 50 / 45 px at 375×667 / 390×664 / desktop, none clipped or overlapping; landscape message; no console errors. | this commit |
| Oct 22, 2026 | 8 | Broom by real clicks: glow 0.4 → 0.75 → 1 with growing shakes and gold dust; story 0.45 s after tap 3. Flight screenshots at 1.2 s (rising from the door, scene dimmed), 3.6 s (loop over the moon with bats and sparkles), 5.3 s (sweeping left), 7.2 s (gliding to the door). Three replays: 8.51 s each. Paused mid-flight: frozen 2 s, then finished with focus on the broom. Keyboard (Enter, Space, Enter on the focused broom) reaches the story. Hints: broom played first → cauldron hint 2 at 53.6 s (its ladder kept its place); after the brew → first broom hint 20.0 s later; both played → "Caw! Again! Again!". Reduced motion: the witch only fades at the door and the moon. Cauldron regression passes. No console errors. | this commit |
| Oct 22, 2026 | 9 | Windows start low (shade 0.75, glow about 0.25). Real clicks in any order (right, right again, attic, left): each lights for good (shade 0 → stays), the repeat tap adds nothing, and the story starts 0.45 s after the third. Screenshots at 1.0 s (heavy lids), 2.2 s (eyes open, pupils looking), 3.3 s (yawning door-mouth, squint), 5.3 s (three smoke rings, eyes up), 7.4 s (eyes shut, door closed, Z's). End: back to SCENE, everything reset, windows low, focus on the attic window. Paused mid-yawn: frozen 2 s with the scene inert, then finished. Keyboard (Enter, Space, Enter on focused windows) reaches the story. Runs: 8.50 s ×3 (Wake dev) and 8.50 s from real taps; reduced motion 8.50 s with no transforms on lids, pupils, or door. Hints from a fresh load: cauldron and broom by real taps (8.50 s each), first cottage hint 20.00 s after the flight, hint 2 +30.0 s, a window tap resets the countdown (hint 3 30.00 s later); after all three stories no hint in 2 min and the raven says "Caw! Again! Again!". Offline render: yawn lowered to the rumble's loudness (−25.5 dB RMS); poof −28.4, snore −29.9. 375×667: tap areas clean, story in frame. No console errors. | this commit |
| Oct 22, 2026 | 10 | **Cleanup:** the dim, closing shimmer, and ambience dip copied in three stories became one shared frame (`js/stories/frame.js`), and the broom and windows share one trigger ending. **Bug found in review and fixed:** reproduced twice on the old code (toadstool, moonflower, web, then 3 fast broom taps): the broom flew while the web was still on its way, the brew never started, and all three ingredients stayed hidden with the runes lit, a dead end until reload. After the fix the same taps empty the pot and regrow the ingredients. **Same output as before:** dim at 0.5 / 1.0 / 7.7 / 8.05 s: broom 0.275 / 0.55 / 0.275 / 0.025, cauldron 0.3 / 0.6 / 0.3 / 0.027, cottage 0.4 at 7.7 s; shimmer at 7.7 s translate(−150) 0.342 and at 8.05 s translate(95) 1.0 in all three; reduced motion: the full-width wash at 0.6 in all three. Ambience channel 0.140 mid-story (0.35 × 0.4), 0.349 after. Lengths 8.50 s (8.51 when stepped in 10 ms). Cottage paused at 5.3 s: frozen 2 s, scene inert, then finished. Mid-beat screenshots of all three match CP5, CP8, and CP9. No unused imports; no console errors. | this commit |

### Playtest observations

**Playtest 1 (Phase 1 build, before Oct 22, 2026).** Peers explored the Phase 1 build. The Developer reported this summary on Oct 22. Tester count and per-tester actions weren't recorded, so these rows hold the reported feedback rather than step-by-step observations.

| # | What the Users did or said (as reported) | Interpretation | Priority |
| --- | --- | --- | --- |
| P1 | It isn't clear what to select; there's a lot of guessing, and that frustrates. | The three ingredients don't stand out enough from the rest of the scene, so their affordance is weak. | High: R1, R3 |
| P2 | Suggested making the environment more dynamic: a field of blue mushrooms with one green mushroom, so the one to pick is clear. | Users need contrast (an odd one out) to see which object matters. | High: R1 |
| P3 | The raven that gives the hints is hidden; it blends with the night background. | The progressive hints can't help if Users never notice their source, so discovery falls back to guessing. | High: R2 |

**Revision priorities (approved Oct 22):** R1 a ring of small dim blue mushrooms around the single green glowing toadstool; R2 a visible raven (moonlight outline, glowing eye, halo, idle head-turn and blink, wing flap when it speaks); R3 ingredients that pulse brighter in turn, and faster hints (12 s, then every 30 s). Check: a browser regression, then a re-test on the iPhone, ideally with a new tester and no explanation.

### Revisions

| # | From | What changed | How it was checked | Status |
| --- | --- | --- | --- | --- |
| R1 | P1, P2 | The 5 grey mushrooms became a ring of 13 small, dim **blue** mushrooms around the one big **green** glowing toadstool. Tapping the blue ones gets a bounce, blue spores, and a soft "boop", but no progress. | Browser, Oct 22: a real tap made the nearest blue mushroom bounce and puff spores; runes stayed dark; the toadstool was untouched. 11 tap areas, smallest 48 px at 375×667, none clipped or overlapping at 390×844, 375×667, 390×664, or desktop. "Blue mushrooms" sits before "Toadstool" in tab order. | Built; **Developer verified on iPhone (Oct 22)** |
| R2 | P3 | The raven got a moonlit outline, a glowing amber eye, and a halo that brightens while it speaks. It blinks and glances back every 6.5 s and flaps its wing when it speaks. | Browser, Oct 22: screenshot shows the raven standing out from the sky; the head turns during its idle cycle; at every hint the wing flaps and the halo goes 0.55 → 0.95, then back. Reduced motion: no head turn, and the eye flashes instead of a flap. | Built; **Developer verified on iPhone (Oct 22)** |
| R3 | P1, P3 | Each ingredient pulses brighter in turn every 5 s. Hints now come at 12 s, then +30 s, then +30 s (was 20 / 45 / 45). | Browser, Oct 22: hints at 12.0, 42.0, 72.0 s, 8 s each; the pulse glow swells and fades (reduced motion: brightens only). Regression: brew to story to regrow, pulses intact; no console errors. | Built; **Developer verified on iPhone (Oct 22)** |

**Re-check (Oct 22):** the Developer played the revised build on the iPhone at the live URL (`56bcdbe`) and reported "Everything is good". That was the Developer's own check, not a cold re-test with a new tester; one is still worth running after the Phase 2 stories are in (playtest 2).

### Phase 1 delivery checklist (`Weenie Project-Brief.md` › Deliverables)

Agent evidence is in the log above; boxes marked *Developer* are yours to tick.

| Requirement | Evidence | Status |
| --- | --- | --- |
| One vertical scene, no scrolling or page changes | CP1, CP2, CP7: fits 390×844, 375×667, 390×664; landscape message | Agent verified |
| Focal point (cottage) and 3+ environmental features | CP1: cauldron, mushroom ring, pond and moonflower, crooked tree and web | Developer approved (CP1) |
| 3+ ambient effects | CP3: fog, candlelight, smoke and bubbles, fireflies, bats | Developer approved (CP3) |
| Looping ambient background sound | CP4: generated crickets, wind, and bubbling, looped gaplessly | Agent verified; Developer verified on iPhone (Oct 17) |
| Start screen whose Enter starts audio and animation | CP4: no audio or effects before Enter; running after | Agent verified |
| Reduced motion honored before the experience begins | CP4–CP6: note on the start screen; every effect and the story have reduced versions | Agent verified; Developer verified on iPhone (Oct 17) |
| One Play/Pause for motion, sound, effects, timers, interaction | CP4, CP5, CP7: clock, audio, animations, and input freeze and resume together | Agent verified |
| Story: beginning, middle, end; 5–10 s; replays | CP5–CP7: 8.50 s every run; replays without reloading | Developer approved (CP5) |
| Triggered by interaction; every tap gives feedback; unique triggers; progress | CP6: 9 objects, each with its own response; brew colors and runes | Developer approved (CP6) |
| Raven hints progress over time and hint rather than instruct | CP6, CP7: 20 / 65 / 110 s, reset by progress | Developer approved (CP6) |
| Other interactions disabled during the story; clear return | CP5–CP7: scene inert in story mode; shimmer, caw, focus to the cauldron | Agent verified |
| Touch and keyboard; readable text; contrast; 44 px targets | CP2, CP6, CP7: keyboard path to the story; hint text 15.1:1; targets 45–50 px | Agent verified |
| Developer and all external assets credited | CP7: `CREDITS.md` and the Credits panel (no external assets used) | Agent verified |
| Public HTTPS GitHub Pages URL | https://rg-sureshkumar-goat.github.io/Halloween-Weenie/ | Agent verified |
| Verified on the physical iPhone (date and iOS version) | iPhone log below: Oct 17, 2026, iOS 26.6.2 | Developer verified |
| Code and assets pushed; docs current; brief, AGENTS.md, CREDITS.md; git log; transcripts | All pushed; `git-log.txt`; `transcripts/build-2026-10-17_011502.md` | Done; docs approved by the Developer (Oct 17) |

### Phase 2 delivery checklist (`brief.md` › Requirements and Phase 2 deliverables)

Agent evidence is in the log above; *Developer* items are yours to confirm. Rows marked **final check** are re-verified on the iPhone at the live URL with all three stories (the iPhone Safari checklist below).

| Requirement | Evidence | Status |
| --- | --- | --- |
| One vertical scene, no scrolling or page changes | CP1, CP2, CP9: 390×844 and 375×667, 11 tap areas none clipped; landscape message | Agent verified; **final check** |
| Strong focal point and 3+ environmental features | CP1 (cottage, cauldron, mushroom ring, pond, tree and web); R1 blue ring | Developer approved (CP1, R1) |
| 3+ ambient effects | CP3: fog, candlelight, smoke and bubbles, fireflies, bats | Developer approved (CP3) |
| Looping ambient background sound | CP4: crickets, wind, bubbling, looped gaplessly | Developer verified (Oct 17); **final check** |
| Sounds: CC0, public domain, or original, sources verified | All sound generated in code (`research.md` › Sound sources) | Agent verified |
| Three stories with a beginning, middle, and end; 5–10 s; replayable | CP5, CP8, CP9, CP10: 8.50 s each, 3+ replays each | Agent verified; Developer verified CP8, CP9 (Oct 22); **final check** |
| Triggered by interaction; unique triggers that show progress; every interaction gives feedback | Ingredients in order (brew color, runes); broom ×3 (glow); windows in any order (stay lit); blue mushrooms, cauldron, raven respond | Agent verified; Developer approved (CP6, CP8, CP9) |
| Progressive text hints that hint rather than instruct | Three ladders, each 3 rhymes; reset by progress; stop after all three stories | Agent verified timing; Developer approved rhymes (Oct 17, Oct 22) |
| Other interactions disabled during a story; clear return | Shared `startStory()`: scene inert, shimmer, caw, focus returns; CP10 dead-end fix | Agent verified; **final check** |
| Browser-based HTML, CSS, and JavaScript | Plain ES modules, no build step | Agent verified |
| Start screen; Enter starts audio and animation; reduced motion honored before it | CP4; reduced versions of every effect and story | Developer verified (Oct 17); **final check** |
| One Play/Pause for motion, sound, effects, timers, interaction | CP4–CP10: pause mid-story for all three | Agent verified; **final check** |
| Touch and keyboard; readable text; contrast; tap targets | Keyboard reaches all three stories; hint text 15.1:1; tap areas ≥ 48 px | Agent verified; **final check** |
| Public HTTPS URL, verified on a physical phone | https://rg-sureshkumar-goat.github.io/Halloween-Weenie/ | Developer: **final check** |
| Developer and all external assets credited | `CREDITS.md` and the Credits panel (no external assets) | Agent verified |
| Polished, cohesive, stable | Shared story frame; one trigger rule; dead-end fixed | Developer: **final check** |
| **Deliverable 1:** peer-playtest notes, sustained testing, consequential revisions, final verification | Playtest 1 → R1–R3; Agent evidence CP8–CP10; iPhone log | Playtest 2 and the final iPhone check to come |
| **Deliverable 2:** the completed app | Live URL above | After the final check |
| **Deliverable 3:** docs, sources and credits, git log, completed debrief | Docs updated Oct 22 (Developer approval pending); `CREDITS.md`; `git-log.txt` refresh, debrief transcript, and zip to come | To come |

### iPhone Safari checklist (Developer, at the live URL)

| # | Check (`Weenie Project-Brief.md` › iPhone Safari checklist) | Phase 1 | Final, all three stories (CP10) |
| --- | --- | --- | --- |
| 1 | Audio starts only after Enter and is audible at normal volume | Pass (Developer, Oct 17) | |
| 2 | With the ringer switch on silent, sound still plays (or the start screen says to turn silent mode off) | Pass (Developer, Oct 17) | |
| 3 | Sound files are MP3 for Safari | n/a: no audio files ship; all sound is generated | n/a |
| 4 | Locking the phone or switching apps pauses; returning shows the paused state and resumes cleanly | Pass (Developer, Oct 17) | |
| 5 | No scrolling, rubber-banding, accidental zoom, or text-selection pop-ups | Pass (Developer, Oct 17) | |
| 6 | Nothing hidden under the notch, Dynamic Island, or home bar | Pass (Developer, Oct 17) | |
| 7 | Reduce Motion (Settings › Accessibility › Motion) changes the experience before Enter | Pass (Developer, Oct 17) | |
| 8 | Every object registers taps reliably on the first try | Pass (Developer, Oct 17) | |
| 9 | Animation stays smooth during the story | Pass (Developer, Oct 17) | |
| 10 | Each story starts from its trigger by touch, plays smoothly, and replays | (Phase 2) | |
| 11 | The sound mix is balanced across all three stories | (Phase 2) | |
| 12 | The raven's hints lead to each story in turn and stop after all three | (Phase 2) | |

## Saving transcripts

When directed, save the complete conversation as `transcripts/plan-YYYY-MM-DD_HHMMSS.md` or `transcripts/build-YYYY-MM-DD_HHMMSS.md`, label messages `Developer` and `Agent`, and confirm the path.
