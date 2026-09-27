import { PageContainer } from "@/components/layout/page-container";
import { verifySession } from "@/server/auth/dal";

export default async function DashboardGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await verifySession();

  return <PageContainer>{children}</PageContainer>;
}
