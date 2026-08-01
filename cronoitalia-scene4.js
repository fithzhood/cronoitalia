'use strict';

/* Scene firma, quarto volume: battaglie e guerre.
 *
 * Sono raggruppate per tipo perché condividono il palcoscenico — il campo
 * aperto, la città assediata, il mare — e così il kit lavora al massimo e ogni
 * scena resta di poche righe: quelle che raccontano la sua idea, non quelle che
 * rimettono in piedi le solite pareti.
 */

(() => {

const P = VoxScena.P;
const { suolo, albero, casa, omino, clamp01, dissolvenza, arrivo, tempio, cattedrale, torre, mura,
        nave, folla, fuoco, bandiera, stelle, onde, fabbrica, ponte,
        interno, piazza, campo, porto, teatro, bottega, collina, valle } = VoxScena.kit;

const NOTTE = 0x14203a, GIORNO = 0x24344c, TRAMONTO = 0x2e2c3e, CUPO = 0x1c1f28;
const CALDO = 0xffe6b4, FREDDO = 0xd6e4ff, FUOCO = 0xffb478;
const FR = Math.PI / 2;

// due schiere che si vengono incontro: il gesto di base di ogni battaglia
function scontro(d, t, cA, cB, n, urto, z0, y) {
  n = n || 8; y = y || 1.6; z0 = z0 || -5;
  const u = urto == null ? Math.sin(t * .8) * 2.6 : urto;
  for (let i = 0; i < n; i++) {
    omino(d, -6 + u + (i % (n / 2)) * 1.1, y, z0 + Math.floor(i / (n / 2)) * 2.2, cA, P.pelle, .8);
    omino(d, 6 - u - (i % (n / 2)) * 1.1, y, z0 + Math.floor(i / (n / 2)) * 2.2, cB, P.pelle, .8);
  }
}

// polvere o fumo sopra la mischia
function polverone(d, t, n, x0, y0, c) {
  for (let i = 0; i < (n || 12); i++) {
    const g = (t * .6 + i * .07) % 1;
    d((x0 || 0) + Math.sin(i * 2.2) * 3.4, (y0 || 1.6) + g * 3, -5 + (i % 7) * 1.8,
      .85 * (1 - g), c || P.polvere);
  }
}

VoxScena.registra({

/* ==================== battaglie ==================== */

'cuma-480'(rng) {
  return { cielo: GIORNO, raggio: CALDO,
    statici(m) { porto(m, 9, rng, P.erbaScura); },
    dinamici(d, t) {
      /* Il dominio etrusco sul Tirreno finisce in una giornata: le navi di
         Siracusa arrivano dal mare aperto e nessuno se le aspettava. */
      onde(d, t, 12, 3, [12, 4]);
      const urto = Math.sin(t * .5) * 2.4;
      for (let k = 0; k < 4; k++) {
        nave(d, t, -7 + urto, 1.2, -8 + k * 4.5, 1, 6, P.legno, P.acqua, 3);
        const giu = clamp01(((t * .12 + k * .25) % 1) - .6) * 3;
        // affonda fino al pelo dell'acqua, non dentro il fondale
        nave(d, t, 7 - urto, 1.2 - Math.min(1, giu) * 1.5, -8 + k * 4.5, -1, 6, P.tronco, giu > .2 ? 0 : P.ocra, 0);
      }
      for (let i = 0; i < 8; i++) omino(d, -8 + i * 2.4, 2, 10, P.tela, P.pelle, .78);
    } };
},

'siracusa-atene'(rng) {
  return { cielo: TRAMONTO, raggio: FUOCO,
    statici(m) {
      porto(m, 4, rng, P.sabbia);
      mura(m, -8, 6, 17, 5, 5, P.pietraChiara);
      for (let i = 0; i < 4; i++) m.p(-6 + i * 4, 0, -2, P.roccia);   // la catena all'imboccatura
    },
    dinamici(d, t) {
      /* Duecento navi entrano nel porto grande e non riescono più a uscire:
         la flotta più potente del Mediterraneo muore in una rada. */
      onde(d, t, 12, 3, [12, 9]);
      const f = (t * .08) % 1;
      const chiuso = clamp01((f - .3) * 2.4);
      for (let k = 0; k < 5; k++) {
        const x = -9 + Math.min(1, f * 2.4) * 8 + (k % 2) * 1.4;
        nave(d, t, x, 1.2, -8 + k * 3.4, 1, 6, P.legno, chiuso > .5 ? 0 : P.tela, 0);
      }
      for (let i = 0; i < 10; i++) {
        if (chiuso <= 0) break;
        d(-8 + i * 1.8, 1.4 - chiuso * .4, -2, .9, P.legno);
      }
      for (let i = 0; i < 10; i++) omino(d, -7 + i * 1.6, 7.6, 6, P.acqua, P.pelle, .8);
      polverone(d, t, 8, 0, 2, P.fumo);
    } };
},

'benevento-275'(rng) {
  return { cielo: TRAMONTO, raggio: CALDO,
    statici(m) { campo(m, 12, rng, 1); mura(m, 5, -6, 8, 8, 5, P.pietraChiara); },
    dinamici(d, t) {
      /* Gli elefanti si spaventano e tornano indietro sui loro: Pirro riparte
         per l'Epiro, e il Sud italico è di Roma. */
      const f = (t * .1) % 1;
      const fuga = clamp01((f - .45) * 2.4);
      for (let k = 0; k < 3; k++) {
        const x = -2 + fuga * 8, z = -5 + k * 4;
        for (let bx = -1; bx <= 1; bx++) d(x + bx, 2.2, z, 1.1, P.grigio);
        d(x + 1.6 - fuga * 3.2, 3.2, z, 1, P.grigio);
      }
      scontro(d, t, P.rosso, P.viola, 12, clamp01(f * 2) * 3);
      polverone(d, t);
    } };
},

regolo(rng) {
  return { cielo: GIORNO, raggio: CALDO,
    statici(m) { for (let x = -12; x <= 12; x++) for (let z = -12; z <= 12; z++) m.p(x, 0, z, P.mare); },
    dinamici(d, t) {
      /* Trecentotrenta navi contro trecentocinquanta: forse la più grande
         battaglia navale mai combattuta, e si decide con l'abbordaggio. */
      onde(d, t, 12, 3, null);
      const u = Math.sin(t * .4) * 2.2;
      for (let k = 0; k < 6; k++) {
        nave(d, t, -8 + u, 1.2, -10 + k * 4, 1, 6, P.legno, P.rosso, 2);
        nave(d, t, 8 - u, 1.2, -10 + k * 4, -1, 6, P.tronco, P.viola, 2);
      }
      for (let i = 0; i < 10; i++) {                                  // i corvi calati
        const g = clamp01(Math.sin(t * .8) * 2);
        d(-2 + i * .5, 3.6 - g * 1.8, -10 + (i % 6) * 4, .5, P.legno);
      }
    } };
},

grimoaldo(rng) {
  return { cielo: CUPO, raggio: FUOCO,
    statici(m) { campo(m, 12, rng, .8); mura(m, -6, -6, 13, 11, 6, P.pietraChiara); },
    dinamici(d, t) {
      /* L'ultimo tentativo bizantino di riprendersi il Sud si infrange sotto le
         mura: da qui in poi il Mezzogiorno guarda ai Longobardi. */
      const f = (t * .1) % 1;
      const assalto = clamp01(f * 1.8), ritirata = clamp01((f - .55) * 2.4);
      for (let i = 0; i < 16; i++)
        omino(d, 6 - assalto * 3 + ritirata * 3 + (i % 8) * .8, 1.6, -5 + Math.floor(i / 8) * 2.4,
          P.indaco, P.pelle, .8);
      for (let i = 0; i < 10; i++) omino(d, -5 + i * 1.4, 7.6, -6, P.oliva, P.pelle, .8);
      polverone(d, t, 10, 4, 1.6);
    } };
},

tagliacozzo(rng) {
  return { cielo: TRAMONTO, raggio: FUOCO,
    statici(m) { campo(m, 12, rng, 1.4); },
    dinamici(d0, t) {
      /* Gli svevi credono di aver vinto e si sbandano a saccheggiare: la
         riserva francese esce dal bosco e li prende sparsi. */
      const f = (t * .1) % 1;
      const d = dissolvenza(d0, f, 1);   // il ciclo si ritira invece di spegnersi
      const sbanda = clamp01((f - .35) * 2.4), riserva = clamp01((f - .55) * 2.4);
      for (let i = 0; i < 14; i++) {
        const a = i * 2.399;
        omino(d, Math.cos(a) * (2 + sbanda * 7), 1.6, Math.sin(a) * (2 + sbanda * 6),
          P.oro, P.pelle, .8);
      }
      for (let i = 0; i < 12; i++) {
        if (riserva <= 0) break;
        omino(d, -11 + riserva * 9 + (i % 6) * 1.2, 1.6, -6 + Math.floor(i / 6) * 2.4,
          P.blu, P.pelle, .8);
      }
      polverone(d, t);
    } };
},

'caterina-sforza'(rng) {
  return { cielo: CUPO, raggio: FUOCO,
    statici(m) { campo(m, 12, rng); mura(m, -4, -4, 9, 9, 6, P.pietraChiara); torre(m, -5, -5, 10, P.pietraChiara); },
    dinamici(d, t) {
      /* Sola sulle mura, con l'artiglieria di Cesare Borgia sotto: resiste
         settimane, e si arrende solo quando la breccia è dentro. */
      const f = (t * .09) % 1;
      omino(d, -4.5, 8.4, 0, P.rosso, P.pelle, .95);
      for (let k = 0; k < 4; k++) {
        const g = ((t * .5 + k * .25) % 1);
        d(-11 + g * 7, 3 + Math.sin(g * Math.PI) * 4, -4 + k * 3, .9, P.roccia);
      }
      const breccia = clamp01((f - .5) * 2.2);
      for (let z = -3; z <= 2; z++) for (let y = 1; y <= 6 - breccia * 6; y++) d(-4, y, z, 1, P.pietraChiara);
      for (let i = 0; i < 12; i++) omino(d, -11 + (i % 6) * 1.4, 1.6, -5 + Math.floor(i / 6) * 3, P.viola, P.pelle, .8);
      polverone(d, t, 10, -4, 1.6);
    } };
},

'ravenna-1512'(rng) {
  return { cielo: CUPO, raggio: FUOCO,
    statici(m) { campo(m, 12, rng, .8); for (let z = -12; z <= 12; z++) for (let x = 9; x <= 11; x++) m.p(x, 1, z, P.acqua); },
    dinamici(d, t) {
      /* La battaglia più sanguinosa delle guerre d'Italia: vincono i francesi
         ma perdono il comandante ventiduenne, e devono andarsene lo stesso. */
      const f = (t * .09) % 1;
      scontro(d, t, P.blu, P.ruggine, 16, clamp01(f * 1.6) * 3);
      for (let k = 0; k < 5; k++) {                                   // le artiglierie ai lati
        d(-10 + k * .4, 2, -8 + k * 4, .9, P.bronzo);
        if (((t * 2 + k) % 3) < .4) d(-8.4, 2.4, -8 + k * 4, .5, P.brace);
      }
      const morto = clamp01((f - .7) * 3);
      if (morto > 0) omino(d, 0, 1.6 - morto * .8, 2, P.blu, P.pelle, .9 * (1 - morto * .4));
      polverone(d, t, 14, 0, 2, P.fumo);
    } };
},

marignano(rng) {
  return { cielo: NOTTE, raggio: FUOCO, ambiente: .5,
    statici(m) { campo(m, 12, rng, .6); for (let z = -12; z <= 12; z++) m.p(-9, 1, z, P.acqua); },
    dinamici(d, t) {
      /* Due giorni e una notte in mezzo: i quadrati svizzeri reggono finché non
         arriva l'artiglieria francese. Da qui gli Svizzeri sceglieranno la
         neutralità. */
      const f = (t * .07) % 1;
      const notte = f > .4 && f < .6;
      for (let i = 0; i < 16; i++) {                                  // il quadrato svizzero
        const r = 2.4, a = i / 16 * Math.PI * 2;
        omino(d, 5 + Math.cos(a) * r, 1.6, Math.sin(a) * r, P.rosso, P.pelle, .8);
      }
      if (!notte) {
        for (let i = 0; i < 14; i++)
          omino(d, -8 + clamp01(f * 2) * 4 + (i % 7) * 1.1, 1.6, -5 + Math.floor(i / 7) * 2.4, P.blu, P.pelle, .8);
        for (let k = 0; k < 4; k++) {
          d(-10, 2, -6 + k * 4, .9, P.bronzo);
          if (((t * 3 + k) % 2) < .3) d(-8.6, 2.4, -6 + k * 4, .5, P.brace);
        }
      } else {
        for (let i = 0; i < 12; i++) fuoco(d, t, -6 + (i % 6) * 2.4, 1.4, -6 + Math.floor(i / 6) * 8, 3, .4, i * .1);
      }
      polverone(d, t, 10, 0, 1.6, notte ? P.fumo : P.polvere);
    } };
},

bitonto(rng) {
  return { cielo: GIORNO, raggio: CALDO,
    statici(m) { campo(m, 12, rng, .6, P.sabbia); for (let i = 0; i < 5; i++) casa(m, 7, -9 + i * 5, 3, 3, 3, P.tela, P.tetto, 1); },
    dinamici(d, t) {
      /* Una battaglia breve e il Sud torna ad avere una corte propria: Carlo di
         Borbone entra a Napoli e ci resterà una dinastia. */
      const f = (t * .11) % 1;
      scontro(d, t, P.blu, P.biancoIt, 14, clamp01(f * 1.8) * 3.4);
      const vinto = clamp01((f - .55) * 2.4);
      for (let k = 0; k < 4; k++) {
        if (vinto <= 0) break;
        bandiera(d, t, -6 + k * 4, 2, 8, 3, [P.blu, P.oro], k);
      }
      polverone(d, t);
    } };
},

'lodi-1796'(rng) {
  return { cielo: TRAMONTO, raggio: FUOCO,
    statici(m) {
      campo(m, 12, rng, .4);
      for (let z = -12; z <= 12; z++) for (let x = -2; x <= 2; x++) m.p(x, 0, z, P.acqua);
      ponte(m, -3, 0, 7, 3, P.legno);
    },
    dinamici(d, t) {
      /* L'assalto alla baionetta sul ponte: da qui i soldati cominciano a
         chiamarlo "il piccolo caporale". */
      const f = (t * .12) % 1;
      const carica = clamp01(f * 1.8);
      for (let i = 0; i < 14; i++) {
        const x = -8 + carica * 10 + (i % 5) * .7;
        omino(d, x, Math.abs(x) < 3 ? 3.4 : 1.6, -1 + (i % 3) * .9, P.blu, P.pelle, .8);
      }
      for (let i = 0; i < 10; i++) omino(d, 5 + (i % 5) * 1.2, 1.6, -3 + Math.floor(i / 5) * 3, P.biancoIt, P.pelle, .8);
      for (let k = 0; k < 3; k++) {
        d(6 + k * 1.6, 2, -4 + k * 4, .9, P.bronzo);
        if (((t * 3 + k) % 2) < .3) d(5, 2.4, -4 + k * 4, .5, P.brace);
      }
      polverone(d, t, 12, 0, 2.4, P.fumo);
    } };
},

montenotte(rng) {
  return { cielo: CUPO, nebbia: 0x323840, raggio: FREDDO, ambiente: .55,
    statici(m) { valle(m, 12, 4, 7, P.foglieScure, P.erbaScura); },
    dinamici(d, t) {
      /* Un esercito cencioso spezza in due gli austro-piemontesi fra i monti
         liguri: in un mese il Piemonte chiede l'armistizio. */
      const f = (t * .1) % 1;
      const cuneo = clamp01(f * 1.8);
      for (let i = 0; i < 16; i++) {
        const p = clamp01(cuneo * 1.4 - (i % 8) * .04);
        omino(d, -1 + (i % 8) * .5 - 2, 1.2, -10 + p * 18, P.blu, P.pelle, .8);
      }
      for (let i = 0; i < 6; i++) omino(d, -6, 1.2 + Math.max(0, (6 - 4) * 1.1), -6 + i * 3, P.biancoIt, P.pelle, .8);
      for (let i = 0; i < 6; i++) omino(d, 6, 1.2, -6 + i * 3, P.biancoIt, P.pelle, .8);
      polverone(d, t, 10, 0, 1.4, P.fumo);
    } };
},

'custoza-1848'(rng) {
  return { cielo: GIORNO, raggio: CALDO,
    statici(m) { collina(m, 12, 5, P.erbaScura, P.erba); mura(m, -3, -3, 7, 7, 4, P.pietraChiara); },
    dinamici(d, t) {
      /* Il colle passa di mano più volte in un giorno; alla fine restano gli
         austriaci, e la prima guerra d'indipendenza è persa. */
      const f = (t * .1) % 1;
      const chi = Math.floor(f * 4) % 2;
      for (let i = 0; i < 10; i++)
        omino(d, -3 + (i % 5) * 1.6, 6.4, -3 + Math.floor(i / 5) * 3, chi ? P.biancoIt : P.blu, P.pelle, .8);
      for (let i = 0; i < 14; i++) {
        const a = i / 14 * Math.PI * 2;
        omino(d, Math.cos(a) * 9, 1.6, Math.sin(a) * 9, chi ? P.blu : P.biancoIt, P.pelle, .8);
      }
      polverone(d, t, 12, 0, 4);
    } };
},

pastrengo(rng) {
  return { cielo: GIORNO, raggio: CALDO,
    statici(m) { campo(m, 12, rng, 1); },
    dinamici(d, t) {
      /* Il re si è spinto troppo avanti: tre squadroni di carabinieri caricano
         per coprirlo, e la carica diventa leggenda dell'Arma. */
      const f = (t * .12) % 1;
      const carica = clamp01(f * 2);
      for (let i = 0; i < 12; i++) {
        const z = -5 + (i % 6) * 2;
        d(-9 + carica * 12, 2, z, 1.1, P.terraScura);
        omino(d, -9 + carica * 12, 2.8, z, P.nero, P.pelle, .8);
        d(-9 + carica * 12, 4.4, z, .3, P.rossoIt);                   // il pennacchio
      }
      omino(d, -11, 1.6, 0, P.blu, P.pelle, .95);
      for (let i = 0; i < 10; i++) omino(d, 8 - carica * 3 + (i % 5) * 1.1, 1.6, -4 + Math.floor(i / 5) * 3, P.biancoIt, P.pelle, .8);
      polverone(d, t, 12, -2, 2);
    } };
},

balilla(rng) {
  return { cielo: CUPO, raggio: FUOCO, ambiente: .55,
    statici(m) { piazza(m, 11, rng, P.cotto, P.tetto, 4); },
    dinamici(d, t) {
      /* La città si ribella al proprio re e viene ripresa a cannonate: il
         Risorgimento non è solo eroismo condiviso. */
      const f = (t * .1) % 1;
      folla(d, t, 0, 2, 22, 1.8, [P.terraScura, P.tela], 1.2);
      for (let k = 0; k < 4; k++) {
        const g = ((t * .5 + k * .25) % 1);
        d(-11 + g * 10, 4 + Math.sin(g * Math.PI) * 5, -6 + k * 4, .9, P.roccia);
      }
      const rovina = clamp01((f - .5) * 2);
      for (let i = 0; i < 10; i++) {
        if (rovina <= 0) break;
        d(-6 + i * 1.4, 1.6 + rovina * 1.4, -8, .9, P.polvere);
      }
      for (let i = 0; i < 8; i++) fuoco(d, t, -8 + i * 2.4, 5, -9, 4, .5, i * .12);
    } };
},

novara(rng) {
  return { cielo: CUPO, nebbia: 0x30343c, raggio: 0xd0c0a4, ambiente: .5,
    statici(m) { campo(m, 12, rng, .8); },
    dinamici(d, t) {
      /* Sconfitto di nuovo, abdica la notte stessa e parte per il Portogallo:
         il figlio tiene lo Statuto, ed è l'unica cosa che resta. */
      const f = (t * .09) % 1;
      scontro(d, t, P.blu, P.biancoIt, 16, -clamp01(f * 1.6) * 3);
      const parte = clamp01((f - .6) * 2.4);
      if (parte > 0) {
        for (let i = 0; i < 4; i++) d(-2 + parte * -9 + (i % 2) * 1.2, 2.2, 8 + Math.floor(i / 2) * 1.1, 1, P.nero);
        d(-2 + parte * -9, 3.2, 8.5, .9, P.tela);
      }
      polverone(d, t, 12, 0, 1.6, P.fumo);
    } };
},

volturno(rng) {
  return { cielo: GIORNO, raggio: CALDO,
    statici(m) {
      campo(m, 12, rng, 1);
      for (let z = -12; z <= 12; z++) for (let x = 8; x <= 10; x++) m.p(x, 1, z, P.acqua);
      mura(m, -9, -8, 7, 7, 5, P.pietraChiara);
    },
    dinamici(d, t) {
      /* Ventimila volontari fermano l'ultimo contrattacco borbonico: dopo
         questo, la strada per Napoli è aperta. */
      const f = (t * .09) % 1;
      const onda = clamp01(f * 1.6), respinta = clamp01((f - .55) * 2.4);
      for (let i = 0; i < 18; i++)
        omino(d, 6 - onda * 5 + respinta * 4 + (i % 9) * .85, 1.6, -6 + Math.floor(i / 9) * 2.4,
          P.biancoIt, P.pelle, .8);
      for (let i = 0; i < 18; i++)
        omino(d, -7 + (i % 9) * 1.1, 1.6, -6 + Math.floor(i / 9) * 2.4, P.rossoIt, P.pelle, .8);
      polverone(d, t);
    } };
},

'custoza-1866'(rng) {
  return { cielo: GIORNO, raggio: CALDO,
    statici(m) { collina(m, 12, 5, P.erbaScura, P.erba); },
    dinamici(d, t) {
      /* Si perde di nuovo, e nello stesso posto. Il Veneto arriverà lo stesso,
         perché la Prussia ha vinto altrove. */
      const f = (t * .09) % 1;
      scontro(d, t, P.blu, P.biancoIt, 16, -clamp01(f * 1.6) * 3, -5, 4.6);
      const diplomazia = clamp01((f - .65) * 2.6);
      for (let i = 0; i < 6; i++) {
        if (diplomazia <= 0) break;
        d(-5 + i * 2, 8 + diplomazia * 2, 8, .7, P.tela);
      }
      polverone(d, t, 12, 0, 4.6);
    } };
},

mentana(rng) {
  return { cielo: TRAMONTO, raggio: FUOCO,
    statici(m) { campo(m, 12, rng, 1.2); for (let i = 0; i < 3; i++) casa(m, 7, -8 + i * 7, 4, 3, 3, P.tela, P.tetto, 1); },
    dinamici(d, t) {
      /* I fucili nuovi dei francesi "hanno fatto meraviglie", scrive il
         generale: i garibaldini avanzano e cadono a distanza. */
      const f = (t * .1) % 1;
      const avanti = clamp01(f * 1.6);
      for (let i = 0; i < 16; i++) {
        const caduto = avanti > .5 && i % 3 === 0;
        omino(d, -9 + avanti * 6 + (i % 8) * 1.1, caduto ? 1 : 1.8, -5 + Math.floor(i / 8) * 2.4,
          P.rossoIt, P.pelle, caduto ? .6 : .8);
      }
      for (let i = 0; i < 12; i++) {
        omino(d, 5 + (i % 6) * 1.1, 1.8, -5 + Math.floor(i / 6) * 2.4, P.blu, P.pelle, .8);
        if (((t * 4 + i) % 3) < .4) d(4.4, 3, -5 + Math.floor(i / 6) * 2.4, .3, P.brace);
      }
      polverone(d, t, 12, 2, 2, P.fumo);
    } };
},

asiago(rng) {
  return { cielo: 0x2a3038, nebbia: 0x363c44, raggio: FREDDO, ambiente: .5,
    statici(m) { collina(m, 12, 6, P.neve, P.foglieScure); },
    dinamici(d, t) {
      /* La spedizione punitiva punta a scendere in pianura alle spalle
         dell'esercito: viene fermata sull'altopiano per pochi chilometri. */
      const f = (t * .09) % 1;
      const spinta = clamp01(f * 1.6), stop = clamp01((f - .6) * 2.4);
      for (let i = 0; i < 18; i++)
        omino(d, -9 + (spinta - stop * .3) * 9 + (i % 9) * 1.1, 7.4, -6 + Math.floor(i / 9) * 2.4,
          P.grigioverde, P.pelle, .8);
      for (let i = 0; i < 14; i++)
        omino(d, 6 + (i % 7) * 1.1, 7.4, -5 + Math.floor(i / 7) * 2.4, P.divisa, P.pelle, .8);
      for (let i = 0; i < 14; i++) {
        const g = (t * .8 + i * .07) % 1;
        d(-4 + i * 1.2, 7.4 + g * 3, -5 + (i % 6) * 2.4, .8 * (1 - g), g < .3 ? P.fuoco : P.fumo);
      }
    } };
},

gorizia(rng) {
  return { cielo: GIORNO, raggio: CALDO,
    statici(m) {
      collina(m, 12, 5, P.pietraChiara, P.erbaScura);
      for (let i = 0; i < 5; i++) casa(m, -8 + i * 4, 8, 3, 3, 3, P.tela, P.tetto, 1);
    },
    dinamici(d, t) {
      /* La sesta battaglia dell'Isonzo prende la città in una settimana:
         l'unica vittoria chiara dei primi due anni. */
      const f = (t * .1) % 1;
      const presa = clamp01(f * 1.5);
      for (let i = 0; i < 20; i++)
        omino(d, -10 + presa * 12 + (i % 10) * 1.1, 1.6 + presa * 3, -5 + Math.floor(i / 10) * 2.4,
          P.divisa, P.pelle, .8);
      for (let k = 0; k < 4; k++) {
        if (presa <= .8) break;
        bandiera(d, t, -5 + k * 3.4, 6.4, 6, 3, [P.verdeIt, P.biancoIt, P.rossoIt], k);
      }
      for (let i = 0; i < 14; i++) {
        const g = (t * .9 + i * .07) % 1;
        d(-6 + i * 1.4, 2 + g * 4, -3 + (i % 5) * 2.4, .8 * (1 - g), g < .3 ? P.fuoco : P.fumo);
      }
    } };
},

'taranto-1940'(rng) {
  return { cielo: NOTTE, raggio: 0xa8c0e0, ambiente: .45,
    statici(m) {
      for (let x = -12; x <= 12; x++) for (let z = -12; z <= 12; z++) m.p(x, 0, z, P.mare);
      for (let x = -12; x <= 12; x++) for (let z = 8; z <= 12; z++) { m.p(x, 1, z, P.pietraChiara); m.p(x, 0, z, P.terra); }
    },
    dinamici(d, t) {
      /* Ventun aerosiluranti mettono fuori uso metà flotta in una notte: a
         Tokyo studieranno l'operazione prima di Pearl Harbor. */
      const f = (t * .1) % 1;
      for (let k = 0; k < 5; k++) {
        const colpita = f > .4 + k * .08;
        const giu = colpita ? clamp01((f - .4 - k * .08) * 3) : 0;
        for (let i = 0; i < 9; i++) d(-9 + k * 4.4 + (i % 3) * .9, 1.4 - giu * 1.6, -6 + Math.floor(i / 3) * 1.1, 1, P.grigio);
        for (let y = 0; y < 3; y++) d(-9 + k * 4.4 + .9, 2.4 + y - giu * 1.6, -5, .5, P.grigio);
      }
      for (let k = 0; k < 6; k++) {                                   // gli aerei
        const p = ((t * .5 + k * .17) % 1);
        d(-13 + p * 26, 9 + Math.sin(k) * 1.4, -8 + k * 3, .8, P.nero);
        if (p > .4 && p < .6) d(-13 + p * 26, 8 - (p - .4) * 30, -8 + k * 3, .4, P.ferro);
      }
      onde(d, t, 12, 4, [12, 7]);
      for (let i = 0; i < 10; i++) fuoco(d, t, -9 + (i % 5) * 4.4, 2, -6, 4, .6, i * .1);
    } };
},

anzio(rng) {
  return { cielo: GIORNO, raggio: CALDO,
    statici(m) { porto(m, 3, rng, P.sabbia); for (let i = 0; i < 4; i++) casa(m, -9 + i * 6, 9, 4, 3, 3, P.tela, P.tetto, 1); },
    dinamici(d, t) {
      /* Doveva aggirare la linea in pochi giorni: diventa una testa di ponte
         assediata per quattro mesi, con il mare alle spalle. */
      const f = (t * .08) % 1;
      onde(d, t, 12, 3, [12, 10]);
      const sbarco = Math.min(1, f * 3);
      for (let k = 0; k < 4; k++) {
        const x = -9 + k * 6;
        for (let i = 0; i < 6; i++) d(x + i * .85, 1.3, -2 + sbarco * 3, 1, P.grigio);
      }
      for (let i = 0; i < 20; i++) {
        const p = clamp01(sbarco * 1.4 - (i % 10) * .04);
        omino(d, -9 + (i % 10) * 2, 2, 2 + p * 4, P.divisa, P.pelle, .78);
      }
      const bloccati = clamp01((f - .4) * 2);
      for (let i = 0; i < 14; i++) {
        if (bloccati <= 0) break;
        const g = (t * .9 + i * .07) % 1;
        d(-8 + i * 1.2, 2 + g * 4, 11, .8 * (1 - g), g < .3 ? P.fuoco : P.fumo);
      }
    } };
},

cassino(rng) {
  return { cielo: CUPO, nebbia: 0x2e2e30, raggio: 0xc8bca0, ambiente: .5,
    statici(m) { collina(m, 12, 8, P.roccia, P.erbaScura); },
    dinamici(d, t) {
      /* Quattro battaglie e l'abbazia rasa al suolo dai bombardamenti: la
         sfonderanno mesi dopo, e i morti si contano a decine di migliaia. */
      const f = (t * .08) % 1;
      const intatta = f < .35;
      const h = intatta ? 5 : Math.max(0, 5 - (f - .35) * 12);
      for (let y = 0; y < h; y++)
        for (let dx = -3; dx <= 3; dx++) for (let dz = -2; dz <= 2; dz++) {
          if (Math.abs(dx) < 3 && Math.abs(dz) < 2 && y < h - 1) continue;
          d(dx, 9 + y, dz, 1, y === Math.floor(h) - 1 ? P.tetto : P.marmo);
        }
      for (let k = 0; k < 6; k++) {                                   // i bombardieri
        const p = ((t * .35 + k * .17) % 1);
        d(-13 + p * 26, 16, -8 + k * 3, .9, P.nero);
        if (p > .45 && p < .55 && intatta) d(-13 + p * 26, 15 - (p - .45) * 60, -8 + k * 3, .5, P.ferro);
      }
      for (let i = 0; i < 16; i++) {
        if (intatta) break;
        omino(d, -8 + (i % 8) * 2, 1.6 + Math.max(0, (8 - Math.hypot(-8 + (i % 8) * 2, 8) * .66)), 8, P.divisa, P.pelle, .78);
      }
      for (let i = 0; i < 16; i++) {
        const g = (t * .7 + i * .06) % 1;
        d(-4 + (i % 8) * 1.2, 9 + g * 5, -2 + (i % 4), .9 * (1 - g), g < .3 ? P.fuoco : P.fumo);
      }
    } };
},

/* ==================== guerre e rivolte ==================== */

dionisio(rng) {
  return { cielo: TRAMONTO, raggio: CALDO,
    statici(m) { porto(m, 2, rng, P.sabbia); mura(m, -10, 4, 21, 6, 6, P.pietraChiara); },
    dinamici(d, t) {
      /* Sedici chilometri di mura e le prime catapulte della storia: la guerra
         diventa una questione di ingegneri. */
      const f = (t * .12) % 1.3;
      const tratti = Math.floor((f / 1.3) * 20);
      for (let i = 0; i < tratti; i++) d(-10 + i, 7.4, 4, .9, P.pietraChiara);
      for (let k = 0; k < 3; k++) {
        const car = Math.sin(t * 1.4 + k) * .5;
        for (let i = 0; i < 3; i++) d(-6 + k * 6 + car, 7.4 + i * .5, 6, .7, P.legno);
        const g = ((t * .6 + k * .33) % 1);
        d(-6 + k * 6 - g * 5.5, 9 + Math.sin(g * Math.PI) * 5, 6 - g * 6, .8, P.roccia);   // il masso ricade dentro le mura
      }
      onde(d, t, 12, 3, [12, 10]);
    } };
},

cinocefale(rng) {
  return { cielo: GIORNO, raggio: CALDO,
    statici(m) { campo(m, 12, rng, 1.4); },
    dinamici(d, t) {
      /* La legione manovra a manipoli sul terreno rotto, la falange no: da qui
         in poi il Mediterraneo parla latino. */
      const f = (t * .1) % 1;
      const rompe = clamp01((f - .35) * 2.2);
      for (let i = 0; i < 18; i++)                                     // la falange, compatta
        omino(d, 4 - rompe * 2 + (i % 9) * .6, 1.8, -5 + Math.floor(i / 9) * 1.2, P.bronzo, P.pelle, .8);
      for (let i = 0; i < 18; i++)                                     // i manipoli, sparsi
        omino(d, -8 + rompe * 4 + (i % 3) * 1.2 + Math.floor(i / 9) * 3, 1.8,
          -6 + (i % 9) * 1.4, P.rosso, P.pelle, .8);
      for (let i = 0; i < 12; i++) d(4 - rompe * 2 + (i % 9) * .6, 3.6, -5 + Math.floor(i / 9) * 1.2, .3, P.legno);
      polverone(d, t);
    } };
},

mario(rng) {
  return { cielo: GIORNO, raggio: CALDO,
    statici(m) { campo(m, 12, rng, .4); mura(m, -3, -4, 7, 7, 4, P.terraScura); },
    dinamici(d, t) {
      /* Arruolando i nullatenenti si creano legioni fedeli al comandante e non
         allo Stato: è il meccanismo che manderà in pezzi la Repubblica. */
      const f = (t * .12) % 1.3;
      for (let i = 0; i < 24; i++) {
        const p = ((f + i / 24) % 1);
        const dentro = p > .35;
        omino(d, -11 + p * 22, 1.4, -3 + (i % 4) * 1.2,
          dentro ? P.rosso : P.terraScura, P.pelle, .78);
        if (dentro) d(-11 + p * 22, 3.2, -3 + (i % 4) * 1.2, .3, P.ferro);
      }
      omino(d, 0, 1.4, 5, P.viola, P.pelle, 1);
      for (let i = 0; i < 6; i++) d(-2 + i * .9, 3.4, 5, .35, P.oro);   // le aquile
    } };
},

'guerra-sociale'(rng) {
  return { cielo: TRAMONTO, raggio: FUOCO,
    statici(m) { campo(m, 12, rng, 1); mura(m, -4, -5, 9, 9, 5, P.pietraChiara); },
    dinamici(d, t) {
      /* Gli alleati si ribellano per ottenere la cittadinanza e fondano una
         loro capitale: perdono la guerra e ottengono la cittadinanza. */
      const f = (t * .09) % 1;
      const guerra = f < .6;
      if (guerra) scontro(d, t, P.rosso, P.marrone, 16, clamp01(f * 2) * 2.6);
      else {
        for (let i = 0; i < 20; i++) {
          const p = clamp01((f - .6) * 2.5 - (i % 10) * .03);
          omino(d, -9 + (i % 10) * 2, 1.6, -4 + Math.floor(i / 10) * 2.4, P.rosso, P.pelle, .8);
          if (p > .3) d(-9 + (i % 10) * 2, 3.2, -4 + Math.floor(i / 10) * 2.4, .35, P.oro);
        }
      }
      bandiera(d, t, 0, 6.4, -5, 2, guerra ? [P.marrone, P.marrone] : [P.rosso, P.oro], 0);
      polverone(d, t, guerra ? 12 : 4);
    } };
},

silla(rng) {
  return { cielo: CUPO, raggio: FUOCO, ambiente: .55, fronte: FR,
    statici(m) { interno(m, 19, 8, 11, P.marmo, P.marmoOmbra); },
    dinamici(d0, t) {
      /* Le liste di proscrizione affisse in pubblico: chi ci finisce può essere
         ucciso da chiunque, e i beni vanno a chi lo denuncia. */
      const f = (t * .13) % 1.3;
      const d = dissolvenza(d0, f, 1.3);   // il ciclo si ritira invece di spegnersi
      const nomi = Math.floor((f / 1.3) * 26);
      for (let i = 0; i < nomi; i++)
        d(-6 + (i % 13) * 1, 4 + Math.floor(i / 13) * 1.4, -6.4, .8, P.tela);
      for (let i = 0; i < 12; i++) {
        const p = ((f * 2 + i / 12) % 1);
        omino(d, -7 + p * 14, 1.4, 1 + (i % 3), p > .5 ? P.nero : P.tela, P.pelle, .78);
      }
      omino(d, 0, 1.4, -3, P.rosso, P.pelle, 1);
    } };
},

farsalo(rng) {
  return { cielo: TRAMONTO, raggio: FUOCO,
    statici(m) { campo(m, 12, rng, .6); },
    dinamici(d, t) {
      /* Si decide altrove ma cambia Roma: chi torna è padrone assoluto, e
         riorganizza calendario, province e cittadinanza. */
      const f = (t * .1) % 1;
      const sfonda = clamp01((f - .35) * 2.4);
      for (let i = 0; i < 8; i++) {                                    // la cavalleria respinta
        omino(d, 6 - sfonda * 3, 2.4, -6 + i * 1.6, P.viola, P.pelle, .8);
        d(6 - sfonda * 3, 1.6, -6 + i * 1.6, 1.1, P.terraScura);
      }
      for (let i = 0; i < 10; i++)                                     // la quarta linea nascosta
        omino(d, -2 + sfonda * 6, 1.8, -5 + i * 1.2, P.rosso, P.pelle, .8);
      scontro(d, t, P.rosso, P.viola, 12, clamp01(f * 1.6) * 2, -3);
      polverone(d, t);
    } };
},

vespasiano(rng) {
  return { cielo: CUPO, raggio: CALDO, ambiente: .6, fronte: FR,
    statici(m) { interno(m, 19, 9, 11, P.marmo, P.marmoOmbra); },
    dinamici(d, t) {
      /* Quattro imperatori in dodici mesi: la porpora passa di spalla in
         spalla, e si scopre che si può fare un imperatore fuori da Roma. */
      const f = (t * .16) % 1.2;
      const chi = Math.floor(f * 4);
      const colori = [P.viola, P.rosso, P.oro, P.ruggine];
      for (let i = 0; i < 4; i++) {
        const vivo = i === chi;
        omino(d, -4.5 + i * 3, 1.4, -3, colori[i], P.pelle, vivo ? 1.05 : .75);
        if (vivo) d(-4.5 + i * 3, 3.6, -3, .7, P.oro);
      }
      for (let i = 0; i < 12; i++)
        omino(d, -7 + i * 1.3, 1.4, 2, P.ferro, P.pelle, .78);
      for (let i = 0; i < 6; i++) {
        const g = (t * 1.2 + i * .17) % 1;
        d(-4.5 + chi * 3, 4 + g * 3, -3, .35 * (1 - g), P.oro);
      }
    } };
},

stilicone(rng) {
  return { cielo: CUPO, nebbia: 0x2e3238, raggio: 0xd0c0a4, ambiente: .55,
    statici(m) {
      suolo(m, 12, P.terraScura, P.terra, rng);
      for (let x = -12; x <= 12; x++) for (let z = -12; z <= -6; z++) m.p(x, 0, z, P.acqua);
      mura(m, -6, 0, 13, 9, 6, P.pietraChiara);
    },
    dinamici(d, t) {
      /* Paludi davanti e un porto dietro: la corte si sposta a Ravenna e ci
         resta tre secoli e mezzo. */
      const f = (t * .1) % 1;
      for (let i = 0; i < 14; i++) {
        const p = clamp01(f * 1.4 - i * .04);
        omino(d, -8 + p * 8, 1.4, 8 - p * 6, i % 3 ? P.tela : P.viola, P.pelle, .78);
        if (i % 4 === 0) d(-8 + p * 8, 3.2, 8 - p * 6, .5, P.oro);
      }
      for (let x = -12; x <= 12; x += 3) for (let z = -12; z <= -6; z += 3)
        d(x, .6 + Math.sin(t * 1.6 + x * .4 + z * .3) * .2, z, 2.4, P.acquaChiara);
      for (let i = 0; i < 10; i++) {                                   // la nebbia della palude
        const g = (t * .12 + i * .1) % 1;
        d(-12 + g * 24, 1.4, -5 + (i % 4) * 1.6, 1.6, P.fumo);
      }
    } };
},

'ludovico-ii'(rng) {
  return { cielo: TRAMONTO, raggio: FUOCO,
    statici(m) { porto(m, 5, rng, P.sabbia); mura(m, -7, 7, 15, 5, 6, P.pietraChiara); },
    dinamici(d, t) {
      /* Cinque anni d'assedio per strappare Bari agli Arabi, e poi lo cattura
         il principe che avrebbe dovuto aiutarlo. */
      const f = (t * .08) % 1;
      const presa = clamp01(f * 1.6);
      onde(d, t, 12, 3, [12, 12]);
      for (let i = 0; i < 16; i++)
        omino(d, -8 + (i % 8) * 2, 2, 4 - presa * 1.4, P.oliva, P.pelle, .8);
      for (let i = 0; i < 8; i++) omino(d, -5 + i * 1.6, 8.6, 7, presa > .7 ? P.oliva : P.verdeIt, P.pelle, .8);
      const tradito = clamp01((f - .7) * 3);
      if (tradito > 0) {
        omino(d, 0, 2, -2 - tradito * 4, P.viola, P.pelle, .95);
        for (let i = 0; i < 3; i++) omino(d, -1.5 + i * 1.5, 2, -4 - tradito * 4, P.marrone, P.pelle, .8);
      }
    } };
},

'arduino-ivrea'(rng) {
  return { cielo: CUPO, raggio: CALDO, ambiente: .6, fronte: FR,
    statici(m) { interno(m, 17, 8, 10, P.pietraChiara, P.legno); },
    dinamici(d, t) {
      /* Un marchese piemontese si fa incoronare contro l'imperatore tedesco e
         resiste tredici anni: dopo di lui, nessun re italiano fino al 1861. */
      const f = (t * .1) % 1;
      omino(d, 0, 1.4, -3, P.oliva, P.pelle, 1.05);
      const corona = clamp01(f * 2) * (1 - clamp01((f - .7) * 3));
      d(0, 3.6, -3, .8 * corona, P.oro);
      for (let i = 0; i < 10; i++)
        omino(d, -6 + i * 1.4, 1.4, 1, P.ferro, P.pelle, .78);
      for (let i = 0; i < 8; i++) {                                    // gli avversari, sempre più vicini
        const p = clamp01((f - .3) * 1.6);
        omino(d, -6 + i * 1.8, 1.4, 8 - p * 5, P.grigioverde, P.pelle, .78);
      }
    } };
},

'vespro-caltabellotta'(rng) {
  return { cielo: GIORNO, raggio: CALDO, fronte: FR,
    statici(m) { interno(m, 17, 7, 10, P.sabbia, P.legno); },
    dinamici(d, t) {
      /* Vent'anni di guerra finiscono con una firma che spacca il regno in due:
         due Sicilie invece di una, e per secoli. */
      const f = (t * .12) % 1.3;
      const firma = clamp01(f * 1.6);
      d(0, 2.6, -1, 1.4, P.tela);
      omino(d, -2.5, 1.4, 1, P.corallo, P.pelle, .95);
      omino(d, 2.5, 1.4, 1, P.verdeIt, P.pelle, .95);
      for (let i = 0; i < 12; i++) {                                   // la linea che divide
        const p = clamp01((firma - (i / 14)) * 5);
        if (p <= 0) continue;
        const da = arrivo(d, p);
        da(-5.5 + i, 2.8, -1, .35, P.nero);
      }
      for (let i = 0; i < 6; i++) {
        if (firma < .8) break;
        d(-4 + i * 1.6, 4.4, -5, .7, i < 3 ? P.corallo : P.verdeIt);
      }
    } };
},

'compagnie-ventura'(rng) {
  return { cielo: TRAMONTO, raggio: CALDO,
    statici(m) { campo(m, 12, rng, 1); for (let i = 0; i < 4; i++) casa(m, 8, -9 + i * 5, 3, 3, 3, P.tela, P.tetto, 1); },
    dinamici(d, t) {
      /* Si combatte per chi paga: la stessa compagnia cambia bandiera a metà
         scena, e nessuno se ne scandalizza. */
      const f = (t * .12) % 1;
      const lato = f < .5;
      for (let i = 0; i < 14; i++) {
        const z = -6 + (i % 7) * 2;
        d(-4 + (lato ? 0 : 8), 2, z, 1.1, P.terraScura);
        omino(d, -4 + (lato ? 0 : 8), 2.8, z, lato ? P.blu : P.rosso, P.pelle, .8);
      }
      for (let i = 0; i < 8; i++) d(-9, 2.4 + (i % 4) * .4, -4 + Math.floor(i / 4) * 3, .5, P.oro);
      bandiera(d, t, -4 + (lato ? 0 : 8), 4, 6, 2, lato ? [P.blu, P.biancoIt] : [P.rosso, P.oro], 0);
      polverone(d, t, 8, 0, 2);
    } };
},

scisma(rng) {
  return { cielo: CUPO, raggio: CALDO, ambiente: .55, fronte: FR,
    statici(m) { interno(m, 19, 10, 11, P.marmo, P.marmoOmbra); },
    dinamici(d, t) {
      /* Due papi, poi tre, che si scomunicano a vicenda per quarant'anni:
         l'autorità della Chiesa esce a pezzi. */
      const f = (t * .12) % 1.3;
      const quanti = 1 + Math.floor(clamp01(f * 1.4) * 2);
      for (let i = 0; i < quanti; i++) {
        const x = quanti === 1 ? 0 : -4 + i * (8 / (quanti - 1));
        omino(d, x, 1.4, -3, P.biancoIt, P.pelle, 1);
        d(x, 3.6, -3, .7, P.oro);
        for (let k = 0; k < 5; k++) omino(d, x - 2 + k, 1.4, 1, [P.viola, P.rosso, P.blu][i], P.pelle, .7);
      }
      for (let i = 0; i < 10; i++) {                                   // le scomuniche che volano
        if (quanti < 2) break;
        const g = (t * .8 + i * .1) % 1;
        d(-4 + g * 8, 4.4 + Math.sin(g * Math.PI) * 1.6, -3, .3, P.rosso);
      }
    } };
},

'venezia-terraferma'(rng) {
  return { cielo: GIORNO, raggio: CALDO,
    statici(m) {
      for (let x = -12; x <= 12; x++) for (let z = -12; z <= 12; z++) m.p(x, 0, z, P.acqua);
      for (let x = -12; x <= 12; x++) for (let z = -12; z <= 4; z++) { m.p(x, 1, z, P.erbaScura); m.p(x, 0, z, P.terra); }
    },
    dinamici(d, t) {
      /* Dopo secoli di solo mare la Repubblica prende Bergamo e Brescia:
         servono grano e legname, e il mare da solo non basta più. */
      const f = (t * .11) % 1.3;
      const citta = [[-9, -9], [-4, -6], [1, -9], [6, -5], [-7, -2], [4, -1], [9, -8]];
      for (let i = 0; i < citta.length; i++) {
        const presa = f > i / citta.length;
        const [x, z] = citta[i];
        d(x, 2.4, z, 1.4, presa ? P.rossoIt : P.grigio);
        d(x, 3.4, z, .9, presa ? P.oro : P.grigio);
        if (presa) bandiera(d, t, x, 4, z, 2, [P.rossoIt, P.oro], i);
      }
      for (let x = -12; x <= 12; x += 3) for (let z = 5; z <= 12; z += 3)
        d(x, .6 + Math.sin(t * 1.6 + x * .4) * .2, z, 2.4, P.acquaChiara);
      for (let i = 0; i < 4; i++) nave(d, t, -9 + i * 6, 1.2, 8, 1, 5, P.legno, P.rossoIt, 0);
    } };
},

'lega-cambrai'(rng) {
  return { cielo: CUPO, raggio: FUOCO,
    statici(m) { campo(m, 12, rng, .6); },
    dinamici(d, t) {
      /* Mezza Europa si allea per spartirsi una repubblica: quattro eserciti
         convergono, e in un giorno la terraferma è perduta. */
      const f = (t * .1) % 1;
      const stretta = clamp01(f * 1.6);
      const parti = [[P.blu, 0], [P.ruggine, 1.57], [P.oro, 3.14], [P.biancoIt, 4.71]];
      for (let s = 0; s < 4; s++)
        for (let i = 0; i < 6; i++) {
          const a = parti[s][1] + (i - 2.5) * .16, r = 12 - stretta * 8;
          omino(d, Math.cos(a) * r, 1.6, Math.sin(a) * r * .8, parti[s][0], P.pelle, .8);
        }
      for (let i = 0; i < 10; i++)
        omino(d, -2 + (i % 5) * 1.1, 1.6, -1 + Math.floor(i / 5) * 1.4, P.rossoIt, P.pelle, .8);
      polverone(d, t, 14, 0, 1.6);
    } };
},

'siena-1555'(rng) {
  return { cielo: CUPO, nebbia: 0x30302c, raggio: 0xd0c0a0, ambiente: .5,
    statici(m) { piazza(m, 11, rng, P.cotto, P.tetto, 4); mura(m, -8, -8, 17, 17, 6, P.cotto); },
    dinamici(d, t) {
      /* Quindici mesi d'assedio: la città si svuota per fame, e l'ultima
         repubblica toscana finisce senza una battaglia. */
      const f = (t * .08) % 1;
      const fame = clamp01(f * 1.3);
      const rimasti = Math.round(24 * (1 - fame * .8));
      folla(d, t, 0, 0, rimasti, 1.6, [P.tela, P.terraScura], 1.2);
      for (let i = 0; i < 20; i++)
        omino(d, Math.cos(i * .314) * 11, 1.4, Math.sin(i * .314) * 11, P.ruggine, P.pelle, .8);
      const resa = clamp01((f - .75) * 4);
      for (let k = 0; k < 3; k++) {
        if (resa <= 0) break;
        bandiera(d, t, -4 + k * 4, 7.4, -8, 2, [P.ruggine, P.oro], k);
      }
    } };
},

partenopea(rng) {
  return { cielo: TRAMONTO, raggio: FUOCO,
    statici(m) { piazza(m, 11, rng, P.tela, P.tetto, 4); },
    dinamici(d, t) {
      /* Cinque mesi di repubblica colta e senza popolo: al ritorno del re,
         cento fra i migliori intellettuali del Regno finiscono impiccati. */
      const f = (t * .08) % 1;
      const repubblica = f < .55;
      if (repubblica) {
        for (let i = 0; i < 4; i++) bandiera(d, t, -6 + i * 4, 2, 0, 3, [P.blu, P.oro, P.rossoIt], i);
        for (let i = 0; i < 12; i++) omino(d, -5 + (i % 6) * 2, 1.4, 4 + Math.floor(i / 6) * 2, P.viola, P.pelle, .8);
        folla(d, t, 0, -5, 10, 2, [P.terraScura], 1.2);
      } else {
        const ritorno = clamp01((f - .55) * 2.4);
        for (let i = 0; i < 8; i++) {
          for (let y = 0; y < 4; y++) d(-7 + i * 2, 2 + y, 0, .3, P.tronco);
          if (ritorno > .5) d(-7 + i * 2, 4.4, 0, .6, P.nero);
        }
        folla(d, t, 0, 5, 18, 2, [P.nero, P.terraScura], 1.2);
      }
    } };
},

'pisacane-vandee'(rng) {
  return { cielo: TRAMONTO, raggio: FUOCO,
    statici(m) { collina(m, 12, 5, P.erbaScura, P.erba); for (let i = 0; i < 4; i++) casa(m, -9 + i * 6, 9, 3, 3, 3, P.tela, P.tetto, 1); },
    dinamici(d, t) {
      /* La controrivoluzione ha basi popolari quanto la rivoluzione: un
         cardinale risale la Calabria con un esercito di contadini. */
      const f = (t * .09) % 1;
      const risale = clamp01(f * 1.4);
      const quanti = Math.round(6 + risale * 24);
      for (let i = 0; i < quanti; i++) {
        const p = clamp01(risale * 1.3 - i * .02);
        omino(d, -8 + (i % 10) * 1.8, 1.4 + p * 3.4, 10 - p * 14,
          i % 5 ? P.terraScura : P.rosso, P.pelle, .78);
      }
      for (let i = 0; i < 6; i++) d(-4 + i * 1.6, 4.4 + risale * 2, -2, .4, P.oro);
      polverone(d, t, 10, 0, 3);
    } };
},

'blocco-continentale'(rng) {
  return { cielo: CUPO, nebbia: 0x2e3440, raggio: 0xc8c0a8, ambiente: .55,
    statici(m) { porto(m, 5, rng); for (let i = 0; i < 5; i++) m.guscio(-10 + i * 4, 2, 7, 3, 4, 4, P.cotto); },
    dinamici(d, t) {
      /* Chiusi i porti alle merci inglesi, i traffici crollano e prospera il
         contrabbando: Genova e Livorno pagano il conto più caro. */
      const f = (t * .1) % 1;
      onde(d, t, 12, 3, [12, 8]);
      const chiuso = clamp01(f * 1.6);
      for (let k = 0; k < 3; k++) {                                    // le navi che non attraccano
        const x = -9 + k * 7;
        nave(d, t, x, 1.2, -2 - chiuso * 7, 1, 6, P.legno, P.tela, 0);
      }
      for (let i = 0; i < 8; i++) {                                    // le barche del contrabbando
        if (chiuso < .5) break;
        const p = ((t * 1.2 + i * .3) % 1);
        d(-11 + p * 22, 1.2, 3, .7, P.nero);
      }
      for (let i = 0; i < 10; i++) omino(d, -9 + i * 2, 2, 6, P.terraScura, P.pelle, .75);
    } };
},

'leva-napoleonica'(rng) {
  return { cielo: CUPO, raggio: CALDO, ambiente: .6, fronte: FR,
    statici(m) { interno(m, 17, 7, 10, P.tela, P.legno); },
    dinamici(d, t) {
      /* Per la prima volta lo Stato chiama alle armi per sorteggio: chi pesca
         il numero sbagliato parte, e molti non torneranno. */
      const f = (t * .16) % 1.3;
      for (let i = 0; i < 12; i++) {
        const p = ((f + i / 12) % 1);
        const preso = ((i * 7) % 3) === 0;
        omino(d, -8 + p * 16, 1.4, 4 - (p > .4 && p < .6 ? 2 : 0),
          p > .6 && preso ? P.blu : P.terraScura, P.pelle, .78);
      }
      d(0, 2.6, -1, 1.2, P.legno);
      for (let i = 0; i < 8; i++) d(-1.4 + (i % 4) * .9, 3.2, -1, .3, P.tela);
      omino(d, 3.4, 1.4, -1, P.nero, P.pelle, .9);
    } };
},

carboneria(rng) {
  return { cielo: NOTTE, raggio: 0xffc890, ambiente: .4, fronte: FR,
    statici(m) { interno(m, 15, 6, 9, P.pietraScura, P.tronco, P.pietra); },
    dinamici(d, t) {
      /* Riunioni al buio, gradi e parole d'ordine: una costituzione ottenuta in
         nove mesi, e persa altrettanto in fretta. */
      const f = (t * .12) % 1.2;
      for (let i = 0; i < 10; i++) {
        const a = i / 10 * Math.PI * 2;
        omino(d, Math.cos(a) * 3.4, 1.4, -1 + Math.sin(a) * 2.4, P.nero, P.pelle, .8);
      }
      fuoco(d, t, 0, 1.4, -1, 6, .5, 0);
      const carta = clamp01((f - .5) * 2.4) * (1 - clamp01((f - .85) * 6));
      d(0, 3.6, -1, 1.4 * carta, P.tela);
      for (let i = 0; i < 6; i++) {
        if (carta < .5) break;
        d(-1.5 + i * .6, 3.8, -1, .3, P.nero);
      }
    } };
},

'moti-1821'(rng) {
  return { cielo: CUPO, raggio: CALDO,
    statici(m) { piazza(m, 11, rng, P.cotto, P.tetto, 4); },
    dinamici(d, t) {
      /* Studenti e ufficiali chiedono la costituzione; il re oscilla, poi
         arriva la repressione: molti in esilio, alcuni sul patibolo. */
      const f = (t * .09) % 1;
      const speranza = f < .5;
      folla(d, t, 0, 0, 22, 1.8, speranza ? [P.viola, P.blu] : [P.nero], 1.2);
      for (let k = 0; k < 3; k++) {
        if (!speranza) break;
        bandiera(d, t, -4 + k * 4, 2, -4, 3, [P.verdeIt, P.biancoIt, P.rossoIt], k);
      }
      if (!speranza) {
        const p = clamp01((f - .5) * 2.4);
        for (let i = 0; i < 10; i++)
          omino(d, -9 + i * 2, 1.4, 9 - p * 6, P.biancoIt, P.pelle, .8);
        for (let i = 0; i < 8; i++)
          omino(d, -7 + i * 2, 1.4, -9 - p * 2.5, P.viola, P.pelle, .75);
      }
    } };
},

'moti-1831'(rng) {
  return { cielo: CUPO, nebbia: 0x2e3038, raggio: 0xc8bca0, ambiente: .55,
    statici(m) { piazza(m, 11, rng, P.tela, P.tetto, 4); },
    dinamici(d, t) {
      /* Insorgono contando su Parigi. Parigi non arriva, e gli austriaci sì. */
      const f = (t * .09) % 1;
      folla(d, t, 0, 0, 20, 1.8, [P.viola, P.terraScura], 1.2);
      for (let i = 0; i < 10; i++) {                                   // gli occhi verso ovest
        if (f > .5) break;
        const g = (t * .3 + i * .1) % 1;
        d(-11 + g * 6, 5 + Math.sin(i) * 1.4, -6 + (i % 5) * 3, .4 * (1 - g), P.oro);
      }
      const austriaci = clamp01((f - .5) * 2.2);
      for (let i = 0; i < 16; i++) {
        if (austriaci <= 0) break;
        omino(d, -11 + austriaci * 8 + (i % 8) * 1.2, 1.4, -4 + Math.floor(i / 8) * 3, P.biancoIt, P.pelle, .8);
      }
    } };
},

'palermo-1848'(rng) {
  return { cielo: TRAMONTO, raggio: FUOCO,
    statici(m) { piazza(m, 11, rng, P.sabbia, P.tetto, 4); },
    dinamici(d, t) {
      /* Il 12 gennaio: l'insurrezione siciliana precede di settimane quella di
         Parigi. Il Quarantotto europeo comincia qui. */
      const f = (t * .1) % 1;
      const scoppio = clamp01(f * 2);
      folla(d, t, 0, 0, 26, 1.6 + scoppio, [P.terraScura, P.tela, P.rosso], 1.2);
      for (let i = 0; i < 10; i++) {
        if (scoppio < .4) break;
        d(-5 + (i % 5) * 2.2, 2 + Math.floor(i / 5) * .9, -3, 1, i % 2 ? P.legno : P.grigio);
      }
      for (let k = 0; k < 4; k++) {
        if (scoppio < .6) break;
        bandiera(d, t, -6 + k * 4, 2, 5, 3, [P.verdeIt, P.biancoIt, P.rossoIt], k);
      }
      for (let i = 0; i < 8; i++) {                                    // la scintilla che corre altrove
        if (f < .7) break;
        const g = (t * .6 + i * .12) % 1;
        d(-2 + g * 12, 8 + Math.sin(g * Math.PI) * 3, -8, .4 * (1 - g), P.brace);
      }
    } };
},

brigantaggio(rng) {
  return { cielo: CUPO, nebbia: 0x2c3028, raggio: 0xc8bc9c, ambiente: .5,
    statici(m) { collina(m, 12, 6, P.foglieScure, P.erbaScura); for (let i = 0; i < 3; i++) casa(m, -9 + i * 8, 10, 3, 3, 3, P.tela, P.tetto, 1); },
    dinamici(d, t) {
      /* Una guerra civile mai dichiarata: più soldati impegnati che in tutte le
         guerre d'indipendenza, e decine di migliaia di morti. */
      const f = (t * .09) % 1;
      for (let i = 0; i < 12; i++) {                                   // i briganti fra i boschi
        const a = t * .2 + i * .52;
        const r = 5 + (i % 4) * 1.4;
        omino(d, Math.cos(a) * r, 6.4 - (i % 3), Math.sin(a) * r, P.terraScura, P.pelle, .78);
      }
      const rastrellamento = clamp01(f * 1.4);
      for (let i = 0; i < 18; i++) {
        const a = i / 18 * Math.PI * 2, r = 12 - rastrellamento * 5;
        omino(d, Math.cos(a) * r, 1.4, Math.sin(a) * r, P.divisa, P.pelle, .8);
      }
      for (let i = 0; i < 8; i++) fuoco(d, t, -9 + i * 2.4, 1.6, 10, 3, .4, i * .1);
    } };
},

'tasse-macinato'(rng) {
  return { cielo: CUPO, raggio: CALDO,
    statici(m) {
      piazza(m, 11, rng, P.cotto, P.tetto, 3);
      for (let y = 0; y < 5; y++) m.p(0, 1 + y, -2, P.legno);          // il mulino
      for (let i = 0; i < 8; i++) {
        const a = i / 8 * Math.PI * 2;
        m.p(Math.round(Math.cos(a) * 3), 5 + Math.round(Math.sin(a) * 3), -1, P.legno);
      }
    },
    dinamici(d, t) {
      /* Un contatore su ogni mulino tassa il pane: rivolte in tutto il
         Centro-Nord, e più di duecento morti. */
      const f = (t * .1) % 1;
      const a = t * .8;
      for (let i = 0; i < 8; i++) {
        const an = a + i / 8 * Math.PI * 2;
        d(Math.cos(an) * 3, 5 + Math.sin(an) * 3, -1, .7, P.legno);
      }
      d(1.6, 3.4, -1, .6, P.ferro);                                    // il contatore
      const rivolta = clamp01((f - .4) * 2.4);
      folla(d, t, 0, 4, 20, 1.6 + rivolta, [P.terraScura, P.tela], 1.2);
      for (let i = 0; i < 8; i++) {
        if (rivolta < .6) break;
        d(-4 + i * 1.2, 2.4, 2, .5, P.sabbia);                         // il pane conteso
      }
    } };
},

'fasci-siciliani'(rng) {
  return { cielo: GIORNO, raggio: CALDO,
    statici(m) { piazza(m, 11, rng, P.sabbia, P.tetto, 3); },
    dinamici(d, t) {
      /* Contadini e zolfatari si organizzano per chiedere terra e contratti:
         arriva l'esercito e viene proclamato lo stato d'assedio. */
      const f = (t * .09) % 1;
      const organizzati = clamp01(f * 1.6);
      folla(d, t, 0, 0, 24, 1.6, [P.terraScura, P.tela], 1.2);
      for (let k = 0; k < 4; k++) {
        if (organizzati < .3) break;
        bandiera(d, t, -6 + k * 4, 2, -4, 3, [P.rossoIt, P.rossoIt], k);
      }
      const esercito = clamp01((f - .55) * 2.4);
      for (let i = 0; i < 16; i++) {
        if (esercito <= 0) break;
        omino(d, -11 + esercito * 7 + (i % 8) * 1.2, 1.4, -4 + Math.floor(i / 8) * 3, P.divisa, P.pelle, .8);
      }
    } };
},

'ragazzi-99'(rng) {
  return { cielo: CUPO, nebbia: 0x363c44, raggio: 0xc8bca0, ambiente: .5,
    statici(m) { campo(m, 12, rng, .6); for (let x = -12; x <= 12; x++) for (let z = -1; z <= 1; z++) m.p(x, 0, z, P.terraScura); },
    dinamici(d, t) {
      /* Diciottenni chiamati alle armi dopo poche settimane d'istruzione:
         entrano in fila da una parte ed escono in trincea dall'altra. */
      const f = (t * .14) % 1.3;
      for (let i = 0; i < 18; i++) {
        const p = ((f + i / 18) % 1);
        const dentro = p > .45;
        omino(d, -11 + p * 22, dentro ? .4 : 1.4, -1 + (i % 3),
          dentro ? P.divisa : P.tela, P.pelle, .75);
      }
      for (let i = 0; i < 10; i++) d(-9 + i * 2, 1.6, -4, .35, P.ferro);
      for (let i = 0; i < 12; i++) {
        const g = (t * .8 + i * .08) % 1;
        d(4 + (i % 6) * 1.4, 1 + g * 4, 4, .8 * (1 - g), g < .3 ? P.fuoco : P.fumo);
      }
    } };
},

fiume(rng) {
  return { cielo: GIORNO, raggio: CALDO,
    statici(m) { porto(m, 4, rng); piazza(m, 10, rng, P.cotto, P.tetto, 4); },
    dinamici(d, t) {
      /* Duemila volontari occupano la città e la tengono sedici mesi, con una
         costituzione che mette la musica fra le istituzioni dello Stato. */
      const f = (t * .09) % 1;
      const arrivo = clamp01(f * 1.6);
      for (let i = 0; i < 20; i++) {
        const p = clamp01(arrivo * 1.4 - (i % 10) * .03);
        omino(d, -10 + (i % 10) * 2, 1.4, -11 + p * 10, P.divisa, P.pelle, .78);
      }
      omino(d, 0, 1.4, 0, P.nero, P.pelle, 1);
      for (let i = 0; i < 12; i++) {                                   // le note della costituzione
        if (f < .5) break;
        const g = (t * .6 + i * .08) % 1;
        d(Math.cos(i * 1.9) * (2 + g * 5), 3 + g * 5, Math.sin(i * 1.9) * (2 + g * 5), .35 * (1 - g), P.oro);
      }
      folla(d, t, 0, 5, 14, 1.8, [P.tela, P.viola], 1.2);
    } };
},

'biennio-rosso'(rng) {
  return { cielo: CUPO, raggio: CALDO,
    statici(m) { suolo(m, 12, P.pietraChiara, P.terra, rng); fabbrica(m, -10, -8, 20, 9, 6, P.cotto, 3); },
    dinamici(d, t) {
      /* Mezzo milione di operai occupa gli stabilimenti: la bandiera sale sul
         tetto, e la paura spinge borghesia e agrari verso i fasci. */
      const f = (t * .1) % 1;
      const occupata = clamp01(f * 1.8);
      for (let i = 0; i < 22; i++) {
        const p = clamp01(occupata * 1.4 - (i % 11) * .03);
        omino(d, -9 + (i % 11) * 1.8, 2, 6 - p * 9, P.terraScura, P.pelle, .78);
      }
      for (let k = 0; k < 3; k++) {
        if (occupata < .6) break;
        bandiera(d, t, -6 + k * 6, 8, -4, 3, [P.rossoIt, P.rossoIt], k);
      }
      for (let k = 0; k < 3; k++) fuoco(d, t, -9 + k * 7, 13, -7, 4, .6, k * .3);
    } };
},

squadrismo(rng) {
  return { cielo: TRAMONTO, nebbia: 0x3a3028, raggio: FUOCO, ambiente: .55,
    statici(m) { suolo(m, 12, P.erba, P.terra, rng, .6); for (let i = 0; i < 5; i++) casa(m, -10 + i * 5, -2 + (i % 2) * 6, 4, 4, 3, P.tela, P.tetto, 1); },
    dinamici(d0, t) {
      /* Nelle campagne padane le squadre incendiano camere del lavoro e
         cooperative, con la tolleranza delle autorità. */
      const f = (t * .1) % 1;
      const d = dissolvenza(d0, f, 1);   // il ciclo si ritira invece di spegnersi
      const arrivo = clamp01(f * 1.6);
      for (let k = 0; k < 3; k++) {                                    // i camion
        const x = -13 + arrivo * (10 + k * 2);
        for (let i = 0; i < 4; i++) d(x + (i % 2) * 1.2, 2.2, -8 + k * 2, 1, P.nero);
        for (let i = 0; i < 4; i++) omino(d, x + .5, 3.2, -8 + k * 2 + (i % 2), P.nero, P.pelle, .7);
      }
      const fuochi = clamp01((f - .5) * 2.4);
      for (let i = 0; i < 5; i++) {
        if (fuochi <= 0) break;
        fuoco(d, t, -10 + i * 5, 4, -2 + (i % 2) * 6, 7, 1, i * .13);
      }
      for (let i = 0; i < 8; i++) {
        if (fuochi < .3) break;
        const p = ((t * 1.6 + i * 1.4) % 22) - 11;
        omino(d, p, 1.6, 8, P.terraScura, P.pelle, .78);
      }
    } };
},

aventino(rng) {
  return { cielo: CUPO, raggio: CALDO, ambiente: .55, fronte: FR,
    statici(m) { interno(m, 19, 9, 11, P.marmo, P.marmoOmbra); },
    dinamici(d, t) {
      /* L'opposizione lascia l'aula per protesta e non torna: la protesta
         simbolica lascia campo libero. */
      const f = (t * .1) % 1;
      const uscita = clamp01(f * 1.5);
      for (let k = 0; k < 3; k++) for (let i = 0; i < 8; i++) {
        const resta = (k * 8 + i) % 3 !== 0;
        if (!resta) {
          const p = clamp01(uscita * 1.4 - (k * 8 + i) * .02);
          if (p > .9) continue;
          omino(d, -7 + i * 2, 1.4 + k, -4 + k * 1.4 + p * 12, P.viola, P.pelle, .78);
        } else omino(d, -7 + i * 2, 1.4 + k, -4 + k * 1.4, P.nero, P.pelle, .78);
      }
      for (let i = 0; i < 8; i++) {
        if (uscita < .8) break;
        d(-6 + i * 1.8, 2.4, -5.4, .8, P.legno);                       // i banchi vuoti
      }
    } };
},

'grecia-1940'(rng) {
  return { cielo: CUPO, nebbia: 0x30343a, raggio: FREDDO, ambiente: .5,
    statici(m) { valle(m, 12, 3, 8, P.neve, P.terraScura); },
    dinamici(d, t) {
      /* L'offensiva parte in ottobre, si impantana subito nel fango e nella
         neve, e serviranno i tedeschi per chiuderla. */
      const f = (t * .09) % 1;
      const avanti = clamp01(f * 1.4), indietro = clamp01((f - .5) * 1.6);
      for (let i = 0; i < 20; i++) {
        const z = -11 + (avanti - indietro) * 14 + (i % 5) * .9;
        omino(d, -2 + (i % 5), .4, z, P.divisa, P.pelle, .78);
      }
      for (let i = 0; i < 24; i++) {
        const g = (t * .8 + i * .04) % 1;
        d(((i * 6151) % 25) - 12, 12 - g * 12, ((i * 3571) % 25) - 12, .3, P.neve);
      }
      for (let i = 0; i < 8; i++) d(-2 + (i % 4) * 1.2, .2, -8 + (i % 3) * 2, .8, P.terraScura);
    } };
},

'guerra-1940'(rng) {
  return { cielo: CUPO, nebbia: 0x2e3038, raggio: 0xc8bca0, ambiente: .5,
    statici(m) { suolo(m, 12, P.sabbia, P.terra, rng, .6); },
    dinamici(d, t) {
      /* Impreparata, contando su una vittoria rapida altrui: le colonne
         partono per tre fronti e non tornano da nessuno. */
      const f = (t * .1) % 1.3;
      const fronti = [[-1, 0, P.neve], [0, -1, P.sabbia], [1, .3, P.foglieScure]];
      for (let s = 0; s < 3; s++) {
        const [dx, dz, c] = fronti[s];
        for (let i = 0; i < 8; i++) {
          const p = ((f + i / 8) % 1);
          omino(d, dx * p * 12 + (i % 3) - 1, 1.4, dz * p * 12 + (i % 2), P.divisa, P.pelle, .75);
          if (p > .8) d(dx * p * 12, 1.4, dz * p * 12, .8, c);
        }
      }
      for (let i = 0; i < 10; i++) {
        const g = (t * .5 + i * .1) % 1;
        d(Math.cos(i * 1.9) * 8, 1.4 + g * 4, Math.sin(i * 1.9) * 8, .8 * (1 - g), P.fumo);
      }
    } };
},

'otto-settembre'(rng) {
  return { cielo: CUPO, nebbia: 0x2e3038, raggio: 0xc0b8a0, ambiente: .5,
    statici(m) { piazza(m, 11, rng, P.cotto, P.tetto, 4); },
    dinamici(d, t) {
      /* Annunciato l'armistizio, il governo se ne va e l'esercito resta senza
         ordini: il paese si spacca in due nel giro di una notte. */
      const f = (t * .09) % 1;
      const annuncio = clamp01(f * 3);
      d(0, 5.4, 0, 1.4 * annuncio, P.legno);                           // la radio
      for (let i = 0; i < 6; i++) {
        if (annuncio < .5) break;
        const g = (t * .8 + i * .17) % 1;
        d(Math.cos(i) * (1 + g * 5), 5.4, Math.sin(i) * (1 + g * 5), .35 * (1 - g), P.oro);
      }
      const dispersione = clamp01((f - .4) * 1.8);
      for (let i = 0; i < 26; i++) {
        const a = i * 2.399;
        const r = 2 + dispersione * 9;
        omino(d, Math.cos(a) * r, 1.4, Math.sin(a) * r,
          dispersione > .5 && i % 3 === 0 ? P.terraScura : P.divisa, P.pelle, .78);
      }
    } };
},

'sbarco-sicilia'(rng) {
  return { cielo: GIORNO, raggio: CALDO,
    statici(m) { porto(m, 2, rng, P.sabbia); for (let i = 0; i < 4; i++) casa(m, -9 + i * 6, 8, 4, 3, 3, P.tela, P.tetto, 1); },
    dinamici(d, t) {
      /* Centosessantamila uomini sulle spiagge: in trentotto giorni l'isola
         cade, e con essa il regime. */
      const f = (t * .08) % 1;
      onde(d, t, 12, 3, [12, 10]);
      const sbarco = Math.min(1, f * 2.4);
      for (let k = 0; k < 5; k++) {
        const x = -10 + k * 5;
        for (let i = 0; i < 5; i++) d(x + i * .85, 1.3, -4 + sbarco * 4, 1, P.grigio);
      }
      for (let i = 0; i < 26; i++) {
        const p = clamp01(sbarco * 1.4 - (i % 13) * .03);
        omino(d, -10 + (i % 13) * 1.7, 2, 1 + p * 6, P.divisa, P.pelle, .75);
      }
      for (let i = 0; i < 10; i++) {
        const g = (t * .8 + i * .1) % 1;
        d(-8 + i * 2, 2 + g * 4, 9, .8 * (1 - g), g < .3 ? P.fuoco : P.fumo);
      }
    } };
},

gap(rng) {
  return { cielo: NOTTE, nebbia: 0x1e222a, raggio: 0xa0b0c8, ambiente: .4,
    statici(m) { piazza(m, 11, rng, P.cotto, P.tetto, 5); for (let x = -12; x <= 12; x++) for (let z = -1; z <= 1; z++) m.p(x, 1, z, P.pietra); },
    dinamici(d, t) {
      /* In città si colpisce e si sparisce fra la gente: due guerre diverse
         contro lo stesso nemico, la montagna e la strada. */
      const f = (t * .12) % 1;
      const colpo = f > .45 && f < .55;
      for (let i = 0; i < 3; i++) {
        const p = ((f * 1.4 + i * .1) % 1);
        omino(d, -11 + p * 22, 1.4, 0, P.terraScura, P.pelle, .78);
      }
      for (let i = 0; i < 5; i++) {
        const x = -6 + i * 3;
        omino(d, x, 1.4, 3, colpo ? P.nero : P.grigioverde, P.pelle, .78);
      }
      if (colpo) for (let i = 0; i < 10; i++) {
        const g = ((t * 3 + i * .1) % 1);
        d(Math.cos(i * 2.2) * g * 5, 1.6 + g * 2, 3 + Math.sin(i * 2.2) * g * 4, .6 * (1 - g), P.fuoco);
      }
      for (let i = 0; i < 8; i++) omino(d, -8 + i * 2.4, 1.4, 8, P.tela, P.pelle, .72);
    } };
},

'sinistrosi-anni'(rng) {
  return { cielo: CUPO, nebbia: 0x30343c, raggio: 0xc8c0b0, ambiente: .55,
    statici(m) { suolo(m, 12, P.pietraChiara, P.terra, rng); fabbrica(m, -11, -9, 22, 8, 6, P.grigio, 2); },
    dinamici(d, t) {
      /* Trentacinque giorni di cancelli bloccati, poi quarantamila fra quadri e
         impiegati sfilano in senso contrario: un ciclo si chiude. */
      const f = (t * .09) % 1;
      const picchetto = f < .5;
      if (picchetto) {
        for (let i = 0; i < 16; i++)
          omino(d, -8 + i * 1.1, 1.4, 2, P.terraScura, P.pelle, .78);
        for (let k = 0; k < 3; k++) bandiera(d, t, -6 + k * 6, 2, 4, 3, [P.rossoIt, P.rossoIt], k);
      } else {
        const p = clamp01((f - .5) * 2);
        for (let i = 0; i < 30; i++)                 // il corteo attraversa il piazzale senza uscirne
          omino(d, -11 + p * 15 + (i % 10) * .8, 1.4, 2 + Math.floor(i / 10) * 1.4, P.viola, P.pelle, .75);
      }
      for (let k = 0; k < 2; k++) fuoco(d, t, -8 + k * 10, 13, -8, 4, .6, k * .3);
    } };
},

});

})();
