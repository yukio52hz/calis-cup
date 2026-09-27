import { Card } from "@/components/ui/card";

// Comprobante SINPE (§9): imagen en grande o enlace al PDF
export function ReceiptPreview({ url, path }: { url?: string; path: string }) {
  return (
    <Card className="flex flex-col gap-3">
      <p className="text-xs font-bold tracking-[0.2em] text-muted">
        COMPROBANTE
      </p>
      {!url ? (
        <p className="text-muted">No se encontró el comprobante.</p>
      ) : path.endsWith(".pdf") ? (
        <a
          className="button button--tertiary button--md rounded-xl font-semibold"
          href={url}
          rel="noopener noreferrer"
          target="_blank"
        >
          Abrir PDF del comprobante
        </a>
      ) : (
        <a href={url} rel="noopener noreferrer" target="_blank">
          {/* eslint-disable-next-line @next/next/no-img-element -- URL firmada temporal de Storage */}
          <img
            alt="Comprobante SINPE"
            className="max-h-[70vh] w-full rounded-xl bg-black object-contain"
            src={url}
          />
        </a>
      )}
    </Card>
  );
}
