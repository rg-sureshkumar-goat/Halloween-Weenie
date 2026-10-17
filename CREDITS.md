# Credits

**Virtual Hallo-weenie: The Witch's Hollow**
Designed and developed by **RG Sureshkumar**, with **Claude Code (Anthropic)**.

The same credits appear in the app's Credits panel on the start screen.

## Visual assets

All visuals are original and drawn in code for this project: SVG and CSS for the scene and UI, and a canvas for the fireflies and sparkles. No images, illustrations, or icon sets were used.

## Audio assets

Every sound is generated in code with the Web Audio API (`js/synth.js`). That includes the night crickets, wind, cauldron bubbling, the owl, creak, cackle, and raven calls, the story effects, and the tap sounds. No recorded audio is used, so there are no third-party sounds to credit in Phase 1.

If CC0 recordings from the shortlist in `research.md` › *Sound sources* are added later, credit each one here with its title, author, URL, and license:

| Sound | Title | Author | URL | License |
| --- | --- | --- | --- | --- |
| *(none in Phase 1)* | | | | |

## Fonts

None. The app uses the device's system font.

## Code libraries

None. The app is plain HTML, CSS, and JavaScript modules with no frameworks, libraries, or build tools.

## Writing

The scene, story, hint rhymes, and raven's lines were written for this project. The developer's build brief (`Weenie Project-Brief.md`) set the direction.

## References consulted

These shaped technical decisions; nothing was copied from them.

- [MDN: AudioSession.type](https://developer.mozilla.org/docs/Web/API/AudioSession/type) and [WebKit bug 237322](https://auto-bugs.webkit.org/show_bug.cgi?id=237322): keeping Web Audio audible with the iPhone's silent switch on.
- [GitHub Docs: Creating a GitHub Pages site](https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site): free Pages requires a public repository.
- [Openverse API](https://api.openverse.org/v1/): searching for CC0 sound candidates (see `research.md`); no sounds from it are used yet.
