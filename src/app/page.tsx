import { Suspense } from "react";
import BarraLaterale from "@/components/BarraLaterale";
import MappaPagina from "@/components/MappaPagina";

/**
 * La disposizione dello schermo. Vedi 01-ARCHITETTURA.md — "La disposizione
 * dello schermo" per la mappa completa delle fasce e il perché di ciascuna.
 *
 * Le fasce vuote non si costruiscono finché non hanno contenuto: qui restano
 * indicate come commenti, così aggiungerle sarà un innesto e non una
 * ristrutturazione.
 */
export default function Home() {
  return (
    <div className="flex h-full min-h-svh w-full flex-1 flex-col">
      <div className="flex min-h-0 flex-1">
        <BarraLaterale />

        {/* La mappa occupa ciò che resta: non è larga quanto la finestra.
            Scheda del luogo e menu Info/Lingua galleggiano qui dentro, quindi
            non possono mai finire sopra le fasce laterali. */}
        <main className="relative min-w-0 flex-1">
          <Suspense fallback={null}>
            <MappaPagina />
          </Suspense>
        </main>

        {/* FASCIA DESTRA (~220 px) — filtri: rotte, ciurme, personaggi.
            Concept #2 e #5. Da costruire quando ci saranno rotte da filtrare. */}
      </div>

      {/* FASCIA IN BASSO, a tutta larghezza — timeline e progresso no-spoiler.
          Sta sotto tutto perché governa tutto: quali copertine, quali rotte,
          quali luoghi. Concept #4. */}
    </div>
  );
}
