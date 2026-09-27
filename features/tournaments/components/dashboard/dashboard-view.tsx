import type { CompetitorDashboard } from "../../dashboard-types";

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
}: {
  data: CompetitorDashboard;
  firstName: string;
  categoryLabel: string;
}) {
  const activeWeek = data.weeks.find((week) => week.status === "active");
  const isApproved = data.registration.status === "approved";

  return (
    <div className="flex flex-col gap-4 py-6">
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

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:items-start">
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
