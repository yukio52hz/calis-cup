"use client";

import NextLink from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

// Menú administrativo (§35). Las secciones de fases futuras aparecen deshabilitadas.
const items = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/videos", label: "Videos" },
  { href: "/admin/inscripciones", label: "Inscripciones" },
  { href: null, label: "Competidores" },
  { href: null, label: "Torneo" },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Administración"
      className="-mx-4 overflow-x-auto border-b border-separator px-4 [scrollbar-width:none] md:mx-0 md:px-0"
    >
      <ul className="flex gap-1">
        {items.map((item) => {
          if (!item.href) {
            return (
              <li key={item.label}>
                <span
                  aria-disabled
                  className="block whitespace-nowrap px-4 py-3 text-sm font-semibold text-muted/50"
                  title="Próximamente"
                >
                  {item.label}
                </span>
              </li>
            );
          }

          const active =
            item.href === "/admin"
              ? pathname === item.href
              : pathname.startsWith(item.href);

          return (
            <li key={item.href}>
              <NextLink
                aria-current={active ? "page" : undefined}
                className={clsx(
                  "-mb-px block whitespace-nowrap border-b-2 px-4 py-3 text-sm font-semibold",
                  active
                    ? "border-accent text-foreground"
                    : "border-transparent text-muted hover:text-foreground",
                )}
                href={item.href}
              >
                {item.label}
              </NextLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
