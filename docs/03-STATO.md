# Stato del progetto — diario di bordo

> **Questo documento va aggiornato alla fine di ogni sessione di lavoro.**
> È ciò che permette di riprendere dopo tre settimane di pausa senza perdere il filo.
> Se una sessione finisce senza aggiornarlo, il progetto ha perso memoria.

**Ultimo aggiornamento:** 2026-08-25

---

## A che punto siamo

**Fase attuale:** Fase 2 completata — prima isola cliccabile online.

Il sito (**logpose-fanmade-maps.vercel.app**) mostra ora una mappa vera: uno sfondo oceano
a tutto schermo e un'isola cliccabile, il Villaggio di Fuschia. Cliccandola si apre una
scheda con nome, descrizione e capitolo di prima apparizione. La selezione resta
nell'indirizzo del sito (`?luogo=foosha-village`), quindi è un link condivisibile.

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

Il nome del progetto è **Log Pose** (dal dispositivo di navigazione della serie): scelto
apposta per non usare "One Piece" o "Cappello di Paglia" nel nome pubblico, restando comunque
riconoscibile per chi conosce l'opera.

---

## Fatto

- [x] Concept e funzionalità definiti
- [x] Architettura scelta
- [x] Schema dati progettato
- [x] Documenti di base creati

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
| Edizione italiana dei volumi | Da definire prima di catalogare i volumi |
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

**La scheda copre l'angolo in alto a destra della mappa.**
Si apre a destra e nasconde proprio l'East Blue. Fastidio minore adesso con due luoghi, da
risolvere quando ci sarà lo zoom (allora la mappa potrà spostarsi per lasciare spazio).

**Il sito online non è verificabile in automatico da Claude.**
Vercel protegge il sito con un controllo anti-bot ("Security Checkpoint") che blocca il browser
automatico e `curl`. In locale Claude verifica tutto da solo; **per il sito pubblicato serve
che sia una persona a guardarlo e confermare.**
