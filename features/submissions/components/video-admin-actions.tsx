"use client";

import { useTransition } from "react";

import {
  deleteSubmissionAction,
  deleteVideoFileAction,
} from "../review-actions";

// Descargar, liberar espacio o eliminar el intento (admin)
export function VideoAdminActions({
  submissionId,
  downloadUrl,
  hasFile,
}: {
  submissionId: string;
  downloadUrl: string | null;
  hasFile: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        {downloadUrl && (
          <a
            className="button button--tertiary button--md rounded-xl font-semibold"
            href={downloadUrl}
          >
            Descargar video
          </a>
        )}
        {hasFile && (
          <button
            className="button button--tertiary button--md rounded-xl font-semibold"
            disabled={isPending}
            type="button"
            onClick={() => {
              if (
                window.confirm(
                  "Se borrará el archivo del video para liberar espacio. El tiempo y los puntos se conservan. ¿Continuar?",
                )
              ) {
                startTransition(() => deleteVideoFileAction(submissionId));
              }
            }}
          >
            Borrar solo el archivo
          </button>
        )}
        <button
          className="button button--tertiary button--md rounded-xl font-semibold text-danger"
          disabled={isPending}
          type="button"
          onClick={() => {
            if (
              window.confirm(
                "Se eliminará el intento completo: el video y su resultado. Dejará de contar en la clasificación y, si la semana sigue abierta, el competidor podrá volver a subir. Esta acción no se puede deshacer. ¿Continuar?",
              )
            ) {
              startTransition(() => deleteSubmissionAction(submissionId));
            }
          }}
        >
          Eliminar intento
        </button>
      </div>
      {isPending && <p className="text-sm text-muted">Procesando…</p>}
    </div>
  );
}
