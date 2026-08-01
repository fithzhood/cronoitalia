'use strict';

/* VoxScena — i diorami a cubi delle schede evento.
 *
 * Ogni evento apre una scenetta 3D in stile Minecraft: un plastico di blocchi
 * che gira lentamente sotto una luce radente. Ci sono sette scene generiche
 * (una per tipo di evento, variata da un generatore pseudocasuale seminato
 * sull'id, così un evento ha sempre la stessa) e una manciata di scene "firma"
 * costruite su misura per i fatti più noti.
 *
 * Due mesh soltanto, per reggere anche sul telefono:
 *   - i blocchi fermi finiscono in una geometria unica con colori per vertice,
 *     costruita una volta all'apertura della scheda;
 *   - i blocchi che si muovono (fuoco, onde, soldati, cenere) sono InstancedMesh
 *     raggruppate per colore, di cui ogni frame si aggiornano solo le matrici.
 *
 * `VoxScena.smoke()` in console costruisce tutte le scene a più istanti e
 * riporta gli errori: da rifare dopo ogni modifica.
 */

const VoxScena = (() => {

/* ---------------- tavolozza ---------------- */

const P = {
  erba: 0x6a9e46, erbaScura: 0x557f38, terra: 0x8a6a44, terraScura: 0x6b5133,
  pietra: 0x8b8b8b, pietraScura: 0x6f6f6f, pietraChiara: 0xa9a9a4,
  sabbia: 0xdcc48c, roccia: 0x77706a,
  acqua: 0x2f6fbf, acquaChiara: 0x4a8fd4, mare: 0x1f4f8f,
  legno: 0x9a6a3c, tronco: 0x6f4a28, foglie: 0x4c7a34, foglieScure: 0x3b6128,
  neve: 0xeef3f8, ghiaccio: 0xbfd8ea,
  marmo: 0xe6e2d8, marmoOmbra: 0xc9c4b6, tetto: 0xb0503a, cotto: 0xa8543c,
  oro: 0xd9b44a, ferro: 0xc9cdd2, bronzo: 0xa07840,
  rosso: 0xb03a30, nero: 0x2a2a2e, grigio: 0x565a60,
  fuoco: 0xe8703a, brace: 0xf2b23a, lava: 0xd2452a,
  cenere: 0x6b6660, fumo: 0x8f8a86, polvere: 0xb5aa9a,
  tela: 0xd8cfb8, pelle: 0xc99a72, blu: 0x3a5fa8, viola: 0x7b5ea8,
  verdeIt: 0x3f9e5e, biancoIt: 0xf0f0ee, rossoIt: 0xc23b2f,
};

/* ---------------- generatore pseudocasuale ---------------- */

function seme(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
function rngDa(s) {
  let a = s;
  return function () {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

/* ---------------- costruttore di blocchi ---------------- */

function Mondo() { this.b = []; }
Mondo.prototype.p = function (x, y, z, c, s) {
  if (this.b.length < 6000) this.b.push({ x, y, z, c, s: s || 1 });
};
Mondo.prototype.box = function (x0, y0, z0, w, h, d, c) {
  for (let x = 0; x < w; x++) for (let y = 0; y < h; y++) for (let z = 0; z < d; z++)
    this.p(x0 + x, y0 + y, z0 + z, c);
};
// Scatola vuota: solo le pareti, per non sprecare blocchi invisibili.
Mondo.prototype.guscio = function (x0, y0, z0, w, h, d, c) {
  for (let x = 0; x < w; x++) for (let y = 0; y < h; y++) for (let z = 0; z < d; z++) {
    if (x > 0 && x < w - 1 && z > 0 && z < d - 1 && y < h - 1) continue;
    this.p(x0 + x, y0 + y, z0 + z, c);
  }
};
Mondo.prototype.colonna = function (x, z, y0, h, c) {
  for (let y = 0; y < h; y++) this.p(x, y0 + y, z, c);
};

/* Terreno: una piastra quadrata con qualche dosso, più uno strato sotto. */
function suolo(m, R, cSopra, cSotto, rng, rilievo) {
  rilievo = rilievo || 0;
  for (let x = -R; x <= R; x++) for (let z = -R; z <= R; z++) {
    const h = rilievo ? Math.round(rilievo * (Math.sin(x * .5) * .5 + Math.cos(z * .45) * .5 + rng() * .4)) : 0;
    m.p(x, h, z, cSopra);
    m.p(x, h - 1, z, cSotto);
  }
}

function albero(m, x, z, y, rng) {
  const h = 3 + Math.floor(rng() * 2);
  for (let i = 1; i <= h; i++) m.p(x, y + i, z, P.tronco);
  for (let dx = -1; dx <= 1; dx++) for (let dz = -1; dz <= 1; dz++) for (let dy = 0; dy < 2; dy++) {
    if (Math.abs(dx) + Math.abs(dz) === 2 && dy === 1) continue;
    m.p(x + dx, y + h + dy, z + dz, dy ? P.foglieScure : P.foglie);
  }
  m.p(x, y + h + 2, z, P.foglie);
}

/* Casetta con tetto a due falde: il mattoncino base di mezze scene. */
function casa(m, x0, z0, w, d, h, cMuro, cTetto, y) {
  y = y || 1;
  m.guscio(x0, y, z0, w, h, d, cMuro);
  let falde = Math.ceil(Math.min(w, d) / 2);
  for (let k = 0; k < falde; k++) {
    for (let x = x0 + k; x < x0 + w - k; x++) for (let z = z0 + k; z < z0 + d - k; z++) {
      if (x > x0 + k && x < x0 + w - k - 1 && z > z0 + k && z < z0 + d - k - 1) continue;
      m.p(x, y + h + k, z, cTetto);
    }
  }
}

/* Omino di quattro blocchi: testa, corpo, due gambe accennate. */
function omino(d, x, y, z, cVeste, cPelle, s) {
  s = s || 1;
  d(x, y, z, s, cVeste);
  d(x, y + s, z, s, cVeste);
  d(x, y + s * 2, z, s * .9, cPelle);
}

/* ---------------- scene firma ---------------- */

const FIRMA = {

pompei(rng) {
  return {
    cielo: 0x2b1c1c, nebbia: 0x3a2622, raggio: 0xffd9a0, ambiente: .5,
    statici(m) {
      suolo(m, 12, P.cenere, P.terraScura, rng);
      // il cono del Vesuvio sul fondo, con la bocca aperta
      for (let y = 0; y < 9; y++) {
        const r = 7 - y * .75;
        for (let x = -r; x <= r; x++) for (let z = -r; z <= r; z++) {
          if (x * x + z * z > r * r) continue;
          if (y > 4 && x * x + z * z < (r - 1.4) * (r - 1.4)) continue;   // il cratere
          m.p(Math.round(x), y + 1, Math.round(z) - 9, y > 6 ? P.roccia : P.pietraScura);
        }
      }
      // la città, già mezza sepolta
      for (let i = 0; i < 5; i++) {
        const x = -7 + i * 3.4 | 0, z = 3 + (i % 2) * 3;
        casa(m, x, z, 3, 3, 2, P.cotto, P.tetto);
      }
      for (let x = -8; x <= 8; x++) m.p(x, 1, 1, P.pietraChiara);   // il decumano
      for (let i = 0; i < 4; i++) { m.colonna(-6 + i * 4, -2, 1, 4, P.marmo); m.p(-6 + i * 4, 5, -2, P.marmoOmbra); }
    },
    dinamici(d, t) {
      // colonna eruttiva che si allarga salendo, poi ricade in cenere
      for (let i = 0; i < 90; i++) {
        const f = ((t * .25 + i * .031) % 1);
        const h = 9 + f * 18;
        const r = .6 + f * f * 8;
        const a = i * 2.399 + t * .5;
        d(Math.cos(a) * r, h, -9 + Math.sin(a) * r * .7, 1 + f * 1.6,
          f < .25 ? P.lava : f < .5 ? P.fuoco : P.fumo);
      }
      for (let i = 0; i < 40; i++) {
        const f = ((t * .18 + i * .07) % 1);
        const a = i * 1.7;
        d(Math.cos(a) * (4 + i * .35), 24 - f * 22, -4 + Math.sin(a) * (3 + i * .3), .8, P.cenere);
      }
    },
  };
},

colosseo(rng) {
  return {
    cielo: 0x1d2a3a, raggio: 0xfff0d0,
    statici(m) {
      suolo(m, 11, P.sabbia, P.terra, rng);
      // anello ellittico su tre ordini di arcate
      for (let y = 0; y < 9; y++) {
        for (let a = 0; a < 64; a++) {
          const an = a / 64 * Math.PI * 2;
          const x = Math.round(Math.cos(an) * 9), z = Math.round(Math.sin(an) * 7);
          const arcata = (a % 4 === 0) && (y % 3 === 1 || y % 3 === 2);
          if (arcata) continue;                       // il vuoto dell'arco
          m.p(x, y + 1, z, y % 3 === 0 ? P.marmoOmbra : P.marmo);
        }
      }
      // gradinate e arena
      for (let a = 0; a < 56; a++) {
        const an = a / 56 * Math.PI * 2;
        m.p(Math.round(Math.cos(an) * 7), 2, Math.round(Math.sin(an) * 5.4), P.pietraChiara);
        m.p(Math.round(Math.cos(an) * 5.5), 1, Math.round(Math.sin(an) * 4.2), P.pietraChiara);
      }
      for (let x = -4; x <= 4; x++) for (let z = -3; z <= 3; z++)
        if (x * x / 16 + z * z / 9 <= 1) m.p(x, 1, z, P.sabbia);
    },
    dinamici(d, t) {
      // due gladiatori che si girano attorno, e il velario che ondeggia
      const a = t * .8;
      omino(d, Math.cos(a) * 2.2, 2, Math.sin(a) * 1.6, P.ferro, P.pelle);
      omino(d, Math.cos(a + Math.PI) * 2.2, 2, Math.sin(a + Math.PI) * 1.6, P.rosso, P.pelle);
      for (let i = 0; i < 26; i++) {
        const an = i / 26 * Math.PI * 2;
        d(Math.cos(an) * 9.6, 10.4 + Math.sin(t * 1.6 + i * .5) * .35, Math.sin(an) * 7.6, 1.1, P.tela);
      }
    },
  };
},

'roma-fondazione'(rng) {
  return {
    cielo: 0x26303f, raggio: 0xffe0a8,
    statici(m) {
      suolo(m, 10, P.erba, P.terra, rng, 1.6);
      for (let i = 0; i < 5; i++) {                 // capanne sul Palatino
        const x = -4 + (i % 3) * 4, z = -3 + Math.floor(i / 3) * 5;
        m.guscio(x, 2, z, 3, 2, 3, P.legno);
        for (let k = 0; k < 2; k++) for (let dx = k; dx < 3 - k; dx++) for (let dz = k; dz < 3 - k; dz++)
          m.p(x + dx, 4 + k, z + dz, P.tetto);
      }
      for (let z = -9; z <= 9; z++) albero(m, 9, z % 4 === 0 ? z : z + 1, 1, rng);
    },
    dinamici(d, t) {
      // il solco dell'aratro che si allunga, e i buoi che tirano
      const avanti = (t * 2.2) % 20 - 10;
      for (let x = -10; x < avanti; x++) d(x, 1.6, 6, .9, P.terraScura);
      omino(d, avanti, 2, 6, P.tela, P.pelle);
      d(avanti + 1.4, 2, 5.4, 1.2, P.terraScura);
      d(avanti + 1.4, 2, 6.6, 1.2, P.terraScura);
      for (let i = 0; i < 12; i++) {                // uccelli: gli auspici
        const a = t * .6 + i * .52;
        d(Math.cos(a) * (5 + i * .3), 9 + Math.sin(t * 1.4 + i) * .8, Math.sin(a) * (5 + i * .3), .5, P.nero);
      }
    },
  };
},

cupola(rng) {
  return {
    cielo: 0x223247, raggio: 0xffe8c0,
    statici(m) {
      suolo(m, 10, P.pietraChiara, P.pietra, rng);
      m.guscio(-5, 1, -5, 11, 7, 11, P.marmo);      // il tamburo ottagonale (semplificato)
      for (let a = 0; a < 40; a++) {
        const an = a / 40 * Math.PI * 2;
        m.p(Math.round(Math.cos(an) * 6), 8, Math.round(Math.sin(an) * 6), P.marmoOmbra);
      }
      for (let i = 0; i < 8; i++) {                 // le case di Firenze attorno
        const a = i / 8 * Math.PI * 2;
        casa(m, Math.round(Math.cos(a) * 9) - 1, Math.round(Math.sin(a) * 9) - 1, 3, 3, 2, P.tela, P.tetto);
      }
    },
    dinamici(d, t) {
      // la cupola si chiude anello per anello, poi ricomincia
      const f = (t * .18) % 1.35;
      for (let y = 0; y < 7; y++) {
        const salita = clamp01((f - y * .13) * 6);
        if (salita <= 0) continue;
        const r = 6 - y * .8;
        const n = Math.max(6, Math.round(r * 6));
        for (let a = 0; a < n * salita; a++) {
          const an = a / n * Math.PI * 2;
          d(Math.cos(an) * r, 9 + y, Math.sin(an) * r, 1, y % 2 ? P.tetto : P.cotto);
        }
      }
      if (f > .95) { d(0, 16, 0, 1.4, P.marmo); d(0, 17.2, 0, .8, P.oro); }
    },
  };
},

'venezia-origini'(rng) {
  return {
    cielo: 0x1b2c40, nebbia: 0x24384f, raggio: 0xffd9a8,
    statici(m) {
      for (let x = -12; x <= 12; x++) for (let z = -12; z <= 12; z++) m.p(x, 0, z, P.acqua);
      for (let x = -7; x <= 7; x++) for (let z = -5; z <= 5; z++)                 // l'isola
        m.p(x, 1, z, (x + z) % 4 === 0 ? P.marmoOmbra : P.pietraChiara);
      m.colonna(-5, -3, 2, 11, P.cotto);                                          // il campanile
      for (let k = 0; k < 2; k++) for (let dx = -1 + k; dx <= 1 - k; dx++) for (let dz = -1 + k; dz <= 1 - k; dz++)
        m.p(-5 + dx, 13 + k, -3 + dz, P.tetto);
      m.p(-5, 15, -3, P.oro);
      casa(m, 0, -4, 6, 6, 4, P.marmo, P.marmoOmbra, 2);                          // la basilica
      for (const [dx, dz] of [[1, -3], [4, -3], [1, 0], [4, 0]])                   // le cupole minori
        m.p(dx, 7, dz, P.oro);
      m.p(2, 9, -2, P.oro);                                                        // quella centrale
      for (let i = 0; i < 4; i++) casa(m, -7 + i * 2, 3, 2, 2, 2, P.cotto, P.tetto, 2);
      for (let i = 0; i < 16; i++) {                                              // le palafitte in laguna
        const x = -11 + (i % 8) * 3, z = i < 8 ? -9 : 9;
        m.colonna(x, z, 1, 2, P.tronco);
        m.p(x, 3, z, P.legno);
      }
    },
    dinamici(d, t) {
      for (let x = -12; x <= 12; x += 2) for (let z = -12; z <= 12; z += 2) {
        if (Math.abs(x) <= 8 && Math.abs(z) <= 6) continue;      // non sotto l'isola
        d(x, .6 + Math.sin(t * 1.5 + x * .4 + z * .3) * .28, z, 1.9, P.acquaChiara);
      }
      const gx = ((t * 2.4) % 26) - 13;             // la gondola che passa
      for (let i = 0; i < 5; i++) d(gx + i * .9, 1.2, 8, .8, P.nero);
      omino(d, gx + 4, 1.6, 8, P.rosso, P.pelle, .7);
    },
  };
},

mille(rng) {
  return {
    cielo: 0x1e2f42, raggio: 0xffe2b0,
    statici(m) {
      for (let x = -12; x <= 12; x++) for (let z = -12; z <= 2; z++) m.p(x, 0, z, P.mare);
      for (let x = -12; x <= 12; x++) for (let z = 3; z <= 12; z++) {
        m.p(x, 1, z, z > 5 ? P.erbaScura : P.sabbia);
        m.p(x, 0, z, P.terra);
      }
      casa(m, 4, 8, 4, 3, 2, P.tela, P.tetto, 2);   // Marsala
      m.colonna(-6, 9, 2, 4, P.pietraChiara);
      for (let i = 0; i < 5; i++) albero(m, -10 + i * 5, 11, 2, rng);
      for (let x = -2; x <= 2; x++) for (let z = -2; z <= 3; z++) m.p(x, 1, z, P.legno);  // il pontile
    },
    dinamici(d, t) {
      const f = (t * .1) % 1;
      const sx = -11 + f * 8;                       // il piroscafo che accosta al pontile
      for (let i = 0; i < 9; i++) d(sx + i * .95, 1.3, -4, 1.1, P.nero);
      for (let i = 0; i < 5; i++) d(sx + 2 + i * .9, 2.3, -4, .9, P.grigio);
      d(sx + 4, 3.6, -4, .8, P.grigio);
      for (let i = 0; i < 6; i++)
        d(sx + 4, 4.6 + i * .8, -4 + Math.sin(t * 2 + i) * .4, .7 - i * .06, P.fumo);
      // le camicie rosse sbarcano lungo il pontile, non sull'acqua
      for (let i = 0; i < 10; i++) {
        const p = clamp01(f * 2 - i * .08);
        if (p <= 0) continue;
        omino(d, -2 + (i % 5), 2, -2.5 + p * 8, P.rossoIt, P.pelle, .8);
      }
      for (let x = -12; x <= 12; x += 2)
        d(x, .5 + Math.sin(t * 2 + x * .5) * .25, -8, 1.9, P.acquaChiara);
    },
  };
},

'porta-pia'(rng) {
  return {
    cielo: 0x2a2f3c, raggio: 0xffdca8,
    statici(m) {
      suolo(m, 11, P.erbaScura, P.terra, rng);
      for (let z = -10; z <= 10; z++) {             // le mura aureliane
        if (z > -2 && z < 3) continue;              // qui ci sarà la breccia
        for (let y = 1; y <= 6; y++) m.p(0, y, z, y === 6 ? P.cotto : P.pietraChiara);
        if (z % 4 === 0) for (let y = 7; y <= 8; y++) m.p(0, y, z, P.cotto);
      }
      for (let i = 0; i < 4; i++) casa(m, -9 + i * 2, -8 + i * 4, 3, 3, 2, P.tela, P.tetto);
      m.colonna(6, 5, 1, 5, P.marmo); m.p(6, 6, 5, P.oro);
    },
    dinamici(d, t) {
      const f = (t * .22) % 1;
      // le macerie della breccia si alzano e ricadono
      for (let i = 0; i < 26; i++) {
        const r = ((i * 7919) % 100) / 100;
        const salto = Math.max(0, Math.sin(clamp01((f - .1) * 3) * Math.PI));
        d(salto * (r * 5 - 1), 1 + salto * (3 + r * 4) + (1 - salto) * r * 2,
          -2 + r * 5, .9, r > .6 ? P.cotto : P.pietraChiara);
      }
      for (let i = 0; i < 14; i++) {                // i bersaglieri che entrano
        const p = clamp01((f - .35) * 2.2 - i * .04);
        if (p <= 0) continue;
        omino(d, -7 + p * 12, 1.6, -1 + (i % 5) * 1.1, P.blu, P.pelle, .85);
      }
      for (let i = 0; i < 16; i++) {                // polvere
        const g = (t * .5 + i * .06) % 1;
        d(-1 + g * 4, 1 + g * 5, -2 + (i % 6), .8 - g * .4, P.polvere);
      }
    },
  };
},

vajont(rng) {
  return {
    cielo: 0x161e2a, nebbia: 0x1c2734, raggio: 0xbcd0e6, ambiente: .45,
    statici(m) {
      // gola stretta fra due versanti
      for (let z = -11; z <= 11; z++) for (let y = 0; y < 12; y++) {
        const larg = 5 + Math.round(y * .55);
        m.p(-larg, y, z, P.roccia);
        m.p(larg, y, z, y > 6 ? P.foglieScure : P.roccia);
        if (y === 0) for (let x = -larg + 1; x < larg; x++) m.p(x, 0, z, P.pietraScura);
      }
      for (let x = -5; x <= 5; x++) for (let y = 1; y <= 11; y++) m.p(x, y, 0, P.pietraChiara);  // la diga
      for (let i = 0; i < 6; i++) casa(m, -4 + i * 2, 7, 2, 2, 2, P.tela, P.tetto);              // Longarone
    },
    dinamici(d, t) {
      const f = (t * .16) % 1;
      // il lago dietro la diga, la frana da destra, l'onda che scavalca
      for (let x = -5; x <= 5; x += 1.6) for (let z = -10; z <= -1; z += 1.6)
        d(x, 9 + Math.sin(t + x + z) * .2, z, 1.5, P.acqua);
      const fr = clamp01((f - .15) * 4);
      for (let i = 0; i < 30; i++) {
        const r = ((i * 6151) % 100) / 100;
        d(6 - fr * (4 + r * 5), 11 - fr * (3 + r * 5), -8 + r * 8, 1.2, P.roccia);
      }
      const on = clamp01((f - .35) * 2.6);
      if (on > 0) for (let x = -5; x <= 5; x += 1.2) for (let i = 0; i < 5; i++) {
        const h = 12 + on * 6 - i * 1.4;
        d(x, h, -1 + on * (2 + i * 2.4), 1.4, P.acquaChiara);
      }
    },
  };
},

marconi(rng) {
  return {
    cielo: 0x1c2b3c, raggio: 0xffe8bc,
    statici(m) {
      suolo(m, 11, P.erba, P.terra, rng, 2);
      casa(m, -3, 4, 5, 4, 3, P.tela, P.tetto, 2);  // villa Griffone
      for (let i = 0; i < 5; i++) albero(m, -9 + i * 4, -8, 1, rng);
      m.colonna(2, -4, 1, 11, P.legno);             // l'antenna
      for (let y = 3; y < 11; y += 2) { m.p(1, y, -4, P.ferro); m.p(3, y, -4, P.ferro); }
      m.p(2, 12, -4, P.ferro);
      m.colonna(-7, -9, 1, 3, P.tronco);            // la collina dei Celestini, oltre
    },
    dinamici(d, t) {
      // anelli d'onda che si allargano dall'antenna e svaniscono
      for (let k = 0; k < 4; k++) {
        const f = ((t * .35 + k * .25) % 1);
        const r = 1 + f * 11;
        const n = Math.round(10 + r * 2.2);
        for (let a = 0; a < n; a++) {
          const an = a / n * Math.PI * 2;
          d(2 + Math.cos(an) * r, 12 + Math.sin(an) * r * .38, -4 + Math.sin(an) * r * .6,
            .7 * (1 - f), f < .5 ? P.oro : P.brace);
        }
      }
      omino(d, -1, 2, 2, P.nero, P.pelle);
      omino(d, -8, 2, -7, P.tela, P.pelle);         // il contadino con il fucile, oltre la collina
    },
  };
},

'messina-1908'(rng) {
  return {
    cielo: 0x1a1f2b, nebbia: 0x232a36, raggio: 0xd8c8b0, ambiente: .5,
    statici(m) {
      for (let x = -12; x <= 12; x++) for (let z = 4; z <= 12; z++) m.p(x, 0, z, P.mare);
      suoloParziale(m, 12, 3, P.pietraChiara, P.terra, rng);
    },
    dinamici(d, t) {
      // la scossa: gli edifici tremano, poi crollano, poi il mare si ritira
      const f = (t * .14) % 1;
      const tremo = f < .3 ? Math.sin(t * 30) * .35 * (1 - f / .3) : 0;
      const crollo = clamp01((f - .28) * 3);
      for (let i = 0; i < 14; i++) {
        const bx = -10 + (i % 7) * 3, bz = -8 + Math.floor(i / 7) * 5;
        const alt = 4 - Math.floor(((i * 37) % 5) / 2);
        const giu = crollo * alt * (.5 + ((i * 91) % 10) / 20);
        for (let y = 0; y < alt - giu; y++)
          for (let dx = 0; dx < 2; dx++) for (let dz = 0; dz < 2; dz++)
            d(bx + dx + tremo, 1 + y, bz + dz, 1, y === Math.floor(alt - giu) - 1 ? P.tetto : P.tela);
        if (crollo > .1) for (let k = 0; k < 3; k++)
          d(bx + ((k * 53) % 4) - 1, 1 + crollo * 1.5, bz + ((k * 71) % 4) - 1, .8, P.polvere);
      }
      const ritiro = clamp01((f - .5) * 2.5);
      for (let x = -12; x <= 12; x += 2)
        for (let z = 4; z <= 12; z += 2)
          d(x, .6 - ritiro * 1.4 + Math.sin(t * 2 + x * .3) * .2, z + ritiro * 3, 1.9, P.acqua);
    },
  };
},

annibale(rng) {
  return {
    cielo: 0x2c3a4e, nebbia: 0x3d4d63, raggio: 0xfff0d8,
    statici(m) {
      /* Valico alpino: un sentiero largo in mezzo e due creste basse ai lati.
         Basse per forza — se superano l'altezza della camera fanno da muro e
         del passaggio non si vede più niente. */
      for (let z = -12; z <= 12; z++) for (let x = -12; x <= 12; x++) {
        const h = Math.min(6, Math.round(Math.max(0, (Math.abs(x) - 5) * .9 + Math.sin(z * .4) * .8)));
        m.p(x, 0, z, h > 0 ? P.roccia : P.neve);
        m.p(x, -1, z, P.pietraScura);
        for (let y = 1; y <= h; y++) m.p(x, y, z, y >= h ? P.neve : P.roccia);
      }
    },
    dinamici(d, t) {
      // La colonna è lunga più della piastra: le posizioni si avvolgono, così
      // nessuno finisce a marciare nel vuoto fuori dal plastico.
      const giro = v => ((v + 13) % 26 + 26) % 26 - 13;
      const marcia = giro(t * 1.4);
      for (let i = 0; i < 3; i++) {                 // gli elefanti
        const z = giro(marcia - i * 5);
        const dx = Math.sin(t * 3 + i) * .15;
        for (let bx = -1; bx <= 1; bx++) for (let bz = -1; bz <= 1; bz++)
          d(bx + dx, 1.6, z + bz, 1.1, P.grigio);
        d(dx, 2.7, z - 1.4, 1, P.grigio);           // testa
        d(dx, 2.1, z - 2.3, .6, P.grigio);          // proboscide
        omino(d, dx, 3.4, z, P.rosso, P.pelle, .7);
        for (let k = 0; k < 4; k++) d(dx + (k < 2 ? -.7 : .7), .9, z + (k % 2 ? -.7 : .7), .6, P.grigio);
      }
      for (let i = 0; i < 12; i++)                  // la colonna di fanti
        omino(d, ((i * 37) % 5) - 2, 1.1, giro(marcia - 8 - i * 1.3), P.bronzo, P.pelle, .75);
      for (let i = 0; i < 28; i++) {                // neve che scende
        const f = (t * .3 + i * .036) % 1;
        d(((i * 6151) % 23) - 11, 12 - f * 12, ((i * 3571) % 23) - 11, .45, P.neve);
      }
    },
  };
},

autosole(rng) {
  return {
    cielo: 0x223349, raggio: 0xffeec4,
    statici(m) {
      suolo(m, 12, P.erba, P.terra, rng, 2.4);
      for (let z = -12; z <= 12; z++) {             // il nastro d'asfalto
        for (let x = -3; x <= 3; x++) m.p(x, 3, z, P.grigio);
        m.p(-4, 3, z, P.pietraChiara); m.p(4, 3, z, P.pietraChiara);
        if (z % 3 === 0) m.p(0, 4, z, P.biancoIt);  // la striscia
      }
      for (let i = 0; i < 6; i++) { albero(m, -8, -10 + i * 4, 1, rng); albero(m, 8, -8 + i * 4, 1, rng); }
      for (let x = -6; x <= 6; x++) m.p(x, 8, -9, P.pietraChiara);   // un viadotto in fondo
      for (let x = -6; x <= 6; x += 4) for (let y = 4; y < 8; y++) m.p(x, y, -9, P.pietraChiara);
    },
    dinamici(d, t) {
      const colori = [P.rossoIt, P.biancoIt, P.blu, P.oro, P.verdeIt];
      for (let i = 0; i < 8; i++) {
        const su = i % 2 === 0;
        const z = ((t * (7 + i % 3) + i * 6) % 26) - 13;
        const zz = su ? z : -z;
        const x = su ? -1.6 : 1.6;
        const c = colori[i % colori.length];
        d(x, 4.5, zz, 1, c); d(x, 4.5, zz + (su ? -1 : 1), 1, c);
        d(x, 5.4, zz + (su ? -.4 : .4), .8, c);
      }
    },
  };
},

};

/* ---------------- scene per tipo ---------------- */

const TIPO = {

battaglia(rng) {
  const cA = [P.rosso, P.blu, P.bronzo][Math.floor(rng() * 3)];
  const cB = [P.ferro, P.viola, P.nero][Math.floor(rng() * 3)];
  return {
    cielo: 0x232c3a, raggio: 0xffe4b8,
    statici(m) {
      suolo(m, 11, P.erbaScura, P.terra, rng, 1.4);
      for (let i = 0; i < 4; i++) albero(m, -10 + i * 7, -10, 1, rng);
      for (let i = 0; i < 6; i++) {                 // qualche masso e uno steccato
        m.p(Math.floor(rng() * 20) - 10, 1, Math.floor(rng() * 20) - 10, P.roccia);
      }
    },
    dinamici(d, t) {
      const urto = Math.sin(t * .9) * 3.2;
      for (let i = 0; i < 16; i++) {
        const fila = Math.floor(i / 8);
        omino(d, -7 + urto + fila * -1.4, 1.1, -5 + (i % 8) * 1.4, cA, P.pelle, .85);
        d(-6.4 + urto + fila * -1.4, 3, -5 + (i % 8) * 1.4, .35, P.legno);   // lance
      }
      for (let i = 0; i < 16; i++) {
        const fila = Math.floor(i / 8);
        omino(d, 7 - urto + fila * 1.4, 1.1, -5 + (i % 8) * 1.4, cB, P.pelle, .85);
        d(6.4 - urto + fila * 1.4, 3, -5 + (i % 8) * 1.4, .35, P.legno);
      }
      for (let i = 0; i < 18; i++) {                // polvere della mischia
        const f = (t * .6 + i * .055) % 1;
        d(Math.sin(i * 2.4) * 2.5, 1 + f * 3, -5 + (i % 9) * 1.4, .8 * (1 - f), P.polvere);
      }
    },
  };
},

guerra(rng) {
  return {
    cielo: 0x27313f, raggio: 0xffdca8,
    statici(m) {
      suolo(m, 11, P.erbaScura, P.terra, rng);
      m.guscio(-5, 1, -5, 10, 6, 10, P.pietraChiara);      // la rocca
      for (const [x, z] of [[-5, -5], [4, -5], [-5, 4], [4, 4]])
        for (let y = 0; y < 9; y++) m.p(x, 1 + y, z, y > 6 ? P.pietraScura : P.pietra);
      for (let x = -5; x <= 4; x += 2) { m.p(x, 7, -5, P.pietraScura); m.p(x, 7, 4, P.pietraScura); }
      for (let z = -5; z <= 4; z += 2) { m.p(-5, 7, z, P.pietraScura); m.p(4, 7, z, P.pietraScura); }
      for (let i = 0; i < 3; i++) albero(m, 9, -8 + i * 6, 1, rng);
    },
    dinamici(d, t) {
      const car = Math.sin(t * 1.2) * .6;                  // la catapulta che rincula
      for (let i = 0; i < 4; i++) d(-9 + car, 1.5 + i * .5, 7 - i * .5, .9, P.legno);
      d(-9 + car, 3.4, 5.6, .8, P.tronco);
      for (let k = 0; k < 3; k++) {                        // i proiettili in volo
        const f = ((t * .5 + k * .33) % 1);
        d(-9 + f * 13, 4 + Math.sin(f * Math.PI) * 7, 6 - f * 8, 1, P.roccia);
      }
      for (let i = 0; i < 6; i++)                          // difensori sui camminamenti
        omino(d, -4 + i * 1.8, 7.6, -5, P.ferro, P.pelle, .8);
      for (let i = 0; i < 10; i++) {                       // fumo dall'assedio
        const f = (t * .35 + i * .1) % 1;
        d(-9, 3 + f * 6, 7 + Math.sin(t + i) * .8, .9 * (1 - f * .6), P.fumo);
      }
    },
  };
},

viaggio(rng) {
  const perMare = rng() > .35;
  return {
    cielo: 0x1e3047, raggio: 0xffe6bc,
    statici(m) {
      if (perMare) {
        for (let x = -12; x <= 12; x++) for (let z = -12; z <= 12; z++) m.p(x, 0, z, P.mare);
        for (let x = 5; x <= 12; x++) for (let z = -12; z <= -5; z++) { m.p(x, 1, z, P.sabbia); m.p(x, 0, z, P.terra); }
        casa(m, 8, -9, 3, 3, 2, P.tela, P.tetto, 2);
      } else {
        suolo(m, 12, P.erba, P.terra, rng, 2);
        for (let z = -12; z <= 12; z++) for (let x = -1; x <= 1; x++) m.p(x, 1, z, P.sabbia);
        for (let i = 0; i < 6; i++) albero(m, i % 2 ? -5 : 5, -10 + i * 4, 1, rng);
        casa(m, 6, 6, 3, 3, 2, P.tela, P.tetto, 2);
      }
    },
    dinamici(d, t) {
      const f = ((t * .12) % 1);
      const z = -12 + f * 24;
      if (perMare) {
        for (let i = 0; i < 7; i++) d(-3 + i * .9, 1.2 + Math.sin(t * 1.6) * .18, z, 1.1, P.legno);
        d(0, 2.4, z, .9, P.tronco);
        for (let i = 0; i < 4; i++) d(0, 3.4 + i * .9, z, 1.6 - i * .12, P.tela);
        for (let x = -12; x <= 12; x += 2) for (let zz = -12; zz <= 12; zz += 3)
          d(x, .6 + Math.sin(t * 1.6 + x * .4 + zz * .3) * .25, zz, 1.9, P.acquaChiara);
      } else {
        for (let i = 0; i < 4; i++) d(-.6 + (i % 2) * 1.2, 2, z + Math.floor(i / 2) * 1.1, 1, P.legno);
        d(0, 3, z + .5, .9, P.tela);
        omino(d, 0, 2.2, z - 1.4, P.terraScura, P.pelle, .8);
        for (let i = 0; i < 8; i++) {
          const g = (t * .8 + i * .12) % 1;
          d(Math.sin(i * 2.1) * 1.4, 1.6 + g * 1.2, z + 1.6 + g * 2, .7 * (1 - g), P.polvere);
        }
      }
    },
  };
},

fondazione(rng) {
  const n = 5 + Math.floor(rng() * 3);
  const pos = [];
  for (let i = 0; i < n; i++) pos.push([-8 + (i % 4) * 5, -6 + Math.floor(i / 4) * 6, 2 + Math.floor(rng() * 3)]);
  return {
    cielo: 0x243347, raggio: 0xffe8c4,
    statici(m) {
      suolo(m, 11, P.erba, P.terra, rng, 1.2);
      for (let x = -11; x <= 11; x++) m.p(x, 1, 0, P.pietraChiara);     // la strada maestra
      for (let i = 0; i < 4; i++) albero(m, -9 + i * 6, 9, 1, rng);
    },
    dinamici(d, t) {
      // le case si alzano un blocco alla volta, poi la scena riparte
      const f = (t * .16) % 1.3;
      for (let i = 0; i < pos.length; i++) {
        const [x, z, alt] = pos[i];
        const cresce = clamp01((f - i * .09) * 4);
        const h = Math.max(0, Math.round(cresce * (alt + 1)));
        for (let y = 0; y < h; y++)
          for (let dx = 0; dx < 3; dx++) for (let dz = 0; dz < 3; dz++) {
            if (dx === 1 && dz === 1 && y < h - 1) continue;
            d(x + dx, 2 + y, z + dz, 1, y === alt ? P.tetto : P.tela);
          }
        if (cresce > 0 && cresce < 1) {                                  // il blocco in volo
          d(x + 1, 2 + h + 2 + Math.sin(t * 4 + i) * .4, z + 1, 1, P.legno);
        }
      }
      for (let i = 0; i < 5; i++)                                        // i muratori
        omino(d, -8 + i * 4, 2, 1.4, P.tela, P.pelle, .8);
    },
  };
},

scoperta(rng) {
  return {
    cielo: 0x1b2740, raggio: 0xd8e4ff, ambiente: .7,
    statici(m) {
      suolo(m, 10, P.pietraChiara, P.pietra, rng);
      m.guscio(-5, 1, -5, 10, 4, 10, P.tela);              // lo studio
      for (let x = -5; x <= 4; x++) for (let z = -5; z <= 4; z++)
        if ((x + z) % 3 === 0) m.p(x, 5, z, P.legno);      // travi del soffitto
      m.box(-2, 5, -2, 4, 1, 4, P.legno);                  // il tavolo
      m.p(-2, 6, -2, P.tela); m.p(1, 6, 1, P.oro);
      for (let i = 0; i < 3; i++) m.p(4, 2 + i, -3, P.legno);
    },
    dinamici(d, t) {
      // l'oggetto della scoperta fluttua e irradia
      const y = 8 + Math.sin(t * 1.2) * .5;
      d(0, y, 0, 1.5, P.oro);
      for (let k = 0; k < 3; k++) {
        const f = ((t * .4 + k * .33) % 1);
        const r = 1 + f * 6;
        for (let a = 0; a < 14; a++) {
          const an = a / 14 * Math.PI * 2 + t * .4;
          d(Math.cos(an) * r, y + Math.sin(an * 2 + t) * .6, Math.sin(an) * r, .5 * (1 - f), P.brace);
        }
      }
      omino(d, -3, 6, -3, P.viola, P.pelle);
    },
  };
},

disastro(rng) {
  const acqua = rng() > .55;
  return {
    cielo: 0x1a1e28, nebbia: 0x232733, raggio: 0xc8bca8, ambiente: .5,
    statici(m) {
      suolo(m, 11, acqua ? P.terra : P.pietraChiara, P.terraScura, rng);
      for (let i = 0; i < 5; i++) albero(m, -9 + i * 5, -9, 1, rng);
    },
    dinamici(d, t) {
      const f = (t * .15) % 1;
      const rovina = clamp01((f - .2) * 2.6);
      for (let i = 0; i < 10; i++) {
        const bx = -8 + (i % 5) * 4, bz = -3 + Math.floor(i / 5) * 5;
        const alt = 3 + ((i * 29) % 3);
        const giu = rovina * alt;
        for (let y = 0; y < alt - giu; y++)
          for (let dx = 0; dx < 3; dx++) for (let dz = 0; dz < 3; dz++) {
            if (dx === 1 && dz === 1 && y < alt - giu - 1) continue;
            d(bx + dx + (rovina > 0 && rovina < 1 ? Math.sin(t * 26 + i) * .25 : 0),
              2 + y, bz + dz, 1, y === Math.floor(alt - giu) - 1 ? P.tetto : P.tela);
          }
      }
      if (acqua) {
        const on = clamp01((f - .3) * 2);
        for (let x = -11; x <= 11; x += 1.8)
          for (let k = 0; k < 4; k++)
            d(x, 1.4 + on * 2.6 - k * .7 + Math.sin(t * 3 + x) * .3, -11 + on * 16 + k * 1.6, 1.6, P.acqua);
      } else {
        for (let i = 0; i < 26; i++) {
          const g = (t * .45 + i * .038) % 1;
          d(((i * 6151) % 20) - 10, 1 + g * 9, ((i * 3571) % 20) - 10, 1 - g * .5, g < .5 ? P.polvere : P.fumo);
        }
      }
    },
  };
},

cultura(rng) {
  const chiesa = rng() > .5;
  return {
    cielo: 0x222f45, raggio: 0xffeccc,
    statici(m) {
      suolo(m, 11, P.pietraChiara, P.pietra, rng);
      if (chiesa) {
        m.guscio(-4, 1, -6, 8, 7, 12, P.marmo);
        for (let k = 0; k < 4; k++) for (let x = -4 + k; x < 4 - k; x++) for (let z = -6; z < 6; z++)
          if (x === -4 + k || x === 3 - k) m.p(x, 8 + k, z, P.tetto);
        for (let y = 0; y < 12; y++) m.p(-6, 1 + y, -5, y > 9 ? P.tetto : P.marmoOmbra);   // il campanile
        m.p(-6, 14, -5, P.oro);
        for (let z = -6; z <= 5; z += 3) { m.colonna(5, z, 1, 5, P.marmo); m.p(5, 6, z, P.marmoOmbra); }
      } else {
        for (let i = 0; i < 6; i++) { m.colonna(-6 + i * 2.4 | 0, -5, 1, 6, P.marmo); m.colonna(-6 + i * 2.4 | 0, 5, 1, 6, P.marmo); }
        for (let x = -7; x <= 6; x++) for (let z = -5; z <= 5; z++) m.p(x, 7, z, P.marmoOmbra);
        m.box(-2, 1, -1, 4, 1, 3, P.pietraChiara);
      }
      for (let i = 0; i < 3; i++) albero(m, 9, -7 + i * 6, 1, rng);
    },
    dinamici(d, t) {
      // la statua (o il coro) al centro, e le note che salgono
      const y = 2 + Math.sin(t * .8) * .12;
      omino(d, 0, y, 0, P.marmo, P.marmo, 1.3);
      d(0, y + 3.4, 0, .7, P.oro);
      for (let i = 0; i < 16; i++) {
        const f = (t * .3 + i * .062) % 1;
        const a = i * 2.399 + t * .3;
        d(Math.cos(a) * (1.5 + f * 4), 3 + f * 8, Math.sin(a) * (1.5 + f * 4), .5 * (1 - f * .7), P.oro);
      }
      for (let i = 0; i < 6; i++)
        omino(d, -4 + i * 1.6, 2, 4, i % 2 ? P.viola : P.blu, P.pelle, .8);
    },
  };
},

};

function clamp01(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }

// Piastra di terra solo davanti a una certa z: serve alle scene di costa.
function suoloParziale(m, R, zMax, cSopra, cSotto, rng) {
  for (let x = -R; x <= R; x++) for (let z = -R; z <= zMax; z++) {
    m.p(x, 0, z, cSopra);
    m.p(x, -1, z, cSotto);
  }
}

/* ---------------- motore three.js ---------------- */

let renderer = null, scena = null, camera, luceSole, luceCielo;
let meshStatica = null, gruppiDin = new Map(), raf = null, t0 = 0;
let scenaCorr = null, canvasCorr = null;
let geoCubo = null, matStatica = null;
let ridotto = false;

/* Posizione della camera in coordinate sferiche. `manuale` passa a true al
   primo trascinamento e il giro automatico si ferma. */
const giro = { ang: -0.9, alt: .61, dist: 33, manuale: false };

function initRenderer(canvas) {
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  scena = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(40, 1, .5, 300);

  luceCielo = new THREE.HemisphereLight(0xbdd7f5, 0x3a3228, .75);
  scena.add(luceCielo);

  luceSole = new THREE.DirectionalLight(0xffffff, 1.55);
  luceSole.position.set(18, 26, 12);
  luceSole.castShadow = true;
  luceSole.shadow.mapSize.set(1024, 1024);
  const c = luceSole.shadow.camera;
  c.left = -22; c.right = 22; c.top = 22; c.bottom = -22; c.near = 1; c.far = 80;
  scena.add(luceSole);
  scena.add(luceSole.target);

  geoCubo = new THREE.BoxGeometry(1, 1, 1).toNonIndexed();
  matStatica = new THREE.MeshLambertMaterial({ vertexColors: true });
}

/* I blocchi fermi diventano una geometria sola: un disegno, non mille oggetti. */
function costruisciStatica(blocchi) {
  const bp = geoCubo.attributes.position.array;
  const bn = geoCubo.attributes.normal.array;
  const V = bp.length / 3, n = blocchi.length;
  const pos = new Float32Array(n * V * 3);
  const nor = new Float32Array(n * V * 3);
  const col = new Float32Array(n * V * 3);
  const tinta = new THREE.Color();

  for (let i = 0; i < n; i++) {
    const b = blocchi[i], s = b.s;
    tinta.setHex(b.c);
    // variazione minima di luminosità per blocco: dà la grana del voxel
    const j = .92 + (((i * 2654435761) >>> 0) % 1000) / 1000 * .16;
    const r = tinta.r * j, g = tinta.g * j, bl = tinta.b * j;
    for (let v = 0; v < V; v++) {
      const o = (i * V + v) * 3, q = v * 3;
      pos[o] = bp[q] * s + b.x; pos[o + 1] = bp[q + 1] * s + b.y; pos[o + 2] = bp[q + 2] * s + b.z;
      nor[o] = bn[q]; nor[o + 1] = bn[q + 1]; nor[o + 2] = bn[q + 2];
      col[o] = r; col[o + 1] = g; col[o + 2] = bl;
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  g.setAttribute('normal', new THREE.BufferAttribute(nor, 3));
  g.setAttribute('color', new THREE.BufferAttribute(col, 3));
  g.computeBoundingSphere();
  const mesh = new THREE.Mesh(g, matStatica);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

/* I blocchi in movimento: una InstancedMesh per colore, matrici riscritte a ogni
   frame. Niente colori per istanza, così funziona su qualsiasi build di three. */
const MAX_IST = 900;
const matrice = new THREE.Matrix4();
const vScala = new THREE.Vector3();
const vPos = new THREE.Vector3();
const qId = new THREE.Quaternion();

function gruppoPer(colore) {
  let g = gruppiDin.get(colore);
  if (!g) {
    const mat = new THREE.MeshLambertMaterial({ color: colore });
    const im = new THREE.InstancedMesh(geoCubo, mat, MAX_IST);
    im.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    im.castShadow = true;
    im.receiveShadow = true;
    im.frustumCulled = false;
    scena.add(im);
    g = { im, mat, n: 0 };
    gruppiDin.set(colore, g);
  }
  return g;
}

function pulisciDinamici() {
  for (const g of gruppiDin.values()) {
    scena.remove(g.im);
    g.im.dispose();
    g.mat.dispose();
  }
  gruppiDin.clear();
}

/* ---------------- ciclo ---------------- */

function scegliScena(ev) {
  const rng = rngDa(seme(ev.id));
  const f = FIRMA[ev.id];
  if (f) return f(rng);
  const g = TIPO[ev.type] || TIPO.cultura;
  return g(rng);
}

function disegnaFrame(t) {
  for (const g of gruppiDin.values()) g.n = 0;

  const spingi = (x, y, z, s, c) => {
    const g = gruppoPer(c);
    if (g.n >= MAX_IST) return;
    vPos.set(x, y, z);
    vScala.set(s, s, s);
    matrice.compose(vPos, qId, vScala);
    g.im.setMatrixAt(g.n++, matrice);
  };

  if (scenaCorr.dinamici) scenaCorr.dinamici(spingi, t, null);

  for (const g of gruppiDin.values()) {
    g.im.count = g.n;
    g.im.instanceMatrix.needsUpdate = true;
  }

  /* Giro di camera lentissimo attorno al plastico, da circa 30° di elevazione:
     più in basso le costruzioni alte fanno da muro, più in alto si perde il
     senso di plastico. Appena l'utente trascina, il giro automatico si ferma e
     comanda lui. */
  if (!giro.manuale) { giro.ang = -0.9 + t * 0.12; giro.alt = .61; giro.dist = distAuto(); }
  const oriz = Math.cos(giro.alt) * giro.dist;
  camera.position.set(Math.cos(giro.ang) * oriz, Math.sin(giro.alt) * giro.dist, Math.sin(giro.ang) * oriz);
  camera.lookAt(0, 3.5, 0);
  renderer.render(scena, camera);
}

function misura() {
  const w = canvasCorr.clientWidth || 400, h = canvasCorr.clientHeight || 210;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  if (ridotto) disegnaFrame(2.4);        // senza ciclo, ridisegna a mano
}

/* Trascinamento per girare, rotella o pizzico per avvicinarsi. Si attacca una
   volta sola al canvas, la prima volta che si apre una scheda. */
function attaccaComandi(canvas) {
  const pt = new Map();
  let dPinch = 0;

  canvas.addEventListener('pointerdown', e => {
    canvas.setPointerCapture(e.pointerId);
    pt.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pt.size === 2) {
      const [a, b] = [...pt.values()];
      dPinch = Math.hypot(a.x - b.x, a.y - b.y);
    }
  });

  canvas.addEventListener('pointermove', e => {
    if (!pt.has(e.pointerId)) return;
    const p = pt.get(e.pointerId);
    const dx = e.clientX - p.x, dy = e.clientY - p.y;
    pt.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pt.size === 2) {
      const [a, b] = [...pt.values()];
      const nd = Math.hypot(a.x - b.x, a.y - b.y);
      if (dPinch > 0 && nd > 0) zoomGiro(dPinch / nd);
      dPinch = nd;
      return;
    }
    if (Math.abs(dx) + Math.abs(dy) < 1) return;
    giro.manuale = true;
    giro.ang -= dx * .008;
    giro.alt = Math.max(.12, Math.min(1.45, giro.alt + dy * .006));
    if (ridotto) disegnaFrame(2.4);
  });

  const su = e => { pt.delete(e.pointerId); };
  canvas.addEventListener('pointerup', su);
  canvas.addEventListener('pointercancel', su);

  canvas.addEventListener('wheel', e => {
    e.preventDefault();
    giro.manuale = true;
    zoomGiro(Math.pow(1.0015, e.deltaY));
  }, { passive: false });

  // due tocchi rapidi: si torna al giro automatico
  canvas.addEventListener('dblclick', () => { giro.manuale = false; });
}

function zoomGiro(f) {
  giro.manuale = true;
  giro.dist = Math.max(12, Math.min(90, giro.dist * f));
  if (ridotto) disegnaFrame(2.4);
}

/* Distanza che fa entrare tutto il plastico nell'inquadratura, qualunque sia la
   forma del canvas: nella scheda è un rettangolo largo e basso, a tutto schermo
   può essere quasi quadrato o verticale, e con una distanza fissa il diorama
   uscirebbe dai bordi. */
function distAuto() {
  // Nella scheda il riquadro è una finestrella: si sta un po' stretti e va
  // bene, l'occhio cade sul centro della scena. A tutto schermo invece il
  // plastico dev'essere tutto dentro, angoli della piastra compresi.
  const pieno = canvasCorr && canvasCorr.clientHeight > 380;
  const raggio = pieno ? 17 : 13.5;
  const vt = Math.tan(camera.fov * Math.PI / 360);
  return raggio / Math.min(vt, vt * camera.aspect);
}

function ciclo(now) {
  const t = (now - t0) / 1000;
  disegnaFrame(t);
  raf = requestAnimationFrame(ciclo);
}

/* ---------------- interfaccia pubblica ---------------- */

function play(canvas, ev) {
  stop();
  canvasCorr = canvas;
  if (!renderer) {
    try { initRenderer(canvas); attaccaComandi(canvas); }
    catch (err) { console.warn('VoxScena: WebGL non disponibile', err); return; }
  } else if (renderer.domElement !== canvas) {
    console.warn('VoxScena: canvas diverso da quello iniziale');
  }

  ridotto = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  giro.manuale = false;                  // ogni scena riparte dal giro automatico
  giro.dist = 33;
  scenaCorr = scegliScena(ev);

  scena.background = new THREE.Color(scenaCorr.cielo || 0x1e2836);
  scena.fog = scenaCorr.nebbia ? new THREE.Fog(scenaCorr.nebbia, 34, 74) : null;
  luceCielo.intensity = scenaCorr.ambiente != null ? scenaCorr.ambiente : .75;
  luceSole.color.setHex(scenaCorr.raggio || 0xffffff);

  if (meshStatica) { scena.remove(meshStatica); meshStatica.geometry.dispose(); meshStatica = null; }
  pulisciDinamici();

  const m = new Mondo();
  if (scenaCorr.statici) scenaCorr.statici(m, null);
  meshStatica = costruisciStatica(m.b);
  scena.add(meshStatica);

  misura();
  t0 = performance.now();
  if (ridotto) disegnaFrame(2.4);          // un fotogramma solo, già "in azione"
  else raf = requestAnimationFrame(ciclo);
}

function stop() {
  if (raf) { cancelAnimationFrame(raf); raf = null; }
}

/* Collaudo: costruisce ogni scena a più istanti e riporta gli errori.
   Da lanciare in console dopo ogni modifica alle scene. */
function smoke() {
  const errori = [];
  const finti = [];
  for (const id of Object.keys(FIRMA)) finti.push({ id, type: 'cultura' });
  for (const tp of Object.keys(TIPO)) finti.push({ id: 'generico-' + tp, type: tp });

  for (const ev of finti) {
    try {
      const sc = scegliScena(ev);
      const m = new Mondo();
      if (sc.statici) sc.statici(m, null);
      if (!m.b.length) errori.push(ev.id + ': nessun blocco statico');
      let maxDin = 0;
      for (const t of [0, .7, 1.9, 3.3, 5.5, 9.1]) {
        let n = 0;
        const spingi = (x, y, z, s, c) => {
          n++;
          if (![x, y, z, s].every(Number.isFinite)) errori.push(ev.id + ' t=' + t + ': coordinata non finita');
          if (typeof c !== 'number') errori.push(ev.id + ' t=' + t + ': colore non valido');
        };
        if (sc.dinamici) sc.dinamici(spingi, t, null);
        maxDin = Math.max(maxDin, n);
      }
      if (maxDin > MAX_IST) errori.push(ev.id + ': ' + maxDin + ' blocchi dinamici, oltre il tetto di ' + MAX_IST);
      console.log(`  ${ev.id.padEnd(20)} statici ${String(m.b.length).padStart(5)}  dinamici max ${maxDin}`);
    } catch (err) {
      errori.push(ev.id + ': ' + err.message);
    }
  }
  console.log(errori.length ? '✗ ' + errori.length + ' problemi:' : '✓ tutte le scene costruite');
  for (const e of errori) console.log('   ' + e);
  return errori;
}

// Da chiamare quando il canvas cambia dimensione (ingrandimento a tutto
// schermo, rotazione del telefono): il renderer non se ne accorge da solo.
function ridimensiona() { if (renderer && canvasCorr) misura(); }

return { play, stop, smoke, ridimensiona, FIRMA, TIPO };

})();
