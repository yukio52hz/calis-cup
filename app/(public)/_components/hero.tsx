import type { PublicTournamentInfo } from "@/features/tournaments/server/public-info";

import NextLink from "next/link";

import { BrandBackground } from "@/components/layout/brand-background";
import { ROUTES } from "@/lib/constants";

export function Hero({ info }: { info: PublicTournamentInfo }) {
  const stats = [
    { value: info.weeks, label: "Semanas" },
    { value: info.weeks, label: "Retos" },
    { value: 2, label: "Categorías" },
    { value: 1, label: "Clasificación" },
  ];

  return (
    <section className="relative isolate overflow-hidden">
      <BrandBackground />

      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 pb-16 pt-12 sm:pt-20 md:px-6">
        <p className="inline-flex w-fit items-center gap-2 rounded-full border border-accent/40 bg-accent/10 px-4 py-1.5 text-xs font-bold tracking-widest">
          <span className="font-display text-[0.65rem]">CR</span>
          COSTA RICA CALIS CUP
        </p>

        <h1 className="font-display text-[clamp(2.1rem,10.5vw,5.75rem)] uppercase leading-[0.95] tracking-tight">
          Compite.
          <br />
          <span className="text-accent">Supera.</span>
          <br />
          Clasifícate.
        </h1>

        <p className="max-w-xl text-base text-muted sm:text-lg">
          El primer torneo online de calistenia de Costa Rica. {info.weeks}{" "}
          semanas · {info.weeks} retos · 1 clasificación. Categorías femenina y
          masculina.
        </p>

        <div className="flex flex-col gap-3 sm:flex-row">
          <NextLink
            className="button button--primary button--lg w-full rounded-xl font-bold sm:w-auto"
            href={ROUTES.register}
          >
            Quiero participar
          </NextLink>
          <NextLink
            className="button button--tertiary button--lg w-full rounded-xl font-bold sm:w-auto"
            href="#torneo"
          >
            Ver torneo
          </NextLink>
        </div>

        <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-white/10 bg-surface/60 p-4 backdrop-blur-sm sm:p-5"
            >
              <dt className="sr-only">{stat.label}</dt>
              <dd className="font-display text-3xl">{stat.value}</dd>
              <dd className="mt-1 text-sm text-muted">{stat.label}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
