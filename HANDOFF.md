# CronoItalia — Handoff

**Data:** 1 agosto 2026 (secondo giro: dataset raddoppiato, scene triplicate)
**Cartella:** `C:\Users\lfili\OneDrive\Documenti\app\CronoItalia`
**Stack:** HTML + CSS + JS vanilla, più **three.js r160 vendorizzato** in `vendor/`.
Nessun build step, nessuna richiesta di rete a runtime.

---

## Cos'è

Una macchina del tempo per la sola Italia, sorella di [Chronoscope] ma con due
differenze che la definiscono:

1. **La carta politica cambia con l'anno.** Sposti il cursore e vedi gli stati che
   hanno composto l'Italia — popoli italici, ducati longobardi, comuni, signorie,
   preunitari — colorarsi e ridisegnarsi. Dal 1861 compaiono anche le province.
2. **Le schede evento non sono illustrazioni ma diorami 3D in stile Minecraft**,
   costruiti a cubi, con luce e ombre, girevoli col dito e ingrandibili a tutto
   schermo.

---

## Stato

**Collaudata end-to-end in browser il 1 agosto 2026, zero errori in console.**
Provate: carta politica al variare dell'anno, viaggio con destinazione, racconto
con cronaca in ordine, scheda evento con diorama, ingrandimento a tutto schermo
con rotazione a trascinamento, URL condivisibile, disposizione su telefono
(375×812) e su desktop.

