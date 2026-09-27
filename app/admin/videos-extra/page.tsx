import NextLink from "next/link";
import clsx from "clsx";

import { Card } from "@/components/ui/card";
import { ChevronRightIcon } from "@/components/ui/icons";
import { StatusBadge } from "@/components/ui/status-badge";
import { REGISTRATION_STATUS } from "@/features/registrations/components/registration-status";
import {
  listExtraRequestsForReview,
  type ExtraRequestFilter,
} from "@/features/extra-videos/server/queries";
import { ROUTES } from "@/lib/constants";
import { formatColones, formatDateTime } from "@/lib/format";

const FILTERS: { value: ExtraRequestFilter; label: string }[] = [
  { value: "pending_review", label: "Pendientes" },
  { value: "approved", label: "Aprobados" },
  { value: "rejected", label: "Rechazados" },
];

export default async function AdminExtrasPage({
  searchParams,
}: {
  searchParams: Promise<{ estado?: string; revisado?: string }>;
}) {
  const params = await searchParams;
  const filter =
    FILTERS.find((f) => f.value === params.estado)?.value ?? "pending_review";
  const rows = await listExtraRequestsForReview(filter);

  return (
    <div className="flex flex-col gap-4 py-6">
      <header>
        <p className="text-xs font-bold tracking-[0.2em] text-muted">
          ADMIN · PAGOS
        </p>
        <h1 className="font-display text-3xl uppercase leading-none">
          Videos extra
        </h1>
      </header>

      {params.revisado && (
        <p
          className="rounded-xl bg-success/10 px-4 py-3 text-sm text-success"
          role="status"
        >
          Revisión guardada. No quedan más solicitudes pendientes.
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
            ? "No hay solicitudes de video extra pendientes."
            : "No hay solicitudes en esta lista."}
        </div>
      ) : (
        <ul className="grid gap-3 md:grid-cols-2">
          {rows.map((row) => {
            const status = REGISTRATION_STATUS[row.payment.status];

            return (
              <li key={row.extra.id}>
                <NextLink
                  className="block h-full"
                  href={`${ROUTES.adminExtras}/${row.extra.id}`}
                >
                  <Card className="flex h-full items-center justify-between gap-3 transition-colors hover:border-accent/50">
                    <div className="min-w-0">
                      <p className="truncate font-bold">
                        {row.firstName} {row.lastName}
                      </p>
                      <p className="text-sm text-muted">
                        Semana {row.weekNumber} · {row.challengeName}
                      </p>
                      <p className="mt-1 text-xs text-muted">
                        {formatColones(row.payment.amount)} · Ref.{" "}
                        {row.payment.reference} ·{" "}
                        {formatDateTime(row.payment.createdAt)}
                      </p>
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
