// Apt 106 (1 bed / 1 bath) — Sam Okafor, 34, painter. The living room is a studio:
// easels, canvases, paint on everything. Messy in a creative way.
(function () {
  const P = (c, d) => GU.mat('#ffffff', GU.tex.paint(c, d));
  const easel = (g, x, z, ry, seed) => {
    const e = GU.group(g, x, 0, z, ry);
    const wood = GU.mat('#ffffff', GU.tex.lumber('#c9a56e'));
    GU.box(e, 0.04, 1.7, 0.04, -0.3, 0, 0.1, wood, { rz: 0.12 });
    GU.box(e, 0.04, 1.7, 0.04, 0.3, 0, 0.1, wood, { rz: -0.12 });
    GU.box(e, 0.04, 1.6, 0.04, 0, 0, -0.35, wood, { rx: -0.25 });
    GU.box(e, 0.7, 0.04, 0.08, 0, 0.75, 0.12, wood);
    GU.box(e, 0.6, 0.75, 0.03, 0, 0.8, 0.14, GU.mat('#ffffff', GU.tex.art('abstract', seed)), { unitUV: true, rx: -0.08 });
    GU.prop(e, { move: 6, hp: 2, color: '#c9a56e', name: 'easel' });
    GU.blocker(e, 0.7, 1.6, 0.6, 0, 0, 0).userData.noRay = true;
    GU.interactive(e, 'Look at painting', () => GU.say(['A wild abstract in hot pink and teal. Still wet.', 'A half-finished portrait of Biscuit the cat.', 'Something that might be the building at sunset.'][seed % 3]));
    return e;
  };
  GU.unitDefs = GU.unitDefs || {};
  GU.unitDefs['106'] = {
    title: 'Sam (Painter)', surname: 'Okafor', dirt: 0.45,
    doormat: ['ART', '#ff4d6d'],
    mail: 'Gallery rejection letters (3) and an acceptance (1)! It\'s on the fridge now.',
    theme: {
      living: { wall: P('#fff3e6', 0.3), floor: GU.mat('#ffffff', GU.tex.wood('#a47148', 0.6)) },
      hall: { wall: P('#ffcad4', 0.2), floor: GU.mat('#ffffff', GU.tex.wood('#a47148', 0.5)) },
      kitchen: { wall: P('#ffd166', 0.3), floor: GU.mat('#ffffff', GU.tex.checker('#222222', '#ffffff', 0.3, 0.4)) },
      bedroom: { wall: P('#118ab2', 0.2), floor: GU.mat('#ffffff', GU.tex.carpet('#06d6a0', 0.4)) },
      bath: { wall: GU.mat('#ffffff', GU.tex.tile('#ef476f', '#ffffff', 0.2, 0.3)), floor: GU.mat('#ffffff', GU.tex.tile('#073b4c', '#ffffff', 0.25, 0.4)) },
      doorColor: '#ef476f', innerDoor: '#ffd166', cabinet: P('#06d6a0', 0.3), counter: GU.mat('#ffffff', GU.tex.granite('#ffffff')),
      lightColor: '#fff8f0', livingCurtains: '#ef476f', bedroomCurtains: '#073b4c', blinds: 0,
    },
    build(u) {
      const g = u.g, rng = u.rng;
      u.kitchen({
        fridge: [['oatmilk', ['leftovers', { name: 'Jar of Brush Water', desc: 'Murky gray. Do NOT drink. (It\'s in the fridge for some reason.)' }]], ['eggs', 'hummus', 'cheese'], ['beer', 'beer', 'seltzer']],
        crisper: ['avocado', 'lemon'],
        fridgeDoor: [['sriracha', 'hot_sauce'], ['seltzer'], ['oatmilk']],
        freezer: [['frozen_burrito', 'ice_cream'], []],
        magnets: ['kid', 'abstract', 'poster', 'abstract'],
        drawers: [['fork', 'spoon', 'butter_knife'], ['chef_knife', 'utility_knife', 'scissors'], ['dish_towel'], ['spatula', 'wooden_spoon'], ['tape', 'pen', 'pen', 'batteries', 'lighter'], ['ziploc', 'foil'],
          [['paint_can', { name: 'Acrylic Paint Tubes', desc: 'Titanium white is almost gone.' }]], ['rubber_bands'], []],
        sink: ['dish_soap', 'all_purpose', 'sponge_gross', 'trash_bags', 'bleach'],
        dishes: ['mug2', 'glass', ['bowl_dirty', { name: 'Paint Water Bowl', desc: 'Used for rinsing brushes. Also used for cereal. Gross.' }]],
        cabs: [[['pot'], ['pan']], [['tupperware', 'tupperware'], []]],
        uppers: [[['salt', 'pepper', 'curry', 'cumin', 'red_pepper_flakes'], []], [['plate', 'plate'], ['bowl']], [['mug', 'mug2', 'mug3'], ['glass']], [[], []], [['tea'], []], [[], []]],
        pantry: [['rice', 'beans'], ['granola_bars', 'crackers'], ['cup_noodles', 'ramen'], ['coffee', 'tea'], ['chips']],
        counter: [['mug2', 'paper_towels']],
        trashMsg: 'Crusty paint rags and an empty turpentine can. Fire hazard.',
      });
      u.bathroom({
        ledge: ['two_in_one', 'body_wash'], under: ['toilet_paper', 'toilet_cleaner'], counter: ['hand_soap', 'toothbrush', 'toothpaste'],
        medicine: [['pain_reliever'], ['razor'], ['deodorant']], floor: ['towel_dirty'], matColor: '#ffd166',
      });
      u.laundry({ washer: ['laundry_pile2'], dryer: [] });
      u.closets([{ floor: ['boots', 'sneakers'], shelf: ['shirt'], clothes: ['#ef476f', '#118ab2', '#ffd166', '#222222'] }]);

      // living room = art studio
      GU.rug(g, 2.2, 7.2, 3.6, 4.2, GU.tex.fabric('#e8e4d8'));
      for (let i = 0; i < 9; i++) GU.stain(g, GU.range(rng, 0.8, 3.8), GU.range(rng, 5.0, 9.4), 0.25 + rng() * 0.3, GU.pick(rng, ['239,71,111', '17,138,178', '255,209,102', '6,214,160']));
      easel(g, 1.4, 7.0, 0.4, 3);
      easel(g, 3.1, 8.6, -0.5, 4);
      GU.table(g, 2.3, 5.3, 0, { w: 1.4, d: 0.7, mat: P('#ffffff', 0.8), top: ['paint_can', 'paint_can', 'mug2', 'utility_knife', 'pickles', 'spackle'], gap: 0.05, chairs: [[0, 0.55, Math.PI]] });
      for (let i = 0; i < 5; i++) GU.art(g, 0.2, 0.72 + (i % 2) * 0.02, 6.0 + i * 0.35, Math.PI / 2 + 0.25, 0.5, 0.65, 'abstract', 90 + i, '#e9d8a6');
      GU.sofa(g, 3.7, 6.4, -Math.PI / 2, { w: 1.6, color: '#118ab2', cushions: 2, items: ['coloring_book'] });
      GU.floorLamp(g, 0.5, 9.4, '#ffffff');
      GU.plant(g, 4.0, 9.5, { s: 1.4, pot: '#ef476f' });
      u.mess([0.8, 5.0, 4.0, 9.4], ['paint_can', 'shirt', 'mug2', 'pizza_box'], 0);
      // bedroom
      GU.bed(g, 6.83, 7.6, -Math.PI / 2, { w: 1.4, made: false, sheet: GU.mat('#ffffff', GU.tex.fabric('#ffd166')), pillow: '#ef476f', frame: P('#073b4c') });
      GU.nightstand(g, 7.62, 6.5, -Math.PI / 2, { top: ['book', 'candle', 'glasses'], drawers: [['phone_charger'], ['book2']] });
      GU.art(g, 7.85, 2.2, 7.6, -Math.PI / 2, 1.2, 0.8, 'abstract', 99, '#222222');
      GU.dresser(g, 4.71, 8.4, Math.PI / 2, { w: 1.0, mat: P('#06d6a0', 0.3), top: ['plant_small', 'candle'], drawers: [['shirt', 'socks'], ['jeans'], ['sweater'], []] });
      u.mess([5.2, 5.8, 6.4, 9.4], ['laundry_pile2', 'shirt', 'sneakers'], 1);
    },
  };
})();
