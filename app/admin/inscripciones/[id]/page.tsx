import NextLink from "next/link";
import { notFound } from "next/navigation";

import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { ReceiptPreview } from "@/features/payments/components/receipt-preview";
import { PaymentReviewForm } from "@/features/payments/components/payment-review-form";
import { reviewRegistrationAction } from "@/features/registrations/actions";
import { REGISTRATION_STATUS } from "@/features/registrations/components/registration-status";
import { getRegistrationForReview } from "@/features/registrations/server/queries";
import { CATEGORY_LABELS } from "@/features/users/schemas";
import { ROUTES } from "@/lib/constants";
import { formatColones, formatDateTime } from "@/lib/format";
import { createReadUrls } from "@/server/storage/files";

export default async function RegistrationReviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const row = /^[0-9a-f-]{36}$/.test(id)
    ? await getRegistrationForReview(id)
    : null;

  if (!row) notFound();

  const { registration, payment } = row;
  const receiptUrl = payment
    ? (await createReadUrls("receipts", [payment.receiptPath])).get(
        payment.receiptPath,
      )
    : undefined;
  const status = REGISTRATION_STATUS[registration.status];
  const wrongAmount = payment && payment.amount !== row.expectedFee;

  return (
    <div className="flex flex-col gap-4 py-6">
      <NextLink
        className="text-sm font-semibold text-muted hover:text-foreground"
        href={ROUTES.adminRegistrations}
      >
        ← Volver a inscripciones
      </NextLink>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:items-start">
        {payment ? (
          <ReceiptPreview path={payment.receiptPath} url={receiptUrl} />
        ) : (
          <div />
        )}

        <div className="flex flex-col gap-4">
          <Card>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xl font-bold">
                  {row.firstName} {row.lastName}
                </p>
                <p className="text-sm text-muted">{row.email}</p>
                {row.phone && <p className="text-sm text-muted">{row.phone}</p>}
              </div>
              <StatusBadge tone={status.tone}>{status.label}</StatusBadge>
            </div>
            <dl className="mt-4 grid grid-cols-2 gap-y-2 text-sm">
              <dt className="text-muted">Categoría</dt>
              <dd className="text-right font-semibold">
                {CATEGORY_LABELS[registration.category]}
              </dd>
              {payment && (
                <>
                  <dt className="text-muted">Monto</dt>
                  <dd className="text-right font-semibold">
                    {formatColones(payment.amount)}
                    {wrongAmount && (
                      <span className="block text-xs text-danger">
                        Esperado: {formatColones(row.expectedFee)}
                      </span>
                    )}
                  </dd>
                  <dt className="text-muted">Referencia SINPE</dt>
                  <dd className="text-right font-semibold">
                    {payment.reference}
                  </dd>
                  <dt className="text-muted">Fecha del pago</dt>
                  <dd className="text-right font-semibold">{payment.paidOn}</dd>
                  <dt className="text-muted">Enviado</dt>
                  <dd className="text-right font-semibold">
                    {formatDateTime(payment.createdAt)}
                  </dd>
                </>
              )}
            </dl>
            {registration.rejectionReason && (
              <p className="mt-4 rounded-lg bg-danger/10 px-3 py-2 text-sm">
                <span className="text-muted">Motivo del rechazo: </span>
                {registration.rejectionReason}
              </p>
            )}
          </Card>

          <Card>
            <h1 className="mb-4 font-display text-xl uppercase">Revisión</h1>
            <PaymentReviewForm
              nextLabel="Al guardar, abrir la siguiente inscripción pendiente"
              reviewAction={reviewRegistrationAction.bind(
                null,
                registration.id,
              )}
            />
          </Card>
        </div>
      </div>
    </div>
  );
}
