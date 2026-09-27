import NextLink from "next/link";
import { notFound } from "next/navigation";

import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { ReviewForm } from "@/features/submissions/components/review-form";
import { SUBMISSION_STATUS } from "@/features/submissions/components/submission-status";
import { VideoAdminActions } from "@/features/submissions/components/video-admin-actions";
import { getSubmissionForReview } from "@/features/submissions/server/review-queries";
import { CATEGORY_LABELS } from "@/features/users/schemas";
import { ROUTES } from "@/lib/constants";
import { formatDateTime } from "@/lib/format";
import { createDownloadUrl, createReadUrls } from "@/server/storage/files";

export default async function ReviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const row = /^[0-9a-f-]{36}$/.test(id)
    ? await getSubmissionForReview(id)
    : null;

  if (!row) notFound();

  const { submission, exercises } = row;
  const path = submission.videoPath;
  // Nombre de archivo legible: semana-2_perez-juan_intento-1.mp4
  const slug = (value: string) =>
    value
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  const extension = path?.split(".").pop() ?? "mp4";
  const [videoUrl, downloadUrl] = path
    ? await Promise.all([
        createReadUrls("videos", [path]).then((urls) => urls.get(path)),
        createDownloadUrl(
          "videos",
          path,
          `semana-${row.weekNumber}_${slug(row.lastName)}-${slug(row.firstName)}_intento-${submission.attemptNumber}.${extension}`,
        ),
      ])
    : [undefined, null];
  const status = SUBMISSION_STATUS[submission.status];
  // Si ya se revisó, precarga los valores para poder corregir
  const counts = Object.fromEntries(
    exercises.map((e) => [
      e.id,
      submission.penalties.find((p) => p.exercise === e.name)?.count ?? 0,
    ]),
  );

  return (
    <div className="flex flex-col gap-4 py-6">
      <NextLink
        className="text-sm font-semibold text-muted hover:text-foreground"
        href={ROUTES.adminVideos}
      >
        ← Volver a videos
      </NextLink>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] lg:items-start">
        <div className="flex flex-col gap-4 lg:sticky lg:top-20">
          {videoUrl ? (
            // Videos de ejercicios grabados por el usuario, sin diálogo: no llevan subtítulos
            // eslint-disable-next-line jsx-a11y/media-has-caption
            <video
              controls
              playsInline
              className="max-h-[70vh] w-full rounded-2xl bg-black"
              preload="metadata"
              src={videoUrl}
            />
          ) : (
            <Card className="text-center text-muted">
              {submission.videoDeletedAt
                ? `Archivo eliminado el ${formatDateTime(submission.videoDeletedAt)}. El resultado se conserva.`
                : "No se encontró el archivo del video."}
            </Card>
          )}
          <Card>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xl font-bold">
                  {row.firstName} {row.lastName}
                </p>
                <p className="text-sm text-muted">{row.email}</p>
              </div>
              <StatusBadge tone={status.tone}>{status.label}</StatusBadge>
            </div>
            <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div>
                <dt className="text-muted">Categoría</dt>
                <dd className="font-semibold">
                  {CATEGORY_LABELS[row.category ?? row.profileCategory]}
                </dd>
              </div>
              <div>
                <dt className="text-muted">Semana</dt>
                <dd className="font-semibold">
                  {row.weekNumber} · {row.challengeName}
                </dd>
              </div>
              <div>
                <dt className="text-muted">Intento</dt>
                <dd className="font-semibold">#{submission.attemptNumber}</dd>
              </div>
              <div>
                <dt className="text-muted">Enviado</dt>
                <dd className="font-semibold">
                  {formatDateTime(submission.createdAt)}
                </dd>
              </div>
            </dl>
            <div className="mt-4 border-t border-white/10 pt-4">
              <VideoAdminActions
                downloadUrl={downloadUrl}
                hasFile={Boolean(path)}
                submissionId={submission.id}
              />
            </div>
          </Card>
        </div>

        <Card>
          <h1 className="mb-4 font-display text-xl uppercase">Revisión</h1>
          <ReviewForm
            exercises={exercises}
            initial={{
              rawTimeMs: submission.rawTimeMs,
              notes: submission.reviewerNotes,
              counts,
            }}
            submissionId={submission.id}
          />
        </Card>
      </div>
    </div>
  );
}
