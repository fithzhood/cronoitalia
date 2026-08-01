/* La carta politica d'Italia nel tempo.
 *
 * Ogni epoca elenca gli stati che si dividevano la penisola; ogni stato è un
 * insieme di **unità** (le province odierne, più qualche unità estera: Corsica,
 * Nizza, Savoia, Ticino, Istria, Dalmazia, Malta, Tirolo). L'app colora le unità
 * e accende i confini fra unità di stati diversi.
 *
 * I confini sono quindi **approssimati alle province di oggi**: è il prezzo da
 * pagare per avere una carta che cambia con l'anno senza scaricare nulla. Un
 * ducato che tagliava a metà una provincia moderna qui la prende tutta.
 *
 * `y` è l'anno da cui la configurazione vale, fino all'epoca successiva.
 * `prov: true` = da qui in poi si vedono anche i confini di provincia.
 */

'use strict';

/* ---- gruppi di unità (i codici sono NUTS 2021 livello 3) ---- */
const G = {
  PIE: 'ITC11 ITC12 ITC13 ITC14 ITC15 ITC16 ITC17 ITC18',
  VDA: 'ITC20',
  LIG: 'ITC31 ITC32 ITC33 ITC34',
  LOM: 'ITC41 ITC42 ITC43 ITC44 ITC46 ITC47 ITC48 ITC49 ITC4A ITC4B ITC4C ITC4D',
  ABR: 'ITF11 ITF12 ITF13 ITF14',
  MOL: 'ITF21 ITF22',
  CAM: 'ITF31 ITF32 ITF33 ITF34 ITF35',
  PUG: 'ITF43 ITF44 ITF45 ITF46 ITF47 ITF48',
  BAS: 'ITF51 ITF52',
  CAL: 'ITF61 ITF62 ITF63 ITF64 ITF65',
  SIC: 'ITG11 ITG12 ITG13 ITG14 ITG15 ITG16 ITG17 ITG18 ITG19',
  SAR: 'ITG2D ITG2E ITG2F ITG2G ITG2H',
  TAA: 'ITH10 ITH20',
  VEN: 'ITH31 ITH32 ITH33 ITH34 ITH35 ITH36 ITH37',
  FVG: 'ITH41 ITH42 ITH43 ITH44',
  EMR: 'ITH51 ITH52 ITH53 ITH54 ITH55 ITH56 ITH57 ITH58 ITH59',
  TOS: 'ITI11 ITI12 ITI13 ITI14 ITI15 ITI16 ITI17 ITI18 ITI19 ITI1A',
  UMB: 'ITI21 ITI22',
  MAR: 'ITI31 ITI32 ITI33 ITI34 ITI35',
  LAZ: 'ITI41 ITI42 ITI43 ITI44 ITI45',

  /* sotto-gruppi ricorrenti */
  FRIULI: 'ITH41 ITH42',                       // Pordenone, Udine
  LITORALE: 'ITH43 ITH44',                     // Gorizia, Trieste
  ROMAGNA: 'ITH57 ITH58 ITH59',                // Ravenna, Forlì-Cesena, Rimini
  LEGAZIONI: 'ITH55 ITH56 ITH57 ITH58 ITH59',  // Bologna, Ferrara e Romagna
  EMILIA_O: 'ITH51 ITH52',                     // Piacenza, Parma
  EMILIA_C: 'ITH53 ITH54',                     // Reggio, Modena
  TOS_FI: 'ITI13 ITI14 ITI15 ITI17 ITI16 ITI18',
  TOS_SI: 'ITI19 ITI1A',
  TOS_NOMS: 'ITI12 ITI13 ITI14 ITI15 ITI16 ITI17 ITI18 ITI19 ITI1A',  // senza Massa-Carrara, a lungo ligure-apuana
  VEN_NOVE: 'ITH31 ITH32 ITH33 ITH34 ITH36 ITH37',                    // Veneto senza la laguna di Venezia

  /* unità estere */
  CORSICA: 'FRM01 FRM02',
  SAVOIA: 'FRK27 FRK28',
  NIZZA: 'FRL03',
  TICINO: 'CH070',
  GRIGIONI: 'CH056',
  ISTRIA: 'HR036 SI044',
  FIUME: 'HR031',
  CARSO: 'SI043 SI038',
  DALMAZIA: 'HR033 HR034 HR035 HR037',
  MALTA: 'MT001 MT002',
  TIROLO: 'AT331 AT332 AT333 AT334 AT335',
  CARINZIA: 'AT211 AT212',
};

/* ---- palette da carta politica ---- */
const C = {
  rosso: '#b8483a', ruggine: '#9d4a2c', terracotta: '#d08c46', ocra: '#c9a227',
  senape: '#b9a13e', oliva: '#7f9440', muschio: '#5f7f45', verde: '#4f9d69',
  acqua: '#3fa39b', petrolio: '#2f7f8c', azzurro: '#4a90c2', blu: '#4a6fb5',
  indaco: '#6b5bb0', lavanda: '#9a92c4', viola: '#8e5aa8', prugna: '#7d4a63',
  magenta: '#b8558e', rosa: '#cf7a8d', marrone: '#96674a', sabbia: '#c2a878',
  grigioblu: '#6c8296', grigioverde: '#7d9188', cachi: '#a5a05c', ardesia: '#5b6b7d',
  corallo: '#d9836a', menta: '#6fbfa3', celeste: '#7fb3dd', porpora: '#9a3f6b',
  salvia: '#93a87c', bruno: '#7a5a3a',
};

