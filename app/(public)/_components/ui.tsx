import clsx from "clsx";

export { formatColones } from "@/lib/format";
export { Card } from "@/components/ui/card";

export function SectionHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: React.ReactNode;
  description?: string;
}) {
  return (
    <div className="flex max-w-2xl flex-col gap-3">
      <p className="text-xs font-bold tracking-[0.25em] text-accent">
        {eyebrow}
      </p>
      <h2 className="font-display text-3xl uppercase leading-none tracking-tight sm:text-4xl">
        {title}
      </h2>
      {description && <p className="text-muted">{description}</p>}
    </div>
  );
}

export function Section({
  id,
  className,
  children,
}: {
  id?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section className={clsx("py-16 sm:py-24", className)} id={id}>
      <div className="mx-auto flex max-w-7xl flex-col gap-10 px-4 md:px-6">
        {children}
      </div>
    </section>
  );
}
