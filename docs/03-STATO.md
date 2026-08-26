# Stato del progetto — diario di bordo

> **Questo documento va aggiornato alla fine di ogni sessione di lavoro.**
> È ciò che permette di riprendere dopo tre settimane di pausa senza perdere il filo.
> Se una sessione finisce senza aggiornarlo, il progetto ha perso memoria.

**Ultimo aggiornamento:** 2026-08-25

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
non glielo si dice): l'immagine di riferimento in `public/riferimento/mappa.jpg`.

---

## A che punto siamo

**Fase attuale:** Fase 2 completata — prima isola cliccabile online.

Il sito (**logpose-fanmade-maps.vercel.app**) mostra ora una mappa vera: uno sfondo oceano
a tutto schermo e un'isola cliccabile, l'Isola Dawn. Cliccandola si apre una scheda con nome,
descrizione e capitolo di prima apparizione. La selezione resta nell'indirizzo del sito
(`?luogo=dawn-island`), quindi è un link condivisibile.

Il sito è configurato come **completamente statico** (nessun server, come da regola non
negoziabile): Next.js genera solo file HTML/CSS/JS fissi.

Sulla mappa sono ora visibili i riferimenti geografici — Grand Line, Red Line e i nomi dei
quattro mari — così si vede a colpo d'occhio se un luogo è nel quadrante giusto.

I luoghi possono **stare dentro altri luoghi** (`contenutoIn`): sulla mappa compare l'Isola
Dawn, e dalla sua scheda si raggiunge il Villaggio di Foosha, e viceversa. Catalogati due
luoghi.

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

**Strumenti di lavoro**
- [x] Modalità mappatura (`?mappatura=1`) per leggere le coordinate dal riferimento
- [x] Allineamento del riferimento misurato, non a occhio

**Deciso ma non ancora costruito**
- [ ] Controllo unico del progresso (Volume / Episodio / Netflix / Ho letto tutto)
- [ ] Fascia destra per i filtri delle rotte
- [ ] Menu Info / Lingua

---

## Prossimo passo

**Fase 3 — proposta: qualche isola in più, poi lo zoom.**

1. Qualche isola in più dell'East Blue (le prime dell'avventura). Ognuna nasce già con la
   sua forma: basta scrivere le cinque righe di JSON
2. La prima rotta della ciurma di Cappello di Paglia fra quelle isole
3. Lo zoom sulla mappa — è ciò che farà comparire i luoghi contenuti (villaggi, città) e che
   permetterà di apprezzare i contorni delle isole, oggi grandi pochi pixel

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
| Luoghi | 2 | ~400 |
| Personaggi | 0 | ~100 |
| Ciurme | 0 | ~20 |
| Rotte | 0 | ~15 |
| Volumi | 0 | ~110 |

---

## Registro delle sessioni

> Una riga per sessione. Serve a ricostruire il percorso e a capire quanto si avanza davvero.

| Data | Tipo | Cosa è stato fatto |
|---|---|---|
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

**Il sito online si verifica solo a metà in automatico.**
Il browser automatico di Claude non riesce a visualizzare il sito pubblicato (a volte Vercel
risponde con un controllo anti-bot). Claude può però **leggere il sito con `curl` e cercare i
dati dentro il codice pubblicato**, quindi può confermare che una modifica sia davvero online.
Per *guardare* il sito con gli occhi serve una persona.
