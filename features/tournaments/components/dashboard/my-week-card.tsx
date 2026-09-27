import type {
  CompetitorDashboard,
  ExtraVideoStatus,
  SubmissionStatus,
} from "../../dashboard-types";

import { Card, CardTitle } from "@/components/ui/card";
import { LockIcon } from "@/components/ui/icons";
import { StatusBadge, type BadgeTone } from "@/components/ui/status-badge";
import { formatColones, formatDuration } from "@/lib/format";

const SUBMISSION_BADGE: Record<SubmissionStatus, [BadgeTone, string]> = {
  pending: ["warning", "Pendiente"],
  under_review: ["warning", "En revisión"],
  approved: ["success", "Aprobado"],
  rejected: ["danger", "Rechazado"],
};

// Mis intentos, mejor resultado, posición y video extra (§17, §25-29)
export function MyWeekCard({
  week,
  attempts,
  standing,
  extraVideo,
  extraVideoFee,
}: {
  week: number;
  attempts: CompetitorDashboard["attempts"];
  standing: CompetitorDashboard["standing"];
  extraVideo: ExtraVideoStatus;
  extraVideoFee: number;
}) {
  const approvedTimes = attempts
    .filter((a) => a.status === "approved" && a.finalTimeMs)
    .map((a) => a.finalTimeMs!);
  const best = approvedTimes.length ? Math.min(...approvedTimes) : null;

  return (
    <Card>
      <CardTitle eyebrow={`SEMANA ${week}`}>Mi resultado</CardTitle>

      <dl className="grid grid-cols-3 gap-2 text-center">
        <Stat
          label="Mejor tiempo"
          value={best ? formatDuration(best) : "--:--"}
        />
        <Stat
          label="Posición"
          value={standing ? `#${standing.position}` : "—"}
        />
        <Stat
          label="Puntos"
          value={standing ? String(standing.totalPoints) : "0"}
        />
      </dl>

      {attempts.length > 0 ? (
        <ul className="mt-4 flex flex-col gap-2">
          {attempts.map((attempt) => {
            const [tone, label] = SUBMISSION_BADGE[attempt.status];

            return (
              <li
                key={attempt.number}
                className="flex items-center justify-between rounded-xl bg-background/50 px-4 py-2.5 text-sm"
              >
                <span className="font-semibold">Intento #{attempt.number}</span>
                <span className="flex items-center gap-3">
                  {attempt.finalTimeMs && (
                    <span className="font-display">
                      {formatDuration(attempt.finalTimeMs)}
                    </span>
                  )}
                  <StatusBadge tone={tone}>{label}</StatusBadge>
                </span>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="mt-4 rounded-xl bg-background/50 px-4 py-3 text-center text-sm text-muted">
          Aún no has enviado tu video de esta semana.
        </p>
      )}

      <ExtraVideo fee={extraVideoFee} status={extraVideo} />
    </Card>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-background/50 px-2 py-3">
      <dd className="font-display text-xl">{value}</dd>
      <dt className="mt-0.5 text-[0.7rem] text-muted">{label}</dt>
    </div>
  );
}

// §25-27: el video extra se habilita solo con el pago aprobado
function ExtraVideo({
  status,
  fee,
}: {
  status: ExtraVideoStatus;
  fee: number;
}) {
  if (status === "unavailable") return null;

  return (
    <div className="mt-4 border-t border-white/10 pt-4">
      {status === "available" && (
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="font-bold">¿Quieres mejorar tu tiempo?</p>
            <p className="text-sm text-muted">
              Video extra · {formatColones(fee)}
            </p>
          </div>
          <button
            disabled
            className="button button--tertiary button--sm shrink-0 rounded-full font-semibold"
            title="Disponible en la Fase 6"
            type="button"
          >
            Comprar
          </button>
        </div>
      )}
      {status === "pending_review" && (
        <div className="flex flex-col gap-2">
          <StatusBadge tone="warning">Pago en revisión</StatusBadge>
          <p className="flex items-center gap-2 text-sm text-muted">
            <LockIcon className="h-4 w-4" /> Subir video extra: esperando
            aprobación del pago.
          </p>
        </div>
      )}
      {status === "approved" && (
        <div className="flex flex-col gap-2">
          <StatusBadge tone="success">Pago aprobado</StatusBadge>
          <p className="text-sm">Ya puedes realizar un nuevo intento.</p>
        </div>
      )}
    </div>
  );
}
