/**
 * Come nasce il contorno di un'isola.
 * Vedi /docs/01-ARCHITETTURA.md — "Come si disegnano le isole".
 *
 * Nessuna immagine, nessun disegno sovrapposto: il contorno è un elenco di punti
 * che il codice unisce con una curva chiusa.
 */

/** Trasforma un testo (l'id dell'isola) in un numero. Stesso testo → stesso numero, sempre. */
function semeNumerico(testo: string): number {
  let h = 2166136261;
  for (let i = 0; i < testo.length; i++) {
    h ^= testo.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/**
 * Generatore di numeri casuali "con memoria": partendo dallo stesso seme produce
 * sempre la stessa sequenza. È ciò che rende le forme stabili nel tempo.
 */
function generatoreCasuale(seme: number): () => number {
  let stato = seme;
  return () => {
    stato = (stato + 0x6d2b79f5) | 0;
    let t = Math.imul(stato ^ (stato >>> 15), 1 | stato);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const arrotonda = (n: number) => Math.round(n * 10) / 10;

/**
 * Unisce i punti con una curva chiusa e morbida (Catmull-Rom convertita in curve
 * di Bézier, il formato che capisce l'SVG). Il risultato è una costa continua,
 * non una spezzata di segmenti dritti.
 */
function curvaChiusa(punti: [number, number][]): string {
  const n = punti.length;
  let d = `M ${arrotonda(punti[0][0])} ${arrotonda(punti[0][1])}`;

  for (let i = 0; i < n; i++) {
    const p0 = punti[(i - 1 + n) % n];
    const p1 = punti[i];
    const p2 = punti[(i + 1) % n];
    const p3 = punti[(i + 2) % n];

    const c1x = p1[0] + (p2[0] - p0[0]) / 6;
    const c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6;
    const c2y = p2[1] - (p3[1] - p1[1]) / 6;

    d += ` C ${arrotonda(c1x)} ${arrotonda(c1y)}, ${arrotonda(c2x)} ${arrotonda(c2y)}, ${arrotonda(p2[0])} ${arrotonda(p2[1])}`;
  }

  return `${d} Z`;
}

/** Quanti punti compongono la costa. Più punti = costa più articolata. */
const PUNTI_COSTA = 14;

/**
 * Genera il contorno di un'isola a partire dal suo seme.
 *
 * Parte da un cerchio e sposta ogni punto verso l'interno o verso l'esterno:
 * nascono così insenature e promontori. Lo stesso seme produce sempre
 * esattamente la stessa isola.
 */
export function contornoGenerato(
  seme: string,
  centroX: number,
  centroY: number,
  raggio: number,
): string {
  const casuale = generatoreCasuale(semeNumerico(seme));
  const punti: [number, number][] = [];

  for (let i = 0; i < PUNTI_COSTA; i++) {
    const angolo =
      (i / PUNTI_COSTA) * Math.PI * 2 + (casuale() - 0.5) * 0.22;
    const distanza = raggio * (0.62 + casuale() * 0.66);
    punti.push([
      centroX + Math.cos(angolo) * distanza,
      centroY + Math.sin(angolo) * distanza,
    ]);
  }

  return curvaChiusa(punti);
}
