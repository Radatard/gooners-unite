// Core engine: shared state, seeded random, materials, geometry helpers and the PS1 look.
// Everything lives on the global `GU` object so plain <script> files can share it.
window.GU = {
  colliders: [],   // { box: THREE.Box3, enabled: fn|null } — things you can't walk through
  walkables: [],   // meshes the player can stand on (floors, stairs)
  updaters: [],    // functions(dt) called every frame (door animations, flicker, ...)
  zones: [],       // named areas shown in the HUD when you enter them
  apartments: [],  // { content: Group, bounds: Box3, door } used for visibility culling
  RENDER_HEIGHT: 270, // vertical resolution — low on purpose for the PS1 look
};

GU.makeRng = function (seed) {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

GU.hash = function (str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) h = Math.imul(h ^ str.charCodeAt(i), 16777619);
  return h >>> 0;
};

GU.pick = (rng, arr) => arr[Math.floor(rng() * arr.length)];
GU.range = (rng, a, b) => a + rng() * (b - a);

// ---------- PS1 vertex snapping ----------
// Snaps every vertex to a coarse screen grid, giving the wobbly PlayStation feel.
GU.snapUniform = { value: new THREE.Vector2(240, 135) };
GU.ps1 = function (m) {
  m.onBeforeCompile = (shader) => {
    shader.uniforms.uSnap = GU.snapUniform;
    shader.vertexShader = 'uniform vec2 uSnap;\n' + shader.vertexShader.replace(
      '#include <project_vertex>',
      '#include <project_vertex>\n' +
      'vec4 ps1p = gl_Position;\n' +
      'ps1p.xy = floor(ps1p.xy / ps1p.w * uSnap + 0.5) / uSnap * ps1p.w;\n' +
      'gl_Position = ps1p;'
    );
  };
  return m;
};

// ---------- materials (cached) ----------
const matCache = new Map();
// GU.mat('#ff0000') or GU.mat('#ffffff', texture, { emissive: '#222', basic: true, transparent: true, opacity: 0.5 })
GU.mat = function (color, map, extra) {
  const key = color + '|' + (map ? map.uuid : '') + '|' + (extra ? JSON.stringify(extra) : '');
  let m = matCache.get(key);
  if (m) return m;
  const opts = Object.assign({ color: color || '#ffffff' }, extra || {});
  if (map) opts.map = map;
  const basic = opts.basic;
  delete opts.basic;
  m = GU.ps1(basic ? new THREE.MeshBasicMaterial(opts) : new THREE.MeshLambertMaterial(opts));
  matCache.set(key, m);
  return m;
};

// Glowing material (lamps, screens, fridge light)
GU.glow = (color, map) => GU.mat(color, map, { basic: true });

// ---------- geometry ----------
// Box whose UVs are in meters, so tiling textures keep the same scale on any size box.
const geoCache = new Map();
GU.boxGeo = function (w, h, d, unit) {
  const key = (unit ? 'u' : 'm') + w.toFixed(3) + ',' + h.toFixed(3) + ',' + d.toFixed(3);
  let g = geoCache.get(key);
  if (g) return g;
  g = new THREE.BoxGeometry(w, h, d);
  if (!unit) {
    const uv = g.attributes.uv;
    const dims = [[d, h], [d, h], [w, d], [w, d], [w, h], [w, h]];
    for (let f = 0; f < 6; f++) {
      for (let i = 0; i < 4; i++) {
        const k = f * 4 + i;
        uv.setXY(k, uv.getX(k) * dims[f][0], uv.getY(k) * dims[f][1]);
      }
    }
  }
  geoCache.set(key, g);
  return g;
};

function finish(m, parent, o) {
  if (o.ry) m.rotation.y = o.ry;
  if (o.rx) m.rotation.x = o.rx;
  if (o.rz) m.rotation.z = o.rz;
  if (o.solid) m.userData.solid = true;
  if (o.walk) GU.walkables.push(m);
  if (o.name) m.name = o.name;
  parent.add(m);
  return m;
}

// Box positioned by its bottom-center: (x, z) is the center, y is the bottom.
GU.box = function (parent, w, h, d, x, y, z, mat, o) {
  o = o || {};
  const m = new THREE.Mesh(GU.boxGeo(w, h, d, o.unitUV), mat);
  m.position.set(x, y + h / 2, z);
  return finish(m, parent, o);
};

const cylCache = new Map();
GU.cyl = function (parent, rTop, rBot, h, x, y, z, mat, o) {
  o = o || {};
  const seg = o.seg || 10;
  const key = rTop + ',' + rBot + ',' + h + ',' + seg + ',' + (o.open ? 1 : 0);
  let g = cylCache.get(key);
  if (!g) { g = new THREE.CylinderGeometry(rTop, rBot, h, seg, 1, !!o.open); cylCache.set(key, g); }
  const m = new THREE.Mesh(g, mat);
  m.position.set(x, y + h / 2, z);
  return finish(m, parent, o);
};

GU.sphere = function (parent, r, x, y, z, mat, o) {
  o = o || {};
  const m = new THREE.Mesh(new THREE.SphereGeometry(r, o.seg || 8, o.rings || 6), mat);
  m.position.set(x, y, z);
  if (o.sx) m.scale.set(o.sx, o.sy || 1, o.sz || 1);
  return finish(m, parent, o);
};

