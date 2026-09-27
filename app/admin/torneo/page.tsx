import NextLink from "next/link";
import clsx from "clsx";

import { Card, CardTitle } from "@/components/ui/card";
import { ChevronRightIcon } from "@/components/ui/icons";
import { StatusBadge } from "@/components/ui/status-badge";
import { PointsEditor } from "@/features/tournaments/components/admin/points-editor";
import { TournamentForm } from "@/features/tournaments/components/admin/tournament-form";
import { TOURNAMENT_STATUS_LABELS } from "@/features/tournaments/schemas";
import {
  getManagedTournament,
  listWeeksForAdmin,
} from "@/features/tournaments/server/admin-queries";
import { getWeekStatus } from "@/features/tournaments/week-status";
import { ROUTES } from "@/lib/constants";
import { formatShortDate } from "@/lib/format";

const WEEK_BADGE = {
  closed: { tone: "neutral", label: "Cerrada" },
  active: { tone: "accent", label: "Activa" },
  upcoming: { tone: "neutral", label: "Próxima" },
} as const;

export default async function AdminTournamentPage() {
  const tournament = await getManagedTournament();

  if (!tournament) {
    return (
      <div className="mx-auto flex w-full max-w-xl flex-col gap-4 py-6">
        <h1 className="font-display text-3xl uppercase leading-none">
          Nuevo torneo
        </h1>
        <Card>
          <TournamentForm />
        </Card>
      </div>
    );
  }

  const weeks = await listWeeksForAdmin(tournament.id);
  const now = new Date();

  return (
    <div className="flex flex-col gap-6 py-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-bold tracking-[0.2em] text-muted">
            TORNEO
          </p>
          <h1 className="font-display text-3xl uppercase leading-none">
            {tournament.name}
          </h1>
        </div>
        <StatusBadge
          tone={tournament.status === "active" ? "success" : "neutral"}
        >
          {TOURNAMENT_STATUS_LABELS[tournament.status]}
        </StatusBadge>
      </header>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] lg:items-start">
        <div className="flex flex-col gap-4">
          <Card>
            <CardTitle eyebrow="INFORMACIÓN Y CONFIGURACIÓN">
              Datos del torneo
            </CardTitle>
            <TournamentForm tournament={tournament} />
          </Card>
          <Card>
            <CardTitle eyebrow="SISTEMA DE PUNTOS">
              Puntos por posición
            </CardTitle>
            <PointsEditor
              pointsBeyond={tournament.pointsBeyond}
              pointsByPosition={tournament.pointsByPosition}
              tournamentId={tournament.id}
            />
          </Card>
        </div>

        <section className="flex flex-col gap-3">
          <h2 className="text-xs font-bold tracking-[0.2em] text-muted">
            SEMANAS Y RETOS
          </h2>
          {weeks.map(
            ({ week, challengeName, exercises, videos, hasExample }) => {
              const status = WEEK_BADGE[getWeekStatus(week, now)];
              const missing = [
                !challengeName && "sin reto",
                challengeName && exercises === 0 && "sin ejercicios",
                challengeName && !hasExample && "sin video de ejemplo",
              ].filter(Boolean);

              return (
                <NextLink
                  key={week.id}
                  className="block"
                  href={`${ROUTES.adminTournament}/semana/${week.weekNumber}`}
                >
                  <Card className="flex items-center justify-between gap-3 transition-colors hover:border-accent/50">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-display">
                          Semana {week.weekNumber}
                        </span>
                        <StatusBadge tone={status.tone}>
                          {status.label}
                        </StatusBadge>
                        {week.publishedAt ? (
                          <StatusBadge tone="success">Publicado</StatusBadge>
                        ) : (
                          <StatusBadge tone="warning">Borrador</StatusBadge>
                        )}
                      </div>
                      <p className="mt-1 truncate font-semibold">
                        {challengeName ?? "Reto sin definir"}
                      </p>
                      <p className="text-xs text-muted">
                        {formatShortDate(week.startsAt)} –{" "}
                        {formatShortDate(week.endsAt)} · {videos} video(s)
                      </p>
                      {missing.length > 0 && (
                        <p className={clsx("mt-1 text-xs text-warning")}>
                          Falta: {missing.join(", ")}
                        </p>
                      )}
                    </div>
                    <ChevronRightIcon className="h-5 w-5 shrink-0 text-muted" />
                  </Card>
                </NextLink>
              );
            },
          )}
        </section>
      </div>
    </div>
  );
}
