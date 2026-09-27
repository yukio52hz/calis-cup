import NextLink from "next/link";

import { RegisterForm } from "@/features/users/components/auth-forms";
import { ROUTES } from "@/lib/constants";

import { AuthCard } from "../_components/auth-card";

export default function RegisterPage() {
  return (
    <AuthCard
      footer={
        <>
          ¿Ya tienes cuenta?{" "}
          <NextLink
            className="font-semibold text-accent hover:underline"
            href={ROUTES.login}
          >
            Inicia sesión
          </NextLink>
        </>
      }
      subtitle="Crea tu cuenta y después solicita tu inscripción al torneo."
      title="Crear cuenta"
    >
      <RegisterForm />
    </AuthCard>
  );
}
