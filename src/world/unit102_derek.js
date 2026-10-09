// Apt 102 (2 bed / 2 bath) — Derek Kowalski, lives alone. The second bedroom is a home gym (spotless).
// The rest of the place... less so.
(function () {
  const P = (c, d) => GU.mat('#ffffff', GU.tex.paint(c, d));
  GU.unitDefs = GU.unitDefs || {};
  GU.unitDefs['102'] = {
    title: 'Derek\'s Place', surname: 'Kowalski', dirt: 0.55,
    doormat: ['NO', '#333333'],
    mail: 'Supplement catalogs. Lots of them.',
    theme: {
      living: { wall: P('#5c677d', 0.4), floor: GU.mat('#ffffff', GU.tex.wood('#5a3e2b', 0.5)) },
      hall: { wall: P('#5c677d', 0.4), floor: GU.mat('#ffffff', GU.tex.wood('#5a3e2b', 0.5)) },
      kitchen: { wall: P('#c9d6df', 0.4), floor: GU.mat('#ffffff', GU.tex.tile('#d6d6d6', '#6b6b6b', 0.5, 0.6)) },
      bed1: { wall: P('#22223b', 0.3), floor: GU.mat('#ffffff', GU.tex.carpet('#4a4e69', 0.5)) },
      bed2: { wall: P('#e63946'), floor: GU.mat('#ffffff', GU.tex.carpet('#1a1a1a')) },
      bath: { wall: GU.mat('#ffffff', GU.tex.tile('#f2e9e4', '#9a8c98', 0.25, 0.5)), floor: GU.mat('#ffffff', GU.tex.tile('#9a8c98', '#4a4e69', 0.3, 0.6)) },
      ensuite: { wall: GU.mat('#ffffff', GU.tex.tile('#f2e9e4', '#9a8c98', 0.25, 0.6)), floor: GU.mat('#ffffff', GU.tex.tile('#9a8c98', '#4a4e69', 0.3, 0.7)) },
      doorColor: '#1d3557', innerDoor: '#e0e0e0',
      cabinet: P('#2b2d42', 0.3), counter: GU.mat('#ffffff', GU.tex.granite('#8d99ae')),
      lightColor: '#e8f0ff', bed1Curtains: '#111111', blinds: 0.9,
    },
    build(u) {
      const g = u.g, rng = u.rng;
      u.kitchen({
        fridge: [['meal_prep', 'meal_prep', 'meal_prep', 'meal_prep'], ['eggs', 'eggs', 'greek_yogurt', 'chicken'], ['protein_shake', 'protein_shake', 'beer', 'beer', 'ground_beef', 'bacon']],
        crisper: [['lettuce', { name: 'Slimy Lettuce', desc: 'Bought with good intentions. Now liquid.' }], 'avocado'],
        fridgeDoor: [['hot_sauce', 'sriracha', 'ketchup'], ['energy', 'energy', 'energy'], ['milk', 'water_bottle']],
        freezer: [['frozen_burrito', 'ice_cream', 'ice_tray'], [['frozen_peas', { desc: 'Used as an ice pack for his shoulder.' }]]],
        magnets: ['poster'],
        drawers: [
          ['fork', 'fork', 'spoon', 'butter_knife'], ['chef_knife', 'steak_knife', 'butcher_knife', 'kitchen_shears'], ['dish_towel', 'oven_mitt'],
          ['spatula', 'tongs', 'can_opener'], ['batteries', 'lighter', 'takeout_menus', 'takeout_menus', 'scissors', 'keys'], ['foil', 'ziploc'],
          ['shaker', 'shaker'], ['creatine'], [],
        ],
        sink: ['bleach', 'all_purpose', 'bug_spray', 'trash_bags', 'drain_cleaner', 'sponge_gross'],
        dishes: ['plate_dirty', 'bowl_dirty', 'fork', 'pan', 'mug2', 'shaker'],
        cabs: [[['pot'], ['protein_powder']], [['beer', 'beer', 'beer', 'beer'], ['chips', 'salsa']]],
        uppers: [
          [['salt', 'pepper', 'garlic_powder', 'season_salt', 'chili_powder', 'cayenne'], ['paprika', 'everything_bagel', 'hot_sauce']],
          [['plate', 'plate'], ['bowl', 'bowl']], [['glass', 'shaker'], ['mug']], [['vitamins', 'creatine', 'preworkout'], []],
          [['protein_powder'], []], [['beer_bottle', 'beer_bottle'], []],
        ],
        pantry: [['oats_bulk', 'rice', 'rice'], ['protein_powder', 'protein_powder'], ['rice_cakes', 'peanut_butter', 'peanut_butter', 'honey'], ['chips', 'tortilla_chips', 'granola_bars'], ['preworkout', 'coffee']],
        counter: [['protein_powder', 'bananas'], ['pizza_box'], ['energy', 'crushed_can']],
        stoveTop: ['pan'], microwave: [['takeout', { desc: 'Reheated three times. Still going.' }]],
        trash: ['pizza_box', 'crushed_can', 'fast_food_bag'], trashMsg: 'Pizza boxes, chicken bones, and a receipt for $140 of supplements.',
        coffeeColor: '#d62828',
      });
      u.bathroom({
        ledge: ['two_in_one', 'body_wash'], tub: [['bar_soap', { desc: 'Somehow has hair stuck to it.' }]],
        under: ['toilet_paper', 'toilet_cleaner'], counter: ['toothpaste', 'cologne'],
        medicine: [['pain_reliever', 'pain_reliever'], ['razor', 'shaving_cream'], ['deodorant']], floor: ['towel_dirty'], toiletTop: ['phone'], matColor: '#4a4e69',
      }, 'bath');
      u.bathroom({
        ledge: ['two_in_one'], under: ['plunger', 'toilet_paper'], counter: ['electric_toothbrush', 'comb'],
        medicine: [['cologne', 'deodorant'], ['nail_clippers'], []], floor: ['towel_dirty', 'gym_towel'], matColor: '#222222',
      }, 'ensuite');
      u.laundry({ washer: ['laundry_pile', 'gym_towel'], dryer: ['shirt', 'socks'] });
      u.closets([
        { floor: ['sneakers', 'sneakers', 'boots'], shelf: ['lifting_belt', 'headband'], clothes: ['#111111', '#555555', '#e63946', '#1d3557'] },
        { floor: ['plate25', 'plate10'], shelf: ['resistance_bands', 'jump_rope'], clothes: ['#222222', '#e63946'] },
      ]);

      // living room: huge TV + console, pizza boxes
      GU.tvStand(g, 3.67, 7.8, Math.PI / 2, { w: 2.0, tvW: 1.7, console: true, on: true, show: 'A paused fighting game. "PLAYER 2 DISCONNECTED".', inside: [['controller', 'controller'], ['board_game']], top: ['controller'] });
      GU.sofa(g, 6.6, 7.8, -Math.PI / 2, { w: 2.4, color: '#2b2b2b', items: ['remote', 'controller', 'phone_charger'] });
      GU.table(g, 5.1, 7.8, Math.PI / 2, { w: 1.2, d: 0.6, h: 0.45, mat: P('#1a1a1a'), top: ['pizza_box', 'beer', 'crushed_can', 'shaker', 'energy'], gap: 0.02, jitter: 0.8 });
      GU.art(g, 3.47, 2.3, 9.3, Math.PI / 2, 0.6, 0.85, 'poster', 41);
      GU.art(g, 7.23, 2.3, 8.6, -Math.PI / 2, 0.7, 1.0, 'poster', 42);
      GU.floorLamp(g, 6.95, 9.5, '#a0c4ff');
      u.mess([4.3, 5.4, 6.1, 9.6], ['pizza_box', 'crushed_can', 'crushed_can', 'beer', 'sneakers', 'laundry_pile', 'fast_food_bag', 'chip_bag_empty', 'gym_towel'], 4);
      GU.table(g, 2.1, 3.3, 0, { w: 1.0, d: 0.7, mat: GU.mat('#ffffff', GU.tex.metal('#3a3a3a')), top: ['laptop', 'energy', 'wallet', 'keys'], chairs: [[0, 0.55, Math.PI]], chairMat: GU.mat('#e63946') });

      // his bedroom
      GU.bed(g, 9.33, 7.6, -Math.PI / 2, { w: 1.6, made: false, sheet: GU.mat('#ffffff', GU.tex.fabric('#3d3d3d')), pillow: '#bdbdbd', frame: P('#111111'), headH: 0.8 });
      GU.nightstand(g, 10.12, 6.45, -Math.PI / 2, { mat: P('#111111'), top: ['energy', 'phone_charger', 'headphones'], drawers: [['cigarettes', 'lighter', 'wallet'], ['book', 'batteries']], lampColor: '#a0c4ff' });
      GU.dresser(g, 7.62, 8.6, Math.PI / 2, { w: 1.0, mat: P('#111111'), top: ['cologne', 'watch', 'protein_shake'], drawers: [['socks', 'socks', 'socks'], ['shirt', 'shirt'], ['headband', 'gym_towel'], ['jeans']] });
      u.mess([8.2, 3.6, 10.2, 6.2], ['laundry_pile', 'laundry_pile2', 'socks', 'crushed_can', 'energy'], 2);
      GU.art(g, 10.35, 2.2, 7.6, -Math.PI / 2, 1.2, 0.5, 'poster', 44);

      // home gym (second bedroom)
      GU.rug(g, 1.75, 7.6, 3.0, 4.4, GU.tex.carpet('#2b2b2b'));
      GU.squatRack(g, 1.1, 8.2, Math.PI / 2);
      GU.weightBench(g, 2.45, 8.2, 0);
      GU.dumbbellRack(g, 3.04, 7.2, -Math.PI / 2, [['dumbbell_light', 'dumbbell_light', 'dumbbell'], ['dumbbell_heavy', 'dumbbell_heavy']]);
      GU.box(g, 0.02, 1.6, 2.0, 0.17, 0.4, 7.8, GU.mat('#ffffff', GU.tex.mirror()));
      GU.placeItems(g, 2.6, 0, 9.5, 1.2, 0.5, ['plate45', 'plate45', 'kettlebell'], { gap: 0.02 });
      GU.placeItems(g, 0.7, 0, 6.2, 1.0, 0.4, ['foam_roller', 'jump_rope'], { gap: 0.05 });
      GU.wallShelf(g, 3.2, 1.4, 8.6, -Math.PI / 2, 1.0, ['chalk', 'shaker', 'preworkout', 'headband']);
      const spk = GU.group(g, 0.4, 0, 9.5);
      GU.box(spk, 0.25, 0.4, 0.25, 0, 0, 0, GU.mat('#111'));
      GU.prop(spk, { move: 6, hp: 2, mat: 'plastic', color: '#111111', name: 'speaker' });
      GU.interactive(spk, 'Play music', () => GU.say('The speaker blasts a gym playlist. Someone bangs on the wall.'));
      GU.art(g, 3.33, 2.3, 9.5, -Math.PI / 2, 0.5, 0.7, 'poster', 45);
    },
  };
})();
