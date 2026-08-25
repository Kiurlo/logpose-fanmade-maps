/**
 * Punti di ancoraggio dello spazio-mappa astratto.
 * Vedi /docs/01-ARCHITETTURA.md — "I punti di ancoraggio".
 *
 * Ogni coordinata dei dati va agganciata a questi riferimenti, mai messa a occhio.
 */

export const LARGHEZZA_MAPPA = 10000;
export const ALTEZZA_MAPPA = 5000;

/** La Grand Line taglia il mondo a metà in orizzontale. */
export const GRAND_LINE_Y = ALTEZZA_MAPPA / 2;

/** Primo incrocio fra Red Line e Grand Line. */
export const REVERSE_MOUNTAIN_X = LARGHEZZA_MAPPA / 2;

/**
 * Secondo incrocio, agli antipodi (Mary Geoise / Isola degli Uomini-Pesce).
 * È la cucitura del mondo: x = 0 e x = 10000 sono lo stesso meridiano.
 */
export const CUCITURA_X = 0;

export const SPESSORE_GRAND_LINE = 340;
export const SPESSORE_RED_LINE = 240;

/** I quattro mari, un quadrante ciascuno. Serve a controllare le coordinate. */
export const QUADRANTI = {
  "north-blue": { xMin: 0, xMax: 5000, yMin: 0, yMax: 2500 },
  "east-blue": { xMin: 5000, xMax: 10000, yMin: 0, yMax: 2500 },
  "west-blue": { xMin: 0, xMax: 5000, yMin: 2500, yMax: 5000 },
  "south-blue": { xMin: 5000, xMax: 10000, yMin: 2500, yMax: 5000 },
} as const;
