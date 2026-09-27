import { BottomNav, DashboardTabs } from "@/components/layout/bottom-nav";
import { requireProfile } from "@/server/auth/dal";

// Todo /dashboard exige perfil completo; /onboarding queda fuera a propósito.
export default async function DashboardSectionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireProfile();

  return (
    <>
      {/* Espacio para que la barra inferior no tape el contenido en móvil */}
      <div className="pb-24 md:pb-8">
        <DashboardTabs />
        {children}
      </div>
      <BottomNav />
    </>
  );
}
