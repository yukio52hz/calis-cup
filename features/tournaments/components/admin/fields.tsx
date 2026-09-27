"use client";

import type { ComponentProps } from "react";

import { FieldError, Input, Label, TextArea, TextField } from "@heroui/react";

type FieldProps = {
  label: string;
  name: string;
  defaultValue?: string;
  isRequired?: boolean;
  type?: ComponentProps<typeof Input>["type"];
  inputMode?: ComponentProps<typeof Input>["inputMode"];
  placeholder?: string;
  multiline?: boolean;
};

export function Field({ label, multiline, ...props }: FieldProps) {
  return (
    <TextField
      fullWidth
      defaultValue={props.defaultValue}
      isRequired={props.isRequired}
      name={props.name}
      type={props.type}
    >
      <Label>{label}</Label>
      {multiline ? (
        <TextArea placeholder={props.placeholder} rows={3} />
      ) : (
        <Input inputMode={props.inputMode} placeholder={props.placeholder} />
      )}
      <FieldError />
    </TextField>
  );
}

export function Message({
  message,
  success,
}: {
  message?: string;
  success?: boolean;
}) {
  if (!message) return null;

  return (
    <p
      className={`rounded-xl px-4 py-3 text-sm ${success ? "bg-success/10 text-success" : "bg-danger/10 text-danger"}`}
      role={success ? "status" : "alert"}
    >
      {message}
    </p>
  );
}
