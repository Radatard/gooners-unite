// Apt 102 — Derek Kowalski, lives alone. Spare bedroom is a home gym (spotless).
// The rest of the place... less so.
GU.aptBuilders.push(function () {
  const A = new GU.Apartment({
    number: '102', title: 'Derek\'s Place', side: 'north', x0: 0, dirt: 0.55,
    theme: {
      hallWall: GU.hallWallMat,
      living: { floor: GU.mat('#ffffff', GU.tex.wood('#5a3e2b', 0.5)), wall: GU.mat('#ffffff', GU.tex.paint('#5c677d', 0.4)) },
      kitchen: { floor: GU.mat('#ffffff', GU.tex.tile('#d6d6d6', '#6b6b6b', 0.5, 0.6)), wall: GU.mat('#ffffff', GU.tex.paint('#c9d6df', 0.4)) },
      bed1: { floor: GU.mat('#ffffff', GU.tex.carpet('#4a4e69', 0.5)), wall: GU.mat('#ffffff', GU.tex.paint('#22223b', 0.3)) },
      bath: { floor: GU.mat('#ffffff', GU.tex.tile('#9a8c98', '#4a4e69', 0.3, 0.6)), wall: GU.mat('#ffffff', GU.tex.tile('#f2e9e4', '#9a8c98', 0.25, 0.5)) },
      bed2: { floor: GU.mat('#ffffff', GU.tex.carpet('#1a1a1a')), wall: GU.mat('#ffffff', GU.tex.paint('#e63946')) },
      doorColor: '#1d3557', innerDoor: '#e0e0e0',
      cabinet: GU.mat('#ffffff', GU.tex.paint('#2b2d42', 0.3)),
      counter: GU.mat('#ffffff', GU.tex.granite('#8d99ae')),
      lightColor: '#e8f0ff', bed1Curtains: '#111111', blinds: 0.9,
    },
  });
  const g = A.g, rng = A.rng;

  A.kitchen({
    fridge: [
      ['meal_prep', 'meal_prep', 'meal_prep', 'meal_prep'],
      ['eggs', 'eggs', 'greek_yogurt', 'greek_yogurt', 'chicken'],
      ['protein_shake', 'protein_shake', 'protein_shake', 'beer', 'beer', 'beer', 'ground_beef', 'bacon'],
    ],
    crisper: [['lettuce', { name: 'Slimy Lettuce', desc: 'Bought with good intentions. Now liquid.' }], 'avocado', 'avocado'],
    fridgeDoor: [['hot_sauce', 'sriracha', 'ketchup'], ['energy', 'energy', 'energy', 'energy'], ['milk', 'water_bottle', 'water_bottle']],
    freezer: [['frozen_burrito', 'ice_cream', 'ice_tray'], ['frozen_peas', ['frozen_peas', { desc: 'Used as an ice pack for his shoulder.' }]]],
    magnets: ['poster'],
    drawers: [
      ['fork', 'fork', 'spoon', 'butter_knife', 'chef_knife'],
      ['steak_knife', 'steak_knife', 'butcher_knife', 'kitchen_shears'],
      ['dish_towel', 'oven_mitt'],
      ['spatula', 'tongs', 'can_opener'],
      ['batteries', 'lighter', 'takeout_menus', 'takeout_menus', 'scissors', 'keys', 'phone_charger'],
      ['foil', 'ziploc'],
    ],
    sink: ['bleach', 'all_purpose', 'bug_spray', 'trash_bags', 'drain_cleaner', 'sponge'],
    dishes: ['plate_dirty', 'bowl_dirty', 'fork', 'pan', 'mug2', 'shaker'],
    pots: [['pot'], ['baking_sheet']],
    lowerCab: [['protein_powder'], ['tupperware', 'tupperware', 'tupperware', 'tupperware']],
    spices: [['salt', 'pepper', 'garlic_powder', 'season_salt', 'chili_powder', 'cayenne', 'paprika', 'everything_bagel'], ['olive_oil', 'hot_sauce']],
    plates: [['plate', 'plate'], ['bowl', 'bowl']],
    glasses: [['glass', 'shaker', 'shaker'], ['mug', 'beer_bottle']],
    upper2: [['creatine', 'preworkout', 'vitamins'], ['protein_powder']],
    pantry: [
      ['oats_bulk', 'rice', 'rice'],
      ['protein_powder', 'protein_powder'],
      ['rice_cakes', 'peanut_butter', 'peanut_butter', 'honey'],
      ['chips', 'tortilla_chips', 'granola_bars'],
      ['preworkout', 'creatine', 'coffee'],
    ],
    counterA: ['paper_towels', 'dish_soap_green', 'shaker'],
    counterB: ['protein_powder', 'bananas', 'pizza_box'],
    counterC: ['energy', 'crushed_can'],
    stoveTop: ['pan'],
    microwave: [['takeout', { desc: 'Reheated three times. Still going.' }]],
    backDrawers: [['takeout_menus'], [], ['batteries']],
    backCab1: [['beer', 'beer', 'beer', 'beer'], ['chips']],
    backCab2: [['beer_bottle', 'beer_bottle', 'beer_bottle'], ['tortilla_chips', 'salsa']],
    trash: ['pizza_box', 'crushed_can', 'fast_food_bag'],
    trashMsg: 'Pizza boxes, chicken bones, and a receipt for $140 of supplements.',
    coffeeColor: '#d62828',
  });

  A.bathroom({
    ledge: ['two_in_one', 'body_wash'],
    tub: [['bar_soap', { desc: 'Somehow has hair stuck to it.' }]],
    under: ['toilet_paper', 'toilet_cleaner', 'plunger'],
    counter: ['electric_toothbrush', 'toothpaste', 'cologne'],
    medicine: [['pain_reliever', 'pain_reliever'], ['razor', 'shaving_cream', 'comb'], ['deodorant', 'cologne', 'creatine']],
    shelf: ['towel', 'toilet_paper'],
    floor: ['towel_dirty', 'towel_dirty'],
    toiletTop: ['phone'],
    towelColor: '#222222', matColor: '#4a4e69',
  });

  // ---- living room: big TV, console, pizza boxes ----
  GU.tvStand(g, 0.35, 3.2, Math.PI / 2, { w: 2.0, tvW: 1.7, console: true, on: true, show: 'A paused fighting game. "PLAYER 2 DISCONNECTED".', inside: [['controller', 'controller'], ['board_game']], top: ['controller'] });
  GU.sofa(g, 3.8, 3.2, -Math.PI / 2, { w: 2.4, color: '#2b2b2b', cushions: 3, items: ['remote', 'controller', 'phone_charger'] });
  GU.table(g, 2.3, 3.2, Math.PI / 2, { w: 1.2, d: 0.6, h: 0.45, mat: GU.mat('#ffffff', GU.tex.paint('#1a1a1a')), top: ['pizza_box', 'beer', 'crushed_can', 'shaker', 'energy'], gap: 0.02, jitter: 0.8 });
  GU.art(g, 0.13, 2.4, 1.0, Math.PI / 2, 0.6, 0.85, 'poster', 41);
  GU.art(g, 6.0, 2.4, 0.13, 0, 0.7, 1.0, 'poster', 42);
  GU.art(g, 4.5, 2.3, 5.93, Math.PI, 1.0, 0.6, 'poster', 43);
  GU.floorLamp(g, 0.5, 5.4, '#a0c4ff');
  GU.cyl(g, 0.35, 0.35, 0.4, 7.2, 0, 4.6, GU.mat('#ffffff', GU.tex.fabric('#e63946')));
  A.mess([4.6, 0.6, 8.6, 5.6], ['pizza_box', 'pizza_box', 'crushed_can', 'crushed_can', 'beer', 'sneakers', 'laundry_pile', 'fast_food_bag', 'chip_bag_empty', 'gym_towel'], 5);
  GU.scatter(g, [2.4, 0.3, 3.4, 0.8], ['sneakers', 'boots'], rng);
  GU.table(g, 7.2, 1.8, 0, { w: 1.0, d: 0.7, mat: GU.mat('#ffffff', GU.tex.metal('#3a3a3a')), top: ['laptop', 'energy', 'wallet', 'keys'], chairs: [[0, 0.6, Math.PI]], chairMat: GU.mat('#e63946') });

  // ---- his bedroom ----
  GU.bed(g, 1.15, 9.0, Math.PI / 2, { w: 1.6, made: false, sheet: GU.mat('#ffffff', GU.tex.fabric('#3d3d3d')), pillow: '#bdbdbd', frame: GU.mat('#ffffff', GU.tex.paint('#111111')), headH: 0.8 });
  GU.nightstand(g, 0.38, 7.75, Math.PI / 2, { mat: GU.mat('#ffffff', GU.tex.paint('#111111')), top: ['energy', 'phone_charger', 'headphones'], drawers: [['cigarettes', 'lighter', 'wallet'], ['book', 'batteries']], lampColor: '#a0c4ff' });
  GU.dresser(g, 4.69, 9.6, -Math.PI / 2, {
    w: 1.0, mat: GU.mat('#ffffff', GU.tex.paint('#111111')), top: ['cologne', 'watch', 'protein_shake'],
    drawers: [['socks', 'socks', 'socks'], ['shirt', 'shirt'], ['headband', 'gym_towel'], ['jeans']],
  });
  GU.wardrobe(g, 1.6, 6.4, 0, { w: 1.1, mat: GU.mat('#ffffff', GU.tex.paint('#333333')), floor: ['sneakers', 'sneakers', 'boots'], shelf: ['lifting_belt'], clothes: ['#111111', '#555555', '#e63946', '#1d3557'] });
  A.mess([1.0, 10.2, 4.6, 11.6], ['laundry_pile', 'laundry_pile2', 'socks', 'crushed_can', 'energy'], 2);
  GU.art(g, 0.13, 2.3, 9.0, Math.PI / 2, 1.2, 0.5, 'poster', 44);

  // ---- home gym (spare bedroom) ----
  GU.rug(g, 11.3, 9.0, 4.6, 5.0, GU.tex.carpet('#2b2b2b'));
  GU.squatRack(g, 12.2, 9.2, -Math.PI / 2);
  GU.weightBench(g, 10.6, 9.2, Math.PI / 2);
  GU.dumbbellRack(g, 8.9, 9.0, Math.PI / 2, [
    ['dumbbell_light', 'dumbbell_light', 'dumbbell', 'dumbbell'],
    ['dumbbell_heavy', 'dumbbell_heavy', 'dumbbell'],
  ]);
  GU.box(g, 0.02, 1.6, 3.0, 13.87, 0.4, 9.0, GU.mat('#ffffff', GU.tex.mirror()));
  GU.placeItems(g, 13.2, 0, 7.0, 1.0, 0.5, ['plate45', 'plate45', 'plate25'], { gap: 0.01 });
  GU.placeItems(g, 9.6, 0, 11.3, 1.4, 0.4, ['kettlebell', 'kettlebell', 'kettlebell_pink'], { gap: 0.05 });
  GU.placeItems(g, 11.0, 0, 11.4, 1.2, 0.4, ['foam_roller', 'jump_rope', 'resistance_bands'], { gap: 0.05 });
  GU.wallShelf(g, 13.75, 1.4, 11.0, -Math.PI / 2, 1.0, ['chalk', 'shaker', 'preworkout', 'headband', 'lifting_belt']);
  GU.wallShelf(g, 8.7, 1.5, 11.0, Math.PI / 2, 0.8, ['gym_towel', 'water_bottle', 'phone']);
  const fan = GU.group(g, 9.2, 0, 7.0);
  GU.cyl(fan, 0.18, 0.2, 0.04, 0, 0, 0, GU.mat('#222'));
  GU.cyl(fan, 0.02, 0.02, 1.0, 0, 0.04, 0, GU.mat('#222'));
  GU.cyl(fan, 0.25, 0.25, 0.12, 0, 1.0, 0, GU.mat('#ffffff', null, { transparent: true, opacity: 0.6 }), { rx: Math.PI / 2 }).position.y = 1.1;
  GU.interactive(fan, 'Turn on fan', () => GU.say('The fan rattles to life. Smells like effort.'));
  const spk = GU.box(g, 0.25, 0.4, 0.25, 13.5, 0, 11.4, GU.mat('#111'));
  GU.interactive(spk, 'Play music', () => GU.say('The speaker blasts a gym playlist at full volume. 104 bangs on the wall.'));
  GU.art(g, 8.57, 2.2, 9.0, Math.PI / 2, 0.6, 0.8, 'poster', 45);

  A.finish();
});
