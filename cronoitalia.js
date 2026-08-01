'use strict';

/* CronoItalia — motore.
 *
 * Tre cose si muovono insieme, tutte funzione dell'anno corrente:
 *   1. la carta politica (quali stati, di che colore, con quali confini);
 *   2. gli eventi che compaiono sulla mappa e nella cronaca;
 *   3. il contatore degli anni.
 * Siccome dipendono solo da `pb.cur`, pausa e trascinamento della barra
 * funzionano senza casi particolari.
 */

/* ================= proiezione ================= */

const D2R = Math.PI / 180;
const K = 4000;                                  // unità mappa per radiante
const BOX = { lon0: 3.5, lon1: 21.5, lat0: 33.5, lat1: 48.6 };

function mercY(lat) { return Math.log(Math.tan(Math.PI / 4 + lat * D2R / 2)); }
const Y_TOP = mercY(BOX.lat1);

function px(lon) { return (lon - BOX.lon0) * D2R * K; }
function py(lat) { return (Y_TOP - mercY(lat)) * K; }
function lonAt(x) { return x / (D2R * K) + BOX.lon0; }
function latAt(y) { return (Math.atan(Math.exp(Y_TOP - y / K)) - Math.PI / 4) * 2 / D2R; }

const MAPW = px(BOX.lon1), MAPH = py(BOX.lat0);

/* Inquadratura di partenza: l'Italia intera con un po' d'aria. */
const HOME = { x: px(5.6), y: py(47.8), w: px(19.4) - px(5.6), h: py(35.0) - py(47.8) };
const MIN_W = 30;                                // zoom massimo
const DEST_W = 300;                              // inquadratura dopo il viaggio (~4°)

/* ================= tempo ================= */

const ANNO_MIN = -3300;
const ANNO_MAX = new Date().getFullYear();
const FIN_PRIMA = 20, FIN_DOPO = 180;            // finestra di due secoli
const VEL_BASE = 8;                              // anni per secondo reale a 1×

// Nella storia l'anno 0 non esiste (1 a.C. -> 1 d.C.): internamente si usa la
// numerazione astronomica, così l'aritmetica è continua.
function toAstro(y) { return y < 0 ? y + 1 : y; }
function daAstro(a) { return a <= 0 ? a - 1 : a; }
function fmtAnno(y) {
  if (y < 0) return (-y) + ' a.C.';
  return y < 1000 ? y + ' d.C.' : String(y);
}
function fmtAstro(a) { return fmtAnno(daAstro(Math.floor(a))); }

function clamp(v, lo, hi) { return v < lo ? lo : v > hi ? hi : v; }
function easeInOutCubic(t) { return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }

function kmTra(lat1, lon1, lat2, lon2) {
  const R = 6371, d = D2R;
  const a = Math.sin((lat2 - lat1) * d / 2) ** 2 +
    Math.cos(lat1 * d) * Math.cos(lat2 * d) * Math.sin((lon2 - lon1) * d / 2) ** 2;
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}
function direzione(lat1, lon1, lat2, lon2) {
  const dLat = lat2 - lat1, dLon = lon2 - lon1;
  const ns = dLat > .7 ? 'a nord' : dLat < -.7 ? 'a sud' : '';
  const eo = dLon > .7 ? 'a est' : dLon < -.7 ? 'a ovest' : '';
  return (ns && eo) ? ns + '-' + eo.slice(1) : (ns || eo || 'qui vicino');
}

/* ================= riferimenti al DOM ================= */

