import { AdminNav } from "@/components/layout/admin-nav";
import { PageContainer } from "@/components/layout/page-container";
import { requireRole } from "@/server/auth/dal";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireRole("admin");

  return (
    <PageContainer className="pb-10">
      <AdminNav />
      {children}
    </PageContainer>
  );
}
