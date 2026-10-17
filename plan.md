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

> **Status (Oct 16, 2026):** **Phase 1 (due Mon, Oct 19, 2026)** plan seeded from `Weenie Project-Brief.md` and approved by the Developer. Each checkpoint follows the same loop: Agent presents the plan → Developer approves → Agent builds and shows evidence → Developer checks → commit and push.

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

- [ ] CP0 · [ ] CP1 · [ ] CP2 · [ ] CP3 · [ ] CP4 · [ ] CP5 · [ ] CP6 · [ ] CP7 *(Developer ticks after verifying)*

## Evidence and revisions

Record non-identifying playtest observations, separating what Users did or said from your interpretation. Use the findings to choose revision priorities and record what changed and how you verified the improvement.

Keep implementation progress and verification here. Update `research.md` when evidence changes a decision and `spec.md` when intended behavior changes; link to those updates rather than duplicating them. Record consequential changes, not every small adjustment.

### iPhone verification log (Developer only)

| Date | Checkpoint | iPhone model / iOS version | Result | Notes |
| --- | --- | --- | --- | --- |
| | | | | |

### Agent evidence log

| Date | Checkpoint | Evidence (screenshots, console, behavior observed) | Commit |
| --- | --- | --- | --- |
| Oct 16, 2026 | 0 | Pages run "pages build and deployment" succeeded about 35 s after the push. Live URL returns HTTP 200 over HTTPS (HTTP redirects with a 301), and the live HTML matches local `index.html` byte for byte. Built-in browser at 390×844 and 375×667: readout matches each size, no scroll, no console errors. | `8f56872` |
| Oct 17, 2026 | 1 | Rough layout approved first (`3bccc51`), then the detailed art (`3e1ab06`). `?dev=1` reported no tappable object clipped at 390×844, 375×667, and 390×664. At an estimated SE-size viewport (375×548) the toadstool clips. Desktop frame shows the whole scene at exactly 390:844. No console errors. The Developer reported no clipping on their iPhone and approved the look and the brief's palette in chat. Found: Pages caches files for 10 min (see `research.md`). | `8298055` |
| Oct 17, 2026 | 2 | 9 objects are focusable buttons. `?dev=1` tap check: smallest tap area 50 / 48 / 50 / 45 px at 390×844 / 375×667 / 390×664 / desktop, none clipped or overlapping. Keyboard order Enter → Pause → Raven → Attic window → Spider web → Left window → Right window → Broom → Cauldron → Toadstool → Moonflower, with a visible focus ring; Space and Enter activate. Pause lock: a cauldron tap animates while playing and does nothing while paused. Hint contrast 15.1:1, Enter button 10.2:1. Landscape message shows at 667×375. No console errors. Live files match the commit (`a864163`). The Developer said to keep going; the iPhone tap test result was not reported. | `5734c7b` |
| Oct 17, 2026 | 3 | Five effects on the clock. Before Enter the clock stays at 0 with no effects. First bat flight at 6 s crossed the moon (screenshot); later gaps over 2 min of fast-forwarded time were 34.8, 18.7, 26.0, and 27.0 s. Pause stops the clock and Play restarts it. `?motion=reduce`: fog stays put, bats don't move, smoke doesn't rise, bubbles off. 120 fps on the Mac (longest frame 9 ms). Tap areas unchanged (smallest 48 px at 375×667). No console errors. Live files match `e09a3e3`. The Developer checked it on the iPhone and said "this is good"; all five effects kept. | `cca993c` |
| Oct 17, 2026 | 4 | Before Enter: no AudioContext, clock at 0. After a real click on Enter: context `running`, master output −39 dB (quiet ambience playing), focus on Pause. Pause: context `suspended`, audio and app clocks both still for 0.8 s, scene inert, Web Animation paused; Play resumed all of it. Simulated hide auto-paused with the overlay shown. One-shots over 3 min of fast-forwarded time: first at 14 s, then gaps 39, 25, 16, 29, 30, 35 s, no repeats (all generated stand-ins). All 10 CSS/JS files load as `?v=4`. No console errors or warnings. Live files match `5f89b49`. The Developer asked to commit CP4; the iPhone listening test (silent switch, lock and unlock, Reduce Motion) was **not reported**, so it is still owed. | this commit |

### Playtest observations

Optional for Phase 1: one cold try after CP6. Required in Phase 2.

| # | What the User did or said | Interpretation | Priority |
| --- | --- | --- | --- |
| | | | |

### Revisions

*None yet.*

## Saving transcripts

When directed, save the complete conversation as `transcripts/plan-YYYY-MM-DD_HHMMSS.md` or `transcripts/build-YYYY-MM-DD_HHMMSS.md`, label messages `Developer` and `Agent`, and confirm the path.
