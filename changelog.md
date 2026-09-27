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
- Links: split into **Projects** (GitHub, Gaming Hub, Cheevo Tracker — P-01…) and **Gamer Profiles** (RetroAchievements, Steam, Xbox — G-01…) each in its own section box (brown header on a gray box, like Background and Stock). The detail card adapts: projects show their Lineup Lv / PWR and first tag; gamer profiles show live stats from Gaming Hub (RA points/mastered/beaten, Steam hours/perfect/achievements, Xbox gamerscore/completed/achievements) and the player name, with "Open profile". ↑/↓ moves through both groups, Enter/A opens. Stat pills stack on phones; keyboard focus ring is orange
- Links: GitHub uses the GitHub mark (`assets/links/github.png`, from Octicons) instead of the avatar
- **Creations** replaces the Lineup tab (old `#lineup` links still work), built from the game's Statue, item-get, shop and support screens (references in the private design-references repo):
  - **Display:** each project stands on a pedestal (selected: orange ring + bobbing ▼); future projects are locked `???` pedestals
  - **Details:** the icon on a turning light burst, `Lv 1 ▸ n`, PWR, and first/latest release month read from each project's changelog, then **Materials** (tech it's built with, as item slots with brand icons from Simple Icons, CC0) and **Effects** (a numbered list)
  - **Preview:** the screenshot in its own box under Display, so both columns stay balanced
  - New design-system components: `nu-pedestal`, `nu-burst`, `nu-progress`, `nu-slots` / `nu-slot-item`, `nu-effects`; materials and effects per project in `data/site.json`
- Links: projects now live only in Creations, so Links is **Gamer Profiles** (G-01…) + **Developer** (GitHub, D-01, showing the Creations count)
- Intro dialogue points to Creations
- Creations polish: Materials slots are light cream with a gold rim (were dark brown, the heaviest thing on the page; the game's menu slots are always light), with logos in each brand's deeper official color; each creation shows its one-line description as flavor text under the header; a red **!** on a pedestal marks a creation that released in the last 14 days (read from its changelog)
- Creations effects reworded so they don't repeat the flavor text (Gaming Hub: every completion on one page, hourly pipelines, a year of unlocks and streaks; Cheevo Tracker: profile/progress/backlog, friends feed, Professor Oak Challenge guides)
- No more blue box when tapping pedestals, tabs or other buttons on phones (the browser's tap highlight is turned off; the menu already shows its own tap feedback). Pedestals get the orange keyboard-focus ring
- **Play Data** redesigned as the game's Result screen (リザルト): a parchment "RESULTS" sheet with a dark banner (avatar, orange "Unlocked this month" ribbon, big cyan **+n** counting up, total achievements pill) and a ★ completions counter; an info card with **Now playing** (the most recently played game across RA, Steam and Xbox, with its platform, how long ago and progress), **Streak** (days in a row with an unlock, local time) and **Games tracked**; and framed item tiles for **Recent milestones** (last 6 completions/beats with date pills, gold = completed, silver = beaten; open Gaming Hub's Completions) and **Platforms** (RA points, Steam hours, Xbox gamerscore; open each profile). The month's unlocks and the streak come from Gaming Hub's latest 91-day activity files, loaded only when the tab opens. Tiles follow the game's item tiles: a small platform logo in the top-right corner, **×N** inside a milestone (achievements earned in that game) and **+N** inside a platform (unlocks this month), with the date or total in the pill below; a game beaten and completed in the same year shows once, as completed (same rule as Gaming Hub's Completions). Heading: "Latest results across all platforms." Dropped the filler rows ("Platforms 3", "Site progress 20%"). New components: `nu-result`, `nu-result-banner`, `nu-ribbon-flag`, `nu-gain`, `nu-counter`, `nu-info`, `nu-tiles` / `nu-tile`
- **Player** redesigned as a character status screen (after the game's Anima screen and Astral House detail): the portrait now carries an orange **Weekend Adventurer** title ribbon under the name plate; **Status** shows adventuring since (RA join month), RA rank (top %) and main platform (RA / Steam / Xbox, most unlocks in the last 3 months); **Background** gets a new game-style bio (replacing the old "still being built" placeholder) above the motto; **Traits** shows genres and styles as ✦ effect lines; **All-time Favorites** is a shelf of five hand-picked game covers (Star Ocean: The Second Story R, Legend of Legaia, Thousand Arms, Threads of Fate, Trails of Cold Steel) at their natural shapes, long names fade out at the cover's edge (full name on hover), linking to their RA / Steam pages. `title` and `favorites` live in `data/site.json`. New components: `nu-traits`, `nu-covers` / `nu-cover`
- Phones: single-column tabs can no longer be widened past the screen by a long pill (grid columns use `minmax(0, 1fr)`)

