import { redirect } from "next/navigation";

import { title } from "@/components/primitives";
import { completeOnboardingAction } from "@/features/users/actions";
import { ProfileForm } from "@/features/users/components/profile-form";
import { profileSchema } from "@/features/users/schemas";
import { ROUTES } from "@/lib/constants";
import { verifySession } from "@/server/auth/dal";

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ confirmado?: string }>;
}) {
  const [session, { confirmado }] = await Promise.all([
    verifySession(),
    searchParams,
  ]);

  if (session.profile) redirect(ROUTES.dashboard);

  // Datos que el usuario ya dio al registrarse (user_metadata de Supabase).
  const { first_name, last_name, category } = session.metadata;
  const parsedCategory = profileSchema.shape.category.safeParse(category);

  return (
    <section className="mx-auto flex max-w-md flex-col gap-6 py-8">
      {confirmado && (
        <div
          className="rounded-xl bg-success/10 px-4 py-3 text-sm text-success"
          role="status"
        >
          <p className="font-semibold">
            ✓ ¡Email confirmado! Ya tienes cuenta.
          </p>
          <p className="mt-1">
            Aún no estás inscrito en el torneo: completa tu perfil y luego
            inscríbete desde tu panel.
          </p>
        </div>
      )}
      <div>
        <h1 className={title({ size: "sm" })}>Completa tu perfil</h1>
        <p className="mt-2 text-muted">
          Revisa tus datos para poder inscribirte en el torneo.
        </p>
      </div>
      <ProfileForm
        action={completeOnboardingAction}
        defaultValues={{
          firstName: typeof first_name === "string" ? first_name : "",
          lastName: typeof last_name === "string" ? last_name : "",
          category: parsedCategory.success ? parsedCategory.data : undefined,
        }}
        submitLabel="Continuar"
      />
    </section>
  );
}
