// Procedural low-res pixel textures. No image files needed.
// Every function is cached, so calling GU.tex.wood('#a0522d') twice returns the same texture.
(function () {
  const cache = new Map();

  function rgb(hex) {
    const c = new THREE.Color(hex);
    return [c.r * 255, c.g * 255, c.b * 255];
  }
  const clamp = (v) => (v < 0 ? 0 : v > 255 ? 255 : v | 0);

  // meters = [w, h] size in meters that one copy of the texture covers
  function make(key, w, h, meters, draw) {
    let t = cache.get(key);
    if (t) return t;
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    const ctx = c.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    draw(ctx, w, h, GU.makeRng(GU.hash(key)));
    t = new THREE.CanvasTexture(c);
    t.magFilter = THREE.NearestFilter;
    t.minFilter = THREE.NearestMipmapNearestFilter;
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.colorSpace = THREE.SRGBColorSpace;
    if (meters) t.repeat.set(1 / meters[0], 1 / meters[1]);
    cache.set(key, t);
    return t;
  }

  // Per-pixel painter: fn(x, y, rng) returns [r, g, b]
  function pixels(ctx, w, h, rng, fn) {
    const img = ctx.getImageData(0, 0, w, h);
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const p = fn(x, y, rng);
        const i = (y * w + x) * 4;
        img.data[i] = clamp(p[0]); img.data[i + 1] = clamp(p[1]); img.data[i + 2] = clamp(p[2]); img.data[i + 3] = 255;
      }
    }
    ctx.putImageData(img, 0, 0);
  }

  function jitter(c, rng, amt) {
    const n = (rng() - 0.5) * amt;
    return [c[0] + n, c[1] + n, c[2] + n];
  }

  // Dark blotches and specks for dirty homes. amount 0..1
  function grime(ctx, w, h, rng, amount) {
    if (!amount) return;
    const blots = Math.floor(amount * 9);
    for (let i = 0; i < blots; i++) {
      const x = rng() * w, y = rng() * h, r = 2 + rng() * w * 0.18;
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      const tone = rng() < 0.5 ? '60,45,20' : '30,30,25';
      g.addColorStop(0, `rgba(${tone},${0.35 * amount + 0.1})`);
      g.addColorStop(1, `rgba(${tone},0)`);
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
    }
    ctx.fillStyle = `rgba(20,15,5,${0.5 * amount})`;
    for (let i = 0; i < amount * w * h * 0.03; i++) ctx.fillRect((rng() * w) | 0, (rng() * h) | 0, 1, 1);
  }

  const T = (GU.tex = {});

  T.paint = (color, dirt) => make('paint' + color + (dirt || 0), 32, 32, [1, 1], (ctx, w, h, rng) => {
    const c = rgb(color);
    pixels(ctx, w, h, rng, (x, y, r) => jitter(c, r, 10));
    grime(ctx, w, h, rng, dirt);
  });

  T.wood = (color, dirt) => make('wood' + color + (dirt || 0), 64, 64, [1.2, 1.2], (ctx, w, h, rng) => {
    const c = rgb(color);
    const rows = 8, rh = h / rows;
    const tones = [], offs = [];
    for (let i = 0; i < rows; i++) { tones.push((rng() - 0.5) * 40); offs.push((rng() * w) | 0); }
    pixels(ctx, w, h, rng, (x, y, r) => {
      const row = Math.floor(y / rh);
      const t = tones[row];
      const grain = Math.sin((x + offs[row]) * 0.35 + Math.sin(y * 1.7) * 2) * 8;
      const seam = (y % rh === 0) || ((x + offs[row]) % w === 0) ? -45 : 0;
      return jitter([c[0] + t + grain + seam, c[1] + t + grain + seam, c[2] + t * 0.8 + grain + seam], r, 8);
    });
    grime(ctx, w, h, rng, dirt);
  });

  T.tile = (color, grout, size, dirt) => make('tile' + color + grout + size + (dirt || 0), 32, 32, [size || 0.6, size || 0.6], (ctx, w, h, rng) => {
    const c = rgb(color), g = rgb(grout || '#999999');
    pixels(ctx, w, h, rng, (x, y, r) => {
      const edge = (x % 16 === 0) || (y % 16 === 0);
      return edge ? jitter(g, r, 10) : jitter(c, r, 8);
    });
    grime(ctx, w, h, rng, dirt);
  });

  T.checker = (c1, c2, size, dirt) => make('chk' + c1 + c2 + size + (dirt || 0), 32, 32, [size || 0.6, size || 0.6], (ctx, w, h, rng) => {
    const a = rgb(c1), b = rgb(c2);
    pixels(ctx, w, h, rng, (x, y, r) => jitter(((x >> 4) + (y >> 4)) % 2 ? a : b, r, 8));
    grime(ctx, w, h, rng, dirt);
  });

  T.carpet = (color, dirt) => make('carpet' + color + (dirt || 0), 32, 32, [0.8, 0.8], (ctx, w, h, rng) => {
    const c = rgb(color);
    pixels(ctx, w, h, rng, (x, y, r) => jitter(c, r, 34));
    grime(ctx, w, h, rng, dirt);
  });

  T.stripes = (c1, c2, dirt) => make('stripe' + c1 + c2 + (dirt || 0), 32, 32, [0.6, 0.6], (ctx, w, h, rng) => {
    const a = rgb(c1), b = rgb(c2);
    pixels(ctx, w, h, rng, (x, y, r) => jitter(x % 8 < 4 ? a : b, r, 8));
    grime(ctx, w, h, rng, dirt);
  });

  T.floral = (bg, fg, dirt) => make('floral' + bg + fg + (dirt || 0), 32, 32, [0.5, 0.5], (ctx, w, h, rng) => {
    const a = rgb(bg);
    pixels(ctx, w, h, rng, (x, y, r) => jitter(a, r, 8));
    ctx.fillStyle = fg;
    const spots = [[6, 6], [22, 14], [10, 24], [26, 28]];
    for (const [x, y] of spots) {
      ctx.fillRect(x - 1, y, 3, 1); ctx.fillRect(x, y - 1, 1, 3);
    }
    ctx.fillStyle = '#5a8a4a';
    for (const [x, y] of spots) ctx.fillRect(x + 1, y + 2, 1, 2);
    grime(ctx, w, h, rng, dirt);
  });

  T.granite = (color) => make('granite' + color, 32, 32, [0.7, 0.7], (ctx, w, h, rng) => {
    const c = rgb(color);
    pixels(ctx, w, h, rng, (x, y, r) => {
      const s = r();
      return s < 0.08 ? [c[0] - 70, c[1] - 70, c[2] - 70] : s > 0.94 ? [c[0] + 50, c[1] + 50, c[2] + 50] : jitter(c, r, 14);
    });
  });

  T.fabric = (color) => make('fabric' + color, 16, 16, [0.3, 0.3], (ctx, w, h, rng) => {
    const c = rgb(color);
    pixels(ctx, w, h, rng, (x, y, r) => jitter((x + y) % 2 ? c : [c[0] - 14, c[1] - 14, c[2] - 14], r, 10));
  });

  T.plaid = (c1, c2) => make('plaid' + c1 + c2, 32, 32, [0.5, 0.5], (ctx, w, h, rng) => {
    const a = rgb(c1), b = rgb(c2);
    pixels(ctx, w, h, rng, (x, y, r) => {
      const v = (x % 16 < 4 ? 1 : 0) + (y % 16 < 4 ? 1 : 0);
      const m = v === 0 ? a : v === 1 ? [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2] : b;
      return jitter(m, r, 8);
    });
  });

  T.brick = (color, dirt) => make('brick' + color + (dirt || 0), 32, 32, [0.8, 0.8], (ctx, w, h, rng) => {
    const c = rgb(color);
    pixels(ctx, w, h, rng, (x, y, r) => {
      const row = y >> 3, off = row % 2 ? 8 : 0;
      const mortar = y % 8 === 0 || (x + off) % 16 === 0;
      return mortar ? jitter([200, 195, 185], r, 10) : jitter(c, r, 26);
    });
    grime(ctx, w, h, rng, dirt);
  });

  T.metal = (color) => make('metal' + color, 16, 16, [0.4, 0.4], (ctx, w, h, rng) => {
    const c = rgb(color);
    pixels(ctx, w, h, rng, (x, y, r) => jitter([c[0] + Math.sin(y * 2) * 6, c[1] + Math.sin(y * 2) * 6, c[2] + Math.sin(y * 2) * 6], r, 12));
  });

  T.ceiling = (dirt) => make('ceil' + (dirt || 0), 32, 32, [1, 1], (ctx, w, h, rng) => {
    pixels(ctx, w, h, rng, (x, y, r) => jitter([238, 236, 228], r, 22));
    grime(ctx, w, h, rng, (dirt || 0) * 0.6);
  });

  T.sky = () => make('sky', 32, 64, null, (ctx, w, h, rng) => {
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, '#3c8dff'); g.addColorStop(0.7, '#9fd4ff'); g.addColorStop(1, '#ffe6b0');
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#ffffff';
    for (let i = 0; i < 5; i++) { const x = rng() * w, y = 8 + rng() * 30; ctx.fillRect(x, y, 8 + rng() * 10, 3); ctx.fillRect(x + 3, y - 2, 6, 2); }
    ctx.fillStyle = '#4c9a52';
    for (let x = 0; x < w; x++) ctx.fillRect(x, h - 6 - ((Math.sin(x * 0.5) * 3) | 0) - (rng() * 2 | 0), 1, 12);
  });

  T.mirror = () => make('mirror', 16, 32, null, (ctx, w, h) => {
    const g = ctx.createLinearGradient(0, 0, w, h);
    g.addColorStop(0, '#cfe6f2'); g.addColorStop(0.5, '#9fbccc'); g.addColorStop(1, '#e8f4fa');
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    for (let i = 0; i < 3; i++) ctx.fillRect(3 + i * 4, 0, 1, h);
  });

  T.stain = (tone) => make('stain' + tone, 32, 32, null, (ctx, w, h, rng) => {
    for (let i = 0; i < 4; i++) {
      const x = 8 + rng() * 16, y = 8 + rng() * 16, r = 5 + rng() * 9;
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, `rgba(${tone},0.75)`); g.addColorStop(1, `rgba(${tone},0)`);
      ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    }
  });

  T.rug = (c1, c2, c3) => make('rug' + c1 + c2 + c3, 32, 32, null, (ctx, w, h, rng) => {
    const a = rgb(c1), b = rgb(c2), d = rgb(c3);
    pixels(ctx, w, h, rng, (x, y, r) => {
      const bx = Math.min(x, w - 1 - x), by = Math.min(y, h - 1 - y);
      if (bx < 2 || by < 2) return jitter(b, r, 14);
      const dx = Math.abs(x - w / 2), dy = Math.abs(y - h / 2);
      if (Math.abs(dx + dy - 9) < 2) return jitter(d, r, 14);
      return jitter(a, r, 14);
    });
  });

  // Kids' play rug with roads
  T.roadRug = () => make('roadrug', 32, 32, null, (ctx, w, h, rng) => {
    pixels(ctx, w, h, rng, (x, y, r) => {
      if ((x > 13 && x < 19) || (y > 13 && y < 19)) return (x === 16 || y === 16) && ((x + y) % 4 < 2) ? [255, 230, 80] : jitter([90, 90, 100], r, 10);
      if ((x - 6) * (x - 6) + (y - 6) * (y - 6) < 12) return [60, 140, 255];
      return jitter([80, 190, 90], r, 16);
    });
    ctx.fillStyle = '#e04040'; ctx.fillRect(22, 4, 6, 5); ctx.fillStyle = '#ffffff'; ctx.fillRect(4, 22, 6, 5);
  });

  // Paintings / photos / kid drawings. style: 'abstract' | 'landscape' | 'kid' | 'photo' | 'poster'
  T.art = (style, seed) => make('art' + style + seed, 32, 32, null, (ctx, w, h, rng) => {
    const pal = ['#ff4d6d', '#ffb703', '#3a86ff', '#06d6a0', '#8338ec', '#fb5607', '#ffffff', '#222222'];
    if (style === 'landscape') {
      const g = ctx.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#ff9e6d'); g.addColorStop(0.6, '#ffd36d'); ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#ffef9a'; ctx.beginPath(); ctx.arc(22, 12, 5, 0, 7); ctx.fill();
      ctx.fillStyle = '#5e4b8b'; ctx.beginPath(); ctx.moveTo(0, 24); ctx.lineTo(10, 12); ctx.lineTo(20, 22); ctx.lineTo(32, 14); ctx.lineTo(32, 32); ctx.lineTo(0, 32); ctx.fill();
      ctx.fillStyle = '#2f6b4f'; ctx.fillRect(0, 26, w, 6);
    } else if (style === 'kid') {
      ctx.fillStyle = '#fffdf5'; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#ffd400'; ctx.fillRect(2, 2, 6, 6);
      ctx.fillStyle = '#3cbf4a'; ctx.fillRect(0, 26, w, 6);
      ctx.fillStyle = GU.pick(rng, pal); ctx.fillRect(10, 14, 12, 10);
      ctx.fillStyle = '#e03030'; ctx.beginPath(); ctx.moveTo(8, 14); ctx.lineTo(16, 7); ctx.lineTo(24, 14); ctx.fill();
      ctx.fillStyle = '#222'; ctx.fillRect(25, 16, 1, 9); ctx.fillRect(23, 18, 5, 1); ctx.fillRect(24, 13, 3, 3);
    } else if (style === 'photo') {
      ctx.fillStyle = GU.pick(rng, ['#a7c7e7', '#c9e4c5', '#f5d0c5']); ctx.fillRect(0, 0, w, h);
      for (let i = 0; i < 2 + (rng() * 2 | 0); i++) {
        const x = 6 + i * 9;
        ctx.fillStyle = GU.pick(rng, ['#f1c27d', '#8d5524', '#e0ac69', '#c68642']); ctx.fillRect(x, 8, 6, 6);
        ctx.fillStyle = GU.pick(rng, pal); ctx.fillRect(x - 1, 14, 8, 18);
      }
    } else if (style === 'poster') {
      ctx.fillStyle = GU.pick(rng, ['#111', '#1b1b3a', '#3a0ca3']); ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = GU.pick(rng, pal); ctx.fillRect(4, 4, 24, 16);
      ctx.fillStyle = '#ffffff'; ctx.fillRect(4, 23, 24, 2); ctx.fillRect(8, 27, 16, 1);
    } else {
      ctx.fillStyle = GU.pick(rng, pal); ctx.fillRect(0, 0, w, h);
      for (let i = 0; i < 6; i++) { ctx.fillStyle = GU.pick(rng, pal); ctx.fillRect(rng() * w, rng() * h, 4 + rng() * 14, 4 + rng() * 14); }
    }
  });

  T.screen = (on) => make('screen' + on, 32, 24, null, (ctx, w, h, rng) => {
    if (!on) { ctx.fillStyle = '#0d0f12'; ctx.fillRect(0, 0, w, h); ctx.fillStyle = '#1c2228'; ctx.fillRect(2, 2, 10, 1); return; }
    const g = ctx.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#3fa9f5'); g.addColorStop(1, '#7cf57c');
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#ffe14d'; ctx.fillRect(4, 4, 10, 8);
    ctx.fillStyle = '#ff4d8d'; ctx.fillRect(18, 10, 9, 9);
    ctx.fillStyle = '#ffffff'; ctx.fillRect(2, h - 4, w - 4, 2);
  });

  // Product label: body color, a colored band with tiny text.
  T.label = (body, band, text, ink) => make('lbl' + body + band + text + (ink || ''), 32, 32, null, (ctx, w, h) => {
    ctx.fillStyle = body; ctx.fillRect(0, 0, w, h);
    if (band) { ctx.fillStyle = band; ctx.fillRect(0, 9, w, 14); }
    if (text) {
      ctx.fillStyle = ink || '#ffffff';
      ctx.font = 'bold 7px monospace';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(text.slice(0, 8), w / 2, 16);
    }
  });

  T.books = (seed) => make('books' + seed, 32, 16, null, (ctx, w, h, rng) => {
    let x = 0;
    while (x < w) {
      const bw = 2 + (rng() * 3 | 0);
      ctx.fillStyle = GU.pick(rng, ['#8c1c13', '#1d3557', '#2a9d8f', '#e9c46a', '#6a4c93', '#264653', '#f4a261', '#ececec']);
      const top = rng() * 4 | 0;
      ctx.fillRect(x, top, bw, h - top);
      ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.fillRect(x, top + 3, bw, 1);
      x += bw;
    }
  });
})();
