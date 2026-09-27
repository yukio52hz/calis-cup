import type { Category, RankingWeek } from "../types";

import NextLink from "next/link";
import clsx from "clsx";

import { LockIcon } from "@/components/ui/icons";

const CATEGORIES: { value: Category; label: string }[] = [
  { value: "female", label: "Femenino" },
  { value: "male", label: "Masculino" },
];

function href(category: Category, view: string) {
  return `?categoria=${category}&vista=${view}`;
}

// Filtros por URL (?categoria=&vista=): funcionan sin JS y se pueden compartir
export function RankingFilters({
  category,
  view,
  weeks,
}: {
  category: Category;
  view: string;
  weeks: RankingWeek[];
}) {
  return (
    <div className="flex flex-col gap-3">
      <div
        aria-label="Categoría"
        className="grid grid-cols-2 rounded-xl border border-white/10 bg-surface/60 p-1"
        role="group"
      >
        {CATEGORIES.map((c) => (
          <NextLink
            key={c.value}
            aria-current={c.value === category ? "true" : undefined}
            className={clsx(
              "rounded-lg py-2 text-center text-sm font-bold uppercase tracking-wide transition-colors",
              c.value === category
                ? "bg-accent text-accent-foreground"
                : "text-muted hover:text-foreground",
            )}
            href={href(c.value, view)}
            scroll={false}
          >
            {c.label}
          </NextLink>
        ))}
      </div>

      <nav
        aria-label="Vista"
        className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] md:mx-0 md:px-0"
      >
        <Tab active={view === "total"} href={href(category, "total")}>
          Acumulada
        </Tab>
        {weeks.map((week) =>
          week.status === "upcoming" ? (
            <span
              key={week.number}
              aria-disabled
              className="flex shrink-0 items-center gap-1 rounded-full border border-dashed border-white/15 px-4 py-1.5 text-sm text-muted/60"
            >
              <LockIcon className="h-3.5 w-3.5" /> Semana {week.number}
            </span>
          ) : (
            <Tab
              key={week.number}
              active={view === String(week.number)}
              href={href(category, String(week.number))}
            >
              Semana {week.number}
              {week.status === "active" && (
                <span className="ml-1.5 h-1.5 w-1.5 rounded-full bg-accent" />
              )}
            </Tab>
          ),
        )}
      </nav>
    </div>
  );
}

function Tab({
  active,
  href,
  children,
}: {
  active: boolean;
  href: string;
  children: React.ReactNode;
}) {
  return (
    <NextLink
      aria-current={active ? "page" : undefined}
      className={clsx(
        "flex shrink-0 items-center rounded-full px-4 py-1.5 text-sm font-semibold transition-colors",
        active
          ? "bg-foreground text-background"
          : "border border-white/10 text-muted hover:text-foreground",
      )}
      href={href}
      scroll={false}
    >
      {children}
    </NextLink>
  );
}
