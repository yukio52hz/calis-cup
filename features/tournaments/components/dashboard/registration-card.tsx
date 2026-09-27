import type { CompetitorDashboard } from "../../dashboard-types";

import NextLink from "next/link";

import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { ROUTES } from "@/lib/constants";
import { formatColones } from "@/lib/format";

const btn = "button button--md w-full rounded-xl font-bold";

// Estado de inscripción (§10, §12)
export function RegistrationCard({
  registration,
  fee,
}: {
  registration: CompetitorDashboard["registration"];
  fee: number;
}) {
  switch (registration.status) {
    case "approved":
      return (
        <Card className="flex items-center justify-between gap-3 border-success/30 bg-success/5 py-4">
          <div>
            <p className="font-bold">Inscripción aprobada</p>
            <p className="text-sm text-muted">Ya estás dentro del torneo.</p>
          </div>
          <StatusBadge tone="success">Inscrito</StatusBadge>
        </Card>
      );

    case "pending_review":
      return (
        <Card className="border-warning/30 bg-warning/5">
          <StatusBadge tone="warning">Pendiente de revisión</StatusBadge>
          <p className="mt-3 font-bold">Estamos revisando tu pago</p>
          <p className="mt-1 text-sm text-muted">
            Te enviaremos un email cuando tu inscripción sea aprobada.
          </p>
        </Card>
      );

    case "rejected":
      return (
        <Card className="border-danger/30 bg-danger/5">
          <StatusBadge tone="danger">Inscripción rechazada</StatusBadge>
          <p className="mt-3 font-bold">Tu inscripción necesita revisión</p>
          {registration.rejectionReason && (
            <p className="mt-2 rounded-lg bg-background/60 px-3 py-2 text-sm">
              <span className="text-muted">Motivo: </span>
              {registration.rejectionReason}
            </p>
          )}
          <NextLink
            className={`${btn} button--primary mt-4`}
            href={ROUTES.enroll}
          >
            Volver a enviar
          </NextLink>
        </Card>
      );

    default:
      return (
        <Card className="border-accent/40 bg-gradient-to-br from-accent/15 to-surface/70">
          <p className="text-[0.65rem] font-bold tracking-[0.2em] text-muted">
            INSCRIPCIÓN
          </p>
          <p className="mt-1 font-display text-2xl uppercase">
            Entra al torneo
          </p>
          <p className="mt-2 text-sm text-muted">
            4 semanas · 4 retos · el 100% de las inscripciones va para premios.
          </p>
          <NextLink
            className={`${btn} button--primary mt-4`}
            href={ROUTES.enroll}
          >
            Inscribirme · {formatColones(fee)}
          </NextLink>
        </Card>
      );
  }
}
