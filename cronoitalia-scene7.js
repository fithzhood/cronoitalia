'use strict';

/* Scene firma, settimo e ultimo volume: la Repubblica e i disastri.
 *
 * Le scene di lutto vanno tenute sobrie: niente corpi, niente sangue, niente
 * spettacolo. Si mostra quello che resta — una piazza vuota, un orologio
 * fermo, dei lenzuoli, una casa puntellata — e si lascia che sia la scheda a
 * dire il resto.
 */

(() => {

const P = VoxScena.P;
const { suolo, albero, casa, omino, clamp01, dissolvenza, arrivo, tempio, cattedrale, torre, mura,
        nave, folla, fuoco, bandiera, stelle, onde, fabbrica, ponte,
        interno, piazza, campo, porto, teatro, bottega, collina, valle } = VoxScena.kit;

const NOTTE = 0x14203a, GIORNO = 0x24344c, TRAMONTO = 0x2e2c3e, CUPO = 0x1c1f28;
const CALDO = 0xffe6b4, FREDDO = 0xd6e4ff, FUOCO = 0xffb478;
const FR = Math.PI / 2;

// un abitato che trema e poi cede: il gesto comune ai terremoti
function crolla(d, t, f, posti, inizio, cMuro, cTetto) {
  const scossa = f < inizio ? Math.sin(t * 26) * .3 * (1 - f / inizio) : 0;
  const giu = clamp01((f - inizio) * 3.5);
  for (let i = 0; i < posti.length; i++) {
    const [x, z] = posti[i];
    const alt = 3 + ((i * 29) % 3);
    const h = alt * (1 - giu * (.5 + ((i * 37) % 10) / 20));
    for (let y = 0; y < h; y++)
      for (let dx = 0; dx < 3; dx++) for (let dz = 0; dz < 3; dz++) {
        if (dx === 1 && dz === 1 && y < h - 1) continue;
        d(x + dx + scossa, 1 + y, z + dz, 1, y === Math.floor(h) - 1 ? (cTetto || P.tetto) : (cMuro || P.tela));
      }
    if (giu > .1) for (let k = 0; k < 3; k++)
      d(x + ((k * 53) % 4) - 1, 1 + giu * 1.6, z + ((k * 71) % 4) - 1, .8, P.polvere);
  }
  return giu;
}

// i soccorsi che arrivano dopo
function soccorsi(d, t, n, x0, z, colore) {
  for (let i = 0; i < n; i++) {
    const p = ((t * .3 + i * .12) % 1);
    omino(d, x0 + p * 16, 1.4, z + (i % 3) * 1.2, colore || P.oro, P.pelle, .76);
  }
}

VoxScena.registra({

/* ==================== disastri ==================== */

ungari(rng) {
  return { cielo: TRAMONTO, nebbia: 0x3a2c24, raggio: FUOCO, ambiente: .55,
    statici(m) { piazza(m, 11, rng, P.legno, P.tetto, 3); },
    dinamici(d, t) {
      /* Le scorrerie arrivano fino in Toscana. Le città si cingono di mura, e
         il paesaggio urbano italiano cambia forma per sempre. */
      const f = (t * .09) % 1;
      const razzia = f < .55;
      if (razzia) {
        for (let i = 0; i < 12; i++) {
          const a = t * .5 + i * .52;
          d(Math.cos(a) * (4 + (i % 4) * 1.4), 1.8, Math.sin(a) * (4 + (i % 4) * 1.4), 1.1, P.terraScura);
          omino(d, Math.cos(a) * (4 + (i % 4) * 1.4), 2.6, Math.sin(a) * (4 + (i % 4) * 1.4), P.marrone, P.pelle, .78);
        }
        for (let i = 0; i < 6; i++) fuoco(d, t, -8 + i * 3.4, 4, -8, 6, .8, i * .12);
      } else {
        const su = clamp01((f - .55) * 2.4);                        // le mura, dopo
        for (let a = 0; a < 30; a++) {
          const an = a / 30 * Math.PI * 2;
          for (let y = 0; y < 5 * su; y++)
            d(Math.round(Math.cos(an) * 10), 1 + y, Math.round(Math.sin(an) * 9), .95, P.pietraChiara);
        }
      }
    } };
},

'boniface-anagni'(rng) {
  return { cielo: CUPO, raggio: CALDO, ambiente: .55, fronte: FR,
    statici(m) { interno(m, 17, 8, 10, P.marmo, P.marmoOmbra); },
    dinamici(d0, t) {
      /* Inviati del re di Francia catturano il papa nel suo palazzo: la
         teocrazia medievale finisce lì dentro. */
      const f = (t * .1) % 1;
      const d = dissolvenza(d0, f, 1);   // il ciclo si ritira invece di spegnersi
      omino(d, 0, 1.4, -3, P.biancoIt, P.pelle, 1);
      d(0, 3.6, -3, .7, P.oro);
      const entrata = clamp01(f * 1.8);
      for (let i = 0; i < 8; i++) {
        const p = clamp01(entrata * 1.4 - i * .06);
        if (p <= 0) continue;
        omino(d, -6 + (i % 4) * 2, 1.4, 6 - p * 8, P.blu, P.pelle, .82);
      }
      const solo = clamp01((f - .6) * 2.4);
      for (let i = 0; i < 6; i++) {
        if (solo <= 0) break;
        omino(d, -5 + i * 2, 1.4, 4 + solo * 6, P.viola, P.pelle, .75);
      }
    } };
},

'carestia-1315'(rng) {
  return { cielo: CUPO, nebbia: 0x32363c, raggio: 0xc0bca8, ambiente: .5,
    statici(m) { suolo(m, 12, P.terraScura, P.terra, rng, .6); for (let i = 0; i < 4; i++) casa(m, -9 + i * 6, 8, 3, 3, 3, P.tela, P.tetto, 1); },
    dinamici(d, t) {
      /* Tre anni di piogge distruggono i raccolti: l'Italia settentrionale
         perde un decimo degli abitanti, trent'anni prima della peste. */
      const f = (t * .09) % 1;
      const marcio = clamp01(f * 1.5);
      for (let r = 0; r < 4; r++) for (let c = 0; c < 8; c++) {
        const i = r * 8 + c;
        d(-9 + c * 2.4, 1.4, -8 + r * 2.4, .9, marcio > i / 40 ? P.terraScura : P.erba);
      }
      for (let i = 0; i < 26; i++) {
        const g = (t * 1.4 + i * .04) % 1;
        d(((i * 6151) % 25) - 12, 11 - g * 11, ((i * 3571) % 25) - 12, .3, P.ghiaccio);
      }
      const rimasti = Math.round(12 * (1 - marcio * .7));
      for (let i = 0; i < rimasti; i++)
        omino(d, -8 + i * 1.6, 1.6, 6, P.terraScura, P.pelle, .74);
    } };
},

'cassa-firenze'(rng) {
  return { cielo: CUPO, raggio: CALDO, ambiente: .6, fronte: FR,
    statici(m) { interno(m, 19, 7, 11, P.pietra, P.legno); },
    dinamici(d, t) {
      /* Il re d'Inghilterra non restituisce i prestiti e le maggiori banche
         falliscono: la città entra in crisi prima ancora della peste. */
      const f = (t * .1) % 1.3;
      const crollo = clamp01((f - .35) * 2.2);
      for (let i = 0; i < 16; i++) {
        const q = clamp01(crollo * 1.4 - i * .04);
        if (q >= 1) continue;
        d(-6 + (i % 8) * 1.5, 2.4 + Math.floor(i / 8) * .5, -2, .7 * (1 - q), P.oro);
      }
      for (let i = 0; i < 10; i++) {                                // i creditori alla porta
        if (crollo < .3) break;
        omino(d, -7 + i * 1.6, 1.4, 4, P.terraScura, P.pelle, .78);
      }
      omino(d, 0, 1.4, -1, P.viola, P.pelle, .9);
      for (let i = 0; i < 6; i++) {
        if (crollo < .7) break;
        d(4 + (i % 3) * .8, 2.4, -2, .5, P.tela);
      }
    } };
},

'vesuvio-1660'(rng) {
  return { cielo: 0x2a1c1c, nebbia: 0x3a2622, raggio: 0xffd9a0, ambiente: .5,
    statici(m) {
      suolo(m, 12, P.cenere, P.terraScura, rng);
      for (let y = 0; y < 7; y++) {
        const r = 5 - y * .6;
        for (let x = -r; x <= r; x++) for (let z = -r; z <= r; z++)
          if (x * x + z * z <= r * r) m.p(Math.round(x), y + 1, Math.round(z) - 8, P.pietraScura);
      }
      for (let i = 0; i < 5; i++) casa(m, -9 + i * 4, 6, 3, 3, 2, P.tela, P.tetto, 1);
    },
    dinamici(d, t) {
      /* Una pioggia di cristalli a forma di croce spaventa Napoli più della
         lava: le cronache la registrano come prodigio. */
      fuoco(d, t, 0, 8, -8, 12, 1.4, 0);
      for (let i = 0; i < 22; i++) {
        const g = (t * .35 + i * .045) % 1;
        const x = ((i * 6151) % 25) - 12, z = ((i * 3571) % 22) - 8;
        const y = 13 - g * 12;
        d(x, y, z, .35, P.marmo);                                    // le croci
        d(x - .35, y + .3, z, .3, P.marmo);
        d(x + .35, y + .3, z, .3, P.marmo);
      }
      folla(d, t, 0, 5, 14, 1.8, [P.tela, P.nero], 1.4);   // la gente sta fra le case, non oltre il bordo
    } };
},

'etna-1669'(rng) {
  return { cielo: 0x2a1c18, nebbia: 0x3a2620, raggio: FUOCO, ambiente: .5,
    statici(m) {
      suolo(m, 12, P.pietraScura, P.terraScura, rng);
      mura(m, -8, 7, 17, 5, 6, P.pietraChiara);
      for (let y = 0; y < 8; y++) {
        const r = 6 - y * .65;
        for (let x = -r; x <= r; x++) for (let z = -r; z <= r; z++)
          if (x * x + z * z <= r * r) m.p(Math.round(x), y + 1, Math.round(z) - 9, P.roccia);
      }
    },
    dinamici(d, t) {
      /* La colata più grande in età storica arriva a Catania e scavalca le
         mura: si prova a deviarla a picconi, ed è la prima volta. */
      const f = (t * .08) % 1;
      fuoco(d, t, 0, 9, -9, 8, 1.2, 0);
      const avanza = clamp01(f * 1.4);
      for (let i = 0; i < 20; i++) {
        const z = -6 + avanza * 14 - (i % 5);
        d(-8 + (i % 10) * 1.8, 1.4, z, 1.4, z > 5 ? P.brace : P.lava);
      }
      for (let i = 0; i < 8; i++) {                                  // chi prova a deviarla
        if (avanza > .7) break;
        omino(d, -6 + i * 1.8, 1.6, -1, P.terraScura, P.pelle, .76);
      }
      folla(d, t, 0, 5, 12, 1.8, [P.tela, P.nero], 1.4);   // dentro le mura, non oltre il bordo
    } };
},

'tambora-italia'(rng) {
  return { cielo: 0x30343c, nebbia: 0x3c4048, raggio: 0xb8bcc0, ambiente: .5,
    statici(m) { suolo(m, 12, P.erbaScura, P.terra, rng, .6); for (let i = 0; i < 4; i++) casa(m, -9 + i * 6, 8, 3, 3, 3, P.tela, P.tetto, 1); },
    dinamici(d, t) {
      /* Un'eruzione dall'altra parte del mondo gela i raccolti anche qui:
         nevica in giugno e il pane raddoppia di prezzo. */
      const f = (t * .1) % 1;
      const gelo = clamp01(f * 1.5);
      for (let r = 0; r < 4; r++) for (let c = 0; c < 8; c++) {
        const i = r * 8 + c;
        d(-9 + c * 2.4, 1.4, -8 + r * 2.4, .9, gelo > i / 40 ? P.neve : P.erba);
      }
      for (let i = 0; i < 30; i++) {
        const g = (t * .5 + i * .033) % 1;
        d(((i * 6151) % 25) - 12, 12 - g * 12, ((i * 3571) % 25) - 12, .35, P.neve);
      }
      for (let i = 0; i < 8; i++) {                                  // la fila per il pane
        omino(d, -6 + i * 1.4, 1.6, 6, P.terraScura, P.pelle, .74);
      }
      d(2, 2.4, 6, .8, P.sabbia);
    } };
},

bandiera(rng) {
  return { cielo: CUPO, nebbia: 0x2c3028, raggio: 0xc8bca0, ambiente: .5,
    statici(m) { collina(m, 12, 5, P.foglieScure, P.erbaScura); },
    dinamici(d, t) {
      /* Due ufficiali sbarcano per accendere una rivolta che non c'è: traditi,
         catturati e fucilati. "Viva l'Italia". */
      const f = (t * .09) % 1;
      const sbarco = clamp01(f * 2);
      for (let i = 0; i < 10; i++) {
        const p = clamp01(sbarco * 1.4 - i * .05);
        if (p <= 0) continue;
        omino(d, -8 + (i % 5) * 1.4, 1.4 + p * 3.4, 10 - p * 12, P.viola, P.pelle, .78);
      }
      const fine = clamp01((f - .6) * 2.4);
      if (fine > 0) {
        for (let i = 0; i < 8; i++)
          omino(d, -6 + i * 1.8, 5.4, 2, P.divisa, P.pelle, .78);
        for (let i = 0; i < 2; i++) omino(d, -1 + i * 2, 5.4, -2, P.viola, P.pelle, .85);
      }
      for (let i = 0; i < 8; i++) {
        if (fine < .5) break;
        const g = (t * .5 + i * .12) % 1;
        d(-1 + i * .5, 6 + g * 3, -2, .3 * (1 - g), P.oro);
      }
    } };
},

pisacane(rng) {
  return { cielo: TRAMONTO, raggio: CALDO,
    statici(m) { porto(m, 5, rng, P.erbaScura); },
    dinamici(d, t) {
      /* Trecento uomini sbarcano contando su un'insurrezione che non arriva:
         i contadini li scambiano per briganti. */
      const f = (t * .09) % 1;
      onde(d, t, 12, 3, [12, 6]);
      const sbarco = Math.min(1, f * 2.4);
      nave(d, t, -8 + sbarco * 5, 1.2, 0, 1, 7, P.legno, P.tela, 0);
      for (let i = 0; i < 14; i++) {
        const p = clamp01(sbarco * 1.4 - i * .04);
        if (p <= 0) continue;
        omino(d, -6 + (i % 7) * 1.4, 2, 3 + p * 4, P.rossoIt, P.pelle, .78);
      }
      const scontro = clamp01((f - .55) * 2.4);
      for (let i = 0; i < 16; i++) {
        if (scontro <= 0) break;
        omino(d, -8 + (i % 8) * 2, 2, 11 - scontro * 3, P.terraScura, P.pelle, .76);
        if (scontro > .5) d(-8 + (i % 8) * 2, 3.4, 11 - scontro * 3, .35, P.legno);
      }
    } };
},

aspromonte(rng) {
  return { cielo: CUPO, nebbia: 0x2c3028, raggio: 0xc8bca0, ambiente: .5,
    statici(m) { collina(m, 12, 7, P.foglieScure, P.erbaScura); },
    dinamici(d, t) {
      /* Marcia su Roma con i volontari, ma a fermarlo è l'esercito italiano:
         ferito a un piede, arrestato e poi amnistiato. */
      const f = (t * .09) % 1;
      const marcia = clamp01(f * 1.4);
      for (let i = 0; i < 16; i++) {
        const p = clamp01(marcia * 1.3 - i * .03);
        omino(d, -8 + (i % 8) * 1.6, 1.4 + p * 5, 10 - p * 12, P.rossoIt, P.pelle, .78);
      }
      const stop = clamp01((f - .5) * 2.4);
      for (let i = 0; i < 14; i++) {
        if (stop <= 0) break;
        omino(d, -7 + (i % 7) * 1.8, 7.4, -2 - stop * 2, P.divisa, P.pelle, .78);
      }
      const ferito = clamp01((f - .75) * 4);
      if (ferito > 0) omino(d, 0, 7.4 - ferito * .5, 1, P.rossoIt, P.pelle, .9 - ferito * .2);
    } };
},

'crispi-africa'(rng) {
  return { cielo: CUPO, nebbia: 0x3a3428, raggio: 0xd0bc94, ambiente: .55,
    statici(m) { collina(m, 12, 6, P.sabbia, P.terraScura); },
    dinamici(d, t) {
      /* Le colonne si perdono fra i monti e vengono battute una alla volta:
         il governo cade, e l'Africa entra nella politica interna. */
      const f = (t * .09) % 1;
      const sparse = clamp01(f * 1.6);
      for (let k = 0; k < 3; k++) {
        const a = k * 2.1;
        for (let i = 0; i < 6; i++) {
          const perso = sparse > .6 && (i + k) % 2 === 0;
          if (perso) continue;
          omino(d, Math.cos(a) * (3 + sparse * 6) + (i % 3), 6.4 - (i % 2), Math.sin(a) * (3 + sparse * 6),
            P.divisa, P.pelle, .78);
        }
      }
      for (let i = 0; i < 18; i++) {
        const a = i / 18 * Math.PI * 2, r = 11 - sparse * 3;
        omino(d, Math.cos(a) * r, 1.6, Math.sin(a) * r, P.terraScura, P.pelle, .76);
      }
      for (let i = 0; i < 12; i++) {
        const g = (t * .6 + i * .08) % 1;
        d(Math.cos(i * 1.9) * 5, 5 + g * 3, Math.sin(i * 1.9) * 5, .8 * (1 - g), P.polvere);
      }
    } };
},

'bava-beccaris'(rng) {
  return { cielo: CUPO, nebbia: 0x30323a, raggio: 0xc0b8a4, ambiente: .5,
    statici(m) { piazza(m, 11, rng, P.cotto, P.tetto, 5); },
    dinamici(d, t) {
      /* Si protesta per il prezzo del pane e l'esercito spara sulla folla: chi
         comandò il fuoco riceverà una medaglia. */
      const f = (t * .09) % 1;
      const prima = f < .5;
      folla(d, t, 0, 2, Math.round(26 - 18 * clamp01((f - .46) * 12)), 1.8,
        [P.terraScura, P.tela], 1.2);
      for (let i = 0; i < 14; i++)
        omino(d, -9 + i * 1.4, 1.4, -7, P.divisa, P.pelle, .78);
      if (!prima) {
        const p = clamp01((f - .5) * 3);
        for (let i = 0; i < 10; i++) {
          const g = ((t * 2 + i * .1) % 1);
          d(-8 + i * 1.8, 2.4, -6 + g * 6, .35 * (1 - g), P.brace);
        }
        for (let i = 0; i < 8; i++) d(-6 + i * 1.8, 1.2, 3 + (i % 3), .8 * p, P.tela);
      }
      d(0, 2.4, 8, .8, P.sabbia);                                    // il pane, il motivo di tutto
    } };
},

umberto(rng) {
  return { cielo: CUPO, raggio: CALDO, ambiente: .55,
    statici(m) { suolo(m, 12, P.erba, P.terra, rng, .4); for (let i = 0; i < 4; i++) casa(m, -10 + i * 6, -9, 4, 3, 4, P.tela, P.tetto, 1); },
    dinamici(d0, t) {
      /* Sobria: una carrozza che si ferma, e il paese che si sveglia con un re
         diverso. */
      const f = (t * .1) % 1;
      const d = dissolvenza(d0, f, 1);   // il ciclo si ritira invece di spegnersi
      const x = -10 + Math.min(1, f * 2) * 10;
      for (let i = 0; i < 4; i++) d(x + (i % 2) * 1.2, 2.2, Math.floor(i / 2) * 1.1, 1, P.nero);
      d(x - 1.4, 2, .5, .9, P.terraScura);
      const dopo = clamp01((f - .55) * 3);
      if (dopo > 0) for (let i = 0; i < 10; i++) {
        const g = ((t * .3 + i * .1) % 1);
        d(x + Math.cos(i * 2) * 2, 2.4 + g * 3, .5 + Math.sin(i * 2) * 2, .4 * (1 - g), P.grigio);
      }
      folla(d, t, 0, 6, dopo > .3 ? 18 : 8, 2, [P.nero, P.tela], 1.4);
    } };
},

'terremoto-avezzano'(rng) {
  return { cielo: CUPO, nebbia: 0x2e2c2a, raggio: 0xc8bca0, ambiente: .5,
    statici(m) { suolo(m, 12, P.terraScura, P.terra, rng, .4); },
    dinamici(d, t) {
      /* Trentamila morti un mese prima dell'entrata in guerra: i soccorsi
         arrivano tardi e l'evento sparisce dalle cronache. */
      const f = (t * .08) % 1;
      const posti = [];
      for (let i = 0; i < 12; i++) posti.push([-10 + (i % 4) * 6, -8 + Math.floor(i / 4) * 6]);
      const giu = crolla(d, t, f, posti, .3, P.tela, P.tetto);
      if (giu > .6) soccorsi(d, t, 6, -12, 9, P.divisa);
      for (let i = 0; i < 14; i++) {
        const g = (t * .4 + i * .07) % 1;
        d(-9 + i * 1.4, 1.4 + g * 3, -2 + (i % 4) * 3, .9 * (1 - g), P.polvere);
      }
    } };
},

spagnola(rng) {
  return { cielo: CUPO, nebbia: 0x2e2e34, raggio: 0xc0b8a8, ambiente: .5,
    statici(m) { piazza(m, 11, rng, P.tela, P.tetto, 4); },
    dinamici(d, t) {
      /* Sobria: seicentomila morti, più delle vittime militari della guerra.
         La piazza si svuota e restano le finestre chiuse. */
      const f = (t * .08) % 1;
      const vuoto = clamp01(f * 1.4);
      folla(d, t, 0, 0, Math.round(24 * (1 - vuoto * .9)), 1.8, [P.tela, P.terraScura], 1.2);
      for (let i = 0; i < 12; i++) {                                 // le finestre che si chiudono
        if (vuoto < i / 16) continue;
        const a = i / 12 * Math.PI * 2;
        d(Math.cos(a) * 9, 3.4, Math.sin(a) * 9, .8, P.nero);
      }
      for (let i = 0; i < 6; i++) {
        if (vuoto < .6) break;
        omino(d, -6 + i * 2.4, 1.4, 8, P.biancoIt, P.pelle, .76);
      }
    } };
},

matteotti(rng) {
  return { cielo: CUPO, nebbia: 0x2c2e34, raggio: 0xc0b8a4, ambiente: .5,
    statici(m) { suolo(m, 12, P.pietraChiara, P.terra, rng); for (let x = -12; x <= 12; x++) for (let z = -2; z <= 2; z++) m.p(x, 1, z, P.grigio); for (let i = 0; i < 6; i++) albero(m, -10 + i * 4, -8, 1, rng); },
    dinamici(d, t) {
      /* Sobria: un discorso in aula, poi un'auto sul lungotevere, poi mesi di
         crisi e la scelta della dittatura aperta. */
      const f = (t * .08) % 1;
      const discorso = f < .35;
      if (discorso) {
        omino(d, 0, 1.6, 0, P.nero, P.pelle, .95);
        for (let i = 0; i < 10; i++) {
          const g = (t * .8 + i * .1) % 1;
          d(Math.sin(i * 2.1) * 2, 3.4 + g * 4, Math.cos(i * 1.9) * 1.4, .3 * (1 - g), P.oro);
        }
      } else {
        const p = clamp01((f - .35) * 1.6);
        const x = -11 + p * 22;
        for (let i = 0; i < 4; i++) d(x + (i % 2) * 1.2, 2.2, -.6, 1, P.nero);
        d(x + .5, 3.1, -.6, .8, P.nero);
      }
      const dopo = clamp01((f - .7) * 3);
      for (let i = 0; i < 14; i++) {
        if (dopo <= 0) break;
        d(-9 + i * 1.4, 2.4, 6, .6, P.tela);                         // i giornali
      }
    } };
},

'leggi-razziali'(rng) {
  return { cielo: CUPO, nebbia: 0x2c2e34, raggio: 0xb8b0a0, ambiente: .5, fronte: FR,
    statici(m) { interno(m, 19, 7, 11, P.tela, P.legno); },
    dinamici(d, t) {
      /* Sobria: i banchi si svuotano uno dopo l'altro, e le cattedre restano
         senza chi le occupava. */
      const f = (t * .1) % 1.3;
      const via = clamp01(f * 1.4);
      for (let r = 0; r < 3; r++) for (let c = 0; c < 8; c++) {
        const i = r * 8 + c;
        d(-7 + c * 2, 1.6 + r * .5, -2 + r * 1.8, .9, P.legno);
        const escluso = (i * 7) % 5 === 0;
        if (escluso && via > i / 30) continue;
        omino(d, -7 + c * 2, 2 + r * .5, -2 + r * 1.8, escluso ? P.viola : P.tela, P.pelle, .58);
      }
      for (let i = 0; i < 6; i++) {
        if (via < .5) break;
        d(-3 + i * 1.2, 4.4, -6.4, .6, P.nero);                      // il decreto affisso
      }
    } };
},

cefalonia(rng) {
  return { cielo: CUPO, nebbia: 0x2e3230, raggio: 0xc0b8a0, ambiente: .5,
    statici(m) { collina(m, 12, 5, P.erbaScura, P.erba); for (let x = -12; x <= 12; x++) for (let z = 9; z <= 12; z++) m.p(x, 0, z, P.mare); },
    dinamici(d, t) {
      /* Sobria: dopo l'armistizio i soldati rifiutano di consegnare le armi.
         La Resistenza comincia anche fuori dai confini. */
      const f = (t * .09) % 1;
      const rifiuto = clamp01(f * 2);
      for (let i = 0; i < 18; i++) {
        const a = i / 18 * Math.PI * 2;
        omino(d, Math.cos(a) * 5, 5.4, Math.sin(a) * 5, P.divisa, P.pelle, .78);
        if (rifiuto > .5) d(Math.cos(a) * 5.6, 5.4, Math.sin(a) * 5.6, .35, P.ferro);
      }
      const dopo = clamp01((f - .6) * 2.4);
      for (let i = 0; i < 12; i++) {
        if (dopo <= 0) break;
        omino(d, Math.cos(i * .52) * 10, 1.6, Math.sin(i * .52) * 10, P.grigioverde, P.pelle, .78);
      }
      onde(d, t, 12, 4, [12, 8]);
    } };
},

'deportazione-roma'(rng) {
  return { cielo: CUPO, nebbia: 0x2c2e34, raggio: 0xb0a898, ambiente: .45,
    statici(m) { piazza(m, 11, rng, P.cotto, P.tetto, 5); },
    dinamici(d, t) {
      /* Sobria: i camion partono all'alba e la piazza resta vuota. Di più di
         mille, ne torneranno sedici. */
      /* I tre camion sono in fila per dodici blocchi: escono dalla piazza da
         un lato e quel che è già fuori non si disegna. */
      const f = (t * .08) % 1;
      const rot = (bx, y, z, s, c) => { if (bx >= -11 && bx <= 11) d(bx, y, z, s, c); };
      const x = -12 + clamp01(f * 1.6) * 24;
      for (let k = 0; k < 3; k++) {
        for (let i = 0; i < 4; i++) rot(x + k * 4 + (i % 2) * 1.2, 2.2, Math.floor(i / 2) * 1.1, 1, P.grigio);
        for (let i = 0; i < 3; i++) rot(x + k * 4 + .5, 3.2, .5 + (i % 2) * .5, .8, P.tela);
      }
      const rimasti = Math.round(16 * (1 - clamp01(f * 1.6)));
      folla(d, t, 0, 5, rimasti, 1.8, [P.tela, P.terraScura], 1.2);
      const dopo = clamp01((f - .7) * 3);
      for (let i = 0; i < 16; i++) {
        if (dopo <= 0) break;
        d(-8 + (i % 8) * 2.2, 1.3, -4 + Math.floor(i / 8) * 3, .7, P.marmoOmbra);   // le pietre
      }
    } };
},

ardeatine(rng) {
  return { cielo: CUPO, nebbia: 0x26282c, raggio: 0xa8a094, ambiente: .4,
    statici(m) {
      suolo(m, 12, P.terraScura, P.terra, rng, .8);
      for (let x = -4; x <= 4; x++) for (let y = 1; y <= 4; y++) m.p(x, y, -6, P.roccia);
      for (let x = -2; x <= 2; x++) for (let y = 1; y <= 3; y++) m.p(x, y, -6, P.nero);
    },
    dinamici(d, t) {
      /* Sobria: l'ingresso della cava viene fatto saltare, e per anni nessuno
         saprà quanti ci sono dentro. */
      const f = (t * .08) % 1;
      const chiude = clamp01((f - .5) * 2.4);
      for (let x = -2; x <= 2; x++) for (let y = 1; y <= 3; y++)
        d(x, y, -6, 1, chiude > (y - 1) / 4 ? P.roccia : P.nero);
      if (chiude > .1 && chiude < .9) for (let i = 0; i < 12; i++) {
        const g = ((t * 1.2 + i * .08) % 1);
        d(-3 + i * .55, 1 + g * 4, -5 + g * 2, .8 * (1 - g), P.polvere);
      }
      const memoria = clamp01((f - .8) * 4);
      for (let i = 0; i < 20; i++) {
        if (memoria <= 0) break;
        d(-9 + (i % 10) * 2, 1.3, 2 + Math.floor(i / 10) * 2.4, .8, P.marmoOmbra);
      }
    } };
},

'monte-sole'(rng) {
  return { cielo: CUPO, nebbia: 0x2a2c2a, raggio: 0xb8b0a0, ambiente: .45,
    statici(m) { collina(m, 12, 6, P.foglieScure, P.erbaScura); },
    dinamici(d, t) {
      /* Sobria: i paesi sulle pendici si spengono uno dopo l'altro, e restano
         i campanili. */
      const f = (t * .07) % 1;
      const spegne = clamp01(f * 1.4);
      const paesi = [[-8, -5], [-2, 2], [4, -4], [7, 4], [-5, 6]];
      for (let i = 0; i < paesi.length; i++) {
        const [x, z] = paesi[i];
        const h = Math.max(0, Math.round(6 - Math.hypot(x, z) * .5));
        const vivo = spegne < (i + 1) / paesi.length;
        for (let dx = 0; dx < 3; dx++) for (let dz = 0; dz < 3; dz++)
          d(x + dx, h + 1, z + dz, 1, vivo ? P.tela : P.cenere);
        for (let y = 0; y < 4; y++) d(x + 1, h + 2 + y, z + 1, .5, vivo ? P.cotto : P.cenere);
      }
      for (let i = 0; i < 12; i++) {
        if (spegne < .3) break;
        const g = (t * .3 + i * .08) % 1;
        d(-8 + (i % 5) * 4, 6 + g * 4, -5 + Math.floor(i / 5) * 4, .8 * (1 - g), P.fumo);
      }
    } };
},

portella(rng) {
  return { cielo: GIORNO, raggio: CALDO,
    statici(m) { valle(m, 12, 6, 6, P.roccia, P.erbaScura); },
    dinamici(d, t) {
      /* Sobria: una festa del primo maggio in un valico, e poi il silenzio.
         La prima strage politica della Repubblica. */
      const f = (t * .08) % 1;
      const prima = f < .45;
      const resta = clamp01((.45 - f) * 12);              // la festa si spegne, non si taglia
      folla(d, t, 0, 0, Math.round(6 + 20 * resta), 2, [P.tela, P.rossoIt, P.terraScura], 1.2);
      if (prima) for (let k = 0; k < 3; k++)
        bandiera(dissolvenza(d, f, .45, .08), t, -4 + k * 4, 1.4, 4, 3, [P.rossoIt, P.rossoIt], k);
      else {
        const p = clamp01((f - .45) * 2.4);
        for (let i = 0; i < 12; i++)
          d(-7 + (i % 6) * 2.4, 1.2, -2 + Math.floor(i / 6) * 3, .8 * p, P.tela);
        for (let i = 0; i < 8; i++) d(-4 + i * 1.2, 1.4, 6, .5, P.rossoIt);   // le bandiere a terra
      }
    } };
},

polesine(rng) {
  return { cielo: CUPO, nebbia: 0x30343c, raggio: 0xc0bcb0, ambiente: .5,
    statici(m) { suolo(m, 12, P.erba, P.terra, rng, .4); for (let i = 0; i < 8; i++) casa(m, -10 + (i % 4) * 6, -6 + Math.floor(i / 4) * 8, 4, 4, 3, P.tela, P.tetto, 1); },
    dinamici(d, t) {
      /* Il fiume rompe gli argini e allaga centomila ettari: centottantamila
         persone lasciano la provincia, molte per sempre. */
      const f = (t * .08) % 1;
      const acqua = clamp01(f * 1.5);
      for (let x = -11; x <= 11; x += 2) for (let z = -11; z <= 11; z += 2)
        d(x, 1.2 + acqua * 2 + Math.sin(t * 1.5 + x + z) * .15, z, 1.9 * acqua, P.terraScura);
      for (let k = 0; k < 4; k++) {                                  // le barche dei soccorsi
        if (acqua < .5) break;
        const p = ((t * .5 + k * .25) % 1);
        d(-11 + p * 22, 1.4 + acqua * 2, -6 + k * 5, .9, P.legno);
        omino(d, -11 + p * 22, 2 + acqua * 2, -6 + k * 5, P.oro, P.pelle, .7);
      }
      const partenza = clamp01((f - .6) * 2.4);
      for (let i = 0; i < 12; i++) {
        if (partenza <= 0) break;
        omino(d, -8 + i * 1.6, 1.6 + acqua * 2, 11 - partenza * 4, P.terraScura, P.pelle, .74);
      }
    } };
},

'piazza-fontana'(rng) {
  return { cielo: CUPO, nebbia: 0x2c2e34, raggio: 0xb8b0a0, ambiente: .45,
    statici(m) { piazza(m, 11, rng, P.pietra, P.tetto, 5); },
    dinamici(d, t) {
      /* Sobria: un pomeriggio d'inverno, una banca, e dieci anni di stragi e
         depistaggi che cominciano lì. */
      const f = (t * .08) % 1;
      const prima = f < .4;
      for (let x = -4; x <= 4; x++) for (let y = 0; y < 5; y++)
        d(x, 1 + y, -6, 1, prima ? P.pietraChiara : P.grigio);
      if (prima) folla(d, t, 0, 0, 18, 1.8, [P.tela, P.nero, P.viola], 1.2);
      else {
        const p = clamp01((f - .4) * 2.4);
        for (let i = 0; i < 14; i++) {
          const g = ((t * .5 + i * .07) % 1);
          d(-4 + (i % 7) * 1.4, 1.4 + g * 4, -5 + g * 3, .9 * (1 - g), P.polvere);
        }
        for (let i = 0; i < 6; i++) d(-4 + i * 1.6, 1.2, -2, .8 * p, P.tela);
      }
      for (let i = 0; i < 20; i++) {                                 // la nebbia di dicembre
        const g = (t * .1 + i * .05) % 1;
        d(-12 + g * 24, 2, -8 + (i % 6) * 3, 1.6, P.fumo);
      }
    } };
},

'bologna-1980'(rng) {
  return { cielo: GIORNO, raggio: CALDO, fronte: FR,
    statici(m) { interno(m, 19, 7, 11, P.pietraChiara, P.ferro); },
    dinamici(d, t) {
      /* Sobria: la sala d'aspetto, e l'orologio che da allora resta fermo su
         quell'ora. */
      const f = (t * .07) % 1;
      const prima = f < .4;
      d(0, 5.4, -6.4, 1.4, P.biancoIt);                              // l'orologio
      const ora = prima ? (t * .5) % (Math.PI * 2) : 2.1;
      for (let i = 0; i < 4; i++) d(Math.cos(ora) * i * .3, 5.4 + Math.sin(ora) * i * .3, -6.2, .3, P.nero);
      if (prima) {
        const dp = dissolvenza(d, f, .4, .05);            // la sala si spegne invece di sparire
        for (let r = 0; r < 2; r++) for (let i = 0; i < 8; i++)
          omino(dp, -7 + i * 2, 1.4, -2 + r * 2.4, [P.tela, P.viola][r], P.pelle, .76);
        for (let i = 0; i < 6; i++) dp(-6 + i * 2.4, 1.6, 2, .8, P.legno);
      } else {
        const p = clamp01((f - .4) * 2.4);
        for (let i = 0; i < 16; i++) {
          const g = ((t * .5 + i * .06) % 1);
          d(-7 + (i % 8) * 2, 1.4 + g * 3.4, -2 + (i % 3) * 2, .9 * (1 - g), P.polvere);
        }
        for (let i = 0; i < 8; i++) d(-6 + i * 1.8, 1.2, 1, .8 * p, P.tela);
      }
    } };
},

irpinia(rng) {
  return { cielo: CUPO, nebbia: 0x2e2c2a, raggio: 0xc0b8a0, ambiente: .5,
    statici(m) { collina(m, 12, 5, P.erbaScura, P.erba); },
    dinamici(d, t) {
      /* Novanta secondi, e trecentomila senza casa. La ricostruzione diventerà
         un caso di studio su come non si spende il denaro pubblico. */
      const f = (t * .07) % 1;
      const posti = [];
      for (let i = 0; i < 10; i++) posti.push([-9 + (i % 5) * 4.4, -6 + Math.floor(i / 5) * 7]);
      const giu = crolla(d, t, f, posti, .25, P.tela, P.tetto);
      if (giu > .5) soccorsi(d, t, 5, -12, 9, P.oro);
      const cantiere = clamp01((f - .7) * 3);
      for (let i = 0; i < 8; i++) {                                  // i cantieri che non finiscono
        if (cantiere <= 0) break;
        d(-8 + i * 2.4, 1.4, 10, .8, P.grigio);
        for (let y = 0; y < 3; y++) d(-8 + i * 2.4, 2 + y, 10, .3, P.tronco);
      }
    } };
},

vermicino(rng) {
  return { cielo: NOTTE, nebbia: 0x24262c, raggio: 0xd8c8a0, ambiente: .4,
    statici(m) { suolo(m, 12, P.terraScura, P.terra, rng, .4); for (let y = 0; y < 6; y++) for (let a = 0; a < 8; a++) { const an = a / 8 * Math.PI * 2; m.p(Math.round(Math.cos(an)), -y, Math.round(Math.sin(an)), P.pietraScura); } },
    dinamici(d, t) {
      /* Sobria: diciotto ore di diretta attorno a un buco. Da quella notte
         nascerà la Protezione Civile moderna. */
      const f = (t * .07) % 1;
      for (let i = 0; i < 20; i++) {                                 // le luci e le telecamere
        const a = i / 20 * Math.PI * 2;
        d(Math.cos(a) * 6, 1.6, Math.sin(a) * 6, .6, i % 4 ? P.grigio : P.biancoIt);
        omino(d, Math.cos(a) * 7.4, 1.4, Math.sin(a) * 7.4, i % 3 ? P.tela : P.oro, P.pelle, .74);
      }
      for (let i = 0; i < 8; i++) {
        const g = ((t * .4 + i * .12) % 1);
        d(Math.cos(i * .8) * 3, 4 - g * 3, Math.sin(i * .8) * 3, .4 * (1 - g), P.oro);
      }
      const alba = clamp01((f - .7) * 3);
      for (let i = 0; i < 10; i++) {
        if (alba <= 0) break;
        d(Math.cos(i * .63) * 9, 8 + alba * 2, Math.sin(i * .63) * 9, .4, P.oro);
      }
      stelle(d, 12, 10, 12);
    } };
},

'tangentopoli-craxi'(rng) {
  return { cielo: CUPO, raggio: CALDO, ambiente: .55,
    statici(m) { piazza(m, 11, rng, P.pietraChiara, P.tetto, 6); },
    dinamici(d, t) {
      /* L'immagine che chiude un'epoca politica: la folla fuori dall'albergo, e
         le monetine che volano. */
      const f = (t * .1) % 1;
      omino(d, 0, 1.4, -4, P.nero, P.pelle, .95);
      folla(d, t, 0, 4, 26, 2.4, [P.terraScura, P.tela, P.viola], 1.2);
      const lancio = clamp01((f - .3) * 2.4);
      for (let i = 0; i < 24; i++) {
        if (lancio <= 0) break;
        const g = ((t * 1.2 + i * .04) % 1);
        d(-6 + (i % 12) * 1.1, 2 + Math.sin(g * Math.PI) * 4, 4 - g * 7, .3, P.oro);
      }
    } };
},

'assisi-1997'(rng) {
  return { cielo: CUPO, nebbia: 0x2e2c2a, raggio: 0xc8bca0, ambiente: .5, fronte: FR,
    statici(m) { interno(m, 19, 11, 11, P.tela, P.tela); },
    dinamici(d, t) {
      /* Sobria: la volta cede durante il sopralluogo, in diretta. Il restauro
         sarà un record: due anni. */
      const f = (t * .08) % 1;
      const prima = f < .35, rifatta = f > .7;
      for (let x = -8; x <= 8; x += 2) for (let z = -6; z <= 2; z += 2) {
        const buco = Math.abs(x) < 3 && Math.abs(z + 2) < 3;
        if (buco && !prima && !rifatta) continue;
        d(x, 12.2, z, 1.8, prima || rifatta ? P.acquaChiara : P.tela);
      }
      if (!prima && !rifatta) for (let i = 0; i < 16; i++) {
        const g = ((t * .8 + i * .06) % 1);
        d(-2 + (i % 5) * 1.1, 12 - g * 10, -2 + (i % 3), .8 * (1 - g), P.polvere);
      }
      if (rifatta) for (let i = 0; i < 10; i++) {                     // i ponteggi del restauro
        d(-4 + i * .9, 5, -2, .3, P.tronco);
        for (let y = 0; y < 6; y++) d(-4 + i * .9, 5 + y, -2, .25, P.tronco);
      }
      for (let i = 0; i < 6; i++) omino(d, -5 + i * 2, 1.4, 2, P.biancoIt, P.pelle, .78);
    } };
},

laquila(rng) {
  return { cielo: NOTTE, nebbia: 0x26282e, raggio: 0xb8b0a0, ambiente: .45,
    statici(m) { suolo(m, 12, P.pietraChiara, P.terra, rng, .4); },
    dinamici(d, t) {
      /* Sobria: il centro storico puntellato per anni, e le case che restano
         in piedi solo grazie ai tubi. */
      const f = (t * .07) % 1;
      const posti = [];
      for (let i = 0; i < 10; i++) posti.push([-9 + (i % 5) * 4.4, -6 + Math.floor(i / 5) * 7]);
      const giu = crolla(d, t, f, posti, .3, P.pietraChiara, P.tetto);
      const puntelli = clamp01((f - .6) * 2.4);
      for (let i = 0; i < posti.length; i++) {
        if (puntelli <= 0) break;
        const [x, z] = posti[i];
        for (let k = 0; k < 4; k++) {
          const a = k / 4 * Math.PI * 2;
          for (let s = 0; s < 3; s++)
            d(x + 1 + Math.cos(a) * (2 + s * .6), 1.4 + s * .8, z + 1 + Math.sin(a) * (2 + s * .6), .3, P.oro);
        }
      }
      stelle(d, 12, 10, 12);
    } };
},

'grandi-navi'(rng) {
  return { cielo: NOTTE, nebbia: 0x1e2a38, raggio: 0xa8bcd8, ambiente: .45,
    statici(m) {
      for (let x = -12; x <= 12; x++) for (let z = -12; z <= 12; z++) m.p(x, 0, z, P.mare);
      for (let x = 6; x <= 12; x++) for (let z = -12; z <= 12; z++) {
        const h = Math.max(1, Math.round((x - 5) * .8));
        for (let y = 1; y <= h; y++) m.p(x, y, z, y === h ? P.erbaScura : P.roccia);
      }
    },
    dinamici(d, t) {
      /* Sobria: una nave fuori rotta, uno scoglio, e la fiancata che si
         appoggia all'isola. */
      const f = (t * .07) % 1;
      const incaglio = clamp01((f - .35) * 2);
      const inclina = incaglio * .8;
      for (let i = 0; i < 12; i++)
        for (let y = 0; y < 3; y++)
          d(-8 + i * 1.1, 1.4 + y + inclina * (i - 6) * .12, -2 + inclina * 3, 1, P.biancoIt);
      for (let i = 0; i < 12; i++)
        d(-8 + i * 1.1, 4.6 + inclina * (i - 6) * .12, -2 + inclina * 3, .8, P.biancoIt);
      onde(d, t, 12, 4, [9, 4]);
      for (let i = 0; i < 10; i++) {                                 // le luci di soccorso
        if (incaglio < .5) break;
        const g = ((t * .5 + i * .1) % 1);
        d(6 - g * 8, 2 + Math.sin(g * Math.PI) * 1.4, -4 + (i % 4) * 2, .4, P.oro);
      }
      stelle(d, 10, 10, 12);
    } };
},

lampedusa(rng) {
  return { cielo: NOTTE, nebbia: 0x1c2836, raggio: 0xa0b4cc, ambiente: .45,
    statici(m) {
      for (let x = -12; x <= 12; x++) for (let z = -12; z <= 12; z++) m.p(x, 0, z, P.mare);
      for (let x = -12; x <= 12; x++) for (let z = 8; z <= 12; z++) {
        const h = Math.max(1, Math.round((z - 7) * .7));
        for (let y = 1; y <= h; y++) m.p(x, y, z, y === h ? P.sabbia : P.roccia);
      }
    },
    dinamici(d, t) {
      /* Sobria: mezzo miglio dalla costa. L'isola diventa il punto in cui
         l'Europa guarda il Mediterraneo. */
      const f = (t * .07) % 1;
      const affonda = clamp01((f - .3) * 2);
      for (let i = 0; i < 8; i++)
        d(-2 + i * .9, 1.3 - affonda * 1.6, 2, 1, P.legno);
      for (let i = 0; i < 12; i++) {                                 // i giubbotti sull'acqua
        if (affonda < .5) break;
        const a = i * 2.399;
        d(Math.cos(a) * (2 + (i % 4)), 1.1, 2 + Math.sin(a) * (2 + (i % 4)), .5, P.oro);
      }
      for (let k = 0; k < 3; k++) {                                  // le motovedette
        if (affonda < .6) break;
        const p = ((t * .4 + k * .33) % 1);
        d(-10 + p * 8, 1.4, -6 + k * 3, 1, P.biancoIt);
      }
      onde(d, t, 12, 4, [12, 8]);
      stelle(d, 12, 10, 12);
    } };
},

amatrice(rng) {
  return { cielo: NOTTE, nebbia: 0x26282e, raggio: 0xb8b0a0, ambiente: .45,
    statici(m) { collina(m, 12, 4, P.erbaScura, P.erba); },
    dinamici(d, t) {
      /* Sobria: una sequenza di scosse fra agosto e ottobre, e paesi interi da
         ricostruire. */
      const f = (t * .06) % 1;
      const posti = [];
      for (let i = 0; i < 9; i++) posti.push([-8 + (i % 3) * 6, -6 + Math.floor(i / 3) * 6]);
      // tre scosse, non una: la seconda e la terza finiscono il lavoro
      const fasi = [.15, .45, .75];
      let giu = 0;
      for (const inizio of fasi) if (f > inizio) giu = Math.max(giu, clamp01((f - inizio) * 4) * (1 / 3 + fasi.indexOf(inizio) / 3));
      const scossa = fasi.some(i => f > i && f < i + .06) ? Math.sin(t * 30) * .3 : 0;
      for (let i = 0; i < posti.length; i++) {
        const [x, z] = posti[i];
        const h = Math.max(0, Math.round(4 - Math.hypot(x, z) * .3));
        const alt = 3 * (1 - giu);
        for (let y = 0; y < alt; y++)
          for (let dx = 0; dx < 3; dx++) for (let dz = 0; dz < 3; dz++) {
            if (dx === 1 && dz === 1 && y < alt - 1) continue;
            d(x + dx + scossa, h + 1 + y, z + dz, 1, y === Math.floor(alt) - 1 ? P.tetto : P.tela);
          }
      }
      if (giu > .4) soccorsi(d, t, 5, -12, 9, P.oro);
      stelle(d, 10, 10, 12);
    } };
},

morandi(rng) {
  return { cielo: CUPO, nebbia: 0x30343a, raggio: 0xb8b4ac, ambiente: .5,
    statici(m) {
      suolo(m, 12, P.pietraChiara, P.terra, rng);
      for (let i = 0; i < 6; i++) casa(m, -11 + i * 4, 8, 3, 3, 4, P.tela, P.tetto, 1);
    },
    dinamici(d, t) {
      /* Sobria: duecento metri di viadotto sopra la città, e poi il vuoto in
         mezzo. Il nuovo ponte sarà finito in due anni. */
      const f = (t * .07) % 1;
      const rotto = f > .35 && f < .75;
      const nuovo = f >= .75;
      for (let x = -12; x <= 12; x++) {
        const vuoto = rotto && Math.abs(x) < 4;
        if (vuoto) continue;
        d(x, 8, -2, 1, nuovo ? P.biancoIt : P.grigio);
      }
      for (let x = -12; x <= 12; x += 5) {
        const vuoto = rotto && Math.abs(x) < 4;
        if (vuoto) continue;
        for (let y = 1; y < 8; y++) d(x, y, -2, .8, nuovo ? P.biancoIt : P.pietraChiara);
      }
      if (rotto) for (let i = 0; i < 14; i++) {
        const g = ((t * .5 + i * .07) % 1);
        d(-3 + (i % 7) * 1, 8 - g * 7, -2 + (i % 3), .9 * (1 - g), P.polvere);
      }
      if (nuovo) for (let i = 0; i < 4; i++) {
        const p = ((t * 2 + i * 3) % 26) - 13;
        d(p, 8.6, -2, .8, [P.rossoIt, P.blu, P.biancoIt, P.oro][i]);
      }
    } };
},

codogno(rng) {
  return { cielo: CUPO, nebbia: 0x30343c, raggio: 0xb8bcc0, ambiente: .5,
    statici(m) { piazza(m, 11, rng, P.tela, P.tetto, 4); },
    dinamici(d, t) {
      /* Sobria: la piazza si svuota in dieci giorni, e restano le luci accese
         alle finestre. */
      const f = (t * .07) % 1;
      const vuoto = clamp01(f * 1.4);
      folla(d, t, 0, 0, Math.round(26 * (1 - vuoto)), 1.8, [P.tela, P.viola, P.terraScura], 1.2);
      for (let i = 0; i < 18; i++) {                                 // le finestre accese
        if (vuoto < i / 22) continue;
        const a = i / 18 * Math.PI * 2;
        d(Math.cos(a) * 9, 3.4 + (i % 2) * 1.4, Math.sin(a) * 9, .8, P.oro);
      }
      for (let i = 0; i < 4; i++) {                                  // un mezzo che passa
        if (vuoto < .6) break;
        const p = ((t * .5 + i * .25) % 1);
        d(-12 + p * 24, 1.8, 0, .9, P.biancoIt);
      }
    } };
},

/* ==================== la Repubblica ==================== */

'donne-voto'(rng) {
  return { cielo: GIORNO, raggio: CALDO, ambiente: .65, fronte: FR,
    statici(m) { interno(m, 19, 7, 11, P.tela, P.legno); },
    dinamici(d, t) {
      /* La fila davanti alla cabina, per la prima volta: ventuno di loro
         entreranno alla Costituente. */
      const f = (t * .14) % 1.3;
      for (let i = 0; i < 16; i++) {
        const p = ((f + i / 16) % 1);
        omino(d, -8 + p * 16, 1.4, 4 - (p > .4 && p < .7 ? 3 : 0), P.viola, P.pelle, .78);
      }
      d(0, 2.4, -3, 1.6, P.legno);
      for (let i = 0; i < 3; i++) {
        for (let y = 0; y < 3; y++) for (let dx = 0; dx < 3; dx++)
          if (dx === 0 || dx === 2 || y === 2) d(-6 + i * 6 + dx, 2 + y, 0, .9, P.legno);
      }
      const schede = Math.floor((f / 1.3) * 16);
      for (let i = 0; i < schede; i++) d(-1 + (i % 4) * .6, 2.9 + Math.floor(i / 4) * .3, -3, .5, P.tela);
    } };
},

'elezioni-1948'(rng) {
  return { cielo: GIORNO, raggio: CALDO,
    statici(m) { piazza(m, 11, rng, P.cotto, P.tetto, 4); },
    dinamici(d, t) {
      /* Affluenza al novantadue per cento: il paese si mobilita come mai
         prima, e il risultato orienta quarant'anni di politica. */
      const f = (t * .12) % 1.3;
      const fila = Math.round(clamp01(f * 1.4) * 30);
      for (let i = 0; i < fila; i++) {
        const a = i * .21;
        omino(d, Math.cos(a) * (3 + i * .18), 1.4, Math.sin(a) * (3 + i * .18),
          i % 2 ? P.biancoIt : P.rossoIt, P.pelle, .74);
      }
      for (let k = 0; k < 6; k++) {                                  // i manifesti
        const p = clamp01((f - (k / 8)) * 5);
        if (p <= 0) continue;
        const da = arrivo(d, p);
        da(-8 + k * 3.2, 4.4, -8, 1.1, k % 2 ? P.biancoIt : P.rossoIt);
      }
      d(0, 2.4, 0, 1.6, P.legno);
    } };
},

'ladri-biciclette'(rng) {
  return { cielo: CUPO, nebbia: 0x30343c, raggio: 0xc8c0b0, ambiente: .55,
    statici(m) { piazza(m, 11, rng, P.cotto, P.tetto, 5); for (let x = -12; x <= 12; x++) for (let z = -1; z <= 1; z++) m.p(x, 1, z, P.pietra); },
    dinamici(d, t) {
      /* Attori non professionisti, strade vere, una bicicletta che sparisce:
         vincerà l'Oscar e cambierà il cinema. */
      const f = (t * .1) % 1;
      const rubata = f > .45;
      const x = -10 + ((t * 2) % 20);
      if (!rubata) {
        d(x, 2, 0, .5, P.nero); d(x + 1.4, 2, 0, .5, P.nero);
        d(x + .7, 2.6, 0, .5, P.grigio);
        omino(d, x + .7, 3, 0, P.terraScura, P.pelle, .8);
      } else {
        omino(d, x + .7, 1.4, 0, P.terraScura, P.pelle, .8);
        omino(d, x + .7 + 1.2, 1.4, 0, P.tela, P.pelle, .55);        // il bambino accanto
      }
      folla(d, t, 0, 5, 12, 2, [P.tela, P.nero], 1.2);
      for (let i = 0; i < 6; i++) d(-8 + i * 3, 4.4, -8, 1, P.grigio);   // i manifesti da attaccare
    } };
},

marshall(rng) {
  return { cielo: GIORNO, raggio: CALDO,
    statici(m) { porto(m, 4, rng); for (let i = 0; i < 4; i++) m.guscio(-10 + i * 6, 2, 7, 4, 4, 4, P.cotto); },
    dinamici(d, t) {
      /* Un miliardo e mezzo in aiuti e materie prime rimette in moto industria
         e agricoltura: in cambio, l'Italia entra nel campo occidentale. */
      const f = (t * .1) % 1.3;
      onde(d, t, 12, 3, [12, 5]);
      const arrivo = Math.min(1, f * 2.4);
      nave(d, t, -10 + arrivo * 7, 1.2, -4, 1, 8, P.grigio, 0, 0);
      for (let i = 0; i < 14; i++) {
        const p = clamp01(arrivo * 1.4 - i * .04);
        if (p <= 0) continue;
        d(-2 + p * 8, 2.4 + (i % 3) * .8, 4 + (i % 4), .8,
          [P.oro, P.sabbia, P.ferro, P.cotto][i % 4]);
      }
      for (let i = 0; i < 10; i++) omino(d, -9 + i * 2, 2, 6, P.divisa, P.pelle, .75);
    } };
},

'riforma-agraria'(rng) {
  return { cielo: GIORNO, raggio: CALDO,
    statici(m) { suolo(m, 12, P.terraScura, P.terra, rng, .4); },
    dinamici(d, t) {
      /* Ottocentomila ettari espropriati e distribuiti: poderi troppo piccoli,
         ma i latifondi finiscono. */
      const f = (t * .12) % 1.3;
      const diviso = clamp01(f * 1.5);
      for (let r = 0; r < 5; r++) for (let c = 0; c < 5; c++) {
        const i = r * 5 + c;
        const p = clamp01((diviso - (i / 30)) * 5);
        if (p <= 0) continue;
        const da = arrivo(d, p);
        const x = -10 + c * 4.4, z = -10 + r * 4.4;
        for (let k = 0; k <= 4; k++) { da(x + k, 1.2, z, .8, P.oro); da(x, 1.2, z + k, .8, P.oro); }
        da(x + 2, 1.6, z + 2, .9, P.erba);
        if (diviso > i / 30 + .2) omino(da, x + 2, 1.6, z + 3, P.terraScura, P.pelle, .6);
      }
    } };
},

'dolce-vita'(rng) {
  return { cielo: NOTTE, raggio: 0xffe0b0, ambiente: .5,
    statici(m) { piazza(m, 11, rng, P.marmo, P.tetto, 5); for (let x = -3; x <= 3; x++) for (let z = -3; z <= 3; z++) m.p(x, 1, z, P.acqua); },
    dinamici(d, t) {
      /* Una fontana di notte, i flash dei fotografi, e una parola che entra in
         tutte le lingue del mondo. */
      const f = (t * .12) % 1.3;
      for (let x = -3; x <= 3; x += 2) for (let z = -3; z <= 3; z += 2)
        d(x, 1.4 + Math.sin(t * 2 + x + z) * .18, z, 1.8, P.acquaChiara);
      for (let i = 0; i < 8; i++) {
        const g = (t * .8 + i * .12) % 1;
        d(Math.cos(i) * 1.4, 2 + Math.sin(g * Math.PI) * 3, Math.sin(i) * 1.4, .5, P.acquaChiara);
      }
      omino(d, -1, 1.6, 0, P.biancoIt, P.pelle, .95);
      omino(d, 1, 1.6, 0, P.nero, P.pelle, .95);
      for (let i = 0; i < 10; i++) {                                 // i flash
        const acceso = ((t * 4 + i * 1.7) % 5) < .5;
        omino(d, Math.cos(i * .63) * 7, 1.4, Math.sin(i * .63) * 7, P.nero, P.pelle, .76);
        if (acceso) d(Math.cos(i * .63) * 6.4, 2.6, Math.sin(i * .63) * 6.4, .6, P.biancoIt);
      }
      stelle(d, 10, 10, 12);
    } };
},

'olimpiadi-roma'(rng) {
  return { cielo: NOTTE, raggio: 0xffd8a0, ambiente: .5,
    statici(m) {
      suolo(m, 12, P.sabbia, P.terra, rng);
      for (let x = -12; x <= 12; x++) for (let z = -2; z <= 2; z++) m.p(x, 1, z, P.pietraChiara);
      for (let i = 0; i < 5; i++) { m.colonna(-9 + i * 4, -7, 1, 5, P.marmo); m.p(-9 + i * 4, 7, -7, P.marmoOmbra); }
    },
    dinamici(d, t) {
      /* La maratona corsa di notte sull'Appia antica, a piedi nudi, sotto le
         torce: l'Italia si mostra ricostruita. */
      const x = ((t * 3) % 22) - 11;                                  // il maratoneta corre sulla via, non oltre
      omino(d, x, 2, 0, P.tela, P.pelle, .85);
      for (let i = 0; i < 14; i++) {                                 // le torce lungo la via
        d(-12 + i * 1.8, 2.4, -3, .3, P.tronco);
        fuoco(d, t, -12 + i * 1.8, 3, -3, 3, .3, i * .07);
      }
      folla(d, t, 0, 4, 20, 2, [P.tela, P.viola], 1.4);
      stelle(d, 12, 10, 12);
    } };
},

sessantotto(rng) {
  return { cielo: GIORNO, raggio: CALDO,
    statici(m) { piazza(m, 11, rng, P.pietraChiara, P.tetto, 5); },
    dinamici(d, t) {
      /* Prima le università, poi l'autunno delle fabbriche: due anni dopo lo
         Statuto porta la Costituzione dentro i cancelli. */
      const f = (t * .1) % 1;
      const fase = f < .5;
      folla(d, t, 0, 0, 28, 2, fase ? [P.viola, P.tela] : [P.terraScura, P.divisa], 1.2);
      for (let k = 0; k < 5; k++) {
        const su = clamp01((f * 2 % 1) * 1.4 - k * .1);
        if (su <= 0) continue;
        for (let y = 0; y < 4 * su; y++) d(-8 + k * 4, 1 + y, -6, .3, P.tronco);
        if (su > .8) d(-8 + k * 4 + .8, 4.4, -6, 1.1, fase ? P.oro : P.rossoIt);
      }
      const statuto = clamp01((f - .8) * 4);
      if (statuto > 0) d(0, 6, 0, 1.6 * statuto, P.tela);
    } };
},

divorzio(rng) {
  return { cielo: GIORNO, raggio: CALDO, ambiente: .65, fronte: FR,
    statici(m) { interno(m, 19, 7, 11, P.tela, P.legno); },
    dinamici(d, t) {
      /* Il paese conferma la legge con il cinquantanove per cento: è più laico
         di quanto i partiti credessero. */
      const f = (t * .12) % 1.3;
      const conta = clamp01(f * 1.5);
      const si = Math.round(18 * conta), no = Math.round(12 * conta);
      for (let i = 0; i < si; i++) d(-7 + (i % 9) * .9, 2.4 + Math.floor(i / 9) * .4, -2, .7, P.verdeIt);
      for (let i = 0; i < no; i++) d(1 + (i % 9) * .9, 2.4 + Math.floor(i / 9) * .4, -2, .7, P.corallo);
      for (let i = 0; i < 6; i++) omino(d, -6 + i * 2.4, 1.4, 3, P.viola, P.pelle, .78);
      if (conta > .9) for (let i = 0; i < 8; i++) {
        const g = (t * .6 + i * .12) % 1;
        d(-3.5 + i * .9, 5 + g * 3, -2, .35 * (1 - g), P.verdeIt);
      }
    } };
},

basaglia(rng) {
  return { cielo: GIORNO, raggio: CALDO,
    statici(m) {
      suolo(m, 12, P.erba, P.terra, rng);
      for (let z = -8; z <= 8; z++) for (let y = 1; y <= 5; y++) { m.p(-6, y, z, P.pietraChiara); m.p(6, y, z, P.pietraChiara); }
      for (let x = -6; x <= 6; x++) for (let y = 1; y <= 5; y++) m.p(x, y, -8, P.pietraChiara);
    },
    dinamici(d, t) {
      /* Il primo paese al mondo a chiudere i manicomi: le porte si aprono, e i
         muri restano lì a fare da promemoria. */
      const f = (t * .1) % 1.3;
      const apre = clamp01(f * 1.5);
      for (let z = -2; z <= 2; z++) for (let y = 1; y <= 5; y++) {
        if (apre > (y - 1) / 6) continue;
        d(6, y, z, 1, P.ferro);
      }
      for (let i = 0; i < 14; i++) {
        const p = clamp01(apre * 1.3 - i * .04);
        omino(d, -3 + (i % 7) * 1.2, 1.4, -4 + p * 14, i % 3 ? P.tela : P.viola, P.pelle, .78);
      }
      for (let i = 0; i < 8; i++) {                                  // il cavallo azzurro della festa
        if (apre < .7) break;
        d(8 + (i % 4), 2.4 + Math.floor(i / 4), 6, .9, P.acquaChiara);
      }
    } };
},

mundial(rng) {
  return { cielo: NOTTE, raggio: 0xffd8a0, ambiente: .5,
    statici(m) { piazza(m, 11, rng, P.cotto, P.tetto, 5); },
    dinamici(d, t) {
      /* Dopo un girone disastroso si battono Argentina, Brasile, Polonia e
         Germania: il paese scende in strada come non accadeva dal 1945. */
      const f = (t * .12) % 1.3;
      const gioia = clamp01(f * 1.6);
      folla(d, t, 0, 0, Math.round(10 + gioia * 26), 1.6 + gioia, [P.verdeIt, P.biancoIt, P.rossoIt, P.blu], 1.2);
      for (let k = 0; k < 6; k++) {
        if (gioia < k / 8) continue;
        bandiera(d, t, -8 + k * 3.4, 2, -7, 3, [P.verdeIt, P.biancoIt, P.rossoIt], k);
      }
      for (let i = 0; i < 20; i++) {                                 // i clacson e i coriandoli
        if (gioia < .5) break;
        const g = (t * .8 + i * .05) % 1;
        d(Math.cos(i * 1.7) * 7, 10 - g * 8, Math.sin(i * 1.7) * 7, .35,
          [P.verdeIt, P.biancoIt, P.rossoIt][i % 3]);
      }
      stelle(d, 8, 10, 12);
    } };
},

maxiprocesso(rng) {
  return { cielo: CUPO, raggio: CALDO, ambiente: .55, fronte: FR,
    statici(m) { interno(m, 19, 8, 11, P.pietraChiara, P.ferro, P.grigio); },
    dinamici(d, t) {
      /* Quattrocentosettantacinque imputati in un'aula bunker: per la prima
         volta lo Stato dimostra in tribunale che è un'organizzazione unica. */
      const f = (t * .12) % 1.3;
      for (let r = 0; r < 3; r++) for (let c = 0; c < 10; c++) {     // le gabbie
        const i = r * 10 + c;
        const p = clamp01((f - (i / 40)) * 5);
        if (p <= 0) continue;
        const da = arrivo(d, p);
        for (let y = 0; y < 3; y++) da(-8 + c * 1.7, 1.4 + r * 1.6 + y * .5, -5 + r * 1.4, .25, P.ferro);
        omino(da, -8 + c * 1.7, 1.4 + r * 1.6, -5 + r * 1.4, P.terraScura, P.pelle, .55);
      }
      omino(d, 0, 1.4, 4, P.nero, P.pelle, .95);
      const filo = clamp01((f - .6) * 2.4);
      for (let i = 0; i < 14; i++) {                                 // il filo che li collega
        const p = clamp01((filo - (i / 18)) * 5);
        if (p <= 0) continue;
        const da = arrivo(d, p);
        da(-8 + i * 1.2, 6.4, -3, .3, P.oro);
      }
    } };
},

'chernobyl-italia'(rng) {
  return { cielo: CUPO, nebbia: 0x30343c, raggio: 0xb8bcc0, ambiente: .5,
    statici(m) { suolo(m, 12, P.erba, P.terra, rng, .4); },
    dinamici(d, t) {
      /* Un anno dopo il disastro si vota per fermare le centrali: le quattro
         esistenti chiudono, e il paese sceglie di importare energia. */
      const f = (t * .1) % 1.3;
      const spegne = clamp01(f * 1.5);
      for (let k = 0; k < 4; k++) {
        const acceso = spegne < (k + 1) / 5;
        const x = -9 + k * 6;
        for (let y = 0; y < 5; y++)
          for (let a = 0; a < 8; a++) {
            const an = a / 8 * Math.PI * 2, r = 2 - y * .18;
            d(x + Math.cos(an) * r, 1 + y, Math.sin(an) * r, .7, acceso ? P.pietraChiara : P.grigio);
          }
        if (acceso) for (let i = 0; i < 5; i++) {
          const g = ((t * .5 + i * .2) % 1);
          d(x, 6 + g * 3, 0, .8 * (1 - g), P.fumo);
        }
      }
      for (let i = 0; i < 12; i++) omino(d, -9 + i * 1.8, 1.4, 8, P.viola, P.pelle, .76);
      if (spegne > .9) for (let i = 0; i < 6; i++) d(-5 + i * 2, 2.4, 10, .7, P.tela);
    } };
},

erasmus(rng) {
  return { cielo: GIORNO, raggio: CALDO,
    statici(m) { piazza(m, 11, rng, P.cotto, P.tetto, 5); },
    dinamici(d, t) {
      /* Studenti che si scambiano di città: parte da Bologna, l'ateneo più
         antico, e in trent'anni ne muoverà milioni. */
      const f = (t * .12) % 1.3;
      for (let i = 0; i < 14; i++) {
        const a = i / 14 * Math.PI * 2 + t * .2;
        const p = ((f + i / 14) % 1);
        const r = 3 + p * 7;
        omino(d, Math.cos(a) * r, 1.4, Math.sin(a) * r,
          [P.rossoIt, P.blu, P.verdeIt, P.oro, P.viola][i % 5], P.pelle, .76);
        d(Math.cos(a) * r, 3, Math.sin(a) * r, .4, P.terraScura);
      }
      for (let i = 0; i < 12; i++) {
        const a = i / 12 * Math.PI * 2 + t * .1;
        d(Math.cos(a) * 2, 5.4, Math.sin(a) * 2, .4, P.oro);
      }
    } };
},

'mani-pulite'(rng) {
  return { cielo: CUPO, raggio: CALDO, ambiente: .55, fronte: FR,
    statici(m) { interno(m, 19, 8, 11, P.pietraChiara, P.legno); },
    dinamici(d, t) {
      /* Da un arresto per una tangente si risale a un intero sistema: la pila
         dei fascicoli cresce finché non copre il tavolo. */
      const f = (t * .12) % 1.3;
      const fascicoli = Math.floor((f / 1.3) * 40);
      for (let i = 0; i < fascicoli; i++)
        d(-6 + (i % 10) * 1.3, 2.4 + Math.floor(i / 10) * .5, -2, .8, P.tela);
      omino(d, 0, 1.4, 3, P.nero, P.pelle, .9);
      for (let i = 0; i < 10; i++) {                                 // chi entra e chi esce
        if (f < .4) break;
        const p = ((f * 2 + i / 10) % 1);
        omino(d, -8 + p * 16, 1.4, 6, P.viola, P.pelle, .76);
      }
    } };
},

schengen(rng) {
  return { cielo: GIORNO, raggio: CALDO,
    statici(m) { suolo(m, 12, P.erba, P.terra, rng, .4); for (let x = -12; x <= 12; x++) for (let z = -1; z <= 1; z++) m.p(x, 1, z, P.grigio); },
    dinamici(d, t) {
      /* Cadono i controlli alle frontiere interne: a Gorizia la linea che
         divideva la città dal 1947 smette di contare. */
      const f = (t * .12) % 1.3;
      const via = clamp01(f * 1.5);
      for (let y = 0; y < 4 * (1 - via); y++)
        for (let z = -6; z <= 6; z++) d(0, 1 + y, z, .9, P.ferro);
      for (let i = 0; i < 4; i++) {
        if (via > .8) break;
        d(-1 + (i % 2) * 2, 2 + Math.floor(i / 2), -3, .8, P.biancoIt);
      }
      for (let i = 0; i < 14; i++) {                                 // chi passa senza fermarsi
        const p = ((f + i / 14) % 1);
        omino(d, -12 + p * 24, 1.4, (i % 3) - 1, [P.tela, P.viola, P.blu][i % 3], P.pelle, .76);
      }
    } };
},

'giubileo-2000'(rng) {
  return { cielo: GIORNO, raggio: CALDO,
    statici(m) { piazza(m, 11, rng, P.marmo, P.tetto, 5); },
    dinamici(d, t) {
      /* Venticinque milioni di pellegrini e un decennio di cantieri:
         sottopassi, musei e stazioni che la città aspettava da sempre. */
      const f = (t * .11) % 1.3;
      const cantieri = clamp01(f * 1.4);
      for (let k = 0; k < 5; k++) {
        const q = clamp01(cantieri * 1.4 - k * .1);
        if (q <= 0) continue;
        const x = -9 + k * 4.4;
        for (let y = 0; y < 4 * q; y++)
          for (let dx = 0; dx < 3; dx++) d(x + dx, 1 + y, -8, 1, q > .9 ? P.marmo : P.grigio);
        if (q < .9) for (let s = 0; s < 3; s++) d(x + s, 5.4, -8, .3, P.tronco);
      }
      folla(d, t, 0, 2, Math.round(10 + cantieri * 26), 2.4, [P.tela, P.nero, P.viola], 1.2);
      for (let i = 0; i < 6; i++) {
        if (cantieri < .8) break;
        d(-4 + i * 1.6, 5.4, 0, .5, P.oro);
      }
    } };
},

'papa-francesco'(rng) {
  return { cielo: CUPO, raggio: CALDO, ambiente: .6,
    statici(m) { piazza(m, 11, rng, P.marmo, P.tetto, 6); },
    dinamici(d, t) {
      /* Per la prima volta in sei secoli un papa rinuncia: il camino fuma, e
         dal conclave esce un nome che nessuno si aspettava. */
      const f = (t * .1) % 1;
      const nero = f < .45;
      for (let y = 0; y < 4; y++) d(0, 6 + y, -8, .5, P.cotto);
      for (let i = 0; i < 10; i++) {
        const g = ((t * .8 + i * .1) % 1);
        d(0, 10 + g * 4, -8, .7 * (1 - g * .5), nero ? P.nero : P.biancoIt);
      }
      folla(d, t, 0, 2, 30, 2.4, [P.tela, P.nero, P.viola], 1.2);
      if (!nero) {
        const p = clamp01((f - .45) * 2.4);
        omino(d, 0, 6.4, -6, P.biancoIt, P.pelle, 1 * p);
      }
    } };
},

expo(rng) {
  return { cielo: GIORNO, raggio: CALDO,
    statici(m) { suolo(m, 12, P.pietraChiara, P.terra, rng); for (let x = -12; x <= 12; x++) for (let z = -1; z <= 1; z++) m.p(x, 1, z, P.legno); },
    dinamici(d, t) {
      /* Ventuno milioni di visitatori attorno al tema del cibo: i padiglioni
         si alzano lungo il decumano, uno diverso dall'altro. */
      const f = (t * .12) % 1.3;
      for (let k = 0; k < 8; k++) {
        const su = clamp01((f - k / 12) * 4);
        if (su <= 0) continue;
        const x = -10 + k * 3, z = k % 2 ? 4 : -4;
        const h = Math.round((3 + (k % 3)) * su);
        for (let y = 0; y < h; y++)
          for (let dx = 0; dx < 2; dx++) for (let dz = 0; dz < 2; dz++)
            d(x + dx, 1 + y, z + dz, 1,
              [P.verdeIt, P.corallo, P.acquaChiara, P.oro, P.menta, P.viola][k % 6]);
      }
      for (let i = 0; i < 20; i++) {
        const p = ((t * .3 + i * .05) % 1);
        omino(d, -12 + p * 24, 1.4, (i % 3) - 1, [P.tela, P.viola, P.blu][i % 3], P.pelle, .74);
      }
    } };
},

'europei-2021'(rng) {
  return { cielo: NOTTE, raggio: 0xffd8a0, ambiente: .5,
    statici(m) { piazza(m, 11, rng, P.cotto, P.tetto, 5); },
    dinamici(d, t) {
      /* Dopo un anno di stadi chiusi e piazze vuote, la prima festa collettiva
         dopo la pandemia. */
      const f = (t * .12) % 1.3;
      const riempie = clamp01(f * 1.6);
      folla(d, t, 0, 0, Math.round(2 + riempie * 34), 1.4 + riempie * 1.4,
        [P.verdeIt, P.biancoIt, P.rossoIt, P.blu], 1.2);
      for (let k = 0; k < 6; k++) {
        if (riempie < k / 8) continue;
        bandiera(d, t, -8 + k * 3.4, 2, -7, 3, [P.verdeIt, P.biancoIt, P.rossoIt], k);
      }
      for (let i = 0; i < 22; i++) {
        if (riempie < .5) break;
        const g = (t * .8 + i * .045) % 1;
        d(Math.cos(i * 1.7) * 7, 11 - g * 9, Math.sin(i * 1.7) * 7, .35,
          [P.verdeIt, P.biancoIt, P.rossoIt][i % 3]);
      }
      stelle(d, 8, 10, 12);
    } };
},

pnrr(rng) {
  return { cielo: GIORNO, raggio: CALDO,
    statici(m) { suolo(m, 12, P.pietraChiara, P.terra, rng); },
    dinamici(d, t) {
      /* Duecento miliardi legati a scadenze e riforme: il più grande programma
         di investimenti dal dopoguerra, con il cronometro acceso. */
      const f = (t * .11) % 1.3;
      const cantieri = [[-9, -6], [-3, 2], [3, -5], [8, 3], [-6, 6], [1, 8]];
      for (let i = 0; i < cantieri.length; i++) {
        const q = clamp01((f - i / 8) * 3);
        if (q <= 0) continue;
        const da = arrivo(d, q);
        const [x, z] = cantieri[i], h = Math.round(5 * q);
        for (let y = 0; y < h; y++)
          for (let dx = 0; dx < 3; dx++) for (let dz = 0; dz < 2; dz++)
            da(x + dx, 1 + y, z + dz, 1, q > .9 ? P.marmo : P.grigio);
        if (q < .9) for (let s = 0; s < 3; s++) da(x + s, 1 + h + 1, z, .3, P.tronco);
      }
      for (let i = 0; i < 12; i++) {                                 // le scadenze che scorrono
        const acceso = (f / 1.3) * 12 > i;
        d(-6 + i * 1.1, 9, -9, .5, acceso ? P.verdeIt : P.grigio);
      }
    } };
},

});

})();
