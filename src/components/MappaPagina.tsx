"use client";

import { useRouter, useSearchParams } from "next/navigation";
import Mappa from "@/components/Mappa";
import SchedaLuogo from "@/components/SchedaLuogo";
import { luoghiDiPrimoLivello, luogoPerId } from "@/lib/contenuti";

export default function MappaPagina() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selezionato = searchParams.get("luogo");
  const luogoSelezionato = luogoPerId(selezionato);

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
      <Mappa
        luoghi={luoghiDiPrimoLivello}
        selezionato={selezionato}
        onSeleziona={seleziona}
      />
      {luogoSelezionato && (
        <SchedaLuogo
          luogo={luogoSelezionato}
          onChiudi={chiudi}
          onSeleziona={seleziona}
        />
      )}
    </div>
  );
}
