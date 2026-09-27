"use client";

import { useEffect, useState } from "react";
import NextLink from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

import { siteConfig } from "@/config/site";
import { Logo } from "@/components/layout/logo";
import { ROUTES } from "@/lib/constants";

type Props = {
  isSignedIn: boolean;
  // Se recibe por props: components/ no importa features/.
  signOutAction: () => Promise<void>;
};

const btn = "button rounded-full font-semibold";

export const Navbar = ({ isSignedIn, signOutAction }: Props) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  // Cierra el menú móvil al navegar
  useEffect(() => setIsMenuOpen(false), [pathname]);

  const authActions = isSignedIn ? (
    <>
      <NextLink
        className={`${btn} button--primary button--sm`}
        href={ROUTES.dashboard}
      >
        Mi panel
      </NextLink>
      <form action={signOutAction}>
        <button className={`${btn} button--tertiary button--sm`} type="submit">
          Salir
        </button>
      </form>
    </>
  ) : (
    <>
      <NextLink
        className={`${btn} button--tertiary button--sm`}
        href={ROUTES.login}
      >
        Iniciar sesión
      </NextLink>
      <NextLink
        className={`${btn} button--primary button--sm`}
        href={ROUTES.register}
      >
        Quiero participar
      </NextLink>
    </>
  );

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-separator bg-background/80 backdrop-blur-lg">
      <header className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 md:px-6">
        <NextLink aria-label="Inicio" href="/">
          <Logo />
        </NextLink>

        <ul className="hidden items-center gap-6 lg:flex">
          {siteConfig.navItems.map((item) => (
            <li key={item.href}>
              <NextLink
                className="text-sm font-medium text-muted transition-colors hover:text-foreground"
                href={item.href}
              >
                {item.label}
              </NextLink>
            </li>
          ))}
        </ul>

        <div className="hidden items-center gap-2 lg:flex">{authActions}</div>

        <button
          aria-controls="mobile-menu"
          aria-expanded={isMenuOpen}
          aria-label={isMenuOpen ? "Cerrar menú" : "Abrir menú"}
          className="-mr-2 rounded-lg p-2 lg:hidden"
          type="button"
          onClick={() => setIsMenuOpen((open) => !open)}
        >
          <svg
            aria-hidden
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              d={
                isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 7h16M4 12h16M4 17h16"
              }
              strokeLinecap="round"
              strokeWidth={2}
            />
          </svg>
        </button>
      </header>

      <div
        className={clsx(
          "border-t border-separator bg-background lg:hidden",
          !isMenuOpen && "hidden",
        )}
        id="mobile-menu"
      >
        <ul className="flex flex-col px-4 py-2">
          {siteConfig.navItems.map((item) => (
            <li key={item.href}>
              <NextLink
                className="block py-3 text-base font-medium"
                href={item.href}
                onClick={() => setIsMenuOpen(false)}
              >
                {item.label}
              </NextLink>
            </li>
          ))}
        </ul>
        <div className="flex flex-col gap-2 px-4 pb-4 [&>*]:w-full [&_button]:w-full">
          {authActions}
        </div>
      </div>
    </nav>
  );
};
