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
| `tipo` | `isola` \| `citta` \| `regno` \| `struttura` \| `punto-notevole` | |
| `mare` | `east-blue` \| `west-blue` \| `north-blue` \| `south-blue` \| `grand-line-paradise` \| `nuovo-mondo` \| `calm-belt` \| `red-line` | |
| `canone` | `manga` \| `anime` \| `film` \| `spinoff` | |
| `rivelatoAlCapitolo` | numero | primo capitolo in cui il luogo è noto al lettore |
| `ancoraggioNarrativo` | numero \| `null` | solo per contenuti non canonici: dove si collocano nella cronologia |
| `dimensione` | numero, 1.0 = media | scala visiva sulla mappa |
| `forma` | `{ tipo: "generata", seme: id }` oppure `{ tipo: "path", d: "..." }` | forme generate all'inizio, disegnate a mano solo per i luoghi importanti |

**Attenzione su `rivelatoAlCapitolo`:** è il capitolo in cui il luogo diventa noto al *lettore*,
non quello in cui la ciurma ci arriva. Un'isola nominata al capitolo 100 e visitata al 200 ha
valore 100.

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
