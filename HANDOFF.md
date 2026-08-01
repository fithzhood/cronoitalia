# CronoItalia — Handoff

**Data:** 1 agosto 2026
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
| `cronoitalia-data.js` | — | **238 eventi**, dal 3300 a.C. al 2021, 14 con rotta |
| `cronoitalia-voxel.js` | — | Motore diorami: 12 scene firma + 7 per tipo |
| `vendor/three.min.js` | 654 KB | three.js r160 (l'ultima build UMD, quindi `<script>` normale) |

### Strumenti (`tools/`, da lanciare con node dalla cartella dell'app)

| Comando | A cosa serve |
|---|---|
| `node tools/convert-italy-map.js` | Rigenera `cronoitalia-map.js` dai geodati in `data/` |
| `node tools/check-stati.js` | Nessuna provincia senza stato, nessuna in due stati |
| `node tools/check-colori.js` | Nessuna coppia di stati **confinanti** con colori confondibili |
| `VoxScena.smoke()` in console | Costruisce tutte le scene a più istanti e riporta gli errori |

**Falli girare tutti e tre dopo ogni modifica ai dati o alle scene.** Hanno già
trovato bug veri: 9 sovrapposizioni di province fra stati, 30 coppie confinanti
indistinguibili, e il segno sbagliato di un arco in fase di generazione.

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

### 3. Tutto dipende dall'anno corrente

Carta politica, marcatori, cronaca e contatore sono funzione pura di `pb.cur`.
Per questo pausa e trascinamento della barra funzionano senza casi particolari,
esattamente come in Chronoscope.

Differenze rispetto a Chronoscope, volute:
- **finestra di 200 anni** (non 100): con 238 eventi su cinquemila anni, un
  secolo solo lasciava troppe finestre vuote;
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

**Scene firma già fatte (12):** pompei, colosseo, roma-fondazione, cupola,
venezia-origini, mille, porta-pia, vajont, marconi, messina-1908, annibale,
autosole.
**Scene per tipo (7):** battaglia, guerra, viaggio, fondazione, scoperta,
disastro, cultura.

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

- **Altre scene firma.** Ce ne sono 12 su 238 eventi; le più desiderate:
  cenacolo, sistina, lepanto, caporetto, liberazione, capaci, alluvione-firenze,
  duomo-milano, cupola già c'è, peste-nera (sobria), codogno (sobria).
- **Più eventi.** 238 è una base solida ma il Sud e le isole possono crescere,
  e il Novecento culturale (cinema, musica, design) è appena accennato.
- **Epoche intermedie.** Fra il 1130 e il 1250 c'è un salto; si potrebbe
  aggiungere il 1176 (Legnano) e il 1210.
- **Etichette dei nomi degli stati sulla mappa**, oltre alla legenda.

---

## Prompt per riprendere

> Riprendo CronoItalia in `C:\Users\lfili\OneDrive\Documenti\app\CronoItalia`.
> Leggi `HANDOFF.md`. L'app è collaudata e funzionante: prima di toccare i dati
> fai girare `node tools/check-stati.js`, `node tools/check-colori.js` e
> `VoxScena.smoke()` in console.
