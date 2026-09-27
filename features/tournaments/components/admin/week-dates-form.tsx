"use client";

import type { FormState } from "@/features/users/form-state";

import { useActionState } from "react";
import { Button, Form } from "@heroui/react";

import { updateWeekDatesAction } from "../../admin-actions";

import { Field, Message } from "./fields";

// Fechas de la semana en hora de Costa Rica (§33)
export function WeekDatesForm({
  weekId,
  startsAt,
  endsAt,
}: {
  weekId: string;
  // "YYYY-MM-DDTHH:mm" en hora CR
  startsAt: string;
  endsAt: string;
}) {
  const [state, action, isPending] = useActionState<FormState, FormData>(
    updateWeekDatesAction.bind(null, weekId),
    {},
  );

  return (
    <Form
      action={action}
      className="flex flex-col gap-4"
      validationErrors={state.errors}
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <Field
          isRequired
          defaultValue={startsAt}
          label="Inicio"
          name="startsAt"
          type="datetime-local"
        />
        <Field
          isRequired
          defaultValue={endsAt}
          label="Fecha límite"
          name="endsAt"
          type="datetime-local"
        />
      </div>
      <p className="text-xs text-muted">Hora de Costa Rica.</p>
      <Message {...state} />
      <Button
        className="self-start font-bold"
        isPending={isPending}
        type="submit"
        variant="tertiary"
      >
        Guardar fechas
      </Button>
    </Form>
  );
}
