import clsx from "clsx";

// Contenedor estándar de páginas internas (la landing usa ancho completo).
export function PageContainer({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={clsx("mx-auto w-full max-w-7xl px-4 md:px-6", className)}>
      {children}
    </div>
  );
}
