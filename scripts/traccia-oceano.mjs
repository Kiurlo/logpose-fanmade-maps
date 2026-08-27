/**
 * Ricalca il contorno dell'oceano navigabile — North Blue, East Blue, West
 * Blue, South Blue e la Grand Line, tutti insieme — dalla mappa di
 * riferimento a contrasto aumentato (public/riferimento/mappa-red-line.jpg,
 * un'esportazione di Gabriele da mappa.jpg, non lo stesso file).
 *
 * PERCHÉ TUTTI INSIEME E NON QUATTRO MARI SEPARATI
 *
 * I quattro mari non sono davvero separati: intorno a Reverse Mountain sono
 * connessi da stretti canali (visibili nella mappa di riferimento come i
 * varchi fra i quattro bracci della "stella"). Riempiendo a partire da un
 * punto in uno qualsiasi dei quattro mari, il riempimento raggiunge sempre
 * tutti gli altri tre. Non è un difetto del metodo: è la vera forma del
 * mondo. Il risultato è un solo, enorme contorno.
 *
 * PERCHÉ QUESTO METODO FUNZIONA QUI E NON PRIMA
 *
 * Il tentativo precedente cercava di ricalcare la Red Line direttamente, e
 * si è scontrato con due problemi del disegno originale (piccoli buchi da
 * compressione JPEG nella china, e isole disegnate a un pelo dalla costa).
 * Qui si ricalca l'oceano — la forma opposta — dalla mappa a contrasto
 * aumentato: la Red Line vi appare come un arancione acceso, nettamente
 * diverso dal beige di mare e isole insieme. Il muro del riempimento è
 * quindi un colore invece di una linea sottile: molto più robusto.
 *
 * Un problema nuovo, specifico di questa immagine: la cornice decorativa a
 * scacchi intorno al disegno ha tre toni (chiaro, scuro, panna) che il
 * confronto rosso-verde non riconosce come Red Line, ma che non sono
 * nemmeno il beige del mare. Un primo tentativo trattava l'intera fascia
 * vicino ai bordi dell'immagine come muro a prescindere dal colore — ma una
 * costa vera (vicino alla bussola di West Blue) arrivava più vicina al
 * bordo di quanto quel margine permettesse, e veniva tagliata via. Si
 * riconoscono invece i tre toni della cornice per luminosità: due sono
 * troppo scuri o troppo chiari-e-grigi per essere mare o terra.
 *
 * Poi la Red Line si disegna semplicemente come sfondo di *tutta* la mappa,
 * e l'oceano ricalcato qui sopra come un unico grande ritaglio blu — invece
 * del contrario (isole d'acqua sopra un oceano). Vedi Mappa.tsx.
 *
 * Uso:
 *   node scripts/traccia-oceano.mjs             stampa un riepilogo, non scrive nulla
 *   node scripts/traccia-oceano.mjs --scrivi     aggiorna src/lib/oceano.ts
 *
 * Richiede public/riferimento/mappa-red-line.jpg (non è su Git, va copiato a mano).
 */
import sharp from "sharp";
import { writeFileSync, existsSync } from "node:fs";
import { pathToFileURL } from "node:url";

const RIFERIMENTO = "public/riferimento/mappa-red-line.jpg";

/**
 * Allineamento misurato su due punti ben distanti fra loro, entrambi letti
 * per primi su mappa.jpg (dove la calibrazione è verificata da tempo) e poi
 * ritrovati qui: il varco centrale di Reverse Mountain (spazio-mappa
 * 5000,2500) e la bussola in fondo a West Blue (spazio-mappa 3792,4380,
 * calcolata dalla sua posizione in pixel su mappa.jpg).
 *
 * Una prima versione usava un solo punto ben misurato (Reverse Mountain) e
 * indovinava larghezza e altezza (10000 e 5000, "abbastanza grandi da
 * coprire la mappa"). Sbagliato: l'altezza vera è 6123, il 22% in più di
 * quella indovinata. Con l'altezza troppo corta l'oceano finiva schiacciato
 * verso il centro, lasciando fasce di mare vuoto sopra e sotto e isole (Isola
 * Dawn, Isole Polestar...) a cavallo con la Red Line — segnalato da Gabriele
 * guardando il sito vero. Un solo punto non basta mai a misurare una scala:
 * ne servono due, il più lontani possibile fra loro.
 */
