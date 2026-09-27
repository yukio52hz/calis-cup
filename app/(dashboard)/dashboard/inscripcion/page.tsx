import NextLink from "next/link";

import { Card, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { CopyButton } from "@/features/registrations/components/copy-button";
import { EnrollForm } from "@/features/registrations/components/enroll-form";
import { getMyRegistration } from "@/features/registrations/server/queries";
import { getActiveTournament } from "@/features/submissions/server/queries";
import { CATEGORY_LABELS } from "@/features/users/schemas";
import { ROUTES } from "@/lib/constants";
import { formatColones } from "@/lib/format";
import { requireProfile } from "@/server/auth/dal";

const includes = [
  "4 semanas de competencia",
  "4 retos",
  "1 video por semana",
  "Acumulación de puntos",
  "El 100% de las inscripciones va para premios",
];

export default async function EnrollPage() {
  const profile = await requireProfile();
  const tournament = await getActiveTournament();

  if (!tournament) {
    return (
      <Card className="my-6 text-center text-muted">
        Todavía no hay un torneo con inscripción abierta.
      </Card>
    );
  }

  const current = await getMyRegistration(tournament.id, profile.id);
  const status = current?.registration.status;

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-4 py-6">
      <header className="flex flex-col gap-2">
        <p className="text-xs font-bold tracking-[0.2em] text-muted">
          {tournament.name.toUpperCase()}
        </p>
        <h1 className="font-display text-3xl uppercase leading-none">
          Inscripción
        </h1>
      </header>

      {status === "approved" && (
        <Card className="flex flex-col items-center gap-3 border-success/30 bg-success/5 py-8 text-center">
          <StatusBadge tone="success">Inscripción aprobada</StatusBadge>
          <p className="font-display text-xl uppercase">
            Ya estás dentro del torneo
          </p>
          <NextLink
            className="button button--primary button--md rounded-xl font-bold"
            href={ROUTES.dashboard}
          >
            Ver reto
          </NextLink>
        </Card>
      )}

      {status === "pending_review" && (
        // §12: pendiente de revisión
        <Card className="flex flex-col gap-3 border-warning/30 bg-warning/5">
          <StatusBadge tone="warning">Pendiente de revisión</StatusBadge>
          <p className="font-bold">
            Tu pago está siendo revisado por el equipo.
          </p>
          <p className="text-sm text-muted">
            Te avisaremos cuando tu inscripción sea aprobada.
          </p>
          {current?.payment && (
            <dl className="grid grid-cols-2 gap-2 rounded-xl bg-background/50 p-3 text-sm">
              <dt className="text-muted">Monto</dt>
              <dd className="text-right font-semibold">
                {formatColones(current.payment.amount)}
              </dd>
              <dt className="text-muted">Referencia</dt>
              <dd className="text-right font-semibold">
                {current.payment.reference}
              </dd>
              <dt className="text-muted">Fecha</dt>
              <dd className="text-right font-semibold">
                {current.payment.paidOn}
              </dd>
            </dl>
          )}
        </Card>
      )}

      {(!status || status === "rejected") && (
        <>
          {status === "rejected" && (
            <Card className="flex flex-col gap-2 border-danger/30 bg-danger/5">
              <StatusBadge tone="danger">Inscripción rechazada</StatusBadge>
              <p className="font-bold">Tu inscripción necesita revisión</p>
              {current?.registration.rejectionReason && (
                <p className="rounded-lg bg-background/60 px-3 py-2 text-sm">
                  <span className="text-muted">Motivo: </span>
                  {current.registration.rejectionReason}
                </p>
              )}
              <p className="text-sm text-muted">
                Corrige la información y vuelve a enviarla abajo.
              </p>
            </Card>
          )}

          {/* §8-9: costo y datos para el SINPE */}
          <Card className="border-accent/40 bg-gradient-to-br from-accent/15 to-surface/70">
            <p className="text-xs font-bold tracking-widest text-muted">
              COSTO
            </p>
            <p className="font-display text-5xl">
              {formatColones(tournament.registrationFee)}
            </p>
            <ul className="mt-4 flex flex-col gap-1.5 text-sm">
              {includes.map((item) => (
                <li key={item} className="flex gap-2">
                  <span aria-hidden className="text-accent">
                    ✓
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </Card>

          <Card>
            <CardTitle eyebrow="PASO 1">Realiza el SINPE Móvil</CardTitle>
            {tournament.sinpeNumber ? (
              <div className="flex items-center justify-between gap-3 rounded-xl bg-background/50 px-4 py-3">
                <div>
                  <p className="text-xs text-muted">Número</p>
                  <p className="font-display text-2xl tracking-wider">
                    {tournament.sinpeNumber}
                  </p>
                </div>
                <CopyButton label="Copiar" value={tournament.sinpeNumber} />
              </div>
            ) : (
              <p className="text-sm text-muted">
                El número de SINPE se publicará pronto.
              </p>
            )}
            <p className="mt-3 text-sm text-muted">
              Monto:{" "}
              <strong>{formatColones(tournament.registrationFee)}</strong> ·
              Categoría: <strong>{CATEGORY_LABELS[profile.category]}</strong> (
              <NextLink
                className="text-accent hover:underline"
                href={ROUTES.profile}
              >
                cambiar
              </NextLink>
              )
            </p>
          </Card>

          <Card>
            <CardTitle eyebrow="PASO 2">Registra tu pago</CardTitle>
            <EnrollForm fee={tournament.registrationFee} />
          </Card>
        </>
      )}
    </div>
  );
}
