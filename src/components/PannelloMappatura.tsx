"use client";

import type { Riferimento } from "@/components/Mappa";

interface PannelloMappaturaProps {
  riferimento: Riferimento;
  onCambia: (valori: Partial<Riferimento>) => void;
  coordinata: { x: number; y: number } | null;
  ultimoClic: { x: number; y: number } | null;
}

const CAMPI = [
  { chiave: "x", etichetta: "Sinistra", passo: 20 },
  { chiave: "y", etichetta: "Alto", passo: 20 },
  { chiave: "larghezza", etichetta: "Larghezza", passo: 40 },
  { chiave: "altezza", etichetta: "Altezza", passo: 40 },
] as const;

export default function PannelloMappatura({
  riferimento,
  onCambia,
  coordinata,
  ultimoClic,
}: PannelloMappaturaProps) {
  return (
    <div
      className="absolute bottom-4 left-4 w-72 rounded-lg bg-zinc-900/92 p-4 text-zinc-100 shadow-xl"
      onClick={(evento) => evento.stopPropagation()}
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-amber-300">
        Modalità mappatura
      </p>
      <p className="mt-1 text-[11px] leading-snug text-zinc-400">
        Visibile solo sul tuo computer. Il riferimento non è nel progetto e non
        finisce sul sito pubblicato.
      </p>

      <div className="mt-3 rounded bg-black/40 p-2 text-center">
        <p className="text-[10px] uppercase tracking-wide text-zinc-500">
          Puntatore
        </p>
        <p className="font-mono text-lg leading-tight">
          {coordinata ? `${coordinata.x} , ${coordinata.y}` : "—"}
        </p>
        {ultimoClic && (
          <p className="mt-1 font-mono text-[11px] text-amber-300">
            copiato: {ultimoClic.x} , {ultimoClic.y}
          </p>
        )}
      </div>

      <label className="mt-3 block text-[11px] text-zinc-400">
        Trasparenza del riferimento
        <input
          type="range"
          min={0}
          max={1}
          step={0.05}
          value={riferimento.opacita}
          onChange={(e) => onCambia({ opacita: Number(e.target.value) })}
          className="mt-1 w-full"
        />
      </label>

      <div className="mt-2 grid grid-cols-2 gap-2">
        {CAMPI.map((campo) => (
          <label key={campo.chiave} className="text-[11px] text-zinc-400">
            {campo.etichetta}
            <input
              type="number"
              step={campo.passo}
              value={riferimento[campo.chiave]}
              onChange={(e) =>
                onCambia({ [campo.chiave]: Number(e.target.value) })
              }
              className="mt-0.5 w-full rounded bg-black/40 px-1.5 py-1 font-mono text-xs text-zinc-100"
            />
          </label>
        ))}
      </div>

      <p className="mt-3 text-[11px] leading-snug text-zinc-500">
        Allinea il riferimento sulle guide, poi clicca un punto del mare per
        copiarne le coordinate.
      </p>
    </div>
  );
}
