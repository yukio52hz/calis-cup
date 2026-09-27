import "server-only";

import { createClient } from "@supabase/supabase-js";

import { env } from "@/lib/env";

// Buckets privados (sin políticas de storage): solo el servidor firma URLs.
export type Bucket = "videos" | "receipts";

// Cliente con la secret key: ignora RLS. Usar solo después de autorizar en el DAL.
function storage(bucket: Bucket) {
  return createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SECRET_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  }).storage.from(bucket);
}

// URL de subida de un solo uso (válida 2 h) para subir directo desde el navegador
export async function createUploadUrl(bucket: Bucket, path: string) {
  const { data, error } = await storage(bucket).createSignedUploadUrl(path);

  if (error) throw error;

  return data.signedUrl;
}

export async function fileExists(bucket: Bucket, path: string) {
  const { data } = await storage(bucket).exists(path);

  return Boolean(data);
}

// URLs de lectura temporales (1 h) para archivos privados
export async function createReadUrls(bucket: Bucket, paths: string[]) {
  if (paths.length === 0) return new Map<string, string>();

  const { data, error } = await storage(bucket).createSignedUrls(
    paths,
    60 * 60,
  );

  if (error) throw error;

  return new Map(
    data.flatMap((item) =>
      item.path && item.signedUrl ? [[item.path, item.signedUrl] as const] : [],
    ),
  );
}

// URL temporal (5 min) que fuerza la descarga con un nombre de archivo legible
export async function createDownloadUrl(
  bucket: Bucket,
  path: string,
  fileName: string,
) {
  const { data, error } = await storage(bucket).createSignedUrl(path, 5 * 60, {
    download: fileName,
  });

  if (error) throw error;

  return data.signedUrl;
}

export async function deleteFiles(bucket: Bucket, paths: string[]) {
  if (paths.length === 0) return;

  const { error } = await storage(bucket).remove(paths);

  if (error) throw error;
}
