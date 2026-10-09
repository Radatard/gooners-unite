// The shared parts of the building's first floor: hallway, lobby, stairs, mailboxes.
//
// Top-down (world meters, +x east, +z north):
//
//          x=-14            x=0             x=14      x=22
//   z=13.5  +---------------+---------------+
//           |   Apt 101     |   Apt 102     |  +-------+ z=6
//   z=1.5   +------D--------+------D--------+--+ stairs|
//           |   H A L L W A Y                  LOBBY   | (front doors on east wall)
//   z=-1.5  +--------D------+--------D------+--+       |
//           |   Apt 104     |   Apt 103     |  +-------+ z=-6
//   z=-13.5 +---------------+---------------+
GU.buildBuilding = function () {
  const B = GU.building;
  const T = GU.LAYOUT.T;
  const M = (c) => GU.mat(c);
  const hallWall = GU.mat('#ffffff', GU.tex.stripes('#2ec4b6', '#e8f7f2'));
  const lobbyWall = GU.mat('#ffffff', GU.tex.paint('#ffcf70'));
  const brick = GU.mat('#ffffff', GU.tex.brick('#b5523b'));
  GU.hallWallMat = hallWall;

  // ---- hallway ----
  GU.floor(B, -14, -1.5, 14, 1.5, GU.mat('#ffffff', GU.tex.carpet('#7a2048')));
  GU.rug(B, 0, 0, 26, 1.4, GU.tex.rug('#b8336a', '#f4d35e', '#2ec4b6'));
  GU.ceiling(B, -14, -1.5, 14, 1.5, GU.mat('#ffffff', GU.tex.ceiling(0.15)));
  GU.wall(B, 'z', -14 + T / 2, -1.5, 1.5, hallWall, hallWall, [{ a: -0.6, b: 0.6, bottom: 1.0, top: 2.1 }]);
  GU.window(B, 'z', -14 + T / 2, -0.6, 0.6, 1.0, 2.1, -1, { view: 'The alley. A dumpster and a raccoon who looks busy.' });
  const lights = [-9, 0, 9].map((x, i) => GU.ceilingLight(GU.buildingLights, B, x, 0, { color: '#fff3c4', intensity: 4, distance: 9, flicker: i === 0 }));
  // fire extinguisher
  const fe = GU.group(B, -13.7, 0.9, 1.2);
  GU.cyl(fe, 0.07, 0.07, 0.45, 0, 0, 0, M('#d62828'));
  GU.box(fe, 0.05, 0.08, 0.1, 0, 0.45, 0.02, M('#222'));
  GU.interactive(fe, 'Inspect fire extinguisher', () => GU.say('Last inspected: 2019. Comforting.'));
  // trash chute
  const chute = GU.group(B, -13.86, 0.9, -0.9, Math.PI / 2);
  GU.box(chute, 0.5, 0.45, 0.04, 0, 0, 0, GU.mat('#ffffff', GU.tex.metal('#9ea7ad')));
  GU.box(chute, 0.3, 0.05, 0.03, 0, 0.35, 0.03, M('#555'));
  GU.interactive(chute, 'Open trash chute', () => GU.say('A warm smell rises from the chute. You close it fast.'));
  // smoke detectors + exit sign
  for (const x of [-6, 6]) GU.cyl(B, 0.07, 0.07, 0.03, x, 2.67, 0, M('#f4f4f4'));
  GU.box(B, 0.5, 0.18, 0.06, 13.7, 2.3, 0, GU.glow('#ffffff', GU.tex.label('#d62828', null, 'EXIT', '#ffffff')), { ry: Math.PI / 2, unitUV: true });

  // ---- lobby ----
  const LH = 6;
  GU.floor(B, 14, -6, 22, 6, GU.mat('#ffffff', GU.tex.checker('#f4f1e6', '#1b998b', 0.5)));
  GU.ceiling(B, 14, -6, 22, 6, GU.mat('#ffffff', GU.tex.ceiling()), LH);
  GU.wall(B, 'z', 14 + T / 2, -6, 6, lobbyWall, lobbyWall, [{ a: -1.5, b: 1.5, top: GU.LAYOUT.H }], { h: LH });
  GU.wall(B, 'x', 6 - T / 2, 14, 22, lobbyWall, brick, null, { h: LH });
  GU.wall(B, 'x', -6 + T / 2, 14, 22, brick, lobbyWall, null, { h: LH });
  GU.wall(B, 'z', 22 - T / 2, -6, 6, brick, brick, [
    { a: -1.0, b: 1.0, top: 2.4 },
    { a: 4.0, b: 4.9, bottom: 3.0, top: 5.1 },
  ], { h: LH });
  GU.ceilingLight(GU.buildingLights, B, 18, -2.5, { h: LH, color: '#ffe0b0', intensity: 5, distance: 14 });
  GU.ceilingLight(GU.buildingLights, B, 18, 3.5, { h: LH, color: '#ffe0b0', intensity: 5, distance: 14 });
  const chandelier = GU.group(B, 18, 4.6, 0);
  GU.cyl(chandelier, 0.01, 0.01, 1.4, 0, 0, 0, M('#222'));
  GU.sphere(chandelier, 0.3, 0, 0, 0, GU.glow('#fff1c4'), { seg: 8, rings: 6 });

  // front entrance: locked glass double doors with the outside behind them
  const outside = GU.group(B, 22, 0, 0, Math.PI / 2);
  GU.plane(outside, 6, 4, 0, 1.6, 1.2, GU.glow('#ffffff', GU.tex.sky()), { ry: Math.PI });
  GU.box(outside, 6, 0.02, 1.2, 0, -0.02, 0.6, M('#9e9e9e'));
  for (const s of [-1, 1]) {
    const d = GU.group(outside, s * 0.5, 0, 0);
    GU.box(d, 0.98, 2.38, 0.04, 0, 0, 0, GU.mat('#bfe6ff', null, { transparent: true, opacity: 0.3 }), { solid: true });
    GU.box(d, 0.98, 0.08, 0.06, 0, 0, 0, M('#555'));
    GU.box(d, 0.98, 0.08, 0.06, 0, 2.3, 0, M('#555'));
    GU.box(d, 0.7, 0.04, 0.06, 0, 1.0, -0.04, GU.mat('#ffffff', GU.tex.metal('#c9ced4')));
    GU.interactive(d, 'Open front door', () => GU.say('Locked. A sign says: "Building closed for renovations. Residents only."'));
  }
  GU.rug(B, 21.2, 0, 1.2, 2.2, GU.tex.rug('#1b998b', '#222222', '#f4d35e'));

  // mailboxes on the south wall
  const mb = GU.group(B, 16.4, 0.9, -6 + T + 0.12);
  GU.box(mb, 1.6, 1.0, 0.24, 0, 0, 0, GU.mat('#ffffff', GU.tex.metal('#c9a227')));
  const names = ['101 RAMIREZ', '102 D. KOWALSKI', '103 E. HALE', '104 PATEL / NGUYEN', '201', '202', '203', '204'];
  names.forEach((n, i) => {
    const col = i % 4, row = Math.floor(i / 4);
    const door = GU.group(mb, -0.6 + col * 0.4, 0.55 - row * 0.45, 0.125);
    GU.box(door, 0.36, 0.4, 0.01, 0, 0, 0, GU.mat('#ffffff', GU.tex.label('#d9b44a', '#f4f1e6', n.split(' ')[0], '#333')), { unitUV: true });
    const msgs = ['Bills, a dentist reminder, and a kid\'s magazine.', 'Supplement catalogs. Lots of them.', 'A handwritten letter from her grandson.', 'Two overdue notices and a pizza coupon.'];
    GU.interactive(door, 'Check mailbox ' + n, () => GU.say(i < 4 ? msgs[i] : 'Empty. Nobody lives upstairs yet.'));
  });
  // packages
  const pk = GU.group(B, 18.4, 0, -5.4);
  GU.box(pk, 0.5, 0.35, 0.4, 0, 0, 0, GU.mat('#ffffff', GU.tex.label('#c49a6c', '#1d4ed8', '102')), { unitUV: true });
  GU.box(pk, 0.35, 0.25, 0.3, 0.45, 0, 0.05, GU.mat('#ffffff', GU.tex.label('#c49a6c', null, '')), { unitUV: true });
  GU.box(pk, 0.3, 0.2, 0.3, 0.1, 0.35, 0, GU.mat('#ffffff', GU.tex.label('#c49a6c', '#c62828', '104')), { unitUV: true });
  GU.blocker(pk, 0.9, 0.55, 0.45, 0.2, 0, 0).userData.noRay = true;
  GU.interactive(pk, 'Read package labels', () => GU.say('"PROTEIN WHEY 10LB" for 102. A box of energy drinks for 104. Somebody\'s Amazon order.'));

  // notice board
  const nb = GU.group(B, 14 + T + 0.02, 1.5, -3.5, Math.PI / 2);
  GU.box(nb, 1.2, 0.8, 0.03, 0, 0, 0, GU.mat('#ffffff', GU.tex.carpet('#b5835a')));
  ['#fff59d', '#ffffff', '#ffcdd2', '#b3e5fc', '#c8e6c9'].forEach((c, i) => {
    GU.box(nb, 0.22, 0.28, 0.005, -0.42 + i * 0.21, 0.25 + (i % 2) * 0.22, 0.02, M(c), { rz: (i - 2) * 0.05 });
  });
  const flyers = [
    'QUIET HOURS ARE 10PM-7AM. This means YOU, 104.',
    'FOUND: orange cat on the stairs. Belongs to 103. Her name is Biscuit.',
    'Whoever keeps taking my packages: I have cameras. — 102',
    'Laundry machines upstairs are coming soon. (Since 2021.)',
    'Bake sale Saturday! Proceeds go to Lily\'s school trip. — 101',
  ];
  let fi = 0;
  GU.interactive(nb, 'Read notice board', () => GU.say(flyers[fi++ % flyers.length], 5));

  // bench + plants
  const bench = GU.group(B, 15.0, 0, 1.5 + 2.5);
  GU.box(bench, 0.45, 0.06, 1.4, 0, 0.42, 0, GU.mat('#ffffff', GU.tex.wood('#8b5a2b')), { solid: true });
  for (const z of [-0.6, 0.6]) GU.box(bench, 0.4, 0.42, 0.06, 0, 0, z, M('#333'), { solid: true });
  GU.plant(B, 21.4, -5.4, { s: 1.6, pot: '#1b998b' });
  GU.plant(B, 14.6, -5.4, { s: 1.2 });

  // elevator (out of order)
  const el = GU.group(B, 19.8, 0, -6 + T + 0.01);
  GU.box(el, 1.3, 2.3, 0.05, 0, 0, 0, GU.mat('#ffffff', GU.tex.metal('#b0b8bf')));
  GU.box(el, 0.01, 2.2, 0.06, 0, 0.05, 0, M('#333'));
  GU.box(el, 0.6, 0.3, 0.01, 0, 1.2, 0.035, GU.mat('#ffffff', GU.tex.label('#ffffff', '#d62828', 'BROKEN')), { unitUV: true });
  GU.box(el, 0.1, 0.16, 0.03, 0.8, 1.1, 0.02, M('#333'));
  GU.interactive(el, 'Call elevator', () => GU.say('The button lights up, then gives up. Taped sign: "OUT OF ORDER — use stairs".'));

  // ---- stairs up to the 2nd floor landing ----
  const steps = 16, rise = 3.0 / steps, x0 = 16, x1 = 20.5, run = (x1 - x0) / steps;
  const z1 = 4.1, z2 = 6 - T;
  const stepMat = GU.mat('#ffffff', GU.tex.wood('#a0522d'));
  const sideMat = GU.mat('#ffffff', GU.tex.paint('#f4f1e6'));
  for (let i = 0; i < steps; i++) {
    const top = (i + 1) * rise;
    GU.box(B, run, top, z2 - z1, x0 + run * (i + 0.5), 0, (z1 + z2) / 2, [sideMat, sideMat, stepMat, sideMat, sideMat, sideMat], { walk: true });
  }
  GU.box(B, 22 - T - x1, 0.1, z2 - 3.0, (x1 + 22 - T) / 2, 2.9, (3.0 + z2) / 2, [sideMat, sideMat, stepMat, sideMat, sideMat, sideMat], { walk: true });
  // railings (visual) + invisible blockers so you can't fall off
  const rail = M('#2b2b2b');
  for (let i = 0; i <= steps; i += 2) GU.box(B, 0.04, 0.9, 0.04, x0 + run * i, i * rise, z1, rail);
  const hand = GU.box(B, Math.hypot(x1 - x0, 3.0), 0.05, 0.06, (x0 + x1) / 2, 0.9 + 1.5 - 0.03, z1, M('#7a4b2a'));
  hand.rotation.z = Math.atan2(3.0, x1 - x0);
  GU.blocker(B, x1 - x0, 4.2, 0.06, (x0 + x1) / 2, 0, z1 - 0.03);
  for (let x = x1; x <= 22 - T; x += 0.3) GU.box(B, 0.03, 0.95, 0.03, x, 3.0, 3.0, rail);
  GU.box(B, 22 - T - x1, 0.05, 0.06, (x1 + 22 - T) / 2, 3.95, 3.0, M('#7a4b2a'));
  GU.box(B, 0.06, 0.05, z1 - 3.0, x1, 3.95, (3.0 + z1) / 2, M('#7a4b2a'));
  GU.blocker(B, 22 - T - x1, 1.2, 0.06, (x1 + 22 - T) / 2, 3.0, 3.0);
  GU.blocker(B, 0.06, 1.2, z1 - 3.0, x1, 3.0, (3.0 + z1) / 2);
  // 2nd floor door (locked for now — the next floor gets built later)
  const up = GU.group(B, 0, 3.0, 0);
  GU.door(up, 'z', 22 - T / 2, 4.0, 4.9, {
    swing: 1, hinge: 'a', label: '2nd floor door', color: '#1b998b',
    locked: 'Locked. A note on the door: "2nd floor coming soon!"', lockedPrompt: 'Open 2nd floor door',
  });
  GU.box(B, 0.03, 0.3, 0.5, 22 - T - 0.02, 5.25, 4.45, GU.mat('#ffffff', GU.tex.label('#1b998b', null, '2ND FL')), { unitUV: true });
  // storage under the landing
  const bikes = GU.group(B, 21.2, 0, 3.6);
  GU.torus(bikes, 0.32, 0.03, 0, 0.34, 0, M('#222'), { ry: Math.PI / 2 });
  GU.torus(bikes, 0.32, 0.03, 0, 0.34, 1.05, M('#222'), { ry: Math.PI / 2 });
  GU.box(bikes, 0.04, 0.04, 1.05, 0, 0.6, 0.52, M('#d62828'));
  GU.interactive(bikes, 'Look at bike', () => GU.say('A bike with a flat tire, locked to a pipe since forever.'));

  // ---- hallway decor in front of each door ----
  const mat = (x, z, text, c) => {
    GU.box(B, 0.8, 0.015, 0.5, x, 0.001, z, GU.mat('#ffffff', GU.tex.label(c, null, text, '#222')), { unitUV: true });
  };
  mat(-12.525, 1.15, 'WELCOME', '#c49a6c');
  mat(1.475, 1.15, 'NO', '#333333');
  mat(12.525, -1.15, 'HOME', '#a5d6a7');
  // stroller outside 101
  const st = GU.group(B, -11.2, 0, 1.15);
  GU.box(st, 0.5, 0.35, 0.7, 0, 0.35, 0, M('#3a86ff'));
  for (const sx of [-0.22, 0.22]) for (const sz of [-0.3, 0.3]) GU.torus(st, 0.1, 0.02, sx, 0.1, sz, M('#222'), { ry: Math.PI / 2 });
  GU.blocker(st, 0.5, 0.9, 0.7, 0, 0, 0).userData.noRay = true;
  GU.interactive(st, 'Look at stroller', () => GU.say('A stroller with a juice box in the cup holder. Lily\'s probably too big for it now.'));
  // shoe pile outside 104
  GU.scatter(B, [-2.6, -1.4, -1.2, -1.0], ['sneakers', 'boots', 'slippers', 'sneakers'], GU.makeRng(104));
  // umbrella stand outside 103
  const us = GU.group(B, 11.5, 0, -1.2);
  GU.cyl(us, 0.12, 0.12, 0.5, 0, 0, 0, M('#1b998b'));
  GU.cyl(us, 0.015, 0.015, 0.8, 0.03, 0.2, 0, M('#7b1fa2'));
  GU.interactive(us, 'Look at umbrella stand', () => GU.say('A purple umbrella and a cane with a tennis ball on the end.'));

  GU.zones.push({ box: new THREE.Box3(new THREE.Vector3(-14, -1, -1.5), new THREE.Vector3(14, 4, 1.5)), name: '1st Floor Hallway' });
  GU.zones.push({ box: new THREE.Box3(new THREE.Vector3(14, -1, -6), new THREE.Vector3(22, 7, 6)), name: 'Lobby' });
  GU.hallLights = lights;
};
