"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { UploadIcon, VideoIcon } from "@/components/ui/icons";
import { MAX_VIDEO_BYTES } from "@/lib/constants";
import { formatMb, uploadWithProgress } from "@/lib/upload";

import { confirmVideoUploadAction, requestVideoUploadAction } from "../actions";

type Selected = { file: File; previewUrl: string; durationMs: number | null };

type Status =
  | { step: "idle" }
  | { step: "selected" }
  | { step: "uploading"; progress: number }
  | { step: "confirming" }
  | { step: "error"; message: string };

function readDuration(url: string) {
  return new Promise<number | null>((resolve) => {
    const video = document.createElement("video");

    video.preload = "metadata";
    video.onloadedmetadata = () =>
      resolve(
        Number.isFinite(video.duration)
          ? Math.round(video.duration * 1000)
          : null,
      );
    video.onerror = () => resolve(null);
    video.src = url;
  });
}

export function VideoUploader() {
  const router = useRouter();
  const [selected, setSelected] = useState<Selected | null>(null);
  const [status, setStatus] = useState<Status>({ step: "idle" });
  const abortRef = useRef<AbortController | null>(null);

  // Libera la vista previa al cambiar de archivo o salir
  useEffect(
    () => () => {
      if (selected) URL.revokeObjectURL(selected.previewUrl);
    },
    [selected],
  );

  async function handleFile(file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith("video/")) {
      setStatus({ step: "error", message: "El archivo debe ser un video." });

      return;
    }
    if (file.size > MAX_VIDEO_BYTES) {
      setStatus({
        step: "error",
        message: `Tu video pesa ${formatMb(file.size)} y el máximo es 50 MB. Grábalo en 720p o recórtalo.`,
      });

      return;
    }

    const previewUrl = URL.createObjectURL(file);

    setSelected({
      file,
      previewUrl,
      durationMs: await readDuration(previewUrl),
    });
    setStatus({ step: "selected" });
  }

  async function handleUpload() {
    if (!selected) return;

    const meta = {
      size: selected.file.size,
      type: selected.file.type,
      durationMs: selected.durationMs,
    };
    const request = await requestVideoUploadAction(meta);

    if (!request.ok) {
      setStatus({ step: "error", message: request.message });

      return;
    }

    abortRef.current = new AbortController();
    setStatus({ step: "uploading", progress: 0 });

    try {
      await uploadWithProgress(
        request.signedUrl,
        selected.file,
        (progress) => setStatus({ step: "uploading", progress }),
        abortRef.current.signal,
      );
    } catch (error) {
      setStatus(
        error instanceof DOMException && error.name === "AbortError"
          ? { step: "selected" }
          : { step: "error", message: (error as Error).message },
      );

      return;
    }

    setStatus({ step: "confirming" });

    const confirm = await confirmVideoUploadAction({
      ...meta,
      path: request.path,
    });

    if (!confirm.ok) {
      setStatus({ step: "error", message: confirm.message });

      return;
    }

    // El servidor ya registró el intento: la página muestra el nuevo estado
    router.refresh();
  }

  function reset() {
    setSelected(null);
    setStatus({ step: "idle" });
  }

  const busy = status.step === "uploading" || status.step === "confirming";

  return (
    <div className="flex flex-col gap-4">
      {selected ? (
        <div className="flex flex-col gap-3">
          {/* Vista previa antes de confirmar (§16) */}
          {/* Videos de ejercicios grabados por el usuario, sin diálogo: no llevan subtítulos */}
          {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
          <video
            controls
            playsInline
            className="max-h-[60vh] w-full rounded-xl bg-black"
            src={selected.previewUrl}
          />
          <p className="text-center text-xs text-muted">
            {selected.file.name} · {formatMb(selected.file.size)}
            {selected.durationMs &&
              ` · ${Math.floor(selected.durationMs / 60000)}:${String(Math.round((selected.durationMs % 60000) / 1000)).padStart(2, "0")} min`}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <PickButton
            capture
            icon={<VideoIcon className="h-7 w-7" />}
            label="Grabar video"
            onFile={handleFile}
          />
          <PickButton
            icon={<UploadIcon className="h-7 w-7" />}
            label="Elegir de galería"
            onFile={handleFile}
          />
        </div>
      )}

      {status.step === "error" && (
        <p
          className="rounded-xl bg-danger/10 px-4 py-3 text-sm text-danger"
          role="alert"
        >
          {status.message}
        </p>
      )}

      {status.step === "uploading" && (
        <div aria-live="polite" className="flex flex-col gap-2">
          <div className="flex justify-between text-sm">
            <span className="font-semibold">Subiendo video…</span>
            <span className="font-display">{status.progress}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-white/10">
            <div
              aria-valuemax={100}
              aria-valuemin={0}
              aria-valuenow={status.progress}
              className="h-full rounded-full bg-accent transition-[width]"
              role="progressbar"
              style={{ width: `${status.progress}%` }}
            />
          </div>
          <p className="text-xs text-muted">
            No cierres esta pantalla hasta que termine.
          </p>
        </div>
      )}

      {status.step === "confirming" && (
        <p aria-live="polite" className="text-center text-sm font-semibold">
          Procesando…
        </p>
      )}

      {selected && (
        <div className="flex flex-col gap-2">
          {status.step === "uploading" ? (
            <button
              className="button button--tertiary button--lg w-full rounded-xl font-bold"
              type="button"
              onClick={() => abortRef.current?.abort()}
            >
              Cancelar subida
            </button>
          ) : (
            <>
              <button
                className="button button--primary button--lg w-full rounded-xl font-bold"
                disabled={busy}
                type="button"
                onClick={handleUpload}
              >
                <UploadIcon className="h-5 w-5" />
                Confirmar y enviar
              </button>
              <button
                className="button button--tertiary button--md w-full rounded-xl font-semibold"
                disabled={busy}
                type="button"
                onClick={reset}
              >
                Elegir otro video
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function PickButton({
  label,
  icon,
  capture,
  onFile,
}: {
  label: string;
  icon: React.ReactNode;
  capture?: boolean;
  onFile: (file: File | undefined) => void;
}) {
  return (
    <label className="flex cursor-pointer flex-col items-center gap-2 rounded-2xl border border-dashed border-white/20 bg-background/40 px-3 py-6 text-center text-sm font-semibold transition-colors hover:border-accent hover:bg-accent/5 focus-within:border-accent">
      <span className="text-accent">{icon}</span>
      {label}
      <input
        accept="video/*"
        capture={capture ? "environment" : undefined}
        className="sr-only"
        type="file"
        onChange={(event) => {
          onFile(event.target.files?.[0]);
          event.target.value = "";
        }}
      />
    </label>
  );
}
