"use client";

import type { FormState } from "@/features/users/form-state";

import { useActionState, useState } from "react";
import {
  Button,
  FieldError,
  Form,
  Input,
  Label,
  TextField,
} from "@heroui/react";

import { UploadIcon } from "@/components/ui/icons";
import { MAX_RECEIPT_BYTES } from "@/lib/constants";
import { formatMb, uploadWithProgress } from "@/lib/upload";

import { todayInCostaRica } from "../schemas";

type ReceiptUploadAction = (input: {
  size: number;
  type: string;
}) => Promise<
  { ok: true; signedUrl: string; path: string } | { ok: false; message: string }
>;

type Receipt =
  | { step: "empty" }
  | { step: "uploading"; name: string; progress: number }
  | { step: "done"; name: string; path: string; previewUrl: string | null }
  | { step: "error"; message: string };

// Formulario "Ya realicé el pago" (§9, §26): monto, referencia, fecha y
// comprobante. Lo usan la inscripción y el video extra.
export function PaymentForm({
  fee,
  submitAction,
  requestReceiptUpload,
}: {
  fee: number;
  submitAction: (state: FormState, formData: FormData) => Promise<FormState>;
  requestReceiptUpload: ReceiptUploadAction;
}) {
  const [state, action, isPending] = useActionState<FormState, FormData>(
    submitAction,
    {},
  );
  const [receipt, setReceipt] = useState<Receipt>({ step: "empty" });

  async function handleFile(file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith("image/") && file.type !== "application/pdf") {
      setReceipt({ step: "error", message: "Sube una imagen o un PDF." });

      return;
    }
    if (file.size > MAX_RECEIPT_BYTES) {
      setReceipt({
        step: "error",
        message: `El comprobante pesa ${formatMb(file.size)}; el máximo es 5 MB.`,
      });

      return;
    }

    setReceipt({ step: "uploading", name: file.name, progress: 0 });

    const request = await requestReceiptUpload({
      size: file.size,
      type: file.type,
    });

    if (!request.ok) {
      setReceipt({ step: "error", message: request.message });

      return;
    }

    try {
      await uploadWithProgress(request.signedUrl, file, (progress) =>
        setReceipt({ step: "uploading", name: file.name, progress }),
      );
      setReceipt({
        step: "done",
        name: file.name,
        path: request.path,
        previewUrl: file.type.startsWith("image/")
          ? URL.createObjectURL(file)
          : null,
      });
    } catch (error) {
      setReceipt({ step: "error", message: (error as Error).message });
    }
  }

  const receiptError = state.errors?.receiptPath?.[0];

  return (
    <Form
      action={action}
      className="flex flex-col gap-4"
      validationErrors={state.errors}
    >
      <div className="grid grid-cols-2 gap-3">
        <TextField
          fullWidth
          isRequired
          defaultValue={String(fee)}
          name="amount"
        >
          <Label>Monto (₡)</Label>
          <Input inputMode="numeric" />
          <FieldError />
        </TextField>
        <TextField
          fullWidth
          isRequired
          defaultValue={todayInCostaRica()}
          name="paidOn"
          type="date"
        >
          <Label>Fecha del pago</Label>
          <Input max={todayInCostaRica()} />
          <FieldError />
        </TextField>
      </div>

      <TextField fullWidth isRequired name="reference">
        <Label>Número de referencia</Label>
        <Input inputMode="numeric" placeholder="Ej.: 2026092612345678" />
        <FieldError />
      </TextField>

      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium">
          Comprobante <span className="text-danger">*</span>
        </span>
        <input
          name="receiptPath"
          type="hidden"
          value={receipt.step === "done" ? receipt.path : ""}
        />

        {receipt.step === "done" ? (
          <div className="flex items-center gap-3 rounded-xl border border-success/30 bg-success/5 p-3">
            {receipt.previewUrl ? (
              // eslint-disable-next-line @next/next/no-img-element -- vista previa local (blob:)
              <img
                alt="Vista previa del comprobante"
                className="h-16 w-16 rounded-lg object-cover"
                src={receipt.previewUrl}
              />
            ) : (
              <span className="flex h-16 w-16 items-center justify-center rounded-lg bg-white/10 text-xs font-bold">
                PDF
              </span>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{receipt.name}</p>
              <p className="text-xs text-success">Comprobante subido</p>
            </div>
            <button
              className="text-xs font-semibold text-muted hover:text-foreground"
              type="button"
              onClick={() => setReceipt({ step: "empty" })}
            >
              Cambiar
            </button>
          </div>
        ) : receipt.step === "uploading" ? (
          <div
            aria-live="polite"
            className="flex flex-col gap-2 rounded-xl bg-background/50 p-3"
          >
            <div className="flex justify-between text-sm">
              <span className="truncate">{receipt.name}</span>
              <span className="font-display">{receipt.progress}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-accent transition-[width]"
                style={{ width: `${receipt.progress}%` }}
              />
            </div>
          </div>
        ) : (
          <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-white/20 bg-background/40 px-4 py-5 text-sm font-semibold transition-colors hover:border-accent focus-within:border-accent">
            <UploadIcon className="h-5 w-5 text-accent" />
            Subir comprobante (imagen o PDF)
            <input
              accept="image/*,application/pdf"
              className="sr-only"
              type="file"
              onChange={(event) => {
                handleFile(event.target.files?.[0]);
                event.target.value = "";
              }}
            />
          </label>
        )}
        {(receipt.step === "error" || receiptError) && (
          <p className="text-sm text-danger" role="alert">
            {receipt.step === "error" ? receipt.message : receiptError}
          </p>
        )}
      </div>

      {state.message && (
        <p
          className="rounded-xl bg-danger/10 px-4 py-3 text-sm text-danger"
          role="alert"
        >
          {state.message}
        </p>
      )}

      <Button
        fullWidth
        className="font-bold"
        isDisabled={receipt.step !== "done"}
        isPending={isPending}
        size="lg"
        type="submit"
      >
        Ya realicé el pago
      </Button>
    </Form>
  );
}
