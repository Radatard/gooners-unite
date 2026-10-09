// Janky rigid-body physics for loose stuff: wall chunks, snapped studs, boxes, items, light furniture.
//
// Every body is an oriented box. Only its 8 corners collide (with the floor, the ceiling and every
// collider box in the world), and bodies bump each other as spheres. It's cheap and mostly
// believable, with the occasional deranged moment. Turn the deranged part up or down with GU.JANK.
//
// Use it:
//   GU.rigid.add(obj, { vel, ang, mass, bounce, friction, drag, kind, sfx, onSleep })  -> body
//   GU.rigid.push(body, worldPoint, impulseVector)   // whack it
//   GU.rigid.chunk({ pos, rotY, sx, sy, sz, mats, vel, ... })  // spawn a jagged debris chunk
// Bodies live in GU.dropped. Pick one up / reparent it and it stops being simulated.
(function () {
  const G = 9.8;
  GU.JANK = {
    superBounce: 0.03, // chance a hard impact goes BOING
    spinKick: 0.7,     // random spin added on impacts
    twitch: 0.04,      // chance per second that something asleep twitches by itself
    wallDamage: true,  // fast flying things break drywall
  };
  const MAX_DEBRIS = 90; // past this, the oldest debris gets cleaned up
  const SUB = 3;         // substeps per frame

  const bodies = [];
  const events = [];
  const v1 = new THREE.Vector3(), v2 = new THREE.Vector3(), v3 = new THREE.Vector3();
  const qd = new THREE.Quaternion();
  const down = new THREE.Raycaster(), up = new THREE.Raycaster();
  const DOWN = new THREE.Vector3(0, -1, 0), UP = new THREE.Vector3(0, 1, 0);
  const isIn = (o, root) => { for (; o; o = o.parent) if (o === root) return true; return false; };
  let ceilings = null;

  // Bounding box of an object's visible meshes, in the object's own (unscaled) space.
  function localBox(obj) {
    obj.updateMatrixWorld(true);
    const inv = obj.matrixWorld.clone().invert(), m = new THREE.Matrix4();
    const box = new THREE.Box3(), gb = new THREE.Box3();
    obj.traverseVisible((o) => {
      if (!o.isMesh) return;
      if (!o.geometry.boundingBox) o.geometry.computeBoundingBox();
      gb.copy(o.geometry.boundingBox).applyMatrix4(m.multiplyMatrices(inv, o.matrixWorld));
      box.union(gb);
    });
    if (box.isEmpty()) box.set(new THREE.Vector3(-0.05, -0.05, -0.05), new THREE.Vector3(0.05, 0.05, 0.05));
    return box;
  }
  GU.localBox = localBox;

  class Body {
    constructor(obj, o) {
      this.obj = obj;
      const lb = o.box || localBox(obj);
      const s = obj.scale;
      const size = lb.getSize(v1);
      this.half = new THREE.Vector3(Math.max(0.008, size.x * s.x / 2), Math.max(0.008, size.y * s.y / 2), Math.max(0.008, size.z * s.z / 2));
      this.off = lb.getCenter(new THREE.Vector3()).multiply(s);
      this.q = obj.quaternion.clone();
      this.pos = obj.position.clone().add(this.off.clone().applyQuaternion(this.q));
      this.vel = o.vel ? o.vel.clone() : new THREE.Vector3();
      this.ang = o.ang ? o.ang.clone() : new THREE.Vector3();
      const h = this.half;
      this.mass = o.mass || Math.max(0.05, 8 * h.x * h.y * h.z * (o.density || 400));
      this.invM = 1 / this.mass;
      this.invI = 9 / (2 * this.mass * (h.x * h.x + h.y * h.y + h.z * h.z));
      this.r = (h.x + h.y + h.z) / 3;
      this.R = h.length();
      this.e = o.bounce != null ? o.bounce : 0.3;
      this.mu = o.friction != null ? o.friction : 0.5;
      this.drag = o.drag || 0.05;
      this.kind = o.kind || 'debris';
      this.sfx = o.sfx || 'drop';
      this.onSleep = o.onSleep || null;
      this.onImpact = o.onImpact || null;
      this.asleep = false;
      this.still = 0;
      this.born = performance.now();
      this.qpos = null; // where the floor/ceiling were last looked up
      this.ground = -5;
      this.ceil = 50;
      this.near = [];
      this.nearT = 0;
      this.colT = 0;
    }

    corner(i, out) {
      const h = this.half;
      out.set(i & 1 ? h.x : -h.x, i & 2 ? h.y : -h.y, i & 4 ? h.z : -h.z).applyQuaternion(this.q).add(this.pos);
      return out;
    }

    wake() { this.asleep = false; this.still = 0; this.restQ = null; }

    // Copy the simulated transform onto the object.
    sync() {
      this.obj.quaternion.copy(this.q);
      this.obj.position.copy(this.pos).sub(v1.copy(this.off).applyQuaternion(this.q));
    }
  }

  // ---------- impulses ----------
  function applyImpulse(b, point, J) {
    b.vel.addScaledVector(J, b.invM);
    const r = v3.copy(point).sub(b.pos);
    b.ang.addScaledVector(r.cross(J), b.invI);
  }

  let lastSound = 0;
  function impactSound(b, speed) {
    const now = performance.now();
    if (now - lastSound < 35 || speed < 1.2) return;
    lastSound = now;
    GU.sfx && GU.sfx(b.sfx, Math.min(1, speed / 6) * (b.mass < 0.3 ? 0.5 : 1));
  }

  // One corner touching something: push it out and bounce it.
  function contact(b, c, n, depth, col) {
    b.pos.addScaledVector(n, depth * 0.7);
    b.touch = true;
    // friction against spinning flat on a surface (the single contact point can't provide it)
    b.ang.addScaledVector(n, -b.ang.dot(n) * Math.min(1, b.mu * 0.5));
    const r = v2.copy(c).sub(b.pos);
    const vr = v1.copy(b.ang).cross(r).add(b.vel);
    const vn = vr.dot(n);
    if (vn >= 0) return;
    const rn = r.clone().cross(n);
    const k = b.invM + b.invI * rn.lengthSq();
    let e = -vn < 0.7 ? 0 : b.e;
    if (-vn > 3 && Math.random() < GU.JANK.superBounce) {
      e = 1.8;
      GU.sfx && GU.sfx('boing');
    }
    const j = -(1 + e) * vn / k;
    const vt = vr.clone().addScaledVector(n, -vn);
    applyImpulse(b, c, n.clone().multiplyScalar(j));
    const vtl = vt.length();
    if (vtl > 1e-4) {
      vt.divideScalar(vtl);
      const rt = v2.copy(c).sub(b.pos).cross(vt);
      const kt = b.invM + b.invI * rt.lengthSq();
      const jt = Math.min(vtl / kt, b.mu * j);
      applyImpulse(b, c, vt.multiplyScalar(-jt));
    }
    if (-vn > 1.5) {
      impactSound(b, -vn);
      const kick = GU.JANK.spinKick * Math.min(-vn, 6) * 0.25;
      b.ang.x += (Math.random() - 0.5) * kick; b.ang.y += (Math.random() - 0.5) * kick; b.ang.z += (Math.random() - 0.5) * kick;
      // run these after the step: they can break things and spawn more bodies
      // (once per body per frame, or one landing would count four times, once per corner)
      if (!b.hitNow) {
        b.hitNow = true;
        const sp = -vn, at = c.clone();
        if (b.onImpact) events.push(() => b.onImpact(b, sp, at));
        if (col) events.push(() => hitCollider(b, sp, at, col));
      }
    }
  }

  // Fast things hitting walls / glass do damage.
  function hitCollider(b, speed, point, col) {
    const ke = 0.5 * b.mass * speed * speed;
    if (col.el && GU.JANK.wallDamage && ke > 30 && (b.kind !== 'debris' || b.mass > 0.5) && GU.wallImpact) {
      GU.wallImpact(col.el, point, ke / 70, b.vel.lengthSq() > 1e-6 ? b.vel.clone().normalize() : new THREE.Vector3(0, -1, 0));
    } else if (col.owner && speed > 4 && GU.breakableOf) {
      const t = GU.breakableOf(col.owner);
      if (t && t.userData.breakable && t.userData.breakable.mat === 'glass' && GU.smash) GU.smash(t, point, { energy: ke / 40, dir: b.vel.clone().normalize(), speed });
    }
  }

  // Which way out of a box a point should go, given where it came from.
  function boxNormal(c, prev, bx, n) {
    const mn = bx.min, mx = bx.max;
    if (prev && !(prev.x > mn.x && prev.x < mx.x && prev.y > mn.y && prev.y < mx.y && prev.z > mn.z && prev.z < mx.z)) {
      // entered this step: leave through the face it came in by (stops tunnelling through drywall)
      let best = -1, axis = null, sign = 0;
      const d = v3.copy(c).sub(prev);
      for (const ax of ['x', 'y', 'z']) {
        const len = Math.abs(d[ax]) || 1e-6;
        if (prev[ax] <= mn[ax]) { const t = (mn[ax] - prev[ax]) / len; if (t > best) { best = t; axis = ax; sign = -1; } }
        else if (prev[ax] >= mx[ax]) { const t = (prev[ax] - mx[ax]) / len; if (t > best) { best = t; axis = ax; sign = 1; } }
      }
      if (axis) {
        n.set(0, 0, 0)[axis] = sign;
        return sign < 0 ? c[axis] - mn[axis] : mx[axis] - c[axis];
      }
    }
    const pen = [c.x - mn.x, mx.x - c.x, c.y - mn.y, mx.y - c.y, c.z - mn.z, mx.z - c.z];
    let k = 0;
    for (let i = 1; i < 6; i++) if (pen[i] < pen[k]) k = i;
    n.set(0, 0, 0);
    n[['x', 'x', 'y', 'y', 'z', 'z'][k]] = k % 2 ? 1 : -1;
    return pen[k];
  }

  // Segment prev->c passes through the box? (fast corners skipping over thin walls)
  function crosses(prev, c, bx) {
    let t0 = 0, t1 = 1;
    for (const ax of ['x', 'y', 'z']) {
      const d = c[ax] - prev[ax];
      if (Math.abs(d) < 1e-9) { if (prev[ax] < bx.min[ax] || prev[ax] > bx.max[ax]) return false; continue; }
      let a = (bx.min[ax] - prev[ax]) / d, z = (bx.max[ax] - prev[ax]) / d;
      if (a > z) { const t = a; a = z; z = t; }
      t0 = Math.max(t0, a); t1 = Math.min(t1, z);
      if (t0 > t1) return false;
    }
    return true;
  }

  // Floor and ceiling height around a body (cached on a 25 cm grid: floors don't move).
  const fcache = new Map();
  function lookAround(b) {
    if (b.qpos && b.qpos.distanceToSquared(b.pos) < 0.06) return;
    b.qpos = (b.qpos || new THREE.Vector3()).copy(b.pos);
    const key = Math.round(b.pos.x * 4) + ',' + Math.round(b.pos.z * 4) + ',' + Math.floor(b.pos.y * 2);
    let f = fcache.get(key);
    if (!f) {
      down.set(v1.set(b.pos.x, b.pos.y + 0.3, b.pos.z), DOWN);
      down.far = 20;
      const hit = down.intersectObjects(GU.walkables, false)[0];
      if (!ceilings) { ceilings = []; GU.scene.traverse((o) => { if (o.userData.surface === 'ceiling') ceilings.push(o); }); }
      up.set(v1.set(b.pos.x, b.pos.y - 0.2, b.pos.z), UP);
      up.far = 20;
      const ch = up.intersectObjects(ceilings, false)[0];
      f = { ground: hit ? hit.point.y : null, ceil: ch ? ch.point.y : 50 };
      fcache.set(key, f);
    }
    if (f.ground !== null) b.ground = f.ground;
    b.ceil = f.ceil;
  }

  const corners = Array.from({ length: 8 }, () => new THREE.Vector3());
  const prevs = Array.from({ length: 8 }, () => new THREE.Vector3());
  const n = new THREE.Vector3();
  const aabbMin = new THREE.Vector3(), aabbMax = new THREE.Vector3(), cand = [];
  const pool = Array.from({ length: 16 }, () => ({ p: new THREE.Vector3(), k: 0, n: new THREE.Vector3(), depth: 0, col: null }));
  let ng = 0;
  function addContact(c, nx, ny, nz, depth, col) {
    for (let i = 0; i < ng; i++) {
      const g = pool[i];
      if (g.col === col && g.n.x === nx && g.n.y === ny && g.n.z === nz) { g.p.add(c); g.k++; if (depth > g.depth) g.depth = depth; return; }
    }
    if (ng >= pool.length) return;
    const g = pool[ng++];
    g.p.copy(c); g.k = 1; g.n.set(nx, ny, nz); g.depth = depth; g.col = col;
  }
  function step(b, h, fast) {
    b.vel.y -= G * h;
    b.vel.multiplyScalar(1 - b.drag * h);
    b.ang.multiplyScalar(1 - 0.6 * h);
    if (fast) for (let i = 0; i < 8; i++) b.corner(i, prevs[i]);
    b.pos.addScaledVector(b.vel, h);
    const w = b.ang.length();
    if (w > 1e-6) {
      qd.setFromAxisAngle(v1.copy(b.ang).divideScalar(w), w * h);
      b.q.premultiply(qd).normalize();
    }
    b.touch = false;
    // only colliders overlapping the box this step (and where it was) are worth testing corners against
    const mn = aabbMin.set(Infinity, Infinity, Infinity), mx = aabbMax.set(-Infinity, -Infinity, -Infinity);
    for (let i = 0; i < 8; i++) {
      const c = b.corner(i, corners[i]);
      mn.min(c); mx.max(c);
      if (fast) { mn.min(prevs[i]); mx.max(prevs[i]); }
    }
    cand.length = 0;
    for (const col of b.near) {
      const bx = col.box;
      if (bx.max.x < mn.x || bx.min.x > mx.x || bx.max.y < mn.y || bx.min.y > mx.y || bx.max.z < mn.z || bx.min.z > mx.z) continue;
      if (col.enabled && !col.enabled()) continue;
      cand.push(col);
    }
    // Collect touching corners, then resolve each surface once at the middle of the corners
    // touching it, so a box lying flat doesn't get kicked into a spin by each corner in turn.
    ng = 0;
    for (let i = 0; i < 8; i++) {
      const c = corners[i];
      if (c.y < b.ground) addContact(c, 0, 1, 0, b.ground - c.y, null);
      else if (c.y > b.ceil) addContact(c, 0, -1, 0, c.y - b.ceil, null);
      for (const col of cand) {
        const bx = col.box;
        const prev = fast ? prevs[i] : null;
        const inside = c.x > bx.min.x && c.x < bx.max.x && c.y > bx.min.y && c.y < bx.max.y && c.z > bx.min.z && c.z < bx.max.z;
        if (!inside && !(prev && crosses(prev, c, bx))) continue;
        const depth = boxNormal(c, prev, bx, n);
        addContact(c, n.x, n.y, n.z, Math.max(0, depth), col);
      }
    }
    for (let i = 0; i < ng; i++) { const g = pool[i]; contact(b, g.p.divideScalar(g.k), g.n, g.depth, g.col); }
    // resting on something and barely moving: bleed off the jitter so it can fall asleep
    if (b.touch && b.vel.lengthSq() < 0.6) {
      b.ang.multiplyScalar(0.9);
      b.vel.x *= 0.94; b.vel.z *= 0.94;
    }
  }

  // Spheres between bodies. Squishy, stacks wobble. That's fine.
  function bump(a, b) {
    const d = v1.copy(b.pos).sub(a.pos);
    const dist = d.length(), min = (a.r + b.r) * 0.95;
    if (dist >= min || dist < 1e-5) return;
    d.divideScalar(dist);
    const over = min - dist, tm = a.invM + b.invM;
    a.pos.addScaledVector(d, -over * a.invM / tm);
    b.pos.addScaledVector(d, over * b.invM / tm);
    const vn = v2.copy(b.vel).sub(a.vel).dot(d);
    if (vn < 0) {
      const j = -1.2 * vn / tm;
      a.vel.addScaledVector(d, -j * a.invM);
      b.vel.addScaledVector(d, j * b.invM);
      if (-vn > 0.4) { a.wake(); b.wake(); }
    }
  }

  // Walking into small stuff kicks it.
  const lastP = new THREE.Vector3();
  let pvel = new THREE.Vector3();
  function kicks(player, dt) {
    if (dt > 0) pvel = v2.copy(player.pos).sub(lastP).divideScalar(dt).clone();
    lastP.copy(player.pos);
    const sp = Math.hypot(pvel.x, pvel.z);
    for (const b of bodies) {
      if (b.mass > 30) continue;
      const dx = b.pos.x - player.pos.x, dz = b.pos.z - player.pos.z;
      const dist = Math.hypot(dx, dz), min = player.radius + b.r;
      if (dist > min || b.pos.y - b.r > player.pos.y + 1.6 || b.pos.y + b.r < player.pos.y) continue;
      const nx = dist > 1e-4 ? dx / dist : 1, nz = dist > 1e-4 ? dz / dist : 0;
      b.wake();
      b.pos.x += nx * (min - dist);
      b.pos.z += nz * (min - dist);
      const k = Math.max(0.6, sp * 1.3) / Math.max(1, b.mass * 0.4);
      if (b.vel.x * nx + b.vel.z * nz < k) {
        b.vel.x += nx * k; b.vel.z += nz * k;
        b.vel.y += sp * 0.35 / Math.max(1, b.mass * 0.4);
        b.ang.x += (Math.random() - 0.5) * 4; b.ang.z += (Math.random() - 0.5) * 4;
      }
    }
  }

  function removeAt(i, destroyMesh) {
    const b = bodies[i];
    bodies.splice(i, 1);
    if (b.obj.userData.body === b) b.obj.userData.body = null;
    if (destroyMesh && b.obj.parent) {
      b.obj.parent.remove(b.obj);
      if (b.obj.userData.ownGeo) b.obj.geometry.dispose();
    }
  }

  GU.rigid = {
    bodies,
    add(obj, o) {
      o = o || {};
      if (obj.userData.body) { const b = obj.userData.body; b.wake(); if (o.vel) b.vel.add(o.vel); return b; }
      if (obj.parent !== GU.dropped) GU.dropped.attach(obj);
      const b = new Body(obj, o);
      obj.userData.body = b;
      bodies.push(b);
      if (b.kind === 'debris') {
        let debris = 0;
        for (const x of bodies) if (x.kind === 'debris') debris++;
        for (let i = 0; i < bodies.length && debris > MAX_DEBRIS; i++) {
          if (bodies[i].kind === 'debris' && bodies[i] !== b) { removeAt(i, true); i--; debris--; }
        }
      }
      return b;
    },
    bodyOf: (obj) => obj.userData.body || null,
    // Stop simulating it (it stays where it is).
    remove(obj) {
      const i = bodies.indexOf(obj.userData.body);
      if (i >= 0) removeAt(i, false);
    },
    push(b, point, J) { b.wake(); applyImpulse(b, point, J); },
    wakeNear(p, r) { for (const b of bodies) if (b.pos.distanceTo(p) < r + b.R) b.wake(); },

    // A jagged chunk of something (drywall, wood, glass...). mats = [faces, edges].
    chunk(o) {
      const geo = GU.rigid.shape(o.round);
      const m = new THREE.Mesh(geo, o.mats);
      m.scale.set(o.sx, o.sy, o.sz);
      m.position.copy(o.pos);
      if (o.rotY) m.rotation.y = o.rotY;
      if (o.spin !== false) m.rotation.z = Math.random() * Math.PI * 2;
      GU.dropped.add(m);
      m.updateMatrixWorld(true);
      return GU.rigid.add(m, Object.assign({ kind: 'debris', box: geo.boundingBox }, o, { vel: o.vel }));
    },
    shape: null,

    update(dt, player) {
      kicks(player, dt);
      // things asleep sometimes twitch. nobody knows why
      if (bodies.length && Math.random() < GU.JANK.twitch * dt) {
        const b = bodies[Math.floor(Math.random() * bodies.length)];
        if (b.asleep && b.mass < 20 && b.pos.distanceTo(player.pos) < 8) {
          b.wake();
          b.vel.y += 1.5 + Math.random() * 2;
          b.ang.set((Math.random() - 0.5) * 12, (Math.random() - 0.5) * 12, (Math.random() - 0.5) * 12);
        }
      }
      const h = dt / SUB;
      for (let i = bodies.length - 1; i >= 0; i--) {
        const b = bodies[i];
        if (b.obj.parent !== GU.dropped) { removeAt(i, false); continue; }
        if (b.asleep) continue;
        b.hitNow = false;
        lookAround(b);
        b.nearT -= dt;
        // nearby colliders: slow things look 0.1 s ahead every 0.1 s, fast ones just this frame, every frame
        if (b.nearT <= 0) {
          const sp = b.vel.length(), fastNow = sp > 4;
          const reach = b.R + 0.08 + (fastNow ? Math.min(sp, 30) * dt * 1.3 : sp * 0.12);
          const obj = b.obj;
          b.near = GU.queryColliders(v1.copy(b.pos).subScalar(reach), v2.copy(b.pos).addScalar(reach), (owner) => isIn(owner, obj))
            .filter((c) => !c.box.containsPoint(b.pos));
          b.nearT = fastNow ? 0 : 0.1;
        }
        const fast = b.vel.lengthSq() > 2;
        for (let s = 0; s < SUB; s++) step(b, h, fast);
        // fell out of the world? put it back on the floor (it happens)
        if (b.pos.y < b.ground - 1.5) { b.pos.y = b.ground + b.R + 0.05; b.vel.set(0, 0, 0); }
        if (b.vel.lengthSq() > 900) b.vel.setLength(30);
        b.sync();
        if (b.obj.userData.collider && (b.colT -= dt) <= 0) { b.colT = 0.2; GU.refreshCollider(b.obj); }
        // asleep once it's stopped going anywhere (thin things can rock in place forever otherwise)
        if (!b.restQ || b.pos.distanceToSquared(b.restP) > 0.0003 || b.q.angleTo(b.restQ) > 0.08) {
          b.restP = (b.restP || new THREE.Vector3()).copy(b.pos);
          b.restQ = (b.restQ || new THREE.Quaternion()).copy(b.q);
          b.restT = 0;
        } else b.restT += dt;
        if ((b.vel.lengthSq() < 0.04 && b.ang.lengthSq() < 0.25) || b.restT > 0.6) {
          b.still += dt;
          if (b.still > 0.45 || b.restT > 0.6) {
            b.asleep = true;
            b.vel.set(0, 0, 0); b.ang.set(0, 0, 0);
            if (b.obj.userData.collider) GU.refreshCollider(b.obj);
            if (b.onSleep) b.onSleep(b);
          }
        } else b.still = 0;
      }
      for (let i = 0; i < bodies.length; i++) {
        const a = bodies[i];
        for (let j = i + 1; j < bodies.length; j++) {
          const b = bodies[j];
          if (a.asleep && b.asleep) continue;
          if (Math.abs(a.pos.x - b.pos.x) > a.R + b.R || Math.abs(a.pos.z - b.pos.z) > a.R + b.R) continue;
          bump(a, b);
        }
      }
      const ev = events.splice(0, events.length);
      for (const f of ev) f();
    },
  };

  // A few dozen random jagged slabs, extruded along z, roughly 1 x 1 x 1. Scaled per chunk.
  const shapes = [];
  GU.rigid.shape = function (round) {
    if (!shapes.length) {
      const rng = GU.makeRng(1234);
      for (let s = 0; s < 24; s++) {
        const sh = new THREE.Shape();
        const k = 5 + Math.floor(rng() * 4);
        const a0 = rng() * 6.28;
        for (let i = 0; i < k; i++) {
          const a = a0 + (i / k) * Math.PI * 2 + (rng() - 0.5) * 0.6;
          const r = 0.32 + rng() * 0.22;
          const x = Math.cos(a) * r, y = Math.sin(a) * r;
          if (i) sh.lineTo(x, y); else sh.moveTo(x, y);
        }
        sh.closePath();
        const g = new THREE.ExtrudeGeometry(sh, { depth: 1, bevelEnabled: false });
        g.translate(0, 0, -0.5);
        g.computeBoundingBox();
        shapes.push(g);
      }
    }
    return shapes[Math.floor(Math.random() * shapes.length)];
  };
})();
