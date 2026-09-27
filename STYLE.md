# Style guide — yozuryu.github.io

The site is styled after the **pause / character menu of *Little Noah: Scion of Paradise*** (Cygames): a cream panel in a gold filigree frame over a blurred, dimmed world, glossy chocolate tabs with a glowing gold active tab, brown header strips, gold-bordered portrait cards, and rounded button-hint pills. Every new page should look like another screen of that menu.

**Source of truth:** [`assets/noah-ui.css`](assets/noah-ui.css) (tokens + components, all prefixed `nu-`). Page arrangement goes in [`assets/site.css`](assets/site.css). This file explains how to use them.

**Shared with other repos:** the `404.html` pages of Gaming Hub and Cheevo Tracker load `/assets/noah-ui.css` from this site (they use `nu-root`, `nu-scene`, `nu-frame`, `nu-section`, `nu-desc`, `nu-hints`, `nu-hint`, `nu-glyph` and the `--nu-font` / `--nu-brown-600` tokens). Don't rename or remove those without updating them.

We recreate the *style* only: never use the game's art, characters, logo or screenshots on the site. Your avatar and your own project images fill those roles.

---

## Rules

1. **Use the tokens.** Colors, radii and shadows come from the `--nu-*` custom properties. Don't hardcode a hex value in a page; if a new color is really needed, add a token to `noah-ui.css` first.
2. **Use the components.** Build screens from the `nu-` classes below before writing new CSS. New reusable pieces go into `noah-ui.css` (with a `nu-` name); one-off layout goes into `site.css`.
3. **Everything sits in the menu.** Content lives inside a `.nu-frame` under the tab bar, over the `.nu-scene` backdrop. No full-bleed sections, no dark dashboard look.
4. **Gold/orange means selected or active.** Active tab = gold glow; selected card = orange border; active page dot = orange; "new" = red `!` badge. Don't use orange/gold for decoration.
5. **Brown means structure.** Section titles sit in a `.nu-section__header` strip; labels for values sit in tan pills (`.nu-stat`, `.nu-data__label`, `.nu-tag`).
6. **White text only over art** (HUD, card levels, PWR), always with the outline (`var(--nu-outline)` / `.nu-outline`). On panels, text is dark brown (`--nu-text`).
7. **Show controls like a game.** Actions get a button hint: a round glyph (`.nu-glyph`: A, B, X, Y, or a key like Q) plus a short verb ("Open", "Source", "Intro"). Keep keyboard shortcuts in sync with the hints.
8. **Rounded, soft, chunky.** Pills and rounded rectangles everywhere; bold rounded font; soft shadows. No sharp corners, no thin 1px dashboard borders.
9. **Placeholders look like the game's.** Unfinished things are locked cards (`.nu-card--locked`, "???"), empty slots (`.nu-slot`) or a locked plate ("🔒 ???"), not "TODO" text.
11. **Motion: snappy like a game menu.** Use the motion tokens and classes below, never ad-hoc timings.
    - **Durations:** 120–320 ms (`--nu-dur-fast` / `--nu-dur` / `--nu-dur-slow`).
    - **Transform and opacity only:** never animate width, height or layout.
    - **Entries animate, exits don't:** a new tab replaces the old one instantly.
    - **Direction follows navigation:** next tab slides in from the right, previous from the left.
    - **Overshoot (`--nu-ease-pop`) only for "reward" moments:** the selected card, a record emblem.
    - **Keep the world still:** the backdrop, HUD layout and frame never move.
    - **Reduced motion:** `prefers-reduced-motion` turns everything instant, including the count-ups and typewriter in `app.js`.
10. **Mobile:** the tab bar becomes a carousel (active tab centered at full size with ornaments, neighbours peeking in dimmed, LB/RB buttons, swipe, position dots) so it works for any number of tabs — never shrink tabs to fit; grids stack to one column, cards shrink to 64px (see the phone block in `site.css`). Keep a 12px+ side gutter and no horizontal page scroll.