const svg = document.getElementById('map');
const ctxG = document.getElementById('ctx');
const unitsG = document.getElementById('units');
const costeP = document.getElementById('coste');
const confProvP = document.getElementById('confProv');
const confStatoP = document.getElementById('confStato');
const routesG = document.getElementById('routes');
const overlay = document.getElementById('overlay');
const jumpFx = document.getElementById('jumpFx');
const eraBanner = document.getElementById('eraBanner');
const yearCounter = document.getElementById('yearCounter');
const yearBig = document.getElementById('yearBig');
const windowLabel = document.getElementById('windowLabel');
const orbitPanel = document.getElementById('orbitPanel');
const hintEl = document.getElementById('hint');
const yearSlider = document.getElementById('yearSlider');
const yearField = document.getElementById('yearField');
const eraSelect = document.getElementById('eraSelect');
const travelBtn = document.getElementById('travelBtn');
const playbackPanel = document.getElementById('playbackPanel');
const playBtn = document.getElementById('playBtn');
const scrub = document.getElementById('scrub');
const speedBtn = document.getElementById('speedBtn');
const returnBtn = document.getElementById('returnBtn');
const eventLog = document.getElementById('eventLog');
const logList = document.getElementById('logList');
const eventCard = document.getElementById('eventCard');
const cardClose = document.getElementById('cardClose');
const cardIcon = document.getElementById('cardIcon');
const cardYears = document.getElementById('cardYears');
const cardTitle = document.getElementById('cardTitle');
const cardDesc = document.getElementById('cardDesc');
const cardVox = document.getElementById('cardVox');
const voxWrap = document.getElementById('voxWrap');
const voxFull = document.getElementById('voxFull');
const voxTitolo = document.getElementById('voxTitolo');
const quiet = document.getElementById('quiet');
const quietList = document.getElementById('quietList');
const quietClose = document.getElementById('quietClose');
const legendEl = document.getElementById('legend');
const legendEra = document.getElementById('legendEra');
const legendNote = document.getElementById('legendNote');
const legendList = document.getElementById('legendList');
const legendToggle = document.getElementById('legendToggle');
const provChk = document.getElementById('provChk');

const SVGNS = 'http://www.w3.org/2000/svg';

/* ================= stato ================= */

const stato = { vista: 'carta', dest: null, anno: ANNO_MAX };

const pb = {
  da: 0, a: 0, cur: 0,
  attivo: false, vel: 1, raf: null, ultimoT: 0,
  eventi: [], mostrati: new Map(), eraPrima: false,
};

for (const e of EVENTI) {
  e.ay = toAstro(e.year);
  e.aey = e.endYear != null ? toAstro(e.endYear) : null;
}

/* ================= geometria: archi precalcolati ================= */

/* Ogni arco viene proiettato una volta sola, nei due versi. Le unità e i
   confini sono poi solo concatenazioni di stringhe. */
const arcAvanti = ARCS.map(flat => {
  const a = [];
  for (let i = 0; i < flat.length; i += 2)
    a.push(px(flat[i]).toFixed(1) + ' ' + py(flat[i + 1]).toFixed(1));
  return a;
});
const arcIndietro = arcAvanti.map(a => a.slice().reverse());

function ptsDi(segno) { return segno > 0 ? arcAvanti[segno - 1] : arcIndietro[-segno - 1]; }

function anelloD(anello) {
  let d = '';
  for (let k = 0; k < anello.length; k++) {
    const pts = ptsDi(anello[k]);
    for (let i = (k === 0 ? 0 : 1); i < pts.length; i++) d += (d === '' ? 'M' : 'L') + pts[i];
  }
  return d + 'Z';
}

function arcoD(i) { return 'M' + arcAvanti[i].join('L'); }

/* ================= disegno statico ================= */

const unitPaths = [];

function disegnaSfondo() {
  const frag = document.createDocumentFragment();
  for (const flat of CONTEXT_LAND) {
    let d = '';
    for (let i = 0; i < flat.length; i += 2)
      d += (i === 0 ? 'M' : 'L') + px(flat[i]).toFixed(1) + ' ' + py(flat[i + 1]).toFixed(1);
    const p = document.createElementNS(SVGNS, 'path');
    p.setAttribute('d', d + 'Z');
    frag.appendChild(p);
  }
  ctxG.appendChild(frag);
}

function disegnaUnita() {
  const frag = document.createDocumentFragment();
  for (let i = 0; i < UNITS.length; i++) {
    const p = document.createElementNS(SVGNS, 'path');
    p.setAttribute('d', UNITS[i].r.map(anelloD).join(''));
    p.dataset.i = i;
    frag.appendChild(p);
    unitPaths.push(p);
  }
  unitsG.appendChild(frag);
}

// Le coste (e i bordi verso terre non mappate) non cambiano mai.
function disegnaCoste() {
  let d = '';
  for (let i = 0; i < ARCS.length; i++) if (ARC_OWN[i][1] < 0) d += arcoD(i);
  costeP.setAttribute('d', d);
}

/* ================= carta politica ================= */

let eraCorr = undefined;          // indice epoca attualmente disegnata
let statoDi = new Array(UNITS.length).fill(null);
let evidenziato = null;

const unitaPerCodice = new Map(UNITS.map((u, i) => [u.id, i]));

function eraA(anno) {
  let idx = -1;
  for (let i = 0; i < ERAS.length; i++) if (ERAS[i].y <= anno) idx = i; else break;
  return idx;
}

