// Furniture, appliances and anything that opens.
// Convention: every piece is built in its own group at (x, y, z) rotated by ry, with its FRONT facing local +z.
(function () {
  const M = (c) => GU.mat(c);
  const ease = (t) => t * t * (3 - 2 * t);

  // ---------- moving parts ----------
  // Generic animated part. apply(t) sets the pose for t in 0..1 (0 = closed).
  function animated(target, label, apply, opts) {
    const st = { open: false, t: 0 };
    GU.interactive(target, () => (opts.locked ? opts.lockedPrompt || 'Try ' + label : (st.open ? 'Close ' : 'Open ') + label), () => {
      if (opts.locked) { GU.say(opts.locked); return; }
      st.open = !st.open;
      if (opts.onToggle) opts.onToggle(st.open);
    }, opts.info);
    const speed = opts.speed || 3.5;
    GU.updaters.push((dt) => {
      const goal = st.open ? 1 : 0;
      if (st.t === goal) return;
      st.t = goal > st.t ? Math.min(1, st.t + dt * speed) : Math.max(0, st.t - dt * speed);
      apply(ease(st.t));
    });
    return st;
  }

  // Hinged part: rotates `pivot` around axis ('y' for doors, 'x' for oven doors / lids) by `angle` when open.
  GU.hinge = function (parent, x, y, z, angle, label, build, opts) {
    opts = opts || {};
    const pivot = GU.group(parent, x, y, z);
    build(pivot);
    const axis = opts.axis || 'y';
    pivot.userData.state = animated(pivot, label, (t) => { pivot.rotation[axis] = angle * t; }, opts);
    return pivot;
  };

  // Sliding part (drawers): moves along local +z by `dist`.
  GU.slider = function (parent, x, y, z, dist, label, build, opts) {
    opts = opts || {};
    const g = GU.group(parent, x, y, z);
    build(g);
    g.userData.state = animated(g, label, (t) => { g.position.z = z + dist * t; }, Object.assign({ speed: 4 }, opts));
    return g;
  };

  // ---------- room doors ----------
  // Door filling an opening in a wall. axis 'x' = wall runs along x (door spans x from a to b at z = fixed).
  // swing: +1 opens toward +z (or +x), -1 the other way. hinge: 'a' or 'b'.
  GU.door = function (parent, axis, fixed, a, b, o) {
    o = o || {};
    const width = b - a - 0.02, h = o.height || 2.05, th = 0.045;
    const swing = o.swing || 1, hingeA = (o.hinge || 'a') === 'a';
    const doorMat = o.mat || GU.mat('#ffffff', GU.tex.paint(o.color || '#f2efe6'));
    const knobMat = GU.mat('#d4af37', GU.tex.metal('#d4af37'));
    let px, pz, angle;
    if (axis === 'x') {
      px = hingeA ? a + 0.01 : b - 0.01; pz = fixed;
      angle = (hingeA ? -1 : 1) * swing * Math.PI * 0.5;
    } else {
      px = fixed; pz = hingeA ? a + 0.01 : b - 0.01;
      angle = (hingeA ? 1 : -1) * swing * Math.PI * 0.5;
    }
    const dir = hingeA ? 1 : -1;
    let panel;
    const pivot = GU.hinge(parent, px, 0, pz, angle, o.label || 'door', (p) => {
      if (axis === 'x') {
        panel = GU.box(p, width, h, th, dir * width / 2, 0, 0, doorMat, { solid: true });
        GU.box(p, width * 0.7, h * 0.3, th + 0.01, dir * width / 2, 1.3, 0, GU.mat('#000', null, { transparent: true, opacity: 0.06 }));
        for (const s of [-1, 1]) GU.sphere(p, 0.03, dir * (width - 0.08), 1.0, s * 0.05, knobMat);
        if (o.number) GU.box(p, 0.16, 0.08, 0.01, dir * width / 2, 1.6, -swing * 0.03, GU.mat('#ffffff', GU.tex.label('#d4af37', null, o.number, '#3b2412')), { unitUV: true });
      } else {
        panel = GU.box(p, th, h, width, 0, 0, dir * width / 2, doorMat, { solid: true });
        for (const s of [-1, 1]) GU.sphere(p, 0.03, s * 0.05, 1.0, dir * (width - 0.08), knobMat);
        if (o.number) GU.box(p, 0.01, 0.08, 0.16, -swing * 0.03, 1.6, dir * width / 2, GU.mat('#ffffff', GU.tex.label('#d4af37', null, o.number, '#3b2412')), { unitUV: true });
      }
    }, { speed: 2.5, locked: o.locked, lockedPrompt: o.lockedPrompt, onToggle: o.onToggle });
    panel.userData.enabledFn = () => pivot.userData.state.t < 0.15;
    return pivot;
  };

  // ---------- storage ----------
  // Cabinet / cupboard. o: { w, h, d, shelves, doors (0/1/2), hinge ('left'|'right'), label, contents: [[ids per level, bottom first]],
  //                          mat, doorMat, inner, solid, glass, legs }
  GU.cabinet = function (parent, x, y, z, ry, o) {
    const g = GU.group(parent, x, y, z, ry);
    const w = o.w, h = o.h, d = o.d, t = 0.02;
    const mat = o.mat || GU.mat('#ffffff', GU.tex.wood('#c9a27a'));
    const inner = o.inner || GU.mat('#efe8da');
    GU.box(g, w, h, t, 0, 0, -d / 2 + t / 2, inner);
    GU.box(g, t, h, d, -w / 2 + t / 2, 0, 0, mat);
    GU.box(g, t, h, d, w / 2 - t / 2, 0, 0, mat);
    GU.box(g, w, t, d, 0, h - t, 0, mat);
    GU.box(g, w - 2 * t, t, d - t, 0, 0, t / 2, inner);
    const levels = [t];
    const n = o.shelves || 0;
    for (let i = 1; i <= n; i++) {
      const sy = (h / (n + 1)) * i;
      GU.box(g, w - 2 * t, t, d - t - 0.02, 0, sy, t / 2, inner);
      levels.push(sy + t);
    }
    const stuff = GU.group(g);
    (o.contents || []).forEach((list, i) => {
      if (levels[i] != null && list) GU.placeItems(stuff, 0, levels[i], 0.01, w - 2 * t - 0.03, d - 0.08, list, { gap: 0.012 });
    });
    const doors = o.doors == null ? (w > 0.65 ? 2 : 1) : o.doors;
    const dMat = o.doorMat || mat;
    const handle = M(o.handle || '#b0b0b0');
    const label = o.label || 'cabinet';
    const pivots = [];
    const makeDoor = (hx, dw, sign) => {
      pivots.push(GU.hinge(g, hx, 0, d / 2, -sign * Math.PI * 0.52, label, (p) => {
        if (o.glass) {
          GU.box(p, dw, h, 0.02, sign * dw / 2, 0, 0.01, GU.mat('#cfefff', null, { transparent: true, opacity: 0.25 }));
        } else {
          GU.box(p, dw, h, 0.02, sign * dw / 2, 0, 0.01, dMat);
        }
        const hy = o.handleY != null ? o.handleY : (y > 1 ? 0.08 : h - 0.12);
        GU.box(p, 0.015, 0.1, 0.02, sign * (dw - 0.04), hy, 0.03, handle);
      }, { speed: 4 }));
    };
    if (doors === 1) {
      if (o.hinge === 'right') makeDoor(w / 2, w, -1); else makeDoor(-w / 2, w, 1);
    } else if (doors === 2) {
      makeDoor(-w / 2, w / 2, 1);
      makeDoor(w / 2, w / 2, -1);
    }
    if (pivots.length && !o.glass) GU.hideWhenClosed(stuff, pivots);
    if (o.solid !== false) {
      const b = GU.blocker(g, w, h, d, 0, 0, 0);
      b.userData.noRay = true;
    }
    return g;
  };

  // Stack of drawers. contents[i] fills drawer i (top first).
  GU.drawers = function (parent, x, y, z, ry, o) {
    const g = GU.group(parent, x, y, z, ry);
    const w = o.w, h = o.h, d = o.d, n = o.count || 3, t = 0.02;
    const mat = o.mat || GU.mat('#ffffff', GU.tex.wood('#c9a27a'));
    const inner = M('#e8dcc6');
    GU.box(g, w, h, t, 0, 0, -d / 2 + t / 2, mat);
    GU.box(g, t, h, d, -w / 2 + t / 2, 0, 0, mat);
    GU.box(g, t, h, d, w / 2 - t / 2, 0, 0, mat);
    if (o.top !== false) GU.box(g, w, t, d, 0, h - t, 0, mat);
    const dh = h / n;
    for (let i = 0; i < n; i++) {
      const dy = h - dh * (i + 1);
      const list = (o.contents || [])[i] || [];
      let stuff;
      const sl = GU.slider(g, 0, dy, 0, d * 0.72, o.label || 'drawer', (s) => {
        GU.box(s, w - 0.05, 0.015, d - 0.06, 0, 0.02, -0.01, inner);
        GU.box(s, w - 0.05, dh * 0.7, 0.015, 0, 0.02, -d / 2 + 0.03, inner);
        GU.box(s, 0.015, dh * 0.7, d - 0.06, -w / 2 + 0.035, 0.02, -0.01, inner);
        GU.box(s, 0.015, dh * 0.7, d - 0.06, w / 2 - 0.035, 0.02, -0.01, inner);
        GU.box(s, w - 0.01, dh - 0.01, 0.02, 0, 0.005, d / 2 - 0.01, o.frontMat || mat);
        GU.box(s, w * 0.3, 0.02, 0.02, 0, dh * 0.6, d / 2 + 0.01, M(o.handle || '#b0b0b0'));
        stuff = GU.group(s);
        GU.placeItems(stuff, 0, 0.035, -0.01, w - 0.1, d - 0.1, list, { gap: 0.01 });
      });
      GU.hideWhenClosed(stuff, [sl]);
    }
    if (o.solid !== false) GU.blocker(g, w, h, d, 0, 0, 0).userData.noRay = true;
    return g;
  };

  GU.counter = function (parent, x, y, z, w, d, mat) {
    return GU.box(parent, w, 0.04, d, x, y, z, mat || GU.mat('#ffffff', GU.tex.granite('#d8d2c4')));
  };

  // ---------- kitchen appliances ----------
  // Fridge with a top freezer. contents: { shelves: [[...] x3], door: [[...] x3], freezer: [[...]], crisper: [...] }
  GU.fridge = function (parent, x, z, ry, o) {
    o = o || {};
    const g = GU.group(parent, x, 0, z, ry);
    const w = 0.84, h = 1.78, d = 0.72;
    const shell = GU.mat('#ffffff', GU.tex.paint(o.color || '#f4f5f7', o.dirt || 0));
    const inside = GU.glow('#f4fbff');
    const fz = 1.3; // where freezer starts
    GU.box(g, w, h, 0.03, 0, 0, -d / 2, shell);
    GU.box(g, 0.03, h, d, -w / 2, 0, 0, shell);
    GU.box(g, 0.03, h, d, w / 2, 0, 0, shell);
    GU.box(g, w, 0.04, d, 0, h - 0.04, 0, shell);
    GU.box(g, w, 0.08, d, 0, 0, 0, M('#333'));
    GU.box(g, w - 0.06, 0.02, d - 0.04, 0, fz - 0.02, 0, shell);
    GU.box(g, w - 0.06, 0.02, 0.01, 0, 0.1, -d / 2 + 0.02, inside);
    GU.box(g, w - 0.08, fz - 0.15, 0.01, 0, 0.1, -d / 2 + 0.03, inside);
    GU.box(g, w - 0.08, 0.3, 0.01, 0, fz + 0.02, -d / 2 + 0.03, inside);
    const sh = o.shelves || [];
    const levels = [0.36, 0.72, 1.0];
    GU.box(g, w - 0.08, 0.2, d - 0.12, 0, 0.1, 0, GU.mat('#dff3ff', null, { transparent: true, opacity: 0.45 }));
    const food = GU.group(g), frozen = GU.group(g);
    let binStuff;
    GU.placeItems(food, 0, 0.1, 0, w - 0.12, d - 0.16, o.crisper || [], { gap: 0.01 });
    levels.forEach((ly, i) => {
      GU.box(g, w - 0.08, 0.012, d - 0.1, 0, ly - 0.012, -0.02, GU.mat('#e8f6ff', null, { transparent: true, opacity: 0.6 }));
      GU.placeItems(food, 0, ly, -0.02, w - 0.12, d - 0.16, sh[i] || [], { gap: 0.01 });
    });
    GU.box(g, w - 0.08, 0.012, d - 0.1, 0, fz + 0.15, -0.02, M('#e8f6ff'));
    GU.placeItems(frozen, 0, fz, -0.02, w - 0.12, d - 0.16, (o.freezer || [])[0] || [], { gap: 0.01 });
    GU.placeItems(frozen, 0, fz + 0.162, -0.02, w - 0.12, d - 0.16, (o.freezer || [])[1] || [], { gap: 0.01 });
    // main door, hinged on the right
    const fd = GU.hinge(g, w / 2, 0.08, d / 2, Math.PI * 0.55, 'fridge', (p) => {
      binStuff = GU.group(p);
      GU.box(p, w, fz - 0.1, 0.06, -w / 2, 0, 0.03, shell);
      GU.box(p, 0.03, 0.5, 0.04, -w + 0.06, 0.55, 0.08, M('#b8bcc0'));
      (o.magnets || []).forEach((m, i) => GU.box(p, 0.08, 0.1, 0.005, -0.2 - i * 0.12, 0.8 + (i % 2) * 0.15, 0.062, GU.mat('#ffffff', GU.tex.art(m, i))));
      const bins = o.door || [];
      [0.15, 0.5, 0.85].forEach((by, i) => {
        GU.box(p, w - 0.12, 0.07, 0.11, -w / 2, by, -0.06, GU.mat('#e8f6ff', null, { transparent: true, opacity: 0.7 }));
        GU.placeItems(binStuff, -w / 2, by + 0.01, -0.06, w - 0.16, 0.1, bins[i] || [], { gap: 0.005 });
      });
    }, { speed: 3 });
    const zd = GU.hinge(g, w / 2, fz, d / 2, Math.PI * 0.55, 'freezer', (p) => {
      GU.box(p, w, h - fz - 0.02, 0.06, -w / 2, 0, 0.03, shell);
      GU.box(p, 0.03, 0.25, 0.04, -w + 0.06, 0.05, 0.08, M('#b8bcc0'));
    }, { speed: 3 });
    GU.hideWhenClosed(food, [fd]);
    GU.hideWhenClosed(binStuff, [fd]);
    GU.hideWhenClosed(frozen, [zd]);
    GU.blocker(g, w, h, d, 0, 0, 0).userData.noRay = true;
    return g;
  };

  // Stove + oven. pots: items on top, oven: items inside.
  GU.stove = function (parent, x, z, ry, o) {
    o = o || {};
    const g = GU.group(parent, x, 0, z, ry);
    const w = 0.76, h = 0.9, d = 0.64;
    const body = GU.mat('#ffffff', GU.tex.paint(o.color || '#eceff1', o.dirt || 0));
    const dark = M('#1a1a1a');
    GU.box(g, w, h - 0.48, d, 0, 0.48, 0, body);
    GU.box(g, w, 0.08, d, 0, 0, 0, dark);
    GU.box(g, 0.02, 0.4, d, -w / 2 + 0.01, 0.08, 0, body);
    GU.box(g, 0.02, 0.4, d, w / 2 - 0.01, 0.08, 0, body);
    GU.box(g, w - 0.04, 0.4, 0.02, 0, 0.08, -d / 2 + 0.01, M('#222'));
    GU.box(g, w - 0.06, 0.01, d - 0.1, 0, 0.26, 0, GU.mat('#888', GU.tex.metal('#777777')));
    const ovenStuff = GU.group(g);
    GU.placeItems(ovenStuff, 0, 0.27, 0, w - 0.12, d - 0.16, o.oven || [], { gap: 0.01 });
    GU.box(g, w, 0.02, d, 0, h - 0.02, 0, dark);
    for (const [bx, bz] of [[-0.18, -0.13], [0.18, -0.13], [-0.18, 0.15], [0.18, 0.15]]) {
      GU.cyl(g, 0.09, 0.09, 0.012, bx, h, bz, M('#333'), { seg: 10 });
    }
    GU.box(g, w, 0.18, 0.06, 0, h, -d / 2 + 0.03, body);
    for (let i = 0; i < 4; i++) GU.cyl(g, 0.02, 0.02, 0.03, -0.25 + i * 0.17, h + 0.08, -d / 2 + 0.07, M('#222'), { rx: Math.PI / 2 });
    GU.box(g, 0.14, 0.05, 0.01, 0, h + 0.07, -d / 2 + 0.065, GU.glow('#30ff60'));
    const ovenDoor = GU.hinge(g, 0, 0.08, d / 2, Math.PI * 0.48, 'oven', (p) => {
      GU.box(p, w - 0.02, 0.4, 0.04, 0, 0, 0, body);
      GU.box(p, w * 0.6, 0.18, 0.045, 0, 0.12, 0, M('#111'));
      GU.box(p, w * 0.7, 0.025, 0.03, 0, 0.36, 0.04, M('#c0c0c0'));
    }, { axis: 'x', speed: 3 });
    GU.hideWhenClosed(ovenStuff, [ovenDoor]);
    GU.placeItems(g, 0, h + 0.012, 0, w - 0.1, d - 0.14, o.top || [], { gap: 0.06 });
    GU.blocker(g, w, h, d, 0, 0, 0).userData.noRay = true;
    return g;
  };

  // Kitchen sink set into a counter run. Builds the basin + faucet; pair with a sink base cabinet below.
  GU.sinkBasin = function (parent, x, y, z, ry, o) {
    o = o || {};
    const g = GU.group(parent, x, y, z, ry);
    const steel = GU.mat('#ffffff', GU.tex.metal('#b9c1c8'));
    const w = o.w || 0.7, d = 0.46, depth = 0.2;
    GU.box(g, w, 0.01, d, 0, -depth, 0, steel);
    GU.box(g, w, depth, 0.02, 0, -depth, -d / 2, steel);
    GU.box(g, w, depth, 0.02, 0, -depth, d / 2, steel);
    GU.box(g, 0.02, depth, d, -w / 2, -depth, 0, steel);
    GU.box(g, 0.02, depth, d, w / 2, -depth, 0, steel);
    GU.cyl(g, 0.03, 0.03, 0.01, 0, -depth + 0.005, 0, M('#555'));
    GU.cyl(g, 0.02, 0.02, 0.3, 0, 0, -d / 2 - 0.06, steel);
    GU.box(g, 0.03, 0.03, 0.2, 0, 0.27, -d / 2 + 0.04, steel);
    GU.placeItems(g, 0, -depth + 0.01, 0, w - 0.06, d - 0.06, o.dishes || [], { gap: 0.0, jitter: 0.6 });
    return g;
  };

  GU.microwave = function (parent, x, y, z, ry, o) {
    o = o || {};
    const g = GU.group(parent, x, y, z, ry);
    const w = 0.5, h = 0.29, d = 0.38;
    const shell = M(o.color || '#2b2b2b');
    GU.box(g, w, 0.02, d, 0, 0, 0, shell);
    GU.box(g, w, 0.02, d, 0, h - 0.02, 0, shell);
    GU.box(g, 0.02, h, d, -w / 2, 0, 0, shell);
    GU.box(g, 0.14, h, d, w / 2 - 0.07, 0, 0, shell);
    GU.box(g, w, h, 0.02, 0, 0, -d / 2, shell);
    GU.box(g, w - 0.17, h - 0.04, 0.01, -0.07, 0.02, -d / 2 + 0.02, GU.glow(o.dirt ? '#d8c890' : '#fff6d8'));
    GU.cyl(g, 0.12, 0.12, 0.01, -0.07, 0.025, 0, GU.mat('#e8f6ff', null, { transparent: true, opacity: 0.6 }));
    const mwStuff = GU.group(g);
    GU.placeItems(mwStuff, -0.07, 0.035, 0, 0.2, 0.2, o.contents || []);
    GU.box(g, 0.08, 0.03, 0.005, w / 2 - 0.07, h - 0.08, d / 2, GU.glow('#30ff60'));
    const mwDoor = GU.hinge(g, -w / 2, 0.01, d / 2, -Math.PI * 0.55, 'microwave', (p) => {
      GU.box(p, w - 0.14, h - 0.02, 0.02, (w - 0.14) / 2, 0, 0.01, shell);
      GU.box(p, w - 0.24, h - 0.1, 0.022, (w - 0.14) / 2, 0.04, 0.01, M('#111'));
    });
    GU.hideWhenClosed(mwStuff, [mwDoor]);
    return g;
  };

  GU.toaster = function (parent, x, y, z, ry) {
    const g = GU.group(parent, x, y, z, ry);
    GU.box(g, 0.28, 0.18, 0.16, 0, 0, 0, GU.mat('#ffffff', GU.tex.metal('#c9ced4')));
    GU.box(g, 0.2, 0.01, 0.03, 0, 0.18, -0.03, M('#111'));
    GU.box(g, 0.2, 0.01, 0.03, 0, 0.18, 0.03, M('#111'));
    GU.interactive(g, 'Use toaster', () => GU.say('*ding* ...nothing in it. The crumb tray is full though.'));
    return g;
  };

  GU.coffeeMaker = function (parent, x, y, z, ry, color) {
    const g = GU.group(parent, x, y, z, ry);
    const m = M(color || '#1a1a1a');
    GU.box(g, 0.2, 0.04, 0.25, 0, 0, 0, m);
    GU.box(g, 0.2, 0.34, 0.08, 0, 0, -0.085, m);
    GU.box(g, 0.2, 0.08, 0.2, 0, 0.28, -0.02, m);
    GU.cyl(g, 0.07, 0.065, 0.14, 0, 0.04, 0.03, GU.mat('#3b2412', null, { transparent: true, opacity: 0.8 }));
    GU.interactive(g, 'Brew coffee', () => GU.say('The coffee maker gurgles. Smells like Monday.'));
    return g;
  };

  GU.knifeBlock = function (parent, x, y, z, ry) {
    const g = GU.group(parent, x, y, z, ry);
    const b = GU.box(g, 0.12, 0.22, 0.16, 0, 0, 0, GU.mat('#ffffff', GU.tex.wood('#8b5a2b')));
    b.rotation.x = -0.25;
    for (let i = 0; i < 5; i++) GU.box(g, 0.02, 0.07, 0.025, -0.04 + i * 0.02, 0.2, -0.04 + (i % 2) * 0.03, M('#1a1a1a'));
    GU.interactive(g, 'Look at knife block', () => GU.say('Chef\'s, bread, santoku, paring, and one empty slot.'));
    return g;
  };

  // ---------- bathroom ----------
  GU.toilet = function (parent, x, z, ry, o) {
    o = o || {};
    const g = GU.group(parent, x, 0, z, ry);
    const por = M(o.dirty ? '#e6e2c8' : '#fbfbfb');
    GU.cyl(g, 0.13, 0.11, 0.38, 0, 0, 0.05, por);
    GU.cyl(g, 0.2, 0.17, 0.04, 0, 0.36, 0.08, por, { seg: 12 });
    GU.cyl(g, 0.16, 0.16, 0.01, 0, 0.395, 0.08, GU.glow(o.dirty ? '#8a9a5a' : '#b8e4ff'));
    GU.box(g, 0.44, 0.4, 0.18, 0, 0.38, -0.2, por);
    GU.box(g, 0.46, 0.03, 0.2, 0, 0.78, -0.2, por);
    GU.box(g, 0.05, 0.02, 0.02, -0.17, 0.7, -0.1, M('#c0c0c0'));
    GU.hinge(g, 0, 0.41, -0.11, -Math.PI * 0.48, 'toilet lid', (p) => {
      GU.cyl(p, 0.2, 0.2, 0.025, 0, 0, 0.19, por, { seg: 12 });
    }, { axis: 'x' });
    GU.blocker(g, 0.46, 0.8, 0.6, 0, 0, -0.05).userData.noRay = true;
    if (o.top) GU.placeItems(g, 0, 0.8, -0.2, 0.42, 0.16, o.top);
    return g;
  };

  GU.bathtub = function (parent, x, z, ry, o) {
    o = o || {};
    const g = GU.group(parent, x, 0, z, ry);
    const w = o.w || 1.6, d = 0.76, h = 0.55;
    const por = M(o.dirty ? '#ebe6cf' : '#fdfdfd');
    GU.box(g, w, h, 0.08, 0, 0, -d / 2 + 0.04, por, { solid: true });
    GU.box(g, w, h, 0.08, 0, 0, d / 2 - 0.04, por, { solid: true });
    GU.box(g, 0.08, h, d, -w / 2 + 0.04, 0, 0, por, { solid: true });
    GU.box(g, 0.08, h, d, w / 2 - 0.04, 0, 0, por, { solid: true });
    GU.box(g, w - 0.1, 0.05, d - 0.1, 0, 0, 0, por);
    if (o.dirty) GU.plane(g, w * 0.6, d * 0.5, 0, 0.052, 0, GU.mat('#ffffff', GU.tex.stain('90,80,40'), { transparent: true, depthWrite: false }), { rx: -Math.PI / 2 });
    GU.cyl(g, 0.02, 0.02, 0.12, -w / 2 + 0.15, 0.85, -d / 2 + 0.02, M('#c0c0c0'), { rx: Math.PI / 2 });
    GU.cyl(g, 0.012, 0.012, 1.3, -w / 2 + 0.15, 0.6, -d / 2 + 0.02, M('#c0c0c0'));
    GU.cyl(g, 0.05, 0.03, 0.05, -w / 2 + 0.15, 1.85, -d / 2 + 0.1, M('#c0c0c0'));
    const rod = GU.cyl(g, 0.012, 0.012, w, 0, 2.0, d / 2 - 0.05, M('#c0c0c0'));
    rod.rotation.z = Math.PI / 2; rod.position.y = 2.0;
    const curtainMat = GU.mat('#ffffff', o.curtainTex || GU.tex.stripes('#7ad1ff', '#ffffff'), { side: THREE.DoubleSide });
    // angle 0: the curtain doesn't swing, it bunches up toward the far end
    const pivot = GU.hinge(g, w / 2, 0, d / 2 - 0.05, 0, 'shower curtain', (p) => {
      GU.box(p, w * 0.98, 1.45, 0.01, -w / 2, 0.55, 0, curtainMat);
    }, { speed: 3 });
    GU.updaters.push(() => { pivot.scale.x = 1 - pivot.userData.state.t * 0.8; });
    GU.placeItems(g, -w / 2 + 0.5, h, -d / 2 + 0.05, 0.9, 0.08, o.ledge || [], { gap: 0.01 });
    GU.placeItems(g, 0.1, 0.05, 0, w - 0.4, d - 0.2, o.inside || []);
    return g;
  };

  // Bathroom vanity with sink, under-sink cabinet and mirrored medicine cabinet above.
  GU.vanity = function (parent, x, z, ry, o) {
    o = o || {};
    const g = GU.group(parent, x, 0, z, ry);
    const w = o.w || 0.8, d = 0.5;
    GU.cabinet(g, 0, 0, 0, 0, { w, h: 0.82, d, shelves: 0, label: 'under-sink cabinet', mat: o.mat, contents: [o.under || []] });
    GU.box(g, w + 0.04, 0.04, d + 0.02, 0, 0.82, 0.01, GU.mat('#ffffff', GU.tex.granite(o.top || '#f0ece4')));
    GU.cyl(g, 0.17, 0.12, 0.012, 0, 0.865, 0.02, GU.glow(o.dirty ? '#d9d2b0' : '#f4fbff'), { seg: 12 });
    GU.cyl(g, 0.015, 0.015, 0.18, 0, 0.86, -d / 2 + 0.06, M('#c0c0c0'));
    GU.box(g, 0.025, 0.025, 0.12, 0, 1.0, -d / 2 + 0.11, M('#c0c0c0'));
    GU.placeItems(g, -w / 2 + 0.16, 0.86, -0.1, 0.22, 0.25, o.counter || [], { gap: 0.008 });
    // medicine cabinet
    const mw = Math.min(0.6, w), mh = 0.7, md = 0.14;
    const mc = GU.group(g, 0, 1.15, -d / 2 + md / 2);
    const frame = M('#f4f4f4');
    GU.box(mc, mw, 0.02, md, 0, 0, 0, frame);
    GU.box(mc, mw, 0.02, md, 0, mh - 0.02, 0, frame);
    GU.box(mc, 0.02, mh, md, -mw / 2, 0, 0, frame);
    GU.box(mc, 0.02, mh, md, mw / 2, 0, 0, frame);
    GU.box(mc, mw, mh, 0.01, 0, 0, -md / 2, frame);
    const meds = GU.group(mc);
    [0.02, 0.25, 0.48].forEach((sy, i) => {
      if (i) GU.box(mc, mw - 0.04, 0.01, md - 0.02, 0, sy - 0.01, 0, GU.mat('#e8f6ff', null, { transparent: true, opacity: 0.6 }));
      GU.placeItems(meds, 0, sy, 0, mw - 0.06, md - 0.03, (o.medicine || [])[i] || [], { gap: 0.006 });
    });
    const mDoor = GU.hinge(mc, -mw / 2, 0, md / 2, -Math.PI * 0.55, 'medicine cabinet', (p) => {
      GU.box(p, mw, mh, 0.015, mw / 2, 0, 0.008, GU.mat('#ffffff', GU.tex.mirror()));
    });
    GU.hideWhenClosed(meds, [mDoor]);
    return g;
  };

  // ---------- bedroom ----------
  GU.bed = function (parent, x, z, ry, o) {
    o = o || {};
    const g = GU.group(parent, x, 0, z, ry);
    const w = o.w || 1.6, l = o.l || 2.05;
    const frame = o.frame || GU.mat('#ffffff', GU.tex.wood('#7a4b2a'));
    const sheet = o.sheet || GU.mat('#ffffff', GU.tex.fabric('#7fa7d9'));
    GU.box(g, w, 0.3, l, 0, 0, 0, frame, { solid: true });
    GU.box(g, w - 0.05, 0.22, l - 0.06, 0, 0.3, 0.01, M('#f4f1ea'), { solid: true });
    GU.box(g, w + 0.06, o.headH || 1.1, 0.07, 0, 0, -l / 2 - 0.035, frame, { solid: true });
    const pill = M(o.pillow || '#ffffff');
    if (w > 1.2) {
      GU.box(g, w * 0.4, 0.13, 0.4, -w * 0.23, 0.52, -l / 2 + 0.25, pill, { rx: 0.25 });
      GU.box(g, w * 0.4, 0.13, 0.4, w * 0.23, 0.52, -l / 2 + 0.25, pill, { rx: 0.25 });
    } else {
      GU.box(g, w * 0.7, 0.13, 0.38, 0, 0.52, -l / 2 + 0.25, pill, { rx: 0.25 });
    }
    if (o.made === false) {
      GU.sphere(g, 0.5, w * 0.1, 0.62, 0.15, sheet, { sx: w * 0.9, sy: 0.18, sz: 1.3, seg: 7 });
    } else {
      GU.box(g, w + 0.04, 0.06, l * 0.72, 0, 0.5, l * 0.14, sheet);
      GU.box(g, w + 0.04, 0.32, 0.03, 0, 0.24, l / 2 + 0.01, sheet);
    }
    if (o.rail) GU.box(g, 0.05, 0.25, l * 0.6, w / 2 + 0.03, 0.5, -0.1, frame);
    return g;
  };

  GU.nightstand = function (parent, x, z, ry, o) {
    o = o || {};
    const g = GU.group(parent, x, 0, z, ry);
    const mat = o.mat || GU.mat('#ffffff', GU.tex.wood('#7a4b2a'));
    GU.drawers(g, 0, 0, 0, 0, { w: 0.48, h: 0.58, d: 0.4, count: 2, mat, label: 'nightstand drawer', contents: o.drawers || [] });
    GU.placeItems(g, 0, 0.58, 0, 0.42, 0.34, o.top || [], { gap: 0.02 });
    if (o.lamp !== false) GU.lamp(g, -0.12, 0.58, -0.08, o.lampColor);
    return g;
  };

  GU.dresser = function (parent, x, z, ry, o) {
    o = o || {};
    const g = GU.group(parent, x, 0, z, ry);
    const w = o.w || 1.2, mat = o.mat || GU.mat('#ffffff', GU.tex.wood('#7a4b2a'));
    if (w > 1) {
      GU.drawers(g, -w / 4, 0, 0, 0, { w: w / 2, h: 0.95, d: 0.5, count: 4, mat, label: 'dresser drawer', contents: (o.drawers || []).slice(0, 4) });
      GU.drawers(g, w / 4, 0, 0, 0, { w: w / 2, h: 0.95, d: 0.5, count: 4, mat, label: 'dresser drawer', contents: (o.drawers || []).slice(4, 8) });
    } else {
      GU.drawers(g, 0, 0, 0, 0, { w, h: 0.95, d: 0.5, count: 4, mat, label: 'dresser drawer', contents: o.drawers || [] });
    }
    GU.placeItems(g, 0, 0.95, 0.02, w - 0.1, 0.4, o.top || [], { gap: 0.04 });
    if (o.mirror) GU.box(g, w * 0.7, 0.8, 0.03, 0, 1.0, -0.23, GU.mat('#ffffff', GU.tex.mirror()));
    return g;
  };

  // Freestanding wardrobe with hanging clothes, a shelf and stuff on the floor.
  GU.wardrobe = function (parent, x, z, ry, o) {
    o = o || {};
    const w = o.w || 1.1, h = 2.0, d = 0.6;
    const g = GU.cabinet(parent, x, 0, z, ry, { w, h, d, shelves: 1, label: 'closet', mat: o.mat, contents: [o.floor || [], o.shelf || []] });
    // the 1 shelf sits at h/2; move it up by rebuilding: hang clothes from a rod below it
    GU.cyl(g, 0.012, 0.012, w - 0.06, 0, h / 2 - 0.08, 0, M('#c0c0c0'), { rz: Math.PI / 2 }).position.y = h / 2 - 0.08;
    const colors = o.clothes || ['#3a86ff', '#ff4d6d', '#f4f4f4', '#222222', '#06d6a0'];
    const n = Math.floor((w - 0.1) / 0.07);
    for (let i = 0; i < n; i++) {
      const c = colors[i % colors.length];
      GU.box(g, 0.03, 0.62 - (i % 3) * 0.08, 0.42, -w / 2 + 0.08 + i * 0.07, h / 2 - 0.72 + (i % 3) * 0.08, 0, GU.mat('#ffffff', GU.tex.fabric(c)));
    }
    return g;
  };

  GU.lamp = function (parent, x, y, z, color) {
    const g = GU.group(parent, x, y, z);
    GU.cyl(g, 0.07, 0.08, 0.03, 0, 0, 0, M('#3b3b3b'));
    GU.cyl(g, 0.012, 0.012, 0.3, 0, 0.03, 0, M('#c0a060'));
    GU.cyl(g, 0.08, 0.13, 0.17, 0, 0.27, 0, GU.glow(color || '#fff1c4'), { open: true });
    return g;
  };

  GU.floorLamp = function (parent, x, z, color) {
    const g = GU.group(parent, x, 0, z);
    GU.cyl(g, 0.15, 0.16, 0.03, 0, 0, 0, M('#2b2b2b'));
    GU.cyl(g, 0.015, 0.015, 1.5, 0, 0.03, 0, M('#2b2b2b'));
    GU.cyl(g, 0.16, 0.24, 0.26, 0, 1.45, 0, GU.glow(color || '#fff1c4'), { open: true });
    GU.blocker(g, 0.3, 1.7, 0.3, 0, 0, 0).userData.noRay = true;
    return g;
  };

  GU.desk = function (parent, x, z, ry, o) {
    o = o || {};
    const g = GU.group(parent, x, 0, z, ry);
    const w = o.w || 1.2, d = 0.6, mat = o.mat || GU.mat('#ffffff', GU.tex.wood('#a8835a'));
    GU.box(g, w, 0.04, d, 0, 0.72, 0, mat, { solid: true });
    for (const sx of [-1, 1]) GU.box(g, 0.04, 0.72, d - 0.04, sx * (w / 2 - 0.02), 0, 0, mat, { solid: true });
    GU.drawers(g, w / 2 - 0.25, 0.47, 0, 0, { w: 0.42, h: 0.24, d: d - 0.06, count: 1, mat, label: 'desk drawer', contents: [o.drawer || []], top: false, solid: false });
    GU.placeItems(g, 0, 0.76, 0, w - 0.1, d - 0.1, o.top || [], { gap: 0.04 });
    if (o.chair !== false) GU.chair(g, 0, 0.6, Math.PI, { color: o.chairColor || '#222' });
    return g;
  };

  GU.chair = function (parent, x, z, ry, o) {
    o = o || {};
    const g = GU.group(parent, x, 0, z, ry);
    const mat = o.mat || M(o.color || '#7a4b2a');
    const s = o.small ? 0.65 : 1;
    GU.box(g, 0.44 * s, 0.04, 0.44 * s, 0, 0.44 * s, 0, mat);
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) GU.box(g, 0.035, 0.44 * s, 0.035, sx * 0.19 * s, 0, sz * 0.19 * s, mat);
    GU.box(g, 0.44 * s, 0.45 * s, 0.035, 0, 0.48 * s, -0.2 * s, mat);
    GU.blocker(g, 0.44 * s, 0.9 * s, 0.44 * s, 0, 0, 0).userData.noRay = true;
    return g;
  };

  GU.table = function (parent, x, z, ry, o) {
    o = o || {};
    const g = GU.group(parent, x, 0, z, ry);
    const w = o.w || 1.4, d = o.d || 0.85, h = o.h || 0.75;
    const mat = o.mat || GU.mat('#ffffff', GU.tex.wood('#9c6b3f'));
    GU.box(g, w, 0.04, d, 0, h - 0.04, 0, mat, { solid: true });
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) GU.box(g, 0.05, h - 0.04, 0.05, sx * (w / 2 - 0.06), 0, sz * (d / 2 - 0.06), mat, { solid: true });
    if (o.cloth) GU.box(g, w + 0.06, 0.005, d + 0.06, 0, h, 0, GU.mat('#ffffff', o.cloth));
    GU.placeItems(g, 0, h + 0.006, 0, w - 0.1, d - 0.1, o.top || [], { gap: o.gap || 0.05, jitter: o.jitter });
    (o.chairs || []).forEach(([cx, cz, cr]) => GU.chair(g, cx, cz, cr, { mat: o.chairMat || mat, small: o.small }));
    return g;
  };

  GU.bookshelf = function (parent, x, z, ry, o) {
    o = o || {};
    const w = o.w || 0.9, h = o.h || 1.8, d = 0.32, shelves = o.shelves || 4;
    const g = GU.cabinet(parent, x, 0, z, ry, { w, h, d, shelves, doors: 0, mat: o.mat, inner: o.mat, contents: o.contents || [] });
    const levelH = h / (shelves + 1);
    for (let i = 0; i <= shelves; i++) {
      const fill = o.books == null ? 0.7 : o.books;
      if (o.contents && o.contents[i] && o.contents[i].length) continue;
      const bw = (w - 0.06) * fill;
      GU.box(g, bw, levelH * 0.75, d * 0.75, -w / 2 + 0.03 + bw / 2, (i === 0 ? 0.02 : levelH * i + 0.02), 0, GU.mat('#ffffff', GU.tex.books(GU.hash(o.seed + ':' + i) % 50)), { unitUV: true });
    }
    return g;
  };

  GU.sofa = function (parent, x, z, ry, o) {
    o = o || {};
    const g = GU.group(parent, x, 0, z, ry);
    const w = o.w || 2.1, d = 0.9;
    const fab = GU.mat('#ffffff', GU.tex.fabric(o.color || '#3f6e8c'));
    GU.box(g, w, 0.42, d, 0, 0, 0, fab, { solid: true });
    GU.box(g, w, 0.45, 0.22, 0, 0.42, -d / 2 + 0.11, fab, { solid: true });
    GU.box(g, 0.2, 0.25, d, -w / 2 + 0.1, 0.42, 0, fab);
    GU.box(g, 0.2, 0.25, d, w / 2 - 0.1, 0.42, 0, fab);
    const cw = (w - 0.4) / (o.cushions || 3);
    for (let i = 0; i < (o.cushions || 3); i++) GU.box(g, cw - 0.02, 0.1, d - 0.26, -w / 2 + 0.2 + cw * (i + 0.5), 0.42, 0.1, fab);
    (o.pillows || []).forEach((c, i) => GU.box(g, 0.38, 0.38, 0.12, (i % 2 ? 1 : -1) * (w / 2 - 0.42), 0.52, -d / 2 + 0.3, M(c), { rz: 0.2, rx: -0.2 }));
    if (o.blanket) GU.box(g, 0.5, 0.06, d - 0.2, w / 2 - 0.5, 0.52, 0.05, GU.mat('#ffffff', o.blanket), { ry: 0.3 });
    if (o.items) GU.placeItems(g, 0, 0.52, 0.12, w - 0.5, 0.4, o.items, { gap: 0.2, jitter: 1 });
    return g;
  };

  GU.armchair = function (parent, x, z, ry, color) {
    return GU.sofa(parent, x, z, ry, { w: 1.0, color, cushions: 1 });
  };

  GU.tv = function (parent, x, y, z, ry, o) {
    o = o || {};
    const g = GU.group(parent, x, y, z, ry);
    const w = o.w || 1.2, h = w * 0.58;
    GU.box(g, w, h, 0.05, 0, 0.06, 0, M('#111'));
    GU.box(g, 0.25, 0.02, 0.18, 0, 0, 0, M('#111'));
    GU.box(g, 0.05, 0.06, 0.03, 0, 0.0, 0, M('#111'));
    const screen = GU.box(g, w - 0.04, h - 0.04, 0.005, 0, 0.08, 0.026, GU.mat('#ffffff', GU.tex.screen(false)));
    screen.userData.noMerge = true;
    let on = !!o.on;
    const set = () => { screen.material = on ? GU.glow('#ffffff', GU.tex.screen(true)) : GU.mat('#ffffff', GU.tex.screen(false)); };
    set();
    GU.interactive(g, () => (on ? 'Turn off TV' : 'Turn on TV'), () => { on = !on; set(); if (on && o.show) GU.say(o.show); });
    return g;
  };

  GU.tvStand = function (parent, x, z, ry, o) {
    o = o || {};
    const g = GU.group(parent, x, 0, z, ry);
    const w = o.w || 1.6;
    GU.cabinet(g, 0, 0, 0, 0, { w, h: 0.5, d: 0.42, shelves: 0, doors: 2, label: 'TV stand', mat: o.mat, contents: [o.inside || []] });
    GU.tv(g, 0, 0.5, -0.05, 0, { w: o.tvW || 1.2, show: o.show, on: o.on });
    if (o.console) {
      GU.box(g, 0.3, 0.07, 0.25, w / 2 - 0.25, 0.5, 0, M('#f4f4f4'));
      GU.box(g, 0.05, 0.005, 0.01, w / 2 - 0.15, 0.53, 0.126, GU.glow('#3a86ff'));
    }
    GU.placeItems(g, -w / 2 + 0.25, 0.5, 0.05, 0.4, 0.3, o.top || [], { gap: 0.03 });
    return g;
  };

  GU.rug = function (parent, x, z, w, d, tex, ry) {
    return GU.box(parent, w, 0.012, d, x, 0.001, z, GU.mat('#ffffff', tex), { unitUV: true, ry });
  };

  GU.art = function (parent, x, y, z, ry, w, h, style, seed, frame) {
    const g = GU.group(parent, x, y, z, ry);
    GU.box(g, w + 0.06, h + 0.06, 0.03, 0, -h / 2 - 0.03, 0, M(frame || '#2b1d12'));
    GU.box(g, w, h, 0.005, 0, -h / 2, 0.016, GU.mat('#ffffff', GU.tex.art(style, seed)), { unitUV: true });
    return g;
  };

  GU.plant = function (parent, x, z, o) {
    o = o || {};
    const g = GU.group(parent, x, 0, z);
    const s = o.s || 1;
    GU.cyl(g, 0.17 * s, 0.13 * s, 0.32 * s, 0, 0, 0, M(o.pot || '#c1440e'));
    const leaf = M(o.dead ? '#8a7a3a' : '#3fa34d');
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      const l = GU.cyl(g, 0.0, 0.07 * s, 0.6 * s, Math.cos(a) * 0.08 * s, 0.25 * s, Math.sin(a) * 0.08 * s, leaf, { seg: 4 });
      l.rotation.set(Math.sin(a) * 0.5, 0, -Math.cos(a) * 0.5);
    }
    GU.blocker(g, 0.36 * s, 0.9 * s, 0.36 * s, 0, 0, 0).userData.noRay = true;
    GU.interactive(g, 'Water plant', () => GU.say(o.dead ? 'Too late for this one.' : 'The plant looks grateful.'));
    return g;
  };

  GU.trashCan = function (parent, x, z, o) {
    o = o || {};
    const g = GU.group(parent, x, 0, z);
    GU.cyl(g, 0.17, 0.15, 0.55, 0, 0, 0, M(o.color || '#9ea7ad'));
    GU.placeItems(g, 0, 0.55, 0, 0.3, 0.3, o.overflow || [], { gap: 0, jitter: 2 });
    GU.interactive(g, 'Look in trash', () => GU.say(o.msg || 'Coffee grounds, eggshells, a receipt.'));
    return g;
  };

  GU.laundryBasket = function (parent, x, z, color) {
    const g = GU.group(parent, x, 0, z);
    GU.cyl(g, 0.24, 0.2, 0.5, 0, 0, 0, M('#f4f4f4'), { open: true, seg: 8 });
    GU.sphere(g, 0.22, 0, 0.45, 0, GU.mat('#ffffff', GU.tex.fabric(color || '#5c6b7a')), { sy: 0.5 });
    GU.interactive(g, 'Dig through laundry', () => GU.say('Mostly socks. None of them match.'));
    return g;
  };

  GU.wallShelf = function (parent, x, y, z, ry, w, items) {
    const g = GU.group(parent, x, y, z, ry);
    GU.box(g, w, 0.025, 0.22, 0, 0, 0, GU.mat('#ffffff', GU.tex.wood('#c9a27a')));
    GU.placeItems(g, 0, 0.025, 0, w - 0.04, 0.18, items || [], { gap: 0.02 });
    return g;
  };

  GU.toyChest = function (parent, x, z, ry, contents) {
    const g = GU.group(parent, x, 0, z, ry);
    const w = 0.8, d = 0.45, h = 0.45;
    const mat = GU.mat('#ffffff', GU.tex.paint('#5ab4ff'));
    GU.box(g, w, 0.02, d, 0, 0, 0, mat);
    GU.box(g, w, h, 0.02, 0, 0, -d / 2, mat);
    GU.box(g, w, h, 0.02, 0, 0, d / 2, mat);
    GU.box(g, 0.02, h, d, -w / 2, 0, 0, mat);
    GU.box(g, 0.02, h, d, w / 2, 0, 0, mat);
    GU.placeItems(g, 0, 0.02, 0, w - 0.06, d - 0.06, contents || [], { gap: 0.0 });
    GU.hinge(g, 0, h, -d / 2, -Math.PI * 0.6, 'toy chest', (p) => {
      GU.box(p, w + 0.02, 0.03, d + 0.02, 0, 0, d / 2, GU.mat('#ffffff', GU.tex.paint('#ffd60a')));
    }, { axis: 'x' });
    GU.blocker(g, w, h, d, 0, 0, 0).userData.noRay = true;
    return g;
  };

  // ---------- gym ----------
  GU.weightBench = function (parent, x, z, ry) {
    const g = GU.group(parent, x, 0, z, ry);
    const pad = GU.mat('#ffffff', GU.tex.fabric('#1a1a1a'));
    const steel = GU.mat('#ffffff', GU.tex.metal('#555b60'));
    GU.box(g, 0.3, 0.08, 1.2, 0, 0.42, 0, pad, { solid: true });
    GU.box(g, 0.06, 0.42, 1.0, 0, 0, 0, steel, { solid: true });
    GU.box(g, 0.5, 0.05, 0.06, 0, 0, -0.5, steel);
    GU.box(g, 0.5, 0.05, 0.06, 0, 0, 0.5, steel);
    GU.interactive(g, 'Do a set', () => GU.say('You knock out 10 reps. Derek would be proud.'));
    return g;
  };

  GU.squatRack = function (parent, x, z, ry) {
    const g = GU.group(parent, x, 0, z, ry);
    const steel = GU.mat('#ffffff', GU.tex.metal('#2b2b2b'));
    for (const sx of [-0.6, 0.6]) for (const sz of [-0.3, 0.3]) GU.box(g, 0.06, 2.2, 0.06, sx, 0, sz, steel, { solid: true });
    for (const sx of [-0.6, 0.6]) GU.box(g, 0.06, 0.06, 0.66, sx, 2.15, 0, steel);
    GU.box(g, 1.26, 0.06, 0.06, 0, 2.15, -0.3, steel);
    GU.box(g, 1.26, 0.06, 0.06, 0, 2.15, 0.3, steel);
    for (const sx of [-0.6, 0.6]) GU.box(g, 0.04, 0.04, 0.12, sx, 1.35, 0.3, steel);
    const bar = GU.cyl(g, 0.016, 0.016, 2.1, 0, 1.4, 0.32, GU.mat('#ffffff', GU.tex.metal('#c9ced4')), { rz: Math.PI / 2 });
    bar.position.y = 1.4;
    for (const sx of [-0.85, 0.85]) {
      const p = GU.cyl(g, 0.225, 0.225, 0.05, sx, 1.4, 0.32, M('#1a1a1a'), { rz: Math.PI / 2, seg: 14 });
      p.position.y = 1.4;
    }
    GU.interactive(g, 'Unrack the bar', () => GU.say('225 lbs on the bar. You decide not to.'));
    return g;
  };

  GU.dumbbellRack = function (parent, x, z, ry, items) {
    const g = GU.group(parent, x, 0, z, ry);
    const steel = GU.mat('#ffffff', GU.tex.metal('#2b2b2b'));
    for (const sx of [-0.6, 0.6]) GU.box(g, 0.05, 0.75, 0.4, sx, 0, 0, steel, { solid: true });
    GU.box(g, 1.25, 0.04, 0.3, 0, 0.4, 0.02, steel);
    GU.box(g, 1.25, 0.04, 0.3, 0, 0.72, -0.05, steel);
    GU.placeItems(g, 0, 0.44, 0.02, 1.15, 0.26, items[0] || [], { gap: 0.02 });
    GU.placeItems(g, 0, 0.76, -0.05, 1.15, 0.26, items[1] || [], { gap: 0.02 });
    return g;
  };

  // ---------- misc ----------
  GU.cat = function (parent, x, y, z, ry, o) {
    o = o || {};
    const g = GU.group(parent, x, y, z, ry);
    const fur = M(o.color || '#e08b3a');
    GU.sphere(g, 0.14, 0, 0.12, 0, fur, { sx: 1.5, sy: 0.85 });
    GU.sphere(g, 0.09, 0.2, 0.22, 0, fur);
    GU.box(g, 0.03, 0.05, 0.03, 0.2, 0.29, -0.04, fur);
    GU.box(g, 0.03, 0.05, 0.03, 0.2, 0.29, 0.04, fur);
    GU.sphere(g, 0.014, 0.28, 0.24, -0.03, M('#2e7d32'));
    GU.sphere(g, 0.014, 0.28, 0.24, 0.03, M('#2e7d32'));
    const tail = GU.cyl(g, 0.02, 0.025, 0.3, -0.25, 0.05, 0.05, fur, { rz: 1.2 });
    tail.position.y = 0.1;
    tail.userData.noMerge = true;
    let t = 0;
    GU.updaters.push((dt) => { t += dt; tail.rotation.x = Math.sin(t * 2) * 0.4; });
    const lines = o.lines || ['Purrrr.', 'Mrrp?', 'The cat headbutts your hand.', 'The cat stares at the food bowl, then at you.'];
    let i = 0;
    GU.interactive(g, 'Pet ' + (o.name || 'cat'), () => GU.say(lines[i++ % lines.length]));
    return g;
  };

  GU.coatHooks = function (parent, x, y, z, ry, colors) {
    const g = GU.group(parent, x, y, z, ry);
    GU.box(g, 0.8, 0.08, 0.03, 0, 0, 0, GU.mat('#ffffff', GU.tex.wood('#8b5a2b')));
    (colors || []).forEach((c, i) => GU.box(g, 0.28, 0.75, 0.1, -0.25 + i * 0.25, -0.7, 0.07, GU.mat('#ffffff', GU.tex.fabric(c))));
    return g;
  };

  GU.radiator = function (parent, x, z, ry, w) {
    const g = GU.group(parent, x, 0.12, z, ry);
    const m = GU.mat('#ffffff', GU.tex.metal('#e8e8e2'));
    const n = Math.floor((w || 0.8) / 0.06);
    for (let i = 0; i < n; i++) GU.box(g, 0.04, 0.55, 0.1, -w / 2 + i * 0.06 + 0.03, 0, 0, m);
    return g;
  };

  GU.wallClock = function (parent, x, y, z, ry) {
    const g = GU.group(parent, x, y, z, ry);
    GU.cyl(g, 0.15, 0.15, 0.03, 0, 0, 0, M('#222'), { rx: Math.PI / 2, seg: 14 }).position.set(0, 0, 0);
    GU.cyl(g, 0.13, 0.13, 0.01, 0, 0, 0.012, M('#fffdf5'), { rx: Math.PI / 2, seg: 14 }).position.set(0, 0, 0.02);
    const hand = GU.box(g, 0.008, 0.1, 0.004, 0, 0, 0.03, M('#111'));
    hand.position.set(0, 0.04, 0.03);
    GU.interactive(g, 'Check the time', () => { const d = new Date(); GU.say('It\'s ' + d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) + '.'); });
    return g;
  };
})();
