'use strict';

/* Le altre scene firma dei diorami.
 *
 * Stanno qui e non in `cronoitalia-voxel.js` per una ragione pratica: sono
 * centotrenta, e nel file del motore lo avrebbero sommerso. Si registrano da
 * sole con `VoxScena.registra`, e il motore le tratta esattamente come quelle
 * scritte lì dentro (`FIRMA[id]` ha la precedenza sulla scena per tipo).
 *
 * Ogni scena è una composizione di elementi del kit — tempio, cattedrale,
 * torre, nave, folla, fuoco, bandiera — più l'idea che la distingue. Le regole
 * imparate a forza di sbagliare stanno in HANDOFF.md: niente pareti più alte
 * della camera, niente blocchi fuori dalla piastra, niente omini sull'acqua,
 * `fronte: Math.PI / 2` per le scene d'interno.
 */

(() => {

const P = VoxScena.P;
const { suolo, suoloParziale, albero, casa, omino, clamp01, dissolvenza, arrivo,
        tempio, cattedrale, torre, mura, nave, folla, fuoco, bandiera, stelle,
        onde, fabbrica, ponte } = VoxScena.kit;

const NOTTE = 0x14203a, GIORNO = 0x24344c, TRAMONTO = 0x2e2c3e, CUPO = 0x1c1f28;
const CALDO = 0xffe6b4, FREDDO = 0xd6e4ff, FUOCOLUCE = 0xffb478;

VoxScena.registra({

/* ==================== preistoria e Italia antica ==================== */

valcamonica(rng) {
  return {
    cielo: GIORNO, raggio: CALDO,
    statici(m) {
      // il fondovalle, con la grande placca di roccia levigata
      for (let x = -12; x <= 12; x++) for (let z = -12; z <= 12; z++) {
        const h = Math.min(6, Math.round(Math.max(0, (Math.abs(x) - 5) * 1.1)));
        m.p(x, h, z, h > 3 ? P.roccia : h > 0 ? P.foglieScure : P.erbaScura);
        for (let y = 0; y < h; y++) m.p(x, y, z, P.pietraScura);
      }
      for (let x = -4; x <= 4; x++) for (let z = -5; z <= 5; z++) m.p(x, 1, z, P.pietra);
    },
    dinamici(d, t) {
      // le figure compaiono martellate una dopo l'altra sulla roccia
      const f = (t * .12) % 1.3;
      const figure = [[-3, -4], [-1, -3], [1, -4], [3, -2], [-3, 0], [0, 0], [3, 1],
                      [-2, 3], [1, 3], [3, 4], [-1, 5], [2, -1]];
      for (let i = 0; i < figure.length; i++) {
        if (f < i / figure.length) continue;
        const [x, z] = figure[i];
        omino(d, x, 1.5, z, P.nero, P.nero, .55);
        if (i % 3 === 0) d(x + .5, 2.6, z, .3, P.nero);      // il bastone o l'arco
      }
      omino(d, 6, 1.2, 6, P.tela, P.pelle, .85);
      for (let i = 0; i < 6; i++) d(6, 2.6 + Math.abs(Math.sin(t * 5 + i)) * .3, 6, .25, P.roccia);
    },
  };
},

pithecusa(rng) {
  return {
    cielo: GIORNO, raggio: CALDO,
    statici(m) {
      for (let x = -12; x <= 12; x++) for (let z = -12; z <= 12; z++) m.p(x, 0, z, P.mare);
      for (let x = -12; x <= 12; x++) for (let z = -12; z <= 12; z++) {
        const h = Math.round(4 - Math.hypot(x * .8, z) * .45);
        if (h < 1) continue;
        for (let y = 1; y <= h; y++) m.p(x, y, z, y === h ? (h > 3 ? P.roccia : P.erbaScura) : P.terra);
      }
      for (let i = 0; i < 5; i++) casa(m, -6 + i * 3, 4, 3, 3, 2, P.tela, P.tetto, 3);
      for (let i = 0; i < 3; i++) albero(m, -6 + i * 6, -4, 4, rng);
    },
    dinamici(d, t) {
      onde(d, t, 12, 3, [8, 8]);
      nave(d, t, -10 + ((t * .8) % 16), 1.2, 8, 1, 6, P.legno, P.tela, 0);
      // la coppa di Nestore: i tre versi incisi che compaiono
      for (let i = 0; i < 3; i++) {
        const on = clamp01(((t * .3) % 1.4) - i * .18);
        if (on <= 0) continue;
        for (let k = 0; k < 5; k++) d(-2 + k * .55, 7 + i * .7, -1, .3, P.oro);
      }
      d(0, 6, -1, 1.2, P.cotto);
      folla(d, t, 0, 5, 6, 1.5, [P.tela, P.viola], 4.1);
    },
  };
},

siracusa(rng) {
  return {
    cielo: GIORNO, raggio: CALDO,
    statici(m) {
      for (let x = -12; x <= 12; x++) for (let z = -12; z <= 12; z++) m.p(x, 0, z, P.mare);
      for (let x = -8; x <= 4; x++) for (let z = -6; z <= 6; z++) { m.p(x, 1, z, P.sabbia); m.p(x, 0, z, P.terra); }
      tempio(m, -5, -2, 6, 3, 5, P.marmo, P.marmoOmbra);
      for (let i = 0; i < 4; i++) casa(m, -8 + i * 2, 4, 2, 2, 2, P.tela, P.tetto, 2);
    },
    dinamici(d, t) {
      onde(d, t, 12, 3, [8, 7]);
      for (let k = 0; k < 3; k++) nave(d, t, 6 + k * .5, 1.2, -8 + k * 6, -1, 5, P.legno, P.tela, 3);
      folla(d, t, -3, 4, 10, 1.5, [P.tela, P.blu, P.rosso], 2.1);
    },
  };
},

paestum(rng) {
  return {
    cielo: TRAMONTO, raggio: CALDO,
    statici(m) {
      suolo(m, 12, P.erbaScura, P.terra, rng, 1);
      tempio(m, -8, -3, 7, 4, 6, P.sabbia, P.marmoOmbra);
      tempio(m, 5, 2, 4, 3, 5, P.sabbia, P.marmoOmbra);
      for (let i = 0; i < 4; i++) albero(m, -10 + i * 2, 9, 1, rng);
    },
    dinamici(d, t) {
      // la nebbia bassa della piana, e i bufali
      for (let i = 0; i < 18; i++) {
        const f = (t * .1 + i * .055) % 1;
        d(-12 + f * 24, 1.6 + Math.sin(t + i) * .2, -10 + (i % 6) * 3.5, 1.6, P.fumo);
      }
      for (let i = 0; i < 4; i++) {
        const x = ((t * .6 + i * 5) % 22) - 11;
        d(x, 1.6, 7, 1.2, P.nero); d(x - 1, 1.6, 7, 1, P.nero);
      }
      folla(d, t, 0, -6, 5, 1.2, [P.tela], 1.1);
    },
  };
},

tarquinia(rng) {
  return {
    cielo: CUPO, nebbia: 0x262232, raggio: CALDO, ambiente: .55, fronte: Math.PI / 2,
    statici(m) {
      suolo(m, 11, P.erbaScura, P.terra, rng);
      // la camera funeraria scavata: tre pareti dipinte e il soffitto a spiovente
      for (let x = -7; x <= 7; x++) for (let y = 1; y <= 6; y++) m.p(x, y, -6, P.sabbia);
      for (let z = -6; z <= 3; z++) for (let y = 1; y <= 6; y++) { m.p(-7, y, z, P.sabbia); m.p(7, y, z, P.sabbia); }
      for (let k = 0; k < 4; k++) for (let x = -7 + k; x <= 7 - k; x++) for (let z = -6; z <= 3; z++)
        if (x === -7 + k || x === 7 - k) m.p(x, 7 + k, z, P.cotto);
      m.box(-3, 1, -2, 6, 1, 2, P.marmo);
    },
    dinamici(d0, t) {
      // banchettanti, danzatori e il tuffatore che compaiono sull'intonaco
      const f = (t * .13) % 1.25;
      const d = dissolvenza(d0, f, 1.25);   // il ciclo si ritira invece di spegnersi
      const scena = [[-6, P.rosso], [-4.5, P.nero], [-3, P.rosso], [-1.5, P.oliva],
                     [0, P.nero], [1.5, P.rosso], [3, P.nero], [4.5, P.rosso], [6, P.nero]];
      for (let i = 0; i < scena.length; i++) {
        const p = clamp01((f - (i / scena.length)) * 5);
        if (p <= 0) continue;
        const da = arrivo(d, p);
        omino(da, scena[i][0], 3, -5.6, scena[i][1], P.cotto, .8);
      }
      if (f > .8) { d(0, 6.2, -5.6, .7, P.acquaChiara); d(.7, 5.6, -5.6, .6, P.acquaChiara); }
      for (let i = 0; i < 6; i++) d(-2 + i * .8, 2.4, -1, .4, P.bronzo);
      omino(d, -5, 1.2, 2, P.viola, P.pelle);
    },
  };
},

cerveteri(rng) {
  return {
    cielo: TRAMONTO, raggio: CALDO,
    statici(m) {
      suolo(m, 12, P.erbaScura, P.terra, rng, 1);
      // i tumuli: cilindri di tufo con la calotta d'erba
      for (let k = 0; k < 5; k++) {
        const a = k / 5 * Math.PI * 2;
        const cx = Math.round(Math.cos(a) * 6), cz = Math.round(Math.sin(a) * 6);
        const R = 3 + (k % 2);
        for (let y = 0; y < 3; y++) for (let x = -R; x <= R; x++) for (let z = -R; z <= R; z++) {
          const dd = Math.hypot(x, z);
          if (dd > R - y * .5) continue;
          m.p(cx + x, 1 + y, cz + z, y === 2 ? P.erbaScura : P.sabbia);
        }
        m.p(cx + R - 1, 1, cz, P.nero);
      }
      for (let x = -12; x <= 12; x++) m.p(x, 1, 0, P.pietraChiara);
    },
    dinamici(d, t) {
      const p = ((t * 1.6) % 18) - 9;                  // la fila è lunga: si avvolge prima del bordo
      for (let i = 0; i < 4; i++) omino(d, p - i * 1.2, 2, 0, i ? P.tela : P.nero, P.pelle, .8);
      for (let i = 0; i < 10; i++) {                    // lucerne accese sui tumuli
        const a = i / 10 * Math.PI * 2;
        d(Math.cos(a) * 8, 4.6 + Math.sin(t * 2 + i) * .15, Math.sin(a) * 8, .35, P.brace);
      }
    },
  };
},

agrigento(rng) {
  return {
    cielo: TRAMONTO, raggio: CALDO,
    statici(m) {
      // il crinale su cui corre la fila dei templi
      for (let x = -12; x <= 12; x++) for (let z = -12; z <= 12; z++) {
        const h = Math.max(0, Math.round(3 - Math.abs(z) * .35));
        m.p(x, h, z, h > 1 ? P.sabbia : P.erbaScura);
        for (let y = 0; y < h; y++) m.p(x, y, z, P.terra);
      }
      tempio(m, -10, -1, 4, 3, 5, P.sabbia, P.marmoOmbra);
      tempio(m, -1, -1, 5, 3, 6, P.sabbia, P.marmoOmbra);
      tempio(m, 8, -1, 3, 3, 5, P.sabbia, P.marmoOmbra);
      for (let i = 0; i < 6; i++) albero(m, -11 + i * 4, 7, 1, rng);
    },
    dinamici(d, t) {
      for (let i = 0; i < 14; i++) {                    // rondini attorno alle colonne
        const a = t * .8 + i * .45;
        d(Math.cos(a) * (7 + i * .4), 11 + Math.sin(a * 2 + t) * 1.6, Math.sin(a) * 4, .4, P.nero);
      }
      folla(d, t, 0, 6, 8, 1.6, [P.tela, P.viola], 4.1);
    },
  };
},

selinunte(rng) {
  return {
    cielo: GIORNO, raggio: CALDO,
    statici(m) {
      suolo(m, 12, P.sabbia, P.terra, rng, 1);
      for (let x = -12; x <= 12; x++) for (let z = 8; z <= 12; z++) m.p(x, 0, z, P.mare);
      tempio(m, -6, -4, 6, 4, 6, P.sabbia, P.marmoOmbra);
    },
    dinamici(d, t) {
      /* Il tempio crolla e si rialza: a Selinunte i rocchi delle colonne stanno
         ancora a terra in fila, buttati giù dal terremoto. */
      const f = (t * .1) % 1;
      const giu = clamp01((f - .4) * 3) * (1 - clamp01((f - .8) * 5));
      for (let i = 0; i < 7; i++) for (let k = 0; k < 5; k++) {
        const cad = giu * (1 + k * .5);
        // i rocchi si fermano a terra: senza il fondo sprofondavano dentro la piastra
        d(-6 + i * 2 + cad * 1.6, Math.max(1, 1 + k - cad * k * .8), -4 - cad * .4, .95, P.sabbia);
      }
      for (let x = -12; x <= 12; x += 3) d(x, .6 + Math.sin(t * 1.7 + x) * .25, 10, 2.8, P.acquaChiara);
      for (let i = 0; i < 10; i++) {
        if (giu < .1) break;
        d(-5 + i * 1.4, 1.2 + giu, -1 + (i % 3), .8 * giu, P.polvere);
      }
    },
  };
},

segesta(rng) {
  return {
    cielo: GIORNO, raggio: CALDO,
    statici(m) {
      for (let x = -12; x <= 12; x++) for (let z = -12; z <= 12; z++) {
        const h = Math.max(0, Math.round(4 - Math.hypot(x, z) * .3));
        m.p(x, h, z, P.erbaScura);
        for (let y = 0; y < h; y++) m.p(x, y, z, P.terra);
      }
      tempio(m, -5, -3, 6, 4, 6, P.sabbia, P.marmoOmbra);
      for (let i = 0; i < 5; i++) albero(m, -11 + i * 5, 10, 1, rng);
    },
    dinamici(d, t) {
      // il cantiere che non finirà mai: gli attrezzi restano, gli operai no
      for (let i = 0; i < 4; i++) d(-8 + i * .9, 5.4, 4, .5, P.legno);
      d(-6, 6, 4, .6, P.bronzo);
      for (let i = 0; i < 6; i++) {
        const a = t * .5 + i * 1.05;
        d(Math.cos(a) * 9, 8 + Math.sin(a * 2) * 1.4, Math.sin(a) * 9, .4, P.nero);
      }
      for (let i = 0; i < 10; i++) {
        const g = (t * .2 + i * .1) % 1;
        d(-9 + i * 2, 6 + g * 2, 8, .5 * (1 - g), P.polvere);
      }
    },
  };
},

riace(rng) {
  return {
    cielo: 0x123048, nebbia: 0x1a4260, raggio: 0x9fd0ff, ambiente: .6,
    statici(m) {
      // il fondo del mare: sabbia, posidonia, qualche anfora
      for (let x = -12; x <= 12; x++) for (let z = -12; z <= 12; z++) {
        m.p(x, 0, z, (x + z) % 5 === 0 ? P.foglieScure : P.sabbia);
        m.p(x, -1, z, P.terra);
      }
      for (let i = 0; i < 7; i++) {
        const x = -8 + i * 3, z = -6 + (i % 3) * 5;
        m.p(x, 1, z, P.cotto); m.p(x, 2, z, P.cotto);
      }
    },
    dinamici(d, t) {
      // i due guerrieri di bronzo, e la sabbia che si solleva scoprendoli
      for (const [x, seme] of [[-2.4, 0], [2.4, 1.7]]) {
        const on = Math.sin(t * .8 + seme) * .06;
        d(x, 1.4, 0, 1.1, P.bronzo);
        d(x, 2.5, 0, 1.1, P.bronzo);
        d(x + on, 3.6, 0, .95, P.bronzo);
        d(x - .9, 2.4, .5, .5, P.bronzo);
        d(x + .9, 2.4, -.5, .5, P.bronzo);
      }
      for (let i = 0; i < 26; i++) {                    // sospensione nell'acqua
        const f = (t * .18 + i * .038) % 1;
        d(((i * 6151) % 23) - 11, 1 + f * 9, ((i * 3571) % 23) - 11, .35, P.acquaChiara);
      }
      omino(d, 7, 1.2, 6, P.nero, P.pelle, .9);         // il sub che li trova
    },
  };
},

pitagora(rng) {
  return {
    cielo: NOTTE, raggio: FREDDO, ambiente: .6, fronte: Math.PI / 2,
    statici(m) {
      suolo(m, 10, P.pietraChiara, P.pietra, rng);
      for (let i = 0; i < 6; i++) { m.colonna(-6 + i * 2.4 | 0, -6, 1, 6, P.marmo); }
      for (let x = -7; x <= 6; x++) m.p(x, 7, -6, P.marmoOmbra);
      m.box(-4, 1, -2, 9, 1, 1, P.marmo);
    },
    dinamici(d, t) {
      // la tetraktys: dieci punti che si dispongono in triangolo
      const f = (t * .16) % 1.3;
      let n = 0;
      for (let r = 0; r < 4; r++) for (let c = 0; c <= r; c++) {
        if (f < n / 10) { n++; continue; }
        d(-r * .5 + c * 1, 8 - r * 1.1, -3, .5, P.oro);
        n++;
      }
      for (let i = 0; i < 7; i++)                       // i discepoli in silenzio
        omino(d, -4.5 + i * 1.5, 2, 1, P.tela, P.pelle, .8);
      stelle(d, 16, 9, 12);
    },
  };
},

himera(rng) {
  return {
    cielo: TRAMONTO, raggio: FUOCOLUCE,
    statici(m) {
      suolo(m, 12, P.erbaScura, P.terra, rng, .8);
      for (let x = -12; x <= 12; x++) for (let z = -12; z <= -8; z++) m.p(x, 0, z, P.mare);
      mura(m, -4, 4, 10, 7, 4, P.pietraChiara);
    },
    dinamici(d, t) {
      const urto = Math.sin(t * .7) * 2.6;
      for (let i = 0; i < 14; i++)
        omino(d, -8 + urto + (i % 7) * 1.3, 1.1, -4 + Math.floor(i / 7) * 1.4, P.blu, P.pelle, .8);
      for (let i = 0; i < 14; i++)
        omino(d, 8 - urto - (i % 7) * 1.3, 1.1, -4 + Math.floor(i / 7) * 1.4, P.viola, P.pelle, .8);
      for (let k = 0; k < 3; k++) fuoco(d, t, -9 + k * 9, 1, -9, 7, 1, k * .3);
      for (let x = -12; x <= 12; x += 3) d(x, .6 + Math.sin(t * 1.7 + x) * .25, -10, 2.8, P.acquaChiara);
    },
  };
},

'dodici-tavole'(rng) {
  return {
    cielo: GIORNO, raggio: CALDO, fronte: Math.PI / 2,
    statici(m) {
      suolo(m, 11, P.pietraChiara, P.pietra, rng);
      for (let i = 0; i < 5; i++) { m.colonna(-6 + i * 3, -7, 1, 6, P.marmo); m.p(-6 + i * 3, 7, -7, P.marmoOmbra); }
      for (let x = -8; x <= 8; x++) m.p(x, 8, -7, P.marmoOmbra);
      m.box(-7, 1, -2, 15, 1, 1, P.pietra);
    },
    dinamici(d0, t) {
      // le dodici tavole vengono esposte una a una nel Foro
      const f = (t * .14) % 1.3;
      const d = dissolvenza(d0, f, 1.3);   // il ciclo si ritira invece di spegnersi
      for (let i = 0; i < 12; i++) {
        if (f < i / 12) continue;
        const x = -6.6 + (i % 6) * 2.4, y = i < 6 ? 4.4 : 2.4;
        d(x, y, -2, 1.4, P.bronzo);
        for (let k = 0; k < 3; k++) d(x, y - .4 + k * .35, -1.3, .9, P.marmoOmbra);
      }
      folla(d, t, 0, 3, 14, 1.6, [P.tela, P.rosso, P.viola], 1.2);
    },
  };
},

secessione(rng) {
  return {
    cielo: TRAMONTO, raggio: CALDO,
    statici(m) {
      // due colli: la città e l'Aventino dove la plebe si accampa
      for (let x = -12; x <= 12; x++) for (let z = -12; z <= 12; z++) {
        const h = Math.max(0, Math.round(4 - Math.hypot(x + 7, z) * .45),
                              Math.round(3 - Math.hypot(x - 7, z) * .4));
        m.p(x, h, z, h > 0 ? P.erbaScura : P.terra);
        for (let y = 0; y < h; y++) m.p(x, y, z, P.terra);
      }
      for (let i = 0; i < 4; i++) casa(m, -9 + i * 2, -2 + i, 3, 3, 3, P.cotto, P.tetto, 4);
      for (let i = 0; i < 5; i++) { m.colonna(6 + (i % 3), -4 + i, 3, 2, P.legno); }
    },
    dinamici(d, t) {
      // la plebe se ne va dalla città verso il colle, in fila
      const f = (t * .1) % 1;
      for (let i = 0; i < 16; i++) {
        const p = clamp01(f * 1.6 - i * .045);
        omino(d, -7 + p * 14, 3 + p * .6, -3 + (i % 5) * 1.4, P.terraScura, P.pelle, .8);
      }
      for (let k = 0; k < 3; k++) fuoco(d, t, 6 + k * 2, 3, 2 + k, 5, .7, k * .4);
    },
  };
},

veio(rng) {
  return {
    cielo: CUPO, raggio: FUOCOLUCE,
    statici(m) {
      suolo(m, 12, P.erbaScura, P.terra, rng, 1.4);
      mura(m, -5, -5, 11, 11, 5, P.sabbia);
      torre(m, -6, -6, 8, P.sabbia); torre(m, 5, -6, 8, P.sabbia);
      for (let i = 0; i < 3; i++) casa(m, -3 + i * 3, -2, 3, 3, 2, P.cotto, P.tetto, 1);
    },
    dinamici(d, t) {
      // la galleria scavata sotto le mura: i romani spuntano dentro la città
      const f = (t * .12) % 1;
      for (let i = 0; i < 10; i++) {
        const p = clamp01(f * 1.6 - i * .06);
        if (p <= 0) continue;
        omino(d, -10 + p * 12, 1.1 + (p > .5 ? .0 : 0), 8 - p * 9, P.rosso, P.pelle, .8);
      }
      for (let i = 0; i < 12; i++)
        omino(d, -9 + (i % 6) * 1.4, 1.1, 9 + Math.floor(i / 6) * 1.4, P.rosso, P.pelle, .8);
      for (let i = 0; i < 8; i++) d(-10 + i, 1, 8, .8, P.terraScura);
      fuoco(d, t, 0, 4, 0, 8, 1.2, 0);
    },
  };
},

allia(rng) {
  return {
    cielo: CUPO, nebbia: 0x2a2620, raggio: FUOCOLUCE, ambiente: .55,
    statici(m) {
      suolo(m, 12, P.erbaScura, P.terra, rng, .8);
      for (let z = -12; z <= 12; z++) for (let x = 6; x <= 9; x++) m.p(x, 1, z, P.acqua);
      for (let i = 0; i < 4; i++) albero(m, -10, -8 + i * 6, 1, rng);
    },
    dinamici(d, t) {
      // la linea romana si sfalda e fugge verso il fiume
      const f = (t * .13) % 1;
      for (let i = 0; i < 18; i++) {
        const rotta = clamp01(f * 2 - (i % 6) * .05);
        omino(d, -2 + rotta * 8 + (i % 3), 1.6, -6 + (i % 9) * 1.4, P.rosso, P.pelle, .8);
      }
      for (let i = 0; i < 14; i++)
        omino(d, -9 + f * 5 + (i % 4) * 1.2, 1.6, -6 + Math.floor(i / 4) * 2.4, P.grigioverde, P.pelle, .85);
      for (let i = 0; i < 10; i++) {
        const g = (t * .6 + i * .1) % 1;
        d(2 + g * 5, 1.6 + g * 2, -5 + (i % 8) * 1.4, .7 * (1 - g), P.polvere);
      }
    },
  };
},

caudine(rng) {
  return {
    cielo: CUPO, nebbia: 0x2c3226, raggio: CALDO, ambiente: .6,
    statici(m) {
      // la gola: due pareti vicine e un fondo stretto
      for (let x = -12; x <= 12; x++) for (let z = -12; z <= 12; z++) {
        const h = Math.min(7, Math.round(Math.max(0, (Math.abs(x) - 3) * 1.6)));
        m.p(x, h, z, h > 4 ? P.roccia : h > 0 ? P.foglieScure : P.terraScura);
        for (let y = 0; y < h; y++) m.p(x, y, z, P.roccia);
      }
      for (const z of [-9, 9]) for (let x = -3; x <= 3; x++)  // gli sbarramenti alle due uscite
        for (let y = 1; y <= 3; y++) m.p(x, y, z, P.legno);
      for (let x = -2; x <= 2; x++) m.p(x, 3, 0, P.legno);    // il giogo
      m.p(-2, 1, 0, P.legno); m.p(-2, 2, 0, P.legno);
      m.p(2, 1, 0, P.legno); m.p(2, 2, 0, P.legno);
    },
    dinamici(d, t) {
      // la colonna passa sotto il giogo, uno alla volta, chinandosi
      const f = (t * .2) % 1;
      for (let i = 0; i < 12; i++) {
        const p = ((f + i / 12) % 1);
        const z = -8 + p * 16;
        const chino = Math.abs(z) < 1.4 ? .6 : 0;
        omino(d, (i % 3) - 1, 1.1 - chino, z, P.rosso, P.pelle, .8 - chino * .2);
      }
      for (let i = 0; i < 10; i++)                            // i sanniti a guardare dall'alto
        omino(d, i < 5 ? -5 : 5, 7.2, -6 + (i % 5) * 3, P.marrone, P.pelle, .8);
    },
  };
},

sentino(rng) {
  return {
    cielo: TRAMONTO, raggio: CALDO,
    statici(m) {
      suolo(m, 12, P.erbaScura, P.terra, rng, 1.2);
      for (let i = 0; i < 4; i++) albero(m, -11 + i * 8, -11, 1, rng);
    },
    dinamici(d, t) {
      // quattro popoli in campo: la battaglia delle nazioni
      const urto = Math.sin(t * .8) * 2.4;
      const schiere = [[P.rosso, -1, -5], [P.marrone, 1, -5], [P.grigioblu, 1, 5], [P.oliva, 1, 2]];
      for (let s = 0; s < 4; s++) {
        const [c, verso, z0] = schiere[s];
        for (let i = 0; i < 10; i++)
          omino(d, verso * (6 - urto * verso) + (i % 5) * .9 * -verso, 1.1,
            z0 + Math.floor(i / 5) * 1.3 + (s === 3 ? 0 : 0), c, P.pelle, .8);
      }
      for (let i = 0; i < 4; i++) {                           // i carri gallici
        const x = -9 + ((t * 1.4 + i * 4) % 18);
        d(x, 1.8, 7, 1.1, P.legno); d(x - 1.2, 1.6, 7, .9, P.terraScura);
      }
      for (let i = 0; i < 18; i++) {
        const g = (t * .5 + i * .055) % 1;
        d(Math.sin(i * 2.1) * 4, 1 + g * 3.4, -6 + (i % 10) * 1.4, .85 * (1 - g), P.polvere);
      }
    },
  };
},

'appio-acquedotto'(rng) {
  return {
    cielo: GIORNO, raggio: CALDO,
    statici(m) {
      suolo(m, 12, P.erbaScura, P.terra, rng, 1.2);
      // le arcate che attraversano la campagna
      for (let x = -12; x <= 12; x++) m.p(x, 8, 1, P.pietraChiara);
      for (let x = -12; x <= 12; x++) m.p(x, 9, 0, P.pietraChiara);
      for (let x = -12; x <= 12; x++) m.p(x, 9, 2, P.pietraChiara);
      for (let x = -12; x <= 12; x += 4) for (let y = 1; y < 8; y++)
        for (let z = 0; z <= 2; z++) m.p(x, y, z, P.pietraChiara);
      for (let i = 0; i < 5; i++) albero(m, -10 + i * 5, 8, 1, rng);
    },
    dinamici(d, t) {
      for (let i = 0; i < 20; i++) {                          // l'acqua che corre nel condotto
        const p = ((t * 3 + i * 1.3) % 26) - 13;
        d(p, 9.2 + Math.sin(t * 4 + i) * .1, 1, .8, P.acquaChiara);
      }
      for (let i = 0; i < 6; i++) {                           // qualche perdita che gocciola
        const g = (t * .9 + i * .17) % 1;
        d(-8 + i * 3.4, 8 - g * 6.5, 1, .35, P.acquaChiara);
      }
      folla(d, t, -2, 6, 5, 1.2, [P.tela], 1.2);
    },
  };
},

corvo(rng) {
  return {
    cielo: GIORNO, raggio: CALDO,
    statici(m) {
      for (let x = -12; x <= 12; x++) for (let z = -12; z <= 12; z++) m.p(x, 0, z, P.mare);
    },
    dinamici(d, t) {
      onde(d, t, 12, 3, [7, 3]);
      nave(d, t, -6, 1.2, -2, 1, 8, P.legno, 0, 4);
      nave(d, t, 6, 1.2, 2, -1, 8, P.tronco, 0, 4);
      // il corvo: la passerella cala e si pianta sul ponte nemico
      const f = (t * .3) % 1;
      const cala = clamp01((f - .2) * 3);
      for (let i = 0; i < 6; i++)
        d(1 + i * .8, 4.4 - cala * (2.6 + i * .18), 0, .7, P.legno);
      d(5.6, 4.4 - cala * 3.6, 0, .6, P.ferro);
      if (cala > .9) for (let i = 0; i < 6; i++) {
        const p = clamp01((f - .5) * 3 - i * .08);
        omino(d, 1 + p * 5, 2.6, 0, P.rosso, P.pelle, .75);
      }
    },
  };
},

egadi(rng) {
  return {
    cielo: 0x1e3a56, raggio: CALDO,
    statici(m) {
      for (let x = -12; x <= 12; x++) for (let z = -12; z <= 12; z++) m.p(x, 0, z, P.mare);
      for (let x = 7; x <= 12; x++) for (let z = -12; z <= -6; z++) {
        const h = Math.max(1, Math.round(4 - Math.hypot(x - 10, z + 9) * .5));
        for (let y = 1; y <= h; y++) m.p(x, y, z, y === h ? P.erbaScura : P.roccia);
      }
    },
    dinamici(d, t) {
      onde(d, t, 12, 3, null);
      for (let k = 0; k < 3; k++) nave(d, t, -9 + k * .6, 1.2, -6 + k * 5, 1, 7, P.legno, P.tela, 3);
      for (let k = 0; k < 3; k++) {
        // le navi puniche, cariche, affondano una dopo l'altra
        const giu = clamp01(((t * .12 + k * .3) % 1) - .55) * 3;
        // affonda fino al pelo dell'acqua, non sotto il fondale
        nave(d, t, 7, 1.2 - giu * 1.5, -6 + k * 5, -1, 6, P.tronco, giu > .3 ? 0 : P.tela, 0);
        if (giu > .1) for (let i = 0; i < 5; i++)
          d(4 + i * .7, 1 + Math.sin(t * 3 + i) * .3, -6 + k * 5, .6, P.acquaChiara);
      }
    },
  };
},

trasimeno(rng) {
  return {
    cielo: 0x28323c, nebbia: 0x3a4450, raggio: 0xd8d0bc, ambiente: .55,
    statici(m) {
      suolo(m, 12, P.erbaScura, P.terra, rng);
      for (let x = -12; x <= 12; x++) for (let z = 4; z <= 12; z++) m.p(x, 0, z, P.acqua);
      for (let x = -12; x <= 12; x++) for (let z = -12; z <= -4; z++) {
        const h = Math.min(6, Math.round((-z - 3) * .8));
        for (let y = 1; y <= h; y++) m.p(x, y, z, y === h ? P.foglieScure : P.roccia);
      }
    },
    dinamici(d, t) {
      // la colonna marcia lungo la riva nella nebbia; l'imboscata scende dai monti
      const f = (t * .11) % 1;
      for (let i = 0; i < 16; i++) {
        const x = ((f * 26 + i * 1.6) % 26) - 13;
        omino(d, x, 1.1, 1.5 + (i % 2) * .9, P.rosso, P.pelle, .8);
      }
      const scesa = clamp01((f - .4) * 2.4);
      for (let i = 0; i < 14; i++)
        omino(d, -10 + (i % 7) * 3, 1.1 + (1 - scesa) * 3, -4 + scesa * 4 - (i % 3), P.viola, P.pelle, .8);
      for (let i = 0; i < 22; i++) {                          // la nebbia sul lago
        const g = (t * .1 + i * .045) % 1;
        d(-12 + g * 24, 1.4 + Math.sin(t + i) * .2, 3 + (i % 5) * 1.6, 1.8, P.fumo);
      }
    },
  };
},

archimede(rng) {
  return {
    cielo: TRAMONTO, raggio: FUOCOLUCE, fronte: Math.PI / 2,
    statici(m) {
      suolo(m, 11, P.sabbia, P.terra, rng);
      for (let x = -12; x <= 12; x++) for (let z = 6; z <= 12; z++) m.p(x, 0, z, P.mare);
      mura(m, -8, -6, 16, 8, 5, P.pietraChiara);
    },
    dinamici(d, t) {
      // le macchine sulle mura, e il cerchio tracciato sulla sabbia
      const braccio = Math.sin(t * .9);
      for (let i = 0; i < 5; i++) d(-6 + i * .6, 7 + i * .5 + braccio * .8, -2, .6, P.legno);
      for (let k = 0; k < 3; k++) {
        const f = ((t * .5 + k * .33) % 1);
        d(-4 + f * 12, 8 + Math.sin(f * Math.PI) * 5, -1 + f * 8, .9, P.roccia);
      }
      for (let i = 0; i < 16; i++) {                          // il cerchio nella sabbia
        const a = i / 16 * Math.PI * 2;
        d(2 + Math.cos(a) * 2.2, 1.4, 3 + Math.sin(a) * 2.2, .4, P.terraScura);
      }
      omino(d, 2, 1.2, 3, P.tela, P.pelle);
      omino(d, 6, 1.2, 4, P.ferro, P.pelle, .9);              // il soldato che si avvicina
    },
  };
},

'via-emilia'(rng) {
  return {
    cielo: GIORNO, raggio: CALDO,
    statici(m) {
      suolo(m, 12, P.erba, P.terra, rng, .6);
      for (let x = -12; x <= 12; x++) for (let z = -1; z <= 1; z++) m.p(x, 1, z, P.pietraChiara);
      // le colonie infilate sulla strada, una ogni tanto, tutte uguali
      for (let k = 0; k < 4; k++) {
        const cx = -10 + k * 7;
        for (let i = 0; i < 4; i++) casa(m, cx + (i % 2) * 3, 3 + Math.floor(i / 2) * 3, 2, 2, 2, P.cotto, P.tetto, 1);
        for (let x = cx; x < cx + 5; x++) m.p(x, 1, 3, P.pietra);
        for (let z = 2; z < 8; z++) m.p(cx + 2, 1, z, P.pietra);
      }
      for (let i = 0; i < 6; i++) albero(m, -11 + i * 4, -6, 1, rng);
    },
    dinamici(d, t) {
      for (let k = 0; k < 3; k++) {                           // carri e viandanti
        const x = ((t * 2 + k * 9) % 22) - 11;                // il carro ha il bue davanti: si avvolge prima
        d(x, 2.2, 0, 1, P.legno); d(x - 1.2, 2, 0, .9, P.terraScura);
      }
      for (let i = 0; i < 8; i++)
        omino(d, ((t * 1.2 + i * 3.4) % 23) - 11.5, 2, (i % 2) ? .9 : -.9, P.tela, P.pelle, .75);
      for (let k = 0; k < 4; k++) fuoco(d, t, -8 + k * 7, 4, 4, 4, .5, k * .25);
    },
  };
},

'cesare-idi'(rng) {
  return {
    cielo: CUPO, raggio: 0xffd0b0, ambiente: .6, fronte: Math.PI / 2,
    statici(m) {
      suolo(m, 10, P.marmoOmbra, P.pietra, rng);
      for (let x = -8; x <= 8; x++) for (let y = 1; y <= 8; y++) m.p(x, y, -7, P.marmo);
      for (let z = -7; z <= 3; z++) for (let y = 1; y <= 8; y++) { m.p(-8, y, z, P.marmo); m.p(8, y, z, P.marmo); }
      for (let x = -8; x <= 8; x += 2) for (let z = -7; z <= 3; z += 2) m.p(x, 9, z, P.marmoOmbra);
      for (let i = 0; i < 5; i++) for (let k = 0; k < 3; k++)   // i gradini dei senatori
        m.p(-6 + i * 3, 1 + k, -5 + k, P.pietraChiara);
      m.box(-1, 1, -1, 3, 2, 2, P.marmo);                       // la sedia curule
    },
    dinamici(d, t) {
      // i congiurati si stringono attorno; poi la scena si ferma
      const f = (t * .18) % 1;
      const stretta = clamp01(f * 2);
      for (let i = 0; i < 12; i++) {
        const a = i / 12 * Math.PI * 2;
        const r = 6 - stretta * 4;
        omino(d, Math.cos(a) * r, 1.2, -1 + Math.sin(a) * r * .6, P.tela, P.pelle, .85);
        if (stretta > .8) d(Math.cos(a) * (r - .6), 2.6, -1 + Math.sin(a) * (r - .6) * .6, .3, P.ferro);
      }
      omino(d, 0, 3, -1, P.viola, P.pelle, 1);
      if (stretta > .9) for (let i = 0; i < 6; i++) {
        const g = (t * 2 + i * .17) % 1;
        d(Math.sin(i * 2.2) * .8, 3 - g * 1.6, -1 + Math.cos(i * 1.9) * .8, .3, P.sangue);
      }
    },
  };
},

'ara-pacis'(rng) {
  return {
    cielo: GIORNO, raggio: CALDO, fronte: Math.PI / 2,
    statici(m) {
      suolo(m, 10, P.pietraChiara, P.pietra, rng);
      // il recinto marmoreo dell'altare, aperto davanti
      for (let x = -6; x <= 6; x++) for (let y = 1; y <= 5; y++) m.p(x, y, -5, P.marmo);
      for (let z = -5; z <= 3; z++) for (let y = 1; y <= 5; y++) { m.p(-6, y, z, P.marmo); m.p(6, y, z, P.marmo); }
      for (let x = -6; x <= 6; x++) { m.p(x, 6, -5, P.marmoOmbra); }
      m.box(-2, 1, -2, 5, 2, 4, P.marmo);
      for (let i = 0; i < 4; i++) m.p(-5 + i * 3, 1, 4, P.marmoOmbra);
    },
    dinamici(d0, t) {
      // il corteo si scolpisce a rilievo lungo il fianco, figura dopo figura
      const f = (t * .13) % 1.25;
      const d = dissolvenza(d0, f, 1.25);   // il ciclo si ritira invece di spegnersi
      for (let i = 0; i < 12; i++) {
        if (f < i / 12) continue;
        omino(d, -5.5 + i, 2.4, -4.4, i % 4 === 0 ? P.oro : P.marmoOmbra, P.marmo, .8);
      }
      for (let i = 0; i < 8; i++) {                            // i festoni di frutta
        if (f < .5 + i / 20) continue;
        d(-5 + i * 1.5, 4.6, -4.4, .5, P.foglie);
      }
      for (let i = 0; i < 6; i++) {                            // il fumo dell'offerta
        const g = (t * .5 + i * .17) % 1;
        d(0, 3.4 + g * 4, 0, .7 * (1 - g * .5), P.fumo);
      }
    },
  };
},

/* ==================== impero e tardo antico ==================== */

pantheon(rng) {
  return {
    cielo: GIORNO, raggio: CALDO,
    statici(m) {
      suolo(m, 11, P.pietraChiara, P.pietra, rng);
      // il tamburo cilindrico
      for (let y = 0; y < 7; y++) for (let x = -7; x <= 7; x++) for (let z = -7; z <= 7; z++) {
        const dd = Math.hypot(x, z);
        if (dd > 7 || dd < 5.8) continue;
        m.p(x, 1 + y, z, P.cotto);
      }
      // la cupola a calotta, con l'oculo aperto in cima
      for (let y = 0; y < 6; y++) {
        const r = Math.sqrt(Math.max(0, 49 - (y * 1.2) * (y * 1.2)));
        for (let x = -8; x <= 8; x++) for (let z = -8; z <= 8; z++) {
          const dd = Math.hypot(x, z);
          if (dd > r || dd < r - 1.3) continue;
          if (y === 5 && dd < 2.2) continue;
          m.p(x, 8 + y, z, P.marmoOmbra);
        }
      }
      for (let i = 0; i < 4; i++) { m.colonna(-3 + i * 2, 9, 1, 6, P.marmo); m.p(-3 + i * 2, 7, 9, P.marmoOmbra); }
      for (let x = -4; x <= 4; x++) m.p(x, 8, 9, P.marmoOmbra);
    },
    dinamici(d, t) {
      // il fascio di luce dall'oculo che spazza il pavimento
      const a = t * .25;
      for (let i = 0; i < 14; i++) {
        const p = i / 14;
        d(Math.cos(a) * p * 4, 13 - p * 11.5, Math.sin(a) * p * 4, 1.1 - p * .5, P.oro);
      }
      folla(d, t, 0, 6, 8, 1.4, [P.tela, P.viola], 1.2);
    },
  };
},

'incendio-roma'(rng) {
  return {
    cielo: 0x2c1a14, nebbia: 0x3e241c, raggio: FUOCOLUCE, ambiente: .55,
    statici(m) {
      suolo(m, 12, P.pietraChiara, P.terra, rng);
      for (let i = 0; i < 12; i++) {
        const x = -10 + (i % 4) * 6, z = -9 + Math.floor(i / 4) * 6;
        casa(m, x, z, 4, 4, 3 + (i % 3), P.cotto, P.tetto, 1);
      }
      for (let x = -12; x <= 12; x++) m.p(x, 1, 2, P.pietra);
    },
    dinamici(d, t) {
      for (let i = 0; i < 8; i++) {
        const x = -9 + (i % 4) * 6, z = -8 + Math.floor(i / 4) * 6;
        fuoco(d, t, x, 5, z, 9, 1.4, i * .13);
      }
      for (let i = 0; i < 12; i++) {                            // chi scappa per la strada
        const p = ((t * 1.8 + i * 2.2) % 26) - 13;
        omino(d, p, 2, 2 + (i % 2) * .9, P.tela, P.pelle, .8);
      }
      for (let i = 0; i < 8; i++) {                             // secchi d'acqua, inutili
        const g = (t * 1.2 + i * .13) % 1;
        d(-6 + i * 2, 2.4 + Math.sin(g * Math.PI) * 2, -4, .4, P.acquaChiara);
      }
    },
  };
},

'terme-caracalla'(rng) {
  return {
    cielo: GIORNO, raggio: CALDO, fronte: Math.PI / 2,
    statici(m) {
      suolo(m, 12, P.marmoOmbra, P.pietra, rng);
      for (let x = -10; x <= 10; x++) for (let y = 1; y <= 9; y++) m.p(x, y, -8, P.cotto);
      for (let z = -8; z <= 4; z++) for (let y = 1; y <= 9; y++) { m.p(-10, y, z, P.cotto); m.p(10, y, z, P.cotto); }
      for (let z = -8; z <= 4; z++) for (let a = 0; a <= 16; a++) {   // la volta
        const an = Math.PI * a / 16;
        m.p(Math.round(-Math.cos(an) * 10), 10 + Math.round(Math.sin(an) * 3), z, P.pietraChiara);
      }
      for (let x = -6; x <= 6; x++) for (let z = -5; z <= 1; z++) m.p(x, 1, z, P.acqua);   // la natatio
      for (const cx of [-8, 8]) for (let z = -6; z <= 2; z += 4) m.colonna(cx, z, 2, 6, P.marmo);
    },
    dinamici(d, t) {
      for (let x = -6; x <= 6; x += 2) for (let z = -5; z <= 1; z += 2)
        d(x, 1.5 + Math.sin(t * 2 + x * .5 + z * .4) * .18, z, 1.8, P.acquaChiara);
      for (let i = 0; i < 10; i++) {                            // i bagnanti
        const a = t * .3 + i * .63;
        omino(d, Math.cos(a) * 4, 1.6, -2 + Math.sin(a) * 2.4, P.tela, P.pelle, .75);
      }
      for (let i = 0; i < 8; i++) {                             // il vapore
        const g = (t * .3 + i * .12) % 1;
        d(-5 + i * 1.4, 2 + g * 6, -2, 1 - g * .5, P.fumo);
      }
    },
  };
},

traiano(rng) {
  return {
    cielo: GIORNO, raggio: CALDO, fronte: Math.PI / 2,
    statici(m) {
      suolo(m, 11, P.pietraChiara, P.pietra, rng);
      for (let i = 0; i < 6; i++) { m.colonna(-9 + i * 3.4 | 0, -7, 1, 6, P.marmo); }
      for (let x = -10; x <= 8; x++) m.p(x, 7, -7, P.marmoOmbra);
      m.box(-2, 1, -1, 5, 2, 5, P.marmo);                       // il basamento
    },
    dinamici(d, t) {
      // il fregio si avvolge a spirale attorno alla colonna, salendo
      const f = (t * .12) % 1.25;
      for (let i = 0; i < 40; i++) {
        if (f < i / 40) continue;
        const a = i * .55, y = 3.4 + i * .3;
        d(Math.cos(a) * 1.5, y, Math.sin(a) * 1.5, .55, i % 5 === 0 ? P.oro : P.marmoOmbra);
      }
      d(0, 16.4, 0, 1.1, P.bronzo);
      folla(d, t, 0, 6, 8, 1.6, [P.tela, P.rosso], 1.2);
    },
  };
},

'villa-adriana'(rng) {
  return {
    cielo: GIORNO, raggio: CALDO,
    statici(m) {
      suolo(m, 12, P.erba, P.terra, rng, .6);
      // il Canopo: una vasca lunga con il colonnato attorno
      for (let x = -8; x <= 8; x++) for (let z = -2; z <= 2; z++) m.p(x, 0, z, P.acqua);
      for (let x = -9; x <= 9; x++) { m.p(x, 1, -3, P.marmo); m.p(x, 1, 3, P.marmo); }
      for (let x = -8; x <= 8; x += 2) { m.colonna(x, -3, 2, 4, P.marmo); m.colonna(x, 3, 2, 4, P.marmo); }
      for (let x = -8; x <= 8; x += 2) { m.p(x, 6, -3, P.marmoOmbra); m.p(x, 6, 3, P.marmoOmbra); }
      for (let y = 0; y < 4; y++) for (let x = -3; x <= 3; x++) for (let z = -3; z <= 3; z++) {
        const dd = Math.hypot(x, z);
        if (dd > 3.4 - y * .8 || dd < 2.4 - y * .8) continue;
        m.p(x + 11, 1 + y, z, P.pietraChiara);
      }
      for (let i = 0; i < 5; i++) albero(m, -10 + i * 5, 8, 1, rng);
    },
    dinamici(d, t) {
      for (let x = -8; x <= 8; x += 2) for (let z = -2; z <= 2; z += 2)
        d(x, .6 + Math.sin(t * 2 + x * .4 + z * .3) * .16, z, 1.8, P.acquaChiara);
      for (let i = 0; i < 8; i++)                                // le statue lungo la vasca
        d(-7 + i * 2, 2.4, i % 2 ? -3.8 : 3.8, .9, P.marmo);
      omino(d, 0, 1.6, 5, P.viola, P.pelle);
      for (let i = 0; i < 6; i++) {
        const g = (t * .35 + i * .17) % 1;
        d(11, 5 + g * 3, 0, .6 * (1 - g), P.fumo);
      }
    },
  };
},

ostia(rng) {
  return {
    cielo: GIORNO, raggio: CALDO,
    statici(m) {
      suolo(m, 12, P.pietraChiara, P.terra, rng);
      for (let x = -12; x <= 12; x++) for (let z = -12; z <= -7; z++) m.p(x, 0, z, P.mare);
      for (let z = -7; z <= -5; z++) for (let x = -10; x <= 10; x++) m.p(x, 1, z, P.pietra);
      for (let i = 0; i < 8; i++) {                              // i magazzini e le insulae
        const x = -10 + (i % 4) * 6, z = -2 + Math.floor(i / 4) * 6;
        casa(m, x, z, 5, 4, 4 + (i % 2), P.cotto, P.tetto, 1);
      }
      for (let x = -12; x <= 12; x++) m.p(x, 1, -4, P.pietra);
    },
    dinamici(d, t) {
      onde(d, t, 12, 3, [12, 6]);
      nave(d, t, -8 + ((t * .5) % 14), 1.2, -9, 1, 7, P.legno, P.tela, 0);
      for (let i = 0; i < 12; i++) {                             // gli scaricatori con i sacchi
        const p = ((t * 1.4 + i * 2) % 20) - 10;
        omino(d, p, 2, -5.5, P.terraScura, P.pelle, .8);
        d(p, 4, -5.5, .6, P.sabbia);
      }
      for (let i = 0; i < 6; i++)
        omino(d, -6 + i * 2.4, 2, -3.2, P.tela, P.pelle, .75);
    },
  };
},

'piazza-armerina'(rng) {
  return {
    cielo: GIORNO, raggio: CALDO, fronte: Math.PI / 2,
    statici(m) {
      suolo(m, 11, P.terra, P.terraScura, rng);
      for (let x = -9; x <= 9; x++) for (let y = 1; y <= 5; y++) m.p(x, y, -8, P.cotto);
      for (let z = -8; z <= 4; z++) for (let y = 1; y <= 5; y++) { m.p(-9, y, z, P.cotto); m.p(9, y, z, P.cotto); }
      for (let x = -9; x <= 9; x += 3) for (let z = -8; z <= 4; z += 3) m.p(x, 6, z, P.legno);
      for (let x = -8; x <= 8; x++) for (let z = -7; z <= 3; z++) m.p(x, 1, z, P.pietraChiara);
    },
    dinamici(d, t) {
      // il mosaico si compone tessera per tessera e disegna la grande caccia
      const f = (t * .12) % 1.3;
      const W = 17, H = 11;
      for (let r = 0; r < H; r++) for (let c = 0; c < W; c++) {
        if (f < (r * W + c) / (W * H)) continue;
        const x = -8 + c, z = -7 + r;
        const figura = (r % 4 === 1 && c % 5 < 2) || (r % 4 === 3 && c % 7 < 2);
        d(x, 1.6, z, .92, figura ? (c % 3 ? P.rosso : P.terraScura) : ((c + r) % 6 ? P.tela : P.sabbia));
      }
      omino(d, 0, 1.8, 6, P.viola, P.pelle);
    },
  };
},

aureliane(rng) {
  return {
    cielo: TRAMONTO, raggio: CALDO,
    statici(m) {
      suolo(m, 12, P.erbaScura, P.terra, rng, .8);
      for (let z = -12; z <= 12; z++) for (let y = 1; y <= 6; y++) m.p(0, y, z, P.cotto);
      for (let z = -12; z <= 12; z += 2) m.p(0, 7, z, P.cotto);
      for (let z = -9; z <= 9; z += 9) { torre(m, -1, z, 9, P.cotto); }
      for (let i = 0; i < 5; i++) casa(m, 4 + (i % 2) * 4, -9 + i * 4, 3, 3, 3, P.tela, P.tetto, 1);
    },
    dinamici(d0, t) {
      // il cantiere: i mattoni salgono lungo la muraglia, tratto dopo tratto
      const f = (t * .13) % 1.2;
      const d = dissolvenza(d0, f, 1.2);   // il ciclo si ritira invece di spegnersi
      for (let z = -12; z <= 12; z++) {
        const quando = (z + 12) / 25;
        if (f < quando) continue;
        const alto = clamp01((f - quando) * 12);
        for (let y = 0; y < 3; y++)
          d(0, 8 + y - (1 - alto) * 6, z, .95, y === 2 ? P.pietraChiara : P.cotto);
      }
      for (let i = 0; i < 10; i++)
        omino(d, 1.6, 1.1, -10 + i * 2.4, P.terraScura, P.pelle, .8);
      for (let i = 0; i < 8; i++) {
        const g = (t * .8 + i * .13) % 1;
        d(1.6, 2 + g * 7, -8 + i * 2.4, .5, P.cotto);
      }
    },
  };
},

'editto-milano'(rng) {
  return {
    cielo: GIORNO, raggio: CALDO, fronte: Math.PI / 2,
    statici(m) {
      suolo(m, 11, P.pietraChiara, P.pietra, rng);
      for (let i = 0; i < 6; i++) { m.colonna(-8 + i * 3, -7, 1, 7, P.marmo); m.p(-8 + i * 3, 8, -7, P.marmoOmbra); }
      for (let x = -9; x <= 8; x++) m.p(x, 9, -7, P.marmoOmbra);
      m.box(-3, 1, -3, 7, 1, 2, P.marmo);
    },
    dinamici(d, t) {
      // il crismon prende forma sopra la folla, e la folla smette di nascondersi
      const f = (t * .16) % 1.2;
      const braccia = [[0, 0], [0, 1], [0, 2], [0, 3], [0, -1], [0, -2],
                       [-1, 2.6], [1, 2.6], [-1, -1], [1, -1]];
      for (let i = 0; i < braccia.length; i++) {
        if (f < i / braccia.length) continue;
        d(braccia[i][0], 9 + braccia[i][1], -3, .7, P.oro);
      }
      const uscita = clamp01((f - .5) * 2);
      folla(d, t, 0, 3, 16, 1.4 + uscita * 2, [P.tela, P.viola, P.blu], 1.2);
      for (let i = 0; i < 6; i++) d(-6 + i * 2.4, 2.4, -2.4, .5, P.bronzo);
    },
  };
},

attila(rng) {
  return {
    cielo: 0x2a1c18, nebbia: 0x3a2620, raggio: FUOCOLUCE, ambiente: .5,
    statici(m) {
      suolo(m, 12, P.erbaScura, P.terra, rng);
      mura(m, -7, -6, 15, 11, 5, P.pietraChiara);
      for (let i = 0; i < 5; i++) casa(m, -5 + i * 3, -3, 3, 3, 3, P.cotto, P.tetto, 1);
      for (let z = -12; z <= 12; z++) m.p(-10, 1, z, P.acqua);
    },
    dinamici(d, t) {
      const f = (t * .12) % 1;
      const crollo = clamp01((f - .3) * 2.4);
      // le mura si aprono e la città brucia; poi restano solo le pietre
      for (let i = 0; i < 14; i++) {
        const x = -7 + i, alto = 6 - crollo * 6 * (.4 + ((i * 37) % 10) / 14);
        for (let y = 1; y < alto; y++) d(x, y, -6, 1, P.pietraChiara);
      }
      for (let k = 0; k < 4; k++) fuoco(d, t, -4 + k * 3, 4, -2, 8, 1.2, k * .2);
      for (let i = 0; i < 12; i++) {                             // chi fugge verso la laguna
        const p = clamp01(f * 1.6 - i * .05);
        omino(d, -7 - p * 4, 1.6, 2 + p * 8, P.tela, P.pelle, .8);
      }
    },
  };
},

odoacre(rng) {
  return {
    cielo: TRAMONTO, raggio: CALDO, fronte: Math.PI / 2,
    statici(m) {
      suolo(m, 10, P.marmoOmbra, P.pietra, rng);
      for (let x = -8; x <= 8; x++) for (let y = 1; y <= 7; y++) m.p(x, y, -7, P.marmo);
      for (let z = -7; z <= 3; z++) for (let y = 1; y <= 7; y++) { m.p(-8, y, z, P.marmo); m.p(8, y, z, P.marmo); }
      for (let x = -8; x <= 8; x += 2) for (let z = -7; z <= 3; z += 2) m.p(x, 8, z, P.marmoOmbra);
      m.box(-2, 1, -5, 5, 3, 2, P.oro);                          // il trono
    },
    dinamici(d, t) {
      /* Le insegne imperiali vengono tolte dal trono e portate via verso
         oriente: l'impero d'Occidente finisce come un pacco spedito. */
      const f = (t * .14) % 1;
      const via = clamp01((f - .35) * 1.8);
      d(0, 4.4 - via * .8, -4, .9, via > .05 ? P.marmoOmbra : P.oro);
      if (via > .05) {
        d(-1 + via * 12, 2.6, -2 + via * 6, .8, P.oro);
        d(-1 + via * 12, 3.4, -2 + via * 6, .6, P.viola);
        omino(d, -1.6 + via * 12, 1.2, -2 + via * 6, P.terraScura, P.pelle, .85);
      }
      omino(d, 3, 1.2, -3, P.ferro, P.pelle, .95);
      folla(d, t, 0, 2, 10, 2, [P.tela, P.viola], 1.2);
    },
  };
},

teodorico(rng) {
  return {
    cielo: GIORNO, raggio: CALDO,
    statici(m) {
      suolo(m, 11, P.erbaScura, P.terra, rng);
      // il mausoleo: due tamburi e sopra il monolito che fa da cupola
      for (let y = 0; y < 5; y++) for (let x = -5; x <= 5; x++) for (let z = -5; z <= 5; z++) {
        const dd = Math.hypot(x, z);
        if (dd > 5 || dd < 3.6) continue;
        m.p(x, 1 + y, z, P.pietraChiara);
      }
      for (let y = 0; y < 4; y++) for (let x = -4; x <= 4; x++) for (let z = -4; z <= 4; z++) {
        const dd = Math.hypot(x, z);
        if (dd > 4 || dd < 2.8) continue;
        m.p(x, 6 + y, z, P.marmo);
      }
      for (let x = -4; x <= 4; x++) for (let z = -4; z <= 4; z++)
        if (Math.hypot(x, z) <= 4) m.p(x, 10, z, P.marmoOmbra);
      for (let i = 0; i < 4; i++) albero(m, -9 + i * 6, 8, 1, rng);
    },
    dinamici(d, t) {
      // il monolito calato in posizione: trecento tonnellate di pietra istriana
      const f = (t * .1) % 1.3;
      const giu = clamp01(f * 2);
      for (let x = -4; x <= 4; x++) for (let z = -4; z <= 4; z++) {
        if (Math.hypot(x, z) > 4 || Math.hypot(x, z) < 2.4) continue;
        d(x, 11 + (1 - giu) * 5, z, .95, P.marmo);
      }
      for (let i = 0; i < 10; i++)                               // le corde e gli uomini
        omino(d, Math.cos(i * .63) * 7, 1.1, Math.sin(i * .63) * 7, P.terraScura, P.pelle, .8);
      if (giu > .95) for (let i = 0; i < 8; i++) {
        const g = (t * .8 + i * .12) % 1;
        d(Math.cos(i) * 4, 11 + g, Math.sin(i) * 4, .5 * (1 - g), P.polvere);
      }
    },
  };
},

boezio(rng) {
  return {
    cielo: CUPO, nebbia: 0x252a34, raggio: 0xd8ccb0, ambiente: .5, fronte: Math.PI / 2,
    statici(m) {
      suolo(m, 9, P.pietraScura, P.pietra, rng);
      for (let x = -6; x <= 6; x++) for (let y = 1; y <= 6; y++) m.p(x, y, -6, P.pietra);
      for (let z = -6; z <= 2; z++) for (let y = 1; y <= 6; y++) { m.p(-6, y, z, P.pietra); m.p(6, y, z, P.pietra); }
      for (let x = -6; x <= 6; x++) for (let z = -6; z <= 2; z++) m.p(x, 7, z, P.pietraScura);
      for (let x = -1; x <= 1; x++) for (let y = 3; y <= 5; y++) m.p(x, y, -6, P.acquaChiara);  // la feritoia
      for (let y = 3; y <= 5; y++) m.p(0, y, -6, P.ferro);
      m.box(-4, 1, -2, 3, 1, 2, P.legno);
    },
    dinamici(d, t) {
      /* La luce dalla feritoia, e la Filosofia che appare accanto al
         prigioniero. Prima il quadro era di fatto fermo: l'unico movimento era
         mezzo blocco in dodici secondi, che a occhio è una fotografia. Ora il
         raggio ha il pulviscolo che scende lungo il fascio e la Filosofia
         compare e svanisce per davvero. */
      for (let i = 0; i < 12; i++) {
        const p = i / 12;
        d(p * -3.4, 4.4 - p * 2.4, -5.6 + p * 5, .8 - p * .3, P.oro);
      }
      for (let i = 0; i < 9; i++) {                   // il pulviscolo nel fascio
        const g = (t * .22 + i * .111) % 1;
        d(g * -3.4 + Math.sin(t * .7 + i) * .3, 4.6 - g * 2.6, -5.6 + g * 5, .28, P.tela);
      }
      omino(d, -3.4, 2.2, -1, P.terraScura, P.pelle);
      const app = clamp01(Math.sin(t * .42) * 1.6);   // presente, poi non più
      if (app > .04) omino(d, -1, 2.2 + (1 - app) * 1.2, 0, P.biancoIt, P.marmo, .35 + app * .7);
      for (let i = 0; i < 6; i++) d(-3.8 + i * .3, 3.4, -1.6, .3, P.tela);   // il libro aperto
    },
  };
},

'san-vitale'(rng) {
  return {
    cielo: 0x1a1c26, nebbia: 0x24283a, raggio: CALDO, ambiente: .6, fronte: Math.PI / 2,
    statici(m) {
      suolo(m, 10, P.marmoOmbra, P.pietraScura, rng);
      for (let x = -9; x <= 9; x++) for (let y = 1; y <= 11; y++) {
        if (y > 8 && Math.abs(x) < 9 - (y - 8) * 2.8) continue;
        m.p(x, y, -7, P.pietraChiara);
      }
      for (let z = -7; z <= 3; z++) for (let y = 1; y <= 9; y++) { m.p(-9, y, z, P.pietraChiara); m.p(9, y, z, P.pietraChiara); }
      for (const cx of [-5, 5]) { m.colonna(cx, 1, 1, 7, P.marmo); m.p(cx, 8, 1, P.oro); }
    },
    dinamici(d0, t) {
      /* I due cortei si compongono ai lati: Giustiniano da una parte, Teodora
         dall'altra, nessuno dei due mise mai piede a Ravenna. */
      const f = (t * .13) % 1.3;
      const d = dissolvenza(d0, f, 1.3);   // il ciclo si ritira invece di spegnersi
      for (let i = 0; i < 8; i++) {
        const p = clamp01((f - (i / 16)) * 5);
        if (p <= 0) continue;
        const da = arrivo(d, p);
        omino(da, -7.5 + i * .9, 3.4, -6.3, i === 4 ? P.viola : P.biancoIt, P.pelle, .8);
        if (i === 4) da(-7.5 + i * .9, 5.6, -6.3, .6, P.oro);
      }
      for (let i = 0; i < 8; i++) {
        const p = clamp01((f - (.5 + i / 16)) * 5);
        if (p <= 0) continue;
        const da = arrivo(d, p);
        omino(da, 7.5 - i * .9, 3.4, -6.3, i === 3 ? P.porpora : P.biancoIt, P.pelle, .8);
      }
      for (let i = 0; i < 20; i++) {                             // il fondo d'oro
        if (f < i / 20) continue;
        d(-7 + (i % 10) * 1.5, 7.4 + Math.floor(i / 10) * 1.1, -6.3, .9, i % 4 ? P.oro : P.bronzo);
      }
      omino(d, 0, 1.2, 3, P.tela, P.pelle);
    },
  };
},

'guerra-gotica'(rng) {
  return {
    cielo: CUPO, nebbia: 0x2a2c30, raggio: 0xd0c0a4, ambiente: .5,
    statici(m) {
      suolo(m, 12, P.terraScura, P.terra, rng, .8);
      mura(m, -6, -5, 13, 10, 6, P.pietraChiara);
      for (let i = 0; i < 4; i++) casa(m, -4 + i * 3, -2, 3, 3, 2, P.cotto, P.tetto, 1);
    },
    dinamici(d, t) {
      /* Roma passa di mano avanti e indietro: gli assedianti diventano assediati
         e viceversa, cinque volte in vent'anni. */
      const f = (t * .09) % 1;
      const goti = f < .5;
      const fase = goti ? f * 2 : (f - .5) * 2;
      const cA = goti ? P.oliva : P.viola;
      const cB = goti ? P.viola : P.oliva;
      for (let i = 0; i < 16; i++) {
        const a = i / 16 * Math.PI * 2;
        const r = 11 - fase * 2;
        omino(d, Math.cos(a) * r, 1.1, Math.sin(a) * r * .8, cA, P.pelle, .8);
      }
      for (let i = 0; i < 8; i++)
        omino(d, -5 + i * 1.6, 7.6, -5, cB, P.pelle, .8);
      for (let i = 0; i < 10; i++) {
        const g = (t * .5 + i * .1) % 1;
        d(-8 + i * 1.8, 2 + g * 5, 8, .8 * (1 - g), P.fumo);
      }
    },
  };
},

'peste-giustiniano'(rng) {
  return {
    cielo: 0x231f24, nebbia: 0x2e2830, raggio: 0xc0b098, ambiente: .5,
    statici(m) {
      suolo(m, 12, P.pietraChiara, P.terra, rng);
      for (let x = -12; x <= 12; x++) for (let z = -12; z <= -8; z++) m.p(x, 0, z, P.mare);
      for (let x = -10; x <= 10; x++) m.p(x, 1, -7, P.pietra);
      for (let i = 0; i < 8; i++) {
        const x = -10 + (i % 4) * 6, z = -3 + Math.floor(i / 4) * 6;
        casa(m, x, z, 4, 4, 3, P.tela, P.tetto, 1);
      }
    },
    dinamici(d0, t) {
      // la nave attracca, e le croci si moltiplicano fra le case
      const f = (t * .1) % 1;
      const d = dissolvenza(d0, f, 1);   // il ciclo si ritira invece di spegnersi
      nave(d, t, -10 + Math.min(1, f * 3) * 6, 1.2, -9, 1, 7, P.legno, P.tela, 0);
      const n = Math.floor(clamp01((f - .3) * 1.6) * 22);
      for (let i = 0; i < n; i++) {
        const x = -10 + (i % 8) * 2.6, z = 0 + Math.floor(i / 8) * 3;
        d(x, 2.4, z, .3, P.tronco);
        d(x, 3.1, z, .3, P.tronco);
        d(x - .5, 2.9, z, .3, P.tronco);
        d(x + .5, 2.9, z, .3, P.tronco);
      }
      for (let i = 0; i < 3; i++) omino(d, -6 + i * 5, 1.6, 7, P.nero, P.nero, .85);
      for (let i = 0; i < 10; i++) {
        const g = (t * .3 + i * .1) % 1;
        d(-8 + i * 1.8, 2 + g * 5, 6, .8 * (1 - g), P.fumo);
      }
    },
  };
},

'tiberio-capri'(rng) {
  return {
    cielo: GIORNO, raggio: CALDO,
    statici(m) {
      for (let x = -12; x <= 12; x++) for (let z = -12; z <= 12; z++) m.p(x, 0, z, P.mare);
      // il faraglione su cui sta la villa
      for (let x = -12; x <= 12; x++) for (let z = -12; z <= 12; z++) {
        const h = Math.round(9 - Math.hypot(x, z) * 1.1);
        if (h < 1) continue;
        for (let y = 1; y <= h; y++) m.p(x, y, z, y === h ? P.erbaScura : P.roccia);
      }
      casa(m, -3, -2, 7, 5, 3, P.marmo, P.tetto, 10);
      for (let i = 0; i < 4; i++) m.colonna(-4 + i * 3, 4, 10, 4, P.marmo);
    },
    dinamici(d, t) {
      onde(d, t, 12, 3, [9, 9]);
      omino(d, 0, 14, 3, P.viola, P.pelle);
      for (let i = 0; i < 10; i++) {                             // i gabbiani attorno alla rupe
        const a = t * .6 + i * .63;
        d(Math.cos(a) * (9 + i * .3), 12 + Math.sin(a * 2 + t) * 2.4, Math.sin(a) * (9 + i * .3), .45, P.biancoIt);
      }
      for (let k = 0; k < 2; k++) {                              // le vele lontane
        const x = ((t * .5 + k * 12) % 26) - 13;
        nave(d, t, x, 1.2, k ? -10 : 10, 1, 4, P.legno, P.tela, 0);
      }
    },
  };
},

'costantino-arco'(rng) {
  return {
    cielo: TRAMONTO, raggio: CALDO, fronte: Math.PI / 2,
    statici(m) {
      suolo(m, 11, P.pietraChiara, P.pietra, rng);
      // l'arco a tre fornici
      for (let x = -8; x <= 8; x++) for (let y = 1; y <= 10; y++) {
        const grande = Math.abs(x) < 2 && y < 7;
        const piccoli = Math.abs(Math.abs(x) - 5) < 1.2 && y < 5;
        if (grande || piccoli) continue;
        for (let z = -1; z <= 1; z++) m.p(x, y, z, P.marmo);
      }
      for (let x = -9; x <= 9; x++) for (let z = -2; z <= 2; z++) m.p(x, 11, z, P.marmoOmbra);
      for (const cx of [-7, -3, 3, 7]) for (let y = 1; y <= 9; y++) m.p(cx, y, -2, P.marmo);
    },
    dinamici(d, t) {
      /* I rilievi vengono staccati da monumenti più antichi e rimontati qui:
         l'impero comincia a citare sé stesso. */
      const f = (t * .13) % 1.25;
      const posti = [[-6, 9], [-3, 9], [0, 9], [3, 9], [6, 9], [-6, 6], [6, 6], [-3, 3], [3, 3]];
      for (let i = 0; i < posti.length; i++) {
        const arrivo = clamp01((f - i / posti.length) * 8);
        if (arrivo <= 0) continue;
        d(posti[i][0], posti[i][1] + (1 - arrivo) * 6, -1.7, 1.1, i % 3 ? P.marmoOmbra : P.oro);
      }
      folla(d, t, 0, 6, 10, 1.6, [P.tela, P.rosso], 1.2);
    },
  };
},

/* ==================== longobardi, bizantini, normanni ==================== */

longobardi(rng) {
  return {
    cielo: TRAMONTO, raggio: CALDO,
    statici(m) {
      suolo(m, 12, P.erbaScura, P.terra, rng, 1);
      for (let x = -12; x <= 12; x++) for (let z = -1; z <= 1; z++) m.p(x, 1, z, P.terraScura);
      for (let i = 0; i < 3; i++) casa(m, 6 + (i % 2) * 3, 5 + i * 2, 3, 3, 2, P.cotto, P.tetto, 1);
      for (let i = 0; i < 5; i++) albero(m, -11 + i * 5, -8, 1, rng);
    },
    dinamici(d, t) {
      // il popolo in armi che scende dal Friuli: carri, donne, bestiame, guerrieri
      const giro = v => ((v + 11) % 22 + 22) % 22 - 11;
      const av = t * 1.4;
      for (let i = 0; i < 10; i++) omino(d, giro(av - i * 1.5), 2, -.8 + (i % 3) * .8, P.oliva, P.pelle, .85);
      for (let k = 0; k < 3; k++) {
        const x = giro(av - 5 - k * 5);
        d(x, 2.4, 0, 1.1, P.legno); d(x - 1.2, 2.2, 0, .9, P.terraScura);
        omino(d, x + 1, 2.8, 0, P.tela, P.pelle, .7);
      }
      for (let i = 0; i < 6; i++) d(giro(av - 16 - i * 1.4), 2, 1.6, .9, P.tela);
      for (let i = 0; i < 10; i++) {
        const g = (t * .7 + i * .1) % 1;
        d(giro(av - 20 + g * 3), 2 + g, .5, .7 * (1 - g), P.polvere);   // anche la polvere si avvolge
      }
    },
  };
},

rotari(rng) {
  return {
    cielo: CUPO, raggio: CALDO, ambiente: .6, fronte: Math.PI / 2,
    statici(m) {
      suolo(m, 10, P.legno, P.tronco, rng);
      for (let x = -8; x <= 8; x++) for (let y = 1; y <= 6; y++) m.p(x, y, -7, P.legno);
      for (let z = -7; z <= 3; z++) for (let y = 1; y <= 6; y++) { m.p(-8, y, z, P.legno); m.p(8, y, z, P.legno); }
      for (let k = 0; k < 5; k++) for (let x = -8 + k; x <= 8 - k; x++)
        for (let z = -7; z <= 3; z++) if (x === -8 + k || x === 8 - k) m.p(x, 7 + k, z, P.tronco);
      m.box(-2, 1, -5, 5, 3, 2, P.tronco);
    },
    dinamici(d, t) {
      // i capitoli dell'editto si accumulano in pergamene, uno dopo l'altro
      const f = (t * .12) % 1.3;
      for (let i = 0; i < 24; i++) {
        const p = clamp01((f - (i / 24)) * 5);
        if (p <= 0) continue;
        const da = arrivo(d, p);
        da(-6 + (i % 8) * 1.6, 2 + Math.floor(i / 8) * .6, -1, .8, P.tela);
      }
      omino(d, 0, 4.4, -5, P.rosso, P.pelle, 1);
      for (let i = 0; i < 8; i++) omino(d, -5 + i * 1.5, 1.2, 2, P.oliva, P.pelle, .8);
      d(0, 6.6, -5, .6, P.oro);
    },
  };
},

'monza-corona'(rng) {
  return {
    cielo: CUPO, raggio: CALDO, ambiente: .6, fronte: Math.PI / 2,
    statici(m) {
      suolo(m, 10, P.marmoOmbra, P.pietra, rng);
      cattedrale(m, -4, -6, 9, 9, 7, P.marmo, P.tetto);
      for (let i = 0; i < 4; i++) m.colonna(-6 + i * 4, 4, 1, 5, P.marmo);
    },
    dinamici(d, t) {
      // la corona ferrea sospesa, che gira lentamente mostrando il cerchio interno
      const a = t * .5;
      for (let i = 0; i < 12; i++) {
        const an = a + i / 12 * Math.PI * 2;
        d(Math.cos(an) * 1.6, 10 + Math.sin(t * .8) * .2, 2 + Math.sin(an) * 1.6, .55, P.oro);
        d(Math.cos(an) * 1.35, 9.4 + Math.sin(t * .8) * .2, 2 + Math.sin(an) * 1.35, .3, P.ferro);
      }
      for (let i = 0; i < 6; i++) {
        const g = (t * .4 + i * .17) % 1;
        d(Math.cos(i) * (2 + g * 3), 10 + g * 2, 2 + Math.sin(i) * (2 + g * 3), .3 * (1 - g), P.brace);
      }
      folla(d, t, 0, 4, 10, 1.5, [P.tela, P.viola], 1.2);   // la folla sta sul sagrato, non oltre
    },
  };
},

bobbio(rng) {
  return {
    cielo: 0x27354a, nebbia: 0x35455c, raggio: CALDO,
    statici(m) {
      for (let x = -12; x <= 12; x++) for (let z = -12; z <= 12; z++) {
        const h = Math.min(7, Math.round(Math.max(0, (Math.abs(x) - 5) * 1.2)));
        m.p(x, h, z, h > 4 ? P.roccia : h > 0 ? P.foglieScure : P.erbaScura);
        for (let y = 0; y < h; y++) m.p(x, y, z, P.roccia);
      }
      for (let z = -12; z <= 12; z++) for (let x = -2; x <= 2; x++) m.p(x, 0, z, P.acqua);
      cattedrale(m, 3, -3, 6, 7, 5, P.pietraChiara, P.tetto);
      ponte(m, -3, 0, 7, 3, P.pietraChiara);
    },
    dinamici(d, t) {
      // i monaci copiano: le pagine si accumulano nello scriptorium
      const f = (t * .14) % 1.3;
      for (let i = 0; i < 14; i++) {
        if (f < i / 14) continue;
        d(4 + (i % 5) * 1.1, 7 + Math.floor(i / 5) * .6, 0, .7, P.tela);
      }
      for (let i = 0; i < 5; i++) omino(d, 4 + i * 1.2, 1.2, 4, P.nero, P.pelle, .8);
      for (let x = -2; x <= 2; x += 2) for (let z = -12; z <= 12; z += 4)
        d(x, .6 + Math.sin(t * 2 + z * .4) * .2, z, 1.8, P.acquaChiara);
    },
  };
},

cividale(rng) {
  return {
    cielo: CUPO, raggio: CALDO, ambiente: .6, fronte: Math.PI / 2,
    statici(m) {
      suolo(m, 9, P.pietraChiara, P.pietra, rng);
      for (let x = -7; x <= 7; x++) for (let y = 1; y <= 8; y++) m.p(x, y, -6, P.pietraChiara);
      for (let z = -6; z <= 2; z++) for (let y = 1; y <= 8; y++) { m.p(-7, y, z, P.pietraChiara); m.p(7, y, z, P.pietraChiara); }
      for (let x = -7; x <= 7; x += 2) for (let z = -6; z <= 2; z += 2) m.p(x, 9, z, P.legno);
      for (let x = -3; x <= 3; x++) for (let y = 2; y <= 5; y++)
        if (Math.abs(x) === 3 || y === 5) m.p(x, y, -5.9 | 0, P.marmo);
    },
    dinamici(d0, t) {
      // le sei sante in stucco emergono dalla parete sopra l'arco
      const f = (t * .13) % 1.3;
      const d = dissolvenza(d0, f, 1.3);   // il ciclo si ritira invece di spegnersi
      for (let i = 0; i < 6; i++) {
        const arrivo = clamp01((f - i / 8) * 8);
        if (arrivo <= 0) continue;
        omino(d, -5 + i * 2, 5.4, -5.6 + (1 - arrivo) * 1.6, P.marmo, P.marmo, .95);
        d(-5 + i * 2, 7.4, -5.6, .5, P.oro);
      }
      for (let i = 0; i < 8; i++) {
        const g = (t * .3 + i * .12) % 1;
        d(-4 + i * 1.2, 3 + g * 4, -2, .3, P.oro);
      }
      omino(d, 0, 1.2, 1, P.viola, P.pelle);
    },
  };
},

'carlo-magno'(rng) {
  return {
    cielo: TRAMONTO, raggio: CALDO,
    statici(m) {
      suolo(m, 12, P.erbaScura, P.terra, rng);
      mura(m, -6, -6, 13, 12, 6, P.cotto);
      torre(m, -7, -7, 9, P.cotto); torre(m, 6, -7, 9, P.cotto);
      for (let i = 0; i < 3; i++) casa(m, -4 + i * 3, -3, 3, 3, 3, P.tela, P.tetto, 1);
    },
    dinamici(d0, t) {
      /* Pavia si arrende: la porta si apre, il re franco entra, e la corona
         longobarda passa di testa. */
      const f = (t * .11) % 1;
      const d = dissolvenza(d0, f, 1);   // il ciclo si ritira invece di spegnersi
      const apre = clamp01((f - .25) * 3);
      for (let y = 1; y <= 4 - apre * 4; y++) d(0, y, 8, 1, P.legno);
      for (let i = 0; i < 12; i++) {
        const p = clamp01((f - .35) * 1.8 - i * .04);
        if (p <= 0) continue;
        omino(d, -2 + (i % 5) * 1.1, 1.6, 10 - p * 9, i === 0 ? P.viola : P.blu, P.pelle, .85);
      }
      if (f > .8) { d(-1.5, 3.6, 1, .7, P.oro); d(-1.5, 4.3, 1, .5, P.ferro); }
      for (let i = 0; i < 8; i++) omino(d, -4 + i * 1.3, 7.6, -6, P.oliva, P.pelle, .8);
    },
  };
},

'natale-800'(rng) {
  return {
    cielo: CUPO, raggio: CALDO, ambiente: .6, fronte: Math.PI / 2,
    statici(m) {
      suolo(m, 10, P.marmoOmbra, P.pietra, rng);
      for (let x = -9; x <= 9; x++) for (let y = 1; y <= 10; y++) {
        if (y > 7 && Math.abs(x) < 9 - (y - 7) * 3) continue;
        m.p(x, y, -7, P.marmo);
      }
      for (let z = -7; z <= 3; z++) for (let y = 1; y <= 9; y++) { m.p(-9, y, z, P.marmo); m.p(9, y, z, P.marmo); }
      for (const cx of [-5, 5]) { m.colonna(cx, 0, 1, 8, P.marmo); m.p(cx, 9, 0, P.oro); }
      m.box(-2, 1, -5, 5, 2, 2, P.oro);
    },
    dinamici(d, t) {
      // la corona cala sulla testa: un gesto, e l'impero d'Occidente rinasce
      const f = (t * .16) % 1.2;
      const giu = clamp01((f - .3) * 2.2);
      omino(d, 0, 1.4, -3, P.rosso, P.pelle, 1.1);
      omino(d, 2.4, 1.4, -3.6, P.biancoIt, P.pelle, 1);
      d(0, 5.6 - giu * 1.2, -3, .8, P.oro);
      for (let i = 0; i < 10; i++) {
        const g = (t * .5 + i * .1) % 1;
        d(Math.cos(i * 1.9) * (1 + g * 4), 5 + g * 3, -3 + Math.sin(i * 1.7) * (1 + g * 4), .35 * (1 - g), P.oro);
      }
      folla(d, t, 0, 3, 16, 1.6, [P.tela, P.viola, P.blu], 1.2);
    },
  };
},

'arabi-mazara'(rng) {
  return {
    cielo: GIORNO, raggio: CALDO,
    statici(m) {
      for (let x = -12; x <= 12; x++) for (let z = -12; z <= 12; z++) m.p(x, 0, z, P.mare);
      for (let x = -12; x <= 12; x++) for (let z = 2; z <= 12; z++) { m.p(x, 1, z, P.sabbia); m.p(x, 0, z, P.terra); }
      for (let i = 0; i < 5; i++) casa(m, -9 + i * 4, 7, 3, 3, 2, P.tela, P.tetto, 2);
      for (let i = 0; i < 4; i++) albero(m, -10 + i * 6, 11, 2, rng);
    },
    dinamici(d, t) {
      onde(d, t, 12, 3, [12, 10]);
      // la flotta che sbarca: navi in fila e uomini che guadano
      for (let k = 0; k < 4; k++) {
        const x = -9 + k * 5;
        nave(d, t, x, 1.2, -2 - (k % 2), 1, 6, P.legno, P.verdeIt, 0);
        for (let i = 0; i < 4; i++) {
          const p = clamp01(((t * .12 + k * .1) % 1) * 2 - i * .1);
          if (p <= 0) continue;
          omino(d, x + 1 + i * .8, 1.6, -1 + p * 4, P.verdeIt, P.pelle, .8);
        }
      }
    },
  };
},

'san-marco'(rng) {
  return {
    cielo: NOTTE, raggio: CALDO, ambiente: .6,
    statici(m) {
      for (let x = -12; x <= 12; x++) for (let z = -12; z <= 12; z++) m.p(x, 0, z, P.mare);
      for (let x = 4; x <= 12; x++) for (let z = -12; z <= 12; z++) { m.p(x, 1, z, P.sabbia); m.p(x, 0, z, P.terra); }
      for (let z = -6; z <= 6; z++) m.p(4, 1, z, P.pietraChiara);
      for (let i = 0; i < 3; i++) casa(m, 7, -6 + i * 5, 4, 4, 3, P.tela, P.tetto, 2);
    },
    dinamici(d, t) {
      onde(d, t, 12, 3, [12, 3]);
      const f = (t * .12) % 1;
      // la cassa viene portata a bordo, coperta di carne di maiale
      const x = 5 - f * 12;
      nave(d, t, x, 1.2, 0, 1, 7, P.legno, P.tela, 0);
      if (f < .35) {
        const p = f / .35;
        d(6 - p * 2, 2.4, 0, .9, P.legno);
        for (let i = 0; i < 3; i++) d(6 - p * 2, 3.1, -.6 + i * .6, .5, P.rosso);
        omino(d, 6.6 - p * 2, 2, 1.4, P.terraScura, P.pelle, .8);
      } else {
        d(x + 2.4, 2.4, 0, .9, P.legno);
      }
      for (let i = 0; i < 4; i++) omino(d, 5.4, 2, -3 + i * 2, P.nero, P.pelle, .8);
      stelle(d, 14, 9, 11);
    },
  };
},

amalfi(rng) {
  return {
    cielo: GIORNO, raggio: CALDO,
    statici(m) {
      for (let x = -12; x <= 12; x++) for (let z = -12; z <= 12; z++) m.p(x, 0, z, P.mare);
      // la costa a picco, con le case aggrappate
      for (let x = -12; x <= 12; x++) for (let z = 1; z <= 12; z++) {
        const h = Math.round((z - 1) * .9);
        for (let y = 1; y <= h; y++) m.p(x, y, z, y === h ? P.erbaScura : P.roccia);
      }
      for (let i = 0; i < 7; i++) {
        const z = 2 + i, h = Math.round((z - 1) * .9);
        casa(m, -8 + i * 2.4 | 0, z, 3, 2, 2, P.tela, P.tetto, h + 1);
      }
      cattedrale(m, 2, 6, 5, 5, 4, P.tela, P.tetto);
    },
    dinamici(d, t) {
      onde(d, t, 12, 3, [12, 12]);
      for (let k = 0; k < 3; k++) {
        const x = ((t * .8 + k * 9) % 20) - 12;      // la nave è lunga sei: entra ed esce senza sporgere
        nave(d, t, x, 1.2, -4 - k * 3, 1, 6, P.legno, P.tela, 0);
      }
      // la bussola: l'ago che oscilla e si ferma sempre a nord
      const ago = Math.sin(t * 2) * Math.exp(-((t * .3) % 3)) * .8;
      for (let i = 0; i < 5; i++)
        d(6 + Math.sin(ago) * (i - 2) * .5, 12, 3 + Math.cos(ago) * (i - 2) * .5, .4, i < 2 ? P.rosso : P.ferro);
    },
  };
},

garigliano(rng) {
  return {
    cielo: TRAMONTO, raggio: CALDO,
    statici(m) {
      suolo(m, 12, P.erbaScura, P.terra, rng, .8);
      for (let z = -12; z <= 12; z++) for (let x = -2; x <= 2; x++) m.p(x, 0, z, P.acqua);
      mura(m, 4, -3, 7, 7, 4, P.pietraChiara);
      for (let i = 0; i < 4; i++) albero(m, -9 + i * 3, 8, 1, rng);
    },
    dinamici(d, t) {
      // l'accerchiamento: quattro colori diversi che stringono la stessa rocca
      const f = (t * .12) % 1;
      const stretta = clamp01(f * 1.6);
      const parti = [[P.rosso, 0], [P.blu, 1.57], [P.oliva, 3.14], [P.viola, 4.71]];
      for (let s = 0; s < 4; s++) {
        const [c, a0] = parti[s];
        for (let i = 0; i < 6; i++) {
          const a = a0 + (i - 2.5) * .18;
          /* L'accerchiamento parte da otto e stringe a tre: con dodici, e la
             rocca spostata a destra, mezzo esercito cominciava la manovra
             sospeso nel vuoto fuori dalla piastra. */
          const r = 8 - stretta * 5;
          omino(d, 5 + Math.cos(a) * r, 1.6, .5 + Math.sin(a) * r * .7, c, P.pelle, .8);
        }
      }
      for (let x = -2; x <= 2; x += 2) for (let z = -12; z <= 12; z += 4)
        d(x, .6 + Math.sin(t * 2 + z * .4) * .2, z, 1.8, P.acquaChiara);
      if (stretta > .9) fuoco(d, t, 7, 5, .5, 8, 1.2, 0);
    },
  };
},

'anno-mille'(rng) {
  return {
    cielo: NOTTE, raggio: CALDO, ambiente: .55,
    statici(m) {
      suolo(m, 12, P.erbaScura, P.terra, rng, 1);
      for (let i = 0; i < 6; i++) casa(m, -10 + i * 4, -8 + (i % 3) * 4, 3, 3, 2, P.tela, P.tetto, 1);
      cattedrale(m, 2, 4, 5, 6, 4, P.pietraChiara, P.tetto);
    },
    dinamici(d0, t) {
      /* La notte passa e non finisce niente: all'alba si torna nei campi, e i
         solchi ricominciano ad allargarsi. */
      const f = (t * .1) % 1;
      const d = dissolvenza(d0, f, 1);   // il ciclo si ritira invece di spegnersi
      const alba = clamp01((f - .35) * 2);
      folla(d, t, 3, 6, 12, 1.6, [P.tela, P.nero], 1.2);
      for (let i = 0; i < 12; i++) {
        if (alba <= 0) break;
        const p = clamp01(alba * 1.4 - i * .05);
        omino(d, -10 + i * 1.6, 1.6, 8 - p * 12, P.terraScura, P.pelle, .8);
        for (let k = 0; k < 3; k++) d(-10 + i * 1.6, 1.4, 8 - p * 12 + k, .8, P.terra);
      }
      if (alba < .2) stelle(d, 18, 9, 11);
    },
  };
},

'guido-arezzo'(rng) {
  return {
    cielo: CUPO, raggio: CALDO, ambiente: .6, fronte: Math.PI / 2,
    statici(m) {
      suolo(m, 9, P.pietraChiara, P.pietra, rng);
      for (let x = -8; x <= 8; x++) for (let y = 1; y <= 7; y++) m.p(x, y, -7, P.pietra);
      for (let z = -7; z <= 2; z++) for (let y = 1; y <= 7; y++) { m.p(-8, y, z, P.pietra); m.p(8, y, z, P.pietra); }
      for (let x = -8; x <= 8; x += 2) for (let z = -7; z <= 2; z += 2) m.p(x, 8, z, P.legno);
      m.box(-3, 1, -1, 7, 1, 2, P.legno);
    },
    dinamici(d, t) {
      // le sei sillabe salgono di grado sul rigo: ut re mi fa sol la
      const f = (t * .3) % 1.4;
      for (let r = 0; r < 4; r++) for (let x = -6; x <= 6; x++) d(x, 3 + r * .9, -6.4, .7, P.marmoOmbra);
      for (let i = 0; i < 6; i++) {
        if (f < i / 6) continue;
        d(-5 + i * 1.9, 3 + i * .55, -6.2, .8, i % 2 ? P.oro : P.rosso);
      }
      for (let i = 0; i < 5; i++) omino(d, -4 + i * 2, 1.2, 1, P.nero, P.pelle, .8);
      for (let i = 0; i < 8; i++) {                                // le note che salgono
        const g = (t * .5 + i * .12) % 1;
        d(-4 + i * 1.2, 5 + g * 4, -3, .35 * (1 - g), P.oro);
      }
    },
  };
},

'duomo-pisa'(rng) {
  return {
    cielo: GIORNO, raggio: CALDO,
    statici(m) {
      suolo(m, 12, P.erba, P.terra, rng);
      cattedrale(m, -5, -4, 9, 9, 6, P.marmo, P.marmoOmbra);
      // il battistero
      for (let y = 0; y < 6; y++) for (let x = -3; x <= 3; x++) for (let z = -3; z <= 3; z++) {
        const dd = Math.hypot(x, z);
        if (dd > 3.4 - y * .3 || dd < 2.4 - y * .3) continue;
        m.p(x + 9, 1 + y, z + 3, P.marmo);
      }
    },
    dinamici(d, t) {
      /* La torre si alza e comincia subito a pendere: la correzione dei
         costruttori la fa venire su curva come una banana. */
      const f = (t * .12) % 1.3;
      const piani = Math.floor(clamp01(f * 1.4) * 8);
      for (let k = 0; k < piani; k++) {
        const pend = Math.max(0, k - 2) * .28;
        for (let i = 0; i < 8; i++) {
          const a = i / 8 * Math.PI * 2;
          d(-9 + Math.cos(a) * 2 + pend, 1 + k * 1.6, 5 + Math.sin(a) * 2, .8, P.marmo);
          d(-9 + Math.cos(a) * 2 + pend, 1.8 + k * 1.6, 5 + Math.sin(a) * 2, .6, P.marmoOmbra);
        }
      }
      folla(d, t, 0, 5, 8, 1.6, [P.tela, P.rosso], 1.2);   // sul prato, non oltre il bordo
    },
  };
},

civitate(rng) {
  return {
    cielo: TRAMONTO, raggio: CALDO,
    statici(m) {
      suolo(m, 12, P.erbaScura, P.terra, rng, 1);
      for (let i = 0; i < 3; i++) albero(m, -11, -8 + i * 8, 1, rng);
    },
    dinamici(d, t) {
      // la cavalleria normanna sfonda; poi i vincitori si inginocchiano al papa
      const f = (t * .1) % 1;
      const carica = clamp01(f * 2);
      for (let i = 0; i < 12; i++) {
        const z = -6 + (i % 6) * 2.2;
        d(-9 + carica * 9, 1.8, z, 1.1, P.terraScura);
        omino(d, -9 + carica * 9, 2.6, z, P.ferro, P.pelle, .8);
      }
      const resa = clamp01((f - .6) * 3);
      for (let i = 0; i < 10; i++)
        omino(d, 4 + (i % 5) * 1.2, 1.6 - resa * .5, -4 + Math.floor(i / 5) * 2, P.biancoIt, P.pelle, .8 - resa * .2);
      omino(d, 8, 1.6, 0, P.oro, P.pelle, 1.1);
      for (let i = 0; i < 12; i++) {
        const g = (t * .5 + i * .08) % 1;
        d(-4 + carica * 8, 1.4 + g * 2.6, -6 + (i % 7) * 2, .8 * (1 - g), P.polvere);
      }
    },
  };
},

'salerno-medica'(rng) {
  return {
    cielo: GIORNO, raggio: CALDO, fronte: Math.PI / 2,
    statici(m) {
      suolo(m, 10, P.pietraChiara, P.pietra, rng);
      for (let x = -9; x <= 9; x++) for (let y = 1; y <= 6; y++) m.p(x, y, -7, P.tela);
      for (let z = -7; z <= 3; z++) for (let y = 1; y <= 6; y++) { m.p(-9, y, z, P.tela); m.p(9, y, z, P.tela); }
      for (let x = -9; x <= 9; x += 2) for (let z = -7; z <= 3; z += 2) m.p(x, 7, z, P.legno);
      for (let i = 0; i < 4; i++) m.box(-7 + i * 4, 1, -1, 3, 1, 2, P.legno);
      for (let i = 0; i < 5; i++) m.p(-8 + i * 4, 3, -6, P.cotto);
    },
    dinamici(d, t) {
      // quattro maestri di quattro lingue attorno allo stesso corpo
      const colori = [P.viola, P.verdeIt, P.blu, P.tela];
      for (let i = 0; i < 4; i++) {
        const a = i / 4 * Math.PI * 2 + t * .12;
        omino(d, Math.cos(a) * 3.4, 1.2, -2 + Math.sin(a) * 2.4, colori[i], P.pelle, .85);
      }
      for (let i = 0; i < 4; i++) d(-1.5 + i * .9, 2.4, -2, .8, P.tela);
      for (let i = 0; i < 10; i++) {                               // le erbe appese a seccare
        d(-8 + i * 1.8, 6.4 + Math.sin(t * 1.5 + i) * .1, -5, .5, P.foglie);
      }
      const f = (t * .2) % 1.2;
      for (let i = 0; i < 8; i++) {
        if (f < i / 8) continue;
        d(5 + (i % 4) * .9, 2.4 + Math.floor(i / 4) * .7, -1, .7, P.tela);
      }
    },
  };
},

'palermo-normanna'(rng) {
  return {
    cielo: TRAMONTO, raggio: CALDO,
    statici(m) {
      suolo(m, 12, P.sabbia, P.terra, rng);
      mura(m, -7, -6, 15, 12, 6, P.pietraChiara);
      for (let i = 0; i < 4; i++) casa(m, -5 + i * 3, -3, 3, 3, 3, P.tela, P.tetto, 1);
      m.colonna(6, -4, 1, 9, P.tela);
    },
    dinamici(d, t) {
      /* Cinque mesi d'assedio in pochi secondi: le scale salgono, le insegne in
         cima cambiano, la città resta la stessa. */
      const f = (t * .09) % 1;
      const salita = clamp01((f - .2) * 2.2);
      for (let k = 0; k < 3; k++) {
        const x = -4 + k * 5;
        for (let i = 0; i < 7; i++) d(x, 1 + i, 6.4 - i * .28, .5, P.legno);
        for (let i = 0; i < 3; i++) {
          const p = clamp01(salita * 1.4 - i * .12 - k * .06);
          if (p <= 0) continue;
          omino(d, x, 1.4 + p * 5.6, 6.4 - p * 2, P.ferro, P.pelle, .8);
        }
      }
      const insegna = f > .75;
      bandiera(d, t, 6, 10, -4, 2, insegna ? [P.rosso, P.biancoIt] : [P.verdeIt, P.verdeIt], 0);
      for (let i = 0; i < 10; i++) omino(d, -5 + i * 1.4, 7.6, -6, insegna ? P.ferro : P.verdeIt, P.pelle, .8);
    },
  };
},

'bologna-universita'(rng) {
  return {
    cielo: GIORNO, raggio: CALDO, fronte: Math.PI / 2,
    statici(m) {
      suolo(m, 10, P.cotto, P.pietra, rng);
      for (let x = -9; x <= 9; x++) for (let y = 1; y <= 7; y++) m.p(x, y, -7, P.cotto);
      for (let z = -7; z <= 3; z++) for (let y = 1; y <= 7; y++) { m.p(-9, y, z, P.cotto); m.p(9, y, z, P.cotto); }
      for (let x = -9; x <= 9; x += 3) for (let z = -7; z <= 3; z += 3) m.p(x, 8, z, P.legno);
      for (let r = 0; r < 4; r++) for (let x = -6; x <= 6; x += 2)
        m.p(x, 1 + Math.floor(r / 2), -4 + r * 1.6 | 0, P.legno);   // i banchi in gradinata
      m.box(-1, 1, -6, 3, 3, 1, P.legno);
    },
    dinamici(d, t) {
      // gli studenti pagano il maestro: le monete passano di mano
      const f = (t * .2) % 1.2;
      for (let r = 0; r < 4; r++) for (let i = 0; i < 6; i++)
        omino(d, -6 + i * 2.4, 2 + Math.floor(r / 2), -3.4 + r * 1.6, r % 2 ? P.viola : P.blu, P.pelle, .8);
      omino(d, 0, 4.2, -6, P.nero, P.pelle, 1);
      for (let i = 0; i < 8; i++) {
        const p = ((f + i / 8) % 1);
        d(-5 + i * 1.4 + p * 2, 3 + Math.sin(p * Math.PI) * 2, -3 - p * 2.4, .35, P.oro);
      }
      for (let i = 0; i < 6; i++) d(-2 + i * .8, 4.6, -5.6, .5, P.tela);
    },
  };
},

canossa(rng) {
  return {
    cielo: 0x223040, nebbia: 0x2e3c4c, raggio: FREDDO, ambiente: .6,
    statici(m) {
      // la rocca su uno sperone, tutta neve
      for (let x = -12; x <= 12; x++) for (let z = -12; z <= 12; z++) {
        const h = Math.max(0, Math.round(7 - Math.hypot(x, z) * .75));
        m.p(x, h, z, h > 3 ? P.roccia : P.neve);
        for (let y = 0; y < h; y++) m.p(x, y, z, P.roccia);
      }
      mura(m, -3, -3, 7, 7, 5, P.pietraChiara);
      torre(m, -4, -4, 9, P.pietraChiara);
    },
    dinamici(d, t) {
      // tre giorni scalzo davanti al portone: la penitenza come atto politico
      const giorno = Math.floor((t * .12) % 3);
      omino(d, 4.5, 8.2, 0, giorno === 2 ? P.tela : P.viola, P.pelle, .9);
      for (let k = 0; k <= giorno; k++) d(5.5, 8.2 + k * .4, -2 + k, .3, P.oro);
      for (let i = 0; i < 6; i++) omino(d, -1 + i * .8, 8.2, -3.6, P.nero, P.pelle, .75);
      for (let i = 0; i < 30; i++) {                                // la neve che continua
        const f = (t * .3 + i * .033) % 1;
        d(((i * 6151) % 25) - 12, 14 - f * 14, ((i * 3571) % 25) - 12, .4, P.neve);
      }
    },
  };
},

crociata(rng) {
  return {
    cielo: GIORNO, raggio: CALDO,
    statici(m) {
      for (let x = -12; x <= 12; x++) for (let z = -12; z <= 12; z++) m.p(x, 0, z, P.mare);
      for (let x = -12; x <= -6; x++) for (let z = -12; z <= 12; z++) { m.p(x, 1, z, P.sabbia); m.p(x, 0, z, P.terra); }
      for (let z = -8; z <= 8; z++) m.p(-6, 1, z, P.pietraChiara);
      for (let i = 0; i < 4; i++) casa(m, -11, -8 + i * 5, 4, 4, 3, P.tela, P.tetto, 2);
    },
    dinamici(d, t) {
      onde(d, t, 12, 3, [12, 12]);
      // le navi caricano e partono: pellegrini sopra, contratti sotto
      for (let k = 0; k < 3; k++) {
        const f = ((t * .1 + k * .33) % 1);
        const x = -6 + f * 12;                        // la nave è lunga sette: salpa senza uscire dal mare
        nave(d, t, x, 1.2, -7 + k * 7, 1, 8, P.legno, k % 2 ? P.biancoIt : P.tela, 0);
        for (let i = 0; i < 4; i++) d(x + 1 + i * .9, 2.2, -7 + k * 7, .6, P.rosso);
      }
      for (let i = 0; i < 10; i++)
        omino(d, -5.4, 2, -8 + i * 1.8, i % 3 ? P.tela : P.rosso, P.pelle, .8);
      for (let i = 0; i < 6; i++) d(-8 + i * .6, 2.4, 2, .5, P.oro);    // il conto dei genovesi
    },
  };
},

'ruggero-ii'(rng) {
  return {
    cielo: TRAMONTO, raggio: CALDO, fronte: Math.PI / 2,
    statici(m) {
      suolo(m, 10, P.marmoOmbra, P.pietra, rng);
      for (let x = -9; x <= 9; x++) for (let y = 1; y <= 8; y++) m.p(x, y, -7, P.marmo);
      for (let z = -7; z <= 3; z++) for (let y = 1; y <= 8; y++) { m.p(-9, y, z, P.marmo); m.p(9, y, z, P.marmo); }
      for (let x = -9; x <= 9; x += 3) m.p(x, 9, -7, P.oro);
      m.box(-2, 1, -5, 5, 3, 2, P.porpora);
    },
    dinamici(d0, t) {
      /* Il regno si compone: le tre culture — greca, araba, latina — portano
         ciascuna il proprio registro allo stesso trono. */
      const f = (t * .13) % 1.3;
      const d = dissolvenza(d0, f, 1.3);   // il ciclo si ritira invece di spegnersi
      const gruppi = [[P.blu, -6], [P.verdeIt, 0], [P.rosso, 6]];
      for (let g = 0; g < 3; g++) {
        const [c, x0] = gruppi[g];
        for (let i = 0; i < 4; i++) {
          const p = clamp01((f - g * .2) * 2 - i * .06);
          if (p <= 0) continue;
          omino(d, x0 + (i % 2) * 1.2, 1.2, 5 - p * 6, c, P.pelle, .8);
        }
        if (f > g * .2 + .4) d(x0, 2.6, -1, .7, P.tela);
      }
      omino(d, 0, 4.4, -5, P.oro, P.pelle, 1.1);
      d(0, 6.6, -5, .6, P.oro);
    },
  };
},

'cappella-palatina'(rng) {
  return {
    cielo: 0x191b26, nebbia: 0x23283a, raggio: CALDO, ambiente: .55, fronte: Math.PI / 2,
    statici(m) {
      suolo(m, 9, P.marmoOmbra, P.pietraScura, rng);
      for (let x = -8; x <= 8; x++) for (let y = 1; y <= 9; y++) m.p(x, y, -7, P.pietraChiara);
      for (let z = -7; z <= 2; z++) for (let y = 1; y <= 9; y++) { m.p(-8, y, z, P.pietraChiara); m.p(8, y, z, P.pietraChiara); }
      for (const cx of [-4, 4]) for (let z = -5; z <= 0; z += 5) { m.colonna(cx, z, 1, 6, P.marmo); m.p(cx, 7, z, P.oro); }
    },
    dinamici(d, t) {
      /* Quattro civiltà nella stessa stanza: il soffitto a muqarnas arabo, i
         mosaici bizantini, gli archi normanni, le iscrizioni latine. */
      const f = (t * .12) % 1.4;
      for (let i = 0; i < 30; i++) {                                // il soffitto a stalattiti
        const p = clamp01((f - (i / 40)) * 5);
        if (p <= 0) continue;
        const da = arrivo(d, p);
        const x = -7 + (i % 10) * 1.5, z = -6 + Math.floor(i / 10) * 3;
        da(x, 10 - ((i % 3) * .5), z, .8, i % 4 ? P.legno : P.oro);
      }
      for (let i = 0; i < 18; i++) {                                // il fondo d'oro bizantino
        const p = clamp01((f - (.4 + i / 45)) * 5);
        if (p <= 0) continue;
        const da = arrivo(d, p);
        da(-6 + (i % 9) * 1.5, 5.4 + Math.floor(i / 9) * 1.2, -6.4, .9, i % 3 ? P.oro : P.bronzo);
      }
      for (let i = 0; i < 10; i++) {                                // le iscrizioni sul cornicione
        const p = clamp01((f - (.8 + i / 50)) * 5);
        if (p <= 0) continue;
        const da = arrivo(d, p);
        da(-7 + i * 1.6, 4.4, -6.4, .5, P.biancoIt);
      }
      omino(d, 0, 1.2, 1, P.viola, P.pelle);
    },
  };
},

'venezia-arsenale'(rng) {
  return {
    cielo: GIORNO, raggio: CALDO,
    statici(m) {
      for (let x = -12; x <= 12; x++) for (let z = -12; z <= 12; z++) m.p(x, 0, z, P.acqua);
      for (let x = -12; x <= 12; x++) for (let z = -12; z <= -3; z++) { m.p(x, 1, z, P.pietraChiara); m.p(x, 0, z, P.terra); }
      for (let x = -12; x <= 12; x++) for (let z = 6; z <= 12; z++) { m.p(x, 1, z, P.pietraChiara); m.p(x, 0, z, P.terra); }
      for (let i = 0; i < 5; i++) {                                 // le tese, i capannoni dove si monta
        m.guscio(-11 + i * 5, 2, -8, 4, 4, 5, P.cotto);
        for (let x = 0; x < 4; x++) m.p(-11 + i * 5 + x, 6, -8, P.tetto);
      }
      mura(m, -12, 8, 24, 3, 4, P.cotto);
    },
    dinamici(d, t) {
      /* La catena di montaggio del Cinquecento: ogni scafo avanza di una
         postazione e ne esce una galea al giorno. */
      const f = (t * .18) % 1;
      for (let k = 0; k < 5; k++) {
        const avanz = (f + k / 5) % 1;
        const x = -11 + avanz * 17;                   // lo scafo cresce fino a sette blocchi: si ferma prima del bordo
        const grado = Math.floor(avanz * 4);
        for (let i = 0; i < 4 + grado; i++) d(x + i * .8, 1.6, 2, .9, P.legno);
        if (grado >= 2) for (let i = 0; i < 4; i++) d(x + 1.6, 2.4 + i, 2, .4, P.tronco);
        if (grado >= 3) for (let i = 0; i < 2; i++) d(x + 1.6, 4 + i * 1.2, 2, 1.4, P.tela);
      }
      for (let i = 0; i < 14; i++)
        omino(d, -11 + i * 1.8, 2, -1.4, P.terraScura, P.pelle, .75);
      for (let k = 0; k < 5; k++) fuoco(d, t, -10 + k * 5, 7, -8, 4, .5, k * .2);
    },
  };
},

'lega-lombarda'(rng) {
  return {
    cielo: TRAMONTO, raggio: CALDO,
    statici(m) {
      suolo(m, 12, P.erbaScura, P.terra, rng, .8);
      for (let i = 0; i < 5; i++) albero(m, -11 + i * 6, -10, 1, rng);
      m.box(-2, 1, -2, 5, 1, 5, P.pietraChiara);
    },
    dinamici(d, t) {
      /* Sedici città che si erano fatte guerra giurano insieme: gli stendardi
         convergono al centro e restano lì. */
      const f = (t * .11) % 1.3;
      const colori = [P.rosso, P.blu, P.verdeIt, P.oro, P.viola, P.menta, P.corallo, P.porpora];
      for (let i = 0; i < 16; i++) {
        const a = i / 16 * Math.PI * 2;
        const arrivo = clamp01(f * 1.5 - i * .04);
        const r = 12 - arrivo * 8.5;
        bandiera(d, t, Math.cos(a) * r, 2, Math.sin(a) * r, 3, [colori[i % colori.length], P.biancoIt], i);
        omino(d, Math.cos(a) * (r + .8), 1.2, Math.sin(a) * (r + .8), P.ferro, P.pelle, .8);
      }
      if (f > .85) for (let i = 0; i < 10; i++) {
        const g = (t * .6 + i * .1) % 1;
        d(Math.cos(i * 1.9) * g * 5, 3 + g * 3, Math.sin(i * 1.9) * g * 5, .4 * (1 - g), P.oro);
      }
    },
  };
},

'torri-bologna'(rng) {
  return {
    cielo: TRAMONTO, raggio: CALDO,
    statici(m) {
      suolo(m, 12, P.cotto, P.terra, rng);
      for (let i = 0; i < 10; i++) {
        const x = -10 + (i % 5) * 5, z = -8 + Math.floor(i / 5) * 7;
        casa(m, x, z, 4, 4, 3, P.cotto, P.tetto, 1);
      }
      for (let x = -12; x <= 12; x++) { m.p(x, 1, 0, P.pietra); m.p(x, 4, 2, P.cotto); }   // il portico
      for (let x = -12; x <= 12; x += 3) for (let y = 1; y < 4; y++) m.p(x, y, 2, P.cotto);
    },
    dinamici(d, t) {
      /* La gara fra famiglie: le torri crescono a turno, una supera l'altra e
         poi qualcuna cede. */
      const f = (t * .1) % 1.2;
      const torri = [[-7, -3, 14], [-2, 2, 18], [3, -4, 11], [7, 3, 9], [0, -6, 7], [-9, 5, 6]];
      for (let k = 0; k < torri.length; k++) {
        const [x, z, hmax] = torri[k];
        const su = clamp01((f - k * .08) * 2.2);
        const crollo = k === 3 ? clamp01((f - .85) * 8) : 0;
        const h = Math.round(hmax * su * (1 - crollo));
        for (let y = 0; y < h; y++)
          for (const [dx, dz] of [[0, 0], [1, 0], [0, 1], [1, 1]])
            d(x + dx, 1 + y, z + dz, 1, y === h - 1 ? P.pietraChiara : P.cotto);
        if (crollo > .05) for (let i = 0; i < 6; i++)
          d(x + ((i * 53) % 5) - 2, 1 + crollo * 3, z + ((i * 71) % 5) - 2, .8, P.polvere);
      }
    },
  };
},

francesco(rng) {
  return {
    cielo: GIORNO, raggio: CALDO,
    statici(m) {
      suolo(m, 12, P.erba, P.terra, rng, 1.2);
      for (let i = 0; i < 5; i++) casa(m, -10 + i * 4, -8, 3, 3, 3, P.pietraChiara, P.tetto, 1);
      for (let x = -12; x <= 12; x++) m.p(x, 1, -3, P.pietra);
      for (let i = 0; i < 5; i++) albero(m, -9 + i * 5, 8, 1, rng);
    },
    dinamici(d0, t) {
      /* Si spoglia in piazza: i vestiti cadono uno a uno, e attorno gli uccelli
         si radunano al posto della folla. */
      const f = (t * .12) % 1.2;
      const d = dissolvenza(d0, f, 1.2);   // il ciclo si ritira invece di spegnersi
      const spoglio = clamp01(f * 2);
      omino(d, 0, 1.6, 0, spoglio > .8 ? P.pelle : P.viola, P.pelle, .95);
      for (let i = 0; i < 4; i++) {
        const p = clamp01(spoglio * 1.5 - i * .2);
        if (p <= 0) continue;
        d(-.8 - p * 1.6, 1.4, .4 + p * .8, .7, [P.viola, P.rosso, P.oro, P.tela][i]);
      }
      folla(d, t, -5, -1, 8, 1.2, [P.tela, P.nero], 1.2);
      const uccelli = clamp01((f - .5) * 2.4);
      for (let i = 0; i < 16; i++) {
        if (uccelli <= 0) break;
        const a = t * .5 + i * .4;
        const r = 8 - uccelli * 5.5;
        d(Math.cos(a) * r, 3 + Math.sin(a * 2 + t) * 1.6 + (1 - uccelli) * 4, Math.sin(a) * r, .4, P.nero);
      }
    },
  };
},

'federico-melfi'(rng) {
  return {
    cielo: TRAMONTO, raggio: CALDO,
    statici(m) {
      suolo(m, 12, P.erbaScura, P.terra, rng, 1.4);
      mura(m, -6, -5, 13, 11, 6, P.pietraChiara);
      torre(m, -7, -6, 10, P.pietraChiara); torre(m, 6, -6, 10, P.pietraChiara);
      torre(m, -7, 5, 10, P.pietraChiara); torre(m, 6, 5, 10, P.pietraChiara);
    },
    dinamici(d0, t) {
      /* Le Costituzioni escono dal castello e si diffondono: un corpo di leggi
         uguale per tutto il regno, portato dai messi in ogni direzione. */
      const f = (t * .13) % 1.2;
      const d = dissolvenza(d0, f, 1.2);   // il ciclo si ritira invece di spegnersi
      for (let i = 0; i < 8; i++) {
        const a = i / 8 * Math.PI * 2;
        const p = clamp01(f * 1.4 - i * .03);
        d(Math.cos(a) * p * 12, 2.4, Math.sin(a) * p * 12, .7, P.tela);
        if (p > .1) omino(d, Math.cos(a) * p * 12, 1.2, Math.sin(a) * p * 12 + .8, P.rosso, P.pelle, .75);
      }
      omino(d, 0, 8, 0, P.oro, P.pelle, 1.1);
      for (let i = 0; i < 6; i++) {                                 // i falchi dell'imperatore
        const a = t * .6 + i * 1.05;
        d(Math.cos(a) * 9, 12 + Math.sin(a * 2) * 1.6, Math.sin(a) * 9, .45, P.terraScura);
      }
    },
  };
},

'napoli-universita'(rng) {
  return {
    cielo: GIORNO, raggio: CALDO, fronte: Math.PI / 2,
    statici(m) {
      suolo(m, 10, P.pietraChiara, P.pietra, rng);
      for (let x = -9; x <= 9; x++) for (let y = 1; y <= 7; y++) m.p(x, y, -7, P.tela);
      for (let z = -7; z <= 3; z++) for (let y = 1; y <= 7; y++) { m.p(-9, y, z, P.tela); m.p(9, y, z, P.tela); }
      for (let x = -9; x <= 9; x += 3) for (let z = -7; z <= 3; z += 3) m.p(x, 8, z, P.legno);
      m.box(-2, 1, -6, 5, 2, 1, P.marmo);
    },
    dinamici(d, t) {
      /* Un ateneo di Stato: gli studenti entrano privati ed escono funzionari
         del regno, con il sigillo in mano. */
      const f = (t * .14) % 1.2;
      for (let i = 0; i < 12; i++) {
        const p = ((f + i / 12) % 1);
        const dentro = p > .2 && p < .8;
        omino(d, -8 + p * 16, 1.2, 1 - (dentro ? 3 : 0), dentro ? P.blu : P.viola, P.pelle, .8);
        if (p > .8) d(-8 + p * 16, 3, 1, .35, P.oro);
      }
      omino(d, 0, 3.2, -6, P.nero, P.pelle, 1);
      for (let i = 0; i < 6; i++) d(-3 + i * 1.2, 2.4, -5.6, .5, P.tela);
    },
  };
},

/* ==================== comuni, signorie, Rinascimento ==================== */

cortenuova(rng) {
  return {
    cielo: CUPO, raggio: FUOCOLUCE,
    statici(m) {
      suolo(m, 12, P.terraScura, P.terra, rng, .6);
      for (let i = 0; i < 3; i++) albero(m, -11, -8 + i * 8, 1, rng);
    },
    dinamici(d, t) {
      // il Carroccio milanese viene preso e portato via come trofeo
      const f = (t * .1) % 1;
      const preso = clamp01((f - .4) * 2);
      const cx = -2 + preso * 10;
      for (let x = -2; x <= 2; x++) for (let z = -1; z <= 1; z++) d(cx + x, 2, z, 1, P.legno);
      for (let y = 0; y < 5; y++) d(cx, 3 + y, 0, .6, P.tronco);
      for (let i = 0; i < 3; i++) d(cx + .8 + i * .7, 7.4, 0, .8, i === 1 ? P.biancoIt : P.rossoIt);
      for (let i = 0; i < 14; i++)
        omino(d, -9 + f * 6 + (i % 7) * 1.2, 1.6, -5 + Math.floor(i / 7) * 2.4, P.ferro, P.pelle, .8);
      for (let i = 0; i < 10; i++)
        omino(d, 4 + (i % 5) * 1.2, 1.6, -4 + Math.floor(i / 5) * 2.4, P.oro, P.pelle, .8);
      for (let i = 0; i < 12; i++) {
        const g = (t * .5 + i * .08) % 1;
        d(-3 + i, 1.6 + g * 2.4, -3 + (i % 5), .8 * (1 - g), P.polvere);
      }
    },
  };
},

'benevento-1266'(rng) {
  return {
    cielo: CUPO, raggio: FUOCOLUCE,
    statici(m) {
      suolo(m, 12, P.erbaScura, P.terra, rng, 1);
      for (let z = -12; z <= 12; z++) for (let x = 8; x <= 10; x++) m.p(x, 1, z, P.acqua);
      ponte(m, 6, 0, 6, 3, P.pietraChiara);
    },
    dinamici(d, t) {
      /* Manfredi cade combattendo: la corona sveva rotola, e la casa di Francia
         raccoglie il Mezzogiorno. */
      const f = (t * .1) % 1;
      const urto = clamp01(f * 2);
      for (let i = 0; i < 14; i++)
        omino(d, -9 + urto * 5 + (i % 7) * 1.2, 1.6, -5 + Math.floor(i / 7) * 2.2, P.blu, P.pelle, .8);
      const vivi = Math.round(12 * (1 - clamp01((f - .5) * 2)));
      for (let i = 0; i < vivi; i++)
        omino(d, 5 - urto * 3 - (i % 6) * 1.2, 1.6, -4 + Math.floor(i / 6) * 2.2, P.oro, P.pelle, .8);
      const rotola = clamp01((f - .55) * 2.4);
      d(2 - rotola * 5, 1.4 + Math.abs(Math.sin(rotola * 9)) * .6, 2 + rotola * 3, .6, P.oro);
      for (let i = 0; i < 12; i++) {
        const g = (t * .5 + i * .08) % 1;
        d(-2 + i, 1.6 + g * 2.4, -3 + (i % 5), .8 * (1 - g), P.polvere);
      }
    },
  };
},

montaperti(rng) {
  return {
    cielo: TRAMONTO, raggio: FUOCOLUCE,
    statici(m) {
      suolo(m, 12, P.terra, P.terraScura, rng, 1.6);
      for (let z = -12; z <= 12; z++) for (let x = 9; x <= 11; x++) m.p(x, 1, z, P.acqua);
      for (let i = 0; i < 4; i++) albero(m, -11, -8 + i * 6, 1, rng);
    },
    dinamici(d, t) {
      /* Il tradimento: uno dei portainsegne fiorentini taglia l'asta, e la
         schiera si sfalda in un attimo. */
      const f = (t * .1) % 1;
      const taglio = f > .45;
      bandiera(d, t, 0, 1.6, -1, taglio ? 1 : 4, taglio ? [] : [P.rossoIt, P.biancoIt], 0);
      const rotta = taglio ? clamp01((f - .45) * 2.4) : 0;
      for (let i = 0; i < 18; i++)
        omino(d, -3 - rotta * 7 + (i % 6) * 1.1, 1.8, -6 + Math.floor(i / 6) * 2.2, P.rossoIt, P.pelle, .8);
      for (let i = 0; i < 16; i++)
        omino(d, 5 - clamp01(f * 2) * 3 + (i % 8) * 1.1, 1.8, -6 + Math.floor(i / 8) * 2.4, P.nero, P.pelle, .8);
      for (let i = 0; i < 14; i++) {
        const g = (t * .5 + i * .07) % 1;
        d(-1 + Math.sin(i * 2.2) * 3, 1.8 + g * 3, -5 + (i % 8) * 1.4, .85 * (1 - g), P.polvere);
      }
    },
  };
},

vespri(rng) {
  return {
    cielo: TRAMONTO, raggio: FUOCOLUCE,
    statici(m) {
      suolo(m, 12, P.pietraChiara, P.terra, rng);
      cattedrale(m, -4, -7, 8, 8, 5, P.sabbia, P.tetto);
      for (let i = 0; i < 6; i++) casa(m, -11 + i * 4, 5, 3, 3, 3, P.tela, P.tetto, 1);
    },
    dinamici(d, t) {
      /* All'ora dei vespri la campana suona e la piazza si rivolta: in un mese
         l'isola è perduta per gli Angioini. */
      const f = (t * .12) % 1;
      const camp = Math.sin(t * 5) * .3;
      d(-6 + camp, 11.4, -6, .8, P.bronzo);
      const rivolta = clamp01((f - .25) * 2.4);
      for (let i = 0; i < 22; i++) {
        const a = i * 2.399, r = 2 + (i % 6) * 1.1;
        omino(d, Math.cos(a) * r, 1.2 + Math.abs(Math.sin(t * 4 + i)) * rivolta * .5,
          3 + Math.sin(a) * r * .8, i % 4 ? P.tela : P.rosso, P.pelle, .8);
        if (rivolta > .5 && i % 3 === 0)
          d(Math.cos(a) * r, 3.2, 3 + Math.sin(a) * r * .8, .35, P.ferro);
      }
      const fuga = clamp01((f - .5) * 2);
      for (let i = 0; i < 8; i++)
        omino(d, -10 + i * 1.2, 1.2, 10 - fuga * 20, P.biancoIt, P.pelle, .8);
    },
  };
},

curzola(rng) {
  return {
    cielo: 0x1e3450, nebbia: 0x2a4260, raggio: CALDO,
    statici(m) {
      for (let x = -12; x <= 12; x++) for (let z = -12; z <= 12; z++) m.p(x, 0, z, P.mare);
      for (let x = -12; x <= -8; x++) for (let z = -12; z <= 12; z++) {
        const h = Math.max(1, Math.round(3 - Math.abs(z) * .15));
        for (let y = 1; y <= h; y++) m.p(x, y, z, y === h ? P.foglieScure : P.roccia);
      }
    },
    dinamici(d, t) {
      onde(d, t, 12, 3, null);
      const urto = Math.sin(t * .5) * 2;
      for (let k = 0; k < 4; k++) {
        nave(d, t, -5 - urto, 1.2, -8 + k * 5, 1, 7, P.legno, P.rossoIt, 3);
        nave(d, t, 5 + urto, 1.2, -8 + k * 5, -1, 7, P.tronco, P.verdeIt, 3);
      }
      /* Fra i prigionieri c'è Marco Polo: una figura viene portata via mentre
         le altre restano a combattere. */
      const f = (t * .1) % 1;
      if (f > .5) {
        const p = (f - .5) * 2;
        omino(d, -2 + p * 10, 2.2, 6, P.viola, P.pelle, .85);
        d(-2 + p * 10, 3.6, 6, .5, P.tela);
      }
    },
  };
},

'marco-polo'(rng) {
  return {
    cielo: GIORNO, raggio: CALDO,
    statici(m) {
      for (let x = -12; x <= 12; x++) for (let z = -12; z <= 12; z++) m.p(x, 0, z, P.mare);
      for (let x = -12; x <= -5; x++) for (let z = -12; z <= 12; z++) { m.p(x, 1, z, P.pietraChiara); m.p(x, 0, z, P.terra); }
      for (let i = 0; i < 4; i++) casa(m, -11, -9 + i * 6, 4, 4, 4, P.tela, P.tetto, 2);
      m.colonna(-6, 0, 2, 8, P.cotto);
      m.p(-6, 10, 0, P.oro);
      for (let x = 4; x <= 12; x++) for (let z = -12; z <= 12; z++) {   // la terra d'Oriente
        const h = Math.max(1, Math.round((x - 3) * .5));
        for (let y = 1; y <= h; y++) m.p(x, y, z, y === h ? P.sabbia : P.roccia);
      }
    },
    dinamici(d, t) {
      onde(d, t, 12, 3, [12, 12]);
      // ventiquattro anni in un giro: la nave va, e torna carica
      const f = (t * .07) % 1;
      const andata = f < .5;
      const p = andata ? f * 2 : 1 - (f - .5) * 2;
      const x = -4 + p * 9;
      nave(d, t, x, 1.2, 0, andata ? 1 : -1, 7, P.legno, P.tela, 0);
      if (!andata) for (let i = 0; i < 4; i++) d(x + 1 + i * .8, 2.2, 0, .6, i % 2 ? P.oro : P.tela);
      for (let i = 0; i < 6; i++) omino(d, -5.6, 2, -4 + i * 1.6, P.viola, P.pelle, .8);
      for (let i = 0; i < 4; i++) d(8 + i, 3 + (i % 2), -6 + i * 3, .8, P.tetto);
    },
  };
},

occhiali(rng) {
  return {
    cielo: CUPO, raggio: CALDO, ambiente: .6, fronte: Math.PI / 2,
    statici(m) {
      suolo(m, 9, P.legno, P.tronco, rng);
      for (let x = -8; x <= 8; x++) for (let y = 1; y <= 6; y++) m.p(x, y, -7, P.tela);
      for (let z = -7; z <= 2; z++) for (let y = 1; y <= 6; y++) { m.p(-8, y, z, P.tela); m.p(8, y, z, P.tela); }
      for (let x = -8; x <= 8; x += 2) for (let z = -7; z <= 2; z += 2) m.p(x, 7, z, P.tronco);
      m.box(-3, 1, -2, 7, 1, 3, P.legno);
      for (let i = 0; i < 4; i++) m.p(-7, 2 + i, -6, P.legno);
    },
    dinamici(d0, t) {
      // due lenti si avvicinano, si montano, e la pagina diventa leggibile
      const f = (t * .2) % 1.3;
      const d = dissolvenza(d0, f, 1.3);   // il ciclo si ritira invece di spegnersi
      const monta = clamp01(f * 2);
      d(-1.2 + monta * .5, 3.6, 0, .8, P.acquaChiara);
      d(1.2 - monta * .5, 3.6, 0, .8, P.acquaChiara);
      if (monta > .9) { d(0, 3.6, 0, .35, P.bronzo); }
      for (let r = 0; r < 5; r++) for (let c = 0; c < 8; c++) {
        if (monta < .9 && (r + c) % 2) continue;                     // prima si legge male
        d(-3 + c * .8, 2.4, -1 + r * .5, .35, P.nero);
      }
      omino(d, -5, 2.2, 1, P.nero, P.pelle);
      for (let i = 0; i < 5; i++) d(4 + i * .6, 2.4, -1, .4, P.acquaChiara);
    },
  };
},

'vetro-murano'(rng) {
  return {
    cielo: CUPO, raggio: FUOCOLUCE, ambiente: .5,
    statici(m) {
      for (let x = -12; x <= 12; x++) for (let z = -12; z <= 12; z++) m.p(x, 0, z, P.acqua);
      for (let x = -8; x <= 8; x++) for (let z = -6; z <= 6; z++) { m.p(x, 1, z, P.pietraChiara); m.p(x, 0, z, P.terra); }
      for (let i = 0; i < 4; i++) {
        m.guscio(-7 + i * 4, 2, -4, 3, 4, 4, P.cotto);
        for (let y = 0; y < 5; y++) m.p(-6 + i * 4, 6 + y, -3, P.cotto);
      }
      for (let i = 0; i < 3; i++) casa(m, -6 + i * 5, 3, 3, 3, 2, P.tela, P.tetto, 2);
    },
    dinamici(d, t) {
      for (let k = 0; k < 4; k++) fuoco(d, t, -6 + k * 4, 11, -3, 6, .8, k * .25);
      // la canna che soffia: una goccia di vetro che cresce e prende colore
      const f = (t * .3) % 1.2;
      const bolla = clamp01(f * 1.6);
      for (let i = 0; i < 4; i++) d(-1 + i * .7, 3.4, 2, .35, P.ferro);
      d(2.6, 3.4, 2, .4 + bolla * 1.1, bolla > .7 ? P.menta : P.brace);
      omino(d, -2.4, 2, 2, P.terraScura, P.pelle);
      for (let i = 0; i < 8; i++) {                                 // i pezzi finiti sul banco
        if (f < i / 10) continue;
        d(5 + (i % 4) * .9, 2.4 + Math.floor(i / 4) * .8, 2, .55, [P.menta, P.acquaChiara, P.oro, P.rosso][i % 4]);
      }
    },
  };
},

fiorino(rng) {
  return {
    cielo: GIORNO, raggio: CALDO, fronte: Math.PI / 2,
    statici(m) {
      suolo(m, 10, P.pietraChiara, P.pietra, rng);
      for (let x = -9; x <= 9; x++) for (let y = 1; y <= 6; y++) m.p(x, y, -7, P.pietra);
      for (let z = -7; z <= 2; z++) for (let y = 1; y <= 6; y++) { m.p(-9, y, z, P.pietra); m.p(9, y, z, P.pietra); }
      for (let x = -9; x <= 9; x += 2) for (let z = -7; z <= 2; z += 2) m.p(x, 7, z, P.legno);
      m.box(-6, 1, -2, 13, 1, 2, P.legno);
    },
    dinamici(d, t) {
      /* Il conio batte, e la moneta esce sempre uguale: è quella costanza a
         renderla la valuta d'Europa. */
      const f = (t * .5) % 1;
      const colpo = f < .2 ? Math.sin(f / .2 * Math.PI) : 0;
      d(-4, 4 - colpo * 1.2, -1, .9, P.ferro);
      d(-4, 2.4, -1, .8, P.ferro);
      for (let i = 0; i < 10; i++) {                                // le monete che si accumulano
        const q = ((t * .25 + i * .1) % 1);
        d(-4 + q * 8, 2.6 + Math.sin(q * Math.PI) * 1.4, -1, .45, P.oro);
      }
      for (let i = 0; i < 14; i++) d(4 + (i % 5) * .5, 2.5 + Math.floor(i / 5) * .3, -1, .45, P.oro);
      omino(d, -6, 2.2, 1, P.terraScura, P.pelle);
      omino(d, 5, 2.2, 1, P.viola, P.pelle);
      for (let i = 0; i < 6; i++) d(2, 2.5, -1 + i * .3, .4, P.tela);
    },
  };
},

scrovegni(rng) {
  return {
    cielo: 0x1a2030, nebbia: 0x252c3e, raggio: CALDO, ambiente: .6, fronte: Math.PI / 2,
    statici(m) {
      suolo(m, 10, P.marmoOmbra, P.pietraScura, rng);
      for (let x = -8; x <= 8; x++) for (let y = 1; y <= 10; y++) m.p(x, y, -7, P.tela);
      for (let z = -7; z <= 3; z++) for (let y = 1; y <= 10; y++) { m.p(-8, y, z, P.tela); m.p(8, y, z, P.tela); }
      for (let z = -7; z <= 3; z++) for (let a = 0; a <= 14; a++) {
        const an = Math.PI * a / 14;
        m.p(Math.round(-Math.cos(an) * 8), 11 + Math.round(Math.sin(an) * 2), z, P.tela);
      }
    },
    dinamici(d, t) {
      /* Le storie si dipingono riquadro per riquadro; la volta resta blu
         oltremare, che costava più dell'oro. */
      const f = (t * .12) % 1.3;
      for (let r = 0; r < 3; r++) for (let c = 0; c < 6; c++) {
        const i = r * 6 + c;
        const p = clamp01((f - (i / 18)) * 5);
        if (p <= 0) continue;
        const da = arrivo(d, p);
        const x = -7 + c * 2.6;
        for (let dy = 0; dy < 2; dy++) for (let dx = 0; dx < 2; dx++)
          da(x + dx, 3 + r * 2.4 + dy, -6.4, .95, (dx + dy + i) % 3 ? P.sabbia : P.rosso);
        omino(da, x + .5, 3 + r * 2.4, -6.2, i % 2 ? P.blu : P.oro, P.pelle, .55);
      }
      for (let x = -6; x <= 6; x += 2) for (let z = -6; z <= 2; z += 2)
        d(x, 12.4, z, 1.6, P.blu);
      for (let i = 0; i < 10; i++) d(Math.cos(i * 1.9) * 5, 12.2, Math.sin(i * 1.9) * 4, .4, P.oro);
      omino(d, 0, 1.2, 2, P.terraScura, P.pelle);
    },
  };
},

commedia(rng) {
  return {
    cielo: CUPO, nebbia: 0x2a2632, raggio: CALDO, ambiente: .55,
    statici(m) {
      suolo(m, 11, P.pietraScura, P.pietra, rng);
      // tre gironi concentrici che scendono, e in fondo la luce
      for (let k = 0; k < 3; k++) {
        const R = 10 - k * 3;
        for (let a = 0; a < 40; a++) {
          const an = a / 40 * Math.PI * 2;
          m.p(Math.round(Math.cos(an) * R), 1 + k, Math.round(Math.sin(an) * R), k ? P.roccia : P.pietraChiara);
        }
      }
    },
    dinamici(d, t) {
      /* Cento canti in tre cantiche: le terzine salgono dall'imbuto verso la
         luce, e a ogni giro il colore cambia. */
      const f = (t * .1) % 1;
      const colori = [P.fuoco, P.grigio, P.oro];
      for (let i = 0; i < 34; i++) {
        const p = ((f + i / 34) % 1);
        const cantica = Math.min(2, Math.floor(p * 3));
        const a = i * 2.399 + t * .3;
        const r = 9 - p * 7;
        d(Math.cos(a) * r, 1 + p * 12, Math.sin(a) * r, .5, colori[cantica]);
      }
      omino(d, 0, 1.4, 8, P.rosso, P.pelle);
      omino(d, 1.4, 1.4, 8.6, P.tela, P.pelle, .9);
      for (let i = 0; i < 8; i++) d(Math.cos(i * .8) * 1.6, 13.5, Math.sin(i * .8) * 1.6, .5, P.oro);
    },
  };
},

'peste-nera'(rng) {
  return {
    cielo: 0x22202a, nebbia: 0x2c2a34, raggio: 0xc0b49c, ambiente: .5,
    statici(m) {
      suolo(m, 12, P.pietraChiara, P.terra, rng);
      for (let i = 0; i < 10; i++) {
        const x = -11 + (i % 5) * 5, z = -8 + Math.floor(i / 5) * 7;
        casa(m, x, z, 4, 4, 3, P.tela, P.tetto, 1);
      }
      for (let x = -12; x <= 12; x++) m.p(x, 1, 0, P.pietra);
    },
    dinamici(d, t) {
      /* Sobria, per forza: le porte si segnano con una croce, la strada si
         svuota, e restano i carri. */
      const f = (t * .09) % 1;
      const vuoto = clamp01(f * 1.5);
      const rimasti = Math.round(16 * (1 - vuoto));
      for (let i = 0; i < rimasti; i++) {
        const p = ((t * .5 + i * 1.7) % 24) - 12;
        omino(d, p, 2, (i % 2) ? 1.2 : -1.2, P.tela, P.pelle, .8);
      }
      const n = Math.floor(vuoto * 10);
      for (let i = 0; i < n; i++) {
        const x = -11 + (i % 5) * 5, z = -8 + Math.floor(i / 5) * 7;
        d(x + 1.5, 3, z + 4.2, .3, P.nero);
        d(x + 1.5, 3.6, z + 4.2, .3, P.nero);
        d(x + 1, 3.4, z + 4.2, .3, P.nero);
        d(x + 2, 3.4, z + 4.2, .3, P.nero);
      }
      if (vuoto > .5) {
        const cx = ((t * .8) % 26) - 13;
        for (let i = 0; i < 4; i++) d(cx + (i % 2) * 1.1, 2.2, Math.floor(i / 2) * 1, 1, P.legno);
        omino(d, cx - 1.4, 2, .5, P.nero, P.nero, .85);
      }
    },
  };
},

cola(rng) {
  return {
    cielo: TRAMONTO, raggio: CALDO,
    statici(m) {
      suolo(m, 11, P.pietraChiara, P.terra, rng);
      // il Campidoglio: una scalinata e il palazzo in cima
      for (let k = 0; k < 5; k++) for (let x = -5 + k; x <= 5 - k; x++)
        m.p(x, 1 + k, -2 + k, P.marmo);
      casa(m, -4, -8, 9, 5, 4, P.pietraChiara, P.tetto, 6);
      for (let i = 0; i < 4; i++) m.colonna(-3 + i * 2, -3, 6, 4, P.marmo);
    },
    dinamici(d, t) {
      /* Sette mesi in pochi secondi: sale acclamato, si mette la corona, e la
         stessa folla che lo aveva portato su lo travolge. */
      const f = (t * .11) % 1;
      const sale = clamp01(f * 3);
      const cade = clamp01((f - .7) * 3.4);
      omino(d, 0, 1.4 + sale * 5 - cade * 5, 6 - sale * 8 + cade * 3, P.oro, P.pelle, 1);
      if (sale > .8 && cade < .2) d(0, 8.6, -2, .55, P.oro);
      const raggio = 8 - sale * 3 + cade * 2;
      folla(d, t, 0, 4, 20, raggio * .3, cade > .3 ? [P.nero, P.rosso] : [P.tela, P.viola, P.blu], 1.2);
      if (cade > .3) for (let i = 0; i < 8; i++) {
        const g = (t * 2 + i * .13) % 1;
        d(Math.sin(i * 2.2) * 2, 2 + g * 2, 3 + Math.cos(i * 1.9) * 2, .3, P.polvere);
      }
    },
  };
},

decameron(rng) {
  return {
    cielo: GIORNO, raggio: CALDO,
    statici(m) {
      suolo(m, 12, P.erba, P.terra, rng, 1.2);
      casa(m, 4, -6, 7, 6, 4, P.tela, P.tetto, 1);
      for (let i = 0; i < 6; i++) albero(m, -10 + i * 3, -9, 1, rng);
      for (let i = 0; i < 5; i++) albero(m, -9 + i * 4, 9, 1, rng);
      for (let x = -6; x <= 2; x++) for (let z = -1; z <= 3; z++) m.p(x, 1, z, P.pietraChiara);
    },
    dinamici(d, t) {
      /* Dieci giovani, dieci giornate, cento novelle: uno racconta e gli altri
         ascoltano, poi tocca a un altro. */
      const chi = Math.floor((t * .25) % 10);
      for (let i = 0; i < 10; i++) {
        const a = i / 10 * Math.PI * 2;
        const parla = i === chi;
        omino(d, -2 + Math.cos(a) * 3.4, 2 + (parla ? .5 : 0), 1 + Math.sin(a) * 2.6,
          [P.rosso, P.blu, P.viola, P.verdeIt, P.oro][i % 5], P.pelle, parla ? .95 : .8);
      }
      const a = chi / 10 * Math.PI * 2;
      for (let i = 0; i < 5; i++) {                                 // le parole che salgono
        const g = (t * .8 + i * .2) % 1;
        d(-2 + Math.cos(a) * 3.4, 4.4 + g * 3, 1 + Math.sin(a) * 2.6, .3 * (1 - g), P.biancoIt);
      }
      for (let i = 0; i < 6; i++) d(-4 + i * .8, 2.2, 5, .4, P.foglie);
    },
  };
},

ciompi(rng) {
  return {
    cielo: TRAMONTO, raggio: FUOCOLUCE,
    statici(m) {
      suolo(m, 12, P.pietraChiara, P.terra, rng);
      // il palazzo con la torre, e le botteghe della lana attorno
      casa(m, -3, -8, 7, 6, 6, P.pietra, P.tetto, 1);
      for (let y = 0; y < 8; y++) m.p(0, 13 - y > 6 ? 7 + y : 7 + y, -6, P.pietra);
      for (let i = 0; i < 5; i++) casa(m, -11 + i * 5, 4, 4, 3, 2, P.cotto, P.tetto, 1);
    },
    dinamici(d, t) {
      /* Gli operai senza arte prendono il palazzo: il gonfalone passa nelle
         mani sbagliate, per sei settimane. */
      const f = (t * .1) % 1;
      const salita = clamp01((f - .2) * 2.4);
      folla(d, t, 0, 2, 26, 1.4, [P.terraScura, P.tela], 1.2);
      for (let i = 0; i < 8; i++) {
        const p = clamp01(salita * 1.4 - i * .06);
        if (p <= 0) continue;
        omino(d, -2 + (i % 4) * 1.3, 1.2 + p * 6, -3 - p * 3, P.terraScura, P.pelle, .8);
      }
      const su = clamp01((f - .55) * 3);
      if (su > 0) bandiera(d, t, 0, 15, -6, 2, [P.rossoIt, P.biancoIt], 0);
      for (let i = 0; i < 10; i++) d(-9 + i * 2, 2.4, 6, .5, P.tela);   // le pezze di lana
    },
  };
},

chioggia(rng) {
  return {
    cielo: 0x1c2c40, nebbia: 0x263a52, raggio: CALDO,
    statici(m) {
      for (let x = -12; x <= 12; x++) for (let z = -12; z <= 12; z++) m.p(x, 0, z, P.acqua);
      // i cordoni di sabbia della laguna, stretti
      for (let x = -12; x <= 12; x++) for (const z of [-6, -5, 5, 6]) { m.p(x, 1, z, P.sabbia); }
      for (let i = 0; i < 4; i++) casa(m, -9 + i * 6, -6, 3, 2, 2, P.tela, P.tetto, 2);
    },
    dinamici(d, t) {
      onde(d, t, 12, 3, [12, 6]);
      /* I genovesi entrano in laguna e restano intrappolati: i veneziani
         affondano barche piene di pietre a chiudere i canali. */
      const f = (t * .09) % 1;
      const entra = Math.min(1, f * 2.4);
      for (let k = 0; k < 3; k++)
        nave(d, t, -10 + entra * 12, 1.2, -3 + k * 3, 1, 6, P.tronco, P.verdeIt, 0);
      const chiude = clamp01((f - .45) * 2.4);
      for (let i = 0; i < 8; i++) {
        if (chiude <= 0) break;
        const p = clamp01(chiude * 1.4 - i * .1);
        d(-11 + i * .9, 1.4 - p * .6, 0, .9, P.roccia);
      }
      for (let k = 0; k < 3; k++)
        nave(d, t, 10 - chiude * 4, 1.2, -4 + k * 4, -1, 6, P.legno, P.rossoIt, 3);
    },
  };
},

'duomo-milano'(rng) {
  return {
    cielo: GIORNO, raggio: CALDO,
    statici(m) {
      suolo(m, 12, P.pietraChiara, P.pietra, rng);
      m.guscio(-6, 1, -6, 13, 9, 13, P.marmo);
      for (let x = -6; x <= 6; x++) for (let z = -6; z <= 6; z++)
        if ((x + z) % 2 === 0) m.p(x, 10, z, P.marmoOmbra);
      for (let i = 0; i < 6; i++) casa(m, -11 + i * 5, 9, 3, 2, 2, P.cotto, P.tetto, 1);
    },
    dinamici(d, t) {
      /* La fabbrica del Duomo: le guglie spuntano una dopo l'altra e non
         finiscono mai — cinque secoli di cantiere. */
      const f = (t * .09) % 1.4;
      const guglie = [];
      for (let x = -5; x <= 5; x += 2) for (let z = -5; z <= 5; z += 2) guglie.push([x, z]);
      for (let i = 0; i < guglie.length; i++) {
        const su = clamp01((f - i / guglie.length) * 6);
        if (su <= 0) continue;
        const da = arrivo(d, su);
        const [x, z] = guglie[i];
        const h = 2 + ((i * 7) % 3);
        for (let y = 0; y < h * su; y++) da(x, 11 + y, z, .7 - y * .08, P.marmo);
        if (su > .9) da(x, 11 + h, z, .4, P.oro);
      }
      if (f > 1.1) d(0, 17, 0, .8, P.oro);                          // la Madonnina, alla fine
      for (let i = 0; i < 8; i++) {                                 // le barche del marmo di Candoglia
        const p = ((t * .5 + i * 3) % 23) - 11.5;
        d(p, 1.4, 11, .8, P.marmo);
      }
      folla(d, t, 0, 5, 10, 1.6, [P.tela, P.nero], 1.2);            // la folla sta in piazza
    },
  };
},

masaccio(rng) {
  return {
    cielo: CUPO, raggio: CALDO, ambiente: .6, fronte: Math.PI / 2,
    statici(m) {
      suolo(m, 9, P.marmoOmbra, P.pietra, rng);
      for (let x = -8; x <= 8; x++) for (let y = 1; y <= 10; y++) m.p(x, y, -7, P.tela);
      for (let z = -7; z <= 2; z++) for (let y = 1; y <= 10; y++) { m.p(-8, y, z, P.tela); m.p(8, y, z, P.tela); }
      for (let x = -8; x <= 8; x += 2) for (let z = -7; z <= 2; z += 2) m.p(x, 11, z, P.legno);
    },
    dinamici(d, t) {
      /* Le figure prendono peso: prima piatte, poi con l'ombra che le stacca
         dal muro. È il momento in cui la pittura scopre il corpo. */
      const f = (t * .16) % 1.3;
      const volume = clamp01((f - .35) * 2);
      for (let i = 0; i < 7; i++) {
        const x = -6 + i * 2;
        omino(d, x, 3, -6.4, i === 3 ? P.rosso : P.blu, P.pelle, .85 + volume * .25);
        if (volume > .1) for (let k = 0; k < 2; k++)                // l'ombra proiettata
          d(x + .6 + k * .5, 3 - k * .3, -6.1, .5 * volume, P.pietraScura);
      }
      for (let i = 0; i < 6; i++) {                                 // gli studenti che copiano
        omino(d, -5 + i * 2, 1.2, 1, P.viola, P.pelle, .75);
        d(-5 + i * 2, 2.6, .4, .45, P.tela);
      }
    },
  };
},

prospettiva(rng) {
  return {
    cielo: GIORNO, raggio: CALDO, fronte: Math.PI / 2,
    statici(m) {
      suolo(m, 11, P.pietraChiara, P.pietra, rng);
      cattedrale(m, -4, -9, 9, 7, 6, P.marmo, P.tetto);
      for (let x = -10; x <= 10; x++) m.p(x, 1, 2, P.pietra);
    },
    dinamici(d0, t) {
      /* Le linee del pavimento convergono in un punto solo: la tavoletta con lo
         specchio dimostra che lo spazio si può costruire con la riga. */
      const f = (t * .2) % 1.2;
      const d = dissolvenza(d0, f, 1.2);   // il ciclo si ritira invece di spegnersi
      for (let l = -4; l <= 4; l++) {
        for (let k = 0; k < 12; k++) {
          const p = k / 12;
          if (f < p * .8) continue;
          d(l * (1 - p) * 2.2, 1.4, 4 - p * 10, .4 * (1 - p * .6), P.oro);
        }
      }
      for (let k = 0; k < 6; k++) {
        const p = clamp01((f - (.4 + k / 20)) * 5);
        if (p <= 0) continue;
        const da = arrivo(d, p);
        da(0, 1.4 + k * .5, -6 + k * .3, .35, P.oro);
      }
      omino(d, 0, 1.2, 6, P.terraScura, P.pelle);
      d(0, 3.4, 5.2, .8, P.legno);                                  // la tavoletta
      d(0, 3.4, 4.9, .5, P.acquaChiara);
    },
  };
},

donatello(rng) {
  return {
    cielo: CUPO, raggio: CALDO, ambiente: .6, fronte: Math.PI / 2,
    statici(m) {
      suolo(m, 9, P.legno, P.tronco, rng);
      for (let x = -8; x <= 8; x++) for (let y = 1; y <= 6; y++) m.p(x, y, -7, P.pietra);
      for (let z = -7; z <= 2; z++) for (let y = 1; y <= 6; y++) { m.p(-8, y, z, P.pietra); m.p(8, y, z, P.pietra); }
      m.box(-2, 1, -3, 5, 2, 4, P.pietraChiara);
      for (let i = 0; i < 3; i++) m.p(-6, 2 + i, -6, P.legno);
    },
    dinamici(d, t) {
      /* La fusione: il bronzo cola nella forma, la forma si spacca, e resta un
         ragazzo con il cappello di paglia. */
      const f = (t * .13) % 1.2;
      if (f < .4) {
        const col = f / .4;
        for (let i = 0; i < 8; i++) {
          const g = ((t * 2 + i * .12) % 1);
          d(0, 8 - g * 4, -1, .4, P.lava);
        }
        for (let y = 0; y < 4; y++) d(0, 3 + y, -1, 1.4, P.terraScura);
      } else if (f < .6) {
        const rotta = (f - .4) / .2;
        for (let i = 0; i < 10; i++) {
          const a = i / 10 * Math.PI * 2;
          d(Math.cos(a) * rotta * 3, 3.4 + rotta * 1.4, -1 + Math.sin(a) * rotta * 3, .7, P.terraScura);
        }
      } else {
        const app = clamp01((f - .6) * 4);
        d(0, 3.4, -1, 1 * app, P.bronzo);
        d(0, 4.4, -1, .9 * app, P.bronzo);
        d(0, 5.4, -1, .8 * app, P.bronzo);
        d(0, 6.1, -1, .8 * app, P.sabbia);                          // il cappello
      }
      omino(d, -4, 1.2, 2, P.terraScura, P.pelle);
      fuoco(d, t, 6, 1, -4, 6, .7, 0);
    },
  };
},

mantegna(rng) {
  return {
    cielo: 0x1c2432, raggio: CALDO, ambiente: .65, fronte: Math.PI / 2,
    statici(m) {
      suolo(m, 9, P.cotto, P.pietra, rng);
      for (let x = -8; x <= 8; x++) for (let y = 1; y <= 9; y++) m.p(x, y, -7, P.tela);
      for (let z = -7; z <= 2; z++) for (let y = 1; y <= 9; y++) { m.p(-8, y, z, P.tela); m.p(8, y, z, P.tela); }
      for (let x = -8; x <= 8; x++) for (let z = -7; z <= 2; z++) {
        if (Math.hypot(x, z + 2.5) < 3) continue;                   // l'oculo aperto
        m.p(x, 10, z, P.tela);
      }
    },
    dinamici(d0, t) {
      /* Le pareti si sfondano e il soffitto si apre sul cielo: la prima
         illusione totale, con i putti affacciati sull'oculo. */
      const f = (t * .14) % 1.3;
      const d = dissolvenza(d0, f, 1.3);   // il ciclo si ritira invece di spegnersi
      for (let i = 0; i < 10; i++) {                                // la corte dipinta sulla parete
        if (f < i / 20) continue;
        omino(d, -6.5 + i * 1.4, 3, -6.4, i % 3 ? P.viola : P.rosso, P.pelle, .8);
      }
      const apre = clamp01((f - .5) * 2.4);
      for (let i = 0; i < 14; i++) {                                // il cielo nell'oculo
        const a = i / 14 * Math.PI * 2;
        d(Math.cos(a) * 2.4 * apre, 10.4, -2.5 + Math.sin(a) * 2.4 * apre, .7, P.acquaChiara);
      }
      for (let i = 0; i < 6; i++) {                                 // i putti sul bordo
        if (apre < .8) break;
        const a = i / 6 * Math.PI * 2 + t * .2;
        d(Math.cos(a) * 3, 10.8, -2.5 + Math.sin(a) * 3, .55, P.pelle);
      }
      omino(d, 0, 1.2, 1, P.terraScura, P.pelle);
    },
  };
},

'medici-banco'(rng) {
  return {
    cielo: GIORNO, raggio: CALDO, fronte: Math.PI / 2,
    statici(m) {
      suolo(m, 10, P.pietraChiara, P.pietra, rng);
      casa(m, -8, -8, 17, 7, 6, P.pietra, P.tetto, 1);
      for (let x = -12; x <= 12; x++) m.p(x, 1, 3, P.pietra);
    },
    dinamici(d, t) {
      /* Nessuna carica, nessun titolo: i fili partono dal banco e arrivano
         ovunque, e la città si governa da lì. */
      const f = (t * .12) % 1.3;
      for (let i = 0; i < 10; i++) {
        const a = -Math.PI / 2 + (i / 9 - .5) * 2.2;
        const p = clamp01(f * 1.4 - i * .04);
        for (let k = 0; k < 8; k++) {
          if (k / 8 > p) break;
          // i fili arrivano al bordo della sala, non oltre: la piastra è di dieci
          d(Math.cos(a) * (2 + k * .9), 2 + k * .2, 3 + Math.sin(a) * (2 + k * .9) * -1, .3, P.oro);
        }
      }
      omino(d, 0, 2, 2, P.viola, P.pelle, 1);
      for (let i = 0; i < 8; i++)
        omino(d, -6 + i * 1.7, 2, 5 + (i % 2), P.tela, P.pelle, .78);
      for (let i = 0; i < 5; i++) d(-3 + i * 1.5, 3.4, 2.4, .45, P.tela);
    },
  };
},

'stampa-venezia'(rng) {
  return {
    cielo: CUPO, raggio: CALDO, ambiente: .6, fronte: Math.PI / 2,
    statici(m) {
      suolo(m, 10, P.legno, P.tronco, rng);
      for (let x = -9; x <= 9; x++) for (let y = 1; y <= 7; y++) m.p(x, y, -7, P.cotto);
      for (let z = -7; z <= 3; z++) for (let y = 1; y <= 7; y++) { m.p(-9, y, z, P.cotto); m.p(9, y, z, P.cotto); }
      for (let x = -9; x <= 9; x += 2) for (let z = -7; z <= 3; z += 2) m.p(x, 8, z, P.tronco);
      for (let k = 0; k < 3; k++) {                                 // i torchi
        m.box(-7 + k * 6, 1, -3, 3, 1, 3, P.legno);
        for (let y = 0; y < 4; y++) m.p(-6 + k * 6, 2 + y, -2, P.tronco);
      }
    },
    dinamici(d, t) {
      /* Tre torchi che battono sfasati: da qui esce un libro europeo su sei, e
         il formato tascabile che si porta in tasca davvero. */
      for (let k = 0; k < 3; k++) {
        const f = ((t * .6 + k * .33) % 1);
        const giu = f < .3 ? Math.sin(f / .3 * Math.PI) : 0;
        d(-6 + k * 6, 5 - giu * 1.4, -2, 1.3, P.tronco);
        const n = Math.floor(((t * .25 + k * .2) % 1) * 12);
        for (let i = 0; i < n; i++)
          d(-7 + k * 6 + (i % 3) * .8, 2.4 + Math.floor(i / 3) * .35, 0, .7, P.tela);
        omino(d, -6 + k * 6, 1.2, 2, P.terraScura, P.pelle, .8);
      }
      for (let i = 0; i < 6; i++) d(6, 2.4 + i * .4, -5, .8, P.cotto);
    },
  };
},

pazzi(rng) {
  return {
    cielo: CUPO, raggio: CALDO, ambiente: .6, fronte: Math.PI / 2,
    statici(m) {
      suolo(m, 10, P.marmoOmbra, P.pietra, rng);
      for (let x = -9; x <= 9; x++) for (let y = 1; y <= 11; y++) {
        if (y > 8 && Math.abs(x) < 9 - (y - 8) * 3) continue;
        m.p(x, y, -7, P.marmo);
      }
      for (let z = -7; z <= 3; z++) for (let y = 1; y <= 9; y++) { m.p(-9, y, z, P.marmo); m.p(9, y, z, P.marmo); }
      m.box(-2, 1, -6, 5, 2, 1, P.marmoOmbra);
    },
    dinamici(d, t) {
      /* Durante la messa, al segnale: due fratelli, due destini diversi nello
         stesso minuto. */
      const f = (t * .14) % 1;
      const colpo = clamp01((f - .4) * 6);
      folla(d, t, 0, 1, 18, 1.8, [P.tela, P.viola], 1.2);
      omino(d, -2, 1.4, -2, P.rosso, P.pelle, 1);
      omino(d, 2, 1.4, -2, P.blu, P.pelle, 1);
      if (colpo > 0) {
        for (let i = 0; i < 3; i++) d(-2 + i * .3, 3.4 - colpo * 2, -2, .35, P.ferro);
        omino(d, 2 + colpo * 4, 1.4, -2 + colpo * 3, P.blu, P.pelle, 1);
        for (let i = 0; i < 6; i++) {
          const g = (t * 2 + i * .17) % 1;
          d(-2 + Math.sin(i * 2.2) * .8, 2.4 - g, -2, .3, P.sangue);
        }
      }
      for (let i = 0; i < 4; i++) omino(d, -6 + i * 4, 1.4, 3, P.nero, P.pelle, .85);
    },
  };
},

otranto(rng) {
  return {
    cielo: TRAMONTO, nebbia: 0x3a2a24, raggio: FUOCOLUCE, ambiente: .55,
    statici(m) {
      for (let x = -12; x <= 12; x++) for (let z = -12; z <= 12; z++) m.p(x, 0, z, P.mare);
      for (let x = -12; x <= 4; x++) for (let z = -12; z <= 12; z++) { m.p(x, 1, z, P.sabbia); m.p(x, 0, z, P.terra); }
      mura(m, -8, -5, 12, 11, 6, P.pietraChiara);
      torre(m, -9, -6, 9, P.pietraChiara);
      cattedrale(m, -5, -2, 6, 6, 4, P.tela, P.tetto);
    },
    dinamici(d, t) {
      onde(d, t, 12, 3, [12, 12]);
      const f = (t * .09) % 1;
      // la flotta ottomana arriva e resta un anno davanti alla città
      for (let k = 0; k < 5; k++) {
        const x = 12 - Math.min(1, f * 3) * 5;
        nave(d, t, x, 1.2, -9 + k * 4.5, -1, 7, P.tronco, P.verdeIt, 3);
      }
      const assalto = clamp01((f - .4) * 2);
      for (let i = 0; i < 16; i++) {
        if (assalto <= 0) break;
        const p = clamp01(assalto * 1.4 - i * .04);
        omino(d, 5 - p * 9, 1.6, -6 + (i % 8) * 1.6, P.verdeIt, P.pelle, .8);
      }
      for (let i = 0; i < 8; i++) omino(d, -3 + i * 1.3, 7.6, -5, P.rosso, P.pelle, .8);
      if (assalto > .7) fuoco(d, t, -4, 5, 0, 8, 1.2, 0);
    },
  };
},

'carlo-viii'(rng) {
  return {
    cielo: GIORNO, raggio: CALDO,
    statici(m) {
      suolo(m, 12, P.erbaScura, P.terra, rng, 1);
      for (let x = -12; x <= 12; x++) for (let z = -1; z <= 1; z++) m.p(x, 1, z, P.sabbia);
      mura(m, 5, 4, 8, 7, 5, P.pietraChiara);
      for (let i = 0; i < 4; i++) albero(m, -10 + i * 4, -8, 1, rng);
    },
    dinamici(d, t) {
      /* L'artiglieria da campagna: le mura che avevano retto per secoli cadono
         in poche ore, e l'esercito passa senza combattere. */
      const giro = v => ((v + 13) % 26 + 26) % 26 - 13;
      const av = t * 1.2;
      for (let k = 0; k < 4; k++) {                                 // i cannoni su ruote
        const x = giro(av - k * 4);
        for (let i = 0; i < 3; i++) d(x + i * .7, 2.2, 0, .7, P.bronzo);
        d(x - .8, 1.8, 0, .7, P.legno);
      }
      for (let i = 0; i < 14; i++)
        omino(d, giro(av - 18 - i * 1.2), 2, -1 + (i % 3), P.blu, P.pelle, .8);
      const f = (t * .12) % 1;
      const crollo = clamp01((f - .5) * 2.4);
      for (let z = 4; z < 11; z++) for (let y = 1; y <= 5 - crollo * 5; y++) d(5, y, z, 1, P.pietraChiara);
      if (crollo > .1) for (let i = 0; i < 8; i++)
        d(4 + ((i * 53) % 4), 1 + crollo * 2, 5 + ((i * 71) % 6), .8, P.polvere);
    },
  };
},

fornovo(rng) {
  return {
    cielo: CUPO, nebbia: 0x2e3238, raggio: 0xd0c4a8, ambiente: .55,
    statici(m) {
      suolo(m, 12, P.terraScura, P.terra, rng, 1.4);
      for (let z = -12; z <= 12; z++) for (let x = -1; x <= 2; x++) m.p(x, 1, z, P.acqua);
      for (let i = 0; i < 4; i++) albero(m, -10, -8 + i * 6, 1, rng);
    },
    dinamici(d, t) {
      /* Sotto il temporale, il fiume in piena: la lega italiana attacca, i
         francesi passano lo stesso e si portano via il bottino. */
      const f = (t * .1) % 1;
      const passa = clamp01(f * 1.4);
      for (let i = 0; i < 14; i++)
        omino(d, -9 + passa * 13 + (i % 7) * 1.1, 2, -5 + Math.floor(i / 7) * 2, P.blu, P.pelle, .8);
      for (let i = 0; i < 16; i++)
        omino(d, -3 + (i % 8) * 1.4, 2, 4 + Math.floor(i / 8) * 2, P.rosso, P.pelle, .8);
      for (let k = 0; k < 4; k++) {                                 // i carri del bottino, in coda
        const x = -3 + passa * 13 - k * 2;
        d(x, 2.4, -7, 1.1, P.legno); d(x, 3.2, -7, .7, P.oro);
      }
      for (let i = 0; i < 34; i++) {                                // la pioggia
        const g = (t * 1.6 + i * .03) % 1;
        d(((i * 6151) % 25) - 12, 12 - g * 12, ((i * 3571) % 25) - 12, .28, P.ghiaccio);
      }
      for (let x = -1; x <= 2; x += 2) for (let z = -12; z <= 12; z += 4)
        d(x, .9 + Math.sin(t * 3 + z * .4) * .3, z, 1.8, P.terraScura);
    },
  };
},

david(rng) {
  return {
    cielo: GIORNO, raggio: CALDO, fronte: Math.PI / 2,
    statici(m) {
      suolo(m, 11, P.pietraChiara, P.pietra, rng);
      casa(m, -10, -9, 8, 5, 7, P.pietra, P.tetto, 1);
      for (let y = 0; y < 9; y++) m.p(-7, 13 + y - 5, -7, P.pietra);
      m.box(-1, 1, -1, 3, 2, 3, P.marmo);
    },
    dinamici(d, t) {
      /* Dal blocco scartato da altri esce una figura di cinque metri: i colpi
         staccano schegge finché il marmo non è più un blocco. */
      const f = (t * .11) % 1.3;
      const scava = clamp01(f * 1.6);
      const H = 7;
      for (let y = 0; y < H; y++) {
        const largo = 1.5 - scava * (y === 5 ? .8 : y > 2 ? .45 : .3);
        d(0, 3 + y, 0, Math.max(.7, largo), P.marmo);
      }
      if (scava > .85) { d(-.9, 7, 0, .6, P.marmo); d(.9, 6.4, 0, .6, P.marmo); }
      for (let i = 0; i < 10; i++) {                                // le schegge che volano
        const g = (t * 1.4 + i * .1) % 1;
        d(Math.cos(i * 2.2) * (1.5 + g * 4), 6 - g * 4, Math.sin(i * 2.2) * (1.5 + g * 4), .35 * (1 - g), P.marmo);
      }
      omino(d, -3.4, 1.2, 2, P.terraScura, P.pelle);
      folla(d, t, 0, 4, 8, 1.6, [P.tela, P.viola], 1.2);   // dentro il cortile
    },
  };
},

});

})();
