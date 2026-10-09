// Apt 105 (1 bed / 1 bath) — Marcus & Tasha Bell, just married, moved in two weeks ago.
// Moving boxes everywhere, wedding gifts still in the box, very clean.
(function () {
  const P = (c, d) => GU.mat('#ffffff', GU.tex.paint(c, d));
  const box = (g, x, z, label, ry, stackH) => {
    const b = GU.group(g, x, 0, z, ry || 0);
    for (let i = 0; i < (stackH || 1); i++) GU.box(b, 0.5, 0.4, 0.4, 0, i * 0.4, 0, GU.mat('#ffffff', GU.tex.label('#c49a6c', '#ffffff', label, '#333')), { unitUV: true });
    GU.prop(b, { move: 10, hp: 1, mat: 'paper', color: '#c49a6c', name: 'moving box' });
    GU.blocker(b, 0.5, 0.4 * (stackH || 1), 0.4, 0, 0, 0).userData.noRay = true;
    GU.interactive(b, 'Read box label', () => GU.say('Box marked "' + label + '" in Sharpie.'));
    return b;
  };
  GU.unitDefs = GU.unitDefs || {};
  GU.unitDefs['105'] = {
    title: 'Marcus & Tasha (Newlyweds)', surname: 'Bell', dirt: 0,
    doormat: ['MR & MRS', '#e9c46a'],
    mail: 'Six thank-you cards from relatives and a change-of-address confirmation.',
    hallway(B, x, z) { box(B, x + 1.1, z * 0.8, 'FREE', 0.2); },
    theme: {
      living: { wall: P('#f8f9fa'), floor: GU.mat('#ffffff', GU.tex.wood('#d4b483')) },
      hall: { wall: P('#f8f9fa'), floor: GU.mat('#ffffff', GU.tex.wood('#d4b483')) },
      kitchen: { wall: P('#e9f5db'), floor: GU.mat('#ffffff', GU.tex.tile('#ffffff', '#b5c99a', 0.4)) },
      bedroom: { wall: P('#cfe1b9'), floor: GU.mat('#ffffff', GU.tex.carpet('#e9e4d4')) },
      bath: { wall: GU.mat('#ffffff', GU.tex.tile('#ffffff', '#b5c99a', 0.2)), floor: GU.mat('#ffffff', GU.tex.tile('#718355', '#ffffff', 0.25)) },
      doorColor: '#718355', innerDoor: '#ffffff', cabinet: P('#718355'), counter: GU.mat('#ffffff', GU.tex.granite('#f4f1e6')),
      backsplash: GU.mat('#ffffff', GU.tex.tile('#ffffff', '#cfcfcf', 0.12)), livingCurtains: '#e9c46a', bedroomCurtains: '#ffffff', blinds: 0.1,
    },
    build(u) {
      const g = u.g, rng = u.rng;
      u.kitchen({
        fridge: [['milk', 'oj', ['wine', { name: 'Champagne', desc: 'Leftover from the wedding. Still has a bow on it.' }]], ['eggs', 'cheese', 'greek_yogurt', 'hummus'], [['leftovers', { name: 'Wedding Cake (top tier)', desc: 'Saved for their 1st anniversary. Wrapped in foil. Do not touch.' }]]],
        crisper: ['lettuce', 'tomato', 'avocado', 'lemon'],
        fridgeDoor: [['ketchup', 'mustard', 'mayo'], ['seltzer', 'seltzer'], ['oatmilk']],
        freezer: [['ice_cream', 'frozen_pizza'], ['ice_tray']],
        magnets: ['photo', 'photo'],
        drawers: [['fork', 'fork', 'spoon', 'spoon', 'butter_knife'], ['chef_knife', 'bread_knife', 'paring_knife', 'kitchen_shears'], ['dish_towel', 'oven_mitt'],
          ['spatula', 'whisk', 'tongs', 'ladle'], ['scissors', 'pen', 'tape', 'keys'], ['foil', 'plastic_wrap'], ['corkscrew'], [], []],
        sink: ['bleach', 'dish_soap', 'all_purpose', 'sponge', 'trash_bags'],
        cabs: [[['pot', 'pan'], ['cutting_board']], [['tupperware'], []]],
        uppers: [[['salt', 'pepper', 'garlic_powder', 'paprika', 'oregano'], []], [['plate', 'plate', 'plate'], ['bowl', 'bowl']], [['wine_glass', 'wine_glass', 'wine_glass', 'wine_glass'], ['mug', 'mug']], [[], []], [[], []], [['red_wine'], []]],
        pantry: [['rice', 'pasta'], ['cereal_bran', 'oatmeal'], ['soup', 'beans', 'tomatoes_can'], ['coffee', 'tea', 'olive_oil'], ['crackers', 'popcorn']],
        counter: [['paper_towels']],
        trashMsg: 'Tissue paper and gift wrap. So much gift wrap.',
      });
      u.bathroom({
        ledge: ['shampoo', 'conditioner', 'body_wash2', 'body_wash'], under: ['toilet_paper_pack', 'toilet_cleaner'],
        counter: ['hand_soap', 'toothbrush', 'toothbrush2', 'toothpaste'], medicine: [['pain_reliever', 'vitamins'], ['razor', 'shaving_cream', 'makeup_bag'], ['perfume', 'cologne', 'deodorant', 'deodorant2']],
        matColor: '#718355', towelColor: '#e9c46a',
      });
      u.laundry({ washer: [], dryer: [] });
      u.closets([{ floor: ['sneakers', 'slippers', 'boots'], shelf: [['board_game', { name: 'Wedding Album Box', desc: 'Unopened. The photographer\'s still editing.' }]], clothes: ['#ffffff', '#222222', '#e9c46a', '#718355'] }]);

      // living room: new couch, boxes still everywhere
      GU.tvStand(g, 0.36, 7.4, Math.PI / 2, { w: 1.4, tvW: 1.2, show: 'A home renovation show. They\'re taking notes.' });
      GU.sofa(g, 3.6, 7.4, -Math.PI / 2, { w: 2.0, color: '#e9e4d4', pillows: ['#718355', '#e9c46a'] });
      GU.rug(g, 2.0, 7.4, 2.2, 2.6, GU.tex.rug('#e9e4d4', '#718355', '#e9c46a'));
      GU.table(g, 2.2, 5.3, 0, { w: 1.0, d: 0.8, top: [['candle', { name: 'Wedding Candle', desc: 'Unity candle from the ceremony.' }], 'magazine'], chairs: [[-0.3, -0.55, 0], [0.3, 0.55, Math.PI]] });
      box(g, 0.6, 9.4, 'KITCHEN', 0.1, 2);
      box(g, 1.25, 9.5, 'BOOKS', -0.2);
      box(g, 3.7, 9.4, 'TASHA - FRAGILE', 0.3, 2);
      box(g, 2.1, 9.55, 'WEDDING GIFTS');
      const gift = GU.group(g, 2.7, 0, 9.4);
      GU.box(gift, 0.45, 0.3, 0.35, 0, 0, 0, GU.mat('#ffffff', GU.tex.label('#ffffff', '#e9c46a', 'MIXER', '#333')), { unitUV: true });
      GU.prop(gift, { move: 6, hp: 1, mat: 'paper', color: '#ffffff', name: 'stand mixer box' });
      GU.interactive(gift, 'Read gift tag', () => GU.say('"Congratulations! Love, Aunt Deb." A stand mixer they will never use.'));
      GU.art(g, 0.16, 2.0, 5.6, Math.PI / 2, 0.8, 0.55, 'photo', 81, '#ffffff');
      GU.plant(g, 4.0, 9.5, { s: 1.2, pot: '#ffffff' });
      // bedroom
      GU.bed(g, 6.83, 7.6, -Math.PI / 2, { w: 1.6, sheet: GU.mat('#ffffff', GU.tex.fabric('#ffffff')), pillow: '#e9c46a', frame: P('#718355') });
      GU.nightstand(g, 7.62, 6.5, -Math.PI / 2, { top: ['phone_charger', 'book3'], drawers: [['lotion'], []] });
      GU.nightstand(g, 7.62, 8.75, -Math.PI / 2, { top: ['alarm_clock', 'watch'], drawers: [['headphones'], []] });
      box(g, 4.85, 9.4, 'MARCUS CLOTHES', 0, 2);
      box(g, 4.85, 8.6, 'BATHROOM');
      GU.art(g, 7.85, 2.3, 7.6, -Math.PI / 2, 1.0, 0.6, 'landscape', 82, '#ffffff');
      GU.scatter(g, [5.0, 6.0, 5.8, 7.0], ['shirt2', 'hanger', 'hanger'], rng);
    },
  };
})();