| File | Righe/peso | Cosa contiene |
|---|---|---|
| `cronoitalia.html` | — | Struttura, simboli SVG, riferimenti versionati |
| `cronoitalia.css` | — | Tema notturno, pannelli, disposizione telefono |
| `cronoitalia.js` | — | Motore: proiezione, camera, carta politica, viaggio, racconto |
| `cronoitalia-map.js` | 164 KB | **Topologia**: 481 archi, 132 unità, sfondo |
| `cronoitalia-stati.js` | — | **26 epoche** politiche, dal 800 a.C. a oggi |
| `cronoitalia-data.js` | 123 KB | **498 eventi**, dal 12000 a.C. al 2021, 17 con rotta |
| `cronoitalia-voxel.js` | — | Motore diorami + kit di elementi riusabili + 36 scene firma |
| `cronoitalia-scene.js` | — | 80 scene firma: preistoria, antichità, medioevo, Rinascimento |
| `cronoitalia-scene2.js` | — | 50 scene firma: dal Cinquecento a oggi |
| `cronoitalia-scene3.js` | — | 86 scene firma: il riempimento fino a metà degli eventi |
| `vendor/three.min.js` | 654 KB | three.js r160 (l'ultima build UMD, quindi `<script>` normale) |

### Strumenti (`tools/`, da lanciare con node dalla cartella dell'app)

| Comando | A cosa serve |
|---|---|
| `node tools/convert-italy-map.js` | Rigenera `cronoitalia-map.js` dai geodati in `data/` |
| `node tools/merge-eventi.js [--prova]` | Fonde i lotti `tools/new-eventi-*.js` nel dataset, validando prima di scrivere |
| `node tools/check-stati.js` | Nessuna provincia senza stato, nessuna in due stati |
| `node tools/check-colori.js` | Nessuna coppia di stati **confinanti** con colori confondibili |
| `node tools/check-scene.js` | Colori inesistenti nelle scene, scene senza evento, copertura |
| `VoxScena.smoke()` in console | Costruisce tutte le scene a più istanti e riporta gli errori |

**Falli girare tutti dopo ogni modifica ai dati o alle scene.** Hanno già trovato
bug veri: 9 sovrapposizioni di province fra stati, 30 coppie confinanti
indistinguibili, il segno sbagliato di un arco in fase di generazione, tre id
duplicati e un colore `undefined` da un modulo negativo nella volta della Sistina.

Per aggiungere eventi: scrivi un file `tools/new-eventi-<nome>.js` che esporta un
array, lancia `node tools/merge-eventi.js --prova`, correggi quel che segnala,
rilancia senza `--prova` e sposta il lotto in `tools/fusi/`.

---

## Le tre idee da capire prima di toccare il codice

### 1. La mappa è una topologia, non un elenco di poligoni

`cronoitalia-map.js` non contiene 132 poligoni: contiene **481 archi**. Un arco è
un tratto di confine, memorizzato una volta sola, che sa quali due unità separa
(`ARC_OWN`). Un'unità è la lista degli archi che la circondano, con il segno a
indicare il verso di percorrenza.

Da qui tutto viene facile:
- riempimento di una provincia = concatenazione dei suoi archi;
- confini di provincia = archi condivisi fra unità dello stesso stato;
- **confini di stato in un dato anno** = archi le cui due unità stanno in stati
  diversi — si ricalcolano in un ciclo su 481 elementi a ogni cambio d'epoca.

È anche il motivo per cui la semplificazione avviene *per arco* e non per
poligono: due province confinanti restano incollate, senza fessure fra loro.
Il generatore verifica che ogni anello ricostruito sia continuo e chiuso.

**Unità = le 107 province italiane + 25 unità estere** (Corsica, Nizza, Savoia,
Ticino, Grigioni, Istria, Fiume, Carso, Dalmazia, Malta, Tirolo, Carinzia): senza
queste non si potrebbero disegnare Genova con la Corsica, Venezia con la
Dalmazia o i Savoia con Nizza.

### 2. I confini storici sono approssimati alle province di oggi

È il compromesso che rende possibile una carta che cambia con l'anno senza
scaricare niente. Un ducato che tagliava a metà una provincia moderna, qui la
prende tutta. Va detto e va accettato: l'alternativa era una manciata di date
fisse disegnate a mano.

Le epoche stanno in `ERAS`, ordinate per anno; `y` è l'anno da cui la
configurazione vale fino all'epoca successiva. `prov: true` accende i confini di
provincia (dal 1861). Prima dell'800 a.C. non c'è epoca: tutto neutro,
"Preistoria".

### 2b. Tre livelli di confine

Gli archi si smistano in tre gruppi a ogni cambio d'epoca: fra stati diversi il
**confine di stato** (spesso e scurissimo), dentro lo stesso stato ma fra regioni
diverse il **confine di regione** (scuro, medio), il resto sono **confini di
provincia** (sottili e chiari, e facoltativi con la casella nella legenda).
Le regioni compaiono solo da quando `era.prov` è vero, cioè dal 1861: prima non
esistevano, e disegnarle darebbe una carta mai esistita.

### 3. Tutto dipende dall'anno corrente

Carta politica, marcatori, cronaca e contatore sono funzione pura di `pb.cur`.
Per questo pausa e trascinamento della barra funzionano senza casi particolari,
esattamente come in Chronoscope.

Differenze rispetto a Chronoscope, volute:
- **il cursore degli anni non è lineare** (`annoDaSlider`/`sliderDaAnno`, curva
  2.6). Su quattordicimila anni una scala uniforme schiaccerebbe in un
  quindicesimo di corsa gli ultimi mille, dove sta il grosso degli eventi: così
  invece la metà destra del cursore copre dal 300 a.C. a oggi;
- **la finestra del racconto si adatta all'epoca** (`ampiezzaFinestra`): due
  secoli dal Mille in poi, tre secoli nell'antichità, fino a duemila anni nel
  Neolitico, dove fra un evento e l'altro passano millenni. La velocità cresce
  insieme, così una corsa dura sempre una venticinquina di secondi;
- **il racconto parte sempre**, anche dove non è successo niente di registrato,
  perché i confini che si muovono sono già uno spettacolo. I suggerimenti
  "Qui la storia tace" compaiono a lato senza bloccare nulla.

---

## I diorami voxel

`VoxScena.play(canvas, evento)` sceglie la scena: prima cerca `FIRMA[evento.id]`,
altrimenti usa `TIPO[evento.type]` variata da un generatore pseudocasuale
seminato sull'id (così un evento ha sempre la stessa scena).

Due sole mesh, per reggere sul telefono:
- **blocchi fermi** → una geometria unica con colori per vertice, costruita una
  volta all'apertura della scheda (1.000–3.200 blocchi a scena);
- **blocchi in movimento** → `InstancedMesh` raggruppate per colore, di cui ogni
  frame si riscrivono solo le matrici (24–374 blocchi, tetto a 900).

Niente `instanceColor`: raggruppare per colore evita di dipendere da come le
varie build di three gestiscono i colori per istanza.

**252 scene su misura su 498 eventi: una su due.** Le altre usano la scena per
tipo, variata dal generatore seminato sull'id. Le scene stanno in tre file:
le prime 36 nel motore, le altre in `cronoitalia-scene*.js`. `check-scene.js`
li trova da solo con un glob, quindi aggiungere un volume non richiede di
toccare il controllo. Si registrano con `VoxScena.registra`
e attingono a `VoxScena.kit`, la libreria di elementi riusabili: `tempio`,
`cattedrale`, `torre`, `mura`, `nave`, `folla`, `fuoco`, `bandiera`, `stelle`,
`onde`, `fabbrica`, `ponte`, più `suolo`, `casa`, `albero`, `omino`. È il kit a
rendere possibile una scena in dieci righe invece che in trenta.

**Scene per tipo (7):** battaglia, guerra, viaggio, fondazione, scoperta,
disastro, cultura. Sono la rete di sicurezza: qualunque evento senza scena
propria ne riceve una comunque, diversa dalle altre dello stesso tipo perché il
generatore pseudocasuale è seminato sull'id.

### Regole imparate costruendo le scene

- **Niente pareti più alte della camera.** La camera guarda da ~30° di
  elevazione: la prima versione del valico di Annibale aveva creste di 12 blocchi
  e si vedeva solo un muro grigio. Tenere i rilievi sotto i 6-7 blocchi.
- **Niente blocchi fuori dalla piastra di terreno.** Il Vesuvio era a z=-15 con
  la piastra fino a z=-10 e galleggiava nel vuoto; la colonna di Annibale
  marciava oltre il bordo (ora le posizioni si avvolgono con `giro()`).
- **Niente omini sull'acqua**: se sbarcano, serve il pontile.
- L'inquadratura automatica (`distAuto`) usa **un raggio diverso** nella scheda e
  a tutto schermo: nella finestrella si sta un po' stretti e va bene, a tutto
  schermo il plastico dev'essere tutto dentro, angoli compresi.
- **Le scene con un fronte vogliono `fronte: Math.PI / 2`.** La camera fa il giro
  completo: un refettorio o una parete affrescata, senza quel flag, per mezzo
  giro mostrano il retro del muro. Con il flag la camera oscilla davanti invece
  di girare. Vale per cenacolo, sistina, ravenna-mosaici, volta.
- **Niente scatole chiuse** (`m.guscio` a quattro pareti) se dentro c'è qualcosa
  da vedere: tre pareti e il davanti aperto.
- **Niente rumore per cella nell'altezza del terreno.** `suolo` usa una funzione
  liscia: con il rumore due celle vicine potevano differire di due blocchi e nel
  gradino si vedeva il vuoto sotto la piastra.
- **Attenzione al modulo negativo.** `colori[(z + a) % n]` con z che parte da -8
  dà `undefined`: in JavaScript il resto di un negativo è negativo. Lo smoke test
  lo prende, ma conviene scrivere subito `((i % n) + n) % n`.
- **Le curve a blocchi da questa camera diventano masse grumose**: un catino
  absidale costruito arrotondando seni e coseni si legge peggio di una parete
  piana. Meglio le forme squadrate, che è poi lo spirito del voxel.

### Aggiungere una scena firma

Basta una voce in `FIRMA` con la chiave uguale all'`id` dell'evento:

```javascript
'nome-evento'(rng) {
  return {
    cielo: 0x1e2836, nebbia: 0x24384f, raggio: 0xffd9a8, ambiente: .7,
    statici(m) { suolo(m, 11, P.erba, P.terra, rng); /* m.p, m.box, casa, albero… */ },
    dinamici(d, t) { /* d(x, y, z, lato, colore) per ogni blocco mobile */ },
  };
}
```

Poi `VoxScena.smoke()` in console.

---

## Fonti dei dati (in `data/`, non servono a runtime)

| File | Origine |
|---|---|
| `nuts3-01m.geojson` | Eurostat GISCO, NUTS 2021 livello 3, scala 1:1M (© UE) |
| `ne_10m_land.geojson` | Natural Earth 10m, pubblico dominio (sfondo neutro) |
| `nuts3.geojson`, `limits_IT_regions.geojson` | scaricati e scartati: il 10M dava coste squadrate, le regioni non bastavano per gli stati storici |

La cartella `data/` pesa ~40 MB: **non va nel repo di deploy**, serve solo per
rigenerare la geometria.

---

## Cosa manca / si può fare

- **Altre scene firma.** Sono 252 su 498, cioè il 50,6%: il margine sopra la
  metà è di tre scene, e ogni evento aggiunto al dataset lo consuma. Fra gli
  scoperti più desiderabili restano: mundial, dolce-vita, olimpiadi-roma,
  internet-italia, basaglia, cinquecento, portella, bologna-1980, irpinia.
- **Più eventi.** 498 coprono bene la penisola, ma il Sud interno e le isole
  possono ancora crescere, e il Novecento del design e della musica leggera è
  appena accennato.
- **Epoche intermedie.** Fra il 1130 e il 1250 c'è un salto; si potrebbe
  aggiungere il 1176 (Legnano) e il 1210.
- **Etichette dei nomi degli stati sulla mappa**, oltre alla legenda.

---

## Prompt per riprendere

> Riprendo CronoItalia in `C:\Users\lfili\OneDrive\Documenti\app\CronoItalia`.
> Leggi `HANDOFF.md`. L'app è collaudata e funzionante: prima di toccare i dati
> fai girare `node tools/check-stati.js`, `node tools/check-colori.js` e
> `VoxScena.smoke()` in console.