function applicaPolitica(anno, conStriscione) {
  const idx = eraA(anno);
  if (idx === eraCorr) return;
  const primaVolta = eraCorr === undefined;
  eraCorr = idx;
  const era = idx >= 0 ? ERAS[idx] : null;

  statoDi = new Array(UNITS.length).fill(null);
  if (era) {
    for (const st of era.states) {
      for (const code of st.ids) {
        const u = unitaPerCodice.get(code);
        if (u !== undefined) statoDi[u] = st;
      }
    }
  }

  for (let i = 0; i < unitPaths.length; i++) {
    const st = statoDi[i];
    unitPaths[i].classList.toggle('spento', !st);
    unitPaths[i].style.fill = st ? st.c : '';
  }

  let dStato = '', dProv = '';
  for (let i = 0; i < ARCS.length; i++) {
    const [a, b] = ARC_OWN[i];
    if (b < 0) continue;
    if (statoDi[a] !== statoDi[b]) dStato += arcoD(i); else dProv += arcoD(i);
  }
  confStatoP.setAttribute('d', dStato);
  confProvP.setAttribute('d', dProv);

  provChk.checked = !!(era && era.prov);
  aggiornaProvince();
  costruisciLegenda(era);
  evidenzia(null);

  if (conStriscione && !primaVolta && era) mostraStriscione(era);
}

function aggiornaProvince() { confProvP.classList.toggle('hidden', !provChk.checked); }
provChk.addEventListener('change', aggiornaProvince);

function costruisciLegenda(era) {
  legendEra.textContent = era ? era.name : 'Preistoria';
  legendNote.textContent = era ? era.note : 'Prima delle carte e degli stati: villaggi, greggi e sentieri.';
  legendList.innerHTML = '';
  if (!era) return;
  for (const st of era.states) {
    const li = document.createElement('li');
    li.innerHTML = `<i style="background:${st.c}"></i><span>${st.n}</span>`;
    li.addEventListener('click', () => evidenzia(evidenziato === st ? null : st));
    legendList.appendChild(li);
  }
}

function evidenzia(st) {
  evidenziato = st;
  for (let i = 0; i < unitPaths.length; i++)
    unitPaths[i].classList.toggle('evidenzia', !!st && statoDi[i] === st);
}

let striscioneTimer = null;
function mostraStriscione(era) {
  eraBanner.querySelector('h4').textContent = era.name;
  eraBanner.querySelector('p').textContent = era.note;
  eraBanner.classList.remove('hidden');
  eraBanner.style.animation = 'none';
  void eraBanner.offsetWidth;
  eraBanner.style.animation = '';
  clearTimeout(striscioneTimer);
  striscioneTimer = setTimeout(() => eraBanner.classList.add('hidden'), 3400);
}

legendToggle.addEventListener('click', () => {
  const chiusa = legendEl.classList.toggle('chiusa');
  legendToggle.textContent = chiusa ? '+' : '–';
});

/* ================= camera ================= */

const vb = { x: HOME.x, y: HOME.y, w: HOME.w, h: HOME.h };
let flyRaf = null;

function aspetto() { return window.innerWidth / window.innerHeight; }
function mondoW() { return Math.max(HOME.w, HOME.h * aspetto()); }

function clampVB() {
  vb.w = clamp(vb.w, MIN_W, MAPW * 1.6);
  vb.h = vb.w / aspetto();
  const mx = vb.w, my = vb.h;                     // si può uscire di un'inquadratura
  vb.x = clamp(vb.x, -mx, MAPW);
  vb.y = clamp(vb.y, -my, MAPH);
}

function applyVB() {
  clampVB();
  svg.setAttribute('viewBox', `${vb.x} ${vb.y} ${vb.w} ${vb.h}`);
  posizionaMarcatori();
}

function schermoAMappa(cx, cy) {
  return { x: vb.x + cx / window.innerWidth * vb.w, y: vb.y + cy / window.innerHeight * vb.h };
}
function mappaASchermo(x, y) {
  return { x: (x - vb.x) / vb.w * window.innerWidth, y: (y - vb.y) / vb.h * window.innerHeight };
}
function pxAMappa(p) { return p * vb.w / window.innerWidth; }

function inquadraCasa() {
  vb.w = mondoW();
  vb.h = vb.w / aspetto();
  vb.x = HOME.x + HOME.w / 2 - vb.w / 2;
  vb.y = HOME.y + HOME.h / 2 - vb.h / 2;
  applyVB();
}

