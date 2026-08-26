/**
 * Ricalca il contorno delle isole dalla mappa di riferimento.
 *
 * Non produce un'immagine e non sovrappone alcun disegno: ricava un elenco di
 * punti nello spazio-mappa astratto, che finisce in `forma: { tipo: "path" }`
 * dentro data/luoghi.json — esattamente come un contorno tracciato a mano.
 * Vedi /docs/01-ARCHITETTURA.md, "Come si disegnano le isole".
 *
 * Come funziona: su questa mappa ogni isola è cerchiata da una linea scura.
 * Il programma riempie l'isola partendo dal suo centro e si ferma a quella
 * linea, poi ne segue il bordo passo passo.
 *
 * Uso:
 *   node scripts/traccia-isole.mjs                 guarda senza scrivere niente
 *   node scripts/traccia-isole.mjs --scrivi        aggiorna data/luoghi.json
 *   node scripts/traccia-isole.mjs --scrivi id1    solo alcuni luoghi
 *
 * Richiede public/riferimento/mappa.jpg, che NON è su Git (vedi .gitignore).
 * Se si cambia immagine di riferimento vanno rimisurati i valori di ALLINEAMENTO.
 */
import sharp from "sharp";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { pathToFileURL } from "node:url";

const RIFERIMENTO = "public/riferimento/mappa.jpg";

/** Stessi valori di RIFERIMENTO_INIZIALE in src/components/MappaPagina.tsx. */
const ALLINEAMENTO = { x: -25, y: -439, larghezza: 10400, altezza: 5450 };

/** Sotto questa luminosità il pixel è "linea di contorno": è il muro del riempimento. */
const LIMITE_SCURO = 140;

/** Oltre quest'area il riempimento è evidentemente scappato fuori dall'isola. */
const AREA_MASSIMA = 500000;

if (!existsSync(RIFERIMENTO)) {
  console.error("Manca " + RIFERIMENTO + ". È escluso da Git: va copiato a mano.");
  process.exit(1);
}

const { data, info } = await sharp(RIFERIMENTO)
  .raw()
  .toBuffer({ resolveWithObject: true });
const { width: W, height: H, channels: C } = info;
const { x: RX, y: RY, larghezza: RW, altezza: RH } = ALLINEAMENTO;

const versoPx = (x, y) => [
  Math.round(((x - RX) / RW) * W),
  Math.round(((y - RY) / RH) * H),
];
const versoMappaX = (px) => RX + (px / W) * RW;
const versoMappaY = (py) => RY + (py / H) * RH;

const scuro = (x, y) => {
  const i = (y * W + x) * C;
  return (data[i] + data[i + 1] + data[i + 2]) / 3 < LIMITE_SCURO;
};

/**
 * Riempie l'isola dal centro, fermandosi alla linea di contorno.
 * Accetta più punti di partenza: serve per le isole disegnate in due lobi
 * separati da un fiume o una baia (es. il Regno di Arabasta), dove un solo
 * punto di partenza raggiunge solo metà del disegno.
 */
function riempi(semi) {
  const visti = new Set();
  const pila = semi.map(([x, y]) => [x, y]);
  let minx = semi[0][0], maxx = semi[0][0], miny = semi[0][1], maxy = semi[0][1];
  while (pila.length) {
    const [x, y] = pila.pop();
    if (x < 1 || y < 1 || x >= W - 1 || y >= H - 1) return null;
    const k = y * W + x;
    if (visti.has(k) || scuro(x, y)) continue;
    visti.add(k);
    if (visti.size > AREA_MASSIMA) return null;
    if (x < minx) minx = x;
    if (x > maxx) maxx = x;
    if (y < miny) miny = y;
    if (y > maxy) maxy = y;
    pila.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
  }
  return { visti, minx, maxx, miny, maxy };
}

/** Tappa i buchi lasciati dalle scritte disegnate sopra l'isola. */
function tappaBuchi(reg) {
  const bx = reg.minx - 3, by = reg.miny - 3;
  const bw = reg.maxx - reg.minx + 7, bh = reg.maxy - reg.miny + 7;
  const fuori = new Uint8Array(bw * bh);
  const pila = [];
  for (let x = 0; x < bw; x++) pila.push([x, 0], [x, bh - 1]);
  for (let y = 0; y < bh; y++) pila.push([0, y], [bw - 1, y]);
  while (pila.length) {
    const [x, y] = pila.pop();
    if (x < 0 || y < 0 || x >= bw || y >= bh) continue;
    const k = y * bw + x;
    if (fuori[k] || reg.visti.has((by + y) * W + (bx + x))) continue;
    fuori[k] = 1;
    pila.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
  }
  const isola = new Uint8Array(bw * bh);
  for (let i = 0; i < isola.length; i++) isola[i] = fuori[i] ? 0 : 1;
  return { isola, bx, by, bw, bh };
}

/** Segue il bordo dell'isola pixel per pixel (tracciamento di Moore). */
function seguiBordo({ isola, bw, bh }) {
  const dentro = (x, y) =>
    x >= 0 && y >= 0 && x < bw && y < bh && isola[y * bw + x] === 1;

  let start = null;
  for (let y = 0; y < bh && !start; y++) {
    for (let x = 0; x < bw; x++) {
      if (dentro(x, y)) { start = [x, y]; break; }
    }
  }
  if (!start) return [];

  const vicini = [[-1, 0], [-1, -1], [0, -1], [1, -1], [1, 0], [1, 1], [0, 1], [-1, 1]];
  const bordo = [];
  let b = start;
  let prec = [start[0] - 1, start[1]];
  const massimo = 8 * (bw + bh) * 4;

  for (let passi = 0; passi < massimo; passi++) {
    const iPrec = vicini.findIndex(
      (v) => v[0] === prec[0] - b[0] && v[1] === prec[1] - b[1],
    );
    let trovato = null;
    for (let k = 1; k <= 8; k++) {
      const i = (iPrec + k) % 8;
      const n = [b[0] + vicini[i][0], b[1] + vicini[i][1]];
      if (dentro(n[0], n[1])) { trovato = n; break; }
      prec = n;
    }
    if (!trovato) break;
    bordo.push(b);
    b = trovato;
    if (b[0] === start[0] && b[1] === start[1]) break;
  }
  return bordo;
}

