# Changelog

## v26.09.27

Replace the "Coming Soon" placeholder with a pause-menu landing page styled after *Little Noah: Scion of Paradise*.

### Structure

- Landing page as a game pause menu: LB/RB tab bar (Player, Lineup, Play Data, Links) over a blurred, dimmed backdrop, inside a white panel with a gold filigree frame
- **Lineup:** Gaming Hub and Cheevo Tracker as portrait cards in a lineup band and a 6-column Stock grid, with locked "???" slots for future projects; detail panel with PWR, level, stat pills, screenshot and description. Level = releases and PWR = changes in each project's public changelog
- **Player:** avatar, about text, and motto / favorite genres and styles from Gaming Hub's config
- **Play Data:** live numbers from Gaming Hub's data (RA points, mastered, beaten, Steam hours, perfect games, gamerscore, achievements, games tracked)
- **Links:** records-style list with a detail card
- Battle-style HUD (portrait with health arc, "site progress" bar, coin/gem/key counters), footer button-hint pills, keyboard controls (Q/E, ←/→, Enter, Y, X), and an intro dialogue with name plate shown once per session (`root_intro_seen`, prefixed because storage is shared with the project sites)
- Design system in `assets/noah-ui.css` (colors sampled from the game's menus; `nu-` tokens and components) documented in `STYLE.md`; page layout in `assets/site.css`. Only the style is recreated, no game assets
- Content in `data/site.json`; project icons and previews in `assets/projects/`
- Plain-HTML `404.html` that also works as the fallback 404 for project sites without their own, with links home and to each project
- No service worker on purpose: this site owns the `/` scope shared with the project sites
- `_config.yml` exclude list, `.gitignore`, `README.md`, `CLAUDE.md`
