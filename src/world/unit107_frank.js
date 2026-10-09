// Apt 107 (1 bed / 1 bath) — Frank Dorsey, 71, retired machinist. A hoarder.
// Newspaper stacks, boxes to the ceiling, narrow paths between the piles.
(function () {
  const P = (c, d) => GU.mat('#ffffff', GU.tex.paint(c, d));
  // stack of newspapers / magazines
  const papers = (g, x, z, h) => {
    const s = GU.group(g, x, 0, z, Math.random() * 0.3);
    const n = Math.floor(h / 0.05);
    for (let i = 0; i < n; i++) GU.box(s, 0.38, 0.05, 0.3, (Math.random() - 0.5) * 0.04, i * 0.05, (Math.random() - 0.5) * 0.04, GU.mat(i % 3 ? '#e8e2cc' : '#d8d0b0'));
    GU.prop(s, { move: 12, hp: 2, mat: 'paper', color: '#e8e2cc', name: 'newspaper stack' });
    GU.interactive(s, 'Look at newspapers', () => GU.say('The ' + (1985 + Math.floor(Math.random() * 30)) + ' sports section. Every single one.'));
    return s;
  };
  const boxes = (g, x, z, n, ry) => {
    const s = GU.group(g, x, 0, z, ry || 0);
    for (let i = 0; i < n; i++) GU.box(s, 0.55 - (i % 2) * 0.08, 0.38, 0.45, (i % 2) * 0.05, i * 0.38, 0, GU.mat('#ffffff', GU.tex.label('#b08d57', i % 2 ? '#ffffff' : null, ['MISC', 'KEEP', 'PARTS', 'VHS', 'MISC'][i % 5], '#333')), { unitUV: true });
    GU.prop(s, { move: 15 * n, hp: n, mat: 'paper', color: '#b08d57', name: 'pile of boxes' });
    GU.blocker(s, 0.6, 0.38 * n, 0.5, 0, 0, 0).userData.noRay = true;
    GU.interactive(s, 'Look in the boxes', () => GU.say(['Broken radios. Probably "for parts".', 'VHS tapes of game shows recorded off TV.', 'Twist ties. Thousands of twist ties.', 'Jars of screws sorted by nothing.'][Math.floor(Math.random() * 4)]));
    return s;
  };
  GU.unitDefs = GU.unitDefs || {};
  GU.unitDefs['107'] = {
    title: 'Frank (Hoarder)', surname: 'Dorsey', dirt: 0.75,
    mail: 'Stuffed full. Catalogs from 2009. The carrier gave up and left a note.',
    hallway(B, x, z) { papers(B, x + 0.9, z * 0.85, 0.5); },
    theme: {
      living: { wall: P('#c2b280', 0.8), floor: GU.mat('#ffffff', GU.tex.carpet('#6b5b3e', 0.8)) },
      hall: { wall: P('#c2b280', 0.8), floor: GU.mat('#ffffff', GU.tex.carpet('#6b5b3e', 0.8)) },
      kitchen: { wall: P('#e0d39a', 0.9), floor: GU.mat('#ffffff', GU.tex.checker('#d8cfa0', '#7a5c3a', 0.3, 0.9)) },
      bedroom: { wall: P('#9fa889', 0.7), floor: GU.mat('#ffffff', GU.tex.carpet('#5b6340', 0.8)) },
      bath: { wall: GU.mat('#ffffff', GU.tex.tile('#bcd4a8', '#6b705c', 0.2, 0.9)), floor: GU.mat('#ffffff', GU.tex.tile('#a3a380', '#6b705c', 0.25, 1)) },
      doorColor: '#5e503f', innerDoor: '#c2b280', cabinet: GU.mat('#ffffff', GU.tex.wood('#7f5539', 0.8)), counter: GU.mat('#ffffff', GU.tex.granite('#c2b280')),
      lightColor: '#ffe9a8', blinds: 1.0, livingCurtains: '#5e503f', bedroomCurtains: '#5e503f',
    },
    build(u) {
      const g = u.g, rng = u.rng;
      u.kitchen({
        fridge: [['milk_expired', ['moldy_takeout', {}], 'pickles', 'pickles'], ['eggs', 'butter', 'mustard'], ['prune_juice', 'leftovers', 'leftovers']],
        crisper: [['onion', { name: 'Sprouting Onion', desc: 'It\'s growing a new onion.' }]],
        fridgeDoor: [['ketchup', 'mustard', 'mustard', 'mustard'], ['salsa', 'jam'], ['milk_expired']],
        freezer: [['ice_tray', 'frozen_peas', 'frozen_peas', 'frozen_peas'], ['frozen_pizza']],
        magnets: ['photo', 'landscape', 'poster', 'photo'],
        drawers: [['twist_ties', 'twist_ties', 'rubber_bands', 'rubber_bands', 'keys', 'keys', 'batteries'], ['fork', 'spoon', 'butter_knife', 'steak_knife'], ['takeout_menus', 'takeout_menus', 'takeout_menus'],
          ['can_opener', 'peeler', 'whisk'], ['matches', 'lighter', 'tape', 'pen', 'pen', 'pen'], ['ziploc', 'ziploc', 'foil', 'foil'], ['screwdriver', 'wrench'], ['wire_nuts', 'duct_tape_pro'], ['twist_ties']],
        sink: ['bleach', 'ammonia', 'bug_spray', 'bug_spray', 'steel_wool', 'trash_bags'],
        dishes: ['plate_dirty', 'plate_dirty', 'mug', 'pan', 'bowl_dirty'],
        cabs: [[['tupperware', 'tupperware', 'tupperware'], ['tupperware', 'tupperware']], [['soup', 'soup', 'soup', 'soup'], ['beans', 'beans', 'beans']]],
        uppers: [[['salt', 'pepper', 'season_salt'], ['msg']], [['plate', 'plate'], ['bowl']], [['mug', 'mug2', 'mug3', 'glass'], []], [['tuna', 'tuna', 'tuna', 'tuna'], []], [['cat_food'], []], [['coffee'], []]],
        pantry: [['soup', 'soup', 'soup', 'soup'], ['tuna', 'tuna', 'tuna', 'beans'], ['crackers', 'crackers', 'oatmeal'], ['coffee', 'coffee', 'sugar'], ['cookies', 'cookies']],
        counter: [['magazine', 'magazine', 'takeout_menus']],
        stoveTop: [['pot', { name: 'Pot of Something', desc: 'Some kind of stew. From when?' }]], oven: [['magazine', { desc: 'He stores magazines in the oven. That\'s a fire waiting to happen.' }]],
        trash: ['trash_bag_full', 'pizza_box'], trashMsg: 'The trash is mostly more stuff he couldn\'t throw away.',
      });
      u.bathroom({
        ledge: ['bar_soap', 'two_in_one'], under: ['toilet_paper_pack', 'toilet_paper_pack', 'bleach'], counter: ['comb', 'toothbrush'],
        medicine: [['prescription2', 'prescription', 'pain_reliever'], ['razor', 'shaving_cream'], ['cough_syrup', 'cough_syrup']], floor: ['magazine'], toiletTop: ['crossword'], matColor: '#6b705c',
      });
      u.laundry({ washer: ['laundry_pile'], dryer: ['laundry_pile2'], shelf: ['laundry_detergent', 'paint_can', 'paint_can'] });
      u.closets([{ floor: ['boots', 'boots', 'paint_can'], shelf: ['board_game', 'photo_album', 'puzzle'], clothes: ['#5e503f', '#7f5539', '#c2b280', '#333333'] }]);

      // living room: piles everywhere, a path to the recliner and the TV
      GU.tvStand(g, 0.36, 7.4, Math.PI / 2, { w: 1.2, tvW: 0.8, on: true, mat: GU.mat('#ffffff', GU.tex.wood('#5e503f')), show: 'An old western. The volume is at 60.', inside: [['photo_album', 'board_game']] });
      GU.armchair(g, 2.4, 7.4, -Math.PI / 2, '#7f5539');
      for (const [x, z, h] of [[0.5, 5.0, 1.0], [0.9, 5.0, 1.3], [0.5, 9.5, 1.5], [0.95, 9.5, 0.9], [1.4, 9.5, 1.2], [3.9, 9.4, 1.4], [3.9, 8.9, 1.0], [3.4, 5.1, 0.8], [1.6, 5.0, 0.6]]) papers(g, x, z, h);
      boxes(g, 3.8, 6.0, 4, 0.1);
      boxes(g, 3.85, 7.6, 3, -0.1);
      boxes(g, 2.4, 9.4, 2, 0.2);
      GU.table(g, 1.6, 6.3, 0, { w: 0.6, d: 0.5, h: 0.5, mat: GU.mat('#ffffff', GU.tex.wood('#5e503f')), top: ['remote', 'glasses', 'crossword', 'mug'], gap: 0.02 });
      u.mess([1.2, 5.6, 3.3, 9.0], ['magazine', 'magazine', 'takeout_menus', 'chip_bag_empty', 'tv_guide', 'socks'], 4);
      // bedroom: bed buried on one side
      GU.bed(g, 6.83, 7.6, -Math.PI / 2, { w: 1.4, made: false, sheet: GU.mat('#ffffff', GU.tex.plaid('#5e503f', '#c2b280')), pillow: '#d8d0b0', frame: GU.mat('#ffffff', GU.tex.wood('#5e503f')) });
      GU.nightstand(g, 7.62, 6.5, -Math.PI / 2, { top: ['prescription2', 'glasses', 'watch'], drawers: [['keys', 'keys', 'batteries'], ['photo_album']] });
      boxes(g, 4.85, 9.3, 4);
      boxes(g, 4.85, 8.6, 3);
      papers(g, 5.6, 9.5, 1.2);
      papers(g, 5.3, 6.4, 0.7);
      GU.art(g, 7.85, 2.2, 7.6, -Math.PI / 2, 0.5, 0.6, 'photo', 77, '#5e503f');
      u.mess([5.0, 5.8, 6.0, 9.0], ['laundry_pile', 'boots', 'magazine'], 3);
    },
  };
})();
