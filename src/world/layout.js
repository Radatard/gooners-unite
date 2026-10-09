// The first-floor plan. A typical double-loaded corridor mid-rise:
//   - 6 ft (1.8 m) corridor down the middle, units on both sides, 10 m deep to the exterior wall
//   - two enclosed exit stairs, one at each end of the corridor (two means of egress)
//   - lobby with mail alcove and elevator on the street side, plus trash, electrical,
//     laundry, maintenance and bike rooms
//   - 8 apartments: 2 two-bedrooms, 4 one-bedrooms... see PLAN below
// Walls are NOT listed by hand: they're generated from the room rectangles. Where two rooms touch,
// the wall type follows from who's on each side (same unit = partition, unit/corridor = rated
// corridor wall, unit/unit = double-stud demising wall, nothing = exterior wall, stairs = concrete block).
//
//  z=10.9  +------+----------+----------+------+--------+--------+------+
//  NORTH   |StairA|   101    |   102    | 103  |  104   |  105   |StairB|
//          |      |  2 bed   |  2 bed   |studio| 1 bed  | 1 bed  |      |
//  z=0.9   +--D---+----D-----+----D-----+--D---+---D----+---D----+--D---+
//          |                    C O R R I D O R                         |
//  z=-0.9  +--D---+----D-----+---D----+     LOBBY  +-+-+-+---D----+--D--+
//  SOUTH   |Maint.|   108    |  107   |            |E|T|E|Lndry| 106 |Bike |
//          |      |  2 bed   | 1 bed  |  entrance  | | | |     |1 bed|     |
//  z=-10.9 +------+----------+--------+-----DD-----+-+-+-+-----+-----+-----+
//        x=-25.25                                                        25.25
(function () {
  // Half wall thicknesses, used to keep furniture off the walls.
  // Template coordinates: x across the unit (0..W), z from the corridor wall (0) to the exterior wall (10).
  const TEMPLATES = (GU.TEMPLATES = {
    studio: {
      W: 6.5,
      rooms: [
        { id: 'main', kind: 'living', name: 'Main Room', rect: [0, 4.5, 6.5, 10] },
        { id: 'kitchen', kind: 'kitchen', name: 'Kitchenette', rect: [0, 0, 4.3, 4.5] },
        { id: 'bath', kind: 'bath', name: 'Bathroom', rect: [4.3, 0, 6.5, 3.0] },
        { id: 'closet', kind: 'closet', name: 'Walk-in Closet', rect: [4.3, 3.0, 6.5, 4.5] },
      ],
      open: [['kitchen', 'main']],
      doors: [
        { axis: 'x', at: 0, a: 3.2, b: 4.1, into: 'kitchen', hinge: 'b', entry: true },
        { axis: 'z', at: 4.3, a: 1.0, b: 1.85, into: 'bath', hinge: 'a' },
        { axis: 'z', at: 4.3, a: 3.3, b: 4.15, into: 'closet', hinge: 'b' },
      ],
      windows: [{ room: 'main', a: 0.9, b: 2.5 }, { room: 'main', a: 3.9, b: 5.5 }],
      kitchen: [{ axis: 'z', at: 0.15, from: 0.2, mods: ['fridge', 'sink', 'drawers', 'stove', 'cab'] }],
      baths: { bath: { tub: [5.61, 2.53, Math.PI], toilet: [6.03, 1.35, -Math.PI / 2], vanity: [5.3, 0.37, 0, 0.7], mat: [5.3, 1.5, 0] } },
      closets: [[5.45, 4.1, Math.PI, 1.9]],
      panel: [2.3, 1.55, 0.11, 0],
      trash: [3.8, 2.2],
    },
    '1br': {
      W: 8,
      rooms: [
        { id: 'kitchen', kind: 'kitchen', name: 'Kitchen', rect: [0, 0, 3.2, 4.5] },
        { id: 'hall', kind: 'hall', name: 'Entry Hall', rect: [3.2, 0, 4.8, 4.5] },
        { id: 'bath', kind: 'bath', name: 'Bathroom', rect: [4.8, 0, 8, 2.7] },
        { id: 'laundry', kind: 'laundry', name: 'Laundry Closet', rect: [4.8, 2.7, 8, 4.5] },
        { id: 'living', kind: 'living', name: 'Living Room', rect: [0, 4.5, 4.4, 10] },
        { id: 'bedroom', kind: 'bedroom', name: 'Bedroom', rect: [4.4, 4.5, 8, 10] },
      ],
      open: [['kitchen', 'hall'], ['kitchen', 'living'], ['hall', 'living']],
      doors: [
        { axis: 'x', at: 0, a: 3.55, b: 4.45, into: 'hall', hinge: 'a', entry: true },
        { axis: 'z', at: 4.8, a: 0.9, b: 1.75, into: 'bath', hinge: 'a' },
        { axis: 'z', at: 4.8, a: 3.0, b: 3.85, into: 'laundry', hinge: 'b' },
        { axis: 'z', at: 4.4, a: 5.0, b: 5.85, into: 'bedroom', hinge: 'a' },
      ],
      windows: [{ room: 'living', a: 1.0, b: 3.2 }, { room: 'bedroom', a: 5.3, b: 7.3 }],
      kitchen: [
        { axis: 'z', at: 0.15, from: 0.2, mods: ['fridge', 'drawers', 'sink', 'cab', 'stove', 'drawers'] },
        { axis: 'x', at: 0.11, from: 0.92, mods: ['pantry', 'cab', 'drawers'] },
      ],
      baths: { bath: { tub: [7.48, 0.87, -Math.PI / 2], toilet: [6.4, 2.28, Math.PI], vanity: [5.75, 0.37, 0, 0.8], mat: [6.0, 1.4, 0] } },
      laundry: [7.5, 3.6, -Math.PI / 2],
      closets: [[6.9, 4.87, 0, 1.8]],
      panel: [4.71, 1.55, 2.35, -Math.PI / 2],
      trash: [2.9, 2.8],
    },
    '2br': {
      W: 10.5,
      rooms: [
        { id: 'kitchen', kind: 'kitchen', name: 'Kitchen', rect: [0, 0, 3.4, 5] },
        { id: 'hall', kind: 'hall', name: 'Entry Hall', rect: [3.4, 0, 5, 5] },
        { id: 'bath', kind: 'bath', name: 'Hall Bathroom', rect: [5, 0, 7.3, 2.6] },
        { id: 'laundry', kind: 'laundry', name: 'Laundry Closet', rect: [5, 2.6, 7.3, 5] },
        { id: 'ensuite', kind: 'bath', name: 'Master Bath', rect: [7.3, 0, 10.5, 2.6] },
        { id: 'bed1', kind: 'bedroom', name: 'Master Bedroom', rect: [7.3, 2.6, 10.5, 10] },
        { id: 'bed2', kind: 'bedroom', name: 'Second Bedroom', rect: [0, 5, 3.4, 10] },
        { id: 'living', kind: 'living', name: 'Living Room', rect: [3.4, 5, 7.3, 10] },
      ],
      open: [['kitchen', 'hall'], ['hall', 'living']],
      doors: [
        { axis: 'x', at: 0, a: 3.75, b: 4.65, into: 'hall', hinge: 'a', entry: true },
        { axis: 'z', at: 5, a: 0.9, b: 1.75, into: 'bath', hinge: 'a' },
        { axis: 'z', at: 5, a: 3.2, b: 4.05, into: 'laundry', hinge: 'b' },
        { axis: 'x', at: 2.6, a: 8.0, b: 8.85, into: 'ensuite', hinge: 'a' },
        { axis: 'z', at: 7.3, a: 5.4, b: 6.25, into: 'bed1', hinge: 'a' },
        { axis: 'z', at: 3.4, a: 5.4, b: 6.25, into: 'bed2', hinge: 'b' },
      ],
      windows: [{ room: 'bed2', a: 0.8, b: 2.6 }, { room: 'living', a: 4.2, b: 6.5 }, { room: 'bed1', a: 8.1, b: 9.9 }],
      kitchen: [
        { axis: 'z', at: 0.15, from: 0.2, mods: ['fridge', 'drawers', 'sink', 'cab', 'stove', 'drawers'] },
        { axis: 'x', at: 0.11, from: 0.92, mods: ['pantry', 'cab', 'drawers'] },
      ],
      baths: {
        bath: { tub: [6.46, 2.13, Math.PI], toilet: [6.9, 0.44, 0], vanity: [5.85, 0.37, 0, 0.7], mat: [6.2, 1.3, 0] },
        ensuite: { tub: [9.99, 0.87, -Math.PI / 2], toilet: [8.65, 0.44, 0], vanity: [7.63, 1.6, Math.PI / 2, 0.8], mat: [8.7, 1.5, 0] },
      },
      laundry: [6.86, 3.8, -Math.PI / 2],
      closets: [[9.67, 2.99, 0, 1.3], [1.0, 5.37, 0, 1.6]],
      panel: [4.91, 1.55, 2.4, -Math.PI / 2],
      trash: [3.1, 3.1],
    },
  });

  // Where each apartment sits. x0 = west edge in world meters.
  const PLAN = (GU.PLAN = [
    { number: '101', template: '2br', side: 'north', x0: -21.75 },
    { number: '102', template: '2br', side: 'north', x0: -11.25 },
    { number: '103', template: 'studio', side: 'north', x0: -0.75 },
    { number: '104', template: '1br', side: 'north', x0: 5.75 },
    { number: '105', template: '1br', side: 'north', x0: 13.75 },
    { number: '106', template: '1br', side: 'south', x0: 12.75 },
    { number: '107', template: '1br', side: 'south', x0: -11.25 },
    { number: '108', template: '2br', side: 'south', x0: -21.75 },
  ]);

  // Shared spaces (world rects [x1, z1, x2, z2]).
  const COMMON = [
    { id: 'corridor', kind: 'corridor', name: 'Corridor', rect: [-25.25, -0.9, 25.25, 0.9], h: 2.7 },
    { id: 'stairA', kind: 'stair', name: 'West Stairwell', rect: [-25.25, 0.9, -21.75, 10.9], h: 6 },
    { id: 'stairB', kind: 'stair', name: 'East Stairwell', rect: [21.75, 0.9, 25.25, 10.9], h: 6 },
    { id: 'maint', kind: 'maint', name: 'Maintenance Room', rect: [-25.25, -10.9, -21.75, -0.9], h: 2.7 },
    { id: 'lobby', kind: 'lobby', name: 'Lobby', rect: [-3.25, -10.9, 3.25, -0.9], h: 3.6 },
    { id: 'elevator', kind: 'elevator', name: 'Elevator', rect: [3.25, -3.4, 5.25, -0.9], h: 6 },
    { id: 'mail', kind: 'mail', name: 'Mail Alcove', rect: [3.25, -10.9, 5.25, -3.4], h: 3.6 },
    { id: 'trash', kind: 'trash', name: 'Trash Room', rect: [5.25, -10.9, 7.25, -0.9], h: 2.7 },
    { id: 'elec', kind: 'electrical', name: 'Electrical Room', rect: [7.25, -10.9, 9.25, -0.9], h: 2.7 },
    { id: 'laundry', kind: 'laundry_room', name: 'Laundry Room', rect: [9.25, -10.9, 12.75, -0.9], h: 2.7 },
    { id: 'bike', kind: 'storage', name: 'Bike & Storage Room', rect: [20.75, -10.9, 25.25, -0.9], h: 2.7 },
  ];
  const COMMON_OPEN = [['corridor', 'lobby'], ['lobby', 'mail']];
  const COMMON_DOORS = [
    { axis: 'x', fixed: 0.9, a: -24.0, b: -23.1, into: 'stairA', hinge: 'a', color: '#c0392b', label: 'stairwell door' },
    { axis: 'x', fixed: 0.9, a: 22.6, b: 23.5, into: 'stairB', hinge: 'b', color: '#c0392b', label: 'stairwell door' },
    { axis: 'x', fixed: -0.9, a: -24.0, b: -23.1, into: 'maint', hinge: 'a', color: '#7f8c8d', label: 'maintenance door' },
    { axis: 'x', fixed: -0.9, a: 5.75, b: 6.65, into: 'trash', hinge: 'a', color: '#7f8c8d', label: 'trash room door' },
    { axis: 'x', fixed: -0.9, a: 7.75, b: 8.65, into: 'elec', hinge: 'a', color: '#7f8c8d', label: 'electrical room door' },
    { axis: 'x', fixed: -0.9, a: 10.1, b: 11.0, into: 'laundry', hinge: 'a', color: '#2e86ab', label: 'laundry room door' },
    { axis: 'x', fixed: -0.9, a: 22.0, b: 22.9, into: 'bike', hinge: 'a', color: '#7f8c8d', label: 'storage room door' },
    { axis: 'z', fixed: 3.25, a: -2.6, b: -1.6, into: 'elevator', hinge: 'a', noSlab: true, label: 'elevator' },
    { axis: 'x', fixed: -10.9, a: -1.0, b: 1.0, top: 2.4, noSlab: true, label: 'entrance' },
  ];
  const COMMON_WINDOWS = [
    { axis: 'z', fixed: -25.25, a: -0.6, b: 0.6, room: 'corridor', view: 'The alley. A dumpster and a raccoon who looks busy.' },
    { axis: 'z', fixed: 25.25, a: -0.6, b: 0.6, room: 'corridor', view: 'The parking lot. Someone is parked across two spaces.' },
    { axis: 'x', fixed: -10.9, a: -2.9, b: -1.6, room: 'lobby', bottom: 0.5 },
    { axis: 'x', fixed: -10.9, a: 1.6, b: 2.9, room: 'lobby', bottom: 0.5 },
    { axis: 'x', fixed: -10.9, a: 10.3, b: 11.7, room: 'laundry' },
    { axis: 'z', fixed: -25.25, a: 5.0, b: 6.2, room: 'stairA' },
    { axis: 'z', fixed: 25.25, a: 5.0, b: 6.2, room: 'stairB' },
  ];

  const DEFAULT_FINISH = {
    corridor: () => ({ wall: GU.mat('#ffffff', GU.tex.stripes('#2ec4b6', '#e8f7f2')), floor: GU.mat('#ffffff', GU.tex.carpet('#7a2048')) }),
    stair: () => ({ wall: GU.mat('#ffffff', GU.tex.cmu('#e8e4d8')), floor: GU.mat('#ffffff', GU.tex.concrete()) }),
    elevator: () => ({ wall: GU.mat('#ffffff', GU.tex.metal('#b0b8bf')), floor: GU.mat('#ffffff', GU.tex.concrete()) }),
    lobby: () => ({ wall: GU.mat('#ffffff', GU.tex.paint('#ffcf70')), floor: GU.mat('#ffffff', GU.tex.checker('#f4f1e6', '#1b998b', 0.5)) }),
    mail: () => ({ wall: GU.mat('#ffffff', GU.tex.paint('#ffcf70')), floor: GU.mat('#ffffff', GU.tex.checker('#f4f1e6', '#1b998b', 0.5)) }),
    maint: () => ({ wall: GU.mat('#ffffff', GU.tex.paint('#b8c4c8', 0.4)), floor: GU.mat('#ffffff', GU.tex.concrete(0.4)) }),
    trash: () => ({ wall: GU.mat('#ffffff', GU.tex.paint('#a3b18a', 0.7)), floor: GU.mat('#ffffff', GU.tex.concrete(0.8)) }),
    electrical: () => ({ wall: GU.mat('#ffffff', GU.tex.paint('#d9d9d9', 0.2)), floor: GU.mat('#ffffff', GU.tex.concrete(0.2)) }),
    laundry_room: () => ({ wall: GU.mat('#ffffff', GU.tex.paint('#bde0fe')), floor: GU.mat('#ffffff', GU.tex.tile('#ffffff', '#9fb8c8', 0.4, 0.2)) }),
    storage: () => ({ wall: GU.mat('#ffffff', GU.tex.paint('#c9c9c0', 0.4)), floor: GU.mat('#ffffff', GU.tex.concrete(0.3)) }),
    living: () => ({ wall: GU.mat('#ffffff', GU.tex.paint('#efe7d8')), floor: GU.mat('#ffffff', GU.tex.wood('#b5835a')) }),
    hall: () => ({ wall: GU.mat('#ffffff', GU.tex.paint('#efe7d8')), floor: GU.mat('#ffffff', GU.tex.wood('#b5835a')) }),
    kitchen: () => ({ wall: GU.mat('#ffffff', GU.tex.paint('#f4ecd0')), floor: GU.mat('#ffffff', GU.tex.tile('#e8e2d0', '#a09a8a', 0.4)) }),
    bedroom: () => ({ wall: GU.mat('#ffffff', GU.tex.paint('#dfe7ef')), floor: GU.mat('#ffffff', GU.tex.carpet('#c8b8a0')) }),
    bath: () => ({ wall: GU.mat('#ffffff', GU.tex.tile('#f2f2f2', '#c0c0c0', 0.2)), floor: GU.mat('#ffffff', GU.tex.tile('#dfe8f0', '#ffffff', 0.25)) }),
    laundry: () => ({ wall: GU.mat('#ffffff', GU.tex.paint('#efe7d8')), floor: GU.mat('#ffffff', GU.tex.tile('#e8e2d0', '#a09a8a', 0.4)) }),
    closet: () => ({ wall: GU.mat('#ffffff', GU.tex.paint('#efe7d8')), floor: GU.mat('#ffffff', GU.tex.carpet('#c8b8a0')) }),
  };
  const WET = new Set(['bath', 'kitchen', 'laundry']);
  const CIRCUIT = { kitchen: 20, bath: 20, laundry: 30, living: 15, bedroom: 15, hall: 15, closet: 15 };

  function wallType(n, p) {
    if (!n || !p) return 'exterior';
    const shaft = (r) => r.kind === 'stair' || r.kind === 'elevator';
    if (shaft(n) || shaft(p)) return 'cmu';
    if (n.unit && n.unit === p.unit) return WET.has(n.kind) || WET.has(p.kind) ? 'wet' : 'partition';
    if (n.kind === 'corridor' || p.kind === 'corridor') return 'corridor';
    if (!n.unit && !p.unit) return 'partition';
    return 'demising';
  }

  const k3 = (v) => Math.round(v * 1000);

  GU.buildLayout = function () {
    const rooms = [];
    const byId = {};
    const openPairs = new Set();
    const addOpen = (a, b) => { openPairs.add(a + '|' + b); openPairs.add(b + '|' + a); };

    // ---- units ----
    GU.units = [];
    for (const p of PLAN) {
      const def = GU.unitDefs[p.number];
      if (!def) { console.warn('[Layout] no definition for apt', p.number); continue; }
      const T = TEMPLATES[p.template];
      const unit = new GU.Unit({ number: p.number, title: def.title, T, side: p.side, x0: p.x0, dirt: def.dirt || 0, theme: def.theme || {}, def });
      unit.panelObj = unit;
      GU.units.push(unit);
      for (const r of T.rooms) {
        const fin = Object.assign(DEFAULT_FINISH[r.kind](), (def.theme && def.theme[r.id]) || {});
        if (unit.dirt > 0.3 && !(def.theme && def.theme[r.id] && def.theme[r.id].wall)) fin.wall = GU.mat('#ffffff', GU.tex.paint('#e8e0c8', unit.dirt));
        const room = {
          id: p.number + ':' + r.id, local: r, kind: r.kind, name: r.name, unit, rect: unit.worldRect(r.rect), h: 2.7,
          finish: fin, noOutlets: r.kind === 'closet',
        };
        room.circuit = new GU.Circuit(r.name, CIRCUIT[r.kind] || 15, unit);
        unit.circuits.push(room.circuit);
        unit.rooms[r.id] = room;
        rooms.push(room); byId[room.id] = room;
      }
      for (const [a, b] of T.open) addOpen(p.number + ':' + a, p.number + ':' + b);
    }
    // ---- shared spaces ----
    const house = { mainOff: false };
    for (const c of COMMON) {
      const room = Object.assign({}, c, { finish: DEFAULT_FINISH[c.kind](), unit: null, noOutlets: c.kind === 'stair' || c.kind === 'elevator' });
      room.circuit = new GU.Circuit(c.name, 20, house);
      rooms.push(room); byId[c.id] = room;
    }
    for (const [a, b] of COMMON_OPEN) addOpen(a, b);
    GU.rooms = rooms; GU.roomById = byId;

    // ---- walls from room edges ----
    const lines = new Map(); // axis:fixed -> [{a, b, room, side}]
    const addEdge = (axis, fixed, a, b, room, side) => {
      const key = axis + ':' + k3(fixed);
      if (!lines.has(key)) lines.set(key, { axis, fixed, edges: [] });
      lines.get(key).edges.push({ a, b, room, side });
    };
    for (const r of rooms) {
      const [x1, z1, x2, z2] = r.rect;
      addEdge('x', z1, x1, x2, r, 1);
      addEdge('x', z2, x1, x2, r, -1);
      addEdge('z', x1, z1, z2, r, 1);
      addEdge('z', x2, z1, z2, r, -1);
    }
    for (const line of lines.values()) {
      const pts = new Set();
      for (const e of line.edges) { pts.add(k3(e.a)); pts.add(k3(e.b)); }
      const ps = [...pts].sort((p, q) => p - q).map((v) => v / 1000);
      let run = null;
      const flush = () => {
        if (!run) return;
        const h = Math.max(run.neg ? run.neg.h : 0, run.pos ? run.pos.h : 0);
        const mid = (run.a + run.b) / 2;
        const sameUnit = run.neg && run.pos && run.neg.unit && run.neg.unit === run.pos.unit;
        new GU.Wall({
          axis: line.axis, fixed: line.fixed, a: run.a, b: run.b, h, type: wallType(run.neg, run.pos),
          neg: run.neg, pos: run.pos, chunk: sameUnit ? 'u' + run.neg.unit.number : 'b' + Math.floor(mid / 12) + line.axis,
        });
        run = null;
      };
      for (let i = 0; i < ps.length - 1; i++) {
        const a = ps[i], b = ps[i + 1], m = (a + b) / 2;
        let neg = null, pos = null;
        for (const e of line.edges) if (m > e.a && m < e.b) { if (e.side > 0) pos = e.room; else neg = e.room; }
        const open = neg && pos && openPairs.has(neg.id + '|' + pos.id);
        if ((!neg && !pos) || (open && neg.h === pos.h)) { flush(); continue; }
        if (open) {
          // open to a taller room: just a bulkhead above the opening, from the lower ceiling up
          flush();
          const wall = new GU.Wall({ axis: line.axis, fixed: line.fixed, a, b, h: Math.max(neg.h, pos.h), type: 'partition', neg, pos, chunk: 'b' + Math.floor(m / 12) + line.axis });
          wall.openings.push({ a: 0, b: b - a, bottom: 0, top: Math.min(neg.h, pos.h) });
          continue;
        }
        if (run && run.neg === neg && run.pos === pos && Math.abs(run.b - a) < 0.001) run.b = b;
        else { flush(); run = { a, b, neg, pos }; }
      }
      flush();
    }

    // ---- openings ----
    const findWall = (axis, fixed, a, b) => GU.walls.find((w) => w.axis === axis && Math.abs(w.fixed - fixed) < 0.002 && a >= w.a - 0.001 && b <= w.b + 0.001);
    const doors = [], windows = [];
    const addDoor = (d) => {
      const wall = findWall(d.axis, d.fixed, d.a, d.b);
      if (!wall) { console.warn('[Layout] no wall for door', d); return; }
      wall.openings.push({ a: d.a - wall.a, b: d.b - wall.a, bottom: d.y || 0, top: (d.y || 0) + (d.top || 2.1) });
      d.wall = wall;
      doors.push(d);
    };
    const addWindow = (d) => {
      const wall = findWall(d.axis, d.fixed, d.a, d.b);
      if (!wall) { console.warn('[Layout] no wall for window', d); return; }
      d.bottom = d.bottom || 0.9; d.top = d.top || 2.1;
      wall.openings.push({ a: d.a - wall.a, b: d.b - wall.a, bottom: d.bottom, top: d.top });
      d.wall = wall;
      windows.push(d);
    };
    for (const unit of GU.units) {
      const T = unit.T, north = unit.side !== 'south';
      const wx = (x) => (north ? unit.x0 + x : unit.x0 + T.W - x);
      const wz = (z) => (north ? 0.9 + z : -0.9 - z);
      for (const d of T.doors) {
        const into = unit.rooms[d.into];
        let axis = d.axis, fixed, a, b;
        if (axis === 'x') { fixed = wz(d.at); [a, b] = [wx(d.a), wx(d.b)].sort((p, q) => p - q); }
        else { fixed = wx(d.at); [a, b] = [wz(d.a), wz(d.b)].sort((p, q) => p - q); }
        // which side of the line is the "into" room on?
        const c = axis === 'x' ? (into.rect[1] + into.rect[3]) / 2 : (into.rect[0] + into.rect[2]) / 2;
        const hinge = north ? d.hinge : (d.hinge === 'a' ? 'b' : 'a');
        addDoor({ axis, fixed, a, b, into: c > fixed ? 1 : -1, intoRoom: into, hinge, entry: d.entry, unit,
          label: d.entry ? 'Apt ' + unit.number + ' door' : into.name.toLowerCase() + ' door',
          number: d.entry ? unit.number : null, color: d.entry ? unit.theme.doorColor || '#7a1f2b' : unit.theme.innerDoor || '#f4f1e6' });
      }
      for (const wdw of T.windows) {
        const room = unit.rooms[wdw.room];
        const [a, b] = [wx(wdw.a), wx(wdw.b)].sort((p, q) => p - q);
        addWindow({ axis: 'x', fixed: wz(10), a, b, room, unit, curtains: unit.theme[wdw.room + 'Curtains'], blindsDown: unit.theme.blinds });
      }
    }
    for (const d of COMMON_DOORS) {
      const into = byId[d.into];
      const c = into ? (d.axis === 'x' ? (into.rect[1] + into.rect[3]) / 2 : (into.rect[0] + into.rect[2]) / 2) : 0;
      addDoor(Object.assign({}, d, { into: into ? (c > d.fixed ? 1 : -1) : 1, intoRoom: into }));
    }
    // the locked door from each stairwell's upper landing to the (unbuilt) 2nd floor corridor
    for (const [x0] of [[-25.25], [21.75]]) addDoor({ axis: 'x', fixed: 0.9, a: x0 + 2.2, b: x0 + 3.1, y: 3.0, into: 1, hinge: 'a', color: '#c0392b', label: '2nd floor door', locked: 'Locked. Sign: "2ND FLOOR — UNDER CONSTRUCTION."', lockedPrompt: 'Open 2nd floor door' });
    for (const d of COMMON_WINDOWS) addWindow(Object.assign({}, d, { room: byId[d.room] }));

    // ---- generate all wall layers ----
    for (const w of GU.walls) w.generate();

    // ---- floors, ceilings, lights, switches ----
    for (const r of rooms) {
      const parent = r.unit ? r.unit.g : GU.building;
      const lightParent = r.unit ? GU.buildingLights : GU.buildingLights;
      const toLocal = (x, z) => (r.unit ? r.unit.g.worldToLocal(new THREE.Vector3(x, 0, z)) : new THREE.Vector3(x, 0, z));
      r.unit && r.unit.root.updateMatrixWorld(true);
      const [x1, z1, x2, z2] = r.rect;
      const a = toLocal(x1, z1), b = toLocal(x2, z2);
      const lx1 = Math.min(a.x, b.x), lx2 = Math.max(a.x, b.x), lz1 = Math.min(a.z, b.z), lz2 = Math.max(a.z, b.z);
      GU.floor(parent, lx1, lz1, lx2, lz2, r.finish.floor);
      GU.ceiling(parent, lx1, lz1, lx2, lz2, GU.mat('#ffffff', GU.tex.ceiling(r.unit ? r.unit.dirt : 0.1)), r.h);
      if (r.kind === 'elevator') continue;
      const area = (x2 - x1) * (z2 - z1);
      const long = Math.max(x2 - x1, z2 - z1);
      const n = r.kind === 'corridor' ? 8 : long > 6 ? 2 : 1;
      for (let i = 0; i < n; i++) {
        const f = (i + 0.5) / n;
        const lx = (x2 - x1) > (z2 - z1) ? x1 + (x2 - x1) * f : (x1 + x2) / 2;
        const lz = (x2 - x1) > (z2 - z1) ? (z1 + z2) / 2 : z1 + (z2 - z1) * f;
        const p = toLocal(lx, lz);
        const color = r.unit ? r.unit.theme.lightColor || '#fff1d6' : r.kind === 'corridor' ? '#fff3c4' : '#f4fbff';
        const lh = GU.ceilingLight(GU.buildingLights, parent, p.x, p.z, {
          h: r.h, color, circuit: r.circuit, intensity: area < 6 ? 4 : r.kind === 'lobby' || r.kind === 'stair' ? 9 : 6, distance: r.kind === 'stair' ? 12 : 9,
          flicker: (r.kind === 'corridor' && i === 2) || (r.unit && r.unit.theme.bathFlicker && r.kind === 'bath'),
        });
        lh.world.set(lx, r.h - 0.35, lz);
        lh.fixed = true;
      }
    }
    // switches by each door, on the latch side, inside the room the door opens into
    for (const d of doors) {
      if (!d.intoRoom || !d.wall || d.y) continue;
      const room = d.intoRoom;
      const wall = d.wall;
      const latchB = d.hinge === 'a';
      let u = latchB ? d.b - wall.a + 0.15 : d.a - wall.a - 0.15;
      if (u < 0.1 || u > wall.L - 0.1) u = latchB ? d.a - wall.a - 0.15 : d.b - wall.a + 0.15;
      if (u < 0.1 || u > wall.L - 0.1) continue;
      const parent = room.unit ? room.unit.g : GU.building;
      GU.makeSwitch(parent, wall, u, d.into, room.circuit);
    }
    // door slabs + frames, windows
    for (const d of doors) {
      const parent = d.unit && !d.entry ? d.unit.g : GU.building;
      d.t = d.wall.t;
      const local = parent === GU.building ? d : Object.assign({}, d, localDoor(d, parent));
      const pivot = GU.doorway(parent, local);
      if (d.entry) d.unit.door = pivot;
    }
    for (const d of windows) {
      const parent = d.unit ? d.unit.g : GU.building;
      d.t = d.wall.t;
      d.outward = d.wall.neg ? 1 : -1;
      GU.windowUnit(parent, parent === GU.building ? d : Object.assign({}, d, localDoor(d, parent)));
    }
    // breaker panels
    for (const unit of GU.units) {
      const p = unit.T.panel;
      GU.breakerPanel(unit.g, p[0], p[1], p[2], p[3], unit);
      unit.root.updateMatrixWorld(true);
      const a = unit.root.localToWorld(new THREE.Vector3(0, 0, 0)), b = unit.root.localToWorld(new THREE.Vector3(unit.T.W, 3, 10));
      unit.bounds = new THREE.Box3().setFromPoints([a, b]);
      GU.zones.push({ box: unit.bounds, name: 'Apt ' + unit.number + ' — ' + unit.title });
    }
    for (const r of rooms) {
      if (r.unit) continue;
      const [x1, z1, x2, z2] = r.rect;
      GU.zones.push({ box: new THREE.Box3(new THREE.Vector3(x1, -1, z1), new THREE.Vector3(x2, 7, z2)), name: r.name });
    }
  };

  // Convert a world-space door/window spec into a unit's local frame (units can be rotated 180°).
  function localDoor(d, parent) {
    parent.updateMatrixWorld(true);
    const p1 = d.axis === 'x' ? new THREE.Vector3(d.a, 0, d.fixed) : new THREE.Vector3(d.fixed, 0, d.a);
    const p2 = d.axis === 'x' ? new THREE.Vector3(d.b, 0, d.fixed) : new THREE.Vector3(d.fixed, 0, d.b);
    const l1 = parent.worldToLocal(p1), l2 = parent.worldToLocal(p2);
    const flipped = Math.abs(l1.x - p1.x) > 0.001 && Math.sign(l2.x - l1.x) !== Math.sign(p2.x - p1.x) || (d.axis === 'z' && Math.sign(l2.z - l1.z) !== Math.sign(p2.z - p1.z));
    const rot = Math.abs(parent.parent.rotation.y) > 1; // south units: rotated 180°
    if (d.axis === 'x') {
      return { fixed: l1.z, a: Math.min(l1.x, l2.x), b: Math.max(l1.x, l2.x), into: rot ? -d.into : d.into, outward: rot ? -d.outward : d.outward, hinge: rot ? (d.hinge === 'a' ? 'b' : 'a') : d.hinge };
    }
    return { fixed: l1.x, a: Math.min(l1.z, l2.z), b: Math.max(l1.z, l2.z), into: rot ? -d.into : d.into, outward: rot ? -d.outward : d.outward, hinge: rot ? (d.hinge === 'a' ? 'b' : 'a') : d.hinge };
  }
})();
