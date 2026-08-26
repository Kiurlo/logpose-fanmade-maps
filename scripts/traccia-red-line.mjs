/**
 * Ricalca il contorno della Red Line dalla mappa di riferimento.
 *
 * A differenza delle isole, la Red Line non è una macchia chiusa: è una fascia
 * di terra che attraversa l'intera mappa da nord a sud, ed è disegnata come una
 * catena di creste con baie profonde fra loro. Se si tracciasse ogni baia si
 * rischierebbe di far sembrare la Red Line attraversabile dove non lo è: si
 * traccia perciò il contorno ESTERNO complessivo — il punto più a ovest e il
 * punto più a est del disegno a ogni altezza — che resta sempre una barriera
 * unica, come richiede la storia (attraversabile solo a Reverse Mountain e
 * agli antipodi).
 *
 * Il segno distintivo usato per riconoscere la Red Line è la rifinitura
 * rossastra disegnata lungo il suo bordo (il canale R-G del colore, molto più
 * alto che nel resto della mappa).
 *
 * Uso:
 *   node scripts/traccia-red-line.mjs            stampa un riepilogo, non scrive nulla
 *   node scripts/traccia-red-line.mjs --scrivi    aggiorna src/lib/red-line-tracciata.json
 *
 * Richiede public/riferimento/mappa.jpg (non è su Git, va copiato a mano).
 */
import sharp from "sharp";
import { writeFileSync, existsSync } from "node:fs";
import { pathToFileURL } from "node:url";

const RIFERIMENTO = "public/riferimento/mappa.jpg";
const ALLINEAMENTO = { x: -25, y: -439, larghezza: 10400, altezza: 5450 };

if (!existsSync(RIFERIMENTO)) {
  console.error("Manca " + RIFERIMENTO + ". È escluso da Git: va copiato a mano.");
  process.exit(1);
}

const { data, info } = await sharp(RIFERIMENTO).raw().toBuffer({ resolveWithObject: true });
const { width: W, height: H, channels: C } = info;
const { x: RX, y: RY, larghezza: RW, altezza: RH } = ALLINEAMENTO;

const versoPx = (x, y) => [
  Math.round(((x - RX) / RW) * W),
  Math.round(((y - RY) / RH) * H),
];

/** Rossastro = la rifinitura decorativa lungo il bordo della Red Line. */
function rossastro(mx, my) {
  const [ix, iy] = versoPx(mx, my);
  if (ix < 0 || iy < 0 || ix >= W || iy >= H) return false;
  const i = (iy * W + ix) * C;
  return data[i] - data[i + 1] > 45;
}

/**
 * Per una riga (un valore di y), trova il punto più a ovest e più a est
 * classificato come "rossastro" entro la finestra [xMin, xMax]. Ignora i
 * varchi interni (baie): interessa solo l'inviluppo esterno.
 */
function inviluppoRiga(y, xMin, xMax, passo) {
  let ovest = null, est = null;
  for (let x = xMin; x <= xMax; x += passo) {
    if (rossastro(x, y)) {
      if (ovest === null) ovest = x;
      est = x;
    }
  }
  return ovest === null ? null : [ovest, est];
}

/** Riduce l'elenco di righe a un numero gestibile di punti, spaziati uniformemente. */
function assottiglia(righe, quanti) {
  if (righe.length <= quanti) return righe;
  const passo = (righe.length - 1) / (quanti - 1);
  return Array.from({ length: quanti }, (_, i) => righe[Math.round(i * passo)]);
}

