import { Suspense } from "react";
import MappaPagina from "@/components/MappaPagina";

export default function Home() {
  return (
    <div className="h-full min-h-svh w-full flex-1">
      <Suspense fallback={null}>
        <MappaPagina />
      </Suspense>
    </div>
  );
}
