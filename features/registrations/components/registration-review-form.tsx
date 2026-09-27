"use client";

import type { FormState } from "@/features/users/form-state";

import { useActionState, useState } from "react";
import {
  Button,
  FieldError,
  Form,
  Label,
  TextArea,
  TextField,
} from "@heroui/react";

import { reviewRegistrationAction } from "../actions";
import { REJECTION_REASONS } from "../schemas";

export function RegistrationReviewForm({
  registrationId,
}: {
  registrationId: string;
}) {
  const [state, action, isPending] = useActionState<FormState, FormData>(
    reviewRegistrationAction.bind(null, registrationId),
    {},
  );
  const [decision, setDecision] = useState<"approve" | "reject">("approve");
  const [reason, setReason] = useState("");

  return (
    <Form
      action={action}
      className="flex flex-col gap-4"
      validationErrors={state.errors}
    >
      <TextField fullWidth name="reason" value={reason} onChange={setReason}>
        <Label>Motivo (obligatorio al rechazar)</Label>
        <TextArea placeholder="Se enviará al competidor" rows={2} />
        <FieldError />
      </TextField>

      {/* Motivos frecuentes (§10) */}
      <div className="flex flex-wrap gap-2">
        {REJECTION_REASONS.map((r) => (
          <button
            key={r}
            className="rounded-full border border-white/15 px-3 py-1 text-xs font-semibold text-muted hover:border-danger/60 hover:text-foreground"
            type="button"
            onClick={() => setReason(r)}
          >
            {r}
          </button>
        ))}
      </div>

      <label className="flex items-center gap-2 text-sm text-muted">
        <input
          defaultChecked
          className="h-4 w-4 accent-[var(--accent)]"
          name="next"
          type="checkbox"
          value="1"
        />
        Al guardar, abrir la siguiente inscripción pendiente
      </label>

      {state.message && (
        <p
          className="rounded-xl bg-danger/10 px-4 py-3 text-sm text-danger"
          role="alert"
        >
          {state.message}
        </p>
      )}

      <div className="grid grid-cols-2 gap-3">
        <Button
          fullWidth
          className="font-bold"
          isDisabled={isPending}
          isPending={isPending && decision === "reject"}
          name="decision"
          size="lg"
          type="submit"
          value="reject"
          variant="tertiary"
          onPress={() => setDecision("reject")}
        >
          Rechazar
        </Button>
        <Button
          fullWidth
          className="bg-success font-bold text-success-foreground"
          isDisabled={isPending}
          isPending={isPending && decision === "approve"}
          name="decision"
          size="lg"
          type="submit"
          value="approve"
          onPress={() => setDecision("approve")}
        >
          Aprobar
        </Button>
      </div>
    </Form>
  );
}
