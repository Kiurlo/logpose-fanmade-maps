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

Il seme dell'avventura (Isola Dawn, Villaggio di Foosha) sta nell'**East Blue**: quadrante
in alto a destra. Mettere per sbaglio un luogo dell'East Blue in basso a sinistra è l'errore
tipico — controllare sempre il quadrante prima di scrivere una coordinata.

## La disposizione dello schermo

```
┌──────────┬──────────────────────────────┬──────────┐
│ SINISTRA │        [Info · Lingua] ──────┼──┐       │
│  180 px  │                              │  │DESTRA │
│  fissa   │         AREA MAPPA           │  │~220px │
│          │   (la scheda galleggia qui)  │  │ rotte │
│ copertine│                              │  │ciurme │
│  volumi  │                              │  │person.│
│          │                              │  │       │
│disclaimer│                              │  │       │
├──────────┴──────────────────────────────┴──┴───────┤
│      TIMELINE — a che punto della storia sei       │
└────────────────────────────────────────────────────┘
   ✅ fatta        ✅ fatta          ⬜ da fare    ⬜ da fare
```

**Le fasce e il perché di ciascuna:**

| Fascia | Cosa ci va | Da dove viene |
|---|---|---|
| **Sinistra**, 180 px | copertine dei volumi, poi altri filtri; oggi nome e disclaimer | concept #3 |
| **Destra**, ~220 px | scelta delle rotte da mostrare: per personaggio, ciurma, altro | concept #2 e #5 |
| **In basso**, tutta larghezza | timeline e progresso no-spoiler | concept #4 |
| **Area mappa** | ciò che resta | concept #1 |

La timeline sta **sotto tutto e a tutta larghezza** perché il progresso no-spoiler governa ogni
altra cosa: quali copertine mostrare, quali rotte esistono, quali luoghi compaiono. Comanda su
tutto, quindi sta sotto tutto.

**Scegliere le rotte è filtrare per personaggio.** Il "selettore delle rotte" e i "filtri per
ciurma e personaggio" del concept sono lo stesso pannello, non due: sta nella fascia destra.

### Cosa ruba spazio e cosa galleggia

Distinzione importante, perché non tutti gli elementi vanno riservati:

- **Rubano spazio** (restringono la mappa): le tre fasce qui sopra
- **Galleggiano** sopra la mappa, senza cambiare la geometria: la **scheda del luogo** e il
  **menu Info/Lingua** in alto a destra. Due o tre voci non meritano una fascia propria

Tutto ciò che galleggia sta **dentro l'area mappa**, mai sopra le fasce laterali. È per questo
che la regola "la scheda si apre dal lato opposto al luogo" continua a funzionare senza
eccezioni anche quando le fasce ci saranno tutte.

### Le fasce vuote non si costruiscono

La fascia sinistra è stata fatta subito perché **portava contenuto vero** (nome del progetto e
disclaimer obbligatorio). Le altre due si costruiranno quando avranno qualcosa dentro: riquadri
vuoti con scritto "prossimamente" farebbero sembrare il sito un cantiere.

Non è un rinvio rischioso, perché **il lavoro caro è già stato fatto**: la struttura è
"l'area mappa è ciò che resta", quindi aggiungere una fascia riposiziona tutto da solo, e la
lettura delle coordinate si aggiusta da sé (usa `getScreenCTM`, non calcoli sulla finestra).
In `page.tsx` i posti sono già indicati come commenti.

**La mappa non è larga quanto la finestra.** È la regola da tenere a mente: la colonna di
sinistra è riservata alla barra delle copertine (vedi `00-CONCEPT.md`) e ai filtri, e la mappa
occupa soltanto lo spazio rimanente.

Lo spazio è stato riservato **prima** di costruire la barra, di proposito. Tutto ciò che si
aggancia a un bordo — la scheda del luogo, il pannello di mappatura — si posiziona rispetto
all'area mappa, non allo schermo. Introdurre la colonna dopo avrebbe voluto dire rivedere ogni
posizionamento già dato per buono, e ricontrollare la lettura delle coordinate.