function volaA(cx, cy, w, ms, fatto) {
  if (flyRaf) cancelAnimationFrame(flyRaf);
  const s = { x: vb.x, y: vb.y, w: vb.w };
  const t = { x: cx - w / 2, y: cy - (w / aspetto()) / 2, w };
  const t0 = performance.now();
  function passo(now) {
    const p = clamp((now - t0) / ms, 0, 1), e = easeInOutCubic(p);
    vb.x = s.x + (t.x - s.x) * e;
    vb.y = s.y + (t.y - s.y) * e;
    vb.w = s.w + (t.w - s.w) * e;
    applyVB();
    if (p < 1) flyRaf = requestAnimationFrame(passo);
    else { flyRaf = null; if (fatto) fatto(); }
  }
  flyRaf = requestAnimationFrame(passo);
}

/* ================= interazione con la mappa ================= */

const puntatori = new Map();
let trascinato = false, distPinch = 0;

svg.addEventListener('pointerdown', e => {
  svg.setPointerCapture(e.pointerId);
  puntatori.set(e.pointerId, { x: e.clientX, y: e.clientY });
  trascinato = false;
  if (puntatori.size === 2) {
    const [a, b] = [...puntatori.values()];
    distPinch = Math.hypot(a.x - b.x, a.y - b.y);
  }
  svg.classList.add('grabbing');
});

svg.addEventListener('pointermove', e => {
  if (!puntatori.has(e.pointerId)) return;
  const prev = puntatori.get(e.pointerId);
  const dx = e.clientX - prev.x, dy = e.clientY - prev.y;
  puntatori.set(e.pointerId, { x: e.clientX, y: e.clientY });
  if (Math.abs(dx) + Math.abs(dy) > 3) trascinato = true;

  if (puntatori.size === 2) {
    const [a, b] = [...puntatori.values()];
    const nd = Math.hypot(a.x - b.x, a.y - b.y);
    if (distPinch > 0 && nd > 0) zoomA((a.x + b.x) / 2, (a.y + b.y) / 2, distPinch / nd);
    distPinch = nd;
  } else if (puntatori.size === 1) {
    vb.x -= pxAMappa(dx);
    vb.y -= pxAMappa(dy);
    applyVB();
  }
});

function finePuntatore(e) {
  if (!puntatori.has(e.pointerId)) return;
  puntatori.delete(e.pointerId);
  if (puntatori.size === 0) svg.classList.remove('grabbing');
  if (!trascinato && puntatori.size === 0 && stato.vista !== 'viaggio') {
    const m = schermoAMappa(e.clientX, e.clientY);
    impostaDestinazione(latAt(m.y), lonAt(m.x));
  }
  if (stato.vista === 'racconto') aggiornaInsieme();
}
svg.addEventListener('pointerup', finePuntatore);
svg.addEventListener('pointercancel', finePuntatore);

function zoomA(cx, cy, fattore) {
  const prima = schermoAMappa(cx, cy);
  vb.w = clamp(vb.w * fattore, MIN_W, MAPW * 1.6);
  vb.h = vb.w / aspetto();
  const dopo = schermoAMappa(cx, cy);
  vb.x += prima.x - dopo.x;
  vb.y += prima.y - dopo.y;
  applyVB();
}

svg.addEventListener('wheel', e => {
  e.preventDefault();
  zoomA(e.clientX, e.clientY, Math.pow(1.0015, e.deltaY));
  if (stato.vista === 'racconto') aggiornaInsiemeRitardato();
}, { passive: false });

let timerInsieme = null;
function aggiornaInsiemeRitardato() {
  clearTimeout(timerInsieme);
  timerInsieme = setTimeout(aggiornaInsieme, 250);
}

/* ================= destinazione e anno ================= */

let destEl = null;

function impostaDestinazione(lat, lon) {
  stato.dest = { lat, lon };
  if (!destEl) {
    destEl = document.createElement('div');
    destEl.className = 'dest';
    overlay.appendChild(destEl);
  }
  posizionaMarcatori();
  const u = unitaSotto(lat, lon);
  hintEl.textContent = u
    ? `Destinazione: ${u.n}${u.reg ? ' (' + u.reg + ')' : ''} — pronti a partire.`
    : `Destinazione: ${lat.toFixed(2)}°, ${lon.toFixed(2)}° — pronti a partire.`;
}

