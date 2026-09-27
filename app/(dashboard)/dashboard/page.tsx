import { Card } from "@/components/ui/card";
import { DashboardView } from "@/features/tournaments/components/dashboard/dashboard-view";
import { getCompetitorDashboard } from "@/features/tournaments/server/dashboard";
import { CATEGORY_LABELS } from "@/features/users/schemas";
import { requireProfile } from "@/server/auth/dal";

export default async function DashboardPage() {
  const profile = await requireProfile();
  const data = await getCompetitorDashboard(profile);

  if (!data) {
    return (
      <div className="flex flex-col gap-4 py-6">
        <h1 className="font-display text-3xl uppercase leading-none">
          Hola, {profile.firstName}
        </h1>
        <Card className="text-center text-muted">
          Todavía no hay un torneo activo. Te avisaremos cuando abra la
          inscripción.
        </Card>
      </div>
    );
  }

  return (
    <DashboardView
      categoryLabel={CATEGORY_LABELS[profile.category]}
      data={data}
      firstName={profile.firstName}
    />
  );
}
