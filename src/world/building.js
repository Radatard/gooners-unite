// Contents of the shared spaces: corridor, stairwells, lobby, mail, elevator, maintenance,
// trash, electrical, laundry and bike rooms. (Their walls/floors/doors come from layout.js.)
GU.buildBuilding = function () {
  const B = GU.building;
  const M = (c) => GU.mat(c);
  const R = GU.roomById;

  // ---------------- corridor ----------------
  GU.rug(B, 0, 0, 48, 1.1, GU.tex.rug('#b8336a', '#f4d35e', '#2ec4b6'));
  const exitSign = (x, z, ry) => {
    const g = GU.group(B, x, 2.25, z, ry);
    GU.box(g, 0.36, 0.16, 0.05, 0, 0, 0, GU.glow('#ffffff', GU.tex.label('#d62828', null, 'EXIT', '#ffffff')), { unitUV: true });
  };
  exitSign(-23.55, 0.78, Math.PI);
  exitSign(23.05, 0.78, Math.PI);
  const extinguisher = (x, z, ry) => {
    const g = GU.group(B, x, 0.9, z, ry);
    GU.box(g, 0.32, 0.65, 0.06, 0, 0, 0, M('#c0392b'));
    GU.box(g, 0.24, 0.5, 0.01, 0, 0.08, 0.031, GU.mat('#cfefff', null, { transparent: true, opacity: 0.4 }));
    GU.cyl(g, 0.065, 0.065, 0.42, 0, 0.1, 0.0, M('#d62828'));
    GU.prop(g, { hp: 1, mat: 'glass', color: '#cfefff', name: 'extinguisher cabinet' });
    GU.interactive(g, 'Inspect fire extinguisher cabinet', () => GU.say('ABC dry chemical extinguisher. Last inspected: 2019.'));
  };
  extinguisher(-12, 0.77, Math.PI);
  extinguisher(9.5, -0.77, 0);
  const pull = (x, z, ry) => {
    const g = GU.group(B, x, 1.15, z, ry);
    GU.box(g, 0.13, 0.18, 0.05, 0, 0, 0, M('#d62828'));
    GU.box(g, 0.06, 0.03, 0.02, 0, 0.08, 0.03, M('#ffffff'));
    GU.interactive(g, 'Pull fire alarm', () => GU.say('You think better of it. There\'s a $500 fine for false alarms.'));
  };
  pull(-22.3, 0.77, Math.PI);
  pull(21.4, 0.77, Math.PI);
  // doormats + stuff outside doors
  const mat = (x, z, text, c) => GU.box(B, 0.8, 0.015, 0.45, x, 0.001, z, GU.mat('#ffffff', GU.tex.label(c, null, text, '#222')), { unitUV: true });
  const doorX = (u) => { const t = u.T.doors.find((d) => d.entry); const m = (t.a + t.b) / 2; return u.side === 'south' ? u.x0 + u.T.W - m : u.x0 + m; };
  for (const u of GU.units) {
    const z = u.side === 'south' ? -0.6 : 0.6;
    if (u.def.doormat) mat(doorX(u), z, u.def.doormat[0], u.def.doormat[1]);
    if (u.def.hallway) u.def.hallway(B, doorX(u), z);
  }

  // ---------------- stairwells (switchback: up 1.5 m to a mid landing, then back to the 2nd floor) ----------------
  const stairs = (x0) => {
    const stepMat = GU.mat('#ffffff', GU.tex.concrete());
    const nose = M('#f4d35e');
    const side = GU.mat('#ffffff', GU.tex.cmu('#d8d4c8'));
    const rail = M('#2b2b2b');
    const rise = 0.1875, run = 0.28;
    const W1 = [x0 + 0.1, x0 + 1.6], W2 = [x0 + 1.8, x0 + 3.4];
    for (let i = 0; i < 8; i++) {
      const top = (i + 1) * rise;
      GU.box(B, W1[1] - W1[0], top, run, (W1[0] + W1[1]) / 2, 0, 4.5 + run * (i + 0.5), [side, side, stepMat, side, side, side], { walk: true });
      GU.box(B, W1[1] - W1[0], 0.01, 0.04, (W1[0] + W1[1]) / 2, top, 4.5 + run * i + 0.02, nose);
      const top2 = 1.5 + (i + 1) * rise;
      GU.box(B, W2[1] - W2[0], top2, run, (W2[0] + W2[1]) / 2, 0, 6.74 - run * (i + 0.5), [side, side, stepMat, side, side, side], { walk: true });
      GU.box(B, W2[1] - W2[0], 0.01, 0.04, (W2[0] + W2[1]) / 2, top2, 6.74 - run * i - 0.02, nose);
    }
    GU.box(B, 3.3, 1.5, 4.06, x0 + 1.75, 0, 8.77, [side, side, stepMat, side, side, side], { walk: true });
    GU.box(B, W2[1] - W2[0], 0.2, 3.5, (W2[0] + W2[1]) / 2, 2.8, 2.75, [side, side, stepMat, side, side, side], { walk: true });
    // the stair well between the flights + landing edge: rails you can't fall past
    GU.blocker(B, 0.2, 4.2, 2.24, x0 + 1.7, 0, 5.62);
    GU.blocker(B, 0.2, 1.3, 3.5, x0 + 1.7, 2.8, 2.75);
    GU.box(B, 0.06, 0.05, 2.5, x0 + 1.7, 2.3, 5.62, M('#7a4b2a'), { rx: -Math.atan2(1.5, 2.24) });
    for (let z = 1.1; z < 4.5; z += 0.4) GU.box(B, 0.03, 1.0, 0.03, x0 + 1.7, 3.0, z, rail);
    GU.box(B, 0.06, 0.05, 3.5, x0 + 1.7, 4.0, 2.75, M('#7a4b2a'));
    for (let z = 4.6; z < 6.8; z += 0.4) GU.box(B, 0.03, 4.2, 0.03, x0 + 1.7, 0, z, rail);
    const sign = GU.group(B, x0 + 2.65, 4.5, 0.97);
    GU.box(sign, 0.5, 0.25, 0.02, 0, 0, 0, GU.mat('#ffffff', GU.tex.label('#1b998b', null, '2ND FL')), { unitUV: true });
    GU.box(B, 0.4, 0.25, 0.02, x0 + 1.75, 1.6, 0.97, GU.mat('#ffffff', GU.tex.label('#1b998b', null, '1ST FL')), { unitUV: true });
  };
  stairs(-25.25);
  stairs(21.75);

  // ---------------- lobby + mail ----------------
  // entrance doors (tempered security glass, locked)
  const ent = GU.group(B, 0, 0, -10.9);
  GU.plane(ent, 6, 4, 0, 1.6, -1.5, GU.glow('#ffffff', GU.tex.sky()));
  GU.box(ent, 6, 0.02, 1.5, 0, -0.02, -0.75, M('#9e9e9e'));
  for (const s of [-1, 1]) {
    const d = GU.group(ent, s * 0.5, 0, 0);
    GU.box(d, 0.98, 2.38, 0.04, 0, 0, 0, GU.mat('#bfe6ff', null, { transparent: true, opacity: 0.3 }), { solid: true });
    GU.box(d, 0.98, 0.08, 0.06, 0, 0, 0, M('#555'));
    GU.box(d, 0.98, 0.08, 0.06, 0, 2.3, 0, M('#555'));
    GU.box(d, 0.7, 0.04, 0.06, 0, 1.0, 0.04, GU.mat('#ffffff', GU.tex.metal('#c9ced4')));
    GU.prop(d, { tough: 'Tempered security glass in a steel frame. The hammer bounces right off.' });
    GU.interactive(d, 'Open front door', () => GU.say('Locked. Sign: "Building closed for renovations. Residents only."'));
  }
  GU.rug(B, 0, -9.9, 2.4, 1.4, GU.tex.rug('#1b998b', '#222222', '#f4d35e'));
  GU.rug(B, 0, -5.5, 3.6, 4.0, GU.tex.rug('#9b2226', '#e9d8a6', '#005f73'));
  const chandelier = GU.group(B, 0, 2.9, -5.5);
  GU.cyl(chandelier, 0.01, 0.01, 0.7, 0, 0, 0, M('#222'));
  GU.sphere(chandelier, 0.3, 0, 0, 0, GU.glow('#fff1c4'), { seg: 8, rings: 6 });
  const bench = GU.group(B, -2.6, 0, -6.0);
  GU.box(bench, 0.45, 0.06, 1.4, 0, 0.42, 0, GU.mat('#ffffff', GU.tex.wood('#8b5a2b')), { solid: true });
  for (const z of [-0.6, 0.6]) GU.box(bench, 0.4, 0.42, 0.06, 0, 0, z, M('#333'), { solid: true });
  GU.prop(bench, { move: 25, hp: 5, name: 'bench' });
  GU.plant(B, -2.6, -9.9, { s: 1.6, pot: '#1b998b' });
  GU.plant(B, 2.6, -9.9, { s: 1.6, pot: '#1b998b' });
  // directory
  const dir = GU.group(B, -3.25 + 0.15, 1.6, -3.0, Math.PI / 2);
  GU.box(dir, 0.9, 0.7, 0.03, 0, 0, 0, M('#1f1f1f'));
  for (let i = 0; i < 8; i++) GU.box(dir, 0.7, 0.04, 0.005, 0, 0.6 - i * 0.07, 0.016, M('#f4f1e6'));
  GU.interactive(dir, 'Read building directory', () => GU.say(GU.units.map((u) => u.number + ' ' + (u.def.surname || '')).join(' · '), 6));
  // notice board
  const nb = GU.group(B, -3.25 + 0.15, 1.5, -7.6, Math.PI / 2);
  GU.box(nb, 1.2, 0.8, 0.03, 0, 0, 0, GU.mat('#ffffff', GU.tex.carpet('#b5835a')));
  ['#fff59d', '#ffffff', '#ffcdd2', '#b3e5fc', '#c8e6c9'].forEach((c, i) => GU.box(nb, 0.22, 0.28, 0.005, -0.42 + i * 0.21, 0.25 + (i % 2) * 0.22, 0.02, M(c), { rz: (i - 2) * 0.05 }));
  const flyers = [
    'QUIET HOURS ARE 10PM-7AM. This means YOU, 108.',
    'FOUND: orange cat on the stairs. Belongs to 104. Her name is Biscuit.',
    'Whoever keeps taking my packages: I have cameras. — 102',
    'Reminder: do NOT nail anything into the corridor walls. They\'re fire-rated. — Management',
    'Bake sale Saturday! Proceeds go to Lily\'s school trip. — 101',
    'Free moving boxes! Knock on 105. Please. We have so many.',
    'Art show Friday at the community center — Sam, 106',
  ];
  let fi = 0;
  GU.interactive(nb, 'Read notice board', () => GU.say(flyers[fi++ % flyers.length], 5));
  // mailboxes in the alcove (wall-mounted, one per unit + spares)
  const mb = GU.group(B, 5.25 - 0.2, 0.9, -6.5, -Math.PI / 2);
  GU.box(mb, 2.0, 1.1, 0.3, 0, 0, 0, GU.mat('#ffffff', GU.tex.metal('#c9a227')));
  GU.units.forEach((u, i) => {
    const col = i % 4, row = Math.floor(i / 4);
    const door = GU.group(mb, -0.75 + col * 0.5, 0.6 - row * 0.5, 0.155);
    GU.box(door, 0.44, 0.44, 0.01, 0, 0, 0, GU.mat('#ffffff', GU.tex.label('#d9b44a', '#f4f1e6', u.number, '#333')), { unitUV: true });
    GU.interactive(door, 'Check mailbox ' + u.number, () => GU.say(u.def.mail || 'Junk mail and a pizza coupon.'));
  });
  const pk = GU.group(B, 4.4, 0, -9.8);
  GU.box(pk, 0.5, 0.35, 0.4, 0, 0, 0, GU.mat('#ffffff', GU.tex.label('#c49a6c', '#1d4ed8', '102')), { unitUV: true });
  GU.box(pk, 0.3, 0.2, 0.3, 0.05, 0.35, 0, GU.mat('#ffffff', GU.tex.label('#c49a6c', '#c62828', '108')), { unitUV: true });
  GU.prop(pk, { move: 8, hp: 2, mat: 'paper', color: '#c49a6c', name: 'packages' });
  GU.blocker(pk, 0.5, 0.55, 0.4, 0, 0, 0).userData.noRay = true;
  GU.interactive(pk, 'Read package labels', () => GU.say('"PROTEIN WHEY 10LB" for 102. A box of energy drinks for 108.'));
  // elevator doors (out of order)
  const el = GU.group(B, 3.25, 0, -2.1, -Math.PI / 2);
  for (const s of [-1, 1]) GU.box(el, 0.5, 2.1, 0.05, s * 0.25, 0, 0, GU.mat('#ffffff', GU.tex.metal('#b0b8bf')), { solid: true });
  GU.box(el, 0.6, 0.3, 0.01, 0, 1.2, -0.03, GU.mat('#ffffff', GU.tex.label('#ffffff', '#d62828', 'BROKEN')), { unitUV: true });
  GU.box(el, 0.1, 0.16, 0.03, 0.7, 1.1, -0.02, M('#333'));
  GU.prop(el, { tough: 'Stainless steel elevator doors. They don\'t even dent.' });
  GU.interactive(el, 'Call elevator', () => GU.say('The button lights up, then gives up. Taped sign: "OUT OF ORDER — use stairs".'));

  // ---------------- maintenance room ----------------
  const mx = -25.25, mzA = -10.9;
  const bench2 = GU.table(B, mx + 0.5, -6.0, Math.PI / 2, { w: 2.4, d: 0.7, h: 0.9, mat: GU.mat('#ffffff', GU.tex.lumber('#b8925a')), top: ['claw_hammer', 'screwdriver', 'drill', 'tape_measure', 'utility_knife', 'stud_finder', 'wire_nuts', 'duct_tape_pro'], gap: 0.05 });
  bench2.userData.movable.name = 'workbench';
  const peg = GU.group(B, mx + 0.13, 1.5, -6.0, Math.PI / 2);
  GU.box(peg, 2.2, 0.9, 0.02, 0, 0, 0, GU.mat('#ffffff', GU.tex.osb()));
  for (let i = 0; i < 5; i++) GU.box(peg, 0.04, 0.25, 0.03, -0.8 + i * 0.4, 0.3, 0.03, M(['#c62828', '#1d4ed8', '#ffd60a', '#222', '#9ea7ad'][i]));
  GU.wallShelf(B, mx + 0.13, 1.7, -3.0, Math.PI / 2, 1.2, ['paint_can', 'paint_can', 'spackle', 'light_bulbs']);
  GU.wallShelf(B, mx + 0.13, 1.2, -3.0, Math.PI / 2, 1.2, ['romex', 'bleach', 'all_purpose', 'trash_bags']);
  // water heater for the building
  const wh = GU.group(B, mx + 2.9, 0, -10.2);
  GU.cyl(wh, 0.35, 0.35, 1.6, 0, 0, 0, GU.mat('#ffffff', GU.tex.metal('#e0e0d8')), { seg: 14 });
  GU.cyl(wh, 0.03, 0.03, 1.2, -0.15, 1.6, 0, M('#b87333'));
  GU.cyl(wh, 0.03, 0.03, 1.2, 0.15, 1.6, 0, M('#b87333'));
  GU.prop(wh, { tough: 'An 80-gallon commercial water heater. Smashing it would be a terrible idea.' });
  GU.blocker(wh, 0.7, 1.6, 0.7, 0, 0, 0).userData.noRay = true;
  GU.interactive(wh, 'Check water heater', () => GU.say('80 gallon gas water heater. Set to 120°F. Feeds every unit.'));
  // spare drywall + lumber
  const dw = GU.group(B, mx + 3.25, 0, -6.5, -Math.PI / 2);
  for (let i = 0; i < 3; i++) GU.box(dw, 2.4, 1.2, 0.0127, 0, 0.05, i * 0.015, GU.mat('#ffffff', GU.tex.gypsum()), { rx: -0.08 });
  GU.prop(dw, { hp: 1, mat: 'paper', color: '#ece9e0', name: 'drywall sheets' });
  const lum = GU.group(B, mx + 2.6, 0, -2.2);
  for (let i = 0; i < 6; i++) GU.box(lum, 0.038, 0.089, 2.4, (i % 3) * 0.1, Math.floor(i / 3) * 0.09, 0, GU.mat('#ffffff', GU.tex.lumber('#dcbf8a')));
  GU.prop(lum, { move: 20, hp: 3, color: '#dcbf8a', name: '2x4 lumber' });
  const sink = GU.group(B, mx + 2.9, 0, -8.6);
  GU.box(sink, 0.6, 0.6, 0.6, 0, 0, 0, M('#e8e8e2'), { solid: true });
  GU.box(sink, 0.5, 0.02, 0.5, 0, 0.45, 0, M('#bfc8cc'));
  GU.prop(sink, { hp: 3, mat: 'porcelain', color: '#e8e8e2', name: 'mop sink', leak: true });
  GU.placeItems(B, mx + 2.3, 0, -8.6, 0.4, 0.5, ['mop']);
  GU.placeItems(B, mx + 2.0, 0, -9.8, 0.6, 0.6, ['bleach', 'ammonia']);

  // ---------------- trash room ----------------
  const cart = (x, z, color, label) => {
    const g = GU.group(B, x, 0, z);
    GU.box(g, 0.8, 1.0, 0.7, 0, 0.1, 0, M(color));
    GU.box(g, 0.82, 0.04, 0.72, 0, 1.1, 0, M('#222'));
    for (const sx of [-0.3, 0.3]) for (const sz of [-0.25, 0.25]) GU.cyl(g, 0.05, 0.05, 0.04, sx, 0.05, sz, M('#111'), { rx: Math.PI / 2 }).position.set(sx, 0.05, sz);
    GU.prop(g, { move: 40, name: label, tough: 'Heavy-duty plastic cart. It just bounces.' });
    GU.interactive(g, 'Look in ' + label, () => GU.say(label === 'recycling' ? 'Mostly Amazon boxes and energy drink cans.' : 'It reeks. Bags from every floor.'));
  };
  cart(6.25, -4.0, '#2e7d32', 'trash cart');
  cart(6.25, -6.0, '#1d4ed8', 'recycling');
  GU.box(B, 0.6, 0.6, 0.6, 6.25, 2.1, -9.6, GU.mat('#ffffff', GU.tex.metal('#9ea7ad')));
  const chute = GU.group(B, 6.25, 1.8, -9.3);
  GU.box(chute, 0.5, 0.3, 0.05, 0, 0, 0, GU.mat('#ffffff', GU.tex.metal('#9ea7ad')));
  GU.interactive(chute, 'Look up the trash chute', () => GU.say('The chute from the upper floors. Something drips.'));

  // ---------------- electrical room ----------------
  const ex = 7.25;
  // the sledgehammer lives here, on the floor against the east wall
  const sledge = GU.item('sledgehammer');
  sledge.position.set(ex + 1.6, 0, -4.0);
  sledge.rotation.y = Math.PI / 2;
  B.add(sledge);
  const gear = GU.group(B, ex + 1.0, 0, -10.45);
  GU.box(gear, 1.6, 2.0, 0.6, 0, 0, 0, GU.mat('#ffffff', GU.tex.metal('#8a9399')), { solid: true });
  GU.box(gear, 0.25, 0.4, 0.05, 0.5, 1.1, 0.32, M('#d62828'));
  GU.box(gear, 1.2, 0.08, 0.02, 0, 1.8, 0.31, GU.mat('#ffffff', GU.tex.label('#ffd60a', null, 'DANGER', '#111')), { unitUV: true });
  GU.prop(gear, { tough: 'Main switchgear: 400A, 120/208V 3-phase. You do NOT want to hit this.' });
  GU.interactive(gear, () => (GU.mainOff ? 'Turn building main disconnect ON' : 'Pull building main disconnect'), () => {
    GU.mainOff = !GU.mainOff;
    GU.sfx('clank');
    GU.say(GU.mainOff ? 'KA-CHUNK. The whole building goes dark. Emergency lights and exit signs stay on.' : 'KA-CHUNK. Power is back on.', 4);
  }, 'Utility power comes in here and feeds a meter + 100A panel in each apartment.');
  const meters = GU.group(B, ex + 0.13, 1.2, -5.5, Math.PI / 2);
  GU.box(meters, 2.4, 1.0, 0.15, 0, 0, 0, GU.mat('#ffffff', GU.tex.metal('#9ea7ad')));
  GU.units.forEach((u, i) => {
    const m = GU.group(meters, -1.05 + (i % 4) * 0.7, 0.55 - Math.floor(i / 4) * 0.45, 0.09);
    GU.cyl(m, 0.1, 0.1, 0.08, 0, -0.1, 0, GU.mat('#cfefff', null, { transparent: true, opacity: 0.7 }), { rx: Math.PI / 2 }).position.set(0, 0, 0.02);
    GU.box(m, 0.08, 0.03, 0.01, 0, 0.02, 0.06, GU.glow('#7cff3a'));
    GU.interactive(m, 'Read meter ' + u.number, () => GU.say('Apt ' + u.number + ': ' + (3000 + Math.floor(GU.hash(u.number) % 9000)) + ' kWh. ' + (u.mainOff ? 'Main breaker is OFF.' : 'Spinning.')));
  });
  for (let i = 0; i < 4; i++) GU.cyl(B, 0.03, 0.03, 2.7, ex + 0.5 + i * 0.25, 0, -10.75, M('#9ea7ad'));

  // ---------------- laundry room ----------------
  const lx = 9.25;
  for (let i = 0; i < 3; i++) {
    GU.washerDryer(B, lx + 0.45, -2.2 - i * 0.8, Math.PI / 2, { washer: i === 1 ? ['laundry_pile2'] : [], dryer: i === 0 ? ['towel', 'socks'] : [] });
    const coin = GU.group(B, lx + 0.85, 1.9, -2.2 - i * 0.8, Math.PI / 2);
    GU.box(coin, 0.15, 0.1, 0.05, 0, 0, 0, M('#555'));
    GU.interactive(coin, 'Insert quarters', () => GU.say('$2.25 per load. You have no quarters.'));
  }
  GU.table(B, lx + 2.6, -5.5, Math.PI / 2, { w: 2.0, d: 0.8, h: 0.9, mat: GU.mat('#ffffff', GU.tex.paint('#f4f4f4')), top: ['laundry_detergent', 'fabric_softener', 'socks', 'shirt'], gap: 0.1 });
  GU.chair(B, lx + 2.4, -8.6, 0, { color: '#2e86ab' });
  GU.laundryBasket(B, lx + 1.8, -9.8, '#2e86ab');

  // ---------------- bike + storage room ----------------
  const bx = 20.75;
  for (let i = 0; i < 3; i++) {
    const bike = GU.group(B, bx + 0.8, 0, -2.5 - i * 0.9, Math.PI / 2);
    const c = ['#d62828', '#1d4ed8', '#2e7d32'][i];
    GU.torus(bike, 0.32, 0.03, -0.5, 0.34, 0, M('#222'));
    GU.torus(bike, 0.32, 0.03, 0.5, 0.34, 0, M('#222'));
    GU.box(bike, 1.0, 0.05, 0.04, 0, 0.6, 0, M(c), { rz: 0.15 });
    GU.box(bike, 0.04, 0.4, 0.04, -0.2, 0.55, 0, M(c));
    GU.prop(bike, { move: 12, hp: 3, mat: 'metal', color: c, name: 'bike' });
    GU.blocker(bike, 1.6, 0.9, 0.3, 0, 0, 0).userData.noRay = true;
  }
  for (let i = 0; i < 4; i++) {
    const cage = GU.group(B, bx + 3.6, 0, -2.5 - i * 2.0);
    GU.box(cage, 1.4, 2.0, 1.6, 0, 0, 0, GU.mat('#9ea7ad', null, { transparent: true, opacity: 0.35 }), { solid: true });
    GU.box(cage, 0.5, 0.4, 0.5, -0.2, 0, 0.2, M('#c49a6c'));
    GU.box(cage, 0.4, 0.3, 0.4, 0.2, 0.4, -0.2, M('#c49a6c'));
    GU.prop(cage, { tough: 'Welded wire storage cage. Locked with a padlock.' });
    GU.interactive(cage, 'Look in storage cage', () => GU.say(['Christmas decorations.', 'A kayak and some moving boxes.', 'Tax records from 1998.', 'A treadmill used as a clothes rack.'][i]));
  }
};