// Quale provincia sta sotto un punto: serve solo per l'etichetta, quindi basta
// la più vicina fra quelle il cui centro dista meno di un grado e mezzo.
function unitaSotto(lat, lon) {
  let best = null, bd = 1.5;
  for (const u of UNITS) {
    const d = Math.hypot((u.c[0] - lon) * .75, u.c[1] - lat);
    if (d < bd) { bd = d; best = u; }
  }
  return best;
}

function impostaAnno(y, conStriscione) {
  if (y === 0) y = 1;
  y = clamp(Math.round(y), ANNO_MIN, ANNO_MAX);
  stato.anno = y;
  yearSlider.value = y;
  yearField.value = Math.abs(y);
  eraSelect.value = y < 0 ? 'aC' : 'dC';
  applicaPolitica(y, conStriscione !== false);
}

yearSlider.addEventListener('input', () => impostaAnno(+yearSlider.value));

function leggiCampoAnno() {
  let v = Math.round(+yearField.value);
  const aC = eraSelect.value === 'aC';
  const max = aC ? -ANNO_MIN : ANNO_MAX;
  if (isNaN(v) || v < 1 || v > max) {
    v = clamp(isNaN(v) ? 1 : v, 1, max);
    yearField.classList.remove('scuote');
    void yearField.offsetWidth;
    yearField.classList.add('scuote');
  }
  impostaAnno(aC ? -v : v);
}
yearField.addEventListener('change', leggiCampoAnno);
eraSelect.addEventListener('change', leggiCampoAnno);

/* ================= viaggio ================= */

travelBtn.addEventListener('click', viaggia);

function viaggia() {
  stato.vista = 'viaggio';
  chiudiScheda();
  quiet.classList.add('hidden');
  pulisciRacconto();
  orbitPanel.classList.add('hidden');
  aggiornaURL();

  const arrivo = () => {
    jumpFx.classList.remove('via');
    void jumpFx.offsetWidth;
    jumpFx.classList.add('via');
    setTimeout(avviaRacconto, 620);
  };
  if (stato.dest) volaA(px(stato.dest.lon), py(stato.dest.lat), DEST_W, 1400, arrivo);
  else volaA(HOME.x + HOME.w / 2, HOME.y + HOME.h / 2, mondoW(), 1400, arrivo);
}

returnBtn.addEventListener('click', tornaAllaCarta);

function tornaAllaCarta() {
  stato.vista = 'carta';
  chiudiScheda();
  quiet.classList.add('hidden');
  fermaTick();
  pulisciRacconto();
  yearCounter.classList.add('hidden');
  playbackPanel.classList.add('hidden');
  eventLog.classList.add('hidden');
  returnBtn.classList.add('hidden');
  orbitPanel.classList.remove('hidden');
  impostaAnno(stato.anno, false);
  inquadraCasa();
}

/* ================= racconto (playback) ================= */

function calcolaFinestra() {
  const a = toAstro(stato.anno);
  const ampiezza = FIN_PRIMA + FIN_DOPO;
  pb.da = clamp(Math.min(a - FIN_PRIMA, ANNO_MAX - ampiezza), toAstro(ANNO_MIN), ANNO_MAX);
  pb.a = clamp(pb.da + ampiezza, toAstro(ANNO_MIN), ANNO_MAX);
}

function inInquadratura(ev) {
  const x = px(ev.lon), y = py(ev.lat), m = pxAMappa(12);
  return x >= vb.x - m && x <= vb.x + vb.w + m && y >= vb.y - m && y <= vb.y + vb.h + m;
}
function nellaFinestra(ev) { return ev.ay >= pb.da && ev.ay <= pb.a; }

function avviaRacconto() {
  stato.vista = 'racconto';
  pb.vel = 1;
  speedBtn.textContent = '1×';
  calcolaFinestra();
  pb.cur = pb.da;
  pb.eventi = EVENTI.filter(e => nellaFinestra(e) && inInquadratura(e)).sort((a, b) => a.ay - b.ay);

  yearCounter.classList.remove('hidden');
  windowLabel.textContent = fmtAstro(pb.da) + ' – ' + fmtAstro(pb.a);
  playbackPanel.classList.remove('hidden');
  eventLog.classList.remove('hidden');
  returnBtn.classList.remove('hidden');
  logList.innerHTML = '';

  // Anche dove non è successo nulla di registrato, i confini che si muovono
  // sono già uno spettacolo: il racconto parte comunque, e i suggerimenti
  // compaiono a lato senza bloccare niente.
  if (pb.eventi.length === 0 && stato.dest) mostraSilenzio();
  play();
}

