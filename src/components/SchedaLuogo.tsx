"use client";

import type { Luogo, TestoLuogo } from "@/lib/tipi";
import { contenutiIn, luogoPerId, ui } from "@/lib/contenuti";

interface SchedaLuogoProps {
  luogo: Luogo & TestoLuogo;
  onChiudi: () => void;
  onSeleziona: (id: string) => void;
}

export default function SchedaLuogo({
  luogo,
  onChiudi,
  onSeleziona,
}: SchedaLuogoProps) {
  const contenitore = luogoPerId(luogo.contenutoIn);
  const contenuti = contenutiIn(luogo.id);

  return (
    <aside className="absolute right-0 top-0 h-full w-full max-w-sm overflow-y-auto bg-white p-6 shadow-xl sm:right-4 sm:top-4 sm:h-auto sm:max-h-[calc(100%-2rem)] sm:rounded-lg">
      <button
        onClick={onChiudi}
        className="float-right text-xl leading-none text-zinc-400 hover:text-zinc-700"
        aria-label={ui.scheda.chiudi}
      >
        ×
      </button>

      <p className="text-xs uppercase tracking-wide text-zinc-400">
        {ui.tipi[luogo.tipo]}
      </p>
      <h2 className="text-2xl font-semibold">{luogo.nome}</h2>
      <p className="mt-1 text-sm text-zinc-500">{luogo.sottotitolo}</p>

      {contenitore && (
        <p className="mt-3 text-sm text-zinc-500">
          {ui.scheda.siTrovaIn}{" "}
          <button
            onClick={() => onSeleziona(contenitore.id)}
            className="font-medium text-sky-700 underline underline-offset-2 hover:text-sky-900"
          >
            {contenitore.nome}
          </button>
        </p>
      )}

      <p className="mt-4 text-zinc-700">{luogo.descrizione}</p>
      <p className="mt-4 text-sm italic text-zinc-500">{luogo.curiosita}</p>

      {contenuti.length > 0 && (
        <div className="mt-5 border-t border-zinc-200 pt-4">
          <p className="text-xs uppercase tracking-wide text-zinc-400">
            {ui.scheda.contiene}
          </p>
          <ul className="mt-2 space-y-1">
            {contenuti.map((figlio) => (
              <li key={figlio.id}>
                <button
                  onClick={() => onSeleziona(figlio.id)}
                  className="text-left text-sky-700 underline underline-offset-2 hover:text-sky-900"
                >
                  {figlio.nome}
                </button>
                <span className="ml-2 text-xs text-zinc-400">
                  {ui.tipi[figlio.tipo]}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <p className="mt-6 text-xs text-zinc-400">
        {ui.scheda.rivelatoAlCapitolo} {luogo.rivelatoAlCapitolo}
        {luogo.precisione === "stimata" && ` — ${ui.scheda.posizioneStimata}`}
      </p>
    </aside>
  );
}
