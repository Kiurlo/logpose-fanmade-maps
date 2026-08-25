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
