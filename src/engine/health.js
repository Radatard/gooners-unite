// Player health: taking damage, getting shoved, getting covered in sludge, dying and respawning.
// GU.hurtPlayer(amount, { push, slime, shake }) is the one thing monsters call.
(function () {
  const MAX = 100;
  const $ = (id) => document.getElementById(id);
  let lastHurt = -99, flash = 0, slime = 0, deadT = 0;
  GU.dead = false;
  GU.playerHealth = { hp: MAX, max: MAX };

  // push: shove velocity (m/s, world space). slime: seconds you're slowed. shake: screen shake.
  GU.hurtPlayer = function (amount, o) {
    o = o || {};
    if (GU.dead) return;
    const P = GU.player, h = GU.playerHealth;
    h.hp = Math.max(0, h.hp - amount);
    lastHurt = performance.now() / 1000;
    flash = Math.min(1, flash + 0.2 + amount / 30);
    if (o.push) P.kb.add(o.push);
    if (o.slime) { slime = Math.min(1, slime + 0.3); P.slow = Math.max(P.slow, o.slime); }
    if (GU.shake) GU.shake(o.shake != null ? o.shake : 0.2 + amount / 25);
    if (amount >= 3) GU.sfx('oof', Math.min(1, 0.4 + amount / 20));
    if (h.hp <= 0) die();
  };

  function die() {
    GU.dead = true;
    deadT = 0;
    GU.sfx('roar', 0.6);
    if ($('dead')) $('dead').style.display = 'flex';
  }

  function respawn() {
    const P = GU.player, h = GU.playerHealth;
    GU.dead = false;
    h.hp = MAX;
    slime = 0;
    P.slow = 0;
    P.kb.set(0, 0, 0);
    P.pos.set(0, 0, -8.5);
    P.yaw = Math.PI;
    P.pitch = 0;
    if ($('dead')) $('dead').style.display = 'none';
    GU.say('You wake up in the lobby. You smell like garbage.', 3);
  }

  GU.updaters.push((dt) => {
    const h = GU.playerHealth, now = performance.now() / 1000;
    if (GU.dead) { deadT += dt; if (deadT > 3.5) respawn(); }
    else if (now - lastHurt > 6 && h.hp < h.max) h.hp = Math.min(h.max, h.hp + 4 * dt); // catch your breath
    flash = Math.max(0, flash - dt * 1.5);
    slime = Math.max(0, slime - dt * 0.12);
    const bar = $('hp');
    if (bar && bar.firstChild) {
      bar.firstChild.style.width = (h.hp / h.max * 100).toFixed(1) + '%';
      bar.lastChild.textContent = Math.ceil(h.hp);
      bar.className = 'hud' + (h.hp < 30 ? ' low' : '');
    }
    if ($('hurt')) $('hurt').style.opacity = GU.dead ? 0.8 : (flash * 0.8).toFixed(2);
    if ($('slime')) $('slime').style.opacity = slime.toFixed(2);
  });
})();
