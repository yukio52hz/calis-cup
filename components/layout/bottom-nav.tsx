"use client";

import NextLink from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

import {
  HomeIcon,
  TrophyIcon,
  UserIcon,
  VideoIcon,
} from "@/components/ui/icons";
import { ROUTES } from "@/lib/constants";

const items = [
  { href: ROUTES.dashboard, label: "Inicio", Icon: HomeIcon },
  { href: ROUTES.ranking, label: "Ranking", Icon: TrophyIcon },
  { href: ROUTES.videos, label: "Videos", Icon: VideoIcon },
  { href: ROUTES.profile, label: "Perfil", Icon: UserIcon },
];

function useIsActive() {
  const pathname = usePathname();

  return (href: string) =>
    href === ROUTES.dashboard ? pathname === href : pathname.startsWith(href);
}

// Navegación del competidor: barra inferior en móvil (§5)
export function BottomNav() {
  const isActive = useIsActive();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-separator bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-lg md:hidden">
      <ul className="grid grid-cols-4">
        {items.map(({ href, label, Icon }) => {
          const active = isActive(href);

          return (
            <li key={href}>
              <NextLink
                aria-current={active ? "page" : undefined}
                className={clsx(
                  "relative flex flex-col items-center gap-1 pb-2 pt-2.5 text-[0.7rem] font-medium",
                  active ? "text-accent" : "text-muted",
                )}
                href={href}
              >
                {active && (
                  <span className="absolute inset-x-6 top-0 h-0.5 rounded-full bg-accent" />
                )}
                <Icon className="h-6 w-6" />
                {label}
              </NextLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

// Misma navegación como pestañas en tablet/escritorio
export function DashboardTabs() {
  const isActive = useIsActive();

  return (
    <nav className="hidden border-b border-separator md:block">
      <ul className="flex gap-1">
        {items.map(({ href, label, Icon }) => {
          const active = isActive(href);

          return (
            <li key={href}>
              <NextLink
                aria-current={active ? "page" : undefined}
                className={clsx(
                  "-mb-px flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold",
                  active
                    ? "border-accent text-foreground"
                    : "border-transparent text-muted hover:text-foreground",
                )}
                href={href}
              >
                <Icon className="h-4 w-4" />
                {label}
              </NextLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
