// Apt 104 — Priya Patel & Kevin Nguyen, grad-student roommates. Disgusting.
// Priya's room is a cluttered study cave with living plants; Kevin's is a gaming den.
GU.aptBuilders.push(function () {
  const A = new GU.Apartment({
    number: '104', title: 'Priya & Kevin (Roommates)', side: 'south', x0: 0, dirt: 0.9,
    theme: {
      hallWall: GU.hallWallMat,
      living: { floor: GU.mat('#ffffff', GU.tex.carpet('#8d7b68', 0.9)), wall: GU.mat('#ffffff', GU.tex.paint('#b8c480', 0.8)) },
      kitchen: { floor: GU.mat('#ffffff', GU.tex.checker('#e0d6b8', '#8d6e63', 0.3, 0.9)), wall: GU.mat('#ffffff', GU.tex.paint('#e6d690', 0.9)) },
      bed1: { floor: GU.mat('#ffffff', GU.tex.carpet('#6d597a', 0.6)), wall: GU.mat('#ffffff', GU.tex.paint('#ffb4a2', 0.4)) },
      bath: { floor: GU.mat('#ffffff', GU.tex.tile('#c5d86d', '#6b705c', 0.3, 1)), wall: GU.mat('#ffffff', GU.tex.tile('#e9edc9', '#a5a58d', 0.25, 0.9)) },
      bed2: { floor: GU.mat('#ffffff', GU.tex.carpet('#3d405b', 0.8)), wall: GU.mat('#ffffff', GU.tex.paint('#3a0ca3', 0.5)) },
      doorColor: '#6b705c', innerDoor: '#d6ccc2',
      cabinet: GU.mat('#ffffff', GU.tex.wood('#a68a64', 0.8)),
      counter: GU.mat('#ffffff', GU.tex.granite('#bfb48f')),
      lightColor: '#fff6b0', kitchenLight: '#e8ffb0', bathFlicker: true, blinds: 0.6,
    },
  });
  const g = A.g, rng = A.rng;

  A.kitchen({
    fridge: [
      ['milk_expired', ['moldy_takeout', { desc: 'Nobody will claim it. It might be sentient.' }]],
      ['beer', 'beer', 'beer', 'beer', 'beer', 'energy', 'energy'],
      [['eggs', { name: 'Eggs (2 left)', desc: 'Two eggs. Kevin\'s. There\'s a sticky note that says "KEVIN\'S".' }], 'hummus'],
    ],
    crisper: [['carrots', { name: 'Soft Carrots', desc: 'They bend like rubber.' }]],
    fridgeDoor: [['ketchup', 'sriracha', 'soy_sauce'], ['ranch', 'hot_sauce'], ['oatmilk', 'soda']],
    freezer: [['ice_tray', 'nuggets'], ['frozen_pizza']],
    magnets: ['poster', 'kid'],
    drawers: [
      ['fork', 'spoon', ['spoon', { desc: 'The last clean spoon.' }]],
      ['chef_knife', 'scissors'],
      [],
      ['spatula', 'can_opener'],
      ['lighter', 'batteries', 'takeout_menus', 'takeout_menus', 'takeout_menus', 'pen', 'keys', 'rubber_bands', 'phone_charger'],
      ['ziploc'],
    ],
    sink: ['bug_spray', ['dish_soap', { desc: 'Watered down to make it last.' }], 'trash_bags', 'sponge_gross', 'bleach'],
    dishes: ['plate_dirty', 'plate_dirty', 'bowl_dirty', 'bowl_dirty', 'pan', 'pot', 'mug2', 'fork', 'solo_cup'],
    pots: [[], []],
    lowerCab: [['solo_cup', 'solo_cup', 'solo_cup'], ['beer', 'beer']],
    spices: [['salt', 'pepper', 'msg', 'red_pepper_flakes', 'curry', 'cumin', 'chili_powder'], ['soy_sauce', 'sriracha']],
    plates: [['plate'], ['bowl']],
    glasses: [['solo_cup', 'solo_cup', 'mug'], ['glass']],
    upper2: [['ramen', 'ramen', 'ramen', 'ramen'], ['cup_noodles', 'cup_noodles']],
    pantry: [
      ['rice', ['bread', { name: 'Moldy Bread', desc: 'Green spots on every slice. Throw it out.' }]],
      ['ramen', 'ramen', 'ramen', 'ramen', 'ramen', 'ramen'],
      ['cup_noodles', 'cup_noodles', 'cup_noodles', 'mac_cheese', 'mac_cheese'],
      ['peanut_butter', 'chips', 'tortilla_chips'],
      ['coffee', 'energy', 'energy'],
    ],
    counterA: ['paper_towels', 'energy', 'crushed_can'],
    counterB: ['pizza_box', 'fast_food_bag', 'bowl_dirty', 'cup_noodles'],
    counterC: ['crushed_can', 'solo_cup', 'chip_bag_empty'],
    stoveTop: [['pan', { name: 'Crusty Pan', desc: 'Eggs from... Monday? The week before?' }]],
    oven: [['pizza_box', { desc: 'They store pizza boxes in the oven. Fire hazard.' }]],
    microwave: [['cup_noodles', { desc: 'Splattered. The microwave walls are orange.' }]],
    backDrawers: [['takeout_menus'], [], []],
    backCab1: [[], ['solo_cup']],
    backCab2: [['ping_pong', 'ping_pong'], ['beer', 'beer']],
    trash: ['pizza_box', 'trash_bag_full', 'crushed_can', 'fast_food_bag', 'chip_bag_empty'],
    trashMsg: 'The trash is overflowing. There are fruit flies. So many fruit flies.',
    knifeBlock: false,
  });
  GU.placeItems(g, 9.8, 0, 1.0, 0.8, 0.6, ['trash_bag_full', 'trash_bag_full']);

  A.bathroom({
    ledge: ['shampoo', 'conditioner', 'two_in_one', 'body_wash'],
    tub: ['towel_dirty', 'body_wash2'],
    under: ['toilet_paper', ['toilet_cleaner', { desc: 'Unopened.' }]],
    counter: ['toothbrush', 'toothbrush2', ['toothpaste', { desc: 'Rolled up to the very end. Nobody bought more.' }], 'deodorant'],
    medicine: [['acetaminophen', 'cold_medicine', 'pain_reliever'], ['razor', 'floss', 'makeup_bag'], ['deodorant2', 'cologne']],
    shelf: [['toilet_paper', { name: 'Last Roll of TP', desc: 'Someone needs to buy more. It won\'t be Kevin.' }]],
    floor: ['towel_dirty', 'laundry_pile', 'phone_charger'],
    towelColor: '#a5a58d', matColor: '#6b705c',
  });
  GU.stain(g, 7.2, 10.8, 0.9, '60,80,30');
  GU.stain(g, 5.6, 6.6, 0.6, '60,80,30');

  // ---- living room: beer pong, couch, gaming ----
  GU.tvStand(g, 0.35, 3.2, Math.PI / 2, { w: 1.4, tvW: 1.3, console: true, mat: GU.mat('#ffffff', GU.tex.wood('#6f4518', 0.6)), show: 'A nature documentary nobody is watching.', inside: [['controller', 'controller', 'board_game']], top: ['controller', 'energy'] });
  GU.sofa(g, 3.6, 3.2, -Math.PI / 2, { w: 2.1, color: '#c9a227', items: ['laundry_pile2', 'controller', 'chip_bag_empty'], blanket: GU.tex.plaid('#6d597a', '#3a0ca3') });
  GU.table(g, 2.1, 3.2, Math.PI / 2, { w: 1.1, d: 0.6, h: 0.45, mat: GU.mat('#ffffff', GU.tex.wood('#a68a64', 0.8)), top: ['pizza_box', 'beer', 'crushed_can', 'textbook', 'remote', 'cigarettes'], gap: 0.01, jitter: 1.2 });
  GU.table(g, 6.6, 2.2, Math.PI / 2, {
    w: 2.4, d: 0.6, mat: GU.mat('#ffffff', GU.tex.paint('#ffffff', 0.7)),
    top: ['solo_cup', 'solo_cup', 'solo_cup', 'solo_cup', 'solo_cup', 'solo_cup', 'ping_pong', null, null, null, 'solo_cup', 'solo_cup', 'solo_cup'],
    gap: 0.02,
  });
  GU.cyl(g, 0.38, 0.38, 0.42, 1.2, 0, 5.2, GU.mat('#ffffff', GU.tex.fabric('#3a0ca3')));
  GU.cyl(g, 0.38, 0.38, 0.42, 2.1, 0, 5.4, GU.mat('#ffffff', GU.tex.fabric('#06d6a0')));
  GU.plant(g, 8.5, 0.5, { s: 1.2, dead: true });
  GU.art(g, 0.13, 2.4, 1.0, Math.PI / 2, 0.6, 0.85, 'poster', 61);
  GU.art(g, 4.5, 2.3, 5.93, Math.PI, 0.8, 0.6, 'poster', 62);
  A.mess([2.5, 0.4, 8.6, 5.6], [
    'pizza_box', 'pizza_box', 'pizza_box', 'crushed_can', 'crushed_can', 'crushed_can', 'crushed_can', 'beer', 'solo_cup', 'solo_cup',
    'chip_bag_empty', 'fast_food_bag', 'laundry_pile', 'sneakers', 'textbook', 'socks', 'ping_pong', 'energy',
  ], 8);

  // ---- Priya's room (bed1): study cave ----
  GU.bed(g, 1.15, 9.0, Math.PI / 2, { w: 1.4, made: false, sheet: GU.mat('#ffffff', GU.tex.floral('#ffb4a2', '#6d597a')), pillow: '#f4f1e6' });
  GU.nightstand(g, 0.38, 7.85, Math.PI / 2, { top: ['glasses', 'water_bottle', 'phone'], drawers: [['phone_charger', 'pain_reliever'], ['book3']] });
  GU.desk(g, 3.9, 11.5, Math.PI, { w: 1.4, top: ['laptop', 'textbook', 'textbook', 'mug', 'plant_small', 'energy'], drawer: ['pen', 'pen', 'tape', 'scissors', 'batteries'], chairColor: '#6d597a' });
  GU.bookshelf(g, 4.75, 8.4, -Math.PI / 2, { w: 0.9, seed: 'priya', contents: [['textbook', 'textbook', 'textbook'], [], ['plant_small', 'plant_small', 'plant_small'], [], []] });
  GU.wardrobe(g, 1.6, 6.4, 0, { w: 1.1, floor: ['sneakers', 'slippers'], shelf: ['makeup_bag'], clothes: ['#ffb4a2', '#6d597a', '#ffffff', '#e63946'] });
  GU.plant(g, 0.5, 11.4, { s: 1.0 });
  GU.plant(g, 2.6, 11.4, { s: 0.8, pot: '#6d597a' });
  A.mess([1.0, 10.0, 3.0, 11.0], ['laundry_pile2', 'textbook', 'socks', 'slippers'], 1);
  GU.art(g, 0.13, 2.3, 9.0, Math.PI / 2, 0.8, 0.5, 'abstract', 63);

  // ---- Kevin's room (bed2): gaming den ----
  GU.bed(g, 12.85, 9.4, -Math.PI / 2, { w: 1.4, made: false, sheet: GU.mat('#ffffff', GU.tex.fabric('#3d405b')), pillow: '#bdbdbd', frame: GU.mat('#ffffff', GU.tex.paint('#222222')), headH: 0.35 });
  const deskK = GU.desk(g, 9.6, 11.5, Math.PI, { w: 1.6, top: ['energy', 'energy', 'headphones', 'controller'], drawer: ['batteries', 'lighter', 'cigarettes'], chairColor: '#e63946', mat: GU.mat('#ffffff', GU.tex.paint('#111111')) });
  // two monitors + a glowing PC tower
  GU.box(deskK, 0.6, 0.36, 0.04, -0.35, 0.86, -0.15, GU.glow('#ffffff', GU.tex.screen(true)));
  GU.box(deskK, 0.6, 0.36, 0.04, 0.35, 0.86, -0.15, GU.glow('#ffffff', GU.tex.screen(true)));
  GU.box(deskK, 0.2, 0.45, 0.45, 0.55, 0, 0, GU.mat('#111'));
  GU.box(deskK, 0.01, 0.35, 0.3, 0.45, 0.05, 0, GU.glow('#ff2bd6'));
  GU.interactive(deskK, 'Look at computer', () => GU.say('Discord is open. 3,214 unread messages. A thesis draft titled "final_FINAL_v7.docx".'));
  // energy drink can pyramid
  const pyr = [];
  for (let r = 0; r < 4; r++) pyr.push(r);
  pyr.forEach((r) => GU.placeItems(g, 13.4 - 0.05, 0.161 * r, 7.2, 0.07 * (4 - r) + 0.01, 0.08, Array(4 - r).fill('energy'), { gap: 0.004 }));
  GU.art(g, 13.87, 2.0, 9.4, -Math.PI / 2, 1.0, 0.6, 'poster', 64);
  GU.art(g, 8.57, 2.1, 8.0, Math.PI / 2, 0.6, 0.8, 'poster', 65);
  A.mess([9.0, 7.0, 11.5, 10.5], ['laundry_pile', 'laundry_pile2', 'pizza_box', 'energy', 'energy', 'crushed_can', 'socks', 'sneakers', 'chip_bag_empty', 'fast_food_bag'], 4);

  A.finish();
});
