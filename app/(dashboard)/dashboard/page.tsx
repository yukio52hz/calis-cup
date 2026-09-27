import { DashboardView } from "@/features/tournaments/components/dashboard/dashboard-view";
import {
  MOCK_STATES,
  getCompetitorDashboard,
} from "@/features/tournaments/server/dashboard";
import { CATEGORY_LABELS } from "@/features/users/schemas";
import { requireProfile } from "@/server/auth/dal";

const isDev = process.env.NODE_ENV !== "production";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ estado?: string }>;
}) {
  const profile = await requireProfile();
  const { estado } = await searchParams;
  // Solo en desarrollo: ?estado=... para ver cada estado con datos de ejemplo
  const mockState =
    MOCK_STATES.find((state) => isDev && state === estado) ?? "approved";
  const data = await getCompetitorDashboard(profile.id, mockState);

  return (
    <DashboardView
      categoryLabel={CATEGORY_LABELS[profile.category]}
      data={data}
      firstName={profile.firstName}
      mockState={isDev ? mockState : undefined}
    />
  );
}
