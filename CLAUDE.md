# yozuryu.github.io — Project Context for Claude

## Working Style

- **Be honest with opinions.** Give a direct recommendation when asked, not a diplomatic non-answer.
- **Push back before implementing bad ideas.** If a request seems like a poor UX, visual or technical decision, say so and explain why before doing it.
- **Discuss before building when uncertain.** Especially for UI/UX decisions.

---

The GitHub Pages **user site** for `yozuryu`, served at `https://yozuryu.github.io/`. Same approach as the project sites [gaming-hub](https://github.com/yozuryu/gaming-hub) and [cheevo-tracker](https://github.com/yozuryu/cheevo-tracker): static files, no build step, deployed from `main`.

Status: **"Coming Soon" landing page** styled after the pause/character menu of *Little Noah: Scion of Paradise*. Purpose and final content are still evolving — check with the user before adding sections.

## Design system — read STYLE.md first

- **All visuals follow [`STYLE.md`](STYLE.md)** and use [`assets/noah-ui.css`](assets/noah-ui.css) (tokens + `nu-` components). Page layout only goes in `assets/site.css`.
- Don't hardcode colors or invent new visual patterns; add a token/component to `noah-ui.css` if something is missing, and document it in `STYLE.md`.
- Recreate the game's *style* only — never use its art, characters, logo or screenshots.

## Structure

```
index.html            Shell: fonts, noah-ui.css, site.css, React via import map, app.js
app.js                Pause-menu landing page: tabs Player / Lineup / Play Data / Links, HUD, button hints, intro dialogue
data/site.json        Content: name, avatar, intro lines, about, projects (Lineup cards), links (Records)
assets/noah-ui.css    Design system (tokens + nu- components)
assets/site.css       Page layout + responsive rules
assets/projects/      Project icons and preview screenshots
assets/avatar.png            Avatar (player portrait, HUD, dialogue)
assets/favicon.svg / .ico    Site icon: the intro speech bubble with its orange ▼ caret (appicon.svg = full-bleed source, apple-touch-icon.png 180 px)
404.html              Plain-HTML 404 (see "Shared origin")
STYLE.md              Style guide (not published)
_config.yml           Jekyll exclude list — anything private must be listed here
changelog.md          Changelog
```

Live data: the Player / Play Data tabs and the HUD read Gaming Hub's public JSON (`/gaming-hub/data/*/profile.json`, `/gaming-hub/data/hub/config.json`); Lineup card level/PWR count releases/changes in each project's `changelog.md`. All same-origin, so no CORS. Everything must degrade to "—" when a fetch fails (e.g. local dev without the sibling folders).

Local dev: serve the **parent** folder (`~/projects/personal`, e.g. `python3 -m http.server`) and open `/yozuryu.github.io/`, so `/gaming-hub/…` and `/cheevo-tracker/…` resolve to the sibling repos like on GitHub Pages.

## Shared origin — important

This site owns `/` on `yozuryu.github.io`. The project sites live under it (`/gaming-hub/`, `/cheevo-tracker/`) and share the same origin:

- **No service worker at scope `/`.** It would intercept every request for the project sites too. gaming-hub's worker is scoped to `/gaming-hub/`, cheevo-tracker's to `/cheevo-tracker/`. If this site ever needs one, scope it narrowly and exclude the project paths.
- **Browser storage is shared** (`localStorage`, `sessionStorage`, IndexedDB, cookies). Prefix any keys (e.g. `root_…`) and never use the `cheevo_tracker` IndexedDB name.
- **`404.html` only covers this site's own paths.** GitHub Pages does *not* use it for project sites (checked 2026-09-27: `/gaming-hub/<missing>` got GitHub's default 404), so each project repo has its own `404.html`. Those project 404 pages load this site's `/assets/noah-ui.css` by absolute URL, so **renaming or removing `noah-ui.css` classes breaks them too**. Keep 404 pages plain HTML with absolute URLs so they work from any depth.
- Adding a project site: add it to `data/site.json` → `projects` (icon + preview in `assets/projects/`, `changelog` path for Lv/PWR) and `links`, and to the 404 page's links if it should be offered there.

## Conventions

- Tech: React 18 via `esm.sh` import map + Babel standalone, no bundler, no npm for the site (same approach as gaming-hub and cheevo-tracker). No Tailwind here: styling comes from `noah-ui.css` / `site.css`.
- Font: M PLUS Rounded 1c from Google Fonts.
- Keyboard: Q/E switch tabs, ←/→ pick a project, Enter/A open, Y source, X replays the intro. Keep footer hints in sync.
- Session storage key for the intro: `root_intro_seen` (prefixed — storage is shared with the project sites).

## Changelog Convention

Update `changelog.md` after every change. Version header `## vYY.MM.DD`; if today's header exists, add to it. One-line summary, then `### Section` subsections with bullets.
