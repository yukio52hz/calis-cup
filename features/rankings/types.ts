import type { WeekStatus } from "@/features/tournaments/dashboard-types";

export type Category = "female" | "male";

export type RankingWeek = {
  number: number;
  status: WeekStatus;
  challengeName?: string;
};

export type Competitor = {
  id: string;
  name: string;
  isMe?: boolean;
};

// Clasificación semanal (§23): mejor resultado válido de cada competidor
export type WeeklyRow = Competitor & {
  position: number;
  rawTimeMs: number;
  penaltyMs: number;
  finalTimeMs: number;
  points: number;
};

// Clasificación acumulada (§24): puntos por semana + total
export type AccumulatedRow = Competitor & {
  position: number;
  // índice 0 = semana 1; null = sin resultado esa semana
  weekPoints: (number | null)[];
  total: number;
};

export type Rankings = {
  weeks: RankingWeek[];
  accumulated: AccumulatedRow[];
  weekly: Record<number, WeeklyRow[]>;
  isFinal: boolean;
};
