// Physics-ish systems: dropping and throwing things, dragging furniture, smashing and crumpling
// stuff, the chargeable sledgehammer swing, debris/sparks/water particles, and procedurally
// generated sound effects. Loose objects tumble around with the rigid-body engine in rigid.js.
(function () {
  const G = 9.8;
  const down = new THREE.Raycaster();
  const DOWN = new THREE.Vector3(0, -1, 0);
  const v3 = () => new THREE.Vector3();
  const rnd = () => Math.random() - 0.5;
  const rvec = (s) => new THREE.Vector3(rnd() * s, rnd() * s, rnd() * s);

  // ---------- sound ----------
  let ac = null, VOL = 1;
  function audio() {
    if (!ac) { try { ac = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { ac = null; } }
    if (ac && ac.state === 'suspended') ac.resume();
    return ac;
  }
  addEventListener('mousedown', audio);
  function noise(dur, filterFreq, q, gain, decay, type) {
    const a = audio(); if (!a) return;
    const len = Math.floor(a.sampleRate * dur);
    const buf = a.createBuffer(1, len, a.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
    const src = a.createBufferSource(); src.buffer = buf;
    const f = a.createBiquadFilter(); f.type = type || 'lowpass'; f.frequency.value = filterFreq; f.Q.value = q;
    const g = a.createGain(); g.gain.value = gain * VOL;
    src.connect(f); f.connect(g); g.connect(a.destination); src.start();
  }
  function tone(freq, dur, gain, type, slide) {
    const a = audio(); if (!a) return;
    const o = a.createOscillator(), g = a.createGain();
    o.type = type || 'sine'; o.frequency.value = freq;
    if (slide) o.frequency.exponentialRampToValueAtTime(slide, a.currentTime + dur);
    g.gain.setValueAtTime(Math.max(0.002, gain * VOL), a.currentTime); g.gain.exponentialRampToValueAtTime(0.001, a.currentTime + dur);
    o.connect(g); g.connect(a.destination); o.start(); o.stop(a.currentTime + dur);
  }
  // GU.sfx('crack') or GU.sfx('crack', 0.5) for a quieter one
  GU.sfx = function (kind, vol) {
    VOL = vol == null ? 1 : vol;
    switch (kind) {
      case 'swing': noise(0.25, 900, 1, 0.15, 1.5, 'bandpass'); break;
      case 'whoosh': noise(0.4, 500, 0.8, 0.4, 1.2, 'bandpass'); noise(0.3, 1400, 1, 0.1, 2, 'bandpass'); break;
      case 'grip': noise(0.1, 300, 1, 0.15, 2); break;
      case 'thud': noise(0.25, 180, 1, 0.9, 3); tone(70, 0.2, 0.4); break;
      case 'crumble': noise(0.45, 1400, 0.7, 0.6, 2); noise(0.2, 300, 1, 0.5, 3); break;
      case 'crack': noise(0.18, 2500, 2, 0.6, 4, 'bandpass'); tone(160, 0.15, 0.3, 'square', 60); break;
      case 'snap': noise(0.1, 3500, 1.5, 0.8, 5, 'bandpass'); tone(110, 0.25, 0.5, 'square', 40); noise(0.3, 300, 1, 0.5, 3); break;
      case 'clank': tone(880, 0.6, 0.25, 'triangle'); tone(1320, 0.4, 0.12, 'sine'); noise(0.08, 4000, 1, 0.3, 4, 'highpass'); break;
      case 'ring': tone(1100, 0.9, 0.18, 'triangle'); tone(1650, 0.7, 0.1, 'sine'); tone(140, 0.3, 0.3, 'square', 70); break;
      case 'shatter': noise(0.6, 5000, 0.5, 0.6, 1.5, 'highpass'); tone(2400, 0.3, 0.08, 'sine', 3800); break;
      case 'zap': tone(120, 0.35, 0.2, 'sawtooth', 60); noise(0.3, 3000, 1, 0.3, 2, 'highpass'); break;
      case 'splash': noise(0.8, 1200, 0.5, 0.35, 1, 'bandpass'); break;
      case 'click': tone(1800, 0.04, 0.15, 'square'); break;
      case 'drop': noise(0.12, 600, 1, 0.4, 4); break;
      case 'tick': noise(0.05, 2500, 1, 0.25, 5, 'bandpass'); break;
      case 'scrape': noise(0.2, 400, 2, 0.15, 1, 'bandpass'); break;
      case 'cardboard': noise(0.16, 900, 0.8, 0.7, 3); noise(0.25, 250, 1, 0.5, 2); break;
      case 'crunch': noise(0.2, 2500, 1, 0.5, 3, 'bandpass'); tone(400, 0.15, 0.2, 'square', 90); break;
      case 'boing': tone(180, 0.5, 0.35, 'sine', 720); tone(90, 0.4, 0.2, 'triangle', 360); break;
    }
    VOL = 1;
  };
  const MAT_SFX = { wood: 'crack', glass: 'shatter', porcelain: 'shatter', metal: 'clank', fabric: 'thud', plastic: 'crack', paper: 'cardboard' };

  // ---------- particles ----------
  const parts = [];
  const pGeo = new THREE.BoxGeometry(1, 1, 1);
  function particle(pos, color, size, vel, life, glow) {
    if (parts.length > 260) { const old = parts.shift(); old.m.parent && old.m.parent.remove(old.m); }
    const m = new THREE.Mesh(pGeo, glow ? GU.glow(color) : GU.mat(color));
    m.scale.setScalar(size);
    m.position.copy(pos);
    m.rotation.set(Math.random() * 3, Math.random() * 3, 0);
    GU.scene.add(m);
    down.set(new THREE.Vector3(pos.x, pos.y + 0.05, pos.z), DOWN);
    down.far = Infinity;
    const hit = down.intersectObjects(GU.walkables, false)[0];
    parts.push({ m, vel, life, ground: hit ? hit.point.y + size / 2 : 0, glow });
  }
  GU.debris = function (point, color, n, scale) {
    for (let i = 0; i < n; i++) {
      const vel = new THREE.Vector3((Math.random() - 0.5) * 3, Math.random() * 2.5, (Math.random() - 0.5) * 3);
      particle(point, color, (0.02 + Math.random() * 0.05) * (scale || 1), vel, 30);
    }
  };
  GU.sparks = function (point) {
    GU.sfx('zap');
    for (let i = 0; i < 18; i++) particle(point, i % 2 ? '#fff176' : '#ffb300', 0.012, new THREE.Vector3((Math.random() - 0.5) * 5, Math.random() * 3, (Math.random() - 0.5) * 5), 0.6, true);
  };
  // Broken water line: spray for a while and leave a growing puddle.
  GU.leak = function (e) {
    const p = e.box ? e.box.getCenter(v3()) : e.clone();
    GU.sfx('splash');
    GU.say(e.box ? 'You broke a water line! Water sprays out of the wall.' : 'It leaks all over the floor.', 3);
    down.set(new THREE.Vector3(p.x, p.y + 0.1, p.z), DOWN);
    down.far = Infinity;
    const hit = down.intersectObjects(GU.walkables, false)[0];
    const gy = hit ? hit.point.y + 0.006 : 0.006;
    const puddle = GU.plane(GU.scene, 1, 1, p.x, gy, p.z, GU.mat('#3f8fd8', null, { transparent: true, opacity: 0.55, depthWrite: false }), { rx: -Math.PI / 2 });
    let t = 0;
    const max = e.box ? 2.4 : 0.6;
    GU.updaters.push((dt) => {
      if (t > 12) return;
      t += dt;
      const s = Math.min(max, 0.2 + t * 0.25);
      puddle.scale.set(s, s, 1);
      if (e.box && t < 10 && Math.random() < 0.6) particle(p, '#7fc4ff', 0.02, new THREE.Vector3((Math.random() - 0.5) * 2, Math.random() * 1.5, (Math.random() - 0.5) * 2), 1.2, false);
    });
  };

  const isIn = (o, root) => { for (; o; o = o.parent) if (o === root) return true; return false; };
  const movableOf = (o) => { for (; o; o = o.parent) if (o.userData.movable && !o.userData.broken) return o; return null; };
  const breakableOf = (o) => { for (; o; o = o.parent) if ((o.userData.breakable || o.userData.tough) && !o.userData.broken) return o; return null; };
  const bodyHolder = (o) => { for (; o; o = o.parent) if (o.userData.body) return o; return null; };
  GU.movableOf = movableOf;
  GU.breakableOf = breakableOf;

  // ---------- loose things: dropping, throwing, getting knocked around ----------
  function massOf(obj) {
    if (obj.userData.item) {
      if (obj.userData.item.id === 'sledgehammer') return 4.5;
      const s = GU.localBox(obj).getSize(v3());
      return Math.min(8, Math.max(0.08, s.x * s.y * s.z * 350));
    }
    if (obj.userData.movable) return obj.userData.movable.mass;
    return 5;
  }
  // Light enough for the hammer to send flying?
  const canFly = (obj) => !!(obj.userData.item || (obj.userData.movable && obj.userData.movable.mass <= 25));

  // An item that comes to rest on furniture you can drag rides along with it.
  function settle(b) {
    const obj = b.obj;
    if (!obj.userData.item) return;
    down.set(new THREE.Vector3(b.pos.x, b.pos.y, b.pos.z), DOWN);
    down.far = b.R + 0.3;
    for (const h of down.intersectObjects(GU.rayRoots(), true)) {
      if (isIn(h.object, obj) || h.object.userData.noRay || !GU.isShown(h.object)) continue;
      const mov = movableOf(h.object);
      if (mov && !mov.userData.body) mov.attach(obj);
      break;
    }
  }

  function bodyFor(obj, o) {
    const b = obj.userData.breakable;
    const mat = b && b.mat;
    const opts = {
      kind: obj.userData.item ? 'item' : 'prop',
      mass: massOf(obj),
      bounce: mat === 'metal' ? 0.35 : mat === 'paper' || mat === 'fabric' ? 0.12 : 0.28,
      friction: 0.55,
      drag: mat === 'paper' ? 0.15 : 0.05,
      sfx: mat === 'metal' ? 'clank' : mat === 'paper' ? 'cardboard' : mat === 'glass' || mat === 'porcelain' ? 'tick' : 'drop',
      onSleep: settle,
    };
    // glass and china break when they land hard
    if (mat === 'glass' || mat === 'porcelain') {
      opts.onImpact = (body, speed, point) => {
        if (speed > 4.5 && !obj.userData.broken) GU.smash(obj, point, { energy: speed / 3, dir: body.vel.clone().normalize(), speed: speed * 0.3 });
      };
    }
    return GU.rigid.add(obj, Object.assign(opts, o));
  }

  GU.fall = function (obj) {
    bodyFor(obj, { ang: rvec(1.5) });
  };
  GU.throwItem = function (item, pos, vel) {
    GU.dropped.add(item);
    item.position.copy(pos);
    item.updateMatrixWorld(true);
    bodyFor(item, { vel, ang: rvec(8) });
  };

  // Send something flying from a hit at `point`.
  function launch(obj, point, dir, speed) {
    if (grab && grab.obj === obj) GU.stopGrab();
    // stuff sitting on it falls off instead of being glued to it in mid-air
    if (!obj.userData.item) {
      const riders = [];
      obj.traverse((o) => { if (o !== obj && o.userData.item && !o.userData.broken) riders.push(o); });
      for (const r of riders) {
        GU.dropped.attach(r);
        const rb = bodyFor(r, { ang: rvec(4) });
        rb.vel.copy(dir).multiplyScalar(speed * 0.3).add(rvec(1.5));
      }
    }
    const b = bodyFor(obj, {});
    const dv = speed * 1.4 * 4.5 / (4.5 + b.mass);
    const J = dir.clone().multiplyScalar(dv * b.mass);
    J.y += dv * b.mass * 0.25;
    GU.rigid.push(b, point, J);
    return b;
  }

  // ---------- crumpling ----------
  // Split every triangle into 4 until edges are shorter than maxEdge (max 3 rounds), so dents have
  // vertices to push around. Shared edges stay shared, so nothing tears open.
  function subdivide(src, maxEdge) {
    const P0 = src.attributes.position, U0 = src.attributes.uv;
    const pos = Array.from(P0.array), uv = U0 ? Array.from(U0.array) : null;
    let idx = src.index ? Array.from(src.index.array) : [...Array(P0.count).keys()];
    let longest = 0;
    for (let t = 0; t < idx.length; t += 3) {
      for (let e = 0; e < 3; e++) {
        const a = idx[t + e] * 3, b = idx[t + (e + 1) % 3] * 3;
        longest = Math.max(longest, Math.hypot(pos[a] - pos[b], pos[a + 1] - pos[b + 1], pos[a + 2] - pos[b + 2]));
      }
    }
    let levels = Math.min(3, Math.max(0, Math.ceil(Math.log2(longest / maxEdge))));
    while (levels > 0 && idx.length / 3 * Math.pow(4, levels) > 8000) levels--;
    for (let l = 0; l < levels; l++) {
      const cache = new Map(), out = [];
      const mid = (a, b) => {
        const key = a < b ? a * 1e6 + b : b * 1e6 + a;
        let m = cache.get(key);
        if (m === undefined) {
          m = pos.length / 3;
          pos.push((pos[a * 3] + pos[b * 3]) / 2, (pos[a * 3 + 1] + pos[b * 3 + 1]) / 2, (pos[a * 3 + 2] + pos[b * 3 + 2]) / 2);
          if (uv) uv.push((uv[a * 2] + uv[b * 2]) / 2, (uv[a * 2 + 1] + uv[b * 2 + 1]) / 2);
          cache.set(key, m);
        }
        return m;
      };
      for (let t = 0; t < idx.length; t += 3) {
        const a = idx[t], b = idx[t + 1], c = idx[t + 2];
        const ab = mid(a, b), bc = mid(b, c), ca = mid(c, a);
        out.push(a, ab, ca, ab, b, bc, ca, bc, c, ab, bc, ca);
      }
      idx = out;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    if (uv) g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    g.setIndex(idx);
    const f = Math.pow(4, levels);
    for (const gr of src.groups) g.addGroup(gr.start * f, gr.count * f, gr.materialIndex);
    g.computeVertexNormals();
    return g;
  }

  // Dent it in where it was hit and wrinkle it all over. Cardboard, cans, plastic bottles.
  function crumple(obj, point, dir, amount, quiet) {
    obj.updateMatrixWorld(true);
    obj.userData.crumple = (obj.userData.crumple || 0) + amount;
    const inv = new THREE.Matrix4(), p = new THREE.Vector3();
    obj.traverseVisible((m) => {
      if (!m.isMesh) return;
      if (!m.userData.crumpled) { m.geometry = subdivide(m.geometry, 0.05); m.userData.crumpled = true; m.userData.ownGeo = true; }
      const g = m.geometry, P = g.attributes.position;
      inv.copy(m.matrixWorld).invert();
      const c = point.clone().applyMatrix4(inv);
      const d = dir.clone().transformDirection(inv);
      if (!g.boundingSphere) g.computeBoundingSphere();
      const size = g.boundingSphere.radius;
      const R = size * 1.1, depth = size * Math.min(0.5, 0.1 + amount * 0.14);
      const s1 = Math.random() * 100, s2 = Math.random() * 100, s3 = Math.random() * 100;
      const wr = size * 0.035 * Math.min(2, amount), f = 9 / Math.max(0.05, size);
      for (let i = 0; i < P.count; i++) {
        p.fromBufferAttribute(P, i);
        const w = Math.max(0, 1 - p.distanceTo(c) / R);
        p.addScaledVector(d, depth * w * w);
        p.x += Math.sin(p.y * f + s1) * Math.sin(p.z * f * 1.3 + s2) * wr;
        p.y += Math.sin(p.z * f + s2) * Math.sin(p.x * f * 1.1 + s3) * wr;
        p.z += Math.sin(p.x * f + s3) * Math.sin(p.y * f * 1.2 + s1) * wr;
        P.setXYZ(i, p.x, p.y, p.z);
      }
      P.needsUpdate = true;
      g.computeVertexNormals();
      g.computeBoundingBox();
      g.computeBoundingSphere();
    });
    const body = obj.userData.body;
    if (body) body.half.multiplyScalar(0.95);
    if (!quiet) GU.sfx(obj.userData.breakable && obj.userData.breakable.mat === 'metal' ? 'crunch' : 'cardboard', Math.min(1, 0.4 + amount / 2));
  }

  // A stack of moving boxes is one merged mesh. Cut it back into separate boxes (24 vertices each)
  // so the pile topples instead of moving as one block.
  function splitStack(obj, point) {
    if (obj.userData.split) return obj;
    obj.userData.split = true;
    const meshes = [];
    obj.traverse((o) => { if (o.isMesh) meshes.push(o); });
    const blocks = [];
    for (const m of meshes) {
      const g = m.geometry, P = g.attributes.position;
      if (!g.index || P.count % 24 || g.index.count !== P.count * 1.5 || Array.isArray(m.material)) return obj;
      for (let s = 0; s < P.count; s += 24) blocks.push({ m, s });
    }
    if (blocks.length < 2) return obj;
    obj.updateMatrixWorld(true);
    const b = obj.userData.breakable;
    const q = obj.getWorldQuaternion(new THREE.Quaternion());
    const parts = [];
    for (const { m, s } of blocks) {
      const src = m.geometry, g = new THREE.BufferGeometry();
      for (const name of ['position', 'normal', 'uv']) {
        const a = src.attributes[name];
        if (a) g.setAttribute(name, new THREE.Float32BufferAttribute(a.array.slice(s * a.itemSize, (s + 24) * a.itemSize), a.itemSize));
      }
      const idx = [];
      for (let i = s * 1.5; i < (s + 24) * 1.5; i++) idx.push(src.index.getX(i) - s);
      g.setIndex(idx);
      g.computeBoundingBox();
      const c = g.boundingBox.getCenter(v3());
      g.translate(-c.x, -c.y, -c.z);
      const grp = new THREE.Group();
      const mesh = new THREE.Mesh(g, m.material);
      mesh.userData.ownGeo = true;
      grp.add(mesh);
      grp.position.copy(c.applyMatrix4(m.matrixWorld));
      grp.quaternion.copy(q);
      GU.dropped.add(grp);
      grp.userData.breakable = { hp: 3.5, mat: 'paper', color: b.color, name: b.name, cardboard: true };
      grp.userData.movable = { mass: 8, name: b.name };
      grp.userData.split = true;
      grp.userData.interact = obj.userData.interact;
      const col = { box: new THREE.Box3(), owner: grp, enabled: () => !grp.userData.broken && !!grp.parent };
      grp.userData.collider = col;
      GU.dynColliders.push(col);
      GU.refreshCollider(grp);
      parts.push(grp);
    }
    if (grab && grab.obj === obj) GU.stopGrab();
    obj.userData.broken = true;
    obj.parent.remove(obj);
    parts.sort((p1, p2) => p1.position.distanceTo(point) - p2.position.distanceTo(point));
    for (const p of parts.slice(1)) bodyFor(p, { ang: rvec(2) });
    return parts[0];
  }

  // ---------- smashing ----------
  // blow = { energy, dir, speed } (energy in "hits": a sledgehammer tap ~3.2, a full charge ~32)
  const FRAG = { glass: 2.2, porcelain: 1.6, plastic: 1, paper: 0.9, metal: 0.7, wood: 0.8, fabric: 0.6 };
  const CRUMPLY = { paper: 1, plastic: 1, metal: 1 };
  GU.smash = function (obj, point, blow) {
    blow = blow || { energy: 1 };
    const dir = blow.dir || point.clone().sub(GU.player.camera.position).normalize();
    if (obj.userData.tough && !obj.userData.breakable) {
      GU.sfx('clank');
      GU.debris(point, '#cccccc', 2, 0.5);
      GU.say(obj.userData.tough, 3);
      return { hard: true };
    }
    let b = obj.userData.breakable;
    if (b.mat === 'paper' && !b.item) {
      obj = splitStack(obj, point);
      b = obj.userData.breakable;
      if (!b.cardboard) { b.cardboard = true; b.hp = 3.5; }
    }
    const dmg = blow.energy * (FRAG[b.mat] || 1);
    b.hp -= dmg;
    GU.sfx(MAT_SFX[b.mat] || 'thud', Math.min(1, 0.4 + blow.energy / 3));
    GU.debris(point, b.color, 2 + Math.floor(blow.energy), b.mat === 'glass' ? 0.5 : 1);
    if (CRUMPLY[b.mat] && (b.item || b.cardboard)) crumple(obj, point, dir, dmg, true);
    // metal items just get more crushed; everything else breaks when it runs out of hp
    if (b.hp > 0 || (b.mat === 'metal' && b.item)) {
      if (b.hp <= 0) b.hp = 0.01;
      if (b.leak && b.mat === 'metal' && !b.leaked && b.hp < 0.5) { b.leaked = true; GU.leak(point.clone()); }
      if (canFly(obj)) launch(obj, point, dir, blow.speed || 4);
      return {};
    }
    destroy(obj, point, dir, blow);
    return {};
  };

  function firstMat(obj) {
    let m = null;
    obj.traverse((o) => { if (!m && o.isMesh && !Array.isArray(o.material)) m = o.material; });
    return m;
  }

  // Bits that tumble around after something breaks: shards, splinters, cardboard flaps, fluff.
  function pieces(obj, b, box, dir, energy) {
    const size = box.getSize(v3());
    const big = Math.min(0.8, Math.cbrt(Math.max(1e-5, size.x * size.y * size.z)));
    const mat = b.mat, shard = mat === 'glass' || mat === 'porcelain';
    const n = Math.min(10, shard ? 6 + Math.floor(Math.random() * 5) : mat === 'paper' ? 4 + Math.floor(Math.random() * 3) : 3 + Math.floor(Math.random() * 4));
    const col = GU.mat(b.color);
    const mats = mat === 'paper' ? [firstMat(obj) || col, col] : [col, col];
    const clamp = (x) => Math.min(0.6, Math.max(0.015, x));
    for (let i = 0; i < n; i++) {
      const p = new THREE.Vector3(GU.range(Math.random, box.min.x, box.max.x), GU.range(Math.random, box.min.y, box.max.y), GU.range(Math.random, box.min.z, box.max.z));
      let sx, sy, sz;
      if (mat === 'paper') { sx = big * (0.5 + Math.random() * 0.4); sy = big * (0.4 + Math.random() * 0.4); sz = 0.006; }
      else if (mat === 'wood') { sx = big * (0.5 + Math.random() * 0.6); sy = big * 0.15; sz = big * 0.12; }
      else if (shard) { sx = big * (0.15 + Math.random() * 0.25); sy = sx * (0.6 + Math.random() * 0.8); sz = 0.006 + big * 0.02; }
      else { sx = big * (0.2 + Math.random() * 0.3); sy = sx * (0.7 + Math.random() * 0.6); sz = sx * 0.5; }
      const vel = dir.clone().multiplyScalar((1 + Math.random() * 2.5) * Math.min(2, energy)).add(rvec(2)).add(new THREE.Vector3(0, Math.random() * 1.5, 0));
      const ch = GU.rigid.chunk({
        pos: p, sx: clamp(sx), sy: clamp(sy), sz: Math.max(0.005, Math.min(0.3, sz)), mats, vel, ang: rvec(14),
        density: mat === 'fabric' ? 80 : mat === 'paper' ? 300 : 600,
        bounce: shard ? 0.2 : 0.3, drag: mat === 'fabric' ? 1.5 : mat === 'paper' ? 0.8 : 0.1,
        sfx: shard ? 'tick' : mat === 'paper' ? 'none' : 'drop',
      });
      if (mat === 'paper') crumple(ch.obj, ch.pos.clone().add(rvec(0.05)), rvec(1).normalize(), 0.8 + Math.random(), true);
    }
  }

  function destroy(obj, point, dir, blow) {
    const b = obj.userData.breakable;
    obj.userData.broken = true;
    if (grab && grab.obj === obj) grab = null;
    const box = new THREE.Box3().setFromObject(obj);
    const size = box.getSize(v3());
    const n = Math.min(14, 4 + Math.floor((size.x + size.y + size.z) * 4));
    for (let i = 0; i < n; i++) {
      const p = new THREE.Vector3(GU.range(Math.random, box.min.x, box.max.x), GU.range(Math.random, box.min.y, box.max.y), GU.range(Math.random, box.min.z, box.max.z));
      particle(p, b.color, 0.03 + Math.random() * (b.mat === 'glass' ? 0.03 : 0.06), new THREE.Vector3((Math.random() - 0.5) * 2, Math.random() * 1.5, (Math.random() - 0.5) * 2), 40);
    }
    pieces(obj, b, box, dir, blow.energy || 1);
    if (b.leak) GU.leak(point.clone());
    if (b.door) {
      // ripped off its hinges: the opening is now clear
      const st = obj.userData.state;
      if (st) { st.open = true; st.t = 1; }
      GU.say('You smash the ' + b.name + ' right off its hinges.', 2.5);
    } else if (!b.item) {
      GU.say('You destroy the ' + (b.name || 'thing') + '.', 2);
    }
    // anything on/in it falls out
    const loose = [];
    obj.traverse((o) => { if (o !== obj && (o.userData.item || o.userData.movable) && !o.userData.broken) loose.push(o); });
    for (const o of loose) {
      if (isIn(o.parent, obj) && loose.some((p) => p !== o && isIn(o, p))) continue;
      GU.dropped.attach(o);
      const lb = bodyFor(o, { ang: rvec(5) });
      lb.vel.copy(dir).multiplyScalar(Math.random() * 1.5).add(rvec(1.5));
    }
    obj.userData.interact = null;
    obj.parent && obj.parent.remove(obj);
    GU.rigid.wakeNear(point, 1.5);
  }

  // ---------- dragging furniture (G) ----------
  let grab = null;
  GU.grabbing = () => grab;
  GU.startGrab = function (obj, player) {
    if (grab) { GU.stopGrab(); return; }
    if (obj.userData.body) GU.rigid.remove(obj);
    const p = obj.getWorldPosition(v3());
    const off = p.clone().sub(player.pos);
    off.y = 0;
    off.applyAxisAngle(new THREE.Vector3(0, 1, 0), -player.yaw);
    const q = new THREE.Quaternion();
    obj.getWorldQuaternion(q);
    const e = new THREE.Euler().setFromQuaternion(q, 'YXZ');
    grab = { obj, off, yaw0: player.yaw, objYaw0: e.y, y: p.y };
    const mass = obj.userData.movable.mass;
    GU.say((mass > 60 ? 'You put your back into it and drag the ' : 'You grab the ') + (obj.userData.movable.name || 'thing') + '. [G] to let go.', 2.5);
  };
  GU.stopGrab = function () {
    if (!grab) return;
    GU.refreshCollider(grab.obj);
    grab = null;
  };
  function updateGrab(player) {
    if (!grab) return;
    const { obj } = grab;
    if (obj.userData.broken || !obj.parent) { grab = null; return; }
    const prevPos = obj.position.clone(), prevRot = obj.rotation.y;
    const target = grab.off.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), player.yaw).add(player.pos);
    target.y = grab.y;
    const parentQ = new THREE.Quaternion();
    obj.parent.getWorldQuaternion(parentQ);
    const parentYaw = new THREE.Euler().setFromQuaternion(parentQ, 'YXZ').y;
    const lp = obj.parent.worldToLocal(target.clone());
    obj.position.copy(lp);
    obj.rotation.y = grab.objYaw0 + (player.yaw - grab.yaw0) - parentYaw;
    obj.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(obj);
    box.expandByScalar(-0.02);
    box.min.y = Math.max(box.min.y, grab.y + 0.06);
    const hits = GU.queryColliders(box.min, box.max, (owner) => isIn(owner, obj) || isIn(obj, owner));
    const pr = player.radius;
    const hitsPlayer = box.max.x > player.pos.x - pr && box.min.x < player.pos.x + pr && box.max.z > player.pos.z - pr && box.min.z < player.pos.z + pr && box.min.y < player.pos.y + 1.7;
    if (hits.length || hitsPlayer) {
      obj.position.copy(prevPos);
      obj.rotation.y = prevRot;
      obj.updateMatrixWorld(true);
      // too far behind? let go
      if (obj.getWorldPosition(v3()).distanceTo(player.pos) > 3.2) { GU.say('It\'s stuck.', 1.5); GU.stopGrab(); }
    } else if (!prevPos.equals(obj.position) && Math.random() < 0.08) GU.sfx('scrape');
    GU.refreshCollider(obj);
  }

  // ---------- the sledgehammer ----------
  // Hold the mouse button to wind up, let go to swing: the longer the wind-up, the harder it hits.
  // Flick the mouse sideways as you let go for a side swing instead of an overhead one.
  // Poses move the hand pivot (at the grip): p = offset, r = [pitch, yaw, roll] (YXZ order).
  const POSE = {
    rest: { p: [0.08, -0.16, 0], r: [-0.9, -0.25, 0.2] },
    wind: { p: [0.12, -0.05, 0.15], r: [0.6, -0.3, -0.3] },
    strike: { p: [-0.05, -0.04, -0.1], r: [-1.38, 0.05, 0.1] },
    follow: { p: [-0.08, -0.22, -0.05], r: [-2.3, 0.1, 0.15] },
    sideWind: { p: [0.05, -0.08, 0.05], r: [-1.45, -1.6, 0] },
    sideStrike: { p: [0, -0.05, -0.1], r: [-1.4, 0, 0] },
    sideFollow: { p: [-0.05, -0.12, 0], r: [-1.4, 1.5, 0] },
  };
  const mirror = (q, s) => (s > 0 ? q : { p: [-q.p[0], q.p[1], q.p[2]], r: [q.r[0], -q.r[1], -q.r[2]] });
  const copyPose = (q) => ({ p: q.p.slice(), r: q.r.slice() });
  const cur = copyPose(POSE.rest);
  function blend(a, b, t) {
    for (let i = 0; i < 3; i++) {
      cur.p[i] = a.p[i] + (b.p[i] - a.p[i]) * t;
      cur.r[i] = a.r[i] + (b.r[i] - a.r[i]) * t;
    }
  }
  const easeOut = (t) => 1 - (1 - t) * (1 - t);
  const easeIn = (t) => t * t;
  const chargeOf = (t) => easeOut(Math.min(1, t / 1.1));
  const OVER = 3.2; // hold a full charge this long and your arms start shaking

  const SW = { st: 'idle', t: 0, c: 0, kind: 'overhead', sign: 1, E: 0, speed: 0, dur: 0.3, hit: false, halt: false, stop: 0, shake: 0, ring: 0, from: copyPose(POSE.rest), mouse: [], warned: false };

  GU.swingStart = function () {
    if (SW.st !== 'idle' && SW.st !== 'recover') return;
    SW.st = 'charge'; SW.t = 0; SW.warned = false; SW.mouse.length = 0;
    SW.from = copyPose(cur);
    GU.sfx('grip');
  };
  GU.swingMouse = function (dx, dy) {
    if (SW.st !== 'charge') return;
    const now = performance.now();
    SW.mouse.push([now, dx, dy]);
    while (SW.mouse.length && now - SW.mouse[0][0] > 150) SW.mouse.shift();
  };
  GU.swingRelease = function () {
    if (SW.st !== 'charge') return;
    let dx = 0, dy = 0;
    const now = performance.now();
    for (const [t, x, y] of SW.mouse) if (now - t < 150) { dx += x; dy += y; }
    SW.mouse.length = 0;
    const c = chargeOf(SW.t), flick = Math.min(1, Math.hypot(dx, dy) / 220), over = SW.t > OVER;
    SW.kind = Math.abs(dx) > 30 && Math.abs(dx) > Math.abs(dy) * 1.2 ? 'side' : 'overhead';
    SW.sign = dx < 0 ? 1 : -1; // flick left: swing from right to left
    SW.c = c;
    // a tap hits like a solid full swing; a full charge is ten times that
    SW.E = (3.2 + 28.8 * Math.pow(c, 1.3)) * (1 + 0.25 * flick) * (over ? 1.35 : 1);
    SW.speed = 14 * Math.sqrt(SW.E / 3.2);
    SW.dur = 0.34 - 0.12 * c;
    SW.over = over;
    SW.st = 'swing'; SW.t = 0; SW.hit = false; SW.halt = false; SW.stop = 0;
    SW.from = copyPose(cur);
    GU.sfx('whoosh', 0.3 + 0.7 * c);
  };

  // The moment the head arrives: what's in front of the crosshair takes the blow.
  function strike(player) {
    const cam = player.camera;
    const r = new THREE.Raycaster();
    r.setFromCamera(new THREE.Vector2(0, 0), cam);
    const aim = r.ray.direction.clone();
    const right = new THREE.Vector3(1, 0, 0).applyQuaternion(cam.quaternion);
    const dir = aim.clone();
    if (SW.kind === 'overhead') dir.y -= 0.35; else dir.addScaledVector(right, -0.45 * SW.sign);
    dir.normalize();
    const blow = { energy: SW.E, speed: SW.speed, dir, aim, kind: SW.kind };
    const reach = 2.1;
    const wh = GU.raycastWalls(r.ray, reach, null, 0.05);
    let oh = null;
    r.far = reach;
    for (const h of r.intersectObjects(GU.rayRoots(), true)) {
      if (h.object.userData.noRay || !GU.isShown(h.object)) continue;
      oh = h;
      break;
    }
    if (wh && (!oh || wh.dist < oh.distance)) {
      const res = GU.wallStrike(wh, blow);
      return { hard: res.hard, stopped: res.left < 0.25 };
    }
    if (!oh) return null;
    const t = breakableOf(oh.object);
    if (t) {
      const res = GU.smash(t, oh.point, blow) || {};
      return { hard: !!res.hard, stopped: !!res.hard || !canFly(t) };
    }
    const holder = bodyHolder(oh.object);
    const mov = movableOf(oh.object);
    if (holder || (mov && canFly(mov))) {
      // loose debris (or a rug): golf it
      const obj = holder || mov;
      const b = holder ? holder.userData.body : bodyFor(obj, {});
      const dv = SW.speed * 1.4 * 4.5 / (4.5 + b.mass);
      GU.rigid.push(b, oh.point, dir.clone().multiplyScalar(dv * b.mass).add(new THREE.Vector3(0, dv * b.mass * 0.3, 0)));
      GU.sfx('thud', 0.5);
      return { stopped: false };
    }
    const s = oh.object.userData.surface;
    GU.sfx('thud');
    GU.debris(oh.point, '#9a9a94', 2 + Math.floor(SW.E), 0.5);
    if (s === 'floor') GU.say('Concrete slab under the flooring. The hammer bounces right back.', 2.5);
    else if (s === 'ceiling') GU.say('You can\'t get a good swing straight up at the ceiling.', 2.5);
    else if (s === 'counter') GU.say('Solid stone countertop. Not a scratch.', 2.5);
    return { hard: s === 'floor' || s === 'counter', stopped: true };
  }

  function updateSwing(dt, player) {
    const hand = GU.hand, cam = player.camera;
    hand.rotation.order = 'YXZ';
    if (!player.hasHammer()) {
      SW.st = 'idle';
      hand.rotation.set(0, 0, 0);
      hand.position.x = 0.2; hand.position.z = -0.5;
      GU.handLift = 0;
    } else {
      let shakeHand = 0;
      switch (SW.st) {
        case 'idle': {
          blend(cur, POSE.rest, Math.min(1, dt * 8));
          break;
        }
        case 'charge': {
          if (!GU.locked) { SW.st = 'recover'; SW.t = 0; SW.from = copyPose(cur); break; }
          SW.t += dt;
          const c = chargeOf(SW.t);
          blend(SW.from, POSE.wind, easeOut(Math.min(1, SW.t / 0.35)));
          shakeHand = 0.003 + 0.012 * c * c + (SW.t > OVER ? 0.02 + Math.min(0.03, (SW.t - OVER) * 0.01) : 0);
          if (SW.t > OVER && !SW.warned) { SW.warned = true; GU.say('Your arms are shaking. LET IT RIP.', 2); }
          break;
        }
        case 'swing': {
          if (SW.stop > 0) { SW.stop -= dt; break; } // hit-stop: freeze for a beat on impact
          if (SW.halt) { SW.st = 'recover'; SW.t = 0; SW.from = copyPose(cur); break; }
          SW.t += dt;
          const p = Math.min(1, SW.t / SW.dur);
          let at;
          if (SW.kind === 'overhead') {
            at = 0.5;
            if (p < 0.5) blend(SW.from, POSE.strike, easeIn(p / 0.5));
            else blend(POSE.strike, POSE.follow, easeOut((p - 0.5) / 0.5));
          } else {
            at = 0.55;
            const w = mirror(POSE.sideWind, SW.sign), s = mirror(POSE.sideStrike, SW.sign), f = mirror(POSE.sideFollow, SW.sign);
            if (p < 0.2) blend(SW.from, w, easeOut(p / 0.2));
            else if (p < 0.55) blend(w, s, easeIn((p - 0.2) / 0.35));
            else blend(s, f, easeOut((p - 0.55) / 0.45));
          }
          if (!SW.hit && p >= at) {
            SW.hit = true;
            const res = strike(player);
            if (!res) {
              // whiffed it: a big swing drags you around with it
              if (SW.c > 0.5) {
                if (SW.kind === 'side') player.yaw += SW.sign * 0.25 * SW.c * (SW.over ? 3 : 1);
                else player.pitch = Math.max(-1.5, player.pitch - 0.15 * SW.c);
              }
            } else if (res.hard) {
              SW.st = 'recoil'; SW.t = 0; SW.from = copyPose(cur);
              SW.shake = 0.6 + 0.6 * SW.c; SW.ring = 0.25 + 0.5 * SW.c;
              GU.sfx('ring', 0.4 + 0.6 * SW.c);
            } else {
              SW.stop = 0.05 + 0.2 * SW.c;
              SW.shake = 0.3 + 0.9 * SW.c;
              SW.halt = res.stopped;
            }
          }
          if (SW.st === 'swing' && p >= 1) { SW.st = 'recover'; SW.t = 0; SW.from = copyPose(cur); }
          break;
        }
        case 'recoil': {
          // bounced off: the hammer kicks back up toward you
          SW.t += dt;
          const p = Math.min(1, SW.t / 0.22);
          blend(SW.from, POSE.wind, easeOut(p) * 0.6);
          if (p >= 1) { SW.st = 'recover'; SW.t = 0; SW.from = copyPose(cur); }
          break;
        }
        case 'recover': {
          SW.t += dt;
          const p = Math.min(1, SW.t / (0.3 + 0.25 * SW.c));
          blend(SW.from, POSE.rest, p * p * (3 - 2 * p));
          if (p >= 1) SW.st = 'idle';
          break;
        }
      }
      if (SW.ring > 0) { shakeHand += SW.ring * 0.04; SW.ring = Math.max(0, SW.ring - dt); }
      hand.rotation.set(cur.r[0] + rnd() * shakeHand * 2, cur.r[1] + rnd() * shakeHand * 2, cur.r[2] + rnd() * shakeHand * 2);
      hand.position.x = 0.2 + cur.p[0] + rnd() * shakeHand;
      hand.position.z = -0.5 + cur.p[2];
      GU.handLift = cur.p[1] + rnd() * shakeHand;
    }
    // screen shake + zoom while winding up
    if (SW.shake > 0.002) {
      cam.rotation.x += rnd() * SW.shake * 0.06;
      cam.rotation.y += rnd() * SW.shake * 0.06;
      cam.position.y += rnd() * SW.shake * 0.03;
      cam.updateMatrixWorld();
      SW.shake *= Math.pow(0.004, dt);
    }
    const charging = SW.st === 'charge';
    const want = charging ? 72 - 8 * chargeOf(SW.t) : 72;
    if (Math.abs(cam.fov - want) > 0.05) { cam.fov += (want - cam.fov) * Math.min(1, dt * 10); cam.updateProjectionMatrix(); }
    const bar = document.getElementById('charge');
    if (bar) {
      bar.style.display = charging ? 'block' : 'none';
      if (charging && bar.firstChild) {
        bar.firstChild.style.width = Math.round(chargeOf(SW.t) * 100) + '%';
        bar.className = 'hud' + (SW.t > OVER ? ' over' : SW.t > 1.1 ? ' full' : '');
      }
    }
  }
  GU.swingCharging = () => SW.st === 'charge';

  // ---------- per-frame ----------
  GU.physicsUpdate = function (dt, player) {
    GU.rigid.update(dt, player);
    updateGrab(player);
    for (let i = parts.length - 1; i >= 0; i--) {
      const p = parts[i];
      p.life -= dt;
      if (p.life <= 0) { p.m.parent && p.m.parent.remove(p.m); parts.splice(i, 1); continue; }
      if (p.vel) {
        p.vel.y -= G * dt;
        p.m.position.addScaledVector(p.vel, dt);
        if (p.m.position.y <= p.ground) {
          p.m.position.y = p.ground;
          if (p.glow) p.life = 0; else p.vel = null;
        }
      }
    }
    updateSwing(dt, player);
  };
})();
