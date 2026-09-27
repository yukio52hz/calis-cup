import NextLink from "next/link";
import clsx from "clsx";

import { Card } from "@/components/ui/card";
import { ChevronRightIcon } from "@/components/ui/icons";
import { StatusBadge } from "@/components/ui/status-badge";
import { SUBMISSION_STATUS } from "@/features/submissions/components/submission-status";
import {
  listSubmissionsForReview,
  type ReviewFilter,
} from "@/features/submissions/server/review-queries";
import { CATEGORY_LABELS } from "@/features/users/schemas";
import { ROUTES } from "@/lib/constants";
import { formatDateTime, formatDuration } from "@/lib/format";

const FILTERS: { value: ReviewFilter; label: string }[] = [
  { value: "pending", label: "Pendientes" },
  { value: "approved", label: "Aprobados" },
  { value: "rejected", label: "Rechazados" },
];

export default async function AdminVideosPage({
  searchParams,
}: {
  searchParams: Promise<{
    estado?: string;
    revisado?: string;
    eliminado?: string;
  }>;
}) {
  const params = await searchParams;
  const filter =
    FILTERS.find((f) => f.value === params.estado)?.value ?? "pending";
  const rows = await listSubmissionsForReview(filter);

  return (
    <div className="flex flex-col gap-4 py-6">
      <header>
        <p className="text-xs font-bold tracking-[0.2em] text-muted">ADMIN</p>
        <h1 className="font-display text-3xl uppercase leading-none">Videos</h1>
      </header>

      {params.eliminado && (
        <p
          className="rounded-xl bg-success/10 px-4 py-3 text-sm text-success"
          role="status"
        >
          Intento eliminado.
        </p>
      )}

      {params.revisado && (
        <p
          className="rounded-xl bg-success/10 px-4 py-3 text-sm text-success"
          role="status"
        >
          Revisión guardada. No quedan más videos pendientes.
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
          {filter === "pending"
            ? "No hay videos pendientes. 🎉"
            : "No hay videos en esta lista."}
        </div>
      ) : (
        <ul className="grid gap-3 md:grid-cols-2">
          {rows.map((row) => {
            const status = SUBMISSION_STATUS[row.submission.status];

            return (
              <li key={row.submission.id}>
                <NextLink
                  className="block h-full"
                  href={`${ROUTES.adminVideos}/${row.submission.id}`}
                >
                  {/* Tarjeta de la bandeja (§18) */}
                  <Card className="flex h-full items-center justify-between gap-3 transition-colors hover:border-accent/50">
                    <div className="min-w-0">
                      <p className="truncate font-bold">
                        {row.firstName} {row.lastName}
                      </p>
                      <p className="text-sm text-muted">
                        Semana {row.weekNumber} · {row.challengeName} ·{" "}
                        {CATEGORY_LABELS[row.category ?? row.profileCategory]}
                      </p>
                      <p className="mt-1 text-xs text-muted">
                        Intento #{row.submission.attemptNumber} · Enviado{" "}
                        {formatDateTime(row.submission.createdAt)}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-2">
                      <StatusBadge tone={status.tone}>
                        {status.label}
                      </StatusBadge>
                      {row.submission.finalTimeMs ? (
                        <span className="font-display">
                          {formatDuration(row.submission.finalTimeMs)}
                        </span>
                      ) : (
                        <span className="flex items-center text-sm font-semibold text-accent">
                          Revisar <ChevronRightIcon className="h-4 w-4" />
                        </span>
                      )}
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