/** Riduce il bordo a pochi punti, distanziati in modo uniforme lungo la costa. */
function assottiglia(bordo, quanti) {
  const n = bordo.length;
  if (n <= quanti) return bordo;
  const passo = n / quanti;
  return Array.from({ length: quanti }, (_, i) => bordo[Math.floor(i * passo)]);
}

const arrotonda = (n) => Math.round(n * 10) / 10;

/** Stessa curva morbida usata dalle forme generate (src/lib/forme.ts). */
function curvaChiusa(punti) {
  const n = punti.length;
  let d = "M " + arrotonda(punti[0][0]) + " " + arrotonda(punti[0][1]);
  for (let i = 0; i < n; i++) {
    const p0 = punti[(i - 1 + n) % n], p1 = punti[i];
    const p2 = punti[(i + 1) % n], p3 = punti[(i + 2) % n];
    const c1x = p1[0] + (p2[0] - p0[0]) / 6;
    const c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6;
    const c2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += " C " + arrotonda(c1x) + " " + arrotonda(c1y) + ", " +
      arrotonda(c2x) + " " + arrotonda(c2y) + ", " +
      arrotonda(p2[0]) + " " + arrotonda(p2[1]);
  }
  return d + " Z";
}

/**
 * Ricalca un'isola. Restituisce il contorno e il nuovo centro, o un motivo di fallimento.
 *
 * `puntiExtra` (opzionale): altri punti nello spazio-mappa da cui partire a riempire,
 * oltre al centro del luogo. Serve per le isole disegnate in due lobi separati da un
 * fiume o una baia (es. il Regno di Arabasta): un solo punto ne riempirebbe solo metà.
 */
export function ricalca(luogo, puntiExtra = []) {
  let [sx, sy] = versoPx(luogo.coordinate.x, luogo.coordinate.y);
  // se il centro cade su una scritta o sul contorno, si sposta di poco
  for (let d = 0; scuro(sx, sy) && d < 60; d++) sx += 2;
  if (scuro(sx, sy)) return { errore: "il centro cade su una linea scura" };

  const semi = [[sx, sy], ...puntiExtra.map(([x, y]) => versoPx(x, y))];
  const reg = riempi(semi);
  if (!reg) return { errore: "riempimento scappato: contorno aperto, o non è un'isola" };
  if (reg.visti.size < 250) return { errore: "area troppo piccola: nessuna isola qui" };

  const mask = tappaBuchi(reg);
  const bordo = seguiBordo(mask);
  if (bordo.length < 24) return { errore: "bordo troppo corto" };

  const quanti = Math.min(48, Math.max(20, Math.round(bordo.length / 30)));
  const puntiPx = assottiglia(bordo, quanti);
  const punti = puntiPx.map(([x, y]) => [
    versoMappaX(mask.bx + x),
    versoMappaY(mask.by + y),
  ]);

  const xs = punti.map((p) => p[0]);
  const ys = punti.map((p) => p[1]);
  const cx = (Math.min(...xs) + Math.max(...xs)) / 2;
  const cy = (Math.min(...ys) + Math.max(...ys)) / 2;
  const semiAltezza = (Math.max(...ys) - Math.min(...ys)) / 2;

  return {
    d: curvaChiusa(punti.map(([x, y]) => [x - cx, y - cy])),
    centro: { x: Math.round(cx), y: Math.round(cy) },
    // serve solo a posizionare l'etichetta sotto l'isola (vedi Mappa.tsx)
    dimensione: Math.max(0.3, Math.round((semiAltezza / 90) * 100) / 100),
    puntiPx,
    riquadro: mask,
    punti: punti.length,
    areaPx: reg.visti.size,
  };
}

// --------------------------------------------------------------------------
// Da qui in giù si esegue solo se lo script è lanciato a mano, non se importato.

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
const argomenti = process.argv.slice(2);
const scrivi = argomenti.includes("--scrivi");
const soloId = argomenti.filter((a) => !a.startsWith("--"));

const luoghi = JSON.parse(readFileSync("data/luoghi.json", "utf8"));
const bersagli = luoghi.filter(
  (l) => l.contenutoIn === null && (soloId.length === 0 || soloId.includes(l.id)),
);

let riusciti = 0;
for (const luogo of bersagli) {
  const r = ricalca(luogo);
  if (r.errore) {
    console.log("  no  " + luogo.id.padEnd(24) + r.errore);
    continue;
  }
  console.log(
    "  ok  " + luogo.id.padEnd(24) + r.punti + " punti, centro " +
      r.centro.x + "/" + r.centro.y + ", dimensione " + r.dimensione,
  );
  riusciti++;
  if (scrivi) {
    luogo.forma = { tipo: "path", d: r.d };
    luogo.coordinate = r.centro;
    luogo.dimensione = r.dimensione;
  }
}

if (scrivi) {
  writeFileSync("data/luoghi.json", JSON.stringify(luoghi, null, 2) + "\n");
  console.log("\nScritti " + riusciti + " contorni in data/luoghi.json");
} else {
  console.log("\n" + riusciti + " isole ricalcate. Niente e' stato scritto (manca --scrivi).");
}
}