---

## Tokens

| Token | Value | Use |
|---|---|---|
| `--nu-font` | M PLUS Rounded 1c (Google Fonts), Nunito fallback | All text. Weights 500 / 700 / 800 |
| `--nu-text` / `--nu-text-soft` / `--nu-text-mute` | `#4e3e3e` / `#6f615e` / `#9b8e7e` | Body text / secondary / hints, inactive dots |
| `--nu-brown-400…800` | `#9d7c69` → `#503625` | Tab gloss (top → border) |
| `--nu-brown-600` | `#6b554a` | Section header strip |
| `--nu-brown-900` | `#3b2a22` | Text outlines |
| `--nu-gold-200` / `--nu-amber` / `--nu-gold-300` | `#fff28a` / `#f99f51` / `#fdc662` | Active tab gradient |
| `--nu-gold-400` | `#f3c150` | Gold label bar |
| `--nu-gold-500` | `#daac00` | Card border (deep end of the gold gradient) |
| `--nu-orange` / `--nu-orange-700` | `#ff962c` / `#e88426` | Arrows, active dot, caret / selected card |
| `--nu-frame` / `-light` / `-dark` | `#b29e6b` / `#e6dfc3` / `#a99260` | Gold filigree frame |
| `--nu-panel` | `#ffffff` | Main panel |
| `--nu-cream` / `--nu-band-glow` | `#f2eee3` / `#f6dc9f` | Lineup band + its inner glow |
| `--nu-section` / `--nu-slot` / `--nu-pill` / `--nu-hint` | `#e7dfdc` / `#dcd3cf` / `#cbbcb5` / `#ece6e4` | Section boxes / empty slots / stat & data pills / hint pills |
| `--nu-count` | `#645a58` | Dark count pill under cards |
| `--nu-red` / `--nu-blue` / `--nu-green` / `--nu-hp-arc` | `#fa687b` / `#3d8ee8` / `#58c25a` / `#ff5f7e` | Element badges / HP bar / HUD arc |
| `--nu-r-panel` / `-section` / `-card` / `-pill` | 24px / 16px / 8px / 999px | Radii |
| `--nu-outline` | text-shadow | White-on-art text outline |
| `--nu-dur-fast` / `--nu-dur` / `--nu-dur-slow` | 120 / 200 / 320 ms | Press feedback / entries / larger moves |
| `--nu-ease-out` / `--nu-ease-pop` | cubic-bezier | Default easing / small overshoot for reward moments |
| `--nu-stagger` | 40 ms | Delay between items in a `.nu-stagger` list (capped at 5 steps) |
| `--nu-curl-cream`, `--nu-curl-gold`, `--nu-crest`, `--nu-scroll-icon` | inline SVG | Ornaments (tab ends, header ends, frame crest & corners, label curl) |

---

## Components

