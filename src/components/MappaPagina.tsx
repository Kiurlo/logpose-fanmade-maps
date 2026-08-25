"use client";

import { useRouter, useSearchParams } from "next/navigation";
import Mappa from "@/components/Mappa";
import SchedaLuogo from "@/components/SchedaLuogo";
import type { Luogo, TestoLuogo } from "@/lib/tipi";
import datiLuoghi from "@data/luoghi.json";
import testiLuoghi from "@content/it/luoghi.json";

const luoghi: (Luogo & TestoLuogo)[] = (datiLuoghi as Luogo[]).map((luogo) => ({
  ...luogo,
  ...(testiLuoghi as Record<string, TestoLuogo>)[luogo.id],
}));

export default function MappaPagina() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selezionato = searchParams.get("luogo");
  const luogoSelezionato = luoghi.find((luogo) => luogo.id === selezionato) ?? null;

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

  return (
    <div className="relative h-full w-full bg-[#1e5f8c]">
      <Mappa luoghi={luoghi} selezionato={selezionato} onSeleziona={seleziona} />
      {luogoSelezionato && (
        <SchedaLuogo luogo={luogoSelezionato} onChiudi={chiudi} />
      )}
    </div>
  );
}
