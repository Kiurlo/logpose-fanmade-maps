/**
 * L'UNICO punto del codice in cui si sceglie la lingua.
 *
 * Oggi è fissa sull'italiano. Quando si aggiungeranno le altre lingue, il resto
 * dell'applicazione non va toccato: cambia solo questo file, che leggerà la lingua
 * dall'indirizzo (regola: lingua, progresso e filtri stanno nella query string).
 *
 * Per aggiungere una lingua: si crea /content/<lingua>/ con gli stessi file di
 * /content/it/, e si aggancia qui. Nessuna struttura da riprogettare.
 */

import datiLuoghi from "@data/luoghi.json";
import testiLuoghiIt from "@content/it/luoghi.json";
import uiIt from "@content/it/ui.json";
import type { Luogo, TestoLuogo } from "@/lib/tipi";

export const LINGUA_ATTIVA = "it";

/** Stringhe dell'interfaccia nella lingua attiva. */
export const ui = uiIt;

const testiLuoghi = testiLuoghiIt as Record<string, TestoLuogo>;

/**
 * Se manca la traduzione di un luogo si mostra il suo id invece di far crashare
 * la pagina: il buco resta visibile, ma il sito continua a funzionare.
 */
function testoDi(id: string): TestoLuogo {
  return (
    testiLuoghi[id] ?? {
      nome: id,
      sottotitolo: "",
      descrizione: "",
      curiosita: "",
    }
  );
}

/** I luoghi con i loro testi già uniti, pronti da usare. */
export const luoghi: (Luogo & TestoLuogo)[] = (
  datiLuoghi as unknown as Luogo[]
).map((luogo) => ({ ...luogo, ...testoDi(luogo.id) }));

/** Solo i luoghi da disegnare sulla mappa del mondo (vedi 02-SCHEMA-DATI.md). */
export const luoghiDiPrimoLivello = luoghi.filter(
  (luogo) => luogo.contenutoIn === null,
);

export function luogoPerId(id: string | null) {
  return luoghi.find((luogo) => luogo.id === id) ?? null;
}

export function contenutiIn(id: string) {
  return luoghi.filter((luogo) => luogo.contenutoIn === id);
}
