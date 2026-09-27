import type { CompetitorDashboard } from "../../dashboard-types";

import NextLink from "next/link";

import { Card } from "@/components/ui/card";
import {
  ClockIcon,
  LockIcon,
  PlayIcon,
  UploadIcon,
} from "@/components/ui/icons";
import { ROUTES } from "@/lib/constants";
import { formatDateTime, formatTimeLeft } from "@/lib/format";

// Reto activo (§14-15)
export function ChallengeCard({
  challenge,
  canSubmit,
  hasSubmitted,
}: {
  challenge: NonNullable<CompetitorDashboard["activeChallenge"]>;
  canSubmit: boolean;
  hasSubmitted: boolean;
}) {
  return (
    <Card className="overflow-hidden" padded={false}>
      <div className="relative bg-gradient-to-br from-accent/25 via-surface to-surface p-5">
        <div className="flex items-center justify-between gap-3">
          <p className="whitespace-nowrap text-[0.65rem] font-bold tracking-[0.15em] text-muted">
            SEMANA {challenge.week} · RETO #{challenge.week}
          </p>
          <span className="inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full bg-accent px-2.5 py-1 text-xs font-bold text-accent-foreground">
            <ClockIcon className="h-3.5 w-3.5" />
            Cierra en {formatTimeLeft(challenge.endsAt)}
          </span>
        </div>
        <h2 className="mt-2 font-display text-3xl uppercase leading-none sm:text-4xl">
          {challenge.name}
        </h2>
        <p className="mt-2 text-sm text-muted">{challenge.objective}</p>
      </div>

      <div className="flex flex-col gap-5 p-5">
        {/* Video de ejemplo (§15) */}
        {challenge.exampleVideoUrl ? (
          // Video de demostración, sin diálogo: no lleva subtítulos
          // eslint-disable-next-line jsx-a11y/media-has-caption
          <video
            controls
            playsInline
            className="aspect-video w-full rounded-xl border border-white/10 bg-black"
            preload="metadata"
            src={challenge.exampleVideoUrl}
          />
        ) : (
          <div className="flex aspect-video items-center justify-center rounded-xl border border-dashed border-white/15 text-sm text-muted">
            <PlayIcon className="mr-2 h-4 w-4" /> El video de ejemplo estará
            disponible pronto
          </div>
        )}

        <div>
          <h3 className="text-xs font-bold tracking-[0.2em] text-muted">
            EJERCICIOS Y PENALIZACIONES
          </h3>
          <ul className="mt-2 divide-y divide-white/5 rounded-xl bg-background/50">
            {challenge.exercises.map((exercise) => (
              <li
                key={exercise.name}
                className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm"
              >
                <span className="font-semibold">{exercise.name}</span>
                <span className="flex items-center gap-3">
                  <span className="text-muted">{exercise.reps} reps</span>
                  <span className="min-w-12 text-right font-bold text-accent">
                    +{exercise.penaltySeconds}s
                  </span>
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-xs text-muted">
            Penalización por cada repetición incorrecta.
          </p>
        </div>

        <div>
          <h3 className="text-xs font-bold tracking-[0.2em] text-muted">
            REGLAS
          </h3>
          <ul className="mt-2 flex flex-col gap-1.5 text-sm">
            {challenge.rules.map((rule) => (
              <li key={rule} className="flex gap-2">
                <span aria-hidden className="text-accent">
                  •
                </span>
                {rule}
              </li>
            ))}
          </ul>
        </div>

        {canSubmit ? (
          <NextLink
            className="button button--primary button--lg w-full rounded-xl font-bold"
            href={ROUTES.videos}
          >
            <UploadIcon className="h-5 w-5" />
            {hasSubmitted ? "Ver mi envío" : "Subir mi video"}
          </NextLink>
        ) : (
          <div className="flex flex-col items-center gap-1 rounded-xl border border-dashed border-white/15 px-4 py-3 text-center">
            <span className="flex items-center gap-2 font-bold text-muted">
              <LockIcon className="h-4 w-4" /> Subir mi video
            </span>
            <span className="text-xs text-muted">
              Disponible cuando tu inscripción esté aprobada.
            </span>
          </div>
        )}

        <p className="text-center text-xs text-muted">
          Fecha límite: {formatDateTime(challenge.endsAt)}
        </p>
      </div>
    </Card>
  );
}
