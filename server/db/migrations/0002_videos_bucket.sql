-- Bucket privado para los videos de los competidores (§46).
-- 50 MB = límite por archivo del plan Free de Supabase. Sin políticas de
-- storage: solo el servidor (secret key) firma URLs de subida y lectura.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('videos', 'videos', false, 52428800, ARRAY['video/*'])
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;
