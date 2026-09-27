import type { PublicTournamentInfo } from "@/features/tournaments/server/public-info";

import NextLink from "next/link";

import { ROUTES } from "@/lib/constants";

import { Card, Section, SectionHeader, formatColones } from "./ui";

// §2: el ciclo de cada semana
const steps = [
  {
    title: "Lunes: nuevo reto",
    text: "Cada lunes se publica el reto de la semana con sus reglas y un video de ejemplo.",
  },
  {
    title: "Realiza el set",
    text: "Complétalo en el menor tiempo posible respetando las reglas.",
  },
  {
    title: "Graba y sube",
    text: "Sube tu video desde el teléfono antes del domingo a las 11:59 p. m.",
  },
  {
    title: "Revisión",
    text: "El equipo revisa tu video, registra el tiempo y aplica penalizaciones.",
  },
  {
    title: "Suma puntos",
    text: "Según tu posición sumas puntos a la clasificación acumulada.",
  },
];

export function HowItWorks() {
  return (
    <Section id="como-funciona">
      <SectionHeader
        description="Todo sucede dentro de la app: sin grupos de Telegram ni mensajes perdidos."
        eyebrow="CÓMO FUNCIONA"
        title="Un reto por semana"
      />
      <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {steps.map((step, index) => (
          <li key={step.title}>
            <Card className="flex h-full flex-col gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-accent font-display text-sm text-accent-foreground">
                {index + 1}
              </span>
              <h3 className="font-bold">{step.title}</h3>
              <p className="text-sm text-muted">{step.text}</p>
            </Card>
          </li>
        ))}
      </ol>
    </Section>
  );
}

