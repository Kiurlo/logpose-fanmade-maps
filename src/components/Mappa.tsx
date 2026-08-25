"use client";

import type { Luogo, TestoLuogo } from "@/lib/tipi";
import {
  ALTEZZA_MAPPA,
  CUCITURA_X,
  GRAND_LINE_Y,
  LARGHEZZA_MAPPA,
  REVERSE_MOUNTAIN_X,
  SPESSORE_GRAND_LINE,
  SPESSORE_RED_LINE,
} from "@/lib/geografia";
import { ui } from "@/lib/contenuti";
import { contornoGenerato } from "@/lib/forme";

const RAGGIO_BASE = 90;

const COLORE_OCEANO = "#1e5f8c";
const COLORE_GRAND_LINE = "#2e7fa8";
const COLORE_RED_LINE = "#8f4b3c";
const COLORE_ISOLA = "#d9b26f";

/** Etichette dei quattro mari, al centro del rispettivo quadrante. */
const ETICHETTE_MARI = [
  { chiave: "north-blue", x: 2500, y: 1250 },
  { chiave: "east-blue", x: 7500, y: 1250 },
  { chiave: "west-blue", x: 2500, y: 3750 },
  { chiave: "south-blue", x: 7500, y: 3750 },
] as const;

/** Sfondo di riferimento, visibile solo in modalità mappatura (mai in produzione). */
export interface Riferimento {
  url: string;
  x: number;
  y: number;
  larghezza: number;
  altezza: number;
  opacita: number;
}

interface MappaProps {
  luoghi: (Luogo & TestoLuogo)[];
  selezionato: string | null;
  onSeleziona: (id: string) => void;
  riferimento?: Riferimento | null;
  onCoordinata?: (x: number, y: number) => void;
}

export default function Mappa({
  luoghi,
  selezionato,
  onSeleziona,
  riferimento,
  onCoordinata,
}: MappaProps) {
  /** Converte la posizione del puntatore in coordinate dello spazio-mappa. */
  function leggiCoordinata(evento: React.MouseEvent<SVGSVGElement>) {
    if (!onCoordinata) return;
    const svg = evento.currentTarget;
    const matrice = svg.getScreenCTM();
    if (!matrice) return;
    const punto = svg.createSVGPoint();
    punto.x = evento.clientX;
    punto.y = evento.clientY;
    const inMappa = punto.matrixTransform(matrice.inverse());
    onCoordinata(Math.round(inMappa.x), Math.round(inMappa.y));
  }

  return (
    <svg
      viewBox={`0 0 ${LARGHEZZA_MAPPA} ${ALTEZZA_MAPPA}`}
      preserveAspectRatio="xMidYMid meet"
      className="block h-full w-full"
      role="img"
      aria-label={ui.mappa.titoloAccessibile}
      onMouseMove={onCoordinata ? leggiCoordinata : undefined}
    >
      <rect
        x={0}
        y={0}
        width={LARGHEZZA_MAPPA}
        height={ALTEZZA_MAPPA}
        fill={COLORE_OCEANO}
      />

      {/* Mappa di riferimento da ricalcare. Solo in locale, mai sul sito pubblicato. */}
      {riferimento && (
        <image
          href={riferimento.url}
          x={riferimento.x}
          y={riferimento.y}
          width={riferimento.larghezza}
          height={riferimento.altezza}
          opacity={riferimento.opacita}
          preserveAspectRatio="none"
        />
      )}

      {/* In mappatura le guide restano visibili ma trasparenti: servono proprio
          ad allineare il riferimento, quindi si devono vedere entrambi. */}
      <g opacity={riferimento ? 0.4 : 1}>
        {/* Grand Line: la fascia orizzontale che taglia il mondo a metà */}
        <rect
          x={0}
          y={GRAND_LINE_Y - SPESSORE_GRAND_LINE / 2}
          width={LARGHEZZA_MAPPA}
          height={SPESSORE_GRAND_LINE}
          fill={COLORE_GRAND_LINE}
        />

        {/* Red Line: l'anello continentale. Sulla mappa piatta appare come due
            bande verticali — quella centrale (Reverse Mountain) e quella sulla
            cucitura del mondo, divisa fra bordo sinistro e bordo destro. */}
        <rect
          x={REVERSE_MOUNTAIN_X - SPESSORE_RED_LINE / 2}
          y={0}
          width={SPESSORE_RED_LINE}
          height={ALTEZZA_MAPPA}
          fill={COLORE_RED_LINE}
        />
        <rect
          x={CUCITURA_X}
          y={0}
          width={SPESSORE_RED_LINE / 2}
          height={ALTEZZA_MAPPA}
          fill={COLORE_RED_LINE}
        />
        <rect
          x={LARGHEZZA_MAPPA - SPESSORE_RED_LINE / 2}
          y={0}
          width={SPESSORE_RED_LINE / 2}
          height={ALTEZZA_MAPPA}
          fill={COLORE_RED_LINE}
        />
      </g>

      {ETICHETTE_MARI.map((mare) => (
        <text
          key={mare.chiave}
          x={mare.x}
          y={mare.y}
          textAnchor="middle"
          fill="#ffffff"
          fillOpacity={0.38}
          fontSize={200}
          className="select-none"
        >
          {ui.mari[mare.chiave]}
        </text>
      ))}

      <text
        x={REVERSE_MOUNTAIN_X}
        y={340}
        textAnchor="middle"
        fill="#ffffff"
        fillOpacity={0.45}
        fontSize={120}
        className="select-none"
      >
        {ui.mari["red-line"]}
      </text>

      {luoghi.map((luogo) => {
        const raggio = RAGGIO_BASE * luogo.dimensione;
        const attivo = luogo.id === selezionato;

        // Due sole possibilità: il contorno è tracciato a mano nei dati,
        // oppure lo genera il codice dal seme. Vedi src/lib/forme.ts
        //
        // In entrambi i casi il contorno è disegnato attorno all'origine (0,0)
        // e poi spostato al suo posto: così cambiare `coordinate` sposta anche
        // la forma, invece di lasciarla indietro.
        const contorno =
          luogo.forma.tipo === "path"
            ? luogo.forma.d
            : contornoGenerato(luogo.forma.seme, 0, 0, raggio);

        return (
          <g
            key={luogo.id}
            onClick={(evento) => {
              evento.stopPropagation();
              onSeleziona(luogo.id);
            }}
            className="cursor-pointer"
          >
            <path
              d={contorno}
              transform={`translate(${luogo.coordinate.x} ${luogo.coordinate.y})`}
              fill={COLORE_ISOLA}
              stroke={attivo ? "#ffffff" : "#3f2a14"}
              strokeWidth={attivo ? 24 : 12}
              strokeLinejoin="round"
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
