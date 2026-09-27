import { BrandBackground } from "@/components/layout/brand-background";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative isolate flex min-h-[calc(100dvh-4rem)] items-start justify-center overflow-hidden px-4 py-8 sm:items-center sm:py-12">
      <BrandBackground />
      {children}
    </div>
  );
}
