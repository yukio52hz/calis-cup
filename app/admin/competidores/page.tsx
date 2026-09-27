import NextLink from "next/link";
import clsx from "clsx";

import { Card } from "@/components/ui/card";
import { ChevronRightIcon } from "@/components/ui/icons";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  listCompetitors,
  type CompetitorFilter,
} from "@/features/admin/server/competitors";
import { REGISTRATION_STATUS } from "@/features/registrations/components/registration-status";
import { CATEGORY_LABELS } from "@/features/users/schemas";
import { ROUTES } from "@/lib/constants";

const FILTERS: { value: CompetitorFilter; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "pending", label: "Pendientes" },
  { value: "approved", label: "Aprobados" },
  { value: "none", label: "Sin inscripción" },
];

export default async function AdminCompetitorsPage({
  searchParams,
}: {
  searchParams: Promise<{ estado?: string; q?: string }>;
}) {
  const params = await searchParams;
  const filter = FILTERS.find((f) => f.value === params.estado)?.value ?? "all";
  const search = (params.q ?? "").slice(0, 60);
  const rows = await listCompetitors(filter, search);

  const href = (estado: string) =>
    `?estado=${estado}${search ? `&q=${encodeURIComponent(search)}` : ""}`;

  return (
    <div className="flex flex-col gap-4 py-6">
      <header>
        <p className="text-xs font-bold tracking-[0.2em] text-muted">ADMIN</p>
        <h1 className="font-display text-3xl uppercase leading-none">
          Competidores
        </h1>
      </header>

      {/* Búsqueda por GET: funciona sin JS y se puede compartir */}
      <form className="flex gap-2" role="search">
        <input name="estado" type="hidden" value={filter} />
        <input
          aria-label="Buscar por nombre o email"
          className="min-w-0 flex-1 rounded-xl border border-white/10 bg-field-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-accent"
          defaultValue={search}
          name="q"
          placeholder="Buscar por nombre o email"
          type="search"
        />
        <button
          className="button button--tertiary button--md rounded-xl font-semibold"
          type="submit"
        >
          Buscar
        </button>
      </form>

      <nav
        aria-label="Estado de inscripción"
        className="-mx-4 flex gap-2 overflow-x-auto px-4 [scrollbar-width:none] md:mx-0 md:px-0"
      >
        {FILTERS.map((f) => (
          <NextLink
            key={f.value}
            aria-current={f.value === filter ? "page" : undefined}
            className={clsx(
              "shrink-0 rounded-full px-4 py-1.5 text-sm font-semibold",
              f.value === filter
                ? "bg-foreground text-background"
                : "border border-white/10 text-muted hover:text-foreground",
            )}
            href={href(f.value)}
          >
            {f.label}
          </NextLink>
        ))}
      </nav>

      <p className="text-sm text-muted">{rows.length} competidor(es)</p>

      {rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/15 px-6 py-12 text-center text-muted">
          No hay competidores en esta lista.
        </div>
      ) : (
        <ul className="grid gap-3 md:grid-cols-2">
          {rows.map(
            ({
              profile,
              registrationStatus,
              registrationCategory,
              videos,
              standing,
            }) => {
              const status = registrationStatus
                ? REGISTRATION_STATUS[registrationStatus]
                : null;

              return (
                <li key={profile.id}>
                  <NextLink
                    className="block h-full"
                    href={`${ROUTES.adminCompetitors}/${profile.id}`}
                  >
                    <Card className="flex h-full items-center justify-between gap-3 transition-colors hover:border-accent/50">
                      <div className="min-w-0">
                        <p className="truncate font-bold">
                          {profile.firstName} {profile.lastName}
                        </p>
                        <p className="truncate text-sm text-muted">
                          {profile.email}
                        </p>
                        <p className="mt-1 text-xs text-muted">
                          {
                            CATEGORY_LABELS[
                              registrationCategory ?? profile.category
                            ]
                          }{" "}
                          · {videos} video(s)
                          {standing &&
                            ` · #${standing.position} · ${standing.total} pts`}
                        </p>
                      </div>
                      <div className="flex shrink-0 flex-col items-end gap-2">
                        {status ? (
                          <StatusBadge tone={status.tone}>
                            {status.label}
                          </StatusBadge>
                        ) : (
                          <StatusBadge tone="neutral">
                            Sin inscripción
                          </StatusBadge>
                        )}
                        <ChevronRightIcon className="h-4 w-4 text-muted" />
                      </div>
                    </Card>
                  </NextLink>
                </li>
              );
            },
          )}
        </ul>
      )}
    </div>
  );
}
