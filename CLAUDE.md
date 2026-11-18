# yozuryu.github.io — Project Context for Claude

## Working Style

- **Be honest with opinions.** Give a direct recommendation when asked, not a diplomatic non-answer.
- **Push back before implementing bad ideas.** If a request seems like a poor UX, visual or technical decision, say so and explain why before doing it.
- **Discuss before building when uncertain.** Especially for UI/UX decisions.

---

The GitHub Pages **user site** for `yozuryu`, served at `https://yozuryu.github.io/`. Same approach as the project sites [gaming-hub](https://github.com/yozuryu/my-savepoint) and [cheevodex](https://github.com/yozuryu/cheevodex): static files, no build step, deployed from `main`.

Status: **home page in five themes.** One page that shows who Yozuryu is, the two projects (Savepoint, Cheevodex) and a summary of the games played, drawn in one of five JRPG menu themes the visitor can switch between. Starlit Menu is the default.

## Themes — how the page is built

- **`app.js` owns the content, a theme owns the look.** `app.js` loads everything once into one plain `model` object (name, totals, platforms, projects, memory, playing, links) and calls the active theme's `render(model, helpers)`, which returns the page's HTML as a string. Vanilla JS, no React, no build.
- **A theme is two files:** `themes/<id>.js` (the `render` function) and `themes/<id>.css` (everything visual). Only the active theme's CSS is in the page (`<style id="theme-css">`, swapped in the same frame as the markup), so themes never share or fight over class names. Fonts are loaded per theme from Google Fonts the first time it is used.
- **The five:** `starlit` Starlit Menu (default: night sky, hairline frames, the years as a constellation), `load` Load Game (save slots, years as memory-card blocks), `quest` Quest Board (guild notice board), `stylish` Stylish (a zine-like status screen in ink, paper and hot pink: the player on a torn slab, the party as two tilted taped cards with their level, a turn-order timeline, the year as a ticket, a dialogue box; the last block of its CSS is the deliberate mess: tilt, tape, marker notes, scribbles, a stamp), `noah` Home Camp (the cream-and-gold menu this site started with, styled after *Little Noah: Scion of Paradise*).
- **Adding a theme:** add it to `THEMES` in `app.js` (id, name, background, three swatch colours, fonts), to the `bg` map in `index.html`'s first script (it paints the background before anything loads), and write the two files. Every theme must show the same content: projects with both links, totals, platforms, Memory Card, now playing, links.
- **The switcher** (`.rt-*` in `assets/root.css`, drawn by `app.js`) is a fixed button bottom right, the same in every theme; `T` opens it. The choice is saved as `root_theme` in localStorage; `?theme=<id>` shows a theme without saving it.
- **Inside a theme:** menu entries are `<a href="#id" data-go="id">`: `app.js` lights the clicked one (`.on`) and brings that section into view. Everything a visitor can open is a real `<a>`, so Tab and Enter work with no key handling. Only show a key hint for something that really works.
- **Honest numbers only.** Every number comes from the model. Lv = releases and PWR = logged changes in a project's `changelog.md`; "saved" = its newest release date. If the data isn't there, print "—" or leave the piece out: no invented levels, ranks or bar fills.
- **Each theme recreates a *style*, never a game's art.** No game characters, logos, screenshots or reference images in this repo. Game covers on the page are the live "now playing" art, loaded from where Savepoint loads it.
- **`assets/noah-ui.css` and `STYLE.md`** now serve the 404 pages only (this site's and the project sites'). Don't rename or remove `nu-` classes. The Home Camp theme has its own CSS and doesn't use it.

## Structure

```
index.html            Shell: sets the theme before first paint, root.css, app.js
app.js                Content model, live data loaders, theme loader, theme switcher
themes/<id>.js|.css   One theme each: starlit, load, quest, stylish, noah
data/site.json        Content: name, title, avatar, about, projects (kind, icon, shot, description, facts, tags, move, alt link, reward, party, changelog), links
assets/root.css       Shared by every theme: reset, the switcher (rt-), entry animation
assets/noah-ui.css    Menu design system used by the 404 pages (see STYLE.md)
assets/projects/      Project icons and screenshots
assets/links/         Link and platform icons
assets/avatar.png            Avatar
assets/favicon.svg / .ico    Site icon (appicon.svg = full-bleed source, apple-touch-icon.png 180 px)
404.html              Plain-HTML 404 (see "Shared origin")
STYLE.md              Style guide for noah-ui.css (not published)
_config.yml           Jekyll exclude list — anything private must be listed here
changelog.md          Changelog
```

Live data, all same-origin from Savepoint (`/my-savepoint/`), so no CORS: the three `data/*/profile.json` and `data/hub/config.json` (totals, platforms, motto), `memory-card/years.json` (years, titles, colours; its `list` field) and `memory-card/share/<year>-story.jpg` (the thumbnail), `assets/playing.js` (imported and run, so "now playing" follows Savepoint's own rule), and each project's `changelog.md`. Each loader fails quietly: the page first draws from `site.json` alone, then redraws as data arrives, and a section with no data is left out.

Local dev: the page needs the sibling repos at their live paths, and the hub's folder is `gaming-hub` locally, so serving the parent folder is not enough. Use a small server that maps `/` to this repo, `/my-savepoint/` to `../gaming-hub/` (after `npm run data:pull` there) and `/cheevodex/` to `../cheevo-tracker/`. Check every theme at 450px wide and at desktop width: `?theme=<id>`.

## Shared origin — important

This site owns `/` on `yozuryu.github.io`. The project sites live under it (`/my-savepoint/`, `/cheevodex/`) and share the same origin:

- **No service worker at scope `/`.** It would intercept every request for the project sites too. gaming-hub's worker is scoped to `/my-savepoint/`, Cheevodex's to `/cheevodex/` (its old `/cheevo-tracker/` path redirects from `404.html`). If this site ever needs one, scope it narrowly and exclude the project paths.
- **Browser storage is shared** (`localStorage`, `sessionStorage`, IndexedDB, cookies). Prefix any keys (e.g. `root_…`) and never use the `cheevodex` IndexedDB name (or its old name `cheevo_tracker`, which Cheevodex deletes on load).
- **`404.html` only covers this site's own paths.** GitHub Pages does *not* use it for project sites (checked 2026-09-27: `/my-savepoint/<missing>` got GitHub's default 404), so each project repo has its own `404.html`. Those project 404 pages load this site's `/assets/noah-ui.css` by absolute URL, so **renaming or removing `noah-ui.css` classes breaks them too**. Keep 404 pages plain HTML with absolute URLs so they work from any depth.
- Adding a project site: add it to `data/site.json` → `projects` (icon + preview in `assets/projects/`, `changelog` path for Lv/PWR) and `links`, and to the 404 page's links if it should be offered there.

## Conventions

- Tech: plain ES modules, no framework, no bundler, no npm for the site.
- Storage keys are prefixed `root_` (storage is shared with the project sites): `root_theme`.
- **Motion.** Every change of the page goes through `paint(kind, change)` in `app.js`, which uses the View Transitions API where the browser has it: a theme switch opens the new theme as a circle from the Theme button (`rt-open`, the list folds away first), data that lands late cross-fades in. On first load and on a switch the pieces of the page rise in one after another (`#root.rt-in .wrap > *`; `app.js` drops the class so a later redraw doesn't replay it). Inside a theme, motion is small (a cursor that bobs, a hover lift, a press that answers on phones). All of it is off under `prefers-reduced-motion`.
- **First paint waits for the data** (up to 0.9 s), so the page arrives whole instead of growing piece by piece. Don't draw before that and patch after.
- **Phones (the owner's is ~450px wide):** in Starlit and Stylish the section menu is pinned to the top and its lit entry follows the scroll (`spy()` / `mark()` in `app.js`; the last section owns the bottom of the page); the theme list is a sheet across the bottom. Everything tappable is at least 40px tall, and Starlit and Load Game drop `backdrop-filter` (blur repainting on scroll stutters on Android). Check a change with a script, not by eye: no link under 40px, no sideways scroll.

## Changelog Convention

Update `changelog.md` after every change. Version header `## vYY.MM.DD`; if today's header exists, add to it. One-line summary, then `### Section` subsections with bullets.
