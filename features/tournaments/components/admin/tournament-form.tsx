"use client";

import type { FormState } from "@/features/users/form-state";

import { useActionState } from "react";
import { Button, Form } from "@heroui/react";
import clsx from "clsx";

import {
  createTournamentAction,
  updateTournamentAction,
} from "../../admin-actions";
import { TOURNAMENT_STATUS_LABELS } from "../../schemas";

import { Field, Message } from "./fields";

type Tournament = {
  id: string;
  name: string;
  description: string | null;
  registrationFee: number;
  extraVideoFee: number;
  sinpeNumber: string | null;
  status: keyof typeof TOURNAMENT_STATUS_LABELS;
};

// Crear (sin `tournament`) o editar la información del torneo (§37)
export function TournamentForm({ tournament }: { tournament?: Tournament }) {
  const [state, action, isPending] = useActionState<FormState, FormData>(
    tournament
      ? updateTournamentAction.bind(null, tournament.id)
      : createTournamentAction,
    {},
  );

  return (
    <Form
      action={action}
      className="flex flex-col gap-4"
      validationErrors={state.errors}
    >
      <Field
        isRequired
        defaultValue={tournament?.name}
        label="Nombre"
        name="name"
      />
      <Field
        multiline
        defaultValue={tournament?.description ?? ""}
        label="Descripción (opcional)"
        name="description"
      />
      <div className="grid grid-cols-2 gap-3">
        <Field
          isRequired
          defaultValue={String(tournament?.registrationFee ?? 2500)}
          inputMode="numeric"
          label="Inscripción (₡)"
          name="registrationFee"
        />
        <Field
          isRequired
          defaultValue={String(tournament?.extraVideoFee ?? 500)}
          inputMode="numeric"
          label="Video extra (₡)"
          name="extraVideoFee"
        />
      </div>
      <Field
        isRequired
        defaultValue={tournament?.sinpeNumber ?? ""}
        inputMode="tel"
        label="Número SINPE Móvil"
        name="sinpeNumber"
        placeholder="8888-8888"
      />

      {tournament ? (
        <fieldset className="flex flex-col gap-2">
          <legend className="mb-2 text-sm font-medium">Estado</legend>
          <div className="grid grid-cols-3 gap-2">
            {(
              Object.keys(TOURNAMENT_STATUS_LABELS) as Tournament["status"][]
            ).map((s) => (
              <label
                key={s}
                className={clsx(
                  "cursor-pointer rounded-xl border border-white/10 px-3 py-2.5 text-center text-sm font-semibold",
                  "has-[input:checked]:border-accent has-[input:checked]:bg-accent/15",
                )}
              >
                <input
                  className="sr-only"
                  defaultChecked={tournament.status === s}
                  name="status"
                  type="radio"
                  value={s}
                />
                {TOURNAMENT_STATUS_LABELS[s]}
              </label>
            ))}
          </div>
          <p className="text-xs text-muted">
            Solo el torneo activo aparece a los competidores. Activar este
            finaliza los demás.
          </p>
        </fieldset>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <Field
            isRequired
            label="Inicio (semana 1)"
            name="startDate"
            type="date"
          />
          <Field
            isRequired
            defaultValue="4"
            inputMode="numeric"
            label="Semanas"
            name="weeks"
          />
        </div>
      )}

      <Message {...state} />
      <Button
        fullWidth
        className="font-bold"
        isPending={isPending}
        size="lg"
        type="submit"
      >
        {tournament ? "Guardar cambios" : "Crear torneo"}
      </Button>
    </Form>
  );
}
