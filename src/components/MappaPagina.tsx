"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Mappa, { type Riferimento } from "@/components/Mappa";
import PannelloMappatura from "@/components/PannelloMappatura";
import SchedaLuogo from "@/components/SchedaLuogo";
import { luoghiDiPrimoLivello, luogoPerId } from "@/lib/contenuti";
import { LARGHEZZA_MAPPA } from "@/lib/geografia";

/**
 * Modalità mappatura: si attiva aggiungendo ?mappatura=1 all'indirizzo.
 * Mostra sotto la mappa un'immagine di riferimento da ricalcare e legge le
 * coordinate al clic. Serve solo mentre si cataloga, in locale.
 *
 * ATTENZIONE — questi valori non sono a occhio: sono calcolati misurando dove
 * cadono i punti di ancoraggio dentro l'immagine di riferimento attuale
 * (5567 x 4052 px), e servono a farli combaciare con i nostri:
 *
 *   Grand Line       nell'immagine al 53,92% dell'altezza  -> deve stare a y = 2500
 *   Red Line centrale nell'immagine al 48,32% della larghezza -> deve stare a x = 5000
 *
 * Senza questa correzione ogni luogo catalogato finirebbe spostato di ~200
 * unità in basso e ~170 a sinistra: un errore sistematico su tutte le schede.
 *
 * SE SI CAMBIA IMMAGINE questi numeri non valgono più e vanno rimisurati.
 * Il procedimento è descritto in /docs/01-ARCHITETTURA.md.
 */
const RIFERIMENTO_INIZIALE: Riferimento = {
  url: "/riferimento/mappa.jpg",
  x: -25,
  y: -439,
  larghezza: 10400,
  altezza: 5450,
  opacita: 0.75,
};

export default function MappaPagina() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selezionato = searchParams.get("luogo");
  const luogoSelezionato = luogoPerId(selezionato);
  const mappatura = searchParams.get("mappatura") === "1";

  const [riferimento, setRiferimento] = useState(RIFERIMENTO_INIZIALE);
  const [coordinata, setCoordinata] = useState<{ x: number; y: number } | null>(
    null,
  );
  const [ultimoClic, setUltimoClic] = useState<{ x: number; y: number } | null>(
    null,
  );

  function seleziona(id: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("luogo", id);
    router.push(`?${params.toString()}`, { scroll: false });
  }

  function chiudi() {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("luogo");
    const query = params.toString();
    router.push(query ? `?${query}` : "?", { scroll: false });
  }

  function copiaCoordinata() {
    if (!coordinata) return;
    setUltimoClic(coordinata);
    navigator.clipboard
      ?.writeText(`"coordinate": { "x": ${coordinata.x}, "y": ${coordinata.y} }`)
      .catch(() => {
        /* se la copia non è permessa, il valore resta comunque a schermo */
      });
  }

  return (
    <div
      className="relative h-full w-full bg-[#1e5f8c]"
      onClick={mappatura ? copiaCoordinata : undefined}
    >
      <Mappa
        luoghi={luoghiDiPrimoLivello}
        selezionato={selezionato}
        onSeleziona={seleziona}
        riferimento={mappatura ? riferimento : null}
        onCoordinata={
          mappatura ? (x, y) => setCoordinata({ x, y }) : undefined
        }
      />
      {luogoSelezionato && (
        <SchedaLuogo
          luogo={luogoSelezionato}
          onChiudi={chiudi}
          onSeleziona={seleziona}
          lato={
            luogoSelezionato.coordinate.x >= LARGHEZZA_MAPPA / 2
              ? "sinistra"
              : "destra"
          }
        />
      )}
      {mappatura && (
        <PannelloMappatura
          riferimento={riferimento}
          onCambia={(valori) =>
            setRiferimento((precedente) => ({ ...precedente, ...valori }))
          }
          coordinata={coordinata}
          ultimoClic={ultimoClic}
        />
      )}
    </div>
  );
}