GU.torus = function (parent, r, tube, x, y, z, mat, o) {
  o = o || {};
  const m = new THREE.Mesh(new THREE.TorusGeometry(r, tube, 5, o.seg || 10, o.arc || Math.PI * 2), mat);
  m.position.set(x, y, z);
  return finish(m, parent, o);
};

GU.plane = function (parent, w, h, x, y, z, mat, o) {
  o = o || {};
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
  m.position.set(x, y, z);
  return finish(m, parent, o);
};

GU.group = function (parent, x, y, z, ry) {
  const g = new THREE.Group();
  g.position.set(x || 0, y || 0, z || 0);
  if (ry) g.rotation.y = ry;
  parent.add(g);
  return g;
};

// After the world is built, turn every `solid` mesh into a world-space collision box.
GU.buildColliders = function (root) {
  root.updateMatrixWorld(true);
  root.traverse((o) => {
    if (o.isMesh && o.userData.solid) {
      GU.colliders.push({ box: new THREE.Box3().setFromObject(o), enabled: o.userData.enabledFn || null });
    }
  });
};

// ---------- static batching ----------
// Thousands of little meshes = thousands of draw calls, which weak GPUs can't handle.
// After building, merge every non-moving mesh into one mesh per material. Things that move or
// can be used (doors, drawers, items...) keep their own small merged meshes so they still work.
// Mark a mesh userData.noMerge if code changes it later (material swaps, animation).
// Mark a group userData.mergeRoot if it gets shown/hidden on its own.
GU.mergeStatic = function (root) {
  root.updateMatrixWorld(true);
  const walk = new Set(GU.walkables);
  const buckets = new Map();
  const victims = [];
  const inv = new THREE.Matrix4(), m = new THREE.Matrix4(), nm = new THREE.Matrix3();
  const v = new THREE.Vector3();
  root.traverse((o) => {
    if (!o.isMesh || !o.visible || o.userData.noMerge || walk.has(o)) return;
    let b = o.parent;
    while (b !== root && !b.userData.interact && !b.userData.mergeRoot) b = b.parent;
    const geo = o.geometry;
    if (!geo.index || !geo.attributes.normal || !geo.attributes.uv) return;
    inv.copy(b.matrixWorld).invert();
    m.multiplyMatrices(inv, o.matrixWorld);
    nm.getNormalMatrix(m);
    const groups = Array.isArray(o.material) ? geo.groups : [{ start: 0, count: geo.index.count, materialIndex: -1 }];
    for (const gr of groups) {
      const mat = gr.materialIndex < 0 ? o.material : o.material[gr.materialIndex];
      const key = b.uuid + mat.uuid;
      let k = buckets.get(key);
      if (!k) { k = { b, mat, pos: [], nor: [], uv: [], idx: [] }; buckets.set(key, k); }
      const base = k.pos.length / 3;
      const P = geo.attributes.position, N = geo.attributes.normal, U = geo.attributes.uv;
      for (let i = 0; i < P.count; i++) {
        v.fromBufferAttribute(P, i).applyMatrix4(m); k.pos.push(v.x, v.y, v.z);
        v.fromBufferAttribute(N, i).applyMatrix3(nm).normalize(); k.nor.push(v.x, v.y, v.z);
        k.uv.push(U.getX(i), U.getY(i));
      }
      for (let i = gr.start; i < gr.start + gr.count; i++) k.idx.push(geo.index.getX(i) + base);
    }
    victims.push(o);
  });
  for (const o of victims) o.parent.remove(o);
  for (const k of buckets.values()) {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(k.pos, 3));
    g.setAttribute('normal', new THREE.Float32BufferAttribute(k.nor, 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(k.uv, 2));
    g.setIndex(k.idx);
    g.computeBoundingSphere();
    k.b.add(new THREE.Mesh(g, k.mat));
  }
};

// Show `group` only while one of the given doors/drawers is open (saves drawing closed cupboards).
GU.hideWhenClosed = function (group, parts) {
  group.userData.mergeRoot = true;
  group.visible = false;
  GU.updaters.push(() => {
    let open = false;
    for (const p of parts) if (p.userData.state.t > 0.001) { open = true; break; }
    group.visible = open;
  });
  return group;
};

// Invisible wall / blocker
GU.blocker = function (parent, w, h, d, x, y, z) {
  const m = GU.box(parent, w, h, d, x, y, z, GU.mat('#000'), { solid: true });
  m.visible = false;
  return m;
};

// ---------- messages ----------
GU.say = function (text, secs) {
  GU.message = { text, until: performance.now() + (secs || 3) * 1000 };
};

// Make an object usable with E. prompt() returns the "[E] ..." text, use() runs on press.
GU.interactive = function (obj, prompt, use, info) {
  obj.userData.interact = {
    prompt: typeof prompt === 'function' ? prompt : () => prompt,
    use: use || (() => {}),
    info: info ? (typeof info === 'function' ? info : () => info) : null,
  };
  return obj;
};
