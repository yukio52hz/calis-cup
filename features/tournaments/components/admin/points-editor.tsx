"use client";

import type { FormState } from "@/features/users/form-state";

import { useActionState, useState } from "react";
import { Button, Form } from "@heroui/react";

import { updatePointsAction } from "../../admin-actions";

import { Message } from "./fields";

// §22: puntos por posición editables (no hardcodeados)
export function PointsEditor({
  tournamentId,
  pointsByPosition,
  pointsBeyond,
}: {
  tournamentId: string;
  pointsByPosition: number[];
  pointsBeyond: number;
}) {
  const [state, action, isPending] = useActionState<FormState, FormData>(
    updatePointsAction.bind(null, tournamentId),
    {},
  );
  const [list, setList] = useState(pointsByPosition.map(String));
  const [beyond, setBeyond] = useState(String(pointsBeyond));

  const payload = JSON.stringify({
    pointsByPosition: list,
    pointsBeyond: beyond,
  });

  // Rellena con la regla clásica: 100, 95, 90… restando 5 (mínimo 5)
  function fillClassic() {
    setList(
      Array.from({ length: 20 }, (_, i) => String(Math.max(100 - i * 5, 5))),
    );
    setBeyond("5");
  }

  return (
    <Form action={action} className="flex flex-col gap-4">
      <input name="points" type="hidden" value={payload} />

      <ol className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {list.map((value, index) => (
          <li
            key={index}
            className="flex items-center gap-2 rounded-xl bg-background/50 py-1.5 pl-3 pr-1.5"
          >
            <span className="w-8 shrink-0 text-xs font-bold text-muted">
              {index + 1}.º
            </span>
            <input
              aria-label={`Puntos del ${index + 1}.º lugar`}
              className="w-full min-w-0 rounded-lg bg-field-background px-2 py-1.5 text-right font-display outline-none focus:ring-2 focus:ring-accent"
              inputMode="numeric"
              value={value}
              onChange={(event) =>
                setList((l) =>
                  l.map((v, i) => (i === index ? event.target.value : v)),
                )
              }
            />
          </li>
        ))}
      </ol>

      <div className="flex flex-wrap gap-2">
        <button
          className="rounded-full border border-dashed border-white/20 px-3 py-1.5 text-xs font-semibold text-muted hover:border-accent hover:text-foreground"
          type="button"
          onClick={() => setList((l) => [...l, beyond])}
        >
          + Agregar posición
        </button>
        <button
          className="rounded-full border border-white/10 px-3 py-1.5 text-xs font-semibold text-muted hover:text-foreground disabled:opacity-40"
          disabled={list.length <= 1}
          type="button"
          onClick={() => setList((l) => l.slice(0, -1))}
        >
          − Quitar última
        </button>
        <button
          className="rounded-full border border-white/10 px-3 py-1.5 text-xs font-semibold text-muted hover:text-foreground"
          type="button"
          onClick={fillClassic}
        >
          Usar 100, 95, 90…
        </button>
      </div>

      <label className="flex items-center justify-between gap-3 rounded-xl bg-background/50 px-3 py-2 text-sm">
        <span>Puntos del {list.length + 1}.º lugar en adelante</span>
        <input
          className="w-20 rounded-lg bg-field-background px-2 py-1.5 text-right font-display outline-none focus:ring-2 focus:ring-accent"
          inputMode="numeric"
          value={beyond}
          onChange={(event) => setBeyond(event.target.value)}
        />
      </label>

      <p className="text-xs text-muted">
        Los empates comparten posición y puntos. Cambiar la tabla recalcula toda
        la clasificación, incluidas las semanas cerradas.
      </p>

      <Message {...state} />
      <Button className="font-bold" isPending={isPending} type="submit">
        Guardar puntos
      </Button>
    </Form>
  );
}
