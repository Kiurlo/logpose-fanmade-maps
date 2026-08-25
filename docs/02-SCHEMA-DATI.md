# Schema dei dati

Questo è il documento più importante del progetto. Cambiare lo schema dopo aver catalogato
centinaia di voci è doloroso; cambiarlo adesso non costa nulla.

## Convenzione degli identificatori

Ogni entità ha un `id` testuale che la identifica per sempre.

Regole:
- minuscolo, parole separate da trattini: `water-seven`, `monkey-d-rufy`
- solo caratteri ASCII, niente accenti né spazi
- basato sul nome **internazionale**, mai su quello dell'edizione italiana
  (i nomi italiani cambiano tra edizioni; l'id non deve mai cambiare)
- **non si modifica mai** una volta creato, nemmeno se il nome era sbagliato

Gli id sono tecnici e non vengono mostrati agli utenti.

---

## `/data/luoghi.json`

```json
[
  {
    "id": "water-seven",
    "coordinate": { "x": 6420, "y": 2180 },
    "precisione": "canonica",
    "tipo": "citta",
    "mare": "grand-line-paradise",
    "canone": "manga",
    "rivelatoAlCapitolo": 322,
    "ancoraggioNarrativo": null,
    "contenutoIn": null,
    "archi": ["water-seven"],
    "dimensione": 1.4,
    "forma": { "tipo": "generata", "seme": "water-seven" },
    "immagini": ["water-seven-01.webp", "water-seven-02.webp"]
  }
]
```

**Campi:**

| Campo | Valori | Note |
|---|---|---|
| `coordinate` | x: 0–10000, y: 0–5000 | spazio-mappa astratto |
| `precisione` | `canonica` \| `stimata` | `stimata` = dedotta dall'ordine di navigazione |
| `tipo` | `isola` \| `arcipelago` \| `regno` \| `citta` \| `villaggio` \| `struttura` \| `punto-notevole` | |
| `mare` | `east-blue` \| `west-blue` \| `north-blue` \| `south-blue` \| `grand-line-paradise` \| `nuovo-mondo` \| `calm-belt` \| `red-line` | |
| `canone` | `manga` \| `anime` \| `film` \| `spinoff` | |
| `rivelatoAlCapitolo` | numero | primo capitolo in cui il luogo è noto al lettore |
| `ancoraggioNarrativo` | numero \| `null` | solo per contenuti non canonici: dove si collocano nella cronologia |
| `contenutoIn` | id di un altro luogo \| `null` | il luogo che lo contiene. `null` = luogo di primo livello |
| `dimensione` | numero, 1.0 = media | scala visiva sulla mappa |
| `forma` | `{ tipo: "generata", seme: id }` oppure `{ tipo: "path", d: "..." }` | forme generate all'inizio, disegnate a mano solo per i luoghi importanti. **Il `path` è relativo al centro del luogo**, non assoluto: vedi sotto |

**Attenzione su `rivelatoAlCapitolo`:** è il capitolo in cui il luogo diventa noto al *lettore*,
non quello in cui la ciurma ci arriva. Un'isola nominata al capitolo 100 e visitata al 200 ha
valore 100.

### Il contorno è relativo al centro del luogo

I numeri dentro `forma.d` **non sono coordinate della mappa**: sono scostamenti dal centro del
luogo, come se il luogo stesse in `0, 0`.

```json
"coordinate": { "x": 9440, "y": 315 },
"forma": { "tipo": "path", "d": "M -60.5 -62.4 C -69.3 -60.6, ..." }
```

Il motivo è pratico: così **spostare un luogo sposta anche il suo disegno.** Se il contorno
fosse in coordinate assolute, cambiare `coordinate` sposterebbe l'etichetta lasciando la forma
indietro — e succederebbe ogni volta che si affina una posizione, cioè spesso.

Conseguenza utile: lo stesso contorno si può riusare altrove cambiando solo `coordinate`.

### I luoghi stanno dentro altri luoghi

Il Villaggio di Foosha sta sull'Isola Dawn. Alubarna sta nel Regno di Arabasta. I boschetti
stanno nell'Arcipelago Sabaody. È la norma, non l'eccezione: `contenutoIn` serve a questo.

```
dawn-island          contenutoIn: null            ← compare sulla mappa
  └─ foosha-village  contenutoIn: "dawn-island"   ← compare nella scheda dell'isola
```

**Regola di disegno:** sulla mappa del mondo si disegnano **solo i luoghi con
`contenutoIn: null`.** A quella scala un villaggio e la sua isola sono lo stesso puntino:
disegnarli entrambi produce solo confusione. I luoghi contenuti sono raggiungibili dalla
scheda del luogo che li contiene, e compariranno sulla mappa quando ci sarà lo zoom.

**Le coordinate però si compilano lo stesso**, anche per i luoghi contenuti: servono al
momento dello zoom, e vale il principio "i dati non si rimandano". Se la posizione precisa
dentro l'isola non è nota, si mette una coordinata vicina a quella del contenitore e si
marca `precisione: "stimata"`.

**Il mare si ripete:** un luogo contenuto ha lo stesso `mare` del contenitore. È una
ripetizione voluta — permette di filtrare per mare senza dover risalire la catena.

---

## `/content/it/luoghi.json`

```json
{
  "water-seven": {
    "nome": "Water Seven",
    "sottotitolo": "La città dell'acqua",
    "descrizione": "Isola-città costruita sull'acqua, celebre per i suoi cantieri navali...",
    "curiosita": "Il nome deriva dai sette canali principali."
  }
}
```

Stessa struttura identica in ogni lingua. Se una traduzione manca, il sito ricade sull'italiano.

---

## `/data/rotte.json`

```json
[
  {
    "id": "rotta-mugiwara",
    "soggetto": { "tipo": "ciurma", "id": "cappello-di-paglia" },
    "canone": "manga",
    "tappe": [
      { "luogo": "isola-conchiglia", "daCapitolo": 1, "aCapitolo": 7 },
      { "luogo": "orange-town", "daCapitolo": 8, "aCapitolo": 21 }
    ]
  }
]
```

`soggetto.tipo` può essere `ciurma` o `personaggio`.

Le tappe sono **ordinate cronologicamente**. Il tratto tra due tappe consecutive viene disegnato
automaticamente. Se serve far curvare il percorso attorno a un ostacolo, si aggiunge alla tappa:

```json
"viaPunti": [ { "x": 5800, "y": 2400 } ]
```

---

## `/data/personaggi.json`

```json
[
  {
    "id": "monkey-d-rufy",
    "ciurma": "cappello-di-paglia",
    "canone": "manga",
    "rivelatoAlCapitolo": 1,
    "avatar": "monkey-d-rufy.webp"
  }
]
```

## `/data/ciurme.json`

```json
[
  {
    "id": "cappello-di-paglia",
    "colore": "#C0522D",
    "rivelatoAlCapitolo": 1,
    "emblema": "cappello-di-paglia.webp"
  }
]
```

Il `colore` serve a distinguere le rotte sulla mappa. Scegliere colori ben separati fra loro.

## `/data/archi.json`

```json
[
  {
    "id": "water-seven",
    "capitoli": [322, 441],
    "saga": "acqua-laguna"
  }
]
```

---

## `/data/volumi.json`

```json
[
  {
    "numero": 45,
    "capitoli": [429, 439],
    "copertina": "vol-045.webp",
    "edizione": "star-comics"
  }
]
```

Il titolo del volume, essendo tradotto, sta in `/content/it/volumi.json`.

Il campo `edizione` esiste perché l'edizione italiana potrebbe avere numerazioni diverse da
quella giapponese. **Decisione ancora aperta:** quale edizione italiana usare come riferimento.
Da definire prima di catalogare i volumi.

## `/data/episodi.json`

```json
[
  { "episodio": 320, "capitoli": [429, 430] }
]
```

---

## Come funziona il filtro no-spoiler

Tutto si riduce a un confronto fra numeri:

```
progressoUtente = converti(sceltaUtente)      → un numero di capitolo

mostra un'entità se:
    entità.rivelatoAlCapitolo ≤ progressoUtente
    AND entità.canone è fra quelli attivi
```

Per le entità non canoniche si usa `ancoraggioNarrativo` al posto di `rivelatoAlCapitolo`.

Un'unica regola, applicata a luoghi, rotte, tappe, personaggi e ciurme. Se un dato manca,
l'entità viene **nascosta** (fallire in modo prudente: meglio non mostrare che spoilerare).

---

## Regole di compilazione

1. **Mai lasciare campi vuoti.** Se un dato non si conosce, va segnato come incerto, non omesso.
2. **`precisione: "stimata"` non è un fallimento**, è un'informazione utile. Usarla senza esitare.
3. **Nel dubbio su `rivelatoAlCapitolo`, arrotondare per eccesso.** Meglio rivelare qualcosa
   dopo del dovuto che rovinare una sorpresa.
4. **Un id creato non si cambia mai.**
