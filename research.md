# Research

> EDITING DIRECTIVE: DEVELOPER AND AGENT EDIT THIS FILE COLLABORATIVELY. THE DEVELOPER MUST REVIEW AND APPROVE ITS CONTENT.

Purpose: Keep the evidence and creative decisions that currently guide the build.

## Working agreement

Developer: Run the starter first. Direct the inquiry, judge sources and options, make consequential decisions, and keep this file current.

Agent: Read `AGENTS.md`, `brief.md`, and this file, then inspect the project. Help compare possibilities, test assumptions quickly, and verify external sources without delaying the prototype for exhaustive research.

Start a fresh chat with:

`Read brief.md and research.md, inspect the running project, and help me develop the scene and three spooky stories.`

## Inquiry and decisions

Record only what informs the next build decisions:

- creative alternatives for the scene, stories, and audiovisual direction, with reasons for your choices
- useful sources and references, what they support, and important limitations
- experiments that resolve uncertainty, the results, and consequential trade-offs

Investigate unfamiliar techniques or asset sources as needed. Verify usage terms and keep source links and required credits here. Distinguish evidence from assumptions; the Agent's recommendation alone is not evidence.

> **Status (Oct 16, 2026):** Seeded from `Weenie Project-Brief.md` and approved by the Developer as the starting direction. **Approved** marks settled decisions. **Proposed** items are each settled at the checkpoint listed under *Open decisions*.

### Approved direction

These are the Developer decisions from `Weenie Project-Brief.md` › *Developer decisions*:

- **Scene:** a witch's cottage in a forest clearing at night. The focal point is the crooked cottage.
- **Stories:** Cauldron Brew (Phase 1); Broomstick Flight and The Cottage Wakes (Phase 2).
- **Hints:** the witch's raven on the roof speaks rhyming hints in a speech bubble.
- **Art:** code-drawn SVG and CSS, with no raster art. A canvas layer is allowed for particles.
- **Stack:** plain HTML, CSS, and JS ES modules, with no framework and no build step. Hosted on GitHub Pages (public HTTPS).
- **Target device:** iPhone Safari. Verification and playtesting happen there.

Reasons recorded in the brief: SVG stays sharp at any phone size, and a static site with no build step leaves the fewest moving parts before a weekend deadline.

### Proposed creative direction

- **Concept: "The Witch's Hollow."** A moonlit clearing with a glowing crooked cottage and a simmering cauldron, where the forest "waits for someone to stir things up." The tone is storybook-spooky and playful for ages 10+, with no gore, no menace toward people, and no branding.
- **Why it serves the client's weenie goal:** the warm cottage glow pulls the eye first. The three ingredients sit in three different corners (ring, pond, tree), so finding them rewards looking beyond the focal point.
- **Style:** layered "cut-paper storybook" silhouettes, made of flat shapes, soft gradients, and glows. Light comes only from the moon (cool) and from magic (warm windows, green cauldron). The palette is in `Weenie Project-Brief.md` › *Visual style*. The final palette will be chosen from the Checkpoint 1 screenshots.
- **Environmental features (4):** cauldron, mushroom ring, pond with moonflower, crooked tree with web.
- **Ambient effects:** 5 candidates (fog, fireflies, bats, candle flicker, smoke and bubbles). Build them and keep the best 3+ after seeing them on the iPhone.
- **Alternatives considered:** the brief records only the chosen direction. *Developer: add any scenes or stories you rejected and why, if you want that reasoning on record.*

### Technique notes: evidence vs. assumptions

| Claim the build relies on | Status | Resolve at |
| --- | --- | --- |
| Free GitHub Pages needs a public repo | **Verified Oct 16, 2026** ([GitHub Docs](https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site)): on GitHub Free the repo must be public; a private repo needs a paid plan, and the site is still publicly visible | Resolved |
| Pages serves the site from `/<repo>/`, so all paths must be relative | Assumption | CP0, live URL loads assets |
| iOS Safari only starts Web Audio inside a user gesture (Enter tap) | Well established; untested here | CP4 on iPhone |
| The ringer/silent switch mutes Web Audio unless `navigator.audioSession.type = "playback"` is set | **Unverified.** Support and behavior need checking | CP4 on iPhone; fallback is a start-screen note |
| `AudioBufferSourceNode.loop` is gapless; `<audio loop>` is not | Well established; untested here | CP4, by ear |
| iOS Reduce Motion is exposed as `prefers-reduced-motion: reduce` | Well established; untested here | CP4 on iPhone |
| Animating SVG blur filters is slow on iPhone, while `transform`/`opacity` stay smooth | Assumption | CP3 on iPhone |
| Safari's toolbars make the real viewport shorter than the screen (390×844 phone ≠ 390×844 viewport) | Likely; exact height unknown | CP0: the placeholder's readout shows `innerHeight` on the iPhone |
| Headless Chrome CLI (`--screenshot --window-size=390,844`) gives phone-width screenshots | **Failed Oct 16, 2026:** new headless mode laid the page out 500 px wide and cropped it. The built-in browser's viewport emulation reported exactly 390×844 and 375×667, so it's the screenshot tool for now | Resolved |

### Sound sources

Workflow and the full needs list are in `Weenie Project-Brief.md` › *Sound workflow* and *Phase 1 sound list*. Rule: CC0 or public domain only. Confirm the license on each sound's own page before listing it. Flag anything CC-BY or NC and don't use it. Credit every sound anyway in `CREDITS.md`.

To be filled at Checkpoint 3 (two options per sound):

| Sound | Option | URL | Author | License (checked on page) | Length | Why it fits | Pick |
| --- | --- | --- | --- | --- | --- | --- | --- |
| *(none yet)* | | | | | | | |

Until the files arrive, generated Web Audio placeholder tones stand in. They need no credit.

### Fonts

System fonts for UI and hints. A display font for the title is optional; if used, it must be OFL and credited. *Undecided.*

### Open decisions (raise at the checkpoint where each matters)

| Decision | Proposed | Raise at |
| --- | --- | --- |
| Ingredient order: required or any order | Required, revisit after playtest | CP6 |
| Hint timing and final rhymes | 20 s / +45 s / +45 s; rhymes in brief | CP6 |
| Start-screen title | "Virtual Hallo-weenie", subtitle "The Witch's Hollow" | CP4 |
| Final palette and look | Brief palette | CP1 |
| Which ambient effects to keep | Decide on iPhone | CP3 |
| Commit original sound files or only processed MP3s | Undecided | CP3 |
| Phase 2 due date | Unknown | — |

## Revisions

Update decisions when new evidence changes the direction, linking to playtest observations in `plan.md` rather than copying them. Keep chosen behavior and asset requirements in `spec.md`. The Developer confirms when the inquiry is sufficient to continue building; exhaustive research is not a prerequisite.

*None yet.*

## Saving the transcript

When directed, save the complete conversation as `transcripts/research-YYYY-MM-DD_HHMMSS.md`, label messages `Developer` and `Agent`, and confirm the path.
