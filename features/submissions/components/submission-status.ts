import type { BadgeTone } from "@/components/ui/status-badge";

type SubmissionStatus = "pending" | "under_review" | "approved" | "rejected";

// Estados del video (§17)
export const SUBMISSION_STATUS: Record<
  SubmissionStatus,
  { tone: BadgeTone; label: string }
> = {
  pending: { tone: "warning", label: "Pendiente de revisión" },
  under_review: { tone: "warning", label: "En revisión" },
  approved: { tone: "success", label: "Aprobado" },
  rejected: { tone: "danger", label: "Rechazado" },
};
