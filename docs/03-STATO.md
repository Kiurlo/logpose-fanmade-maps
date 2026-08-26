# Stato del progetto — diario di bordo

> **Questo documento va aggiornato alla fine di ogni sessione di lavoro.**
> È ciò che permette di riprendere dopo tre settimane di pausa senza perdere il filo.
> Se una sessione finisce senza aggiornarlo, il progetto ha perso memoria.

**Ultimo aggiornamento:** 2026-08-26

---

## Come riprendere in una chat nuova

Conviene aprire una chat nuova per ogni sessione di lavoro: le chat lunghe rimandano ogni volta
tutta la conversazione precedente e diventano costose. Questo diario serve proprio a rendere la
cosa indolore.

**Da incollare all'inizio della nuova chat:**

> Riprendiamo il progetto Log Pose (mappa interattiva di One Piece).
> Leggi `CLAUDE.md` e tutti i documenti in `/docs`, in particolare `03-STATO.md`.
> Poi dimmi con parole tue a che punto siamo e qual è il prossimo passo, prima di toccare
> qualsiasi cosa.
>
> Ricorda: non sono uno sviluppatore. Spiegami in italiano semplice cosa stai per fare, e le
> operazioni tecniche falle tu invece di chiedermi di eseguire comandi.

Se la sessione riguarda la catalogazione, aggiungere: *"Oggi voglio posizionare altri luoghi con
la modalità mappatura."*

