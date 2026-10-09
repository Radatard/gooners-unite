// First-person player: mouse look, WASD movement, collision, stairs, crouching,
// looking at / using things with E, carrying items and dropping them with Q.
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
      this.target = null;
      this.bindInput();
    }

    bindInput() {
      addEventListener('keydown', (e) => {
        this.keys[e.code] = true;
        if (!GU.locked) return;
        if (e.code === 'KeyE') this.use();
        if (e.code === 'KeyQ') this.drop();
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
      });
      addEventListener('mousedown', (e) => { if (GU.locked && e.button === 0) this.use(); });
      addEventListener('wheel', (e) => { if (GU.locked) this.cycle(e.deltaY > 0 ? 1 : -1); });
    }

    blocked(x, z, feet, head) {
      const r = this.radius;
      for (const c of GU.colliders) {
        if (c.enabled && !c.enabled()) continue;
        const b = c.box;
        if (b.max.y <= feet || b.min.y >= head) continue;
        if (x + r <= b.min.x || x - r >= b.max.x || z + r <= b.min.z || z - r >= b.max.z) continue;
        return b;
      }
      return null;
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
          const speed = (run ? 4.2 : crouch ? 1.3 : 2.4) * dt / len;
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

    // What are we pointing at?
    look() {
      this.ray.setFromCamera(new THREE.Vector2(0, 0), this.camera);
      this.ray.far = 2.3;
      this.target = null;
      const hits = this.ray.intersectObjects(GU.rayRoots(), true);
      for (const h of hits) {
        let o = h.object;
        if (o.userData.noRay || !GU.isShown(o)) continue;
        while (o && !o.userData.interact) o = o.parent;
        this.target = o ? o : null;
        break;
      }
    }

    use() {
      if (this.target) this.target.userData.interact.use();
    }

    pickUp(item) {
      if (this.inventory.length >= 9) { GU.say('Your hands are full. Drop something with Q.'); return; }
      item.parent.remove(item);
      this.inventory.push(item);
      this.held = this.inventory.length - 1;
      this.showHeld();
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
      const item = this.inventory[this.held];
      if (!item) return;
      const view = item.clone();
      const size = new THREE.Box3().setFromObject(view).getSize(new THREE.Vector3());
      const s = Math.min(1.6, 0.22 / Math.max(size.x, size.y, size.z, 0.01));
      view.scale.setScalar(s);
      view.position.set(0, -size.y * s / 2, 0);
      view.rotation.y = 0.5;
      hand.add(view);
    }

    drop() {
      const item = this.inventory[this.held];
      if (!item) return;
      // Put it on whatever we're looking at, or on the floor in front of us.
      this.ray.setFromCamera(new THREE.Vector2(0, 0), this.camera);
      this.ray.far = 2.0;
      let spot = null;
      for (const h of this.ray.intersectObjects(GU.rayRoots(), true)) {
        if (h.object.userData.noRay || !GU.isShown(h.object)) continue;
        if (h.face && h.face.normal.clone().transformDirection(h.object.matrixWorld).y > 0.6) spot = h.point;
        else spot = h.point.clone().add(this.ray.ray.direction.clone().multiplyScalar(-0.25));
        break;
      }
      if (!spot) spot = this.ray.ray.at(1.2, new THREE.Vector3());
      if (spot.y > 0.05) {
        this.down.set(new THREE.Vector3(spot.x, spot.y + 0.05, spot.z), new THREE.Vector3(0, -1, 0));
        const under = this.down.intersectObjects(GU.rayRoots(), true).find((h) => !h.object.userData.noRay && GU.isShown(h.object));
        spot.y = under ? under.point.y : this.pos.y;
      }
      this.inventory.splice(this.held, 1);
      item.position.copy(spot);
      item.rotation.set(0, this.yaw, 0);
      GU.dropped.add(item);
      this.held = Math.min(this.held, this.inventory.length - 1);
      this.showHeld();
      GU.say('Dropped ' + item.userData.item.name + '.', 1.5);
    }

    hud() {
      const t = this.target;
      const prompt = document.getElementById('prompt');
      const info = document.getElementById('info');
      if (t) {
        const ia = t.userData.interact;
        prompt.textContent = '[E] ' + ia.prompt();
        info.textContent = ia.info ? ia.info() : '';
      } else {
        prompt.textContent = '';
        info.textContent = '';
      }
      const msg = document.getElementById('msg');
      msg.textContent = GU.message && performance.now() < GU.message.until ? GU.message.text : '';
      const inv = document.getElementById('inv');
      const html = this.inventory.map((it, i) => (i === this.held ? '<b>&gt; ' : '<span>') + (i + 1) + '. ' + it.userData.item.name + (i === this.held ? '</b>' : '</span>')).join('<br>');
      if (inv.innerHTML !== html) inv.innerHTML = html;
      document.getElementById('cross').className = t ? 'hot' : '';
    }
  };
})();
