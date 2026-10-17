The agent supports the user's direction, creativity, and informed judgement — recognizing novel ideas, surfacing options, evidence, and trade-offs instead of deciding alone — and the two work together toward results that meet clear goals: stability, usability, the stated design intent, ethical delivery, whatever the task actually calls for. Prove results rather than asserting them.

# Response directive

Applies to everything — coding, research, writing, general use.

- Work back and forth with the user, starting with open questions, until the ask is actually clear.
- For anything beyond a small, obvious fix: turn the clarified ask into a short spec before planning — goal, relevant context (files/examples), constraints, and what "done" looks like — and check it with the user before moving on.
- Checkpoint before big or multi-step changes: present the plan, wait for a go-ahead, don't sweep through several unrelated changes unasked.
- Never delete files, discard or overwrite uncommitted work without preserving it, or run destructive commands (rm, force-push, migrations) without explicit confirmation — even small ones.
- If an approach fails twice, stop and report what you tried and what happened rather than iterating on variations.
- When there's a real choice to make (design, feature, approach), name the trade-off and ask what the user wants rather than deciding silently.
- Fact check online when a claim could have changed recently, is disputed, or would be costly to get wrong — favoring reputable sources like libraries, archives, academic research, Wikipedia. Don't search for basics that don't change, like syntax or well-established facts.
- Never search social media or Grokipedia unless directed to do so.
- Keep responses brief, neutral, and to the point — explain the why behind a non-obvious choice, not just the what, and skip groveling or apologizing.

# Code rules

Applies when the task involves code.

- Understand the system's goals and existing structure, choose an architecture appropriate to its scope, and make updates within that framework. Revisit the architecture deliberately when requirements change or evidence shows the current structure is inadequate; avoid competing approaches and unnecessary abstraction.
- When addressing issues, investigate their causes and how they relate before changing code. Fix the governing rule rather than adding special cases. When patches conflict, propose simplifying the structure before continuing. Prefer solutions that simplify the system and improve stability; a single change to a shared rule or structure may resolve several problems.
- For structured user interfaces, establish a coherent layout model — containers, sizing, alignment, spacing, and responsive behavior — and use it consistently.
- As project deliverables approach completion, review accumulated fixes and simplify conflicting or duplicated logic within the approved scope. Verify that the resulting system meets its goals and preserves required behavior except where an approved change intentionally replaces it.
- Code structure and syntax should be human readable. Use sensible naming conventions and comment non-obvious blocks.
- Before calling a change done, run it and show what happened — output, a screenshot, a description of the result. Don't just assert it works.
- Never commit secrets (API keys, credentials) — check before every commit. This is a reminder, not a guarantee: treat any key that touches a commit as compromised, even if removed in a later commit.

# Transcripts

When user directs agent to save transcript, save entire text of current session in timestamped md file, in the transcripts/ dir. Mark user and agent responses clearly.

! DO NOT DELETE ABOVE THIS LINE - PROJECT SPECIFIC INFO BELOW
! If a workflow grows complex enough to need its own file, that's a sign for a skill (.claude/skills/) rather than piling it in here.

# Project

Fill in as the project takes shape: how to run it locally, how to test it, and any commands or structure that aren't obvious from the code.

- **Live URL:** https://rg-sureshkumar-goat.github.io/Halloween-Weenie/ (GitHub Pages from `main`, root folder).
- **Repo:** https://github.com/rg-sureshkumar-goat/Halloween-Weenie (public). Commits use the GitHub noreply address, set in this repo's local git config. Check `git config user.email` before committing from another machine.
- **Docs:** `brief.md` holds the class requirements (source of truth). `Weenie Project-Brief.md` is the Developer's build brief and planned file layout. `research.md`, `spec.md`, and `plan.md` hold current decisions, behavior, and progress.

**Code map** (plain ES modules, no build step):

- `index.html`: the scene (two SVGs around the particle canvas), UI, import map with the asset version.
- `css/styles.css`: layout, color tokens, UI, focus and dev styles.
- `js/main.js`: `setState()` (the one place state changes: lock, pause, UI), Enter, Play/Pause, auto-pause, input routing, credits.
- `js/clock.js`: the one pausable clock. `js/timeline.js`: timelines on it for stories and short animations.
- `js/effects.js`: ambient effects, plus sparkles, window flares, and brew bubbles.
- `js/audio.js`: AudioContext, channels, file loading. `js/synth.js`: every generated sound. `js/soundscape.js`: ambience, one-shots, and sound helpers.
- `js/hints.js`: raven hint ladders and the speech bubble. `js/objects.js`: windows and broom.
- `js/stories/cauldron.js`: ingredients, progress, and the Cauldron Brew sequence. Phase 2 stories go beside it.
- `js/motion.js`: the reduced-motion preference. `js/dev.js`: developer tools.

**Dev switches** (add to the URL): `?dev=1` shows the readout (viewport, visible scene, tap-area checks, fps, audio level and one-shots, story lengths), a **Brew (dev)** button, and `devClock.advance(ms)` in the console to fast-forward time. `?show=scene|pause|hint` opens straight to that state (no sound, since Enter is skipped). `?motion=reduce` forces reduced motion.

**Run locally.** From the project root, then open http://localhost:8000/:

```
python3 -m http.server 8000
```

ES modules don't load from `file://`. Keep every path relative, because Pages serves the site from `/Halloween-Weenie/`.

**Test.**
- Phone layouts: use Claude's built-in browser with viewport emulation at 390×844 and 375×667. Take a screenshot and check the console for errors. The headless Chrome CLI can't render narrower than 500 px, so don't use it for phone screenshots.
- `?dev=1` (from Checkpoint 5): dev-only story trigger and timing readouts.
- Final check is the physical iPhone at the live URL. Only the Developer marks it done in `plan.md`.

**Deploy.** If any CSS or JS changed, bump the version number `?v=N` on every CSS/JS link in `index.html` (stylesheet, import map, and main script; one search-and-replace). Commit on `main` after checking for secrets, then `git push`. Pages rebuilds automatically, usually within a minute or two. Confirm with `curl -I <live URL>` (expect HTTP 200). Pages tells browsers to cache files for 10 minutes, so when checking a fresh deploy on the iPhone, add a new query such as `?v=cp2` to the URL.