function play() {
  if (pb.cur >= pb.a) { ricostruisciMostrati(pb.da); }
  pb.attivo = true;
  playBtn.innerHTML = '&#10074;&#10074;';
  pb.ultimoT = performance.now();
  fermaTick();
  pb.raf = requestAnimationFrame(tick);
}
function pausa() {
  pb.attivo = false;
  playBtn.innerHTML = '&#9654;';
  fermaTick();
}
function fermaTick() { if (pb.raf) { cancelAnimationFrame(pb.raf); pb.raf = null; } }

playBtn.addEventListener('click', () => pb.attivo ? pausa() : play());
speedBtn.addEventListener('click', () => {
  pb.vel = pb.vel >= 4 ? 1 : pb.vel * 2;
  speedBtn.textContent = pb.vel + '×';
});

function tick(now) {
  const dt = Math.min(.1, (now - pb.ultimoT) / 1000);
  pb.ultimoT = now;
  pb.cur = Math.min(pb.a, pb.cur + dt * VEL_BASE * pb.vel);
  sincronizza(true);
  if (pb.cur >= pb.a) { pb.attivo = false; playBtn.innerHTML = '&#8635;'; return; }
  pb.raf = requestAnimationFrame(tick);
}

function sincronizza(animaNuovi) {
  yearBig.textContent = fmtAstro(pb.cur);
  applicaPolitica(daAstro(Math.floor(pb.cur)), true);
  scrub.value = pb.a > pb.da ? Math.round((pb.cur - pb.da) / (pb.a - pb.da) * 1000) : 0;
  for (const ev of pb.eventi)
    if (ev.ay <= pb.cur && !pb.mostrati.has(ev.id)) creaEvento(ev, animaNuovi);
  aggiornaDinamiche();
}

scrub.addEventListener('input', () => {
  if (stato.vista !== 'racconto') return;
  pausa();
  ricostruisciMostrati(pb.da + (+scrub.value / 1000) * (pb.a - pb.da));
});

function ricostruisciMostrati(cur) {
  pb.cur = cur;
  for (const rec of pb.mostrati.values()) rimuoviEvento(rec);
  pb.mostrati.clear();
  logList.innerHTML = '';
  sincronizza(false);
}

function aggiornaInsieme() {
  if (stato.vista !== 'racconto') return;
  pb.eventi = EVENTI.filter(e => nellaFinestra(e) && (inInquadratura(e) || pb.mostrati.has(e.id)))
    .sort((a, b) => a.ay - b.ay);
  sincronizza(false);
  ricostruisciCronaca();
}

/* ---------- eventi sulla mappa ---------- */

function rottaD(tappe) {
  let d = '';
  for (const [lon, lat] of tappe) d += (d === '' ? 'M' : 'L') + px(lon).toFixed(1) + ' ' + py(lat).toFixed(1);
  return d;
}

function creaEvento(ev, anima) {
  const el = document.createElement('div');
  el.className = 'evt ' + ev.type + (anima ? ' nato' : '');
  el.title = fmtAnno(ev.year) + ' — ' + ev.title;
  el.innerHTML = `<svg viewBox="0 0 24 24"><use href="#i-${ev.type}"/></svg>`;
  el.addEventListener('click', e => { e.stopPropagation(); apriScheda(ev); });
  overlay.appendChild(el);

  const rec = { ev, el, rotta: null, testa: null, len: 0 };

  if (Array.isArray(ev.path) && ev.path.length > 1) {
    const p = document.createElementNS(SVGNS, 'path');
    p.setAttribute('d', rottaD(ev.path));
    p.style.stroke = `var(--c-${ev.type})`;
    routesG.appendChild(p);
    rec.len = p.getTotalLength();
    p.style.strokeDasharray = rec.len;
    p.style.strokeDashoffset = rec.len;
    rec.rotta = p;
    const t = document.createElementNS(SVGNS, 'circle');
    routesG.appendChild(t);
    rec.testa = t;
  }

  pb.mostrati.set(ev.id, rec);
  posizionaMarcatore(rec);
  aggiungiRiga(ev);
}

function rimuoviEvento(rec) {
  rec.el.remove();
  if (rec.rotta) rec.rotta.remove();
  if (rec.testa) rec.testa.remove();
}

function pulisciRacconto() {
  for (const rec of pb.mostrati.values()) rimuoviEvento(rec);
  pb.mostrati.clear();
  pb.eventi = [];
  logList.innerHTML = '';
}

