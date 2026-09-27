import NextLink from "next/link";
import { notFound } from "next/navigation";

import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { reviewExtraAction } from "@/features/extra-videos/actions";
import { getExtraRequestForReview } from "@/features/extra-videos/server/queries";
import { PaymentReviewForm } from "@/features/payments/components/payment-review-form";
import { ReceiptPreview } from "@/features/payments/components/receipt-preview";
import { REGISTRATION_STATUS } from "@/features/registrations/components/registration-status";
import { SUBMISSION_STATUS } from "@/features/submissions/components/submission-status";
import { CATEGORY_LABELS } from "@/features/users/schemas";
import { ROUTES } from "@/lib/constants";
import { formatColones, formatDateTime, formatDuration } from "@/lib/format";
import { createReadUrls } from "@/server/storage/files";

export default async function AdminExtraReviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const row = /^[0-9a-f-]{36}$/.test(id)
    ? await getExtraRequestForReview(id)
    : null;

  if (!row) notFound();

  const { payment } = row;
  const receiptUrl = (
    await createReadUrls("receipts", [payment.receiptPath])
  ).get(payment.receiptPath);
  const status = REGISTRATION_STATUS[payment.status];
  const weekClosed = new Date() > row.weekEndsAt;

  return (
    <div className="flex flex-col gap-4 py-6">
      <NextLink
        className="text-sm font-semibold text-muted hover:text-foreground"
        href={ROUTES.adminExtras}
      >
        ← Volver a videos extra
      </NextLink>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:items-start">
        <ReceiptPreview path={payment.receiptPath} url={receiptUrl} />

        <div className="flex flex-col gap-4">
          <Card>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xl font-bold">
                  {row.firstName} {row.lastName}
                </p>
                <p className="text-sm text-muted">{row.email}</p>
              </div>
              <StatusBadge tone={status.tone}>{status.label}</StatusBadge>
            </div>
            <dl className="mt-4 grid grid-cols-2 gap-y-2 text-sm">
              <dt className="text-muted">Categoría</dt>
              <dd className="text-right font-semibold">
                {row.category ? CATEGORY_LABELS[row.category] : "—"}
              </dd>
              <dt className="text-muted">Semana</dt>
              <dd className="text-right font-semibold">
                {row.weekNumber} · {row.challengeName}
              </dd>
              <dt className="text-muted">Monto</dt>
              <dd className="text-right font-semibold">
                {formatColones(payment.amount)}
              </dd>
              <dt className="text-muted">Referencia SINPE</dt>
              <dd className="text-right font-semibold">{payment.reference}</dd>
              <dt className="text-muted">Fecha del pago</dt>
              <dd className="text-right font-semibold">{payment.paidOn}</dd>
              <dt className="text-muted">Enviado</dt>
              <dd className="text-right font-semibold">
                {formatDateTime(payment.createdAt)}
              </dd>
            </dl>

            <p className="mt-4 text-xs font-bold tracking-[0.2em] text-muted">
              INTENTOS DE LA SEMANA
            </p>
            <ul className="mt-2 flex flex-col gap-1.5">
              {row.attempts.map((attempt) => (
                <li
                  key={attempt.attemptNumber}
                  className="flex items-center justify-between rounded-lg bg-background/50 px-3 py-2 text-sm"
                >
                  <span>Intento #{attempt.attemptNumber}</span>
                  <span className="flex items-center gap-2">
                    {attempt.finalTimeMs && (
                      <span className="font-display">
                        {formatDuration(attempt.finalTimeMs)}
                      </span>
                    )}
                    <StatusBadge tone={SUBMISSION_STATUS[attempt.status].tone}>
                      {SUBMISSION_STATUS[attempt.status].label}
                    </StatusBadge>
                  </span>
                </li>
              ))}
            </ul>
          </Card>

          <Card>
            <h1 className="mb-4 font-display text-xl uppercase">Revisión</h1>
            {weekClosed && payment.status === "pending_review" && (
              <p className="mb-4 rounded-xl bg-warning/10 px-4 py-3 text-sm text-warning">
                La semana ya cerró: si lo apruebas, el competidor no podrá
                usarlo.
              </p>
            )}
            <PaymentReviewForm
              nextLabel="Al guardar, abrir la siguiente solicitud pendiente"
              reviewAction={reviewExtraAction.bind(null, row.extra.id)}
            />
          </Card>
        </div>
      </div>
    </div>
  );
}
