# Instructions for AI assistants

Several friends edit this game, each with their own AI (Claude, ChatGPT, Copilot, Cursor, etc.) on their own computer. Everyone shares one GitHub repo. Follow these rules so nobody's work gets overwritten.

## The project

- Browser game built with [Phaser 3](https://phaser.io/) (loaded from a CDN in `index.html`).
- Plain JavaScript, no build step, no npm. Files are loaded with `<script>` tags, not ES modules. Keep it that way so the game runs by just opening `index.html` and hosts free on GitHub Pages.
- Layout:
  - `index.html`: page shell and the list of script tags
  - `src/main.js`: Phaser config and the scene list
  - `src/scenes/*.js`: one scene class per file
  - `assets/`: images and sounds (create it when needed)

## Before you change anything

1. Run `git pull` to get everyone's latest work.
2. If the pull reports conflicts, fix them first and keep both people's changes where possible. Never discard someone else's work to make a conflict go away.

## While working

- Make small, focused changes. Don't reformat or rewrite files you don't need to touch; it causes merge conflicts for others.
- Put new features in new files where possible (e.g. a new scene or a new `src/entities/Thing.js`). Add each new script to `index.html` before `src/main.js`, and register new scenes in `src/main.js`.
- Keep the game working. Open `index.html` in a browser (or run `python -m http.server` and visit http://localhost:8000) and check there are no console errors.
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
