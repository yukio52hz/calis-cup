import NextLink from "next/link";
import { notFound } from "next/navigation";

import { Card, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { getCompetitorDetail } from "@/features/admin/server/competitors";
import { REGISTRATION_STATUS } from "@/features/registrations/components/registration-status";
import { SUBMISSION_STATUS } from "@/features/submissions/components/submission-status";
import { CATEGORY_LABELS } from "@/features/users/schemas";
import { ROUTES } from "@/lib/constants";
import { formatColones, formatDateTime, formatDuration } from "@/lib/format";

const PAYMENT_KIND = {
  registration: "Inscripción",
  extra_video: "Video extra",
} as const;

export default async function AdminCompetitorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = /^[0-9a-f-]{36}$/.test(id)
    ? await getCompetitorDetail(id)
    : null;

  if (!data) notFound();

  const { profile, registration, payments, attempts, standing, rankings } =
    data;
  const registrationStatus = registration
    ? REGISTRATION_STATUS[registration.status]
    : null;

  return (
    <div className="flex flex-col gap-4 py-6">
      <NextLink
        className="text-sm font-semibold text-muted hover:text-foreground"
        href={ROUTES.adminCompetitors}
      >
        ← Volver a competidores
      </NextLink>

      <header className="flex flex-wrap items-center gap-2">
        <h1 className="font-display text-3xl uppercase leading-none">
          {profile.firstName} {profile.lastName}
        </h1>
        {profile.role === "admin" && (
          <StatusBadge tone="accent">Admin</StatusBadge>
        )}
      </header>

      <div className="grid gap-4 lg:grid-cols-2 lg:items-start">
        <div className="flex flex-col gap-4">
          <Card>
            <CardTitle eyebrow="PERFIL">Datos</CardTitle>
            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
              <dt className="text-muted">Email</dt>
              <dd className="truncate text-right font-semibold">
                {profile.email}
              </dd>
              <dt className="text-muted">Teléfono</dt>
              <dd className="text-right font-semibold">
                {profile.phone ?? "—"}
              </dd>
              <dt className="text-muted">Usuario</dt>
              <dd className="text-right font-semibold">
                {profile.username ?? "—"}
              </dd>
              <dt className="text-muted">Categoría</dt>
              <dd className="text-right font-semibold">
                {CATEGORY_LABELS[profile.category]}
              </dd>
              <dt className="text-muted">Registro</dt>
              <dd className="text-right font-semibold">
                {formatDateTime(profile.createdAt)}
              </dd>
            </dl>
          </Card>

          <Card>
            <CardTitle eyebrow="TORNEO ACTIVO">
              Inscripción y clasificación
            </CardTitle>
            <div className="flex flex-wrap items-center gap-2">
              {registrationStatus ? (
                <StatusBadge tone={registrationStatus.tone}>
                  {registrationStatus.label}
                </StatusBadge>
              ) : (
                <StatusBadge tone="neutral">Sin inscripción</StatusBadge>
              )}
              {registration && (
                <StatusBadge tone="neutral">
                  {CATEGORY_LABELS[registration.category]}
                </StatusBadge>
              )}
            </div>
            {registration?.rejectionReason && (
              <p className="mt-3 text-sm">
                <span className="text-muted">Motivo: </span>
                {registration.rejectionReason}
              </p>
            )}
            {registration && (
              <NextLink
                className="mt-3 inline-block text-sm font-semibold text-accent hover:underline"
                href={`${ROUTES.adminRegistrations}/${registration.id}`}
              >
                Ver inscripción →
              </NextLink>
            )}
            {standing && rankings && (
              <div className="mt-4 grid grid-cols-[auto_repeat(4,1fr)_auto] gap-2 text-center text-sm">
                <div className="rounded-lg bg-accent/15 px-3 py-2">
                  <p className="text-[0.65rem] text-muted">POS.</p>
                  <p className="font-display">#{standing.position}</p>
                </div>
                {rankings.weeks.map((week, i) => (
                  <div
                    key={week.number}
                    className="rounded-lg bg-background/50 px-1 py-2"
                  >
                    <p className="text-[0.65rem] text-muted">S{week.number}</p>
                    <p className="font-display">
                      {standing.weekPoints[i] ?? "–"}
                    </p>
                  </div>
                ))}
                <div className="rounded-lg bg-background/50 px-3 py-2">
                  <p className="text-[0.65rem] text-muted">TOTAL</p>
                  <p className="font-display">{standing.total}</p>
                </div>
              </div>
            )}
          </Card>

          <Card>
            <CardTitle eyebrow="SINPE">Pagos</CardTitle>
            {payments.length === 0 ? (
              <p className="text-sm text-muted">Sin pagos registrados.</p>
            ) : (
              <ul className="flex flex-col gap-2">
                {payments.map((payment) => {
                  const status = REGISTRATION_STATUS[payment.status];

                  return (
                    <li
                      key={payment.id}
                      className="flex items-center justify-between gap-3 rounded-lg bg-background/50 px-3 py-2 text-sm"
                    >
                      <div className="min-w-0">
                        <p className="font-semibold">
                          {PAYMENT_KIND[payment.kind]} ·{" "}
                          {formatColones(payment.amount)}
                        </p>
                        <p className="truncate text-xs text-muted">
                          Ref. {payment.reference} ·{" "}
                          {formatDateTime(payment.createdAt)}
                        </p>
                      </div>
                      <StatusBadge tone={status.tone}>
                        {status.label}
                      </StatusBadge>
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>
        </div>

        <Card>
          <CardTitle eyebrow="VIDEOS">Intentos</CardTitle>
          {attempts.length === 0 ? (
            <p className="text-sm text-muted">Todavía no ha enviado videos.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {attempts.map(({ submission, weekNumber, challengeName }) => {
                const status = SUBMISSION_STATUS[submission.status];

                return (
                  <li key={submission.id}>
                    <NextLink
                      className="flex items-center justify-between gap-3 rounded-lg bg-background/50 px-3 py-2.5 text-sm transition-colors hover:bg-background"
                      href={`${ROUTES.adminVideos}/${submission.id}`}
                    >
                      <div className="min-w-0">
                        <p className="font-semibold">
                          Semana {weekNumber} · Intento #
                          {submission.attemptNumber}
                        </p>
                        <p className="truncate text-xs text-muted">
                          {challengeName} ·{" "}
                          {formatDateTime(submission.createdAt)}
                        </p>
                      </div>
                      <span className="flex shrink-0 items-center gap-2">
                        {submission.finalTimeMs && (
                          <span className="font-display">
                            {formatDuration(submission.finalTimeMs)}
                          </span>
                        )}
                        <StatusBadge tone={status.tone}>
                          {status.label}
                        </StatusBadge>
                      </span>
                    </NextLink>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
