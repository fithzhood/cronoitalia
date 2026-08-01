'use strict';

/* Scene firma, sesto volume: cultura, politica, costume.
 *
 * È il gruppo più numeroso e il più difficile: un'idea non ha una forma. Il
 * criterio qui è sempre lo stesso — trovare l'unico gesto visibile che la
 * contiene, e mostrare quello. Un libro che si riempie, una folla che si alza
 * in piedi, una linea che si sposta, un oggetto che passa di mano.
 */

(() => {

const P = VoxScena.P;
const { suolo, albero, casa, omino, clamp01, dissolvenza, arrivo, tempio, cattedrale, torre, mura,
        nave, folla, fuoco, bandiera, stelle, onde, fabbrica, ponte,
        interno, piazza, campo, porto, teatro, bottega, collina, valle } = VoxScena.kit;

const NOTTE = 0x14203a, GIORNO = 0x24344c, TRAMONTO = 0x2e2c3e, CUPO = 0x1c1f28;
const CALDO = 0xffe6b4, FREDDO = 0xd6e4ff, FUOCO = 0xffb478;
const FR = Math.PI / 2;

// pagine, tavolette, schede: qualcosa che si accumula su un piano
function pila(d, f, n, x0, y0, z, c, passo) {
  const q = Math.floor(clamp01(f) * n);
  for (let i = 0; i < q; i++)
    d(x0 + (i % 5) * (passo || .9), y0 + Math.floor(i / 5) * .4, z, .8, c);
}

// parole, note, idee che salgono e svaniscono
function salgono(d, t, x, y, z, n, c, largo) {
  for (let i = 0; i < n; i++) {
    const g = (t * .7 + i * (1 / n)) % 1;
    d(x + Math.sin(i * 2.1) * (largo || 2), y + g * 5, z + Math.cos(i * 1.9) * (largo || 2) * .5,
      .32 * (1 - g), c);
  }
}

// una fila di persone sedute o in piedi davanti a qualcosa
function pubblico(d, t, n, x0, z0, colori, y) {
  for (let i = 0; i < n; i++)
    omino(d, x0 + (i % 8) * 1.7, (y || 1.4) + Math.floor(i / 8) * .5,
      z0 + Math.floor(i / 8) * 1.6, colori[i % colori.length], P.pelle, .78);
}

VoxScena.registra({

/* ---- preistoria e antichità ---- */

remedello(rng) {
  return { cielo: GIORNO, raggio: CALDO, ambiente: .6, fronte: FR,
    statici(m) { bottega(m, P.terraScura); },
    dinamici(d0, t) {
      /* I primi pugnali di rame della penisola: il metallo cola nella forma e
         l'età della pietra finisce senza che nessuno se ne accorga. */
      const f = (t * .18) % 1.3;
      const d = dissolvenza(d0, f, 1.3);   // il ciclo si ritira invece di spegnersi
      fuoco(d, t, 5, 1.4, -4, 7, .8, 0);
      for (let i = 0; i < 6; i++) {
        const g = ((t * 2 + i * .17) % 1);
        if (f < .3) break;
        d(3 - g * 3, 3.4 - g * .8, -1, .35, P.lava);
      }
      const fatto = clamp01((f - .5) * 2.4);
      for (let i = 0; i < 5; i++) d(-2 + i * .5, 2.6, -1, .5 * fatto, P.bronzo);
      pila(d, clamp01(f * .8), 8, -5, 2.4, 1, P.roccia, .7);
      omino(d, -5, 1.4, 3, P.terraScura, P.pelle, .85);
    } };
},

protovillanoviano(rng) {
  return { cielo: TRAMONTO, raggio: CALDO,
    statici(m) { suolo(m, 12, P.erbaScura, P.terra, rng, .6); },
    dinamici(d, t) {
      /* Si smette di seppellire e si comincia a bruciare: le ceneri finiscono
         in urne a forma di capanna, e nasce un'identità comune. */
      const f = (t * .12) % 1.3;
      fuoco(d, t, 0, 1.4, -6, 8, 1, 0);
      for (let i = 0; i < 14; i++) {
        const su = clamp01((f - i / 18) * 5);
        if (su <= 0) continue;
        const x = -9 + (i % 7) * 3, z = 1 + Math.floor(i / 7) * 4;
        d(x, 1.6, z, .9, P.cotto);
        for (let k = 0; k < 2; k++) d(x, 2.4 + k * .5, z, .8 - k * .2, P.tetto);
      }
      for (let i = 0; i < 6; i++) omino(d, -6 + i * 2.4, 1.4, -3, P.tela, P.pelle, .78);
    } };
},

villanoviani(rng) {
  return { cielo: GIORNO, raggio: CALDO,
    statici(m) { suolo(m, 12, P.erba, P.terra, rng, .8); },
    dinamici(d, t) {
      /* Sepolture a pozzetto con urne biconiche: dalla Romagna alla Toscana lo
         stesso rito, e da lì nascerà il popolo etrusco. */
      const f = (t * .12) % 1.3;
      for (let i = 0; i < 16; i++) {
        const su = clamp01((f - i / 20) * 5);
        if (su <= 0) continue;
        const da = arrivo(d, su);
        const x = -9 + (i % 8) * 2.6, z = -4 + Math.floor(i / 8) * 5;
        da(x, .8, z, .8, P.terraScura);
        da(x, 1.6, z, .9 * su, P.cotto);
        da(x, 2.4, z, .7 * su, P.cotto);
        if (su > .8) da(x, 3, z, .5, P.bronzo);
      }
      for (let i = 0; i < 6; i++) omino(d, -6 + i * 2.4, 1.4, 8, P.tela, P.pelle, .78);
    } };
},

baccanali(rng) {
  return { cielo: NOTTE, raggio: FUOCO, ambiente: .45,
    statici(m) { suolo(m, 12, P.erbaScura, P.terra, rng, .8); for (let i = 0; i < 5; i++) albero(m, -9 + i * 5, -9, 1, rng); },
    dinamici(d, t) {
      /* Il Senato vieta i culti in tutta Italia con un decreto inciso su
         bronzo: il primo grande processo per motivi religiosi. */
      const f = (t * .1) % 1;
      const festa = f < .5;
      if (festa) {
        for (let i = 0; i < 18; i++) {
          const a = t * .6 + i * .35;
          omino(d, Math.cos(a) * (3 + (i % 4)), 1.4 + Math.abs(Math.sin(t * 3 + i)) * .4,
            Math.sin(a) * (3 + (i % 4)), i % 2 ? P.viola : P.rosso, P.pelle, .78);
        }
        fuoco(d, t, 0, 1.4, 0, 8, 1, 0);
      } else {
        const p = clamp01((f - .5) * 2.4);
        for (let i = 0; i < 12; i++)
          omino(d, -11 + p * 8 + (i % 6) * 1.4, 1.4, -3 + Math.floor(i / 6) * 3, P.rosso, P.pelle, .8);
        for (let i = 0; i < 8; i++) d(-2 + i * .8, 2.4, 4, .7, P.bronzo);
      }
    } };
},

catone(rng) {
  return { cielo: GIORNO, raggio: CALDO, ambiente: .6, fronte: FR,
    statici(m) { interno(m, 17, 8, 10, P.marmo, P.marmoOmbra); },
    dinamici(d, t) {
      /* Difende il latino, la frugalità e l'agricoltura contro la moda greca —
         e intanto scrive il primo trattato in prosa latina. */
      const f = (t * .13) % 1.3;
      omino(d, 0, 1.4, -3, P.tela, P.pelle, 1);
      for (let i = 0; i < 8; i++) {                                  // il greco che entra lo stesso
        const p = ((f + i / 8) % 1);
        d(-8 + p * 16, 4 + Math.sin(p * Math.PI) * 2, -1, .45, P.acquaChiara);
      }
      pila(d, clamp01(f * 1.4), 10, -4, 2.4, 2, P.tela);
      pubblico(d, t, 10, -6, 5, [P.viola]);
    } };
},

terenzio(rng) {
  return { cielo: CUPO, raggio: CALDO, ambiente: .6, fronte: FR,
    statici(m) { teatro(m); },
    dinamici(d, t) {
      /* Servi furbi e padri gabbati in un latino vivo: intrighi che
         arriveranno fino a Molière e a Goldoni. */
      const f = (t * .16) % 1.2;
      const ruoli = [P.tela, P.rosso, P.viola, P.oro];
      for (let i = 0; i < 4; i++) {
        const scatto = Math.sin(t * 2 + i * 1.6) * .3;
        omino(d, -3 + i * 2, 2 + Math.abs(scatto), -4.4 + scatto, ruoli[i], P.pelle, .85);
      }
      salgono(d, t, 0, 4, -4, 10, P.oro, 3);
      pubblico(d, t, 16, -6, 2, [P.viola, P.tela]);
    } };
},

gracchi(rng) {
  return { cielo: TRAMONTO, raggio: FUOCO,
    statici(m) { collina(m, 12, 4, P.pietraChiara, P.erbaScura); },
    dinamici(d, t) {
      /* Propone di ridistribuire la terra ai contadini rovinati dalla guerra.
         Verrà ucciso a bastonate: la politica romana scopre il sangue. */
      const f = (t * .09) % 1;
      const proposta = f < .55;
      omino(d, 0, 5.4, 0, P.tela, P.pelle, 1);
      if (proposta) {
        // le terre e la folla si ritirano prima del passaggio, senza lampo
        const dp = dissolvenza(d, f, .55, .06);
        for (let i = 0; i < 12; i++) {                               // le terre assegnate
          if (f < i / 16) continue;
          dp(-8 + (i % 6) * 3, 1.4, 6 + Math.floor(i / 6) * 3, 1.4, P.erba);
        }
        folla(dp, t, 0, 3, 20, 2, [P.terraScura, P.tela], 1.4);
      } else {
        const p = clamp01((f - .55) * 2.4);
        for (let i = 0; i < 12; i++) {
          const a = i / 12 * Math.PI * 2;
          omino(d, Math.cos(a) * (5 - p * 3.4), 5.4, Math.sin(a) * (5 - p * 3.4), P.nero, P.pelle, .8);
          d(Math.cos(a) * (4.4 - p * 3), 6.6, Math.sin(a) * (4.4 - p * 3), .3, P.legno);
        }
      }
    } };
},

catullo(rng) {
  return { cielo: TRAMONTO, raggio: CALDO,
    statici(m) {
      for (let x = -12; x <= 12; x++) for (let z = -12; z <= 12; z++) m.p(x, 0, z, P.acqua);
      for (let x = -4; x <= 4; x++) for (let z = -12; z <= 2; z++) { m.p(x, 1, z, P.erbaScura); m.p(x, 0, z, P.terra); }
      for (let i = 0; i < 4; i++) m.colonna(-3 + i * 2, -6, 2, 4, P.marmo);
      for (let i = 0; i < 4; i++) albero(m, -3 + i * 2, -10, 2, rng);
    },
    dinamici(d, t) {
      /* Odi et amo: due parole in tensione, e i versi più brevi e violenti
         della letteratura latina. */
      const f = (t * .3) % 1;
      omino(d, 0, 2, 0, P.viola, P.pelle, .95);
      for (let i = 0; i < 8; i++) {
        const g = ((f + i / 8) % 1);
        d(-2.4, 4 + g * 3, 0, .4 * (1 - g), P.rosso);
        d(2.4, 4 + g * 3, 0, .4 * (1 - g), P.acquaChiara);
      }
      onde(d, t, 12, 3, [5, 12]);
    } };
},

lucrezio(rng) {
  return { cielo: NOTTE, raggio: 0xbcd0f0, ambiente: .45, fronte: FR,
    statici(m) { interno(m, 17, 8, 10, P.pietraScura, P.tronco, P.pietra); },
    dinamici(d, t) {
      /* Tutto è fatto di atomi che cadono e deviano: mettere in versi la fisica
         per liberare gli uomini dalla paura degli dèi. */
      const f = (t * .12) % 1.3;
      for (let i = 0; i < 40; i++) {
        const g = ((t * .3 + i * .025) % 1);
        const dev = g > .5 ? (g - .5) * 3 : 0;
        d(-7 + (i % 20) * .75 + dev * Math.sin(i), 8 - g * 6, -2 + Math.cos(i) * 2, .3, P.biancoIt);
      }
      pila(d, clamp01(f * 1.3), 10, -4, 2.4, 2, P.tela);
      omino(d, -5, 1.4, 3, P.tela, P.pelle, .9);
    } };
},

orazio(rng) {
  return { cielo: GIORNO, raggio: CALDO,
    statici(m) { collina(m, 12, 4, P.erbaScura, P.erba); casa(m, -3, -3, 6, 5, 3, P.tela, P.tetto, 5); },
    dinamici(d0, t) {
      /* Carpe diem, aurea mediocritas: due espressioni che l'italiano userà
         per duemila anni, scritte in una villa di campagna. */
      const f = (t * .13) % 1.3;
      const d = dissolvenza(d0, f, 1.3);   // il ciclo si ritira invece di spegnersi
      omino(d, 0, 5.4, 3, P.viola, P.pelle, .95);
      salgono(d, t, 0, 7, 3, 12, P.oro, 3);
      for (let i = 0; i < 6; i++) {                                  // le viti e il giorno che passa
        if (f < i / 8) continue;
        d(-6 + i * 2.4, 5, 6, .7, P.foglie);
        d(-6 + i * 2.4, 5.6, 6, .5, P.viola);
      }
    } };
},

diocleziano(rng) {
  return { cielo: CUPO, raggio: CALDO, ambiente: .6, fronte: FR,
    statici(m) { interno(m, 19, 8, 11, P.marmo, P.marmoOmbra); },
    dinamici(d, t) {
      /* Prezzi massimi fissati per legge su mille prodotti, con la pena di
         morte per chi li supera: fallisce in pochi anni. */
      const f = (t * .12) % 1.3;
      for (let r = 0; r < 5; r++) for (let c = 0; c < 10; c++) {
        const i = r * 10 + c;
        if (f < i / 60) continue;
        d(-6.5 + c * 1.4, 3 + r * 1.1, -6.4, .8, i % 4 ? P.marmoOmbra : P.oro);
      }
      const fallisce = clamp01((f - .85) * 4);
      for (let i = 0; i < 12; i++) {
        if (fallisce <= 0) break;
        d(-6 + i * 1.2, 3 - fallisce * 2, -5.4, .5, P.polvere);
      }
      omino(d, 0, 1.4, 1, P.viola, P.pelle, 1);
      pubblico(d, t, 10, -6, 4, [P.tela]);
    } };
},

giuliano(rng) {
  return { cielo: TRAMONTO, raggio: CALDO,
    statici(m) { suolo(m, 11, P.pietraChiara, P.pietra, rng); tempio(m, -5, -3, 5, 3, 5, P.marmo, P.marmoOmbra); },
    dinamici(d, t) {
      /* L'ultimo imperatore pagano prova a riaccendere i culti antichi: gli
         altari tornano a fumare per diciotto mesi, poi si spengono. */
      const f = (t * .1) % 1;
      const acceso = f < .6 ? clamp01(f * 3) : clamp01((1 - f) * 2.5);
      for (let i = 0; i < 5; i++) {
        if (acceso <= 0) break;
        fuoco(d, t, -5 + i * 2.5, 6.4, 4, Math.round(4 * acceso), .5, i * .12);
      }
      omino(d, 0, 1.4, 6, P.viola, P.pelle, 1);
      for (let i = 0; i < 10; i++)
        omino(d, -7 + i * 1.6, 1.4, 9, acceso > .5 ? P.tela : P.nero, P.pelle, .78);
    } };
},

'altare-vittoria'(rng) {
  return { cielo: CUPO, raggio: CALDO, ambiente: .6, fronte: FR,
    statici(m) { interno(m, 19, 9, 11, P.marmo, P.marmoOmbra); },
    dinamici(d, t) {
      /* Una statua rimossa e non più rimessa: il momento in cui Roma smette di
         essere pagana si misura in un piedistallo vuoto. */
      const f = (t * .11) % 1;
      const c1 = clamp01(f * 2), c2 = clamp01((f - .5) * 2);
      d(0, 2.4, -3, 1.4, P.marmoOmbra);
      d(0, 3.8, -3, 1.1 * (1 - Math.max(c1, c2) * .9), P.oro);
      for (let i = 0; i < 8; i++) omino(d, -7 + i * 1.1, 1.4, 1, P.tela, P.pelle, .8);
      for (let i = 0; i < 8; i++) omino(d, 1 + i * .9, 1.4, 1, P.biancoIt, P.pelle, .8);
      salgono(d, t, -3, 3.4, 1, 6, P.oro, 1.4);
      salgono(d, t, 4, 3.4, 1, 6, P.acquaChiara, 1.4);
    } };
},

cassiodoro(rng) {
  return { cielo: CUPO, raggio: CALDO, ambiente: .6, fronte: FR,
    statici(m) { interno(m, 17, 7, 10, P.pietraChiara, P.legno); },
    dinamici(d0, t) {
      /* Un monastero-biblioteca in Calabria e i monaci messi a copiare i
         classici: un anello decisivo della catena. */
      const f = (t * .13) % 1.3;
      const d = dissolvenza(d0, f, 1.3);   // il ciclo si ritira invece di spegnersi
      for (let i = 0; i < 6; i++) {
        omino(d, -6 + i * 2.4, 1.4, 1, P.nero, P.pelle, .8);
        d(-6 + i * 2.4, 2.8, .2, .5, P.tela);
      }
      pila(d, clamp01(f * 1.4), 20, -5, 2.4, -3, P.cotto, .8);
      salgono(d, t, 0, 4, -3, 8, P.oro, 3);
    } };
},

'paolo-diacono'(rng) {
  return { cielo: CUPO, raggio: CALDO, ambiente: .6, fronte: FR,
    statici(m) { interno(m, 15, 6, 9, P.pietraChiara, P.legno); },
    dinamici(d, t) {
      /* Racconta il suo popolo dalle origini scandinave: senza di lui non
         sapremmo quasi nulla di due secoli d'Italia. */
      const f = (t * .12) % 1.3;
      omino(d, -3, 1.4, 1, P.nero, P.pelle, .9);
      for (let i = 0; i < 14; i++) {                                 // le generazioni che si allineano
        const p = clamp01((f - (i / 16)) * 5);
        if (p <= 0) continue;
        const da = arrivo(d, p);
        omino(da, -6 + (i % 7) * 2, 2.6 + Math.floor(i / 7) * 1.6, -5, P.oliva, P.pelle, .5);
      }
      pila(d, clamp01(f * 1.3), 10, 2, 2.4, 1, P.tela, .7);
    } };
},

'ordini-mendicanti'(rng) {
  return { cielo: GIORNO, raggio: CALDO,
    statici(m) { piazza(m, 11, rng, P.cotto, P.tetto, 4); },
    dinamici(d, t) {
      /* Non più in campagna ma in piazza: la Chiesa insegue la gente dove la
         gente si è spostata. */
      const f = (t * .12) % 1.3;
      omino(d, 0, 2.4, 0, P.nero, P.pelle, 1);
      d(0, 1.4, 0, 1.6, P.pietra);
      const raccolta = clamp01(f * 1.6);
      for (let i = 0; i < 26; i++) {
        const a = i * 2.399, r = 9 - raccolta * 5.5;
        omino(d, Math.cos(a) * r, 1.4, Math.sin(a) * r, i % 3 ? P.tela : P.terraScura, P.pelle, .76);
      }
      salgono(d, t, 0, 4.4, 0, 8, P.oro, 2);
    } };
},

'scuola-siciliana'(rng) {
  return { cielo: CUPO, raggio: CALDO, ambiente: .6, fronte: FR,
    statici(m) { interno(m, 17, 8, 10, P.marmo, P.legno); },
    dinamici(d, t) {
      /* I notai di corte scrivono d'amore in volgare e inventano il sonetto:
         quattordici versi, e Dante li riconoscerà come i primi. */
      const f = (t * .12) % 1.3;
      for (let i = 0; i < 14; i++) {
        const p = clamp01((f - (i / 16)) * 5);
        if (p <= 0) continue;
        const da = arrivo(d, p);
        da(-3 + (i % 7) * 1, 5.4 - Math.floor(i / 7) * .9, -3, .8, i < 8 ? P.oro : P.rosso);
      }
      for (let i = 0; i < 5; i++) {
        omino(d, -5 + i * 2.4, 1.4, 2, P.viola, P.pelle, .8);
        d(-5 + i * 2.4, 2.8, 1.2, .45, P.tela);
      }
      omino(d, 0, 1.4, -1, P.oro, P.pelle, .95);
    } };
},

salimbene(rng) {
  return { cielo: CUPO, raggio: CALDO, ambiente: .6, fronte: FR,
    statici(m) { interno(m, 17, 7, 10, P.tela, P.legno); },
    dinamici(d0, t) {
      /* Pettegolezzi, ricette e ritratti feroci: il Duecento visto da dentro,
         scritto da un frate che gira l'Italia. */
      const f = (t * .13) % 1.3;
      const d = dissolvenza(d0, f, 1.3);   // il ciclo si ritira invece di spegnersi
      omino(d, 0, 1.4, 2, P.nero, P.pelle, .95);
      const scene = [P.rosso, P.oro, P.viola, P.verdeIt, P.acquaChiara, P.cotto];
      for (let i = 0; i < 12; i++) {
        const p = clamp01((f - (i / 14)) * 5);
        if (p <= 0) continue;
        const da = arrivo(d, p);
        omino(da, -7 + (i % 6) * 2.4, 2.6 + Math.floor(i / 6) * 1.6, -5, scene[i % 6], P.pelle, .55);
      }
      pila(d, clamp01(f * 1.3), 8, 3, 2.4, 1, P.tela, .7);
    } };
},

'marco-polo-milione'(rng) {
  return { cielo: CUPO, nebbia: 0x262a34, raggio: 0xd0c0a0, ambiente: .5, fronte: FR,
    statici(m) { interno(m, 15, 6, 9, P.pietraScura, P.tronco, P.pietra); for (let y = 2; y <= 4; y++) m.p(0, y, -5, P.ferro); },
    dinamici(d, t) {
      /* In cella, dettando a un compagno di prigionia: carta moneta, carbone e
         poste imperiali, a un'Europa che non ci crede. */
      const f = (t * .12) % 1.3;
      omino(d, -2.4, 1.4, 0, P.viola, P.pelle, .9);
      omino(d, 1.4, 1.4, 0, P.tela, P.pelle, .9);
      const meraviglie = [P.oro, P.nero, P.acquaChiara, P.rosso, P.menta, P.marmo];
      for (let i = 0; i < 12; i++) {
        if (f < i / 14) continue;
        const g = ((t * .3 + i * .08) % 1);
        d(-5 + (i % 6) * 2, 4 + g * 3, -3, .5 * (1 - g * .5), meraviglie[i % 6]);
      }
      pila(d, clamp01(f * 1.3), 8, -4, 2.4, 2, P.tela, .7);
    } };
},

banchi(rng) {
  return { cielo: GIORNO, raggio: CALDO, ambiente: .6, fronte: FR,
    statici(m) { interno(m, 19, 7, 11, P.pietra, P.legno); },
    dinamici(d, t) {
      /* Spostare denaro senza spostare monete: la lettera di cambio viaggia al
         posto dell'oro, e le fiere si compensano a fine anno. */
      const f = (t * .16) % 1.3;
      for (let i = 0; i < 10; i++) {
        const p = ((f + i / 10) % 1);
        d(-8 + p * 16, 3 + Math.sin(p * Math.PI) * 2, -2, .45, P.tela);
      }
      for (let i = 0; i < 8; i++) d(-7 + (i % 4) * .6, 2.5 + Math.floor(i / 4) * .3, -2, .45, P.oro);
      for (let i = 0; i < 8; i++) d(6 + (i % 4) * .6, 2.5 + Math.floor(i / 4) * .3, -2, .45, P.oro);
      omino(d, -6, 1.4, 1, P.viola, P.pelle, .9);
      omino(d, 6, 1.4, 1, P.viola, P.pelle, .9);
    } };
},

lorenzetti(rng) {
  return { cielo: GIORNO, raggio: CALDO, ambiente: .65, fronte: FR,
    statici(m) { interno(m, 19, 9, 11, P.tela, P.legno); },
    dinamici(d, t) {
      /* Da una parte la città che funziona, dall'altra quella che no: il primo
         grande paesaggio della pittura occidentale è un manifesto politico. */
      const f = (t * .12) % 1.3;
      for (let r = 0; r < 4; r++) for (let c = 0; c < 8; c++) {      // il buon governo
        const i = r * 8 + c;
        if (f < i / 40) continue;
        d(-8 + c, 3 + r * 1.2, -6.4, .9, (c + r) % 3 ? P.oro : P.erba);
      }
      for (let r = 0; r < 4; r++) for (let c = 0; c < 8; c++) {      // il cattivo, dopo
        const i = r * 8 + c;
        if (f < .5 + i / 40) continue;
        d(1 + c, 3 + r * 1.2, -6.4, .9, (c + r) % 3 ? P.nero : P.grigio);
      }
      omino(d, 0, 1.4, 2, P.viola, P.pelle, .9);
    } };
},

caterina(rng) {
  return { cielo: CUPO, raggio: CALDO, ambiente: .6, fronte: FR,
    statici(m) { interno(m, 17, 8, 10, P.pietraChiara, P.legno); },
    dinamici(d, t) {
      /* Lettere durissime ai potenti da una figlia di tintore: e il papa alla
         fine lascia Avignone e torna. */
      const f = (t * .12) % 1.3;
      omino(d, -4, 1.4, 2, P.biancoIt, P.pelle, .95);
      for (let i = 0; i < 12; i++) {
        const p = ((f + i / 12) % 1);
        d(-3 + p * 10, 3 + Math.sin(p * Math.PI) * 2.4, 0, .45, P.tela);
      }
      const torna = clamp01((f - .8) * 4);
      omino(d, 6 - torna * 3, 1.4, -2, P.oro, P.pelle, 1);
      salgono(d, t, -4, 3.6, 2, 6, P.oro, 1.4);
    } };
},

alberti(rng) {
  return { cielo: GIORNO, raggio: CALDO, ambiente: .65, fronte: FR,
    statici(m) { bottega(m, P.marmo); },
    dinamici(d0, t) {
      /* L'architettura diventa disciplina con regole scritte: chi progetta non
         è più il capomastro che sta in cantiere. */
      const f = (t * .13) % 1.3;
      const d = dissolvenza(d0, f, 1.3);   // il ciclo si ritira invece di spegnersi
      for (let i = 0; i < 10; i++) {                                 // il disegno sul tavolo
        const p = clamp01((f - (i / 12)) * 5);
        if (p <= 0) continue;
        const da = arrivo(d, p);
        da(-3.5 + i * .8, 2.5, -1, .7, i % 3 ? P.tela : P.oro);
      }
      const su = clamp01((f - .5) * 2.4);
      for (let i = 0; i < 5; i++) for (let y = 0; y < 4 * su; y++)
        d(-4 + i * 2, 2 + y, -5, .7, P.marmo);
      for (let k = 0; k < 3; k++) for (let x = -4 + k; x <= 4 - k; x++)
        if (su > .8) d(x, 6 + k, -5, .8, P.marmoOmbra);
      omino(d, -6, 1.4, 2, P.viola, P.pelle, .9);
    } };
},

'piero-francesca'(rng) {
  return { cielo: GIORNO, raggio: CALDO, ambiente: .7, fronte: FR,
    statici(m) { interno(m, 19, 10, 11, P.tela, P.legno); },
    dinamici(d, t) {
      /* Luce ferma, volumi geometrici, silenzio: dipinge come se stesse
         risolvendo un problema di prospettiva, perché è quello che fa. */
      const f = (t * .11) % 1.3;
      for (let i = 0; i < 12; i++) {
        const p = clamp01((f - (i / 14)) * 5);
        if (p <= 0) continue;
        const da = arrivo(d, p);
        const x = -7 + (i % 6) * 2.4, y = 3 + Math.floor(i / 6) * 3;
        da(x, y, -6.4, 1.3, i % 3 ? P.acquaChiara : P.sabbia);
        omino(da, x, y - .4, -6.2, i % 2 ? P.rosso : P.blu, P.pelle, .6);
      }
      for (let i = 0; i < 8; i++) {                                  // le linee di costruzione
        if (f < .7) break;
        d(-6 + i * 1.7, 8.4, -6.3, .4, P.oro);
      }
      omino(d, 0, 1.4, 2, P.terraScura, P.pelle, .9);
    } };
},

'accademia-platonica'(rng) {
  return { cielo: TRAMONTO, raggio: CALDO,
    statici(m) { suolo(m, 12, P.erba, P.terra, rng, .8); casa(m, 4, -8, 7, 5, 4, P.tela, P.tetto, 1); for (let i = 0; i < 5; i++) albero(m, -9 + i * 4, 8, 1, rng); },
    dinamici(d, t) {
      /* Tutto Platone tradotto in latino nella villa di Careggi: l'Occidente
         riscopre un modo di pensare che aveva perso da mille anni. */
      const f = (t * .12) % 1.3;
      for (let i = 0; i < 8; i++) {
        const a = i / 8 * Math.PI * 2;
        omino(d, Math.cos(a) * 3.4, 1.4, Math.sin(a) * 3.4, P.viola, P.pelle, .8);
      }
      pila(d, clamp01(f * 1.4), 14, -2, 1.6, 0, P.tela, .7);
      salgono(d, t, 0, 3.4, 0, 12, P.oro, 3);
    } };
},

pico(rng) {
  return { cielo: CUPO, raggio: CALDO, ambiente: .6, fronte: FR,
    statici(m) { interno(m, 19, 9, 11, P.marmo, P.marmoOmbra); },
    dinamici(d, t) {
      /* Novecento tesi da discutere con chiunque, e un discorso sulla dignità
         dell'uomo che diventa il manifesto dell'umanesimo. */
      const f = (t * .12) % 1.3;
      for (let r = 0; r < 6; r++) for (let c = 0; c < 12; c++) {
        const i = r * 12 + c;
        const p = clamp01((f - (i / 80)) * 5);
        if (p <= 0) continue;
        const da = arrivo(d, p);
        da(-6.5 + c * 1.1, 3 + r * 1, -6.4, .7, i % 5 ? P.tela : P.oro);
      }
      omino(d, 0, 1.4, 2, P.viola, P.pelle, .95);
      pubblico(d, t, 12, -6, 5, [P.nero, P.tela]);
    } };
},

'leonardo-cavallo'(rng) {
  return { cielo: CUPO, raggio: CALDO, ambiente: .6,
    statici(m) { suolo(m, 11, P.terraScura, P.terra, rng); },
    dinamici(d0, t) {
      /* Sette metri di modello in argilla: il bronzo servirà per i cannoni, e i
         francesi useranno il modello come bersaglio. */
      const f = (t * .1) % 1;
      const d = dissolvenza(d0, f, 1);   // il ciclo si ritira invece di spegnersi
      const su = clamp01(f * 1.8), rovina = clamp01((f - .6) * 2.4);
      const c = rovina > .3 ? P.terraScura : P.terra;
      const scala = su * (1 - rovina * .6);
      for (let i = 0; i < 5; i++) d(-2 + i * 1.1, 4, 0, 1.4 * scala, c);
      d(3, 5.4, 0, 1.2 * scala, c);
      for (const [dx, dz] of [[-1.6, .8], [-1.6, -.8], [1.6, .8]]) d(dx, 2.4, dz, .9 * scala, c);
      d(1.6, 3 + Math.sin(t) * .3, -.8, .9 * scala, c);
      if (rovina > .3) for (let i = 0; i < 8; i++) {
        const g = (t * 1.2 + i * .12) % 1;
        d(Math.cos(i * 2.2) * (2 + g * 3), 4 - g * 2.4, Math.sin(i * 2.2) * (2 + g * 3), .4, P.terraScura);
      }
      omino(d, -6, 1.4, 4, P.terraScura, P.pelle, .9);
    } };
},

ariosto(rng) {
  return { cielo: CUPO, raggio: CALDO, ambiente: .6, fronte: FR,
    statici(m) { bottega(m, P.marmo); },
    dinamici(d, t) {
      /* Quarantasei canti di cavalieri, incantesimi e follie: il poema più
         letto del Cinquecento europeo. */
      const f = (t * .12) % 1.3;
      omino(d, -5, 1.4, 2, P.viola, P.pelle, .9);
      const figure = [P.ferro, P.oro, P.rosso, P.acquaChiara, P.verdeIt];
      for (let i = 0; i < 15; i++) {
        const p = clamp01((f - (i / 18)) * 5);
        if (p <= 0) continue;
        const da = arrivo(d, p);
        const a = i * 2.399, r = 2 + (i % 5) * 1.1;
        omino(da, Math.cos(a) * r, 3.5 + (i % 3) * 1.2, -2 + Math.sin(a) * r * .5,
          figure[i % 5], P.pelle, .5);
      }
      pila(d, clamp01(f * 1.3), 12, -2, 2.4, -1, P.tela, .7);
    } };
},

castiglione(rng) {
  return { cielo: CUPO, raggio: CALDO, ambiente: .6, fronte: FR,
    statici(m) { interno(m, 19, 8, 11, P.marmo, P.marmoOmbra); },
    dinamici(d, t) {
      /* La sprezzatura: fare le cose difficili come se non costassero fatica.
         Le serate di Urbino diventano un manuale europeo. */
      const f = (t * .13) % 1.3;
      for (let i = 0; i < 10; i++) {
        const a = i / 10 * Math.PI * 2;
        omino(d, Math.cos(a) * 4.4, 1.4, -1 + Math.sin(a) * 3.4,
          i % 3 ? P.viola : P.oro, P.pelle, .82);
      }
      for (let i = 0; i < 10; i++) {                                 // la conversazione che gira
        const g = ((f * 2 + i / 10) % 1);
        const a = g * Math.PI * 2;
        d(Math.cos(a) * 3.4, 3.4, -1 + Math.sin(a) * 2.6, .4, P.oro);
      }
      pila(d, clamp01(f * 1.3), 8, -3, 2.4, -4, P.tela, .7);
    } };
},

vasari(rng) {
  return { cielo: CUPO, raggio: CALDO, ambiente: .6, fronte: FR,
    statici(m) { bottega(m, P.pietraChiara); },
    dinamici(d, t) {
      /* Biografie di artisti messe in ordine, con l'idea che l'arte progredisca:
         quasi tutto quello che sappiamo di loro viene da qui. */
      const f = (t * .12) % 1.3;
      for (let i = 0; i < 16; i++) {
        const p = clamp01((f - (i / 18)) * 5);
        if (p <= 0) continue;
        const da = arrivo(d, p);
        omino(da, -7 + (i % 8) * 2, 2.6 + Math.floor(i / 8) * 1.6, -5,
          [P.rosso, P.blu, P.viola, P.oro][i % 4], P.pelle, .5);
      }
      pila(d, clamp01(f * 1.3), 14, -4, 2.4, -1, P.cotto, .8);
      omino(d, -5, 1.4, 2, P.terraScura, P.pelle, .9);
    } };
},

cateau(rng) {
  return { cielo: GIORNO, raggio: CALDO, ambiente: .6, fronte: FR,
    statici(m) { interno(m, 19, 8, 11, P.marmo, P.marmoOmbra); },
    dinamici(d, t) {
      /* Finiscono le guerre d'Italia e la penisola diventa una questione
         altrui: due firme, e centocinquant'anni di dominio spagnolo. */
      const f = (t * .13) % 1.3;
      omino(d, -3, 1.4, -1, P.blu, P.pelle, .95);
      omino(d, 3, 1.4, -1, P.ruggine, P.pelle, .95);
      d(0, 2.6, -1, 1.6, P.tela);
      const firmato = clamp01((f - .4) * 2.4);
      for (let i = 0; i < 8; i++) {
        const p = clamp01((firmato - (i / 10)) * 5);
        if (p <= 0) continue;
        const da = arrivo(d, p);
        da(-2 + i * .5, 2.8, -1, .3, P.nero);
      }
      for (let i = 0; i < 6; i++) {                                  // gli stati italiani che guardano
        omino(d, -6 + i * 2.4, 1.4, 4, [P.oliva, P.acqua, P.ocra, P.rosso, P.corallo, P.menta][i], P.pelle, .75);
      }
    } };
},

palestrina(rng) {
  return { cielo: CUPO, raggio: CALDO, ambiente: .6, fronte: FR,
    statici(m) { interno(m, 19, 11, 11, P.marmo, P.marmoOmbra); },
    dinamici(d, t) {
      /* Più voci intrecciate senza rendere incomprensibili le parole: la
         Controriforma non abolisce la musica. */
      const f = (t * .13) % 1.3;
      for (let v = 0; v < 4; v++) {
        for (let i = 0; i < 5; i++)
          omino(d, -6 + v * 4 + (i % 2), 1.4 + Math.floor(i / 2) * .5, 1 + Math.floor(i / 2) * 1.4,
            [P.nero, P.viola, P.blu, P.rosso][v], P.pelle, .76);
        for (let i = 0; i < 6; i++) {                                // le quattro linee che salgono
          const g = ((t * .6 + v * .12 + i / 6) % 1);
          d(-6 + v * 4, 4 + g * 6, -1, .32 * (1 - g), [P.oro, P.acquaChiara, P.menta, P.corallo][v]);
        }
      }
      for (let i = 0; i < 10; i++) {                                 // le parole, ancora leggibili
        if (f < .6) break;
        d(-5 + i * 1.1, 3.4, -6.4, .5, P.biancoIt);
      }
    } };
},

'veronese-inquisizione'(rng) {
  return { cielo: CUPO, raggio: CALDO, ambiente: .6, fronte: FR,
    statici(m) { interno(m, 19, 9, 11, P.pietra, P.legno); },
    dinamici(d, t) {
      /* Accusato di aver messo nani e buffoni in un'Ultima Cena, non cambia il
         quadro: gli cambia il titolo. */
      /* Il quadro sulla parete resta lì fermo — è un quadro. A muoversi sono
         la sala e il processo: prima il tribunale era di fatto una fotografia,
         cambiava solo il colore delle lettere del titolo. */
      const f = (t * .12) % 1.3;
      for (let i = 0; i < 13; i++)
        omino(d, -6.5 + i, 3.4, -6.4, i === 6 ? P.biancoIt : (i % 3 ? P.rosso : P.blu), P.pelle, .62);
      for (let i = 0; i < 4; i++)                                    // i personaggi contestati
        omino(d, -5 + i * 3.4, 2.4, -6.2, P.oro, P.pelle, .45);
      const titolo = clamp01((f - .5) * 2.4);
      for (let i = 0; i < 10; i++) {                                 // il titolo che viene riscritto, lettera per lettera
        const cambiata = titolo * 10 > i;
        d(-5 + i * 1.1, 7.4 + (cambiata ? 0 : Math.sin(t * 2 + i) * .12), -6.4, .5,
          cambiata ? P.oro : P.nero);
      }
      // il pittore che si difende, e l'inquisitore che gli gira attorno
      omino(d, -4 + Math.sin(t * .6) * .5, 1.4 + Math.abs(Math.sin(t * 1.8)) * .18, 2, P.terraScura, P.pelle, .9);
      const gir = t * .45;
      omino(d, 4 + Math.cos(gir) * 2.2, 1.4, 2 + Math.sin(gir) * 1.6, P.nero, P.pelle, .9);
      for (let i = 0; i < 6; i++) {                                  // le candele del tribunale
        const on = Math.abs(Math.sin(t * 3 + i * 1.3));
        d(-6 + i * 2.4, 3.2 + on * .12, 4, .3 + on * .1, P.brace);
      }
    } };
},

tasso(rng) {
  return { cielo: CUPO, nebbia: 0x2a2830, raggio: CALDO, ambiente: .5, fronte: FR,
    statici(m) { interno(m, 15, 6, 9, P.pietraScura, P.tronco, P.pietra); },
    dinamici(d, t) {
      /* Il poema della crociata scritto mentre è rinchiuso: eroismo e
         malinconia nello stesso verso. */
      const f = (t * .12) % 1.3;
      omino(d, -3, 1.4, 1, P.viola, P.pelle, .9);
      for (let i = 0; i < 12; i++) {                                 // i cavalieri immaginati
        const p = clamp01((f - (i / 14)) * 5);
        if (p <= 0) continue;
        const da = arrivo(d, p);
        const a = i * 2.399, r = 2 + (i % 4);
        omino(da, Math.cos(a) * r, 3.4, -2 + Math.sin(a) * r * .5, P.ferro, P.pelle, .45);
      }
      for (let i = 0; i < 6; i++) d(-6 + i * .3, 1.4 + i * .5, -4, .25, P.ferro);   // le sbarre
      pila(d, clamp01(f * 1.3), 8, 2, 2.4, 1, P.tela, .7);
    } };
},

'monteverdi-venezia'(rng) {
  return { cielo: CUPO, raggio: CALDO, ambiente: .6, fronte: FR,
    statici(m) { teatro(m); },
    dinamici(d, t) {
      /* Il primo teatro d'opera a pagamento del mondo: si entra con un
         biglietto, e la musica smette di essere solo di corte. */
      const f = (t * .14) % 1.3;
      for (let i = 0; i < 14; i++) {
        const p = ((f + i / 14) % 1);
        omino(d, -8 + p * 16, 1.4, 5 - (p > .5 ? 3 : 0), P.viola, P.pelle, .78);
        if (p < .5) d(-8 + p * 16, 2.8, 5, .35, P.oro);              // il biglietto
      }
      for (let i = 0; i < 5; i++) omino(d, -4 + i * 2, 2, -4.4, P.rosso, P.pelle, .82);
      salgono(d, t, 0, 4, -4, 14, P.oro, 4);
    } };
},

borromini(rng) {
  return { cielo: CUPO, raggio: CALDO, ambiente: .6,
    statici(m) { suolo(m, 11, P.pietraChiara, P.pietra, rng); },
    dinamici(d, t) {
      /* Pareti che ondeggiano e una cupola a nido d'ape su un fazzoletto di
         terreno: l'architettura smette di essere fatta di rette. */
      const f = (t * .11) % 1.3;
      const su = clamp01(f * 1.4);
      for (let a = 0; a < 32; a++) {
        const an = a / 32 * Math.PI * 2;
        const r = 4 + Math.sin(an * 3) * 1.2;                        // la pianta ondulata
        for (let y = 0; y < 7 * su; y++)
          d(Math.cos(an) * r, 1 + y, Math.sin(an) * r, .8, P.marmo);
      }
      for (let k = 0; k < 4; k++) {
        if (su < .8) break;
        for (let a = 0; a < 20 - k * 4; a++) {
          const an = a / (20 - k * 4) * Math.PI * 2;
          const r = (3.4 - k * .8);
          d(Math.cos(an) * r, 8 + k, Math.sin(an) * r, .7, k % 2 ? P.marmoOmbra : P.marmo);
        }
      }
      folla(d, t, 0, 4, 8, 1.4, [P.tela, P.viola], 1.2);   // il fazzoletto di terreno è piccolo
    } };
},

'barocco-lecce'(rng) {
  return { cielo: GIORNO, raggio: CALDO, fronte: FR,
    statici(m) { suolo(m, 12, P.sabbia, P.terra, rng); },
    dinamici(d, t) {
      /* La pietra tenera si lascia intagliare come legno: facciate che
         sembrano ricami, in una città di provincia dell'impero spagnolo. */
      const f = (t * .11) % 1.3;
      for (let x = -7; x <= 7; x++) for (let y = 0; y < 9; y++) d(x, 1 + y, -6, 1, P.sabbia);
      for (let r = 0; r < 5; r++) for (let c = 0; c < 14; c++) {     // gli intagli, uno alla volta
        const i = r * 14 + c;
        if (f < i / 80) continue;
        d(-6.5 + c, 2.4 + r * 1.6, -5.4, .8, (c + r) % 4 ? P.marmoOmbra : P.oro);
      }
      for (let k = 0; k < 3; k++) for (let x = -7 + k; x <= 7 - k; x++)
        if (f > .8) d(x, 10 + k, -6, .9, P.marmoOmbra);
      folla(d, t, 0, 4, 8, 1.6, [P.tela, P.nero], 1.2);
    } };
},

utrecht(rng) {
  return { cielo: GIORNO, raggio: CALDO, ambiente: .6, fronte: FR,
    statici(m) { interno(m, 19, 8, 11, P.marmo, P.marmoOmbra); },
    dinamici(d, t) {
      /* L'Italia spagnola passa agli Austriaci, e i Savoia ricevono un'isola:
         per loro un regno comincia da un titolo. */
      const f = (t * .12) % 1.3;
      const pezzi = [[P.oliva, -6, P.grigioverde], [P.corallo, -2, P.grigioverde],
                     [P.verdeIt, 2, P.blu], [P.magenta, 6, P.grigioverde]];
      for (let i = 0; i < 4; i++) {
        const passato = f > (i + 1) / 6;
        d(pezzi[i][1], 2.6, -2, 1.3, passato ? pezzi[i][2] : pezzi[i][0]);
      }
      omino(d, -5, 1.4, 2, P.grigioverde, P.pelle, .9);
      omino(d, 5, 1.4, 2, P.blu, P.pelle, .9);
      if (f > .9) d(5, 3.6, 2, .7, P.oro);
    } };
},

vico(rng) {
  return { cielo: CUPO, raggio: CALDO, ambiente: .6, fronte: FR,
    statici(m) { bottega(m, P.tela); },
    dinamici(d, t) {
      /* Corsi e ricorsi: la storia gira, e l'uomo può conoscere soltanto ciò
         che ha fatto lui. In Italia lo leggeranno tardi. */
      const f = (t * .12) % 1.3;
      for (let i = 0; i < 18; i++) {                                 // la spirale che torna
        const a = t * .3 + i * .45;
        const r = 1 + (i % 6) * .6;
        d(Math.cos(a) * r, 3 + i * .25, -1 + Math.sin(a) * r, .4, i % 3 ? P.oro : P.marmoOmbra);
      }
      pila(d, clamp01(f * 1.3), 10, -4, 2.4, 1, P.tela, .7);
      omino(d, -5, 1.4, 3, P.nero, P.pelle, .9);
    } };
},

scarlatti(rng) {
  return { cielo: CUPO, raggio: CALDO, ambiente: .6, fronte: FR,
    statici(m) { interno(m, 19, 8, 11, P.pietraChiara, P.legno); },
    dinamici(d, t) {
      /* Conservatori nati come orfanotrofi che sfornano cantanti e compositori
         per tutta Europa: l'opera italiana diventa un'industria. */
      const f = (t * .14) % 1.3;
      for (let r = 0; r < 3; r++) for (let i = 0; i < 7; i++)
        omino(d, -6 + i * 2, 1.4 + r * .5, -3 + r * 1.6, P.tela, P.pelle, .6);
      salgono(d, t, 0, 4, -2, 16, P.oro, 5);
      for (let i = 0; i < 8; i++) {                                  // chi parte per l'estero
        const p = clamp01(f * 1.4 - i * .08);
        if (p <= 0) continue;
        omino(d, -6 + i * 1.7, 1.4, 4 + p * 7, P.viola, P.pelle, .75);
      }
    } };
},

muratori(rng) {
  return { cielo: CUPO, raggio: CALDO, ambiente: .6, fronte: FR,
    statici(m) { interno(m, 19, 8, 11, P.pietraChiara, P.legno); },
    dinamici(d, t) {
      /* Migliaia di documenti medievali raccolti e pubblicati: la storia
         comincia a fondarsi sulle carte e non sulle cronache. */
      const f = (t * .12) % 1.3;
      for (let i = 0; i < 30; i++) {                                 // gli scaffali che si riempiono
        const p = clamp01((f - (i / 36)) * 5);
        if (p <= 0) continue;
        const da = arrivo(d, p);
        da(-7 + (i % 10) * 1.5, 2.6 + Math.floor(i / 10) * 1.6, -6, .8, i % 4 ? P.cotto : P.oro);
      }
      omino(d, 0, 1.4, 2, P.nero, P.pelle, .9);
      pila(d, clamp01(f * 1.4), 12, -3, 2.4, 0, P.tela, .8);
    } };
},

tiepolo(rng) {
  return { cielo: GIORNO, raggio: CALDO, ambiente: .7, fronte: FR,
    statici(m) { interno(m, 19, 11, 11, P.tela, P.tela); },
    dinamici(d, t) {
      /* Cieli chiari e nuvole: i soffitti si aprono, e lui verrà chiamato a
         Würzburg e a Madrid, dove morirà. */
      const f = (t * .12) % 1.3;
      for (let x = -8; x <= 8; x += 2) for (let z = -6; z <= 2; z += 2) {
        const i = (x + 8) / 2 * 5 + (z + 6) / 2;
        if (f < i / 45) continue;
        d(x, 12.2, z, 1.8, P.acquaChiara);
      }
      for (let i = 0; i < 14; i++) {
        if (f < .5 + i / 40) continue;
        const a = i * 2.399;
        d(Math.cos(a) * (3 + (i % 4) * 1.4), 11.6, -2 + Math.sin(a) * (2 + (i % 4)), .9, P.biancoIt);
      }
      for (let i = 0; i < 6; i++) {
        if (f < .9) break;
        const a = i / 6 * Math.PI * 2 + t * .2;
        d(Math.cos(a) * 4, 11, -2 + Math.sin(a) * 3, .6, P.pelle);
      }
      omino(d, 0, 1.4, 3, P.terraScura, P.pelle, .9);
    } };
},

'catasto-teresiano'(rng) {
  return { cielo: GIORNO, raggio: CALDO,
    statici(m) { suolo(m, 12, P.erba, P.terra, rng, .4); },
    dinamici(d, t) {
      /* Ogni campo misurato e stimato, e le tasse che seguono la terra invece
         del privilegio: la riforma più efficace del secolo. */
      const f = (t * .12) % 1.3;
      for (let r = 0; r < 5; r++) for (let c = 0; c < 5; c++) {
        const i = r * 5 + c;
        const p = clamp01((f - (i / 30)) * 5);
        if (p <= 0) continue;
        const da = arrivo(d, p);
        const x = -10 + c * 4.4, z = -10 + r * 4.4;
        for (let k = 0; k <= 4; k++) {
          da(x + k, 1.2, z, .8, P.oro);
          da(x, 1.2, z + k, .8, P.oro);
        }
        if (f > i / 30 + .15) da(x + 2, 1.6, z + 2, .8, P.tela);
      }
      for (let i = 0; i < 6; i++) omino(d, -8 + i * 3.4, 1.4, 11, P.viola, P.pelle, .78);
    } };
},

caffe(rng) {
  return { cielo: CUPO, raggio: CALDO, ambiente: .6, fronte: FR,
    statici(m) { interno(m, 17, 7, 10, P.cotto, P.legno); },
    dinamici(d, t) {
      /* Un giornale che parla di economia e costume in lingua semplice:
         l'illuminismo italiano ha una sua rivista, e un tavolino. */
      const f = (t * .14) % 1.3;
      for (let i = 0; i < 6; i++) {
        const a = i / 6 * Math.PI * 2;
        omino(d, Math.cos(a) * 3, 1.4, -1 + Math.sin(a) * 2.4, P.viola, P.pelle, .82);
        d(Math.cos(a) * 2.2, 2.5, -1 + Math.sin(a) * 1.8, .3, P.terraScura);
      }
      pila(d, clamp01(f * 1.4), 12, -6, 2.4, -3, P.tela, .8);
      salgono(d, t, 0, 3.4, -1, 10, P.oro, 2.4);
    } };
},

winckelmann(rng) {
  return { cielo: GIORNO, raggio: CALDO, ambiente: .7, fronte: FR,
    statici(m) { interno(m, 19, 9, 11, P.marmo, P.marmoOmbra); },
    dinamici(d, t) {
      /* Nobile semplicità e quieta grandezza: insegna all'Europa a guardare le
         statue greche come modello, e il neoclassicismo comincia. */
      const f = (t * .12) % 1.3;
      for (let i = 0; i < 7; i++) {
        const p = clamp01((f - (i / 9)) * 5);
        if (p <= 0) continue;
        const da = arrivo(d, p);
        const x = -6 + i * 2;
        da(x, 2.4, -4, 1, P.marmo); da(x, 3.5, -4, .95, P.marmo); da(x, 4.5, -4, .8, P.marmo);
      }
      pila(d, clamp01((f - .5) * 2.4), 8, -3, 2.4, 2, P.tela, .8);
      omino(d, 5, 1.4, 2, P.viola, P.pelle, .9);
    } };
},

'soppressione-gesuiti'(rng) {
  return { cielo: CUPO, raggio: CALDO, ambiente: .55, fronte: FR,
    statici(m) { interno(m, 19, 8, 11, P.pietraChiara, P.legno); },
    dinamici(d, t) {
      /* Centinaia di collegi passano allo Stato: le cattedre restano, cambia
         chi ci sale. */
      const f = (t * .12) % 1.3;
      for (let i = 0; i < 8; i++) {
        const via = f > (i + 1) / 10;
        omino(d, -7 + i * 2, 1.4, -3, via ? P.viola : P.nero, P.pelle, .85);
      }
      for (let i = 0; i < 12; i++) {                                 // i banchi, che restano
        d(-7 + (i % 6) * 2.4, 1.6, 2 + Math.floor(i / 6) * 1.8, .9, P.legno);
        omino(d, -7 + (i % 6) * 2.4, 2, 2 + Math.floor(i / 6) * 1.8, P.tela, P.pelle, .55);
      }
      for (let i = 0; i < 6; i++) {
        if (f < .8) break;
        d(-3 + i * 1.2, 5.4, -6.4, .6, P.oro);
      }
    } };
},

'gaetano-filangieri'(rng) {
  return { cielo: CUPO, raggio: CALDO, ambiente: .6, fronte: FR,
    statici(m) { bottega(m, P.tela); },
    dinamici(d0, t) {
      /* Uno Stato con istruzione pubblica e giustizia uguale per tutti:
         Franklin lo leggeva e gli scriveva dall'altra parte dell'oceano. */
      const f = (t * .13) % 1.3;
      const d = dissolvenza(d0, f, 1.3);   // il ciclo si ritira invece di spegnersi
      pila(d, clamp01(f * 1.4), 14, -4, 2.4, -1, P.tela, .8);
      omino(d, -5, 1.4, 2, P.viola, P.pelle, .9);
      for (let i = 0; i < 8; i++) {                                  // le lettere che attraversano
        const p = ((f + i / 8) % 1);
        d(-2 + p * 9, 4 + Math.sin(p * Math.PI) * 2.4, -1, .45, P.tela);
      }
      omino(d, 6, 1.4, 2, P.blu, P.pelle, .9);
    } };
},

'beccaria-milano'(rng) {
  return { cielo: GIORNO, raggio: CALDO, ambiente: .6, fronte: FR,
    statici(m) { interno(m, 17, 7, 10, P.pietraChiara, P.legno); },
    dinamici(d, t) {
      /* Le idee del Caffè diventano leggi: il supplizio giudiziario sparisce
         dai tribunali lombardi. */
      const f = (t * .12) % 1.3;
      const via = clamp01(f * 1.5);
      const strumenti = [P.ferro, P.tronco, P.nero, P.grigio];
      for (let i = 0; i < 4; i++) {
        const q = clamp01(via * 1.4 - i * .18);
        if (q >= 1) continue;
        d(-4.5 + i * 3, 2.6 + q * 4, -3, .9 * (1 - q), strumenti[i]);
      }
      pila(d, clamp01((f - .4) * 2), 10, -3, 2.4, 1, P.tela, .8);
      pubblico(d, t, 10, -6, 4, [P.viola]);
    } };
},

'leopoldo-pena'(rng) {
  return { cielo: GIORNO, raggio: CALDO, ambiente: .6, fronte: FR,
    statici(m) { interno(m, 17, 8, 10, P.marmo, P.marmoOmbra); },
    dinamici(d, t) {
      /* Il primo sovrano al mondo a cancellare la pena di morte dal codice: il
         patibolo viene smontato pezzo per pezzo. */
      const f = (t * .12) % 1.3;
      const smonta = clamp01(f * 1.4);
      for (let i = 0; i < 8; i++) {
        const q = clamp01(smonta * 1.5 - i * .11);
        if (q >= 1) continue;
        d(-1 + (i % 3), 2 + Math.floor(i / 3), -3, .9 * (1 - q), P.tronco);
      }
      const legge = clamp01((f - .5) * 2.4);
      d(0, 5, -3, 1.6 * legge, P.tela);
      omino(d, -5, 1.4, 2, P.viola, P.pelle, .95);
      folla(d, t, 0, 5, 14, 1.8, [P.tela, P.terraScura], 1.2);
    } };
},

appiani(rng) {
  return { cielo: GIORNO, raggio: CALDO,
    statici(m) { suolo(m, 12, P.pietraChiara, P.terra, rng); },
    dinamici(d, t) {
      /* Archi, fori e accademie: per la prima volta la città si dota di un
         aspetto da capitale. */
      const f = (t * .11) % 1.3;
      const su = clamp01(f * 1.4);
      for (let x = -6; x <= 6; x++) for (let y = 0; y < 9 * su; y++) {
        if (Math.abs(x) < 2 && y < 6) continue;
        d(x, 1 + y, -6, 1, P.marmo);
      }
      for (let x = -7; x <= 7; x++) { if (su > .8) d(x, 10.4, -6, .9, P.marmoOmbra); }
      for (let i = 0; i < 6; i++) {
        if (su < .6) break;
        d(-5 + i * 2, 2.4, 2, .9, P.marmo);                          // le statue lungo il viale
      }
      folla(d, t, 0, 6, 12, 1.8, [P.viola, P.tela], 1.2);
    } };
},

foscolo(rng) {
  return { cielo: TRAMONTO, nebbia: 0x3a3038, raggio: CALDO, ambiente: .55,
    statici(m) { suolo(m, 12, P.erbaScura, P.terra, rng, .8); for (let i = 0; i < 5; i++) albero(m, -9 + i * 5, -9, 1, rng); },
    dinamici(d, t) {
      /* Contro l'editto che allontana le tombe dalle città: la memoria dei
         morti tiene insieme una nazione. */
      const f = (t * .1) % 1.3;
      const via = clamp01(f * 1.4);
      for (let i = 0; i < 12; i++) {                                 // le tombe che si allontanano
        const x = -8 + (i % 6) * 3;
        d(x, 1.4, -2 + via * 8 + Math.floor(i / 6) * 2, .9, P.marmo);
        d(x, 2.2, -2 + via * 8 + Math.floor(i / 6) * 2, .7, P.marmoOmbra);
      }
      omino(d, 0, 1.4, -8, P.viola, P.pelle, .95);
      salgono(d, t, 0, 3.4, -8, 10, P.oro, 2.4);
    } };
},

vienna(rng) {
  return { cielo: GIORNO, raggio: CALDO, ambiente: .6, fronte: FR,
    statici(m) { interno(m, 19, 8, 11, P.marmo, P.marmoOmbra); },
    dinamici(d, t) {
      /* I vecchi sovrani rimessi sui troni e l'Austria a guardia di tutti. Ma
         il Codice e l'idea di nazione restano sul tavolo. */
      const f = (t * .12) % 1.3;
      const pezzi = [P.blu, P.grigioverde, P.viola, P.marrone, P.ocra, P.rosso, P.corallo];
      for (let i = 0; i < 7; i++) {
        const messo = f > (i + 1) / 9;
        d(-6 + i * 2, 2.6 + (messo ? 0 : 3), -2, 1.2, messo ? pezzi[i] : P.grigio);
      }
      for (let i = 0; i < 6; i++) omino(d, -5 + i * 2, 1.4, 3, P.viola, P.pelle, .82);
      const resta = clamp01((f - .8) * 4);
      if (resta > 0) { d(0, 2.6, 5, 1.2 * resta, P.tela); d(0, 3.4, 5, .8 * resta, P.oro); }
    } };
},

belli(rng) {
  return { cielo: CUPO, raggio: CALDO,
    statici(m) { piazza(m, 11, rng, P.cotto, P.tetto, 4); },
    dinamici(d, t) {
      /* Duemiladuecento sonetti in romanesco che danno voce al popolo contro
         preti e potenti: l'autore li vorrà bruciare, e per fortuna non lo fa. */
      const f = (t * .12) % 1.3;
      omino(d, 0, 1.4, 3, P.nero, P.pelle, .9);
      folla(d, t, 0, -2, 22, 1.8, [P.terraScura, P.tela], 1.2);
      for (let i = 0; i < 16; i++) {                                 // le voci raccolte
        if (f < i / 20) continue;
        const a = i * 2.399, r = 3 + (i % 5) * 1.2;
        d(Math.cos(a) * r, 3.4 + (i % 3) * .8, -2 + Math.sin(a) * r * .6, .4, P.oro);
      }
      pila(d, clamp01(f * 1.3), 10, -2, 2.4, 5, P.tela, .7);
    } };
},

'pio-ix'(rng) {
  return { cielo: GIORNO, raggio: CALDO,
    statici(m) { piazza(m, 11, rng, P.marmo, P.tetto, 5); },
    dinamici(d, t) {
      /* Amnistia ai detenuti politici e speranze su un'Italia federale guidata
         da Roma: dureranno due anni. */
      const f = (t * .1) % 1;
      const speranza = f < .55;
      omino(d, 0, 1.4, -4, P.biancoIt, P.pelle, 1);
      folla(d, t, 0, 2, 26, 2, speranza ? [P.tela, P.viola] : [P.nero], 1.2);
      for (let k = 0; k < 4; k++) {
        if (!speranza) break;
        bandiera(d, t, -6 + k * 4, 2, 6, 3, [P.verdeIt, P.biancoIt, P.rossoIt], k);
      }
      if (!speranza) {
        const p = clamp01((f - .55) * 2.4);
        omino(d, 0, 1.4, -4 - p * 6, P.biancoIt, P.pelle, 1);
      }
    } };
},

cavour(rng) {
  return { cielo: CUPO, raggio: CALDO, ambiente: .6, fronte: FR,
    statici(m) { interno(m, 19, 8, 11, P.pietraChiara, P.legno); },
    dinamici(d, t) {
      /* Ferrovie, banche, trattati: un piccolo stato che si rende utile alle
         grandi potenze. L'unità come progetto diplomatico. */
      const f = (t * .12) % 1.3;
      omino(d, 0, 1.4, 2, P.nero, P.pelle, .95);
      const strumenti = [P.ferro, P.oro, P.tela, P.acquaChiara];
      for (let i = 0; i < 4; i++) {
        const q = clamp01((f - i * .12) * 4);
        if (q <= 0) continue;
        d(-4.5 + i * 3, 2.6, -1, .9, strumenti[i]);
      }
      for (let i = 0; i < 10; i++) {                                 // i fili verso l'estero
        if (f < .5) break;
        const g = ((t * .5 + i * .1) % 1);
        d(-8 + g * 16, 5 + Math.sin(g * Math.PI) * 1.6, -4, .35, P.oro);
      }
      for (let i = 0; i < 5; i++) d(-6 + i * 3, 2.6, 5, .6, P.grigio);
    } };
},

plombieres(rng) {
  return { cielo: CUPO, raggio: CALDO, ambiente: .6, fronte: FR,
    statici(m) { interno(m, 15, 6, 9, P.tela, P.legno); },
    dinamici(d0, t) {
      /* Un accordo segreto: aiuto militare in cambio di Nizza e della Savoia.
         Due uomini, una stanza, e mezza penisola. */
      const f = (t * .13) % 1.3;
      const d = dissolvenza(d0, f, 1.3);   // il ciclo si ritira invece di spegnersi
      omino(d, -2.4, 1.4, -1, P.blu, P.pelle, .95);
      omino(d, 2.4, 1.4, -1, P.viola, P.pelle, .95);
      d(0, 2.6, -1, 1.4, P.tela);
      const patto = clamp01((f - .4) * 2.4);
      for (let i = 0; i < 6; i++) {
        const p = clamp01((patto - (i / 8)) * 5);
        if (p <= 0) continue;
        const da = arrivo(d, p);
        da(-1.5 + i * .6, 2.8, -1, .3, P.nero);
      }
      if (patto > .7) {                                              // i due pezzi che cambiano mano
        d(-4, 3.4, 1, .8, P.lavanda);
        d(-2.8, 3.4, 1, .8, P.lavanda);
      }
    } };
},

'suez-italia'(rng) {
  return { cielo: GIORNO, raggio: CALDO,
    statici(m) { porto(m, 6, rng); for (let i = 0; i < 4; i++) m.guscio(-10 + i * 6, 2, 8, 4, 4, 3, P.cotto); },
    dinamici(d, t) {
      /* Riaperta la rotta per l'Oriente, i porti italiani tornano al centro:
         Genova e Trieste crescono più in trent'anni che in due secoli. */
      const f = (t * .1) % 1.3;
      onde(d, t, 12, 3, [12, 7]);
      const traffico = 1 + Math.floor(clamp01(f * 1.4) * 5);
      for (let k = 0; k < traffico; k++) {
        const p = ((t * .3 + k * .17) % 1);
        nave(d, t, -12 + p * 18, 1.2, -6 + (k % 3) * 3, 1, 7, P.legno, 0, 0);   // il piroscafo è lungo sei
        for (let y = 0; y < 3; y++) d(-12 + p * 18 + 2.4, 2.4 + y, -6 + (k % 3) * 3, .5, P.grigio);
      }
      for (let i = 0; i < 12; i++) omino(d, -10 + i * 1.8, 2, 6.5, P.terraScura, P.pelle, .75);
    } };
},

'legge-coppino'(rng) {
  return { cielo: GIORNO, raggio: CALDO, ambiente: .65, fronte: FR,
    statici(m) { interno(m, 19, 7, 11, P.tela, P.legno); },
    dinamici(d0, t) {
      /* Tre anni di scuola obbligatoria e gratuita: l'analfabetismo, che era al
         settantacinque per cento, comincia a scendere davvero. */
      const f = (t * .13) % 1.3;
      const d = dissolvenza(d0, f, 1.3);   // il ciclo si ritira invece di spegnersi
      for (let r = 0; r < 3; r++) for (let c = 0; c < 8; c++) {
        const i = r * 8 + c;
        const presente = f > i / 30;
        if (!presente) continue;
        d(-7 + c * 2, 1.6 + r * .5, -2 + r * 1.8, .9, P.legno);
        omino(d, -7 + c * 2, 2, -2 + r * 1.8, [P.tela, P.viola, P.rosso][r], P.pelle, .55);
      }
      omino(d, 0, 1.4, -5, P.nero, P.pelle, .95);
      for (let i = 0; i < 10; i++) {
        if (f < .6) break;
        d(-4.5 + i, 4.4, -6.4, .6, P.biancoIt);                      // le lettere sulla lavagna
      }
    } };
},

verga(rng) {
  return { cielo: TRAMONTO, raggio: CALDO,
    statici(m) { porto(m, 4, rng, P.roccia); for (let i = 0; i < 4; i++) casa(m, -9 + i * 5, 7, 3, 3, 2, P.tela, P.tetto, 2); },
    dinamici(d, t) {
      /* Una famiglia di pescatori raccontata con la loro lingua e senza
         commenti: il verismo mostra il Sud che la politica non guarda. */
      const f = (t * .09) % 1;
      const barca = ((t * 1.2) % 26) - 13;
      for (let i = 0; i < 5; i++) d(barca + i * .9, 1.2, -3, .8, P.legno);
      omino(d, barca + 2, 2, -3, P.terraScura, P.pelle, .8);
      const tempesta = f > .5;
      if (tempesta) for (let i = 0; i < 20; i++) {
        const g = (t * 1.6 + i * .05) % 1;
        d(((i * 6151) % 25) - 12, 10 - g * 10, ((i * 3571) % 25) - 12, .3, P.ghiaccio);
      }
      onde(d, t, 12, 3, [12, 5]);
      for (let i = 0; i < 6; i++) omino(d, -6 + i * 2.4, 2, 5, P.tela, P.pelle, .75);
    } };
},

cuore(rng) {
  return { cielo: GIORNO, raggio: CALDO, ambiente: .65, fronte: FR,
    statici(m) { interno(m, 19, 7, 11, P.tela, P.legno); },
    dinamici(d, t) {
      /* Il diario di uno scolaro torinese insegna a generazioni cosa dovrebbe
         essere la patria: verrà tradotto in tutto il mondo. */
      const f = (t * .13) % 1.3;
      for (let r = 0; r < 3; r++) for (let c = 0; c < 8; c++) {
        d(-7 + c * 2, 1.6 + r * .5, -2 + r * 1.8, .9, P.legno);
        omino(d, -7 + c * 2, 2, -2 + r * 1.8, [P.tela, P.viola, P.blu][r], P.pelle, .55);
      }
      omino(d, 0, 1.4, -5, P.nero, P.pelle, .95);
      pila(d, clamp01(f * 1.4), 12, -3, 4.4, -6.2, P.rosso, .8);
      for (let k = 0; k < 3; k++) {
        if (f < .8) break;
        bandiera(d, t, -4 + k * 4, 4.4, -6, 2, [P.verdeIt, P.biancoIt, P.rossoIt], k);
      }
    } };
},

'pizza-margherita'(rng) {
  return { cielo: CUPO, raggio: FUOCO, ambiente: .6, fronte: FR,
    statici(m) { bottega(m, P.cotto); },
    dinamici(d0, t) {
      /* Tre colori su un disco: la storia è forse ritoccata, il successo no. */
      const f = (t * .2) % 1.3;
      const d = dissolvenza(d0, f, 1.3);   // il ciclo si ritira invece di spegnersi
      fuoco(d, t, 5, 2, -4, 8, .9, 0);
      const fatta = clamp01(f * 1.5);
      for (let i = 0; i < 12; i++) {
        const a = i / 12 * Math.PI * 2;
        d(-2 + Math.cos(a) * 1.6, 2.6, -1 + Math.sin(a) * 1.6, .8 * fatta, P.tela);
      }
      d(-2, 2.6, -1, 1.4 * fatta, P.tela);
      if (fatta > .6) {
        for (let i = 0; i < 5; i++) d(-2 + Math.cos(i * 1.25) * 1, 2.75, -1 + Math.sin(i * 1.25) * 1, .5, P.rossoIt);
        for (let i = 0; i < 4; i++) d(-2 + Math.cos(i * 1.6) * .7, 2.8, -1 + Math.sin(i * 1.6) * .7, .45, P.biancoIt);
        for (let i = 0; i < 4; i++) d(-2 + Math.cos(i * 2.1) * 1.2, 2.8, -1 + Math.sin(i * 2.1) * 1.2, .35, P.verdeIt);
      }
      omino(d, -6, 1.4, 2, P.tela, P.pelle, .9);
    } };
},

'burri-sicilia'(rng) {
  return { cielo: GIORNO, raggio: CALDO, ambiente: .6, fronte: FR,
    statici(m) { interno(m, 17, 7, 10, P.pietraChiara, P.legno); },
    dinamici(d, t) {
      /* Prima dello Stato sociale, operai e contadini si assicurano da soli:
         pochi centesimi a settimana messi in una cassa comune. */
      const f = (t * .16) % 1.3;
      d(0, 2.4, -1, 1.6, P.legno);
      for (let i = 0; i < 14; i++) {
        const p = ((f + i / 14) % 1);
        omino(d, -8 + p * 16, 1.4, 3, P.terraScura, P.pelle, .78);
        if (p > .4 && p < .55) d(-8 + p * 16, 3, 1, .35, P.oro);
      }
      pila(d, clamp01(f), 12, -1.5, 3.2, -1, P.oro, .5);
      for (let i = 0; i < 5; i++) {
        if (f < .8) break;
        d(-4 + i * 2, 2.4, -4, .7, P.tela);                          // i sussidi che escono
      }
    } };
},

giolitti(rng) {
  return { cielo: GIORNO, raggio: CALDO,
    statici(m) { suolo(m, 12, P.pietraChiara, P.terra, rng); fabbrica(m, -11, -9, 22, 8, 6, P.cotto, 3); },
    dinamici(d, t) {
      /* Lo Stato smette di reprimere gli scioperi e li lascia svolgere: in
         dieci anni l'industria raddoppia e nascono i grandi sindacati. */
      const f = (t * .1) % 1;
      const sciopero = f < .45;
      if (sciopero) {
        for (let i = 0; i < 16; i++) omino(d, -8 + i * 1.1, 2, 4, P.terraScura, P.pelle, .78);
        for (let k = 0; k < 3; k++) bandiera(d, t, -6 + k * 6, 2, 6, 3, [P.rossoIt, P.rossoIt], k);
      } else {
        const p = clamp01((f - .45) * 2);
        for (let i = 0; i < 18; i++) omino(d, -9 + (i % 9) * 2, 2, 4 - p * 5, P.divisa, P.pelle, .75);
        for (let k = 0; k < 3; k++) fuoco(d, t, -9 + k * 7, 13, -8, 5, .7, k * .3);
      }
    } };
},

suffragio(rng) {
  return { cielo: GIORNO, raggio: CALDO, ambiente: .65, fronte: FR,
    statici(m) { interno(m, 19, 7, 11, P.tela, P.legno); },
    dinamici(d, t) {
      /* L'elettorato passa da tre a otto milioni: votano anche gli analfabeti
         sopra i trent'anni. Le donne dovranno aspettare ancora. */
      const f = (t * .14) % 1.3;
      for (let i = 0; i < 20; i++) {
        const p = ((f + i / 20) % 1);
        const escluso = i % 5 === 0;
        if (escluso) { omino(d, -9 + (i % 5) * 1.4, 1.4, 8, P.viola, P.pelle, .78); continue; }
        omino(d, -8 + p * 16, 1.4, 4 - (p > .4 && p < .7 ? 3 : 0), P.terraScura, P.pelle, .78);
      }
      d(0, 2.4, -3, 1.6, P.legno);
      pila(d, clamp01(f), 14, -1.5, 3, -3, P.tela, .5);
      omino(d, 4, 1.4, -3, P.nero, P.pelle, .9);
    } };
},

'ordine-nuovo'(rng) {
  return { cielo: CUPO, raggio: CALDO, ambiente: .6, fronte: FR,
    statici(m) { interno(m, 17, 7, 10, P.grigio, P.ferro, P.grigio); },
    dinamici(d, t) {
      /* Il potere operaio dentro lo stabilimento: dalla fabbrica esce anche una
         cultura politica, e un giornale che la scrive. */
      const f = (t * .13) % 1.3;
      for (let i = 0; i < 12; i++) {
        const a = i / 12 * Math.PI * 2;
        omino(d, Math.cos(a) * 3.4, 1.4, -1 + Math.sin(a) * 2.6, P.terraScura, P.pelle, .8);
      }
      for (let i = 0; i < 10; i++) {                                 // le mani alzate, il voto
        const p = clamp01((f - (i / 12)) * 5);
        if (p <= 0) continue;
        const da = arrivo(d, p);
        const a = i / 10 * Math.PI * 2;
        da(Math.cos(a) * 3.4, 3.4, -1 + Math.sin(a) * 2.6, .35, P.pelle);
      }
      pila(d, clamp01(f * 1.3), 10, -6, 2.4, -3, P.tela, .7);
    } };
},

'vittoria-mutilata'(rng) {
  return { cielo: CUPO, raggio: CALDO, ambiente: .6, fronte: FR,
    statici(m) { interno(m, 19, 8, 11, P.marmo, P.marmoOmbra); },
    dinamici(d, t) {
      /* Trento e Trieste sì, la Dalmazia no: uno slogan che avvelena il
         dopoguerra più di quanto pesi la geografia. */
      const f = (t * .12) % 1.3;
      const pezzi = [[P.verdeIt, -4], [P.verdeIt, -1.5], [P.grigio, 1], [P.grigio, 3.5]];
      for (let i = 0; i < 4; i++) {
        const dato = i < 2;
        d(pezzi[i][1], 2.6 + (dato ? 0 : 0), -2, 1.2, dato ? pezzi[i][0] : P.grigio);
        if (!dato && f > .5) d(pezzi[i][1], 3.6, -2, .5, P.rosso);
      }
      omino(d, -5, 1.4, 2, P.divisa, P.pelle, .9);
      folla(d, t, 2, 4, 14, 1.8, [P.nero, P.terraScura], 1.2);
      salgono(d, t, 2, 3.4, 4, 8, P.rosso, 2.4);
    } };
},

acerbo(rng) {
  return { cielo: CUPO, raggio: CALDO, ambiente: .6, fronte: FR,
    statici(m) { interno(m, 19, 9, 11, P.marmo, P.marmoOmbra); },
    dinamici(d, t) {
      /* Chi prende un quarto dei voti ottiene due terzi dei seggi: il
         Parlamento vota da solo la propria fine. */
      const f = (t * .12) % 1.3;
      const trasf = clamp01((f - .4) * 2.4);
      for (let r = 0; r < 4; r++) for (let c = 0; c < 9; c++) {
        const i = r * 9 + c;
        const era = i < 9;                                           // un quarto scarso
        const ora = i < 24;
        const nero = trasf > .5 ? ora : era;
        omino(d, -7 + c * 1.8, 1.4 + r * .5, -3 + r * 1.6, nero ? P.nero : P.viola, P.pelle, .74);
      }
      for (let i = 0; i < 8; i++) {
        if (trasf < .8) break;
        d(-3 + i * .9, 5.4, -6.4, .5, P.nero);
      }
    } };
},

'quota-90'(rng) {
  return { cielo: CUPO, raggio: CALDO, ambiente: .6, fronte: FR,
    statici(m) { interno(m, 17, 8, 10, P.pietraChiara, P.legno); },
    dinamici(d, t) {
      /* La lira rivalutata per prestigio: le esportazioni crollano, i salari
         vengono tagliati, e la deflazione morde. */
      const f = (t * .12) % 1.3;
      const su = clamp01(f * 1.5);
      for (let i = 0; i < 10; i++)                                   // la lira che sale
        d(-4, 2.4 + su * 4 + i * .1, -1, .6, P.oro);
      for (let k = 0; k < 3; k++) {                                  // le colonne che scendono
        const giu = su;
        for (let y = 0; y < 6 * (1 - giu * .7); y++)
          d(1 + k * 2, 2 + y, -1, .8, [P.grigio, P.cotto, P.divisa][k]);
      }
      omino(d, -6, 1.4, 2, P.nero, P.pelle, .9);
      for (let i = 0; i < 8; i++) omino(d, -3 + i * 1.4, 1.4, 4, P.terraScura, P.pelle, .74);
    } };
},

lateranensi(rng) {
  return { cielo: GIORNO, raggio: CALDO, ambiente: .6, fronte: FR,
    statici(m) { interno(m, 19, 8, 11, P.marmo, P.marmoOmbra); },
    dinamici(d0, t) {
      /* Stato e Chiesa si riconoscono: nasce la Città del Vaticano e finisce la
         questione aperta nel 1870. */
      const f = (t * .13) % 1.3;
      const d = dissolvenza(d0, f, 1.3);   // il ciclo si ritira invece di spegnersi
      omino(d, -3, 1.4, -1, P.nero, P.pelle, .95);
      omino(d, 3, 1.4, -1, P.biancoIt, P.pelle, .95);
      d(0, 2.6, -1, 1.6, P.tela);
      const firmato = clamp01((f - .4) * 2.4);
      for (let i = 0; i < 8; i++) {
        const p = clamp01((firmato - (i / 10)) * 5);
        if (p <= 0) continue;
        const da = arrivo(d, p);
        da(-2 + i * .5, 2.8, -1, .3, P.nero);
      }
      if (firmato > .7) {                                            // il territorio, minuscolo
        for (let x = -1; x <= 1; x++) for (let z = -1; z <= 1; z++)
          d(x, 4.4, -4 + z, .9, P.biancoIt);
        d(0, 5.4, -4, .6, P.oro);
      }
    } };
},

'roma-citta-aperta'(rng) {
  return { cielo: CUPO, nebbia: 0x2e3038, raggio: 0xc8c0a8, ambiente: .55,
    statici(m) { piazza(m, 11, rng, P.cotto, P.tetto, 5); },
    dinamici(d, t) {
      /* Girato per strada, con pellicola di recupero, mentre la guerra è
         appena finita: il neorealismo si impone nel mondo. */
      const f = (t * .12) % 1.3;
      for (let i = 0; i < 4; i++) d(-6 + i * .5, 2.6, 4, .5, P.nero);   // la cinepresa
      d(-4.5, 3.4, 4, .8, P.nero);
      omino(d, -6, 1.4, 5, P.terraScura, P.pelle, .85);
      const scena = ((f * 2) % 1);
      omino(d, -2 + scena * 6, 1.4, 0, P.nero, P.pelle, .9);
      for (let i = 0; i < 10; i++) omino(d, -8 + i * 2, 1.4, -4, P.tela, P.pelle, .75);
      for (let i = 0; i < 12; i++) {                                 // i fotogrammi
        if (f < i / 14) continue;
        d(6, 3 + (i % 6) * .7, -3 + Math.floor(i / 6) * 1.4, .6, P.grigio);
      }
    } };
},

});

})();
