// Room-level building: floors, ceilings, doors with frames, windows, ceiling lights on real
// circuits, light switches, breaker panels, and the Unit class (one apartment) with its
// kitchen / bathroom / laundry builders. Walls themselves are in walls.js; the floor plan is in layout.js.
(function () {
  const M = (c) => GU.mat(c);

  GU.floor = function (parent, x1, z1, x2, z2, mat, y) {
    const m = GU.box(parent, x2 - x1, 0.05, z2 - z1, (x1 + x2) / 2, (y || 0) - 0.05, (z1 + z2) / 2, mat, { walk: true });
    m.userData.surface = 'floor';
    return m;
  };

  GU.ceiling = function (parent, x1, z1, x2, z2, mat, h) {
    const m = GU.box(parent, x2 - x1, 0.05, z2 - z1, (x1 + x2) / 2, h || 2.7, (z1 + z2) / 2, mat || GU.mat('#ffffff', GU.tex.ceiling()));
    m.userData.surface = 'ceiling';
    return m;
  };

  GU.stain = function (parent, x, z, size, tone) {
    return GU.plane(parent, size, size, x, 0.004, z, GU.mat('#ffffff', GU.tex.stain(tone || '70,55,25'), { transparent: true, depthWrite: false }), { rx: -Math.PI / 2 });
  };

  // ---------- electrical ----------
  // A branch circuit from a breaker panel. Lights/outlets on it only work while it's live.
  GU.Circuit = class {
    constructor(name, amps, panel) {
      this.name = name; this.amps = amps; this.panel = panel;
      this.cut = false; this.breaker = true; this.switchOn = true;
    }
    live() { return !this.cut && this.breaker && !GU.mainOff && !(this.panel && this.panel.mainOff); }
  };

  GU.virtualLights = [];
  // Ceiling light: glowing fixture + "virtual" light. main.js gives the few real PointLights
  // to the closest lit virtual lights each frame.
  GU.ceilingLight = function (lightParent, fixtureParent, x, z, o) {
    o = o || {};
    const H = o.h || 2.7;
    const color = o.color || '#fff1d6';
    const glowMat = GU.glow(color), offMat = M('#bdbdb0');
    const fix = GU.cyl(fixtureParent, 0.22, 0.16, 0.08, x, H - 0.09, z, glowMat, { seg: 10 });
    fix.userData.noMerge = true;
    const handle = {
      parent: lightParent, local: new THREE.Vector3(x, H - 0.35, z), world: new THREE.Vector3(),
      color: new THREE.Color(color), base: o.intensity || 6, distance: o.distance || 9, mult: 1, fix, circuit: o.circuit || null, lit: true,
    };
    handle.isOn = () => (handle.circuit ? handle.circuit.live() && handle.circuit.switchOn : !GU.mainOff);
    handle.refresh = () => {
      const on = handle.isOn() && handle.mult > 0.5;
      if (on !== handle.lit) { handle.lit = on; fix.material = on ? glowMat : offMat; }
    };
    if (o.flicker) {
      let t = 0;
      GU.updaters.push((dt) => {
        t += dt;
        handle.mult = Math.sin(t * 23) + Math.sin(t * 7.3) > 1.5 && Math.random() < 0.6 ? 0.15 : 1;
      });
    }
    // fire sprinkler head + smoke detector next to every light (required in every dwelling room)
    GU.cyl(fixtureParent, 0.012, 0.02, 0.05, x + 0.7, H - 0.05, z, M('#c9ced4'));
    GU.cyl(fixtureParent, 0.06, 0.06, 0.03, x - 0.6, H - 0.03, z + 0.3, M('#f4f4f4'));
    GU.virtualLights.push(handle);
    return handle;
  };

  // Light switch plate on a wall. Gets hidden if the drywall behind it is smashed.
  GU.makeSwitch = function (parent, wall, u, side, circuit) {
    if (!wall.coreW) return null; // concrete block walls: no stud cavity to run wire in
    const dev = wall.addSwitch(u, side, circuit);
    if (!dev) return null;
    const c = dev.cover.box.getCenter(new THREE.Vector3());
    const p = parent.worldToLocal(c.clone());
    const g = GU.group(parent, p.x, p.y, p.z);
    const n = wall.axis === 'x' ? new THREE.Vector3(0, 0, side) : new THREE.Vector3(side, 0, 0);
    g.lookAt(parent.worldToLocal(c.clone().add(n)));
    const tog = GU.box(g, 0.016, 0.03, 0.016, 0, -0.005, 0.008, M('#e8e4d6'));
    tog.userData.noMerge = true;
    GU.interactive(g, () => 'Flip ' + circuit.name + ' light switch', () => {
      circuit.switchOn = !circuit.switchOn;
      tog.position.y = circuit.switchOn ? 0.01 : -0.02;
      GU.sfx && GU.sfx('click');
      if (!circuit.live()) GU.say('Click. Nothing. The ' + circuit.name + ' circuit is dead.');
    });
    if (dev.cell) (dev.cell.attach = dev.cell.attach || []).push(g);
    return g;
  };

  // Breaker panel (load center) for one apartment.
  GU.breakerPanel = function (parent, x, y, z, ry, unit) {
    const g = GU.group(parent, x, y, z, ry);
    GU.box(g, 0.36, 0.55, 0.03, 0, 0, 0, GU.mat('#ffffff', GU.tex.metal('#c9ced4')));
    GU.box(g, 0.3, 0.02, 0.01, 0, 0.45, 0.02, M('#333'));
    for (let i = 0; i < 6; i++) GU.box(g, 0.05, 0.025, 0.012, (i % 2 ? 0.06 : -0.06), 0.12 + Math.floor(i / 2) * 0.09, 0.02, M('#222'));
    GU.interactive(g, () => (unit.mainOff ? 'Flip main breaker ON' : 'Flip main breaker OFF'), () => {
      unit.mainOff = !unit.mainOff;
      GU.sfx && GU.sfx('click');
      const list = unit.circuits.map((c) => c.name + ' ' + c.amps + 'A: ' + (c.cut ? 'CUT WIRE' : c.live() ? 'on' : 'off')).join(' | ');
      GU.say('Main ' + (unit.mainOff ? 'OFF' : 'ON') + '. ' + list, 6);
    }, 'Apt ' + unit.number + ' breaker panel: 100A main, ' + unit.circuits.length + ' branch circuits.');
    return g;
  };

  // ---------- doors ----------
  // Door in a wall opening: frame jambs + casing that cover the cut wall layers, plus the slab.
  // d = { axis, fixed, a, b, top, into (+1/-1 side the door swings into), hinge 'a'|'b', t (wall thickness),
  //       entry, locked, label, number, color }
  GU.doorway = function (parent, d) {
    const t = d.t, top = d.top || 2.1, w = d.b - d.a, mid = (d.a + d.b) / 2;
    const frame = M(d.trim || '#f4f1e6');
    const g = GU.group(parent, d.axis === 'x' ? mid : d.fixed, d.y || 0, d.axis === 'x' ? d.fixed : mid, d.axis === 'x' ? 0 : Math.PI / 2);
    // local: opening spans x in [-w/2, w/2], wall thickness along z
    GU.box(g, 0.02, top, t, -w / 2 + 0.01, 0, 0, frame);
    GU.box(g, 0.02, top, t, w / 2 - 0.01, 0, 0, frame);
    GU.box(g, w, 0.02, t, 0, top - 0.02, 0, frame);
    for (const s of [-1, 1]) {
      GU.box(g, 0.07, top + 0.07, 0.015, -w / 2 - 0.035, 0, s * (t / 2 + 0.007), frame);
      GU.box(g, 0.07, top + 0.07, 0.015, w / 2 + 0.035, 0, s * (t / 2 + 0.007), frame);
      GU.box(g, w + 0.14, 0.07, 0.015, 0, top, s * (t / 2 + 0.007), frame);
    }
    if (d.noSlab) return null;
    const pivot = GU.door(parent, d.axis, d.fixed, d.a + 0.02, d.b - 0.02, {
      swing: d.into, hinge: d.hinge, label: d.label, number: d.number, color: d.color, locked: d.locked,
      lockedPrompt: d.lockedPrompt, height: top - 0.03, y: d.y,
    });
    pivot.userData.breakable = { hp: d.entry ? 8 : 3, mat: 'wood', color: d.color || '#f2efe6', name: d.entry ? 'solid-core entry door' : 'hollow-core door', door: true };
    if (d.tough) pivot.userData.tough = d.tough;
    return pivot;
  };

  // ---------- windows ----------
  // Window in an exterior opening: frame, breakable glass, blinds/curtains, and steel security bars
  // outside (ground floor), so smashing the glass doesn't let you out.
  GU.windowUnit = function (parent, d) {
    const w = d.b - d.a, h = d.top - d.bottom, mid = (d.a + d.b) / 2, t = d.t, out = d.outward;
    const frame = M('#f4f4f0');
    const g = GU.group(parent, d.axis === 'x' ? mid : d.fixed, 0, d.axis === 'x' ? d.fixed : mid, d.axis === 'x' ? 0 : Math.PI / 2);
    // local: outside is toward +z * out (for axis 'z' the rotation maps local z to world x)
    const o = d.axis === 'x' ? out : out;
    GU.plane(g, w + 2, h + 1.6, 0, d.bottom + h / 2, o * (t / 2 + 1.2), GU.glow('#ffffff', GU.tex.sky()), { ry: o > 0 ? Math.PI : 0 });
    // jambs + sill (cover the wall layers)
    GU.box(g, 0.03, h, t, -w / 2 + 0.015, d.bottom, 0, frame);
    GU.box(g, 0.03, h, t, w / 2 - 0.015, d.bottom, 0, frame);
    GU.box(g, w, 0.03, t, 0, d.top - 0.03, 0, frame);
    GU.box(g, w + 0.1, 0.03, t + 0.06, 0, d.bottom - 0.03, -o * 0.03, frame);
    GU.box(g, w, 0.04, 0.05, 0, d.bottom + h / 2, o * 0.02, frame);
    const glass = GU.box(g, w - 0.04, h - 0.04, 0.01, 0, d.bottom + 0.02, o * 0.02, GU.mat('#cfefff', null, { transparent: true, opacity: 0.2, depthWrite: false }), { solid: true });
    glass.userData.noMerge = true;
    const pane = GU.group(g);
    pane.add(glass);
    GU.prop(pane, { hp: 1, mat: 'glass', color: '#cfefff', name: 'window glass' });
    GU.interactive(pane, 'Look outside', () => GU.say(d.view || 'The street outside. A bus goes by.'));
    // security bars outside: always block, can't be broken
    const bars = GU.group(g, 0, 0, o * (t / 2 + 0.04));
    GU.prop(bars, { tough: 'Steel security bars, welded on. The hammer rings off them.' });
    for (let x = -w / 2 + 0.1; x < w / 2; x += 0.13) GU.box(bars, 0.015, h, 0.015, x, d.bottom, 0, M('#222'));
    GU.box(bars, w, 0.03, 0.02, 0, d.bottom + h * 0.5, 0, M('#222'));
    GU.box(bars, w, h, 0.02, 0, d.bottom, 0, M('#000'), { solid: true }).visible = false;
    if (d.blinds !== false) {
      const slat = M(d.blindColor || '#f4f1e6');
      const n = Math.floor((h * (d.blindsDown == null ? 0.3 : d.blindsDown)) / 0.05);
      for (let i = 0; i < n; i++) GU.box(g, w - 0.06, 0.008, 0.05, 0, d.top - 0.05 - i * 0.05, -o * (t / 2 - 0.04), slat, { rx: 0.5 });
    }
    if (d.curtains) {
      const cm = GU.mat('#ffffff', GU.tex.fabric(d.curtains));
      GU.box(g, 0.3, h + 0.4, 0.04, -w / 2 - 0.12, d.bottom - 0.3, -o * (t / 2 + 0.06), cm);
      GU.box(g, 0.3, h + 0.4, 0.04, w / 2 + 0.12, d.bottom - 0.3, -o * (t / 2 + 0.06), cm);
    }
    return g;
  };

  // ---------- the apartment ----------
  GU.Unit = class {
    // o: { number, title, T (template), side, x0, dirt, theme }
    constructor(o) {
      Object.assign(this, o);
      this.rng = GU.makeRng(GU.hash('apt' + o.number));
      const north = o.side !== 'south';
      this.root = GU.group(GU.world, north ? o.x0 : o.x0 + o.T.W, 0, north ? 0.9 : -0.9, north ? 0 : Math.PI);
      this.shell = GU.group(this.root);
      this.g = GU.group(this.root);
      this.lightGroup = GU.group(this.root);
      this.circuits = [];
      this.rooms = {};
    }

    // template-local rect -> world rect
    worldRect(r) {
      const north = this.side !== 'south';
      const W = this.T.W;
      const xs = north ? [this.x0 + r[0], this.x0 + r[2]] : [this.x0 + W - r[2], this.x0 + W - r[0]];
      const zs = north ? [0.9 + r[1], 0.9 + r[3]] : [-0.9 - r[3], -0.9 - r[1]];
      return [xs[0], zs[0], xs[1], zs[1]];
    }

    // ---- kitchen: cabinet runs from the template, filled with this unit's stuff ----
    // c: { fridge, crisper, fridgeDoor, freezer, magnets, drawers: [[..]...], sink, dishes, cabs: [[[..],[..]]...],
    //      pantry: [[..] x5], uppers: [[[..],[..]]...], stoveTop, oven, microwave, counter: [[..]...], coffee, toaster, knives }
    kitchen(c) {
      const g = this.g, dirt = this.dirt;
      const cab = this.theme.cabinet || GU.mat('#ffffff', GU.tex.wood('#c9a27a', dirt * 0.5));
      const top = this.theme.counter || GU.mat('#ffffff', GU.tex.granite('#d8d2c4'));
      const drawers = (c.drawers || []).slice(), cabs = (c.cabs || []).slice(), uppers = (c.uppers || []).slice();
      const counters = [];
      const W = { fridge: 0.84, drawers: 0.6, sink: 0.8, cab: 0.6, stove: 0.76, pantry: 0.78 };
      for (const run of this.T.kitchen) {
        let s = run.from;
        for (const mod of run.mods) {
          const w = W[mod], depth = mod === 'fridge' ? 0.74 : 0.6;
          const along = s + w / 2, across = run.at + depth / 2;
          const x = run.axis === 'z' ? across : along, z = run.axis === 'z' ? along : across;
          const ry = run.axis === 'z' ? Math.PI / 2 : 0;
          const m = GU.group(g, x, 0, z, ry);
          if (mod === 'fridge') {
            GU.fridge(m, 0, 0.0, 0, { shelves: c.fridge, freezer: c.freezer, crisper: c.crisper, door: c.fridgeDoor, magnets: c.magnets, dirt: dirt * 0.5 });
          } else if (mod === 'stove') {
            GU.stove(m, 0, 0.02, 0, { top: c.stoveTop, oven: c.oven, dirt });
            GU.box(m, 0.76, 0.15, 0.5, 0, 1.6, -0.06, GU.mat('#ffffff', GU.tex.metal('#9ea7ad')));
          } else if (mod === 'pantry') {
            GU.cabinet(m, 0, 0, 0, 0, { w: 0.78, h: 2.15, d: 0.6, shelves: 4, mat: cab, label: 'pantry', contents: c.pantry || [] });
          } else {
            if (mod === 'drawers') GU.drawers(m, 0, 0, 0, 0, { w, h: 0.86, d: 0.6, count: 3, mat: cab, label: 'drawer', contents: drawers.splice(0, 3) });
            if (mod === 'cab') GU.cabinet(m, 0, 0, 0, 0, { w, h: 0.86, d: 0.6, shelves: 1, mat: cab, label: 'cabinet', contents: cabs.shift() || [] });
            if (mod === 'sink') {
              GU.cabinet(m, 0, 0, 0, 0, { w, h: 0.86, d: 0.6, shelves: 0, mat: cab, label: 'under-sink cabinet', contents: [c.sink || []] });
              GU.cyl(m, 0.025, 0.025, 0.4, 0.15, 0.3, -0.15, M('#c0c0c0'));
              GU.box(m, w, 0.04, 0.08, 0, 0.86, -0.27, top);
              GU.box(m, w, 0.04, 0.08, 0, 0.86, 0.27, top);
              GU.box(m, 0.05, 0.04, 0.46, -w / 2 + 0.025, 0.86, 0, top);
              GU.box(m, 0.05, 0.04, 0.46, w / 2 - 0.025, 0.86, 0, top);
              GU.sinkBasin(m, 0, 0.9, 0, 0, { dishes: c.dishes, w: 0.7 });
            } else {
              GU.box(m, w, 0.04, 0.62, 0, 0.86, 0.01, top);
              counters.push(m);
            }
            if (run.uppers !== false) GU.cabinet(m, 0, 1.48, -0.13, 0, { w, h: 0.72, d: 0.34, shelves: 1, mat: cab, label: uppers.length === (c.uppers || []).length ? 'spice cabinet' : 'cabinet', contents: uppers.shift() || [], solid: false });
            if (this.theme.backsplash) GU.box(m, w, 0.55, 0.01, 0, 0.9, -0.3, this.theme.backsplash);
          }
          s += w;
        }
      }
      // small appliances on the counters (from the end), then the rest of the counter clutter
      const apps = [];
      if (c.microwave !== false) apps.push((m) => GU.microwave(m, 0, 0.9, 0.0, 0, { contents: c.microwave, dirt: dirt > 0.5 }));
      if (c.coffee !== false) apps.push((m) => GU.coffeeMaker(m, 0.1, 0.9, -0.1, 0, c.coffeeColor));
      if (c.toaster !== false) apps.push((m) => GU.toaster(m, -0.1, 0.9, 0.05, 0));
      if (c.knives !== false) apps.push((m) => GU.knifeBlock(m, 0.18, 0.9, -0.15, 0));
      const slots = counters.slice().reverse();
      slots.forEach((m, i) => {
        if (apps[i]) apps[i](m);
        else GU.placeItems(m, 0, 0.9, 0, 0.52, 0.5, (c.counter || [])[i - apps.length] || [], { gap: 0.03 });
      });
      if (c.trash !== undefined || true) {
        const tp = this.T.trash;
        GU.trashCan(g, tp[0], tp[1], { overflow: c.trash, msg: c.trashMsg });
      }
    }

    bathroom(c, which) {
      const b = this.T.baths[which || 'bath'], g = this.g, dirty = this.dirt > 0.5;
      GU.bathtub(g, b.tub[0], b.tub[1], b.tub[2], { w: 1.5, ledge: c.ledge, inside: c.tub, dirty, curtainTex: c.curtain });
      GU.toilet(g, b.toilet[0], b.toilet[1], b.toilet[2], { dirty, top: c.toiletTop });
      GU.vanity(g, b.vanity[0], b.vanity[1], b.vanity[2], { w: b.vanity[3] || 0.8, under: c.under, counter: c.counter, medicine: c.medicine, dirty, mat: c.vanityMat });
      if (b.mat) GU.rug(g, b.mat[0], b.mat[1], 0.8, 0.5, GU.tex.fabric(c.matColor || '#9ad1ff'), b.mat[2]);
      if (c.floor && b.mat) GU.scatter(g, [b.mat[0] - 0.4, b.mat[1] - 0.3, b.mat[0] + 0.4, b.mat[1] + 0.3], c.floor, this.rng);
    }

    laundry(c) {
      const l = this.T.laundry;
      GU.washerDryer(this.g, l[0], l[1], l[2], { washer: c.washer, dryer: c.dryer });
      GU.wallShelf(this.g, l[0], 1.75, l[1], l[2], 0.7, c.shelf || ['laundry_detergent', 'fabric_softener']);
    }

    closets(list) {
      (this.T.closets || []).forEach((cl, i) => {
        const o = list[i] || {};
        GU.builtinCloset(this.g, cl[0], cl[1], cl[2], cl[3], o);
      });
    }

    mess(rect, items, stains) {
      GU.scatter(this.g, rect, items, this.rng);
      for (let i = 0; i < (stains || 0); i++) GU.stain(this.g, GU.range(this.rng, rect[0], rect[2]), GU.range(this.rng, rect[1], rect[3]), 0.5 + this.rng() * 0.8);
    }
  };
})();
