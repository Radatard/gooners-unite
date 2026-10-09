// Building blocks for rooms: walls with door/window openings, floors, ceilings, lights,
// and the standard apartment shell + kitchen + bathroom that every unit shares.
(function () {
  const M = (c) => GU.mat(c);

  // Wall that runs along `axis` ('x' or 'z') at `fixed`, from `from` to `to`.
  // negMat faces the negative side, posMat the positive side.
  // openings: [{ a, b, bottom = 0, top = 2.1 }]
  GU.wall = function (parent, axis, fixed, from, to, negMat, posMat, openings, o) {
    o = o || {};
    const H = o.h || GU.LAYOUT.H, t = o.t || GU.LAYOUT.T;
    const mats = axis === 'x' ? [posMat, posMat, posMat, posMat, posMat, negMat] : [posMat, negMat, posMat, posMat, posMat, posMat];
    const piece = (a, b, y0, y1) => {
      if (b - a < 0.005 || y1 - y0 < 0.005) return;
      const len = b - a, mid = (a + b) / 2;
      if (axis === 'x') GU.box(parent, len, y1 - y0, t, mid, y0, fixed, mats, { solid: true });
      else GU.box(parent, t, y1 - y0, len, fixed, y0, mid, mats, { solid: true });
    };
    const ops = (openings || []).slice().sort((p, q) => p.a - q.a);
    let cur = from;
    for (const op of ops) {
      piece(cur, op.a, 0, H);
      piece(op.a, op.b, op.top || 2.1, H);
      if (op.bottom) piece(op.a, op.b, 0, op.bottom);
      cur = op.b;
    }
    piece(cur, to, 0, H);
  };

  GU.floor = function (parent, x1, z1, x2, z2, mat, y) {
    return GU.box(parent, x2 - x1, 0.05, z2 - z1, (x1 + x2) / 2, (y || 0) - 0.05, (z1 + z2) / 2, mat, { walk: true });
  };

  GU.ceiling = function (parent, x1, z1, x2, z2, mat, h) {
    return GU.box(parent, x2 - x1, 0.05, z2 - z1, (x1 + x2) / 2, h || GU.LAYOUT.H, (z1 + z2) / 2, mat || GU.mat('#ffffff', GU.tex.ceiling()));
  };

  // Window in an opening. outward = +1 if outside is on the positive side of the wall.
  GU.window = function (parent, axis, fixed, a, b, bottom, top, outward, o) {
    o = o || {};
    const w = b - a, h = top - bottom, mid = (a + b) / 2, cy = bottom + h / 2;
    const frame = M(o.frame || '#f4f4f0');
    const sky = GU.glow('#ffffff', GU.tex.sky());
    const g = GU.group(parent, axis === 'x' ? mid : fixed, 0, axis === 'x' ? fixed : mid, axis === 'x' ? 0 : Math.PI / 2);
    // in local space the window spans x in [-w/2, w/2] and outside is +z * outward
    GU.plane(g, w + 1.2, h + 1.0, 0, cy, outward * 0.6, sky, { ry: outward > 0 ? Math.PI : 0 });
    GU.box(g, w, 0.05, 0.2, 0, bottom - 0.05, -outward * 0.04, frame);
    GU.box(g, w, 0.05, 0.12, 0, top, 0, frame);
    GU.box(g, 0.05, h, 0.12, -w / 2 + 0.025, bottom, 0, frame);
    GU.box(g, 0.05, h, 0.12, w / 2 - 0.025, bottom, 0, frame);
    GU.box(g, w, 0.04, 0.06, 0, cy, 0, frame);
    GU.box(g, w, h, 0.01, 0, bottom, outward * 0.02, GU.mat('#cfefff', null, { transparent: true, opacity: 0.18, depthWrite: false }));
    if (o.blinds !== false) {
      const slat = M(o.blindColor || '#f4f1e6');
      const n = Math.floor((h * (o.blindsDown || 0.35)) / 0.05);
      for (let i = 0; i < n; i++) GU.box(g, w - 0.06, 0.008, 0.06, 0, top - 0.05 - i * 0.05, -outward * 0.08, slat, { rx: 0.5 });
    }
    if (o.curtains) {
      const cm = GU.mat('#ffffff', GU.tex.fabric(o.curtains));
      GU.box(g, 0.3, h + 0.4, 0.04, -w / 2 - 0.1, bottom - 0.3, -outward * 0.12, cm);
      GU.box(g, 0.3, h + 0.4, 0.04, w / 2 + 0.1, bottom - 0.3, -outward * 0.12, cm);
      GU.cyl(g, 0.012, 0.012, w + 0.7, 0, top + 0.12, -outward * 0.12, M('#5d4037'), { rz: Math.PI / 2 }).position.y = top + 0.12;
    }
    GU.interactive(g, 'Look outside', () => GU.say(o.view || 'A sunny parking lot and a single tree. You\'re staying in.'));
    return g;
  };

  // Ceiling light: a glowing fixture plus a "virtual" light. Every frame main.js hands the few real
  // PointLights to the virtual lights closest to the player (lots of real lights make shaders very slow).
  // Returns a handle the light switch toggles.
  GU.virtualLights = [];
  GU.ceilingLight = function (lightParent, fixtureParent, x, z, o) {
    o = o || {};
    const H = o.h || GU.LAYOUT.H;
    const color = o.color || '#fff1d6';
    const glowMat = GU.glow(color), offMat = M('#bdbdb0');
    const fix = GU.cyl(fixtureParent, 0.22, 0.16, 0.08, x, H - 0.09, z, glowMat, { seg: 10 });
    fix.userData.noMerge = true;
    const handle = {
      parent: lightParent, local: new THREE.Vector3(x, H - 0.35, z), world: new THREE.Vector3(),
      color: new THREE.Color(color), base: o.intensity || 6, distance: o.distance || 9, mult: 1, on: true, fix,
    };
    handle.set = (on) => {
      handle.on = on;
      fix.material = on ? glowMat : offMat;
    };
    if (o.flicker) {
      let t = 0;
      GU.updaters.push((dt) => {
        t += dt;
        if (!handle.on) return;
        handle.mult = Math.sin(t * 23) + Math.sin(t * 7.3) > 1.5 && Math.random() < 0.6 ? 0.15 : 1;
        fix.material = handle.mult < 1 ? offMat : glowMat;
      });
    }
    GU.virtualLights.push(handle);
    return handle;
  };

  GU.lightSwitch = function (parent, x, z, ry, handles) {
    const g = GU.group(parent, x, 1.2, z, ry);
    GU.box(g, 0.08, 0.12, 0.012, 0, 0, 0, M('#f4f1e6'));
    const tog = GU.box(g, 0.018, 0.035, 0.02, 0, 0.045, 0.01, M('#e8e4d6'));
    tog.userData.noMerge = true;
    GU.interactive(g, 'Flip light switch', () => {
      const on = !handles[0].on;
      handles.forEach((h) => h.set(on));
      tog.position.y = on ? 0.045 + 0.0175 : 0.02 + 0.0175 - 0.025;
    });
    return g;
  };

  // Flat stain decal on the floor
  GU.stain = function (parent, x, z, size, tone) {
    return GU.plane(parent, size, size, x, 0.004, z, GU.mat('#ffffff', GU.tex.stain(tone || '70,55,25'), { transparent: true, depthWrite: false }), { rx: -Math.PI / 2 });
  };

  // ---------- the standard apartment ----------
  // All apartments share this floor plan (in local meters; +z points away from the hallway):
  //
  //   z=12 +---------+--------+-----------+
  //        |  bed1   |  bath  |   bed2    |
  //   z=6  +--d------+--d-----+-d---------+
  //        |   living         |  kitchen  |
  //   z=0  +-D----------------+-----------+   <- hallway side, D = front door
  //       x=0                 9          14
  const L = (GU.LAYOUT = {
    W: 14, D: 12, H: 2.7, T: 0.12,
    rooms: {
      living: [0, 0, 9, 6], kitchen: [9, 0, 14, 6],
      bed1: [0, 6, 5, 12], bath: [5, 6, 8.5, 12], bed2: [8.5, 6, 14, 12],
    },
    doors: { entry: [1.0, 1.95], bed1: [3.6, 4.45], bath: [6.0, 6.85], bed2: [9.4, 10.25] },
  });

  GU.Apartment = class {
    // o: { number, title, side: 'north'|'south', x0, dirt (0..1), theme }
    // North units: local x runs along +world x. South units are rotated 180 degrees.
    constructor(o) {
      this.o = o;
      this.dirt = o.dirt || 0;
      this.rng = GU.makeRng(GU.hash('apt' + o.number));
      const north = o.side !== 'south';
      this.root = GU.group(GU.world, o.x0, 0, north ? 1.5 : -1.5, north ? 0 : Math.PI);
      this.shell = GU.group(this.root);   // always visible (front wall, door)
      this.g = GU.group(this.root);       // everything inside (hidden when you can't see in)
      this.lightGroup = GU.group(this.root);
      this.lights = {};
      this.buildShell();
    }

    room(name) { return L.rooms[name]; }

    buildShell() {
      const th = this.o.theme, T = L.T, H = L.H, W = L.W, D = L.D, R = L.rooms, Dr = L.doors;
      const wall = (r) => th[r].wall;
      const g = this.g;
      // floors + ceilings
      for (const r of Object.keys(R)) {
        const [x1, z1, x2, z2] = R[r];
        GU.floor(g, x1, z1, x2, z2, th[r].floor);
        GU.ceiling(g, x1, z1, x2, z2, GU.mat('#ffffff', GU.tex.ceiling(this.dirt)));
      }
      // front wall (hallway side) lives in the always-visible shell
      GU.wall(this.shell, 'x', T / 2, 0, 9, th.hallWall, wall('living'), [{ a: Dr.entry[0], b: Dr.entry[1], top: 2.1 }]);
      GU.wall(this.shell, 'x', T / 2, 9, W, th.hallWall, wall('kitchen'));
      // the hallway-side face of the door frame
      const trim = M(th.trim || '#f4f1e6');
      GU.box(this.shell, Dr.entry[1] - Dr.entry[0] + 0.16, 0.08, 0.03, (Dr.entry[0] + Dr.entry[1]) / 2, 2.1, -0.015, trim);
      GU.box(this.shell, 0.08, 2.1, 0.03, Dr.entry[0] - 0.04, 0, -0.015, trim);
      GU.box(this.shell, 0.08, 2.1, 0.03, Dr.entry[1] + 0.04, 0, -0.015, trim);
      this.door = GU.door(this.shell, 'x', T / 2, Dr.entry[0], Dr.entry[1], {
        swing: 1, hinge: 'a', label: 'Apt ' + this.o.number + ' door', number: this.o.number,
        color: th.doorColor || '#7a1f2b', locked: this.o.locked,
      });
      // back (exterior) wall with windows
      GU.wall(g, 'x', D - T / 2, 0, 5, wall('bed1'), wall('bed1'), [{ a: 1.6, b: 3.2, bottom: 0.9, top: 2.1 }]);
      GU.wall(g, 'x', D - T / 2, 5, 8.5, wall('bath'), wall('bath'), [{ a: 7.0, b: 8.0, bottom: 1.5, top: 2.1 }]);
      GU.wall(g, 'x', D - T / 2, 8.5, W, wall('bed2'), wall('bed2'), [{ a: 10.4, b: 12.4, bottom: 0.9, top: 2.1 }]);
      GU.window(g, 'x', D - T / 2, 1.6, 3.2, 0.9, 2.1, 1, { curtains: th.bed1Curtains, blindsDown: th.blinds });
      GU.window(g, 'x', D - T / 2, 7.0, 8.0, 1.5, 2.1, 1, { blindsDown: 0.1, view: 'Frosted glass. You can\'t see much.' });
      GU.window(g, 'x', D - T / 2, 10.4, 12.4, 0.9, 2.1, 1, { curtains: th.bed2Curtains, blindsDown: th.blinds });
      // side walls (shared with the neighbors, so each unit keeps its own inset copy)
      GU.wall(g, 'z', T / 2, 0, 6, wall('living'), wall('living'));
      GU.wall(g, 'z', T / 2, 6, D, wall('bed1'), wall('bed1'));
      GU.wall(g, 'z', W - T / 2, 0, 6, wall('kitchen'), wall('kitchen'));
      GU.wall(g, 'z', W - T / 2, 6, D, wall('bed2'), wall('bed2'));
      // interior walls
      const o = (d) => ({ a: Dr[d][0], b: Dr[d][1], top: 2.1 });
      GU.wall(g, 'x', 6, 0, 5, wall('living'), wall('bed1'), [o('bed1')]);
      GU.wall(g, 'x', 6, 5, 8.5, wall('living'), wall('bath'), [o('bath')]);
      GU.wall(g, 'x', 6, 8.5, 9, wall('living'), wall('bed2'));
      GU.wall(g, 'x', 6, 9, W, wall('kitchen'), wall('bed2'), [o('bed2')]);
      GU.wall(g, 'z', 5, 6, D, wall('bed1'), wall('bath'));
      GU.wall(g, 'z', 8.5, 6, D, wall('bath'), wall('bed2'));
      GU.wall(g, 'z', 9, 0, 6, wall('living'), wall('kitchen'), [{ a: 1.0, b: 5.0, top: 2.3 }]);
      // interior doors
      const doorColor = th.innerDoor || '#f4f1e6';
      this.doors = {
        bed1: GU.door(g, 'x', 6, Dr.bed1[0], Dr.bed1[1], { swing: 1, hinge: 'b', label: 'bedroom door', color: doorColor }),
        bath: GU.door(g, 'x', 6, Dr.bath[0], Dr.bath[1], { swing: 1, hinge: 'a', label: 'bathroom door', color: doorColor }),
        bed2: GU.door(g, 'x', 6, Dr.bed2[0], Dr.bed2[1], { swing: 1, hinge: 'b', label: 'bedroom door', color: doorColor }),
      };
      // lights + switches
      const lg = this.lightGroup, lc = th.lightColor || '#fff1d6';
      const li = (x, z, extra) => GU.ceilingLight(lg, g, x, z, Object.assign({ color: lc }, extra));
      this.lights.living = li(4.5, 3, { intensity: 7 });
      this.lights.kitchen = li(11.5, 3, { color: th.kitchenLight || lc });
      this.lights.bed1 = li(2.5, 9);
      this.lights.bath = li(6.75, 9, { color: '#f4fbff', intensity: 5, flicker: th.bathFlicker });
      this.lights.bed2 = li(11.25, 9);
      GU.lightSwitch(g, 2.15, T + 0.006, 0, [this.lights.living]);
      GU.lightSwitch(g, 8.8, T + 0.006, 0, [this.lights.kitchen]);
      GU.lightSwitch(g, 3.4, 6 + T / 2 + 0.006, 0, [this.lights.bed1]);
      GU.lightSwitch(g, 7.05, 6 - T / 2 - 0.006, Math.PI, [this.lights.bath]);
      GU.lightSwitch(g, 10.45, 6 + T / 2 + 0.006, 0, [this.lights.bed2]);
      GU.radiator(g, 2.4, D - T - 0.08, Math.PI, 1.0);
      GU.radiator(g, 11.4, D - T - 0.08, Math.PI, 1.0);
    }

    // Standard kitchen. c = contents: { fridge, freezer, crisper, fridgeDoor, magnets, drawers: [[..] x6],
    //   sink (under-sink), dishes (in the sink), pots (base cabinet), spices, plates, glasses, pantry: [[..] x5],
    //   counter, stoveTop, oven, microwave, backDrawers, backCab1, backCab2 }
    kitchen(c) {
      const g = this.g, th = this.o.theme;
      const cab = th.cabinet || GU.mat('#ffffff', GU.tex.wood('#c9a27a', this.dirt * 0.5));
      const top = th.counter || GU.mat('#ffffff', GU.tex.granite('#d8d2c4'));
      const E = 14 - L.T; // inner face of the east wall
      const ry = -Math.PI / 2; // facing -x
      const bx = E - 0.3;
      GU.fridge(g, E - 0.37, 0.6, ry, {
        shelves: c.fridge, freezer: c.freezer, crisper: c.crisper, door: c.fridgeDoor, magnets: c.magnets, dirt: this.dirt * 0.5,
      });
      GU.drawers(g, bx, 0, 1.35, ry, { w: 0.6, h: 0.86, d: 0.6, count: 3, mat: cab, label: 'drawer', contents: (c.drawers || []).slice(0, 3) });
      GU.cabinet(g, bx, 0, 2.05, ry, { w: 0.8, h: 0.86, d: 0.6, shelves: 0, mat: cab, label: 'under-sink cabinet', contents: [c.sink || []] });
      GU.cyl(g, 0.025, 0.025, 0.4, bx + 0.15, 0.3, 2.05, M('#c0c0c0'));
      GU.cabinet(g, bx, 0, 2.75, ry, { w: 0.6, h: 0.86, d: 0.6, shelves: 1, mat: cab, label: 'cabinet', contents: c.pots || [] });
      GU.stove(g, E - 0.32, 3.43, ry, { top: c.stoveTop, oven: c.oven, dirt: this.dirt });
      GU.drawers(g, bx, 0, 4.11, ry, { w: 0.6, h: 0.86, d: 0.6, count: 3, mat: cab, label: 'drawer', contents: (c.drawers || []).slice(3, 6) });
      GU.cabinet(g, bx, 0, 4.71, ry, { w: 0.6, h: 0.86, d: 0.6, shelves: 1, mat: cab, label: 'cabinet', contents: c.lowerCab || [] });
      GU.cabinet(g, E - 0.3, 0, 5.5, ry, { w: 0.78, h: 2.15, d: 0.6, shelves: 4, mat: cab, label: 'pantry', contents: c.pantry || [] });
      // countertops (with a gap for the sink)
      const ct = (z1, z2, x1, x2) => GU.box(g, x2 - x1, 0.04, z2 - z1, (x1 + x2) / 2, 0.86, (z1 + z2) / 2, top);
      ct(1.05, 1.7, E - 0.62, E);
      ct(2.4, 3.05, E - 0.62, E);
      ct(1.7, 2.4, E - 0.07, E);
      ct(1.7, 2.4, E - 0.62, E - 0.53);
      ct(3.81, 5.01, E - 0.62, E);
      GU.sinkBasin(g, E - 0.3, 0.9, 2.05, ry, { dishes: c.dishes });
      // backsplash
      if (th.backsplash) GU.box(g, 0.01, 0.55, 3.95, E - 0.005, 0.9, 3.03, th.backsplash);
      // upper cabinets
      const uy = 1.48, ud = 0.34, ux = E - ud / 2;
      GU.cabinet(g, ux, uy, 1.35, ry, { w: 0.6, h: 0.72, d: ud, shelves: 1, mat: cab, label: 'spice cabinet', contents: c.spices || [], solid: false });
      GU.cabinet(g, ux, uy, 2.05, ry, { w: 0.8, h: 0.72, d: ud, shelves: 1, mat: cab, label: 'cabinet', contents: c.plates || [], solid: false });
      GU.cabinet(g, ux, uy, 2.75, ry, { w: 0.6, h: 0.72, d: ud, shelves: 1, mat: cab, label: 'cabinet', contents: c.glasses || [], solid: false });
      GU.box(g, 0.5, 0.15, 0.76, E - 0.25, 1.6, 3.43, GU.mat('#ffffff', GU.tex.metal('#9ea7ad')));
      GU.cabinet(g, ux, uy, 4.41, ry, { w: 1.2, h: 0.72, d: ud, shelves: 1, mat: cab, label: 'cabinet', contents: c.upper2 || [], solid: false });
      // counter-top stuff along the east wall
      GU.placeItems(g, E - 0.32, 0.9, 1.37, 0.55, 0.6, c.counterA || [], { gap: 0.03 });
      GU.placeItems(g, E - 0.32, 0.9, 4.4, 0.55, 1.1, c.counterB || [], { gap: 0.03 });
      if (c.knifeBlock !== false) GU.knifeBlock(g, E - 0.15, 0.9, 2.85, ry);
      // back-wall run (facing -z), between the bedroom door and the pantry
      const S = 6 - L.T / 2, bz = S - 0.3;
      GU.drawers(g, 10.8, 0, bz, Math.PI, { w: 0.6, h: 0.86, d: 0.6, count: 3, mat: cab, label: 'drawer', contents: c.backDrawers || [] });
      GU.cabinet(g, 11.4, 0, bz, Math.PI, { w: 0.6, h: 0.86, d: 0.6, shelves: 1, mat: cab, label: 'cabinet', contents: c.backCab1 || [] });
      GU.cabinet(g, 12.2, 0, bz, Math.PI, { w: 1.0, h: 0.86, d: 0.6, shelves: 1, mat: cab, label: 'cabinet', contents: c.backCab2 || [] });
      GU.box(g, 2.3, 0.04, 0.62, 11.6, 0.86, S - 0.31, top);
      GU.microwave(g, 12.35, 0.9, S - 0.25, Math.PI, { contents: c.microwave, dirt: this.dirt > 0.5 });
      if (c.coffee !== false) GU.coffeeMaker(g, 11.8, 0.9, S - 0.2, Math.PI, c.coffeeColor);
      GU.toaster(g, 11.3, 0.9, S - 0.22, Math.PI);
      GU.placeItems(g, 10.75, 0.9, S - 0.32, 0.55, 0.5, c.counterC || [], { gap: 0.03 });
      GU.trashCan(g, 9.35, 0.45, { overflow: c.trash, msg: c.trashMsg });
    }

    // Standard bathroom. c: { ledge, tub, under, counter, medicine: [[..] x3], toiletTop, floor, towelColor }
    bathroom(c) {
      const g = this.g, dirty = this.dirt > 0.5;
      const W0 = 5 + L.T / 2, E = 8.5 - L.T / 2, B = 12 - L.T;
      GU.bathtub(g, W0 + 0.8, B - 0.38, Math.PI, { ledge: c.ledge, inside: c.tub, dirty, curtainTex: c.curtain });
      GU.toilet(g, E - 0.32, 9.6, -Math.PI / 2, { dirty, top: c.toiletTop });
      GU.vanity(g, W0 + 0.25, 8.0, Math.PI / 2, { w: 0.8, under: c.under, counter: c.counter, medicine: c.medicine, dirty, mat: c.vanityMat });
      // towel bar + towel
      GU.box(g, 0.6, 0.02, 0.02, 7.75, 1.2, 6 + L.T / 2 + 0.05, M('#c0c0c0'));
      GU.box(g, 0.5, 0.6, 0.03, 7.75, 0.62, 6 + L.T / 2 + 0.06, GU.mat('#ffffff', GU.tex.fabric(c.towelColor || '#4fc3f7')));
      // toilet paper holder
      GU.cyl(g, 0.055, 0.055, 0.11, E - 0.07, 0.65, 9.1, M('#ffffff'), { rx: Math.PI / 2 }).position.set(E - 0.07, 0.7, 9.1);
      // over-toilet shelf
      GU.wallShelf(g, E - 0.13, 1.45, 9.6, -Math.PI / 2, 0.6, c.shelf || []);
      GU.rug(g, 7.0, 10.6, 0.8, 0.5, GU.tex.fabric(c.matColor || '#9ad1ff'));
      GU.scatter(g, [7.6, 8.6, 8.2, 9.0], c.floor || [], this.rng);
    }

    // Floor clutter + stains for messy units. rect = [x1, z1, x2, z2]
    mess(rect, items, stains) {
      GU.scatter(this.g, rect, items, this.rng);
      for (let i = 0; i < (stains || 0); i++) {
        GU.stain(this.g, GU.range(this.rng, rect[0], rect[2]), GU.range(this.rng, rect[1], rect[3]), 0.5 + this.rng() * 0.8);
      }
    }

    // Register this unit for visibility culling + HUD zone name. Call at the end of the apartment file.
    finish() {
      this.root.updateMatrixWorld(true);
      const a = this.root.localToWorld(new THREE.Vector3(0, 0, 0));
      const b = this.root.localToWorld(new THREE.Vector3(L.W, 3, L.D));
      const bounds = new THREE.Box3().setFromPoints([a, b]);
      GU.apartments.push({ content: this.g, shell: this.shell, bounds, door: this.door });
      GU.zones.push({ box: bounds, name: 'Apt ' + this.o.number + ' — ' + this.o.title });
    }
  };
})();
