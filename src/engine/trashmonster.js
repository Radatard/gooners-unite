// The trash monster. Hit a trash can with the sledgehammer and it climbs out of itself.
// It chases you and has three attacks: a punch, a shove that sends you flying, and a sludge spray
// that slows you down and leaves slippery puddles. It has a health bar; the hammer hurts it, and so
// does anything heavy you throw at it. Blocked by a wall? It punches through the drywall.
(function () {
  const HP = 200, SPEED = 1.7, RADIUS = 0.32, SCALE = 1.7;
  const monsters = [], puddles = [];
  const V = () => new THREE.Vector3();
  const rnd = () => Math.random() - 0.5;
  const M = (c) => GU.mat(c);
  const down = new THREE.Raycaster(), DOWN = new THREE.Vector3(0, -1, 0);
  const easeOut = (t) => 1 - (1 - t) * (1 - t);
  const wrap = (a) => { while (a > Math.PI) a -= Math.PI * 2; while (a < -Math.PI) a += Math.PI * 2; return a; };
  const lerp = (a, b, t) => a + (b - a) * t;
  const TRASH = ['#3b4a2a', '#6b8f2e', '#c9b458', '#8a6d3b', '#2b2b2b'];

  // Model, facing +z, feet at the origin. Everything is a child of `root`.
  function build(color) {
    const root = new THREE.Group();
    const hips = GU.group(root, 0, 0.32, 0);
    const torso = GU.group(hips, 0, 0, 0);
    const can = GU.mat('#ffffff', GU.tex.metal(color));
    GU.cyl(torso, 0.19, 0.16, 0.6, 0, 0, 0, can);
    GU.cyl(torso, 0.196, 0.196, 0.03, 0, 0.14, 0, M('#6f777c'));
    GU.cyl(torso, 0.2, 0.2, 0.03, 0, 0.44, 0, M('#6f777c'));
    // inside the mouth: dark goo, teeth, a tongue
    GU.cyl(torso, 0.175, 0.175, 0.01, 0, 0.585, 0, M('#1a2314'));
    for (let i = 0; i < 9; i++) {
      const a = -1.3 + i * 0.325;
      GU.box(torso, 0.03, 0.05, 0.02, Math.sin(a) * 0.165, 0.545, Math.cos(a) * 0.165, M('#e8e4c8'), { ry: a });
    }
    GU.box(torso, 0.08, 0.02, 0.14, 0, 0.58, 0.04, M('#5a8f2e'));
    // the lid is the jaw, hinged at the back
    const lid = GU.group(torso, 0, 0.6, -0.19);
    GU.cyl(lid, 0.21, 0.21, 0.04, 0, 0, 0.19, can);
    GU.box(lid, 0.09, 0.04, 0.03, 0, 0.04, 0.19, M('#555555'));
    // angry eyes
    const eyes = GU.group(torso, 0, 0, 0);
    for (const s of [-1, 1]) {
      GU.sphere(eyes, 0.055, s * 0.08, 0.46, 0.165, M('#f4f4e8'));
      GU.sphere(eyes, 0.026, s * 0.08, 0.46, 0.215, GU.glow('#ff2a2a'));
      GU.box(eyes, 0.09, 0.016, 0.02, s * 0.08, 0.52, 0.2, M('#1a1a1a'), { rz: s * 0.45 });
    }
    // trash-bag arms
    const arms = [-1, 1].map((s) => {
      const sh = GU.group(torso, s * 0.22, 0.42, 0);
      GU.sphere(sh, 0.085, s * 0.03, -0.12, 0, M('#1f2a1f'), { sx: 1, sy: 1.7, sz: 1 });
      GU.sphere(sh, 0.08, s * 0.04, -0.3, 0.02, M('#2b3a2b'));
      return sh;
    });
    // stubby legs
    const legs = [-1, 1].map((s) => {
      const hip = GU.group(hips, s * 0.08, 0, 0);
      GU.box(hip, 0.08, 0.32, 0.09, 0, -0.32, 0, M('#2b2b2b'));
      GU.box(hip, 0.11, 0.05, 0.17, 0, -0.32, 0.03, M('#1a1a1a'));
      return hip;
    });
    return { root, hips, torso, lid, eyes, arms, legs };
  }

  function bar() {
    const el = document.createElement('div');
    el.className = 'mhp';
    el.innerHTML = '<i></i><b>TRASH MONSTER</b>';
    (document.body || document.getElementById('game')).appendChild(el);
    return el;
  }

  // Damage number floating up from a point.
  function popNumber(point, text) {
    const el = document.createElement('div');
    el.className = 'dmg';
    el.textContent = text;
    (document.body || document.getElementById('game')).appendChild(el);
    const p = point.clone();
    let t = 0;
    const tick = (dt) => {
      t += dt;
      const s = p.clone().add(new THREE.Vector3(0, t * 0.6, 0)).project(GU.player.camera);
      el.style.left = ((s.x * 0.5 + 0.5) * innerWidth) + 'px';
      el.style.top = ((-s.y * 0.5 + 0.5) * innerHeight) + 'px';
      el.style.opacity = Math.max(0, 1 - t / 0.9);
      el.style.display = s.z < 1 ? 'block' : 'none';
      if (t > 0.9) { el.remove && el.remove(); return true; }
      return false;
    };
    floaters.push(tick);
  }
  const floaters = [];

  class TrashMonster {
    constructor(can) {
      const color = (can.userData.breakable && can.userData.breakable.color) || '#9ea7ad';
      const p = can.getWorldPosition(V());
      this.pos = new THREE.Vector3(p.x, p.y, p.z);
      const toP = V().subVectors(GU.player.pos, this.pos);
      this.yaw = Math.atan2(toP.x, toP.z);
      this.parts = build(color);
      this.root = this.parts.root;
      this.root.userData.monster = this;
      GU.dropped.add(this.root);
      this.hp = HP;
      this.state = 'rise';
      this.t = 0;
      this.cool = 1;
      this.sprayCool = 2.5;
      this.kb = V();
      this.walk = 0;
      this.ground = p.y;
      this.groundT = 0;
      this.blockedT = 0;
      this.tick = 0;
      this.bar = bar();
      // you can't walk through it, and heavy things thrown at it hurt it
      const self = this;
      this.col = { box: new THREE.Box3(), owner: this.root, enabled: () => self.state !== 'dead', onHit: (b, speed, point) => self.hurt(0.5 * b.mass * speed * speed / 25, b.vel.clone().normalize(), point) };
      GU.dynColliders.push(this.col);
      // the old can goes away, and whatever was in it spills
      const g = GU.grabbing && GU.grabbing();
      if (g && g.obj === can) GU.stopGrab();
      can.userData.broken = true;
      can.userData.interact = null;
      const loose = [];
      can.traverse((o) => { if (o !== can && o.userData.item) loose.push(o); });
      for (const o of loose) { GU.dropped.attach(o); GU.fall(o); }
      can.parent && can.parent.remove(can);
      GU.sfx('roar');
      GU.say('The trash can... is getting up.', 3);
    }

    blocked(x, z) {
      const r = RADIUS, root = this.root;
      const hits = GU.queryColliders({ x: x - r, y: this.pos.y + 0.3, z: z - r }, { x: x + r, y: this.pos.y + 1.4, z: z + r }, (o) => o === root);
      return hits[0] || null;
    }

    // Move along one axis and slide off walls. Returns what it bumped into.
    moveAxis(axis, d) {
      if (!d) return null;
      this.pos[axis] += d;
      let hit = null;
      for (let i = 0; i < 3; i++) {
        const c = this.blocked(this.pos.x, this.pos.z);
        if (!c) break;
        hit = c;
        const b = c.box;
        if (axis === 'x') this.pos.x = d > 0 ? b.min.x - RADIUS - 0.001 : b.max.x + RADIUS + 0.001;
        else this.pos.z = d > 0 ? b.min.z - RADIUS - 0.001 : b.max.z + RADIUS + 0.001;
      }
      return hit;
    }

    move(dx, dz) {
      const a = this.moveAxis('x', dx), b = this.moveAxis('z', dz);
      return a || b;
    }

    forward() { return new THREE.Vector3(Math.sin(this.yaw), 0, Math.cos(this.yaw)); }
    mouth() { return this.pos.clone().add(new THREE.Vector3(0, 1.45, 0)).addScaledVector(this.forward(), 0.3); }

    canSee(P) {
      const from = this.mouth(), to = P.camera.position.clone();
      const d = to.clone().sub(from), len = d.length();
      return !GU.raycastWalls(new THREE.Ray(from, d.normalize()), len - 0.2);
    }

    hurt(energy, dir, point) {
      if (this.state === 'dead' || energy < 0.2) return;
      const dmg = Math.max(1, Math.round(energy * 6));
      this.hp -= dmg;
      const flat = dir.clone().setY(0);
      if (flat.lengthSq() > 1e-6) this.kb.addScaledVector(flat.normalize(), Math.min(7, 0.8 + energy * 0.25));
      GU.sfx('squelch');
      GU.sfx('whack', Math.min(1, 0.4 + energy / 10));
      const at = point || this.pos.clone().add(new THREE.Vector3(0, 1, 0));
      for (let i = 0; i < Math.min(12, 3 + energy); i++) GU.debris(at, TRASH[i % TRASH.length], 1, 0.8);
      popNumber(at, '-' + dmg);
      if (this.hp <= 0) { this.die(flat); return; }
      // big hits interrupt whatever it was doing
      if (energy > 2.5 || this.state === 'windup') { this.state = 'stagger'; this.t = 0; this.atk = null; }
    }

    die(dir) {
      this.state = 'dead';
      this.root.parent && this.root.parent.remove(this.root);
      this.bar.remove && this.bar.remove();
      const c = this.pos.clone().add(new THREE.Vector3(0, 0.9, 0));
      GU.sfx('crumble');
      GU.sfx('squelch');
      GU.say('You took out the trash.', 3);
      // it bursts into actual garbage
      for (const id of ['trash_bag_full', 'pizza_box', 'crushed_can', 'crushed_can', 'soda', 'milk_expired', 'chip_bag_empty']) {
        const it = GU.item(id);
        if (!it) continue;
        const vel = dir.clone().multiplyScalar(2 + Math.random() * 2).add(new THREE.Vector3(rnd() * 4, 2 + Math.random() * 3, rnd() * 4));
        GU.throwItem(it, c.clone().add(new THREE.Vector3(rnd() * 0.4, rnd() * 0.6, rnd() * 0.4)), vel);
      }
      const metal = GU.mat('#ffffff', GU.tex.metal('#9ea7ad')), bag = M('#1f2a1f');
      GU.rigid.chunk({ pos: c.clone().add(new THREE.Vector3(0, 0.6, 0)), sx: 0.7, sy: 0.7, sz: 0.06, mats: [metal, metal], vel: new THREE.Vector3(rnd() * 3, 5, rnd() * 3), ang: new THREE.Vector3(8, 3, 5), density: 300, sfx: 'clank' });
      for (let i = 0; i < 5; i++) GU.rigid.chunk({ pos: c.clone(), sx: 0.25, sy: 0.25, sz: 0.12, mats: [bag, bag], vel: new THREE.Vector3(rnd() * 5, 2 + Math.random() * 3, rnd() * 5), ang: new THREE.Vector3(rnd() * 10, rnd() * 10, rnd() * 10), density: 200, drag: 0.5, sfx: 'none' });
      for (let i = 0; i < 20; i++) GU.debris(c, TRASH[i % TRASH.length], 1, 1.2);
      puddle(this.pos, 0.9);
    }

    update(dt, P) {
      if (this.state === 'dead') return;
      const pr = this.parts;
      this.t += dt;
      // floor under it
      if ((this.groundT -= dt) <= 0) {
        this.groundT = 0.2;
        down.set(new THREE.Vector3(this.pos.x, this.pos.y + 0.5, this.pos.z), DOWN);
        down.far = 3;
        const h = down.intersectObjects(GU.walkables, false)[0];
        if (h) this.ground = h.point.y;
      }
      this.pos.y += (this.ground - this.pos.y) * Math.min(1, dt * 10);
      if (this.kb.lengthSq() > 0.001) {
        this.move(this.kb.x * dt, this.kb.z * dt);
        this.kb.multiplyScalar(Math.exp(-4 * dt));
      }
      const toP = V().subVectors(P.pos, this.pos);
      toP.y = 0;
      const dist = toP.length();
      const want = Math.atan2(toP.x, toP.z);
      const turn = (rate) => { this.yaw += wrap(want - this.yaw) * Math.min(1, dt * rate); };
      const facing = Math.abs(wrap(want - this.yaw));
      // default pose, each state bends it
      let armL = 0, armR = 0, lid = -0.12 - Math.abs(Math.sin(this.t * 7)) * 0.12, lean = 0, scale = SCALE, legSwing = 0, lunge = 0;

      switch (this.state) {
        case 'rise': {
          const k = Math.min(1, this.t / 1.4);
          scale = lerp(0.95, SCALE, easeOut(k));
          lean = Math.sin(this.t * 40) * 0.12 * (1 - k);
          lid = -Math.abs(Math.sin(this.t * 14)) * 0.9;
          for (const a of pr.arms) a.scale.setScalar(k);
          for (const l of pr.legs) l.scale.setScalar(k);
          pr.eyes.scale.setScalar(Math.min(1, k * 1.5));
          pr.hips.position.y = 0.32 * k;
          if (k >= 1) { this.state = 'chase'; this.t = 0; GU.sfx('roar', 0.7); }
          break;
        }
        case 'chase': {
          turn(4);
          this.cool -= dt;
          this.sprayCool -= dt;
          if (GU.dead) { lid = -0.6; break; }
          if (dist > 1.15) {
            const f = this.forward();
            const hit = this.move(f.x * SPEED * dt, f.z * SPEED * dt);
            this.walk += dt;
            legSwing = Math.sin(this.walk * 9) * 0.6;
            armL = -Math.sin(this.walk * 9) * 0.5; armR = -armL;
            // stuck on a wall: punch through it
            if (hit && hit.el && facing < 0.6) {
              this.blockedT += dt;
              if (this.blockedT > 0.7) {
                this.blockedT = 0;
                this.atk = 'wall'; this.state = 'strike'; this.t = 0;
                const pt = this.pos.clone().add(new THREE.Vector3(0, 1.0, 0)).addScaledVector(f, RADIUS + 0.05);
                GU.wallImpact(hit.el, pt, 2.5, f);
                GU.sfx('whack');
              }
            } else this.blockedT = 0;
          }
          if (this.cool <= 0 && facing < 0.7) {
            if (dist < 1.6) this.startAttack(Math.random() < 0.55 ? 'punch' : 'shove');
            else if (dist < 6.5 && this.sprayCool <= 0 && this.canSee(P) && Math.random() < 0.6) this.startAttack('spray');
            else this.cool = 0.3;
          }
          break;
        }
        case 'windup': {
          turn(this.atk === 'spray' ? 3 : 2);
          const k = Math.min(1, this.t / this.windup);
          if (this.atk === 'punch') { armR = 2.6 * easeOut(k); lean = -0.15 * k; }
          else if (this.atk === 'shove') { armL = armR = 0.7 * k; lean = -0.3 * k; }
          else { lid = -1.3 * k; lean = -0.25 * k; }
          if (k >= 1) this.strike(P, dist, facing);
          break;
        }
        case 'strike': {
          const k = Math.min(1, this.t / 0.4);
          if (this.atk === 'punch' || this.atk === 'wall') { armR = lerp(-1.5, 0, k); lean = 0.25 * (1 - k); }
          else if (this.atk === 'shove') {
            armL = armR = -1.5 * (1 - k * 0.6); lean = 0.3 * (1 - k);
            if (this.t < 0.18) { const f = this.forward(); this.move(f.x * 4 * dt, f.z * 4 * dt); }
            lunge = 1;
          }
          if (k >= 1) { this.state = 'chase'; this.t = 0; this.cool = 0.8 + Math.random() * 0.8; }
          break;
        }
        case 'spray': {
          turn(2.5);
          lid = -1.3;
          lean = 0.15 + Math.sin(this.t * 30) * 0.04;
          this.sprayAt(P, dt, dist);
          if (this.t > 1.4) {
            this.state = 'chase'; this.t = 0; this.cool = 1; this.sprayCool = 6;
            // leave sludge puddles along the way
            const f = this.forward();
            for (let i = 1; i <= 3; i++) puddle(this.pos.clone().addScaledVector(f, Math.min(dist, 5) * i / 3.2), 0.45 + Math.random() * 0.25);
          }
          break;
        }
        case 'stagger': {
          lean = -0.45 * (1 - this.t / 0.4);
          lid = -0.8;
          if (this.t > 0.4) { this.state = 'chase'; this.t = 0; this.cool = Math.max(this.cool, 0.4); }
          break;
        }
      }
      // pose it
      const r = this.root;
      r.position.set(this.pos.x, this.pos.y + (legSwing ? Math.abs(Math.sin(this.walk * 9)) * 0.03 : 0), this.pos.z);
      r.rotation.y = this.yaw;
      r.scale.setScalar(scale);
      pr.torso.rotation.x = lean;
      pr.torso.rotation.z = this.state === 'rise' ? Math.sin(this.t * 33) * 0.1 : Math.sin(this.t * 2) * 0.03;
      pr.lid.rotation.x = lid;
      pr.arms[0].rotation.x = armL;
      pr.arms[1].rotation.x = armR;
      pr.legs[0].rotation.x = legSwing;
      pr.legs[1].rotation.x = -legSwing;
      if (lunge) pr.torso.position.z = 0.05; else pr.torso.position.z = 0;
      // collision box
      const rr = RADIUS;
      this.col.box.min.set(this.pos.x - rr, this.pos.y, this.pos.z - rr);
      this.col.box.max.set(this.pos.x + rr, this.pos.y + 1.6, this.pos.z + rr);
      // health bar over its head
      const head = this.pos.clone().add(new THREE.Vector3(0, 1.85, 0));
      const s = head.clone().project(P.camera);
      const show = s.z < 1 && Math.abs(s.x) < 1.2 && Math.abs(s.y) < 1.2 && head.distanceTo(P.camera.position) < 14;
      this.bar.style.display = show ? 'block' : 'none';
      if (show) {
        this.bar.style.left = ((s.x * 0.5 + 0.5) * innerWidth) + 'px';
        this.bar.style.top = ((-s.y * 0.5 + 0.5) * innerHeight) + 'px';
        if (this.bar.firstChild) this.bar.firstChild.style.width = Math.max(0, this.hp / HP * 100).toFixed(1) + '%';
      }
      // drips
      if (Math.random() < dt * 3) GU.particle(this.mouth(), '#6b8f2e', 0.02, new THREE.Vector3(rnd(), -0.5, rnd()), 2);
    }

    startAttack(kind) {
      this.atk = kind;
      this.state = 'windup';
      this.t = 0;
      this.windup = { punch: 0.45, shove: 0.6, spray: 0.75 }[kind];
      GU.sfx(kind === 'spray' ? 'gurgle' : 'grip', 0.8);
    }

    // The swing lands (or doesn't).
    strike(P, dist, facing) {
      this.t = 0;
      const dir = V().subVectors(P.pos, this.pos).setY(0).normalize();
      if (this.atk === 'spray') { this.state = 'spray'; this.tick = 0; GU.sfx('spray'); return; }
      this.state = 'strike';
      GU.sfx('swing');
      if (GU.dead) return;
      if (this.atk === 'punch' && dist < 1.8 && facing < 0.9) {
        GU.hurtPlayer(12, { push: dir.multiplyScalar(2), shake: 0.5 });
        GU.say('The trash monster clocks you.', 1.5);
      } else if (this.atk === 'shove' && dist < 2.0 && facing < 1.0) {
        GU.hurtPlayer(6, { push: dir.multiplyScalar(11), shake: 0.6 });
        GU.say('SHOVED.', 1.2);
      }
    }

    sprayAt(P, dt, dist) {
      const m = this.mouth(), f = this.forward();
      const aim = P.camera.position.clone().sub(m).normalize();
      // only spray roughly forward
      const dir = f.clone().multiplyScalar(0.6).add(aim.multiplyScalar(0.4)).normalize();
      for (let i = 0; i < 4; i++) {
        const v = dir.clone().multiplyScalar(6 + Math.random() * 2).add(new THREE.Vector3(rnd() * 1.4, Math.random() * 1.2, rnd() * 1.4));
        GU.particle(m, i % 2 ? '#6b8f2e' : '#9bd53f', 0.03 + Math.random() * 0.03, v, 1.5);
      }
      this.tick -= dt;
      if (this.tick > 0 || GU.dead) return;
      this.tick = 0.2;
      const toP = V().subVectors(P.camera.position, m);
      const ang = toP.clone().setY(0).normalize().angleTo(f);
      if (dist < 6.5 && ang < 0.5 && this.canSee(P)) GU.hurtPlayer(3, { slime: 2.5, shake: 0.05 });
    }
  }

  // Sludge on the floor: slows you down while you stand in it, dries up after a while.
  function puddle(p, r) {
    down.set(new THREE.Vector3(p.x, p.y + 0.5, p.z), DOWN);
    down.far = 3;
    const h = down.intersectObjects(GU.walkables, false)[0];
    const y = (h ? h.point.y : p.y) + 0.008 + Math.random() * 0.004;
    const m = new THREE.Mesh(new THREE.CircleGeometry(r, 10), GU.mat('#5a8f2e', null, { transparent: true, opacity: 0.75, depthWrite: false }));
    m.rotation.x = -Math.PI / 2;
    m.position.set(p.x, y, p.z);
    m.userData.noRay = true;
    GU.scene.add(m);
    puddles.push({ m, p: m.position, r, life: 25 });
  }

  GU.monsterOf = (o) => { for (; o; o = o.parent) if (o.userData.monster) return o.userData.monster; return null; };
  GU.trashMonster = (can) => { const m = new TrashMonster(can); monsters.push(m); return m; };
  GU.monsters = monsters;

  GU.updaters.push((dt) => {
    const P = GU.player;
    if (!P) return;
    for (let i = monsters.length - 1; i >= 0; i--) {
      monsters[i].update(dt, P);
      if (monsters[i].state === 'dead') monsters.splice(i, 1);
    }
    for (let i = puddles.length - 1; i >= 0; i--) {
      const pd = puddles[i];
      pd.life -= dt;
      if (pd.life < 3) pd.m.material = GU.mat('#5a8f2e', null, { transparent: true, opacity: +(0.25 * pd.life).toFixed(1), depthWrite: false });
      if (pd.life <= 0) { pd.m.parent.remove(pd.m); pd.m.geometry.dispose(); puddles.splice(i, 1); continue; }
      if (Math.hypot(P.pos.x - pd.p.x, P.pos.z - pd.p.z) < pd.r && Math.abs(P.pos.y - pd.p.y) < 0.3) P.slow = Math.max(P.slow, 0.3);
    }
    for (let i = floaters.length - 1; i >= 0; i--) if (floaters[i](dt)) floaters.splice(i, 1);
  });
})();
