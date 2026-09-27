import type { WeekStatus } from "./dashboard-types";

// El estado de la semana se deriva de las fechas (§33) y de la publicación (§14)
export function getWeekStatus(
  week: { startsAt: Date; endsAt: Date; publishedAt: Date | null },
  now = new Date(),
): WeekStatus {
  if (now > week.endsAt) return "closed";
  if (now >= week.startsAt && week.publishedAt) return "active";

  return "upcoming";
}
