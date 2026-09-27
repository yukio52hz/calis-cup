import NextLink from "next/link";
import clsx from "clsx";

import { Card } from "@/components/ui/card";
import { ChevronRightIcon } from "@/components/ui/icons";
import { StatusBadge } from "@/components/ui/status-badge";
import { REGISTRATION_STATUS } from "@/features/registrations/components/registration-status";
import {
  listRegistrationsForReview,
  type RegistrationFilter,
} from "@/features/registrations/server/queries";
import { CATEGORY_LABELS } from "@/features/users/schemas";
import { ROUTES } from "@/lib/constants";
import { formatColones, formatDateTime } from "@/lib/format";

const FILTERS: { value: RegistrationFilter; label: string }[] = [
  { value: "pending_review", label: "Pendientes" },
  { value: "approved", label: "Aprobadas" },
  { value: "rejected", label: "Rechazadas" },
];

export default async function AdminRegistrationsPage({
  searchParams,
}: {
  searchParams: Promise<{ estado?: string; revisado?: string }>;
}) {
  const params = await searchParams;
  const filter =
    FILTERS.find((f) => f.value === params.estado)?.value ?? "pending_review";
  const rows = await listRegistrationsForReview(filter);

  return (
    <div className="flex flex-col gap-4 py-6">
      <header>
        <p className="text-xs font-bold tracking-[0.2em] text-muted">ADMIN</p>
        <h1 className="font-display text-3xl uppercase leading-none">
          Inscripciones
        </h1>
      </header>

      {params.revisado && (
        <p
          className="rounded-xl bg-success/10 px-4 py-3 text-sm text-success"
          role="status"
        >
          Revisión guardada. No quedan más inscripciones pendientes.
        </p>
      )}

      <nav aria-label="Estado" className="flex gap-2">
        {FILTERS.map((f) => (
          <NextLink
            key={f.value}
            aria-current={f.value === filter ? "page" : undefined}
            className={clsx(
              "rounded-full px-4 py-1.5 text-sm font-semibold",
              f.value === filter
                ? "bg-foreground text-background"
                : "border border-white/10 text-muted hover:text-foreground",
            )}
            href={`?estado=${f.value}`}
          >
            {f.label}
          </NextLink>
        ))}
      </nav>

      {rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/15 px-6 py-12 text-center text-muted">
          {filter === "pending_review"
            ? "No hay inscripciones pendientes."
            : "No hay inscripciones en esta lista."}
        </div>
      ) : (
        <ul className="grid gap-3 md:grid-cols-2">
          {rows.map((row) => {
            const status = REGISTRATION_STATUS[row.registration.status];
            const wrongAmount =
              row.payment && row.payment.amount !== row.expectedFee;

            return (
              <li key={row.registration.id}>
                <NextLink
                  className="block h-full"
                  href={`${ROUTES.adminRegistrations}/${row.registration.id}`}
                >
                  <Card className="flex h-full items-center justify-between gap-3 transition-colors hover:border-accent/50">
                    <div className="min-w-0">
                      <p className="truncate font-bold">
                        {row.firstName} {row.lastName}
                      </p>
                      <p className="truncate text-sm text-muted">
                        {CATEGORY_LABELS[row.registration.category]} ·{" "}
                        {row.email}
                      </p>
                      {row.payment && (
                        <p className="mt-1 text-xs text-muted">
                          <span
                            className={
                              wrongAmount ? "font-bold text-danger" : undefined
                            }
                          >
                            {formatColones(row.payment.amount)}
                          </span>{" "}
                          · Ref. {row.payment.reference} · Enviado{" "}
                          {formatDateTime(row.payment.createdAt)}
                        </p>
                      )}
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-2">
                      <StatusBadge tone={status.tone}>
                        {status.label}
                      </StatusBadge>
                      <ChevronRightIcon className="h-4 w-4 text-muted" />
                    </div>
                  </Card>
                </NextLink>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
