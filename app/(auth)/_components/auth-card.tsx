import { FlagMark } from "@/components/layout/logo";

export function AuthCard({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="flex w-full max-w-md flex-col gap-4">
      <div className="rounded-3xl border border-white/10 bg-surface/80 p-6 shadow-2xl backdrop-blur-md sm:p-8 max-[359px]:p-5">
        <div className="mb-6 flex flex-col gap-3">
          <p className="flex items-center gap-2 text-[0.65rem] font-bold tracking-[0.25em] text-muted">
            <FlagMark className="h-4 w-1.5" />
            COSTA RICA CALIS CUP
          </p>
          <h1 className="font-display text-3xl uppercase leading-none tracking-tight">
            {title}
          </h1>
          {subtitle && <p className="text-sm text-muted">{subtitle}</p>}
        </div>
        {children}
      </div>
      {footer && <div className="text-center text-sm text-muted">{footer}</div>}
    </div>
  );
}
