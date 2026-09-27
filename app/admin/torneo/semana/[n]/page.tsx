import NextLink from "next/link";
import { notFound } from "next/navigation";

import { Card, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { ChallengeEditor } from "@/features/tournaments/components/admin/challenge-editor";
import { ExampleVideo } from "@/features/tournaments/components/admin/example-video";
import { PublishControls } from "@/features/tournaments/components/admin/publish-controls";
import { WeekDatesForm } from "@/features/tournaments/components/admin/week-dates-form";
import {
  getManagedTournament,
  getWeekForEdit,
  listApprovedCompetitorIds,
} from "@/features/tournaments/server/admin-queries";
import { getWeekStatus } from "@/features/tournaments/week-status";
import { ROUTES } from "@/lib/constants";
import { toCrDateTimeInput } from "@/lib/dates";
import { formatDateTime } from "@/lib/format";
import { createReadUrls } from "@/server/storage/files";

export default async function AdminWeekPage({
  params,
}: {
  params: Promise<{ n: string }>;
}) {
  const weekNumber = Number((await params).n);
  const tournament = await getManagedTournament();
  const data =
    tournament && Number.isInteger(weekNumber)
      ? await getWeekForEdit(tournament.id, weekNumber)
      : null;

  if (!tournament || !data) notFound();

  const { week, challenge, exercises, videoCount } = data;
  const [exampleUrl, approvedIds] = await Promise.all([
    challenge?.exampleVideoPath
      ? createReadUrls("videos", [challenge.exampleVideoPath]).then((m) =>
          m.get(challenge.exampleVideoPath!),
        )
      : Promise.resolve(undefined),
    listApprovedCompetitorIds(tournament.id),
  ]);
  const status = getWeekStatus(week);

  return (
    <div className="flex flex-col gap-4 py-6">
      <NextLink
        className="text-sm font-semibold text-muted hover:text-foreground"
        href={ROUTES.adminTournament}
      >
        ← Volver al torneo
      </NextLink>

      <header className="flex flex-wrap items-center gap-2">
        <h1 className="font-display text-3xl uppercase leading-none">
          Semana {week.weekNumber}
        </h1>
        <StatusBadge tone={status === "active" ? "accent" : "neutral"}>
          {status === "active"
            ? "Activa"
            : status === "closed"
              ? "Cerrada"
              : "Próxima"}
        </StatusBadge>
      </header>

      {videoCount > 0 && (
        <p className="rounded-xl bg-warning/10 px-4 py-3 text-sm text-warning">
          Ya hay {videoCount} video(s) enviado(s) para este reto. Cambiar
          ejercicios o penalizaciones no modifica las revisiones ya guardadas.
        </p>
      )}

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:items-start">
        <Card>
          <CardTitle eyebrow={`RETO #${week.weekNumber}`}>Reto</CardTitle>
          <ChallengeEditor
            initial={
              challenge
                ? {
                    name: challenge.name,
                    objective: challenge.objective ?? "",
                    rules: challenge.rules,
                    exercises: exercises.map((e) => ({
                      name: e.name,
                      repetitions: e.repetitions,
                      penaltySeconds: e.penaltySeconds,
                    })),
                  }
                : null
            }
            weekId={week.id}
          />
        </Card>

        <div className="flex flex-col gap-4">
          <Card>
            <CardTitle eyebrow="PUBLICACIÓN">Publicar</CardTitle>
            <PublishControls
              announcedLabel={
                week.announcedAt ? formatDateTime(week.announcedAt) : null
              }
              approvedCount={approvedIds.length}
              hasChallenge={Boolean(challenge)}
              isPublished={Boolean(week.publishedAt)}
              isStarted={new Date() >= week.startsAt}
              weekId={week.id}
            />
          </Card>
          <Card>
            <CardTitle eyebrow="FECHAS">Disponible</CardTitle>
            <WeekDatesForm
              endsAt={toCrDateTimeInput(week.endsAt)}
              startsAt={toCrDateTimeInput(week.startsAt)}
              weekId={week.id}
            />
          </Card>
          <Card>
            <CardTitle eyebrow="VIDEO DE EJEMPLO">Demostración</CardTitle>
            <ExampleVideo
              currentUrl={exampleUrl ?? null}
              disabled={!challenge}
              weekId={week.id}
            />
          </Card>
        </div>
      </div>
    </div>
  );
}