function aggiornaDinamiche() {
  for (const rec of pb.mostrati.values()) {
    const ev = rec.ev;
    const fine = ev.aey != null ? ev.aey : ev.ay;
    rec.el.classList.toggle('attivo', ev.aey != null && pb.cur >= ev.ay && pb.cur <= ev.aey);
    rec.el.classList.toggle('passato', pb.cur > fine + 12);
    if (rec.rotta && rec.len > 0) {
      const durata = Math.max(ev.aey != null ? ev.aey - ev.ay : 8, 1);
      const p = clamp((pb.cur - ev.ay) / durata, 0, 1);
      rec.rotta.style.strokeDashoffset = rec.len * (1 - p);
      if (p > 0 && p < 1) {
        const pt = rec.rotta.getPointAtLength(rec.len * p);
        rec.testa.setAttribute('cx', pt.x);
        rec.testa.setAttribute('cy', pt.y);
        rec.testa.setAttribute('r', pxAMappa(3.5));
        rec.testa.style.display = '';
      } else rec.testa.style.display = 'none';
    }
  }
}

function posizionaMarcatore(rec) {
  const s = mappaASchermo(px(rec.ev.lon), py(rec.ev.lat));
  rec.el.style.left = s.x + 'px';
  rec.el.style.top = s.y + 'px';
}

function posizionaMarcatori() {
  if (destEl && stato.dest) {
    const s = mappaASchermo(px(stato.dest.lon), py(stato.dest.lat));
    destEl.style.left = s.x + 'px';
    destEl.style.top = s.y + 'px';
  }
  for (const rec of pb.mostrati.values()) {
    posizionaMarcatore(rec);
    if (rec.testa && rec.testa.style.display !== 'none') rec.testa.setAttribute('r', pxAMappa(3.5));
  }
}

/* ---------- cronaca ---------- */

function aggiungiRiga(ev) {
  const li = document.createElement('li');
  li.innerHTML = `<span class="punto" style="background:var(--c-${ev.type})"></span>` +
    `<span class="anno">${fmtAnno(ev.year)}</span><span>${ev.title}</span>`;
  li.addEventListener('click', () => apriScheda(ev));
  for (const altro of logList.children) altro.classList.remove('ultimo');
  li.classList.add('ultimo');
  logList.appendChild(li);
  logList.scrollTop = logList.scrollHeight;
}

function ricostruisciCronaca() {
  logList.innerHTML = '';
  [...pb.mostrati.values()].map(r => r.ev).sort((a, b) => a.ay - b.ay).forEach(aggiungiRiga);
}

/* ================= scheda evento ================= */

let schedaAperta = false;

function apriScheda(ev) {
  pb.eraPrima = pb.attivo;
  if (pb.attivo) pausa();
  cardIcon.querySelector('use').setAttribute('href', '#i-' + ev.type);
  cardIcon.style.color = `var(--c-${ev.type})`;
  cardYears.textContent = ev.endYear != null
    ? fmtAnno(ev.year) + ' – ' + fmtAnno(ev.endYear) : fmtAnno(ev.year);
  cardTitle.textContent = ev.title;
  cardDesc.textContent = ev.description;
  voxTitolo.innerHTML = `<b>${ev.title}</b>${cardYears.textContent}` +
    `<br><small>trascina per girare, pizzica o rotella per avvicinarti</small>`;
  eventCard.classList.remove('hidden');
  schedaAperta = true;
  VoxScena.play(cardVox, ev);        // il canvas dev'essere visibile per misurarlo
}

function chiudiScheda() {
  if (!schedaAperta) return;
  aTuttoSchermo(false);
  VoxScena.stop();
  eventCard.classList.add('hidden');
  schedaAperta = false;
  if (pb.eraPrima && stato.vista === 'racconto') play();
}
cardClose.addEventListener('click', chiudiScheda);

/* ---------- diorama a tutto schermo ---------- */

let voxPieno = false;

