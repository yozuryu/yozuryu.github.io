# yozuryu.github.io

Personal site for **Yozuryu**, served at **[yozuryu.github.io](https://yozuryu.github.io/)**, and the front door for my GitHub Pages projects:

| Project | What it is |
|---|---|
| [Gaming Hub](https://yozuryu.github.io/gaming-hub/) | Achievement dashboard for RetroAchievements, Steam and Xbox ([source](https://github.com/yozuryu/gaming-hub)) |
| [Cheevo Tracker](https://yozuryu.github.io/cheevo-tracker/) | RetroAchievements profile tracker ([source](https://github.com/yozuryu/cheevo-tracker)) |

## The page

The landing page is a game pause menu, styled after the menus of *Little Noah: Scion of Paradise*:

- **Lineup:** my projects as character cards with a detail panel (level and "PWR" come from each project's changelog)
- **Player:** profile, motto and favorite genres
- **Play Data:** live stats from Gaming Hub (RA points, Steam hours, gamerscore, achievements…)
- **Links:** a records-style list of my pages
- A battle-style HUD, button hints, keyboard controls (Q/E tabs, ←/→ select, Enter open), and a short intro dialogue

Only the look is recreated; no game art, characters or logos are used. The design system is in [`assets/noah-ui.css`](assets/noah-ui.css) and documented in [`STYLE.md`](STYLE.md).

## How it's built

Static files served by GitHub Pages from `main`, no build step: React loads from a CDN and JSX compiles in the browser, the same setup as the project sites. Content lives in [`data/site.json`](data/site.json).

## Run locally

Serve the **parent** folder so `/gaming-hub/` and `/cheevo-tracker/` resolve to the sibling repos, as they do on GitHub Pages:

```bash
cd ..
python3 -m http.server 8000
# open http://localhost:8000/yozuryu.github.io/
```

Without the sibling folders, the page still works; live numbers just show "—".
