// Estado que devuelven las Server Actions de formularios (useActionState).
export type FormState = {
  errors?: Record<string, string[]>;
  message?: string;
  success?: boolean;
};
