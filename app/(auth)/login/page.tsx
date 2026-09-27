import NextLink from "next/link";

import { LoginForm } from "@/features/users/components/auth-forms";
import { ROUTES } from "@/lib/constants";

import { AuthCard } from "../_components/auth-card";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const { next, error } = await searchParams;

  return (
    <AuthCard
      footer={
        <>
          ¿No tienes cuenta?{" "}
          <NextLink
            className="font-semibold text-accent hover:underline"
            href={ROUTES.register}
          >
            Regístrate
          </NextLink>
        </>
      }
      subtitle="Entra para ver el reto de la semana, subir tu video y seguir la clasificación."
      title="Iniciar sesión"
    >
      {error === "link" && (
        <p
          className="mb-4 rounded-xl bg-danger/10 px-4 py-3 text-sm text-danger"
          role="alert"
        >
          El enlace expiró o ya fue usado. Inicia sesión o solicita uno nuevo.
        </p>
      )}
      <LoginForm next={next} />
    </AuthCard>
  );
}
