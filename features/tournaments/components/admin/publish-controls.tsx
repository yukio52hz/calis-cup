"use client";

import { useTransition } from "react";
import { Button } from "@heroui/react";

import { StatusBadge } from "@/components/ui/status-badge";

import {
  announceWeekAction,
  setWeekPublishedAction,
} from "../../admin-actions";

// §14: publicar el reto y avisar por email a los inscritos (§31)
export function PublishControls({
  weekId,
  hasChallenge,
  isPublished,
  isStarted,
  announcedLabel,
  approvedCount,
}: {
  weekId: string;
  hasChallenge: boolean;
  isPublished: boolean;
  // la semana ya empezó (los competidores ya pueden ver el reto si está publicado)
  isStarted: boolean;
  announcedLabel: string | null;
  approvedCount: number;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        {isPublished ? (
          <StatusBadge tone="success">Publicado</StatusBadge>
        ) : (
          <StatusBadge tone="neutral">Borrador</StatusBadge>
        )}
        {isPublished && !isStarted && (
          <span className="text-xs text-muted">
            Visible al iniciar la semana.
          </span>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          className="font-bold"
          isDisabled={!hasChallenge || isPending}
          variant={isPublished ? "tertiary" : "primary"}
          onPress={() =>
            startTransition(() => setWeekPublishedAction(weekId, !isPublished))
          }
        >
          {isPublished ? "Despublicar" : "Publicar reto"}
        </Button>

        {isPublished && (
          <Button
            className="font-bold"
            isDisabled={Boolean(announcedLabel) || !isStarted || isPending}
            variant="tertiary"
            onPress={() => {
              if (
                window.confirm(
                  `Se enviará el email "Nuevo reto" a ${approvedCount} competidor(es) inscrito(s). ¿Continuar?`,
                )
              ) {
                startTransition(() => announceWeekAction(weekId));
              }
            }}
          >
            Avisar a los competidores
          </Button>
        )}
      </div>

      {!hasChallenge && (
        <p className="text-xs text-muted">
          Guarda el reto antes de publicarlo.
        </p>
      )}
      {isPublished && announcedLabel && (
        <p className="text-xs text-muted">Aviso enviado el {announcedLabel}.</p>
      )}
      {isPublished && !announcedLabel && !isStarted && (
        <p className="text-xs text-muted">
          Podrás enviar el aviso cuando empiece la semana.
        </p>
      )}
    </div>
  );
}
