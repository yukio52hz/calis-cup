import type {
  CompetitorDashboard,
  RegistrationStatus,
} from "../../dashboard-types";

import NextLink from "next/link";
import clsx from "clsx";

import { StatusBadge } from "@/components/ui/status-badge";

import { ChallengeCard } from "./challenge-card";
import { LeaderboardCard } from "./leaderboard-card";
import { MyWeekCard } from "./my-week-card";
import { RegistrationCard } from "./registration-card";
import { WeeksTimeline } from "./weeks-timeline";

export function DashboardView({
  data,
  firstName,
  categoryLabel,
  mockState,
}: {
  data: CompetitorDashboard;
  firstName: string;
  categoryLabel: string;
  // Solo en desarrollo: muestra el selector de estados de ejemplo
  mockState?: RegistrationStatus;
}) {
  const activeWeek = data.weeks.find((week) => week.status === "active");
  const isApproved = data.registration.status === "approved";

  return (
    <div className="flex flex-col gap-4 py-6">
      {mockState && <MockStateSwitcher current={mockState} />}

      <header className="flex flex-col gap-2">
        <p className="text-xs font-bold tracking-[0.2em] text-muted">
          {data.tournament.name.toUpperCase()}
        </p>
        <h1 className="font-display text-3xl uppercase leading-none">
          Hola, {firstName}
        </h1>
        <div className="flex flex-wrap gap-2">
          <StatusBadge tone="neutral">{categoryLabel}</StatusBadge>
          {activeWeek && (
            <StatusBadge tone="accent">
              Semana {activeWeek.number} de {data.weeks.length}
            </StatusBadge>
          )}
        </div>
      </header>

      <WeeksTimeline weeks={data.weeks} />

      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr] lg:items-start">
        <div className="flex flex-col gap-4">
          {!isApproved && (
            <RegistrationCard
              fee={data.tournament.registrationFee}
              registration={data.registration}
            />
          )}
          {data.activeChallenge && (
            <ChallengeCard
              canSubmit={isApproved}
              challenge={data.activeChallenge}
              hasSubmitted={data.attempts.length > 0}
            />
          )}
        </div>

        <div className="flex flex-col gap-4">
          {isApproved && (
            <RegistrationCard
              fee={data.tournament.registrationFee}
              registration={data.registration}
            />
          )}
          {isApproved && activeWeek && (
            <MyWeekCard
              attempts={data.attempts}
              extraVideo={data.extraVideo}
              extraVideoFee={data.tournament.extraVideoFee}
              standing={data.standing}
              week={activeWeek.number}
            />
          )}
          <LeaderboardCard
            categoryLabel={categoryLabel}
            leaderboard={data.leaderboard}
          />
        </div>
      </div>
    </div>
  );
}

const STATE_LABELS: Record<RegistrationStatus, string> = {
  not_registered: "Sin inscribir",
  pending_review: "Pendiente",
  approved: "Aprobado",
  rejected: "Rechazado",
};

function MockStateSwitcher({ current }: { current: string }) {
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-xl border border-dashed border-warning/40 bg-warning/5 px-3 py-2 text-xs">
      <span className="font-bold text-warning">Datos de ejemplo:</span>
      {(Object.keys(STATE_LABELS) as RegistrationStatus[]).map((state) => (
        <NextLink
          key={state}
          className={clsx(
            "rounded-full px-2 py-0.5",
            state === current
              ? "bg-warning/20 font-bold"
              : "text-muted hover:text-foreground",
          )}
          href={`?estado=${state}`}
        >
          {STATE_LABELS[state]}
        </NextLink>
      ))}
    </div>
  );
}
