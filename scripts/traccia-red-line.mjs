/**
 * Genera il contorno della Red Line intorno a Reverse Mountain.
 *
 * A differenza delle isole (scripts/traccia-isole.mjs), qui i punti non sono
 * letti da un algoritmo: sono letti A OCCHIO da Claude su un ritaglio della
 * mappa di riferimento con una griglia di coordinate sovrapposta, esattamente
 * come si è fatto a mano per il contorno dell'Isola Dawn (vedi
 * 01-ARCHITETTURA.md, "Come si dà a un'isola una forma decisa da noi").
 *
 * PERCHÉ NON UN RIEMPIMENTO AUTOMATICO, COME LE ISOLE
 *
 * Prima si è provato un riempimento automatico (fino alla linea scura, come
 * per le isole), adattato per una forma che attraversa tutta la mappa invece
 * di essere una macchia chiusa. Ha rivelato due problemi reali del disegno di
 * riferimento, non del metodo:
 *
 *   1. La linea di china ha piccoli buchi lasciati dalla compressione JPEG,
 *      soprattutto sui tratti sottili: il riempimento ci passa attraverso e
 *      scappa nel mare aperto. Una leggera sfocatura prima di leggere lo
 *      scuro chiude questi buchi.
 *   2. Vicino a Reverse Mountain molte isole (Isola Cozia, Isola Polestar,
 *      Spider Miles...) sono disegnate a un pelo dalla costa della Red Line:
 *      la stessa sfocatura che chiude i buchi della china salda anche loro
 *      alla Red Line, perché lo spazio di mare fra i due disegni è largo
 *      pochi pixel quanto i buchi da chiudere. Non esiste una soglia unica
 *      che risolva il primo problema senza causare il secondo.
 *
 * Il risultato è affidabile solo in una fascia stretta subito intorno al
 * passaggio, dove queste isole non compaiono. Per il resto della Red Line
 * (che oggi resta un rettangolo semplice) servirà lo stesso lavoro a mano,
 * un pezzo alla volta, quando si cataloga ciò che le sta intorno.
 *
 * COME SONO STATI LETTI QUESTI PUNTI
 *
 * 1. Ritaglio della mappa di riferimento intorno a Reverse Mountain (x
 *    4100-6200, y 2000-2900) con una griglia ogni 100 unità di spazio-mappa
 *    sovrapposta via SVG
 * 2. Lettura a occhio di sedici punti lungo il contorno esterno della
 *    "stella a quattro punte" (i quattro bracci del fiume/montagna che si
 *    incontrano al passaggio), in ordine orario
 * 3. Verifica per sovrapposizione: i sedici punti ridisegnati sopra la mappa
 *    di riferimento originale, a colpo d'occhio combaciano con la costa vera
 *
 * Uso:
 *   node scripts/traccia-red-line.mjs --scrivi    aggiorna src/lib/red-line.ts
 */
import { writeFileSync } from "node:fs";

/** Sedici punti, in ordine orario a partire dalla punta nord-ovest. Spazio-mappa. */
const STELLA_REVERSE_MOUNTAIN = [
  [4150, 2080], [4550, 2340], [4870, 2420],
  [5300, 2220], [5750, 1980], [5850, 2150],
  [5060, 2480], [5500, 2460], [6050, 2500],
  [5500, 2580], [5000, 2640], [4750, 2780],
  [4550, 2900], [4380, 2750], [4750, 2600],
  [4350, 2280],
];

const arrotonda = (n) => Math.round(n * 10) / 10;

/** Stessa curva morbida usata dalle forme delle isole (src/lib/forme.ts). */
function curvaChiusa(punti) {
  const n = punti.length;
  let d = "M " + arrotonda(punti[0][0]) + " " + arrotonda(punti[0][1]);
  for (let i = 0; i < n; i++) {
    const p0 = punti[(i - 1 + n) % n], p1 = punti[i];
    const p2 = punti[(i + 1) % n], p3 = punti[(i + 2) % n];
    const c1x = p1[0] + (p2[0] - p0[0]) / 6, c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6, c2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += " C " + arrotonda(c1x) + " " + arrotonda(c1y) + ", " +
      arrotonda(c2x) + " " + arrotonda(c2y) + ", " + arrotonda(p2[0]) + " " + arrotonda(p2[1]);
  }
  return d + " Z";
}

if (process.argv.includes("--scrivi")) {
  const d = curvaChiusa(STELLA_REVERSE_MOUNTAIN);
  writeFileSync(
    "src/lib/red-line.ts",
    `/**
 * Contorno della Red Line intorno a Reverse Mountain.
 *
 * Letto a occhio da Claude sulla mappa di riferimento, non generato da un
 * algoritmo: vedi scripts/traccia-red-line.mjs per il perché e il come.
 *
 * Copre solo la fascia immediatamente intorno al passaggio (dove il disegno
 * mostra i quattro bracci del fiume/montagna). Il resto della Red Line — sia
 * il proseguimento lontano da Reverse Mountain, sia la fascia della cucitura
 * del mondo verso Mary Geoise (x = 0 / 10000) — resta un rettangolo semplice
 * in Mappa.tsx: da rifare a mano, un pezzo alla volta, quando si catalogherà
 * ciò che gli sta intorno. Vedi 01-ARCHITETTURA.md.
 *
 * File generato: non modificare a mano. Per rigenerarlo dopo aver corretto
 * uno dei sedici punti in scripts/traccia-red-line.mjs:
 *
 *   node scripts/traccia-red-line.mjs --scrivi
 */
export const CONTORNO_RED_LINE_PRINCIPALE =
  "${d}";
`,
  );
  console.log("Scritto src/lib/red-line.ts (" + STELLA_REVERSE_MOUNTAIN.length + " punti)");
} else {
  console.log(STELLA_REVERSE_MOUNTAIN.length + " punti pronti. Aggiungere --scrivi per aggiornare src/lib/red-line.ts.");
}
