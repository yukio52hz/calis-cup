"use client";

import { useState, useTransition } from "react";

import { UploadIcon } from "@/components/ui/icons";
import { uploadWithProgress } from "@/lib/upload";

import {
  requestExampleUploadAction,
  setExampleVideoAction,
} from "../../admin-actions";

// Video de ejemplo del reto (§15)
export function ExampleVideo({
  weekId,
  currentUrl,
  disabled,
}: {
  weekId: string;
  currentUrl: string | null;
  // true hasta que el reto esté guardado
  disabled: boolean;
}) {
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setError(null);

    const request = await requestExampleUploadAction(weekId, {
      size: file.size,
      type: file.type,
    });

    if (!request.ok) {
      setError(request.message);

      return;
    }

    try {
      setProgress(0);
      await uploadWithProgress(request.signedUrl, file, setProgress);
      startTransition(async () => {
        const saved = await setExampleVideoAction(weekId, request.path);

        if (!saved.ok) setError("No se pudo guardar el video.");
        setProgress(null);
      });
    } catch (e) {
      setError((e as Error).message);
      setProgress(null);
    }
  }

  if (disabled) {
    return (
      <p className="text-sm text-muted">
        Guarda el reto para poder subir el video de ejemplo.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {currentUrl && progress === null && (
        // Video de demostración del admin, sin diálogo: no lleva subtítulos
        // eslint-disable-next-line jsx-a11y/media-has-caption
        <video
          controls
          playsInline
          className="max-h-80 w-full rounded-xl bg-black"
          preload="metadata"
          src={currentUrl}
        />
      )}

      {progress !== null ? (
        <div aria-live="polite" className="flex flex-col gap-2">
          <div className="flex justify-between text-sm">
            <span>{isPending ? "Guardando…" : "Subiendo video…"}</span>
            <span className="font-display">{progress}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-accent"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          <label className="button button--tertiary button--md cursor-pointer rounded-xl font-semibold">
            <UploadIcon className="h-4 w-4" />
            {currentUrl ? "Reemplazar video" : "Subir video de ejemplo"}
            <input
              accept="video/*"
              className="sr-only"
              type="file"
              onChange={(event) => {
                handleFile(event.target.files?.[0]);
                event.target.value = "";
              }}
            />
          </label>
          {currentUrl && (
            <button
              className="button button--tertiary button--md rounded-xl font-semibold text-danger"
              disabled={isPending}
              type="button"
              onClick={() =>
                startTransition(async () => {
                  await setExampleVideoAction(weekId, null);
                })
              }
            >
              Quitar
            </button>
          )}
        </div>
      )}
      {error && (
        <p className="text-sm text-danger" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
