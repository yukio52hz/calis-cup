"use client";

import type { FormState } from "@/features/users/form-state";
import type { ChallengeInput } from "../../schemas";

import { useActionState, useState } from "react";
import { Button, Form, Input, Label, TextArea, TextField } from "@heroui/react";

import { saveChallengeAction } from "../../admin-actions";

import { Message } from "./fields";

type Exercise = {
  key: number;
  name: string;
  repetitions: string;
  penaltySeconds: string;
};

let nextKey = 0;
const row = (e?: Partial<Exercise>): Exercise => ({
  key: nextKey++,
  name: e?.name ?? "",
  repetitions: e?.repetitions ?? "10",
  penaltySeconds: e?.penaltySeconds ?? "5",
});

// Editor del reto (§39-40): el formulario viaja como JSON a la Server Action
export function ChallengeEditor({
  weekId,
  initial,
}: {
  weekId: string;
  initial: ChallengeInput | null;
}) {
  const [state, action, isPending] = useActionState<FormState, FormData>(
    saveChallengeAction.bind(null, weekId),
    {},
  );
  const [name, setName] = useState(initial?.name ?? "");
  const [objective, setObjective] = useState(
    initial?.objective ?? "Completa el set en el menor tiempo posible.",
  );
  const [rules, setRules] = useState((initial?.rules ?? []).join("\n"));
  const [exercises, setExercises] = useState<Exercise[]>(() =>
    initial?.exercises.length
      ? initial.exercises.map((e) =>
          row({
            name: e.name,
            repetitions: String(e.repetitions),
            penaltySeconds: String(e.penaltySeconds),
          }),
        )
      : [row()],
  );

  const payload = JSON.stringify({
    name,
    objective,
    rules: rules
      .split("\n")
      .map((r) => r.trim())
      .filter(Boolean),
    exercises: exercises.map(({ key: _key, ...e }) => e),
  });

  function update(key: number, patch: Partial<Exercise>) {
    setExercises((list) =>
      list.map((e) => (e.key === key ? { ...e, ...patch } : e)),
    );
  }

  function move(index: number, delta: number) {
    setExercises((list) => {
      const next = [...list];
      const [item] = next.splice(index, 1);

      next.splice(index + delta, 0, item);

      return next;
    });
  }

  return (
    <Form action={action} className="flex flex-col gap-5">
      <input name="challenge" type="hidden" value={payload} />

      <TextField fullWidth isRequired value={name} onChange={setName}>
        <Label>Nombre del reto</Label>
        <Input placeholder="Ej.: Muscle up" />
      </TextField>

      <TextField fullWidth value={objective} onChange={setObjective}>
        <Label>Objetivo</Label>
        <TextArea rows={2} />
      </TextField>

      <fieldset className="flex flex-col gap-3">
        <legend className="mb-1 text-sm font-medium">
          Ejercicios y penalizaciones
        </legend>
        {exercises.map((exercise, index) => (
          <div
            key={exercise.key}
            className="flex flex-col gap-2 rounded-xl border border-white/10 bg-background/40 p-3"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold tracking-widest text-muted">
                EJERCICIO {index + 1}
              </span>
              <div className="flex gap-1">
                <IconButton
                  disabled={index === 0}
                  label="Subir"
                  onClick={() => move(index, -1)}
                >
                  ↑
                </IconButton>
                <IconButton
                  disabled={index === exercises.length - 1}
                  label="Bajar"
                  onClick={() => move(index, 1)}
                >
                  ↓
                </IconButton>
                <IconButton
                  disabled={exercises.length === 1}
                  label="Quitar"
                  onClick={() =>
                    setExercises((l) => l.filter((e) => e.key !== exercise.key))
                  }
                >
                  ✕
                </IconButton>
              </div>
            </div>
            <TextField
              fullWidth
              aria-label={`Nombre del ejercicio ${index + 1}`}
              value={exercise.name}
              onChange={(value) => update(exercise.key, { name: value })}
            >
              <Input placeholder="Ej.: Pull up" />
            </TextField>
            <div className="grid grid-cols-2 gap-2">
              <TextField
                fullWidth
                value={exercise.repetitions}
                onChange={(value) =>
                  update(exercise.key, { repetitions: value })
                }
              >
                <Label>Repeticiones</Label>
                <Input inputMode="numeric" />
              </TextField>
              <TextField
                fullWidth
                value={exercise.penaltySeconds}
                onChange={(value) =>
                  update(exercise.key, { penaltySeconds: value })
                }
              >
                <Label>Penalización (s)</Label>
                <Input inputMode="numeric" />
              </TextField>
            </div>
          </div>
        ))}
        <button
          className="rounded-xl border border-dashed border-white/20 py-3 text-sm font-semibold text-muted hover:border-accent hover:text-foreground"
          type="button"
          onClick={() => setExercises((list) => [...list, row()])}
        >
          + Agregar ejercicio
        </button>
        <p className="text-xs text-muted">
          Guía del §20: +5 s para Muscle up, Pistol, Toes to bar, Pull up y Chin
          up; +3 s para Push up, Dip, Squat, Squat con salto y Desplante.
        </p>
      </fieldset>

      <TextField fullWidth value={rules} onChange={setRules}>
        <Label>Reglas (una por línea)</Label>
        <TextArea
          placeholder={
            "Video continuo, sin cortes.\nTodo el cuerpo debe verse."
          }
          rows={4}
        />
      </TextField>

      <Message {...state} />
      <Button
        fullWidth
        className="font-bold"
        isPending={isPending}
        size="lg"
        type="submit"
      >
        Guardar reto
      </Button>
    </Form>
  );
}

function IconButton({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      aria-label={label}
      className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-sm disabled:opacity-30"
      disabled={disabled}
      title={label}
      type="button"
      onClick={onClick}
    >
      {children}
    </button>
  );
}
