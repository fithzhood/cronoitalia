'use strict';

/* Scene firma, secondo volume: dal Cinquecento a oggi.
 *
 * Stessa struttura di `cronoitalia-scene.js` — si registrano da sole con
 * `VoxScena.registra` e usano gli elementi del kit. Sono divise in due file
 * solo per non averne uno da tremila righe.
 */

(() => {

const P = VoxScena.P;
const { suolo, albero, casa, omino, clamp01, dissolvenza, arrivo, cattedrale, torre, mura, nave,
        folla, fuoco, bandiera, onde, fabbrica, ponte } = VoxScena.kit;

const NOTTE = 0x14203a, GIORNO = 0x24344c, TRAMONTO = 0x2e2c3e, CUPO = 0x1c1f28;
const CALDO = 0xffe6b4, FUOCOLUCE = 0xffb478;

VoxScena.registra({

machiavelli(rng) {
  return {
    cielo: CUPO, raggio: CALDO, ambiente: .6, fronte: Math.PI / 2,
    statici(m) {
      suolo(m, 10, P.erbaScura, P.terra, rng, .8);
      casa(m, -5, -7, 9, 6, 4, P.tela, P.tetto, 1);
      for (let i = 0; i < 5; i++) albero(m, -9 + i * 5, 6, 1, rng);
      m.box(-2, 5, -4, 5, 1, 2, P.legno);
    },
    dinamici(d0, t) {
      /* La sera si toglie i panni da campagna e mette quelli da corte per
         entrare nelle antiche corti degli antichi: così scrive all'amico. */
      const f = (t * .12) % 1;
      const d = dissolvenza(d0, f, 1);   // il ciclo si ritira invece di spegnersi
      omino(d, 0, 6, -3, f > .45 ? P.viola : P.terraScura, P.pelle, 1);
      for (let i = 0; i < 3; i++) { if (f >= .45) break; d(2 + i * .6, 6.4, -1, .5, P.viola); }
      for (let i = 0; i < 10; i++) {
        if (f < .5 + i / 25) continue;
        d(-3 + (i % 5) * .9, 6.4, -4, .7, P.tela);
      }
      for (let i = 0; i < 6; i++) {
        const g = (t * 1.4 + i * .17) % 1;
        d(-3, 6.6 + g * 1.4, -3, .3 * (1 - g), g < .4 ? P.brace : P.fumo);
      }
    },
  };
},

'raffaello-stanze'(rng) {
  return {
    cielo: GIORNO, raggio: CALDO, ambiente: .65, fronte: Math.PI / 2,
    statici(m) {
      suolo(m, 10, P.marmoOmbra, P.pietra, rng);
      for (let x = -9; x <= 9; x++) for (let y = 1; y <= 8; y++) m.p(x, y, -7, P.tela);
      for (let z = -7; z <= 3; z++) for (let y = 1; y <= 8; y++) { m.p(-9, y, z, P.tela); m.p(9, y, z, P.tela); }
      for (let z = -7; z <= 3; z++) for (let a = 0; a <= 16; a++) {
        const an = Math.PI * a / 16;
        m.p(Math.round(-Math.cos(an) * 9), 9 + Math.round(Math.sin(an) * 2), z, P.tela);
      }
    },
    dinamici(d0, t) {
      /* La Scuola di Atene: i filosofi si dispongono sotto le arcate, e i due
         al centro indicano uno il cielo e uno la terra. */
      const f = (t * .13) % 1.3;
      const d = dissolvenza(d0, f, 1.3);   // il ciclo si ritira invece di spegnersi
      for (let i = 0; i < 16; i++) {
        const p = clamp01((f - (i / 20)) * 5);
        if (p <= 0) continue;
        const da = arrivo(d, p);
        const grado = Math.abs(i - 7.5) < 2 ? 1.4 : 0;
        omino(da, -7.5 + i, 2.4 + grado, -6.3, i % 4 ? P.tela : P.rosso, P.pelle, .8);
      }
      if (f > .8) { d(-.9, 6.4, -6.2, .4, P.oro); d(.9, 5.2, -6.2, .4, P.oro); }
      for (let a = 0; a <= 10; a++) {
        if (f < .5) break;
        const an = Math.PI * a / 10;
        d(-Math.cos(an) * 5, 5 + Math.sin(an) * 3.4, -6.2, .5, P.marmoOmbra);
      }
      omino(d, 0, 1.2, 2, P.viola, P.pelle);
    },
  };
},

'pavia-1525'(rng) {
  return {
    cielo: CUPO, nebbia: 0x30342e, raggio: 0xd8c8a4, ambiente: .55,
    statici(m) {
      suolo(m, 12, P.erbaScura, P.terra, rng, .8);
      for (let i = 0; i < 6; i++) albero(m, -11 + i * 4, -10, 1, rng);
      mura(m, 6, 5, 7, 7, 5, P.pietraChiara);
    },
    dinamici(d, t) {
      /* Gli archibugieri spagnoli falciano la cavalleria francese: la corazza
         smette di contare, e con lei un modo di fare la guerra. */
      const f = (t * .1) % 1;
      const carica = clamp01(f * 1.8), caduti = clamp01((f - .45) * 2.4);
      for (let i = 0; i < 12; i++) {
        const giu = caduti > (i % 6) / 8 ? 1 : 0, z = -6 + (i % 6) * 2;
        d(-9 + carica * 8, 1.8 - giu * .8, z, 1.1, P.terraScura);
        if (!giu) omino(d, -9 + carica * 8, 2.6, z, P.blu, P.pelle, .8);
      }
      for (let i = 0; i < 14; i++) {
        omino(d, 4, 1.6, -7 + i * 1.1, P.ruggine, P.pelle, .8);
        if (((t * 3 + i) % 4) < .5) d(3, 2.8, -7 + i * 1.1, .4, P.brace);
      }
      for (let i = 0; i < 14; i++) {
        const g = (t * .8 + i * .07) % 1;
        d(3 - g * 3, 2.6 + g, -7 + (i % 12) * 1.1, .7 * (1 - g), P.fumo);
      }
    },
  };
},

'concilio-trento'(rng) {
  return {
    cielo: CUPO, raggio: CALDO, ambiente: .6, fronte: Math.PI / 2,
    statici(m) {
      suolo(m, 10, P.marmoOmbra, P.pietra, rng);
      for (let x = -9; x <= 9; x++) for (let y = 1; y <= 9; y++) m.p(x, y, -7, P.pietraChiara);
      for (let z = -7; z <= 3; z++) for (let y = 1; y <= 9; y++) { m.p(-9, y, z, P.pietraChiara); m.p(9, y, z, P.pietraChiara); }
      for (let x = -9; x <= 9; x += 3) for (let z = -7; z <= 3; z += 3) m.p(x, 10, z, P.legno);
      for (let k = 0; k < 3; k++) for (let x = -7 + k; x <= 7 - k; x += 2)
        m.p(x, 1 + k, Math.round(-5 + k * 1.5), P.legno);
    },
    dinamici(d, t) {
      /* Diciotto anni di sedute: i vescovi entrano ed escono, cambiano, e alla
         fine il documento è più spesso di tutti loro messi insieme. */
      const f = (t * .1) % 1.3;
      for (let k = 0; k < 3; k++) for (let i = 0; i < 7; i++) {
        const ci = k * 7 + i;
        if (((f * 3 + ci * .04) % 1) <= .15) continue;
        omino(d, -6 + i * 2, 2 + k, -4.4 + k * 1.5, ci % 5 === 0 ? P.rosso : P.viola, P.pelle, .8);
      }
      const spessore = Math.floor(clamp01(f / 1.3) * 14);
      for (let i = 0; i < spessore; i++) d(0, 2.4 + i * .28, 1, .9, P.tela);
      omino(d, 0, 2, 3, P.nero, P.pelle, .9);
    },
  };
},

bruno(rng) {
  return {
    cielo: 0x241c20, nebbia: 0x322830, raggio: FUOCOLUCE, ambiente: .5,
    statici(m) {
      suolo(m, 11, P.pietraChiara, P.terra, rng);
      for (let i = 0; i < 6; i++) casa(m, -11 + i * 4, -9, 3, 3, 4, P.cotto, P.tetto, 1);
      m.box(-2, 1, -2, 5, 1, 5, P.pietra);
    },
    dinamici(d, t) {
      /* Sobria: il rogo resta accennato, e la scena finisce sugli infiniti
         mondi che gli erano costati il processo. */
      const f = (t * .1) % 1;
      for (let y = 0; y < 5; y++) d(0, 2 + y, 0, .5, P.tronco);
      omino(d, 0, 3.4, 0, P.nero, P.nero, .95);
      fuoco(d, t, 0, 2, 0, 10, 1.2, 0);
      folla(d, t, 0, 4, 12, 2, [P.nero, P.viola], 1.2);   // in Campo de' Fiori, dentro la piazza
      const cielo = clamp01((f - .5) * 2);
      for (let i = 0; i < 26; i++) {
        if (cielo <= 0) break;
        const a = i * 2.399, r = (4 + (i % 6) * 1.4) * cielo;
        d(Math.cos(a) * r, 10 + (i % 5) * 1.2, Math.sin(a) * r, .4, i % 3 ? P.biancoIt : P.oro);
      }
    },
  };
},

caravaggio(rng) {
  return {
    cielo: 0x14161c, nebbia: 0x1c2028, raggio: 0xffe0a0, ambiente: .3, fronte: Math.PI / 2,
    statici(m) {
      suolo(m, 9, P.pietraScura, P.pietra, rng);
      for (let x = -8; x <= 8; x++) for (let y = 1; y <= 9; y++) m.p(x, y, -7, P.nero);
      for (let z = -7; z <= 2; z++) for (let y = 1; y <= 9; y++) { m.p(-8, y, z, P.nero); m.p(8, y, z, P.nero); }
      for (let x = -8; x <= 8; x += 2) for (let z = -7; z <= 2; z += 2) m.p(x, 10, z, P.nero);
      m.box(-3, 1, -3, 7, 1, 3, P.legno);
    },
    dinamici(d, t) {
      /* Il buio è quasi tutto: un taglio di luce entra da un angolo e prende
         solo quello che serve. */
      const a = -.6 + Math.sin(t * .3) * .35;
      for (let i = 0; i < 16; i++) {
        const p = i / 16;
        d(-7 + Math.cos(a) * p * 12, 8.5 - p * 6, -6 + Math.sin(a) * p * 8, 1.1 - p * .4, P.oro);
      }
      omino(d, 0, 2.4, -2, P.rosso, P.pelle, 1);
      omino(d, 2.4, 2.4, -1, P.terraScura, P.pelle, .95);
      for (let i = 0; i < 4; i++) d(-2 + i * .7, 2.4, 0, .5, P.tela);
      for (let i = 0; i < 5; i++) d(3, 2.4, -4 + i * .5, .4, P.foglie);
    },
  };
},

'galileo-processo'(rng) {
  return {
    cielo: CUPO, raggio: 0xd8c8a8, ambiente: .5, fronte: Math.PI / 2,
    statici(m) {
      suolo(m, 10, P.marmoOmbra, P.pietra, rng);
      for (let x = -9; x <= 9; x++) for (let y = 1; y <= 8; y++) m.p(x, y, -7, P.pietra);
      for (let z = -7; z <= 3; z++) for (let y = 1; y <= 8; y++) { m.p(-9, y, z, P.pietra); m.p(9, y, z, P.pietra); }
      for (let x = -9; x <= 9; x += 3) for (let z = -7; z <= 3; z += 3) m.p(x, 9, z, P.legno);
      for (let x = -7; x <= 7; x += 2) m.p(x, 1, -5, P.legno);
      m.box(-1, 1, 2, 3, 1, 2, P.legno);
    },
    dinamici(d, t) {
      /* L'abiura: il modello copernicano si spegne, ma il pendolo continua a
         oscillare come se niente fosse. */
      const f = (t * .1) % 1;
      const spegne = clamp01((f - .45) * 2.4);
      for (let i = 0; i < 10; i++) omino(d, -7 + i * 1.6, 2, -4.4, P.viola, P.pelle, .8);
      omino(d, 0, 2, 2, P.nero, P.pelle, 1);
      for (let i = 0; i < 8; i++) {
        if (spegne > .9) break;
        const an = t * .5 + i * .8, r = 1.2 + (i % 4) * 1.1;
        d(Math.cos(an) * r, 6.5, 2 + Math.sin(an) * r * .5, .4 * (1 - spegne), i ? P.acquaChiara : P.oro);
      }
      const p = Math.sin(t * 2) * 2.6;
      for (let k = 0; k < 5; k++) d(p * (k / 5), 9 - k * 1.1, 5, .25, P.ferro);
      d(p, 3.8, 5, .5, P.bronzo);
    },
  };
},

'peste-1630'(rng) {
  return {
    cielo: 0x24222a, nebbia: 0x2e2c34, raggio: 0xc0b49c, ambiente: .5,
    statici(m) {
      suolo(m, 12, P.pietraChiara, P.terra, rng);
      for (let i = 0; i < 10; i++)
        casa(m, -11 + (i % 5) * 5, -8 + Math.floor(i / 5) * 7, 4, 4, 4, P.tela, P.tetto, 1);
      for (let x = -12; x <= 12; x++) m.p(x, 1, 0, P.pietra);
    },
    dinamici(d, t) {
      /* I monatti passano con il carro e la città si svuota; sui muri restano
         i segni degli untori, che non erano mai esistiti. */
      const f = (t * .09) % 1;
      const cx = ((t * .7) % 20) - 11;                 // il carro dei monatti, con i due ai lati
      for (let i = 0; i < 6; i++) d(cx + (i % 3) * 1.1, 2.2, Math.floor(i / 3) * 1, 1, P.legno);
      omino(d, cx - 1.6, 2, .5, P.rosso, P.pelle, .85);
      omino(d, cx + 3.4, 2, .5, P.rosso, P.pelle, .85);
      const rimasti = Math.round(12 * (1 - clamp01(f * 1.4)));
      for (let i = 0; i < rimasti; i++) {
        const p = ((t * .4 + i * 2.1) % 24) - 12;
        omino(d, p, 2, (i % 2) ? 1.6 : -1.6, P.tela, P.pelle, .8);
      }
      const mani = Math.floor(clamp01((f - .4) * 2) * 12);
      for (let i = 0; i < mani; i++)
        d(-11 + (i % 5) * 5 + 2, 3.4, -8 + Math.floor(i / 5) * 7 + 4.2, .4, P.nero);
    },
  };
},

'bernini-baldacchino'(rng) {
  return {
    cielo: CUPO, raggio: CALDO, ambiente: .6, fronte: Math.PI / 2,
    statici(m) {
      suolo(m, 10, P.marmoOmbra, P.pietra, rng);
      for (let x = -9; x <= 9; x++) for (let y = 1; y <= 12; y++) {
        if (y > 9 && Math.abs(x) < 9 - (y - 9) * 3) continue;
        m.p(x, y, -8, P.marmo);
      }
      for (let z = -8; z <= 3; z++) for (let y = 1; y <= 11; y++) { m.p(-9, y, z, P.marmo); m.p(9, y, z, P.marmo); }
      m.box(-2, 1, -3, 5, 1, 4, P.marmoOmbra);
    },
    dinamici(d, t) {
      /* Le colonne tortili si avvitano salendo: il bronzo viene dal Pantheon,
         e a Roma se ne parlerà per secoli. */
      const f = (t * .11) % 1.3;
      const su = clamp01(f * 1.5);
      for (const c of [[-2.5, -2], [2.5, -2], [-2.5, 2], [2.5, 2]])
        for (let k = 0; k < 10 * su; k++) {
          const a = k * .6;
          d(c[0] + Math.cos(a) * .5, 2 + k, c[1] + Math.sin(a) * .5, .8, P.bronzo);
        }
      if (su > .95) {
        for (let x = -3; x <= 3; x++) for (const z of [-2, 2]) d(x, 12.4, z, .9, P.bronzo);
        for (let k = 0; k < 4; k++) d(0, 13 + k * .6, 0, 1.1 - k * .2, P.oro);
      }
      folla(d, t, 0, 5, 10, 1.6, [P.tela, P.viola], 1.2);
    },
  };
},

torricelli(rng) {
  return {
    cielo: CUPO, raggio: CALDO, ambiente: .6, fronte: Math.PI / 2,
    statici(m) {
      suolo(m, 9, P.legno, P.tronco, rng);
      for (let x = -8; x <= 8; x++) for (let y = 1; y <= 8; y++) m.p(x, y, -7, P.tela);
      for (let z = -7; z <= 2; z++) for (let y = 1; y <= 8; y++) { m.p(-8, y, z, P.tela); m.p(8, y, z, P.tela); }
      for (let x = -8; x <= 8; x += 2) for (let z = -7; z <= 2; z += 2) m.p(x, 9, z, P.tronco);
      m.box(-3, 1, -2, 7, 1, 3, P.legno);
    },
    dinamici(d, t) {
      /* Il tubo si rovescia, il mercurio scende e si ferma: sopra resta uno
         spazio che secondo tutti non poteva esistere. */
      const f = (t * .2) % 1.2;
      const scende = clamp01((f - .25) * 2.4);
      const cima = 9 - scende * 2.4;
      for (let y = 3; y < 9; y++) d(0, y, -1, .5, y < cima ? P.ferro : P.acquaChiara);
      for (let y = 3; y < cima; y++) d(0, y, -1, .42, P.grigio);
      d(0, 2.6, -1, 1.3, P.grigio);
      for (let i = 0; i < 6; i++) {
        if (scende <= .9) break;
        const g = (t * .8 + i * .17) % 1;
        d(0, cima + .6 + g, -1, .3 * (1 - g), P.biancoIt);
      }
      omino(d, -3.4, 2.2, 1, P.nero, P.pelle);
      for (let i = 0; i < 4; i++) d(4 + i * .6, 2.4, -1, .4, P.tela);
    },
  };
},

masaniello(rng) {
  return {
    cielo: TRAMONTO, raggio: FUOCOLUCE,
    statici(m) {
      suolo(m, 12, P.pietraChiara, P.terra, rng);
      // le due file di case ai bordi opposti: la seconda stava a z=3, dove la
      // folla arriva, e mezza Napoli restava chiusa in casa
      for (let i = 0; i < 8; i++)
        casa(m, -11 + (i % 4) * 6, -9 + Math.floor(i / 4) * 18, 4, 4, 4, P.tela, P.tetto, 1);
      m.box(-3, 1, -3, 7, 2, 6, P.pietra);
    },
    dinamici(d, t) {
      /* Dieci giorni: un pescivendolo comanda Napoli, e i banchi della frutta
         diventano barricate. */
      const f = (t * .1) % 1;
      const salito = clamp01(f * 3), caduto = clamp01((f - .75) * 4);
      omino(d, 0, 3 + salito * .4 - caduto * .4, 0, caduto > .5 ? P.grigio : P.rossoIt, P.pelle, 1);
      folla(d, t, 0, 4, 28, 2, caduto > .5 ? [P.nero] : [P.terraScura, P.tela, P.rosso], 1.2);
      for (let i = 0; i < 10; i++) {
        if (salito < .3) break;
        d(-8 + i * 1.8, 1.6, 6, .7, P.legno);
        d(-8 + i * 1.8, 2.3, 6, .5, i % 2 ? P.rosso : P.oro);
      }
    },
  };
},

'terremoto-1693'(rng) {
  return {
    cielo: CUPO, nebbia: 0x2e2a26, raggio: 0xd0bc9c, ambiente: .55,
    statici(m) { suolo(m, 12, P.sabbia, P.terra, rng, .6); },
    dinamici(d, t) {
      /* Prima la città medievale trema e cade; poi al suo posto si rialza
         quella barocca, tutta a griglia. */
      const f = (t * .09) % 1;
      const scossa = f < .3 ? Math.sin(t * 26) * .3 * (1 - f / .3) : 0;
      const crollo = clamp01((f - .25) * 4), nuova = clamp01((f - .55) * 2.2);
      for (let i = 0; i < 14; i++) {
        const x = -10 + (i % 5) * 5, z = -8 + Math.floor(i / 5) * 6;
        const h = (4 + (i % 3)) * (1 - crollo);
        for (let y = 0; y < h; y++)
          for (let dx = 0; dx < 2; dx++) for (let dz = 0; dz < 2; dz++)
            d(x + dx + scossa, 1 + y, z + dz, 1, y === Math.floor(h) - 1 ? P.tetto : P.tela);
      }
      for (let i = 0; i < 16; i++) {
        if (crollo <= .1 || nuova >= .1) break;
        d(-10 + (i % 8) * 3, 1.4 + crollo, -6 + Math.floor(i / 8) * 6, .9, P.polvere);
      }
      for (let i = 0; i < 16; i++) {
        if (nuova <= 0) break;
        const x = -10 + (i % 4) * 6, z = -8 + Math.floor(i / 4) * 5;
        const h = Math.round(4 * nuova);
        for (let y = 0; y < h; y++)
          for (let dx = 0; dx < 3; dx++) for (let dz = 0; dz < 2; dz++)
            d(x + dx, 1 + y, z + dz, 1, y === h - 1 ? P.marmoOmbra : P.sabbia);
      }
    },
  };
},

'torino-1706'(rng) {
  return {
    cielo: CUPO, raggio: FUOCOLUCE, ambiente: .55,
    statici(m) {
      suolo(m, 12, P.erbaScura, P.terra, rng);
      for (let a = 0; a < 10; a++) {
        const an = a / 10 * Math.PI * 2, r = a % 2 ? 5 : 8;
        for (let k = 0; k < 6; k++) {
          const x = Math.round(Math.cos(an) * (r - k * .3)), z = Math.round(Math.sin(an) * (r - k * .3));
          for (let y = 0; y < 4; y++) m.p(x, 1 + y, z, P.pietraChiara);
        }
      }
      for (let i = 0; i < 3; i++) casa(m, -2 + i * 2, -1, 2, 2, 2, P.cotto, P.tetto, 1);
    },
    dinamici(d, t) {
      /* Sotto la cittadella corrono le gallerie di mina: la miccia corta arriva
         in fondo e la scala salta. */
      const f = (t * .11) % 1;
      for (let i = 0; i < 20; i++)
        omino(d, Math.cos(i * .314) * 11, 1.1, Math.sin(i * .314) * 11, P.blu, P.pelle, .8);
      const miccia = clamp01((f - .3) * 3);
      for (let i = 0; i < 8; i++) {
        if (miccia * 8 < i) continue;
        d(-9 + i * .9, .2, 0, .3, P.brace);
      }
      omino(d, -10, .2, 0, P.rosso, P.pelle, .85);
      if (f > .7) {
        const b = (f - .7) / .3;
        for (let i = 0; i < 16; i++) {
          const a = i * 2.399;
          d(-3 + Math.cos(a) * b * 7, 1 + b * 6, Math.sin(a) * b * 7, 1.2 * (1 - b), b < .4 ? P.fuoco : P.fumo);
        }
      }
    },
  };
},

'ercolano-scavi'(rng) {
  return {
    cielo: CUPO, raggio: CALDO, ambiente: .55,
    statici(m) {
      for (let x = -12; x <= 12; x++) for (let z = -12; z <= 12; z++)
        for (let y = 0; y < 6; y++) {
          if (Math.hypot(x, z) < 2.2 && y > 0) continue;
          m.p(x, y, z, y === 5 ? P.erbaScura : P.roccia);
        }
      for (let y = 0; y < 5; y++) for (let a = 0; a < 12; a++) {
        const an = a / 12 * Math.PI * 2;
        m.p(Math.round(Math.cos(an) * 2.4), y, Math.round(Math.sin(an) * 2.4), P.legno);
      }
    },
    dinamici(d, t) {
      /* Dal cunicolo risalgono statue e papiri carbonizzati: l'archeologia
         nasce come miniera, con il re che paga a cottimo. */
      const f = (t * .18) % 1.2;
      const oggetti = [P.marmo, P.bronzo, P.nero, P.oro, P.marmo, P.nero];
      for (let i = 0; i < oggetti.length; i++) {
        const p = ((f + i / oggetti.length) % 1);
        d(0, .5 + p * 6.5, 0, .8, oggetti[i]);
      }
      for (let i = 0; i < 6; i++) {
        d(Math.cos(i) * 3.4, 6.4, Math.sin(i) * 3.4, .5, P.legno);
        omino(d, Math.cos(i) * 4.4, 6, Math.sin(i) * 4.4, P.terraScura, P.pelle, .8);
      }
      for (let i = 0; i < 6; i++) d(-8 + i * 1.4, 6.4, 6, .7, i % 2 ? P.marmo : P.bronzo);
    },
  };
},

canova(rng) {
  return {
    cielo: GIORNO, raggio: 0xfff2dc, ambiente: .7, fronte: Math.PI / 2,
    statici(m) {
      suolo(m, 9, P.marmoOmbra, P.pietra, rng);
      for (let x = -8; x <= 8; x++) for (let y = 1; y <= 8; y++) m.p(x, y, -7, P.tela);
      for (let z = -7; z <= 2; z++) for (let y = 1; y <= 8; y++) { m.p(-8, y, z, P.tela); m.p(8, y, z, P.tela); }
      for (let x = -8; x <= 8; x += 2) for (let z = -7; z <= 2; z += 2) m.p(x, 9, z, P.legno);
      m.box(-2, 1, -2, 5, 1, 4, P.marmoOmbra);
    },
    dinamici(d, t) {
      /* La superficie viene levigata finché il marmo non sembra pelle: la
         polvere cala e la figura si scalda di luce. */
      const f = (t * .13) % 1.2;
      const lucido = clamp01(f * 1.4);
      const c = lucido > .7 ? P.marmo : P.pietraChiara;
      d(-.7, 2.6, 0, 1.1, c); d(.7, 2.6, 0, 1.1, c);
      d(0, 3.7, 0, 1.2, c); d(0, 4.8, 0, .9, c);
      d(-1.4, 4.4, .6, .7, c); d(1.4, 4.4, -.6, .7, c);
      for (let i = 0; i < 12; i++) {
        if (lucido > .8) break;
        const g = (t * 1.2 + i * .09) % 1;
        d(Math.cos(i * 2.2) * (1.4 + g * 2.4), 4 - g * 2, Math.sin(i * 2.2) * (1.4 + g * 2.4), .3, P.polvere);
      }
      for (let i = 0; i < 8; i++) {
        if (lucido <= .8) break;
        const g = (t * .4 + i * .12) % 1;
        d(Math.cos(i) * 2.4, 5 + g * 3, Math.sin(i) * 2.4, .3 * (1 - g), P.oro);
      }
      omino(d, -4, 2.2, 2, P.terraScura, P.pelle);
    },
  };
},

campoformio(rng) {
  return {
    cielo: TRAMONTO, raggio: CALDO,
    statici(m) {
      for (let x = -12; x <= 12; x++) for (let z = -12; z <= 12; z++) m.p(x, 0, z, P.acqua);
      for (let x = -6; x <= 6; x++) for (let z = -5; z <= 5; z++) m.p(x, 1, z, P.pietraChiara);
      m.colonna(-4, -3, 2, 11, P.cotto);
      for (let dx = -1; dx <= 1; dx++) for (let dz = -1; dz <= 1; dz++) m.p(-4 + dx, 13, -3 + dz, P.tetto);
      cattedrale(m, 1, -3, 5, 6, 4, P.marmo, P.marmoOmbra);
      for (let i = 0; i < 10; i++) m.colonna(-9 + (i % 5) * 3, i < 5 ? -8 : 8, 1, 2, P.tronco);
    },
    dinamici(d, t) {
      /* Mille e cento anni di repubblica finiscono con una firma altrove: il
         vessillo cala e nessuno combatte. */
      const f = (t * .11) % 1;
      const giu = clamp01((f - .3) * 2);
      bandiera(d, t, 4, 8, 0, 3, giu > .8 ? [P.grigioverde, P.grigioverde] : [P.rossoIt, P.oro], 0);
      for (let x = -12; x <= 12; x += 3) for (let z = -12; z <= 12; z += 4) {
        if (Math.abs(x) <= 7 && Math.abs(z) <= 6) continue;
        d(x, .6 + Math.sin(t * 1.6 + x * .4 + z * .3) * .22, z, 2.4, P.acquaChiara);
      }
      for (let i = 0; i < 8; i++)
        omino(d, -4 + i * 1.2, 2, 3.4, giu > .5 ? P.grigioverde : P.rossoIt, P.pelle, .8);
      const gondola = ((t * 1.6) % 26) - 13;
      for (let i = 0; i < 5; i++) d(gondola + i * .9, 1.2, 9, .8, P.nero);
    },
  };
},

marengo(rng) {
  return {
    cielo: TRAMONTO, raggio: FUOCOLUCE,
    statici(m) {
      suolo(m, 12, P.erba, P.terra, rng, .6);
      for (let i = 0; i < 4; i++) casa(m, 8, -9 + i * 6, 3, 3, 2, P.tela, P.tetto, 1);
      for (let i = 0; i < 4; i++) albero(m, -11, -8 + i * 6, 1, rng);
    },
    dinamici(d, t) {
      /* Persa fino alle cinque del pomeriggio, vinta alle sei: arriva la
         colonna di rinforzo e la linea si rovescia. */
      const f = (t * .09) % 1;
      const perdente = f < .55;
      const spinta = perdente ? f / .55 : 1 - (f - .55) / .45;
      for (let i = 0; i < 16; i++)
        omino(d, -6 + spinta * 8 + (i % 8) * 1.1, 1.6, -6 + Math.floor(i / 8) * 2.2, P.blu, P.pelle, .8);
      for (let i = 0; i < 16; i++)
        omino(d, 6 - (1 - spinta) * 2 - (i % 8) * 1.1, 1.6, -6 + Math.floor(i / 8) * 2.2, P.biancoIt, P.pelle, .8);
      for (let i = 0; i < 8; i++) {
        if (perdente) break;
        const p = clamp01((f - .55) * 3 - i * .04);
        omino(d, -11 + p * 8, 1.6, 8 - p * 6, P.blu, P.pelle, .8);
      }
      for (let i = 0; i < 14; i++) {
        const g = (t * .7 + i * .07) % 1;
        d(Math.sin(i * 2.1) * 4, 1.6 + g * 3, -5 + (i % 8) * 1.6, .8 * (1 - g), P.fumo);
      }
    },
  };
},

rossini(rng) {
  return {
    cielo: CUPO, raggio: CALDO, ambiente: .6, fronte: Math.PI / 2,
    statici(m) {
      suolo(m, 10, P.legno, P.tronco, rng);
      for (let x = -8; x <= 8; x++) for (let y = 1; y <= 4; y++) m.p(x, y, -7, P.rosso);
      for (let z = -7; z <= 3; z++) for (let y = 1; y <= 9; y++) { m.p(-9, y, z, P.cotto); m.p(9, y, z, P.cotto); }
      for (let k = 0; k < 3; k++) for (let z = -6; z <= 2; z += 2) {
        m.p(-8, Math.round(2 + k * 2.5), z, P.oro); m.p(8, Math.round(2 + k * 2.5), z, P.oro);
      }
      m.box(-8, 1, -6, 17, 1, 3, P.legno);
    },
    dinamici(d0, t) {
      /* Il crescendo: la stessa frase torna e ogni volta si aggiunge uno
         strumento, finché non scoppia. */
      const f = (t * .25) % 1;
      const d = dissolvenza(d0, f, 1);   // il ciclo si ritira invece di spegnersi
      const strumenti = Math.floor(f * 8) + 1;
      for (let i = 0; i < strumenti; i++) {
        const x = -6 + i * 1.7;
        omino(d, x, 2, -4, [P.nero, P.viola, P.blu][i % 3], P.pelle, .8);
        d(x, 3.8 + Math.abs(Math.sin(t * 6 + i)) * .3, -4, .45, P.ottone);
      }
      for (let i = 0; i < strumenti * 3; i++) {
        const g = (t * 1.2 + i * .08) % 1;
        d(-6 + (i % 8) * 1.7, 4.4 + g * 5, -4 + Math.sin(t + i) * .6, .3 * (1 - g), P.oro);
      }
      folla(d, t, 0, 4, 16, 1.6, [P.viola, P.tela], 1.4);
    },
  };
},

nabucco(rng) {
  return {
    cielo: CUPO, raggio: CALDO, ambiente: .6, fronte: Math.PI / 2,
    statici(m) {
      suolo(m, 10, P.legno, P.tronco, rng);
      for (let z = -7; z <= 3; z++) for (let y = 1; y <= 10; y++) { m.p(-9, y, z, P.cotto); m.p(9, y, z, P.cotto); }
      for (let x = -8; x <= 8; x++) for (let y = 1; y <= 6; y++) m.p(x, y, -7, P.pietraChiara);
      m.box(-8, 1, -6, 17, 1, 3, P.legno);
      for (let k = 0; k < 3; k++) for (let z = -6; z <= 2; z += 2) {
        m.p(-8, Math.round(2 + k * 2.5), z, P.oro); m.p(8, Math.round(2 + k * 2.5), z, P.oro);
      }
    },
    dinamici(d, t) {
      /* Va' pensiero: il coro canta e a poco a poco anche la sala si alza in
         piedi e canta con lui. */
      const f = (t * .12) % 1;
      const contagio = clamp01((f - .3) * 2);
      for (let i = 0; i < 14; i++)
        omino(d, -6.5 + i, 2 + Math.abs(Math.sin(t * 2 + i * .4)) * .2, -4.4, P.tela, P.pelle, .8);
      for (let i = 0; i < 24; i++) {
        const su = contagio > (i % 8) / 9 ? .5 : 0;
        const a = i * 2.399, r = 2 + (i % 6) * .9;
        omino(d, Math.cos(a) * r, 1.4 + su, 1 + Math.sin(a) * r * .7, P.viola, P.pelle, .78);
      }
      for (let i = 0; i < 16; i++) {
        const g = (t * .6 + i * .06) % 1;
        d(-6 + (i % 12) * 1.1, 4 + g * 6, -4, .3 * (1 - g), P.oro);
      }
      for (let i = 0; i < 3; i++) {
        if (contagio <= .8) break;
        d(-1 + i * .8, 9, -4, .7, [P.verdeIt, P.biancoIt, P.rossoIt][i]);
      }
    },
  };
},

statuto(rng) {
  return {
    cielo: GIORNO, raggio: CALDO,
    statici(m) {
      suolo(m, 11, P.pietraChiara, P.terra, rng);
      casa(m, -8, -9, 17, 6, 7, P.cotto, P.tetto, 1);
      for (let i = 0; i < 5; i++) m.colonna(-6 + i * 3, -3, 1, 5, P.marmo);
      for (let x = -7; x <= 7; x++) m.p(x, 6, -3, P.marmoOmbra);
    },
    dinamici(d, t) {
      /* La carta viene affacciata dal balcone: durerà un secolo, ed è
         flessibile al punto che basterà una legge ordinaria per svuotarla. */
      const f = (t * .13) % 1.2;
      d(0, 7.4, -2.6 + clamp01(f * 2) * 1.4, 1.4, P.tela);
      omino(d, -1.6, 7.4, -3, P.blu, P.pelle, .9);
      omino(d, 1.6, 7.4, -3, P.viola, P.pelle, .9);
      folla(d, t, 0, 5, 30, 2, [P.tela, P.nero, P.viola], 1.2);
      for (let k = 0; k < 4; k++) {
        if (f <= .6) break;
        bandiera(d, t, -6 + k * 4, 2, 9, 3, [P.verdeIt, P.biancoIt, P.rossoIt], k);
      }
    },
  };
},

magenta(rng) {
  return {
    cielo: TRAMONTO, raggio: FUOCOLUCE,
    statici(m) {
      suolo(m, 12, P.erba, P.terra, rng, .6);
      for (let z = -12; z <= 12; z++) for (let x = -1; x <= 1; x++) m.p(x, 1, z, P.acqua);
      ponte(m, -3, 0, 7, 3, P.pietraChiara);
      for (let i = 0; i < 4; i++) casa(m, 6, -9 + i * 6, 4, 3, 3, P.cotto, P.tetto, 1);
    },
    dinamici(d, t) {
      /* Si combatte per il ponte e casa per casa: il colore delle divise sui
         campi darà il nome a una tinta. */
      const f = (t * .1) % 1;
      const avanza = clamp01(f * 1.6);
      for (let i = 0; i < 14; i++)
        omino(d, -10 + avanza * 9 + (i % 7) * 1.1, 2.2, -4 + Math.floor(i / 7) * 2.2, P.blu, P.pelle, .8);
      for (let i = 0; i < 12; i++)
        omino(d, 7 - avanza * 2 - (i % 6) * 1.1, 2.2, -4 + Math.floor(i / 6) * 2.2, P.biancoIt, P.pelle, .8);
      for (let i = 0; i < 10; i++) {
        const g = (t * .8 + i * .1) % 1;
        d(1 + g * 3, 2.4 + g * 2, -5 + (i % 6) * 2, .8 * (1 - g), P.fumo);
      }
      for (let i = 0; i < 8; i++) {
        if (avanza < .7) break;
        d(-6 + i * 2, 1.4, 6 + (i % 3), .8, P.porpora);
      }
    },
  };
},

solferino(rng) {
  return {
    cielo: CUPO, nebbia: 0x322e2a, raggio: 0xd8c0a0, ambiente: .55,
    statici(m) {
      suolo(m, 12, P.erbaScura, P.terra, rng, 2);
      torre(m, -1, -8, 8, P.pietraChiara);
      for (let i = 0; i < 3; i++) albero(m, -10 + i * 9, 9, 1, rng);
    },
    dinamici(d, t) {
      /* Quarantamila fra morti e feriti in un giorno. Poi il campo si svuota e
         restano le barelle: da lì nascerà la Croce Rossa. */
      const f = (t * .08) % 1;
      const battaglia = clamp01(1 - f * 2);
      for (let i = 0; i < 20; i++) {
        if (battaglia <= 0) break;
        omino(d, -8 + (i % 10) * 1.7, 2.6, -4 + Math.floor(i / 10) * 2.4,
          i % 2 ? P.blu : P.biancoIt, P.pelle, .8 * battaglia);
      }
      const dopo = clamp01((f - .45) * 2);
      for (let i = 0; i < 14; i++) {
        if (dopo <= 0) break;
        d(-9 + (i % 7) * 2.6, 2.2, -3 + Math.floor(i / 7) * 3, .9, P.tela);
      }
      for (let i = 0; i < 6; i++) {
        if (dopo < .4) break;
        const p = ((t * .4 + i * .17) % 1);
        omino(d, -9 + p * 18, 2.4, 5, P.biancoIt, P.pelle, .8);
        d(-9 + p * 18, 4.2, 5, .4, P.rossoIt);
      }
    },
  };
},

'regno-italia'(rng) {
  return {
    cielo: GIORNO, raggio: CALDO, fronte: Math.PI / 2,
    statici(m) {
      suolo(m, 11, P.pietraChiara, P.pietra, rng);
      casa(m, -9, -9, 19, 6, 8, P.cotto, P.tetto, 1);
      for (let i = 0; i < 6; i++) m.colonna(-7 + i * 3, -3, 1, 6, P.marmo);
      for (let x = -8; x <= 8; x++) m.p(x, 7, -3, P.marmoOmbra);
    },
    dinamici(d, t) {
      /* Il 17 marzo 1861: mancano ancora Venezia, Trento e Roma, e si vede dai
         vuoti nella fila delle bandiere. */
      const f = (t * .12) % 1.3;
      for (let k = 0; k < 9; k++) {
        if (f < k / 12 || k === 3 || k === 7) continue;
        bandiera(d, t, -8 + k * 2, 8, -2, 3, [P.verdeIt, P.biancoIt, P.rossoIt], k);
      }
      omino(d, 0, 8, -3.4, P.blu, P.pelle, 1);
      folla(d, t, 0, 5, 34, 2, [P.tela, P.nero, P.viola], 1.2);
      for (let i = 0; i < 12; i++) {
        if (f <= .9) break;
        const g = (t * .5 + i * .08) % 1;
        d(Math.cos(i * 1.7) * 7, 12 - g * 9, 4 + Math.sin(i * 1.7) * 5, .3,
          [P.verdeIt, P.biancoIt, P.rossoIt][i % 3]);
      }
    },
  };
},

fiat(rng) {
  return {
    cielo: 0x2a3040, nebbia: 0x38404e, raggio: 0xffe4b8,
    statici(m) {
      suolo(m, 12, P.pietraChiara, P.terra, rng);
      // capannone basso: con i muri a sei la catena di montaggio, che è tutta
      // la scena, restava dietro un muro da qualunque parte si guardasse
      fabbrica(m, -10, -8, 20, 8, 4, P.cotto, 3);
      for (let x = -12; x <= 12; x++) m.p(x, 1, 6, P.grigio);
    },
    dinamici(d, t) {
      /* La catena: ogni postazione aggiunge un pezzo, e dal fondo esce
         un'automobile finita. */
      const f = (t * .2) % 1;
      for (let k = 0; k < 5; k++) {
        const p = (f + k / 5) % 1, x = -10 + p * 20, grado = Math.floor(p * 4);
        d(x, 2.2, -4, 1.1, P.grigio);
        if (grado >= 1) d(x + 1, 2.2, -4, 1.1, P.grigio);
        if (grado >= 2) d(x + .5, 3.1, -4, .9, P.nero);
        if (grado >= 3) { d(x - .4, 1.6, -3.4, .5, P.nero); d(x + 1.4, 1.6, -4.6, .5, P.nero); }
      }
      for (let i = 0; i < 10; i++) omino(d, -9 + i * 2, 2, -2.4, P.divisa, P.pelle, .78);
      for (let k = 0; k < 3; k++) fuoco(d, t, -9 + k * 7, 12, -7, 5, .8, k * .3);
      for (let i = 0; i < 3; i++) {
        const x = ((t * 3 + i * 9) % 26) - 13, c = [P.rossoIt, P.nero, P.blu][i];
        d(x, 2.2, 6, 1.1, c); d(x, 3, 6, .8, c);
      }
    },
  };
},

'grande-guerra'(rng) {
  return {
    cielo: 0x2a2c30, nebbia: 0x36383c, raggio: 0xc8bca0, ambiente: .5,
    statici(m) {
      for (let x = -12; x <= 12; x++) for (let z = -12; z <= 12; z++) {
        const h = Math.min(5, Math.round(Math.max(0, (z + 2) * .5)));
        m.p(x, h, z, P.pietraChiara);
        for (let y = 0; y < h; y++) m.p(x, y, z, P.roccia);
      }
      for (let x = -12; x <= 12; x++) {
        const z = -6 + (Math.floor(x / 3) % 2) * 2;
        for (let y = 0; y < 2; y++) m.p(x, -y, z, P.terraScura);
      }
    },
    dinamici(d, t) {
      /* Dodici battaglie sullo stesso fiume: si esce dalla trincea, si avanza
         di poco, si torna. E poi di nuovo. */
      const f = (t * .1) % 1;
      const fuori = f < .5 ? clamp01(f * 3) : clamp01((1 - f) * 3);
      for (let i = 0; i < 18; i++) {
        const x = -11 + i * 1.3, z = -6 + (Math.floor(x / 3) % 2) * 2;
        omino(d, x, .2 + fuori * .9, z + fuori * 3.4, P.divisa, P.pelle, .8);
      }
      for (let i = 0; i < 12; i++) d(-11 + i * 2, .6, -3.4, .4, P.ferro);
      for (let i = 0; i < 16; i++) {
        const g = (t * .9 + i * .06) % 1;
        d(-10 + i * 1.4, 1 + g * 4, 2 + (i % 4), .9 * (1 - g), g < .3 ? P.fuoco : P.fumo);
      }
      for (let i = 0; i < 20; i++) {
        const g = (t * 1.5 + i * .05) % 1;
        d(((i * 6151) % 25) - 12, 12 - g * 12, ((i * 3571) % 25) - 12, .25, P.ghiaccio);
      }
    },
  };
},

'marcia-roma'(rng) {
  return {
    cielo: 0x2c2a2c, nebbia: 0x38363a, raggio: 0xd0c0a0, ambiente: .55,
    statici(m) {
      suolo(m, 12, P.pietraChiara, P.terra, rng);
      casa(m, -10, -9, 20, 5, 7, P.cotto, P.tetto, 1);
      for (let x = -12; x <= 12; x++) m.p(x, 1, 4, P.pietra);
    },
    dinamici(d, t) {
      /* Le squadre arrivano male armate e sotto la pioggia; a decidere non sono
         loro, ma la firma che non arriva sullo stato d'assedio. */
      const f = (t * .1) % 1;
      const avanti = clamp01(f * 1.5);
      for (let i = 0; i < 26; i++)
        omino(d, -13 + avanti * 14 + (i % 8) * 1.2, 2, 3 + Math.floor(i / 8) * 1.3, P.nero, P.pelle, .78);
      for (let i = 0; i < 20; i++) {
        const g = (t * 1.4 + i * .05) % 1;
        d(((i * 6151) % 25) - 12, 12 - g * 12, ((i * 3571) % 25) - 12, .25, P.ghiaccio);
      }
      const firma = clamp01((f - .6) * 3);
      d(0, 8.4, -3, 1.2 * (1 - firma), P.tela);
      omino(d, 0, 7.4, -4, P.blu, P.pelle, .9);
      if (firma > .7) omino(d, 0, 7.4, -2.4, P.nero, P.pelle, .9);
    },
  };
},

'referendum-1946'(rng) {
  return {
    cielo: GIORNO, raggio: CALDO, fronte: Math.PI / 2,
    statici(m) {
      suolo(m, 10, P.pietraChiara, P.pietra, rng);
      for (let x = -9; x <= 9; x++) for (let y = 1; y <= 6; y++) m.p(x, y, -7, P.tela);
      for (let z = -7; z <= 3; z++) for (let y = 1; y <= 6; y++) { m.p(-9, y, z, P.tela); m.p(9, y, z, P.tela); }
      for (let x = -9; x <= 9; x += 2) for (let z = -7; z <= 3; z += 2) m.p(x, 7, z, P.legno);
      m.box(-2, 1, -4, 5, 1, 3, P.legno);
      for (let i = 0; i < 3; i++) m.guscio(-7 + i * 6, 2, 0, 3, 3, 2, P.legno);
    },
    dinamici(d, t) {
      /* Per la prima volta votano anche le donne: la fila entra, le schede
         cadono nell'urna e l'urna si riempie. */
      const f = (t * .16) % 1.3;
      for (let i = 0; i < 14; i++) {
        const p = ((f + i / 14) % 1);
        omino(d, -8 + p * 16, 2, 5 - (p > .4 && p < .7 ? 3 : 0), i % 2 ? P.viola : P.rosso, P.pelle, .8);
      }
      const schede = Math.floor((f / 1.3) * 16);
      for (let i = 0; i < schede; i++)
        d(-1 + (i % 4) * .6, 2.4 + Math.floor(i / 4) * .3, -3, .5, P.tela);
      for (let i = 0; i < 4; i++) {
        const g = (t * .8 + i * .25) % 1;
        d(0, 5 - g * 2.2, -3, .5, P.tela);
      }
      omino(d, 3.4, 2, -3, P.nero, P.pelle, .85);
    },
  };
},

boom(rng) {
  return {
    cielo: GIORNO, raggio: CALDO,
    statici(m) {
      suolo(m, 12, P.pietraChiara, P.terra, rng);
      for (let x = -12; x <= 12; x++) for (let z = -2; z <= 2; z++) m.p(x, 1, z, P.grigio);
      for (let i = 0; i < 6; i++) {
        const x = -11 + i * 4;
        for (let k = 0; k < 2; k++) {
          const z = k ? 6 : -8;
          // palazzi bassi: a otto piani il corso restava in ombra da ogni angolo
          for (let y = 0; y < 4 + (i % 2); y++)
            for (let dx = 0; dx < 3; dx++) for (let dz = 0; dz < 3; dz++)
              m.p(x + dx, 2 + y, z + dz, (dx + dz + y) % 4 === 0 ? P.acquaChiara : P.tela);
        }
      }
    },
    dinamici(d, t) {
      /* Il miracolo si misura in oggetti: prima gli scooter, poi le utilitarie,
         poi le antenne sui tetti. */
      const f = (t * .12) % 1.3;
      for (let i = 0; i < 6; i++) {
        const x = ((t * 4 + i * 4.5) % 26) - 13;
        d(x, 2.2, -1, .7, [P.acquaChiara, P.tela, P.rossoIt][i % 3]);
        omino(d, x, 2.6, -1, P.blu, P.pelle, .7);
      }
      for (let i = 0; i < 5; i++) {
        if (f < .3) break;
        const x = ((t * 2.6 + i * 5.5) % 26) - 13, c = [P.biancoIt, P.oro, P.verdeIt][i % 3];
        d(-x, 2.2, 1, 1.1, c); d(-x, 3, 1, .8, c);
      }
      for (let i = 0; i < 12; i++) {
        if (f < .7 + (i % 6) / 40) continue;
        const x = -11 + (i % 6) * 4 + 1, z = i < 6 ? -7 : 7;
        for (let y = 0; y < 3; y++) d(x, 8 + (i % 3) + y, z, .25, P.ferro);
        d(x, 11 + (i % 3), z, .8, P.ferro);
      }
    },
  };
},

moro(rng) {
  return {
    cielo: CUPO, nebbia: 0x2c2e34, raggio: 0xc0b8a8, ambiente: .5,
    statici(m) {
      suolo(m, 12, P.pietraChiara, P.terra, rng);
      for (let i = 0; i < 8; i++)
        casa(m, -11 + (i % 4) * 6, i < 4 ? -9 : 6, 5, 4, 6, P.cotto, P.tetto, 1);
      for (let x = -12; x <= 12; x++) for (let z = -2; z <= 2; z++) m.p(x, 1, z, P.grigio);
    },
    dinamici(d, t) {
      /* Sobria: una strada di Roma, cinque auto ferme, e cinquantacinque giorni
         che si spengono uno alla volta. */
      const f = (t * .07) % 1;
      const colori = [P.blu, P.nero, P.biancoIt, P.nero, P.grigio];
      for (let i = 0; i < 5; i++) {
        const x = -6 + i * 3;
        d(x, 2.2, -.6, 1.1, colori[i]);
        d(x + 1, 2.2, -.6, 1.1, colori[i]);
        d(x + .5, 3.1, -.6, .9, colori[i]);
      }
      const giorni = Math.floor(clamp01(f * 1.4) * 55);
      for (let i = 0; i < 55; i++)
        d(-11 + (i % 20) * 1.15, 8.4 + Math.floor(i / 20) * 1, 9, .35, i < giorni ? P.grigio : P.oro);
      for (let i = 0; i < 10; i++) {
        const g = (t * .3 + i * .1) % 1;
        d(-5 + i * 1.2, 2.4 + g * 3, 3, .5 * (1 - g), P.fumo);
      }
    },
  };
},

euro(rng) {
  return {
    cielo: GIORNO, raggio: CALDO,
    statici(m) {
      suolo(m, 11, P.pietraChiara, P.pietra, rng);
      for (let i = 0; i < 6; i++) casa(m, -11 + i * 4, -9, 3, 3, 5, P.tela, P.tetto, 1);
      m.box(-3, 1, -2, 7, 1, 5, P.marmo);
    },
    dinamici(d, t) {
      /* Le lire finiscono nel cassetto e le monete nuove escono dagli
         sportelli: il cambio a 1936,27 resterà un esercizio mentale per anni. */
      const f = (t * .13) % 1.3;
      for (let i = 0; i < 14; i++) {
        const p = ((f + i / 14) % 1);
        d(-8 + p * 16, 2.4 + Math.sin(p * Math.PI) * 3, 0, .5, p > .5 ? P.acquaChiara : P.sabbia);
      }
      for (let i = 0; i < 12; i++) {
        const a = i / 12 * Math.PI * 2 + t * .12;
        d(Math.cos(a) * 4.4, 9, Math.sin(a) * 4.4, .4, P.oro);
      }
      folla(d, t, 0, 5, 14, 1.6, [P.tela, P.blu, P.viola], 1.2);
      for (let i = 0; i < 6; i++) d(-6 + i * 2.4, 2.4, -4, .5, P.sabbia);
    },
  };
},

});

})();
