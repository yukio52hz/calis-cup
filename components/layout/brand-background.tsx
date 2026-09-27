// Fondo de marca: degradado oscuro con franja roja diagonal (docs/ui).
export function BrandBackground() {
  return (
    <div aria-hidden className="absolute inset-0 -z-10">
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-[oklch(0.2_0.06_20)]" />
      <div className="absolute -top-1/4 left-[55%] h-[160%] w-40 rotate-[25deg] bg-accent/20 blur-sm sm:w-72" />
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-background to-transparent" />
    </div>
  );
}
