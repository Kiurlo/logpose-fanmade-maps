import { ui } from "@/lib/contenuti";

/**
 * Colonna sinistra fissa.
 *
 * Oggi contiene solo il nome del progetto e il disclaimer, ma il suo scopo vero
 * è **riservare lo spazio**: qui andrà la barra scorrevole delle copertine dei
 * volumi (vedi 00-CONCEPT.md), e più avanti i filtri.
 *
 * Riservarlo adesso non è un vezzo: finché questa colonna esiste, la mappa non
 * è larga quanto la finestra. Tutto ciò che si aggancia ai bordi — la scheda del
 * luogo, il pannello di mappatura — si posiziona rispetto alla mappa, non allo
 * schermo. Aggiungere la colonna dopo avrebbe voluto dire rivedere ogni
 * posizionamento già dato per buono.
 *
 * Su schermo piccolo sparisce: il telefono non ha larghezza da regalare.
 */
export const LARGHEZZA_BARRA = "w-[180px]";

export default function BarraLaterale() {
  return (
    <aside
      className={`hidden shrink-0 flex-col justify-between bg-zinc-900 p-4 text-zinc-100 sm:flex ${LARGHEZZA_BARRA}`}
    >
      <div>
        <p className="text-lg font-semibold leading-tight">{ui.sito.nome}</p>
        <p className="mt-1 text-xs leading-snug text-zinc-400">
          {ui.sito.sottotitolo}
        </p>

        {/* Spazio riservato alla barra delle copertine. */}
        <div className="mt-6 rounded border border-dashed border-zinc-700 p-3">
          <p className="text-[11px] leading-snug text-zinc-500">
            {ui.sito.barraInArrivo}
          </p>
        </div>
      </div>

      <p className="mt-6 text-[10px] leading-snug text-zinc-500">
        {ui.sito.disclaimer}
      </p>
    </aside>
  );
}
