# Istruzioni per Claude Code

## Il progetto

Sito web che presenta il mondo di One Piece come una mappa navigabile nel tempo. Ogni luogo è
cliccabile, le rotte dei personaggi si tracciano sulla mappa, una barra laterale mostra le
copertine dei volumi, e un filtro no-spoiler nasconde tutto ciò che viene dopo il punto in cui
l'utente è arrivato. Multilingua, italiano come lingua principale.

Progetto amatoriale, senza scopo di lucro, di un padre e un figlio.

## Con chi stai parlando

**Non sono sviluppatori.** Questo cambia il modo in cui devi lavorare:

- Spiega in italiano semplice cosa stai per fare, prima di farlo
- Non dare per scontato alcun termine tecnico: se lo usi, spiegalo la prima volta
- Non chiedere loro di eseguire comandi che non capiscono; fallo tu e racconta il risultato
- Se qualcosa non funziona, non dire "controlla il log": guarda tu e riporta in italiano
- Proponi, non interrogare. Meglio "faccio così, ti va?" che una lista di opzioni tecniche

## Stack

Next.js (App Router) + React + TypeScript, Tailwind CSS, Zustand, next-intl.
Hosting su Vercel (piano gratuito), codice su GitHub.

**Il sito è completamente statico. Nessun backend, nessun database, nessuna API.**
Non introdurre mai dipendenze da un server.

## Regole tecniche non negoziabili

1. **Coordinate in spazio-mappa astratto** (x: 0–10000, y: 0–5000), mai in pixel
2. **L'unità di tempo è il capitolo del manga.** Volumi ed episodi sono viste tradotte da
   tabelle di conversione. Le entità hanno `rivelatoAlCapitolo`, mai un numero di volume
3. **Testi separati dalla struttura**: `/data` contiene dati neutri rispetto alla lingua,
   `/content/<lingua>` contiene nomi e descrizioni
4. **Il mondo si avvolge orizzontalmente**: bordo destro e bordo sinistro sono lo stesso
   meridiano; le rotte devono poter attraversare il bordo
5. **Immagini in WebP**; copertine in due misure (miniatura leggera + versione grande)
6. **Font ospitati localmente**, mai da CDN esterni
7. **Nessun cookie, nessun tracciamento**
8. **Stato nell'URL**: lingua, progresso, filtri e selezione stanno nella query string
9. **Responsive di base sempre**: desktop è la priorità, ma non fare scelte che rendano il
   telefono impossibile
10. **Mai pubblicità o monetizzazione** — il piano gratuito di Vercel lo vieta e il progetto
    non lo vuole

## Schema dati

Vedi `/docs/02-SCHEMA-DATI.md`. Rispettarlo alla lettera. Se serve un campo nuovo, proponilo e
aggiorna il documento, non improvvisare.

Gli `id` sono in minuscolo con trattini, basati sul nome internazionale, e **non cambiano mai**.

## Il filtro no-spoiler

Regola unica applicata a ogni entità:

```
mostra se  rivelatoAlCapitolo ≤ progressoUtente  AND  canone è attivo
```

Se un dato manca, l'entità va **nascosta**. Fallire in modo prudente.

## Metodo di lavoro

**Un pezzo alla volta.** Mai due lavori in corso insieme.

**Ogni sessione finisce con il sito online e funzionante**, anche se la funzionalità è minima.
Mai lasciare il progetto in uno stato rotto.

**A fine sessione aggiorna `/docs/03-STATO.md`**: cosa è stato fatto, qual è il prossimo passo,
eventuali problemi. Non è opzionale — è ciò che permette di riprendere dopo settimane di pausa.

**Committa spesso**, con messaggi in italiano comprensibili a chi non programma.

## Cosa non fare

- Non installare CMS o database
- Non aggiungere librerie pesanti senza spiegare perché servono
- Non riscrivere parti che funzionano per renderle "più eleganti"
- Non popolare film e spin-off finché il canone manga non è a buon punto
- Non copiare artwork ufficiale: la mappa è generata dal codice a partire dai dati
