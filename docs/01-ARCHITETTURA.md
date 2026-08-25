# Architettura tecnica

## Stack

| Ruolo | Scelta |
|---|---|
| Framework | Next.js (App Router) + React + TypeScript |
| Stile | Tailwind CSS |
| Stato globale | Zustand |
| Zoom/pan mappa | react-zoom-pan-pinch (o d3-zoom) |
| Ricerca | Fuse.js, interamente lato browser |
| Traduzioni UI | next-intl |
| Hosting | Vercel, piano Hobby |
| Versionamento | GitHub |

**Nessun backend. Nessun database. Nessuna API. Il sito è completamente statico.**

Questa non è una semplificazione temporanea: è una scelta architetturale definitiva. Gli utenti
leggono soltanto, quindi non serve altro.

## I tre strati

```
DATI          file JSON versionati su Git
              ├─ struttura (coordinate, capitoli, rotte) — neutra rispetto alla lingua
              ├─ testi (uno per lingua)
              └─ immagini (copertine, luoghi, avatar)
                          ↓
MOTORE        filtro sul capitolo corrente
              ├─ progresso utente (volume o episodio) → convertito in capitolo
              ├─ filtro spoiler: mostra solo ciò che ha rivelatoAlCapitolo ≤ progresso
              ├─ filtro canone: manga / anime / film / spinoff
              └─ filtri ciurma e personaggio
                          ↓
INTERFACCIA   ├─ sfondo mappa (immagine statica)
              ├─ strato SVG (isole, rotte, etichette) — tutto l'interattivo
              └─ pannelli (barra copertine, schede, timeline, filtri)
```

Ogni strato è sostituibile senza toccare gli altri.

## Lo spazio-mappa

Regola fondamentale: **le coordinate nei dati non sono pixel.**

Esiste uno spazio astratto di riferimento, fissato una volta per tutte:

```
x: 0 → 10000   (est-ovest, il giro completo del mondo)
y: 0 → 5000    (nord-sud)
origine: angolo in alto a sinistra
```

Tutti i luoghi hanno coordinate in questo spazio. Il renderer converte in pixel a runtime.
Conseguenza: si può ridisegnare la mappa, cambiare risoluzione o passare a un sistema a tiles
**senza toccare un solo dato**.

### I punti di ancoraggio

Uno spazio astratto non serve a nulla se poi le isole si piazzano a occhio. Questi sono i
riferimenti fissi a cui agganciare ogni nuova coordinata:

| Riferimento | Coordinata | Perché |
|---|---|---|
| **Grand Line** | corre lungo `y = 2500` | è la fascia orizzontale che taglia il mondo a metà |
| **Reverse Mountain** | `x = 5000, y = 2500` | primo incrocio fra Red Line e Grand Line |
| **Mary Geoise / Isola degli Uomini-Pesce** | `x = 0` (= `x = 10000`), `y = 2500` | secondo incrocio, agli antipodi: **è qui che il mondo si avvolge** |

Ne discendono i quattro mari, uno per quadrante:

```
        x: 0 ────────── 5000 ────────── 10000
y: 0     │  North Blue   │   East Blue    │
         │               │                │
y: 2500  ├─── Grand Line ─── Grand Line ──┤
         │               │                │
y: 5000  │  West Blue    │   South Blue   │
```

Il seme dell'avventura (Isola Dawn, Villaggio di Fuschia) sta nell'**East Blue**: quadrante
in alto a destra. Mettere per sbaglio un luogo dell'East Blue in basso a sinistra è l'errore
tipico — controllare sempre il quadrante prima di scrivere una coordinata.

## Come si disegnano le isole

Le isole non sono cerchietti e non sono immagini: sono **forme vettoriali**, cioè elenchi di
coordinate che il codice trasforma in un contorno. Non si "sovrappone un disegno" alla mappa —
il contorno *è* un dato, come le coordinate. Per questo la mappa resta nostra e generata da
codice, come richiede il concept.

Il campo `forma` prevede due modi, ed è la stessa scelta per tutte le ~400 isole:

**1. `generata` — il codice inventa il contorno**