Su schermo piccolo la barra sparisce e la mappa riprende tutta la larghezza: il telefono non ha
spazio da regalare a una colonna fissa.

**Nota tecnica:** la lettura delle coordinate in modalità mappatura non risente della larghezza
dell'area mappa, perché converte le posizioni usando la matrice di trasformazione dell'SVG
(`getScreenCTM`) invece di calcoli fatti a mano sulle dimensioni della finestra. Verificato dopo
l'introduzione della barra: il punto noto `7500` continua a leggersi `7500`.

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

### Ricalco automatico dei contorni

Tracciare a mano va bene per un'isola, non per quattrocento. Per questo esiste
`scripts/traccia-isole.mjs`: legge la mappa di riferimento e ricava da solo il contorno delle
isole, scrivendolo in `data/luoghi.json` come un normale `forma: { tipo: "path" }`.

```
node scripts/traccia-isole.mjs                  prova senza scrivere niente
node scripts/traccia-isole.mjs --scrivi         aggiorna i dati
node scripts/traccia-isole.mjs --scrivi id1 id2 solo alcuni luoghi
```

**Come fa.** Non riconosce le isole "a vista": sfrutta un fatto della mappa in uso, cioè che
**ogni isola è cerchiata da una linea scura**. I passaggi sono quattro:

1. si parte dal centro del luogo, cioè dalla coordinata già presente nei dati
2. si riempie a macchia d'olio finché non si incontra la linea scura, che fa da muro
3. si tappano i buchi lasciati dalle scritte disegnate sopra l'isola
4. si segue il bordo pixel per pixel, si tiene un punto ogni tanto, e si uniscono con la
   **stessa curva morbida** delle forme generate

