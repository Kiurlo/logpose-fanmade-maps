"use client";

import type { Luogo, TestoLuogo } from "@/lib/tipi";

const LARGHEZZA_MAPPA = 10000;
const ALTEZZA_MAPPA = 5000;
const RAGGIO_BASE = 90;

interface MappaProps {
  luoghi: (Luogo & TestoLuogo)[];
  selezionato: string | null;
  onSeleziona: (id: string) => void;
}

export default function Mappa({ luoghi, selezionato, onSeleziona }: MappaProps) {
  return (
    <svg
      viewBox={`0 0 ${LARGHEZZA_MAPPA} ${ALTEZZA_MAPPA}`}
      preserveAspectRatio="xMidYMid meet"
      className="block h-full w-full"
      role="img"
      aria-label="Mappa del mondo di One Piece"
    >
      <rect
        x={0}
        y={0}
        width={LARGHEZZA_MAPPA}
        height={ALTEZZA_MAPPA}
        fill="#1e5f8c"
      />

      {luoghi.map((luogo) => {
        const raggio = RAGGIO_BASE * luogo.dimensione;
        const attivo = luogo.id === selezionato;
        return (
          <g
            key={luogo.id}
            onClick={() => onSeleziona(luogo.id)}
            className="cursor-pointer"
          >
            <circle
              cx={luogo.coordinate.x}
              cy={luogo.coordinate.y}
              r={raggio}
              fill="#d9b26f"
              stroke={attivo ? "#ffffff" : "#3f2a14"}
              strokeWidth={attivo ? 24 : 12}
            />
            <text
              x={luogo.coordinate.x}
              y={luogo.coordinate.y + raggio + 70}
              textAnchor="middle"
              fill="#ffffff"
              fontSize={70}
              className="select-none"
            >
              {luogo.nome}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