/* ---- le epoche ---- */
const ERAS = [
{
  y: -800, name: 'Italia dei popoli',
  note: 'Prima di Roma: decine di popoli, ciascuno con la sua lingua.',
  states: [
    { n: 'Liguri', c: C.muschio, u: 'LIG ITC16 ITC17 ITC18 ITI11 NIZZA' },
    { n: 'Celti e Golasecca', c: C.azzurro, u: 'ITC41 ITC42 ITC43 ITC44 ITC46 ITC47 ITC48 ITC49 ITC4A ITC4C ITC4D ITC11 ITC12 ITC13 ITC14 ITC15 VDA TICINO' },
    { n: 'Reti', c: C.sabbia, u: 'TAA TIROLO GRIGIONI' },
    { n: 'Veneti', c: C.acqua, u: 'VEN FRIULI' },
    { n: 'Istri e Carni', c: C.lavanda, u: 'LITORALE ISTRIA CARSO FIUME' },
    { n: 'Villanoviani ed Etruschi', c: C.ocra, u: 'TOS_NOMS ITI41 ITC4B ITH51 ITH52 ITH53 ITH54 ITH55 ITH56 ITH57' },
    { n: 'Umbri', c: C.oliva, u: 'UMB ITI31 ITH58 ITH59' },
    { n: 'Piceni', c: C.senape, u: 'ITI32 ITI33 ITI34 ITI35 ITF12' },
    { n: 'Latini e Sabini', c: C.rosso, u: 'ITI42 ITI43 ITI44 ITI45' },
    { n: 'Sanniti e Osci', c: C.marrone, u: 'ITF11 ITF13 ITF14 MOL ITF32 ITF34' },
    { n: 'Campani', c: C.terracotta, u: 'ITF31 ITF33 ITF35' },
    { n: 'Lucani ed Enotri', c: C.prugna, u: 'BAS CAL' },
    { n: 'Iapigi e Messapi', c: C.viola, u: 'PUG' },
    { n: 'Sicani, Siculi ed Elimi', c: C.sabbia, u: 'SIC MALTA' },
    { n: 'Civiltà nuragica', c: C.magenta, u: 'SAR' },
    { n: 'Corsi', c: C.cachi, u: 'CORSICA' },
    { n: 'Illiri', c: C.blu, u: 'DALMAZIA CARINZIA' },
  ],
},
{
  y: -550, name: 'Etruschi, Greci e Cartaginesi',
  note: 'Tre potenze si dividono il mare: la dodecapoli etrusca, le colonie greche, gli empori punici.',
  states: [
    { n: 'Etruschi', c: C.ocra, u: 'TOS_NOMS ITI41 ITI22 ITC4B ITH51 ITH52 ITH53 ITH54 ITH55 ITH56 ITH57 ITF31' },
    { n: 'Magna Grecia', c: C.azzurro, u: 'ITF33 ITF35 CAL ITF43 ITF52 ITG13 ITG17 ITG19 ITG18 ITG14 ITG15' },
    { n: 'Cartaginesi e Fenici', c: C.viola, u: 'ITG11 ITG12 SAR MALTA' },
    { n: 'Siculi', c: C.sabbia, u: 'ITG16' },
    { n: 'Roma e i Latini', c: C.rosso, u: 'ITI42 ITI43 ITI44 ITI45' },
    { n: 'Sanniti', c: C.marrone, u: 'ITF11 ITF13 ITF14 MOL ITF32 ITF34 ITF51' },
    { n: 'Iapigi e Messapi', c: C.prugna, u: 'ITF44 ITF45 ITF46 ITF47 ITF48' },
    { n: 'Umbri e Piceni', c: C.oliva, u: 'ITI21 MAR ITH58 ITH59 ITF12' },
    { n: 'Veneti', c: C.acqua, u: 'VEN FRIULI' },
    { n: 'Celti', c: C.grigioblu, u: 'ITC41 ITC42 ITC43 ITC44 ITC46 ITC47 ITC48 ITC49 ITC4A ITC4C ITC4D ITC11 ITC12 ITC13 ITC14 ITC15 VDA TICINO' },
    { n: 'Liguri', c: C.muschio, u: 'LIG ITC16 ITC17 ITC18 ITI11 NIZZA CORSICA' },
    { n: 'Reti', c: C.sabbia, u: 'TAA TIROLO GRIGIONI' },
    { n: 'Istri e Illiri', c: C.lavanda, u: 'LITORALE ISTRIA CARSO FIUME DALMAZIA CARINZIA' },
  ],
},
{
  y: -280, name: 'Roma contro Taranto',
  note: 'Roma controlla il centro della penisola; a sud le città greche chiamano Pirro, a ovest Cartagine tiene le isole.',
  states: [
    { n: 'Repubblica romana', c: C.rosso, u: 'TOS_NOMS ITI41 ITI42 ITI43 ITI44 ITI45 UMB MAR ABR MOL CAM ITF46 ITF47 ITF48 ITH58 ITH59' },
    { n: 'Città greche e Taranto', c: C.azzurro, u: 'ITF43 ITF44 ITF45 ITF52 ITF51 CAL' },
    { n: 'Cartagine', c: C.viola, u: 'ITG11 ITG12 ITG14 ITG15 SAR CORSICA MALTA' },
    { n: 'Siracusa', c: C.acqua, u: 'ITG13 ITG16 ITG17 ITG18 ITG19' },
    { n: 'Galli Cisalpini', c: C.grigioblu, u: 'LOM ITC11 ITC12 ITC13 ITC14 ITC15 VDA TICINO ITH51 ITH52 ITH53 ITH54 ITH55 ITH56 ITH57' },
    { n: 'Liguri', c: C.muschio, u: 'LIG ITC16 ITC17 ITC18 ITI11 NIZZA' },
    { n: 'Veneti', c: C.oliva, u: 'VEN FRIULI' },
    { n: 'Reti', c: C.sabbia, u: 'TAA TIROLO GRIGIONI' },
    { n: 'Istri e Illiri', c: C.lavanda, u: 'LITORALE ISTRIA CARSO FIUME DALMAZIA CARINZIA' },
  ],
},
{
  y: -200, name: 'Dopo Annibale',
  note: 'Vinta la seconda guerra punica, Roma ha le isole e sta inghiottendo la pianura padana.',
  states: [
    { n: 'Repubblica romana', c: C.rosso, u: 'TOS_NOMS UMB MAR LAZ ABR MOL CAM PUG BAS CAL SIC SAR CORSICA EMR MALTA' },
    { n: 'Galli Cisalpini', c: C.grigioblu, u: 'LOM ITC11 ITC12 ITC13 ITC14 ITC15 VDA TICINO' },
    { n: 'Liguri', c: C.muschio, u: 'LIG ITC16 ITC17 ITC18 ITI11 NIZZA' },
    { n: 'Veneti', c: C.oliva, u: 'VEN FRIULI' },
    { n: 'Reti', c: C.sabbia, u: 'TAA TIROLO GRIGIONI' },
    { n: 'Istri e Illiri', c: C.lavanda, u: 'LITORALE ISTRIA CARSO FIUME DALMAZIA CARINZIA' },
  ],
},
{
  y: -49, name: "L'Italia romana",
  note: "Con la cittadinanza estesa alla Cisalpina, l'Italia è una sola: dalle Alpi allo Stretto.",
  states: [
    { n: 'Italia romana', c: C.rosso, u: 'PIE VDA LIG LOM TAA VEN FVG EMR TOS UMB MAR LAZ ABR MOL CAM PUG BAS CAL SIC SAR CORSICA ISTRIA MALTA' },
    { n: "Province dell'Impero", c: C.sabbia, u: 'NIZZA SAVOIA TICINO GRIGIONI TIROLO CARINZIA CARSO FIUME DALMAZIA' },
  ],
},
{
  y: 395, name: "Impero d'Occidente",
  note: "Diviso l'Impero, l'Italia resta il cuore della pars Occidentis, con la capitale a Ravenna dal 402.",
  states: [
    { n: "Impero romano d'Occidente", c: C.ruggine, u: 'PIE VDA LIG LOM TAA VEN FVG EMR TOS UMB MAR LAZ ABR MOL CAM PUG BAS CAL SIC SAR CORSICA ISTRIA MALTA NIZZA SAVOIA TICINO GRIGIONI TIROLO CARINZIA CARSO FIUME DALMAZIA' },
  ],
},
{
  y: 493, name: 'Regno ostrogoto',
  note: "Teodorico governa da Ravenna un'Italia goto-romana, per trent'anni in pace.",
  states: [
    { n: 'Regno ostrogoto', c: C.oliva, u: 'PIE VDA LIG LOM TAA VEN FVG EMR TOS UMB MAR LAZ ABR MOL CAM PUG BAS CAL SIC SAR CORSICA ISTRIA MALTA TIROLO CARINZIA CARSO FIUME DALMAZIA GRIGIONI TICINO' },
    { n: 'Regno dei Burgundi', c: C.sabbia, u: 'SAVOIA NIZZA' },
  ],
},
{
  y: 554, name: 'La riconquista bizantina',
  note: "Vent'anni di guerra gotica lasciano l'Italia in rovina e in mano a Costantinopoli.",
  states: [
    { n: 'Impero bizantino', c: C.indaco, u: 'PIE VDA LIG LOM TAA VEN FVG EMR TOS UMB MAR LAZ ABR MOL CAM PUG BAS CAL SIC SAR CORSICA ISTRIA MALTA CARSO FIUME DALMAZIA' },
    { n: 'Regno dei Franchi', c: C.sabbia, u: 'SAVOIA NIZZA TICINO GRIGIONI' },
    { n: 'Baiuvari e Alamanni', c: C.ardesia, u: 'TIROLO CARINZIA' },
  ],
},
{
  y: 590, name: 'Longobardi e Bizantini',
  note: "L'Italia si spacca in due a pettine: le terre dei Longobardi e i corridoi bizantini.",
  states: [
    { n: 'Regno longobardo', c: C.oliva, u: 'LOM PIE VDA TAA VEN_NOVE FRIULI ITH51 ITH52 ITH53 ITH54 TOS TICINO' },
    { n: 'Ducato di Spoleto', c: C.porpora, u: 'UMB ITI42 ITF11 ITI33' },
    { n: 'Ducato di Benevento', c: C.marrone, u: 'ITF31 ITF32 ITF34 ITF35 ITF13 ITF14 MOL BAS ITF46' },
    { n: 'Esarcato e Pentapoli', c: C.indaco, u: 'ITH55 ITH56 ITH57 ITH58 ITH59 ITI31 ITI32 ITI34 ITI35 LIG' },
    { n: 'Ducato di Roma', c: C.rosso, u: 'ITI41 ITI43 ITI44 ITI45' },
    { n: 'Bizantini del Sud', c: C.azzurro, u: 'ITF33 ITF12 ITF43 ITF44 ITF45 ITF47 ITF48 CAL SIC SAR CORSICA MALTA' },
    { n: 'Venezia bizantina', c: C.acqua, u: 'ITH35' },
    { n: "Istria e Litorale", c: C.petrolio, u: 'LITORALE ISTRIA CARSO FIUME DALMAZIA' },
    { n: 'Franchi e Bavari', c: C.sabbia, u: 'SAVOIA NIZZA GRIGIONI TIROLO CARINZIA' },
  ],
},
{
  y: 774, name: 'Carlo Magno e il Papa',
  note: 'Il regno longobardo cade: Carlo cinge la corona ferrea e dona al pontefice le terre dell’Esarcato.',
  states: [
    { n: "Regno d'Italia (Franchi)", c: C.oliva, u: 'LOM PIE VDA LIG TAA VEN_NOVE FRIULI ITH51 ITH52 ITH53 ITH54 TOS TICINO' },
    { n: 'Stato della Chiesa', c: C.rosso, u: 'LAZ UMB MAR ITH55 ITH56 ITH57 ITH58 ITH59' },
    { n: 'Ducato di Benevento', c: C.marrone, u: 'ITF31 ITF32 ITF34 ITF35 ITF13 ITF14 ITF11 MOL BAS ITF46' },
    { n: 'Bizantini', c: C.indaco, u: 'ITF33 ITF12 ITF43 ITF44 ITF45 ITF47 ITF48 CAL SIC SAR MALTA' },
    { n: 'Venezia', c: C.acqua, u: 'ITH35' },
    { n: 'Istria e Dalmazia', c: C.petrolio, u: 'LITORALE ISTRIA CARSO FIUME DALMAZIA' },
    { n: 'Impero carolingio', c: C.sabbia, u: 'SAVOIA NIZZA GRIGIONI TIROLO CARINZIA CORSICA' },
  ],
},
{
  y: 900, name: 'Il regno conteso',
  note: 'Re incoronati e deposti nel giro di mesi, Saraceni in Sicilia, Ungari nella pianura.',
  states: [
    { n: "Regno d'Italia", c: C.oliva, u: 'LOM PIE VDA LIG TAA VEN_NOVE FRIULI ITH51 ITH52 ITH53 ITH54 TOS TICINO LITORALE ISTRIA' },
    { n: 'Stato della Chiesa', c: C.rosso, u: 'LAZ UMB MAR ITH55 ITH56 ITH57 ITH58 ITH59' },
    { n: 'Principati longobardi', c: C.marrone, u: 'ITF31 ITF32 ITF34 ITF35 ITF13 ITF14 ITF11 MOL ITF51' },
    { n: 'Ducato di Napoli e Amalfi', c: C.terracotta, u: 'ITF33' },
    { n: 'Tema di Longobardia', c: C.indaco, u: 'PUG ITF52 CAL ITF12' },
    { n: 'Emirato di Sicilia', c: C.verde, u: 'SIC MALTA' },
    { n: 'Giudicati sardi', c: C.magenta, u: 'SAR' },
    { n: 'Venezia', c: C.acqua, u: 'ITH35' },
    { n: 'Regni oltre le Alpi', c: C.sabbia, u: 'SAVOIA NIZZA GRIGIONI TIROLO CARINZIA CORSICA CARSO FIUME DALMAZIA' },
  ],
},
{
  y: 1130, name: 'Il Regno di Sicilia',
  note: 'I Normanni uniscono il Mezzogiorno in un regno solo; al nord nascono i Comuni.',
  states: [
    { n: 'Regno di Sicilia', c: C.verde, u: 'SIC CAM PUG BAS CAL MOL ABR MALTA' },
    { n: 'Stato della Chiesa', c: C.rosso, u: 'LAZ UMB MAR ITH57 ITH58 ITH59' },
    { n: 'Comuni e feudi imperiali', c: C.oliva, u: 'LOM ITC12 ITC15 ITH51 ITH52 ITH53 ITH54 ITH55 ITH56 TAA TICINO ITC18 ITC17' },
    { n: 'Repubblica di Venezia', c: C.acqua, u: 'ITH35 ITH34 ITH36 ITH31 ITH32 ITH33 ITH37 FRIULI LITORALE ISTRIA' },
    { n: 'Repubblica di Genova', c: C.grigioblu, u: 'LIG CORSICA' },
    { n: 'Repubblica di Pisa', c: C.senape, u: 'ITI17 ITI16 ITI11' },
    { n: 'Comuni toscani', c: C.celeste, u: 'ITI12 ITI13 ITI14 ITI15 ITI18 ITI19 ITI1A' },
    { n: 'Giudicati sardi', c: C.magenta, u: 'SAR' },
    { n: 'Contea di Savoia', c: C.blu, u: 'VDA SAVOIA ITC11 ITC13 ITC14 ITC16 NIZZA' },
    { n: 'Impero e Ungheria', c: C.sabbia, u: 'GRIGIONI TIROLO CARINZIA CARSO FIUME DALMAZIA' },
  ],
},
{
  y: 1250, name: 'Federico II',
  note: 'Lo stupor mundi tiene insieme Impero e Regno; i Comuni della Lega resistono.',
  states: [
    { n: 'Regno di Sicilia', c: C.verde, u: 'SIC CAM PUG BAS CAL MOL ABR MALTA' },
    { n: 'Stato della Chiesa', c: C.rosso, u: 'LAZ UMB MAR ITH57 ITH58 ITH59' },
    { n: 'Comune di Milano', c: C.oliva, u: 'ITC4C ITC4D ITC42 ITC43 ITC41 ITC49 ITC48 TICINO' },
    { n: 'Comuni lombardi', c: C.menta, u: 'ITC46 ITC47 ITC4A ITC44 ITC12 ITC15 ITC18' },
    { n: 'Signoria di Verona', c: C.prugna, u: 'ITH31 ITH32 ITH33 ITC4B' },
    { n: 'Repubblica di Venezia', c: C.acqua, u: 'ITH35 ITH34 ITH36 ITH37 FRIULI LITORALE ISTRIA' },
    { n: 'Repubblica di Genova', c: C.grigioblu, u: 'LIG CORSICA' },
    { n: 'Repubblica di Pisa', c: C.celeste, u: 'ITI17 ITI16 ITI11 ITG2F ITG2H' },
    { n: 'Comune di Firenze', c: C.ocra, u: 'ITI13 ITI14 ITI15 ITI18' },
    { n: 'Repubblica di Siena', c: C.sabbia, u: 'ITI19 ITI1A' },
    { n: 'Lucca', c: C.corallo, u: 'ITI12' },
    { n: 'Bologna e le città emiliane', c: C.terracotta, u: 'ITH55 ITH56 ITH51 ITH52 ITH53 ITH54' },
    { n: 'Contea di Savoia', c: C.blu, u: 'VDA SAVOIA ITC11 ITC13 ITC14 ITC16 ITC17 NIZZA' },
    { n: 'Giudicati sardi', c: C.magenta, u: 'ITG2D ITG2E ITG2G' },
    { n: 'Impero e Ungheria', c: C.grigioverde, u: 'TAA GRIGIONI TIROLO CARINZIA CARSO FIUME DALMAZIA' },
  ],
},
{
  y: 1302, name: 'Dopo i Vespri',
  note: 'La rivolta del 1282 spezza il Regno: gli Angioini a Napoli, gli Aragonesi in Sicilia.',
  states: [
    { n: 'Regno di Napoli', c: C.terracotta, u: 'CAM PUG BAS CAL MOL ABR' },
    { n: 'Regno di Trinacria', c: C.verde, u: 'SIC MALTA' },
    { n: 'Stato della Chiesa', c: C.rosso, u: 'LAZ UMB MAR ITH57 ITH58 ITH59 ITH55' },
    { n: 'Visconti di Milano', c: C.oliva, u: 'ITC4C ITC4D ITC42 ITC43 ITC41 ITC49 ITC48 ITC4A TICINO ITC15 ITC12' },
    { n: 'Scaligeri di Verona', c: C.prugna, u: 'ITH31 ITH32 ITH33 ITC4B ITC47' },
    { n: 'Carraresi di Padova', c: C.lavanda, u: 'ITH36' },
    { n: 'Repubblica di Venezia', c: C.acqua, u: 'ITH35 ITH34 ITH37 LITORALE ISTRIA' },
    { n: 'Patriarcato di Aquileia', c: C.lavanda, u: 'FRIULI' },
    { n: 'Repubblica di Genova', c: C.grigioblu, u: 'LIG CORSICA' },
    { n: 'Repubblica di Pisa', c: C.celeste, u: 'ITI17 ITI16 ITI11' },
    { n: 'Repubblica di Firenze', c: C.ocra, u: 'ITI13 ITI14 ITI15 ITI18' },
    { n: 'Repubblica di Siena', c: C.sabbia, u: 'ITI19 ITI1A' },
    { n: 'Lucca', c: C.rosa, u: 'ITI12' },
    { n: 'Este e signorie emiliane', c: C.marrone, u: 'ITH56 ITH54 ITH53 ITH51 ITH52' },
    { n: 'Bergamo e Sondrio', c: C.menta, u: 'ITC46 ITC44' },
    { n: 'Casa Savoia', c: C.blu, u: 'VDA SAVOIA ITC11 ITC13 ITC14 NIZZA' },
    { n: 'Monferrato e Saluzzo', c: C.menta, u: 'ITC17 ITC18 ITC16' },
    { n: "Giudicato d'Arborea", c: C.magenta, u: 'ITG2G ITG2E ITG2D' },
    { n: 'Aragonesi in Sardegna', c: C.rosa, u: 'ITG2F ITG2H' },
    { n: 'Impero e Ungheria', c: C.grigioverde, u: 'TAA GRIGIONI TIROLO CARINZIA CARSO FIUME DALMAZIA' },
  ],
},
{
  y: 1402, name: 'Le signorie',
  note: 'Gian Galeazzo Visconti sfiora un regno d’Italia; la sua morte improvvisa lo dissolve.',
  states: [
    { n: 'Ducato di Milano', c: C.oliva, u: 'ITC4C ITC4D ITC42 ITC43 ITC41 ITC49 ITC48 ITC4A ITC46 ITC47 ITC44 TICINO ITC15 ITC12 ITC18 ITH51 ITH52 ITH53 ITH31 ITH32 ITH55 ITI21' },
    { n: 'Repubblica di Venezia', c: C.acqua, u: 'ITH35 ITH34 ITH37 ITH33 ITH36 LITORALE ISTRIA DALMAZIA' },
    { n: 'Patriarcato di Aquileia', c: C.lavanda, u: 'FRIULI' },
    { n: 'Repubblica di Firenze', c: C.ocra, u: 'ITI13 ITI14 ITI15 ITI18 ITI17 ITI16' },
    { n: 'Repubblica di Siena', c: C.sabbia, u: 'ITI19 ITI1A' },
    { n: 'Lucca', c: C.rosa, u: 'ITI12 ITI11' },
    { n: 'Repubblica di Genova', c: C.grigioblu, u: 'LIG CORSICA' },
    { n: 'Casa Savoia', c: C.blu, u: 'VDA SAVOIA ITC11 ITC13 ITC14 NIZZA' },
    { n: 'Monferrato e Saluzzo', c: C.menta, u: 'ITC17 ITC16' },
    { n: 'Este di Ferrara', c: C.marrone, u: 'ITH56 ITH54' },
    { n: 'Gonzaga di Mantova', c: C.prugna, u: 'ITC4B' },
    { n: 'Stato della Chiesa', c: C.rosso, u: 'LAZ ITI22 MAR ITH57 ITH58 ITH59' },
    { n: 'Regno di Napoli', c: C.terracotta, u: 'CAM PUG BAS CAL MOL ABR' },
    { n: 'Regno di Sicilia', c: C.verde, u: 'SIC MALTA' },
    { n: 'Regno di Sardegna', c: C.rosa, u: 'SAR' },
    { n: 'Impero e Ungheria', c: C.grigioverde, u: 'TAA GRIGIONI TIROLO CARINZIA CARSO FIUME' },
  ],
},
{
  y: 1454, name: 'La pace di Lodi',
  note: "Cinque potenze in equilibrio: Milano, Venezia, Firenze, il Papa e Napoli. Quarant'anni di pace armata.",
  states: [
    { n: 'Ducato di Milano', c: C.oliva, u: 'ITC4C ITC4D ITC42 ITC43 ITC41 ITC49 ITC48 ITC15 ITC12 ITC18 TICINO ITH51 ITH52' },
    { n: 'Repubblica di Venezia', c: C.acqua, u: 'ITH35 ITH34 ITH36 ITH31 ITH32 ITH33 ITH37 ITC47 ITC46 ITC4A ITC44 FRIULI LITORALE ISTRIA DALMAZIA' },
    { n: 'Repubblica di Firenze', c: C.ocra, u: 'ITI13 ITI14 ITI15 ITI17 ITI16 ITI18' },
    { n: 'Stato della Chiesa', c: C.rosso, u: 'LAZ UMB ITI32 ITI33 ITI34 ITI35 ITH55 ITH56 ITH57 ITH58 ITH59' },
    { n: 'Regno di Napoli', c: C.terracotta, u: 'CAM PUG BAS CAL MOL ABR' },
    { n: 'Ducato di Savoia', c: C.blu, u: 'VDA SAVOIA ITC11 ITC13 ITC14 ITC16 NIZZA' },
    { n: 'Marchesato di Monferrato', c: C.menta, u: 'ITC17' },
    { n: 'Repubblica di Genova', c: C.grigioblu, u: 'LIG CORSICA' },
    { n: 'Repubblica di Siena', c: C.sabbia, u: 'ITI19 ITI1A' },
    { n: 'Repubblica di Lucca', c: C.cachi, u: 'ITI12' },
    { n: 'Ducato di Ferrara', c: C.marrone, u: 'ITH54 ITH53' },
    { n: 'Marchesato di Mantova', c: C.prugna, u: 'ITC4B' },
    { n: 'Ducato di Urbino', c: C.rosa, u: 'ITI31' },
    { n: 'Signoria di Massa', c: C.lavanda, u: 'ITI11' },
    { n: 'Regno di Sicilia', c: C.verde, u: 'SIC' },
    { n: 'Regno di Sardegna', c: C.magenta, u: 'SAR' },
    { n: 'Ordine di Rodi', c: C.senape, u: 'MALTA' },
    { n: 'Impero e Ungheria', c: C.grigioverde, u: 'TAA GRIGIONI TIROLO CARINZIA CARSO FIUME' },
  ],
},
{
  y: 1559, name: 'Il secolo spagnolo',
  note: 'Cateau-Cambrésis chiude le guerre d’Italia: Madrid governa Milano, Napoli, Sicilia e Sardegna.',
  states: [
    { n: 'Domini spagnoli', c: C.porpora, u: 'ITC4C ITC4D ITC42 ITC43 ITC41 ITC49 ITC48 ITC4A ITC15 ITC12 ITC18 TICINO CAM PUG BAS CAL MOL ABR SIC SAR ITI1A' },
    { n: 'Repubblica di Venezia', c: C.acqua, u: 'ITH35 ITH34 ITH36 ITH31 ITH32 ITH33 ITH37 ITC47 ITC46 ITC44 FRIULI LITORALE ISTRIA DALMAZIA' },
    { n: 'Granducato di Toscana', c: C.ocra, u: 'ITI13 ITI14 ITI15 ITI17 ITI16 ITI18 ITI19' },
    { n: 'Stato della Chiesa', c: C.rosso, u: 'LAZ UMB MAR ITH55 ITH56 ITH57 ITH58 ITH59' },
    { n: 'Ducato di Savoia', c: C.blu, u: 'VDA SAVOIA ITC11 ITC13 ITC14 ITC16 ITC17 NIZZA' },
    { n: 'Repubblica di Genova', c: C.grigioblu, u: 'LIG CORSICA' },
    { n: 'Ducato di Parma e Piacenza', c: C.menta, u: 'ITH51 ITH52' },
    { n: 'Ducato di Ferrara e Modena', c: C.marrone, u: 'ITH54 ITH53' },
    { n: 'Ducato di Mantova', c: C.celeste, u: 'ITC4B' },
    { n: 'Repubblica di Lucca', c: C.cachi, u: 'ITI12' },
    { n: 'Signoria di Massa', c: C.lavanda, u: 'ITI11' },
    { n: 'Ordine di Malta', c: C.senape, u: 'MALTA' },
    { n: 'Impero asburgico', c: C.grigioverde, u: 'TAA GRIGIONI TIROLO CARINZIA CARSO FIUME' },
  ],
},
{
  y: 1748, name: 'Il secolo delle riforme',
  note: 'Aquisgrana fissa la carta che durerà fino a Napoleone: Asburgo a Milano, Borboni a Napoli, Savoia in Sardegna.',
  states: [
    { n: 'Regno di Sardegna', c: C.blu, u: 'PIE VDA SAR SAVOIA NIZZA' },
    { n: 'Ducato di Milano (Austria)', c: C.salvia, u: 'ITC4C ITC4D ITC42 ITC43 ITC41 ITC49 ITC48 ITC4A ITC46 ITC47 ITC44 ITC4B TICINO' },
    { n: 'Repubblica di Venezia', c: C.acqua, u: 'ITH35 ITH34 ITH36 ITH31 ITH32 ITH33 ITH37 FRIULI LITORALE ISTRIA DALMAZIA' },
    { n: 'Granducato di Toscana', c: C.ocra, u: 'ITI13 ITI14 ITI15 ITI17 ITI16 ITI18 ITI19 ITI1A' },
    { n: 'Ducato di Modena', c: C.marrone, u: 'ITH54 ITH53 ITI11' },
    { n: 'Ducato di Parma', c: C.viola, u: 'ITH51 ITH52' },
    { n: 'Repubblica di Lucca', c: C.cachi, u: 'ITI12' },
    { n: 'Repubblica di Genova', c: C.grigioblu, u: 'LIG CORSICA' },
    { n: 'Stato della Chiesa', c: C.rosso, u: 'LAZ UMB MAR ITH55 ITH56 ITH57 ITH58 ITH59' },
    { n: 'Regno di Napoli', c: C.terracotta, u: 'CAM PUG BAS CAL MOL ABR' },
    { n: 'Regno di Sicilia', c: C.verde, u: 'SIC' },
    { n: 'Ordine di Malta', c: C.senape, u: 'MALTA' },
    { n: 'Impero asburgico', c: C.ardesia, u: 'TAA GRIGIONI TIROLO CARINZIA CARSO FIUME' },
  ],
},
{
  y: 1810, name: "L'Italia di Napoleone",
  note: "Metà penisola è dipartimento francese, l'altra metà regno napoleonico. La Sicilia resiste con la flotta inglese.",
  states: [
    { n: 'Impero francese', c: C.indaco, u: 'PIE VDA LIG TOS LAZ UMB CORSICA NIZZA SAVOIA LITORALE ISTRIA CARSO FIUME DALMAZIA' },
    { n: "Regno d'Italia", c: C.verde, u: 'LOM VEN EMR MAR TAA FRIULI TICINO' },
    { n: 'Regno di Napoli (Murat)', c: C.terracotta, u: 'CAM PUG BAS CAL MOL ABR' },
    { n: 'Regno di Sicilia', c: C.rosso, u: 'SIC' },
    { n: 'Sardegna sabauda', c: C.blu, u: 'SAR' },
    { n: 'Malta britannica', c: C.senape, u: 'MALTA' },
    { n: 'Impero austriaco', c: C.grigioverde, u: 'TIROLO CARINZIA GRIGIONI' },
  ],
},
{
  y: 1815, name: 'Il Congresso di Vienna',
  note: "Restaurazione: sette stati e mezzo, con l'Austria padrona diretta o indiretta di quasi tutto.",
  states: [
    { n: 'Regno di Sardegna', c: C.blu, u: 'PIE VDA LIG SAR SAVOIA NIZZA' },
    { n: 'Regno Lombardo-Veneto', c: C.salvia, u: 'LOM VEN FRIULI' },
    { n: 'Impero austriaco', c: C.ardesia, u: 'TAA LITORALE ISTRIA CARSO FIUME DALMAZIA TIROLO CARINZIA' },
    { n: 'Ducato di Parma', c: C.viola, u: 'ITH51 ITH52' },
    { n: 'Ducato di Modena', c: C.marrone, u: 'ITH53 ITH54 ITI11' },
    { n: 'Granducato di Toscana', c: C.ocra, u: 'ITI13 ITI14 ITI15 ITI17 ITI16 ITI18 ITI19 ITI1A' },
    { n: 'Ducato di Lucca', c: C.cachi, u: 'ITI12' },
    { n: 'Stato Pontificio', c: C.rosso, u: 'LAZ UMB MAR ITH55 ITH56 ITH57 ITH58 ITH59' },
    { n: 'Regno delle Due Sicilie', c: C.terracotta, u: 'CAM PUG BAS CAL MOL ABR SIC' },
    { n: 'Francia', c: C.lavanda, u: 'CORSICA' },
    { n: 'Malta britannica', c: C.senape, u: 'MALTA' },
    { n: 'Svizzera', c: C.bruno, u: 'TICINO GRIGIONI' },
  ],
},
{
  y: 1859, name: 'La seconda guerra d’indipendenza',
  note: 'Magenta e Solferino portano la Lombardia a Torino; ducati e legazioni cacciano i loro sovrani.',
  states: [
    { n: 'Regno di Sardegna', c: C.blu, u: 'PIE VDA LIG SAR ITC4C ITC4D ITC42 ITC43 ITC41 ITC49 ITC48 ITC4A ITC46 ITC47 ITC44 SAVOIA NIZZA' },
    { n: 'Governi provvisori', c: C.verde, u: 'TOS EMR' },
    { n: 'Impero austriaco', c: C.grigioverde, u: 'VEN ITC4B FRIULI TAA LITORALE ISTRIA CARSO FIUME DALMAZIA TIROLO CARINZIA' },
    { n: 'Stato Pontificio', c: C.rosso, u: 'LAZ UMB MAR' },
    { n: 'Regno delle Due Sicilie', c: C.terracotta, u: 'CAM PUG BAS CAL MOL ABR SIC' },
    { n: 'Francia', c: C.lavanda, u: 'CORSICA' },
    { n: 'Malta britannica', c: C.senape, u: 'MALTA' },
    { n: 'Svizzera', c: C.sabbia, u: 'TICINO GRIGIONI' },
  ],
},
{
  y: 1861, name: "Il Regno d'Italia", prov: true,
  note: 'Proclamato il 17 marzo. Mancano ancora il Veneto, il Trentino e Roma.',
  states: [
    { n: "Regno d'Italia", c: C.verde, u: 'PIE VDA LIG LOM EMR TOS UMB MAR ABR MOL CAM PUG BAS CAL SIC SAR' },
    { n: 'Stato Pontificio', c: C.rosso, u: 'LAZ' },
    { n: 'Impero austriaco', c: C.grigioverde, u: 'VEN FVG TAA ISTRIA CARSO FIUME DALMAZIA TIROLO CARINZIA' },
    { n: 'Francia', c: C.lavanda, u: 'CORSICA SAVOIA NIZZA' },
    { n: 'Malta britannica', c: C.senape, u: 'MALTA' },
    { n: 'Svizzera', c: C.sabbia, u: 'TICINO GRIGIONI' },
  ],
},
{
  y: 1866, name: 'Il Veneto', prov: true,
  note: "La terza guerra d'indipendenza porta Venezia e il Friuli nel Regno.",
  states: [
    { n: "Regno d'Italia", c: C.verde, u: 'PIE VDA LIG LOM EMR TOS UMB MAR ABR MOL CAM PUG BAS CAL SIC SAR VEN FRIULI' },
    { n: 'Stato Pontificio', c: C.rosso, u: 'LAZ' },
    { n: 'Austria-Ungheria', c: C.grigioverde, u: 'TAA LITORALE ISTRIA CARSO FIUME DALMAZIA TIROLO CARINZIA' },
    { n: 'Francia', c: C.lavanda, u: 'CORSICA SAVOIA NIZZA' },
    { n: 'Malta britannica', c: C.senape, u: 'MALTA' },
    { n: 'Svizzera', c: C.sabbia, u: 'TICINO GRIGIONI' },
  ],
},
{
  y: 1871, name: 'Roma capitale', prov: true,
  note: 'Presa Porta Pia, il Regno è completo tranne le "terre irredente".',
  states: [
    { n: "Regno d'Italia", c: C.verde, u: 'PIE VDA LIG LOM EMR TOS UMB MAR LAZ ABR MOL CAM PUG BAS CAL SIC SAR VEN FRIULI' },
    { n: 'Austria-Ungheria', c: C.grigioverde, u: 'TAA LITORALE ISTRIA CARSO FIUME DALMAZIA TIROLO CARINZIA' },
    { n: 'Francia', c: C.lavanda, u: 'CORSICA SAVOIA NIZZA' },
    { n: 'Malta britannica', c: C.senape, u: 'MALTA' },
    { n: 'Svizzera', c: C.sabbia, u: 'TICINO GRIGIONI' },
  ],
},
{
  y: 1920, name: 'Le terre redente', prov: true,
  note: 'Dopo la Grande Guerra arrivano Trento, Trieste, l’Istria e Zara.',
  states: [
    { n: "Regno d'Italia", c: C.verde, u: 'PIE VDA LIG LOM EMR TOS UMB MAR LAZ ABR MOL CAM PUG BAS CAL SIC SAR VEN FVG TAA ISTRIA HR033 FIUME' },
    { n: 'Austria', c: C.grigioverde, u: 'TIROLO CARINZIA' },
    { n: 'Regno di Jugoslavia', c: C.petrolio, u: 'CARSO HR034 HR035 HR037' },
    { n: 'Francia', c: C.lavanda, u: 'CORSICA SAVOIA NIZZA' },
    { n: 'Malta britannica', c: C.senape, u: 'MALTA' },
    { n: 'Svizzera', c: C.sabbia, u: 'TICINO GRIGIONI' },
  ],
},
{
  y: 1947, name: "L'Italia repubblicana", prov: true,
  note: 'Il trattato di pace riporta il confine orientale sull’attuale linea. Nascono le regioni.',
  states: [
    { n: 'Repubblica Italiana', c: C.verde, u: 'PIE VDA LIG LOM EMR TOS UMB MAR LAZ ABR MOL CAM PUG BAS CAL SIC SAR VEN FVG TAA' },
    { n: 'Jugoslavia (poi Slovenia e Croazia)', c: C.petrolio, u: 'ISTRIA CARSO FIUME DALMAZIA' },
    { n: 'Austria', c: C.grigioverde, u: 'TIROLO CARINZIA' },
    { n: 'Francia', c: C.lavanda, u: 'CORSICA SAVOIA NIZZA' },
    { n: 'Malta', c: C.senape, u: 'MALTA' },
    { n: 'Svizzera', c: C.sabbia, u: 'TICINO GRIGIONI' },
  ],
},
];

/* Espande i gruppi in elenchi di codici unità. */
function expandUnits(s) {
  const out = [];
  for (const tok of s.split(/\s+/)) {
    if (!tok) continue;
    if (G[tok]) out.push(...G[tok].split(' '));
    else out.push(tok);
  }
  return out;
}
for (const era of ERAS)
  for (const st of era.states) st.ids = expandUnits(st.u);

if (typeof module !== 'undefined') module.exports = { ERAS, G, C };