```json
"forma": { "tipo": "generata", "seme": "dawn-island" }
```

Il codice parte da un cerchio e lo deforma in modo irregolare — insenature, promontori,
frastagliature. Il "seme" è l'id dell'isola: **a parità di seme il risultato è sempre
identico**, quindi la stessa isola avrà sempre la stessa forma, oggi e fra tre anni. Isole
diverse avranno forme diverse.

È il modo con cui si popolano centinaia di isole senza disegnarne nemmeno una a mano. Non
saranno i contorni veri, ma saranno plausibili e stabili.

**2. `path` — il contorno vero, tracciato da noi**

```json
"forma": { "tipo": "path", "d": "M 9200 480 L 9260 500 L 9280 560 ..." }
```

Per le isole importanti si traccia il contorno reale e lo si salva come sequenza di
coordinate (un "path", il formato standard dei disegni vettoriali). Sempre nello spazio-mappa
astratto 0–10000 × 0–5000, quindi coerente con tutto il resto.

**La cosa importante:** passare da `generata` a `path` per una singola isola è **una modifica
di dati, non di codice**. Si cambia un campo nel JSON e basta. Quindi si parte con tutto
`generata`, e le isole importanti si "promuovono" una alla volta, quando se ne ha voglia, in
una sessione di tipo Catalogazione o Grafica. Nessuna fretta, nessuna riscrittura.

> 📄 **Da vedere:** `docs/forme-isole.html` — apri il file con un doppio clic. Mostra sei
> isole nate da sei nomi diversi, la stessa isola disegnata tre volte identica, e com'è fatto
> davvero un contorno nei dati. Vale più di questa pagina di spiegazioni.

**E in pratica, chi disegna?** Quasi mai nessuno. Le ~400 isole nascono tutte `generata`, cioè
gratis. Per le poche isole iconiche che meritano il contorno vero, il lavoro non è "aprire un
programma di disegno": si guarda una mappa di riferimento e si trascrivono i punti della costa —
è il tipo di lavoro noioso e meccanico che si fa fare a Claude, non a mano.

### Come si dà a un'isola una forma decisa da noi

