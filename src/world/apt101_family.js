// Apt 101 — The Ramirez family: Marco, Ana and their daughter Lily (7). Clean, busy, lived-in.
GU.aptBuilders.push(function () {
  const W = (c) => GU.mat('#ffffff', GU.tex.paint(c));
  const A = new GU.Apartment({
    number: '101', title: 'The Ramirez Family', side: 'north', x0: -14, dirt: 0.05,
    theme: {
      hallWall: GU.hallWallMat,
      living: { floor: GU.mat('#ffffff', GU.tex.wood('#c98b4f')), wall: W('#ffb38a') },
      kitchen: { floor: GU.mat('#ffffff', GU.tex.checker('#ffffff', '#4ecdc4', 0.4)), wall: W('#fff1a8') },
      bed1: { floor: GU.mat('#ffffff', GU.tex.carpet('#d8c3a5')), wall: W('#9fc5e8') },
      bath: { floor: GU.mat('#ffffff', GU.tex.tile('#bde0fe', '#ffffff', 0.3)), wall: GU.mat('#ffffff', GU.tex.tile('#e0f7fa', '#ffffff', 0.25)) },
      bed2: { floor: GU.mat('#ffffff', GU.tex.carpet('#f8bbd0')), wall: GU.mat('#ffffff', GU.tex.floral('#e6d7ff', '#ff6fa5')) },
      doorColor: '#c0392b', innerDoor: '#ffffff',
      cabinet: GU.mat('#ffffff', GU.tex.paint('#ffffff')),
      counter: GU.mat('#ffffff', GU.tex.granite('#3d405b')),
      backsplash: GU.mat('#ffffff', GU.tex.tile('#4ecdc4', '#ffffff', 0.15)),
      bed1Curtains: '#264653', bed2Curtains: '#ff8fab', blinds: 0.2,
    },
  });
  const g = A.g, rng = A.rng;

  A.kitchen({
    fridge: [
      ['milk', 'oj', 'leftovers', ['takeout', { desc: 'Pad see ew from Friday. Marco\'s.' }]],
      ['eggs', 'cheese', 'deli_turkey', 'yogurt', 'yogurt', 'yogurt', 'hummus'],
      ['chicken', 'ground_beef', 'juice_boxes', 'string_cheese'],
    ],
    crisper: ['lettuce', 'carrots', 'apple', 'apple', 'orange', 'tomato'],
    fridgeDoor: [['ketchup', 'mustard', 'ranch', 'hot_sauce'], ['mayo', 'jam', 'pickles', 'salsa'], ['milk_2pct', 'apple_juice']],
    freezer: [['nuggets', 'frozen_peas', 'ice_cream'], ['popsicles', 'frozen_pizza']],
    magnets: ['kid', 'photo', 'kid'],
    drawers: [
      ['fork', 'fork', 'fork', 'fork', 'spoon', 'spoon', 'spoon', 'butter_knife', 'butter_knife', 'butter_knife'],
      ['chef_knife', 'bread_knife', 'paring_knife', 'steak_knife', 'steak_knife', 'kitchen_shears'],
      ['dish_towel', 'dish_towel', 'oven_mitt'],
      ['spatula', 'wooden_spoon', 'whisk', 'ladle', 'tongs', 'peeler', 'can_opener', 'measuring_cups'],
      ['batteries', 'tape', 'scissors', 'pen', 'rubber_bands', 'takeout_menus', 'matches', 'keys', 'twist_ties'],
      ['foil', 'plastic_wrap', 'ziploc'],
    ],
    sink: ['bleach', 'dishwasher_pods', 'all_purpose', 'glass_cleaner', 'drain_cleaner', 'sponge', 'gloves', 'trash_bags', 'steel_wool'],
    dishes: ['bowl', 'spoon'],
    pots: [['pot', 'pan'], ['baking_sheet', 'cutting_board']],
    lowerCab: [['tupperware', 'tupperware', 'tupperware'], ['laundry_detergent', 'fabric_softener']],
    spices: [
      ['salt', 'pepper', 'garlic_powder', 'onion_powder', 'paprika', 'cumin', 'chili_powder', 'oregano', 'basil', 'cinnamon', 'nutmeg', 'bay_leaves', 'cayenne'],
      ['italian', 'curry', 'vanilla', 'season_salt', 'red_pepper_flakes', 'olive_oil', 'vinegar'],
    ],
    plates: [['plate', 'plate', 'plate', 'plate'], ['bowl', 'bowl', 'bowl', 'bowl', 'bowl']],
    glasses: [['glass', 'glass', 'glass', 'sippy_cup', 'sippy_cup'], ['mug', 'mug2', 'mug', 'wine_glass']],
    upper2: [['measuring_cups', 'tupperware', 'plate', 'plate'], ['wine', 'red_wine']],
    pantry: [
      ['rice', 'flour', 'sugar', 'brown_sugar'],
      ['cereal', 'cereal_bran', 'oatmeal'],
      ['pasta', 'penne', 'mac_cheese', 'mac_cheese', 'soup', 'soup', 'beans', 'tomatoes_can', 'tuna'],
      ['peanut_butter', 'honey', 'coffee', 'tea', 'veg_oil', 'baking_soda', 'popcorn'],
      ['chips', 'goldfish', 'crackers', 'granola_bars', ['cookies', { desc: 'Hidden on the top shelf, away from Lily.' }]],
    ],
    counterA: ['paper_towels', 'dish_soap'],
    counterB: ['bananas', 'apple', 'orange', 'bread'],
    counterC: ['tissues'],
    stoveTop: ['pot', 'pan'],
    oven: ['baking_sheet'],
    microwave: ['bowl'],
    backDrawers: [['takeout_menus', 'pen', 'tv_guide'], ['dish_towel', 'dish_towel'], ['ziploc', 'foil']],
    backCab1: [['bowl', 'bowl'], ['juice_boxes', 'baby_food']],
    backCab2: [['pot', 'pan', 'baking_sheet'], ['cereal', 'crackers']],
  });

  A.bathroom({
    ledge: ['shampoo', 'conditioner', 'kids_shampoo', 'body_wash2'],
    tub: ['rubber_duck', ['rubber_duck', { desc: 'The other duck. Lily named him Gerald.' }]],
    under: ['toilet_paper_pack', 'toilet_cleaner', 'scrub_cleanser', 'hair_dryer'],
    counter: ['hand_soap', 'toothbrush', 'toothbrush2', 'toothpaste'],
    medicine: [
      ['pain_reliever', 'kids_medicine', 'cough_syrup', 'bandaids'],
      ['vitamins', 'floss', 'razor', 'shaving_cream'],
      ['deodorant', 'deodorant2', 'perfume', 'cologne'],
    ],
    shelf: ['towel', 'toilet_paper', 'toilet_paper', 'candle'],
    floor: ['plunger', 'toilet_brush'],
    towelColor: '#ff8fab', matColor: '#4ecdc4',
  });

  // ---- living room ----
  GU.rug(g, 2.3, 3.2, 2.6, 3.0, GU.tex.rug('#e76f51', '#264653', '#f4a261'));
  GU.tvStand(g, 0.35, 3.2, Math.PI / 2, { w: 1.6, show: 'A cartoon about a talking dog. Lily\'s show.', inside: [['board_game', 'puzzle']], top: ['remote'] });
  GU.sofa(g, 3.6, 3.2, -Math.PI / 2, { color: '#2a9d8f', pillows: ['#f4a261', '#e76f51'], blanket: GU.tex.plaid('#e9c46a', '#e76f51') });
  GU.table(g, 2.1, 3.2, Math.PI / 2, { w: 1.1, d: 0.6, h: 0.45, top: ['coloring_book', 'crayons', 'magazine', 'remote'], gap: 0.06 });
  GU.table(g, 7.0, 3.0, 0, {
    w: 1.4, d: 0.9, top: ['plate', 'plate', 'glass', 'glass', 'tv_guide'],
    chairs: [[-0.4, -0.65, 0], [0.4, -0.65, 0], [-0.4, 0.65, Math.PI], [0.4, 0.65, Math.PI]],
    cloth: GU.tex.plaid('#ffffff', '#e63946'),
  });
  GU.bookshelf(g, 1.6, 5.94 - 0.17, Math.PI, { w: 1.0, seed: '101a', contents: [[], ['kids_book', 'kids_book', 'book2'], [], ['photo_album'], []] });
  GU.plant(g, 8.5, 0.5, { s: 1.3 });
  GU.floorLamp(g, 0.5, 1.5);
  GU.coatHooks(g, 2.9, 1.75, 0.15, 0, ['#e63946', '#264653', '#ffd60a']);
  GU.scatter(g, [2.5, 0.3, 3.4, 0.8], ['sneakers', 'kid_shoes', 'boots'], rng);
  GU.art(g, 0.13, 2.0, 1.4, Math.PI / 2, 0.6, 0.45, 'photo', 1);
  GU.art(g, 0.13, 2.1, 5.0, Math.PI / 2, 0.5, 0.4, 'photo', 2);
  GU.art(g, 6.0, 2.1, 0.13, 0, 0.9, 0.6, 'landscape', 3);
  GU.wallClock(g, 7.0, 2.2, 5.93, Math.PI);
  GU.scatter(g, [4.5, 1.5, 5.5, 4.5], ['blocks', 'blocks2', 'blocks3', 'toy_car', 'lego'], rng);

  // ---- master bedroom (Marco + Ana) ----
  GU.bed(g, 1.15, 9.0, Math.PI / 2, { w: 1.6, sheet: GU.mat('#ffffff', GU.tex.fabric('#264653')), pillow: '#f4f1e6' });
  GU.nightstand(g, 0.38, 7.75, Math.PI / 2, { top: ['glasses', 'book'], drawers: [['phone_charger', 'lotion', 'tissues'], ['book3', 'candle']] });
  GU.nightstand(g, 0.38, 10.25, Math.PI / 2, { top: ['alarm_clock', 'phone'], drawers: [['headphones', 'batteries'], ['magazine']] });
  GU.dresser(g, 4.69, 9.6, -Math.PI / 2, {
    w: 1.2, mirror: true, top: ['jewelry_box', 'perfume', 'watch'],
    drawers: [['socks', 'socks'], ['shirt', 'shirt2'], ['jeans'], ['sweater'], ['socks'], ['shirt'], ['jeans', 'jeans'], ['towel']],
  });
  GU.wardrobe(g, 1.6, 6.4, 0, { w: 1.2, floor: ['sneakers', 'boots', 'slippers'], shelf: ['board_game', 'shirt'], clothes: ['#264653', '#e76f51', '#ffffff', '#f4a261', '#222222'] });
  GU.laundryBasket(g, 4.5, 11.4, '#9fc5e8');
  GU.art(g, 0.13, 2.3, 9.0, Math.PI / 2, 1.0, 0.5, 'abstract', 11);

  // ---- Lily's room ----
  GU.rug(g, 11.0, 9.5, 2.0, 1.6, GU.tex.roadRug());
  GU.bed(g, 12.85, 9.0, -Math.PI / 2, { w: 1.0, l: 1.9, sheet: GU.mat('#ffffff', GU.tex.floral('#ff8fab', '#ffffff')), pillow: '#fff59d', headH: 0.9, frame: GU.mat('#ffffff', GU.tex.paint('#ffffff')) });
  GU.placeItems(g, 12.95, 0.55, 8.6, 0.3, 0.3, ['teddy']);
  GU.placeItems(g, 12.95, 0.55, 9.3, 0.3, 0.3, ['bunny']);
  GU.toyChest(g, 13.4, 11.4, -Math.PI / 2, ['ball', 'dino', 'toy_truck', 'doll', 'action_figure', 'blocks', 'blocks2', 'toy_train']);
  GU.table(g, 10.0, 10.8, 0, { w: 0.8, d: 0.6, h: 0.5, small: true, top: ['coloring_book', 'crayons', 'kid_scissors'], chairs: [[-0.25, -0.5, 0], [0.25, 0.5, Math.PI]], mat: GU.mat('#ffffff', GU.tex.paint('#ffd60a')) });
  GU.bookshelf(g, 8.83, 8.0, Math.PI / 2, { w: 0.8, h: 1.1, shelves: 2, seed: 'lily', mat: GU.mat('#ffffff', GU.tex.paint('#ff8fab')), contents: [['kids_book', 'kids_book', 'kids_book'], ['puzzle'], ['bunny', 'nightlight']] });
  GU.dresser(g, 12.6, 11.6, Math.PI, { w: 0.8, top: ['nightlight', 'teddy'], drawers: [['kids_clothes', 'kids_clothes'], ['socks', 'kids_clothes'], ['kids_clothes'], ['blocks3']] });
  GU.art(g, 13.87, 2.0, 7.5, -Math.PI / 2, 0.4, 0.4, 'kid', 21);
  GU.art(g, 13.87, 2.0, 10.5, -Math.PI / 2, 0.4, 0.4, 'kid', 22);
  GU.art(g, 8.57, 2.0, 10.4, Math.PI / 2, 0.45, 0.45, 'kid', 23);
  GU.scatter(g, [10.3, 8.6, 11.8, 10.2], ['toy_car', 'blocks', 'kid_shoes', 'ball'], rng);

  A.finish();
});
