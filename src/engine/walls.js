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
  const ROWS = [0, 0.7, 1.4, 2.1]; // how drywall/studs split into panels
  const TILE = 0.055;              // panels break up into tiles this size once they're hit
  const SHEETS = { gyp: 1, osb: 1, insul: 1 };
  const PIECE_COLOR = { gyp: '#ece9e0', insul: '#f5a3b8', osb: '#c49a5a' };

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
        const layer = 'ins' + w0.toFixed(3);
        this.grid(cu, rv, (u0, u1, v0, v1, i, j) => {
          if (v1 <= STUD || v0 >= top) return;
          this.el('insul', u0, u1, Math.max(v0, STUD), Math.min(v1, top), w0 + 0.006, w1 - 0.006, { hp: 1, brk: true, blocks: true, mat: M.insul, label: 'insul', layer, i, j });
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

    // ---------- getting hit ----------
    // blow = { energy, dir, kind: 'overhead' | 'side' | 'impact', blowout }
    // energy is in "hits": a tap is ~0.4, a fully charged sledgehammer swing ~3.2.
    // Returns { absorb: energy used up, through: punched through it?, hard: hammer bounced off? }
    hit(e, point, blow) {
      if (!blow) blow = { energy: 1, dir: this.axis === 'x' ? new THREE.Vector3(0, 0, -1) : new THREE.Vector3(-1, 0, 0), kind: 'impact' };
      const E = blow.energy, key = e.label || e.k, loud = blow.kind !== 'impact';
      const first = loud && !learned.has(key);
      if (first) learned.add(key);
      if (!e.brk) {
        const hard = e.k === 'brick' || e.k === 'cmu';
        if (loud) {
          GU.sfx(hard ? 'clank' : 'thud', Math.min(1, 0.4 + E / 3));
          GU.debris(point, e.k === 'brick' ? '#a8472f' : '#bbbbb4', 2 + Math.floor(E), 0.6);
          GU.say(LEARN[key] || 'It won\'t break.', 3);
        }
        return { absorb: E, through: false, hard };
      }
      if (first && LEARN[key]) GU.say(LEARN[key], 3);
      if (SHEETS[e.k]) return this.sheetHit(e, point, blow);
      if (e.k === 'stud') return this.studHit(e, point, blow);
      // wires, electrical boxes, pipes
      GU.sfx({ wire: 'zap', ebox: 'crack', pipe: 'splash' }[e.k] || 'thud', 0.8);
      GU.debris(point, { wire: '#ffd23f', ebox: '#2f6fd6', pipe: '#2f6fd6', pvc: '#f4f4f0' }[e.k] || '#cccccc', 3, 0.6);
      e.hp -= E;
      if (e.hp > 0) return { absorb: E, through: false };
      this.breakEl(e);
      return { absorb: Math.min(E, 0.15), through: true };
    }

    // Drywall, OSB and insulation get split into ~5 cm tiles the first time they're hit,
    // so holes come out the shape of the blow instead of whole panels.
    tileUp(e) {
      if (e.tiled) return;
      const nu = Math.max(2, Math.round((e.u1 - e.u0) / TILE)), nv = Math.max(2, Math.round((e.v1 - e.v0) / TILE));
      const n = nu * nv;
      Object.assign(e, { tiled: true, nu, nv, du: (e.u1 - e.u0) / nu, dv: (e.v1 - e.v0) / nv, alive: n, total: n });
      e.th = new Float32Array(n).fill(e.k === 'insul' ? 0.3 : e.k === 'osb' ? 2.2 : e.hp);
      e.cr = new Uint8Array(n);
      e.str = new Float32Array(n).fill(1);
      if (e.k === 'gyp') {
        // drywall is screwed to the studs: right over a stud it barely breaks
        const studs = this.els.filter((s) => s.k === 'stud' && !s.broken && s.v1 > e.v0 && s.v0 < e.v1 && s.u1 > e.u0 - 0.05 && s.u0 < e.u1 + 0.05);
        for (let i = 0; i < nu; i++) {
          const u = e.u0 + (i + 0.5) * e.du;
          const over = studs.some((s) => u > s.u0 - 0.02 && u < s.u1 + 0.02);
          for (let j = 0; j < nv; j++) e.str[j * nu + i] = over ? 2.6 : i === 0 || i === nu - 1 ? 1.5 : 1;
        }
      }
      if (e.blocks) {
        for (let j = 0; j < nv; j++) {
          for (let i = 0; i < nu; i++) {
            const k = j * nu + i;
            GU.addCollider({ box: this.worldBox(e.u0 + i * e.du, e.u0 + (i + 1) * e.du, e.v0 + j * e.dv, e.v0 + (j + 1) * e.dv, e.w0, e.w1), enabled: () => e.th[k] > 0, el: e });
          }
        }
      }
    }

    tileAt(e, u, v) {
      const i = Math.floor((u - e.u0) / e.du), j = Math.floor((v - e.v0) / e.dv);
      if (i < 0 || j < 0 || i >= e.nu || j >= e.nv) return -1;
      return j * e.nu + i;
    }

    sheetHit(e, point, blow) {
      const L = this.toLocal(point), D = blow.dir;
      const cos = Math.abs(this.axis === 'x' ? D.z : D.x);
      const alongU = this.axis === 'x' ? D.x : D.z;
      const En = blow.energy * (0.3 + 0.7 * cos); // glancing blows do less
      // hole shape: overhead swings tear tall holes, side swings wide ones, glancing blows rip along
      let au = 1, av = 1;
      if (blow.kind === 'overhead') { av = 1.35; au = 0.8; } else if (blow.kind === 'side') { au = 1.35; av = 0.8; }
      au *= 1 + (1 - cos) * Math.abs(alongU) * 1.5;
      av *= 1 + (1 - cos) * Math.abs(D.y) * 1.5;
      const R = (0.04 + 0.11 * Math.sqrt(En)) * (e.k === 'insul' ? 1.5 : e.k === 'osb' ? 0.7 : 1) * (blow.blowout ? 1.4 : 1);
      const harm = [0, 1, 2].map(() => ({ a: 0.12 + Math.random() * 0.2, f: 2 + Math.floor(Math.random() * 5), p: Math.random() * 6.28 }));
      const crackLen = e.k === 'gyp' ? 0.1 + 0.3 * En : 0;
      const reach = Math.max(R * 1.7 * Math.max(au, av), crackLen) + 0.06;
      const sheets = this.els.filter((s) => s.layer === e.layer && !s.broken && s.u1 > L.u - reach && s.u0 < L.u + reach && s.v1 > L.v - reach && s.v0 < L.v + reach);
      const before = new Map();
      for (const s of sheets) { this.tileUp(s); before.set(s, s.th.slice()); }
      for (const s of sheets) {
        for (let j = 0; j < s.nv; j++) {
          for (let i = 0; i < s.nu; i++) {
            const k = j * s.nu + i;
            if (s.th[k] <= 0) continue;
            const du = (s.u0 + (i + 0.5) * s.du - L.u) / au, dv = (s.v0 + (j + 0.5) * s.dv - L.v) / av;
            const d = Math.hypot(du, dv), ang = Math.atan2(dv, du);
            let rr = R;
            for (const h of harm) rr *= 1 + h.a * Math.sin(ang * h.f + h.p);
            let dmg = 0;
            if (d < rr) dmg = En * 1.6 * Math.pow(1 - d / rr, 0.6) * (0.7 + Math.random() * 0.6);
            else if (d < rr * 1.6) { dmg = En * 0.12 * Math.random(); if (e.k === 'gyp' && Math.random() < 0.5) s.cr[k] = 1; }
            s.th[k] -= dmg / s.str[k];
          }
        }
      }
      // cracks spider out from the impact
      if (crackLen) {
        const sheetAt = (u, v) => sheets.find((s) => u >= s.u0 && u < s.u1 && v >= s.v0 && v < s.v1);
        const nc = Math.min(6, 1 + Math.floor(En * 1.6));
        for (let c = 0; c < nc; c++) {
          let a = Math.random() * Math.PI * 2;
          if (blow.kind === 'overhead' && Math.random() < 0.6) a = Math.random() < 0.5 ? Math.PI / 2 : -Math.PI / 2;
          let u = L.u, v = L.v;
          const len = crackLen * (0.5 + Math.random());
          for (let t = 0; t < len; t += TILE * 0.7) {
            a += (Math.random() - 0.5) * 0.9;
            u += Math.cos(a) * TILE * 0.7; v += Math.sin(a) * TILE * 0.7;
            const s = sheetAt(u, v);
            if (!s) break;
            const k = this.tileAt(s, u, v);
            if (k < 0 || s.th[k] <= 0) continue;
            s.cr[k] = 1;
            s.th[k] -= 0.1 * En / s.str[k];
          }
        }
      }
      // what came off, plus anything left dangling with nothing holding it up
      const gone = [], loose = [];
      for (const s of sheets) {
        const b = before.get(s);
        let changed = false;
        for (let k = 0; k < s.th.length; k++) if (b[k] > 0 && s.th[k] <= 0) { gone.push([s, k]); changed = true; }
        if (!changed) continue;
        for (const k of this.unsupported(s)) { s.th[k] = 0; loose.push([s, k]); }
      }
      for (const s of sheets) this.recount(s);
      this.spawnPieces(gone, blow, En, false);
      this.spawnPieces(loose, blow, En, true);
      GU.sfx({ gyp: 'crumble', insul: 'thud', osb: 'crack' }[e.k], Math.min(1, 0.35 + En / 3));
      GU.debris(point, PIECE_COLOR[e.k], Math.min(14, 2 + Math.floor(gone.length / 3)), e.k === 'insul' ? 0.6 : 1);
      if (gone.length || loose.length) {
        this.anyBroken = true;
        GU.rigid.wakeNear(point, 1.2);
      }
      const ch = GU.wallChunks.get(this.chunk);
      if (ch) ch.dirty = true;
      this.geoDirty = true;
      // did it go through? (the hammer head is ~10 cm, so look around the impact point)
      let through = e.broken;
      if (!through) {
        for (const [du, dv] of [[0, 0], [0.03, 0], [-0.03, 0], [0, 0.03], [0, -0.03]]) {
          const k = this.tileAt(e, L.u + du, L.v + dv);
          if (k >= 0 && e.th[k] <= 0) { through = true; break; }
        }
      }
      const cost = e.k === 'insul' ? 0.1 : e.k === 'osb' ? 1.2 : 0.55 * e.hp + 0.3;
      return { absorb: through ? Math.min(blow.energy, cost) : blow.energy, through };
    }

    // Tiles no longer connected to anything that holds the sheet up (studs, edges, the panel above/below).
    unsupported(s) {
      const { nu, nv, th } = s, seen = new Uint8Array(nu * nv), q = [];
      const holdsBelow = this.neighborHolds(s, -1), holdsAbove = this.neighborHolds(s, 1);
      for (let j = 0; j < nv; j++) {
        for (let i = 0; i < nu; i++) {
          const k = j * nu + i;
          if (th[k] <= 0) continue;
          if (i === 0 || i === nu - 1 || s.str[k] > 2 || (j === 0 && holdsBelow) || (j === nv - 1 && holdsAbove)) { seen[k] = 1; q.push(k); }
        }
      }
      while (q.length) {
        const k = q.pop(), i = k % nu, j = (k - i) / nu;
        for (const [a, b] of [[i + 1, j], [i - 1, j], [i, j + 1], [i, j - 1]]) {
          if (a < 0 || b < 0 || a >= nu || b >= nv) continue;
          const kk = b * nu + a;
          if (!seen[kk] && th[kk] > 0) { seen[kk] = 1; q.push(kk); }
        }
      }
      const out = [];
      for (let k = 0; k < th.length; k++) if (th[k] > 0 && !seen[k]) out.push(k);
      return out;
    }

    neighborHolds(s, dir) {
      if (dir < 0 && s.v0 < 0.05) return true;
      if (dir > 0 && s.v1 > this.h - 0.05) return true;
      return this.els.some((o) => o.layer === s.layer && o.i === s.i && o.j === s.j + dir && !o.broken && (!o.tiled || o.alive > 0));
    }

    recount(s) {
      let alive = 0;
      for (let k = 0; k < s.th.length; k++) if (s.th[k] > 0) alive++;
      s.alive = alive;
      for (const c of s.children || []) {
        const k = this.tileAt(s, (c.u0 + c.u1) / 2, (c.v0 + c.v1) / 2);
        if (k >= 0 && s.th[k] <= 0) c.broken = true;
      }
      if (alive === 0) this.breakEl(s);
      else if (alive < s.total * 0.75) this.dropMounts(s);
    }

    // Knocked-off tiles become flying chunks a few tiles big. Loose ones just drop.
    spawnPieces(list, blow, En, loose) {
      if (!list.length) return;
      const bySheet = new Map();
      for (const [s, k] of list) {
        let set = bySheet.get(s);
        if (!set) bySheet.set(s, (set = new Set()));
        set.add(k);
      }
      let budget = loose ? 10 : Math.round(8 + 4 * En);
      const rnd = () => Math.random() - 0.5;
      for (const [s, set] of bySheet) {
        const ks = [...set].sort(() => Math.random() - 0.5);
        for (const k0 of ks) {
          if (!set.has(k0)) continue;
          const want = loose ? 3 + Math.floor(Math.random() * 10) : 1 + Math.floor(Math.random() * 5);
          const piece = [k0];
          set.delete(k0);
          for (let p = 0; p < piece.length && piece.length < want; p++) {
            const k = piece[p], i = k % s.nu;
            for (const kk of [k + 1, k - 1, k + s.nu, k - s.nu]) {
              if (!set.has(kk) || piece.length >= want || Math.abs((kk % s.nu) - i) > 1) continue;
              piece.push(kk);
              set.delete(kk);
            }
          }
          let i0 = 1e9, i1 = -1, j0 = 1e9, j1 = -1;
          for (const k of piece) {
            const i = k % s.nu, j = (k - i) / s.nu;
            i0 = Math.min(i0, i); i1 = Math.max(i1, i); j0 = Math.min(j0, j); j1 = Math.max(j1, j);
          }
          const c = this.toWorld(s.u0 + (i0 + i1 + 1) / 2 * s.du, s.v0 + (j0 + j1 + 1) / 2 * s.dv, (s.w0 + s.w1) / 2);
          if (budget-- <= 0) { GU.debris(c, PIECE_COLOR[s.k], 2, 0.8); continue; }
          const vel = loose
            ? new THREE.Vector3(rnd() * 0.6, 0, rnd() * 0.6).addScaledVector(blow.dir, 0.5)
            : blow.dir.clone().multiplyScalar(0.8 + 3.2 * En * Math.random()).add(new THREE.Vector3(rnd() * 1.6, Math.random() * 1.4, rnd() * 1.6));
          const ins = s.k === 'insul';
          GU.rigid.chunk({
            pos: c, rotY: this.axis === 'z' ? Math.PI / 2 : 0,
            sx: (i1 - i0 + 1) * s.du * 1.25, sy: (j1 - j0 + 1) * s.dv * 1.25, sz: (s.w1 - s.w0) * (ins ? 0.7 : 1),
            mats: s.k === 'gyp' ? [s.side < 0 ? s.fn : s.fp, M.gyp] : [s.mat, s.mat],
            vel, ang: new THREE.Vector3(rnd() * 10, rnd() * 10, rnd() * 10),
            density: ins ? 30 : s.k === 'osb' ? 600 : 700, bounce: ins ? 0.05 : 0.25, drag: ins ? 2.5 : 0.1,
            sfx: s.k === 'gyp' ? 'tick' : s.k === 'osb' ? 'drop' : 'none',
          });
        }
      }
    }

    // Studs snap where they're hit: that bit flies off, the rest stays nailed to the plates.
    studHit(e, point, blow) {
      const E = blow.energy;
      e.hpMax = e.hpMax || e.hp;
      const before = e.hp;
      e.hp -= E * 0.95;
      GU.debris(point, '#dcbf8a', 3 + Math.floor(E), 0.8);
      if (e.hp > 0) { GU.sfx('crack', Math.min(1, 0.5 + E / 6)); return { absorb: E, through: false }; }
      GU.sfx('snap');
      const pv = Math.min(e.v1, Math.max(e.v0, point.y));
      const c0 = Math.max(e.v0, pv - 0.1 - Math.random() * 0.15), c1 = Math.min(e.v1, pv + 0.1 + Math.random() * 0.15);
      this.breakEl(e);
      for (const [a, b] of [[e.v0, c0], [c1, e.v1]]) {
        if (b - a < 0.05) continue;
        const ne = this.el('stud', e.u0, e.u1, a, b, e.w0, e.w1, { hp: e.hpMax * 0.6, hpMax: e.hpMax, brk: true, blocks: true, mat: M.stud, label: 'stud' });
        GU.addCollider({ box: ne.box, enabled: () => !ne.broken, el: ne });
      }
      const left = Math.max(0, E - before / 0.95 * 0.7);
      const wb = this.worldBox(e.u0, e.u1, c0, c1, e.w0, e.w1), size = wb.getSize(new THREE.Vector3());
      const m = new THREE.Mesh(GU.boxGeo(size.x, size.y, size.z), M.stud);
      wb.getCenter(m.position);
      GU.dropped.add(m);
      const rnd = () => Math.random() - 0.5;
      GU.rigid.add(m, {
        vel: blow.dir.clone().multiplyScalar(1.2 + 2 * left).add(new THREE.Vector3(rnd(), Math.random(), rnd())),
        ang: new THREE.Vector3(rnd() * 8, rnd() * 8, rnd() * 8), density: 500, bounce: 0.3, sfx: 'drop', kind: 'debris',
      });
      return { absorb: E - left, through: true };
    }

    // Pictures, shelves, clocks... hung on this piece of drywall fall off.
    dropMounts(e) {
      for (const o of e.mounts || []) {
        if (!o.parent || o.userData.broken) continue;
        GU.dropped.attach(o);
        GU.fall(o);
      }
      e.mounts = null;
    }

    breakEl(e) {
      e.broken = true;
      this.anyBroken = true;
      for (const c of e.children || []) c.broken = true;
      for (const o of e.attach || []) { o.visible = false; o.userData.interact = null; }
      this.dropMounts(e);
      if (e.k === 'wire' && e.circuit && !e.circuit.cut) {
        e.circuit.cut = true;
        GU.sparks && GU.sparks(e.box.getCenter(new THREE.Vector3()));
        GU.say('*ZZZT* You cut the ' + e.circuit.name + ' circuit. Its lights and outlets are dead.', 4);
      }
      if (e.onBreak) e.onBreak(e);
      if (GU.rigid) GU.rigid.wakeNear(e.box.getCenter(new THREE.Vector3()), 1);
      const ch = GU.wallChunks.get(this.chunk);
      if (ch) ch.dirty = true;
      this.geoDirty = true;
    }
  };

  // Swing through a wall: each layer soaks up some of the blow and the rest carries on into the next
  // (drywall -> stud / insulation / wiring -> the drywall on the far side, which blows out).
  GU.wallStrike = function (hit, blow) {
    let E = blow.energy, cur = hit, hard = false, n = 0;
    const seen = new Set(), ray = new THREE.Ray();
    const path = blow.aim || blow.dir;
    while (cur && E > 0.12 && n < 8) {
      seen.add(cur.e);
      const res = cur.wall.hit(cur.e, cur.point, Object.assign({}, blow, { energy: E, blowout: n > 0 && cur.e.k === 'gyp' }));
      if (res.hard) hard = true;
      E -= res.absorb;
      n++;
      if (!res.through) break;
      ray.set(cur.point.clone().addScaledVector(path, 0.004), path);
      cur = GU.raycastWalls(ray, 0.45, null, 0.03, seen);
    }
    return { hard, left: Math.max(0, E), layers: n };
  };

  // Something flying into a wall (thrown, or launched by the hammer).
  GU.wallImpact = function (e, point, energy, dir) {
    if (e.broken || !e.brk || energy < 0.15) return;
    e.wall.hit(e, point, { energy: Math.min(energy, 4), dir, kind: 'impact' });
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

  // A sheet that's been hit: draw its surviving tiles, merged into runs along each row.
  // Cracked tiles get a darker version of the paint.
  const cracked = new Map();
  function crackMat(m) {
    let c = cracked.get(m);
    if (!c) { c = m.clone(); c.color = m.color.clone().multiplyScalar(0.55); cracked.set(m, c); }
    return c;
  }
  function emitTiles(buckets, wall, e, fN, fP) {
    const { nu, nv, th, cr } = e;
    const ed = edgeIds(wall);
    const fn = e.fn || e.mat, fp = e.fp || e.mat;
    for (let j = 0; j < nv; j++) {
      let i = 0;
      while (i < nu) {
        const k = j * nu + i;
        if (th[k] <= 0) { i++; continue; }
        const c = cr[k];
        let i1 = i + 1;
        while (i1 < nu && th[j * nu + i1] > 0 && cr[j * nu + i1] === c) i1++;
        const box = wall.worldBox(e.u0 + i * e.du, e.u0 + i1 * e.du, e.v0 + j * e.dv, e.v0 + (j + 1) * e.dv, e.w0, e.w1);
        // edge faces only where they border a hole
        const deadIn = (row, a, b) => {
          if (row < 0 || row >= nv) return true;
          for (let x = a; x < b; x++) if (th[row * nu + x] <= 0) return true;
          return false;
        };
        const s0 = i, s1 = i1, row = j;
        emitBox(buckets, box, (id) => {
          const m = id === fN ? fn : id === fP ? fp : e.mat;
          return c && m !== e.mat ? crackMat(m) : m;
        }, (id) => {
          if (id === ed.u0) return s0 > 0 && th[row * nu + s0 - 1] > 0;
          if (id === ed.u1) return s1 < nu && th[row * nu + s1] > 0;
          if (id === '+y') return !deadIn(row + 1, s0, s1);
          if (id === '-y') return !deadIn(row - 1, s0, s1);
          return false;
        });
        i = i1;
      }
    }
  }

  // Each wall keeps its own geometry and only rebuilds it when something on it broke;
  // the chunk mesh is then stitched together from all its walls.
  function buildChunk(ch) {
    for (const wall of ch.walls) if (wall.geoDirty !== false) { wall.geo = buildWallGeo(wall); wall.geoDirty = false; }
    const sizes = new Map();
    for (const wall of ch.walls) {
      for (const [mat, k] of wall.geo) {
        const s = sizes.get(mat) || { v: 0, i: 0 };
        s.v += k.pos.length / 3; s.i += k.idx.length;
        sizes.set(mat, s);
      }
    }
    while (ch.group.children.length) {
      const m = ch.group.children.pop();
      m.geometry.dispose();
    }
    for (const [mat, s] of sizes) {
      const pos = new Float32Array(s.v * 3), nor = new Float32Array(s.v * 3), uv = new Float32Array(s.v * 2);
      const idx = new Uint32Array(s.i);
      let vo = 0, io = 0;
      for (const wall of ch.walls) {
        const k = wall.geo.get(mat);
        if (!k) continue;
        pos.set(k.pos, vo * 3); nor.set(k.nor, vo * 3); uv.set(k.uv, vo * 2);
        for (let i = 0; i < k.idx.length; i++) idx[io + i] = k.idx[i] + vo;
        vo += k.pos.length / 3; io += k.idx.length;
      }
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      g.setAttribute('normal', new THREE.BufferAttribute(nor, 3));
      g.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
      g.setIndex(new THREE.BufferAttribute(idx, 1));
      g.computeBoundingSphere();
      const mesh = new THREE.Mesh(g, noSnap(mat));
      mesh.userData.wallChunk = ch;
      ch.group.add(mesh);
    }
    ch.dirty = false;
  }

  function buildWallGeo(wall) {
    const buckets = new Map();
    {
      const fN = faceId(wall, -1), fP = faceId(wall, 1), ed = edgeIds(wall);
      // neighbor lookup so intact drywall only draws its outside faces
      const cells = new Map();
      for (const e of wall.els) if (e.layer && !e.broken && !e.tiled) cells.set(e.layer + ':' + e.i + ':' + e.j, e);
      const has = (e, di, dj) => cells.has(e.layer + ':' + (e.i + di) + ':' + (e.j + dj));
      for (const e of wall.els) {
        if (e.broken) continue;
        const inner = !(e.k === 'gyp' || e.k === 'cmu' || e.k === 'brick' || e.k === 'cover');
        if (inner && !wall.anyBroken) continue; // studs etc. are invisible until the wall is opened up
        if (e.tiled) { emitTiles(buckets, wall, e, fN, fP); continue; }
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
    return buckets;
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
        if (e.blocks) GU.colliders.push({ box: e.box, enabled: () => !e.broken && !e.tiled, el: e });
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
  // skip: optional Set of elements to ignore. Tiled sheets only count where a tile is left.
  function tileNear(w, e, p, pad) {
    const L = w.toLocal(p), r = Math.ceil(pad / e.du);
    const i0 = Math.floor((L.u - e.u0) / e.du), j0 = Math.floor((L.v - e.v0) / e.dv);
    for (let dj = -r; dj <= r; dj++) {
      for (let di = -r; di <= r; di++) {
        const i = i0 + di, j = j0 + dj;
        if (i >= 0 && j >= 0 && i < e.nu && j < e.nv && e.th[j * e.nu + i] > 0) return true;
      }
    }
    return false;
  }
  GU.raycastWalls = function (ray, far, filter, pad, skip) {
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
        if (e.broken || e.k === 'cover' || (skip && skip.has(e))) continue;
        const p = ray.intersectBox(pad ? padBox.copy(e.box).expandByScalar(pad) : e.box, tmp);
        if (!p) continue;
        if (e.tiled && !tileNear(w, e, p, pad || 0)) continue; // went through a hole
        const d = p.distanceTo(ray.origin);
        if (d <= far && (!best || d < best.dist)) best = { e, wall: w, dist: d, point: p.clone() };
      }
    }
    return best;
  };
})();
