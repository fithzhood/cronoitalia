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
  divisa: 0x6b7358, oliva: 0x7f8f42, grigioblu: 0x6c8296, grigioverde: 0x7d9188,
  porpora: 0x8e3f68, sangue: 0x8c2f2a, ruggine: 0xa8552f, ottone: 0xc2a24a,
  marrone: 0x96674a, senape: 0xb9a13e, corallo: 0xd9836a, menta: 0x6fbfa3,
  ocra: 0xc9a227, indaco: 0x6b5bb0, magenta: 0xb8558e, lavanda: 0x9a92c4,
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

/* Terreno: una piastra quadrata con qualche dosso, più uno strato sotto.
 *
 * L'altezza è una funzione liscia delle coordinate, senza rumore per cella:
 * con il rumore due celle vicine potevano differire di due blocchi, e nel
 * gradino si vedeva il vuoto sotto la piastra. Così il dislivello fra celle
 * confinanti resta di un blocco al massimo, e i due strati bastano a chiudere. */
function suolo(m, R, cSopra, cSotto, rng, rilievo) {
  rilievo = rilievo || 0;
  for (let x = -R; x <= R; x++) for (let z = -R; z <= R; z++) {
    const h = rilievo ? Math.round(rilievo * (Math.sin(x * .45) * .5 + Math.cos(z * .4) * .5)) : 0;
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

/* La coda del ciclo.
 *
 * Quasi tutte le scene fanno comparire le cose con lo stesso meccanismo: una
 * `f` che scorre (`(t * .12) % 1.3`) e i pezzi che si accendono uno dopo
 * l'altro quando `f` li supera. Il guaio è la fine: quando il modulo gira, `f`
 * torna a zero e tutto sparisce nello stesso fotogramma. A occhio è un lampo —
 * il plastico si spegne e si riaccende.
 *
 * Questo restituisce una `d` che nell'ultimo pezzo di ciclo rimpicciolisce i
 * cubi fino a niente: il plastico si ritira invece di spegnersi, e quando `f`
 * riparte non c'era comunque più nulla da far sparire. Costa una moltiplicazione
 * per blocco e solo durante la coda: fuori dalla coda torna la `d` originale.
 */
function dissolvenza(d, f, periodo, coda) {
  coda = coda || periodo * .09;
  if (f < periodo - coda) return d;
  const via = Math.max(0, (periodo - f) / coda);
  return (x, y, z, s, c) => d(x, y, z, s * via, c);
}

/* L'arrivo di un pezzo.
 *
 * L'altra metà del problema che risolve `dissolvenza`: le cose non solo
 * sparivano di colpo, comparivano di colpo. Un `if (f < i / n) continue` accende
 * il pezzo numero i da un fotogramma all'altro, e una scena fatta solo di questi
 * è una sequenza di apparizioni, non un'animazione.
 *
 * Con `p` che va da 0 a 1 il cubo scende dall'alto e cresce fino alla misura
 * piena, con partenza e arrivo morbidi. A `p` pieno restituisce la `d`
 * originale, così non costa niente quando il pezzo è già a posto.
 */
function arrivo(d, p, alto) {
  if (p >= 1) return d;
  const q = p * p * (3 - 2 * p);
  const giu = (1 - q) * (alto || 2.5);
  return (x, y, z, s, c) => d(x, y + giu, z, s * q, c);
}

/* L'ora della scena, aggiornata a ogni fotogramma dal ciclo. Serve ai pezzi del
   kit che devono muoversi da soli pur non ricevendo `t` fra i parametri —
   cioè agli omini. Fuori dal browser la impostano i controlli con
   `VoxScena.tempo(t)`. */
let orologio = 0;

/* Una figura: due cubi di veste e uno di testa.
 *
 * Respira. Senza, metà dei plastici erano fotografie: file di persone immobili
 * come birilli mentre attorno non si muoveva nient'altro. Il movimento è
 * piccolo apposta (un ottavo di blocco), e la fase la dà la posizione, così
 * dieci figure in fila non ondeggiano all'unisono come un coro. */
function omino(d, x, y, z, cVeste, cPelle, s) {
  s = s || 1;
  const fase = (x * 12.9898 + z * 78.233) % 6.283;
  const su = Math.sin(orologio * 1.35 + fase) * .13 * s;
  const on = Math.sin(orologio * .8 + fase * 1.7) * .09 * s;
  d(x, y + su, z, s, cVeste);
  d(x + on * .5, y + s + su, z, s, cVeste);
  d(x + on, y + s * 2 + su, z, s * .9, cPelle);
}

/* ---------------- elementi riusabili ----------------
 *
 * Sono i pezzi che tornano in decine di scene: un tempio, una cattedrale, una
 * torre, una nave, una folla. Ogni scena firma diventa così una composizione di
 * pochi elementi più l'idea che la distingue, invece di trenta righe di cubi
 * ricopiati. */

// Tempio a colonne con architrave e frontone: greco, romano o neoclassico.
function tempio(m, x0, z0, cols, righe, h, c, cTetto) {
  cTetto = cTetto || c;
  for (let i = 0; i < cols; i++) for (let k = 0; k < righe; k++) {
    if (k > 0 && k < righe - 1 && i > 0 && i < cols - 1) continue;
    const x = x0 + i * 2, z = z0 + k * 2;
    for (let y = 0; y < h; y++) m.p(x, 1 + y, z, c);
  }
  const w = (cols - 1) * 2, d = (righe - 1) * 2;
  for (let x = x0 - 1; x <= x0 + w + 1; x++) for (let z = z0 - 1; z <= z0 + d + 1; z++) {
    m.p(x, 0, z, c);                                   // il basamento
    m.p(x, h + 1, z, cTetto);                          // l'architrave
  }
  for (let k = 1; k <= 2; k++)                         // il frontone
    for (let x = x0 - 1 + k; x <= x0 + w + 1 - k; x++) m.p(x, h + 1 + k, z0 - 1 + k, cTetto);
}

// Chiesa con navata, abside e campanile a fianco.
function cattedrale(m, x0, z0, w, d, h, cMuro, cTetto) {
  m.guscio(x0, 1, z0, w, h, d, cMuro);
  for (let k = 0; k < Math.ceil(w / 2); k++)
    for (let x = x0 + k; x < x0 + w - k; x++) for (let z = z0; z < z0 + d; z++) {
      if (x > x0 + k && x < x0 + w - k - 1) continue;
      m.p(x, 1 + h + k, z, cTetto);
    }
  const cx = x0 - 2, cz = z0 + 1;                      // il campanile
  for (let y = 0; y < h + 6; y++) m.p(cx, 1 + y, cz, y > h + 3 ? cTetto : cMuro);
  m.p(cx, h + 7, cz, P.oro);
}

// Torre con merli, per rocche e cinte murarie.
function torre(m, x, z, h, c, merli) {
  for (let y = 0; y < h; y++) for (const [dx, dz] of [[0, 0], [1, 0], [0, 1], [1, 1]])
    m.p(x + dx, 1 + y, z + dz, c);
  if (merli !== false) for (const [dx, dz] of [[0, 0], [1, 1]]) m.p(x + dx, 1 + h, z + dz, c);
}

// Cinta muraria rettangolare con torri agli angoli.
function mura(m, x0, z0, w, d, h, c) {
  for (let x = x0; x < x0 + w; x++) for (const z of [z0, z0 + d - 1])
    for (let y = 0; y < h; y++) m.p(x, 1 + y, z, y === h - 1 && x % 2 ? c : c);
  for (let z = z0; z < z0 + d; z++) for (const x of [x0, x0 + w - 1])
    for (let y = 0; y < h; y++) m.p(x, 1 + y, z, c);
  for (let x = x0; x < x0 + w; x += 2) { m.p(x, 1 + h, z0, c); m.p(x, 1 + h, z0 + d - 1, c); }
  for (let z = z0; z < z0 + d; z += 2) { m.p(x0, 1 + h, z, c); m.p(x0 + w - 1, 1 + h, z, c); }
}

// Nave animata: scafo, albero, vele, remi che battono. `verso` è +1 o -1.
function nave(d, t, x, y, z, verso, lung, cScafo, cVela, remi) {
  const beccheggio = Math.sin(t * 1.4 + x) * .12;
  for (let i = 0; i < lung; i++) d(x + i * .85 * verso, y + beccheggio, z, 1, cScafo);
  for (let i = 1; i < lung - 1; i++) d(x + i * .85 * verso, y + .9 + beccheggio, z, .8, cScafo);
  const mx = x + (lung * .4) * .85 * verso;
  for (let k = 0; k < 5; k++) d(mx, y + 1.6 + k + beccheggio, z, .4, P.tronco);
  if (cVela) for (let k = 0; k < 3; k++) d(mx, y + 2.6 + k * 1.3 + beccheggio, z, 1.6 - k * .3, cVela);
  if (remi) for (let i = 0; i < remi; i++) {
    const r = Math.sin(t * 3.5 + i) * .45;
    d(x + (1 + i * 1.5) * verso, y + .4, z + 1.1 + r, .45, P.legno);
    d(x + (1 + i * 1.5) * verso, y + .4, z - 1.1 - r, .45, P.legno);
  }
}

// Folla che salta e ondeggia attorno a un punto.
function folla(d, t, cx, cz, n, r0, colori, y) {
  for (let i = 0; i < n; i++) {
    const a = i * 2.399, r = r0 + (i % 7) * .8;
    omino(d, cx + Math.cos(a) * r, (y || 1.1) + Math.abs(Math.sin(t * 3 + i)) * .3,
      cz + Math.sin(a) * r, colori[i % colori.length], P.pelle, .75);
  }
}

// Colonna di fuoco e fumo che sale e si dirada.
function fuoco(d, t, x, y, z, n, raggio, seme) {
  for (let i = 0; i < n; i++) {
    const f = ((t * .8 + i * (1 / n) + (seme || 0)) % 1);
    d(x + Math.sin(i * 2.4 + t) * raggio * (.4 + f), y + f * (3 + raggio),
      z + Math.cos(i * 1.7 + t) * raggio * (.4 + f),
      1 - f * .55, f < .3 ? P.fuoco : f < .62 ? P.brace : P.fumo);
  }
}

// Bandiera tricolore (o di altri colori) che sventola su un'asta.
function bandiera(d, t, x, y, z, altezza, colori, seme) {
  for (let k = 0; k < altezza; k++) d(x, y + k, z, .35, P.tronco);
  const on = Math.sin(t * 3 + (seme || 0)) * .3;
  for (let i = 0; i < colori.length; i++)
    d(x + .7 + i * .7, y + altezza - .6 + on * i * .3, z + on * .3, .7, colori[i]);
}

// Cielo stellato per le scene notturne.
function stelle(d, n, raggio, altezza) {
  for (let i = 0; i < n; i++) {
    const a = i * 2.399;
    d(Math.cos(a) * (raggio + (i % 5)), altezza + (i % 7), Math.sin(a) * (raggio + (i % 5)),
      .3, i % 4 ? P.biancoIt : P.oro);
  }
}

// Superficie d'acqua animata, saltando un riquadro centrale (l'isola, la nave…).
function onde(d, t, R, passo, salta) {
  for (let x = -R; x <= R; x += passo) for (let z = -R; z <= R; z += passo) {
    if (salta && Math.abs(x) <= salta[0] && Math.abs(z) <= salta[1]) continue;
    d(x, .6 + Math.sin(t * 1.7 + x * .4 + z * .3) * .26, z, passo * .95, P.acquaChiara);
  }
}

// Ciminiere fumanti: opifici, ferriere, centrali.
function fabbrica(m, x0, z0, w, d, h, cMuro, ciminiere) {
  m.guscio(x0, 1, z0, w, h, d, cMuro);
  for (let x = x0; x < x0 + w; x++) for (let z = z0; z < z0 + d; z++) m.p(x, 1 + h, z, P.grigio);
  for (let k = 0; k < (ciminiere || 2); k++) {
    const cx = x0 + 1 + k * Math.max(2, Math.floor(w / (ciminiere || 2)));
    for (let y = 0; y < h + 5; y++) m.p(cx, 1 + y, z0 + 1, P.cotto);
  }
}

// Ponte ad arcate.
function ponte(m, x0, z, lung, h, c) {
  for (let x = x0; x < x0 + lung; x++) m.p(x, h, z, c);
  for (let x = x0; x < x0 + lung; x += 3) for (let y = 1; y < h; y++) m.p(x, y, z, c);
}

/* ---------------- scenografie ricorrenti ----------------
 *
 * Metà delle scene ha bisogno di uno di questi palcoscenici. Averli qui evita
 * di ricopiare ogni volta trenta righe di pareti e travi, e soprattutto evita
 * che ogni copia sbagli in modo diverso. */

/* Stanza aperta davanti: parete di fondo, due laterali, travi a soffitto.
   Va sempre accompagnata da `fronte: Math.PI / 2` nella scena, altrimenti la
   camera per mezzo giro mostra il retro del muro. */
function interno(m, larg, alt, prof, cMuro, cSoffitto, cSuolo) {
  const hx = Math.floor(larg / 2), zf = -Math.floor(prof / 2) - 2, zd = zf + prof;
  suolo(m, Math.max(hx, 9) + 1, cSuolo || P.pietraChiara, P.pietra, Math.random);
  for (let x = -hx; x <= hx; x++) for (let y = 1; y <= alt; y++) m.p(x, y, zf, cMuro);
  for (let z = zf; z <= zd; z++) for (let y = 1; y <= alt; y++) {
    m.p(-hx, y, z, cMuro); m.p(hx, y, z, cMuro);
  }
  for (let x = -hx; x <= hx; x += 2) for (let z = zf; z <= zd; z += 2)
    m.p(x, alt + 1, z, cSoffitto || P.legno);
  return { hx, zf, zd };
}

/* Piazza lastricata con edifici staccati tutt'intorno: se si chiude l'anello
   la piazza sparisce e resta una massa di mattoni. */
function piazza(m, R, rng, cMuro, cTetto, alt) {
  suolo(m, R, P.pietraChiara, P.terra, rng);
  const posti = [];
  for (let k = 0; k < 6; k++) { posti.push([-R + 1 + k * 3, -R + 1]); posti.push([-R + 1 + k * 3, R - 4]); }
  for (let k = 0; k < 3; k++) { posti.push([-R + 1, -R + 5 + k * 4]); posti.push([R - 4, -R + 5 + k * 4]); }
  for (let i = 0; i < posti.length; i++)
    casa(m, posti[i][0], posti[i][1], 3, 3, (alt || 3) + (i % 3), i % 2 ? cMuro : P.tela, cTetto || P.tetto, 1);
  return posti;
}

/* Campo aperto con alberi ai margini: lo sfondo di quasi tutte le battaglie. */
function campo(m, R, rng, rilievo, cErba) {
  suolo(m, R, cErba || P.erbaScura, P.terra, rng, rilievo || 0);
  for (let i = 0; i < 4; i++) albero(m, -R + 1, -R + 3 + i * 6, 1, rng);
  for (let i = 0; i < 3; i++) albero(m, R - 1, -R + 5 + i * 7, 1, rng);
}

/* Costa con banchina: mare fino a `zRiva`, poi terra e molo. */
function porto(m, zRiva, rng, cTerra) {
  for (let x = -12; x <= 12; x++) for (let z = -12; z <= 12; z++) m.p(x, 0, z, P.mare);
  for (let x = -12; x <= 12; x++) for (let z = zRiva; z <= 12; z++) {
    m.p(x, 1, z, cTerra || P.pietraChiara);
    m.p(x, 0, z, P.terra);
  }
  for (let x = -10; x <= 10; x++) m.p(x, 1, zRiva, P.pietra);
}

/* Sala teatrale: palco in fondo, ordini di palchi ai lati, platea davanti. */
function teatro(m) {
  interno(m, 19, 10, 11, P.cotto, P.legno, P.legno);
  for (let x = -8; x <= 8; x++) for (let y = 1; y <= 5; y++) m.p(x, y, -7, P.rosso);
  m.box(-8, 1, -6, 17, 1, 3, P.legno);
}

/* Bottega o studio: banco da lavoro, scaffale, pareti chiare. */
function bottega(m, cMuro) {
  interno(m, 17, 7, 10, cMuro || P.tela, P.tronco, P.legno);
  m.box(-3, 1, -2, 7, 1, 3, P.legno);
  for (let i = 0; i < 4; i++) m.p(-7, 2 + i, -6, P.legno);
}

/* Rilievo a cupola: colline, acropoli, alture di battaglia. */
function collina(m, R, alt, cCima, cBase) {
  for (let x = -R; x <= R; x++) for (let z = -R; z <= R; z++) {
    const h = Math.max(0, Math.round(alt - Math.hypot(x, z) * (alt / R)));
    m.p(x, h, z, h > alt * .6 ? (cCima || P.roccia) : (cBase || P.erbaScura));
    for (let y = 0; y < h; y++) m.p(x, y, z, P.terra);
  }
}

/* Valle stretta fra due versanti, con il fondo percorribile. */
function valle(m, R, largo, altezza, cCima, cFondo) {
  for (let x = -R; x <= R; x++) for (let z = -R; z <= R; z++) {
    const h = Math.min(altezza, Math.round(Math.max(0, (Math.abs(x) - largo) * 1.1)));
    m.p(x, h, z, h > altezza * .7 ? (cCima || P.neve) : h > 0 ? P.roccia : (cFondo || P.terraScura));
    for (let y = 0; y < h; y++) m.p(x, y, z, P.roccia);
  }
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
        // La cenere ricade dentro la piastra: con il raggio che cresceva con i
        // arrivava a diciotto blocchi e la pioggia di cenere finiva sul nero.
        d(Math.cos(a) * (4 + (i % 8) * .8), 24 - f * 22, -4 + Math.sin(a) * (2.5 + (i % 8) * .7), .8, P.cenere);
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
      /* Il solco dell'aratro che si allunga, e i buoi che tirano. In fondo alla
         corsa il solco si richiude piano: prima spariva tutto in un fotogramma,
         e sembrava che il plastico saltasse. */
      const avanti = (t * 2.2) % 20 - 10;
      const via = avanti > 7 ? (10 - avanti) / 3 : 1;
      for (let x = -10; x < avanti; x++) d(x, 1.6, 6, .9 * via, P.terraScura);
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
    dinamici(d0, t) {
      // la cupola si chiude anello per anello, poi ricomincia
      const f = (t * .18) % 1.35;
      const d = dissolvenza(d0, f, 1.35);   // il ciclo si ritira invece di spegnersi
      for (let y = 0; y < 7; y++) {
        const salita = clamp01((f - y * .13) * 6);
        if (salita <= 0) continue;
        const da = arrivo(d, salita);
        const r = 6 - y * .8;
        const n = Math.max(6, Math.round(r * 6));
        for (let a = 0; a < n * salita; a++) {
          const an = a / n * Math.PI * 2;
          da(Math.cos(an) * r, 9 + y, Math.sin(an) * r, 1, y % 2 ? P.tetto : P.cotto);
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
      const gx = ((t * 2.4) % 20) - 12;             // la gondola che passa, tutta dentro la laguna
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
    dinamici(d0, t) {
      const f = (t * .1) % 1;
      const d = dissolvenza(d0, f, 1);   // il ciclo si ritira invece di spegnersi
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
    dinamici(d0, t) {
      const f = (t * .22) % 1;
      const d = dissolvenza(d0, f, 1);   // il ciclo si ritira invece di spegnersi
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
        const r = 1 + f * 8;                        // l'anello resta sopra il prato
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
      /* Il mare che si ritira: si abbassa e scorre verso il largo, ma senza
         uscire dalla piastra — l'acqua che scivolava oltre il bordo restava
         sospesa sul nero. */
      const ritiro = clamp01((f - .5) * 2.5);
      for (let x = -12; x <= 12; x += 2)
        for (let z = 4; z <= 12; z += 2) {
          const zz = z + ritiro * 3;
          if (zz > 12) continue;
          d(x, .6 - ritiro * 1.4 + Math.sin(t * 2 + x * .3) * .2, zz, 1.9, P.acqua);
        }
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
      /* La colonna è lunga più della piastra: le posizioni si avvolgono, così
         nessuno finisce a marciare nel vuoto fuori dal plastico. Il giro sta
         entro ±10 e non ±13: l'elefante è lungo, e con la proboscide sporgeva
         di tre blocchi oltre il bordo. */
      const giro = v => ((v + 10) % 20 + 20) % 20 - 10;
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
        const z = ((t * (7 + i % 3) + i * 6) % 22) - 11;   // l'auto è lunga due blocchi: si avvolge prima del bordo
        const zz = su ? z : -z;
        const x = su ? -1.6 : 1.6;
        const c = colori[i % colori.length];
        d(x, 4.5, zz, 1, c); d(x, 4.5, zz + (su ? -1 : 1), 1, c);
        d(x, 5.4, zz + (su ? -.4 : .4), .8, c);
      }
    },
  };
},

/* ---------------- preistoria e antichità ---------------- */

otzi(rng) {
  return {
    cielo: 0x24374f, nebbia: 0x35495f, raggio: 0xdceaff, ambiente: .85,
    statici(m) {
      // una sella fra due creste, tutta neve e ghiaccio
      for (let x = -12; x <= 12; x++) for (let z = -12; z <= 12; z++) {
        const h = Math.min(5, Math.round(Math.max(0, (Math.abs(x) - 6) * .9 + Math.sin(z * .5) * .6)));
        m.p(x, 0, z, h > 0 ? P.roccia : P.neve);
        m.p(x, -1, z, P.pietraScura);
        for (let y = 1; y <= h; y++) m.p(x, y, z, y >= h ? P.neve : P.roccia);
      }
      for (let x = -4; x <= 4; x++) for (let z = -3; z <= 3; z++) m.p(x, 0, z, P.ghiaccio);
    },
    dinamici(d, t) {
      // il corpo con l'arco e l'ascia di rame, e la neve che continua a scendere
      for (let i = 0; i < 4; i++) d(-1.4 + i * .85, 1.05, 0, .95, i === 3 ? P.pelle : P.tela);
      for (let i = 0; i < 5; i++) d(-1.5 + i * .8, 1.5, 1.7, .45, P.tronco);
      d(-.6, 1.5, -1.7, .55, P.bronzo);
      d(-1.2, 1.5, -1.7, .5, P.tronco);
      for (let i = 0; i < 34; i++) {
        const f = (t * .26 + i * .029) % 1;
        d(((i * 6151) % 25) - 12, 13 - f * 13, ((i * 3571) % 25) - 12, .45, P.neve);
      }
      // vento: una velatura che passa, avvolgendosi dentro la sella
      for (let i = 0; i < 10; i++)
        d(-12 + ((t * 4 + i * 2.6) % 24), 3 + Math.sin(t + i) * .6, -7 + i, 1.2, P.ghiaccio);
    },
  };
},

nuraghi(rng) {
  return {
    cielo: 0x2c3446, raggio: 0xffe6b4,
    statici(m) {
      suolo(m, 12, P.erbaScura, P.terra, rng, 1);
      // la torre tronco-conica, a filari che rientrano
      for (let y = 0; y < 10; y++) {
        const r = 4 - y * .28;
        for (let x = -5; x <= 5; x++) for (let z = -5; z <= 5; z++) {
          const dd = Math.hypot(x, z);
          if (dd > r || dd < r - 1.2) continue;
          m.p(x, y + 1, z, y % 2 ? P.pietra : P.pietraScura);
        }
      }
      for (let z = -1; z <= 1; z++) m.p(3, 2, z, P.nero);          // l'ingresso
      // le capanne circolari del villaggio
      for (let k = 0; k < 6; k++) {
        const a = k / 6 * Math.PI * 2, cx = Math.round(Math.cos(a) * 8), cz = Math.round(Math.sin(a) * 8);
        for (let x = -2; x <= 2; x++) for (let z = -2; z <= 2; z++) {
          const dd = Math.hypot(x, z);
          if (dd > 2 || dd < 1.2) continue;
          m.p(cx + x, 1, cz + z, P.pietra);
          m.p(cx + x, 2, cz + z, P.pietra);
        }
        m.p(cx, 3, cz, P.legno);
      }
    },
    dinamici(d, t) {
      for (let i = 0; i < 7; i++) {                                // il gregge
        const a = t * .25 + i * .9;
        d(Math.cos(a) * (5 + i * .3), 1.5, Math.sin(a) * (5 + i * .3), .8, P.tela);
      }
      omino(d, Math.cos(t * .25) * 6.5, 1.1, Math.sin(t * .25) * 6.5 + 1.5, P.terraScura, P.pelle);
      for (let i = 0; i < 8; i++)                                  // fumo dal villaggio
        d(-5.6, 4 + ((t * 1.2 + i * .4) % 5), -5.6, .7, P.fumo);
    },
  };
},

canne(rng) {
  return {
    cielo: 0x2b2f24, raggio: 0xffdf9c,
    statici(m) {
      suolo(m, 12, P.terraScura, P.terra, rng, .8);
      for (let z = -12; z <= 12; z++) { m.p(-11, 1, z, P.acqua); m.p(-10, 1, z, P.acqua); }
      for (let i = 0; i < 3; i++) albero(m, 10, -8 + i * 8, 1, rng);
    },
    dinamici(d, t) {
      /* L'accerchiamento in tre tempi: la massa romana spinge al centro, la linea
         punica arretra a mezzaluna, le ali si chiudono alle spalle. */
      const f = (t * .11) % 1;
      for (let i = 0; i < 36; i++) {
        const c = i % 9, r = Math.floor(i / 9);
        omino(d, -7 + f * 6 - r * 1.15, 1.1, -4.6 + c * 1.15, P.rosso, P.pelle, .8);
      }
      for (let i = 0; i < 11; i++) {
        const z = -5.5 + i * 1.1;
        omino(d, 3.2 - Math.cos(z / 6) * 2.2 * Math.min(1, f * 2.4), 1.1, z, P.viola, P.pelle, .8);
      }
      const morsa = clamp01((f - .3) * 2.2);
      for (let i = 0; i < 14; i++) {
        const lato = i < 7 ? -1 : 1, k = i % 7;
        omino(d, -8.5 + morsa * (6 + k * .5), 1.1, lato * (7 - morsa * 4.2) + k * .4 * lato, P.viola, P.pelle, .8);
      }
      for (let i = 0; i < 16; i++) {
        const g = (t * .5 + i * .062) % 1;
        d(-2 + Math.sin(i * 2.1) * 4, 1 + g * 3.2, -5 + (i % 10), .85 * (1 - g), P.polvere);
      }
    },
  };
},

appia(rng) {
  return {
    cielo: 0x25344a, raggio: 0xffe8bc,
    statici(m) {
      suolo(m, 12, P.erbaScura, P.terra, rng, 1.4);
      // basolato: la strada corre diagonale, con i cippi e i pini ai lati
      for (let k = -12; k <= 12; k++) {
        for (let w = -1; w <= 1; w++) m.p(k, 2, k * .35 + w | 0, P.pietraChiara);
        if (k % 4 === 0) m.p(k, 3, (k * .35 | 0) + 2, P.marmoOmbra);
      }
      for (let i = 0; i < 5; i++) {
        const x = -9 + i * 5, z = (x * .35 | 0) - 4;
        m.colonna(x, z, 1, 3, P.tronco);
        for (let dx = -2; dx <= 2; dx++) for (let dz = -2; dz <= 2; dz++)
          if (Math.abs(dx) + Math.abs(dz) <= 2) m.p(x + dx, 5, z + dz, P.foglie);
      }
      for (let i = 0; i < 3; i++) {                                 // sepolcri sulla via
        const x = -6 + i * 7, z = (x * .35 | 0) + 4;
        m.guscio(x, 1, z, 3, 3, 3, P.cotto);
        m.p(x + 1, 4, z + 1, P.marmo);
      }
    },
    dinamici(d, t) {
      /* Carro e viandanti percorrono la via e ricompaiono dall'altro capo. Il
         giro va scritto con il modulo raddrizzato: `(v % 26) - 13` su un v
         negativo dà un resto negativo, e i viandanti finivano a diciannove
         blocchi dal centro, sette oltre il bordo della piastra. */
      const giro = v => ((v + 10) % 20 + 20) % 20 - 10;
      const p = giro(t * 2.2);                                      // il carro
      const zc = p * .35 | 0;
      for (let i = 0; i < 4; i++) d(p + (i % 2) * 1.1, 3.4, zc + Math.floor(i / 2) * .9, 1, P.legno);
      d(p + .5, 4.3, zc + .4, .9, P.tela);
      d(p - 1.4, 3.2, zc - .3, 1, P.terraScura);
      d(p - 2.4, 3.2, zc - .3, 1, P.terraScura);
      for (let i = 0; i < 5; i++) {                                 // viandanti
        const x = giro(p + 7 + i * 3);
        omino(d, x, 3, x * .35 - 1 | 0, P.tela, P.pelle, .8);
      }
      for (let i = 0; i < 10; i++) {                                // la polvere dietro al carro
        const g = (t * .8 + i * .1) % 1;
        const px = p - 3 - g * 2;
        if (px < -11) continue;                                     // dove finisce la via finisce anche la polvere
        d(px, 3 + g, zc + .5, .7 * (1 - g), P.polvere);
      }
    },
  };
},

alarico(rng) {
  return {
    cielo: 0x2a1c1a, nebbia: 0x3a2620, raggio: 0xffb87a, ambiente: .6,
    statici(m) {
      suolo(m, 12, P.pietraChiara, P.terra, rng);
      for (let i = 0; i < 6; i++) { m.colonna(-7 + i * 3, -6, 1, 6, P.marmo); m.p(-7 + i * 3, 7, -6, P.marmoOmbra); }
      for (let x = -8; x <= 8; x++) m.p(x, 8, -6, P.marmoOmbra);     // la trabeazione
      for (let i = 0; i < 4; i++) casa(m, -8 + i * 5, 4, 4, 4, 3, P.cotto, P.tetto);
      m.box(-2, 1, 0, 4, 1, 3, P.marmo);
    },
    dinamici(d, t) {
      // incendi che salgono dai tetti e figure in fuga
      for (let k = 0; k < 4; k++) {
        const bx = -6 + k * 5, bz = 5.5;
        for (let i = 0; i < 9; i++) {
          const f = (t * .7 + i * .11 + k * .3) % 1;
          d(bx + Math.sin(i * 2.4) * 1.2, 5 + f * 4, bz + Math.cos(i * 1.7) * 1.2,
            1 - f * .6, f < .35 ? P.fuoco : f < .7 ? P.brace : P.fumo);
        }
      }
      for (let i = 0; i < 9; i++) {
        const p = ((t * 1.6 + i * 2.4) % 22) - 11;
        omino(d, p, 1.1, -2 + (i % 5) * 1.3, i % 3 ? P.tela : P.nero, P.pelle, .8);
      }
      for (let i = 0; i < 6; i++) {                                  // colonne che cadono
        const f = clamp01(Math.sin(t * .3) * 2 - .6);
        d(-7 + i * 3, 7 - f * 5.4, -6 + f * 3, 1, P.marmo);
      }
    },
  };
},

/* ---------------- tardo antico e medioevo ---------------- */

'ravenna-mosaici'(rng) {
  return {
    cielo: 0x1a1d2a, nebbia: 0x24283a, raggio: 0xffe2a8, ambiente: .65, fronte: Math.PI / 2,
    statici(m) {
      suolo(m, 10, P.marmoOmbra, P.pietraScura, rng);
      /* Una parete piana, non un catino: la curva a blocchi da questa camera
         diventa una massa grumosa e mangia le tessere invece di mostrarle. */
      for (let x = -9; x <= 9; x++) for (let y = 1; y <= 12; y++) {
        if (y > 9 && Math.abs(x) < 9 - (y - 9) * 2.6) continue;      // l'arco sopra
        m.p(x, y, -7, P.pietraChiara);
      }
      for (let z = -7; z <= 3; z++) for (let y = 1; y <= 10; y++) {
        m.p(-9, y, z, P.pietraChiara);
        m.p(9, y, z, P.pietraChiara);
      }
      for (const cx of [-6, 6]) {                                    // le due colonne
        for (let y = 1; y <= 7; y++) m.p(cx, y, 2, P.marmo);
        m.p(cx, 8, 2, P.marmoOmbra);
        m.p(cx, 9, 2, P.oro);
      }
      for (let x = -9; x <= 9; x += 2) m.p(x, 11, 2, P.marmoOmbra);
    },
    dinamici(d0, t) {
      /* Le tessere calano riga per riga e compongono il fondo d'oro con la croce
         e la cornice, poi il ciclo ricomincia. */
      const f = (t * .14) % 1.3;
      const d = dissolvenza(d0, f, 1.3);   // il ciclo si ritira invece di spegnersi
      const W = 15, H = 9;
      for (let r = 0; r < H; r++) for (let c = 0; c < W; c++) {
        const arrivo = clamp01((f - (r * W + c) / (W * H)) * 18);
        if (arrivo <= 0) continue;
        const croce = c === 7 || (r === 3 && c > 3 && c < 11);
        const bordo = r === 0 || r === H - 1 || c === 0 || c === W - 1;
        d(-7 + c, 2 + r + (1 - arrivo) * 6, -6.3, .92,
          croce ? P.rosso : bordo ? P.blu : ((c + r) % 7 === 0 ? P.bronzo : P.oro));
      }
      omino(d, 0, 1.2, 4, P.viola, P.pelle, 1.1);
      for (let i = 0; i < 8; i++) {                                  // pulviscolo nella luce
        const g = (t * .25 + i * .12) % 1;
        d(-6 + i * 1.7, 8 - g * 5, -2 + g * 3, .32, P.oro);
      }
    },
  };
},

benedetto(rng) {
  return {
    cielo: 0x243449, raggio: 0xffeccc,
    statici(m) {
      // il monte, a gradoni
      for (let x = -12; x <= 12; x++) for (let z = -12; z <= 12; z++) {
        const h = Math.max(0, Math.round(5 - Math.hypot(x, z) * .45));
        m.p(x, h, z, h > 3 ? P.pietraChiara : P.erbaScura);
        for (let y = 0; y < h; y++) m.p(x, y, z, P.roccia);
      }
      casa(m, -4, -3, 8, 7, 4, P.marmo, P.tetto, 6);                // l'abbazia
      for (let y = 0; y < 8; y++) m.p(-5, 6 + y, -4, y > 5 ? P.tetto : P.marmoOmbra);
      m.p(-5, 14, -4, P.oro);
      for (let i = 0; i < 5; i++) albero(m, -10 + i * 5, 10, 1, rng);
      for (let k = 0; k < 12; k++) m.p(Math.round(6 - k * .6), Math.max(0, 5 - Math.round(k * .45)) + 1, k - 3, P.sabbia);
    },
    dinamici(d, t) {
      // i monaci salgono in fila lungo il sentiero
      for (let i = 0; i < 7; i++) {
        const k = ((t * 1.1 + i * 1.6) % 14);
        const x = 6 - k * .6, y = Math.max(0, 5 - Math.round(k * .45)) + 1.1, z = k - 3;
        omino(d, x, y, z, P.nero, P.pelle, .8);
      }
      const camp = Math.sin(t * 2.4) * .35;                          // la campana
      d(-5 + camp, 12.6, -4, .8, P.bronzo);
      for (let i = 0; i < 10; i++) {                                 // rintocchi
        const f = (t * .5 + i * .1) % 1;
        d(-5 + Math.cos(i * 1.9) * (1 + f * 5), 12.6 + Math.sin(i * 1.3) * f * 3, -4 + Math.sin(i * 1.9) * (1 + f * 5),
          .4 * (1 - f), P.oro);
      }
    },
  };
},

'palermo-emirato'(rng) {
  return {
    cielo: 0x22304a, raggio: 0xffeec0,
    statici(m) {
      suolo(m, 12, P.sabbia, P.terra, rng);
      // i canali del giardino, a croce
      for (let k = -11; k <= 11; k++) { m.p(k, 0, 0, P.acqua); m.p(0, 0, k, P.acqua); }
      for (let k = -11; k <= 11; k++) { m.p(k, 1, 1, P.pietraChiara); m.p(k, 1, -1, P.pietraChiara); }
      // il padiglione con la cupola rossa
      m.guscio(-3, 1, 4, 7, 4, 6, P.marmo);
      for (let y = 0; y < 3; y++) {
        const r = 3 - y;
        for (let x = -r; x <= r; x++) for (let z = -r; z <= r; z++)
          if (x * x + z * z <= r * r) m.p(x, 5 + y, 7 + z, P.tetto);
      }
      m.p(0, 8, 7, P.oro);
      m.colonna(-8, -6, 1, 9, P.marmo);                              // il minareto
      m.p(-8, 10, -6, P.tetto);
      for (let i = 0; i < 8; i++) {                                  // gli agrumi
        const x = i < 4 ? -7 + i * 2 : 3 + (i - 4) * 2, z = i % 2 ? -5 : -8;
        albero(m, x, z, 1, rng);
        m.p(x + 1, 5, z, P.oro);
        m.p(x - 1, 5, z + 1, P.oro);
      }
    },
    dinamici(d, t) {
      for (let k = -11; k <= 11; k += 2) {                           // l'acqua che scorre
        d(k, .5 + Math.sin(t * 3 + k) * .18, 0, .9, P.acquaChiara);
        d(0, .5 + Math.cos(t * 3 + k) * .18, k, .9, P.acquaChiara);
      }
      for (let i = 0; i < 6; i++) {                                  // zampilli
        const f = (t * .8 + i * .17) % 1;
        d(0, 1 + Math.sin(f * Math.PI) * 4, 0, .5, P.acquaChiara);
        d(Math.cos(i) * f * 3, 1 + Math.sin(f * Math.PI) * 3, Math.sin(i) * f * 3, .4, P.acquaChiara);
      }
      omino(d, -4, 2, -3, P.tela, P.pelle);
      omino(d, 4, 2, 2, P.verdeIt, P.pelle);
    },
  };
},

legnano(rng) {
  return {
    cielo: 0x27313c, raggio: 0xffe0a4,
    statici(m) {
      suolo(m, 12, P.erbaScura, P.terra, rng, 1);
      for (let i = 0; i < 4; i++) albero(m, -11, -9 + i * 6, 1, rng);
    },
    dinamici(d, t) {
      // il Carroccio al centro, l'urto attorno
      const osc = Math.sin(t * 1.2) * .2;
      for (let x = -2; x <= 2; x++) for (let z = -1; z <= 1; z++) d(x, 2 + osc, z, 1, P.legno);
      for (const [x, z] of [[-2, -1], [2, -1], [-2, 1], [2, 1]]) d(x, 1.2 + osc, z, .8, P.tronco);
      for (let y = 0; y < 6; y++) d(0, 3 + y + osc, 0, .7, P.tronco);
      for (let y = 0; y < 3; y++) for (let k = 0; k < 3; k++)
        d(.8 + k * .8, 7.5 - y + osc, 0, .8, y === 1 ? P.biancoIt : P.rossoIt);
      // i cavalieri imperiali caricano, i comunali tengono
      const carica = Math.sin(t * .8) * 3.4;
      for (let i = 0; i < 10; i++) {
        const z = -5 + (i % 5) * 2.2, fila = Math.floor(i / 5);
        d(8 - carica + fila * 1.6, 1.6, z, 1.1, P.ferro);
        omino(d, 8 - carica + fila * 1.6, 2.4, z, P.grigio, P.pelle, .8);
      }
      for (let i = 0; i < 18; i++) {
        const a = i / 18 * Math.PI * 2;
        omino(d, Math.cos(a) * 4.2, 1.1, Math.sin(a) * 3.4, P.rossoIt, P.pelle, .8);
      }
      for (let i = 0; i < 12; i++) {
        const g = (t * .55 + i * .083) % 1;
        d(3 + Math.sin(i * 2.3) * 3, 1 + g * 3, -4 + (i % 8), .8 * (1 - g), P.polvere);
      }
    },
  };
},

'castel-del-monte'(rng) {
  return {
    cielo: 0x263349, raggio: 0xffeec8,
    statici(m) {
      // il poggio della Murgia
      for (let x = -12; x <= 12; x++) for (let z = -12; z <= 12; z++) {
        const h = Math.max(0, Math.round(3 - Math.hypot(x, z) * .3));
        m.p(x, h, z, h > 1 ? P.sabbia : P.erbaScura);
        for (let y = 0; y < h; y++) m.p(x, y, z, P.pietraChiara);
      }
      // l'ottagono: otto lati e otto torri agli angoli
      const R = 5.2, base = 4;
      const ang = [];
      for (let k = 0; k < 8; k++) {
        const a = k / 8 * Math.PI * 2 + Math.PI / 8;
        ang.push([Math.cos(a) * R, Math.sin(a) * R]);
      }
      for (let k = 0; k < 8; k++) {
        const [x1, z1] = ang[k], [x2, z2] = ang[(k + 1) % 8];
        for (let s = 0; s <= 10; s++) {
          const x = Math.round(x1 + (x2 - x1) * s / 10), z = Math.round(z1 + (z2 - z1) * s / 10);
          for (let y = 0; y < 6; y++) m.p(x, base + y, z, y === 5 ? P.marmoOmbra : P.marmo);
        }
        for (let y = 0; y < 9; y++)                                    // la torretta d'angolo
          for (const [dx, dz] of [[0, 0], [1, 0], [0, 1], [1, 1]])
            m.p(Math.round(x1) + dx, base + y, Math.round(z1) + dz, y > 7 ? P.marmoOmbra : P.marmo);
      }
    },
    dinamici(d, t) {
      for (let i = 0; i < 10; i++) {                                   // falchi in volo
        const a = t * .5 + i * .63;
        const r = 8 + Math.sin(t * .4 + i) * 2;
        d(Math.cos(a) * r, 14 + Math.sin(a * 2 + t) * 2, Math.sin(a) * r, .55, P.nero);
      }
      for (let i = 0; i < 8; i++) {                                    // sentinelle
        const a = i / 8 * Math.PI * 2 + Math.PI / 8;
        omino(d, Math.cos(a) * 5.2, 13, Math.sin(a) * 5.2, P.rosso, P.pelle, .7);
      }
    },
  };
},

meloria(rng) {
  return {
    cielo: 0x1d3049, nebbia: 0x27405c, raggio: 0xffe4b0,
    statici(m) {
      for (let x = -12; x <= 12; x++) for (let z = -12; z <= 12; z++) m.p(x, 0, z, P.mare);
      for (let x = -12; x <= -9; x++) for (let z = -12; z <= 12; z++) { m.p(x, 1, z, P.sabbia); m.p(x, 0, z, P.terra); }
      m.colonna(-10, 0, 2, 5, P.pietraChiara);                        // la torre della secca
      m.p(-10, 7, 0, P.brace);
    },
    dinamici(d, t) {
      const urto = Math.sin(t * .6) * 2.6;
      /* Due file di galee che si vengono addosso, con i remi. Le galee sono
         lunghe otto blocchi più il rostro: partendo da sei dal centro la prua
         usciva dal mare e restava sospesa sul nero, così partono da tre. */
      for (let g = 0; g < 4; g++) {
        const z = -7 + g * 4.5;
        for (const lato of [-1, 1]) {
          const base = lato * (3 - urto * .5);
          for (let i = 0; i < 8; i++) d(base + lato * i * .9, 1.2, z, 1, lato < 0 ? P.legno : P.tronco);
          for (let i = 0; i < 5; i++) d(base + lato * (1 + i * .9), 2.1, z, .8, lato < 0 ? P.rosso : P.grigio);
          for (let i = 0; i < 4; i++) {                               // i remi
            const rem = Math.sin(t * 4 + i + g) * .5;
            d(base + lato * (2 + i * 1.4), 1.4, z + 1.2 + rem, .5, P.legno);
            d(base + lato * (2 + i * 1.4), 1.4, z - 1.2 - rem, .5, P.legno);
          }
          d(base + lato * 7.4, 1.6, z, .7, P.ferro);                  // il rostro
        }
      }
      for (let x = -12; x <= 12; x += 3) for (let z = -12; z <= 12; z += 4)
        d(x, .6 + Math.sin(t * 1.8 + x * .4 + z * .3) * .28, z, 1.8, P.acquaChiara);
    },
  };
},

/* ---------------- Rinascimento ---------------- */

cenacolo(rng) {
  return {
    cielo: 0x1e2433, nebbia: 0x2a3040, raggio: 0xffefd4, ambiente: .7, fronte: Math.PI / 2,
    statici(m) {
      suolo(m, 10, P.cotto, P.pietraScura, rng);
      // il refettorio: tre pareti e il soffitto a cassettoni, aperto verso la camera
      for (let x = -8; x <= 8; x++) for (let y = 1; y <= 8; y++) m.p(x, y, -7, P.tela);
      for (let z = -7; z <= 4; z++) for (let y = 1; y <= 8; y++) { m.p(-8, y, z, P.tela); m.p(8, y, z, P.tela); }
      for (let x = -8; x <= 8; x += 2) for (let z = -7; z <= 4; z += 2) m.p(x, 9, z, P.legno);
      for (const wx of [-4, 0, 4])                                    // le tre finestre in fondo
        for (let x = wx - 1; x <= wx + 1; x++) for (let y = 4; y <= 6; y++) m.p(x, y, -7, P.acquaChiara);
      m.box(-6, 1, -3, 13, 1, 2, P.legno);                            // la tavola
      for (let x = -6; x <= 6; x++) m.p(x, 3, -3, P.tela);
    },
    dinamici(d, t) {
      // i tredici: il gruppo si muove a onde, come nell'attimo dell'annuncio
      for (let i = 0; i < 13; i++) {
        const x = -6 + i;
        const scossa = i === 6 ? 0 : Math.sin(t * 1.6 + Math.abs(i - 6) * .9) * .22;
        const veste = i === 6 ? P.tela : (i % 3 === 0 ? P.rosso : i % 3 === 1 ? P.blu : P.viola);
        omino(d, x, 2 + Math.abs(scossa) * .4, -4.4 + scossa, veste, P.pelle, i === 6 ? 1 : .85);
      }
      for (let i = 0; i < 7; i++) d(-5 + i * 1.7, 3.5, -3, .5, P.marmo);   // le stoviglie
      for (let i = 0; i < 10; i++) {                                        // pulviscolo nella luce
        const f = (t * .2 + i * .1) % 1;
        d(-4 + (i % 3) * 4 + Math.sin(t + i), 6 - f * 4, -6 + f * 4, .35, P.oro);
      }
    },
  };
},

sistina(rng) {
  return {
    cielo: 0x1c1f2c, nebbia: 0x272b3a, raggio: 0xffe8bc, ambiente: .6, fronte: Math.PI / 2,
    statici(m) {
      suolo(m, 10, P.marmoOmbra, P.pietraScura, rng);
      for (let x = -9; x <= 9; x++) for (let y = 1; y <= 9; y++) { m.p(x, y, -8, P.tela); }
      for (let z = -8; z <= 6; z++) for (let y = 1; y <= 9; y++) { m.p(-9, y, z, P.tela); m.p(9, y, z, P.tela); }
      // la volta a botte
      for (let z = -8; z <= 6; z++) for (let a = 0; a <= 18; a++) {
        const an = Math.PI * a / 18;
        m.p(Math.round(-Math.cos(an) * 9), 10 + Math.round(Math.sin(an) * 3), z, P.pietraChiara);
      }
      // il ponteggio
      for (let x = -6; x <= 6; x++) for (let z = -3; z <= 1; z++) m.p(x, 8, z, P.legno);
      for (const x of [-6, -2, 2, 6]) for (let y = 1; y < 8; y++) { m.p(x, y, -3, P.tronco); m.p(x, y, 1, P.tronco); }
    },
    dinamici(d0, t) {
      /* Il colore compare sulla volta campata dopo campata, poi si spegne e
         Michelangelo ricomincia. */
      const f = (t * .13) % 1.2;
      const d = dissolvenza(d0, f, 1.2);   // il ciclo si ritira invece di spegnersi
      const colori = [P.rosso, P.oro, P.blu, P.verdeIt, P.viola, P.tela];
      // z parte da -8: in JavaScript il resto di un negativo è negativo, e senza
      // riportarlo in campo l'indice del colore diventa undefined.
      const tinta = i => colori[((i % colori.length) + colori.length) % colori.length];
      for (let z = -8; z <= 6; z++) {
        const quando = (z + 8) / 15;
        if (f < quando) continue;
        for (let a = 3; a <= 15; a += 2) {
          const an = Math.PI * a / 18;
          d(-Math.cos(an) * 8.4, 10 + Math.sin(an) * 2.8, z, .9, tinta(z + a));
        }
      }
      // l'uomo sdraiato sul ponteggio, il braccio che va e viene
      const bx = -5 + ((t * 1.4) % 12);
      for (let i = 0; i < 3; i++) d(bx + i * .8, 9.1, -1, .85, P.terraScura);
      d(bx + 2.4, 9.1, -1, .8, P.pelle);
      d(bx + 1.6, 9.9 + Math.sin(t * 4) * .5, -1, .5, P.pelle);
      for (let i = 0; i < 6; i++) d(-7 + i * .9, 8.6, 0, .45, tinta(i));    // i colori sul tavolato
    },
  };
},

colombo(rng) {
  return {
    cielo: 0x213a58, raggio: 0xffe0a8,
    statici(m) {
      for (let x = -12; x <= 12; x++) for (let z = -12; z <= 12; z++) m.p(x, 0, z, P.mare);
      for (let x = 4; x <= 12; x++) for (let z = -12; z <= 12; z++) { m.p(x, 1, z, P.sabbia); m.p(x, 0, z, P.terra); }
      for (let z = -6; z <= 6; z++) { m.p(4, 1, z, P.pietraChiara); m.p(5, 1, z, P.pietraChiara); }  // la banchina
      for (let i = 0; i < 4; i++) casa(m, 7 + (i % 2) * 3, -6 + i * 3, 3, 3, 3, P.tela, P.tetto, 2);
      m.colonna(6, -8, 2, 6, P.pietraChiara);
      m.p(6, 8, -8, P.brace);                                        // il faro
    },
    dinamici(d, t) {
      const f = (t * .09) % 1;
      const sx = 3 - f * 15;                                          // la caravella che si allontana
      for (let i = 0; i < 7; i++) d(sx + i * .85, 1.3 + Math.sin(t * 1.4) * .12, 0, 1, P.legno);
      for (let i = 0; i < 4; i++) d(sx + 1.5 + i * .85, 2.1, 0, .85, P.tronco);
      for (const [mx, h] of [[1.4, 5], [3.2, 6.5], [5, 4.5]]) {
        for (let y = 0; y < h; y++) d(sx + mx, 2.6 + y, 0, .4, P.tronco);
        for (let k = 0; k < 3; k++) d(sx + mx, 3.6 + k * 1.4, 0, 1.5 - k * .25, P.tela);
      }
      d(sx + 3.2, 9.4, 0, .5, P.rossoIt);
      for (let i = 0; i < 12; i++) {                                  // la scia, fin dove c'è mare
        const wx = sx + 6 + i * .8;
        if (wx > 11) continue;
        d(wx, .8, Math.sin(i * .8) * .5, 1.1 * (1 - i / 14), P.acquaChiara);
      }
      for (let i = 0; i < 6; i++)                                     // chi saluta dalla banchina
        omino(d, 4.5, 2, -4 + i * 1.6, i % 2 ? P.rosso : P.blu, P.pelle, .8);
      for (let x = -12; x <= 3; x += 3) for (let z = -12; z <= 12; z += 4)
        d(x, .6 + Math.sin(t * 1.6 + x * .4 + z * .3) * .25, z, 1.8, P.acquaChiara);
    },
  };
},

'sacco-roma'(rng) {
  return {
    cielo: 0x2a1b18, nebbia: 0x3a2620, raggio: 0xffb478, ambiente: .55,
    statici(m) {
      suolo(m, 12, P.pietraChiara, P.terra, rng);
      for (let z = -12; z <= 12; z++) for (let x = -12; x <= -7; x++) m.p(x, 1, z, P.acqua);   // il Tevere
      for (let x = -7; x <= -6; x++) for (let z = -2; z <= 2; z++) m.p(x, 2, z, P.pietraChiara); // il ponte
      // Castel Sant'Angelo: tamburo cilindrico su basamento quadro
      m.box(-2, 1, -3, 8, 2, 8, P.pietraChiara);
      for (let y = 0; y < 7; y++) for (let x = -3; x <= 3; x++) for (let z = -3; z <= 3; z++) {
        const dd = Math.hypot(x, z);
        if (dd > 3.4 || dd < 2.3) continue;
        m.p(2 + x, 3 + y, 1 + z, y % 3 === 2 ? P.marmoOmbra : P.marmo);
      }
      m.colonna(2, 1, 10, 3, P.marmo);
      m.p(2, 13, 1, P.bronzo);
      for (let i = 0; i < 4; i++) casa(m, 8, -8 + i * 5, 3, 4, 3, P.cotto, P.tetto);
    },
    dinamici(d, t) {
      // il corridoio verso il castello: figure che scappano dentro
      for (let i = 0; i < 8; i++) {
        const p = ((t * 1.8 + i * 1.9) % 14);
        omino(d, 9 - p, 2.2, 6 - p * .5, i % 2 ? P.viola : P.tela, P.pelle, .8);
      }
      for (let k = 0; k < 4; k++) {                                   // gli incendi in città
        const bx = 8, bz = -8 + k * 5;
        for (let i = 0; i < 8; i++) {
          const f = (t * .8 + i * .12 + k * .25) % 1;
          d(bx + 1 + Math.sin(i * 2.4), 5 + f * 4, bz + 1.5 + Math.cos(i * 1.7),
            1 - f * .6, f < .35 ? P.fuoco : f < .7 ? P.brace : P.fumo);
        }
      }
      for (let i = 0; i < 12; i++) {                                  // i lanzichenecchi
        const a = t * .25 + i * .52;
        omino(d, Math.cos(a) * 7.5, 1.1, Math.sin(a) * 7.5, P.nero, P.pelle, .85);
        d(Math.cos(a) * 7.5, 3.2, Math.sin(a) * 7.5, .35, P.ferro);
      }
    },
  };
},

lepanto(rng) {
  return {
    cielo: 0x1e3350, nebbia: 0x2a4262, raggio: 0xffe0a0,
    statici(m) {
      for (let x = -12; x <= 12; x++) for (let z = -12; z <= 12; z++) m.p(x, 0, z, P.mare);
    },
    dinamici(d, t) {
      const avanti = Math.sin(t * .35) * 2.2;
      /* Le due formazioni: la Lega in linea, gli Ottomani a mezzaluna. Ogni
         galea è uno scafo con l'albero, il vessillo e i remi che battono. */
      const galea = (cx, cz, verso, scafo, vess, k) => {
        for (let i = 0; i < 7; i++) d(cx + i * .8 * verso, 1.2, cz, .95, scafo);
        for (let y = 0; y < 4; y++) d(cx + 2.4 * verso, 2 + y, cz, .5, P.tronco);
        d(cx + 2.4 * verso, 6, cz, .9, vess);
        d(cx + 5.6 * verso, 1.5, cz, .6, P.ferro);
        for (let i = 0; i < 3; i++) {
          const rem = Math.sin(t * 3.5 + i + k) * .45;
          d(cx + (1 + i * 1.6) * verso, 1.5, cz + 1.1 + rem, .45, P.legno);
          d(cx + (1 + i * 1.6) * verso, 1.5, cz - 1.1 - rem, .45, P.legno);
        }
      };
      for (let k = 0; k < 5; k++) {
        const z = -8 + k * 4;
        galea(-7 + avanti, z, 1, P.legno, P.rossoIt, k);
        galea(7 - avanti + Math.abs(k - 2) * 1.4, z, -1, P.tronco, P.verdeIt, k + 7);
      }
      for (let i = 0; i < 14; i++) {                                  // le cannonate
        const f = (t * 1.1 + i * .07) % 1;
        if (f > .4) continue;
        d(-3 + i * .45, 2.4 + Math.sin(f * Math.PI) * 1.2, -8 + (i % 5) * 4, .9 * (1 - f * 2), f < .15 ? P.brace : P.fumo);
      }
      for (let x = -12; x <= 12; x += 3) for (let z = -12; z <= 12; z += 4)
        d(x, .6 + Math.sin(t * 1.8 + x * .4 + z * .3) * .26, z, 1.8, P.acquaChiara);
    },
  };
},

/* ---------------- età moderna ---------------- */

'galileo-cannocchiale'(rng) {
  return {
    cielo: 0x0e1526, nebbia: 0x16203a, raggio: 0x9fb8e0, ambiente: .45,
    statici(m) {
      suolo(m, 10, P.pietraChiara, P.pietra, rng);
      for (let x = -10; x <= 10; x++) { m.p(x, 1, -9, P.marmoOmbra); m.p(x, 2, -9, P.marmo); }  // il parapetto
      for (let z = -9; z <= 9; z++) { m.p(-10, 1, z, P.marmoOmbra); m.p(10, 1, z, P.marmoOmbra); }
      casa(m, -9, 5, 5, 5, 4, P.cotto, P.tetto, 2);
      for (let i = 0; i < 3; i++) m.colonna(3 + i * 3, 7, 2, 4, P.marmo);
    },
    dinamici(d, t) {
      // il cannocchiale sul treppiede, puntato in alto
      const mira = Math.sin(t * .3) * .5;
      for (let i = 0; i < 6; i++) d(-1 + i * .5, 3.4 + i * .42 + mira, -2, .55, P.tronco);
      for (const [dx, dz] of [[-.8, -.8], [.8, -.8], [0, .9]])
        for (let y = 0; y < 3; y++) d(dx * (1 + y * .3), 1.2 + y, -2 + dz * (1 + y * .3), .35, P.legno);
      omino(d, -2.6, 1.2, -1.4, P.nero, P.pelle);
      // Giove e i quattro satelliti medicei
      d(6, 13, -6, 1.6, P.sabbia);
      for (let i = 0; i < 4; i++) {
        const a = t * (.7 + i * .28) + i * 1.6;
        d(6 + Math.cos(a) * (2.4 + i * 1.1), 13 + Math.sin(a) * .5, -6 + Math.sin(a) * (2.4 + i * 1.1) * .4, .5, P.biancoIt);
      }
      for (let i = 0; i < 22; i++) {                                  // le stelle
        const a = i * 2.399;
        d(Math.cos(a) * (9 + (i % 5)), 11 + (i % 7), Math.sin(a) * (9 + (i % 5)) - 3,
          .3, i % 4 ? P.biancoIt : P.oro);
      }
    },
  };
},

'reggia-caserta'(rng) {
  return {
    cielo: 0x243449, raggio: 0xffeed0,
    statici(m) {
      suolo(m, 12, P.erba, P.terra, rng, .6);
      // la facciata lunga, in fondo
      for (let x = -10; x <= 10; x++) for (let y = 1; y <= 7; y++)
        m.p(x, y, -10, (x % 3 === 0 && y > 2 && y < 6) ? P.marmoOmbra : P.marmo);
      for (let x = -10; x <= 10; x++) m.p(x, 8, -10, P.tetto);
      for (let x = -3; x <= 3; x++) for (let y = 1; y <= 8; y++) m.p(x, y, -9, P.marmo);
      m.p(0, 9, -9, P.oro);
      // le vasche in fila, in prospettiva verso la reggia
      for (let k = 0; k < 5; k++) {
        const z = 8 - k * 4, w = 4 - k * .5;
        for (let x = -w; x <= w; x++) for (let dz = -1; dz <= 1; dz++) {
          m.p(Math.round(x), 1, z + dz, P.acqua);
          m.p(Math.round(x), 0, z + dz, P.pietraChiara);
        }
        for (let x = -w - 1; x <= w + 1; x++) m.p(Math.round(x), 1, z + 2, P.pietraChiara);
      }
      for (let i = 0; i < 6; i++) { albero(m, -9, -6 + i * 3, 1, rng); albero(m, 9, -6 + i * 3, 1, rng); }
    },
    dinamici(d, t) {
      for (let k = 0; k < 5; k++) {                                   // gli zampilli
        const z = 8 - k * 4;
        for (let i = 0; i < 5; i++) {
          const f = ((t * .9 + i * .2 + k * .13) % 1);
          d(-1.6 + i * .8, 1.4 + Math.sin(f * Math.PI) * (3.4 - k * .4), z, .45, P.acquaChiara);
        }
        for (let x = -3; x <= 3; x += 2)
          d(x, 1.3 + Math.sin(t * 2 + x + k) * .15, z, 1.4, P.acquaChiara);
      }
      for (let i = 0; i < 6; i++)                                     // la corte a passeggio
        omino(d, -5 + i * 2, 2, 4 + (i % 2) * 2, i % 2 ? P.viola : P.tela, P.pelle, .8);
    },
  };
},

volta(rng) {
  return {
    cielo: 0x1a2130, nebbia: 0x252d3e, raggio: 0xffe6b8, ambiente: .6, fronte: Math.PI / 2,
    statici(m) {
      suolo(m, 9, P.legno, P.tronco, rng);
      for (let x = -8; x <= 8; x++) for (let y = 1; y <= 5; y++) m.p(x, y, -8, P.tela);   // lo studio,
      for (let z = -8; z <= 5; z++) for (let y = 1; y <= 5; y++) {                        // aperto davanti
        m.p(-8, y, z, P.tela); m.p(8, y, z, P.tela);
      }
      for (let x = -8; x <= 8; x += 2) for (let z = -8; z <= 5; z += 2) m.p(x, 6, z, P.tronco);
      m.box(-3, 1, -2, 7, 2, 4, P.legno);                             // il tavolo
      for (let i = 0; i < 4; i++) m.p(-6, 2 + i, -7, P.legno);        // lo scaffale
      for (let i = 0; i < 5; i++) m.p(-6 + i, 5, -7, P.cotto);
    },
    dinamici(d0, t) {
      // la pila: dischi alternati che si impilano, poi la scintilla
      const f = (t * .22) % 1.4;
      const d = dissolvenza(d0, f, 1.4);   // il ciclo si ritira invece di spegnersi
      const n = Math.min(14, Math.floor(f * 20));
      for (let i = 0; i < n; i++)
        d(0, 3.2 + i * .32, 0, 1.1, i % 3 === 0 ? P.ferro : i % 3 === 1 ? P.bronzo : P.tela);
      if (n >= 14) {
        for (let i = 0; i < 9; i++) {                                 // l'arco elettrico
          const g = (t * 6 + i * .3) % 1;
          d(Math.sin(i * 1.9) * .8, 8 + i * .28, Math.cos(i * 1.7) * .8, .35 * (1 - g), P.oro);
        }
        for (let i = 0; i < 6; i++)
          d(-2 + i * .8, 3.4 + Math.sin(t * 8 + i) * .2, 2.4, .3, P.brace);
      }
      omino(d, -4, 3.2, 1.6, P.nero, P.pelle);
      for (let i = 0; i < 4; i++) d(3 + i * .5, 3.4, -1, .4, P.marmo);
    },
  };
},

/* ---------------- Risorgimento ---------------- */

'cinque-giornate'(rng) {
  return {
    cielo: 0x2a3040, nebbia: 0x363d50, raggio: 0xffe0a8,
    statici(m) {
      suolo(m, 12, P.pietraChiara, P.terra, rng);
      // una via stretta fra due file di case
      for (let i = 0; i < 5; i++) {
        casa(m, -11 + i * 2, -10 + i * 4, 4, 4, 5, P.cotto, P.tetto, 1);
        casa(m, 7, -10 + i * 4, 4, 4, 5, P.tela, P.tetto, 1);
      }
      for (let z = -12; z <= 12; z++) for (let x = -2; x <= 4; x++) m.p(x, 1, z, P.pietra);
    },
    dinamici(d, t) {
      // la barricata: mobili, botti e una carrozza rovesciata
      const scossa = Math.sin(t * 8) * .06;
      const roba = [[0, 2, 1.2, P.legno], [1.4, 2, 1, P.tronco], [-1, 2.2, 1.1, P.legno],
                    [.6, 3, 1, P.tronco], [2.2, 2.6, .9, P.legno], [-1.6, 3, .9, P.tronco],
                    [1, 4, .9, P.legno], [-.4, 4.2, .8, P.tronco], [2.6, 3.6, .8, P.legno]];
      for (const [x, y, s, c] of roba) d(x + scossa, y, 0, s, c);
      for (let i = 0; i < 5; i++) d(-2 + i * 1.4, 2.4, 1.4, 1, P.grigio);   // la carrozza
      d(-2, 1.4, 2.2, .8, P.tronco); d(2.4, 1.4, 2.2, .8, P.tronco);
      // i tricolori sopra la barricata
      for (let k = 0; k < 3; k++) {
        const bx = -1.6 + k * 2.2, on = Math.sin(t * 2 + k) * .25;
        for (let y = 0; y < 4; y++) d(bx, 5 + y, 0, .35, P.tronco);
        for (let i = 0; i < 3; i++)
          d(bx + .7 + i * .7, 8.4 + on, 0 + on * .5, .7, [P.verdeIt, P.biancoIt, P.rossoIt][i]);
      }
      for (let i = 0; i < 10; i++)                                    // gli insorti dietro
        omino(d, -2 + (i % 5) * 1.5, 2, 3.5 + Math.floor(i / 5) * 1.4, i % 3 ? P.tela : P.nero, P.pelle, .85);
      for (let i = 0; i < 8; i++) {                                   // gli austriaci si ritirano
        const p = ((t * 1.2 + i * 1.4) % 9);                          // fin dove arriva la via, non oltre
        omino(d, 0 + (i % 3) - 1, 2, -3 - p, P.biancoIt, P.pelle, .85);
      }
    },
  };
},

teano(rng) {
  return {
    cielo: 0x263a4e, raggio: 0xffe8bc,
    statici(m) {
      suolo(m, 12, P.erbaScura, P.terra, rng, 1.6);
      for (let x = -12; x <= 12; x++) for (let z = -1; z <= 1; z++) m.p(x, 2, z, P.sabbia);
      for (let i = 0; i < 5; i++) albero(m, -9 + i * 5, 6, 1, rng);
      casa(m, 8, -8, 4, 3, 3, P.tela, P.tetto, 2);
      m.colonna(-9, -7, 2, 4, P.pietraChiara);
    },
    dinamici(d, t) {
      /* I due cavalieri si avvicinano, si fermano, si danno la mano, poi la
         scena riparte: è l'unico gesto che serve a raccontare l'incontro. */
      const f = (t * .16) % 1;
      const av = Math.min(1, f * 2.2);
      const strette = f > .5 ? Math.sin((f - .5) * Math.PI * 4) * .5 : 0;
      const coppia = (x, verso, veste) => {
        for (let i = 0; i < 3; i++) d(x + i * .9 * verso, 3.2, 0, 1.1, P.terraScura);
        d(x + 2.4 * verso, 4, 0, .9, P.terraScura);
        d(x, 3, .8, .6, P.terraScura); d(x, 3, -.8, .6, P.terraScura);
        omino(d, x + .8 * verso, 4.2, 0, veste, P.pelle, .9);
        d(x + 1.9 * verso, 5.2 + strette, 0, .45, P.pelle);           // la mano tesa
      };
      coppia(-8 + av * 5.4, 1, P.rossoIt);
      coppia(8 - av * 5.4, -1, P.blu);
      for (let i = 0; i < 8; i++)                                     // il seguito
        omino(d, -11 + (i % 4) * 1.2 + (i > 3 ? 18 : 0), 3, -2.4 - (i % 2) * 1.2, P.grigio, P.pelle, .75);
      for (let i = 0; i < 10; i++) {
        const g = (t * .6 + i * .1) % 1;
        d(-4 + i * .9, 2.6 + g * 1.4, 1.6, .7 * (1 - g), P.polvere);
      }
    },
  };
},

/* ---------------- Novecento ---------------- */

caporetto(rng) {
  return {
    cielo: 0x1c2028, nebbia: 0x272c36, raggio: 0xa8b4c4, ambiente: .5,
    statici(m) {
      // una valle: strada in fondo, versanti ai lati
      for (let x = -12; x <= 12; x++) for (let z = -12; z <= 12; z++) {
        const h = Math.min(7, Math.round(Math.max(0, (Math.abs(x) - 4) * 1.1)));
        m.p(x, 0, z, h > 4 ? P.roccia : h > 0 ? P.erbaScura : P.terraScura);
        m.p(x, -1, z, P.pietraScura);
        for (let y = 1; y <= h; y++) m.p(x, y, z, y >= h ? (y > 5 ? P.neve : P.foglieScure) : P.roccia);
      }
      for (let z = -12; z <= 12; z++) for (let x = -3; x <= 3; x++) m.p(x, 1, z, P.terra);
      for (let i = 0; i < 4; i++) { m.colonna(-4, -9 + i * 6, 1, 2, P.tronco); m.p(-4, 3, -9 + i * 6, P.legno); }
    },
    dinamici(d, t) {
      // la colonna che ripiega, sotto la pioggia (il giro sta dentro la valle:
      // i carri sono lunghi, e a ±13 la coda usciva dalla strada)
      const giro = v => ((v + 11) % 22 + 22) % 22 - 11;
      const marcia = t * 1.3;
      for (let i = 0; i < 22; i++) {
        const z = giro(marcia + i * 1.25);
        omino(d, -2.4 + (i % 5) * 1.2, 2, z, P.divisa, P.pelle, .8);
      }
      for (let k = 0; k < 3; k++) {                                   // i carri
        const z = giro(marcia + 6 + k * 8);
        for (let i = 0; i < 4; i++) d(-1.5 + (i % 2) * 1.4, 2.2, z + Math.floor(i / 2) * 1.1, 1, P.legno);
        d(-.8, 3.1, z + .5, .9, P.tela);
        d(-.8, 2, z - 1.2, .9, P.terraScura);
      }
      for (let i = 0; i < 40; i++) {                                  // pioggia
        const f = (t * 1.4 + i * .025) % 1;
        d(((i * 6151) % 25) - 12, 12 - f * 12, ((i * 3571) % 25) - 12, .28, P.ghiaccio);
      }
    },
  };
},

liberazione(rng) {
  /* Le case stanno staccate attorno alla piazza: chiudendo l'anello a muro
     pieno la piazza spariva e restava solo una massa di mattoni. */
  const isolati = [];
  for (let k = 0; k < 7; k++) { isolati.push([-11 + k * 3, -11]); isolati.push([-11 + k * 3, 9]); }
  for (let k = 0; k < 4; k++) { isolati.push([-11, -7 + k * 4]); isolati.push([9, -7 + k * 4]); }
  return {
    cielo: 0x24405e, raggio: 0xfff0cc,
    statici(m) {
      suolo(m, 12, P.pietraChiara, P.terra, rng);
      for (let i = 0; i < isolati.length; i++) {
        const [x, z] = isolati[i];
        casa(m, x, z, 3, 3, 3 + (i % 3), i % 2 ? P.cotto : P.tela, P.tetto, 1);
      }
    },
    dinamici(d, t) {
      // le bandiere salgono sui tetti, la piazza si riempie
      const f = (t * .18) % 1.3;
      for (let k = 0; k < 6; k++) {
        const [x, z] = isolati[(k * 4) % isolati.length];
        const base = 5 + ((k * 4) % 3);
        for (let y = 0; y < 3; y++) d(x + 1, base + y, z + 1, .35, P.tronco);
        const su = clamp01((f - k * .1) * 3);
        if (su <= 0) continue;
        const on = Math.sin(t * 3 + k) * .3;
        for (let i = 0; i < 3; i++)
          d(x + 1.7 + i * .7, base + 2 + su * 2.2 + on * i * .3, z + 1 + on * .3, .7,
            [P.verdeIt, P.biancoIt, P.rossoIt][i]);
      }
      for (let i = 0; i < 46; i++) {                                  // la folla
        const a = i * 2.399, r = 1 + (i % 8) * .85;
        const salto = Math.abs(Math.sin(t * 3 + i)) * .35;
        omino(d, Math.cos(a) * r, 1.1 + salto, Math.sin(a) * r - 1,
          i % 4 === 0 ? P.rossoIt : P.grigio, P.pelle, .75);
      }
      for (let i = 0; i < 14; i++) {                                  // coriandoli
        const g = (t * .5 + i * .07) % 1;
        d(Math.cos(i * 1.7) * 6, 12 - g * 10, Math.sin(i * 1.7) * 6 - 1, .3,
          [P.verdeIt, P.biancoIt, P.rossoIt][i % 3]);
      }
    },
  };
},

'alluvione-firenze'(rng) {
  return {
    cielo: 0x232a33, nebbia: 0x2f3843, raggio: 0xc8bca4, ambiente: .55,
    statici(m) {
      suolo(m, 12, P.pietraChiara, P.terra, rng);
      for (let i = 0; i < 4; i++) {
        casa(m, -11 + i, -10 + i * 5, 4, 4, 5, P.cotto, P.tetto, 1);
        casa(m, 7, -10 + i * 5, 4, 4, 5, P.tela, P.tetto, 1);
      }
      for (let z = -12; z <= 12; z++) for (let x = -2; x <= 4; x++) m.p(x, 1, z, P.pietra);
      for (let i = 0; i < 3; i++) { m.colonna(6, -6 + i * 6, 2, 3, P.tronco); m.p(6, 5, -6 + i * 6, P.brace); }
    },
    dinamici(d, t) {
      /* Prima l'acqua nera sale nella via e i libri galleggiano, poi si ritira e
         restano le mani che li raccolgono: gli angeli del fango. */
      const f = (t * .13) % 1;
      const livello = f < .5 ? clamp01(f * 3) : clamp01((1 - f) * 3);
      for (let z = -12; z <= 12; z += 2) for (let x = -2; x <= 4; x += 2)
        d(x, 1.4 + livello * 2 + Math.sin(t * 2 + x + z) * .18, z, 1.9, P.terraScura);
      for (let i = 0; i < 14; i++) {
        const z = ((t * 1.8 + i * 2) % 26) - 13;
        d(-1 + (i % 6), 2.1 + livello * 2, z, .7, [P.cotto, P.tela, P.legno][i % 3]);
      }
      const raccolta = clamp01((f - .6) * 3);
      for (let i = 0; i < 10; i++) {
        if (raccolta <= 0) break;
        omino(d, -2 + (i % 5) * 1.6, 2, 4 + Math.floor(i / 5) * 1.6, P.blu, P.pelle, .8);
        d(-2 + (i % 5) * 1.6, 3.6 + Math.sin(t * 3 + i) * .3, 4 + Math.floor(i / 5) * 1.6, .5, P.tela);
      }
      for (let i = 0; i < 8; i++) {                                   // nafta sull'acqua
        const g = (t * .3 + i * .12) % 1;
        d(-2 + (i % 4) * 2, 1.5 + livello * 2, -12 + g * 24, 1.1, P.nero);
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
    dinamici(d0, t) {
      // le case si alzano un blocco alla volta, poi la scena si ritira e riparte
      const f = (t * .16) % 1.3;
      const d = dissolvenza(d0, f, 1.3);
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
  orologio = t;
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
  if (!giro.manuale) {
    /* Le scene con un fronte (una parete affrescata, un refettorio) non possono
       essere girate tutt'intorno: per mezzo giro si vedrebbe il retro del muro.
       Lì la camera oscilla attorno all'angolo giusto invece di fare il giro. */
    giro.ang = scenaCorr.fronte != null
      ? scenaCorr.fronte + Math.sin(t * .17) * .62
      : -0.9 + t * 0.12;
    giro.alt = .61;
    giro.dist = distAuto();
  }
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

/* Due arnesi per il banco di prova (`tools/prova-scene.html`), inutili
   nell'app: fermare il tempo su un istante preciso e disegnare il bordo del
   plastico, per vedere a occhio chi si sporge nel vuoto. */
function istante(t) {
  if (!renderer || !scenaCorr) return;
  stop();
  disegnaFrame(t);
}

function bordo() {
  if (!meshStatica) return;
  const g = meshStatica.geometry;
  g.computeBoundingBox();
  const b = g.boundingBox;
  const m = new Mondo();
  for (let x = Math.round(b.min.x); x <= Math.round(b.max.x); x++) {
    m.p(x, b.min.y, Math.round(b.min.z), 0xff0000);
    m.p(x, b.min.y, Math.round(b.max.z), 0xff0000);
  }
  for (let z = Math.round(b.min.z); z <= Math.round(b.max.z); z++) {
    m.p(Math.round(b.min.x), b.min.y, z, 0xff0000);
    m.p(Math.round(b.max.x), b.min.y, z, 0xff0000);
  }
  const cornice = costruisciStatica(m.b);
  scena.add(cornice);
}

/* Le scene firma stanno in due file: quelle storiche qui sopra, le altre in
   `cronoitalia-scene.js`, che le aggiunge con `registra`. Sono troppe perché
   stiano tutte in un file solo e restino leggibili. */
function registra(nuove) { Object.assign(FIRMA, nuove); }

const kit = {
  Mondo, suolo, suoloParziale, albero, casa, omino, clamp01, dissolvenza, arrivo,
  tempio, cattedrale, torre, mura, nave, folla, fuoco, bandiera, stelle, onde,
  fabbrica, ponte,
  interno, piazza, campo, porto, teatro, bottega, collina, valle,
};

// `tempo` serve solo a chi disegna le scene fuori dal ciclo (i controlli in
// node): dentro l'app ci pensa `disegnaFrame`.
function tempo(t) { orologio = t; }

return { play, stop, smoke, ridimensiona, registra, istante, bordo, tempo, P, kit, FIRMA, TIPO };

})();
