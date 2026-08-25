# Stato del progetto — diario di bordo

> **Questo documento va aggiornato alla fine di ogni sessione di lavoro.**
> È ciò che permette di riprendere dopo tre settimane di pausa senza perdere il filo.
> Se una sessione finisce senza aggiornarlo, il progetto ha perso memoria.

**Ultimo aggiornamento:** 2026-08-25

---

## A che punto siamo

**Fase attuale:** Fase 1 completata — il sito è online.

Il progetto Next.js di base è stato creato, pubblicato su GitHub
(github.com/Kiurlo/logpose-fanmade-maps) e collegato a Vercel. Il sito è raggiungibile su
**logpose-fanmade-maps.vercel.app** e mostra una pagina minima di benvenuto (nessuna mappa,
nessuna isola ancora). Da ora ogni push su GitHub pubblica automaticamente la nuova
versione su Vercel.

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

**Fase 2 — lo sfondo mappa e la prima isola cliccabile.**

Obiettivo: aggiungere lo sfondo della mappa (provvisorio) e **una sola isola cliccabile**
con la sua scheda informativa. Brutto va benissimo.

Passi:
1. Generare/preparare l'immagine di sfondo provvisoria della mappa
2. Impostare lo strato SVG sopra lo sfondo, nello spazio-mappa astratto (0–10000 x 0–5000)
3. Creare i primi file dati (`/data/luoghi.json`, `/content/it/luoghi.json`) con una sola isola
4. Rendere l'isola cliccabile e mostrare una scheda con la sua descrizione
5. Ripubblicare (basta un push su GitHub, Vercel fa il resto)

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
| Luoghi | 0 | ~400 |
| Personaggi | 0 | ~100 |
| Ciurme | 0 | ~20 |
| Rotte | 0 | ~15 |
| Volumi | 0 | ~110 |

---

## Registro delle sessioni

> Una riga per sessione. Serve a ricostruire il percorso e a capire quanto si avanza davvero.

| Data | Tipo | Cosa è stato fatto |
|---|---|---|
| 2026-08-25 | Costruzione | Creato il progetto Next.js, pubblicato su GitHub e collegato a Vercel. Sito online (vuoto). Scelto il nome "Log Pose" (repository rinominato in logpose-fanmade-maps) |

**Tipi di sessione:**
- **Costruzione** — si aggiunge una funzionalità; richiede un blocco di tempo; finisce online
- **Catalogazione** — si aggiungono dati; divisibile in ritagli di venti minuti; non può rompere nulla
- **Grafica** — aspetto e stile

---

## Problemi noti

_(nessuno, per ora)_
