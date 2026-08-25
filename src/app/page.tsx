import { Suspense } from "react";
import BarraLaterale from "@/components/BarraLaterale";
import MappaPagina from "@/components/MappaPagina";

export default function Home() {
  return (
    <div className="flex h-full min-h-svh w-full flex-1">
      <BarraLaterale />
      {/* La mappa occupa ciò che resta: non è larga quanto la finestra. */}
      <main className="relative min-w-0 flex-1">
        <Suspense fallback={null}>
          <MappaPagina />
        </Suspense>
      </main>
    </div>
  );
}
