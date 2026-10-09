// Apt 101 (2 bed / 2 bath) — The Ramirez family: Marco, Ana and their daughter Lily (7). Clean, busy, lived-in.
(function () {
  const P = (c, d) => GU.mat('#ffffff', GU.tex.paint(c, d));
  GU.unitDefs = GU.unitDefs || {};
  GU.unitDefs['101'] = {
    title: 'The Ramirez Family', surname: 'Ramirez', dirt: 0.05,
    doormat: ['WELCOME', '#c49a6c'],
    mail: 'Bills, a dentist reminder, and a kid\'s magazine.',
    hallway(B, x, z) {
      const st = GU.group(B, x + 1.4, 0, z * 0.9);
      GU.box(st, 0.5, 0.35, 0.7, 0, 0.35, 0, GU.mat('#3a86ff'));
      for (const sx of [-0.22, 0.22]) for (const sz of [-0.3, 0.3]) GU.torus(st, 0.1, 0.02, sx, 0.1, sz, GU.mat('#222'), { ry: Math.PI / 2 });
      GU.prop(st, { move: 8, hp: 3, mat: 'plastic', color: '#3a86ff', name: 'stroller' });
      GU.blocker(st, 0.5, 0.9, 0.7, 0, 0, 0).userData.noRay = true;
    },
    theme: {
      living: { wall: P('#ffb38a'), floor: GU.mat('#ffffff', GU.tex.wood('#c98b4f')) },
      hall: { wall: P('#ffb38a'), floor: GU.mat('#ffffff', GU.tex.wood('#c98b4f')) },
      kitchen: { wall: P('#fff1a8'), floor: GU.mat('#ffffff', GU.tex.checker('#ffffff', '#4ecdc4', 0.4)) },
      bed1: { wall: P('#9fc5e8'), floor: GU.mat('#ffffff', GU.tex.carpet('#d8c3a5')) },
      bed2: { wall: GU.mat('#ffffff', GU.tex.floral('#e6d7ff', '#ff6fa5')), floor: GU.mat('#ffffff', GU.tex.carpet('#f8bbd0')) },
      bath: { wall: GU.mat('#ffffff', GU.tex.tile('#e0f7fa', '#ffffff', 0.25)), floor: GU.mat('#ffffff', GU.tex.tile('#bde0fe', '#ffffff', 0.3)) },
      ensuite: { wall: GU.mat('#ffffff', GU.tex.tile('#f2f2f2', '#c0c0c0', 0.25)), floor: GU.mat('#ffffff', GU.tex.tile('#d6ccc2', '#ffffff', 0.3)) },
      doorColor: '#c0392b', innerDoor: '#ffffff',
      cabinet: P('#ffffff'), counter: GU.mat('#ffffff', GU.tex.granite('#3d405b')),
      backsplash: GU.mat('#ffffff', GU.tex.tile('#4ecdc4', '#ffffff', 0.15)),
      bed1Curtains: '#264653', bed2Curtains: '#ff8fab', blinds: 0.2,
    },
    build(u) {
      const g = u.g, rng = u.rng;
      u.kitchen({
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
          ['fork', 'fork', 'fork', 'fork', 'spoon', 'spoon', 'spoon', 'butter_knife', 'butter_knife'],
          ['chef_knife', 'bread_knife', 'paring_knife', 'steak_knife', 'steak_knife', 'kitchen_shears'],
          ['dish_towel', 'dish_towel', 'oven_mitt'],
          ['spatula', 'wooden_spoon', 'whisk', 'ladle', 'tongs', 'peeler', 'can_opener', 'measuring_cups'],
          ['batteries', 'tape', 'scissors', 'pen', 'rubber_bands', 'takeout_menus', 'matches', 'keys', 'twist_ties'],
          ['foil', 'plastic_wrap', 'ziploc'],
          ['dish_towel', 'tv_guide'], ['crayons', 'kid_scissors'], ['batteries'],
        ],
        sink: ['bleach', 'dishwasher_pods', 'all_purpose', 'glass_cleaner', 'drain_cleaner', 'sponge', 'gloves', 'trash_bags', 'steel_wool'],
        dishes: ['bowl', 'spoon'],
        cabs: [[['pot', 'pan'], ['baking_sheet', 'cutting_board']], [['tupperware', 'tupperware'], ['juice_boxes', 'baby_food']]],
        uppers: [
          [['salt', 'pepper', 'garlic_powder', 'onion_powder', 'paprika', 'cumin', 'chili_powder', 'oregano'], ['basil', 'cinnamon', 'nutmeg', 'bay_leaves', 'cayenne', 'italian', 'curry', 'vanilla']],
          [['plate', 'plate', 'plate', 'plate'], ['bowl', 'bowl', 'bowl', 'bowl']],
          [['glass', 'glass', 'sippy_cup', 'sippy_cup'], ['mug', 'mug2', 'wine_glass']],
          [['measuring_cups', 'tupperware'], ['wine', 'red_wine']],
          [['olive_oil', 'vinegar', 'season_salt', 'red_pepper_flakes'], ['honey']],
          [['vitamins', 'kids_medicine'], ['bandaids']],
        ],
        pantry: [
          ['rice', 'flour', 'sugar', 'brown_sugar'],
          ['cereal', 'cereal_bran', 'oatmeal'],
          ['pasta', 'penne', 'mac_cheese', 'mac_cheese', 'soup', 'soup', 'beans', 'tomatoes_can', 'tuna'],
          ['peanut_butter', 'honey', 'coffee', 'tea', 'veg_oil', 'baking_soda', 'popcorn'],
          ['chips', 'goldfish', 'crackers', 'granola_bars', ['cookies', { desc: 'Hidden on the top shelf, away from Lily.' }]],
        ],
        counter: [['bananas', 'apple', 'bread'], ['paper_towels', 'dish_soap']],
        stoveTop: ['pot', 'pan'], oven: ['baking_sheet'], microwave: ['bowl'],
      });
      GU.table(g, 2.1, 3.3, 0, { w: 1.2, d: 0.8, top: ['plate', 'plate', 'glass', 'tv_guide'], cloth: GU.tex.plaid('#ffffff', '#e63946'),
        chairs: [[-0.35, -0.6, 0], [0.35, -0.6, 0], [-0.35, 0.6, Math.PI], [0.35, 0.6, Math.PI]] });
      u.bathroom({
        ledge: ['shampoo', 'kids_shampoo', 'body_wash2'], tub: ['rubber_duck', ['rubber_duck', { desc: 'The other duck. Lily named him Gerald.' }]],
        under: ['toilet_paper_pack', 'toilet_cleaner', 'scrub_cleanser'], counter: ['hand_soap', 'toothbrush2', 'toothpaste'],
        medicine: [['kids_medicine', 'bandaids'], ['cough_syrup', 'floss'], ['cotton_swabs']], floor: ['toilet_brush'], matColor: '#4ecdc4',
      }, 'bath');
      u.bathroom({
        ledge: ['shampoo', 'conditioner', 'body_wash2'], under: ['toilet_paper', 'hair_dryer', 'plunger'],
        counter: ['hand_soap', 'toothbrush', 'electric_toothbrush'],
        medicine: [['pain_reliever', 'vitamins'], ['razor', 'shaving_cream', 'deodorant'], ['deodorant2', 'perfume', 'cologne']], matColor: '#264653',
      }, 'ensuite');
      u.laundry({ washer: ['kids_clothes', 'socks'], dryer: ['towel'] });
      u.closets([
        { floor: ['sneakers', 'boots', 'slippers'], shelf: ['board_game', 'shirt'], clothes: ['#264653', '#e76f51', '#ffffff', '#f4a261'] },
        { floor: ['kid_shoes', 'ball'], shelf: ['puzzle', 'kids_clothes'], clothes: ['#ff8fab', '#06d6a0', '#ffd60a'] },
      ]);
      GU.scatter(g, [4.2, 1.2, 4.8, 2.0], ['sneakers', 'kid_shoes', 'boots'], rng);

      // living room
      GU.rug(g, 5.2, 7.8, 2.4, 3.0, GU.tex.rug('#e76f51', '#264653', '#f4a261'));
      GU.tvStand(g, 3.67, 7.8, Math.PI / 2, { w: 1.6, show: 'A cartoon about a talking dog. Lily\'s show.', inside: [['board_game', 'puzzle']], top: ['remote'] });
      GU.sofa(g, 6.6, 7.8, -Math.PI / 2, { color: '#2a9d8f', pillows: ['#f4a261', '#e76f51'], blanket: GU.tex.plaid('#e9c46a', '#e76f51') });
      GU.table(g, 5.1, 7.8, Math.PI / 2, { w: 1.1, d: 0.6, h: 0.45, top: ['coloring_book', 'crayons', 'magazine', 'remote'], gap: 0.06 });
      GU.plant(g, 3.8, 9.5, { s: 1.3 });
      GU.floorLamp(g, 6.95, 9.5);
      GU.art(g, 3.47, 2.1, 9.0, Math.PI / 2, 0.6, 0.45, 'photo', 1);
      GU.art(g, 7.23, 2.2, 8.4, -Math.PI / 2, 0.9, 0.5, 'landscape', 3);
      GU.scatter(g, [4.4, 6.0, 5.6, 9.0], ['blocks', 'blocks2', 'toy_car', 'lego'], rng);

      // master bedroom
      GU.bed(g, 9.33, 7.6, -Math.PI / 2, { w: 1.6, sheet: GU.mat('#ffffff', GU.tex.fabric('#264653')), pillow: '#f4f1e6' });
      GU.nightstand(g, 10.12, 6.45, -Math.PI / 2, { top: ['glasses', 'book'], drawers: [['phone_charger', 'lotion', 'tissues'], ['book3', 'candle']] });
      GU.nightstand(g, 10.12, 8.75, -Math.PI / 2, { top: ['alarm_clock', 'phone'], drawers: [['headphones', 'batteries'], ['magazine']] });
      GU.dresser(g, 7.62, 8.6, Math.PI / 2, { w: 1.2, mirror: true, top: ['jewelry_box', 'perfume', 'watch'],
        drawers: [['socks', 'socks'], ['shirt', 'shirt2'], ['jeans'], ['sweater'], ['socks'], ['shirt'], ['jeans'], ['towel']] });
      GU.laundryBasket(g, 7.7, 9.5, '#9fc5e8');
      GU.art(g, 10.35, 2.2, 7.6, -Math.PI / 2, 1.0, 0.5, 'abstract', 11);

      // Lily's room
      GU.rug(g, 1.8, 7.3, 1.8, 1.6, GU.tex.roadRug());
      GU.bed(g, 1.1, 8.6, Math.PI / 2, { w: 1.0, l: 1.9, sheet: GU.mat('#ffffff', GU.tex.floral('#ff8fab', '#ffffff')), pillow: '#fff59d', headH: 0.9, frame: P('#ffffff') });
      GU.placeItems(g, 0.9, 0.55, 8.3, 0.3, 0.3, ['teddy']);
      GU.placeItems(g, 0.9, 0.55, 8.9, 0.3, 0.3, ['bunny']);
      GU.toyChest(g, 3.05, 7.4, -Math.PI / 2, ['ball', 'dino', 'toy_truck', 'doll', 'action_figure', 'blocks', 'toy_train']);
      GU.table(g, 2.65, 9.3, 0, { w: 0.8, d: 0.55, h: 0.5, small: true, top: ['coloring_book', 'crayons', 'kid_scissors'], chairs: [[-0.25, -0.45, 0]], mat: P('#ffd60a') });
      GU.art(g, 0.16, 2.0, 7.0, Math.PI / 2, 0.4, 0.4, 'kid', 21);
      GU.art(g, 3.33, 2.0, 9.0, -Math.PI / 2, 0.4, 0.4, 'kid', 22);
      GU.placeItems(g, 1.6, 0, 6.3, 0.8, 0.4, ['nightlight', 'kid_shoes']);
    },
  };
})();