**Cosa vive solo su questo computer** (non è su GitHub, quindi una chat nuova non lo sa finché
non glielo si dice): le immagini di riferimento in `public/riferimento/` —
`mappa.jpg` (l'originale, per ricalcare le isole) e `mappa-red-line.jpg` (la stessa mappa a
contrasto aumentato, preparata da Gabriele, usata per ricalcare l'oceano e la Red Line).

---

## Lavorare da due computer

Il progetto si porta avanti da due postazioni: un PC Windows e un MacBook Pro. La domanda
"come faccio a ritrovare le cartelle sull'altro computer?" ha una risposta sola: **GitHub**.
Non serve Google Drive, e anzi sarebbe dannoso.

**Il progetto vero pesa meno di un megabyte** — codice, dati, documenti. Tutto il resto che si
vede nella cartella (`node_modules`, 461 MB; `.next` e `out`, 114 MB) è materiale che il
computer si **rigenera da solo** e che non va su GitHub apposta.

**La regola d'oro:**

> Prima di alzarsi dalla scrivania → si salva su GitHub.
> Prima di iniziare a lavorare → si scarica da GitHub.

Non serve saperlo fare: basta dirlo a Claude a inizio e fine sessione. Se si salta il passaggio
e si lavora sulla stessa cosa da entrambi i computer, Git non perde niente ma chiede di
scegliere quale versione tenere — ed è un momento antipatico che l'abitudine evita.

**Le uniche cose che non viaggiano da sole** sono i file dentro `public/riferimento/`
(`mappa.jpg` e `mappa-red-line.jpg`), esclusi da Git di proposito perché sono il disegno di
qualcun altro. Vanno copiati a mano, con una chiavetta o via Drive.

**Perché non sincronizzare l'intera cartella con Google Drive:**

1. `node_modules` sono decine di migliaia di file minuscoli: Drive ci mette un'eternità e
   spesso si incarta a metà
2. la cartella `.git` è un piccolo database; se Drive la sincronizza mentre Git ci sta
   scrivendo, si corrompe e la cronologia del progetto è compromessa
3. Drive non sa unire due versioni: crea `luoghi (1).json` accanto a `luoghi.json` e non si
   capisce più quale sia buono. Git invece sa unire, ed è esattamente il motivo per cui esiste

Il consumo di token non c'entra: Claude legge i file dal disco locale e non gli importa dove
sia quel disco. A far consumare è una chat lunga, ed è per questo che esiste questo diario.

**Per preparare il Mac la prima volta** basta chiedere a Claude di scaricare
`https://github.com/Kiurlo/logpose-fanmade-maps`, installare le dipendenze e verificare che il
sito parta in locale; poi ci si copia dentro `mappa.jpg`.

---

## A che punto siamo

**Fase attuale:** Fase 3 in corso — dall'East Blue si entra nella Grand Line.

Il sito (**logpose-fanmade-maps.vercel.app**) mostra ora una mappa vera: uno sfondo oceano
a tutto schermo e otto luoghi cliccabili. Cliccandone uno si apre una scheda con nome,
descrizione e capitolo di prima apparizione. La selezione resta nell'indirizzo del sito
(`?luogo=dawn-island`), quindi è un link condivisibile.

**La Red Line, dopo quattro tentativi nella stessa giornata, ora è quella vera.** È la storia
più lunga di questo diario, e vale la pena raccontarla per intero perché ogni tentativo
sbagliato ha insegnato qualcosa di vero sul disegno di riferimento, non solo sul codice.

**Il problema di partenza:** Reverse Mountain era disegnata come un'isola in mezzo al mare,
mentre è il punto in cui la Red Line viene attraversata dalla Grand Line. Segnalato da Gabriele.

**Tentativo 1 — un rettangolo, poi una stella ricalcata a mano.** Prima corretto con un
rettangolo placeholder (insufficiente: Reverse Mountain sembrava ancora fluttuare). Poi
ricalcata a mano, come l'Isola Dawn, la "stella" a quattro bracci di Reverse Mountain da una
griglia di coordinate. Gabriele ha guardato il sito vero e ha fatto notare due difetti: la
strozzatura non si vedeva bene e mancavano i canali, e la forma finiva sopra alcune isole
vicine.

**Tentativo 2 — ricalco automatico per colore, poi per riempimento.** Un primo script leggeva
la rifinitura rossastra lungo il bordo come segno di riconoscimento — ma quella stessa
rifinitura la usano anche le isole vicine (Isola Cozia, Isola Polestar, Spider Miles...) per il
proprio bordo, quindi la Red Line finiva per inglobarle. Un secondo script, con un riempimento
automatico come le isole (fino alla linea scura), ha rivelato un problema del disegno stesso:
piccoli buchi lasciati dalla compressione JPEG nei tratti sottili, che fanno scappare il
riempimento nel mare aperto — e nessuna sfocatura correttiva chiude quei buchi senza saldare
anche le isole vicine, disegnate a un pelo dalla costa su questa mappa.

**Tentativo 3 — la stella a mano, di nuovo, con un raccordo.** Tornati al ricalco a mano (unico
metodo affidabile con l'immagine disponibile allora), con un imbuto per raccordare la stella al
resto della Red Line (un rettangolo). L'imbuto, su un tratto di quasi duemila unità, diventava
un **triangolo enorme che dominava tutto il quadrante nord**. Segnalato da Gabriele guardando il
sito vero ("amico, non ti offendere, ma è venuta una schifezza"). Corretto fermando il
rettangolo dentro il corpo della stella, senza raccordo — ma restava un problema di fondo:
si stava trattando la Red Line come una striscia sottile, quando non lo è.

**Tentativo 4 (quello buono) — capire che la Red Line è tutto ciò che non è mare.** Gabriele ha
fornito una seconda immagine di riferimento (`mappa-red-line.jpg`, un'esportazione a contrasto
aumentato fatta da lui) e ha chiesto ipotesi prima di toccare altro. Lì si vede con chiarezza
che **la Red Line avvolge ogni mare su tutti i lati**, anche sopra e sotto (i poli) — non solo
una striscia verticale come si era sempre creduto. Cambiato il modello alla radice: la Red Line
si disegna come sfondo di **tutta** la mappa, e sopra si ritaglia un'unica grande forma
d'acqua — i quattro mari e la Grand Line, che si sono rivelati **tutti connessi** intorno a
Reverse Mountain da stretti canali. Un solo ricalco (`scripts/traccia-oceano.mjs`), usando il
colore (ora nettamente distinto) come muro invece della linea scura. Dettagli e i quattro
tentativi per esteso in `01-ARCHITETTURA.md`, "Come si disegna la Red Line".

**Lezioni per la prossima volta:**
- Un rettangolo di controllo visto da vicino non basta: va sempre controllato anche l'aspetto
  **a piena mappa**, perché una forma ragionevole in un dettaglio può diventare enorme e
  assurda in scala
- Quando un problema resiste a più tentativi di correzione, vale la pena chiedersi se il
  modello di fondo è sbagliato, invece di continuare a rifinire lo stesso approccio
- Una seconda immagine di riferimento con più contrasto ha risolto in un colpo solo tre
  sessioni di tentativi falliti: vale la pena chiederla prima, non dopo

Introdotto anche un modo diverso di disegnare i "punti notevoli" (Reverse Mountain, Capo
Gemello...): un segnalino, non una forma piena, dato che ora sono semplicemente punti dentro la
Red Line di sfondo.

**Si è entrati nella Grand Line Paradise.** Dopo l'East Blue, dodici luoghi nuovi coprono
i capitoli 100-190 circa: Reverse Mountain e Capo Gemello (il confine, dove la balena Laboon
aspetta), Whisky Peak, Little Garden, il Regno di Drum (futuro Regno di Sakura, con la sua
capitale Big Horn) e il Regno di Arabasta con le sue prime città (Nanohana, Erumalu, Yuba,
Rainbase, Alubarna).

**Una scoperta importante, che vale per tutte le prossime centinaia di luoghi:** la mappa
fan-made usata come riferimento non è tutta ugualmente affidabile. Molte delle isole disegnate
nel quadrante East Blue (Isola Yotsuba, Isola Sixis, Weatheria e altre) non vengono mai
nominate nella storia: sono materiale collaterale (SBS, Vivre Card), non capitoli del manga.
Una prova: Weatheria è disegnata dentro l'East Blue, ma nella storia si trova nel Nuovo Mondo,
dall'altra parte del mondo. **Regola adottata:** si cataloga solo ciò che ha un capitolo di
rivelazione verificabile nella storia vera; il resto si rimanda, non si inventa un capitolo.
Per questo blocco i numeri di capitolo sono stati controllati con una ricerca esterna invece
che a memoria (Reverse Mountain cap. 101, Whisky Peak cap. 106, Little Garden cap. 114, Drum
cap. 130-154, Nanohana cap. 155 — fonte: One Piece Wiki). I capitoli delle città interne ad
Arabasta (Yuba, Erumalu, Rainbase, Alubarna) restano stime più larghe, dichiaratamente meno
precise.

**Lo strumento di ricalco ora sa unire due lobi.** Il Regno di Arabasta è disegnato sulla mappa
di riferimento diviso in due dal corso di un fiume: `traccia-isole.mjs` ora accetta punti di
partenza aggiuntivi per riempire entrambi i lobi come un solo luogo (anche se per Arabasta si è
comunque scelto di tracciare un solo lobo, il più grande, come approssimazione onesta).

**Le isole hanno la forma vera.** Esiste ora `scripts/traccia-isole.mjs`, che ricava da solo
il contorno delle isole dalla mappa di riferimento: riempie l'isola partendo dal centro, si
ferma alla linea scura che la cerchia, ne segue il bordo. Sei isole dell'East Blue sono state
ricalcate così, e con loro sono arrivate anche le **proporzioni giuste** — prima erano tutte
grandi più o meno uguali. Il procedimento e i suoi limiti sono in `01-ARCHITETTURA.md`.

**L'East Blue non è più deserto.** Ci sono ora otto luoghi sulla mappa e sei dentro di essi:
l'intero viaggio della ciurma dal capitolo 1 al 100 — Isola Dawn, Shells Town, Isole Organ
(con Orange Town), Isola degli Animali Strani, Isole Ghecco (con il Villaggio di Sirop),
Baratie, Arcipelago Konomi (con Cocoyashi e Arlong Park), Isole Polestar (con Loguetown).
Tutti `precisione: "stimata"`, tutti con forma generata dal nome.

Il sito è configurato come **completamente statico** (nessun server, come da regola non
negoziabile): Next.js genera solo file HTML/CSS/JS fissi.

Sulla mappa sono ora visibili i riferimenti geografici — Grand Line, Red Line e i nomi dei
quattro mari — così si vede a colpo d'occhio se un luogo è nel quadrante giusto.

I luoghi possono **stare dentro altri luoghi** (`contenutoIn`): sulla mappa compare l'Isola
Dawn, e dalla sua scheda si raggiunge il Villaggio di Foosha, e viceversa. Vale ora per sei
luoghi contenuti, che compariranno sulla mappa solo quando ci sarà lo zoom.

**Le isole non sono più cerchietti:** `forma: { tipo: "generata" }` è implementato
(`src/lib/forme.ts`). Il codice ricava dal nome dell'isola un contorno irregolare e stabile
nel tempo. Ogni isola aggiunta d'ora in poi nasce già con la sua forma, senza lavoro extra.
Per vedere come funziona: aprire `docs/forme-isole.html` con un doppio clic.

**La disposizione dello schermo è decisa** (vedi lo schema in `01-ARCHITETTURA.md`): fascia
sinistra per le copertine, fascia destra per i filtri delle rotte, fascia in basso a tutta
larghezza per la timeline, e ciò che resta è l'area mappa. Scheda del luogo e menu Info/Lingua
**galleggiano** dentro l'area mappa senza rubarle spazio. Solo la fascia sinistra è costruita:
le altre si faranno quando avranno contenuto, e i posti sono già segnati in `page.tsx`.

**C'è una colonna fissa a sinistra (180 px)**, che oggi contiene solo il nome del progetto e il
disclaimer sul copyright, ma serve soprattutto a **riservare lo spazio** per la barra delle
copertine e i filtri. Conseguenza: la mappa non è larga quanto la finestra, e tutto ciò che si
aggancia ai bordi si posiziona rispetto all'area mappa. Vedi `01-ARCHITETTURA.md`.

**La scheda si apre dal lato opposto al luogo**: se il luogo è nella metà destra della mappa la
scheda compare a sinistra, e viceversa. Così il luogo selezionato resta sempre scoperto senza
dover calcolare nulla sull'altezza — con la scheda agganciata a un lato, la posizione verticale
del luogo semplicemente non conta. Su telefono la scheda occupa tutto lo schermo, come prima.

**C'è una modalità mappatura** (`?mappatura=1`, solo in locale): mostra sotto la mappa
un'immagine di riferimento da ricalcare e legge le coordinate al clic. È lo strumento con cui
si catalogheranno le prossime centinaia di luoghi senza andare a occhio. Vedi
`01-ARCHITETTURA.md`; l'immagine va messa in `public/riferimento/`, che è escluso da Git.

**L'Isola Dawn ha una forma scelta da noi** (`tipo: "path"`): ricalcata da un'immagine di
riferimento fornita da Gabriele. È la prova che entrambi i meccanismi funzionano e che passare
dall'uno all'altro tocca solo i dati. Il procedimento è descritto in `01-ARCHITETTURA.md`.

Il nome del progetto è **Log Pose** (dal dispositivo di navigazione della serie): scelto
apposta per non usare "One Piece" o "Cappello di Paglia" nel nome pubblico, restando comunque
riconoscibile per chi conosce l'opera.

---

## Fatto

**Impostazione**
- [x] Concept, architettura, schema dati, documenti di base
- [x] Progetto Next.js creato, su GitHub, pubblicato in automatico da Vercel
- [x] Nome deciso: Log Pose

**Il sito**
- [x] Mappa a tutto schermo con Grand Line, Red Line e i quattro mari
- [x] Punti di ancoraggio dello spazio-mappa fissati
- [x] Luoghi cliccabili con scheda; selezione salvata nell'URL
- [x] Luoghi annidati (`contenutoIn`): un'isola contiene un villaggio
- [x] Forme delle isole: generate dal nome, oppure ricalcate a mano
- [x] Colonna sinistra con nome del progetto e disclaimer
- [x] Disposizione completa dello schermo decisa
- [x] East Blue popolato: le tappe del viaggio dal capitolo 1 al 100
- [x] Ricalco automatico dei contorni delle isole dalla mappa di riferimento
- [x] Primo tratto della Grand Line Paradise: Reverse Mountain -> Arabasta

**Strumenti di lavoro**
- [x] Modalità mappatura (`?mappatura=1`) per leggere le coordinate dal riferimento
- [x] Allineamento del riferimento misurato, non a occhio

**Deciso ma non ancora costruito**
- [ ] Controllo unico del progresso (Volume / Episodio / Netflix / Ho letto tutto)
- [ ] Fascia destra per i filtri delle rotte
- [ ] Menu Info / Lingua

---

## Prossimo passo

**La prima rotta della ciurma di Cappello di Paglia.**

Ora la rotta ha dove passare, dall'Isola Dawn fino ad Alubarna. Serve creare `/data/rotte.json`,
`/data/ciurme.json` e il codice che disegna il tratto fra due tappe.

**Poi, in ordine:**

1. Continuare la Grand Line Paradise a blocchi (dopo Arabasta: Jaya, Skypiea, Long Ring Long
   Land, Water Seven, Enies Lobby...), controllando sempre i capitoli con una fonte esterna
2. Lo zoom sulla mappa — è ciò che farà comparire i luoghi contenuti (villaggi, città) e che
   permetterà di apprezzare i contorni delle isole, oggi grandi pochi pixel
3. Il controllo unico del progresso (Volume / Episodio / Netflix / Ho letto tutto), che però
   resta bloccato finché non si decide l'edizione di riferimento

---

## Decisioni ancora aperte

| Tema | Nota |
|---|---|
| **Edizione di riferimento (volumi e anime)** | Ora **urgente**: il menù del progresso deve dichiarare all'utente di quale edizione parla. Vale sia per i volumi italiani sia per la numerazione degli episodi |
| ~~Copertine e timeline si sovrappongono?~~ | **Risolto**: un unico strumento di navigazione, con l'unità scelta dall'utente (Volume / Episodio / Netflix / Ho letto tutto). Vedi `01-ARCHITETTURA.md`. Resta da decidere se la barra copertine sopravvive come vista aggiuntiva o sparisce |
| Netflix: fin dove arriva | Serve stabilire quali capitoli copre ogni puntata, e aggiornare la tabella quando escono nuove stagioni |
| Sfondo mappa | Provvisorio (oceano + Grand Line + Red Line disegnati da codice). Da migliorare in una sessione di tipo "Grafica" |
| Fonte per le posizioni | Si usa una mappa fan-made come riferimento (vedi sotto). Serve una fonte più autorevole per marcare i luoghi come `canonica` invece che `stimata` |
| Nome del progetto | Deciso: "Log Pose" (repository/URL: logpose-fanmade-maps) |
| Multilingua | Struttura pronta, ma si lavora **solo in italiano** finché il nucleo non è solido. La lingua si sceglie in un unico file (`src/lib/contenuti.ts`): aggiungerne una non richiede di riprogettare nulla. Non creare cartelle-lingua vuote: sembrano fatte e non lo sono |
| Dominio | Rimandato di proposito |

---

## Catalogazione

| Categoria | Fatti | Stimati totali |
|---|---|---|
| Luoghi | 26 | ~400 |
| Personaggi | 0 | ~100 |
| Ciurme | 0 | ~20 |
| Rotte | 0 | ~15 |
| Volumi | 0 | ~110 |

---

## Registro delle sessioni

> Una riga per sessione. Serve a ricostruire il percorso e a capire quanto si avanza davvero.

| Data | Tipo | Cosa è stato fatto |
|---|---|---|
| 2026-08-26 | Catalogazione | Popolato l'East Blue: 12 luoghi nuovi (8 sulla mappa, 4 contenuti dentro altri), cioè tutte le tappe del viaggio dal capitolo 1 al 100. Le posizioni **non sono state lette a mano**: Claude ha ritagliato la mappa di riferimento con `sharp`, letto i nomi e convertito i pixel in coordinate con la stessa matematica della modalità mappatura. Controprova: l'Isola Dawn, posizionata a mano da Gabriele a 9440/315, il calcolo la ritrova a 9419/321 |
| 2026-08-26 | Costruzione | Aggiunto `scripts/traccia-isole.mjs`: ricalca da solo il contorno delle isole dalla mappa di riferimento, sfruttando la linea scura che le cerchia come muro di un riempimento. Richiesta di Gabriele, che aveva notato quanto le forme generate fossero diverse dal riferimento. Ricalcate sei isole dell'East Blue; **sostituito anche il contorno dell'Isola Dawn**, che era stato tracciato a mano da un'altra immagine ed era sproporzionato rispetto alle vicine. Baratie e Shells Town restano con la forma generata, perché sulla mappa non sono terre emerse |
| 2026-08-26 | Costruzione | Aggiunto il primo tratto della Grand Line Paradise (dodici luoghi, capitoli 100-190 circa): Reverse Mountain, Capo Gemello, Whisky Peak, Little Garden, Regno di Drum con Big Horn, Regno di Arabasta con Nanohana/Erumalu/Yuba/Rainbase/Alubarna. Scoperto durante il lavoro che gran parte delle isole "extra" disegnate sulla mappa di riferimento non sono canone del manga ma materiale collaterale (SBS/Vivre Card): decisione di Gabriele di scartarle e proseguire solo con luoghi verificabili nella storia. Capitoli controllati con una ricerca esterna invece che a memoria |
| 2026-08-26 | Costruzione | La Red Line, dopo quattro tentativi: rettangolo → stella a mano → ricalco automatico (per colore, poi per riempimento, entrambi scartati per problemi reali del disegno) → di nuovo stella a mano con un imbuto di raccordo (scartato perché diventava un triangolo enorme a piena mappa, segnalato da Gabriele). Il quarto tentativo ha cambiato il modello alla radice, dopo che Gabriele ha fornito una seconda immagine di riferimento a contrasto aumentato (`mappa-red-line.jpg`): la Red Line non è una striscia, avvolge ogni mare su tutti i lati. Ora si disegna come sfondo di tutta la mappa, con l'oceano (i quattro mari e la Grand Line, rivelatisi tutti connessi intorno a Reverse Mountain) ritagliato sopra in un unico ricalco (`scripts/traccia-oceano.mjs`). Introdotta anche una modalità di disegno diversa per i luoghi `tipo: "punto-notevole"` (un segnalino, non una forma piena). Racconto per esteso in questo diario e in `01-ARCHITETTURA.md` |
| 2026-08-26 | Decisione | Chiarito come lavorare da due computer (PC Windows al lavoro, MacBook a casa): si usa GitHub, non Google Drive. Domanda di Gabriele. Vedi la sezione "Lavorare da due computer" qui sopra |
| 2026-08-25 | Costruzione | Creato il progetto Next.js, pubblicato su GitHub e collegato a Vercel. Sito online (vuoto). Scelto il nome "Log Pose"; repository rinominato in logpose-fanmade-maps; progetto Vercel ricreato da zero per ottenere il link definitivo logpose-fanmade-maps.vercel.app (rinominare un progetto Vercel esistente non aggiorna da solo l'indirizzo *.vercel.app) |
| 2026-08-25 | Costruzione | Fase 2: aggiunto lo sfondo mappa (oceano) e la prima isola cliccabile (Villaggio di Fuschia) con scheda informativa. Selezione salvata nell'indirizzo del sito. Configurato Next.js in modalità completamente statica (`output: export`) |
| 2026-08-25 | Costruzione | Implementate le forme generate delle isole (`src/lib/forme.ts`): dal nome nasce un contorno irregolare, sempre identico a parità di nome. Aggiunta la pagina illustrativa `docs/forme-isole.html` |
| 2026-08-25 | Costruzione | Aggiunto lo schema per i luoghi annidati (`contenutoIn`) e il tipo `villaggio`. Aggiunta l'Isola Dawn, con il Villaggio di Foosha al suo interno; sulla mappa si disegna solo l'isola. Documentato come funzioneranno le forme delle isole. Centralizzata la scelta della lingua in `src/lib/contenuti.ts` |
| 2026-08-25 | Decisione | **Un solo strumento di navigazione** invece della sola barra copertine: l'utente sceglie l'unità (Volume / Episodio / Netflix / Ho letto tutto) e tutto viene convertito in capitoli. Idea di Gabriele, per non escludere chi segue l'anime o Netflix. Definito anche il comportamento al primo ingresso e l'URL come segnalibro al posto dei cookie. Nessun codice scritto: solo decisioni, in `01-ARCHITETTURA.md` |
| 2026-08-25 | Costruzione | Decisa e documentata la **disposizione completa dello schermo** (fasce sinistra/destra/basso + area mappa), su domanda di Gabriele. Chiarito che il selettore delle rotte e i filtri per ciurma/personaggio sono lo stesso pannello. Le fasce vuote NON sono state costruite: solo predisposti i posti in `page.tsx` |
| 2026-08-25 | Costruzione | Riservata la colonna sinistra (180 px) per la futura barra delle copertine, su indicazione di Gabriele che ha notato la collisione con la scheda. La colonna ospita intanto il nome del progetto e il **disclaimer sul copyright**, che il concept richiede e che mancava del tutto |
| 2026-08-25 | Costruzione | La scheda del luogo si apre ora dal lato opposto rispetto al luogo (metà destra -> scheda a sinistra, e viceversa), così il luogo resta sempre visibile. Risolve il problema della scheda che copriva l'East Blue |
| 2026-08-25 | Catalogazione | Prima posizione letta con la modalità mappatura: Isola Dawn spostata su 9440, 315 (rilevata da Gabriele). I contorni `path` sono ora **relativi al centro del luogo**, così spostare un luogo sposta anche il suo disegno |
| 2026-08-25 | Costruzione | Aggiunta la **modalità mappatura** (`?mappatura=1`): sfondo di riferimento allineabile e lettura delle coordinate al clic, per catalogare senza andare a occhio. Idea di Gabriele. `public/riferimento/` escluso da Git e cancellato dal sito costruito, così l'immagine altrui non può finire pubblicata |
| 2026-08-25 | Correzione | Il Villaggio di Fuschia era finito nel West Blue invece che nell'East Blue (errore segnalato da Gabriele confrontando con una mappa in rete). Corretta la coordinata e, soprattutto, **fissati i punti di ancoraggio dello spazio-mappa** in `01-ARCHITETTURA.md` perché non ricapiti. Aggiunti Grand Line, Red Line e nomi dei mari come riferimenti visibili. Creato `/content/it/ui.json` |

**Tipi di sessione:**
- **Costruzione** — si aggiunge una funzionalità; richiede un blocco di tempo; finisce online
- **Catalogazione** — si aggiungono dati; divisibile in ritagli di venti minuti; non può rompere nulla
- **Grafica** — aspetto e stile

---

## Fonti per le posizioni

Come riferimento per collocare i luoghi si usano mappe del mondo di One Piece reperibili in
rete (attualmente una mappa fan-made in italiano, firmata @Sharpsider).

**Due regole nell'usarle:**

1. **Solo le posizioni, mai il disegno.** Le posizioni geografiche sono fatti e si possono
   leggere da qualsiasi fonte; l'artwork appartiene a chi l'ha disegnato. La nostra mappa
   resta generata dal codice — nessuna immagine altrui va copiata nel progetto o pubblicata.
2. **Fan-made ≠ canonico.** Una mappa amatoriale è l'interpretazione di un fan, non una fonte
   ufficiale. Finché la posizione viene da lì, il luogo va marcato `precisione: "stimata"`.
   Questo è esattamente il principio di onestà del progetto: dichiarare ciò che non si sa.

**Attenzione ai nomi:** le mappe italiane in rete usano i nomi dell'edizione italiana
("Isola Dawn", "Regno di Arabasta"). Gli `id` devono restare basati sul nome internazionale
(`dawn-island`, `arabasta-kingdom`) — vedi la convenzione in `02-SCHEMA-DATI.md`.

---

## Problemi noti

**L'HTML pubblicato è vuoto: la mappa la disegna il browser.**
Il file `index.html` generato pesa ~7 KB e non contiene né le isole né i nomi dei mari: tutto
viene costruito da JavaScript una volta aperta la pagina. Il sito funziona normalmente per chi
lo visita, ma **i motori di ricerca e le anteprime dei link non vedono alcun contenuto**.
Causa: la lettura della selezione dall'indirizzo (`useSearchParams`) impedisce a Next.js di
pre-disegnare la pagina. Sistemabile disegnando la mappa lato build e lasciando al browser solo
la gestione del clic. Non urgente, ma da affrontare prima di far conoscere il sito in giro.

**Due etichette si sovrappongono sulla mappa.**
"Isole Organ" e "Isola degli Animali Strani" sono davvero attaccate — è così anche sulla mappa
di riferimento — e i loro nomi si accavallano. Non è un errore nei dati: è che a questa scala
tutto l'East Blue sta in un francobollo. Lo zoom risolverà da sé; se dopo lo zoom resta, si
affronta in una sessione di tipo Grafica facendo scansare le etichette fra loro.

**Il sito online si verifica solo a metà in automatico.**
Il browser automatico di Claude non riesce a visualizzare il sito pubblicato (a volte Vercel
risponde con un controllo anti-bot). Claude può però **leggere il sito con `curl` e cercare i
dati dentro il codice pubblicato**, quindi può confermare che una modifica sia davvero online.
Per *guardare* il sito con gli occhi serve una persona.

**Aggiornamento del 2026-08-26:** si è trovato un modo per vedere comunque il risultato. Il
disegno della mappa si può ricostruire fuori dal browser — stessi dati, stesse forme — e
salvare come immagine, che Claude poi guarda davvero. Serve compilare `src/lib/forme.ts` in
JavaScript e usare `sharp` (già installato con Next.js). Lo strumento vive nella cartella
temporanea, non nel progetto: è un attrezzo da rifare all'occorrenza, non codice da mantenere.