export function Tournament({ info }: { info: PublicTournamentInfo }) {
  const weeks = Array.from({ length: info.weeks }, (_, i) => i + 1);

  return (
    <Section className="bg-surface/30" id="torneo">
      <SectionHeader
        description={`Los puntos de cada semana se acumulan. Al final de la semana ${info.weeks} se define la clasificación final en cada categoría.`}
        eyebrow="EL TORNEO"
        title={
          <>
            {info.weeks} semanas · {info.weeks} retos ·{" "}
            <span className="text-accent">1 clasificación</span>
          </>
        }
      />

      <ol className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {weeks.map((week) => (
          <li key={week}>
            <Card className="relative overflow-hidden">
              <span className="absolute -right-2 -top-4 font-display text-7xl text-white/5">
                {week}
              </span>
              <p className="text-xs font-bold tracking-widest text-muted">
                SEMANA {week}
              </p>
              <p className="mt-1 font-display text-xl uppercase">
                Reto #{week}
              </p>
              <p className="mt-3 text-xs text-muted">Se revela el lunes</p>
            </Card>
          </li>
        ))}
      </ol>

      <div className="grid gap-3 lg:grid-cols-2">
        <Card>
          <h3 className="font-display text-lg uppercase">Categorías</h3>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {["Femenino", "Masculino"].map((category) => (
              <div
                key={category}
                className="rounded-xl border border-white/10 bg-background/60 p-4 text-center font-bold"
              >
                {category}
              </div>
            ))}
          </div>
          <p className="mt-4 text-sm text-muted">
            Cada categoría tiene su propia clasificación semanal y acumulada.
          </p>
        </Card>

        <Card>
          <h3 className="font-display text-lg uppercase">
            Puntos por posición
          </h3>
          <ul className="mt-4 flex flex-col gap-2">
            {info.points.map((points, index) => (
              <li
                key={points}
                className="flex items-center justify-between rounded-lg bg-background/60 px-4 py-2"
              >
                <span className="font-bold">{index + 1}.º lugar</span>
                <span className="font-display text-accent">{points} pts</span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-sm text-muted">
            Tu tiempo final = tiempo realizado + penalizaciones.
          </p>
        </Card>
      </div>
    </Section>
  );
}

const sinpeSteps = [
  "Crea tu cuenta y completa tu perfil.",
  "Haz el SINPE Móvil por el monto de la inscripción.",
  "Registra el número de referencia y sube el comprobante.",
  "Recibe un email cuando tu inscripción sea aprobada.",
];

export function Registration({ info }: { info: PublicTournamentInfo }) {
  const includes = [
    `${info.weeks} semanas de competencia`,
    `${info.weeks} retos`,
    "1 video por semana",
    "Acumulación de puntos",
    "El 100% de las inscripciones va para premios",
  ];

  return (
    <Section id="inscripcion">
      <SectionHeader
        description="El pago se realiza por SINPE Móvil y el equipo lo aprueba manualmente."
        eyebrow="INSCRIPCIÓN"
        title="Entra al torneo"
      />

      <div className="grid gap-3 lg:grid-cols-[1.1fr_1fr]">
        <Card className="border-accent/40 bg-gradient-to-br from-accent/15 to-surface/70 p-6">
          <p className="text-xs font-bold tracking-widest text-muted">
            INSCRIPCIÓN
          </p>
          <p className="mt-2 font-display text-5xl">
            {formatColones(info.registrationFee)}
          </p>
          <ul className="mt-6 flex flex-col gap-2">
            {includes.map((item) => (
              <li key={item} className="flex gap-2">
                <span aria-hidden className="text-accent">
                  ✓
                </span>
                {item}
              </li>
            ))}
          </ul>
          <NextLink
            className="button button--primary button--lg mt-8 w-full rounded-xl font-bold"
            href={ROUTES.register}
          >
            Quiero participar
          </NextLink>
        </Card>

        <div className="flex flex-col gap-3">
          <Card>
            <h3 className="font-display text-lg uppercase">Cómo pagar</h3>
            <ol className="mt-4 flex flex-col gap-3">
              {sinpeSteps.map((step, index) => (
                <li key={step} className="flex gap-3 text-sm">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs font-bold">
                    {index + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </Card>

          <Card>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-display text-lg uppercase">Video extra</h3>
                <p className="mt-2 text-sm text-muted">
                  ¿Quieres mejorar tu tiempo? Compra un intento adicional
                  durante la semana. Siempre cuenta tu mejor resultado.
                </p>
              </div>
              <p className="shrink-0 font-display text-2xl text-accent">
                {formatColones(info.extraVideoFee)}
              </p>
            </div>
          </Card>
        </div>
      </div>
    </Section>
  );
}

function faqs(info: PublicTournamentInfo) {
  return [
    {
      q: "¿Quién puede participar?",
      a: "Cualquier persona que cree su cuenta, elija su categoría (femenino o masculino) y tenga su inscripción aprobada.",
    },
    {
      q: "¿Qué pasa si no subo mi video antes del domingo?",
      a: "La semana se cierra el domingo a las 11:59 p. m. Después ya no se aceptan videos para ese reto.",
    },
    {
      q: "¿Puedo subir más de un video por semana?",
      a: `Sí, comprando un video extra de ${formatColones(info.extraVideoFee)}. Podrás subirlo cuando se apruebe el pago, y se toma tu mejor resultado válido.`,
    },
    {
      q: "¿Cómo se calcula mi resultado?",
      a: "Tiempo realizado más las penalizaciones por repeticiones incorrectas. El menor tiempo final gana la semana.",
    },
    {
      q: "¿A dónde va el dinero de la inscripción?",
      a: "El 100% de las inscripciones va para premios.",
    },
  ];
}

export function Faq({ info }: { info: PublicTournamentInfo }) {
  return (
    <Section className="bg-surface/30" id="preguntas">
      <SectionHeader eyebrow="PREGUNTAS" title="Preguntas frecuentes" />
      <div className="flex max-w-3xl flex-col gap-3">
        {faqs(info).map((faq) => (
          <details
            key={faq.q}
            className="group rounded-2xl border border-white/10 bg-surface/70 px-5 py-4"
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-bold">
              {faq.q}
              <span
                aria-hidden
                className="text-xl text-accent transition-transform group-open:rotate-45"
              >
                +
              </span>
            </summary>
            <p className="mt-3 text-sm text-muted">{faq.a}</p>
          </details>
        ))}
      </div>
    </Section>
  );
}

export function FinalCta() {
  return (
    <Section>
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-accent to-[oklch(0.4_0.18_25)] px-6 py-12 text-center sm:px-12">
        <h2 className="font-display text-3xl uppercase leading-none sm:text-5xl">
          ¿Listo para competir?
        </h2>
        <p className="mx-auto mt-4 max-w-md text-white/85">
          Crea tu cuenta, inscríbete y prepárate para el primer reto.
        </p>
        <NextLink
          className="button button--lg mt-8 rounded-xl bg-white font-bold text-black"
          href={ROUTES.register}
        >
          Crear mi cuenta
        </NextLink>
      </div>
    </Section>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-separator py-8">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 text-sm text-muted sm:flex-row md:px-6">
        <p>© {new Date().getFullYear()} Costa Rica Calis Cup</p>
        <p>Torneo online de calistenia · Femenino y masculino</p>
      </div>
    </footer>
  );
}
