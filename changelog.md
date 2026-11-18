# Changelog

## v26.11.19

Share cards in every theme, easier to use on a phone, and changes on the page are animated instead of popping in.

### Structure

- new: **Share cards**: a picture of my progress in the style of each theme, as a story (tall) and a post (wide)
  Hours, unlocks, completions, the three platforms, this year's Memory Card and the games being played. The Share button beside Theme hands out the card of the theme you are looking at.
- improved: **Quest Board** is an old guild board now
  Worn, scratched planks with scraps of older notices still nailed up. Every notice is aged parchment with torn edges, stains and folds, a heavy ornamental frame, a ribbon heading, an illuminated first letter and a wax seal for the project's level. The guild card is a licence on the same paper. The title is an old plank hanging crooked on two chains.
- new: **Link preview**: sharing the address now shows a card instead of a bare link
- improved: **Theme switch** opens the new theme as a circle growing from the Theme button
  The list folds away first, then the new page's pieces rise in one after another.
- improved: **The page arrives whole**: it waits a moment for the live numbers instead of growing piece by piece
  Anything that still lands late fades in.
- improved: **Pinned menu on phones** in Starlit Menu and Stylish, and it follows where you are
  The entry of the section on screen is lit, and tapping one brings its section right under the bar.
- improved: **Theme list on phones** is a sheet across the bottom with bigger rows
- improved: **Bigger tap targets** on phones in every theme: buttons, links and platform rows
- improved: **Smoother scrolling** on phones in Starlit Menu and Load Game
  The panels no longer blur what is behind them on small screens.
- fix: a press on a phone now answers: the thing you tap dips slightly

## v26.11.17

A new home page in five JRPG themes you can switch between, showing the projects and a summary of the games played.

### Structure

- new: **Five themes** with a switcher: Starlit Menu, Load Game, Quest Board, Stylish and Home Camp
  The Theme button sits bottom right in every theme (or press T). Your choice is remembered. Starlit Menu is the default.
- new: **Starlit Menu**: a pause menu over a night sky, with the years as a constellation
  One star per year in its Memory Card colour, higher the more unlocks that year had. Each star opens that year.
- new: **Load Game**: the projects as save files, the years as blocks on a memory card
- new: **Quest Board**: the projects as quests pinned to a guild board, with a guild card
- new: **Stylish**: a status screen made like a zine page, in ink, paper and hot pink
  You on a torn slab down the left, the projects as two taped cards with their level, the games in rotation as a turn order, the year as a ticket, and marker notes scribbled over it.
- improved: **Home Camp** is the old cream-and-gold menu opened up into one screen
  Creations, the games being played, the adventure log and the links are all visible at once: no tabs to page through.
- new: **Live numbers** on every theme: totals, platforms, now playing and the Memory Card year come from Savepoint
  A project's level is its number of releases and its PWR the number of logged changes.
- improved: the page no longer loads React: it opens faster

## v26.11.13

Follow Cheevo Tracker's rename to Cheevodex and keep its old links working.

### Structure

- Cheevo Tracker is now **Cheevodex** at `/cheevodex/`: Lineup card, links, README and the 404 page point there
- Old `/cheevo-tracker/…` links redirect to the same page under `/cheevodex/`, query string and hash kept, from `404.html` (the old path has no repo any more). Installed apps lose their old service worker on its next update check and land on the new address
- Lineup: the Cheevodex card shows its new Lens boy icon and a screenshot of the new look, the description opens with "A pocket companion for RetroAchievements", and the button reads **Open Dex**. Asset files renamed to `cheevodex-icon.png` / `cheevodex.jpg`
- Lineup: the Cheevodex card shows its new codex logo (a pixel book with a trophy and a ribbon) in place of the Lens boy handheld
- `robots.txt` also points crawlers at the Cheevodex website's sitemap (`/cheevodex-site/sitemap-index.xml`): only the domain root's robots.txt is read, so project sites list their sitemaps here

## v26.11.12

Follow the hub's move to Savepoint at its new address, and point search engines at the Savepoint site.

### Structure

- Gaming Hub is now **Savepoint** at `/my-savepoint/`: Lineup card, Play Data numbers, links and the 404 page point there
- `robots.txt` pointing search engines at the Savepoint site's sitemap (crawlers only read it at the domain root)

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
- Play Data: milestones replaced by **Games this month**: every game with an unlock this calendar month, grouped per game and sorted by latest unlock, **×N** = unlocks this month, date pill = last unlock. Rim is gold if the game was completed this month, silver if beaten this month (RA awards; Steam and Xbox via Gaming Hub's `win-conditions.json`: "or" = any listed ending, dated by the first; "and" = all of them, dated by the last). Shows the top 12; with more, 11 tiles plus a **+N more** tile opening Gaming Hub's Activity. Steam tiles use the game's square store icon (from Steam's `profile.json` when listed there, else the game's own file), matching the RA tiles; its 32 px size reads fine inside a tile. Platforms with no unlocks this month are hidden; an empty month shows a short note instead of tiles