Procedimento già collaudato (l'Isola Dawn è stata fatta così):

1. **Si fornisce un riferimento visivo** a Claude: un'immagine, uno schizzo, anche approssimativo
2. **Claude ricalca il contorno in punti**, espressi in modo relativo (0 = bordo sinistro della
   forma, 1 = bordo destro), così la traccia si può riusare a qualsiasi dimensione
3. **I punti vengono trasformati** in coordinate dello spazio-mappa e uniti con la stessa curva
   morbida usata dalle forme generate
4. **Si guarda il risultato e si corregge a parole**: "la rientranza in basso è troppo profonda",
   "a destra sporge troppo". Ogni giro dura un minuto

**Aspettarsi due o tre giri.** Ricalcare a occhio da un'immagine non viene mai giusto al primo
colpo, ed è normale: correggere costa pochissimo perché cambia solo un campo nel JSON, mai il
codice.

## Modalità mappatura — ricalcare da una mappa di riferimento

Indovinare le coordinate a occhio è faticoso e produce errori. Il metodo giusto è quello dei
cartografi: si mette sotto una mappa di riferimento, si legge dove stanno le cose, si toglie.

**Come si usa:**

1. Salvare l'immagine in `public/riferimento/mappa.jpg`
2. Avviare il sito in locale e aprire `http://localhost:3000/?mappatura=1`
3. Con i comandi in basso a sinistra, **allineare il riferimento sulle guide**: la sua Grand
   Line sopra la nostra, la sua Reverse Mountain sopra la nostra banda centrale. In modalità
   mappatura le guide diventano trasparenti apposta, per vedere entrambe
4. Passare il puntatore: le coordinate si leggono in tempo reale. **Cliccare copia** il campo
   già pronto da incollare in `luoghi.json`
5. Finito di catalogare, si chiude la modalità. Non c'è niente da "togliere"

**Perché il riferimento non entra mai nel progetto**

`public/riferimento/` è escluso da Git, e la regola in `.gitignore` non va rimossa.

Il motivo è che **Git non dimentica**: un'immagine finita anche una sola volta in un commit
pubblicato resta per sempre nella cronologia su GitHub, pubblica e scaricabile, anche dopo
averla cancellata. Cancellare un file toglie il file, non la sua storia. Per questo il
riferimento non entra, invece di "toglierlo dopo": ricordarsi di togliere è esattamente la
cosa che prima o poi fallisce.

Conseguenza pratica: non essendo su GitHub, **Vercel non lo vede mai** e il sito pubblicato non
può contenerlo. In più lo script `postbuild` cancella la cartella anche dal sito costruito in
locale, così non può sfuggire nemmeno pubblicando a mano.

Vale sempre la distinzione di fondo: **le posizioni sono fatti e si leggono ovunque, il disegno
appartiene a chi l'ha fatto.** Noi prendiamo le prime e non ridistribuiamo il secondo.

## Il mondo si avvolge

La Grand Line circonda il globo: sulla mappa piatta il bordo destro (x = 10000) e il bordo
sinistro (x = 0) sono lo stesso meridiano.

Il motore di disegno deve gestirlo dal principio:

- una rotta che esce da un bordo rientra dall'altro
- il pan orizzontale è continuo, senza fermarsi ai bordi
- il percorso più breve tra due punti può passare per il bordo

Aggiungere questo comportamento dopo è molto costoso. Va previsto subito.

## Il tempo: unità canonica

**L'unità interna è il capitolo del manga.** Sempre. Ovunque.

Volumi ed episodi sono solo *viste* su quella scala, tradotte da due tabelle di conversione. Non
esistono campi "volume" o "episodio" sulle entità: esiste solo `rivelatoAlCapitolo`.

L'utente può esprimersi come preferisce ("sono al volume 62", "sono all'episodio 500");
l'interfaccia converte, il motore lavora sempre in capitoli.

## Stato nell'URL

Lingua, progresso, filtri attivi e luogo selezionato vivono nella query string:

```
/it/?progresso=v62&luogo=water-seven&ciurma=cappello-di-paglia
```

Così ogni configurazione è un link condivisibile e il tasto "indietro" del browser funziona.

## Struttura delle cartelle

```
/data              JSON strutturali, neutri rispetto alla lingua
  luoghi.json
  rotte.json
  personaggi.json
  ciurme.json
  archi.json
  volumi.json      tabella volume → capitoli
  episodi.json     tabella episodio → capitoli

/content           solo testi, una cartella per lingua
  /it
    luoghi.json    nomi e descrizioni
    personaggi.json
    ui.json        stringhe dell'interfaccia
  /en  /fr  /de  /es  /ja

/public
  /mappa           sfondo
  /copertine       miniature + versioni grandi
  /luoghi          immagini dei luoghi
  /avatar          ritratti personaggi

/src
  /app             pagine Next.js
  /components      Mappa, BarraVolumi, SchedaLuogo, Timeline, Filtri
  /lib             conversioni capitolo↔volume↔episodio, filtro spoiler, geometria

/docs              questi documenti
CLAUDE.md          memoria condivisa con Claude Code
```

## Regole tecniche non negoziabili

1. **Coordinate in spazio-mappa astratto**, mai in pixel
2. **Tutto in capitoli**, mai volumi o episodi nei dati delle entità
3. **Testi separati dalla struttura**, sempre
4. **Immagini in WebP**, copertine in due misure (miniatura ~40 KB + versione grande)
5. **Sito completamente statico** — mai introdurre dipendenze da un server
6. **Font ospitati localmente**, mai richiamati da CDN esterni
7. **Nessun cookie, nessun tracciamento** — così non serve alcun banner
8. **Responsive di base fin da subito** — desktop è la priorità, ma il telefono non deve
   diventare impossibile

## Prestazioni

- Caricare solo la lingua attiva, non tutte
- Le descrizioni lunghe si caricano su richiesta, non all'avvio
- La barra delle copertine usa il caricamento differito delle immagini
- Lo strato SVG disegna solo ciò che è visibile e non filtrato