function aTuttoSchermo(on) {
  if (on === voxPieno) return;
  voxPieno = on;
  /* La scheda è centrata con una `transform`, e dentro un antenato trasformato
     `position: fixed` si àncora all'antenato invece che alla finestra. Per
     coprire davvero lo schermo il riquadro va spostato nel body e poi rimesso
     al suo posto. */
  if (on) document.body.appendChild(voxWrap);
  else eventCard.insertBefore(voxWrap, cardTitle);
  voxWrap.classList.toggle('pieno', on);
  voxFull.innerHTML = on ? '&times;' : '&#9974;';
  voxFull.title = on ? 'Torna alla scheda (Esc)' : 'Ingrandisci a tutto schermo';
  // il canvas ha cambiato dimensione: il renderer non se ne accorge da solo
  requestAnimationFrame(() => VoxScena.ridimensiona());
  // se il browser lo permette, anche schermo intero vero (utile su telefono)
  try {
    if (on && voxWrap.requestFullscreen) voxWrap.requestFullscreen().catch(() => {});
    else if (!on && document.fullscreenElement) document.exitFullscreen().catch(() => {});
  } catch (e) { /* niente schermo intero nativo: basta l'overlay */ }
}

voxFull.addEventListener('click', () => aTuttoSchermo(!voxPieno));
document.addEventListener('fullscreenchange', () => {
  if (!document.fullscreenElement && voxPieno) aTuttoSchermo(false);
});

/* ================= regione silenziosa ================= */

function mostraSilenzio() {
  const d = stato.dest;
  const vicini = EVENTI.map(ev => {
    const salto = ev.ay < pb.da ? pb.da - ev.ay : ev.ay > pb.a ? ev.ay - pb.a : 0;
    return { ev, punti: kmTra(d.lat, d.lon, ev.lat, ev.lon) + salto * 3 };
  }).sort((a, b) => a.punti - b.punti).slice(0, 3);

  quietList.innerHTML = '';
  for (const { ev } of vicini) {
    const km = kmTra(d.lat, d.lon, ev.lat, ev.lon);
    const b = document.createElement('button');
    b.innerHTML = `<span class="anno">${fmtAnno(ev.year)}</span> — ${ev.title}` +
      `<br><small>a ~${km.toLocaleString('it')} km ${direzione(d.lat, d.lon, ev.lat, ev.lon)}</small>`;
    b.addEventListener('click', () => {
      quiet.classList.add('hidden');
      impostaDestinazione(ev.lat, ev.lon);
      impostaAnno(ev.year, false);
      viaggia();
    });
    quietList.appendChild(b);
  }
  quiet.classList.remove('hidden');
}
quietClose.addEventListener('click', () => quiet.classList.add('hidden'));

/* ================= URL condivisibile ================= */

function aggiornaURL() {
  if (location.protocol === 'file:') return;
  const q = stato.dest
    ? `?lat=${stato.dest.lat.toFixed(2)}&lon=${stato.dest.lon.toFixed(2)}&anno=${stato.anno}`
    : `?anno=${stato.anno}`;
  history.replaceState(null, '', q);
}

function daURL() {
  const p = new URLSearchParams(location.search);
  const anno = parseInt(p.get('anno'), 10);
  if (isNaN(anno)) return false;
  const lat = parseFloat(p.get('lat')), lon = parseFloat(p.get('lon'));
  impostaAnno(anno, false);
  if (!isNaN(lat) && !isNaN(lon)) impostaDestinazione(lat, lon);
  setTimeout(viaggia, 450);
  return true;
}

/* ================= tastiera e ridimensionamento ================= */

document.addEventListener('keydown', e => {
  if (e.target === yearField) return;
  if (e.code === 'Space' && stato.vista === 'racconto') {
    e.preventDefault();
    pb.attivo ? pausa() : play();
  } else if (e.code === 'Escape') {
    if (voxPieno) aTuttoSchermo(false);
    else if (schedaAperta) chiudiScheda();
    else if (!quiet.classList.contains('hidden')) quiet.classList.add('hidden');
    else if (stato.vista === 'racconto') tornaAllaCarta();
  } else if ((e.code === 'ArrowLeft' || e.code === 'ArrowRight') && stato.vista === 'carta') {
    impostaAnno(stato.anno + (e.code === 'ArrowRight' ? 10 : -10));
  }
});

window.addEventListener('resize', () => {
  applyVB();
  if (schedaAperta) VoxScena.ridimensiona();
});

/* ================= avvio ================= */

disegnaSfondo();
disegnaUnita();
disegnaCoste();
inquadraCasa();
if (window.innerWidth < 760) {          // su telefono la legenda parte chiusa
  legendEl.classList.add('chiusa');
  legendToggle.textContent = '+';
}
yearSlider.max = ANNO_MAX;
travelBtn.disabled = false;
impostaAnno(ANNO_MAX, false);
if (!daURL()) mostraStriscione(ERAS[eraA(ANNO_MAX)]);
