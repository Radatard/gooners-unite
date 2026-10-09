# Gooners Unite

A first-person, PS1-style exploration game set inside an apartment building, built together by a group of friends, each using their own AI.

The first floor is laid out like a real mid-rise apartment building. Units sit on both sides of a 6 ft corridor, with an enclosed stairwell at each end. There's a lobby with a mail alcove and a broken elevator, plus trash, electrical, laundry, maintenance and bike rooms. Eight apartments, each with different people living in it:

| Apt | Type | Who lives there |
|---|---|---|
| 101 | 2 bed / 2 bath | The Ramirez family: parents and 7-year-old Lily. Clean, busy, toys everywhere. |
| 102 | 2 bed / 2 bath | Derek. The spare bedroom is a home gym. The gym is spotless, the rest isn't. |
| 103 | Studio | Jess, an ER nurse on night shift. Blackout curtains, scrubs, a lot of coffee. |
| 104 | 1 bed | Mrs. Hale, a retired widow, and Biscuit the cat. Spotless. |
| 105 | 1 bed | Marcus & Tasha, newlyweds. Moving boxes and unopened wedding gifts. |
| 106 | 1 bed | Sam, a painter. The living room is an art studio. |
| 107 | 1 bed | Frank, a hoarder. Newspaper stacks and boxes to the ceiling. |
| 108 | 2 bed / 2 bath | Priya & Kevin, grad-student roommates. Disgusting. |

**Everything is real:**
- **Storage and items:** every fridge, freezer, pantry, cabinet, drawer, closet, washer and medicine cabinet opens. They're stocked with ~300 kinds of household stuff, and every item can be picked up, dropped, thrown and smashed.
- **Furniture:** you can drag it around with real collision.
- **Walls:** built in layers like real wood-frame walls: drywall, studs at 16" on center, headers over doors, insulation, wiring through the studs to outlet boxes, and water/drain pipes in bathroom and kitchen walls.
- **The sledgehammer:** find it in the electrical room. Hold the mouse to wind up, let go to swing. The longer you charge, the harder it hits. Flick the mouse sideways as you let go for a side swing. Holes break where and how you hit: big ragged holes from full swings, cracks from taps, smaller dents right over a stud. Chunks of drywall, insulation and snapped studs fly off and tumble around. Smash through to get between rooms and apartments. Cut a wire and that room's lights die. Break a pipe and it floods. Brick and concrete block won't break.
- **Physics:** boxes crumple and fly, cans get crushed, piles of boxes topple, glass shatters into shards, and thrown things can break drywall. It's realistic-ish and a little glitchy on purpose.
- **Electrical:** each apartment has a breaker panel, and the electrical room has the building's main disconnect.

## Play

Live: https://radatard.github.io/gooners-unite/ (or open `index.html` locally).

Controls:

| Key | Action |
|---|---|
| **WASD** / **mouse** | Move / look |
| **Shift** / **C** | Run / crouch |
| **E** | Open, use, pick up |
| **G** or right-click | Drag furniture |
| **Q** / **F** | Drop / throw what you're holding |
| **Click** | Use |
| **Hold click, release** | Swing the sledgehammer (flick sideways on release for a side swing) |
| **Wheel / Tab / 1-9** | Switch held item |
| **Esc** | Pause |

## Join in and edit

1. Get added as a collaborator on the GitHub repo (ask Radatard).
2. Install [Git](https://git-scm.com/downloads), then clone the repo:
   ```
   git clone https://github.com/Radatard/gooners-unite.git
   ```
3. Open the folder with your AI tool (Claude Code, Cursor, Copilot, ChatGPT, etc.) and tell it what to add or change.
   The AI should follow the rules in `AGENTS.md`: pull first, make small changes, then commit and push.
4. After you push, the live site updates in a minute or two.

## Tips for working together

- Say in your group chat what you're working on so two people don't edit the same thing.
- Pull often, and push often.
- If something breaks, any change can be undone with Git. Ask your AI to "revert the last commit".
