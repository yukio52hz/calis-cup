import { title } from "@/components/primitives";
import { updateProfileAction } from "@/features/users/actions";
import { ProfileForm } from "@/features/users/components/profile-form";
import { requireProfile } from "@/server/auth/dal";

export default async function ProfilePage() {
  const profile = await requireProfile();

  return (
    <section className="mx-auto flex max-w-md flex-col gap-6 py-8">
      <div>
        <h1 className={title({ size: "sm" })}>Mi perfil</h1>
        <p className="mt-2 text-muted">{profile.email}</p>
      </div>
      <ProfileForm
        action={updateProfileAction}
        defaultValues={profile}
        submitLabel="Guardar cambios"
      />
    </section>
  );
}
