// First-person player: mouse look, WASD movement, collision, stairs, crouching,
// using things (E), carrying items (pockets), dropping (Q), throwing (F), dragging furniture (G)
// and swinging the sledgehammer (left click while holding it).
(function () {
  const STAND = 1.62, CROUCH = 0.95;

  GU.isShown = function (o) {
    for (; o; o = o.parent) if (!o.visible) return false;
    return true;
  };

  GU.Player = class {
    constructor(camera) {
      this.camera = camera;
      this.pos = new THREE.Vector3();
      this.yaw = 0;
      this.pitch = 0;
      this.vy = 0;
      this.eye = STAND;
      this.radius = 0.24;
      this.bob = 0;
      this.inventory = [];
      this.held = -1;
      this.keys = {};
      this.ray = new THREE.Raycaster();
      this.down = new THREE.Raycaster();
      this.down.far = 3;
      this.target = null; // thing with an E action
      this.hit = null;    // whatever the crosshair is on
      this.bindInput();
    }

    heldItem() { return this.inventory[this.held] || null; }
    hasHammer() { const h = this.heldItem(); return h && h.userData.item.id === 'sledgehammer'; }

    bindInput() {
      addEventListener('keydown', (e) => {
        this.keys[e.code] = true;
        if (!GU.locked || e.repeat) return;
        if (e.code === 'KeyE') this.use();
        if (e.code === 'KeyQ') this.drop();
        if (e.code === 'KeyF') this.throwHeld();
        if (e.code === 'KeyG') this.toggleGrab();
        if (e.code === 'Tab') { e.preventDefault(); this.cycle(1); }
        if (e.code.startsWith('Digit')) {
          const n = parseInt(e.code.slice(5), 10) - 1;
          if (n >= 0 && n < this.inventory.length) { this.held = n; this.showHeld(); }
        }
      });
      addEventListener('keyup', (e) => { this.keys[e.code] = false; });
      addEventListener('mousemove', (e) => {
        if (!GU.locked) return;
        this.yaw -= e.movementX * 0.0022;
        this.pitch -= e.movementY * 0.0022;
        this.pitch = Math.max(-1.5, Math.min(1.5, this.pitch));
        GU.swingMouse(e.movementX, e.movementY);
      });
      addEventListener('mousedown', (e) => {
        if (!GU.locked) return;
        if (e.button === 0) { if (this.hasHammer()) GU.swingStart(this); else this.use(); }
        if (e.button === 2) this.toggleGrab();
      });
      addEventListener('mouseup', (e) => { if (e.button === 0) GU.swingRelease(this); });
      addEventListener('contextmenu', (e) => e.preventDefault());
      addEventListener('wheel', (e) => { if (GU.locked) this.cycle(e.deltaY > 0 ? 1 : -1); });
    }

    blocked(x, z, feet, head) {
      const r = this.radius;
      const g = GU.grabbing();
      const hits = GU.queryColliders({ x: x - r, y: feet, z: z - r }, { x: x + r, y: head, z: z + r }, g ? (o) => o === g.obj : null);
      return hits.length ? hits[0].box : null;
    }

    // Move along one axis, then push out of anything we ran into.
    moveAxis(axis, delta) {
      if (!delta) return;
      const feet = this.pos.y + 0.25, head = this.pos.y + this.eye + 0.12;
      this.pos[axis] += delta;
      for (let i = 0; i < 4; i++) {
        const b = this.blocked(this.pos.x, this.pos.z, feet, head);
        if (!b) return;
        if (axis === 'x') this.pos.x = delta > 0 ? b.min.x - this.radius - 0.001 : b.max.x + this.radius + 0.001;
        else this.pos.z = delta > 0 ? b.min.z - this.radius - 0.001 : b.max.z + this.radius + 0.001;
      }
    }

    groundAt() {
      this.down.set(new THREE.Vector3(this.pos.x, this.pos.y + 0.45, this.pos.z), new THREE.Vector3(0, -1, 0));
      const hit = this.down.intersectObjects(GU.walkables, false)[0];
      return hit ? hit.point.y : -10;
    }

    update(dt) {
      const k = this.keys;
      const crouch = k.KeyC || k.ControlLeft;
      const run = (k.ShiftLeft || k.ShiftRight) && !crouch;
      const want = crouch ? CROUCH : STAND;
      this.eye += (want - this.eye) * Math.min(1, dt * 10);
      if (GU.locked) {
        let f = 0, s = 0;
        if (k.KeyW || k.ArrowUp) f += 1;
        if (k.KeyS || k.ArrowDown) f -= 1;
        if (k.KeyD || k.ArrowRight) s += 1;
        if (k.KeyA || k.ArrowLeft) s -= 1;
        const len = Math.hypot(f, s);
        if (len) {
          const g = GU.grabbing();
          const heavy = g ? Math.max(0.35, 1 - g.obj.userData.movable.mass / 200) : 1;
          const speed = (run ? 4.2 : crouch ? 1.3 : 2.4) * heavy * dt / len;
          const sin = Math.sin(this.yaw), cos = Math.cos(this.yaw);
          this.moveAxis('x', (-sin * f + cos * s) * speed);
          this.moveAxis('z', (-cos * f - sin * s) * speed);
          this.bob += dt * (run ? 13 : 9);
        }
      }
      const ground = this.groundAt();
      if (ground > this.pos.y) {
        this.pos.y = Math.min(ground, this.pos.y + dt * 3.5);
        this.vy = 0;
      } else {
        this.vy -= 12 * dt;
        this.pos.y = Math.max(ground, this.pos.y + this.vy * dt);
        if (this.pos.y === ground) this.vy = 0;
      }
      const cam = this.camera;
      cam.position.set(this.pos.x, this.pos.y + this.eye + Math.sin(this.bob) * 0.025, this.pos.z);
      cam.rotation.set(this.pitch, this.yaw, 0, 'YXZ');
      cam.updateMatrixWorld();
      this.look();
    }

    // What is the crosshair on? Walls block everything behind them.
    look() {
      this.ray.setFromCamera(new THREE.Vector2(0, 0), this.camera);
      this.ray.far = 2.3;
      this.target = null;
      this.hit = null;
      const wall = GU.raycastWalls(this.ray.ray, 2.3);
      const limit = wall ? wall.dist : 2.3;
      for (const h of this.ray.intersectObjects(GU.rayRoots(), true)) {
        if (h.distance > limit) break;
        if (h.object.userData.noRay || !GU.isShown(h.object)) continue;
        this.hit = h;
        let o = h.object;
        while (o && !(o.userData.interact)) o = o.parent;
        this.target = o || null;
        break;
      }
      this.wallHit = !this.hit && wall ? wall : null;
    }

    use() {
      if (this.target) this.target.userData.interact.use();
    }

    toggleGrab() {
      if (GU.grabbing()) { GU.stopGrab(); return; }
      const m = this.hit && GU.movableOf(this.hit.object);
      if (m) GU.startGrab(m, this);
    }

    pickUp(item) {
      if (this.inventory.length >= 9) { GU.say('Your hands are full. Drop something with Q.'); return; }
      GU.dropped.attach(item);
      item.parent.remove(item);
      item.rotation.set(0, 0, 0);
      this.inventory.push(item);
      this.held = this.inventory.length - 1;
      this.showHeld();
      GU.sfx('click');
      GU.say('Picked up ' + item.userData.item.name + '.', 2);
    }

    cycle(dir) {
      if (!this.inventory.length) return;
      this.held = (this.held + dir + this.inventory.length) % this.inventory.length;
      this.showHeld();
    }

    showHeld() {
      const hand = GU.hand;
      while (hand.children.length) hand.remove(hand.children[0]);
      const item = this.heldItem();
      if (!item) return;
      const view = item.clone();
      if (item.userData.item.id === 'sledgehammer') {
        // handle pointing up from the hand, grip at the pivot (physics.js swings the hand around it)
        view.rotation.set(0, 0, Math.PI / 2);
        view.position.set(0, 0.21, 0);
        view.scale.setScalar(0.6);
      } else {
        const size = new THREE.Box3().setFromObject(view).getSize(new THREE.Vector3());
        const s = Math.min(1.6, 0.22 / Math.max(size.x, size.y, size.z, 0.01));
        view.scale.setScalar(s);
        view.position.set(0, -size.y * s / 2, 0);
        view.rotation.y = 0.5;
      }
      hand.add(view);
    }

    take() {
      const item = this.heldItem();
      if (!item) return null;
      this.inventory.splice(this.held, 1);
      this.held = Math.min(this.held, this.inventory.length - 1);
      if (this.held < 0 && this.inventory.length) this.held = 0;
      this.showHeld();
      return item;
    }

    // Spot just in front of the camera, pulled back from any wall.
    handSpot(dist) {
      const dir = new THREE.Vector3();
      this.camera.getWorldDirection(dir);
      this.ray.set(this.camera.position, dir);
      const wall = GU.raycastWalls(this.ray.ray, dist + 0.3);
      const d = wall ? Math.max(0.1, wall.dist - 0.3) : dist;
      return this.camera.position.clone().addScaledVector(dir, d).add(new THREE.Vector3(0, -0.25, 0));
    }

    // Let go of the held item: it drops from your hand and falls onto whatever is below.
    drop() {
      const item = this.take();
      if (!item) return;
      item.position.copy(this.handSpot(0.6));
      item.rotation.set(0, this.yaw, 0);
      GU.dropped.add(item);
      GU.fall(item);
      GU.say('Dropped ' + item.userData.item.name + '.', 1.5);
    }

    throwHeld() {
      const item = this.heldItem();
      if (!item) return;
      this.take();
      const dir = new THREE.Vector3();
      this.camera.getWorldDirection(dir);
      item.rotation.set(0, this.yaw, 0);
      GU.throwItem(item, this.handSpot(0.4), dir.multiplyScalar(8).add(new THREE.Vector3(0, 1.5, 0)));
      GU.sfx('swing');
    }

    hud() {
      const t = this.target;
      const prompt = document.getElementById('prompt');
      const info = document.getElementById('info');
      let p = '', i = '';
      if (t) {
        const ia = t.userData.interact;
        p = '[E] ' + ia.prompt();
        i = ia.info ? ia.info() : '';
      }
      const mov = this.hit && GU.movableOf(this.hit.object);
      const g = GU.grabbing();
      if (g) p = '[G] Let go of ' + (g.obj.userData.movable.name || 'it');
      else if (mov && !(t && t.userData.item)) p += (p ? '   ' : '') + '[G] Drag ' + (mov.userData.movable.name || 'it');
      if (this.hasHammer()) {
        const b = this.hit ? GU.breakableOf(this.hit.object) : null;
        const what = this.wallHit ? describeWall(this.wallHit) : b ? (b.userData.breakable ? b.userData.breakable.name : b.userData.name) : '';
        p += (p ? '   ' : '') + (GU.swingCharging() ? 'Winding up...' : '[Hold click] Swing' + (what ? ' at ' + what : ''));
      }
      prompt.textContent = p;
      info.textContent = i || (this.wallHit && this.hasHammer() ? GU.WALL_TYPES[this.wallHit.wall.type].name : '');
      const msg = document.getElementById('msg');
      msg.textContent = GU.message && performance.now() < GU.message.until ? GU.message.text : '';
      const inv = document.getElementById('inv');
      const html = this.inventory.map((it, n) => (n === this.held ? '<b>&gt; ' : '<span>') + (n + 1) + '. ' + it.userData.item.name + (n === this.held ? '</b>' : '</span>')).join('<br>');
      if (inv.innerHTML !== html) inv.innerHTML = html;
      document.getElementById('cross').className = t || mov ? 'hot' : '';
    }
  };

  const NAMES = { gyp: 'drywall', osb: 'OSB sheathing', brick: 'brick', cmu: 'concrete block', stud: 'stud', insul: 'insulation', wire: 'wire', ebox: 'electrical box', pipe: 'pipe', plate: 'plate', header: 'header' };
  function describeWall(w) { return NAMES[w.e.k] || 'wall'; }
})();
