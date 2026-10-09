// Physics-ish systems: things falling, throwing, dragging furniture, smashing stuff,
// debris/sparks/water particles, and procedurally generated sound effects.
(function () {
  const G = 9.8;
  const down = new THREE.Raycaster();
  const DOWN = new THREE.Vector3(0, -1, 0);
  const v3 = () => new THREE.Vector3();

  // ---------- sound ----------
  let ac = null;
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
    const g = a.createGain(); g.gain.value = gain;
    src.connect(f); f.connect(g); g.connect(a.destination); src.start();
  }
  function tone(freq, dur, gain, type, slide) {
    const a = audio(); if (!a) return;
    const o = a.createOscillator(), g = a.createGain();
    o.type = type || 'sine'; o.frequency.value = freq;
    if (slide) o.frequency.exponentialRampToValueAtTime(slide, a.currentTime + dur);
    g.gain.setValueAtTime(gain, a.currentTime); g.gain.exponentialRampToValueAtTime(0.001, a.currentTime + dur);
    o.connect(g); g.connect(a.destination); o.start(); o.stop(a.currentTime + dur);
  }
  GU.sfx = function (kind) {
    switch (kind) {
      case 'swing': noise(0.25, 900, 1, 0.15, 1.5, 'bandpass'); break;
      case 'thud': noise(0.25, 180, 1, 0.9, 3); tone(70, 0.2, 0.4); break;
      case 'crumble': noise(0.45, 1400, 0.7, 0.6, 2); noise(0.2, 300, 1, 0.5, 3); break;
      case 'crack': noise(0.18, 2500, 2, 0.6, 4, 'bandpass'); tone(160, 0.15, 0.3, 'square', 60); break;
      case 'clank': tone(880, 0.6, 0.25, 'triangle'); tone(1320, 0.4, 0.12, 'sine'); noise(0.08, 4000, 1, 0.3, 4, 'highpass'); break;
      case 'shatter': noise(0.6, 5000, 0.5, 0.6, 1.5, 'highpass'); tone(2400, 0.3, 0.08, 'sine', 3800); break;
      case 'zap': tone(120, 0.35, 0.2, 'sawtooth', 60); noise(0.3, 3000, 1, 0.3, 2, 'highpass'); break;
      case 'splash': noise(0.8, 1200, 0.5, 0.35, 1, 'bandpass'); break;
      case 'click': tone(1800, 0.04, 0.15, 'square'); break;
      case 'drop': noise(0.12, 600, 1, 0.4, 4); break;
      case 'scrape': noise(0.2, 400, 2, 0.15, 1, 'bandpass'); break;
    }
  };
  const MAT_SFX = { wood: 'crack', glass: 'shatter', porcelain: 'shatter', metal: 'clank', fabric: 'thud', plastic: 'crack', paper: 'crumble' };

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

  // ---------- falling + throwing ----------
  const fallers = [];
  const ray = new THREE.Raycaster();
  function supportBelow(obj, from) {
    down.set(from, DOWN);
    down.far = 10;
    const hits = down.intersectObjects(GU.rayRoots(), true);
    for (const h of hits) {
      if (!GU.isShown(h.object) || h.object.userData.noRay) continue;
      let mine = false;
      for (let o = h.object; o; o = o.parent) if (o === obj) { mine = true; break; }
      if (mine) continue;
      return h;
    }
    return null;
  }
  // Make an object fall until it lands on something. It sticks to movable furniture it lands on.
  GU.fall = function (obj) {
    if (!fallers.find((f) => f.obj === obj)) fallers.push({ obj, vy: 0 });
  };
  GU.throwItem = function (item, pos, vel) {
    GU.dropped.add(item);
    item.position.copy(pos);
    fallers.push({ obj: item, vy: vel.y, vx: vel.x, vz: vel.z, thrown: true });
  };

  function updateFallers(dt) {
    for (let i = fallers.length - 1; i >= 0; i--) {
      const f = fallers[i], obj = f.obj;
      if (!obj.parent) { fallers.splice(i, 1); continue; }
      const wp = obj.getWorldPosition(v3());
      f.vy -= G * dt;
      let nx = wp.x, nz = wp.z;
      if (f.thrown) {
        nx += f.vx * dt; nz += f.vz * dt;
        // hit a wall? stop moving sideways and drop
        const dir = new THREE.Vector3(f.vx, 0, f.vz);
        const len = dir.length() * dt;
        if (len > 0) {
          ray.set(new THREE.Vector3(wp.x, wp.y + 0.05, wp.z), dir.normalize());
          const wh = GU.raycastWalls(ray, len + 0.05);
          const oh = ray.intersectObjects(GU.rayRoots(), true).find((h) => h.distance < len + 0.05 && GU.isShown(h.object) && !h.object.userData.noRay && !isIn(h.object, obj));
          if (wh || oh) {
            const speed = Math.hypot(f.vx, f.vz);
            if (oh && speed > 4) { const t = breakableOf(oh.object); if (t && t.userData.breakable.mat === 'glass') GU.smash(t, oh.point); }
            if (wh && speed > 4 && wh.e.k === 'gyp') GU.debris(wh.point, '#ece9e0', 2, 0.6);
            GU.sfx('drop');
            f.vx = f.vz = 0; f.thrown = false;
            nx = wp.x; nz = wp.z;
          }
        }
      }
      const ny = wp.y + f.vy * dt;
      const sup = supportBelow(obj, new THREE.Vector3(nx, wp.y + 0.3, nz));
      const floorY = sup ? sup.point.y : 0;
      if (ny <= floorY) {
        setWorldPos(obj, nx, floorY, nz);
        // ride along on furniture it landed on
        const mov = sup && movableOf(sup.object);
        if (mov && obj.parent !== mov) mov.attach(obj);
        if (Math.abs(f.vy) > 2) GU.sfx('drop');
        fallers.splice(i, 1);
        if (obj.userData.collider) GU.refreshCollider(obj);
      } else {
        setWorldPos(obj, nx, ny, nz);
      }
    }
  }
  function setWorldPos(obj, x, y, z) {
    const p = new THREE.Vector3(x, y, z);
    obj.parent.worldToLocal(p);
    obj.position.copy(p);
  }
  const isIn = (o, root) => { for (; o; o = o.parent) if (o === root) return true; return false; };
  const movableOf = (o) => { for (; o; o = o.parent) if (o.userData.movable && !o.userData.broken) return o; return null; };
  const breakableOf = (o) => { for (; o; o = o.parent) if ((o.userData.breakable || o.userData.tough) && !o.userData.broken) return o; return null; };
  GU.movableOf = movableOf;
  GU.breakableOf = breakableOf;

  // ---------- dragging furniture (G) ----------
  let grab = null;
  GU.grabbing = () => grab;
  GU.startGrab = function (obj, player) {
    if (grab) { GU.stopGrab(); return; }
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

  // ---------- smashing ----------
  GU.smash = function (obj, point) {
    if (obj.userData.tough && !obj.userData.breakable) {
      GU.sfx('clank');
      GU.debris(point, '#cccccc', 2, 0.5);
      GU.say(obj.userData.tough, 3);
      return;
    }
    const b = obj.userData.breakable;
    b.hp -= 1;
    GU.sfx(MAT_SFX[b.mat] || 'thud');
    GU.debris(point, b.color, 3, b.mat === 'glass' ? 0.5 : 1);
    if (b.hp > 0) return;
    destroy(obj, point);
  };

  function destroy(obj, point) {
    const b = obj.userData.breakable;
    obj.userData.broken = true;
    if (grab && grab.obj === obj) grab = null;
    const box = new THREE.Box3().setFromObject(obj);
    const size = box.getSize(v3());
    const n = Math.min(24, 6 + Math.floor((size.x + size.y + size.z) * 6));
    for (let i = 0; i < n; i++) {
      const p = new THREE.Vector3(GU.range(Math.random, box.min.x, box.max.x), GU.range(Math.random, box.min.y, box.max.y), GU.range(Math.random, box.min.z, box.max.z));
      particle(p, b.color, 0.03 + Math.random() * (b.mat === 'glass' ? 0.03 : 0.08), new THREE.Vector3((Math.random() - 0.5) * 2, Math.random() * 1.5, (Math.random() - 0.5) * 2), 40);
    }
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
      o.rotation.x = o.rotation.z = 0;
      GU.fall(o);
    }
    obj.userData.interact = null;
    obj.parent && obj.parent.remove(obj);
  }

  // ---------- the sledgehammer ----------
  let swingT = -1, cooldown = 0;
  GU.swing = function (player) {
    if (cooldown > 0) return;
    cooldown = 0.75;
    swingT = 0;
    GU.sfx('swing');
    setTimeout(() => hammerHit(player), 170);
  };
  function hammerHit(player) {
    const r = new THREE.Raycaster();
    player.camera.updateMatrixWorld();
    r.setFromCamera(new THREE.Vector2(0, 0), player.camera);
    const reach = 2.0;
    const wh = GU.raycastWalls(r.ray, reach, null, 0.05);
    let oh = null;
    r.far = reach;
    for (const h of r.intersectObjects(GU.rayRoots(), true)) {
      if (h.object.userData.noRay || !GU.isShown(h.object)) continue;
      oh = h; break;
    }
    if (wh && (!oh || wh.dist < oh.distance)) {
      wh.wall.hit(wh.e, wh.point);
      GU.updateWalls();
      return;
    }
    if (!oh) return;
    const t = breakableOf(oh.object);
    if (t) { GU.smash(t, oh.point); return; }
    const s = oh.object.userData.surface;
    GU.sfx('thud');
    GU.debris(oh.point, '#9a9a94', 2, 0.5);
    if (s === 'floor') GU.say('Concrete slab under the flooring. The hammer just bounces.', 2.5);
    else if (s === 'ceiling') GU.say('You can\'t get a good swing straight up at the ceiling.', 2.5);
    else if (s === 'counter') GU.say('Solid stone countertop. Not a scratch.', 2.5);
  }

  // ---------- per-frame ----------
  GU.physicsUpdate = function (dt, player) {
    cooldown = Math.max(0, cooldown - dt);
    updateFallers(dt);
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
    // hammer animation: wind up, then slam down
    const hand = GU.hand;
    if (swingT >= 0) {
      swingT += dt;
      const t = swingT;
      const a = t < 0.12 ? -t / 0.12 * 0.6 : t < 0.25 ? -0.6 + (t - 0.12) / 0.13 * 1.9 : 1.3 - (t - 0.25) / 0.4 * 1.3;
      hand.rotation.x = -a;
      if (t > 0.65) { swingT = -1; hand.rotation.x = 0; }
    }
  };
})();
