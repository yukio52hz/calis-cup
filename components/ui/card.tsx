import clsx from "clsx";

export function Card({
  className,
  children,
  padded = true,
}: {
  className?: string;
  children: React.ReactNode;
  padded?: boolean;
}) {
  return (
    <div
      className={clsx(
        "rounded-2xl border border-white/10 bg-surface/70 backdrop-blur-sm",
        padded && "p-5",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function CardTitle({
  eyebrow,
  children,
  action,
}: {
  eyebrow?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-4 flex items-start justify-between gap-3">
      <div>
        {eyebrow && (
          <p className="text-[0.65rem] font-bold tracking-[0.2em] text-muted">
            {eyebrow}
          </p>
        )}
        <h2 className="font-display text-lg uppercase leading-tight">
          {children}
        </h2>
      </div>
      {action}
    </div>
  );
}
