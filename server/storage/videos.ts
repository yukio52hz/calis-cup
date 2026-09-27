import "server-only";

import { createClient } from "@supabase/supabase-js";

import { env } from "@/lib/env";

const BUCKET = "videos";

// Cliente con la secret key: ignora RLS. Usar solo después de autorizar en el DAL.
function adminStorage() {
  return createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SECRET_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  }).storage.from(BUCKET);
}

// URL de subida de un solo uso (válida 2 h) para subir directo desde el teléfono
export async function createVideoUploadUrl(path: string) {
  const { data, error } = await adminStorage().createSignedUploadUrl(path);

  if (error) throw error;

  return data.signedUrl;
}

export async function videoExists(path: string) {
  const { data } = await adminStorage().exists(path);

  return Boolean(data);
}

// URLs de reproducción temporales (1 h) para videos privados
export async function createVideoPlaybackUrls(paths: string[]) {
  if (paths.length === 0) return new Map<string, string>();

  const { data, error } = await adminStorage().createSignedUrls(paths, 60 * 60);

  if (error) throw error;

  return new Map(
    data.flatMap((item) =>
      item.path && item.signedUrl ? [[item.path, item.signedUrl] as const] : [],
    ),
  );
}
