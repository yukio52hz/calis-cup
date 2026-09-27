import type { BadgeTone } from "@/components/ui/status-badge";

export const REGISTRATION_STATUS: Record<
  "pending_review" | "approved" | "rejected",
  { tone: BadgeTone; label: string }
> = {
  pending_review: { tone: "warning", label: "Pendiente" },
  approved: { tone: "success", label: "Aprobada" },
  rejected: { tone: "danger", label: "Rechazada" },
};
