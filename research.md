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

> **Status (Oct 17, 2026):** Final Phase 1 version, **approved by the Developer on Oct 17, 2026**. Every Phase 1 decision below is settled (see *Open decisions*); items still open are for Phase 2.

### Approved direction

These are the Developer decisions from `Weenie Project-Brief.md` › *Developer decisions*:

- **Scene:** a witch's cottage in a forest clearing at night. The focal point is the crooked cottage.
- **Stories:** Cauldron Brew (Phase 1); Broomstick Flight and The Cottage Wakes (Phase 2).
- **Hints:** the witch's raven on the roof speaks rhyming hints in a speech bubble.
- **Art:** code-drawn SVG and CSS, with no raster art. A canvas layer is allowed for particles.
- **Stack:** plain HTML, CSS, and JS ES modules, with no framework and no build step. Hosted on GitHub Pages (public HTTPS).
- **Target device:** iPhone Safari. Verification and playtesting happen there.

Reasons recorded in the brief: SVG stays sharp at any phone size, and a static site with no build step leaves the fewest moving parts before a weekend deadline.

### Creative direction (approved through CP1–CP6)

- **Concept: "The Witch's Hollow."** A moonlit clearing with a glowing crooked cottage and a simmering cauldron, where the forest "waits for someone to stir things up." The tone is storybook-spooky and playful for ages 10+, with no gore, no menace toward people, and no branding.
- **Why it serves the client's weenie goal:** the warm cottage glow pulls the eye first (from Phase 2 its windows burn low until the User lights them, so the glow grows as they play). The three ingredients sit in three different corners (ring, pond, tree), so finding them rewards looking beyond the focal point.
- **Style:** layered "cut-paper storybook" silhouettes, made of flat shapes, soft gradients, and glows. Light comes only from the moon (cool) and from magic (warm windows, green cauldron). The palette is in `Weenie Project-Brief.md` › *Visual style*. **Approved Oct 17** after the Developer reviewed the CP1 art on the iPhone. Only the three ingredients glow (toadstool, moonflower, web), which backs up the first raven hint ("hungry for things that glow").
- **Environmental features (4):** cauldron, mushroom ring, pond with moonflower, crooked tree with web.
- **Ambient effects:** 5 candidates (fog, fireflies, bats, candle flicker, smoke and bubbles). Build them and keep the best 3+ after seeing them on the iPhone.
- **Alternatives considered:** the brief records only the chosen direction. *Developer: add any scenes or stories you rejected and why, if you want that reasoning on record.*

### Technique notes: evidence vs. assumptions

