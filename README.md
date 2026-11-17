# yozuryu.github.io

Personal site for **Yozuryu**, served at **[yozuryu.github.io](https://yozuryu.github.io/)**, and the front door for my GitHub Pages projects:

| Project | What it is |
|---|---|
| [Savepoint](https://yozuryu.github.io/my-savepoint/) | Achievement dashboard for RetroAchievements, Steam and Xbox ([source](https://github.com/yozuryu/my-savepoint)) |
| [Cheevodex](https://yozuryu.github.io/cheevodex/) | RetroAchievements profile tracker ([source](https://github.com/yozuryu/cheevodex)) |

## The page

One page, drawn as a JRPG menu in five themes. The **Theme** button (bottom right, or press T) switches between them and remembers your choice:

- **Starlit Menu** (default): a pause menu over a night sky, with the years as a constellation
- **Load Game**: the projects as save files, the years as blocks on a memory card
- **Quest Board**: the projects as quests pinned to a guild's notice board
- **Stylish**: slanted and loud, with a command window, a turn order and a dialogue box
- **Home Camp**: a cream-and-gold menu styled after *Little Noah: Scion of Paradise*

Every theme shows the same things: the two projects, totals across RetroAchievements, Steam and Xbox, the games being played now, this year's Memory Card, and links. The numbers are live, read from Savepoint's public data.

Each theme recreates a style only; no game art, characters or logos are used.

## How it's built

Static files served by GitHub Pages from `main`, no build step and no framework: plain ES modules. The page comes in five themes (`themes/`), switched with the Theme button. Content lives in [`data/site.json`](data/site.json).

## Run locally

The page reads Savepoint's data from `/my-savepoint/`, so serve this repo at `/` with the sibling repos at their live paths (`/my-savepoint/` → the hub's folder, `/cheevodex/` → Cheevodex's). Without them the page still opens, with "—" in place of the numbers. `?theme=<id>` opens a theme directly: `starlit`, `load`, `quest`, `stylish`, `noah`.

