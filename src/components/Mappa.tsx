"use client";

import type { Luogo, TestoLuogo } from "@/lib/tipi";
import {
  ALTEZZA_MAPPA,
  GRAND_LINE_Y,
  LARGHEZZA_MAPPA,
  REVERSE_MOUNTAIN_X,
  SPESSORE_GRAND_LINE,
} from "@/lib/geografia";
import { ui } from "@/lib/contenuti";
import { contornoGenerato } from "@/lib/forme";
import { CONTORNO_OCEANO } from "@/lib/oceano";

const RAGGIO_BASE = 90;
/** I punti notevoli (Reverse Mountain, Capo Gemello...) non sono isole: sono
 * un segnalino sulla mappa, non una forma piena. Vedi 01-ARCHITETTURA.md. */
const RAGGIO_PUNTO_NOTEVOLE = 35;

const COLORE_OCEANO = "#1e5f8c";
const COLORE_GRAND_LINE = "#2e7fa8";
const COLORE_RED_LINE = "#8f4b3c";
const COLORE_ISOLA = "#d9b26f";
const COLORE_PUNTO_NOTEVOLE = "#ffe9a8";

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
      {/* La Red Line è lo sfondo di TUTTA la mappa, non due strisce come si
          pensava all'inizio: la mappa di riferimento mostra che avvolge ogni
          mare su ogni lato (anche sopra e sotto, i poli), non solo a destra e
          a sinistra. L'oceano navigabile — i quattro mari più la Grand Line,
          tutti connessi intorno a Reverse Mountain — è il grande ritaglio
          disegnato sopra, non il contrario. Vedi 01-ARCHITETTURA.md. */}
      <rect
        x={0}
        y={0}
        width={LARGHEZZA_MAPPA}
        height={ALTEZZA_MAPPA}
        fill={COLORE_RED_LINE}
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

      <defs>
        {/* La fascia della Grand Line è larga quanto tutta la mappa, ma
            l'oceano no: fuori dal suo contorno è terra (Red Line), anche
            alla stessa altezza (i quattro mari, ai loro bordi esterni,
            toccano comunque la Red Line). Senza questo ritaglio la fascia
            dipingerebbe di blu anche quella terra. */}
        <clipPath id="ritaglio-oceano">
          <path d={CONTORNO_OCEANO} />
        </clipPath>
      </defs>

      {/* In mappatura le guide restano visibili ma trasparenti: servono proprio
          ad allineare il riferimento, quindi si devono vedere entrambi. */}
      <g opacity={riferimento ? 0.4 : 1}>
        {/* L'oceano: un solo grande ritaglio, ricalcato dalla mappa di
            riferimento (src/lib/oceano.ts). I quattro mari non sono davvero
            separati — intorno a Reverse Mountain sono connessi da stretti
            canali — quindi sono un contorno solo, non quattro. */}
        <path d={CONTORNO_OCEANO} fill={COLORE_OCEANO} />

        {/* Grand Line: la fascia orizzontale che taglia il mondo a metà,
            disegnata sopra l'oceano per restare visibile e distinta (è
            attraversabile, a differenza della Red Line), e ritagliata sulla
            stessa forma dell'oceano. */}
        <rect
          x={0}
          y={GRAND_LINE_Y - SPESSORE_GRAND_LINE / 2}
          width={LARGHEZZA_MAPPA}
          height={SPESSORE_GRAND_LINE}
          fill={COLORE_GRAND_LINE}
          clipPath="url(#ritaglio-oceano)"
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
        const attivo = luogo.id === selezionato;

        // Un punto notevole (Reverse Mountain, Capo Gemello...) non è un'isola:
        // è un luogo dentro un'altra terra (qui, dentro la Red Line stessa), e
        // si segna con un piccolo segnalino invece che con una forma piena —
        // altrimenti sembrerebbe un'isola a sé, che non è. Vedi 01-ARCHITETTURA.md.
        if (luogo.tipo === "punto-notevole") {
          return (
            <g
              key={luogo.id}
              onClick={(evento) => {
                evento.stopPropagation();
                onSeleziona(luogo.id);
              }}
              className="cursor-pointer"
            >
              <circle
                cx={luogo.coordinate.x}
                cy={luogo.coordinate.y}
                r={RAGGIO_PUNTO_NOTEVOLE}
                fill={COLORE_PUNTO_NOTEVOLE}
                stroke={attivo ? "#ffffff" : "#3f2a14"}
                strokeWidth={attivo ? 12 : 6}
              />
              <text
                x={luogo.coordinate.x}
                y={luogo.coordinate.y + RAGGIO_PUNTO_NOTEVOLE + 60}
                textAnchor="middle"
                fill="#ffffff"
                fontSize={70}
                className="select-none"
              >
                {luogo.nome}
              </text>
            </g>
          );
        }

        const raggio = RAGGIO_BASE * luogo.dimensione;

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
