// Apt 108 (2 bed / 2 bath) — Priya Patel & Kevin Nguyen, grad-student roommates. Disgusting.
// Priya's room (the master) is a cluttered study cave with living plants; Kevin's is a gaming den.
(function () {
  const P = (c, d) => GU.mat('#ffffff', GU.tex.paint(c, d));
  GU.unitDefs = GU.unitDefs || {};
  GU.unitDefs['108'] = {
    title: 'Priya & Kevin (Roommates)', surname: 'Patel / Nguyen', dirt: 0.9,
    mail: 'Two overdue notices and a pizza coupon.',
    hallway(B, x, z) { GU.scatter(B, [x - 1.1, z * 0.6, x + 1.1, z * 0.95], ['sneakers', 'boots', 'slippers', 'sneakers'], GU.makeRng(108)); },
    theme: {
      living: { wall: P('#b8c480', 0.8), floor: GU.mat('#ffffff', GU.tex.carpet('#8d7b68', 0.9)) },
      hall: { wall: P('#b8c480', 0.8), floor: GU.mat('#ffffff', GU.tex.carpet('#8d7b68', 0.9)) },
      kitchen: { wall: P('#e6d690', 0.9), floor: GU.mat('#ffffff', GU.tex.checker('#e0d6b8', '#8d6e63', 0.3, 0.9)) },
      bed1: { wall: P('#ffb4a2', 0.4), floor: GU.mat('#ffffff', GU.tex.carpet('#6d597a', 0.6)) },
      bed2: { wall: P('#3a0ca3', 0.5), floor: GU.mat('#ffffff', GU.tex.carpet('#3d405b', 0.8)) },
      bath: { wall: GU.mat('#ffffff', GU.tex.tile('#e9edc9', '#a5a58d', 0.25, 0.9)), floor: GU.mat('#ffffff', GU.tex.tile('#c5d86d', '#6b705c', 0.3, 1)) },
      ensuite: { wall: GU.mat('#ffffff', GU.tex.tile('#e9edc9', '#a5a58d', 0.25, 0.6)), floor: GU.mat('#ffffff', GU.tex.tile('#c5d86d', '#6b705c', 0.3, 0.6)) },
      doorColor: '#6b705c', innerDoor: '#d6ccc2', cabinet: GU.mat('#ffffff', GU.tex.wood('#a68a64', 0.8)), counter: GU.mat('#ffffff', GU.tex.granite('#bfb48f')),
      lightColor: '#fff6b0', kitchenLight: '#e8ffb0', bathFlicker: true, blinds: 0.6,
    },
    build(u) {
      const g = u.g, rng = u.rng;
      u.kitchen({
        fridge: [['milk_expired', ['moldy_takeout', { desc: 'Nobody will claim it. It might be sentient.' }]], ['beer', 'beer', 'beer', 'beer', 'energy', 'energy'], [['eggs', { name: 'Eggs (2 left)', desc: 'Two eggs. Kevin\'s. Sticky note: "KEVIN\'S".' }], 'hummus']],
        crisper: [['carrots', { name: 'Soft Carrots', desc: 'They bend like rubber.' }]],
        fridgeDoor: [['ketchup', 'sriracha', 'soy_sauce'], ['ranch', 'hot_sauce'], ['oatmilk', 'soda']],
        freezer: [['ice_tray', 'nuggets'], ['frozen_pizza']],
        magnets: ['poster', 'kid'],
        drawers: [['fork', 'spoon', ['spoon', { desc: 'The last clean spoon.' }]], ['chef_knife', 'scissors'], [], ['spatula', 'can_opener'],
          ['lighter', 'batteries', 'takeout_menus', 'takeout_menus', 'pen', 'keys', 'phone_charger'], ['ziploc'], ['ping_pong', 'ping_pong'], [], []],
        sink: ['bug_spray', ['dish_soap', { desc: 'Watered down to make it last.' }], 'trash_bags', 'sponge_gross', 'bleach'],
        dishes: ['plate_dirty', 'plate_dirty', 'bowl_dirty', 'bowl_dirty', 'pan', 'pot', 'mug2', 'fork', 'solo_cup'],
        cabs: [[['solo_cup', 'solo_cup', 'solo_cup'], ['beer', 'beer']], [[], ['chips']]],
        uppers: [[['salt', 'pepper', 'msg', 'red_pepper_flakes', 'curry', 'cumin', 'chili_powder'], ['soy_sauce']], [['plate'], ['bowl']], [['solo_cup', 'mug'], ['glass']], [['ramen', 'ramen', 'ramen'], ['cup_noodles']], [[], []], [['energy', 'energy'], []]],
        pantry: [['rice', ['bread', { name: 'Moldy Bread', desc: 'Green spots on every slice.' }]], ['ramen', 'ramen', 'ramen', 'ramen', 'ramen'], ['cup_noodles', 'cup_noodles', 'mac_cheese', 'mac_cheese'], ['peanut_butter', 'chips', 'tortilla_chips'], ['coffee', 'energy']],
        counter: [['pizza_box'], ['fast_food_bag', 'bowl_dirty'], ['crushed_can', 'solo_cup']],
        stoveTop: [['pan', { name: 'Crusty Pan', desc: 'Eggs from... Monday? The week before?' }]], oven: [['pizza_box', { desc: 'They store pizza boxes in the oven. Fire hazard.' }]],
        microwave: [['cup_noodles', { desc: 'Splattered. The microwave walls are orange.' }]],
        trash: ['pizza_box', 'trash_bag_full', 'crushed_can', 'fast_food_bag'], trashMsg: 'Overflowing. There are fruit flies. So many fruit flies.', knives: false,
      });
      GU.placeItems(g, 2.4, 0, 4.4, 0.8, 0.5, ['trash_bag_full', 'trash_bag_full']);
      u.bathroom({
        ledge: ['shampoo', 'conditioner', 'two_in_one'], tub: ['towel_dirty'], under: ['toilet_paper', ['toilet_cleaner', { desc: 'Unopened.' }]],
        counter: ['toothbrush', ['toothpaste', { desc: 'Rolled to the very end. Nobody bought more.' }]], medicine: [['acetaminophen', 'cold_medicine'], ['razor'], ['deodorant']],
        floor: ['towel_dirty', 'laundry_pile'], matColor: '#6b705c',
      }, 'bath');
      u.bathroom({
        ledge: ['shampoo', 'conditioner', 'body_wash2'], under: ['toilet_paper_pack'], counter: ['hand_soap', 'toothbrush2', 'makeup_bag'],
        medicine: [['pain_reliever', 'vitamins'], ['floss', 'perfume'], ['deodorant2']], matColor: '#ffb4a2',
      }, 'ensuite');
      GU.stain(g, 6.3, 1.4, 0.8, '60,80,30');
      u.laundry({ washer: [['laundry_pile', { name: 'Mildewed Laundry', desc: 'Left in the washer for 4 days. Smells like a swamp.' }]], dryer: ['socks'] });
      u.closets([
        { floor: ['sneakers', 'slippers'], shelf: ['makeup_bag', 'textbook'], clothes: ['#ffb4a2', '#6d597a', '#ffffff', '#e63946'] },
        { floor: ['laundry_pile2', 'sneakers'], shelf: ['controller', 'headphones'], clothes: ['#222222', '#3a0ca3', '#555555'] },
      ]);

      // living room: beer pong + couch + console
      GU.tvStand(g, 3.67, 7.8, Math.PI / 2, { w: 1.4, tvW: 1.3, console: true, mat: GU.mat('#ffffff', GU.tex.wood('#6f4518', 0.6)), show: 'A nature documentary nobody is watching.', inside: [['controller', 'controller', 'board_game']], top: ['controller', 'energy'] });
      GU.sofa(g, 6.6, 7.8, -Math.PI / 2, { w: 2.1, color: '#c9a227', items: ['laundry_pile2', 'controller', 'chip_bag_empty'], blanket: GU.tex.plaid('#6d597a', '#3a0ca3') });
      GU.table(g, 5.1, 7.8, Math.PI / 2, { w: 1.1, d: 0.6, h: 0.45, mat: GU.mat('#ffffff', GU.tex.wood('#a68a64', 0.8)), top: ['pizza_box', 'beer', 'crushed_can', 'textbook', 'remote', 'cigarettes'], gap: 0.01, jitter: 1.2 });
      GU.table(g, 1.9, 3.0, Math.PI / 2, { w: 2.4, d: 0.6, mat: P('#ffffff', 0.7), top: ['solo_cup', 'solo_cup', 'solo_cup', 'solo_cup', 'solo_cup', 'solo_cup', 'ping_pong', 'solo_cup', 'solo_cup', 'solo_cup'], gap: 0.02 });
      GU.plant(g, 3.8, 9.5, { s: 1.2, dead: true });
      GU.art(g, 3.47, 2.3, 9.3, Math.PI / 2, 0.6, 0.85, 'poster', 61);
      u.mess([4.2, 5.4, 6.0, 9.6], ['pizza_box', 'pizza_box', 'crushed_can', 'crushed_can', 'crushed_can', 'beer', 'solo_cup', 'chip_bag_empty', 'fast_food_bag', 'laundry_pile', 'sneakers', 'textbook', 'socks', 'energy'], 6);
      u.mess([1.0, 1.0, 3.2, 4.6], ['crushed_can', 'solo_cup', 'ping_pong', 'pizza_box'], 3);

      // Priya's room (master)
      GU.bed(g, 9.33, 7.6, -Math.PI / 2, { w: 1.4, made: false, sheet: GU.mat('#ffffff', GU.tex.floral('#ffb4a2', '#6d597a')), pillow: '#f4f1e6' });
      GU.nightstand(g, 10.12, 6.5, -Math.PI / 2, { top: ['glasses', 'water_bottle', 'phone'], drawers: [['phone_charger', 'pain_reliever'], ['book3']] });
      GU.desk(g, 7.7, 8.6, Math.PI / 2, { w: 1.4, top: ['laptop', 'textbook', 'textbook', 'mug', 'plant_small', 'energy'], drawer: ['pen', 'pen', 'tape', 'scissors'], chairColor: '#6d597a' });
      GU.bookshelf(g, 10.2, 4.4, -Math.PI / 2, { w: 0.9, seed: 'priya', contents: [['textbook', 'textbook', 'textbook'], [], ['plant_small', 'plant_small', 'plant_small'], [], []] });
      GU.plant(g, 10.0, 9.5, { s: 1.0 });
      GU.plant(g, 7.7, 9.6, { s: 0.8, pot: '#6d597a' });
      u.mess([8.0, 3.6, 9.6, 5.8], ['laundry_pile2', 'textbook', 'socks', 'slippers'], 1);

      // Kevin's room (second bedroom): gaming den
      GU.bed(g, 1.1, 8.4, Math.PI / 2, { w: 1.4, made: false, sheet: GU.mat('#ffffff', GU.tex.fabric('#3d405b')), pillow: '#bdbdbd', frame: P('#222222'), headH: 0.35 });
      const deskK = GU.desk(g, 3.0, 7.4, -Math.PI / 2, { w: 1.6, top: ['energy', 'energy', 'headphones', 'controller'], drawer: ['batteries', 'lighter', 'cigarettes'], chairColor: '#e63946', mat: P('#111111') });
      GU.box(deskK, 0.6, 0.36, 0.04, -0.35, 0.86, -0.15, GU.glow('#ffffff', GU.tex.screen(true)));
      GU.box(deskK, 0.6, 0.36, 0.04, 0.35, 0.86, -0.15, GU.glow('#ffffff', GU.tex.screen(true)));
      GU.box(deskK, 0.2, 0.45, 0.45, 0.55, 0, 0, GU.mat('#111'));
      GU.box(deskK, 0.01, 0.35, 0.3, 0.45, 0.05, 0, GU.glow('#ff2bd6'));
      GU.interactive(deskK, 'Look at computer', () => GU.say('Discord: 3,214 unread messages. A thesis draft titled "final_FINAL_v7.docx".'));
      for (let r = 0; r < 4; r++) GU.placeItems(g, 0.6, 0.161 * r, 6.0, 0.07 * (4 - r) + 0.01, 0.08, Array(4 - r).fill('energy'), { gap: 0.004 });
      GU.art(g, 0.16, 2.0, 8.4, Math.PI / 2, 1.0, 0.6, 'poster', 64);
      u.mess([1.0, 5.9, 2.6, 7.4], ['laundry_pile', 'pizza_box', 'energy', 'crushed_can', 'socks', 'chip_bag_empty'], 3);
    },
  };
})();
