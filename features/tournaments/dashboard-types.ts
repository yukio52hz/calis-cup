// Forma de los datos del dashboard del competidor. Refleja las tablas de la
// especificación (§37-45) para que el mock se pueda reemplazar por queries.

export type RegistrationStatus =
  "not_registered" | "pending_review" | "approved" | "rejected";

export type WeekStatus = "upcoming" | "active" | "closed";

export type SubmissionStatus =
  "pending" | "under_review" | "approved" | "rejected";

export type ExtraVideoStatus =
  "available" | "pending_review" | "approved" | "unavailable";

export type CompetitorDashboard = {
  tournament: {
    name: string;
    registrationFee: number;
    extraVideoFee: number;
  };
  registration: {
    status: RegistrationStatus;
    rejectionReason?: string;
  };
  weeks: {
    number: number;
    status: WeekStatus;
    challengeName?: string;
    startsAt: Date;
    endsAt: Date;
  }[];
  activeChallenge: {
    week: number;
    name: string;
    objective: string;
    exercises: { name: string; reps: number; penaltySeconds: number }[];
    rules: string[];
    exampleVideoUrl?: string;
    endsAt: Date;
  } | null;
  // Mis intentos de la semana activa (§29)
  attempts: {
    number: number;
    status: SubmissionStatus;
    finalTimeMs?: number;
    submittedAt: Date;
  }[];
  extraVideo: ExtraVideoStatus;
  standing: {
    position: number;
    totalPoints: number;
    competitors: number;
  } | null;
  // Top de mi categoría (§23)
  leaderboard: {
    position: number;
    name: string;
    points: number;
    isMe?: boolean;
  }[];
};
