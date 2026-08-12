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
| `cronoitalia-scene3.js` | — | 86 scene firma: fino a metà degli eventi |
| `cronoitalia-scene4.js` | — | 62 scene firma: battaglie e guerre |
| `cronoitalia-scene5.js` | — | 58 scene firma: fondazioni, scoperte, viaggi |
| `cronoitalia-scene6.js` | — | 70 scene firma: cultura, politica, costume |
| `cronoitalia-scene7.js` | — | 56 scene firma: la Repubblica e i disastri |
| `vendor/three.min.js` | 654 KB | three.js r160 (l'ultima build UMD, quindi `<script>` normale) |

### Strumenti (`tools/`, da lanciare con node dalla cartella dell'app)

| Comando | A cosa serve |
|---|---|
| `node tools/convert-italy-map.js` | Rigenera `cronoitalia-map.js` dai geodati in `data/` |
| `node tools/merge-eventi.js [--prova]` | Fonde i lotti `tools/new-eventi-*.js` nel dataset, validando prima di scrivere |
| `node tools/check-stati.js` | Nessuna provincia senza stato, nessuna in due stati |
| `node tools/check-colori.js` | Nessuna coppia di stati **confinanti** con colori confondibili |
| `node tools/check-scene.js` | Colori inesistenti nelle scene, scene senza evento, copertura |
| `node tools/check-anim.js [--tutte\|<id>]` | Come si **muovono** le scene: chi esce dalla piastra, chi non si muove, chi sfarfalla |
| `node tools/check-vista.js [--tutte\|--tolti\|<id>]` | Se la scena si **lascia vedere**: quanto movimento resta dietro tetti, muri e rilievi. `--tolti` dice cosa si porta via lo scoperchiamento |
| `tools/prova-scene.html` | Banco di prova: apre una scena qualsiasi, ferma il tempo, disegna il bordo della piastra, **rimette il coperchio** per il confronto |
| `sh tools/scatta.sh <id> [t] [coperchio]` | Uno scatto della scena da riga di comando (Chrome headless), in `tools/scatti/` |
| `VoxScena.smoke()` in console | Costruisce tutte le scene a più istanti e riporta gli errori |

**Falli girare tutti dopo ogni modifica ai dati o alle scene.** Hanno già trovato
bug veri: 9 sovrapposizioni di province fra stati, 30 coppie confinanti
indistinguibili, il segno sbagliato di un arco in fase di generazione, tre id
duplicati e un colore `undefined` da un modulo negativo nella volta della Sistina.
`check-anim.js`, l'ultimo arrivato, ne ha trovati **71 in un colpo solo**: 60 scene
con blocchi che marciavano, navigavano o volavano fuori dalla piastra, 4 con
qualcosa che sprofondava sotto il terreno, 5 che dopo un minuto di scheda aperta
si erano svuotate perché il movimento non si avvolgeva, 2 del tutto immobili.
Sono state corrette tutte.

Il banco di prova (`prova-scene.html`) apre le scene senza passare per la mappa:
serve il server locale (`python -m http.server`), poi
`tools/prova-scene.html?id=<id-evento>`. Il tasto **bordo del plastico** disegna
una cornice rossa sul perimetro del mondo statico: chi si sporge nel vuoto si
vede a occhio in un secondo.

Per aggiungere eventi: scrivi un file `tools/new-eventi-<nome>.js` che esporta un
array, lancia `node tools/merge-eventi.js --prova`, correggi quel che segnala,
rilancia senza `--prova` e sposta il lotto in `tools/fusi/`.

---

## La carta si sfoglia (12 agosto 2026)

All'inizio la carta era muta: si sceglieva l'anno, si premeva **Viaggia**, si
guardava la corsa, e per cambiare secolo si tornava su e si rimetteva il
cursore. Tre gesti per una domanda sola. Ora **gli eventi stanno già sulla
carta**, quelli entro vent'anni dall'anno scelto (`SCARTO`, in
`cronoitalia.js`): si muove il cursore e i fatti compaiono dove sono successi,
pronti da toccare. Il viaggio resta per chi vuole vedere la storia scorrere, e
tornando indietro si resta **all'anno a cui il racconto era arrivato**.

Due cose sono venute dietro:

- **I grappoli.** A Roma succede tutto, e da un'Italia intera i marcatori di
  Roma sono lo stesso pixel: nel 1935 ce n'erano ventinove sovrapposti, e
  quindici hanno le identiche coordinate, per cui nessuno zoom li avrebbe mai
  separati. Quando due o più si pestano i piedi (meno di `VICINI_PX` sullo
  schermo) si nascondono e al loro posto compare un gettone d'oro con il numero;
  toccarlo apre l'elenco in ordine di anno.
- **Le targhe delle epoche non stanno più in mezzo alla carta.** Mentre il tempo
  scorre le epoche si susseguono, e una targa al centro dello schermo copriva
  proprio quello che si era andati a guardare. Ora sono una fascia sottile in
  alto che se ne va da sola, più un lampo d'oro sulla legenda, dove il nome
  dell'epoca sta scritto sempre.

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

**498 scene su misura su 498 eventi: una per ciascuno.** Le prime 36 stanno nel
motore, le altre nei sette volumi `cronoitalia-scene*.js`; `check-scene.js` li
trova da solo con un glob, quindi aggiungerne uno non richiede di toccare il
controllo. Si registrano con `VoxScena.registra` e attingono a `VoxScena.kit`
(vedi sotto): è il kit a rendere possibile una scena in otto righe invece che
in trenta.

**Scene per tipo (7):** battaglia, guerra, viaggio, fondazione, scoperta,
disastro, cultura. Ora nessun evento le usa più, ma restano: sono la rete di
sicurezza per quelli che aggiungerai, e il controllo dice quanti sono.

### Lo scoperchiamento (12 agosto 2026)

Le scene erano costruite come edifici veri, con il coperchio. Ma il plastico si
guarda da trenta gradi d'elevazione: a scheda aperta si vedeva il coperchio, e
sotto succedeva tutto quello che nessuno vedeva mai. `check-vista.js`, tirando
un raggio da ogni blocco in movimento verso la camera, ha misurato che **in
media il 17,7% del movimento non arrivava all'occhio**, con 104 scene sopra un
terzo e punte dell'85% (il Pantheon: folla e fascio di luce chiusi nel tamburo).

Ora `mondoDi()` passa i blocchi fermi per `scoperchia()`, che toglie **quel che
seppellisce l'azione, e soltanto quello**. Sepolto non vuol dire nascosto una
volta: da un giro di camera ogni cosa finisce dietro qualcos'altro per un pezzo
del giro, ed è la vita di un plastico. È sepolto quel che sparisce da più di
metà degli angoli — allora vuol dire che è chiuso dentro. Media scesa al
**10,3%**, scene sopra un terzo da 104 a 29.

Le tre regole che hanno richiesto più tentativi, tutte imparate sbagliando:

- **Quel che regge l'azione non si tocca.** Il tetto del Duomo porta le guglie
  che spuntano una per volta: toglierlo perché nascondeva la folla lasciava le
  guglie sospese sopra un plastico raso al suolo. E poggiare non è passare
  sopra: una nota musicale che sorvola un solaio non lo rende un pilastro, per
  cui conta solo chi torna sullo stesso punto in più istanti. Se dopo una
  demolizione un appoggio resta per aria, la demolizione **si annulla**.
- **Il quorum.** Un figurante solo sepolto non basta: senza quorum un unico
  passante dentro una casa faceva demolire l'intero anello della piazza.
- **Si toglie per intero e in modo che regga.** Una copertura va via tutta (un
  tetto bucherellato è peggio di un tetto), un muro si abbassa su tutto il giro,
  e chi resta appeso al vuoto scende con il resto. Le strisce larghe una cella
  (ponti, acquedotti, cornicioni) e le cose sottili (torri, campanili, colonne,
  alberi) non si toccano mai.

**I monumenti tengono il coperchio.** Una cupola, un duomo, una volta affrescata
*sono* la scheda: si scrive `coperchio: true` nella scena e lo scoperchiamento
la salta — e allora l'azione va portata fuori a mano, sul sagrato. È quello che
è successo al Pantheon: cupola intatta, il fascio di luce esce dall'oculo verso
il cielo invece di cadere su un pavimento invisibile, i visitatori sono davanti
al pronao.

Il resto dei difetti trovati stava nelle scene, non nel motore, e sono tre
famiglie che conviene riconoscere a colpo d'occhio quando se ne scrive una nuova:

1. **Gente dentro le case.** La folla del Duomo era centrata *dentro* la navata,
   i monatti della peste passavano attraverso una fila di case, i vandali di
   Genserico camminavano dentro le abitazioni. Si sposta la gente, non si toglie
   la casa. La colonna `dentro` di `check-vista.js` li trova tutti.
2. **Costruzioni posate a y=1 su un terreno che a y=1 non c'è.** Ogni elemento
   del kit si posa a y=1 se non gli si dice altro: su una collina, su un pendio
   o su un crinale finisce sepolto (l'abbazia di Bobbio, la basilica di Assisi,
   il paese dell'Irpinia dentro il fianco del monte) oppure appeso in aria (il
   sentiero di Montecassino). Per questo `casa`, `mura` e `cattedrale` hanno un
   parametro di **quota di posa**, e le scene con un rilievo dovrebbero
   calcolare l'altezza del terreno una volta sola e passarla a tutti.
3. **L'animazione disegnata sopra il pezzo statico che dovrebbe sostituire.**
   La breccia di Caterina Sforza, le mura di Aquileia sotto Attila, il muro del
   Gianicolo, le colonne di Selinunte: il muro di pietra restava in piedi dietro
   quello che crollava, e il crollo — cioè tutta la scena — non si vedeva mai.
   Il pezzo che si anima non va costruito anche fra gli statici: si fa la cinta
   a tre lati e il quarto lo disegna `dinamici`.

Il banco di prova col tasto **rimetti il coperchio** serve a giudicarli a
occhio, uno accanto all'altro.

### Il kit

`VoxScena.kit` contiene sia i pezzi (`tempio`, `cattedrale`, `torre`, `mura`,
`nave`, `folla`, `fuoco`, `bandiera`, `stelle`, `onde`, `fabbrica`, `ponte`,
`casa`, `albero`, `omino`) sia le **scenografie** (`interno`, `piazza`, `campo`,
`porto`, `teatro`, `bottega`, `collina`, `valle`). Le seconde sono quelle che
hanno reso possibile arrivare a 498: metà delle scene aveva la stessa
impalcatura ricopiata, e ricopiata sbagliava ogni volta in modo diverso.

Attenzione: gli elementi che costruiscono blocchi fermi (`casa`, `albero`,
`tempio`, `interno`…) vanno chiamati **solo dentro `statici`**, dove esiste il
Mondo su cui posare i cubi. Chiamarli in `dinamici` dà `m.p is not a function` —
lo smoke test lo prende, ma è un errore facile da fare copiando.

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

### Regole sul movimento (le ha imparate `check-anim.js`)

- **Chi si muove deve restare sulla piastra, e non basta guardare il punto
  d'ancoraggio.** Un treno lungo otto blocchi ancorato a x = 12 arriva a 20: la
  piastra finisce a 12 e il resto galleggia sul nero. O si riduce la corsa
  lasciando spazio all'ingombro, o si taglia al bordo con un
  `if (bx >= -12 && bx <= 12)` — quest'ultimo va benissimo per treni, carrozze e
  navi, che così sembrano entrare e uscire dall'inquadratura.
- **Il giro (`giro`/`% 26 - 13`) va scritto sul bordo meno l'ingombro.** Quasi
  tutte le scene avvolgevano a ±13 su una piastra di ±12, e ogni pezzo più lungo
  di un blocco usciva. E attenzione ancora al **modulo negativo**:
  `(v % 26) - 13` con v negativo dà fino a −19 (era il caso dell'Appia).
- **Chi affonda si ferma al pelo dell'acqua.** Tre scene di battaglia navale
  facevano scendere le navi di due o tre blocchi sotto il fondale, dove non le
  vede più nessuno.
- **Attenzione a `folla(d, t, cx, cz, n, r0, …)`**: il raggio arriva a
  `r0 + 4.8`, quindi una folla centrata a z = 8 su una piastra di 11 sborda di
  due blocchi. Centrarla entro metà piastra.
- **Le figure respirano da sole.** `omino` oscilla di un cinquesimo di blocco,
  con la fase presa dalla posizione: senza, le scene d'interni erano fotografie.
  L'orologio è `orologio`, aggiornato dal ciclo; fuori dal browser lo si imposta
  con `VoxScena.tempo(t)`.
- **Il ciclo che riparte non deve svuotare il plastico, e i pezzi non devono
  comparire di scatto.** Il modo solito (`const f = (t * .12) % 1.3` e poi
  `if (f < i / n) continue`) fa comparire le cose una a una e poi sparire tutte
  insieme: due lampi, uno in entrata e uno in uscita. Per questo ci sono due
  pezzi di kit, e le scene nuove dovrebbero usarli tutt'e due:

  ```javascript
  dinamici(d0, t) {
    const f = (t * .12) % 1.3;
    const d = dissolvenza(d0, f, 1.3);      // in coda al ciclo tutto si ritira
    for (let i = 0; i < 12; i++) {
      const p = clamp01((f - i / 14) * 5);
      if (p <= 0) continue;
      const da = arrivo(d, p);              // il pezzo scende e cresce al posto suo
      da(x, y, z, 1, P.marmo);
    }
  }
  ```

  `dissolvenza` fuori dalla coda restituisce la `d` originale e `arrivo` a
  pezzo arrivato pure, quindi non costano niente quando non servono.
  `check-anim.js` segnala il primo caso come `SVUOTO` e il secondo come
  `COMPARSE`.

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

- **19 scene nascondono ancora più di un terzo del movimento** (`node
  tools/check-vista.js`; erano 104 prima dello scoperchiamento). Non è più roba
  da motore: è composizione, e va guardata una per una nel banco di prova,
  riconoscendo a quale delle tre famiglie qui sopra appartiene.

- **49 scene hanno ancora un'animazione essenziale** (`node tools/check-anim.js`):
  28 `COMPARSE` (i pezzi arrivano ma poi il quadro sta fermo), 18 `QUASI-FERMA`
  e 3 `NON-MISURATA`. Non sono errori — su tutte le figure respirano e il ciclo
  entra ed esce in dissolvenza — ma se una ti sembra spenta, quella è la lista
  da cui partire. Le `NON-MISURATA` il controllo non sa giudicarle (il numero di
  blocchi cambia a ogni fotogramma): vanno guardate nel banco di prova.

- **Le scene ci sono tutte.** Ogni evento nuovo che aggiungi al dataset parte
  però senza: `check-scene.js` te lo dice, e la scena per tipo lo copre finché
  non gliene scrivi una.
- **Rileggere a occhio le scene meno viste.** Sono 498 e ne ho aperte una
  cinquantina: lo smoke test garantisce che costruiscano e stiano nei limiti,
  non che si capiscano. Se una risulta illeggibile, quasi sempre è per una delle
  regole qui sotto.
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
