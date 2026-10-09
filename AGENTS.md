# Instructions for AI assistants

Several friends edit this game, each with their own AI (Claude, ChatGPT, Copilot, Cursor, etc.) on their own computer. Everyone shares one GitHub repo. Follow these rules so nobody's work gets overwritten.

## The project

- First-person 3D game set inside an apartment building, built with [Three.js r158](https://threejs.org/) (loaded from a CDN in `index.html`). PS1-style look: low render resolution, pixel textures, vertex wobble.
- Plain JavaScript, no build step, no npm. Files are loaded with `<script>` tags, not ES modules, and share the global `GU` object. Keep it that way so the game runs by just opening `index.html` and hosts free on GitHub Pages.
- All textures are generated in code (`src/engine/textures.js`), so there are no image files.
- Layout:
  - `index.html`: page shell, HUD, and the list of script tags (order matters)
  - `src/engine/core.js`: shared state, materials, geometry helpers, PS1 shader, collision grid, static mesh merging, `GU.prop` (movable/breakable tags)
  - `src/engine/textures.js`: procedural textures (wood, tile, wallpaper, lumber, insulation, labels...)
  - `src/engine/items.js`: the household item catalog (`CATALOG`) and item models. Add new items here.
  - `src/engine/furniture.js`: furniture, appliances, doors, cabinets, drawers. The `tag(...)` list at the bottom says what can be dragged and smashed.
  - `src/engine/walls.js`: realistic layered, destructible walls (see "How walls work")
  - `src/engine/build.js`: floors, ceilings, doors, windows, lights/circuits/switches/breaker panels, and the `Unit` class (kitchen/bath/laundry builders)
  - `src/engine/rigid.js`: the (deliberately a bit janky) rigid-body engine for loose stuff. See "How physics works"
  - `src/engine/physics.js`: dropping, throwing, dragging furniture, smashing and crumpling, debris, sounds, the chargeable sledgehammer swing
  - `src/engine/player.js`: movement, collision, interaction, inventory
  - `src/engine/health.js`: player health, damage (`GU.hurtPlayer`), getting shoved/slimed, dying and respawning
  - `src/engine/trashmonster.js`: hit a trash can with the sledgehammer and it becomes a trash monster (AI, attacks, health bar, loot)
  - `src/world/layout.js`: the floor plan: apartment templates (studio / 1 bed / 2 bed), where each unit goes, shared rooms
  - `src/world/building.js`: contents of the shared rooms (stairs, lobby, maintenance, laundry...)
  - `src/world/unitXXX_*.js`: one file per apartment: who lives there, colors, and everything in it
  - `src/main.js`: startup order, renderer, lighting, culling, game loop

## How walls work

- Walls are never placed by hand. `layout.js` generates them from the room rectangles, and picks the real-world assembly from who is on each side: partition, plumbing wall, 1-hour corridor wall, double-stud demising wall between units, exterior wall (brick veneer, unbreakable), or concrete block around stairs and the elevator.
- Each wall is made of elements: drywall panels on each side, 2x4 or 2x6 studs at 16" on center (split into breakable sections), king and jack studs plus headers at openings, plates, insulation, Romex wiring and outlet boxes, and PEX/PVC pipes in plumbing walls. Every element has hit points and its own collision box.
- Doors and windows are openings: add them in a template's `doors` / `windows`, or in `COMMON_DOORS` / `COMMON_WINDOWS` in `layout.js`.
- Cutting a wire kills that room's circuit (lights off). Each unit has a breaker panel, and the electrical room has the building's main disconnect.
- Hits carry energy measured in "hits" (a sledgehammer tap is ~3.2, a full charge ~32, and a blow over 6 also snaps the studs around the impact). The first time a drywall, OSB or insulation panel gets hit, it splits into ~5 cm tiles. Damage spreads in a ragged blob shaped by the energy, the swing direction (overhead = tall hole, side = wide) and the angle of the blow. Cracks spread out from the impact, and tiles right over a stud are much stronger. Tiles left hanging with nothing holding them up fall off. Removed tiles fly off as physics chunks.
- `GU.wallStrike(hit, blow)` carries the blow through the wall layer by layer. Each layer soaks up some of the energy, and the rest goes on to the studs, wiring and the far drywall, which blows out with a bigger hole. Studs snap where they're hit, and the snapped piece flies off. `GU.wallImpact` is the same thing for thrown or flying objects.

## How physics works

- Loose things (wall chunks, snapped studs, broken pieces, items you drop or throw, things the hammer knocks over) are rigid bodies in `GU.rigid`. Each body is an oriented box whose corners collide with the floor, the ceiling and every collider box. Bodies bump each other as spheres. Bodies go to sleep when they stop moving.
- It's meant to be realistic-ish but a bit shitty, with fun glitches: things occasionally super-bounce, spin weirdly, twitch while asleep, or tunnel into places. Tune that in `GU.JANK` at the top of `rigid.js`.
- Use `GU.fall(obj)` to drop something and `GU.throwItem(item, pos, vel)` to throw it. `GU.smash(obj, point, { energy, dir, speed })` damages a breakable. Paper, plastic and metal stuff crumples (its mesh really deforms) and light things get knocked flying. Stacks of boxes come apart.
- Debris is capped (`MAX_DEBRIS` in `rigid.js`) so a long demolition session doesn't kill the frame rate. The oldest debris gets cleaned up first.
- The sledgehammer: hold the mouse button to wind up, release to swing. Charge decides the energy. Flicking the mouse sideways on release makes it a side swing. Hits get hit-stop and screen shake, and the hammer recoils off brick, concrete and the floor.

## Monsters and health

- The player has 100 HP (bottom-left bar) and slowly regenerates after 6 s without taking damage. At 0 HP you respawn in the lobby. Monsters hurt you with `GU.hurtPlayer(amount, { push, slime, shake })`.
- Trash cans are tagged `userData.trashCan` in `furniture.js`. `GU.smash` turns them into a `TrashMonster` instead of breaking them. It has 200 HP and a health bar over its head. Sledgehammer damage is energy x 6 (a tap does 19, a full charge 192). Heavy things thrown at it hurt it too, through `onHit` on its collider. Its attacks are a punch (12 damage), a shove (6 damage plus a big knockback) and a sludge spray (3 damage per tick plus a slowdown, and it leaves puddles that slow you). When a wall blocks it, it punches through the drywall. When it dies, it bursts into real garbage items.
- A new monster can copy `trashmonster.js`: build a model, give it `root.userData.monster = this` and a `hurt(energy, dir, point)` method, and the hammer will hit it automatically.
- `main.js` catches errors from individual frames, so one bug logs to the console instead of freezing the game.

## Performance rules (important: some of us have weak laptop GPUs)

- Don't add real `THREE.PointLight`s. Use `GU.ceilingLight(...)`; `main.js` moves a pool of 6 real lights to the nearest ones.
- Static stuff gets merged into a few meshes automatically. If you change a mesh after building (animate it, swap its material), set `mesh.userData.noMerge = true`.
- Put things inside closed containers with `GU.hideWhenClosed` (cabinets, drawers and the fridge already do this) so they aren't drawn while hidden.
- After a change, check the frame rate stays smooth inside an apartment.

## Adding stuff

- New item: add one line to `CATALOG` in `src/engine/items.js`, then use its id in an apartment's contents lists. Every item can automatically be picked up, dropped, thrown and smashed.
- New furniture: build it in its own group facing local +z, then tag it with `GU.prop(group, { move: kg, hp: hits, mat, name })` so it can be dragged (G) and smashed. Use `tough: 'message'` for things that can't break. Use `mount: true` for things hung on walls (they fall when the drywall behind breaks).
- New apartment: add a line to `PLAN` in `layout.js` (template + position), copy a `src/world/unit*.js` file, and add its `<script>` tag to `index.html` before `src/main.js`. Positions in a unit file are in template coordinates: x across the unit, z from the corridor (0) to the windows (10).
- Test without a browser: the build should run with no console errors. Watch for `[Layout]` warnings, which mean a door or window didn't land in a wall.

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
