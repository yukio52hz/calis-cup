"use client";

import type { FormState } from "@/features/users/form-state";

import { useActionState, useState } from "react";
import {
  Button,
  FieldError,
  Form,
  Input,
  Label,
  TextArea,
  TextField,
} from "@heroui/react";
import clsx from "clsx";

import { formatDuration } from "@/lib/format";

import { reviewSubmissionAction } from "../review-actions";

type Exercise = {
  id: string;
  name: string;
  repetitions: number;
  penaltySeconds: number;
};

function parseTime(value: string) {
  const match = /^(\d{1,2}):([0-5]\d)$/.exec(value.trim());

  return match ? (Number(match[1]) * 60 + Number(match[2])) * 1000 : null;
}

// El teclado numérico en móvil no tiene ":", así que se inserta solo:
// "023" → "0:23", "0234" → "02:34"
function maskTime(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 4);

  return digits.length > 2
    ? `${digits.slice(0, -2)}:${digits.slice(-2)}`
    : digits;
}

export function ReviewForm({
  submissionId,
  exercises,
  initial,
}: {
  submissionId: string;
  exercises: Exercise[];
  // Valores de una revisión previa (para corregirla)
  initial?: {
    rawTimeMs: number | null;
    notes: string | null;
    counts: Record<string, number>;
  };
}) {
  const [state, action, isPending] = useActionState<FormState, FormData>(
    reviewSubmissionAction.bind(null, submissionId),
    {},
  );
  const [decision, setDecision] = useState<"approve" | "reject">("approve");
  const [rawTime, setRawTime] = useState(
    initial?.rawTimeMs ? formatDuration(initial.rawTimeMs) : "",
  );
  const [counts, setCounts] = useState<Record<string, number>>(
    initial?.counts ?? {},
  );

  const penaltyMs = exercises.reduce(
    (sum, e) => sum + (counts[e.id] ?? 0) * e.penaltySeconds * 1000,
    0,
  );
  const rawMs = parseTime(rawTime);

  function change(id: string, delta: number) {
    setCounts((prev) => ({
      ...prev,
      [id]: Math.max(0, (prev[id] ?? 0) + delta),
    }));
  }

  return (
    <Form
      action={action}
      className="flex flex-col gap-5"
      validationErrors={state.errors}
    >
      <TextField
        fullWidth
        name="rawTime"
        value={rawTime}
        onChange={(value) => setRawTime(maskTime(value))}
      >
        <Label>Tiempo registrado (mm:ss)</Label>
        <Input
          className="font-display text-2xl"
          inputMode="numeric"
          placeholder="mm:ss"
        />
        <FieldError />
      </TextField>

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 text-sm font-medium">
          Repeticiones incorrectas (§20)
        </legend>
        {exercises.map((exercise) => {
          const count = counts[exercise.id] ?? 0;

          return (
            <div
              key={exercise.id}
              className="flex items-center justify-between gap-3 rounded-xl bg-background/50 px-3 py-2"
            >
              <input
                name={`penalty-${exercise.id}`}
                type="hidden"
                value={count}
              />
              <div className="min-w-0">
                <p className="truncate font-semibold">{exercise.name}</p>
                <p className="text-xs text-muted">
                  {exercise.repetitions} reps · +{exercise.penaltySeconds}s c/u
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  aria-label={`Quitar penalización de ${exercise.name}`}
                  className="h-9 w-9 rounded-full bg-white/10 text-lg font-bold disabled:opacity-40"
                  disabled={count === 0}
                  type="button"
                  onClick={() => change(exercise.id, -1)}
                >
                  −
                </button>
                <span
                  aria-live="polite"
                  className={clsx(
                    "w-6 text-center font-display",
                    count > 0 && "text-accent",
                  )}
                >
                  {count}
                </span>
                <button
                  aria-label={`Agregar penalización a ${exercise.name}`}
                  className="h-9 w-9 rounded-full bg-accent/20 text-lg font-bold text-accent"
                  type="button"
                  onClick={() => change(exercise.id, 1)}
                >
                  +
                </button>
              </div>
            </div>
          );
        })}
      </fieldset>

      {/* Resultado final (§21) */}
      <dl className="grid grid-cols-3 gap-2 rounded-2xl border border-white/10 p-3 text-center">
        <div>
          <dt className="text-[0.7rem] text-muted">Tiempo</dt>
          <dd className="font-display text-lg">
            {rawMs !== null ? formatDuration(rawMs) : "--:--"}
          </dd>
        </div>
        <div>
          <dt className="text-[0.7rem] text-muted">Penalización</dt>
          <dd className="font-display text-lg text-accent">
            +{penaltyMs / 1000}s
          </dd>
        </div>
        <div>
          <dt className="text-[0.7rem] text-muted">Resultado final</dt>
          <dd className="font-display text-lg">
            {rawMs !== null ? formatDuration(rawMs + penaltyMs) : "--:--"}
          </dd>
        </div>
      </dl>

      <TextField fullWidth defaultValue={initial?.notes ?? ""} name="notes">
        <Label>
          Observación {decision === "reject" && "(obligatoria al rechazar)"}
        </Label>
        <TextArea placeholder="Ej.: Repetición #8 incorrecta." rows={3} />
        <FieldError />
      </TextField>

      <label className="flex items-center gap-2 text-sm text-muted">
        <input
          defaultChecked
          className="h-4 w-4 accent-[var(--accent)]"
          name="next"
          type="checkbox"
          value="1"
        />
        Al guardar, abrir el siguiente video pendiente
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
