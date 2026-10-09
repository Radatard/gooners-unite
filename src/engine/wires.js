// Electrical wire you can pull out of smashed-open walls and hook up to things.
//
// [E] on an exposed wire (inside a wall you've opened up) pulls a length of Romex out. It trails
// from the wall to your hand. [E] on something connects the loose end to it:
//   - an appliance (TV, lamp, microwave, toaster...) powers up, and sometimes it can't take it
//   - a trash monster gets electrocuted (it locks up and takes damage)
//   - a trash can wakes up as a trash monster, already electrocuted
//   - another wire gets spliced on: a cut circuit comes back to life
//   - anything else just gets the wire tied to it
// [Q] drops the end. [E] on a loose end picks it back up. Live wires zap you, so flip the breaker
// first. A wire only has so much slack (MAX); walk too far and it yanks out of your hand.
(function () {
  const MAX = 6;
  const cables = [];
  let held = null;
  const V = () => new THREE.Vector3();
  const rnd = () => Math.random() - 0.5;
  const down = new THREE.Raycaster(), DOWN = new THREE.Vector3(0, -1, 0);
  const tmp = new THREE.Vector3(), pad = new THREE.Box3();

  // What appliances do when you wire them straight into the wall. pop = chance it blows up.
  const DEVICES = {
    TV: { glow: '#9ecbff', flicker: true, msg: 'The TV blinks on. Static, then a cooking show.', pop: 0.1 },
    lamp: { glow: '#ffe2a8', msg: 'The lamp lights up.', pop: 0.08 },
    'floor lamp': { glow: '#ffe2a8', msg: 'The floor lamp lights up.', pop: 0.08 },
    microwave: { glow: '#ffd27a', msg: 'The microwave starts running. There is nothing in it.', pop: 0.25 },
    toaster: { glow: '#ff7a1a', msg: 'The toaster glows red hot.', pop: 0.3 },
    'coffee maker': { glow: '#ffb15c', msg: 'The coffee maker gurgles to life.', pop: 0.15 },
    fridge: { glow: '#e8f6ff', msg: 'The fridge shudders and hums louder.', pop: 0.05 },
    'washer/dryer': { glow: '#cfe8ff', msg: 'The dryer starts tumbling. Empty.', pop: 0.1 },
    stove: { glow: '#ff5a1a', msg: 'The stove clock starts blinking 12:00.', pop: 0.05 },
  };

  function groundAt(p) {
    down.set(new THREE.Vector3(p.x, p.y + 0.3, p.z), DOWN);
    down.far = 5;
    const h = down.intersectObjects(GU.walkables, false)[0];
    return h ? h.point.y : p.y - 1;
  }

  function handPoint(P) {
    const cam = P.camera, f = V(), r = V();
    cam.getWorldDirection(f);
    r.set(1, 0, 0).applyQuaternion(cam.quaternion);
    return cam.position.clone().addScaledVector(f, 0.45).addScaledVector(r, 0.16).add(new THREE.Vector3(0, -0.22, 0));
  }

  const nameOf = (o) => (o.userData.breakable && o.userData.breakable.name) || o.userData.name || (o.userData.item && o.userData.item.name) || 'thing';

  class Cable {
    constructor(e, point) {
      this.e = e;
      this.circuit = e.circuit;
      this.anchor = point.clone();
      this.end = point.clone();
      this.floor = groundAt(point);
      this.to = null;
      this.mesh = new THREE.Mesh(new THREE.BufferGeometry(), e.mat);
      this.mesh.userData.noRay = true;
      GU.scene.add(this.mesh);
      this.last = null;
      this.tickT = 0;
      this.zapT = 0;
      this.light = null;
      this.boom = 0;
      // that stretch of wire comes out of the wall (still connected, so the circuit stays live)
      e.broken = true;
      e.pulled = true;
      e.wall.geoDirty = true;
      const ch = GU.wallChunks.get(e.wall.chunk);
      if (ch) ch.dirty = true;
      cables.push(this);
    }
    live() { return !!(this.circuit && this.circuit.live()); }
  }

  // An exposed, intact wire under the crosshair (nothing solid in front of it).
  function findWire(P) {
    const r = P.ray.ray;
    const solid = GU.raycastWalls(r, 2.3);
    let best = null;
    for (const w of GU.walls) {
      if (!w.anyBroken) continue;
      const hw = r.intersectBox(w.box, tmp);
      if (!hw || hw.distanceTo(r.origin) > 2.6) continue;
      for (const e of w.els) {
        if (e.k !== 'wire' || e.broken) continue;
        const p = r.intersectBox(pad.copy(e.box).expandByScalar(0.035), tmp);
        if (!p) continue;
        const d = p.distanceTo(r.origin);
        if (d > 2.3 || (best && d > best.dist)) continue;
        if (solid && solid.e !== e && solid.dist < d - 0.04) continue;
        best = { e, wall: w, dist: d, point: p.clone() };
      }
    }
    if (best && P.hit && P.hit.distance < best.dist - 0.04) return null;
    return best;
  }

  // A loose cable end near the crosshair.
  function findEnd(P) {
    const r = P.ray.ray;
    let best = null;
    for (const c of cables) {
      if (c === held) continue;
      const t = tmp.copy(c.end).sub(r.origin).dot(r.direction);
      if (t < 0 || t > 2.3) continue;
      const d = r.distanceSqToPoint(c.end);
      if (d < 0.03 && (!best || t < best.t)) best = { c, t };
    }
    return best && best.c;
  }

  function clearLight(c) {
    if (!c.light) return;
    const i = GU.virtualLights.indexOf(c.light);
    if (i >= 0) GU.virtualLights.splice(i, 1);
    c.light = null;
  }

  function detach(c) {
    clearLight(c);
    c.to = null;
    c.boom = 0;
  }

  function dropEnd(c, msg) {
    detach(c);
    if (held === c) held = null;
    c.end.y = groundAt(c.end) + 0.012;
    if (msg !== false) GU.say(msg || 'You drop the wire.', 1.5);
  }

  function grab(P, hit) {
    const c = new Cable(hit.e, hit.point);
    held = c;
    GU.sfx('scrape');
    if (c.live()) {
      GU.sparks(hit.point.clone());
      GU.hurtPlayer(4, { shake: 0.3 });
      GU.say('ZZT! Live wire. Should have flipped the breaker first. [E] on something to connect it, [Q] to drop it.', 4);
    } else {
      GU.say('You pull a length of Romex out of the wall. [E] on something to connect it, [Q] to drop it.', 4);
    }
  }

  // ---- connecting the end to things ----
  function connectMonster(c, m, point) {
    held = null;
    c.to = { kind: 'monster', mon: m, off: point.clone().sub(m.pos) };
    GU.sfx('zap');
    GU.say(c.live() ? 'You jam the live wire into the trash monster.' : 'You stick the wire in the trash monster. It\'s dead, it just tickles.', 2.5);
  }

  function connectDevice(c, obj, def, point) {
    held = null;
    c.to = { kind: 'device', obj, def, local: obj.worldToLocal(point.clone()) };
    const light = {
      parent: GU.scene, local: V(), world: point.clone(), color: new THREE.Color(def.glow), base: 2.4, distance: 4.5, mult: 1, lit: false, fixed: true,
      isOn: () => c.to && c.to.obj === obj && !obj.userData.broken && c.live(),
    };
    light.refresh = () => { light.lit = light.isOn() && light.mult > 0.3; };
    GU.virtualLights.push(light);
    c.light = light;
    if (c.live()) {
      GU.sparks(point.clone());
      GU.say(def.msg, 3);
      if (Math.random() < def.pop) c.boom = 1.5 + Math.random() * 2;
    } else GU.say('You wire up the ' + nameOf(obj) + '. Nothing happens: that circuit is dead.', 3);
  }

  function splice(c, w) {
    held = null;
    c.to = { kind: 'wire', el: w.e, point: w.point.clone() };
    c.end.copy(w.point);
    const a = c.circuit, b = w.e.circuit;
    GU.sfx('click');
    if (a && b && a.live() && b.cut) { b.cut = false; GU.sparks(w.point.clone()); GU.say('You splice the wires together. The ' + b.name + ' circuit comes back on.', 3.5); }
    else if (a && b && b.live() && a.cut) { a.cut = false; GU.sparks(w.point.clone()); GU.say('You splice the wires together. The ' + a.name + ' circuit comes back on.', 3.5); }
    else if (a && b && a.live() && b.live()) { GU.sparks(w.point.clone()); GU.say('You twist two live wires together. Sparks fly. Nothing else happens.', 3); }
    else GU.say('You splice the wires together. Both are dead.', 2.5);
  }

  function connectThing(c, obj, point) {
    held = null;
    c.to = { kind: 'thing', obj, local: obj.worldToLocal(point.clone()) };
    if (c.live()) { GU.sparks(point.clone()); GU.say('Sparks fly off the ' + nameOf(obj) + '. It isn\'t electric.', 2.5); }
    else GU.say('You tie the wire to the ' + nameOf(obj) + '.', 2);
  }

  // What [E] would connect to right now.
  function aimed(P) {
    const o = P.hit && P.hit.object;
    const mon = o && GU.monsterOf && GU.monsterOf(o);
    if (mon) return { kind: 'monster', mon, label: 'Electrocute the trash monster' };
    let can = o;
    while (can && !can.userData.trashCan) can = can.parent;
    if (can && !can.userData.broken) return { kind: 'can', obj: can, label: 'Electrify the trash can' };
    const w = findWire(P);
    if (w && (!held || w.e !== held.e)) return { kind: 'wire', w, label: 'Splice the wires' };
    let dev = o;
    while (dev && !(dev.userData.name && DEVICES[dev.userData.name])) dev = dev.parent;
    if (dev && !dev.userData.broken) return { kind: 'device', obj: dev, label: 'Wire up the ' + dev.userData.name };
    if (o && P.hit.distance < 2.3) {
      let thing = o;
      while (thing.parent && thing.parent !== GU.dropped && !thing.userData.interact && !thing.userData.movable && !thing.userData.breakable) thing = thing.parent;
      return { kind: 'thing', obj: thing, label: 'Tie the wire to the ' + nameOf(thing) };
    }
    return null;
  }

  // Called from player.use() first. Returns true if it handled the [E] press.
  GU.wireUse = function (P) {
    if (held) {
      const a = aimed(P);
      if (!a) { dropEnd(held); return true; }
      if (a.kind === 'monster') connectMonster(held, a.mon, P.hit.point);
      else if (a.kind === 'can') {
        if (!held.live()) { GU.say('You poke the trash can with a dead wire. Nothing happens.', 2); return true; }
        GU.sparks(P.hit.point.clone());
        const pt = P.hit.point.clone();
        const m = GU.trashMonster(a.obj);
        GU.say('You electrify the trash can. It wakes up ANGRY.', 3);
        connectMonster(held, m, pt);
      } else if (a.kind === 'wire') splice(held, a.w);
      else if (a.kind === 'device') connectDevice(held, a.obj, DEVICES[a.obj.userData.name], P.hit.point);
      else connectThing(held, a.obj, P.hit.point);
      return true;
    }
    const end = findEnd(P);
    if (end && (!P.hit || P.hit.distance > tmp.copy(end.end).sub(P.ray.ray.origin).length() - 0.1)) {
      detach(end);
      held = end;
      GU.sfx('scrape');
      if (end.live()) { GU.sparks(end.end.clone()); GU.hurtPlayer(3, { shake: 0.2 }); GU.say('ZZT! That end is live.', 2); }
      else GU.say('You pick up the end of the wire.', 1.5);
      return true;
    }
    if (P.target) return false;
    const w = findWire(P);
    if (w) { grab(P, w); return true; }
    return false;
  };

  // Called from player.drop() first.
  GU.wireDrop = function () {
    if (!held) return false;
    dropEnd(held);
    return true;
  };

  GU.wireHeld = () => !!held;
  GU.wirePrompt = function (P) {
    if (held) {
      const a = aimed(P);
      return '[E] ' + (a ? a.label : 'Drop the wire') + '   [Q] Drop the wire';
    }
    const end = findEnd(P);
    if (end) return '[E] Pick up the wire';
    if (!P.target && findWire(P)) return '[E] Pull out the wire';
    return '';
  };

  // Sagging cable from the wall to its end.
  function rebuild(c) {
    const a = c.anchor, b = c.end, d = a.distanceTo(b);
    if (c.last && c.last.distanceToSquared(b) < 1e-6) return;
    c.last = (c.last || V()).copy(b);
    const sag = 0.08 + 0.35 * Math.max(0, 1 - d / MAX);
    const floor = Math.min(c.floor, groundAt(b)) + 0.01;
    const pts = [];
    for (let i = 0; i <= 10; i++) {
      const t = i / 10, p = a.clone().lerp(b, t);
      p.y = Math.max(floor, p.y - sag * 4 * t * (1 - t));
      pts.push(p);
    }
    const g = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 18, 0.007, 4, false);
    c.mesh.geometry.dispose();
    c.mesh.geometry = g;
  }

  GU.updaters.push((dt) => {
    const P = GU.player;
    if (!P) return;
    if (held && GU.dead) dropEnd(held, false);
    for (const c of cables) {
      const live = c.live();
      if (c === held) {
        const h = handPoint(P);
        if (h.distanceTo(c.anchor) > MAX) {
          c.end.copy(c.anchor).add(h.sub(c.anchor).setLength(MAX));
          dropEnd(c, 'The wire pulls tight and yanks out of your hand.');
        } else c.end.copy(h);
      } else if (c.to) {
        const to = c.to;
        if (to.kind === 'monster') {
          const m = to.mon;
          if (m.state === 'dead') dropEnd(c, false);
          else {
            c.end.copy(m.pos).add(to.off);
            if (c.end.distanceTo(c.anchor) > MAX + 1) dropEnd(c, 'The trash monster rips the wire out.');
            else if (live && (c.tickT -= dt) <= 0) {
              c.tickT = 0.25;
              m.shock = 0.35;
              m.hurt(1.2, V(), c.end.clone());
              if (Math.random() < 0.5) GU.sparks(c.end.clone());
            }
          }
        } else if (to.kind === 'device' || to.kind === 'thing') {
          const o = to.obj;
          if (o.userData.broken || !o.parent) dropEnd(c, false);
          else if (o.localToWorld(to.local.clone()).distanceTo(c.anchor) > MAX + 1) dropEnd(c, 'The wire pulls out of the ' + nameOf(o) + '.');
          else {
            c.end.copy(o.localToWorld(to.local.clone()));
            if (c.light) {
              c.light.world.copy(c.end).add(new THREE.Vector3(0, 0.3, 0));
              c.light.mult = to.def && to.def.flicker ? (Math.random() < 0.15 ? 0.2 : 1) : 1;
            }
            if (live && Math.random() < dt * 0.4) GU.sparks(c.end.clone());
            if (c.boom > 0 && live && (c.boom -= dt) <= 0) {
              const name = nameOf(o);
              GU.sparks(c.end.clone());
              GU.say('The ' + name + ' couldn\'t handle raw wall power. It blows up.', 3);
              if (o.userData.breakable) GU.smash(o, c.end.clone(), { energy: 40, dir: new THREE.Vector3(0, 1, 0), speed: 8 });
              dropEnd(c, false);
            }
          }
        } else if (to.kind === 'wire' && to.el.broken) dropEnd(c, false);
      } else if (live && !GU.dead) {
        // stepping on a loose live end hurts
        c.zapT -= dt;
        if (c.zapT <= 0 && Math.hypot(P.pos.x - c.end.x, P.pos.z - c.end.z) < 0.35 && Math.abs(P.pos.y - c.end.y) < 0.4) {
          c.zapT = 1;
          GU.sparks(c.end.clone());
          GU.hurtPlayer(5, { shake: 0.3 });
          GU.say('You stepped on a live wire.', 1.5);
        }
      }
      rebuild(c);
    }
  });
})();
