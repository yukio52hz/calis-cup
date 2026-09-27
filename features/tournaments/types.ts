export type TournamentStatus = "draft" | "open" | "in_progress" | "finished";

export type Tournament = {
  id: string;
  slug: string;
  name: string;
  status: TournamentStatus;
  startsAt: Date;
};
