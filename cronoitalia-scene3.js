'use strict';

/* Scene firma, terzo volume: il riempimento fino a metà degli eventi.
 *
 * Stessa struttura degli altri due file di scene. Qui stanno soprattutto gli
 * eventi "di secondo piano" — quelli che non fanno da copertina a un'epoca ma
 * che, capitando durante un racconto, meritano comunque qualcosa di proprio.
 */

(() => {

const P = VoxScena.P;
const { suolo, albero, casa, omino, clamp01, tempio, cattedrale, torre, mura,
        nave, folla, fuoco, bandiera, stelle, onde, fabbrica, ponte } = VoxScena.kit;

const NOTTE = 0x14203a, GIORNO = 0x24344c, TRAMONTO = 0x2e2c3e, CUPO = 0x1c1f28;
const CALDO = 0xffe6b4, FREDDO = 0xd6e4ff, FUOCOLUCE = 0xffb478;

VoxScena.registra({

/* ---------------- preistoria e Italia arcaica ---------------- */

'grotta-addaura'(rng) {
  return {
    cielo: CUPO, nebbia: 0x2a2a30, raggio: CALDO, ambiente: .55, fronte: Math.PI / 2,
    statici(m) {
      // una parete rocciosa con il riparo sotto roccia
      for (let x = -9; x <= 9; x++) for (let y = 1; y <= 10; y++) m.p(x, y, -6, P.roccia);
      for (let x = -9; x <= 9; x++) for (let z = -6; z <= -3; z++) m.p(x, 11, z, P.roccia);
      suolo(m, 10, P.pietraChiara, P.roccia, rng);
    },
    dinamici(d, t) {
      /* Le figure incise compaiono in cerchio attorno a due corpi legati: la
         più antica scena narrativa d'Italia, e nessuno sa cosa racconti. */
      const f = (t * .12) % 1.3;
      for (let i = 0; i < 11; i++) {
        if (f < i / 13) continue;
        const a = i / 11 * Math.PI * 2;
        omino(d, Math.cos(a) * 4.4, 3 + Math.sin(a) * 1.4, -5.6, P.nero, P.nero, .6);
      }
      if (f > .85) { omino(d, -.7, 3.4, -5.6, P.nero, P.nero, .55); omino(d, .7, 3.4, -5.6, P.nero, P.nero, .55); }
      omino(d, 3, 1.2, 1, P.terraScura, P.pelle, .9);
      fuoco(d, t, -3, 1.2, 2, 5, .6, 0);
    },
  };
},

terramare(rng) {
  return {
    cielo: GIORNO, raggio: CALDO,
    statici(m) {
      suolo(m, 12, P.erba, P.terra, rng);
      // il fossato attorno al villaggio, e l'argine di terra
      for (let x = -12; x <= 12; x++) for (let z = -12; z <= 12; z++) {
        const dd = Math.max(Math.abs(x), Math.abs(z));
        if (dd === 8 || dd === 9) m.p(x, 0, z, P.acqua);
        if (dd === 7) { m.p(x, 1, z, P.terraScura); m.p(x, 2, z, P.terraScura); }
      }
      for (let i = 0; i < 9; i++) {
        const x = -5 + (i % 3) * 5, z = -5 + Math.floor(i / 3) * 5;
        for (const [dx, dz] of [[0, 0], [2, 0], [0, 2], [2, 2]]) m.colonna(x + dx, z + dz, 1, 2, P.tronco);
        casa(m, x, z, 3, 3, 2, P.legno, P.tetto, 3);
      }
    },
    dinamici(d, t) {
      for (let x = -12; x <= 12; x += 3) for (const z of [-8, 8])
        d(x, .6 + Math.sin(t * 2 + x * .4) * .18, z, 2.4, P.acquaChiara);
      for (let z = -12; z <= 12; z += 3) for (const x of [-8, 8])
        d(x, .6 + Math.sin(t * 2 + z * .4) * .18, z, 2.4, P.acquaChiara);
      folla(d, t, 0, 0, 10, 2, [P.tela, P.terraScura], 4.2);
      for (let k = 0; k < 3; k++) fuoco(d, t, -5 + k * 5, 6, -5 + k * 5, 4, .5, k * .3);
    },
  };
},

cuma(rng) {
  return {
    cielo: TRAMONTO, raggio: CALDO,
    statici(m) {
      for (let x = -12; x <= 12; x++) for (let z = -12; z <= 12; z++) m.p(x, 0, z, P.mare);
      for (let x = -12; x <= 12; x++) for (let z = 0; z <= 12; z++) {
        const h = Math.max(1, Math.round((z) * .55));
        for (let y = 1; y <= h; y++) m.p(x, y, z, y === h ? P.erbaScura : P.terra);
      }
      tempio(m, -4, 8, 4, 3, 5, P.sabbia, P.marmoOmbra);
      // l'antro della Sibilla: un corridoio scavato nella rupe
      for (let z = 3; z <= 8; z++) for (let y = 1; y <= 3; y++)
        for (let x = -1; x <= 1; x++) if (Math.abs(x) === 1 || y === 3) m.p(x, y, z, P.roccia);
    },
    dinamici(d, t) {
      onde(d, t, 12, 3, [12, 12]);
      nave(d, t, -10 + ((t * .8) % 18), 1.2, -6, 1, 6, P.legno, P.tela, 0);
      /* Dalla nave scendono le lettere: l'alfabeto arriva in Italia con i
         mercanti, prima ancora che con i coloni. */
      const f = (t * .16) % 1.3;
      for (let i = 0; i < 9; i++) {
        if (f < i / 11) continue;
        d(-4 + i, 3.4 + Math.sin(t + i) * .12, 1, .55, P.oro);
      }
      for (let i = 0; i < 6; i++) {                       // la luce dall'antro
        const g = (t * .5 + i * .17) % 1;
        d(0, 2.4, 3 + g * 5, .5 * (1 - g), P.brace);
      }
    },
  };
},

sibari(rng) {
  return {
    cielo: GIORNO, raggio: CALDO,
    statici(m) {
      suolo(m, 12, P.erba, P.terra, rng, .6);
      for (let x = -12; x <= 12; x++) for (let z = 9; z <= 12; z++) m.p(x, 0, z, P.mare);
      for (let i = 0; i < 9; i++)
        casa(m, -10 + (i % 3) * 7, -8 + Math.floor(i / 3) * 6, 5, 4, 3, P.tela, P.tetto, 1);
      for (let x = -12; x <= 12; x++) m.p(x, 1, 1, P.pietraChiara);
    },
    dinamici(d, t) {
      /* Ricchezza proverbiale: le anfore arrivano dal porto e non finiscono
         mai. Poi Crotone devia il fiume e la città sparisce sotto il fango. */
      const f = (t * .07) % 1;
      const rovina = clamp01((f - .6) * 2.4);
      for (let i = 0; i < 10; i++) {
        if (rovina > .1) break;
        const p = ((t * .5 + i * 2.4) % 24) - 12;
        d(p, 2.2, 1, .7, P.cotto);
        omino(d, p, 2, 2, P.tela, P.pelle, .8);
      }
      for (let x = -12; x <= 12; x += 2) for (let z = -12; z <= 12; z += 3) {
        if (rovina <= 0) break;
        d(x, 1.4 + rovina * 2.4, z, 1.8, P.terraScura);
      }
      onde(d, t, 12, 3, [12, 8]);
    },
  };
},

alalia(rng) {
  return {
    cielo: TRAMONTO, raggio: FUOCOLUCE,
    statici(m) {
      for (let x = -12; x <= 12; x++) for (let z = -12; z <= 12; z++) m.p(x, 0, z, P.mare);
      for (let x = 8; x <= 12; x++) for (let z = -12; z <= 12; z++) {
        const h = Math.max(1, Math.round((x - 7) * .8));
        for (let y = 1; y <= h; y++) m.p(x, y, z, y === h ? P.foglieScure : P.roccia);
      }
    },
    dinamici(d, t) {
      onde(d, t, 12, 3, null);
      /* Vincono i Focei ma perdono tante navi da doversene andare: una vittoria
         che è una sconfitta, e il Tirreno resta etrusco. */
      const f = (t * .09) % 1;
      const perse = clamp01((f - .4) * 2);
      for (let k = 0; k < 4; k++) {
        const giu = perse > k / 5 ? (perse - k / 5) * 3 : 0;
        nave(d, t, -8, 1.2 - giu * 2.4, -9 + k * 5, 1, 6, P.legno, giu > .3 ? 0 : P.tela, 0);
      }
      for (let k = 0; k < 5; k++)
        nave(d, t, 6, 1.2, -9 + k * 4.5, -1, 6, P.tronco, P.ocra, 3);
      for (let i = 0; i < 10; i++) {
        const g = (t * .8 + i * .1) % 1;
        d(-6 + i * 1.4, 1.6 + g * 3, -6 + (i % 5) * 3, .8 * (1 - g), P.fumo);
      }
    },
  };
},

'apollo-veio'(rng) {
  return {
    cielo: CUPO, raggio: CALDO, ambiente: .6, fronte: Math.PI / 2,
    statici(m) {
      suolo(m, 9, P.terraScura, P.terra, rng);
      for (let x = -8; x <= 8; x++) for (let y = 1; y <= 6; y++) m.p(x, y, -7, P.legno);
      for (let z = -7; z <= 2; z++) for (let y = 1; y <= 6; y++) { m.p(-8, y, z, P.legno); m.p(8, y, z, P.legno); }
      for (let x = -8; x <= 8; x += 2) for (let z = -7; z <= 2; z += 2) m.p(x, 7, z, P.tronco);
      m.box(-2, 1, -3, 5, 1, 4, P.pietra);
      fuoco;                                              // (la fornace è dinamica)
    },
    dinamici(d, t) {
      /* La statua esce dalla fornace e cammina: il sorriso arcaico, il mantello
         che si muove, la terracotta dipinta. */
      const f = (t * .13) % 1.2;
      const cotta = clamp01((f - .35) * 2);
      const c = cotta > .6 ? P.cotto : P.terraScura;
      d(-.4, 2.4, -1, 1, c); d(.6, 2.4, -.4, 1, c);       // il passo
      d(0, 3.5, -.7, 1.1, c); d(0, 4.6, -.7, .9, cotta > .6 ? P.sabbia : c);
      d(-1.2, 3.6, -.2, .7, c);
      if (cotta > .8) for (let i = 0; i < 6; i++)
        d(-1 + i * .4, 3.4 - i * .2, .3, .45, P.oliva);
      fuoco(d, t, 5, 1.2, -4, 8, .9, 0);
      omino(d, -5, 1.2, 1, P.terraScura, P.pelle);
    },
  };
},

/* ---------------- Roma repubblicana e tardo repubblicana ---------------- */

eraclea(rng) {
  return {
    cielo: TRAMONTO, raggio: CALDO,
    statici(m) {
      suolo(m, 12, P.erbaScura, P.terra, rng, .8);
      for (let z = -12; z <= 12; z++) for (let x = 9; x <= 11; x++) m.p(x, 1, z, P.acqua);
    },
    dinamici(d, t) {
      /* Gli elefanti da guerra: i romani non li avevano mai visti, e i cavalli
         nemmeno. Vince Pirro, ma perde troppi uomini per festeggiare. */
      const f = (t * .11) % 1;
      const carica = clamp01(f * 1.6);
      for (let k = 0; k < 4; k++) {
        const x = 7 - carica * 9, z = -6 + k * 4;
        for (let bx = -1; bx <= 1; bx++) for (let bz = -1; bz <= 1; bz++)
          d(x + bx, 2.2, z + bz, 1.1, P.grigio);
        d(x - 1.6, 3.2, z, 1, P.grigio);
        d(x - 2.4, 2.4, z, .6, P.grigio);
        omino(d, x, 4, z, P.viola, P.pelle, .7);
      }
      const rotti = clamp01((f - .5) * 2.4);
      for (let i = 0; i < 16; i++)
        omino(d, -7 - rotti * 4 + (i % 8) * 1.1, 1.6, -6 + Math.floor(i / 8) * 2.4, P.rosso, P.pelle, .8);
      for (let i = 0; i < 12; i++) {
        const g = (t * .6 + i * .08) % 1;
        d(-2 + g * 4, 1.6 + g * 2.4, -6 + (i % 7) * 2, .8 * (1 - g), P.polvere);
      }
    },
  };
},

'prima-punica'(rng) {
  return {
    cielo: GIORNO, raggio: CALDO,
    statici(m) {
      for (let x = -12; x <= 12; x++) for (let z = -12; z <= 12; z++) m.p(x, 0, z, P.mare);
      for (let x = -12; x <= -7; x++) for (let z = -12; z <= 12; z++) {
        const h = Math.max(1, Math.round((-x - 6) * .6));
        for (let y = 1; y <= h; y++) m.p(x, y, z, y === h ? P.erbaScura : P.roccia);
      }
    },
    dinamici(d, t) {
      onde(d, t, 12, 3, [12, 12]);
      /* Ventitré anni: le flotte si costruiscono, affondano, si ricostruiscono.
         Roma perde più navi per le tempeste che in battaglia. */
      const f = (t * .07) % 1;
      const fase = Math.floor(f * 3);
      for (let k = 0; k < 5; k++) {
        const affonda = fase === 1 && ((k + f * 10) % 3 < 1);
        nave(d, t, -4 + k * .3, 1.2 - (affonda ? 1.6 : 0), -9 + k * 4.5, 1, 6, P.legno,
          affonda ? 0 : P.tela, 0);
      }
      for (let k = 0; k < 5; k++)
        nave(d, t, 6, 1.2, -9 + k * 4.5, -1, 6, P.tronco, P.viola, 3);
      for (let i = 0; i < 14; i++) {                      // la tempesta, nella fase di mezzo
        if (fase !== 1) break;
        const g = (t * 1.6 + i * .07) % 1;
        d(((i * 6151) % 25) - 12, 10 - g * 10, ((i * 3571) % 25) - 12, .3, P.ghiaccio);
      }
    },
  };
},

trebbia(rng) {
  return {
    cielo: 0x2a3038, nebbia: 0x3a4048, raggio: FREDDO, ambiente: .55,
    statici(m) {
      suolo(m, 12, P.neve, P.terraScura, rng);
      for (let z = -12; z <= 12; z++) for (let x = -2; x <= 2; x++) m.p(x, 0, z, P.ghiaccio);
      for (let i = 0; i < 4; i++) albero(m, 10, -8 + i * 6, 1, rng);
    },
    dinamici(d, t) {
      /* All'alba, digiuni, fatti guadare il fiume gelato: quando arrivano
         dall'altra parte non hanno più gambe, e la cavalleria li prende alle
         spalle. */
      const f = (t * .1) % 1;
      const guado = clamp01(f * 1.8);
      for (let i = 0; i < 18; i++) {
        const x = -9 + guado * 11 + (i % 6) * .9;
        const dentro = Math.abs(x) < 2.5;
        omino(d, x, dentro ? .4 : 1.1, -6 + Math.floor(i / 6) * 2.4, P.rosso, P.pelle, .8);
      }
      const agguato = clamp01((f - .55) * 2.4);
      for (let i = 0; i < 10; i++) {
        if (agguato <= 0) break;
        d(9 - agguato * 6, 1.8, -7 + i * 1.6, 1.1, P.terraScura);
        omino(d, 9 - agguato * 6, 2.6, -7 + i * 1.6, P.viola, P.pelle, .8);
      }
      for (let i = 0; i < 24; i++) {
        const g = (t * .8 + i * .04) % 1;
        d(((i * 6151) % 25) - 12, 11 - g * 11, ((i * 3571) % 25) - 12, .35, P.neve);
      }
    },
  };
},

metauro(rng) {
  return {
    cielo: TRAMONTO, raggio: FUOCOLUCE,
    statici(m) {
      suolo(m, 12, P.erbaScura, P.terra, rng, 1);
      for (let z = -12; z <= 12; z++) for (let x = -1; x <= 2; x++) m.p(x, 1, z, P.acqua);
      for (let i = 0; i < 3; i++) albero(m, -10, -7 + i * 7, 1, rng);
    },
    dinamici(d, t) {
      /* Il messaggero con i piani viene intercettato: i due eserciti romani si
         uniscono di notte e Asdrubale non lo sa. */
      const f = (t * .1) % 1;
      const messo = clamp01(f * 2.4);
      if (messo < 1) {
        d(-11 + messo * 9, 2.2, 7, 1, P.terraScura);
        omino(d, -11 + messo * 9, 3, 7, P.viola, P.pelle, .75);
      }
      const uniti = clamp01((f - .35) * 2.2);
      for (let i = 0; i < 12; i++)
        omino(d, -8 + (i % 6) * 1.2, 2, -6 + Math.floor(i / 6) * 2, P.rosso, P.pelle, .8);
      for (let i = 0; i < 12; i++)
        omino(d, -8 + (i % 6) * 1.2, 2, 4 - uniti * 8 + Math.floor(i / 6) * 2, P.rosso, P.pelle, .8);
      for (let i = 0; i < 14; i++)
        omino(d, 6 - uniti * 2 + (i % 7) * 1.1, 2, -5 + Math.floor(i / 7) * 2.4, P.viola, P.pelle, .8);
      for (let i = 0; i < 12; i++) {
        const g = (t * .6 + i * .08) % 1;
        d(2 + g * 3, 2 + g * 2.4, -5 + (i % 7) * 2, .8 * (1 - g), P.polvere);
      }
    },
  };
},

spartaco(rng) {
  return {
    cielo: TRAMONTO, raggio: FUOCOLUCE,
    statici(m) {
      suolo(m, 12, P.erbaScura, P.terra, rng, 1.2);
      for (let x = -12; x <= 12; x++) m.p(x, 1, -2, P.pietraChiara);
      mura(m, -10, 4, 8, 6, 5, P.pietraChiara);
    },
    dinamici(d, t) {
      /* Dalla scuola di gladiatori esce una folla che cresce; alla fine restano
         le croci lungo la strada, ma la scena si ferma prima. */
      const f = (t * .09) % 1;
      const fuga = clamp01(f * 1.6);
      const quanti = Math.round(4 + fuga * 24);
      for (let i = 0; i < quanti; i++) {
        const p = clamp01(fuga * 1.5 - i * .02);
        omino(d, -7 + p * 15 + (i % 6) * .9, 2, -3 + Math.floor(i % 18 / 6) * 1.4,
          i % 4 ? P.terraScura : P.rosso, P.pelle, .8);
      }
      for (let i = 0; i < 8; i++) {                       // le armi prese dalla scuola
        if (fuga < .2) break;
        d(-8 + i * 1.4, 3.4, -1, .35, P.ferro);
      }
      for (let i = 0; i < 10; i++) {
        const g = (t * .5 + i * .1) % 1;
        d(-9 + i * 1.2, 3 + g * 3, 5, .7 * (1 - g), P.fumo);
      }
    },
  };
},

rubicone(rng) {
  return {
    cielo: CUPO, nebbia: 0x2c3038, raggio: 0xd8c8a8, ambiente: .55,
    statici(m) {
      suolo(m, 12, P.erbaScura, P.terra, rng, .6);
      for (let x = -12; x <= 12; x++) for (let z = -2; z <= 1; z++) m.p(x, 0, z, P.acqua);
      m.colonna(3, -4, 1, 3, P.pietraChiara);            // il cippo di confine
      m.p(3, 4, -4, P.marmo);
      for (let i = 0; i < 3; i++) albero(m, -10 + i * 9, 8, 1, rng);
    },
    dinamici(d, t) {
      /* Un fiume largo tre metri: passarlo in armi è guerra civile. La colonna
         si ferma, poi passa. */
      const f = (t * .12) % 1;
      const esita = f < .45;
      const p = esita ? 0 : (f - .45) / .55;
      for (let i = 0; i < 16; i++) {
        const x = -9 + p * 12 + (i % 8) * 1.1;
        omino(d, x, Math.abs(x) < 2 && !esita ? .6 : 1.1, -5 + Math.floor(i / 8) * 2.2,
          P.rosso, P.pelle, .8);
      }
      omino(d, -6 + p * 12, 1.4, 2, P.viola, P.pelle, .95);
      for (let x = -12; x <= 12; x += 3)
        d(x, .5 + Math.sin(t * 2 + x * .4) * .2, -.5, 2.4, P.acquaChiara);
      for (let i = 0; i < 8; i++) {                       // le insegne
        if (esita) break;
        d(-7 + p * 12 + i * 1.1, 3.4, -3, .4, P.oro);
      }
    },
  };
},

cicerone(rng) {
  return {
    cielo: CUPO, raggio: CALDO, ambiente: .6, fronte: Math.PI / 2,
    statici(m) {
      suolo(m, 10, P.marmoOmbra, P.pietra, rng);
      for (let x = -9; x <= 9; x++) for (let y = 1; y <= 8; y++) m.p(x, y, -7, P.marmo);
      for (let z = -7; z <= 3; z++) for (let y = 1; y <= 8; y++) { m.p(-9, y, z, P.marmo); m.p(9, y, z, P.marmo); }
      for (let k = 0; k < 3; k++) for (let x = -7 + k; x <= 7 - k; x += 2)
        m.p(x, 1 + k, Math.round(-5 + k * 1.4), P.pietraChiara);
      m.box(-1, 1, 2, 3, 1, 2, P.marmo);
    },
    dinamici(d, t) {
      /* Le parole della prima Catilinaria: mentre parla, i banchi attorno
         all'accusato si svuotano uno a uno. */
      const f = (t * .13) % 1.2;
      const isolato = clamp01(f * 1.5);
      for (let k = 0; k < 3; k++) for (let i = 0; i < 7; i++) {
        const x = -6 + i * 2, z = -4.4 + k * 1.4;
        const vicino = Math.abs(x - 4) < 3 && k === 0;
        if (vicino && isolato > .4) continue;
        omino(d, x, 2 + k, z, P.tela, P.pelle, .8);
      }
      omino(d, 4, 2, -4.4, P.nero, P.pelle, .9);
      omino(d, 0, 2, 2, P.viola, P.pelle, 1);
      for (let i = 0; i < 12; i++) {
        const g = (t * .9 + i * .08) % 1;
        d(.6 + g * 3, 4 + Math.sin(g * Math.PI) * 1.6, 1.4 - g * 5, .3 * (1 - g), P.oro);
      }
    },
  };
},

virgilio(rng) {
  return {
    cielo: GIORNO, raggio: CALDO,
    statici(m) {
      suolo(m, 12, P.erba, P.terra, rng, .8);
      for (let z = -12; z <= 12; z++) for (let x = 8; x <= 11; x++) m.p(x, 1, z, P.acqua);
      casa(m, -8, 4, 5, 4, 3, P.tela, P.tetto, 1);
      for (let i = 0; i < 6; i++) albero(m, -10 + i * 4, -10, 1, rng);
    },
    dinamici(d, t) {
      /* Le Georgiche: api, viti, aratri. La fatica dei campi messa in versi
         mentre l'impero si consolida. */
      const f = (t * .12) % 1.2;
      for (let i = 0; i < 4; i++) {                       // l'aratro che va e viene
        const p = ((f + i / 4) % 1);
        const x = -9 + p * 18;
        d(x, 2, -3 + i * 2, 1, P.terraScura);
        d(x - 1.2, 2, -3 + i * 2, 1, P.terraScura);
        omino(d, x + 1.4, 2, -3 + i * 2, P.tela, P.pelle, .8);
        for (let k = 0; k < 6; k++) d(x - 2 - k, 1.4, -3 + i * 2, .8, P.terraScura);
      }
      for (let i = 0; i < 12; i++) {                      // le api
        const a = t * 1.2 + i * .52;
        d(-7 + Math.cos(a) * 2.4, 4 + Math.sin(a * 2) * 1.2, 6 + Math.sin(a) * 2.4, .3, P.oro);
      }
      omino(d, -6, 2, 8, P.viola, P.pelle);
    },
  };
},

augusto(rng) {
  return {
    cielo: GIORNO, raggio: CALDO, fronte: Math.PI / 2,
    statici(m) {
      suolo(m, 11, P.marmoOmbra, P.pietra, rng);
      for (let i = 0; i < 6; i++) { m.colonna(-8 + i * 3, -7, 1, 7, P.marmo); m.p(-8 + i * 3, 8, -7, P.marmoOmbra); }
      for (let x = -9; x <= 8; x++) m.p(x, 9, -7, P.marmoOmbra);
      m.box(-2, 1, -3, 5, 2, 2, P.marmo);
    },
    dinamici(d, t) {
      /* Restituisce i poteri al Senato e li riprende tutti insieme sotto altro
         nome: la Repubblica resta in piedi come facciata. */
      const f = (t * .13) % 1.2;
      const rende = clamp01(f * 2), riprende = clamp01((f - .5) * 2);
      omino(d, 0, 3.4, -3, P.biancoIt, P.pelle, 1);
      for (let i = 0; i < 6; i++) {
        const p = Math.max(rende - riprende, 0);
        d(-2.5 + i, 3.4 + p * 1.4, -3 + p * 2.4, .5, P.oro);
      }
      folla(d, t, 0, 3, 18, 2, [P.tela, P.viola], 1.2);
      for (let i = 0; i < 4; i++) {
        if (riprende < .6) break;
        d(-1.5 + i, 6.4, -3, .5, P.oro);
      }
    },
  };
},

regiones(rng) {
  return {
    cielo: GIORNO, raggio: CALDO,
    statici(m) {
      suolo(m, 12, P.pietraChiara, P.pietra, rng);
      m.box(-11, 1, -11, 23, 1, 23, P.marmoOmbra);
    },
    dinamici(d, t) {
      /* Undici regioni tracciate sulla carta: le linee cadono una a una e
         l'Italia diventa, per la prima volta, un'entità amministrativa. */
      const f = (t * .12) % 1.3;
      const linee = [[-8, -11, -8, 11], [-3, -11, -3, 11], [3, -11, 3, 11], [7, -11, 7, 11],
                     [-11, -6, 11, -6], [-11, 0, 11, 0], [-11, 6, 11, 6],
                     [-8, -3, 3, -3], [-3, 4, 7, 4], [3, -8, 7, -8], [-8, 8, -3, 8]];
      for (let i = 0; i < linee.length; i++) {
        const arrivo = clamp01((f - i / 12) * 8);
        if (arrivo <= 0) continue;
        const [x1, z1, x2, z2] = linee[i];
        const n = Math.max(Math.abs(x2 - x1), Math.abs(z2 - z1));
        for (let k = 0; k <= n; k++)
          d(x1 + (x2 - x1) * k / n, 2.2 + (1 - arrivo) * 5, z1 + (z2 - z1) * k / n, .8, P.oro);
      }
      for (let i = 0; i < 11; i++) {
        if (f < i / 12 + .1) continue;
        d(-9 + (i % 4) * 5.5, 2.8, -8 + Math.floor(i / 4) * 6, .7, P.rosso);
      }
    },
  };
},

/* ---------------- impero e tardo antico ---------------- */

'nerone-domus'(rng) {
  return {
    cielo: TRAMONTO, raggio: CALDO,
    statici(m) {
      suolo(m, 12, P.erba, P.terra, rng, .8);
      for (let x = -6; x <= 6; x++) for (let z = -3; z <= 3; z++) m.p(x, 1, z, P.acqua);
      casa(m, -11, -10, 8, 5, 5, P.marmo, P.marmoOmbra, 1);
      casa(m, 5, -10, 8, 5, 5, P.marmo, P.marmoOmbra, 1);
      for (let i = 0; i < 6; i++) albero(m, -9 + i * 4, 8, 1, rng);
      for (let x = -8; x <= 8; x += 4) m.colonna(x, -5, 1, 6, P.marmo);
    },
    dinamici(d, t) {
      /* Un lago e un bosco dentro la città, e una statua alta trenta metri.
         Alla sua morte verrà sepolta e sopra ci faranno il Colosseo. */
      const f = (t * .1) % 1;
      for (let x = -6; x <= 6; x += 2) for (let z = -3; z <= 3; z += 2)
        d(x, 1.5 + Math.sin(t * 2 + x * .4 + z * .3) * .16, z, 1.8, P.acquaChiara);
      const h = 9;
      for (let y = 0; y < h; y++) d(0, 3 + y, -8, 1.2 - y * .04, P.bronzo);
      d(0, 3 + h, -8, 1, P.oro);
      for (let i = 0; i < 8; i++) {                       // i raggi della corona
        const a = i / 8 * Math.PI * 2;
        d(Math.cos(a) * 1.4, 3 + h + .8, -8 + Math.sin(a) * 1.4, .4, P.oro);
      }
      const sepolta = clamp01((f - .7) * 3);
      for (let i = 0; i < 20; i++) {
        if (sepolta <= 0) break;
        d(-9 + (i % 10) * 2, 1.4 + sepolta * 2.4, -10 + Math.floor(i / 10) * 3, 1.6, P.terraScura);
      }
    },
  };
},

'marco-aurelio'(rng) {
  return {
    cielo: 0x1e2a3a, nebbia: 0x2a3648, raggio: FREDDO, ambiente: .5,
    statici(m) {
      suolo(m, 12, P.neve, P.terraScura, rng, .6);
      for (let i = 0; i < 6; i++) {                       // le tende dell'accampamento
        const x = -10 + (i % 3) * 8, z = -8 + Math.floor(i / 3) * 10;
        for (let k = 0; k < 3; k++) for (let dx = k; dx < 4 - k; dx++) for (let dz = k; dz < 4 - k; dz++)
          m.p(x + dx, 1 + k, z + dz, P.tela);
      }
      for (let i = 0; i < 4; i++) albero(m, 11, -8 + i * 6, 1, rng);
    },
    dinamici(d, t) {
      /* Scrive per sé stesso, in greco, fra una campagna e l'altra: appunti che
         non pensava di pubblicare. */
      const f = (t * .12) % 1.3;
      omino(d, 0, 1.4, 0, P.viola, P.pelle, 1);
      d(0, 3.4, -.8, .8, P.tela);
      for (let i = 0; i < 14; i++) {
        if (f < i / 16) continue;
        const g = ((t * .3 + i * .07) % 1);
        d(Math.cos(i * 1.9) * (1.4 + g * 3), 4 + g * 4, Math.sin(i * 1.9) * (1.4 + g * 3),
          .3 * (1 - g * .6), P.oro);
      }
      for (let i = 0; i < 6; i++)
        omino(d, -7 + i * 3, 1.4, 6, P.ferro, P.pelle, .8);
      for (let i = 0; i < 20; i++) {
        const g = (t * .4 + i * .05) % 1;
        d(((i * 6151) % 25) - 12, 11 - g * 11, ((i * 3571) % 25) - 12, .35, P.neve);
      }
    },
  };
},

milvio(rng) {
  return {
    cielo: TRAMONTO, raggio: FUOCOLUCE,
    statici(m) {
      suolo(m, 12, P.erbaScura, P.terra, rng, .6);
      for (let z = -12; z <= 12; z++) for (let x = -3; x <= 1; x++) m.p(x, 0, z, P.acqua);
      ponte(m, -4, 0, 7, 3, P.pietraChiara);
    },
    dinamici(d, t) {
      /* Il monogramma appare sugli scudi, poi il ponte di barche cede sotto chi
         scappa: due immagini, e l'impero cambia religione. */
      const f = (t * .1) % 1;
      const segno = clamp01(f * 2.4);
      for (let i = 0; i < 14; i++) {
        omino(d, -10 + segno * 6 + (i % 7) * 1.1, 2, -5 + Math.floor(i / 7) * 2.4, P.rosso, P.pelle, .8);
        if (segno > .5) d(-10 + segno * 6 + (i % 7) * 1.1, 3.4, -4.4 + Math.floor(i / 7) * 2.4, .4, P.oro);
      }
      const cede = clamp01((f - .55) * 2.4);
      for (let i = 0; i < 12; i++) {
        const p = clamp01(cede * 1.4 - i * .05);
        omino(d, 3 - p * 2, 3.4 - p * 3.4, -5 + i * 1.1, P.ferro, P.pelle, .8);
      }
      for (let x = -3; x <= 1; x += 2) for (let z = -12; z <= 12; z += 4)
        d(x, .5 + Math.sin(t * 2 + z * .4) * .2, z, 1.8, P.acquaChiara);
    },
  };
},

ambrogio(rng) {
  return {
    cielo: CUPO, raggio: CALDO, ambiente: .6, fronte: Math.PI / 2,
    statici(m) {
      suolo(m, 10, P.marmoOmbra, P.pietra, rng);
      cattedrale(m, -5, -8, 11, 9, 7, P.cotto, P.tetto);
    },
    dinamici(d, t) {
      /* Il vescovo sulla porta e l'imperatore fuori: la Chiesa scopre di poter
         dire no al potere, e il potere di doverla ascoltare. */
      const f = (t * .11) % 1;
      const avanza = clamp01(f * 1.8), indietro = clamp01((f - .55) * 2.2);
      omino(d, 0, 1.4, -1.4, P.biancoIt, P.pelle, 1.05);
      omino(d, 0, 1.4, 6 - avanza * 4.6 + indietro * 4, P.viola, P.pelle, 1);
      for (let i = 0; i < 10; i++)
        omino(d, -5 + (i % 5) * 2.4, 1.4, 8 + Math.floor(i / 5) * 1.6, P.ferro, P.pelle, .78);
      for (let i = 0; i < 8; i++)
        omino(d, -4 + i * 1.2, 1.4, -3.4, P.nero, P.pelle, .78);
      for (let i = 0; i < 6; i++) {
        const g = (t * .4 + i * .17) % 1;
        d(0, 5 + g * 3, -2, .4 * (1 - g), P.oro);
      }
    },
  };
},

'leone-attila'(rng) {
  return {
    cielo: TRAMONTO, nebbia: 0x3a3630, raggio: CALDO, ambiente: .6,
    statici(m) {
      suolo(m, 12, P.erbaScura, P.terra, rng, .8);
      for (let z = -12; z <= 12; z++) for (let x = -1; x <= 1; x++) m.p(x, 0, z, P.acqua);
      for (let i = 0; i < 3; i++) albero(m, -10 + i * 10, -10, 1, rng);
    },
    dinamici(d, t) {
      /* Sulle rive del Mincio: da una parte un vecchio in bianco, dall'altra un
         esercito. L'esercito torna indietro, e nessuno ha capito perché. */
      const f = (t * .1) % 1;
      const parla = clamp01((f - .3) * 2.4), torna = clamp01((f - .65) * 2.6);
      omino(d, -3, 1.4, 0, P.biancoIt, P.pelle, 1);
      omino(d, 3, 1.4, 0, P.terraScura, P.pelle, 1);
      for (let i = 0; i < 20; i++) {
        const x = 6 + (i % 5) * 1.4 + torna * 6;
        omino(d, x, 1.4, -6 + Math.floor(i / 5) * 3, P.marrone, P.pelle, .78);
      }
      for (let i = 0; i < 8; i++) {
        if (parla <= 0) break;
        const g = (t * .8 + i * .12) % 1;
        d(-2.4 + g * 4, 3.4, 0, .3 * (1 - g), P.oro);
      }
      for (let i = 0; i < 6; i++) omino(d, -6 - (i % 3) * 1.4, 1.4, -3 + (i % 2) * 6, P.nero, P.pelle, .78);
    },
  };
},

genserico(rng) {
  return {
    cielo: 0x2a1c18, nebbia: 0x3a2620, raggio: FUOCOLUCE, ambiente: .55,
    statici(m) {
      suolo(m, 12, P.pietraChiara, P.terra, rng);
      for (let i = 0; i < 5; i++) { m.colonna(-9 + i * 4, -8, 1, 7, P.marmo); m.p(-9 + i * 4, 8, -8, P.marmoOmbra); }
      for (let i = 0; i < 6; i++) casa(m, -10 + i * 4, 4, 3, 3, 3, P.cotto, P.tetto, 1);
      cattedrale(m, 4, -6, 6, 6, 5, P.marmo, P.marmoOmbra);
    },
    dinamici(d, t) {
      /* Due settimane di saccheggio metodico: si smonta e si carica, senza
         incendiare. Da qui la parola vandalismo, che è quasi un'ingiustizia. */
      const f = (t * .1) % 1;
      for (let i = 0; i < 14; i++) {
        const p = ((f + i / 14) % 1);
        omino(d, -11 + p * 22, 1.4, 1 + (i % 3) * 1.4, P.marrone, P.pelle, .8);
        d(-11 + p * 22, 3.2, 1 + (i % 3) * 1.4, .55, i % 3 ? P.oro : P.bronzo);
      }
      const spoglio = clamp01(f * 1.4);
      for (let i = 0; i < 8; i++) {
        if (spoglio > i / 8) continue;
        d(-8 + i * 2.4, 9, -6, .8, P.oro);                // le tegole dorate ancora al posto
      }
      for (let i = 0; i < 10; i++) {
        const g = (t * .3 + i * .1) % 1;
        d(-6 + i * 1.4, 2 + g * 4, 6, .6 * (1 - g), P.polvere);
      }
    },
  };
},

tagina(rng) {
  return {
    cielo: CUPO, raggio: FUOCOLUCE,
    statici(m) {
      suolo(m, 12, P.erbaScura, P.terra, rng, 1.6);
      for (let i = 0; i < 4; i++) albero(m, -11, -8 + i * 6, 1, rng);
    },
    dinamici(d, t) {
      /* Gli arcieri bizantini schierati a mezzaluna: la cavalleria gota carica
         al centro e viene presa da tre lati. */
      const f = (t * .11) % 1;
      const carica = clamp01(f * 1.6);
      for (let i = 0; i < 20; i++) {
        const a = -Math.PI / 2 + (i / 19 - .5) * 2.6;
        omino(d, Math.cos(a) * 9, 1.8, 4 + Math.sin(a) * 7, P.indaco, P.pelle, .8);
        if (((t * 4 + i) % 3) < .4) d(Math.cos(a) * 8, 3, 4 + Math.sin(a) * 6, .3, P.oro);
      }
      for (let i = 0; i < 10; i++) {
        const cad = carica > .7 && (i % 3 === 0) ? 1 : 0;
        d(-4 + (i % 5) * 1.8, 2.2 - cad * .8, -8 + carica * 8, 1.1, P.terraScura);
        if (!cad) omino(d, -4 + (i % 5) * 1.8, 3, -8 + carica * 8, P.oliva, P.pelle, .8);
      }
      for (let i = 0; i < 12; i++) {
        const g = (t * .6 + i * .08) % 1;
        d(-3 + (i % 6) * 1.4, 2 + g * 2.4, -4 + carica * 6, .8 * (1 - g), P.polvere);
      }
    },
  };
},

gregorio(rng) {
  return {
    cielo: CUPO, raggio: CALDO, ambiente: .6, fronte: Math.PI / 2,
    statici(m) {
      suolo(m, 10, P.pietraChiara, P.pietra, rng);
      for (let x = -9; x <= 9; x++) for (let y = 1; y <= 7; y++) m.p(x, y, -7, P.cotto);
      for (let z = -7; z <= 3; z++) for (let y = 1; y <= 7; y++) { m.p(-9, y, z, P.cotto); m.p(9, y, z, P.cotto); }
      for (let x = -9; x <= 9; x += 3) for (let z = -7; z <= 3; z += 3) m.p(x, 8, z, P.legno);
      m.box(-2, 1, -6, 5, 2, 1, P.marmo);
    },
    dinamici(d, t) {
      /* Distribuisce il grano, tratta con i Longobardi, manda missionari: il
         papato comincia a fare quello che l'impero non fa più. */
      const f = (t * .12) % 1.2;
      omino(d, 0, 3.4, -6, P.biancoIt, P.pelle, 1);
      for (let i = 0; i < 10; i++) {                      // i sacchi di grano
        const p = ((f + i / 10) % 1);
        d(-7 + p * 14, 2.2, 1 + (i % 3), .7, P.sabbia);
        if (p > .5) omino(d, -7 + p * 14, 2, 2.4 + (i % 3), P.tela, P.pelle, .75);
      }
      for (let i = 0; i < 4; i++) {                       // i missionari che partono
        const p = clamp01(f * 1.4 - i * .1);
        omino(d, -8 + p * 3, 2, -4 + i * 1.6, P.nero, P.pelle, .78);
      }
      for (let i = 0; i < 6; i++) d(-3 + i * 1.2, 3.4, -5.4, .5, P.tela);
    },
  };
},

/* ---------------- alto medioevo ---------------- */

teodolinda(rng) {
  return {
    cielo: CUPO, raggio: CALDO, ambiente: .6, fronte: Math.PI / 2,
    statici(m) {
      suolo(m, 10, P.pietraChiara, P.pietra, rng);
      cattedrale(m, -5, -8, 11, 9, 7, P.marmo, P.tetto);
    },
    dinamici(d, t) {
      /* La regina che converte un popolo: il corteo entra ariano ed esce
         cattolico, e la basilica si riempie di doni. */
      const f = (t * .12) % 1.3;
      for (let i = 0; i < 12; i++) {
        const p = ((f + i / 12) % 1);
        omino(d, -1 + (i % 3) * 1.2, 1.4, 9 - p * 12, p > .5 ? P.biancoIt : P.oliva, P.pelle, .8);
      }
      omino(d, 0, 1.4, -3, P.viola, P.pelle, 1.05);
      const doni = Math.floor(clamp01(f / 1.3) * 10);
      for (let i = 0; i < doni; i++)
        d(-4 + (i % 5) * 2, 1.6 + Math.floor(i / 5) * .7, -5, .55, i % 2 ? P.oro : P.bronzo);
      for (let i = 0; i < 6; i++) {
        const g = (t * .4 + i * .17) % 1;
        d(0, 6 + g * 3, -4, .35 * (1 - g), P.oro);
      }
    },
  };
},

liutprando(rng) {
  return {
    cielo: GIORNO, raggio: CALDO, ambiente: .6, fronte: Math.PI / 2,
    statici(m) {
      suolo(m, 10, P.legno, P.tronco, rng);
      for (let x = -9; x <= 9; x++) for (let y = 1; y <= 7; y++) m.p(x, y, -7, P.legno);
      for (let z = -7; z <= 3; z++) for (let y = 1; y <= 7; y++) { m.p(-9, y, z, P.legno); m.p(9, y, z, P.legno); }
      for (let k = 0; k < 5; k++) for (let x = -9 + k; x <= 9 - k; x++) for (let z = -7; z <= 3; z++)
        if (x === -9 + k || x === 9 - k) m.p(x, 8 + k, z, P.tronco);
      m.box(-2, 1, -6, 5, 3, 1, P.tronco);
    },
    dinamici(d, t) {
      /* Ogni anno un nuovo capitolo: l'editto cresce di pagina in pagina, e il
         diritto scritto torna a governare la vita quotidiana. */
      const f = (t * .18) % 1.3;
      const anni = Math.floor((f / 1.3) * 22);
      for (let i = 0; i < anni; i++)
        d(-6 + (i % 8) * 1.5, 2.2 + Math.floor(i / 8) * .5, -1, .8, P.tela);
      omino(d, 0, 4.4, -6, P.rosso, P.pelle, 1);
      for (let i = 0; i < 9; i++)
        omino(d, -6 + i * 1.6, 1.4, 2, P.oliva, P.pelle, .8);
      for (let i = 0; i < 5; i++) d(-2 + i * 1.1, 3.4, -4, .4, P.oro);
    },
  };
},

taormina(rng) {
  return {
    cielo: TRAMONTO, raggio: FUOCOLUCE,
    statici(m) {
      for (let x = -12; x <= 12; x++) for (let z = 6; z <= 12; z++) m.p(x, 0, z, P.mare);
      for (let x = -12; x <= 12; x++) for (let z = -12; z <= 5; z++) {
        const h = Math.max(1, Math.round((5 - z) * .7));
        for (let y = 1; y <= h; y++) m.p(x, y, z, y === h ? P.erbaScura : P.roccia);
      }
      mura(m, -6, -6, 13, 8, 5, P.pietraChiara);
      // il teatro greco affacciato sul mare
      for (let k = 0; k < 4; k++) for (let a = 0; a < 14; a++) {
        const an = Math.PI + a / 14 * Math.PI;
        m.p(Math.round(Math.cos(an) * (5 - k)) + 8, 9 + k, Math.round(Math.sin(an) * (5 - k)) - 2, P.sabbia);
      }
    },
    dinamici(d, t) {
      onde(d, t, 12, 3, [12, 6]);
      /* L'ultima città bizantina dell'isola: dopo settantacinque anni di guerra
         la bandiera cambia e la Sicilia diventa araba per due secoli. */
      const f = (t * .1) % 1;
      const cade = f > .55;
      for (let i = 0; i < 10; i++)
        omino(d, -5 + i * 1.3, 7.6, -6, cade ? P.verdeIt : P.indaco, P.pelle, .8);
      for (let i = 0; i < 14; i++) {
        if (cade) break;
        const p = clamp01(f * 2 - i * .04);
        omino(d, -8 + (i % 7) * 2, 1.6, 7 - p * 6, P.verdeIt, P.pelle, .8);
      }
      bandiera(d, t, 6, 8, -6, 2, cade ? [P.verdeIt, P.verdeIt] : [P.indaco, P.oro], 0);
      if (!cade) fuoco(d, t, -2, 6, -4, 6, 1, 0);
    },
  };
},

ottone(rng) {
  return {
    cielo: CUPO, raggio: CALDO, ambiente: .6, fronte: Math.PI / 2,
    statici(m) {
      suolo(m, 10, P.marmoOmbra, P.pietra, rng);
      for (let x = -9; x <= 9; x++) for (let y = 1; y <= 11; y++) {
        if (y > 8 && Math.abs(x) < 9 - (y - 8) * 3) continue;
        m.p(x, y, -7, P.marmo);
      }
      for (let z = -7; z <= 3; z++) for (let y = 1; y <= 10; y++) { m.p(-9, y, z, P.marmo); m.p(9, y, z, P.marmo); }
      m.box(-2, 1, -5, 5, 2, 2, P.oro);
    },
    dinamici(d, t) {
      /* Un re di Germania scende, si fa incoronare, e per otto secoli la corona
         imperiale resterà legata al nord delle Alpi. */
      const f = (t * .13) % 1.2;
      const giu = clamp01((f - .3) * 2.2);
      omino(d, 0, 3.4, -3, P.ferro, P.pelle, 1.05);
      omino(d, 2.6, 1.4, -3.6, P.biancoIt, P.pelle, 1);
      d(0, 6.4 - giu * 1.1, -3, .8, P.oro);
      for (let i = 0; i < 10; i++)
        omino(d, -6 + i * 1.4, 1.4, 1, i % 3 ? P.ferro : P.oliva, P.pelle, .78);
      for (let i = 0; i < 8; i++) {
        const g = (t * .5 + i * .12) % 1;
        d(Math.cos(i * 1.9) * (1 + g * 3), 6 + g * 2, -3 + Math.sin(i * 1.7) * (1 + g * 3), .3 * (1 - g), P.oro);
      }
    },
  };
},

'pisa-genova'(rng) {
  return {
    cielo: GIORNO, raggio: CALDO,
    statici(m) {
      for (let x = -12; x <= 12; x++) for (let z = -12; z <= 12; z++) m.p(x, 0, z, P.mare);
      for (let x = -12; x <= 12; x++) for (let z = 4; z <= 12; z++) {
        const h = Math.max(1, Math.round((z - 3) * .5));
        for (let y = 1; y <= h; y++) m.p(x, y, z, y === h ? P.erbaScura : P.roccia);
      }
      for (let i = 0; i < 3; i++) {                       // le torri costiere
        m.colonna(-8 + i * 8, 6, Math.max(1, Math.round(3 * .5)) + 1, 5, P.pietraChiara);
      }
    },
    dinamici(d, t) {
      onde(d, t, 12, 3, [12, 4]);
      /* Due repubbliche cacciano i Saraceni dall'isola e poi restano: la
         rivalità comincia qui e finirà solo alla Meloria. */
      const f = (t * .1) % 1;
      for (let k = 0; k < 3; k++)
        nave(d, t, -10 + clamp01(f * 2) * 6, 1.2, -8 + k * 4, 1, 6, P.legno, P.rossoIt, 0);
      for (let k = 0; k < 3; k++)
        nave(d, t, -10 + clamp01(f * 2) * 6, 1.2, 0 + k * 3, 1, 6, P.legno, P.biancoIt, 0);
      const fuga = clamp01((f - .5) * 2);
      for (let k = 0; k < 3; k++)
        nave(d, t, 4 + fuga * 8, 1.2, -6 + k * 6, -1, 5, P.tronco, P.verdeIt, 0);
      for (let i = 0; i < 6; i++) {
        if (f < .7) break;
        omino(d, -6 + i * 2.4, 2, 5, i % 2 ? P.rossoIt : P.biancoIt, P.pelle, .8);
      }
    },
  };
},

'venezia-oriente'(rng) {
  return {
    cielo: GIORNO, raggio: CALDO,
    statici(m) {
      for (let x = -12; x <= 12; x++) for (let z = -12; z <= 12; z++) m.p(x, 0, z, P.mare);
      for (let x = -12; x <= -7; x++) for (let z = -12; z <= 12; z++) { m.p(x, 1, z, P.pietraChiara); m.p(x, 0, z, P.terra); }
      for (let x = 8; x <= 12; x++) for (let z = -12; z <= 12; z++) { m.p(x, 1, z, P.sabbia); m.p(x, 0, z, P.terra); }
      for (let i = 0; i < 3; i++) casa(m, -11, -8 + i * 7, 4, 4, 4, P.tela, P.tetto, 2);
      for (let i = 0; i < 3; i++) {                       // le cupole d'Oriente
        for (let y = 0; y < 3; y++) for (let x = -2; x <= 2; x++) for (let z = -2; z <= 2; z++) {
          if (Math.hypot(x, z) > 2.4 - y * .6) continue;
          m.p(10 + x, 5 + y, -7 + i * 7 + z, P.oro);
        }
      }
    },
    dinamici(d, t) {
      onde(d, t, 12, 3, [12, 12]);
      /* La bolla d'oro: in cambio dell'aiuto navale, commercio senza dazi in
         tutto l'impero. La fortuna di Venezia nasce da una firma. */
      const f = (t * .09) % 1;
      for (let k = 0; k < 4; k++) {
        const p = ((f + k / 4) % 1);
        const andata = p < .5;
        const x = andata ? -6 + p * 2 * 13 : 7 - (p - .5) * 2 * 13;
        nave(d, t, x, 1.2, -8 + k * 5, andata ? 1 : -1, 7, P.legno, P.rossoIt, 0);
        if (!andata) for (let i = 0; i < 3; i++) d(x - i * .8, 2.2, -8 + k * 5, .6, i % 2 ? P.oro : P.viola);
      }
      for (let i = 0; i < 8; i++) d(-9 + (i % 4) * 1.4, 2.2 + Math.floor(i / 4) * .7, 4, .6, P.oro);
    },
  };
},

/* ---------------- comuni e signorie ---------------- */

matilde(rng) {
  return {
    cielo: GIORNO, raggio: CALDO,
    statici(m) {
      for (let x = -12; x <= 12; x++) for (let z = -12; z <= 12; z++) {
        const h = Math.max(0, Math.round(6 - Math.hypot(x, z) * .6));
        m.p(x, h, z, h > 3 ? P.roccia : P.erbaScura);
        for (let y = 0; y < h; y++) m.p(x, y, z, P.roccia);
      }
      mura(m, -3, -3, 7, 7, 5, P.pietraChiara);
      torre(m, -4, -4, 9, P.pietraChiara);
    },
    dinamici(d, t) {
      /* La contessa lascia i suoi beni alla Chiesa: un territorio che va dal
         Lazio al Garda cambia proprietario con un documento. */
      const f = (t * .12) % 1.3;
      omino(d, 0, 7.4, 0, P.viola, P.pelle, 1);
      for (let i = 0; i < 12; i++) {
        const p = clamp01(f * 1.4 - i * .05);
        if (p <= 0) continue;
        const a = i / 12 * Math.PI * 2;
        d(Math.cos(a) * p * 11, 7 - p * 5, Math.sin(a) * p * 11, .6, P.tela);
      }
      for (let i = 0; i < 8; i++) omino(d, Math.cos(i * .8) * 4.4, 7.4, Math.sin(i * .8) * 4.4, P.ferro, P.pelle, .78);
    },
  };
},

costanza(rng) {
  return {
    cielo: GIORNO, raggio: CALDO, fronte: Math.PI / 2,
    statici(m) {
      suolo(m, 11, P.pietraChiara, P.pietra, rng);
      casa(m, -9, -9, 19, 6, 6, P.cotto, P.tetto, 1);
      for (let x = -12; x <= 12; x++) m.p(x, 1, 3, P.pietra);
    },
    dinamici(d, t) {
      /* L'imperatore riconosce ai Comuni il diritto di eleggersi i consoli: in
         Italia lo stato cittadino diventa legale, e i sigilli lo certificano. */
      const f = (t * .12) % 1.3;
      for (let i = 0; i < 16; i++) {
        if (f < i / 18) continue;
        bandiera(d, t, -11 + i * 1.5, 2, 6, 2,
          [[P.rossoIt, P.blu, P.verdeIt, P.oro, P.viola, P.menta][i % 6], P.biancoIt], i);
      }
      omino(d, 0, 7.4, -3.6, P.ferro, P.pelle, 1);
      d(0, 9.4, -3.6, .7, P.oro);
      folla(d, t, 0, 1, 14, 1.8, [P.tela, P.viola], 1.2);
    },
  };
},

'san-marco-cavalli'(rng) {
  return {
    cielo: TRAMONTO, raggio: CALDO,
    statici(m) {
      for (let x = -12; x <= 12; x++) for (let z = -12; z <= 12; z++) m.p(x, 0, z, P.acqua);
      for (let x = -8; x <= 8; x++) for (let z = -6; z <= 6; z++) m.p(x, 1, z, P.pietraChiara);
      cattedrale(m, -3, -5, 7, 8, 6, P.marmo, P.oro);
    },
    dinamici(d, t) {
      /* La crociata dirottata sulla città cristiana più ricca del mondo: la
         quadriga di bronzo arriva via mare e sale sulla basilica. */
      const f = (t * .1) % 1;
      const arrivo = clamp01(f * 1.6), su = clamp01((f - .5) * 2.2);
      if (arrivo < 1) nave(d, t, 11 - arrivo * 8, 1.2, 8, -1, 7, P.legno, P.rossoIt, 3);
      for (let i = 0; i < 4; i++) {
        const x = -1.5 + i, y = 2 + su * 7.4, z = 8 - arrivo * 5 - su * 6;
        d(x, y, z, .9, P.bronzo);
        d(x, y + .9, z - .5, .7, P.bronzo);
      }
      for (let x = -12; x <= 12; x += 3) for (let z = -12; z <= 12; z += 4) {
        if (Math.abs(x) <= 9 && Math.abs(z) <= 7) continue;
        d(x, .6 + Math.sin(t * 1.7 + x * .4) * .22, z, 2.4, P.acquaChiara);
      }
      folla(d, t, 0, 4, 12, 1.6, [P.tela, P.viola], 2.2);
    },
  };
},

'federico-ii'(rng) {
  return {
    cielo: GIORNO, raggio: CALDO, fronte: Math.PI / 2,
    statici(m) {
      suolo(m, 10, P.sabbia, P.terra, rng);
      for (let x = -9; x <= 9; x++) for (let y = 1; y <= 8; y++) m.p(x, y, -7, P.pietraChiara);
      for (let z = -7; z <= 3; z++) for (let y = 1; y <= 8; y++) { m.p(-9, y, z, P.pietraChiara); m.p(9, y, z, P.pietraChiara); }
      for (let x = -9; x <= 9; x += 3) for (let z = -7; z <= 3; z += 3) m.p(x, 9, z, P.legno);
      m.box(-2, 1, -6, 5, 3, 1, P.marmo);
    },
    dinamici(d, t) {
      /* Stupor mundi: alla stessa corte un notaio arabo, uno greco e uno
         latino, e sul tavolo il trattato di falconeria scritto da lui. */
      const f = (t * .12) % 1.2;
      omino(d, 0, 4.4, -6, P.oro, P.pelle, 1.05);
      const gruppi = [[P.verdeIt, -5], [P.blu, 0], [P.rosso, 5]];
      for (let g = 0; g < 3; g++)
        for (let i = 0; i < 3; i++)
          omino(d, gruppi[g][1] + (i % 2) * 1.2, 1.4, 1 + Math.floor(i / 2) * 1.4, gruppi[g][0], P.pelle, .8);
      for (let i = 0; i < 8; i++) {
        if (f < i / 10) continue;
        d(-3 + i * .9, 2.6, -3, .7, P.tela);
      }
      for (let i = 0; i < 5; i++) {                       // i falchi
        const a = t * .6 + i * 1.25;
        d(Math.cos(a) * 6, 10 + Math.sin(a * 2) * 1.4, Math.sin(a) * 4, .45, P.terraScura);
      }
    },
  };
},

'assisi-basilica'(rng) {
  return {
    cielo: GIORNO, raggio: CALDO,
    statici(m) {
      for (let x = -12; x <= 12; x++) for (let z = -12; z <= 12; z++) {
        const h = Math.max(0, Math.round(4 - Math.abs(z) * .35));
        m.p(x, h, z, h > 1 ? P.erbaScura : P.terra);
        for (let y = 0; y < h; y++) m.p(x, y, z, P.roccia);
      }
      // due chiese sovrapposte
      cattedrale(m, -5, -4, 11, 8, 5, P.marmo, P.tetto);
      for (let x = -5; x <= 5; x++) for (let z = -4; z <= 3; z++) m.p(x, 5, z, P.marmoOmbra);
    },
    dinamici(d, t) {
      /* Sopra la tomba di chi voleva morire nudo sulla nuda terra si alzano due
         chiese, e Giotto le riempie di affreschi. */
      const f = (t * .12) % 1.3;
      for (let i = 0; i < 12; i++) {
        if (f < i / 14) continue;
        const x = -4.5 + (i % 6) * 1.8, y = 7 + Math.floor(i / 6) * 2;
        d(x, y, -4.4, 1.2, i % 3 ? P.sabbia : P.acquaChiara);
        omino(d, x, y - .4, -4.2, i % 2 ? P.nero : P.oro, P.pelle, .5);
      }
      folla(d, t, 0, 6, 10, 1.6, [P.nero, P.tela], 1.2);
      for (let i = 0; i < 8; i++) {
        const a = t * .5 + i * .8;
        d(Math.cos(a) * 8, 12 + Math.sin(a * 2) * 1.4, Math.sin(a) * 8, .4, P.nero);
      }
    },
  };
},

tommaso(rng) {
  return {
    cielo: CUPO, raggio: CALDO, ambiente: .6, fronte: Math.PI / 2,
    statici(m) {
      suolo(m, 9, P.pietraChiara, P.pietra, rng);
      for (let x = -8; x <= 8; x++) for (let y = 1; y <= 8; y++) m.p(x, y, -7, P.pietra);
      for (let z = -7; z <= 2; z++) for (let y = 1; y <= 8; y++) { m.p(-8, y, z, P.pietra); m.p(8, y, z, P.pietra); }
      for (let z = -7; z <= 2; z++) for (let a = 0; a <= 12; a++) {
        const an = Math.PI * a / 12;
        m.p(Math.round(-Math.cos(an) * 8), 9 + Math.round(Math.sin(an) * 2), z, P.pietra);
      }
      m.box(-6, 1, -2, 13, 1, 2, P.legno);
    },
    dinamici(d, t) {
      /* Due colonne di argomenti — Aristotele da una parte, la fede
         dall'altra — che salgono e si incontrano in cima. */
      const f = (t * .14) % 1.3;
      for (let i = 0; i < 9; i++) {
        if (f < i / 11) continue;
        d(-3.5, 2.4 + i * .8, -1, .7, P.oro);
        d(3.5, 2.4 + i * .8, -1, .7, P.acquaChiara);
      }
      if (f > .85) for (let i = 0; i < 7; i++)
        d(-3.5 + i * 1.17, 9.6, -1, .7, P.biancoIt);
      omino(d, 0, 2.2, 2, P.nero, P.pelle, 1);
      for (let i = 0; i < 6; i++) omino(d, -5 + i * 2, 1.4, 4, P.tela, P.pelle, .78);
    },
  };
},

campaldino(rng) {
  return {
    cielo: TRAMONTO, raggio: FUOCOLUCE,
    statici(m) {
      suolo(m, 12, P.erbaScura, P.terra, rng, .8);
      for (let i = 0; i < 4; i++) albero(m, -11, -8 + i * 6, 1, rng);
      for (let i = 0; i < 3; i++) casa(m, 9, -7 + i * 7, 3, 3, 2, P.tela, P.tetto, 1);
    },
    dinamici(d, t) {
      /* Fra i cavalieri fiorentini c'è un ragazzo di ventiquattro anni che
         scriverà la Commedia: qui è solo uno che ha paura come gli altri. */
      const f = (t * .1) % 1;
      const urto = clamp01(f * 1.8);
      for (let i = 0; i < 12; i++) {
        const z = -6 + (i % 6) * 2.2;
        d(-8 + urto * 7, 2, z, 1.1, P.terraScura);
        omino(d, -8 + urto * 7, 2.8, z, i === 3 ? P.rossoIt : P.blu, P.pelle, .8);
      }
      for (let i = 0; i < 12; i++) {
        const z = -6 + (i % 6) * 2.2;
        d(7 - urto * 4, 2, z, 1.1, P.terraScura);
        omino(d, 7 - urto * 4, 2.8, z, P.nero, P.pelle, .8);
      }
      for (let i = 0; i < 14; i++) {
        const g = (t * .6 + i * .07) % 1;
        d(-1 + Math.sin(i * 2.2) * 3, 2 + g * 3, -6 + (i % 7) * 2, .8 * (1 - g), P.polvere);
      }
    },
  };
},

'dante-esilio'(rng) {
  return {
    cielo: TRAMONTO, nebbia: 0x3a3440, raggio: CALDO, ambiente: .6,
    statici(m) {
      suolo(m, 12, P.erbaScura, P.terra, rng, 1);
      for (let x = -12; x <= 12; x++) m.p(x, 1, 0, P.sabbia);
      // le mura di Firenze, alle spalle
      for (let z = -8; z <= 8; z++) for (let y = 1; y <= 5; y++) m.p(-10, y, z, P.pietraChiara);
      torre(m, -11, -3, 8, P.pietraChiara);
      cattedrale(m, -9, 2, 5, 5, 4, P.marmo, P.tetto);
      for (let i = 0; i < 4; i++) albero(m, 4 + i * 3, 6, 1, rng);
    },
    dinamici(d, t) {
      /* Se ne va e non tornerà: la città si allontana alle spalle, e a ogni
         passo il sacco pesa un po' di più. */
      const f = (t * .1) % 1;
      omino(d, -7 + f * 16, 2, 0, P.rosso, P.pelle, .95);
      d(-7 + f * 16, 3.8, .6, .5, P.terraScura);
      for (let i = 0; i < 10; i++) {                      // i fogli che si accumulano dietro
        if (f < i / 12) continue;
        d(-8 + i * 1.5, 2.2 + Math.sin(t + i) * .1, -1.4, .6, P.tela);
      }
      for (let i = 0; i < 8; i++) {
        const g = (t * .4 + i * .12) % 1;
        d(-7 + f * 16 - g * 3, 2 + g, .8, .5 * (1 - g), P.polvere);
      }
    },
  };
},

avignone(rng) {
  return {
    cielo: CUPO, nebbia: 0x2e2c34, raggio: 0xd0c0a0, ambiente: .55,
    statici(m) {
      suolo(m, 12, P.pietraChiara, P.terra, rng);
      cattedrale(m, -4, -6, 9, 9, 6, P.marmo, P.marmoOmbra);
      for (let i = 0; i < 6; i++) casa(m, -11 + i * 4, 6, 3, 3, 3, P.cotto, P.tetto, 1);
    },
    dinamici(d, t) {
      /* Settant'anni senza curia: Roma si spopola, le chiese cadono a pezzi e
         l'erba cresce fra le pietre. */
      const f = (t * .09) % 1;
      const partenza = clamp01(f * 1.6);
      for (let i = 0; i < 12; i++) {
        const p = clamp01(partenza * 1.4 - i * .04);
        omino(d, -2 + (i % 4) * 1.2, 1.4, -2 + p * 14, i === 0 ? P.biancoIt : P.viola, P.pelle, .8);
      }
      const abbandono = clamp01((f - .5) * 2);
      for (let i = 0; i < 18; i++) {
        if (abbandono <= 0) break;
        d(-10 + (i % 9) * 2.4, 1.4, -8 + Math.floor(i / 9) * 4, .8 * abbandono, P.foglie);
      }
      for (let i = 0; i < 8; i++) {
        if (abbandono < .5) break;
        d(-4 + i * 1.4, 6 - abbandono * 2, -5, .8, P.pietraChiara);
      }
    },
  };
},

'gian-galeazzo'(rng) {
  return {
    cielo: TRAMONTO, raggio: CALDO,
    statici(m) {
      suolo(m, 12, P.erbaScura, P.terra, rng, .8);
      m.box(-11, 1, -11, 23, 1, 23, P.terra);
      mura(m, -3, -3, 7, 7, 5, P.pietraChiara);
      torre(m, -4, -4, 9, P.pietraChiara);
    },
    dinamici(d, t) {
      /* Compra il titolo ducale e mette insieme mezza Italia settentrionale.
         Poi la peste lo prende in due settimane e tutto si sfalda. */
      const f = (t * .09) % 1;
      const cresce = clamp01(f * 1.8), sfalda = clamp01((f - .65) * 2.8);
      const citta = [[-9, -8], [-6, 5], [7, -7], [8, 6], [-9, 1], [4, -2], [0, -9], [2, 8], [-2, 3]];
      for (let i = 0; i < citta.length; i++) {
        const preso = cresce > i / citta.length && sfalda < (i + 1) / citta.length;
        const [x, z] = citta[i];
        d(x, 2.4, z, 1.4, preso ? P.oliva : P.grigio);
        d(x, 3.4, z, .9, preso ? P.oro : P.grigio);
      }
      d(0, 7.4, 0, 1.1, sfalda > .5 ? P.grigio : P.oro);
      for (let i = 0; i < 8; i++) {
        if (sfalda <= 0) break;
        const g = (t * .8 + i * .12) % 1;
        d(Math.cos(i * 1.9) * (2 + g * 6), 6 + g * 2, Math.sin(i * 1.7) * (2 + g * 6), .5 * (1 - g), P.fumo);
      }
    },
  };
},

/* ---------------- Rinascimento ---------------- */

anghiari(rng) {
  return {
    cielo: TRAMONTO, raggio: FUOCOLUCE,
    statici(m) {
      suolo(m, 12, P.erbaScura, P.terra, rng, 1);
      for (let i = 0; i < 3; i++) albero(m, -11, -7 + i * 7, 1, rng);
    },
    dinamici(d, t) {
      /* Una battaglia quasi senza morti, dice Machiavelli: mercenari che si
         fanno prigionieri a vicenda perché il morto non si rivende. */
      const t2 = t * .8;
      for (let i = 0; i < 6; i++) {
        const a = t2 * .5 + i * 1.05;
        d(Math.cos(a) * 3.4, 2, Math.sin(a) * 2.4, 1.1, P.terraScura);
        omino(d, Math.cos(a) * 3.4, 2.8, Math.sin(a) * 2.4, i % 2 ? P.rosso : P.blu, P.pelle, .8);
        d(Math.cos(a) * 4.4, 3.6, Math.sin(a) * 3.2, .35, P.ferro);
      }
      for (let i = 0; i < 10; i++) {                      // i prigionieri che se ne vanno a piedi
        const p = ((t * .3 + i * .1) % 1);
        omino(d, 6 + p * 6, 1.6, -5 + (i % 5) * 2, P.tela, P.pelle, .78);
      }
      for (let i = 0; i < 14; i++) {
        const g = (t * .6 + i * .07) % 1;
        d(Math.sin(i * 2.2) * 3, 2 + g * 3, Math.cos(i * 1.9) * 3, .8 * (1 - g), P.polvere);
      }
    },
  };
},

lodi(rng) {
  return {
    cielo: GIORNO, raggio: CALDO, fronte: Math.PI / 2,
    statici(m) {
      suolo(m, 10, P.pietraChiara, P.pietra, rng);
      for (let x = -9; x <= 9; x++) for (let y = 1; y <= 7; y++) m.p(x, y, -7, P.tela);
      for (let z = -7; z <= 3; z++) for (let y = 1; y <= 7; y++) { m.p(-9, y, z, P.tela); m.p(9, y, z, P.tela); }
      for (let x = -9; x <= 9; x += 2) for (let z = -7; z <= 3; z += 2) m.p(x, 8, z, P.legno);
      m.box(-6, 1, -2, 13, 1, 3, P.legno);
    },
    dinamici(d, t) {
      /* Cinque potenze attorno allo stesso tavolo: si riconoscono a vicenda, e
         per quarant'anni nessuno attacca nessuno. */
      const f = (t * .13) % 1.3;
      const stati = [[P.oliva, -5], [P.acqua, -2.5], [P.ocra, 0], [P.rosso, 2.5], [P.corallo, 5]];
      for (let i = 0; i < 5; i++) {
        omino(d, stati[i][1], 2.2, -3.4, stati[i][0], P.pelle, .85);
        if (f > (i + 1) / 6) d(stati[i][1], 2.4, -1.4, .5, P.oro);   // i sigilli
      }
      for (let i = 0; i < 8; i++) {
        if (f < .7) break;
        d(-3 + i * .9, 2.4, -.4, .8, P.tela);
      }
      for (let i = 0; i < 8; i++) omino(d, -6 + i * 1.8, 1.4, 4, P.viola, P.pelle, .75);
    },
  };
},

urbino(rng) {
  return {
    cielo: GIORNO, raggio: CALDO,
    statici(m) {
      for (let x = -12; x <= 12; x++) for (let z = -12; z <= 12; z++) {
        const h = Math.max(0, Math.round(4 - Math.hypot(x * .7, z) * .35));
        m.p(x, h, z, h > 1 ? P.erbaScura : P.erba);
        for (let y = 0; y < h; y++) m.p(x, y, z, P.terra);
      }
      casa(m, -6, -5, 13, 10, 6, P.cotto, P.tetto, 5);
      for (const cx of [-7, 6]) for (let y = 0; y < 11; y++) m.p(cx, 5 + y, -4, y > 8 ? P.tetto : P.cotto);
    },
    dinamici(d, t) {
      /* Un palazzo "in forma di città", e dentro una biblioteca di soli
         manoscritti: la stampa, al duca, faceva schifo. */
      const f = (t * .13) % 1.3;
      const libri = Math.floor((f / 1.3) * 18);
      for (let i = 0; i < libri; i++)
        d(-4 + (i % 6) * 1.5, 7 + Math.floor(i / 6) * .8, -3, .7, i % 3 ? P.cotto : P.oro);
      omino(d, 0, 6.4, -1, P.rosso, P.pelle, 1);
      for (let i = 0; i < 6; i++) omino(d, -4 + i * 1.8, 6.4, 2, P.viola, P.pelle, .78);
      for (let i = 0; i < 8; i++) {
        const a = t * .5 + i * .8;
        d(Math.cos(a) * 9, 13 + Math.sin(a * 2) * 1.4, Math.sin(a) * 9, .4, P.nero);
      }
    },
  };
},

colleoni(rng) {
  return {
    cielo: CUPO, raggio: CALDO, ambiente: .6,
    statici(m) {
      suolo(m, 10, P.pietraChiara, P.pietra, rng);
      m.box(-3, 1, -3, 7, 3, 7, P.marmoOmbra);
      for (let i = 0; i < 4; i++) casa(m, -10 + i * 6, 7, 4, 3, 4, P.cotto, P.tetto, 1);
    },
    dinamici(d, t) {
      /* Il cavallo alza uno zoccolo e il cavaliere si torce sulla sella: la
         statua equestre più tesa mai fusa. */
      const f = (t * .13) % 1.2;
      const fuso = clamp01(f * 1.6);
      const c = fuso > .6 ? P.bronzo : P.terraScura;
      for (let i = 0; i < 4; i++) d(-1.4 + i * .9, 5.4, 0, 1.1, c);
      d(2.4, 6.4, 0, .9, c);                              // testa
      d(-1.8, 4.4, .6, .6, c); d(-1.8, 4.4, -.6, .6, c);  // zampe posteriori
      d(1.6, 4.4 + Math.sin(t * 1.2) * .3, .6, .6, c);    // zoccolo alzato
      d(1.6, 4.4, -.6, .6, c);
      omino(d, .4, 6.4, 0, c, c, .95);
      d(1.2, 8.2, 0, .4, c);
      for (let i = 0; i < 10; i++) {
        if (fuso > .7) break;
        const g = (t * 1.2 + i * .1) % 1;
        d(Math.cos(i * 2.2) * (1.4 + g * 3), 5 - g * 2, Math.sin(i * 2.2) * (1.4 + g * 3), .35, P.brace);
      }
      folla(d, t, 0, 6, 8, 1.6, [P.tela, P.viola], 1.2);
    },
  };
},

savonarola(rng) {
  return {
    cielo: 0x241c1c, nebbia: 0x322624, raggio: FUOCOLUCE, ambiente: .5,
    statici(m) {
      suolo(m, 11, P.pietraChiara, P.terra, rng);
      casa(m, -10, -10, 7, 5, 7, P.pietra, P.tetto, 1);
      for (let i = 0; i < 4; i++) casa(m, 4 + (i % 2) * 5, -8 + i * 4, 3, 3, 4, P.cotto, P.tetto, 1);
      m.box(-2, 1, -2, 5, 1, 5, P.pietra);
    },
    dinamici(d, t) {
      /* Prima il rogo delle vanità, poi il suo: nella stessa piazza, con la
         stessa folla, a quattro anni di distanza. */
      const f = (t * .09) % 1;
      const primo = f < .5;
      for (let y = 0; y < 5; y++) d(0, 2 + y, 0, .5, P.tronco);
      if (primo) {
        for (let i = 0; i < 10; i++) {
          const g = ((f * 2 + i / 10) % 1);
          d(Math.cos(i * 2.2) * (1 + g * 3), 2 + g * 2, Math.sin(i * 2.2) * (1 + g * 3), .6,
            [P.oro, P.viola, P.acquaChiara, P.tela][i % 4]);
        }
      } else {
        omino(d, 0, 3.4, 0, P.nero, P.nero, .95);
      }
      fuoco(d, t, 0, 2, 0, 10, 1.2, 0);
      folla(d, t, 0, 6, 20, 2, primo ? [P.nero, P.tela] : [P.viola, P.rosso], 1.2);
    },
  };
},

vespucci(rng) {
  return {
    cielo: GIORNO, raggio: CALDO,
    statici(m) {
      for (let x = -12; x <= 12; x++) for (let z = -12; z <= 12; z++) m.p(x, 0, z, P.mare);
      for (let x = -12; x <= -8; x++) for (let z = -12; z <= 12; z++) { m.p(x, 1, z, P.sabbia); m.p(x, 0, z, P.terra); }
    },
    dinamici(d, t) {
      /* Costeggia per migliaia di chilometri senza trovare la fine: non è
         l'Asia, è un continente nuovo. E la carta si allunga. */
      const f = (t * .1) % 1;
      nave(d, t, -6, 1.2, -8 + f * 16, 1, 7, P.legno, P.tela, 0);
      const costa = Math.floor(clamp01(f * 1.3) * 22);
      for (let i = 0; i < costa; i++) {
        const z = -11 + i;
        for (let x = -12; x <= -9 + Math.sin(i * .6) * 1.5; x++) d(x, 1.4, z, .95, P.erbaScura);
      }
      onde(d, t, 12, 3, [12, 12]);
      for (let i = 0; i < 6; i++) {                       // il nome sulla carta
        if (f < .8) break;
        d(4 + i * 1.1, 6 + Math.sin(t + i) * .12, 0, .6, P.oro);
      }
    },
  };
},

agnadello(rng) {
  return {
    cielo: CUPO, nebbia: 0x30342e, raggio: 0xd8c8a4, ambiente: .55,
    statici(m) {
      suolo(m, 12, P.terraScura, P.terra, rng, .6);
      for (let z = -12; z <= 12; z++) for (let x = 8; x <= 10; x++) m.p(x, 1, z, P.acqua);
      for (let i = 0; i < 3; i++) albero(m, -11, -7 + i * 7, 1, rng);
    },
    dinamici(d, t) {
      /* In un pomeriggio Venezia perde tutta la terraferma. Ci metterà cinque
         anni a riprendersela, e non tornerà più quella di prima. */
      const f = (t * .09) % 1;
      const rotta = clamp01((f - .35) * 2.2);
      for (let i = 0; i < 18; i++) {
        const lato = i % 3;
        omino(d, -9 + f * 5 + (i % 6) * 1.2, 2, -6 + Math.floor(i / 6) * 2.4,
          [P.blu, P.biancoIt, P.oro][lato], P.pelle, .8);
      }
      for (let i = 0; i < 14; i++)
        omino(d, 4 + rotta * 6 + (i % 7) * 1.1, 2, -5 + Math.floor(i / 7) * 2.4, P.rossoIt, P.pelle, .8);
      for (let i = 0; i < 8; i++) {                       // le città che cambiano bandiera
        if (rotta < .5) break;
        bandiera(d, t, -8 + i * 2.4, 2, 8, 2, [P.blu, P.oro], i);
      }
      for (let i = 0; i < 12; i++) {
        const g = (t * .7 + i * .08) % 1;
        d(-2 + g * 4, 2 + g * 2.4, -5 + (i % 7) * 2, .8 * (1 - g), P.fumo);
      }
    },
  };
},

tiziano(rng) {
  return {
    cielo: CUPO, raggio: CALDO, ambiente: .6, fronte: Math.PI / 2,
    statici(m) {
      suolo(m, 10, P.marmoOmbra, P.pietra, rng);
      for (let x = -9; x <= 9; x++) for (let y = 1; y <= 12; y++) {
        if (y > 9 && Math.abs(x) < 9 - (y - 9) * 3) continue;
        m.p(x, y, -7, P.pietraChiara);
      }
      for (let z = -7; z <= 3; z++) for (let y = 1; y <= 11; y++) { m.p(-9, y, z, P.pietraChiara); m.p(9, y, z, P.pietraChiara); }
    },
    dinamici(d, t) {
      /* Sette metri di tela: il colore prende il posto del disegno, e le figure
         salgono invece di stare ferme. */
      const f = (t * .13) % 1.3;
      for (let r = 0; r < 8; r++) for (let c = 0; c < 7; c++) {
        const i = r * 7 + c;
        if (f < i / 56) continue;
        const alto = r > 5, medio = r > 2 && r <= 5;
        d(-4.5 + c * 1.5, 2.4 + r * 1.2, -6.4, 1.3,
          alto ? P.oro : medio ? P.rosso : P.terraScura);
      }
      for (let i = 0; i < 6; i++) {
        if (f < .7) break;
        omino(d, -3.5 + i * 1.4, 6.4, -6.2, i % 2 ? P.rosso : P.blu, P.pelle, .7);
      }
      omino(d, 0, 1.2, 2, P.terraScura, P.pelle);
    },
  };
},

'carlo-v'(rng) {
  return {
    cielo: GIORNO, raggio: CALDO, fronte: Math.PI / 2,
    statici(m) {
      suolo(m, 10, P.marmoOmbra, P.pietra, rng);
      cattedrale(m, -5, -8, 11, 9, 8, P.cotto, P.tetto);
      for (let x = -12; x <= 12; x++) m.p(x, 1, 5, P.pietra);
    },
    dinamici(d, t) {
      /* L'ultimo imperatore incoronato in Italia: dopo di lui la penisola sarà
         una questione che si decide altrove. */
      const f = (t * .12) % 1.2;
      const giu = clamp01((f - .35) * 2.2);
      omino(d, -1.2, 1.4, -2, P.oro, P.pelle, 1.05);
      omino(d, 1.4, 1.4, -2, P.biancoIt, P.pelle, 1);
      d(-1.2, 4.6 - giu * 1.2, -2, .8, P.oro);
      folla(d, t, 0, 6, 24, 2.4, [P.tela, P.viola, P.ruggine], 1.2);
      for (let i = 0; i < 6; i++) {
        if (f < .7) break;
        bandiera(d, t, -7 + i * 3, 2, 8, 3, [P.ruggine, P.oro], i);
      }
    },
  };
},

palladio(rng) {
  return {
    cielo: GIORNO, raggio: CALDO,
    statici(m) {
      suolo(m, 12, P.erba, P.terra, rng, .6);
      for (let x = -12; x <= 12; x++) for (let z = -1; z <= 1; z++) m.p(x, 1, z, P.sabbia);
      for (let i = 0; i < 6; i++) albero(m, -10 + i * 4, 9, 1, rng);
    },
    dinamici(d, t) {
      /* Una villa costruita per moduli: basamento, colonne, timpano. La stessa
         formula finirà in Inghilterra, in Russia e alla Casa Bianca. */
      const f = (t * .12) % 1.3;
      const fasi = [
        () => { for (let x = -6; x <= 6; x++) for (let z = -5; z <= 1; z++) d(x, 2, z, 1, P.pietraChiara); },
        () => { for (let x = -6; x <= 6; x++) for (let z = -5; z <= 1; z++) for (let y = 0; y < 4; y++)
                  if (Math.abs(x) === 6 || z === -5 || z === 1) d(x, 3 + y, z, 1, P.marmo); },
        () => { for (let i = 0; i < 6; i++) for (let y = 0; y < 5; y++) d(-5 + i * 2, 3 + y, 3, .8, P.marmo); },
        () => { for (let k = 0; k < 3; k++) for (let x = -5 + k; x <= 5 - k; x++) d(x, 8 + k, 3, .9, P.marmoOmbra); },
        () => { for (let y = 0; y < 3; y++) for (let x = -2; x <= 2; x++) for (let z = -3; z <= -1; z++)
                  if (Math.hypot(x, z + 2) <= 2.6 - y * .8) d(x, 8 + y, z, .9, P.marmoOmbra); },
      ];
      const quante = Math.min(fasi.length, Math.floor((f / 1.3) * 6));
      for (let i = 0; i < quante; i++) fasi[i]();
      folla(d, t, 0, 8, 6, 1.4, [P.tela, P.viola], 1.4);
    },
  };
},

uffizi(rng) {
  return {
    cielo: GIORNO, raggio: CALDO, fronte: Math.PI / 2,
    statici(m) {
      suolo(m, 12, P.pietraChiara, P.pietra, rng);
      for (const cx of [-7, 5]) {
        for (let z = -9; z <= 4; z++) for (let y = 1; y <= 8; y++)
          for (let dx = 0; dx < 2; dx++) m.p(cx + dx, y, z, P.pietra);
        for (let z = -9; z <= 4; z += 2) m.p(cx, 9, z, P.marmoOmbra);
      }
      for (let x = -7; x <= 6; x++) for (let y = 1; y <= 8; y++) m.p(x, y, -9, P.pietra);
      for (let z = -12; z <= -10; z++) for (let x = -9; x <= 8; x++) m.p(x, 0, z, P.acqua);
    },
    dinamici(d, t) {
      /* Due bracci lunghi e stretti verso l'Arno: nati per gli uffici delle
         magistrature, finiranno per ospitare i quadri. */
      const f = (t * .14) % 1.3;
      for (let i = 0; i < 14; i++) {
        if (f < i / 16) continue;
        const lato = i % 2 ? -6 : 5.4;
        d(lato, 3.4 + (Math.floor(i / 2) % 3) * 1.4, -8 + Math.floor(i / 2) * 1.8, 1.1,
          i % 3 ? P.oro : P.acquaChiara);
      }
      for (let i = 0; i < 10; i++) {
        const p = ((t * .2 + i * .1) % 1);
        omino(d, -3 + (i % 3) * 3, 1.4, 4 - p * 12, P.viola, P.pelle, .78);
      }
      for (let x = -9; x <= 8; x += 3) d(x, .6 + Math.sin(t * 2 + x) * .2, -11, 2.4, P.acquaChiara);
    },
  };
},

cellini(rng) {
  return {
    cielo: CUPO, raggio: FUOCOLUCE, ambiente: .55, fronte: Math.PI / 2,
    statici(m) {
      suolo(m, 10, P.pietra, P.pietraScura, rng);
      for (let x = -9; x <= 9; x++) for (let y = 1; y <= 7; y++) m.p(x, y, -7, P.cotto);
      for (let z = -7; z <= 3; z++) for (let y = 1; y <= 7; y++) { m.p(-9, y, z, P.cotto); m.p(9, y, z, P.cotto); }
      for (let x = -9; x <= 9; x += 3) for (let z = -7; z <= 3; z += 3) m.p(x, 8, z, P.tronco);
      m.box(4, 1, -5, 4, 3, 4, P.pietra);                 // la fornace
    },
    dinamici(d, t) {
      /* Il bronzo non basta e nel forno finiscono i piatti di casa: lo racconta
         lui stesso, e forse è pure vero. */
      const f = (t * .12) % 1.2;
      fuoco(d, t, 6, 4, -3, 8, .9, 0);
      for (let i = 0; i < 6; i++) {                       // i piatti buttati dentro
        const p = clamp01(f * 2 - i * .12);
        if (p <= 0 || p >= 1) continue;
        d(2 + p * 3.4, 4 + Math.sin(p * Math.PI) * 2, -3, .5, P.marmo);
      }
      const colata = clamp01((f - .5) * 2.4);
      for (let i = 0; i < 8; i++) {
        if (colata <= 0) break;
        const g = ((t * 2 + i * .12) % 1);
        d(2 - g * 4, 4 - g * 2, -2, .45, P.lava);
      }
      if (colata > .8) {
        d(-3, 2.4, -1, 1.1, P.bronzo); d(-3, 3.5, -1, 1, P.bronzo);
        d(-3, 4.5, -1, .85, P.bronzo); d(-3, 5.4, -1.2, .7, P.bronzo);
      }
      omino(d, 0, 1.4, 2, P.terraScura, P.pelle);
    },
  };
},

/* ---------------- età moderna ---------------- */

orfeo(rng) {
  return {
    cielo: CUPO, raggio: CALDO, ambiente: .6, fronte: Math.PI / 2,
    statici(m) {
      suolo(m, 10, P.legno, P.tronco, rng);
      for (let x = -9; x <= 9; x++) for (let y = 1; y <= 8; y++) m.p(x, y, -7, P.rosso);
      for (let z = -7; z <= 3; z++) for (let y = 1; y <= 8; y++) { m.p(-9, y, z, P.cotto); m.p(9, y, z, P.cotto); }
      for (let x = -9; x <= 9; x += 2) for (let z = -7; z <= 3; z += 2) m.p(x, 9, z, P.tronco);
      m.box(-7, 1, -6, 15, 1, 3, P.legno);
    },
    dinamici(d, t) {
      /* La prima opera che si regga ancora: musica, parola e scena diventano
         una cosa sola, e il pubblico non sa dove guardare. */
      const f = (t * .14) % 1.3;
      omino(d, 0, 2.2, -4.4, P.oro, P.pelle, .95);
      for (let i = 0; i < 5; i++)                         // gli strumenti
        omino(d, -5 + i * 2.4, 2.2, -1, P.nero, P.pelle, .8);
      for (let i = 0; i < 18; i++) {
        const g = (t * .8 + i * .055) % 1;
        d(Math.sin(i * 2.1) * 4, 3.4 + g * 5, -4.4 + Math.cos(i * 1.9) * 1.4, .32 * (1 - g),
          i % 3 ? P.oro : P.acquaChiara);
      }
      const ombre = clamp01((f - .5) * 2);                // gli inferi che si aprono dietro
      for (let i = 0; i < 10; i++) {
        if (ombre <= 0) break;
        d(-5 + i * 1.1, 3 + Math.sin(t + i) * .3, -6.6, .9 * ombre, P.nero);
      }
      folla(d, t, 0, 3, 12, 1.6, [P.viola, P.tela], 1.4);
    },
  };
},

'vesuvio-1631'(rng) {
  return {
    cielo: 0x2b1c1c, nebbia: 0x3a2622, raggio: 0xffd9a0, ambiente: .5,
    statici(m) {
      suolo(m, 12, P.erbaScura, P.terraScura, rng);
      for (let y = 0; y < 8; y++) {
        const r = 6 - y * .65;
        for (let x = -r; x <= r; x++) for (let z = -r; z <= r; z++) {
          if (x * x + z * z > r * r) continue;
          if (y > 4 && x * x + z * z < (r - 1.4) * (r - 1.4)) continue;
          m.p(Math.round(x), y + 1, Math.round(z) - 8, y > 5 ? P.roccia : P.pietraScura);
        }
      }
      for (let i = 0; i < 6; i++) casa(m, -10 + i * 4, 5, 3, 3, 2, P.tela, P.tetto, 1);
    },
    dinamici(d, t) {
      /* Dopo cinque secoli di silenzio la montagna si risveglia: prima la
         colonna, poi le colate che scendono sui casali. */
      const f = (t * .1) % 1;
      for (let i = 0; i < 70; i++) {
        const g = ((t * .25 + i * .04) % 1);
        const r = .6 + g * g * 7;
        const a = i * 2.399 + t * .5;
        d(Math.cos(a) * r, 9 + g * 16, -8 + Math.sin(a) * r * .7, 1 + g * 1.4,
          g < .25 ? P.lava : g < .5 ? P.fuoco : P.fumo);
      }
      const colata = clamp01((f - .35) * 1.8);
      for (let i = 0; i < 16; i++) {
        if (colata <= 0) break;
        const p = clamp01(colata * 1.4 - i * .05);
        d(-6 + (i % 8) * 1.7, 1.4, -3 + p * 8, 1.4, p > .7 ? P.brace : P.lava);
      }
      for (let i = 0; i < 10; i++) {
        const p = ((t * 1.4 + i * 2.1) % 22) - 11;
        omino(d, p, 1.6, 9, P.tela, P.pelle, .8);
      }
    },
  };
},

stradivari(rng) {
  return {
    cielo: CUPO, raggio: CALDO, ambiente: .6, fronte: Math.PI / 2,
    statici(m) {
      suolo(m, 9, P.legno, P.tronco, rng);
      for (let x = -8; x <= 8; x++) for (let y = 1; y <= 7; y++) m.p(x, y, -7, P.tela);
      for (let z = -7; z <= 2; z++) for (let y = 1; y <= 7; y++) { m.p(-8, y, z, P.tela); m.p(8, y, z, P.tela); }
      for (let x = -8; x <= 8; x += 2) for (let z = -7; z <= 2; z += 2) m.p(x, 8, z, P.tronco);
      m.box(-4, 1, -2, 9, 1, 3, P.legno);
    },
    dinamici(d, t) {
      /* Gli strumenti appesi ad asciugare, e uno sul banco che prende forma:
         nessuno è mai riuscito a rifarli uguali. */
      const f = (t * .14) % 1.3;
      const fatto = clamp01(f * 1.5);
      for (let i = 0; i < 5; i++) {                       // il corpo sul banco
        if (fatto < i / 6) continue;
        d(-1.5 + i * .7, 2.4, -1, .9 - Math.abs(i - 2) * .12, P.cotto);
      }
      if (fatto > .8) for (let i = 0; i < 4; i++) d(2.2 + i * .5, 2.4, -1, .35, P.tronco);
      for (let i = 0; i < 6; i++) {                       // quelli appesi
        const on = Math.sin(t * 1.2 + i) * .08;
        for (let k = 0; k < 4; k++)
          d(-6 + i * 2.4 + on, 6.4 - k * .55, -5, .8 - Math.abs(k - 1.5) * .1, P.cotto);
      }
      omino(d, -5, 2.2, 1, P.terraScura, P.pelle);
      for (let i = 0; i < 8; i++) {                       // trucioli
        const g = (t * .6 + i * .12) % 1;
        d(0, 2.6 - g * 1.2, -.4 + g * 1.6, .25, P.sabbia);
      }
    },
  };
},

vivaldi(rng) {
  return {
    cielo: GIORNO, raggio: CALDO, fronte: Math.PI / 2,
    statici(m) {
      for (let x = -12; x <= 12; x++) for (let z = 4; z <= 12; z++) m.p(x, 0, z, P.acqua);
      suolo(m, 11, P.pietraChiara, P.pietra, rng);
      for (let x = -9; x <= 9; x++) for (let y = 1; y <= 8; y++) m.p(x, y, -7, P.cotto);
      for (let z = -7; z <= 2; z++) for (let y = 1; y <= 8; y++) { m.p(-9, y, z, P.cotto); m.p(9, y, z, P.cotto); }
      for (let x = -9; x <= 9; x += 3) for (let z = -7; z <= 2; z += 3) m.p(x, 9, z, P.legno);
    },
    dinamici(d, t) {
      /* Quattro concerti, quattro stagioni: il colore della scena cambia con la
         musica, e l'orchestra è tutta di orfane. */
      const st = Math.floor((t * .12) % 4);
      const tinte = [P.verdeIt, P.oro, P.corallo, P.neve];
      for (let i = 0; i < 12; i++)
        omino(d, -6 + (i % 6) * 2.4, 2, -4 + Math.floor(i / 6) * 2, P.tela, P.pelle, .8);
      omino(d, 0, 2, 1, P.rosso, P.pelle, .95);
      for (let i = 0; i < 22; i++) {
        const g = (t * .7 + i * .045) % 1;
        d(-7 + (i % 11) * 1.4, 3.4 + g * 5, -3 + Math.sin(t + i) * .8, .3 * (1 - g), tinte[st]);
      }
      for (let i = 0; i < 10; i++) {                      // la stagione, fuori dalla finestra
        d(-8 + i * 1.8, 6.4, -6.6, .7, tinte[st]);
      }
    },
  };
},

'san-carlo'(rng) {
  return {
    cielo: CUPO, raggio: CALDO, ambiente: .6, fronte: Math.PI / 2,
    statici(m) {
      suolo(m, 10, P.legno, P.tronco, rng);
      for (let x = -9; x <= 9; x++) for (let y = 1; y <= 5; y++) m.p(x, y, -7, P.rosso);
      for (let z = -7; z <= 3; z++) for (let y = 1; y <= 11; y++) { m.p(-9, y, z, P.cotto); m.p(9, y, z, P.cotto); }
      m.box(-8, 1, -6, 17, 1, 3, P.legno);
    },
    dinamici(d, t) {
      /* Sei ordini di palchi che si accendono uno dopo l'altro: il teatro
         d'opera più antico d'Europa ancora in attività. */
      const f = (t * .15) % 1.3;
      for (let k = 0; k < 5; k++) {
        if (f < k / 6) continue;
        for (const x of [-8, 8]) for (let z = -6; z <= 2; z += 2) {
          d(x, 2 + k * 1.8, z, .8, P.oro);
          omino(d, x + (x < 0 ? .8 : -.8), 2 + k * 1.8, z, P.viola, P.pelle, .65);
        }
      }
      for (let i = 0; i < 8; i++) omino(d, -6 + i * 1.7, 2, -4.4, P.tela, P.pelle, .8);
      for (let i = 0; i < 14; i++) {
        const g = (t * .8 + i * .07) % 1;
        d(-5 + (i % 8) * 1.4, 3.4 + g * 6, -4, .3 * (1 - g), P.oro);
      }
      folla(d, t, 0, 3, 14, 1.6, [P.viola, P.tela], 1.4);
    },
  };
},

'pompei-scavi'(rng) {
  return {
    cielo: GIORNO, raggio: CALDO,
    statici(m) {
      suolo(m, 12, P.cenere, P.terraScura, rng);
    },
    dinamici(d, t) {
      /* Sotto la cenere non ci sono monumenti di re ma botteghe, insegne e
         graffiti elettorali: la vita di una città qualsiasi. */
      const f = (t * .11) % 1.3;
      const scavo = clamp01(f * 1.3);
      for (let i = 0; i < 8; i++) {                       // le case che riemergono
        const x = -10 + (i % 4) * 6, z = -7 + Math.floor(i / 4) * 8;
        const q = clamp01(scavo * 1.4 - i * .06);
        if (q <= 0) continue;
        for (let y = 0; y < 3 * q; y++)
          for (let dx = 0; dx < 4; dx++) for (let dz = 0; dz < 4; dz++) {
            if (dx > 0 && dx < 3 && dz > 0 && dz < 3) continue;
            d(x + dx, 1 + y, z + dz, 1, P.cotto);
          }
        if (q > .8) for (let dx = 0; dx < 4; dx++) d(x + dx, 1.4, z + 4.4, .5, P.rosso);  // le scritte
      }
      for (let x = -12; x <= 12; x++) {
        if (scavo < .3) break;
        d(x, 1.2, 1, .9, P.pietraChiara);
      }
      for (let i = 0; i < 8; i++) {                       // gli archeologi
        if (scavo < .5) break;
        omino(d, -8 + i * 2.4, 1.4, 9, P.tela, P.pelle, .78);
      }
    },
  };
},

goldoni(rng) {
  return {
    cielo: CUPO, raggio: CALDO, ambiente: .6, fronte: Math.PI / 2,
    statici(m) {
      suolo(m, 10, P.legno, P.tronco, rng);
      for (let x = -9; x <= 9; x++) for (let y = 1; y <= 5; y++) m.p(x, y, -7, P.rosso);
      for (let z = -7; z <= 3; z++) for (let y = 1; y <= 9; y++) { m.p(-9, y, z, P.cotto); m.p(9, y, z, P.cotto); }
      m.box(-8, 1, -6, 17, 1, 3, P.legno);
    },
    dinamici(d, t) {
      /* Via le maschere, dentro le persone: i personaggi perdono il naso di
         cuoio e prendono un copione scritto. */
      const f = (t * .12) % 1.2;
      const riforma = clamp01((f - .3) * 2.2);
      for (let i = 0; i < 6; i++) {
        const x = -5 + i * 2;
        omino(d, x, 2, -4.4, [P.rosso, P.blu, P.verdeIt, P.nero, P.viola, P.oro][i], P.pelle, .85);
        if (riforma < .5) d(x, 3.9, -4.6, .55, P.nero);   // la maschera
        else d(x, 2.4, -3.6, .5, P.tela);                 // il copione
      }
      for (let i = 0; i < 10; i++) {
        if (riforma < .5) break;
        const g = (t * .6 + i * .1) % 1;
        d(-4 + i * .9, 3.4 + g * 4, -4, .3 * (1 - g), P.biancoIt);
      }
      folla(d, t, 0, 3, 14, 1.6, [P.viola, P.tela], 1.4);
    },
  };
},

'grand-tour'(rng) {
  return {
    cielo: GIORNO, raggio: CALDO,
    statici(m) {
      suolo(m, 12, P.erba, P.terra, rng, 1);
      for (let x = -12; x <= 12; x++) m.p(x, 1, 0, P.sabbia);
      // le tappe: una rovina ogni tanto lungo la strada
      for (let i = 0; i < 4; i++) {
        const x = -9 + i * 6;
        for (let k = 0; k < 3; k++) m.colonna(x + k * 2, -4, 1, 4 - k, P.marmo);
        m.p(x, 6, -4, P.marmoOmbra);
      }
      for (let i = 0; i < 5; i++) albero(m, -10 + i * 5, 6, 1, rng);
    },
    dinamici(d, t) {
      /* La carrozza attraversa la penisola per anni: si comprano quadri, si
         disegnano rovine, e nasce il turismo colto. */
      const x = ((t * 2) % 30) - 15;
      for (let i = 0; i < 4; i++) d(x + (i % 2) * 1.2, 2.4, Math.floor(i / 2) * 1.1, 1, P.nero);
      d(x + .5, 3.4, .5, .9, P.tela);
      d(x - 1.4, 2.2, .5, .9, P.terraScura);
      d(x - 2.4, 2.2, .5, .9, P.terraScura);
      for (let i = 0; i < 5; i++) {                       // chi disegna le rovine
        const px = -9 + i * 6;
        omino(d, px + 1, 2, -1.6, P.viola, P.pelle, .78);
        d(px + 1, 3.4, -2.2, .5, P.tela);
      }
      for (let i = 0; i < 8; i++) {
        const g = (t * .8 + i * .12) % 1;
        d(x - 3 - g * 2, 2 + g, .5, .6 * (1 - g), P.polvere);
      }
    },
  };
},

scala(rng) {
  return {
    cielo: CUPO, raggio: CALDO, ambiente: .6, fronte: Math.PI / 2,
    statici(m) {
      suolo(m, 10, P.legno, P.tronco, rng);
      for (let x = -9; x <= 9; x++) for (let y = 1; y <= 5; y++) m.p(x, y, -7, P.rosso);
      for (let z = -7; z <= 3; z++) for (let y = 1; y <= 12; y++) { m.p(-9, y, z, P.cotto); m.p(9, y, z, P.cotto); }
      m.box(-8, 1, -6, 17, 1, 3, P.legno);
    },
    dinamici(d, t) {
      /* I palchi venduti ai nobili per pagare il cantiere: ognuno arreda il suo,
         e la sala si riempie di lumi uno dopo l'altro. */
      const f = (t * .13) % 1.3;
      for (let k = 0; k < 6; k++) for (const x of [-8, 8]) for (let z = -6; z <= 2; z += 2) {
        const i = k * 5 + (z + 6) / 2;
        if (f < i / 34) continue;
        d(x, 2 + k * 1.7, z, .8, P.oro);
        d(x + (x < 0 ? .7 : -.7), 2.4 + k * 1.7, z, .3, P.brace);
        omino(d, x + (x < 0 ? 1.2 : -1.2), 2 + k * 1.7, z, P.viola, P.pelle, .62);
      }
      for (let i = 0; i < 8; i++) omino(d, -6 + i * 1.7, 2, -4.4, P.tela, P.pelle, .8);
      folla(d, t, 0, 3, 12, 1.4, [P.viola, P.tela], 1.4);
    },
  };
},

galvani(rng) {
  return {
    cielo: CUPO, raggio: CALDO, ambiente: .55, fronte: Math.PI / 2,
    statici(m) {
      suolo(m, 9, P.legno, P.tronco, rng);
      for (let x = -8; x <= 8; x++) for (let y = 1; y <= 6; y++) m.p(x, y, -7, P.tela);
      for (let z = -7; z <= 2; z++) for (let y = 1; y <= 6; y++) { m.p(-8, y, z, P.tela); m.p(8, y, z, P.tela); }
      for (let x = -8; x <= 8; x += 2) for (let z = -7; z <= 2; z += 2) m.p(x, 7, z, P.tronco);
      m.box(-3, 1, -2, 7, 1, 3, P.legno);
    },
    dinamici(d, t) {
      /* Le zampe si contraggono al contatto di due metalli: lui pensa a
         un'elettricità animale, e dalla lite con Volta nascerà la pila. */
      const f = (t * .35) % 1;
      const scatto = f < .25 ? Math.sin(f / .25 * Math.PI) : 0;
      for (let i = 0; i < 3; i++) d(-1 + i * .7, 2.5, -1, .55, P.erbaScura);
      d(1.4, 2.5 + scatto * .5, -1.4 + scatto * .3, .45, P.erbaScura);
      d(1.4, 2.5 + scatto * .5, -.6 - scatto * .3, .45, P.erbaScura);
      d(-1.8, 2.6, -1, .35, P.ferro);
      d(-1.8, 3, -1, .35, P.bronzo);
      for (let i = 0; i < 5; i++) {
        if (scatto < .3) break;
        d(-1.4 + i * .5, 3.2 + Math.sin(i) * .2, -1, .25, P.oro);
      }
      omino(d, -5, 2.2, 1, P.nero, P.pelle);
      for (let i = 0; i < 4; i++) d(4 + i * .6, 2.4, -1, .4, P.tela);
    },
  };
},

beccaria(rng) {
  return {
    cielo: CUPO, raggio: CALDO, ambiente: .6, fronte: Math.PI / 2,
    statici(m) {
      suolo(m, 9, P.pietraChiara, P.pietra, rng);
      for (let x = -8; x <= 8; x++) for (let y = 1; y <= 7; y++) m.p(x, y, -7, P.tela);
      for (let z = -7; z <= 2; z++) for (let y = 1; y <= 7; y++) { m.p(-8, y, z, P.tela); m.p(8, y, z, P.tela); }
      for (let x = -8; x <= 8; x += 2) for (let z = -7; z <= 2; z += 2) m.p(x, 8, z, P.legno);
      m.box(-3, 1, -2, 7, 1, 3, P.legno);
    },
    dinamici(d, t) {
      /* Un ventiseienne scrive che la tortura è inutile e la pena di morte
         ingiusta; in vent'anni mezza Europa riscrive i codici. */
      const f = (t * .12) % 1.3;
      omino(d, -4, 2.2, 1, P.viola, P.pelle);
      const pagine = Math.floor((f / 1.3) * 12);
      for (let i = 0; i < pagine; i++)
        d(-2 + (i % 4) * .9, 2.4 + Math.floor(i / 4) * .3, -1, .7, P.tela);
      const strumenti = [P.ferro, P.tronco, P.nero];
      for (let i = 0; i < 3; i++) {                       // gli strumenti che spariscono
        const via = clamp01((f - .4 - i * .15) * 4);
        if (via >= 1) continue;
        d(3 + i * 1.6, 2.6 + via * 3, -4, .8 * (1 - via), strumenti[i]);
      }
      for (let i = 0; i < 10; i++) {                      // i codici che si riscrivono altrove
        if (f < .7) break;
        d(-6 + i * 1.4, 5.4, -6.4, .6, P.oro);
      }
    },
  };
},

canaletto(rng) {
  return {
    cielo: GIORNO, raggio: CALDO, fronte: Math.PI / 2,
    statici(m) {
      for (let x = -12; x <= 12; x++) for (let z = -12; z <= 12; z++) m.p(x, 0, z, P.acqua);
      for (let x = -12; x <= 12; x++) for (let z = -12; z <= -4; z++) { m.p(x, 1, z, P.pietraChiara); m.p(x, 0, z, P.terra); }
      for (let i = 0; i < 5; i++) casa(m, -11 + i * 5, -10, 4, 4, 5, P.cotto, P.tetto, 2);
      m.colonna(8, -9, 2, 10, P.cotto);
      m.p(8, 12, -9, P.tetto);
    },
    dinamici(d, t) {
      /* La città dipinta con la camera ottica per i viaggiatori inglesi: la
         prima volta che un luogo viene venduto come immagine di sé. */
      const f = (t * .13) % 1.3;
      omino(d, -2, 2, 2, P.viola, P.pelle);
      d(-2, 3.6, 1.2, .8, P.legno);                       // la camera ottica
      for (let r = 0; r < 4; r++) for (let c = 0; c < 8; c++) {
        const i = r * 8 + c;
        if (f < i / 34) continue;
        d(3 + c * .9, 2.6 + r * .9, 2, .8, r === 0 ? P.acquaChiara : (c % 3 ? P.cotto : P.tetto));
      }
      for (let x = -12; x <= 12; x += 3) for (let z = -3; z <= 12; z += 4)
        d(x, .6 + Math.sin(t * 1.7 + x * .4 + z * .3) * .22, z, 2.4, P.acquaChiara);
      const gondola = ((t * 1.4) % 26) - 13;
      for (let i = 0; i < 5; i++) d(gondola + i * .9, 1.2, 4, .8, P.nero);
    },
  };
},

/* ---------------- Ottocento ---------------- */

'regno-italico'(rng) {
  return {
    cielo: CUPO, raggio: CALDO, ambiente: .6, fronte: Math.PI / 2,
    statici(m) {
      suolo(m, 10, P.marmoOmbra, P.pietra, rng);
      cattedrale(m, -5, -8, 11, 9, 8, P.marmo, P.marmoOmbra);
    },
    dinamici(d, t) {
      /* "Dio me l'ha data, guai a chi la tocca": se la mette in testa da solo,
         e con lui arrivano codici, catasto e coscrizione. */
      const f = (t * .12) % 1.2;
      const su = clamp01((f - .3) * 2.4);
      omino(d, 0, 1.4, -2, P.blu, P.pelle, 1.05);
      d(0, 4.6 + (1 - su) * 2.4, -2, .8, P.oro);
      d(0, 4.2 + (1 - su) * 2.4, -2, .5, P.ferro);
      for (let i = 0; i < 3; i++) {                       // i tre lasciti: codice, catasto, leva
        if (f < .5 + i * .12) continue;
        d(-3 + i * 3, 2.4, 2, .8, [P.tela, P.oro, P.divisa][i]);
      }
      folla(d, t, 0, 5, 20, 2, [P.tela, P.viola, P.divisa], 1.2);
    },
  };
},

murat(rng) {
  return {
    cielo: TRAMONTO, raggio: CALDO, fronte: Math.PI / 2,
    statici(m) {
      suolo(m, 11, P.pietraChiara, P.pietra, rng);
      casa(m, -9, -9, 19, 6, 7, P.tela, P.tetto, 1);
      for (let i = 0; i < 5; i++) m.colonna(-6 + i * 3, -3, 1, 6, P.marmo);
    },
    dinamici(d, t) {
      /* Abolisce la feudalità con un decreto: le catene dei baroni cadono, e
         cinque anni dopo lui finisce fucilato a Pizzo. */
      const f = (t * .12) % 1.3;
      omino(d, 0, 7.4, -3.4, P.rosso, P.pelle, 1);
      d(0, 9.4, -3.4, .7, P.oro);
      const cadute = Math.floor(clamp01(f * 1.5) * 10);
      for (let i = 0; i < 10; i++) {
        const rotta = i < cadute;
        for (let k = 0; k < 3; k++)
          d(-8 + i * 1.8, rotta ? 1.4 : 3 + k * .7, 3 + (rotta ? k * .5 : 0), .4, rotta ? P.ferro : P.nero);
      }
      folla(d, t, 0, 7, 18, 2, [P.tela, P.terraScura], 1.2);
    },
  };
},

leopardi(rng) {
  return {
    cielo: NOTTE, raggio: 0xbcd0f0, ambiente: .55,
    statici(m) {
      for (let x = -12; x <= 12; x++) for (let z = -12; z <= 12; z++) {
        const h = Math.max(0, Math.round(5 - Math.hypot(x, z + 6) * .4));
        m.p(x, h, z, h > 2 ? P.erbaScura : P.erba);
        for (let y = 0; y < h; y++) m.p(x, y, z, P.terra);
      }
      for (let x = -8; x <= 8; x++) for (let y = 1; y <= 2; y++) m.p(x, 6 + y, -6, P.foglieScure);
      casa(m, 5, 4, 5, 4, 4, P.tela, P.tetto, 1);
    },
    dinamici(d, t) {
      /* Da dietro una siepe che nasconde l'orizzonte: il pensiero passa oltre,
         e ci si perde volentieri. */
      omino(d, 0, 6.4, -4.4, P.nero, P.pelle, .95);
      for (let i = 0; i < 26; i++) {                      // gli spazi interminati, oltre la siepe
        const g = (t * .15 + i * .038) % 1;
        d(-11 + (i % 13) * 1.8, 8.4 + g * 5, -8 - g * 4, .5 * (1 - g), P.acquaChiara);
      }
      stelle(d, 22, 9, 12);
      for (let i = 0; i < 6; i++) {                       // il vento fra le piante
        const on = Math.sin(t * 1.4 + i) * .3;
        d(-6 + i * 2.4 + on, 8.2, -6, .8, P.foglieScure);
      }
    },
  };
},

'promessi-sposi'(rng) {
  return {
    cielo: GIORNO, raggio: CALDO,
    statici(m) {
      for (let x = -12; x <= 12; x++) for (let z = 5; z <= 12; z++) m.p(x, 0, z, P.acqua);
      for (let x = -12; x <= 12; x++) for (let z = -12; z <= 4; z++) {
        const h = Math.max(1, Math.round((4 - z) * .55));
        for (let y = 1; y <= h; y++) m.p(x, y, z, y === h ? P.erbaScura : P.roccia);
      }
      for (let i = 0; i < 4; i++) casa(m, -9 + i * 5, 2, 3, 3, 3, P.tela, P.tetto, 2);
      cattedrale(m, 5, -1, 4, 5, 4, P.pietraChiara, P.tetto);
    },
    dinamici(d, t) {
      /* "Quel ramo del lago di Como": due che vorrebbero solo sposarsi, e un
         potere che glielo impedisce senza nemmeno spiegarsi. */
      const f = (t * .1) % 1;
      omino(d, -3 + f * 3, 2.4, 3.4, P.tela, P.pelle, .9);
      omino(d, -2 + f * 3, 2.4, 3.4, P.rosso, P.pelle, .9);
      const bravi = clamp01((f - .3) * 2.4);
      for (let i = 0; i < 2; i++) {
        if (bravi <= 0) break;
        omino(d, 4 - bravi * 4 + i * 1.2, 2.4, 3.4, P.nero, P.pelle, .95);
      }
      for (let x = -12; x <= 12; x += 3) for (let z = 6; z <= 12; z += 3)
        d(x, .6 + Math.sin(t * 1.6 + x * .4 + z * .3) * .2, z, 2.4, P.acquaChiara);
      const barca = ((t * 1.4) % 26) - 13;
      for (let i = 0; i < 4; i++) d(barca + i * .9, 1.2, 8, .8, P.legno);
    },
  };
},

'ferrovia-1839'(rng) {
  return {
    cielo: GIORNO, raggio: CALDO,
    statici(m) {
      suolo(m, 12, P.erba, P.terra, rng, .6);
      for (let x = -12; x <= 12; x++) for (let z = 6; z <= 12; z++) m.p(x, 0, z, P.mare);
      for (let x = -12; x <= 12; x++) { m.p(x, 1, 0, P.tronco); m.p(x, 1, 2, P.tronco); }
      for (let x = -12; x <= 12; x += 2) for (let z = 0; z <= 2; z++) m.p(x, 1, z, P.legno);
      casa(m, 6, -6, 6, 4, 4, P.tela, P.tetto, 1);
    },
    dinamici(d, t) {
      /* Sette chilometri e mezzo: la prima ferrovia italiana, e la gente
         corre a vedere il fumo che si muove da solo. */
      const x = ((t * 3.5) % 32) - 16;
      d(x, 2.2, 1, 1.2, P.nero);
      d(x + 1.2, 2.2, 1, 1.2, P.nero);
      for (let y = 0; y < 3; y++) d(x - .6, 3 + y, 1, .5, P.nero);
      for (let k = 0; k < 3; k++) {
        d(x + 3 + k * 2.2, 2.2, 1, 1.1, P.cotto);
        d(x + 3 + k * 2.2, 3.1, 1, .9, P.cotto);
      }
      for (let i = 0; i < 10; i++) {
        const g = (t * 1.4 + i * .1) % 1;
        d(x - .6, 5 + g * 4, 1 + Math.sin(t * 2 + i) * .5, .8 * (1 - g * .6), P.fumo);
      }
      folla(d, t, -2, -4, 18, 2, [P.tela, P.viola, P.nero], 1.4);
    },
  };
},

'venezia-1848'(rng) {
  return {
    cielo: CUPO, nebbia: 0x2e3440, raggio: CALDO, ambiente: .55,
    statici(m) {
      for (let x = -12; x <= 12; x++) for (let z = -12; z <= 12; z++) m.p(x, 0, z, P.acqua);
      for (let x = -8; x <= 8; x++) for (let z = -6; z <= 6; z++) m.p(x, 1, z, P.pietraChiara);
      cattedrale(m, -2, -5, 7, 8, 5, P.marmo, P.oro);
      m.colonna(-7, -4, 2, 11, P.cotto);
      for (let dx = -1; dx <= 1; dx++) for (let dz = -1; dz <= 1; dz++) m.p(-7 + dx, 13, -4 + dz, P.tetto);
    },
    dinamici(d, t) {
      /* Diciassette mesi d'assedio: il colera, la fame, e i palloni austriaci
         che sganciano bombe — il primo bombardamento aereo della storia. */
      const f = (t * .09) % 1;
      bandiera(d, t, 4, 8, 2, 3, [P.rossoIt, P.oro], 0);
      for (let k = 0; k < 4; k++) {                       // i palloni
        const p = ((f + k / 4) % 1);
        d(-10 + p * 22, 13 + Math.sin(t + k) * .6, -8 + k * 5, 1.4, P.tela);
        d(-10 + p * 22, 11.6, -8 + k * 5, .5, P.legno);
        if (p > .4 && p < .8) d(-10 + p * 22, 11.6 - (p - .4) * 20, -8 + k * 5, .4, P.nero);
      }
      folla(d, t, 0, 3, 16, 1.8, [P.tela, P.rosso], 2.2);
      for (let x = -12; x <= 12; x += 3) for (let z = -12; z <= 12; z += 4) {
        if (Math.abs(x) <= 9 && Math.abs(z) <= 7) continue;
        d(x, .6 + Math.sin(t * 1.7 + x * .4) * .22, z, 2.4, P.acquaChiara);
      }
    },
  };
},

'repubblica-romana'(rng) {
  return {
    cielo: TRAMONTO, raggio: FUOCOLUCE,
    statici(m) {
      for (let x = -12; x <= 12; x++) for (let z = -12; z <= 12; z++) {
        const h = Math.max(0, Math.round(5 - Math.abs(x + 6) * .5));
        m.p(x, h, z, h > 1 ? P.erbaScura : P.pietraChiara);
        for (let y = 0; y < h; y++) m.p(x, y, z, P.terra);
      }
      for (let z = -12; z <= 12; z++) for (let y = 1; y <= 5; y++) m.p(-2, 5 + y, z, P.pietraChiara);
      for (let i = 0; i < 4; i++) casa(m, 3 + (i % 2) * 5, -8 + i * 5, 4, 4, 4, P.cotto, P.tetto, 1);
    },
    dinamici(d, t) {
      /* Sul Gianicolo si resiste per settimane a un esercito francese: una
         costituzione che abolisce la pena di morte, e cade sotto i cannoni. */
      const f = (t * .1) % 1;
      for (let i = 0; i < 14; i++)
        omino(d, -3 + (i % 7) * .9, 6.4, -6 + Math.floor(i / 7) * 3, P.rossoIt, P.pelle, .8);
      for (let k = 0; k < 4; k++) {                       // le cannonate
        const g = ((t * .6 + k * .25) % 1);
        d(-11 + g * 8, 7 + Math.sin(g * Math.PI) * 4, -6 + k * 4, .9, P.roccia);
      }
      const breccia = clamp01((f - .5) * 2.2);
      for (let z = -3; z <= 3; z++) for (let y = 1; y <= 5 - breccia * 5; y++)
        d(-2, 5 + y, z, 1, P.pietraChiara);
      for (let i = 0; i < 10; i++) {
        const g = (t * .5 + i * .1) % 1;
        d(-2, 6 + g * 3, -4 + (i % 6) * 1.6, .8 * (1 - g), P.fumo);
      }
    },
  };
},

calatafimi(rng) {
  return {
    cielo: GIORNO, raggio: CALDO,
    statici(m) {
      for (let x = -12; x <= 12; x++) for (let z = -12; z <= 12; z++) {
        const h = Math.max(0, Math.round((z + 8) * .5));
        m.p(x, h, z, h > 3 ? P.sabbia : P.erbaScura);
        for (let y = 0; y < h; y++) m.p(x, y, z, P.terra);
      }
      for (let i = 0; i < 4; i++) albero(m, -10 + i * 7, -11, 1, rng);
    },
    dinamici(d, t) {
      /* "Qui si fa l'Italia o si muore": si sale la collina alla baionetta,
         controvento e in salita, e i borbonici cedono. */
      const f = (t * .1) % 1;
      const salita = clamp01(f * 1.5);
      for (let i = 0; i < 20; i++) {
        const z = -10 + salita * 14 + (i % 5) * .8;
        const h = Math.max(0, Math.round((z + 8) * .5));
        omino(d, -6 + (i % 10) * 1.3, h + 1.1, z, P.rossoIt, P.pelle, .8);
      }
      const cedono = clamp01((f - .55) * 2.2);
      for (let i = 0; i < 14; i++)
        omino(d, -5 + (i % 7) * 1.5, 9.1, 8 + cedono * 4 + Math.floor(i / 7) * 1.4, P.biancoIt, P.pelle, .8);
      for (let i = 0; i < 12; i++) {
        const g = (t * .7 + i * .08) % 1;
        d(-4 + i * .9, 4 + g * 3, 2 + (i % 4), .8 * (1 - g), P.fumo);
      }
    },
  };
},

lissa(rng) {
  return {
    cielo: 0x1e3450, nebbia: 0x2a4260, raggio: CALDO,
    statici(m) {
      for (let x = -12; x <= 12; x++) for (let z = -12; z <= 12; z++) m.p(x, 0, z, P.mare);
      for (let x = 8; x <= 12; x++) for (let z = -4; z <= 6; z++) {
        const h = Math.max(1, Math.round((x - 7) * .8));
        for (let y = 1; y <= h; y++) m.p(x, y, z, y === h ? P.erbaScura : P.roccia);
      }
    },
    dinamici(d, t) {
      /* Più navi e più moderne, ma disordinate: gli austriaci puntano dritti e
         speronano. "Uomini di ferro su navi di legno". */
      const f = (t * .1) % 1;
      const sperone = clamp01(f * 1.8);
      for (let k = 0; k < 5; k++) {                       // la linea italiana, sparpagliata
        const affonda = k === 2 && sperone > .8;
        nave(d, t, -3 + (k % 3) * 1.4, 1.2 - (affonda ? 1.8 : 0), -8 + k * 4.4, 1, 7,
          P.grigio, 0, 0);
      }
      for (let k = 0; k < 3; k++) {                       // il cuneo austriaco
        nave(d, t, 8 - sperone * 9 + k * .8, 1.2, -2 + k * 2.4, -1, 7, P.nero, 0, 0);
      }
      onde(d, t, 12, 3, [12, 12]);
      for (let i = 0; i < 12; i++) {
        const g = (t * .8 + i * .08) % 1;
        d(-4 + i * 1.2, 1.6 + g * 3, -6 + (i % 6) * 2.4, .8 * (1 - g), P.fumo);
      }
    },
  };
},

'roma-capitale'(rng) {
  return {
    cielo: GIORNO, raggio: CALDO,
    statici(m) {
      suolo(m, 12, P.pietraChiara, P.terra, rng);
      for (let i = 0; i < 5; i++) { m.colonna(-10 + i * 3, -9, 1, 6, P.marmo); m.p(-10 + i * 3, 7, -9, P.marmoOmbra); }
      for (let i = 0; i < 4; i++) casa(m, 3 + (i % 2) * 5, -9 + i * 5, 4, 4, 4, P.cotto, P.tetto, 1);
    },
    dinamici(d, t) {
      /* Duecentomila abitanti e nessuna industria devono diventare in fretta il
         centro di uno Stato: si apre un cantiere dopo l'altro. */
      const f = (t * .11) % 1.3;
      const palazzi = [[-8, 2], [-3, 5], [2, 3], [7, 6], [-6, 8], [4, -3]];
      for (let i = 0; i < palazzi.length; i++) {
        const su = clamp01((f - i * .12) * 3);
        if (su <= 0) continue;
        const [x, z] = palazzi[i], h = Math.round(6 * su);
        for (let y = 0; y < h; y++)
          for (let dx = 0; dx < 4; dx++) for (let dz = 0; dz < 3; dz++) {
            if (dx > 0 && dx < 3 && dz > 0 && dz < 2 && y < h - 1) continue;
            d(x + dx, 1 + y, z + dz, 1, y === h - 1 ? P.tetto : P.tela);
          }
        if (su < 1) for (let k = 0; k < 3; k++) d(x + k * 1.5, 1 + h + 1.4, z, .3, P.tronco);
      }
      for (let i = 0; i < 10; i++)
        omino(d, -9 + i * 2, 1.4, 10, P.terraScura, P.pelle, .78);
    },
  };
},

emigrazione(rng) {
  return {
    cielo: 0x2a3444, nebbia: 0x38424e, raggio: 0xd8ccb4, ambiente: .55,
    statici(m) {
      for (let x = -12; x <= 12; x++) for (let z = -12; z <= 12; z++) m.p(x, 0, z, P.mare);
      for (let x = -12; x <= 12; x++) for (let z = 4; z <= 12; z++) { m.p(x, 1, z, P.pietraChiara); m.p(x, 0, z, P.terra); }
      for (let i = 0; i < 3; i++) casa(m, -10 + i * 8, 9, 4, 3, 3, P.cotto, P.tetto, 2);
    },
    dinamici(d, t) {
      /* Quattordici milioni in trent'anni: la fila sul molo non finisce mai, e
         la nave riparte sempre piena. */
      const f = (t * .08) % 1;
      const x = -2 + f * 12;
      for (let i = 0; i < 10; i++) d(x + i * .85, 1.4, 0, 1.1, P.nero);
      for (let i = 0; i < 6; i++) d(x + 2 + i * .85, 2.4, 0, .9, P.grigio);
      for (let y = 0; y < 3; y++) d(x + 4, 3.4 + y, 0, .6, P.grigio);
      for (let i = 0; i < 8; i++) {
        const g = (t * .8 + i * .12) % 1;
        d(x + 4, 6.4 + g * 4, Math.sin(t + i) * .5, .8 * (1 - g), P.fumo);
      }
      for (let i = 0; i < 20; i++) {                      // la fila, che non si accorcia
        const p = ((f * 2 + i / 20) % 1);
        omino(d, 2 - p * 4, 2, 9 - p * 7, i % 4 ? P.terraScura : P.tela, P.pelle, .78);
        if (i % 3 === 0) d(2 - p * 4, 3.6, 9 - p * 7, .5, P.sabbia);
      }
      onde(d, t, 12, 3, [12, 8]);
    },
  };
},

pinocchio(rng) {
  return {
    cielo: CUPO, raggio: CALDO, ambiente: .6, fronte: Math.PI / 2,
    statici(m) {
      suolo(m, 9, P.legno, P.tronco, rng);
      for (let x = -8; x <= 8; x++) for (let y = 1; y <= 6; y++) m.p(x, y, -7, P.tela);
      for (let z = -7; z <= 2; z++) for (let y = 1; y <= 6; y++) { m.p(-8, y, z, P.tela); m.p(8, y, z, P.tela); }
      for (let x = -8; x <= 8; x += 2) for (let z = -7; z <= 2; z += 2) m.p(x, 7, z, P.tronco);
      m.box(-3, 1, -2, 7, 1, 3, P.legno);
    },
    dinamici(d, t) {
      /* Un pezzo di legno che diventa burattino: il naso cresce, e i lettori
         protestano tanto che l'autore deve resuscitarlo. */
      const f = (t * .18) % 1.2;
      const fatto = clamp01(f * 1.6);
      d(0, 2.6, -1, 1 * fatto, P.legno);
      d(0, 3.6, -1, .9 * fatto, P.legno);
      d(0, 4.5, -1, .8 * fatto, P.sabbia);
      if (fatto > .8) {
        const naso = 1 + Math.abs(Math.sin(t * .8)) * 3;
        for (let i = 0; i < naso; i++) d(0, 4.5, -1.5 - i * .35, .3, P.sabbia);
        d(-.6, 5.1, -1, .3, P.rossoIt);                   // il cappello
      }
      omino(d, -4, 2.2, 1, P.terraScura, P.pelle);
      for (let i = 0; i < 8; i++) {
        const g = (t * .8 + i * .12) % 1;
        d(-1.4 + g * 2.4, 2.6 - g, -.4, .25, P.sabbia);
      }
    },
  };
},

/* ---------------- Novecento ---------------- */

'traforo-sempione'(rng) {
  return {
    cielo: CUPO, nebbia: 0x2a3038, raggio: 0xd0c4a8, ambiente: .5,
    statici(m) {
      for (let x = -12; x <= 12; x++) for (let z = -12; z <= 12; z++) {
        const h = Math.min(9, Math.round(Math.max(0, (Math.abs(x) - 3) * 1.3)));
        m.p(x, h, z, h > 6 ? P.neve : h > 0 ? P.roccia : P.terraScura);
        for (let y = 0; y < h; y++) m.p(x, y, z, P.roccia);
      }
      for (let z = -12; z <= 12; z++) for (let x = -2; x <= 2; x++) m.p(x, 0, z, P.pietraScura);
    },
    dinamici(d, t) {
      /* Venti chilometri sotto le Alpi, il tunnel più lungo del mondo per mezzo
         secolo: si scava dai due lati e ci si incontra in mezzo. */
      const f = (t * .11) % 1.3;
      const avanz = clamp01(f * 1.4);
      for (let i = 0; i < 12; i++) {
        const z = -12 + avanz * 11 - i * .9;
        omino(d, -1 + (i % 3), .8, z, P.terraScura, P.pelle, .75);
      }
      for (let i = 0; i < 12; i++) {
        const z = 12 - avanz * 11 + i * .9;
        omino(d, -1 + (i % 3), .8, z, P.terraScura, P.pelle, .75);
      }
      if (avanz > .95) for (let i = 0; i < 10; i++) {     // l'incontro
        const g = (t * .8 + i * .1) % 1;
        d(0, .8 + g * 2, 0, .5 * (1 - g), P.oro);
      }
      for (let i = 0; i < 10; i++) {                      // i carrelli del detrito
        const p = ((t * 1.2 + i * .5) % 1);
        d(-12 + p * 12, .8, 8, .8, P.ferro);
      }
      for (let i = 0; i < 8; i++) {
        const g = (t * .4 + i * .12) % 1;
        d(-2 + (i % 4), 1 + g * 3, -10 + g * 4, .6 * (1 - g), P.fumo);
      }
    },
  };
},

montessori(rng) {
  return {
    cielo: GIORNO, raggio: CALDO, fronte: Math.PI / 2,
    statici(m) {
      suolo(m, 9, P.legno, P.tronco, rng);
      for (let x = -8; x <= 8; x++) for (let y = 1; y <= 6; y++) m.p(x, y, -7, P.tela);
      for (let z = -7; z <= 2; z++) for (let y = 1; y <= 6; y++) { m.p(-8, y, z, P.tela); m.p(8, y, z, P.tela); }
      for (let x = -8; x <= 8; x += 2) for (let z = -7; z <= 2; z += 2) m.p(x, 7, z, P.legno);
      for (let i = 0; i < 4; i++) m.box(-6 + i * 4, 1, -4, 2, 1, 2, P.legno);
    },
    dinamici(d, t) {
      /* I bambini scelgono cosa fare e si muovono liberi: la maestra sta
         seduta e guarda. Il metodo farà il giro del mondo. */
      const f = (t * .1) % 1;
      for (let i = 0; i < 8; i++) {
        const a = t * .25 + i * .8;
        const r = 2 + (i % 4) * 1.2;
        omino(d, Math.cos(a) * r, 1.4, -2 + Math.sin(a) * r * .7, [P.rosso, P.blu, P.verdeIt, P.oro][i % 4], P.pelle, .55);
      }
      for (let i = 0; i < 12; i++) {                      // i materiali colorati sui tavolini
        const x = -6 + (i % 4) * 4, z = -4 + Math.floor(i / 4) * .8;
        d(x + (i % 3) * .5, 2.4, z, .45, [P.rosso, P.oro, P.acquaChiara, P.verdeIt][i % 4]);
      }
      omino(d, 6, 1.4, 1, P.nero, P.pelle, .95);
    },
  };
},

futurismo(rng) {
  return {
    cielo: 0x2a2434, raggio: 0xffd0a0, ambiente: .6,
    statici(m) {
      suolo(m, 12, P.pietraScura, P.pietra, rng);
      for (let i = 0; i < 6; i++) {
        const x = -11 + i * 4;
        for (let y = 0; y < 5 + (i % 3) * 2; y++)
          for (let dx = 0; dx < 3; dx++) for (let dz = 0; dz < 3; dz++)
            m.p(x + dx, 1 + y, -8 + dz, P.grigio);
      }
    },
    dinamici(d, t) {
      /* Velocità, macchine, linee di forza: il manifesto arriva prima delle
         opere, ed è già una campagna pubblicitaria. */
      const f = (t * .13) % 1.2;
      for (let k = 0; k < 5; k++) {                       // le automobili che sfrecciano
        const p = ((t * 1.2 + k * .2) % 1);
        const x = -13 + p * 26, z = -2 + k * 2.4;
        d(x, 2.2, z, 1.1, [P.rossoIt, P.oro, P.acquaChiara][k % 3]);
        for (let i = 1; i < 6; i++) d(x - i * .9, 2.2, z, 1 - i * .15, P.grigio);
      }
      for (let i = 0; i < 18; i++) {                      // le parole in libertà
        if (f < i / 22) continue;
        const a = i * 2.399;
        d(Math.cos(a) * (3 + (i % 5) * 1.6), 6 + (i % 6) * 1.2, Math.sin(a) * (3 + (i % 5) * 1.6),
          .5, i % 3 ? P.biancoIt : P.rossoIt);
      }
    },
  };
},

piave(rng) {
  return {
    cielo: 0x2a3038, nebbia: 0x363c44, raggio: 0xc8bca0, ambiente: .5,
    statici(m) {
      suolo(m, 12, P.erbaScura, P.terra, rng, .6);
      for (let z = -12; z <= 12; z++) for (let x = -3; x <= 2; x++) m.p(x, 0, z, P.acqua);
      for (let i = 0; i < 4; i++) albero(m, 9, -8 + i * 6, 1, rng);
    },
    dinamici(d, t) {
      /* Dopo Caporetto la linea si riforma dietro il fiume e regge: sull'altra
         riva si accumulano, ma non passano. */
      const f = (t * .1) % 1;
      const assalto = clamp01(f * 1.6), respinto = clamp01((f - .55) * 2.2);
      for (let i = 0; i < 16; i++)
        omino(d, 4 + (i % 8) * .9, 1.4, -6 + Math.floor(i / 8) * 2.4, P.divisa, P.pelle, .8);
      for (let i = 0; i < 14; i++) {
        const x = -10 + assalto * 6 - respinto * 5;
        omino(d, x + (i % 7) * .9, 1.4, -5 + Math.floor(i / 7) * 2.4, P.grigioverde, P.pelle, .8);
      }
      for (let x = -3; x <= 2; x += 2) for (let z = -12; z <= 12; z += 4)
        d(x, .6 + Math.sin(t * 2.4 + z * .4) * .28, z, 1.8, P.acquaChiara);
      for (let i = 0; i < 14; i++) {
        const g = (t * .8 + i * .07) % 1;
        d(-6 + i * 1.2, 1.6 + g * 3.4, -6 + (i % 6) * 2.4, .8 * (1 - g), g < .3 ? P.fuoco : P.fumo);
      }
    },
  };
},

'vittorio-veneto'(rng) {
  return {
    cielo: GIORNO, raggio: CALDO,
    statici(m) {
      suolo(m, 12, P.erba, P.terra, rng, .8);
      for (let z = -12; z <= 12; z++) for (let x = -8; x <= -6; x++) m.p(x, 0, z, P.acqua);
      ponte(m, -9, 0, 6, 2, P.legno);
      for (let i = 0; i < 4; i++) casa(m, 6, -8 + i * 5, 4, 3, 3, P.cotto, P.tetto, 1);
    },
    dinamici(d, t) {
      /* L'esercito nemico si sfalda: le colonne passano il fiume senza più
         trovare resistenza, e il 4 novembre l'armistizio entra in vigore. */
      const f = (t * .1) % 1;
      const avanti = clamp01(f * 1.4);
      for (let i = 0; i < 22; i++) {
        const x = -10 + avanti * 16 + (i % 8) * 1.1;
        omino(d, x, x > -6.5 ? 1.4 : 2.4, -6 + Math.floor(i / 8) * 2.4, P.divisa, P.pelle, .8);
      }
      const resa = clamp01((f - .5) * 2.2);
      for (let i = 0; i < 10; i++) {
        if (resa <= 0) break;
        omino(d, 8 + (i % 5) * 1.2, 1.4, -4 + Math.floor(i / 5) * 2.4, P.grigioverde, P.pelle, .8);
        d(8 + (i % 5) * 1.2, 3.2, -4 + Math.floor(i / 5) * 2.4, .4, P.biancoIt);
      }
      for (let k = 0; k < 3; k++) {
        if (f < .8) break;
        bandiera(d, t, -2 + k * 4, 2, 8, 3, [P.verdeIt, P.biancoIt, P.rossoIt], k);
      }
    },
  };
},

cinecitta(rng) {
  return {
    cielo: GIORNO, raggio: CALDO,
    statici(m) {
      suolo(m, 12, P.sabbia, P.terra, rng);
      for (let i = 0; i < 4; i++) {
        const x = -11 + i * 6;
        m.guscio(x, 1, -8, 5, 6, 7, P.tela);
        for (let dx = 0; dx < 5; dx++) for (let dz = 0; dz < 7; dz++) m.p(x + dx, 7, -8 + dz, P.grigio);
      }
    },
    dinamici(d, t) {
      /* Quaranta ettari di teatri di posa costruiti in quindici mesi: dentro,
         una scenografia si monta mentre un'altra si smonta. */
      const f = (t * .12) % 1.3;
      for (let k = 0; k < 3; k++) {
        const p = ((f + k / 3) % 1);
        const x = -8 + k * 6;
        const h = Math.round(4 * (p < .5 ? p * 2 : (1 - p) * 2));
        for (let y = 0; y < h; y++)
          for (let dx = 0; dx < 3; dx++) d(x + dx, 1 + y, 4, 1, [P.marmo, P.cotto, P.legno][k]);
      }
      for (let i = 0; i < 8; i++)                         // le maestranze
        omino(d, -9 + i * 2.4, 1.4, 7, P.terraScura, P.pelle, .78);
      for (let i = 0; i < 4; i++) {                       // i riflettori
        d(-9 + i * 6, 6.4, 6, .6, P.oro);
        for (let k = 0; k < 5; k++)
          d(-9 + i * 6 + k * .4, 6.4 - k * .6, 6 - k * .8, .5 - k * .06, P.oro);
      }
    },
  };
},

'quattro-giornate'(rng) {
  return {
    cielo: TRAMONTO, nebbia: 0x3a3028, raggio: FUOCOLUCE, ambiente: .55,
    statici(m) {
      suolo(m, 12, P.pietraChiara, P.terra, rng);
      for (let i = 0; i < 8; i++) {
        const x = -11 + (i % 4) * 6, z = i < 4 ? -9 : 5;
        casa(m, x, z, 5, 4, 6, P.cotto, P.tetto, 1);
      }
      for (let x = -12; x <= 12; x++) for (let z = -2; z <= 2; z++) m.p(x, 1, z, P.pietra);
    },
    dinamici(d, t) {
      /* La città insorge da sola, prima che arrivino gli Alleati: si spara dai
         balconi e si tirano su barricate con quello che c'è. */
      const f = (t * .1) % 1;
      const barricata = clamp01(f * 2);
      for (let i = 0; i < 10; i++) {
        if (barricata <= 0) break;
        const p = clamp01(barricata * 1.4 - i * .07);
        d(-2 + (i % 5) * 1.1, 2 + Math.floor(i / 5) * .9, 0, 1 * p, i % 2 ? P.legno : P.grigio);
      }
      for (let i = 0; i < 12; i++)
        omino(d, -4 + (i % 6) * 1.4, 2, 3 + Math.floor(i / 6) * 1.3, i % 3 ? P.terraScura : P.rossoIt, P.pelle, .8);
      for (let i = 0; i < 8; i++) {                       // chi spara dalle finestre
        const x = -10 + (i % 4) * 6 + 2, z = i < 4 ? -6 : 8;
        omino(d, x, 4.4 + (i % 2) * 1.4, z, P.tela, P.pelle, .7);
        if (((t * 3 + i) % 3) < .4) d(x, 5.2 + (i % 2) * 1.4, z - 1, .3, P.brace);
      }
      const ritirata = clamp01((f - .6) * 2.4);
      for (let i = 0; i < 8; i++)
        omino(d, -4 + (i % 4) * 1.2, 2, -6 - ritirata * 8, P.grigioverde, P.pelle, .8);
    },
  };
},

vespa(rng) {
  return {
    cielo: GIORNO, raggio: CALDO,
    statici(m) {
      suolo(m, 12, P.pietraChiara, P.terra, rng);
      fabbrica(m, -11, -9, 22, 7, 5, P.tela, 2);
      for (let x = -12; x <= 12; x++) for (let z = 2; z <= 4; z++) m.p(x, 1, z, P.grigio);
    },
    dinamici(d, t) {
      /* Una fabbrica di aerei che si converte: scocca portante, ruote piccole,
         e in vent'anni quattro milioni di pezzi. */
      const f = (t * .18) % 1;
      for (let k = 0; k < 5; k++) {
        const p = (f + k / 5) % 1, x = -10 + p * 20, grado = Math.floor(p * 3);
        d(x, 2.2, -4, .9, P.acquaChiara);
        if (grado >= 1) { d(x - .7, 1.6, -4, .5, P.nero); d(x + .7, 1.6, -4, .5, P.nero); }
        if (grado >= 2) d(x + .2, 3, -4, .6, P.acquaChiara);
      }
      for (let i = 0; i < 8; i++) omino(d, -9 + i * 2.4, 2, -2, P.divisa, P.pelle, .78);
      for (let i = 0; i < 5; i++) {                       // quelle finite, per strada
        const x = ((t * 5 + i * 5.5) % 28) - 14;
        d(x, 2.2, 3, .8, [P.acquaChiara, P.tela, P.rossoIt, P.oro, P.verdeIt][i]);
        omino(d, x, 2.8, 3, i % 2 ? P.blu : P.viola, P.pelle, .7);
      }
    },
  };
},

televisione(rng) {
  return {
    cielo: CUPO, raggio: CALDO, ambiente: .55, fronte: Math.PI / 2,
    statici(m) {
      suolo(m, 10, P.legno, P.tronco, rng);
      for (let x = -9; x <= 9; x++) for (let y = 1; y <= 6; y++) m.p(x, y, -7, P.tela);
      for (let z = -7; z <= 3; z++) for (let y = 1; y <= 6; y++) { m.p(-9, y, z, P.tela); m.p(9, y, z, P.tela); }
      for (let x = -9; x <= 9; x += 2) for (let z = -7; z <= 3; z += 2) m.p(x, 7, z, P.legno);
      m.box(-2, 1, -6, 5, 2, 2, P.legno);
    },
    dinamici(d, t) {
      /* Un apparecchio solo, e mezzo quartiere seduto attorno: in pochi anni
         insegnerà l'italiano più della scuola. */
      const f = (t * .5) % 1;
      d(0, 3.4, -5.4, 1.6, P.grigio);
      d(0, 3.4, -5, 1.2, f < .5 ? P.biancoIt : P.grigio);
      for (let i = 0; i < 6; i++) {                       // la luce che sfarfalla sulla stanza
        const g = (t * 2 + i * .17) % 1;
        d(Math.sin(i * 2.1) * (1 + g * 5), 3.4 + Math.cos(i) * .8, -4 + g * 6, .5 * (1 - g), P.biancoIt);
      }
      for (let r = 0; r < 3; r++) for (let i = 0; i < 7; i++)
        omino(d, -5.4 + i * 1.8, 1.4, -1 + r * 1.8, [P.viola, P.tela, P.terraScura][r], P.pelle, .78);
      for (let i = 0; i < 4; i++) omino(d, -7 + i * 4.6, 1.4, 5, P.rosso, P.pelle, .6);
    },
  };
},

capaci(rng) {
  return {
    cielo: 0x2a2c30, nebbia: 0x36383c, raggio: 0xc0b8a4, ambiente: .5,
    statici(m) {
      suolo(m, 12, P.erbaScura, P.terra, rng, .8);
      for (let x = -12; x <= 12; x++) for (let z = 8; z <= 12; z++) m.p(x, 0, z, P.mare);
      for (let x = -12; x <= 12; x++) for (let z = -2; z <= 2; z++) m.p(x, 4, z, P.grigio);
      for (let x = -12; x <= 12; x += 4) for (let y = 1; y < 4; y++) for (let z = -2; z <= 2; z += 4)
        m.p(x, y, z, P.pietraChiara);
      for (let x = -12; x <= 12; x++) { m.p(x, 5, -2, P.biancoIt); m.p(x, 5, 2, P.biancoIt); }
    },
    dinamici(d, t) {
      /* Sobria: il viadotto, tre auto, e poi solo il silenzio della gente che
         reagisce — lenzuoli bianchi appesi ai balconi. */
      const f = (t * .07) % 1;
      const prima = f < .45;
      for (let i = 0; i < 3; i++) {
        if (!prima) break;
        const x = -10 + f * 20 + i * 2.4;
        d(x, 5.2, 0, 1.1, [P.biancoIt, P.grigio, P.biancoIt][i]);
        d(x + 1, 5.2, 0, 1.1, [P.biancoIt, P.grigio, P.biancoIt][i]);
      }
      const dopo = clamp01((f - .5) * 2.4);
      for (let i = 0; i < 14; i++) {                      // i lenzuoli
        if (dopo <= 0) break;
        const p = clamp01(dopo * 1.4 - i * .05);
        d(-11 + i * 1.7, 8 - p * 1.4, 6, 1.1 * p, P.biancoIt);
      }
      onde(d, t, 12, 4, [12, 7]);
    },
  };
},

});

})();