| Class | What it is | Notes |
|---|---|---|
| `.nu-root` | Font + base text color | On `<body>` |
| `.nu-scene` | Blurred, dimmed world behind the menu | One per page, fixed, `aria-hidden` |
| `.nu-tabbar`, `.nu-tabs`, `.nu-tabs__track`, `.nu-tab`, `.nu-tab.is-active`, `.nu-keycap`, `.nu-tabs__dots` | Tab bar: `LB [tab] [tab*] [tab] RB` | Brown glossy pills with curl ends; active glows gold. Phone: carousel (see rule 10). The page keeps the active tab centered and switches tab when a swipe snaps a new one to the center (`app.js`); give each tab `data-tab` |
| `.nu-frame` (+ `.nu-frame__corner--tl/tr/bl/br`) | White panel in gold filigree with a crest top & bottom | Every screen's container |
| `.nu-heading` | Centered instruction line ("Choose a project to explore.") | First line inside the frame |
| `.nu-band`, `.nu-label`, `.nu-arrow` | Pale-gold lineup strip; "(curl) Label ___" group label; orange ▸ between cards | |
| `.nu-card` (`__img`, `__lv`, `__el`, `__el--red`, `__stars`), `.is-selected`, `--silver`, `--locked` | Square portrait card: gold border, level top-right, element dot top-left, ★ plate bottom | 92px (64px on phone) |
| `.nu-slot`, `.nu-count` | Empty grid slot; dark "x2"-style pill under a card | |
| `.nu-section`, `.nu-section__header`, `.nu-section__body` | Gray box with a brown title strip (curl ornaments both ends) | |
| `.nu-render` (`__stars`, `__pwr`, `__plate`) | Big showcase box: ★ top-left, "PWR 63" top-right, plate at the bottom | |
| `.nu-bar` | Gold label bar ("Attack", "Info", "About") | Full width |
| `.nu-move` | Glyph + big action/move name | |
| `.nu-stats`, `.nu-stat` | Row of tan pills: `label  <b>value</b>` (value in outlined pale gold) | |
| `.nu-preview`, `.nu-desc`, `.nu-dots`, `.nu-dot.is-active`, `.nu-pager` | Screenshot, description, page dots, orange ▶ pager | |
| `.nu-glyph` (`--sm`) | Round button glyph (A, B, X, Y, Q…) | |
| `.nu-hints`, `.nu-hint`, `.nu-hint__sep` | Footer button-hint pills ("Ⓐ OK", "Q / E Tabs") | Bottom-right |
| `.nu-data`, `.nu-data__label`, `.nu-data__value` | Play-data rows: tan label pill + big right-aligned value | |
| `.nu-list`, `.nu-row.is-selected`, `.nu-row__badge`, `.nu-row__no`, `.nu-new` | Records list: white rows, round badge, "P-01"-style number, red `!` for new | Grouped lists: one `.nu-section` per group, list inside its body. Keyboard focus ring is orange |
| `.nu-ribbon`, `.nu-tag`, `.nu-tag--orange` | Title on an ornamental divider; gray / orange tag pills ("Condition", "Reward") | |
| `.nu-pedestal` (`__item`, `__stand`, `__name`, `__lv`), `.is-selected`, `--locked` | An item on a stand; selected one gets an orange ring and a bobbing ▼; a `.nu-new` red ! marks a release in the last 14 days | Creations display. Ref: Statue screen (`base_image_5`) |
| `.nu-burst` (+ `.nu-burst__spark`) | Item on a slowly turning light burst with sparkles | Detail header. Ref: item-get banner (`ability_image_1`) |
| `.nu-progress` (`__arrow`, `__to`) | "Lv 1 ▸ 23" — muted start, orange ▸, big orange end value | Ref: shop card "2470 ▸ 1470" (Steam `ss_7e41…`) |
| `.nu-slots`, `.nu-slot-item` (`__box`) | Cream item slots with a gold rim (light, like the game's item slots), icon + plain label below | Materials. Icons: Simple Icons (CC0) in `assets/materials/`. Ref: gift slots (`base_image_7`) |
| `.nu-effects` | Numbered list: brown ① ② ③ badges on light rows | Effects. Ref: support list (`base_image_7`) |
| `.nu-result` (`__title`, `__top`), `.nu-result-banner` (`__art`), `.nu-ribbon-flag`, `.nu-gain`, `.nu-counter` (`__icon`) | Result screen: parchment sheet, dark banner with portrait, notched orange ribbon, big cyan gain number, dark total pill | Play Data. Ref: Result screen (`base_image_3`, left) |
| `.nu-info` (`__label`, `__value`, `__sub`) | Translucent info card: gray pill labels with values below | Also used as small section labels. Ref: Result screen's 場所 / プレイ時間 card |
| `.nu-tiles`, `.nu-tile` (`__box`, `__badge`, `__count`), `--gold` / `--silver`, `__box--logo` | Framed item tiles (teal rim by default, gold = completed, silver = beaten) with a small platform logo top-right (`__pf`), an inner badge (×N earned / +N gained, like the game's ×30) and a dark count pill below | Ref: Result screen crystal / astral tiles |
| `.nu-traits` | Grid of effect-style lines with an orange ✦ | Player traits (genres + styles). Ref: Astral House effect list (`base_image_4`) |
| `.nu-covers`, `.nu-cover` (`__art`, `__name`, `__pf`) | Game covers on a shelf: same height, natural width (square PS1 case, tall PC box), gold card rim, name + platform pill | Player favorites |
| `.nu-hud` (`__portrait` with `--nu-hp`, `__code`, `__bar`, `__fill`, `__hp`, `__counters`), `.nu-coin`, `.nu-gem`, `.nu-key` | Battle HUD: round portrait with health arc, name, green bar, counters | Bottom-left |
| `.nu-dialog` (`__art`, `__box`, `__hints`), `.nu-nameplate`, `.nu-caret`, `.nu-type__rest` | Dialogue: portrait art, white speech box, name plate, bobbing ▼, Next/Skip hints | Full-screen overlay. Box rises, portrait slides in; text types out 25 ms/char (first click finishes the line); the untyped rest stays in the layout, hidden, so the box never grows |
| `.nu-enter` (`--from-right` / `--from-left`), `.nu-rise`, `.nu-stagger` | Motion utilities: page entry from the side you navigated toward; in-place swap (fade + rise 8px); children appearing one after another | Put `key={…}` on the element so React remounts it and the animation replays. Set `--i` inline to control a stagger step |

Reference screen layouts from the game, as used on the landing page:

- **Creations** (after the Statue screen, `design-references/little-noah/official-system/base_image_5.png`): heading → *Display* section (pedestals, 3 per row; locked `???` pedestals for future projects) and *Preview* section (screenshot) on the left; *details* section on the right: `.nu-burst` icon with `Lv 1 ▸ n` (`.nu-progress`) and PWR / Since / Latest pills, the move link, *Materials* (`.nu-slots`) and *Effects* (`.nu-effects`). Phone: Display → details → Preview.
  (The earlier *Lineup* screen used the lineup band, Stock grid and render box; those components remain in the system.)
- **Play Data:** heading → two columns of `.nu-data` rows on a light gray panel.
- **Player** (after the Anima screen `base_image_6` + Astral House detail `base_image_4`): heading → portrait `.nu-render` (★, PWR, avatar, name plate, `.nu-ribbon-flag` title) left; *Status* (stat pills), *Background* (about + motto) and *Traits* (`.nu-traits`) boxes right; *All-time Favorites* (`.nu-covers`) full width below.
- **Play Data** (after the Result screen, `base_image_3` left): heading → `.nu-result` sheet: "RESULTS" title with a ★ completions `.nu-counter` top-right; `.nu-result-banner` (avatar, "Unlocked this month" ribbon, `+n` gain, total achievements pill); then an `.nu-info` card (Now playing, Streak, Games tracked) left and tiles right (Games this month: grouped per game, newest unlock first, ×N = month's unlocks, gold/silver rim = completed/beaten this month, top 12 with a `.nu-tile__box--more` "+N" tile; Platforms played this month). Phone: everything stacks.
- **Records (Links):** lists of `.nu-row`s left, one `.nu-section` box per group (Gamer Profiles / Developer, numbered G-01… / D-01…), detail card right (emblem, ribbon title, stat pills, tags, hint pill). The card adapts to the group: a project shows its Lineup Lv / PWR, a gamer profile shows live stats and the player name.
- **Dialogue:** intro lines from `data/site.json` → `intro`; shown once per session.

---

## Adding a screen

1. Add a tab in `TABS` (`app.js`) and a component that renders inside the frame.
2. Start with a `.nu-heading`, then compose from the components above.
3. Put layout (grids, columns) in `site.css`, including the phone rules.
4. Add a footer hint for any new action, and the matching keyboard shortcut.
5. Check desktop and 390px-wide mobile; nothing should scroll sideways.
