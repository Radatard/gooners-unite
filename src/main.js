// Entry point: sets up the renderer, builds the world, and runs the game loop.
(function () {
  const renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: 'high-performance' });
  renderer.setPixelRatio(1);
  document.getElementById('game').appendChild(renderer.domElement);
  const canvas = renderer.domElement;

  const scene = (GU.scene = new THREE.Scene());
  scene.background = new THREE.Color('#140f24');
  scene.fog = new THREE.Fog('#140f24', 16, 42);
  const camera = new THREE.PerspectiveCamera(72, 16 / 9, 0.05, 80);
  scene.add(camera);
  scene.add(new THREE.HemisphereLight('#fff1dc', '#4a3360', 0.8));
  scene.add(new THREE.AmbientLight('#ffffff', 0.2));

  GU.world = GU.group(scene);
  GU.building = GU.group(GU.world);
  GU.buildingLights = GU.group(scene);
  GU.dropped = GU.group(GU.world);

  // Held item is drawn in its own scene on top, so it never clips into walls.
  const handScene = new THREE.Scene();
  const handCam = new THREE.PerspectiveCamera(50, 16 / 9, 0.01, 5);
  handScene.add(new THREE.HemisphereLight('#fff1dc', '#4a3360', 1.6));
  const sun = new THREE.DirectionalLight('#ffffff', 1.4);
  sun.position.set(1, 2, 1);
  handScene.add(sun);
  GU.hand = GU.group(handScene, 0.2, -0.17, -0.5);

  // ---- build everything ----
  GU.buildBuilding();
  GU.aptBuilders.forEach((build) => build());
  GU.buildColliders(GU.world);
  GU.mergeStatic(GU.building);
  for (const a of GU.apartments) { GU.mergeStatic(a.content); GU.mergeStatic(a.shell); }

  // A small fixed pool of real lights, moved to the nearest room lights each frame.
  GU.scene.updateMatrixWorld(true);
  for (const v of GU.virtualLights) v.world.copy(v.local).applyMatrix4(v.parent.matrixWorld);
  const pool = [];
  for (let i = 0; i < 6; i++) {
    const l = new THREE.PointLight('#ffffff', 0, 9, 1.6);
    scene.add(l);
    pool.push(l);
  }
  function lights() {
    const p = player.pos;
    const sorted = GU.virtualLights.filter((v) => v.on).sort((a, b) => a.world.distanceToSquared(p) - b.world.distanceToSquared(p));
    pool.forEach((l, i) => {
      const v = sorted[i];
      if (!v) { l.intensity = 0; return; }
      l.position.copy(v.world);
      l.color.copy(v.color);
      l.distance = v.distance;
      l.intensity = v.base * v.mult;
    });
  }

  const player = (GU.player = new GU.Player(camera));
  GU.renderer = renderer;
  player.pos.set(19.5, 0, -1.5);
  player.yaw = Math.PI / 2 + 0.25;

  // Only the parts of the world you could possibly see are drawn / clickable.
  const probe = new THREE.Vector3();
  let roots = [];
  GU.rayRoots = () => roots;
  function cull() {
    probe.set(player.pos.x, player.pos.y + 1, player.pos.z);
    roots = [GU.building, GU.dropped];
    for (const a of GU.apartments) {
      const inside = a.bounds.containsPoint(probe);
      const open = a.door.userData.state.t > 0.001;
      a.content.visible = inside || (open && a.bounds.distanceToPoint(probe) < 30);
      roots.push(a.shell);
      if (a.content.visible) roots.push(a.content);
    }
  }

  // ---- zone label ----
  let zoneName = '', zoneTime = 0;
  function zones(dt) {
    probe.set(player.pos.x, player.pos.y + 1, player.pos.z);
    const z = GU.zones.find((zz) => zz.box.containsPoint(probe));
    const name = z ? z.name : '';
    const el = document.getElementById('zone');
    if (name !== zoneName) { zoneName = name; zoneTime = 0; el.textContent = name; }
    zoneTime += dt;
    el.style.opacity = zoneTime < 3 ? 1 : Math.max(0, 1 - (zoneTime - 3));
  }

  // ---- sizing: render at a low fixed height and let CSS scale it up with crisp pixels ----
  function resize() {
    const h = GU.RENDER_HEIGHT;
    const w = Math.round(h * innerWidth / innerHeight);
    renderer.setSize(w, h, false);
    camera.aspect = handCam.aspect = w / h;
    camera.updateProjectionMatrix();
    handCam.updateProjectionMatrix();
    GU.snapUniform.value.set(w / 2, h / 2);
  }
  addEventListener('resize', resize);
  resize();

  // ---- pointer lock / title screen ----
  const overlay = document.getElementById('overlay');
  overlay.addEventListener('click', () => canvas.requestPointerLock());
  document.addEventListener('pointerlockchange', () => {
    GU.locked = document.pointerLockElement === canvas;
    overlay.classList.toggle('hidden', GU.locked);
    document.getElementById('play').textContent = GU.started ? 'CLICK TO RESUME' : 'CLICK TO ENTER';
    if (GU.locked) GU.started = true;
  });

  // ---- loop ----
  let last = performance.now();
  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    cull();
    player.update(dt);
    for (const u of GU.updaters) u(dt);
    lights();
    zones(dt);
    player.hud();
    GU.hand.position.y = -0.17 + Math.sin(player.bob * 0.5) * 0.008;
    renderer.autoClear = true;
    renderer.render(scene, camera);
    renderer.autoClear = false;
    renderer.clearDepth();
    renderer.render(handScene, handCam);
    requestAnimationFrame(frame);
  }
  // Compile every shader now (while LOADING is up) instead of stuttering the first time you see something.
  setTimeout(() => {
    GU.apartments.forEach((a) => { a.content.visible = true; });
    lights();
    renderer.compile(scene, camera);
    renderer.compile(handScene, handCam);
    document.getElementById('loading').remove();
    requestAnimationFrame(frame);
  }, 30);
})();
