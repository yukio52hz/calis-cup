import NextLink from "next/link";

import { ForgotPasswordForm } from "@/features/users/components/auth-forms";
import { ROUTES } from "@/lib/constants";

import { AuthCard } from "../_components/auth-card";

export default function ForgotPasswordPage() {
  return (
    <AuthCard
      footer={
        <NextLink
          className="font-semibold text-accent hover:underline"
          href={ROUTES.login}
        >
          Volver a iniciar sesión
        </NextLink>
      }
      subtitle="Te enviaremos un enlace para crear una nueva contraseña."
      title="Recuperar contraseña"
    >
      <ForgotPasswordForm />
    </AuthCard>
  );
}
