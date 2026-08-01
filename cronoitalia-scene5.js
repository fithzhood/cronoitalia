'use strict';

/* Scene firma, quinto volume: fondazioni, scoperte e viaggi.
 *
 * Le fondazioni hanno quasi tutte la stessa forma narrativa — qualcosa che
 * prima non c'era e alla fine c'è — e quindi quasi tutte usano lo stesso
 * meccanismo: una `f` che scorre e fa comparire i pezzi in ordine. Quello che
 * cambia è cosa compare.
 */

(() => {

const P = VoxScena.P;
const { suolo, albero, casa, omino, clamp01, dissolvenza, arrivo, tempio, cattedrale, torre, mura,
        nave, folla, fuoco, bandiera, stelle, onde, fabbrica, ponte,
        interno, piazza, campo, porto, teatro, bottega, collina, valle } = VoxScena.kit;

const NOTTE = 0x14203a, GIORNO = 0x24344c, TRAMONTO = 0x2e2c3e, CUPO = 0x1c1f28;
const CALDO = 0xffe6b4, FREDDO = 0xd6e4ff, FUOCO = 0xffb478;
const FR = Math.PI / 2;

// un abitato che cresce: le case spuntano una dopo l'altra
function borgo(d, t, f, posti, cMuro, cTetto, y) {
  for (let i = 0; i < posti.length; i++) {
    const su = clamp01((f - i / posti.length) * 4);
    if (su <= 0) continue;
    const [x, z] = posti[i], h = Math.round((2 + (i % 3)) * su);
    for (let k = 0; k < h; k++)
      for (let dx = 0; dx < 3; dx++) for (let dz = 0; dz < 3; dz++) {
        if (dx === 1 && dz === 1 && k < h - 1) continue;
        d(x + dx, (y || 1) + k, z + dz, 1, k === h - 1 ? (cTetto || P.tetto) : (cMuro || P.tela));
      }
  }
}

// oggetti che si accumulano su un piano: leggi, libri, monete, pratiche
function pila(d, f, n, x0, y0, z, c, passo) {
  const q = Math.floor(clamp01(f) * n);
  for (let i = 0; i < q; i++)
    d(x0 + (i % 5) * (passo || .9), y0 + Math.floor(i / 5) * .4, z, .8, c);
}

VoxScena.registra({

/* ==================== fondazioni ==================== */

polada(rng) {
  return { cielo: GIORNO, raggio: CALDO,
    statici(m) {
      for (let x = -12; x <= 12; x++) for (let z = -12; z <= 12; z++) m.p(x, 0, z, P.acqua);
      for (let x = -12; x <= 12; x++) for (let z = 6; z <= 12; z++) { m.p(x, 1, z, P.erbaScura); m.p(x, 0, z, P.terra); }
      for (let i = 0; i < 5; i++) albero(m, -9 + i * 5, 10, 1, rng);
    },
    dinamici(d, t) {
      /* Villaggi su impalcature in riva al lago: l'acqua li conserverà con
         dentro tessuti, ruote e attrezzi. */
      const f = (t * .12) % 1.3;
      for (let i = 0; i < 6; i++) {
        const su = clamp01((f - i / 8) * 4);
        if (su <= 0) continue;
        const x = -8 + i * 3, z = -4 + (i % 2) * 4;
        for (const [dx, dz] of [[0, 0], [2, 0], [0, 2], [2, 2]])
          for (let y = 0; y < 3; y++) d(x + dx, .5 + y, z + dz, .6, P.tronco);
        for (let dx = 0; dx <= 2; dx++) for (let dz = 0; dz <= 2; dz++)
          d(x + dx, 3.5, z + dz, 1, su > .8 ? P.legno : P.tronco);
        if (su > .9) for (let k = 0; k < 2; k++)
          for (let dx = k; dx <= 2 - k; dx++) d(x + dx, 4.5 + k, z + 1, .9, P.tetto);
      }
      onde(d, t, 12, 3, [12, 5]);
      for (let i = 0; i < 4; i++) omino(d, -6 + i * 4, 4.6, -2, P.tela, P.pelle, .7);
    } };
},

frattesina(rng) {
  return { cielo: GIORNO, raggio: CALDO,
    statici(m) { suolo(m, 12, P.erba, P.terra, rng, .6); for (let z = -12; z <= 12; z++) for (let x = -2; x <= 1; x++) m.p(x, 0, z, P.acqua); },
    dinamici(d0, t) {
      /* Ambra dal Baltico, avorio dall'Africa, vetro: il commercio a lunga
         distanza arriva in Italia molto prima dei Greci. */
      const f = (t * .13) % 1.3;
      const d = dissolvenza(d0, f, 1.3);   // il ciclo si ritira invece di spegnersi
      borgo(d, t, f, [[3, -6], [6, -1], [4, 4], [8, -8], [7, 6]], P.legno, P.tetto);
      for (let k = 0; k < 4; k++) {                                  // le merci che arrivano
        const p = ((f + k / 4) % 1);
        d(-11 + p * 12, 1.6, -8 + k * 5, .7, [P.oro, P.marmo, P.menta, P.bronzo][k]);
      }
      for (let i = 0; i < 6; i++) omino(d, 3 + (i % 3) * 2, 1.4, -2 + Math.floor(i / 3) * 3, P.tela, P.pelle, .78);
      for (let x = -2; x <= 1; x += 2) for (let z = -12; z <= 12; z += 4)
        d(x, .6 + Math.sin(t * 2 + z * .4) * .18, z, 1.8, P.acquaChiara);
    } };
},

'latium-vetus'(rng) {
  return { cielo: TRAMONTO, raggio: CALDO,
    statici(m) { collina(m, 12, 5, P.erbaScura, P.erba); },
    dinamici(d, t) {
      /* Sulle pendici del vulcano spuntano gli abitati della lega latina, con
         un santuario comune a fare da centro. */
      const f = (t * .12) % 1.3;
      const posti = [[-8, -6], [-3, 2], [3, -5], [6, 3], [-6, 6], [1, 7]];
      for (let i = 0; i < posti.length; i++) {
        const su = clamp01((f - i / 8) * 4);
        if (su <= 0) continue;
        const da = arrivo(d, su);
        const [x, z] = posti[i];
        const h = Math.max(0, Math.round(5 - Math.hypot(x, z) * .42));
        for (let k = 0; k < 2 * su; k++)
          for (let dx = 0; dx < 3; dx++) for (let dz = 0; dz < 3; dz++)
            da(x + dx, h + 1 + k, z + dz, 1, k > 0 ? P.tetto : P.legno);
      }
      if (f > .8) { for (let i = 0; i < 4; i++) d(-1 + i, 6.4, 0, .9, P.marmo); d(.5, 7.4, 0, .7, P.oro); }
      for (let i = 0; i < 8; i++) omino(d, Math.cos(i * .8) * 6, 5.4, Math.sin(i * .8) * 6, P.tela, P.pelle, .75);
    } };
},

'messina-zancle'(rng) {
  return { cielo: GIORNO, raggio: CALDO,
    statici(m) {
      for (let x = -12; x <= 12; x++) for (let z = -12; z <= 12; z++) m.p(x, 0, z, P.mare);
      for (let x = -12; x <= 12; x++) for (let z = 4; z <= 12; z++) { m.p(x, 1, z, P.erbaScura); m.p(x, 0, z, P.terra); }
      for (let a = 0; a < 20; a++) {                                 // la falce che chiude il porto
        const an = Math.PI * a / 20;
        m.p(Math.round(Math.cos(an) * 8), 1, Math.round(3 + Math.sin(an) * -5), P.sabbia);
      }
    },
    dinamici(d, t) {
      /* Una lingua di sabbia a falce chiude il porto naturale: chi tiene lo
         Stretto tiene il passaggio fra i due mari. */
      const f = (t * .12) % 1.3;
      borgo(d, t, f, [[-7, 6], [-2, 7], [3, 6], [7, 8], [-5, 10]], P.tela, P.tetto, 2);
      onde(d, t, 12, 3, [12, 6]);
      for (let k = 0; k < 3; k++) {
        const p = ((t * .4 + k * .33) % 1);
        nave(d, t, -12 + p * 20, 1.2, -8 + k * 3, 1, 5, P.legno, P.tela, 0);   // lo scafo è lungo cinque
      }
    } };
},

'catania-katane'(rng) {
  return { cielo: TRAMONTO, raggio: CALDO,
    statici(m) {
      suolo(m, 12, P.pietraScura, P.terraScura, rng, .6);
      for (let y = 0; y < 7; y++) {
        const r = 5 - y * .6;
        for (let x = -r; x <= r; x++) for (let z = -r; z <= r; z++)
          if (x * x + z * z <= r * r) m.p(Math.round(x), y + 1, Math.round(z) - 9, P.roccia);
      }
    },
    dinamici(d, t) {
      /* Fondata sulla lava, distrutta e ricostruita più volte sempre nello
         stesso posto: la terra nera è troppo fertile per rinunciarci. */
      const f = (t * .1) % 1.4;
      const ciclo = f % .7;
      // il borgo si ritira prima di essere rifondato, invece di sparire di scatto
      borgo(dissolvenza(d, ciclo, .7), t, clamp01(ciclo * 3),
        [[-8, 2], [-3, 4], [2, 2], [6, 5], [-6, 7], [1, 8]], P.tela, P.tetto);
      if (ciclo > .5) {                                              // la colata che torna
        const c = (ciclo - .5) / .2;
        for (let i = 0; i < 14; i++)
          d(-7 + (i % 7) * 2.2, 1.4, -6 + c * 8 + Math.floor(i / 7) * 1.4, 1.4, c > .6 ? P.brace : P.lava);
      }
      fuoco(d, t, 0, 8, -9, 10, 1.2, 0);
    } };
},

crotone(rng) {
  return { cielo: GIORNO, raggio: CALDO,
    statici(m) { porto(m, 3, rng, P.erbaScura); },
    dinamici(d0, t) {
      /* Atleti imbattibili a Olimpia e la scuola di Pitagora: una colonia che
         esporta ginnastica e matematica. */
      const f = (t * .13) % 1.3;
      const d = dissolvenza(d0, f, 1.3);   // il ciclo si ritira invece di spegnersi
      borgo(d, t, f, [[-8, 5], [-2, 6], [4, 5], [8, 8], [-5, 9]], P.tela, P.tetto, 2);
      for (let i = 0; i < 6; i++) {                                  // i corridori nello stadio
        const a = t * .6 + i * 1.05;
        omino(d, Math.cos(a) * 5, 2, 7 + Math.sin(a) * 2.4, P.pelle, P.pelle, .8);
      }
      onde(d, t, 12, 3, [12, 4]);
      for (let i = 0; i < 6; i++) {
        if (f < .7) break;
        d(-2 + i * .8, 5.4, 4, .5, P.oro);
      }
    } };
},

taranto(rng) {
  return { cielo: GIORNO, raggio: CALDO,
    statici(m) { porto(m, 4, rng, P.erbaScura); },
    dinamici(d, t) {
      /* L'unica colonia fondata da Sparta: figli irregolari cacciati dalla
         madrepatria trovano il porto migliore dello Ionio. */
      const f = (t * .12) % 1.3;
      const arrivo = clamp01(f * 2);
      for (let k = 0; k < 3; k++)
        nave(d, t, -12 + arrivo * 9, 1.2, -8 + k * 4, 1, 6, P.legno, P.rosso, 0);
      for (let i = 0; i < 12; i++) {
        const p = clamp01(arrivo * 1.4 - i * .04);
        if (p <= 0) continue;
        omino(d, -4 + p * 6 + (i % 6) * .9, 2, 3 + p * 3, P.rosso, P.pelle, .78);
      }
      borgo(d, t, clamp01((f - .4) * 1.8), [[-7, 6], [-1, 7], [5, 6]], P.tela, P.tetto, 2);
      onde(d, t, 12, 3, [12, 5]);
    } };
},

gela(rng) {
  return { cielo: TRAMONTO, raggio: CALDO,
    statici(m) { porto(m, 3, rng, P.sabbia); },
    dinamici(d0, t) {
      /* Rodii e cretesi sulla costa meridionale: qui morirà Eschilo, e qui
         nascerà il tiranno che salverà la Sicilia greca a Himera. */
      const f = (t * .13) % 1.3;
      const d = dissolvenza(d0, f, 1.3);   // il ciclo si ritira invece di spegnersi
      borgo(d, t, f, [[-8, 5], [-3, 7], [2, 5], [7, 7], [-6, 9]], P.sabbia, P.tetto, 2);
      if (f > .75) tempioDin(d, t, 0, 9);
      onde(d, t, 12, 3, [12, 4]);
      for (let i = 0; i < 8; i++) omino(d, -6 + i * 1.8, 2, 4, P.tela, P.pelle, .75);
      function tempioDin(dd, tt, x, z) {
        for (let i = 0; i < 5; i++) for (let y = 0; y < 4; y++) dd(x - 4 + i * 2, 2 + y, z, .8, P.marmo);
        for (let i = 0; i < 5; i++) dd(x - 4 + i * 2, 6.2, z, .9, P.marmoOmbra);
      }
    } };
},

locri(rng) {
  return { cielo: GIORNO, raggio: CALDO, fronte: FR,
    statici(m) { interno(m, 17, 7, 10, P.sabbia, P.legno); },
    dinamici(d0, t) {
      /* Zaleuco scrive quello che la tradizione considera il primo codice di
         leggi del mondo greco: chi propone una modifica lo fa con la corda al
         collo. */
      const f = (t * .13) % 1.3;
      const d = dissolvenza(d0, f, 1.3);   // il ciclo si ritira invece di spegnersi
      pila(d, f, 18, -3.5, 2.4, -1, P.tela);
      omino(d, 0, 1.4, 2, P.tela, P.pelle, .95);
      for (let i = 0; i < 3; i++) d(0, 3.4 + i * .4, 2, .25, P.tronco);   // la corda
      for (let i = 0; i < 8; i++) omino(d, -6 + i * 1.7, 1.4, 5, P.viola, P.pelle, .75);
      for (let i = 0; i < 10; i++) {
        if (f < .8) break;
        d(-6 + i * 1.3, 5.4, -6.4, .6, P.oro);
      }
    } };
},

cloaca(rng) {
  return { cielo: CUPO, raggio: CALDO, ambiente: .6,
    statici(m) { suolo(m, 12, P.terraScura, P.terra, rng, 1); },
    dinamici(d, t) {
      /* Prima la palude, poi il canale, poi il terreno asciutto: sul fondo
         bonificato nasce il Foro, e con esso l'idea stessa di città. */
      const f = (t * .1) % 1.3;
      const asciutto = clamp01(f * 1.6);
      for (let x = -10; x <= 10; x += 2) for (let z = -6; z <= 6; z += 2)
        d(x, 1.2 + Math.sin(t * 1.5 + x + z) * .12, z, 1.8 * (1 - asciutto), P.acqua);
      for (let z = -8; z <= 8; z++) {                                // il condotto
        if (asciutto < .3) break;
        d(0, .4, z, 1.2, P.pietraScura);
        d(0, 1.4, z, 1.2, P.pietraChiara);
      }
      if (asciutto > .7) {
        for (let x = -8; x <= 8; x++) for (let z = -4; z <= 4; z += 4) d(x, 1.4, z, .9, P.pietraChiara);
        for (let i = 0; i < 5; i++) for (let y = 0; y < 4; y++) d(-6 + i * 3, 2 + y, -5, .8, P.marmo);
      }
      for (let i = 0; i < 10; i++) omino(d, -8 + i * 1.8, 1.6, 7, P.terraScura, P.pelle, .75);
    } };
},

chiusi(rng) {
  return { cielo: TRAMONTO, raggio: CALDO,
    statici(m) { collina(m, 12, 5, P.erbaScura, P.erba); },
    dinamici(d, t) {
      /* Una delle dodici città etrusche, e la patria del re che secondo la
         leggenda assediò Roma appena diventata repubblica. */
      const f = (t * .12) % 1.3;
      borgo(d, t, f, [[-7, -4], [-2, 1], [3, -3], [5, 3], [-5, 4]], P.cotto, P.tetto, 5);
      for (let i = 0; i < 6; i++) {                                  // le tombe scavate nel fianco
        const p = clamp01((f - (.5 + i / 20)) * 5);
        if (p <= 0) continue;
        const da = arrivo(d, p);
        da(-8 + i * 3, 2.4, 8, .9, P.nero);
      }
      for (let i = 0; i < 8; i++) omino(d, Math.cos(i * .8) * 5, 5.4, Math.sin(i * .8) * 5, P.viola, P.pelle, .75);
      if (f > .9) d(0, 8.4, 0, .8, P.oro);
    } };
},

repubblica(rng) {
  return { cielo: GIORNO, raggio: CALDO, fronte: FR,
    statici(m) { interno(m, 19, 8, 11, P.marmo, P.marmoOmbra); },
    dinamici(d, t) {
      /* Cacciato il re, il potere si sdoppia e dura un anno: da qui in poi è
         qualcosa che si restituisce. */
      const f = (t * .12) % 1.3;
      const via = clamp01(f * 2);
      if (via < 1) { omino(d, 0, 1.4, -3, P.oro, P.pelle, 1.05); d(0, 3.6, -3, .8 * (1 - via), P.oro); }
      if (via > .5) {
        omino(d, -2, 1.4, -3, P.biancoIt, P.pelle, 1);
        omino(d, 2, 1.4, -3, P.biancoIt, P.pelle, 1);
        for (const x of [-2, 2]) for (let i = 0; i < 5; i++) d(x, 2.6 + i * .3, -1.6, .3, P.legno);
      }
      folla(d, t, 0, 3, 16, 1.8, [P.tela, P.viola], 1.2);
    } };
},

kainua(rng) {
  return { cielo: GIORNO, raggio: CALDO,
    statici(m) { suolo(m, 12, P.erbaScura, P.terra, rng); },
    dinamici(d, t) {
      /* Una città progettata a tavolino: strade ortogonali, isolati regolari e
         fognature. Un piano regolatore prima dei Romani. */
      const f = (t * .12) % 1.3;
      for (let i = 0; i < 5; i++) {                                  // prima le strade
        const su = clamp01((f - i / 12) * 6);
        if (su <= 0) continue;
        for (let k = -11; k <= 11; k++) {
          d(-8 + i * 4, 1.2, k * su, .9, P.pietraChiara);
          d(k * su, 1.2, -8 + i * 4, .9, P.pietraChiara);
        }
      }
      const isolati = [];
      for (let a = 0; a < 4; a++) for (let b = 0; b < 4; b++) isolati.push([-6 + a * 4, -6 + b * 4]);
      borgo(d, t, clamp01((f - .4) * 2), isolati, P.cotto, P.tetto);
      for (let i = 0; i < 8; i++) omino(d, -9 + i * 2.4, 1.6, 10, P.tela, P.pelle, .75);
    } };
},

cisalpina(rng) {
  return { cielo: GIORNO, raggio: CALDO,
    statici(m) { suolo(m, 12, P.erba, P.terra, rng, .4); },
    dinamici(d, t) {
      /* Una catena di colonie e una strada dritta: la pianura padana diventa
         Italia in due generazioni. */
      const f = (t * .12) % 1.3;
      for (let x = -12; x <= 12; x++) {
        if (f < (x + 12) / 30) continue;
        d(x, 1.2, 0, .9, P.pietraChiara);
      }
      const posti = [[-10, -4], [-5, 2], [0, -4], [5, 2], [9, -4]];
      borgo(d, t, clamp01((f - .3) * 1.8), posti, P.cotto, P.tetto);
      for (let i = 0; i < 6; i++) {
        const p = ((t * .5 + i * .17) % 1);
        omino(d, -12 + p * 24, 1.6, .9, P.rosso, P.pelle, .75);
      }
    } };
},

aquileia(rng) {
  return { cielo: GIORNO, raggio: CALDO,
    statici(m) { suolo(m, 12, P.erbaScura, P.terra, rng); for (let z = -12; z <= 12; z++) for (let x = 8; x <= 10; x++) m.p(x, 0, z, P.acqua); },
    dinamici(d, t) {
      /* Colonia di frontiera verso est: diventerà la quarta città d'Italia e la
         porta commerciale verso il Danubio e il Baltico. */
      const f = (t * .12) % 1.3;
      const posti = [[-9, -6], [-4, -1], [1, -6], [4, 1], [-7, 4], [0, 5]];
      borgo(d, t, f, posti, P.cotto, P.tetto);
      if (f > .6) for (let i = 0; i < 20; i++) {                      // le mura, dopo
        const a = i / 20 * Math.PI * 2;
        d(Math.round(Math.cos(a) * 10), 1.6, Math.round(Math.sin(a) * 8), .9, P.pietraChiara);
      }
      for (let k = 0; k < 3; k++) {
        const p = ((t * .4 + k * .33) % 1);
        nave(d, t, 9, 1.2, -12 + p * 24, 1, 4, P.legno, P.tela, 0);
      }
    } };
},

'claudio-porto'(rng) {
  return { cielo: GIORNO, raggio: CALDO,
    statici(m) { for (let x = -12; x <= 12; x++) for (let z = -12; z <= 12; z++) m.p(x, 0, z, P.mare); },
    dinamici(d, t) {
      /* Per liberare Roma dalla fame si scava un porto artificiale, e per fare
         il molo si affonda la nave che aveva portato l'obelisco. */
      const f = (t * .1) % 1.3;
      const moli = clamp01(f * 1.6);
      for (let a = 0; a < 26; a++) {
        if (moli < a / 30) continue;
        const an = Math.PI * .15 + a / 26 * Math.PI * 1.7;
        d(Math.round(Math.cos(an) * 9), 1.2, Math.round(Math.sin(an) * 8), 1.2, P.pietraChiara);
      }
      const affonda = clamp01((f - .5) * 2.4);
      for (let i = 0; i < 8; i++) d(-2 + i * .9, 1.4 - affonda * 1.4, 6, 1, P.legno);
      if (affonda > .8) { for (let y = 0; y < 5; y++) d(2, 1.6 + y, 6, .5, P.roccia); }
      onde(d, t, 12, 3, [10, 9]);
      for (let k = 0; k < 3; k++) {
        if (f < .9) break;
        nave(d, t, -6 + k * 5, 1.2, 0, 1, 6, P.legno, P.tela, 0);
      }
    } };
},

melfi(rng) {
  return { cielo: TRAMONTO, raggio: CALDO, fronte: FR,
    statici(m) { interno(m, 17, 8, 10, P.pietraChiara, P.legno); },
    dinamici(d, t) {
      /* Il papa investe i Normanni di terre che devono ancora conquistare:
         la Sicilia è già assegnata prima di essere presa. */
      const f = (t * .13) % 1.3;
      omino(d, 0, 1.4, -3, P.biancoIt, P.pelle, 1);
      const titoli = ['Puglia', 'Calabria', 'Sicilia'];
      for (let i = 0; i < 3; i++) {
        const dato = f > (i + 1) / 4;
        omino(d, -3 + i * 3, 1.4, 2, P.ferro, P.pelle, .9);
        if (dato) d(-3 + i * 3, 3.4, 2, .6, i === 2 ? P.verdeIt : P.oro);
      }
      for (let i = 0; i < 10; i++) omino(d, -6 + i * 1.4, 1.4, 5, P.viola, P.pelle, .75);
    } };
},

broletto(rng) {
  return { cielo: GIORNO, raggio: CALDO,
    statici(m) { piazza(m, 11, rng, P.cotto, P.tetto, 4); },
    dinamici(d, t) {
      /* Al centro della città un edificio con la loggia sotto per il mercato e
         la sala sopra per il consiglio: il potere diventa un edificio. */
      const f = (t * .12) % 1.3;
      const su = clamp01(f * 1.6);
      for (let i = 0; i < 5; i++) for (let y = 0; y < 4 * su; y++)
        d(-4 + i * 2, 1 + y, -2, .8, P.pietra);
      if (su > .7) for (let x = -5; x <= 5; x++) for (let z = -3; z <= 1; z++)
        d(x, 5.4, z, 1, P.pietraChiara);
      if (su > .85) for (let x = -5; x <= 5; x++) for (let y = 0; y < 3; y++)
        for (const z of [-3, 1]) d(x, 6.4 + y, z, 1, P.cotto);
      for (let i = 0; i < 10; i++) omino(d, -4 + (i % 5) * 2, 1.4, -.8, P.tela, P.pelle, .75);
      for (let i = 0; i < 6; i++) {
        if (su < .9) break;
        omino(d, -3 + i * 1.4, 7.4, -1, P.viola, P.pelle, .75);
      }
    } };
},

'lucca-seta'(rng) {
  return { cielo: CUPO, raggio: CALDO, ambiente: .6, fronte: FR,
    statici(m) { bottega(m, P.cotto); },
    dinamici(d, t) {
      /* Filatoi mossi dall'acqua e tessuti operati: la città diventa il primo
         centro serico d'Europa, finché i suoi maestri non emigrano. */
      const a = t * 1.2;
      for (let k = 0; k < 3; k++) {                                  // i filatoi che girano
        for (let i = 0; i < 8; i++) {
          const an = a + i / 8 * Math.PI * 2 + k;
          d(-5 + k * 5 + Math.cos(an) * 1.4, 4 + Math.sin(an) * 1.4, -4, .5, P.legno);
        }
      }
      const f = (t * .16) % 1.3;
      for (let i = 0; i < 12; i++) {                                 // le pezze che escono
        if (f < i / 14) continue;
        d(-5 + (i % 6) * 2, 2.4 + Math.floor(i / 6) * .6, -1, .9,
          [P.rosso, P.oro, P.viola, P.menta][i % 4]);
      }
      for (let i = 0; i < 5; i++) omino(d, -5 + i * 2.4, 1.4, 2, P.tela, P.pelle, .78);
    } };
},

cangrande(rng) {
  return { cielo: TRAMONTO, raggio: CALDO,
    statici(m) { piazza(m, 11, rng, P.cotto, P.tetto, 4); },
    dinamici(d, t) {
      /* Signore di Verona e mecenate di Dante: la sua statua equestre sorride
         sopra l'arca, cosa che nel Trecento non fa quasi nessuno. */
      const f = (t * .12) % 1.3;
      const citta = [[-8, -6], [-3, 4], [4, -5], [7, 5]];
      for (let i = 0; i < citta.length; i++) {
        const presa = f > (i + 1) / 5;
        d(citta[i][0], 2.4, citta[i][1], 1.4, presa ? P.oro : P.grigio);
        if (presa) bandiera(d, t, citta[i][0], 3.4, citta[i][1], 2, [P.oro, P.nero], i);
      }
      const st = clamp01((f - .6) * 2.4);
      for (let i = 0; i < 4; i++) d(-1.4 + i * .9, 4 + st * 2, 0, 1, P.marmo);
      d(1.8, 5 + st * 2, 0, .8, P.marmo);
      omino(d, .2, 5 + st * 2, 0, P.marmo, P.marmo, .9);
      folla(d, t, 0, 6, 10, 1.6, [P.tela, P.viola], 1.2);
    } };
},

'certosa-pavia'(rng) {
  return { cielo: GIORNO, raggio: CALDO, fronte: FR,
    statici(m) { suolo(m, 12, P.erba, P.terra, rng); },
    dinamici(d, t) {
      /* Un monastero fondato per custodire una tomba: la facciata diventerà un
         catalogo di marmi lungo un secolo e mezzo. */
      const f = (t * .1) % 1.4;
      const su = clamp01(f * 1.3);
      for (let x = -7; x <= 7; x++) for (let y = 0; y < 8 * su; y++)
        d(x, 1 + y, -6, 1, P.marmo);
      for (let k = 0; k < 4; k++) for (let x = -7 + k; x <= 7 - k; x++)
        if (su > .7) d(x, 9 + k, -6, .9, P.marmoOmbra);
      for (let r = 0; r < 4; r++) for (let c = 0; c < 12; c++) {     // gli intarsi, uno alla volta
        const i = r * 12 + c;
        const p = clamp01((f - (.5 + i / 100)) * 5);
        if (p <= 0) continue;
        const da = arrivo(d, p);
        da(-6.5 + c, 2.4 + r * 1.6, -5.4, .8, i % 3 ? P.marmoOmbra : P.rosso);
      }
      for (let i = 0; i < 8; i++) omino(d, -6 + i * 1.7, 1.4, 2, P.biancoIt, P.pelle, .75);
    } };
},

doria(rng) {
  return { cielo: GIORNO, raggio: CALDO,
    statici(m) { porto(m, 4, rng); for (let i = 0; i < 4; i++) casa(m, -10 + i * 6, 8, 4, 4, 5, P.cotto, P.tetto, 2); },
    dinamici(d, t) {
      /* Passa dalla Francia alla Spagna e dà alla città una costituzione
         oligarchica: Genova sceglie i soldi, non la sovranità. */
      const f = (t * .11) % 1;
      const cambio = f > .5;
      for (let k = 0; k < 4; k++)
        nave(d, t, -8 + k * 5, 1.2, -6, 1, 6, P.legno, cambio ? P.ruggine : P.blu, 3);
      for (let k = 0; k < 3; k++)
        bandiera(d, t, -6 + k * 6, 2, 6, 3, cambio ? [P.ruggine, P.oro] : [P.blu, P.oro], k);
      omino(d, 0, 2, 5, P.nero, P.pelle, 1);
      for (let i = 0; i < 8; i++) d(-5 + i * 1.4, 2.4, 9, .5, P.oro);
      onde(d, t, 12, 3, [12, 5]);
    } };
},

'malta-ordine'(rng) {
  return { cielo: GIORNO, raggio: CALDO,
    statici(m) { porto(m, 2, rng, P.sabbia); mura(m, -8, 4, 17, 7, 6, P.sabbia); },
    dinamici(d, t) {
      /* L'isola concessa per un falcone all'anno: diventerà la sentinella del
         canale di Sicilia. */
      const f = (t * .12) % 1.3;
      const falco = ((t * .5) % 1);
      d(-6 + falco * 12, 9 + Math.sin(falco * Math.PI) * 3, -2, .5, P.terraScura);
      for (let k = 0; k < 4; k++) {
        if (f < (k + 1) / 6) continue;
        bandiera(d, t, -6 + k * 4, 8.4, 4, 2, [P.rosso, P.biancoIt], k);
      }
      for (let i = 0; i < 10; i++) omino(d, -6 + i * 1.4, 8.4, 4, P.nero, P.pelle, .78);
      for (let k = 0; k < 3; k++) nave(d, t, -8 + k * 6, 1.2, -6, 1, 6, P.legno, P.rosso, 3);
      onde(d, t, 12, 3, [12, 10]);
    } };
},

'acqua-felice'(rng) {
  return { cielo: GIORNO, raggio: CALDO,
    statici(m) { piazza(m, 11, rng, P.cotto, P.tetto, 4); },
    dinamici(d, t) {
      /* Riattivato un acquedotto antico e aperte strade dritte fra le
         basiliche: la città medievale diventa la Roma dei pellegrini. */
      const f = (t * .11) % 1.3;
      for (let x = -11; x <= 11; x++) {                              // le arcate che arrivano
        if (f < (x + 11) / 30) continue;
        d(x, 6.4, -8, .9, P.pietraChiara);
        if (x % 3 === 0) for (let y = 0; y < 5; y++) d(x, 1.4 + y, -8, .8, P.pietraChiara);
      }
      const acqua = clamp01((f - .5) * 2.4);
      for (let i = 0; i < 10; i++) {
        if (acqua <= 0) break;
        const g = ((t * .8 + i * .1) % 1);
        d(0, 6 - g * 4, -7, .5, P.acquaChiara);
      }
      for (let i = 0; i < 8; i++) {
        if (acqua < .6) break;
        d(-2 + (i % 4), 1.6 + Math.sin(t * 2 + i) * .1, -5, 1.2, P.acquaChiara);
      }
      folla(d, t, 0, 3, 14, 1.8, [P.tela, P.nero], 1.2);
    } };
},

paoli(rng) {
  return { cielo: GIORNO, raggio: CALDO, fronte: FR,
    statici(m) { interno(m, 17, 7, 10, P.pietraChiara, P.legno); },
    dinamici(d, t) {
      /* Una costituzione con separazione dei poteri e voto alle donne
         capofamiglia: dura nove anni, poi l'isola viene venduta. */
      const f = (t * .11) % 1.3;
      pila(d, clamp01(f * 1.5), 12, -3.5, 2.4, -1, P.tela);
      for (let i = 0; i < 12; i++) {
        const donna = i % 3 === 0;
        omino(d, -7 + i * 1.3, 1.4, 3, donna ? P.viola : P.terraScura, P.pelle, .78);
        if (f > .6) d(-7 + i * 1.3, 3.2, 3, .3, P.tela);
      }
      const venduta = clamp01((f - .85) * 6);
      if (venduta > 0) for (let i = 0; i < 6; i++)
        d(-3 + i * 1.2, 4.4, -4, .5 * venduta, P.oro);
      omino(d, 0, 1.4, -3, P.blu, P.pelle, 1);
    } };
},

cispadana(rng) {
  return { cielo: GIORNO, raggio: CALDO, fronte: FR,
    statici(m) { interno(m, 19, 8, 11, P.tela, P.legno); },
    dinamici(d, t) {
      /* Il congresso adotta una bandiera verde, bianca e rossa: da lì in poi
         sarà quella. */
      const f = (t * .13) % 1.3;
      const colori = [P.verdeIt, P.biancoIt, P.rossoIt];
      for (let i = 0; i < 3; i++) {
        const arrivo = clamp01((f - i * .18) * 4);
        if (arrivo <= 0) continue;
        for (let k = 0; k < 4; k++)
          d(-1.4 + i * 1.4, 5 + k * .9, -4 + (1 - arrivo) * 4, 1.3, colori[i]);
      }
      for (let r = 0; r < 3; r++) for (let i = 0; i < 8; i++)
        omino(d, -7 + i * 2, 1.4 + r * .5, 1 + r * 1.6, P.viola, P.pelle, .78);
      for (let i = 0; i < 8; i++) {
        if (f < .9) break;
        const g = (t * .6 + i * .12) % 1;
        d(-3 + i * .9, 8 + g * 3, -4, .3 * (1 - g), colori[i % 3]);
      }
    } };
},

'repubblica-anconitana'(rng) {
  return { cielo: GIORNO, raggio: CALDO,
    statici(m) { piazza(m, 11, rng, P.cotto, P.tetto, 4); },
    dinamici(d, t) {
      /* In due anni mezza Italia si dà costituzioni scritte e alberi della
         libertà: dureranno pochissimo, ma l'idea resta. */
      const f = (t * .1) % 1.3;
      const alberi = [[-7, -5], [0, -6], [6, -4], [-5, 4], [4, 5]];
      for (let i = 0; i < alberi.length; i++) {
        const su = clamp01((f - i / 7) * 4);
        if (su <= 0) continue;
        const [x, z] = alberi[i];
        for (let y = 0; y < 5 * su; y++) d(x, 1 + y, z, .4, P.tronco);
        if (su > .8) {
          for (let k = 0; k < 3; k++) d(x + .8 + k * .7, 6, z, .7, [P.verdeIt, P.biancoIt, P.rossoIt][k]);
          d(x, 6.6, z, .5, P.rossoIt);
        }
      }
      folla(d, t, 0, 0, 18, 1.8, [P.viola, P.tela], 1.2);
      const fine = clamp01((f - 1) * 4);
      for (let i = 0; i < 8; i++) {
        if (fine <= 0) break;
        omino(d, -11 + fine * 8 + i * 1.4, 1.4, 8, P.biancoIt, P.pelle, .78);
      }
    } };
},

'giovine-italia'(rng) {
  return { cielo: CUPO, raggio: CALDO, ambiente: .55, fronte: FR,
    statici(m) { interno(m, 15, 6, 9, P.tela, P.legno, P.legno); },
    dinamici(d, t) {
      /* Fondata dall'esilio: le lettere partono verso l'Italia una dopo
         l'altra, e ogni insurrezione fallisce. Ma l'idea vince. */
      const f = (t * .12) % 1.3;
      omino(d, -4, 1.4, -1, P.nero, P.pelle, .95);
      for (let i = 0; i < 14; i++) {
        const p = ((f + i / 14) % 1);
        d(-3 + p * 12, 2.6 + Math.sin(p * Math.PI) * 2.4, -1 + (i % 3) - 1, .5, P.tela);
      }
      for (let i = 0; i < 10; i++) {
        if (f < .6) break;
        d(6, 2.4 + (i % 5) * .5, -4 + Math.floor(i / 5) * 1.4, .5, P.tela);
      }
      pila(d, clamp01(f * 1.4), 10, -6, 2.4, -3, P.tela, .7);
    } };
},

traforo(rng) {
  return { cielo: CUPO, nebbia: 0x2e3238, raggio: 0xd0c4a8, ambiente: .5,
    statici(m) { valle(m, 12, 3, 9, P.neve, P.pietraScura); },
    dinamici(d, t) {
      /* Tredici chilometri sotto le Alpi, scavati con perforatrici ad aria
         compressa inventate per l'occasione: l'Italia si attacca all'Europa. */
      const f = (t * .11) % 1.3;
      const avanz = clamp01(f * 1.4);
      /* Chi è ancora dentro la montagna non si disegna: le due squadre
         escono dalle imboccature, non dal vuoto oltre la piastra. */
      for (let i = 0; i < 10; i++) {
        const za = -12 + avanz * 11 - i * .9, zb = 12 - avanz * 11 + i * .9;
        if (za >= -12) omino(d, -1 + (i % 3), .8, za, P.terraScura, P.pelle, .75);
        if (zb <= 12) omino(d, -1 + (i % 3), .8, zb, P.terraScura, P.pelle, .75);
      }
      for (let k = 0; k < 3; k++) {                                  // le perforatrici
        d(-1 + k, 1.2, -12 + avanz * 11.6, .7, P.ferro);
        d(-1 + k, 1.2, 12 - avanz * 11.6, .7, P.ferro);
      }
      if (avanz > .95) for (let i = 0; i < 12; i++) {
        const g = (t * .8 + i * .08) % 1;
        d(0, .8 + g * 2.4, 0, .5 * (1 - g), P.oro);
      }
      for (let i = 0; i < 8; i++) {
        const g = (t * .4 + i * .12) % 1;
        d(-2 + (i % 4), 1 + g * 3, -10 + g * 3, .6 * (1 - g), P.fumo);
      }
    } };
},

olivetti(rng) {
  return { cielo: GIORNO, raggio: CALDO,
    statici(m) { suolo(m, 12, P.erba, P.terra, rng); fabbrica(m, -10, -7, 20, 7, 5, P.tela, 1); },
    dinamici(d, t) {
      /* Non solo macchine per scrivere: mensa, biblioteca, asili. Una fabbrica
         come esperimento sociale, premiata in tutto il mondo per il disegno. */
      const f = (t * .12) % 1.3;
      for (let k = 0; k < 4; k++) {
        const p = (f + k / 4) % 1, x = -9 + p * 18;
        d(x, 2.2, -3, .9, [P.rossoIt, P.acquaChiara, P.oro, P.biancoIt][k]);
        if (p > .5) d(x, 3, -3, .7, P.nero);
      }
      const servizi = [['mensa', -8], ['biblioteca', -2], ['asilo', 4]];
      for (let i = 0; i < 3; i++) {
        const su = clamp01((f - .3 - i * .12) * 4);
        if (su <= 0) continue;
        for (let y = 0; y < 3 * su; y++)
          for (let dx = 0; dx < 4; dx++) d(servizi[i][1] + dx, 1 + y, 7, 1, y === 2 ? P.tetto : P.marmo);
      }
      for (let i = 0; i < 10; i++) omino(d, -9 + i * 2, 2, 4, P.tela, P.pelle, .75);
    } };
},

ansaldo(rng) {
  return { cielo: CUPO, nebbia: 0x36383e, raggio: 0xd0c0a0, ambiente: .55,
    statici(m) { porto(m, 3, rng); fabbrica(m, -11, 5, 22, 7, 6, P.grigio, 4); },
    dinamici(d, t) {
      /* Cantieri, acciaierie, motori: il triangolo industriale prende forma, e
         dallo scalo escono navi grandi come isolati. */
      const f = (t * .09) % 1.3;
      const scafo = clamp01(f * 1.4);
      for (let i = 0; i < 14 * scafo; i++) d(-8 + i, 1.6, 0, 1.1, P.ferro);
      for (let i = 0; i < 8 * scafo; i++) d(-6 + i, 2.6, 0, .9, P.ferro);
      if (scafo > .9) {
        const varo = clamp01((f - .95) * 6);
        for (let i = 0; i < 14; i++) d(-8 + i, 1.6 - varo * .6, 0 - varo * 6, 1.1, P.ferro);
      }
      for (let k = 0; k < 4; k++) fuoco(d, t, -9 + k * 6, 13, 6, 5, .7, k * .2);
      for (let i = 0; i < 14; i++) omino(d, -10 + i * 1.6, 2, 4, P.divisa, P.pelle, .75);
      onde(d, t, 12, 3, [12, 4]);
    } };
},

bonifica(rng) {
  return { cielo: GIORNO, raggio: CALDO,
    statici(m) { suolo(m, 12, P.terraScura, P.terra, rng, .4); },
    dinamici(d, t) {
      /* Si prosciugano le paludi e sul terreno asciutto nascono città nuove,
         con coloni veneti e ferraresi. La malaria arretra. */
      const f = (t * .1) % 1.3;
      const asciutto = clamp01(f * 1.5);
      for (let x = -11; x <= 11; x += 2) for (let z = -11; z <= 11; z += 2)
        d(x, 1.2, z, 1.8 * (1 - asciutto), P.acqua);
      for (let z = -10; z <= 10; z += 5) for (let x = -11; x <= 11; x++) {
        if (asciutto < .3) break;
        d(x, 1.1, z, .9, P.acquaChiara);                             // i canali
      }
      borgo(d, t, clamp01((f - .5) * 2.2), [[-6, -6], [0, -6], [6, -6], [-3, 2], [3, 2]], P.tela, P.tetto);
      for (let i = 0; i < 10; i++) {
        if (asciutto < .6) break;
        omino(d, -9 + i * 2, 1.4, 8, P.terraScura, P.pelle, .75);
      }
    } };
},

iri(rng) {
  return { cielo: CUPO, raggio: CALDO, ambiente: .6, fronte: FR,
    statici(m) { interno(m, 19, 8, 11, P.marmo, P.marmoOmbra); },
    dinamici(d, t) {
      /* Per salvare le banche lo Stato si ritrova proprietario di mezza
         industria: l'ente sopravvivrà al regime che l'ha creato. */
      const f = (t * .12) % 1.3;
      const aziende = [[-6, P.grigio], [-3, P.ferro], [0, P.cotto], [3, P.divisa], [6, P.bronzo]];
      for (let i = 0; i < 5; i++) {
        const preso = f > (i + 1) / 7;
        const [x, c] = aziende[i];
        for (let y = 0; y < 3; y++) d(x, 2 + y, -3, 1, preso ? P.oro : c);
        if (preso) d(x, 5.4, -3, .5, P.oro);
      }
      pila(d, clamp01(f * 1.4), 14, -4, 2.4, 2, P.tela);
      omino(d, 5, 1.4, 2, P.nero, P.pelle, .95);
    } };
},

eur(rng) {
  return { cielo: GIORNO, raggio: CALDO,
    statici(m) { suolo(m, 12, P.pietraChiara, P.terra, rng); },
    dinamici(d, t) {
      /* Un quartiere costruito per un'esposizione che la guerra annulla:
         resterà il monumento più intatto dell'architettura del regime. */
      const f = (t * .11) % 1.3;
      const su = clamp01(f * 1.4);
      for (let r = 0; r < 6; r++) for (let c = 0; c < 6; c++) {      // il palazzo a griglia
        const i = r * 6 + c;
        const p = clamp01((su - (i / 40)) * 5);
        if (p <= 0) continue;
        const da = arrivo(d, p);
        for (const z of [-4, -1]) da(-5 + c * 2, 2 + r * 1.4, z, .9, P.marmo);
      }
      for (let x = -6; x <= 6; x += 2) for (let z = -4; z >= -5; z--) {
        if (su < .8) break;
        d(x, 1.2, z + 6, .9, P.marmoOmbra);
      }
      for (let i = 0; i < 6; i++) {
        if (su < .9) break;
        d(-5 + i * 2, 10.4, -2.5, .9, P.marmoOmbra);
      }
      for (let i = 0; i < 8; i++) omino(d, -7 + i * 2, 1.4, 6, P.tela, P.pelle, .75);
    } };
},

'repubblica-ossola'(rng) {
  return { cielo: GIORNO, raggio: CALDO,
    statici(m) { valle(m, 12, 5, 7, P.neve, P.erbaScura); for (let i = 0; i < 4; i++) casa(m, -3 + i * 2, -6 + i * 4, 3, 3, 3, P.tela, P.tetto, 1); },
    dinamici(d, t) {
      /* Quaranta giorni di valle libera: si riaprono le scuole e si stampano
         francobolli. Una delle quindici repubbliche partigiane. */
      const f = (t * .11) % 1.3;
      for (let k = 0; k < 4; k++) {
        const su = clamp01((f - k * .12) * 4);
        if (su <= 0) continue;
        bandiera(d, t, -4 + k * 3, 4, -6 + k * 4, 2, [P.verdeIt, P.biancoIt, P.rossoIt], k);
      }
      for (let i = 0; i < 10; i++) {
        if (f < .4) break;
        omino(d, -6 + i * 1.4, 1.4, 4, i % 3 ? P.tela : P.terraScura, P.pelle, .7);
      }
      for (let i = 0; i < 8; i++) {                                  // i francobolli stampati
        if (f < .7) break;
        d(-3 + (i % 4) * .9, 2.4 + Math.floor(i / 4) * .5, 7, .5, P.oro);
      }
      for (let i = 0; i < 14; i++) omino(d, Math.cos(i * .45) * 8, 1.4, Math.sin(i * .45) * 8, P.terraScura, P.pelle, .72);
    } };
},

costituzione(rng) {
  return { cielo: GIORNO, raggio: CALDO, fronte: FR,
    statici(m) { interno(m, 19, 9, 11, P.marmo, P.marmoOmbra); },
    dinamici(d, t) {
      /* Scritta insieme da chi non aveva la maggioranza da solo: i banchi di
         colori diversi convergono sullo stesso foglio. */
      const f = (t * .12) % 1.3;
      const gruppi = [[P.biancoIt, -6], [P.rossoIt, -2], [P.viola, 2], [P.blu, 6]];
      for (let g = 0; g < 4; g++) for (let i = 0; i < 5; i++)
        omino(d, gruppi[g][1] + (i % 3) - 1, 1.4 + Math.floor(i / 3) * .5, 3 + Math.floor(i / 3) * 1.4,
          gruppi[g][0], P.pelle, .78);
      for (let g = 0; g < 4; g++) {
        const arrivo = clamp01((f - g * .12) * 3);
        if (arrivo <= 0) continue;
        d(gruppi[g][1] * (1 - arrivo), 3.4, 2 - arrivo * 4, .6, gruppi[g][0]);
      }
      const carta = clamp01((f - .6) * 2.4);
      d(0, 3.4, -2, 1.6 * carta, P.tela);
      for (let i = 0; i < 10; i++) {
        if (carta < .8) break;
        d(-2.5 + i * .55, 3.6, -2, .3, P.nero);
      }
    } };
},

eni(rng) {
  return { cielo: CUPO, raggio: FUOCO, ambiente: .6,
    statici(m) { suolo(m, 12, P.erbaScura, P.terra, rng, .6); },
    dinamici(d, t) {
      /* Doveva liquidare l'azienda di Stato, invece ci trova il metano padano e
         costruisce un gruppo che tratta da pari con le sette sorelle. */
      const f = (t * .11) % 1.3;
      const su = clamp01(f * 1.6);
      for (let y = 0; y < 10 * su; y++)                              // la torre di perforazione
        for (const [dx, dz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]])
          d(dx * (1.4 - y * .08), 1 + y, dz * (1.4 - y * .08), .35, P.ferro);
      if (su > .8) {
        for (let i = 0; i < 10; i++) {
          const g = (t * 1.2 + i * .1) % 1;
          d(0, 11 + g * 3, 0, .6 * (1 - g), g < .4 ? P.brace : P.fumo);
        }
      }
      for (let i = 0; i < 6; i++) omino(d, -6 + i * 2.4, 1.4, 6, P.divisa, P.pelle, .78);
      for (let i = 0; i < 6; i++) {                                  // i distributori, dopo
        if (f < .8) break;
        d(-8 + i * 3, 1.6, 9, .8, P.oro);
        d(-8 + i * 3, 2.4, 9, .6, P.nero);
      }
    } };
},

'trattati-roma'(rng) {
  return { cielo: GIORNO, raggio: CALDO, fronte: FR,
    statici(m) { interno(m, 19, 9, 11, P.marmo, P.marmoOmbra); },
    dinamici(d0, t) {
      /* Sei fondatori attorno allo stesso tavolo in Campidoglio: da lì nasce il
         mercato in cui l'Italia farà il suo boom. */
      const f = (t * .13) % 1.3;
      const d = dissolvenza(d0, f, 1.3);   // il ciclo si ritira invece di spegnersi
      for (let i = 0; i < 6; i++) {
        const a = Math.PI + i / 6 * Math.PI;
        omino(d, Math.cos(a) * 4.4, 1.4, -1 + Math.sin(a) * 3, P.viola, P.pelle, .85);
        if (f > (i + 1) / 8) d(Math.cos(a) * 3.4, 2.6, -1 + Math.sin(a) * 2.4, .5, P.oro);
      }
      d(0, 2.4, -1, 1.6, P.tela);
      for (let i = 0; i < 12; i++) {                                 // le stelle in cerchio
        if (f < .8) break;
        const a = i / 12 * Math.PI * 2 + t * .12;
        d(Math.cos(a) * 3, 6.4, -1 + Math.sin(a) * 3, .4, P.oro);
      }
    } };
},

'autostrada-serenissima'(rng) {
  return { cielo: GIORNO, raggio: CALDO,
    statici(m) { suolo(m, 12, P.erba, P.terra, rng, .8); },
    dinamici(d, t) {
      /* In un decennio si costruisce più rete autostradale che in tutto il
         resto d'Europa: il nastro avanza e dietro passano le auto. */
      const f = (t * .12) % 1.3;
      const avanz = clamp01(f * 1.4);
      for (let x = -12; x <= -12 + avanz * 24; x++) {
        for (let z = -2; z <= 2; z++) d(x, 1.2, z, .9, P.grigio);
        if (x % 3 === 0) d(x, 1.4, 0, .5, P.biancoIt);
      }
      for (let i = 0; i < 6; i++) {                                  // i mezzi del cantiere, in testa al nastro
        const mx = -12 + avanz * 24 + i * .8;
        if (mx > 12) continue;
        d(mx, 1.8, -1 + (i % 3), .8, P.oro);
      }
      for (let i = 0; i < 8; i++) {
        if (avanz < .5) break;
        const p = ((t * 4 + i * 3) % 24) - 12;
        if (p > -12 + avanz * 24) continue;
        d(p, 1.8, i % 2 ? 1 : -1, .9, [P.rossoIt, P.biancoIt, P.blu][i % 3]);
      }      // (nessun albero dinamico)
    } };
},

regioni(rng) {
  return { cielo: GIORNO, raggio: CALDO,
    statici(m) { suolo(m, 12, P.pietraChiara, P.pietra, rng); m.box(-11, 1, -11, 23, 1, 23, P.marmoOmbra); },
    dinamici(d, t) {
      /* A ventidue anni dalla Costituzione si votano finalmente i consigli:
         sanità e trasporti passano al territorio, e la carta si divide. */
      const f = (t * .12) % 1.3;
      const linee = [[-8, -11, -8, 11], [-2, -11, -2, 11], [4, -11, 4, 11],
                     [-11, -7, 11, -7], [-11, -1, 11, -1], [-11, 5, 11, 5],
                     [-8, 2, 4, 2], [-2, -4, 11, -4]];
      for (let i = 0; i < linee.length; i++) {
        const arrivo = clamp01((f - i / 10) * 8);
        if (arrivo <= 0) continue;
        const [x1, z1, x2, z2] = linee[i];
        const n = Math.max(Math.abs(x2 - x1), Math.abs(z2 - z1));
        for (let k = 0; k <= n; k++)
          d(x1 + (x2 - x1) * k / n, 2.2 + (1 - arrivo) * 4, z1 + (z2 - z1) * k / n, .8, P.oro);
      }
      for (let i = 0; i < 12; i++) {
        if (f < i / 14 + .2) continue;
        d(-9 + (i % 4) * 6, 2.8, -8 + Math.floor(i / 4) * 6, .8, [P.rossoIt, P.blu, P.verdeIt][i % 3]);
      }
    } };
},

'servizio-sanitario'(rng) {
  return { cielo: GIORNO, raggio: CALDO, fronte: FR,
    statici(m) { interno(m, 19, 7, 11, P.biancoIt, P.marmoOmbra); },
    dinamici(d, t) {
      /* Cure garantite in base al bisogno e non ai contributi versati: la fila
         entra tutta uguale, e nessuno mostra la tessera. */
      const f = (t * .14) % 1.3;
      for (let i = 0; i < 16; i++) {
        const p = ((f + i / 16) % 1);
        omino(d, -8 + p * 16, 1.4, 4 - (p > .4 && p < .7 ? 3 : 0),
          [P.tela, P.viola, P.terraScura, P.blu][i % 4], P.pelle, .78);
      }
      for (let i = 0; i < 5; i++) d(-6 + i * 3, 2.4, -3, 1.1, P.biancoIt);   // i letti
      for (let i = 0; i < 5; i++) omino(d, -6 + i * 3, 1.4, -1, P.biancoIt, P.pelle, .8);
      const croce = clamp01(f * 1.4);
      for (let i = 0; i < 3; i++) {
        d(0, 5 + i * .7, -6.4, .8 * croce, P.rossoIt);
        if (i === 1) { d(-.8, 5.7, -6.4, .8 * croce, P.rossoIt); d(.8, 5.7, -6.4, .8 * croce, P.rossoIt); }
      }
    } };
},

/* ==================== scoperte ==================== */

'lago-bracciano'(rng) {
  return { cielo: 0x16324a, nebbia: 0x1e4058, raggio: 0x9fd0ff, ambiente: .6,
    statici(m) {
      for (let x = -12; x <= 12; x++) for (let z = -12; z <= 12; z++) { m.p(x, 0, z, P.terraScura); m.p(x, -1, z, P.terra); }
    },
    dinamici(d, t) {
      /* Sul fondo del lago si conservano capanne neolitiche e la piroga più
         antica del Mediterraneo, lunga quasi undici metri. */
      const f = (t * .12) % 1.3;
      const scoperta = clamp01(f * 1.4);
      for (let i = 0; i < 11; i++) d(-5 + i, 1.2, 2, .9 * scoperta, P.tronco);
      for (let i = 0; i < 4; i++) {
        const su = clamp01((f - i * .1) * 4);
        if (su <= 0) continue;
        const x = -7 + i * 4;
        for (const [dx, dz] of [[0, 0], [2, 0], [0, 2], [2, 2]]) d(x + dx, 1.2, -4 + dz, .5, P.tronco);
        d(x + 1, 2.2, -3, 1.4 * su, P.legno);
      }
      for (let i = 0; i < 22; i++) {                                 // sospensione nell'acqua
        const g = (t * .18 + i * .04) % 1;
        d(((i * 6151) % 23) - 11, 1 + g * 9, ((i * 3571) % 23) - 11, .35, P.acquaChiara);
      }
      omino(d, 7, 1.4, 6, P.nero, P.pelle, .85);
    } };
},

'cesare-calendario'(rng) {
  return { cielo: NOTTE, raggio: 0xbcd0f0, ambiente: .5, fronte: FR,
    statici(m) { interno(m, 17, 8, 10, P.marmo, P.marmoOmbra); },
    dinamici(d0, t) {
      /* Trecentosessantacinque giorni più il bisestile: reggerà sedici secoli,
         sbagliando undici minuti l'anno. */
      const f = (t * .13) % 1.3;
      const d = dissolvenza(d0, f, 1.3);   // il ciclo si ritira invece di spegnersi
      for (let i = 0; i < 12; i++) {                                 // i dodici mesi
        const p = clamp01((f - (i / 14)) * 5);
        if (p <= 0) continue;
        const da = arrivo(d, p);
        const a = i / 12 * Math.PI * 2;
        da(Math.cos(a) * 3.4, 5 + Math.sin(a) * 2.4, -3, .8, i % 2 ? P.oro : P.marmoOmbra);
      }
      if (f > .9) d(Math.cos(Math.PI / 3) * 4.4, 5 + Math.sin(Math.PI / 3) * 3.2, -3, .5, P.rosso);
      omino(d, -4, 1.4, 1, P.viola, P.pelle, .95);
      omino(d, 3, 1.4, 1, P.tela, P.pelle, .9);
      stelle(d, 14, 7, 10);
    } };
},

'ruggero-idrisi'(rng) {
  return { cielo: CUPO, raggio: CALDO, ambiente: .6, fronte: FR,
    statici(m) { interno(m, 19, 8, 11, P.marmo, P.legno); },
    dinamici(d, t) {
      /* Quindici anni di lavoro per un planisfero d'argento e la descrizione
         più accurata del mondo allora nota. */
      const f = (t * .11) % 1.3;
      for (let r = 0; r < 5; r++) for (let c = 0; c < 12; c++) {
        const i = r * 12 + c;
        const p = clamp01((f - (i / 70)) * 5);
        if (p <= 0) continue;
        const da = arrivo(d, p);
        da(-6.5 + c, 2.4 + r * .9, -2, .85, (c + r) % 4 === 0 ? P.acqua : P.sabbia);
      }
      omino(d, -6, 1.4, 3, P.verdeIt, P.pelle, .9);
      omino(d, 6, 1.4, 3, P.oro, P.pelle, .95);
      for (let i = 0; i < 8; i++) {
        if (f < .9) break;
        d(-3 + i * .9, 7.4, -2, .5, P.marmo);                        // il disco d'argento
      }
    } };
},

'amalfi-bussola'(rng) {
  return { cielo: NOTTE, nebbia: 0x1c2a3c, raggio: 0x9fb8e0, ambiente: .45,
    statici(m) { for (let x = -12; x <= 12; x++) for (let z = -12; z <= 12; z++) m.p(x, 0, z, P.mare); },
    dinamici(d, t) {
      /* L'ago si ferma sempre nella stessa direzione: navigare senza vedere le
         stelle diventa possibile, e l'inverno smette di chiudere i porti. */
      const t2 = (t * .3) % 1;
      const oscilla = Math.sin(t * 4) * Math.exp(-t2 * 5);
      for (let i = 0; i < 7; i++)
        d(Math.sin(oscilla) * (i - 3) * .8, 5, Math.cos(oscilla) * (i - 3) * .8, .55,
          i < 3 ? P.rosso : P.ferro);
      for (let i = 0; i < 12; i++) {                                 // la rosa dei venti
        const a = i / 12 * Math.PI * 2;
        d(Math.cos(a) * 4, 4.4, Math.sin(a) * 4, .35, i % 3 ? P.marmo : P.oro);
      }
      nave(d, t, -9 + ((t * .8) % 18), 1.2, 7, 1, 6, P.legno, P.tela, 0);
      onde(d, t, 12, 3, [5, 5]);
      stelle(d, 10, 9, 11);
    } };
},

'stampa-italia'(rng) {
  return { cielo: CUPO, raggio: CALDO, ambiente: .6, fronte: FR,
    statici(m) { bottega(m, P.pietraChiara); },
    dinamici(d, t) {
      /* Due tedeschi impiantano un torchio in un monastero: in vent'anni
         Venezia sarà la capitale europea del libro. */
      const f = (t * .5) % 1;
      const giu = f < .3 ? Math.sin(f / .3 * Math.PI) : 0;
      d(0, 5 - giu * 1.4, -1, 1.4, P.tronco);
      for (let y = 0; y < 3; y++) d(0, 2 + y, -1, 1.2, P.legno);
      const fp = (t * .16) % 1.3;                        // il ciclo della pila, più lento del torchio
      pila(dissolvenza(d, fp, 1.3), fp / 1.3, 16, -5, 2.4, 1, P.tela, .8);
      omino(d, -4, 1.4, 3, P.nero, P.pelle, .85);
      omino(d, 4, 1.4, 3, P.nero, P.pelle, .85);
      for (let i = 0; i < 8; i++) d(5, 2.4 + (i % 4) * .5, -3 + Math.floor(i / 4) * 1.4, .5, P.cotto);
    } };
},

pacioli(rng) {
  return { cielo: CUPO, raggio: CALDO, ambiente: .6, fronte: FR,
    statici(m) { bottega(m); },
    dinamici(d0, t) {
      /* Dare e avere, due colonne che devono chiudere uguali: il metodo
         veneziano messo a stampa, e ancora in uso oggi. */
      const f = (t * .16) % 1.3;
      const d = dissolvenza(d0, f, 1.3);   // il ciclo si ritira invece di spegnersi
      const righe = Math.floor((f / 1.3) * 10);
      for (let i = 0; i < righe; i++) {
        d(-2.5, 2.6 + i * .45, -1, .7, P.oro);
        d(2.5, 2.6 + i * .45, -1, .7, P.acquaChiara);
      }
      for (let y = 0; y < 6; y++) d(0, 2.6 + y * .45, -1, .3, P.nero);
      if (righe >= 10) for (let i = 0; i < 6; i++) {
        const g = (t * .8 + i * .17) % 1;
        d(0, 7.4 + g * 2, -1, .35 * (1 - g), P.oro);
      }
      omino(d, -5, 1.4, 2, P.nero, P.pelle, .9);
      for (let i = 0; i < 5; i++) d(4 + (i % 3) * .6, 2.4, 2, .45, P.tela);
    } };
},

gregoriano(rng) {
  return { cielo: NOTTE, raggio: 0xbcd0f0, ambiente: .5, fronte: FR,
    statici(m) { interno(m, 17, 9, 10, P.marmo, P.marmoOmbra); },
    dinamici(d, t) {
      /* Per rimettere in riga l'equinozio si cancellano dieci giorni: al 4
         ottobre segue il 15, e nessuno se ne accorge davvero. */
      const f = (t * .16) % 1.3;
      const tolti = clamp01((f - .4) * 3);
      for (let i = 0; i < 31; i++) {
        const saltato = i >= 4 && i < 14;
        if (saltato && tolti > .5) continue;
        const x = -6.5 + (i % 8) * 1.7, y = 6 - Math.floor(i / 8) * 1.2;
        d(x, y, -3, .8 * (saltato ? 1 - tolti : 1), saltato ? P.rosso : P.marmo);
      }
      omino(d, -5, 1.4, 2, P.biancoIt, P.pelle, .95);
      omino(d, 5, 1.4, 2, P.viola, P.pelle, .9);
      stelle(d, 12, 8, 11);
    } };
},

'accademia-cimento'(rng) {
  return { cielo: CUPO, raggio: CALDO, ambiente: .6, fronte: FR,
    statici(m) { bottega(m); },
    dinamici(d, t) {
      /* Provando e riprovando: termometri e barometri costruiti da loro, e
         ogni risultato verificato più volte prima di scriverlo. */
      const f = (t * .2) % 1.3;
      for (let k = 0; k < 4; k++) {                                  // gli strumenti sul banco
        const prova = ((f * 3 + k * .25) % 1);
        for (let y = 0; y < 4; y++) d(-4.5 + k * 3, 2.6 + y * .5, -1, .4, P.acquaChiara);
        d(-4.5 + k * 3, 2.6 + prova * 1.6, -1, .5, P.rosso);
      }
      for (let i = 0; i < 5; i++) omino(d, -5 + i * 2.4, 1.4, 2, P.viola, P.pelle, .78);
      pila(d, clamp01(f), 10, 4, 2.4, -3, P.tela, .7);
    } };
},

malpighi(rng) {
  return { cielo: CUPO, raggio: CALDO, ambiente: .6, fronte: FR,
    statici(m) { bottega(m); },
    dinamici(d0, t) {
      /* Al microscopio, nel polmone di una rana, i vasi che collegano arterie e
         vene: l'anello mancante della circolazione. */
      const f = (t * .13) % 1.3;
      const d = dissolvenza(d0, f, 1.3);   // il ciclo si ritira invece di spegnersi
      for (let y = 0; y < 5; y++) d(0, 2.6 + y * .5, -1, .5, P.bronzo);
      const visto = clamp01((f - .35) * 2.4);
      for (let i = 0; i < 16; i++) {                                 // la rete dei capillari
        const p = clamp01((visto - (i / 20)) * 5);
        if (p <= 0) continue;
        const da = arrivo(d, p);
        const a = i * 2.399;
        da(Math.cos(a) * (1 + (i % 5) * .5), 7 + Math.sin(a) * (1 + (i % 5) * .4), -1,
          .35, i % 3 ? P.rosso : P.blu);
      }
      omino(d, -4, 1.4, 2, P.nero, P.pelle, .9);
      d(3, 2.5, -1, .6, P.erbaScura);
    } };
},

cassini(rng) {
  return { cielo: CUPO, raggio: CALDO, ambiente: .55, fronte: FR,
    statici(m) { interno(m, 19, 11, 11, P.pietraChiara, P.marmoOmbra); },
    dinamici(d, t) {
      /* Una linea di ottone lunga sessantasei metri sul pavimento della
         basilica: il Sole la percorre meglio di qualsiasi strumento. */
      const f = (t * .13) % 1.3;
      for (let z = -6; z <= 4; z++) d(0, 1.2, z, .8, P.bronzo);
      const p = (t * .12) % 1;
      d(0, 1.4, -6 + p * 10, 1.2, P.oro);                            // il disco di luce
      for (let i = 0; i < 10; i++) {
        const q = i / 10;
        d(0 + (1 - q) * 2, 10 - q * 8.6, -8 + q * (2 + p * 10), 1 - q * .5, P.oro);
      }
      for (let i = 0; i < 12; i++) {                                 // le tacche dei giorni
        if (f < i / 14) continue;
        d(.8, 1.2, -6 + i * .9, .4, P.marmo);
      }
      omino(d, -4, 1.4, 2, P.nero, P.pelle, .9);
    } };
},

spallanzani(rng) {
  return { cielo: CUPO, raggio: CALDO, ambiente: .6, fronte: FR,
    statici(m) { bottega(m); },
    dinamici(d0, t) {
      /* Brodi bolliti e sigillati: da quelli non nasce niente, dagli altri sì.
         Dal nulla non nasce nulla. */
      const f = (t * .16) % 1.3;
      const d = dissolvenza(d0, f, 1.3);   // il ciclo si ritira invece di spegnersi
      for (let k = 0; k < 2; k++) {
        const sigillato = k === 0;
        for (let y = 0; y < 3; y++) d(-2.5 + k * 5, 2.6 + y * .5, -1, .7, P.acquaChiara);
        if (sigillato) d(-2.5, 4.4, -1, .7, P.tela);
        if (!sigillato && f > .5) for (let i = 0; i < 6; i++) {
          const g = ((t * .8 + i * .17) % 1);
          d(2.5 + Math.sin(i * 2) * .4, 3 + g * 1.6, -1, .25 * (1 - g), P.foglie);
        }
      }
      for (let i = 0; i < 6; i++) {                                  // i pipistrelli, l'altro studio
        if (f < .8) break;
        const a = t * 1.2 + i * 1.05;
        d(Math.cos(a) * 4, 7 + Math.sin(a * 2) * 1.2, -3 + Math.sin(a) * 2, .35, P.nero);
      }
      omino(d, -5, 1.4, 2, P.nero, P.pelle, .9);
    } };
},

fermi(rng) {
  return { cielo: CUPO, raggio: CALDO, ambiente: .55, fronte: FR,
    statici(m) { interno(m, 17, 8, 10, P.pietraChiara, P.legno); },
    dinamici(d, t) {
      /* Rallentare i neutroni con la paraffina: una scoperta fatta quasi per
         caso, e poi il Nobel e il viaggio senza ritorno. */
      const f = (t * .11) % 1.3;
      const rallenta = clamp01((f - .3) * 2.4);
      for (let i = 0; i < 10; i++) {
        const g = ((t * (rallenta > .5 ? .4 : 1.6) + i * .1) % 1);
        d(-6 + g * 12, 4, -2, .4, P.oro);
      }
      if (rallenta > .3) for (let y = 0; y < 3; y++) d(0, 3.4 + y * .5, -2, 1.2, P.tela);
      for (let i = 0; i < 5; i++) omino(d, -5 + i * 2.4, 1.4, 2, P.nero, P.pelle, .8);
      const via = clamp01((f - .85) * 6);
      if (via > 0) omino(d, 3 + via * 6, 1.4, 5, P.tela, P.pelle, .9);
    } };
},

cinquecento(rng) {
  return { cielo: GIORNO, raggio: CALDO,
    statici(m) { suolo(m, 12, P.pietraChiara, P.terra, rng); for (let x = -12; x <= 12; x++) for (let z = -2; z <= 2; z++) m.p(x, 1, z, P.grigio); },
    dinamici(d, t) {
      /* Tre metri, due cilindri, prezzo alla portata di un operaio con le rate:
         l'Italia diventa un paese motorizzato. */
      const f = (t * .13) % 1.3;
      const colori = [P.acquaChiara, P.tela, P.rossoIt, P.oro, P.verdeIt, P.biancoIt];
      const quante = 1 + Math.floor(clamp01(f * 1.4) * 7);
      for (let i = 0; i < quante; i++) {
        const x = ((t * 3 + i * 3.4) % 26) - 13;
        d(x, 2.2, -1 + (i % 2) * 2, .9, colori[i % colori.length]);
        d(x + .3, 3, -1 + (i % 2) * 2, .7, colori[i % colori.length]);
        d(x - .6, 1.6, -1 + (i % 2) * 2, .4, P.nero);
      }
      for (let i = 0; i < 10; i++) omino(d, -9 + i * 2, 1.4, 6, P.tela, P.pelle, .75);
    } };
},

'olivetti-elea'(rng) {
  return { cielo: CUPO, raggio: CALDO, ambiente: .6, fronte: FR,
    statici(m) { interno(m, 19, 7, 11, P.biancoIt, P.marmoOmbra); },
    dinamici(d0, t) {
      /* Il primo calcolatore interamente a transistor progettato e prodotto in
         Italia, e disegnato come un mobile. Poi si lasciò perdere. */
      const f = (t * .13) % 1.3;
      const d = dissolvenza(d0, f, 1.3);   // il ciclo si ritira invece di spegnersi
      for (let k = 0; k < 5; k++) {
        const su = clamp01((f - k * .1) * 4);
        if (su <= 0) continue;
        const da = arrivo(d, su);
        for (let y = 0; y < 4 * su; y++)
          for (let dx = 0; dx < 2; dx++) da(-7 + k * 3.4 + dx, 1 + y, -3, 1, P.grigio);
      }
      for (let i = 0; i < 14; i++) {                                 // le lucine che corrono
        if (f < .6) break;
        const acceso = ((t * 3 + i) % 4) < 2;
        d(-7 + (i % 5) * 3.4 + (i % 2), 3.4 + Math.floor(i / 5) * .6, -2.4, .3,
          acceso ? P.oro : P.nero);
      }
      omino(d, 4, 1.4, 1, P.tela, P.pelle, .9);
      for (let i = 0; i < 4; i++) d(4, 2.4, -.5 + i * .3, .4, P.tela);
    } };
},

'internet-italia'(rng) {
  return { cielo: NOTTE, raggio: 0x9fc0e0, ambiente: .5, fronte: FR,
    statici(m) { interno(m, 19, 7, 11, P.pietraChiara, P.marmoOmbra); },
    dinamici(d0, t) {
      /* Il 30 aprile parte il primo pacchetto verso la rete americana: l'Italia
         è il quarto paese europeo a collegarsi. */
      const f = (t * .16) % 1.3;
      const d = dissolvenza(d0, f, 1.3);   // il ciclo si ritira invece di spegnersi
      for (let k = 0; k < 3; k++)
        for (let y = 0; y < 4; y++) d(-6 + k * 3, 1 + y, -3, 1, P.grigio);
      const p = (f / 1.3);
      for (let i = 0; i < 12; i++) {                                 // il pacchetto che parte
        const q = clamp01(p * 1.4 - i * .05);
        if (q <= 0) continue;
        d(-4 + q * 14, 4 + Math.sin(q * Math.PI) * 3, -3 + q * 4, .4 * (1 - q * .5), P.oro);
      }
      if (p > .9) for (let i = 0; i < 8; i++) {
        const g = (t * .8 + i * .12) % 1;
        d(8, 5 + g * 3, 2, .35 * (1 - g), P.acquaChiara);
      }
      omino(d, -2, 1.4, 2, P.tela, P.pelle, .9);
      stelle(d, 10, 8, 9);
    } };
},

/* ==================== viaggi ==================== */

'restituzioni-canova'(rng) {
  return { cielo: GIORNO, raggio: CALDO,
    statici(m) { suolo(m, 12, P.erba, P.terra, rng, .6); for (let x = -12; x <= 12; x++) m.p(x, 1, 0, P.sabbia); },
    dinamici(d, t) {
      /* Centinaia di quadri e statue tornano indietro su carri: non tutto,
         però — molte opere restano al Louvre ancora oggi. */
      const f = (t * .1) % 1.3;
      for (let k = 0; k < 5; k++) {
        const p = ((f + k / 5) % 1);
        const x = -10.5 + p * 21;                                    // il carro col cavallo davanti resta sulla strada
        for (let i = 0; i < 4; i++) d(x + (i % 2) * 1.2, 2.2, Math.floor(i / 2) * 1.1, 1, P.legno);
        d(x + .5, 3.2, .5, .9, k % 2 ? P.marmo : P.oro);
        d(x - 1.4, 2, .5, .9, P.terraScura);
      }
      omino(d, -8, 2, 2.4, P.viola, P.pelle, .9);
      for (let i = 0; i < 6; i++) {                                  // quelle che restano indietro
        if (f < .6) break;
        d(-12 + i * .8, 2.2, -4, .7, P.marmo);
      }
    } };
},

'emigrazione-interna'(rng) {
  return { cielo: CUPO, nebbia: 0x36383e, raggio: 0xd0c8b4, ambiente: .55,
    statici(m) {
      suolo(m, 12, P.erbaScura, P.terra, rng, .6);
      for (let x = -12; x <= 12; x++) for (let z = -1; z <= 1; z++) m.p(x, 1, z, P.tronco);
      fabbrica(m, 4, -9, 8, 6, 6, P.cotto, 2);
      for (let i = 0; i < 3; i++) casa(m, -11 + i * 2, 6 + i, 3, 3, 2, P.sabbia, P.tetto, 1);
    },
    dinamici(d, t) {
      /* Nove milioni cambiano regione in vent'anni: il treno parte pieno da
         sud e arriva pieno a nord, e Torino diventa una città meridionale. */
      const f = (t * .09) % 1;
      /* Il treno del Sud è lungo nove blocchi: entra ed esce, e quel che è
         ancora fuori dalla piastra non si disegna. */
      const rot = (bx, y, z, s, c) => { if (bx >= -12 && bx <= 12) d(bx, y, z, s, c); };
      const x = -13 + f * 26;
      rot(x, 2.2, 0, 1.2, P.nero);
      for (let k = 0; k < 4; k++) {
        rot(x + 2 + k * 2.2, 2.2, 0, 1.1, P.grigioverde);
        for (let i = 0; i < 3; i++) {
          const px = x + 2 + k * 2.2;
          if (px >= -12 && px <= 12) omino(d, px, 3, 0, P.tela, P.pelle, .5);
        }
      }
      for (let i = 0; i < 10; i++) {
        const g = (t * 1.2 + i * .1) % 1;
        rot(x - .6, 4 + g * 3, Math.sin(t * 2 + i) * .4, .7 * (1 - g), P.fumo);
      }
      for (let i = 0; i < 8; i++) omino(d, -10 + i * .9, 1.6, 3, P.terraScura, P.pelle, .72);
      for (let k = 0; k < 2; k++) fuoco(d, t, 5 + k * 4, 12, -8, 4, .6, k * .3);
    } };
},

});

})();