Il risultato viene poi convertito nello spazio-mappa astratto e reso **relativo al centro**,
come vuole lo schema dati. Lo script aggiorna anche `coordinate` (al centro reale dell'isola,
che spesso non è dove l'avevamo messa a occhio) e `dimensione`, che serve solo a posizionare
l'etichetta sotto l'isola.

**Fallisce in modo onesto.** Dove non c'è un'isola disegnata, lo dice e non scrive niente — il
luogo resta con la sua forma generata. È il caso di Shells Town, che sulla mappa in uso non
compare, e del Baratie, che è un ristorante-nave disegnato e non una terra emersa.

**I limiti, che vanno conosciuti:**

- funziona solo dove il contorno è **chiuso**; se la linea ha un'interruzione il riempimento
  scappa nel mare aperto, e lo script se ne accorge dall'area enorme e rinuncia
- l'immagine di riferimento è **stirata** in orizzontale per allinearsi al nostro spazio-mappa
  (l'allineamento è quello misurato in `MappaPagina.tsx`): i contorni ereditano la stessa
  deformazione, ed è giusto così, altrimenti non combacerebbero con le posizioni
- di un arcipelago ricalca **l'isola sotto il centro indicato**, non tutte le isolette
- se un fiume o una baia dividono un'isola in due lobi separati (è il caso del Regno di
  Arabasta, tagliato in due dal fiume Sandora), un solo punto di partenza riempie solo un lobo.
  Lo script accetta punti di partenza aggiuntivi per unirli (`ricalca(luogo, [[x, y]])`), oppure
  — se non serve precisione — si può tracciare solo il lobo più grande, come approssimazione

**Il confine da non passare.** Vale la stessa regola delle posizioni: quello che esce è un
elenco di punti, non un'immagine, e nessun pixel della mappa altrui entra nel progetto o viene
ripubblicato. Però ricalcare *tutte* le isole da un'unica mappa amatoriale assomiglia più a una
copia che leggere una posizione. Perciò: i contorni così ottenuti restano `precisione:
"stimata"`, la fonte resta citata in `03-STATO.md`, e quando la costa vera di un'isola è nota
dal manga quel contorno va sostituito.

## Come si disegna la Red Line

**La Red Line non è una striscia sulla mappa: è tutto ciò che non è mare.** Questa è la terza
versione di questa sezione, e vale la pena raccontare come ci si è arrivati, perché ogni
versione precedente sembrava giusta finché non si è vista una mappa di riferimento migliore.

**Versione 1 — un rettangolo.** All'inizio la Red Line era due semplici rettangoli verticali
(Reverse Mountain al centro, la cucitura del mondo sui bordi). Un placeholder dichiarato tale.
Il problema si è visto quando Reverse Mountain — un luogo `tipo: "punto-notevole"` — è stata
disegnata *dentro* quel rettangolo: sembrava un'isola fluttuante nel mare, perché il rettangolo
non aveva nessuna forma vera.

**Versione 2 — una stella disegnata a mano.** Si è ricalcata a occhio la "stella" a quattro
bracci di Reverse Mountain da una griglia di coordinate, con il rettangolo sottile sopra e
sotto. Corretto nel dettaglio, ma Gabriele ha fatto notare due difetti guardando il sito vero:
la stella non mostrava bene i canali fra i bracci, e un tentativo di raccordo fra stella e
rettangolo (un "imbuto") diventava un enorme triangolo a piena mappa. Il problema di fondo,
capito solo dopo: si stava cercando di ricalcare la Red Line come se fosse una striscia
sottile, quando **sulla mappa di riferimento vera occupa la maggior parte del disegno.**

**Versione 3 (attuale) — l'oceano ritagliato sopra la Red Line.** Gabriele ha fornito una
seconda immagine di riferimento, `public/riferimento/mappa-red-line.jpg` (un'esportazione a
contrasto aumentato di `mappa.jpg`, fatta da lui: stesso disegno, colori più netti). Lì si vede
chiaramente che **la Red Line avvolge ogni mare su tutti i lati** — anche sopra e sotto (i
poli), non solo a destra e a sinistra come si era sempre pensato. I quattro mari sono isole
d'acqua dentro un continente unico, non il contrario.

Da questo nasce il modello attuale, molto più semplice di tutti i precedenti:

1. **Si disegna la Red Line come sfondo di tutta la mappa** (un rettangolo che copre l'intero
   spazio-mappa)
2. **Si ritaglia sopra un'unica forma d'acqua** — i quattro mari e la Grand Line, ricalcati
   insieme dalla nuova mappa di riferimento — nel colore dell'oceano
3. La Grand Line si disegna come una fascia sopra l'oceano, **ritagliata sulla stessa forma**
   (altrimenti dipingerebbe di blu anche la terra alla sua stessa altezza, fuori dai mari)

Non c'è più bisogno di ricalcare la Red Line stessa, né di preoccuparsi di raccordi: quello che
non è oceano è automaticamente Red Line, ovunque sulla mappa.

### Perché i quattro mari sono un solo ricalco (`scripts/traccia-oceano.mjs`)

North Blue, East Blue, West Blue e South Blue non sono davvero separati: intorno a Reverse
Mountain sono connessi da stretti canali (gli stessi "bracci" della vecchia stella — visti da
vicino sono varchi d'acqua, non terra). Riempiendo a partire da un punto in uno qualsiasi dei
quattro mari, il riempimento raggiunge sempre gli altri tre. Il risultato è un solo, enorme
contorno — non un difetto del metodo, è la vera forma del mondo.

Il ricalco usa lo stesso principio delle isole (riempire da un centro fino a un muro), ma con
un muro diverso: non la linea scura del disegno, bensì **il colore**. Sulla mappa a contrasto
aumentato la Red Line è arancione acceso, nettamente diversa dal beige di mare e isole insieme
— un muro molto più robusto di una linea sottile, perché non ha i piccoli buchi di compressione
JPEG che avevano reso inaffidabile il tentativo precedente.

**Un problema nuovo, specifico di questa immagine:** la cornice decorativa a scacchi intorno al
disegno ha tre toni (chiaro, scuro, panna), nessuno arancione, e il riempimento ci scappava
attraverso fino al bordo dell'immagine. Un primo tentativo trattava l'intera fascia vicino ai
bordi come muro a prescindere dal colore — sbrigativo, e sbagliato: una costa vera (vicino alla
bussola disegnata in fondo a West Blue) arriva più vicina al bordo di quanto quel margine
permettesse, e veniva tagliata via, appiattendo il contorno proprio lì. Corretto riconoscendo i
tre toni della cornice per luminosità invece che con un margine cieco: due sono troppo scuri o
troppo chiari-e-grigi per essere il beige di mare e isole.

### Un'immagine di riferimento diversa, con il proprio allineamento

`mappa-red-line.jpg` non è un ritaglio identico a `mappa.jpg`: dimensioni diverse, quindi un
allineamento diverso (`ALLINEAMENTO` dentro `traccia-oceano.mjs`). Le due immagini restano
entrambe utili: `mappa.jpg` per ricalcare le isole (la tecnica del muro-a-linea-scura ci lavora
bene), `mappa-red-line.jpg` per tutto ciò che riguarda la Red Line e l'oceano (dove serve il
muro-a-colore).

**Un punto solo non basta a misurare una scala.** La prima misura usava un solo punto ben
verificato (il varco di Reverse Mountain, su 5000,2500) e *indovinava* larghezza e altezza
(10000 e 5000 — "abbastanza grandi da coprire la mappa"). Sembrava ragionevole, ma era
sbagliato: l'altezza vera è 6123, il 22% in più. Con l'altezza troppo corta l'oceano ricalcato
risultava schiacciato verso il centro della mappa, lasciando fasce di mare vuoto vicino ai poli
e facendo cadere alcune isole già catalogate (Isola Dawn, Isole Polestar) a cavallo con la Red
Line — segnalato da Gabriele confrontando il sito pubblicato con la modalità mappatura.

**La misura corretta usa due punti, il più lontani possibile fra loro.** Il varco di Reverse
Mountain (5000,2500) e la bussola disegnata in fondo a West Blue — quest'ultima localizzata
prima su `mappa.jpg` (dove la calibrazione è verificata da tempo: cade su 3792,4380) e poi
ritrovata alla sua posizione in pixel su `mappa-red-line.jpg`. Due punti ben distanti
permettono di *calcolare* larghezza e altezza invece di indovinarle. Vale come regola generale,
non solo per questa immagine: un allineamento verificato con un punto solo va sempre
considerato provvisorio.

### Punti notevoli dentro la Red Line

Reverse Mountain non ha più bisogno di una forma propria: è semplicemente un punto sulla Red
Line di sfondo, che ora è vera terra invece di un rettangolo. Resta un luogo a sé nello schema
dati (per la sua scheda, la sua descrizione, il suo capitolo di rivelazione), disegnato con un
segnalino invece che con una forma piena — vedi più sotto, "Punti notevoli: un segnalino, non
un'isola".

### Punti notevoli: un segnalino, non un'isola

Reverse Mountain resta comunque un luogo a sé nello schema dati (serve per la sua scheda, la sua
descrizione, il suo capitolo di rivelazione). Ma un luogo `tipo: "punto-notevole"` **non si
disegna più come un'isola**: niente forma piena, solo un piccolo segnalino tondo con
l'etichetta, esattamente come un punto su una mappa stradale. La differenza sta in `Mappa.tsx`:
prima di calcolare il contorno generato o tracciato, il codice controlla il tipo del luogo, e se
è un punto notevole disegna il segnalino e si ferma lì.

Vale anche per Capo Gemello, che è contenuto in Reverse Mountain e comparirà con lo stesso
segnalino quando ci sarà lo zoom.

## Modalità mappatura — ricalcare da una mappa di riferimento

Indovinare le coordinate a occhio è faticoso e produce errori. Il metodo giusto è quello dei
cartografi: si mette sotto una mappa di riferimento, si legge dove stanno le cose, si toglie.

**Come si usa:**

1. Salvare l'immagine in `public/riferimento/mappa.jpg`, **già ritagliata** di eventuali
   cornici decorative (si fa una volta sola con un qualsiasi programma di fotoritocco)
2. Avviare il sito in locale e aprire `http://localhost:3000/?mappatura=1`
3. L'allineamento è già impostato nei valori predefiniti: non serve toccare nulla
4. Passare il puntatore: le coordinate si leggono in tempo reale. **Cliccare copia** il campo
   già pronto da incollare in `luoghi.json`
5. Finito di catalogare, si chiude la modalità. Non c'è niente da "togliere"

### L'allineamento non si fa a occhio

A occhio la mappa di riferimento sembra combaciare, ma non combacia: quella attualmente in uso
ha la Grand Line al **53,92%** dell'altezza invece del 50%, e la Red Line centrale al **48,32%**
della larghezza invece del 50%. Piccolezze all'apparenza — ma significano ogni luogo spostato di
circa 200 unità in basso e 170 a sinistra, **su tutte le schede**. Un errore sistematico, cioè il
peggiore, perché è invisibile e uniforme.

I valori predefiniti in `MappaPagina.tsx` correggono esattamente questo scarto.

**Se si cambia immagine di riferimento vanno rimisurati.** Il metodo: si analizzano i pixel
dell'immagine cercando la banda chiara orizzontale (Grand Line) e la banda verticale rossastra
(Red Line), se ne ricava la posizione in frazione di larghezza/altezza, poi si risolve:

```
Sinistra + frazioneRedLine  × Larghezza = 5000     (Red Line su x = 5000)
Alto     + frazioneGrandLine × Altezza  = 2500     (Grand Line su y = 2500)
```

scegliendo Larghezza e Altezza abbastanza grandi da coprire comunque tutta la mappa. Chiedere a
Claude di rifare la misura: è lavoro da poche righe di script.

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

### Un solo strumento di navigazione, tre modi di esprimersi

Non tutti seguono One Piece allo stesso modo: c'è chi legge il manga, chi guarda l'anime, chi è
arrivato dalla serie Netflix. Una navigazione basata solo sulle copertine dei volumi
escluderebbe due terzi del pubblico.

Quindi **un unico controllo del progresso**, con l'unità scelta dall'utente:

```
NIENTE SPOILER — dove sei arrivato?

  [ Volume ▾ ]  [ 62 ▾ ]
    Volume        → tabella volumi.json
    Episodio      → tabella episodi.json
    Netflix       → tabella netflix.json  (stagione + puntata)
    Ho letto tutto → nessun filtro
```

Qualunque scelta viene convertita in **un numero di capitolo** e da lì in poi il motore non sa
più nulla di volumi o puntate. Aggiungere un'unità nuova è **una tabella di conversione in più**,
mai una modifica all'impianto.

**La voce "Ho letto tutto" non è opzionale:** senza, chi è in pari dovrebbe selezionare l'ultimo
volume ogni volta, e chi vuole solo curiosare non saprebbe cosa scegliere.

**Le tre unità non hanno la stessa precisione.** Un volume vale ~10 capitoli, un episodio ~2, una
puntata Netflix molti di più. Con Netflix il filtro è quindi grossolano: è accettabile, ma va
detto all'utente invece di far finta che sia preciso.

**Attenzione all'edizione.** "Volume 62" non significa nulla senza sapere di quale edizione, e
le numerazioni italiane possono differire da quelle giapponesi — vale anche per l'anime.
L'interfaccia deve dichiarare l'edizione di riferimento, non lasciarla implicita.

### Il primo ingresso, e perché l'URL fa da memoria

Il progetto non usa cookie (regola 7), quindi **la scelta del progresso non può essere
ricordata** da una visita all'altra. Il problema si risolve con la regola 8: lo stato sta
nell'URL.

```
?progresso=v62      volume 62
?progresso=e500     episodio 500
?progresso=n1e8     Netflix stagione 1 puntata 8
(assente)           nessun filtro: si vede tutto
```

Impostato il progresso, **l'indirizzo diventa il segnalibro**: chi lo salva ritrova il proprio
punto a ogni ritorno, senza tracciamento e senza banner. In più è condivisibile.

**All'ingresso, senza progresso indicato, si vede tutto** — una mappa vuota sembrerebbe un sito
rotto. Ma il controllo dev'essere impossibile da ignorare e dichiarare la situazione a chiare
lettere ("stai vedendo tutta la storia"). È lo stesso principio di onestà che vale per le
posizioni incerte: il sito dice cosa sta facendo, invece di far finta.

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
