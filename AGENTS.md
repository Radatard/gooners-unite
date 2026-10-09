# Instructions for AI assistants

Several friends edit this game, each with their own AI (Claude, ChatGPT, Copilot, Cursor, etc.) on their own computer. Everyone shares one GitHub repo. Follow these rules so nobody's work gets overwritten.

## The project

- First-person 3D game set inside an apartment building, built with [Three.js r158](https://threejs.org/) (loaded from a CDN in `index.html`). PS1-style look: low render resolution, pixel textures, vertex wobble.
- Plain JavaScript, no build step, no npm. Files are loaded with `<script>` tags, not ES modules, and share the global `GU` object. Keep it that way so the game runs by just opening `index.html` and hosts free on GitHub Pages.
- All textures are generated in code (`src/engine/textures.js`), so there are no image files.
- Layout:
  - `index.html`: page shell, HUD, and the list of script tags (order matters)
  - `src/engine/core.js`: shared state, materials, geometry helpers, PS1 shader, static mesh merging
  - `src/engine/textures.js`: procedural textures (wood, tile, wallpaper, labels...)
  - `src/engine/items.js`: the household item catalog (`CATALOG`) and item models. Add new items here.
  - `src/engine/furniture.js`: furniture, appliances, doors, cabinets, drawers
  - `src/engine/build.js`: walls/floors/windows/lights and the standard apartment floor plan, kitchen and bathroom
  - `src/engine/player.js`: movement, collision, interaction, inventory
  - `src/world/building.js`: hallway, lobby, stairs
  - `src/world/aptXXX_*.js`: one file per apartment (who lives there and everything in it)
  - `src/main.js`: renderer, lighting, game loop

## Performance rules (important: some of us have weak laptop GPUs)

- Don't add real `THREE.PointLight`s. Use `GU.ceilingLight(...)`; `main.js` moves a pool of 6 real lights to the nearest ones.
- Static stuff gets merged into a few meshes automatically. If you change a mesh after building (animate it, swap its material), set `mesh.userData.noMerge = true`.
- Put things inside closed containers with `GU.hideWhenClosed` (cabinets, drawers and the fridge already do this) so they aren't drawn while hidden.
- After a change, check the frame rate stays smooth inside an apartment.

## Adding stuff

- New item: add one line to `CATALOG` in `src/engine/items.js`, then use its id in an apartment's contents lists.
- New apartment or floor: copy an existing `src/world/apt*.js`, give it a new `number`, `x0` and `side`, and add its `<script>` tag to `index.html` before `src/main.js`.

## Before you change anything

1. Run `git pull` to get everyone's latest work.
2. If the pull reports conflicts, fix them first and keep both people's changes where possible. Never discard someone else's work to make a conflict go away.

## While working

- Make small, focused changes. Don't reformat or rewrite files you don't need to touch; it causes merge conflicts for others.
- Put new features in new files where possible (e.g. a new apartment in `src/world/`). Add each new script to `index.html` before `src/main.js`.
- Keep the game working. Open `index.html` in a browser (or run `npx serve` / `python -m http.server` and visit the local address) and check there are no console errors.
- Only add assets you have the right to use, and keep files small (under ~2 MB each).

## When done

1. `git add` only the files you changed.
2. `git commit -m "<short description of the change>"`
3. `git pull` again, fix any conflicts, then `git push`.
4. The live site updates automatically a minute or two after the push.

## Never

- Force-push (`git push --force`) or rewrite history.
- Delete or rename other people's files or features without the human asking for it.
- Commit API keys, passwords, or other secrets.
