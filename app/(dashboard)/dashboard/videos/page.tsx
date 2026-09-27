import NextLink from "next/link";

import { Card, CardTitle } from "@/components/ui/card";
import { ClockIcon, LockIcon } from "@/components/ui/icons";
import { StatusBadge } from "@/components/ui/status-badge";
import { SUBMISSION_STATUS } from "@/features/submissions/components/submission-status";
import { VideoUploader } from "@/features/submissions/components/video-uploader";
import {
  BLOCKED_MESSAGES,
  getUploadEligibility,
} from "@/features/submissions/server/eligibility";
import {
  getActiveTournament,
  listMySubmissions,
} from "@/features/submissions/server/queries";
import { ROUTES } from "@/lib/constants";
import { formatDateTime, formatDuration, formatTimeLeft } from "@/lib/format";
import { requireProfile } from "@/server/auth/dal";
import { createReadUrls } from "@/server/storage/files";

export default async function VideosPage() {
  const profile = await requireProfile();
  const [eligibility, tournament] = await Promise.all([
    getUploadEligibility(profile.id),
    getActiveTournament(),
  ]);
  const history = tournament
    ? await listMySubmissions(tournament.id, profile.id)
    : [];
  const playbackUrls = await createReadUrls(
    "videos",
    history.map((row) => row.submission.videoPath),
  );

  const active = eligibility.active;
  const currentWeekAttempts = active
    ? history.filter(
        (row) => row.submission.challengeId === active.challenge.id,
      )
    : [];
  const latest = currentWeekAttempts[0]?.submission;

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-4 py-6">
      <header className="flex flex-col gap-2">
        <p className="text-xs font-bold tracking-[0.2em] text-muted">
          {active
            ? `SEMANA ${active.week.weekNumber} · RETO #${active.week.weekNumber}`
            : "VIDEOS"}
        </p>
        <h1 className="font-display text-3xl uppercase leading-none">
          {active ? active.challenge.name : "Mis videos"}
        </h1>
        {active && (
          <p className="flex items-center gap-1.5 text-sm text-muted">
            <ClockIcon className="h-4 w-4" />
            Cierra en {formatTimeLeft(active.week.endsAt)} ·{" "}
            {formatDateTime(active.week.endsAt)}
          </p>
        )}
      </header>

      {eligibility.ok ? (
        <Card>
          <CardTitle eyebrow={`INTENTO #${eligibility.nextAttempt}`}>
            Sube tu video
          </CardTitle>
          <ul className="mb-4 flex flex-col gap-1.5 text-sm text-muted">
            <li>• Graba en 720p para que pese menos (máximo 50 MB).</li>
            <li>• Un solo video continuo, sin cortes ni edición.</li>
            <li>• Que se vea todo tu cuerpo durante el set.</li>
          </ul>
          <VideoUploader />
        </Card>
      ) : latest ? (
        // Estado del envío de la semana (§17)
        <Card className="flex flex-col items-center gap-3 py-8 text-center">
          <StatusBadge tone={SUBMISSION_STATUS[latest.status].tone}>
            {SUBMISSION_STATUS[latest.status].label}
          </StatusBadge>
          <p className="font-display text-xl uppercase">Video enviado</p>
          <p className="max-w-sm text-sm text-muted">
            {latest.status === "approved" && latest.finalTimeMs
              ? `Tu resultado final: ${formatDuration(latest.finalTimeMs)}.`
              : "Tu video fue recibido correctamente. Te notificaremos cuando sea revisado."}
          </p>
        </Card>
      ) : (
        <Card className="flex flex-col items-center gap-3 py-8 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-muted">
            <LockIcon className="h-5 w-5" />
          </span>
          <p className="max-w-sm text-sm text-muted">
            {BLOCKED_MESSAGES[eligibility.reason]}
          </p>
          {(eligibility.reason === "not_registered" ||
            eligibility.reason === "registration_rejected") && (
            <NextLink
              className="button button--primary button--md rounded-xl font-bold"
              href={ROUTES.enroll}
            >
              Ir a inscripción
            </NextLink>
          )}
        </Card>
      )}

      {history.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="text-xs font-bold tracking-[0.2em] text-muted">
            MIS INTENTOS
          </h2>
          {history.map(({ submission, weekNumber, challengeName }) => {
            const status = SUBMISSION_STATUS[submission.status];
            const url = playbackUrls.get(submission.videoPath);

            return (
              <Card key={submission.id} className="flex flex-col gap-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs text-muted">
                      Semana {weekNumber} · {challengeName}
                    </p>
                    <p className="font-bold">
                      Intento #{submission.attemptNumber}
                    </p>
                    <p className="text-xs text-muted">
                      Enviado {formatDateTime(submission.createdAt)}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <StatusBadge tone={status.tone}>{status.label}</StatusBadge>
                    {submission.finalTimeMs && (
                      <span className="font-display text-lg">
                        {formatDuration(submission.finalTimeMs)}
                      </span>
                    )}
                  </div>
                </div>
                {submission.reviewerNotes && (
                  <p className="rounded-lg bg-background/60 px-3 py-2 text-sm">
                    <span className="text-muted">Observación: </span>
                    {submission.reviewerNotes}
                  </p>
                )}
                {url && (
                  <details className="group">
                    <summary className="cursor-pointer text-sm font-semibold text-accent">
                      Ver video
                    </summary>
                    {/* Videos de ejercicios grabados por el usuario, sin diálogo: no llevan subtítulos */}
                    {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
                    <video
                      controls
                      playsInline
                      className="mt-3 max-h-[60vh] w-full rounded-xl bg-black"
                      preload="none"
                      src={url}
                    />
                  </details>
                )}
              </Card>
            );
          })}
        </section>
      )}
    </div>
  );
}
