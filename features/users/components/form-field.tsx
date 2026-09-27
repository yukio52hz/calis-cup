"use client";

import type { ComponentProps } from "react";

import { useState } from "react";
import { FieldError, Input, InputGroup, Label, TextField } from "@heroui/react";

type Props = {
  label: string;
  name: string;
  type?: ComponentProps<typeof Input>["type"];
  isRequired?: boolean;
  defaultValue?: string;
  autoComplete?: string;
  inputMode?: ComponentProps<typeof Input>["inputMode"];
  placeholder?: string;
};

export function FormField({
  label,
  name,
  type = "text",
  isRequired,
  defaultValue,
  autoComplete,
  inputMode,
  placeholder,
}: Props) {
  const [isVisible, setIsVisible] = useState(false);
  const isPassword = type === "password";

  return (
    <TextField
      fullWidth
      defaultValue={defaultValue}
      isRequired={isRequired}
      name={name}
      type={isPassword && isVisible ? "text" : type}
    >
      <Label>{label}</Label>
      {isPassword ? (
        <InputGroup className="w-full min-w-0">
          <InputGroup.Input
            autoComplete={autoComplete}
            className="min-w-0"
            placeholder={placeholder}
          />
          <InputGroup.Suffix>
            <button
              aria-label={
                isVisible ? "Ocultar contraseña" : "Mostrar contraseña"
              }
              className="text-xs font-semibold text-muted hover:text-foreground"
              type="button"
              onClick={() => setIsVisible((visible) => !visible)}
            >
              {isVisible ? "Ocultar" : "Mostrar"}
            </button>
          </InputGroup.Suffix>
        </InputGroup>
      ) : (
        <Input
          autoCapitalize={type === "email" ? "none" : undefined}
          autoComplete={autoComplete}
          inputMode={inputMode}
          placeholder={placeholder}
        />
      )}
      <FieldError />
    </TextField>
  );
}

export function FormMessage({
  message,
  success,
}: {
  message?: string;
  success?: boolean;
}) {
  if (!message) return null;

  return (
    <p
      className={
        success
          ? "rounded-xl bg-success/10 px-4 py-3 text-sm text-success"
          : "rounded-xl bg-danger/10 px-4 py-3 text-sm text-danger"
      }
      role={success ? "status" : "alert"}
    >
      {message}
    </p>
  );
}
