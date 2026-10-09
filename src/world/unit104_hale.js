// Apt 104 (1 bed / 1 bath) — Eleanor Hale, 78, retired schoolteacher. Widowed. Spotless.
// Lives with Biscuit the cat. Her sewing corner is in the living room.
(function () {
  GU.unitDefs = GU.unitDefs || {};
  GU.unitDefs['104'] = {
    title: 'Mrs. Hale', surname: 'Hale', dirt: 0,
    doormat: ['HOME', '#a5d6a7'],
    mail: 'A handwritten letter from her grandson and a church newsletter.',
    hallway(B, x, z) {
      const us = GU.group(B, x + 0.8, 0, z * 0.85);
      GU.cyl(us, 0.12, 0.12, 0.5, 0, 0, 0, GU.mat('#1b998b'));
      GU.cyl(us, 0.015, 0.015, 0.8, 0.03, 0.2, 0, GU.mat('#7b2cbf'));
      GU.prop(us, { move: 3, hp: 2, mat: 'porcelain', color: '#1b998b', name: 'umbrella stand' });
      GU.interactive(us, 'Look at umbrella stand', () => GU.say('A purple umbrella and a cane with a tennis ball on the end.'));
    },
    theme: {
      living: { wall: GU.mat('#ffffff', GU.tex.floral('#fbe8d3', '#d1495b')), floor: GU.mat('#ffffff', GU.tex.carpet('#8fb996')) },
      hall: { wall: GU.mat('#ffffff', GU.tex.floral('#fbe8d3', '#d1495b')), floor: GU.mat('#ffffff', GU.tex.carpet('#8fb996')) },
      kitchen: { wall: GU.mat('#ffffff', GU.tex.stripes('#fff8e7', '#cde7b0')), floor: GU.mat('#ffffff', GU.tex.checker('#fff8e7', '#e9c46a', 0.3)) },
      bedroom: { wall: GU.mat('#ffffff', GU.tex.floral('#f3e8ff', '#7b2cbf')), floor: GU.mat('#ffffff', GU.tex.carpet('#c9b6e4')) },
      bath: { wall: GU.mat('#ffffff', GU.tex.tile('#ffeef2', '#ffffff', 0.2)), floor: GU.mat('#ffffff', GU.tex.tile('#ffd6e0', '#ffffff', 0.25)) },
      doorColor: '#2a9d8f', innerDoor: '#fff8e7',
      cabinet: GU.mat('#ffffff', GU.tex.wood('#d4a373')), counter: GU.mat('#ffffff', GU.tex.tile('#ffffff', '#cde7b0', 0.2)),
      backsplash: GU.mat('#ffffff', GU.tex.tile('#e9c46a', '#ffffff', 0.15)),
      lightColor: '#ffe8c2', livingCurtains: '#9b2226', bedroomCurtains: '#7b2cbf', blinds: 0.15,
    },
    build(u) {
      const g = u.g;
      const wood = GU.mat('#ffffff', GU.tex.wood('#6f4518'));
      u.kitchen({
        fridge: [['milk_2pct', 'prune_juice', ['leftovers', { desc: 'Chicken pot pie, labeled "TUESDAY" in neat handwriting.' }]], ['eggs', 'butter', 'cheese', 'jam', 'yogurt'], ['deli_turkey', 'cat_food', 'cat_food']],
        crisper: ['apple', 'apple', 'orange', 'lemon', 'onion'],
        fridgeDoor: [['mustard', 'mayo', 'pickles'], ['jam'], ['oj']],
        freezer: [['ice_cream', 'frozen_peas'], ['ice_tray']],
        magnets: ['photo', 'photo', 'photo', 'landscape'],
        drawers: [
          ['fork', 'fork', 'fork', 'spoon', 'spoon', 'butter_knife', 'butter_knife'], ['chef_knife', 'bread_knife', 'paring_knife', 'peeler'], ['dish_towel', 'dish_towel', 'oven_mitt'],
          ['wooden_spoon', 'whisk', 'ladle', 'spatula', 'rolling_pin'], ['scissors', 'pen', 'rubber_bands', 'twist_ties', 'matches', 'batteries', 'keys'], ['foil', 'plastic_wrap', 'ziploc'],
          ['crossword', 'pen'], ['candle', 'matches'], ['dish_towel'],
        ],
        sink: ['bleach', 'furniture_polish', 'glass_cleaner', 'scrub_cleanser', 'steel_wool', 'gloves', 'vinegar'],
        dishes: [],
        cabs: [[['pot', 'pan'], ['baking_sheet', 'cutting_board']], [['cat_food', 'cat_food', 'cat_food'], ['cat_kibble']]],
        uppers: [
          [['salt', 'pepper', 'cinnamon', 'nutmeg', 'bay_leaves', 'paprika', 'oregano'], ['basil', 'garlic_powder', 'onion_powder', 'vanilla', 'italian']],
          [['plate', 'plate', 'plate', 'plate'], ['bowl', 'bowl', 'bowl']], [['mug3', 'mug3', 'mug3', 'glass'], ['wine_glass', 'wine_glass']],
          [['measuring_cups', 'tupperware'], ['crisco', 'baking_soda']], [['pill_organizer', 'prescription2'], ['vitamins']], [['tea', 'chamomile'], ['honey']],
        ],
        pantry: [['flour', 'sugar', 'brown_sugar', 'cat_kibble'], ['cereal_bran', 'oatmeal', 'crackers'], ['soup', 'soup', 'soup', 'tuna', 'tuna', 'beans'], ['tea', 'chamomile', 'coffee', 'honey'], [['cookies', { desc: 'For her grandson, if he ever visits.' }]]],
        counter: [['apple', 'orange', 'lemon'], ['bread']],
        stoveTop: [['pot', { name: 'Tea Kettle', desc: 'A whistling kettle, still warm.' }]],
        trashMsg: 'Tea bags and a neatly folded newspaper. Even her trash is tidy.', coffeeColor: '#f4f1e6',
      });
      GU.cyl(g, 0.08, 0.06, 0.05, 2.6, 0, 1.0, GU.mat('#7e57c2'));
      GU.cyl(g, 0.08, 0.06, 0.05, 2.85, 0, 1.0, GU.mat('#80deea'));
      u.bathroom({
        ledge: ['shampoo', 'conditioner', 'body_wash2'], under: ['toilet_paper_pack', 'toilet_cleaner', 'scrub_cleanser', 'rubbing_alcohol', 'peroxide'],
        counter: ['hand_soap', 'dentures_cup', 'lotion'],
        medicine: [['prescription', 'prescription2', 'pain_reliever'], ['vitamins', 'acetaminophen', 'cotton_swabs', 'bandaids'], ['perfume', 'lipstick', 'nail_clippers']],
        floor: ['slippers'], toiletTop: ['tissues'], curtain: GU.tex.floral('#ffffff', '#d1495b'), matColor: '#ffb3c6',
      });
      u.laundry({ washer: ['towel', 'towel'], dryer: ['sweater'] });
      u.closets([{ floor: ['slippers', 'boots'], shelf: ['photo_album', 'board_game'], clothes: ['#7b2cbf', '#e9d8a6', '#9b2226', '#005f73', '#ffffff'] }]);

      // living room
      GU.rug(g, 2.2, 7.4, 2.6, 3.0, GU.tex.rug('#9b2226', '#e9d8a6', '#005f73'));
      GU.tvStand(g, 0.36, 7.4, Math.PI / 2, { w: 1.2, tvW: 0.8, mat: wood, show: 'A game show. She knows all the answers.', inside: [['photo_album', 'photo_album'], ['board_game']], top: ['remote', 'glasses'] });
      GU.sofa(g, 3.6, 7.6, -Math.PI / 2, { w: 1.8, color: '#d4a5a5', pillows: ['#e9d8a6', '#9b2226'], blanket: GU.tex.plaid('#005f73', '#e9d8a6') });
      GU.armchair(g, 1.6, 9.2, Math.PI, '#9b2226');
      GU.cat(g, 1.65, 0.52, 9.15, Math.PI / 2, { name: 'Biscuit', color: '#e08b3a', lines: ['Biscuit purrs like a motor.', 'Biscuit flops over. Belly trap. Don\'t do it.', 'Mrrp?', 'Biscuit glares at you for stopping.'] });
      GU.table(g, 2.1, 7.4, Math.PI / 2, { w: 1.0, d: 0.55, h: 0.45, mat: wood, top: ['crossword', 'glasses', 'mug3', 'knitting', 'yarn'], cloth: GU.tex.floral('#ffffff', '#e9d8a6'), gap: 0.04 });
      // sewing corner
      const sew = GU.table(g, 3.6, 5.2, Math.PI, { w: 1.1, d: 0.55, mat: GU.mat('#ffffff', GU.tex.wood('#d4a373')), top: ['scissors', 'yarn'], chairs: [[0, 0.5, Math.PI]] });
      const mach = GU.group(sew, -0.25, 0.75, 0);
      GU.box(mach, 0.4, 0.12, 0.18, 0, 0, 0, GU.mat('#f4f1e6'));
      GU.box(mach, 0.08, 0.2, 0.15, -0.16, 0.12, 0, GU.mat('#f4f1e6'));
      GU.box(mach, 0.36, 0.06, 0.15, 0, 0.3, 0, GU.mat('#f4f1e6'));
      GU.interactive(mach, 'Use sewing machine', () => GU.say('Half a quilt for her grandson is still under the needle.'));
      GU.plant(g, 0.5, 9.5, { s: 1.4, pot: '#e9c46a' });
      GU.plant(g, 4.0, 9.5, { s: 1.0 });
      GU.floorLamp(g, 0.5, 5.5, '#ffe8c2');
      GU.wallClock(g, 2.2, 2.2, 9.85, Math.PI);
      for (let i = 0; i < 6; i++) GU.art(g, 0.16, 2.25 - (i % 2) * 0.45, 5.6 + Math.floor(i / 2) * 0.55, Math.PI / 2, 0.32, 0.38, 'photo', 30 + i, '#d4af37');
      GU.cyl(g, 0.28, 0.25, 0.1, 1.5, 0, 5.3, GU.mat('#ffffff', GU.tex.fabric('#c9b6e4')));
      GU.placeItems(g, 1.5, 0.1, 5.3, 0.2, 0.2, ['cat_toy']);

      // bedroom
      GU.bed(g, 6.83, 7.6, -Math.PI / 2, { w: 1.4, sheet: GU.mat('#ffffff', GU.tex.plaid('#7b2cbf', '#f3e8ff')), pillow: '#ffffff', frame: wood, headH: 1.3 });
      GU.nightstand(g, 7.62, 6.5, -Math.PI / 2, { mat: wood, top: ['glasses', 'book3', 'tissues'], drawers: [['prescription2', 'pill_organizer', 'lotion'], ['photo_album']] });
      GU.nightstand(g, 7.62, 8.7, -Math.PI / 2, { mat: wood, top: ['alarm_clock', ['book', { name: 'Harold\'s Bible', desc: 'Her late husband\'s bible. A pressed flower marks Psalm 23.' }]], drawers: [['watch', 'jewelry_box'], ['candle']] });
      GU.dresser(g, 4.71, 8.4, Math.PI / 2, { w: 1.2, mirror: true, mat: wood, top: ['jewelry_box', 'perfume', 'candle'],
        drawers: [['sweater', 'sweater'], ['shirt', 'shirt2'], ['socks', 'socks'], ['towel'], ['sweater'], ['shirt'], ['photo_album'], ['yarn', 'yarn']] });
      GU.art(g, 7.85, 2.4, 7.6, -Math.PI / 2, 0.5, 0.6, 'photo', 50, '#d4af37');
      GU.plant(g, 5.0, 9.5, { s: 0.9 });
    },
  };
})();
