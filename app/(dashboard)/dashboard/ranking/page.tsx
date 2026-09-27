import type { Category } from "@/features/rankings/types";

import { Card } from "@/components/ui/card";
import { RankingView } from "@/features/rankings/components/ranking-view";
import { getRankings } from "@/features/rankings/server/queries";
import { requireProfile } from "@/server/auth/dal";

export default async function RankingPage({
  searchParams,
}: {
  searchParams: Promise<{ categoria?: string; vista?: string }>;
}) {
  const profile = await requireProfile();
  const params = await searchParams;
  // Por defecto: mi categoría y la clasificación acumulada
  const category: Category =
    params.categoria === "female" || params.categoria === "male"
      ? params.categoria
      : profile.category;
  const rankings = await getRankings(category, profile.id);

  if (!rankings) {
    return (
      <Card className="my-6 text-center text-muted">
        Todavía no hay un torneo activo.
      </Card>
    );
  }

  const view = rankings.weeks.some(
    (w) => String(w.number) === params.vista && w.status !== "upcoming",
  )
    ? params.vista!
    : "total";

  return <RankingView category={category} rankings={rankings} view={view} />;
}
