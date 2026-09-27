import NextLink from "next/link";

import { Card } from "@/components/ui/card";
import { ChevronRightIcon } from "@/components/ui/icons";
import { getAdminStats } from "@/features/admin/server/stats";
import { ROUTES } from "@/lib/constants";

export default async function AdminDashboardPage() {
  const stats = await getAdminStats();

  const tiles = [
    { label: "Competidores", value: stats.competitors, href: null },
    {
      label: "Inscripciones pendientes",
      value: stats.registrationsPending,
      href: null,
      highlight: stats.registrationsPending > 0,
    },
    {
      label: "Videos pendientes",
      value: stats.pendingVideos,
      href: ROUTES.adminVideos,
      highlight: stats.pendingVideos > 0,
    },
    {
      label: "Pagos pendientes",
      value: stats.pendingPayments ?? "—",
      href: null,
    },
    {
      label: "Semana activa",
      value: stats.activeWeek ? `${stats.activeWeek}/${stats.totalWeeks}` : "—",
      href: null,
    },
    {
      label: "Inscritos aprobados",
      value: stats.registrationsApproved,
      href: null,
    },
  ];

  return (
    <div className="flex flex-col gap-6 py-6">
      <header>
        <p className="text-xs font-bold tracking-[0.2em] text-muted">ADMIN</p>
        <h1 className="font-display text-3xl uppercase leading-none">
          {stats.tournamentName ?? "Sin torneo activo"}
        </h1>
      </header>

      <ul className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        {tiles.map((tile) => {
          const content = (
            <Card
              className={
                tile.highlight
                  ? "h-full border-accent/40 bg-accent/10"
                  : "h-full"
              }
            >
              <p className="font-display text-3xl">{tile.value}</p>
              <p className="mt-1 flex items-center justify-between gap-2 text-sm text-muted">
                {tile.label}
                {tile.href && <ChevronRightIcon className="h-4 w-4 shrink-0" />}
              </p>
            </Card>
          );

          return (
            <li key={tile.label}>
              {tile.href ? (
                <NextLink className="block h-full" href={tile.href}>
                  {content}
                </NextLink>
              ) : (
                content
              )}
            </li>
          );
        })}
      </ul>

      {stats.pendingVideos > 0 && (
        <NextLink
          className="button button--primary button--lg w-full rounded-xl font-bold sm:w-auto sm:self-start"
          href={ROUTES.adminVideos}
        >
          Revisar videos pendientes ({stats.pendingVideos})
        </NextLink>
      )}
    </div>
  );
}
