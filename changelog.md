# Changelog

## v26.09.27

Replace the "Coming Soon" placeholder with a pause-menu landing page styled after *Little Noah: Scion of Paradise*.

### Structure

- Landing page as a game pause menu: LB/RB tab bar (Player, Lineup, Play Data, Links) over a blurred, dimmed backdrop, inside a white panel with a gold filigree frame
- **Lineup:** Gaming Hub and Cheevo Tracker as portrait cards in a lineup band and a 6-column Stock grid, with locked "???" slots for future projects; detail panel with PWR, level, stat pills, screenshot and description. Level = releases and PWR = changes in each project's public changelog
- **Player:** avatar with my name on its plate, a "Background" section with about text, and motto / favorite genres and styles from Gaming Hub's config
- **Play Data:** live numbers from Gaming Hub's data (RA points, mastered, beaten, Steam hours, perfect games, gamerscore, achievements, games tracked)
- **Links:** records-style list with a detail card: GitHub, Gaming Hub, Cheevo Tracker, and my RetroAchievements, Steam and Xbox profiles
- Battle-style HUD (portrait with health arc, "site progress" bar, coin/gem/key counters), footer button-hint pills, keyboard controls (Q/E, ←/→, Enter, Y, X), and an intro dialogue with name plate shown once per session (`root_intro_seen`, prefixed because storage is shared with the project sites)
- On phones the tab bar is now a game-style carousel: the active tab sits centered at full size (ornaments kept), the neighbouring tabs peek in dimmed at both edges, LB/RB buttons and swiping move between tabs, and dots under the bar show position. Replaces the sideways-scrolling bar that hid the Links tab, and works for any number of future tabs
- Intro dialogue portrait is anchored to the speech box: behind its left edge on desktop, on its top-right edge on mobile (it was floating mid-screen on phones)
- Design system in `assets/noah-ui.css` (colors sampled from the game's menus; `nu-` tokens and components) documented in `STYLE.md`; page layout in `assets/site.css`. Only the style is recreated, no game assets
- Content in `data/site.json`; project icons and previews in `assets/projects/`
- Plain-HTML `404.html` in the menu style with links home and to each project. It only covers this site's paths: GitHub Pages doesn't use it for project sites, so Gaming Hub and Cheevo Tracker got their own matching `404.html` (loading this site's `assets/noah-ui.css`)
- No service worker on purpose: this site owns the `/` scope shared with the project sites
- `_config.yml` exclude list, `.gitignore`, `README.md`, `CLAUDE.md`
- Lineup: Gaming Hub and Cheevo Tracker cards use the projects' new app icons (Save Crystal, pixel trophy)
- Site icon: the intro dialogue's white speech bubble with its orange ▼ caret on a brown tile (`favicon.svg`, `favicon.ico`, `apple-touch-icon.png`, source `appicon.svg`), used by the homepage and its 404. Replaces the leftover Gaming Hub icon (`icon-192.png`, removed)
- Motion, snappy like a game menu (transform/opacity only, 120–320 ms; entries animate, exits don't, so Q/E never waits):
  - **Tabs:** the new page slides in from the side you moved toward, with its blocks rising in one after another; the active tab does a quick press-pop, and LB/RB keycaps press down on Q/E too
  - **Lineup:** the selected card pops; the detail panel rises in on each new project; screenshots slide in the paging direction
  - **Links:** list rows cascade in; the record card re-enters with its emblem popping in
  - **Play Data and HUD:** numbers count up from 0 once per visit; the HUD bar fills on load
  - **Intro dialogue:** backdrop fades, box rises, portrait slides in, and text types out letter by letter (first click finishes the line, next advances)
  - **Reduced motion:** turns everything instant
  - Motion tokens and `nu-enter` / `nu-rise` / `nu-stagger` classes live in `noah-ui.css`, documented as STYLE.md rule 11