/** Ricalca l'inviluppo esterno di una fascia, riga per riga. */
function tracciaFascia(xMin, xMax, yMin = 0, yMax = 5000, passoY = 25, passoX = 8) {
  const righe = [];
  for (let y = yMin; y <= yMax; y += passoY) {
    const t = inviluppoRiga(y, xMin, xMax, passoX);
    righe.push({ y, ovest: t ? t[0] : null, est: t ? t[1] : null });
  }
  for (const chiave of ["ovest", "est"]) {
    let ultimo = null;
    for (let i = 0; i < righe.length; i++) {
      if (righe[i][chiave] !== null) { ultimo = i; continue; }
      let succ = null;
      for (let j = i + 1; j < righe.length; j++) if (righe[j][chiave] !== null) { succ = j; break; }
      if (ultimo === null && succ !== null) righe[i][chiave] = righe[succ][chiave];
      else if (ultimo !== null && succ === null) righe[i][chiave] = righe[ultimo][chiave];
      else if (ultimo !== null && succ !== null) {
        const t = (i - ultimo) / (succ - ultimo);
        righe[i][chiave] = righe[ultimo][chiave] + (righe[succ][chiave] - righe[ultimo][chiave]) * t;
      }
    }
  }
  // leviga con una media mobile: è un riferimento, non serve il rumore del disegno a mano
  const FINESTRA = 5;
  const leviga = (arr) => arr.map((_, i) => {
    const fin = arr.slice(Math.max(0, i - FINESTRA), i + FINESTRA + 1);
    return fin.reduce((s, v) => s + v, 0) / fin.length;
  });
  const ovest = leviga(righe.map((r) => r.ovest));
  const est = leviga(righe.map((r) => r.est));
  return assottiglia(righe.map((r, i) => ({ y: r.y, ovest: ovest[i], est: est[i] })), 180);
}

const arrotonda = (n) => Math.round(n * 10) / 10;

/** Costruisce un path SVG chiuso a partire da bordo ovest e bordo est di una fascia. */
function pathFascia(righe) {
  const giu = righe.map((r) => `${arrotonda(r.ovest)} ${arrotonda(r.y)}`);
  const su = [...righe].reverse().map((r) => `${arrotonda(r.est)} ${arrotonda(r.y)}`);
  return `M ${giu.join(" L ")} L ${su.join(" L ")} Z`;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const scrivi = process.argv.includes("--scrivi");

  console.log("Ricalco la fascia principale (Reverse Mountain, x intorno a 5000)...");
  const principale = tracciaFascia(3700, 6900);
  const largh = principale.map((r) => r.est - r.ovest);
  console.log(
    "  larghezza media:", Math.round(largh.reduce((a, b) => a + b, 0) / largh.length),
    "| min:", Math.round(Math.min(...largh)), "a y=" + principale[largh.indexOf(Math.min(...largh))].y,
    "| max:", Math.round(Math.max(...largh)), "| punti:", principale.length,
  );

  if (scrivi) {
    const d = pathFascia(principale);
    writeFileSync(
      "src/lib/red-line.ts",
      `/**
 * Contorno della Red Line, ricalcato da ${RIFERIMENTO} con scripts/traccia-red-line.mjs.
 *
 * Copre solo la fascia principale (l'incrocio di Reverse Mountain, x intorno a
 * 5000). La fascia della cucitura (Mary Geoise, x = 0 / 10000)
 * non è ancora tracciata: il segno di riferimento (la rifinitura rossastra lungo
 * il bordo) non si distingue con sicurezza in quel punto della mappa di
 * riferimento. Resta lì il rettangolo semplice, da rifare quando si catalogherà
 * quella zona (Marineford, Impel Down, Mary Geoise). Vedi 01-ARCHITETTURA.md.
 *
 * File generato: non modificare a mano. Per rigenerarlo, con l'immagine di
 * riferimento al suo posto:
 *
 *   node scripts/traccia-red-line.mjs --scrivi
 */
export const CONTORNO_RED_LINE_PRINCIPALE =
  "${d}";
`,
    );
    console.log("\nScritto src/lib/red-line.ts");
  } else {
    console.log("\nNiente è stato scritto (manca --scrivi).");
  }
}

export { tracciaFascia, pathFascia };
