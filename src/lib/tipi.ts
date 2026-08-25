export type Precisione = "canonica" | "stimata";

export type TipoLuogo = "isola" | "citta" | "regno" | "struttura" | "punto-notevole";

export type Mare =
  | "east-blue"
  | "west-blue"
  | "north-blue"
  | "south-blue"
  | "grand-line-paradise"
  | "nuovo-mondo"
  | "calm-belt"
  | "red-line";

export type Canone = "manga" | "anime" | "film" | "spinoff";

export type Forma =
  | { tipo: "generata"; seme: string }
  | { tipo: "path"; d: string };

export interface Luogo {
  id: string;
  coordinate: { x: number; y: number };
  precisione: Precisione;
  tipo: TipoLuogo;
  mare: Mare;
  canone: Canone;
  rivelatoAlCapitolo: number;
  ancoraggioNarrativo: number | null;
  archi: string[];
  dimensione: number;
  forma: Forma;
  immagini: string[];
}

export interface TestoLuogo {
  nome: string;
  sottotitolo: string;
  descrizione: string;
  curiosita: string;
}
