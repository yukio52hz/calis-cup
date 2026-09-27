// Sube un archivo a una URL firmada de Supabase Storage con XHR para poder
// mostrar el progreso (mismo formato que storage-js uploadToSignedUrl).
export function uploadWithProgress(
  signedUrl: string,
  file: File,
  onProgress: (percent: number) => void,
  signal?: AbortSignal,
) {
  return new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const body = new FormData();

    body.append("cacheControl", "3600");
    body.append("", file);

    xhr.open("PUT", signedUrl);
    xhr.setRequestHeader("x-upsert", "false");
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    };
    xhr.onload = () =>
      xhr.status >= 200 && xhr.status < 300
        ? resolve()
        : reject(new Error(`Error ${xhr.status} al subir el archivo`));
    xhr.onerror = () =>
      reject(new Error("Se perdió la conexión durante la subida."));
    xhr.onabort = () =>
      reject(new DOMException("Subida cancelada", "AbortError"));
    signal?.addEventListener("abort", () => xhr.abort());
    xhr.send(body);
  });
}

export function formatMb(bytes: number) {
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}
