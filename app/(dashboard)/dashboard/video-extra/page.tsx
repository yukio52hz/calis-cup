import NextLink from "next/link";

import { Card, CardTitle } from "@/components/ui/card";
import { LockIcon } from "@/components/ui/icons";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  requestExtraReceiptUploadAction,
  submitExtraPaymentAction,
} from "@/features/extra-videos/actions";
import { EXTRA_STATUS } from "@/features/extra-videos/components/extra-status";
import { getExtraPurchaseEligibility } from "@/features/extra-videos/server/eligibility";
import { listMyExtras } from "@/features/extra-videos/server/queries";
import { CopyButton } from "@/features/payments/components/copy-button";
import { PaymentForm } from "@/features/payments/components/payment-form";
import { getRankings } from "@/features/rankings/server/queries";
import {
  getActiveChallenge,
  getActiveTournament,
} from "@/features/submissions/server/queries";
import { ROUTES } from "@/lib/constants";
import { formatColones, formatDateTime, formatDuration } from "@/lib/format";
import { requireProfile } from "@/server/auth/dal";

export default async function ExtraVideoPage() {
  const profile = await requireProfile();
  const tournament = await getActiveTournament();
  const active = tournament ? await getActiveChallenge(tournament.id) : null;

  if (!tournament || !active) {
    return (
      <Card className="my-6 text-center text-muted">
        No hay una semana activa. Los videos extra solo se compran durante la
        semana del reto.
      </Card>
    );
  }

  const [eligibility, extras, rankings] = await Promise.all([
    getExtraPurchaseEligibility(profile.id),
    listMyExtras(active.challenge.id, profile.id),
    getRankings(profile.category, profile.id),
  ]);
  const myWeek = rankings?.weekly[active.week.weekNumber]?.find(
    (row) => row.isMe,
  );
  const available = extras.find((e) => e.status === "available");
  const pending = extras.find((e) => e.status === "pending_review");

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-4 py-6">
      <header className="flex flex-col gap-2">
        <p className="text-xs font-bold tracking-[0.2em] text-muted">
          SEMANA {active.week.weekNumber} ·{" "}
          {active.challenge.name.toUpperCase()}
        </p>
        <h1 className="font-display text-3xl uppercase leading-none">
          Video extra
        </h1>
      </header>

      {/* §25: resultado y posición actuales */}
      <Card className="grid grid-cols-2 gap-3 text-center">
        <div>
          <p className="text-xs text-muted">TU RESULTADO</p>
          <p className="font-display text-3xl">
            {myWeek ? formatDuration(myWeek.finalTimeMs) : "--:--"}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted">POSICIÓN ACTUAL</p>
          <p className="font-display text-3xl">
            {myWeek ? `#${myWeek.position}` : "—"}
          </p>
        </div>
      </Card>

      {available && (
        // §27: pago aprobado → se habilita el nuevo intento
        <Card className="flex flex-col gap-3 border-success/30 bg-success/5">
          <StatusBadge tone="success">Pago aprobado</StatusBadge>
          <p className="font-bold">Ya puedes realizar un nuevo intento.</p>
          <NextLink
            className="button button--primary button--lg rounded-xl font-bold"
            href={ROUTES.videos}
          >
            Subir video extra
          </NextLink>
        </Card>
      )}

      {pending && (
        // §27: la subida sigue bloqueada hasta aprobar el pago
        <Card className="flex flex-col gap-3 border-warning/30 bg-warning/5">
          <StatusBadge tone="warning">Pendiente de aprobación</StatusBadge>
          <div className="flex items-center gap-2 rounded-xl border border-dashed border-white/15 px-4 py-3 text-muted">
            <LockIcon className="h-4 w-4" /> Subir video extra
          </div>
          <p className="text-sm text-muted">
            Esperando aprobación del pago. Te avisaremos por email.
          </p>
        </Card>
      )}

      {eligibility.ok ? (
        <>
          <Card className="border-accent/40 bg-gradient-to-br from-accent/15 to-surface/70">
            <p className="font-bold">¿Quieres mejorar tu tiempo?</p>
            <p className="mt-1 font-display text-4xl">
              {formatColones(tournament.extraVideoFee)}
            </p>
            <p className="mt-2 text-sm text-muted">
              Compra un intento adicional. Se toma tu mejor resultado válido de
              la semana. Disponible hasta el{" "}
              {formatDateTime(active.week.endsAt)}.
            </p>
          </Card>

          <Card>
            <CardTitle eyebrow="PASO 1">Realiza el SINPE Móvil</CardTitle>
            {tournament.sinpeNumber && (
              <div className="flex items-center justify-between gap-3 rounded-xl bg-background/50 px-4 py-3">
                <div>
                  <p className="text-xs text-muted">Número</p>
                  <p className="font-display text-2xl tracking-wider">
                    {tournament.sinpeNumber}
                  </p>
                </div>
                <CopyButton label="Copiar" value={tournament.sinpeNumber} />
              </div>
            )}
          </Card>

          <Card>
            <CardTitle eyebrow="PASO 2">Registra tu pago</CardTitle>
            <PaymentForm
              fee={tournament.extraVideoFee}
              requestReceiptUpload={requestExtraReceiptUploadAction}
              submitAction={submitExtraPaymentAction}
            />
          </Card>
        </>
      ) : (
        !available &&
        !pending && (
          <Card className="text-center text-sm text-muted">
            {eligibility.message}
          </Card>
        )
      )}

      {extras.length > 0 && (
        <section className="flex flex-col gap-2">
          <h2 className="text-xs font-bold tracking-[0.2em] text-muted">
            MIS VIDEOS EXTRA DE ESTA SEMANA
          </h2>
          {extras.map(({ extra, payment, status }) => (
            <Card key={extra.id} className="flex flex-col gap-2 py-3">
              <div className="flex items-center justify-between gap-3 text-sm">
                <span>
                  {formatColones(payment.amount)} · Ref. {payment.reference}
                </span>
                <StatusBadge tone={EXTRA_STATUS[status].tone}>
                  {EXTRA_STATUS[status].label}
                </StatusBadge>
              </div>
              {payment.rejectionReason && (
                <p className="text-sm">
                  <span className="text-muted">Motivo: </span>
                  {payment.rejectionReason}
                </p>
              )}
            </Card>
          ))}
        </section>
      )}
    </div>
  );
}
