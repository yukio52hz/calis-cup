import type { BadgeTone } from "@/components/ui/status-badge";
import type { ExtraStatus } from "../server/queries";

export const EXTRA_STATUS: Record<
  ExtraStatus,
  { tone: BadgeTone; label: string }
> = {
  pending_review: { tone: "warning", label: "Pago en revisión" },
  rejected: { tone: "danger", label: "Pago rechazado" },
  available: { tone: "success", label: "Disponible" },
  used: { tone: "neutral", label: "Usado" },
  expired: { tone: "neutral", label: "Vencido" },
};