const ALLINEAMENTO = { x: 319, y: -841, larghezza: 9579, altezza: 6123 };

/**
 * La cornice decorativa a scacchi ha tre toni (chiaro, scuro, panna),
 * nessuno arancione ma nessuno uguale al beige del mare — un margine di
 * pixel indovinato a occhio, usato prima, tagliava via costa vera vicino ai
 * bordi (una penisola arrivava più vicino al bordo della cornice stessa).
 * Si riconoscono i tre toni per luminosità invece che con un margine cieco.
 */
const SCURO_CORNICE = 145;
const CHIARO_CORNICE = 195;
const DESATURATO_CORNICE = 20;

/** Quanto deve essere più chiaro il rosso del verde per contare come Red Line. */
const SOGLIA_ARANCIONE = 80;

if (!existsSync(RIFERIMENTO)) {
  console.error("Manca " + RIFERIMENTO + ". Non è su Git: va copiato a mano da Gabriele.");
  process.exit(1);
}

const { data, info } = await sharp(RIFERIMENTO).raw().toBuffer({ resolveWithObject: true });
const { width: W, height: H, channels: C } = info;
const { x: RX, y: RY, larghezza: RW, altezza: RH } = ALLINEAMENTO;

const versoPx = (x, y) => [Math.round(((x - RX) / RW) * W), Math.round(((y - RY) / RH) * H)];
const versoMappaX = (px) => RX + (px / W) * RW;
const versoMappaY = (py) => RY + (py / H) * RH;

const redLine = (ix, iy) => {
  if (ix < 0 || iy < 0 || ix >= W || iy >= H) return true;
  const i = (iy * W + ix) * C;
  const r = data[i], g = data[i + 1], b = data[i + 2];
  if (r - g > SOGLIA_ARANCIONE) return true; // arancione: Red Line vera
  const luminosita = (r + g + b) / 3;
  if (luminosita < SCURO_CORNICE) return true; // quadretto scuro della cornice
  if (luminosita > CHIARO_CORNICE && r - g < DESATURATO_CORNICE) return true; // quadretto panna
  return false;
};

function riempi(semeMappa, areaMassima) {
  const [sx, sy] = versoPx(...semeMappa);
  const visti = new Set();
  const pila = [[sx, sy]];
  let minx = sx, maxx = sx, miny = sy, maxy = sy;
  while (pila.length) {
    const [x, y] = pila.pop();
    const k = y * W + x;
    if (visti.has(k) || redLine(x, y)) continue;
    visti.add(k);
    if (visti.size > areaMassima) return { errore: "area troppo grande (probabile fuga)" };
    if (x < minx) minx = x; if (x > maxx) maxx = x;
    if (y < miny) miny = y; if (y > maxy) maxy = y;
    pila.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
  }
  return { visti, minx, maxx, miny, maxy };
}

/** Tappa le isole della cornice esterna al ritaglio (qui non servono buchi: le
 * isole restano visibili, sono solo terra dentro il grande contorno d'acqua). */
function preparaMaschera(reg) {
  const bx = reg.minx - 3, by = reg.miny - 3;
  const bw = reg.maxx - reg.minx + 7, bh = reg.maxy - reg.miny + 7;
  const dentro = new Uint8Array(bw * bh);
  for (const k of reg.visti) {
    const gx = (k % W) - bx, gy = Math.floor(k / W) - by;
    dentro[gy * bw + gx] = 1;
  }
  return { dentro, bx, by, bw, bh };
}

