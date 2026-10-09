// Apt 103 (studio) — Jess Morales, 29, ER nurse on night shift. Blackout curtains, scrubs, coffee.
// Small and fairly tidy, except for the coffee situation.
(function () {
  const P = (c, d) => GU.mat('#ffffff', GU.tex.paint(c, d));
  GU.unitDefs = GU.unitDefs || {};
  GU.unitDefs['103'] = {
    title: 'Jess (ER Nurse)', surname: 'Morales', dirt: 0.15,
    doormat: ['SHHH', '#8e9aaf'],
    mail: 'A nursing license renewal notice and a hospital parking ticket.',
    hallway(B, x, z) {
      const sign = GU.group(B, x + 0.75, 1.5, z > 0 ? 0.81 : -0.81, z > 0 ? Math.PI : 0);
      GU.box(sign, 0.3, 0.2, 0.01, 0, 0, 0, GU.mat('#ffffff', GU.tex.label('#ffffff', '#3a86ff', 'SLEEPING')), { unitUV: true });
      GU.interactive(sign, 'Read door sign', () => GU.say('"NIGHT SHIFT WORKER SLEEPING. PLEASE DON\'T KNOCK. Packages → leave by door."'));
    },
    theme: {
      main: { wall: P('#cbc0d3'), floor: GU.mat('#ffffff', GU.tex.wood('#9c6b3f')) },
      kitchen: { wall: P('#efd3d7'), floor: GU.mat('#ffffff', GU.tex.tile('#f2f2f2', '#c0c0c0', 0.3)) },
      bath: { wall: GU.mat('#ffffff', GU.tex.tile('#dee2ff', '#ffffff', 0.2)), floor: GU.mat('#ffffff', GU.tex.tile('#8e9aaf', '#ffffff', 0.25)) },
      doorColor: '#8e9aaf', innerDoor: '#f4f1e6', cabinet: P('#feeafa'), counter: GU.mat('#ffffff', GU.tex.granite('#f2f2f2')),
      mainCurtains: '#1b1b2f', blinds: 1.0, lightColor: '#fff0e0',
    },
    build(u) {
      const g = u.g, rng = u.rng;
      u.kitchen({
        fridge: [['oatmilk', 'greek_yogurt', 'meal_prep'], ['eggs', 'hummus', 'string_cheese'], ['energy', 'water_bottle', 'water_bottle']],
        crisper: ['carrots', 'apple', 'avocado'],
        fridgeDoor: [['sriracha', 'mustard'], ['seltzer', 'seltzer', 'seltzer'], ['oatmilk']],
        freezer: [['frozen_burrito', 'frozen_peas'], ['ice_cream']],
        magnets: ['photo', 'kid'],
        drawers: [['fork', 'fork', 'spoon', 'butter_knife', 'chef_knife', 'paring_knife'], ['scissors', 'pen', 'batteries', 'takeout_menus', 'keys'], ['dish_towel', 'ziploc', 'foil']],
        sink: ['bleach', 'all_purpose', 'disinfect_wipes', 'sponge', 'gloves', 'trash_bags'],
        dishes: ['mug', 'mug2', 'spoon'],
        cabs: [[['coffee', 'coffee', 'coffee'], ['tea', 'chamomile', 'granola_bars']]],
        uppers: [[['salt', 'pepper', 'cinnamon', 'cumin', 'garlic_powder'], ['plate', 'plate', 'bowl']], [['mug', 'mug2', 'mug3', 'glass'], ['vitamins']], [['cup_noodles', 'cup_noodles'], ['oatmeal']]],
        counter: [['coffee', 'mug']],
        stoveTop: ['pan'], microwave: [['meal_prep', { desc: 'Leftover chicken and rice. Her 3 AM "lunch".' }]], toaster: false, knives: false,
        trashMsg: 'Empty coffee pods. Dozens of them.',
      });
      u.bathroom({
        ledge: ['shampoo', 'conditioner', 'body_wash2'], under: ['toilet_paper_pack', 'toilet_cleaner', 'rubbing_alcohol', 'peroxide'],
        counter: ['hand_soap', 'toothbrush2', 'toothpaste', 'lotion'],
        medicine: [['acetaminophen', 'pain_reliever', 'bandaids'], ['makeup_bag', 'floss'], ['vitamins', ['prescription', { name: 'Melatonin', desc: 'Sleep aid. For sleeping during the day.' }]]],
        floor: ['slippers'], matColor: '#8e9aaf',
      });
      u.closets([{ floor: ['sneakers', 'sneakers', 'slippers'], shelf: ['towel', 'towel'], clothes: ['#3fa7a3', '#3fa7a3', '#3fa7a3', '#8e9aaf', '#1b1b2f'] }]);

      // main room: bed in the back corner, loveseat + TV, small table
      GU.bed(g, 5.33, 8.6, -Math.PI / 2, { w: 1.4, sheet: GU.mat('#ffffff', GU.tex.fabric('#8e9aaf')), pillow: '#ffffff', frame: P('#1b1b2f') });
      GU.placeItems(g, 5.6, 0.56, 8.2, 0.3, 0.3, [['glasses', { name: 'Sleep Mask', desc: 'Blackout sleep mask.' }]]);
      GU.nightstand(g, 6.12, 7.35, -Math.PI / 2, { mat: P('#1b1b2f'), top: ['alarm_clock', 'water_bottle'], drawers: [['phone_charger', 'headphones'], ['book3']] });
      GU.tvStand(g, 0.36, 7.0, Math.PI / 2, { w: 1.2, tvW: 1.0, show: 'A medical drama. She keeps yelling "that\'s not how intubation works".', inside: [['book', 'book2']] });
      GU.sofa(g, 2.7, 7.0, -Math.PI / 2, { w: 1.6, color: '#3fa7a3', cushions: 2, pillows: ['#cbc0d3'], blanket: GU.tex.plaid('#1b1b2f', '#cbc0d3') });
      GU.table(g, 1.6, 5.3, 0, { w: 0.8, d: 0.7, top: ['mug', 'textbook', 'laptop'], chairs: [[0, 0.5, Math.PI]] });
      GU.dresser(g, 3.4, 9.6, Math.PI, { w: 1.0, top: [['tissues', {}], 'candle', 'perfume'], drawers: [['shirt', 'socks'], ['sweater'], ['jeans'], ['towel']] });
      GU.laundryBasket(g, 4.4, 9.5, '#3fa7a3');
      GU.plant(g, 0.5, 9.4, { s: 0.9 });
      GU.coatHooks(g, 1.45, 1.7, 0.13, 0, ['#3fa7a3', '#1b1b2f']);
      GU.placeItems(g, 1.45, 0, 0.45, 0.6, 0.3, ['sneakers']);
      GU.art(g, 3.2, 2.0, 9.85, Math.PI, 0.6, 0.45, 'photo', 71);
      GU.art(g, 0.16, 2.1, 5.4, Math.PI / 2, 0.5, 0.5, 'landscape', 72);
      u.mess([2.0, 5.5, 4.0, 6.0], ['mug', 'mug2'], 0);
    },
  };
})();
