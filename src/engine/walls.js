// Realistic, destructible walls.
//
// Every wall is built the way a real wood-frame apartment wall is built, layer by layer:
//   drywall (gypsum board) | 2x4 or 2x6 studs @ 16" on center + insulation + wiring + pipes | drywall
// Exterior walls swap the outer drywall for OSB sheathing, an air gap and brick veneer.
// Stair/elevator shafts are concrete block (CMU).
//
// Each piece (a drywall panel, a stud segment, an insulation batt, a wire...) is an "element"
// with hit points. The sledgehammer damages whatever element is nearest along its swing.
// Elements are drawn as one merged mesh per material per chunk, rebuilt when something breaks.
//
// Wall-local coordinates: u = along the wall (0..length), v = height, w = through the wall
// (negative side .. positive side). axis 'x' walls run along world x at z = fixed;
// axis 'z' walls run along world z at x = fixed.
(function () {
  const STUD = 0.038;              // a 2x stud is 1.5" thick
  const D4 = 0.089, D6 = 0.14;     // 2x4 / 2x6 depth
  const G12 = 0.0127;              // 1/2" drywall
  const G16x2 = 0.032;             // two layers of 5/8" Type X drywall
  const OC = 0.406;                // 16" on center
  const ROWS = [0, 0.7, 1.4, 2.1]; // how drywall/studs split into breakable pieces

  // Real assemblies used in mid-rise wood-frame apartments.
  const TYPES = (GU.WALL_TYPES = {
    partition: { name: 'interior partition: 2x4 studs @ 16" o.c., 1/2" drywall', rows: [{ d: D4 }], side: { d: G12, hp: 1 }, studHp: 3, header: 0.09 },
    wet: { name: 'plumbing wall: 2x6 studs, 1/2" moisture-resistant drywall', rows: [{ d: D6 }], side: { d: G12, hp: 1 }, studHp: 3, pipes: true, header: 0.09 },
    corridor: { name: '1-hour rated corridor wall: 2x6 studs, insulation, 2 layers 5/8" Type X', rows: [{ d: D6 }], side: { d: G16x2, hp: 2 }, insul: true, studHp: 4, header: 0.24 },
    demising: { name: 'unit separation wall: double 2x4 stud rows, insulation, 2 layers 5/8" Type X each side', rows: [{ d: D4 }, { d: D4, off: OC / 2 }], gap: 0.025, side: { d: G16x2, hp: 2 }, insul: true, studHp: 3, header: 0.24 },
    exterior: { name: 'exterior wall: 1/2" drywall, 2x6 studs, insulation, OSB sheathing, air gap, brick veneer', rows: [{ d: D6 }], side: { d: G12, hp: 1 }, outside: true, insul: true, studHp: 4, header: 0.24 },
    cmu: { name: '8" concrete block shaft wall', solid: 0.2 },
  });

  GU.wallThickness = function (type) {
    const t = TYPES[type];
    if (t.solid) return t.solid;
    let core = t.rows.reduce((s, r) => s + r.d, 0) + (t.gap || 0) * (t.rows.length - 1);
    if (t.outside) return t.side.d + core + 0.011 + 0.025 + 0.09;
    return core + t.side.d * 2;
  };

  const M = {};
  function mats() {
    if (M.gyp) return M;
    M.gyp = GU.mat('#ffffff', GU.tex.gypsum());
    M.paper = GU.mat('#d6ccb8');
    M.stud = GU.mat('#ffffff', GU.tex.lumber('#dcbf8a'));
    M.plate = GU.mat('#ffffff', GU.tex.lumber('#c9a56e'));
    M.header = GU.mat('#ffffff', GU.tex.lumber('#b8925a'));
    M.insul = GU.mat('#ffffff', GU.tex.insulation());
    M.osb = GU.mat('#ffffff', GU.tex.osb());
    M.brick = GU.mat('#ffffff', GU.tex.brick('#a8472f'));
    M.wireY = GU.mat('#ffd23f');
    M.wireW = GU.mat('#f2f2ee');
    M.ebox = GU.mat('#2f6fd6');
    M.outlet = GU.mat('#ffffff', GU.tex.outlet());
    M.plateCover = GU.mat('#ffffff', GU.tex.wallplate());
    M.pexR = GU.mat('#d62828');
    M.pexB = GU.mat('#2f6fd6');
    M.pvc = GU.mat('#f4f4f0');
    return M;
  }

  // What you learn the first time you hit each kind of thing.
  const LEARN = {
    gyp: 'Drywall (gypsum board) crumbles into chalky chunks.',
    gyp2: 'Two layers of 5/8" Type X fire-rated drywall. Takes a couple of hits.',
    stud: 'A wood stud. Studs are 16" apart and carry the wall. Keep swinging.',
    insul: 'Itchy pink fiberglass insulation. It tears right out.',
    wire: '*ZZZT* You cut a live wire.',
    ebox: 'You smash a plastic electrical box.',
    pipe: 'You crack a water line. Water sprays everywhere!',
    pvc: 'You crack the drain pipe. It smells horrible.',
    osb: 'OSB sheathing: pressed wood chips glued into a sheet.',
    brick: 'Brick veneer. The hammer just bounces off. You\'d need a jackhammer.',
    cmu: 'Solid concrete block. The hammer barely chips the paint.',
    header: 'That\'s a header, the beam holding up the wall over the opening. It won\'t budge.',
    plate: 'The bottom plate is nailed to the concrete slab.',
  };
  const learned = new Set();

  GU.walls = [];
  GU.wallChunks = new Map();
  GU.circuits = {};

  GU.Wall = class {
    constructor(spec) {
      Object.assign(this, spec); // axis, fixed, a, b, h, type, neg, pos, chunk
      this.openings = [];
      this.els = [];
      this.L = this.b - this.a;
      this.t = GU.wallThickness(this.type);
      this.anyBroken = false;
      this.switches = [];
      GU.walls.push(this);
    }

    // world position of wall-local point
    toWorld(u, v, w, out) {
      out = out || new THREE.Vector3();
      return this.axis === 'x' ? out.set(this.a + u, v, this.fixed + w) : out.set(this.fixed + w, v, this.a + u);
    }

    toLocal(p) {
      return this.axis === 'x' ? { u: p.x - this.a, v: p.y, w: p.z - this.fixed } : { u: p.z - this.a, v: p.y, w: p.x - this.fixed };
    }

    worldBox(u0, u1, v0, v1, w0, w1) {
      const b = new THREE.Box3();
      if (this.axis === 'x') { b.min.set(this.a + u0, v0, this.fixed + w0); b.max.set(this.a + u1, v1, this.fixed + w1); }
      else { b.min.set(this.fixed + w0, v0, this.a + u0); b.max.set(this.fixed + w1, v1, this.a + u1); }
      return b;
    }

    el(k, u0, u1, v0, v1, w0, w1, o) {
      const e = Object.assign({ k, u0, u1, v0, v1, w0, w1, hp: 0, brk: false, blocks: false, broken: false, wall: this, children: null, attach: null }, o);
      e.box = this.worldBox(u0, u1, v0, v1, w0, w1);
      this.els.push(e);
      return e;
    }

    inOpening(u, v) {
      for (const o of this.openings) if (u > o.a && u < o.b && v > o.bottom && v < o.top) return o;
      return null;
    }

    finishFor(room) {
      return room && room.finish ? room.finish.wall : GU.mat('#ffffff', GU.tex.paint('#e8e4d8'));
    }

    // Build all the elements. Call once after openings are added.
    generate() {
      mats();
      const T = TYPES[this.type], L = this.L, H = this.h;
      const ops = this.openings;
      const rows = new Set(ROWS.filter((r) => r < H - 0.05));
      rows.add(H);
      for (const o of ops) { if (o.bottom > 0.01) rows.add(o.bottom); if (o.top < H - 0.01) rows.add(o.top); }
      const rv = [...rows].sort((p, q) => p - q);
      const cs = new Set([0, L]);
      for (let u = OC; u < L - 0.05; u += OC) cs.add(+u.toFixed(4));
      for (const o of ops) { cs.add(Math.max(0, o.a)); cs.add(Math.min(L, o.b)); }
      const cu = [...cs].sort((p, q) => p - q).filter((u, i, arr) => i === 0 || u - arr[i - 1] > 0.02);
      this.cols = cu; this.rowsV = rv;

      const half = this.t / 2;
      if (T.solid) {
        // concrete block: one solid piece per grid cell, unbreakable
        const fn = this.finishFor(this.neg), fp = this.finishFor(this.pos);
        this.grid(cu, rv, (u0, u1, v0, v1) => this.el('cmu', u0, u1, v0, v1, -half, half, { blocks: true, mat: GU.mat('#ffffff', GU.tex.cmu('#c8c8c0')), fn, fp }));
        return;
      }
      // Layer stack from the negative side to the positive side.
      const outsideNeg = T.outside && !this.neg, outsidePos = T.outside && !this.pos;
      let w = -half;
      const layers = [];
      const push = (kind, d, extra) => { layers.push(Object.assign({ kind, w0: w, w1: w + d }, extra)); w += d; };
      if (outsideNeg) { push('brick', 0.09); push('gap', 0.025); push('osb', 0.011); }
      else push('gyp', T.side.d, { side: -1, hp: T.side.hp });
      T.rows.forEach((r, i) => { if (i) push('gap', T.gap); push('core', r.d, { off: r.off || 0 }); });
      if (outsidePos) { push('osb', 0.011); push('gap', 0.025); push('brick', 0.09); }
      else push('gyp', T.side.d, { side: 1, hp: T.side.hp });
      this.layers = layers;

      for (const ly of layers) {
        if (ly.kind === 'gyp') {
          const room = ly.side < 0 ? this.neg : this.pos;
          const fin = this.finishFor(room);
          this.grid(cu, rv, (u0, u1, v0, v1, i, j) => this.el('gyp', u0, u1, v0, v1, ly.w0, ly.w1, {
            hp: ly.hp, brk: true, blocks: true, mat: M.gyp, side: ly.side, i, j, layer: 'g' + ly.side,
            fn: ly.side < 0 ? fin : M.paper, fp: ly.side > 0 ? fin : M.paper, label: ly.hp > 1 ? 'gyp2' : 'gyp',
          }));
        } else if (ly.kind === 'osb') {
          this.grid(cu, rv, (u0, u1, v0, v1, i, j) => this.el('osb', u0, u1, v0, v1, ly.w0, ly.w1, { hp: 2, brk: true, blocks: true, mat: M.osb, i, j, layer: 'osb' }));
        } else if (ly.kind === 'brick') {
          this.grid(cu, rv, (u0, u1, v0, v1) => this.el('brick', u0, u1, v0, v1, ly.w0, ly.w1, { blocks: true, mat: M.brick }));
        } else if (ly.kind === 'core') {
          this.frame(ly, T, cu, rv);
        }
      }
      this.wiring(T);
      if (T.pipes) this.plumbing();
    }

    // Call fn for every grid cell that isn't inside a door/window opening.
    grid(cu, rv, fn) {
      for (let i = 0; i < cu.length - 1; i++) {
        for (let j = 0; j < rv.length - 1; j++) {
          if (this.inOpening((cu[i] + cu[i + 1]) / 2, (rv[j] + rv[j + 1]) / 2)) continue;
          fn(cu[i], cu[i + 1], rv[j], rv[j + 1], i, j);
        }
      }
    }

    // Studs, plates, headers, cripples and insulation for one row of studs.
    frame(ly, T, cu, rv) {
      const L = this.L, H = this.h, w0 = ly.w0, w1 = ly.w1;
      const top = H - 2 * STUD;
      const studs = []; // [u0, u1, v0, v1]
      const zones = this.openings.map((o) => [o.a - 2 * STUD - 0.02, o.b + 2 * STUD + 0.02]);
      const blocked = (u) => zones.some(([p, q]) => u + STUD > p && u < q);
      const grid = [0];
      for (let u = OC + ly.off - STUD / 2; u < L - STUD - 0.05; u += OC) grid.push(u);
      grid.push(L - STUD);
      for (const u of grid) if (!blocked(u) && u >= 0) studs.push([u, u + STUD, STUD, top]);
      const hh = T.header;
      for (const o of this.openings) {
        const a = Math.max(0, o.a), b = Math.min(L, o.b);
        // king + jack studs each side, header above, cripples above/below
        if (a - 2 * STUD >= 0) { studs.push([a - 2 * STUD, a - STUD, STUD, top]); studs.push([a - STUD, a, STUD, o.top]); }
        if (b + 2 * STUD <= L) { studs.push([b + STUD, b + 2 * STUD, STUD, top]); studs.push([b, b + STUD, STUD, o.top]); }
        const ht = Math.min(o.top + hh, top);
        this.el('header', Math.max(0, a - STUD), Math.min(L, b + STUD), o.top, ht, w0, w1, { mat: M.header, label: 'header' });
        for (const u of grid) {
          if (u < a || u + STUD > b) continue;
          if (top - ht > 0.05) studs.push([u, u + STUD, ht, top]);
          if (o.bottom > 0.2) studs.push([u, u + STUD, STUD, o.bottom - STUD]);
        }
        if (o.bottom > 0.2) this.el('plate', a, b, o.bottom - STUD, o.bottom, w0, w1, { mat: M.plate, label: 'plate' });
      }
      // stud segments, split at the drywall rows so you can knock out a section
      for (const [u0, u1, v0, v1] of studs) {
        const cuts = [v0, ...rv.filter((r) => r > v0 + 0.02 && r < v1 - 0.02), v1];
        for (let k = 0; k < cuts.length - 1; k++) {
          this.el('stud', u0, u1, cuts[k], cuts[k + 1], w0 + 0.001, w1 - 0.001, { hp: T.studHp, brk: true, blocks: true, mat: M.stud, label: 'stud' });
        }
      }
      // plates: one bottom plate (skips door openings) + doubled top plate
      let cur = 0;
      for (const o of [...this.openings].sort((p, q) => p.a - q.a)) {
        if (o.bottom > 0.01) continue;
        if (o.a > cur) this.el('plate', cur, o.a, 0, STUD, w0, w1, { mat: M.plate, label: 'plate' });
        cur = o.b;
      }
      if (cur < L) this.el('plate', cur, L, 0, STUD, w0, w1, { mat: M.plate, label: 'plate' });
      this.el('plate', 0, L, top, H, w0, w1, { mat: M.plate, label: 'plate' });
      // insulation batts fill each stud bay
      if (T.insul) {
        this.grid(cu, rv, (u0, u1, v0, v1) => {
          if (v1 <= STUD || v0 >= top) return;
          this.el('insul', u0, u1, Math.max(v0, STUD), Math.min(v1, top), w0 + 0.006, w1 - 0.006, { hp: 1, brk: true, blocks: true, mat: M.insul, label: 'insul' });
        });
      }
      this.coreW = this.coreW || [];
      this.coreW.push([w0, w1]);
    }

    // Receptacles every ~10 ft along each room side (NEC: no point on a wall more than 6 ft from one),
    // with NM cable (Romex) run through the studs at about 18" high.
    wiring(T) {
      const L = this.L;
      for (const side of [-1, 1]) {
        const room = side < 0 ? this.neg : this.pos;
        if (!room || room.noOutlets || !room.circuit) continue;
        const spots = [];
        for (let u = 0.5; u < L - 0.3; u += 3.0) if (!this.openings.some((o) => u > o.a - 0.3 && u < o.b + 0.3 && o.bottom < 0.5)) spots.push(u);
        if (!spots.length) continue;
        const core = side < 0 ? this.coreW[0] : this.coreW[this.coreW.length - 1];
        const wc = side < 0 ? core[0] + 0.02 : core[1] - 0.02;
        const circuit = room.circuit;
        const wireMat = circuit.amps >= 20 ? M.wireY : M.wireW;
        // run the cable through every bay, skipping door openings
        for (let i = 0; i < this.cols.length - 1; i++) {
          const u0 = this.cols[i], u1 = this.cols[i + 1];
          if (this.inOpening((u0 + u1) / 2, 0.45)) continue;
          this.el('wire', u0, u1, 0.44, 0.455, wc - 0.006, wc + 0.006, { hp: 1, brk: true, mat: wireMat, circuit, label: 'wire' });
        }
        for (const u of spots) this.device(u, 0.3, 0.41, side, M.outlet, circuit);
      }
    }

    // An electrical box inside the wall + its cover plate on the drywall face.
    device(u, v0, v1, side, coverMat, circuit) {
      const gl = this.layers.find((l) => l.kind === 'gyp' && l.side === side);
      if (!gl) return null;
      const inner = side < 0 ? gl.w1 : gl.w0, outer = side < 0 ? gl.w0 : gl.w1;
      const box = this.el('ebox', u - 0.03, u + 0.03, v0, v1, side < 0 ? inner : inner - 0.07, side < 0 ? inner + 0.07 : inner, { hp: 1, brk: true, mat: M.ebox, circuit, label: 'ebox' });
      const cell = this.cellAt(side, u, (v0 + v1) / 2);
      const cover = this.el('cover', u - 0.037, u + 0.037, v0 - 0.006, v1 + 0.006, side < 0 ? outer - 0.006 : outer, side < 0 ? outer : outer + 0.006, { mat: coverMat });
      if (cell) (cell.children = cell.children || []).push(cover);
      return { box, cover, cell };
    }

    cellAt(side, u, v) {
      return this.els.find((e) => e.k === 'gyp' && e.side === side && u >= e.u0 && u <= e.u1 && v >= e.v0 && v <= e.v1);
    }

    // A light switch: box + plate on the wall, cable running up to the top plate.
    addSwitch(u, side, circuit) {
      const core = side < 0 ? this.coreW[0] : this.coreW[this.coreW.length - 1];
      const wc = side < 0 ? core[0] + 0.03 : core[1] - 0.03;
      this.el('wire', u - 0.007, u + 0.007, 1.27, this.h - 2 * STUD, wc - 0.006, wc + 0.006, { hp: 1, brk: true, mat: M.wireW, circuit, label: 'wire' });
      return this.device(u, 1.15, 1.27, side, M.plateCover, circuit);
    }

    // Hot (red) + cold (blue) PEX supply lines and a PVC drain/vent stack.
    plumbing() {
      const L = this.L;
      let u = L / 2;
      if (this.openings.some((o) => u > o.a - 0.3 && u < o.b + 0.3)) u = L * 0.25;
      if (this.openings.some((o) => u > o.a - 0.3 && u < o.b + 0.3)) return;
      const [w0, w1] = this.coreW[0];
      const wc = (w0 + w1) / 2;
      const leak = (e) => GU.leak && GU.leak(e);
      this.el('pipe', u - 0.08, u - 0.06, 0, 0.6, wc - 0.01, wc + 0.01, { hp: 1, brk: true, mat: M.pexR, label: 'pipe', onBreak: leak });
      this.el('pipe', u - 0.02, u, 0, 0.6, wc - 0.01, wc + 0.01, { hp: 1, brk: true, mat: M.pexB, label: 'pipe', onBreak: leak });
      this.el('pipe', u + 0.12, u + 0.18, 0, this.h - 2 * STUD, wc - 0.03, wc + 0.03, { hp: 2, brk: true, mat: M.pvc, label: 'pvc' });
    }

    // Make the hammer hit an element.
    hit(e, point) {
      const first = !learned.has(e.label || e.k);
      if (first) learned.add(e.label || e.k);
      if (!e.brk) {
        GU.sfx && GU.sfx(e.k === 'brick' || e.k === 'cmu' ? 'clank' : 'thud');
        GU.debris && GU.debris(point, e.k === 'brick' ? '#a8472f' : '#bbbbb4', 2, 0.6);
        GU.say(LEARN[e.label || e.k] || 'It won\'t break.', 3);
        return false;
      }
      e.hp -= 1;
      const color = { gyp: '#ece9e0', stud: '#dcbf8a', insul: '#f5a3b8', osb: '#c49a5a', wire: '#ffd23f', ebox: '#2f6fd6', pipe: '#2f6fd6' }[e.k] || '#cccccc';
      GU.sfx && GU.sfx({ gyp: 'crumble', stud: 'crack', insul: 'thud', osb: 'crack', wire: 'zap', ebox: 'crack', pipe: 'splash' }[e.k] || 'thud');
      GU.debris && GU.debris(point, color, e.hp <= 0 ? 8 : 3, e.k === 'insul' ? 0.6 : 1);
      if (first && LEARN[e.label || e.k]) GU.say(LEARN[e.label || e.k], 3);
      if (e.hp > 0) return true;
      this.breakEl(e);
      return true;
    }

    breakEl(e) {
      e.broken = true;
      this.anyBroken = true;
      for (const c of e.children || []) c.broken = true;
      for (const o of e.attach || []) { o.visible = false; o.userData.interact = null; }
      // pictures, shelves, clocks... hung on this piece of drywall fall off
      for (const o of e.mounts || []) {
        if (!o.parent || o.userData.broken) continue;
        GU.dropped.attach(o);
        GU.fall(o);
      }
      if (e.k === 'wire' && e.circuit && !e.circuit.cut) {
        e.circuit.cut = true;
        GU.sparks && GU.sparks(e.box.getCenter(new THREE.Vector3()));
        GU.say('*ZZZT* You cut the ' + e.circuit.name + ' circuit. Its lights and outlets are dead.', 4);
      }
      if (e.onBreak) e.onBreak(e);
      const ch = GU.wallChunks.get(this.chunk);
      if (ch) ch.dirty = true;
    }
  };

  // ---------- rendering ----------
  // Emit the 6 faces of an axis-aligned box, UVs in meters.
  function emitBox(buckets, b, matFor, skip) {
    const x0 = b.min.x, y0 = b.min.y, z0 = b.min.z, x1 = b.max.x, y1 = b.max.y, z1 = b.max.z;
    const faces = [
      ['+x', [x1, y0, z1], [x1, y0, z0], [x1, y1, z0], [x1, y1, z1], [1, 0, 0]],
      ['-x', [x0, y0, z0], [x0, y0, z1], [x0, y1, z1], [x0, y1, z0], [-1, 0, 0]],
      ['+y', [x0, y1, z1], [x1, y1, z1], [x1, y1, z0], [x0, y1, z0], [0, 1, 0]],
      ['-y', [x0, y0, z0], [x1, y0, z0], [x1, y0, z1], [x0, y0, z1], [0, -1, 0]],
      ['+z', [x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1], [0, 0, 1]],
      ['-z', [x1, y0, z0], [x0, y0, z0], [x0, y1, z0], [x1, y1, z0], [0, 0, -1]],
    ];
    for (const [id, p0, p1, p2, p3, n] of faces) {
      if (skip && skip(id)) continue;
      const mat = matFor(id);
      let k = buckets.get(mat);
      if (!k) { k = { pos: [], nor: [], uv: [], idx: [] }; buckets.set(mat, k); }
      const base = k.pos.length / 3;
      for (const p of [p0, p1, p2, p3]) {
        k.pos.push(p[0], p[1], p[2]);
        k.nor.push(n[0], n[1], n[2]);
        if (n[0]) k.uv.push(p[2], p[1]); else if (n[1]) k.uv.push(p[0], p[2]); else k.uv.push(p[0], p[1]);
      }
      k.idx.push(base, base + 1, base + 2, base, base + 2, base + 3);
    }
  }

  // world face id for "toward the negative / positive side of the wall"
  const faceId = (wall, sign) => (wall.axis === 'x' ? (sign > 0 ? '+z' : '-z') : (sign > 0 ? '+x' : '-x'));
  const edgeIds = (wall) => (wall.axis === 'x' ? { u0: '-x', u1: '+x' } : { u0: '-z', u1: '+z' });

  // Walls skip the PS1 vertex wobble: snapping each little panel separately would open
  // hairline cracks between them.
  const flat = new Map();
  function noSnap(m) {
    let f = flat.get(m);
    if (!f) { f = m.clone(); f.onBeforeCompile = () => {}; f.customProgramCacheKey = () => 'flat'; flat.set(m, f); }
    return f;
  }

  function buildChunk(ch) {
    const buckets = new Map();
    for (const wall of ch.walls) {
      const fN = faceId(wall, -1), fP = faceId(wall, 1), ed = edgeIds(wall);
      // neighbor lookup so intact drywall only draws its outside faces
      const cells = new Map();
      for (const e of wall.els) if (e.layer && !e.broken) cells.set(e.layer + ':' + e.i + ':' + e.j, e);
      const has = (e, di, dj) => cells.has(e.layer + ':' + (e.i + di) + ':' + (e.j + dj));
      for (const e of wall.els) {
        if (e.broken) continue;
        const inner = !(e.k === 'gyp' || e.k === 'cmu' || e.k === 'brick' || e.k === 'cover');
        if (inner && !wall.anyBroken) continue; // studs etc. are invisible until the wall is opened up
        let skip = null;
        if (e.layer) {
          skip = (id) => {
            if (id === ed.u0) return has(e, -1, 0);
            if (id === ed.u1) return has(e, 1, 0);
            if (id === '-y') return has(e, 0, -1) || e.v0 < 0.01;
            if (id === '+y') return has(e, 0, 1);
            // the back of the drywall only shows once the wall is open
            if (e.k === 'gyp' && id === (e.side < 0 ? fP : fN)) return !wall.anyBroken;
            return false;
          };
        } else if (e.k === 'cmu' || e.k === 'brick') {
          skip = (id) => id === '-y';
        }
        GU.wallEmit(buckets, e, (id) => (id === fN && e.fn ? e.fn : id === fP && e.fp ? e.fp : e.mat), skip);
      }
    }
    while (ch.group.children.length) {
      const m = ch.group.children.pop();
      m.geometry.dispose();
    }
    for (const [mat, k] of buckets) {
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.Float32BufferAttribute(k.pos, 3));
      g.setAttribute('normal', new THREE.Float32BufferAttribute(k.nor, 3));
      g.setAttribute('uv', new THREE.Float32BufferAttribute(k.uv, 2));
      g.setIndex(k.idx);
      g.computeBoundingSphere();
      const mesh = new THREE.Mesh(g, noSnap(mat));
      mesh.userData.wallChunk = ch;
      ch.group.add(mesh);
    }
    ch.dirty = false;
  }
  GU.wallEmit = (buckets, e, matFor, skip) => emitBox(buckets, e.box, matFor, skip);

  // Group walls into chunks (so a hit only rebuilds nearby geometry) and build everything.
  GU.buildWalls = function () {
    GU.wallGroup = GU.wallGroup || GU.group(GU.scene);
    for (const w of GU.walls) {
      if (!w.layers && !w.cols) w.generate();
      let ch = GU.wallChunks.get(w.chunk);
      if (!ch) { ch = { key: w.chunk, walls: [], group: GU.group(GU.wallGroup), dirty: true }; GU.wallChunks.set(w.chunk, ch); }
      ch.walls.push(w);
      w.box = new THREE.Box3();
      for (const e of w.els) w.box.union(e.box);
      for (const e of w.els) {
        if (e.blocks) GU.colliders.push({ box: e.box, enabled: () => !e.broken });
      }
    }
    for (const ch of GU.wallChunks.values()) buildChunk(ch);
  };

  // Hook every wall-mounted prop (userData.wallMounted) to the drywall panel behind it.
  GU.mountProps = function (root) {
    root.updateMatrixWorld(true);
    const list = [];
    root.traverse((o) => { if (o.userData.wallMounted) list.push(o); });
    const ray = new THREE.Ray();
    for (const o of list) {
      const c = new THREE.Box3().setFromObject(o).getCenter(new THREE.Vector3());
      const fwd = new THREE.Vector3(0, 0, 1).transformDirection(o.matrixWorld);
      ray.set(c.clone().addScaledVector(fwd, 0.1), fwd.clone().negate());
      const h = GU.raycastWalls(ray, 0.4);
      if (h && h.e.k === 'gyp') (h.e.mounts = h.e.mounts || []).push(o);
    }
  };

  GU.updateWalls = function () {
    for (const ch of GU.wallChunks.values()) if (ch.dirty) buildChunk(ch);
  };

  // Nearest intact wall element along a ray. Returns { e, wall, dist, point } or null.
  const tmp = new THREE.Vector3();
  const padBox = new THREE.Box3();
  // pad: treat every element as this much bigger (the sledgehammer head is ~10 cm wide,
  // so it can catch a 4 cm stud even if the crosshair is slightly off).
  GU.raycastWalls = function (ray, far, filter, pad) {
    let best = null;
    for (const w of GU.walls) {
      if (filter && !filter(w)) continue;
      const hitW = ray.intersectBox(w.box, tmp);
      if (!hitW) continue;
      const dW = hitW.distanceTo(ray.origin);
      const inside = w.box.containsPoint(ray.origin);
      if (!inside && dW > far) continue;
      if (best && !inside && dW > best.dist) continue;
      for (const e of w.els) {
        if (e.broken || e.k === 'cover') continue;
        const p = ray.intersectBox(pad ? padBox.copy(e.box).expandByScalar(pad) : e.box, tmp);
        if (!p) continue;
        const d = p.distanceTo(ray.origin);
        if (d <= far && (!best || d < best.dist)) best = { e, wall: w, dist: d, point: p.clone() };
      }
    }
    return best;
  };
})();
