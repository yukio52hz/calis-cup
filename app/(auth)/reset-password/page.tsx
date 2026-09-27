import { ResetPasswordForm } from "@/features/users/components/auth-forms";

import { AuthCard } from "../_components/auth-card";

export default function ResetPasswordPage() {
  return (
    <AuthCard
      subtitle="Elige una contraseña de al menos 8 caracteres."
      title="Nueva contraseña"
    >
      <ResetPasswordForm />
    </AuthCard>
  );
}