| Claim the build relies on | Status | Resolve at |
| --- | --- | --- |
| Free GitHub Pages needs a public repo | **Verified Oct 16, 2026** ([GitHub Docs](https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site)): on GitHub Free the repo must be public; a private repo needs a paid plan, and the site is still publicly visible | Resolved |
| Pages serves the site from `/<repo>/`, so all paths must be relative | Assumption | CP0, live URL loads assets |
| iOS Safari only starts Web Audio inside a user gesture (Enter tap) | Well established; untested here | CP4 on iPhone |
| The ringer/silent switch mutes Web Audio unless `navigator.audioSession.type = "playback"` is set | **Fact-checked Oct 17:** WebKit treats Web Audio as "ambient" (obeys the switch); setting `playback` is the documented fix ([MDN](https://developer.mozilla.org/docs/Web/API/AudioSession/type), [WebKit bug 237322](https://auto-bugs.webkit.org/show_bug.cgi?id=237322)). Implemented at CP4; **iPhone result not yet reported** | Developer's iPhone listening test |
| `AudioBufferSourceNode.loop` is gapless; `<audio loop>` is not | Well established; untested here | CP4, by ear |
| iOS Reduce Motion is exposed as `prefers-reduced-motion: reduce` | Well established; untested here | CP4 on iPhone |
| Animating SVG blur filters is slow on iPhone, while `transform`/`opacity` stay smooth | Assumption | CP3 on iPhone |
| Safari's toolbars make the real viewport shorter than the screen (390×844 phone ≠ 390×844 viewport) | **Checked Oct 17:** the `?dev=1` view on the Developer's iPhone reported no tappable object clipped. Exact viewport numbers were not recorded. In emulation, an estimated SE-size Safari viewport (375×548) would clip the toadstool | Resolved for the Developer's iPhone; recheck on other phones at the playtest |
| GitHub Pages caching (fixed at CP4 with versioned file links and an import map) | **Observed Oct 17:** `cache-control: max-age=600`. For up to 10 min after a deploy, browsers can show the previous files, and can mix a new page with an old stylesheet | For now, add a new `?v=…` when checking a fresh deploy. Versioned asset links proposed at CP4 |
| Headless Chrome CLI (`--screenshot --window-size=390,844`) gives phone-width screenshots | **Failed Oct 16, 2026:** new headless mode laid the page out 500 px wide and cropped it. The built-in browser's viewport emulation reported exactly 390×844 and 375×667, so it's the screenshot tool for now | Resolved |

### Sound sources

**Decided Oct 17 (Developer): hybrid sound design.** Simple effects are generated in code with Web Audio, so they need no files, downloads, or credits and can be tuned instantly. Only the five natural or voice sounds that synthesis can't fake convincingly use CC0 recordings. This replaces the brief's plan of sourcing all 18 sounds as files.

**Why the search ran through Openverse, not Freesound.** Freesound's `robots.txt` disallows automated access to `/search/` for every bot and blocks Claude's crawler entirely, and the site rate-limited the Agent's first few requests (HTTP 429). The Agent stopped and, with the Developer's OK, searched [Openverse's public API](https://api.openverse.org/v1/) with a CC0 filter instead. Openverse indexes Freesound and reports each sound's license. Its `robots.txt` also lists the audio API, most likely to keep search engines from indexing it. The Agent made 9 spaced requests.

**License check.** Every option below is listed as CC0 1.0 by Openverse. That is evidence, not proof: the Developer confirms the CC0 badge on each Freesound page when downloading, then ticks *Confirmed*. The Agent could not listen to the clips, so its picks are based on length, tags, and recording context (it avoided traffic, voices, and dogs). The Developer picks by ear.

| Sound | Option | Author · length | Why it might fit | Confirmed CC0 on page |
| --- | --- | --- | --- | --- |
| Night bed (crickets) | [crickets.wav](https://freesound.org/people/Sclolex/sounds/210540) | Sclolex · 38 s | Tagged "loop", short enough to loop seamlessly and stay small | ☐ |
| | [Gentle rich cricket and insects at night](https://freesound.org/people/The_Sound_Side/sounds/331444) | The_Sound_Side · 140 s | "Gentle" sits well under interaction sounds; would be trimmed to ~45 s | ☐ |
| Owl hoot | [Owl Hooting](https://freesound.org/people/howebzar/sounds/415153) | howebzar · 6 s | Tawny owl, the classic storybook "hoo-hoo" | ☐ |
| | [Tawny Owl](https://freesound.org/people/faxfaxfax/sounds/655380) | faxfaxfax · 7 s | Same species, a second take to compare | ☐ |
| Creaking branch | [tree_creak_05](https://freesound.org/people/Department64/sounds/95263) | Department64 · 13 s | Tree creak in wind, short | ☐ |
| | [Tree creaks](https://freesound.org/people/Sacha.Julien/sounds/726217) | Sacha.Julien · 62 s | Forest field recording; pick the best creak | ☐ |
| Cackle (distant + spirit) | [witch cackle](https://freesound.org/people/ImATaco/sounds/701358) | ImATaco · 3 s | Tagged cartoon/funny/goofy: playful rather than menacing, right for ages 10+ | ☐ |
| | [witchy laugh 4](https://freesound.org/people/ivanmilic/sounds/557524) | ivanmilic · 4 s | Part of a 7-take series by one voice, so the ambient and story cackles can differ but match | ☐ |
| Raven caws (2–3) | [raven x3](https://freesound.org/people/nielstii/sounds/346318) | nielstii · 3 s | Three calls in one clip, so three variants from one file | ☐ |
| | [Common Raven, Yellowstone](https://freesound.org/people/Nivatius/sounds/519591) | Nivatius · 13 s | A real raven's croak, deeper than a crow's caw | ☐ |

**Generated in code (no files, no external credit):** the wind layer under the crickets, cauldron bubbling loop, toadstool "poink", moonflower chime, web twang (plucked-string synthesis), wrong-order "blorp", window candle "fwip" with its own note, broom rustle, cottage yawn, smoke-ring poofs, snore, Enter and Play/Pause clicks, boil-over rumble, spirit whoosh, suction "fwoop", and pop.

Downloads go in `assets/audio/source/`. Processing (trim, fade, convert, level) happens once files arrive; tooling choice pending (ffmpeg needs installing; macOS's built-in `afconvert` is the alternative).

### Fonts

**Decided Oct 17:** system fonts throughout, so there is nothing to load or credit. A display font for the title (OFL, credited) remains a Phase 2 polish option.

### Open decisions (raise at the checkpoint where each matters)

| Decision | Decision or proposal | Raise at |
| --- | --- | --- |
| Ingredient order: required or any order | **Decided Oct 17:** required (toadstool, moonflower, web); revisit after the playtest | Phase 2 playtest |
| Hint timing and final rhymes | **Revised Oct 22 after playtest 1 (P1, P3):** 12 s / +30 s / +30 s, each shown 8 s (was 20 / 45 / 45); the brief's three rhymes | Phase 2 re-test |
| Broomstick Flight trigger and hints | **Decided Oct 22:** 3 broom taps, progress holds; hints aim at the next unplayed story (cauldron, then broom), first broom hint 20 s after the previous story, then +30 s each; the drafted rhymes | Phase 2 re-test |
| The Cottage Wakes trigger and hints | **Decided Oct 22:** the windows burn low until tapped and stay lit (any order, progress holds); hints follow the broom's (20 s after the previous story, then +30 s each) with the drafted rhymes. Trade-off accepted: the cottage glows less at the start (it still flickers), so lit windows read as progress (playtest P1: less guessing) | Phase 2 re-test |
| Hint bubble placement | **Decided Oct 17:** above the raven (3 lines for the longest hint vs 7 beside it); the left option was removed at CP7 | — |
| Start-screen title | **Decided Oct 17:** "Virtual Hallo-weenie", subtitle "The Witch's Hollow" | — |
| Final palette and look | **Decided Oct 17:** the brief's palette, approved on the Developer's iPhone | — |
| Which ambient effects to keep | **Decided Oct 17:** all five (fog, candlelight, smoke and bubbles, fireflies, bats); the Developer checked them on the iPhone and said "this is good" | — |
| Recorded sounds in Phase 1 | **Decided Oct 17:** ship Phase 1 with generated sound only; the CC0 shortlist stays ready for Phase 2. If recordings are added, commit only the processed files and keep `assets/audio/source/` out of git (proposed) | Phase 2 |
| Phase 2 due date | **Mon, Oct 26, 2026** (Developer, Oct 22) | — |

## Revisions

Update decisions when new evidence changes the direction, linking to playtest observations in `plan.md` rather than copying them. Keep chosen behavior and asset requirements in `spec.md`. The Developer confirms when the inquiry is sufficient to continue building; exhaustive research is not a prerequisite.

*None yet.*

## Saving the transcript

When directed, save the complete conversation as `transcripts/research-YYYY-MM-DD_HHMMSS.md`, label messages `Developer` and `Agent`, and confirm the path.
