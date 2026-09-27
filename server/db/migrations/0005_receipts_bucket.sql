-- Bucket privado para comprobantes SINPE (§9, §46). Imágenes o PDF, 5 MB.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('receipts', 'receipts', false, 5242880, ARRAY['image/*', 'application/pdf'])
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;
