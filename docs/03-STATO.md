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

**Fase 3 — proposta: qualche isola in più e le prime rotte.**

Idee per la prossima sessione (da confermare insieme prima di iniziare):
1. Aggiungere 3-4 isole in più dell'East Blue (le prime dell'avventura)
2. Disegnare la prima rotta della ciurma di Cappello di Paglia fra quelle isole
3. Iniziare a pensare a uno sfondo mappa meno "piatto" (ancora generato da codice, non artwork copiato)

Nota tecnica per dopo: l'attuale sfondo oceano è un semplice rettangolo colorato — va bene
come base, ma prima o poi (sessione di tipo "Grafica") si potrà rendere più simile a una mappa
vera, sempre generata da codice.

---

## Decisioni ancora aperte

| Tema | Nota |
|---|---|
| Edizione italiana dei volumi | Da definire prima di catalogare i volumi |
| Sfondo mappa | Da generare; prompt da preparare |
| Nome del progetto | Deciso: "Log Pose" (repository/URL: logpose-fanmade-maps) |
| Dominio | Rimandato di proposito |

---

## Catalogazione

| Categoria | Fatti | Stimati totali |
|---|---|---|
| Luoghi | 1 | ~400 |
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

**Tipi di sessione:**
- **Costruzione** — si aggiunge una funzionalità; richiede un blocco di tempo; finisce online
- **Catalogazione** — si aggiungono dati; divisibile in ritagli di venti minuti; non può rompere nulla
- **Grafica** — aspetto e stile

---

## Problemi noti

_(nessuno, per ora)_
