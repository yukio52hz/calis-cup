"use client";

import type { FormState } from "../form-state";
import type { ProfileInput } from "../schemas";

import { useActionState } from "react";
import { Button, Form } from "@heroui/react";

import { CategoryField } from "./auth-forms";
import { FormField, FormMessage } from "./form-field";

type Props = {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  defaultValues?: Partial<ProfileInput>;
  submitLabel: string;
};

export function ProfileForm({ action, defaultValues, submitLabel }: Props) {
  const [state, formAction, isPending] = useActionState(action, {});

  return (
    <Form
      action={formAction}
      className="flex w-full flex-col gap-4"
      validationErrors={state.errors}
    >
      <FormField
        isRequired
        autoComplete="given-name"
        defaultValue={defaultValues?.firstName}
        label="Nombre"
        name="firstName"
      />
      <FormField
        isRequired
        autoComplete="family-name"
        defaultValue={defaultValues?.lastName}
        label="Apellido"
        name="lastName"
      />
      <CategoryField defaultValue={defaultValues?.category} />
      <FormField
        autoComplete="tel"
        defaultValue={defaultValues?.phone ?? ""}
        inputMode="tel"
        label="Teléfono (opcional)"
        name="phone"
        type="tel"
      />
      <FormField
        autoComplete="username"
        defaultValue={defaultValues?.username ?? ""}
        label="Nombre de usuario (opcional)"
        name="username"
      />
      <FormMessage {...state} />
      <Button fullWidth isPending={isPending} type="submit">
        {submitLabel}
      </Button>
    </Form>
  );
}
