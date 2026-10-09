// Apt 103 — Eleanor Hale, 78, retired schoolteacher. Widowed. Spotless.
// Lives with Biscuit the cat. The spare room is her sewing room.
GU.aptBuilders.push(function () {
  const A = new GU.Apartment({
    number: '103', title: 'Mrs. Hale', side: 'south', x0: 14, dirt: 0,
    theme: {
      hallWall: GU.hallWallMat,
      living: { floor: GU.mat('#ffffff', GU.tex.carpet('#8fb996')), wall: GU.mat('#ffffff', GU.tex.floral('#fbe8d3', '#d1495b')) },
      kitchen: { floor: GU.mat('#ffffff', GU.tex.checker('#fff8e7', '#e9c46a', 0.3)), wall: GU.mat('#ffffff', GU.tex.stripes('#fff8e7', '#cde7b0')) },
      bed1: { floor: GU.mat('#ffffff', GU.tex.carpet('#c9b6e4')), wall: GU.mat('#ffffff', GU.tex.floral('#f3e8ff', '#7b2cbf')) },
      bath: { floor: GU.mat('#ffffff', GU.tex.tile('#ffd6e0', '#ffffff', 0.25)), wall: GU.mat('#ffffff', GU.tex.tile('#ffeef2', '#ffffff', 0.2)) },
      bed2: { floor: GU.mat('#ffffff', GU.tex.wood('#a47148')), wall: GU.mat('#ffffff', GU.tex.paint('#a8dadc')) },
      doorColor: '#2a9d8f', innerDoor: '#fff8e7', trim: '#fff8e7',
      cabinet: GU.mat('#ffffff', GU.tex.wood('#d4a373')),
      counter: GU.mat('#ffffff', GU.tex.tile('#ffffff', '#cde7b0', 0.2)),
      backsplash: GU.mat('#ffffff', GU.tex.tile('#e9c46a', '#ffffff', 0.15)),
      lightColor: '#ffe8c2', bed1Curtains: '#7b2cbf', bed2Curtains: '#e9c46a', blinds: 0.15,
    },
  });
  const g = A.g, rng = A.rng;

  A.kitchen({
    fridge: [
      ['milk_2pct', 'prune_juice', ['leftovers', { desc: 'Chicken pot pie, labeled "TUESDAY" in neat handwriting.' }]],
      ['eggs', 'butter', 'cheese', 'jam', 'yogurt', 'yogurt'],
      ['deli_turkey', 'cat_food', 'cat_food', 'cat_food'],
    ],
    crisper: ['apple', 'apple', 'orange', 'lemon', 'onion', 'tomato'],
    fridgeDoor: [['mustard', 'mayo', 'pickles'], ['jam', 'salsa'], ['oj']],
    freezer: [['ice_cream', 'frozen_peas'], ['ice_tray']],
    magnets: ['photo', 'photo', 'photo', 'landscape'],
    drawers: [
      ['fork', 'fork', 'fork', 'spoon', 'spoon', 'spoon', 'butter_knife', 'butter_knife'],
      ['chef_knife', 'bread_knife', 'paring_knife', 'peeler'],
      ['dish_towel', 'dish_towel', 'dish_towel', 'oven_mitt'],
      ['wooden_spoon', 'whisk', 'ladle', 'spatula', 'rolling_pin'],
      ['scissors', 'pen', 'rubber_bands', 'twist_ties', 'matches', 'batteries', 'keys', 'tape'],
      ['foil', 'plastic_wrap', 'ziploc'],
    ],
    sink: ['bleach', 'furniture_polish', 'glass_cleaner', 'scrub_cleanser', 'steel_wool', 'gloves', 'vinegar', 'trash_bags'],
    dishes: [],
    pots: [['pot', 'pan'], ['baking_sheet', 'cutting_board']],
    lowerCab: [['ammonia', ['disinfect_wipes', { desc: 'Kept well away from the bleach. She\'s careful.' }]], ['tupperware', 'tupperware']],
    spices: [
      ['salt', 'pepper', 'cinnamon', 'nutmeg', 'bay_leaves', 'paprika', 'oregano', 'basil', 'garlic_powder', 'onion_powder'],
      ['vanilla', 'italian', 'season_salt', 'honey'],
    ],
    plates: [['plate', 'plate', 'plate', 'plate'], ['bowl', 'bowl', 'bowl']],
    glasses: [['mug3', 'mug3', 'mug3', 'glass', 'glass'], ['wine_glass', 'wine_glass']],
    upper2: [['measuring_cups', 'tupperware'], ['crisco', 'baking_soda']],
    pantry: [
      ['flour', 'sugar', 'brown_sugar', 'cat_kibble'],
      ['cereal_bran', 'oatmeal', 'crackers'],
      ['soup', 'soup', 'soup', 'tuna', 'tuna', 'beans', 'tomatoes_can'],
      ['tea', 'chamomile', 'coffee', 'honey', 'baking_soda'],
      [['cookies', { desc: 'For her grandson, if he ever visits.' }], 'granola_bars'],
    ],
    counterA: ['paper_towels', 'dish_soap'],
    counterB: ['apple', 'orange', 'lemon', 'bread', 'pill_organizer'],
    counterC: ['tea', 'mug3'],
    stoveTop: [['pot', { name: 'Tea Kettle', desc: 'A whistling kettle, still warm.' }]],
    microwave: [],
    backDrawers: [['crossword', 'pen'], ['dish_towel'], ['candle', 'matches']],
    backCab1: [['cat_food', 'cat_food', 'cat_food', 'cat_food'], ['cat_kibble']],
    backCab2: [['pot', 'baking_sheet'], ['plate', 'plate']],
    trashMsg: 'Tea bags and a neatly folded newspaper. Even her trash is tidy.',
    coffeeColor: '#f4f1e6',
  });
  // Biscuit's bowls
  GU.cyl(g, 0.08, 0.06, 0.05, 9.6, 0, 5.2, GU.mat('#7e57c2'));
  GU.cyl(g, 0.08, 0.06, 0.05, 9.85, 0, 5.2, GU.mat('#80deea'));

  A.bathroom({
    ledge: ['shampoo', 'conditioner', 'body_wash2'],
    tub: [],
    under: ['toilet_paper_pack', 'toilet_cleaner', 'scrub_cleanser', 'rubbing_alcohol', 'peroxide'],
    counter: ['hand_soap', 'dentures_cup', 'lotion'],
    medicine: [
      ['prescription', 'prescription2', 'pain_reliever'],
      ['vitamins', 'acetaminophen', 'cotton_swabs', 'bandaids'],
      ['perfume', 'lipstick', 'nail_clippers'],
    ],
    shelf: ['towel', 'towel', 'tissues', 'candle'],
    floor: ['toilet_brush', 'slippers'],
    toiletTop: ['tissues'],
    curtain: GU.tex.floral('#ffffff', '#d1495b'),
    towelColor: '#ffd6e0', matColor: '#ffb3c6',
  });

  // ---- living room ----
  GU.rug(g, 2.5, 3.2, 3.0, 3.2, GU.tex.rug('#9b2226', '#e9d8a6', '#005f73'));
  GU.tvStand(g, 0.35, 3.2, Math.PI / 2, { w: 1.2, tvW: 0.8, mat: GU.mat('#ffffff', GU.tex.wood('#6f4518')), show: 'A game show. She knows all the answers.', inside: [['photo_album', 'photo_album'], ['board_game']], top: ['remote', 'glasses'] });
  GU.sofa(g, 4.0, 3.2, -Math.PI / 2, { w: 2.0, color: '#d4a5a5', pillows: ['#e9d8a6', '#9b2226'], blanket: GU.tex.plaid('#005f73', '#e9d8a6') });
  GU.armchair(g, 2.0, 5.2, Math.PI, '#9b2226');
  GU.cat(g, 2.05, 0.52, 5.15, Math.PI / 2, { name: 'Biscuit', color: '#e08b3a', lines: ['Biscuit purrs like a motor.', 'Biscuit flops over. Belly trap. Don\'t do it.', 'Mrrp?', 'Biscuit glares at you for stopping.'] });
  GU.table(g, 2.4, 3.2, Math.PI / 2, {
    w: 1.0, d: 0.55, h: 0.45, mat: GU.mat('#ffffff', GU.tex.wood('#6f4518')),
    top: ['crossword', 'glasses', 'mug3', 'knitting', 'yarn'], cloth: GU.tex.floral('#ffffff', '#e9d8a6'), gap: 0.04,
  });
  GU.bookshelf(g, 6.0, 0.29, 0, { w: 1.2, seed: '103a', mat: GU.mat('#ffffff', GU.tex.wood('#6f4518')), contents: [['photo_album', 'photo_album'], [], [], ['candle', 'plant_small', 'candle'], []] });
  GU.table(g, 7.3, 3.4, 0, {
    w: 1.0, d: 1.0, mat: GU.mat('#ffffff', GU.tex.wood('#6f4518')), top: ['candle', 'mug3', 'magazine'],
    chairs: [[0, -0.6, 0], [0, 0.6, Math.PI]], cloth: GU.tex.floral('#ffffff', '#d1495b'),
  });
  GU.plant(g, 0.5, 0.5, { s: 1.4, pot: '#e9c46a' });
  GU.plant(g, 8.5, 5.5, { s: 1.1 });
  GU.plant(g, 4.8, 5.6, { s: 0.9, pot: '#005f73' });
  GU.floorLamp(g, 0.5, 5.4, '#ffe8c2');
  GU.wallClock(g, 4.0, 2.2, 0.13, 0);
  for (let i = 0; i < 6; i++) GU.art(g, 0.13, 2.25 - (i % 2) * 0.45, 1.6 + Math.floor(i / 2) * 0.55, Math.PI / 2, 0.32, 0.38, 'photo', 30 + i, '#d4af37');
  GU.art(g, 4.0, 2.2, 5.93, Math.PI, 1.0, 0.7, 'landscape', 39, '#d4af37');
  GU.coatHooks(g, 2.9, 1.75, 0.15, 0, ['#7b2cbf', '#e9d8a6']);
  GU.placeItems(g, 2.7, 0, 0.45, 0.6, 0.3, ['slippers']);
  // cat bed
  GU.cyl(g, 0.28, 0.25, 0.1, 6.2, 0, 1.6, GU.mat('#ffffff', GU.tex.fabric('#c9b6e4')));
  GU.placeItems(g, 6.2, 0.1, 1.6, 0.2, 0.2, ['cat_toy']);

  // ---- her bedroom ----
  GU.bed(g, 1.15, 9.0, Math.PI / 2, { w: 1.4, sheet: GU.mat('#ffffff', GU.tex.plaid('#7b2cbf', '#f3e8ff')), pillow: '#ffffff', frame: GU.mat('#ffffff', GU.tex.wood('#6f4518')), headH: 1.3 });
  GU.nightstand(g, 0.38, 7.85, Math.PI / 2, { mat: GU.mat('#ffffff', GU.tex.wood('#6f4518')), top: ['glasses', 'book3', 'tissues'], drawers: [['prescription2', 'pill_organizer', 'lotion'], ['photo_album']] });
  GU.nightstand(g, 0.38, 10.15, Math.PI / 2, { mat: GU.mat('#ffffff', GU.tex.wood('#6f4518')), top: ['alarm_clock', ['book', { name: 'Harold\'s Bible', desc: 'Her late husband\'s bible. A pressed flower marks Psalm 23.' }]], drawers: [['watch', 'jewelry_box'], ['candle']] });
  GU.dresser(g, 4.69, 9.4, -Math.PI / 2, {
    w: 1.2, mirror: true, mat: GU.mat('#ffffff', GU.tex.wood('#6f4518')), top: ['jewelry_box', 'perfume', 'candle'],
    drawers: [['sweater', 'sweater'], ['shirt', 'shirt2'], ['socks', 'socks'], ['towel'], ['sweater'], ['shirt'], ['photo_album'], ['yarn', 'yarn']],
  });
  GU.wardrobe(g, 1.6, 6.4, 0, { w: 1.2, mat: GU.mat('#ffffff', GU.tex.wood('#6f4518')), floor: ['slippers', 'boots'], shelf: ['board_game', 'photo_album'], clothes: ['#7b2cbf', '#e9d8a6', '#9b2226', '#005f73', '#ffffff'] });
  GU.art(g, 0.13, 2.4, 9.0, Math.PI / 2, 0.5, 0.6, 'photo', 50, '#d4af37');
  GU.plant(g, 4.5, 11.5, { s: 0.9 });

  // ---- sewing room / guest room ----
  GU.bed(g, 12.9, 10.6, -Math.PI / 2, { w: 1.0, l: 1.9, sheet: GU.mat('#ffffff', GU.tex.floral('#e9c46a', '#ffffff')), frame: GU.mat('#ffffff', GU.tex.paint('#ffffff')), headH: 0.9 });
  const sew = GU.table(g, 12.6, 6.9, Math.PI, { w: 1.3, d: 0.6, mat: GU.mat('#ffffff', GU.tex.wood('#d4a373')), top: ['yarn', 'scissors', 'tape'], chairs: [[0, 0.55, Math.PI]] });
  const mach = GU.group(sew, -0.3, 0.75, 0);
  GU.box(mach, 0.4, 0.12, 0.18, 0, 0, 0, GU.mat('#f4f1e6'));
  GU.box(mach, 0.08, 0.2, 0.15, -0.16, 0.12, 0, GU.mat('#f4f1e6'));
  GU.box(mach, 0.36, 0.06, 0.15, 0, 0.3, 0, GU.mat('#f4f1e6'));
  GU.interactive(mach, 'Use sewing machine', () => GU.say('Half a quilt for her grandson is still under the needle.'));
  GU.bookshelf(g, 8.83, 8.5, Math.PI / 2, { w: 1.0, h: 1.6, shelves: 3, seed: '103b', contents: [['yarn', 'yarn', 'yarn', 'yarn'], ['photo_album', 'photo_album'], [], ['candle']] });
  GU.laundryBasket(g, 9.4, 11.3, '#e9c46a');
  GU.art(g, 13.87, 2.0, 7.5, -Math.PI / 2, 0.8, 0.5, 'landscape', 55, '#d4af37');
  GU.plant(g, 11.2, 11.5, { s: 1.0, pot: '#d1495b' });

  A.finish();
});
