"use client";

import type { Luogo, TestoLuogo } from "@/lib/tipi";

interface SchedaLuogoProps {
  luogo: Luogo & TestoLuogo;
  onChiudi: () => void;
}

export default function SchedaLuogo({ luogo, onChiudi }: SchedaLuogoProps) {
  return (
    <aside className="absolute right-0 top-0 h-full w-full max-w-sm overflow-y-auto bg-white p-6 shadow-xl sm:right-4 sm:top-4 sm:h-auto sm:max-h-[calc(100%-2rem)] sm:rounded-lg">
      <button
        onClick={onChiudi}
        className="float-right text-xl leading-none text-zinc-400 hover:text-zinc-700"
        aria-label="Chiudi scheda"
      >
        ×
      </button>
      <h2 className="text-2xl font-semibold">{luogo.nome}</h2>
      <p className="mt-1 text-sm text-zinc-500">{luogo.sottotitolo}</p>
      <p className="mt-4 text-zinc-700">{luogo.descrizione}</p>
      <p className="mt-4 text-sm italic text-zinc-500">{luogo.curiosita}</p>
      <p className="mt-6 text-xs text-zinc-400">
        Rivelato al capitolo {luogo.rivelatoAlCapitolo}
        {luogo.precisione === "stimata" && " — posizione stimata"}
      </p>
    </aside>
  );
}
