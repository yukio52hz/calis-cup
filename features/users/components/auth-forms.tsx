"use client";

import type { FormState } from "../form-state";

import { useActionState } from "react";
import NextLink from "next/link";
import {
  Button,
  FieldError,
  Form,
  Label,
  Radio,
  RadioGroup,
} from "@heroui/react";

import { ROUTES } from "@/lib/constants";

import {
  forgotPasswordAction,
  resetPasswordAction,
  signInAction,
  signUpAction,
} from "../auth-actions";
import { CATEGORY_LABELS, type ProfileInput } from "../schemas";

import { FormField, FormMessage } from "./form-field";

const linkClass = "text-accent underline-offset-4 hover:underline";

export function LoginForm({ next }: { next?: string }) {
  const [state, action, isPending] = useActionState(signInAction, {});

  return (
    <Form
      action={action}
      className="flex w-full flex-col gap-4"
      validationErrors={state.errors}
    >
      {next && <input name="next" type="hidden" value={next} />}
      <FormField
        isRequired
        autoComplete="email"
        label="Email"
        name="email"
        type="email"
      />
      <FormField
        isRequired
        autoComplete="current-password"
        label="Contraseña"
        name="password"
        type="password"
      />
      <NextLink
        className={`${linkClass} self-end text-sm`}
        href={ROUTES.forgotPassword}
      >
        ¿Olvidaste tu contraseña?
      </NextLink>
      <FormMessage {...state} />
      <Button
        fullWidth
        className="font-bold"
        isPending={isPending}
        size="lg"
        type="submit"
      >
        Entrar
      </Button>
    </Form>
  );
}

export function RegisterForm() {
  const [state, action, isPending] = useActionState(signUpAction, {});

  if (state.success) return <CheckEmail message={state.message} />;

  return (
    <Form
      action={action}
      className="flex w-full flex-col gap-4"
      validationErrors={state.errors}
    >
      <div className="grid grid-cols-2 gap-3">
        <FormField
          isRequired
          autoComplete="given-name"
          label="Nombre"
          name="firstName"
        />
        <FormField
          isRequired
          autoComplete="family-name"
          label="Apellido"
          name="lastName"
        />
      </div>
      <CategoryField />
      <FormField
        isRequired
        autoComplete="email"
        label="Email"
        name="email"
        type="email"
      />
      <FormField
        isRequired
        autoComplete="new-password"
        label="Contraseña"
        name="password"
        placeholder="Mínimo 8 caracteres"
        type="password"
      />
      <FormField
        isRequired
        autoComplete="new-password"
        label="Confirmar contraseña"
        name="confirmPassword"
        type="password"
      />
      <FormMessage {...state} />
      <Button
        fullWidth
        className="font-bold"
        isPending={isPending}
        size="lg"
        type="submit"
      >
        Crear cuenta
      </Button>
    </Form>
  );
}

export function ForgotPasswordForm() {
  const [state, action, isPending] = useActionState(forgotPasswordAction, {});

  if (state.success) return <CheckEmail message={state.message} />;

  return (
    <Form
      action={action}
      className="flex w-full flex-col gap-4"
      validationErrors={state.errors}
    >
      <FormField
        isRequired
        autoComplete="email"
        label="Email"
        name="email"
        type="email"
      />
      <FormMessage {...state} />
      <Button
        fullWidth
        className="font-bold"
        isPending={isPending}
        size="lg"
        type="submit"
      >
        Enviar enlace
      </Button>
    </Form>
  );
}

export function ResetPasswordForm() {
  const [state, action, isPending] = useActionState(
    resetPasswordAction,
    {} as FormState,
  );

  return (
    <Form
      action={action}
      className="flex w-full flex-col gap-4"
      validationErrors={state.errors}
    >
      <FormField
        isRequired
        autoComplete="new-password"
        label="Nueva contraseña"
        name="password"
        type="password"
      />
      <FormField
        isRequired
        autoComplete="new-password"
        label="Confirmar contraseña"
        name="confirmPassword"
        type="password"
      />
      <FormMessage {...state} />
      <Button
        fullWidth
        className="font-bold"
        isPending={isPending}
        size="lg"
        type="submit"
      >
        Guardar contraseña
      </Button>
    </Form>
  );
}

export function CategoryField({
  defaultValue,
}: {
  defaultValue?: ProfileInput["category"];
}) {
  return (
    <RadioGroup isRequired defaultValue={defaultValue} name="category">
      <Label>Categoría</Label>
      <div className="grid grid-cols-2 gap-2">
        {(Object.keys(CATEGORY_LABELS) as ProfileInput["category"][]).map(
          (value) => (
            <Radio
              key={value}
              className="rounded-xl border border-white/10 bg-field-background transition-colors has-[input:checked]:border-accent has-[input:checked]:bg-accent/15"
              value={value}
            >
              <Radio.Content className="w-full cursor-pointer gap-2 px-3 py-3">
                <Radio.Control>
                  <Radio.Indicator />
                </Radio.Control>
                <span className="text-sm font-semibold sm:text-base">
                  {CATEGORY_LABELS[value]}
                </span>
              </Radio.Content>
            </Radio>
          ),
        )}
      </div>
      <FieldError />
    </RadioGroup>
  );
}

function CheckEmail({ message }: { message?: string }) {
  return (
    <div className="flex flex-col items-center gap-4 py-2 text-center">
      <span
        aria-hidden
        className="flex h-14 w-14 items-center justify-center rounded-full bg-accent/15 text-2xl"
      >
        ✉️
      </span>
      <p className="font-display text-xl uppercase">Revisa tu email</p>
      <p className="text-sm text-muted" role="status">
        {message}
      </p>
      <p className="text-xs text-muted">
        ¿No llegó? Revisa la carpeta de spam o promociones.
      </p>
      <NextLink
        className="button button--tertiary button--md w-full rounded-full font-semibold"
        href={ROUTES.login}
      >
        Volver a iniciar sesión
      </NextLink>
    </div>
  );
}