function seguiBordo({ dentro, bw, bh }) {
  const isDentro = (x, y) => x >= 0 && y >= 0 && x < bw && y < bh && dentro[y * bw + x] === 1;
  let start = null;
  for (let y = 0; y < bh && !start; y++) for (let x = 0; x < bw; x++) if (isDentro(x, y)) { start = [x, y]; break; }
  if (!start) return [];
  const vicini = [[-1, 0], [-1, -1], [0, -1], [1, -1], [1, 0], [1, 1], [0, 1], [-1, 1]];
  const bordo = [];
  let b = start, prec = [start[0] - 1, start[1]];
  const massimo = 8 * (bw + bh) * 8;
  for (let i = 0; i < massimo; i++) {
    const iPrec = vicini.findIndex((v) => v[0] === prec[0] - b[0] && v[1] === prec[1] - b[1]);
    let trovato = null;
    for (let k = 1; k <= 8; k++) {
      const idx = (iPrec + k) % 8;
      const n = [b[0] + vicini[idx][0], b[1] + vicini[idx][1]];
      if (isDentro(n[0], n[1])) { trovato = n; break; }
      prec = n;
    }
    if (!trovato) break;
    bordo.push(b);
    b = trovato;
    if (b[0] === start[0] && b[1] === start[1]) break;
  }
  return bordo;
}

function assottiglia(bordo, quanti) {
  if (bordo.length <= quanti) return bordo;
  const passo = bordo.length / quanti;
  return Array.from({ length: quanti }, (_, i) => bordo[Math.floor(i * passo)]);
}

const arrotonda = (n) => Math.round(n * 10) / 10;

function curvaChiusa(punti) {
  const n = punti.length;
  let d = "M " + arrotonda(punti[0][0]) + " " + arrotonda(punti[0][1]);
  for (let i = 0; i < n; i++) {
    const p0 = punti[(i - 1 + n) % n], p1 = punti[i];
    const p2 = punti[(i + 1) % n], p3 = punti[(i + 2) % n];
    const c1x = p1[0] + (p2[0] - p0[0]) / 6, c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6, c2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += " C " + arrotonda(c1x) + " " + arrotonda(c1y) + ", " + arrotonda(c2x) + " " + arrotonda(c2y) + ", " + arrotonda(p2[0]) + " " + arrotonda(p2[1]);
  }
  return d + " Z";
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const scrivi = process.argv.includes("--scrivi");

  // Un solo seme basta: i quattro mari sono tutti connessi.
  console.log("Ricalco l'oceano (i quattro mari sono connessi, uno riempimento solo basta)...");
  const r = riempi([2500, 1000], 25_000_000);
  if (r.errore) {
    console.log("  FALLITO:", r.errore);
    process.exit(1);
  }
  const mask = preparaMaschera(r);
  const bordo = seguiBordo(mask);
  console.log("  area:", r.visti.size, "px | bordo:", bordo.length, "punti");

  const puntiPx = assottiglia(bordo, 500);
  const punti = puntiPx.map(([x, y]) => [versoMappaX(mask.bx + x), versoMappaY(mask.by + y)]);
  const d = curvaChiusa(punti);
  console.log("  ridotto a", punti.length, "punti");

  if (scrivi) {
    writeFileSync(
      "src/lib/oceano.ts",
      `/**
 * Contorno dell'oceano navigabile (i quattro mari + Grand Line, tutti
 * connessi intorno a Reverse Mountain), ricalcato da
 * ${RIFERIMENTO} con scripts/traccia-oceano.mjs.
 *
 * La Red Line si disegna come sfondo di tutta la mappa (vedi Mappa.tsx);
 * questo contorno è il grande ritaglio blu sopra quello sfondo. Vedi
 * 01-ARCHITETTURA.md, "Come si disegna la Red Line".
 *
 * File generato: non modificare a mano. Per rigenerarlo, con
 * public/riferimento/mappa-red-line.jpg al suo posto:
 *
 *   node scripts/traccia-oceano.mjs --scrivi
 */
export const CONTORNO_OCEANO =
  "${d}";
`,
    );
    console.log("\nScritto src/lib/oceano.ts");
  } else {
    console.log("\nNiente è stato scritto (manca --scrivi).");
  }
}
